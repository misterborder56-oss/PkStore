//////////////////////////////
//CONFIGURACIÓN (Supabase)
//////////////////////////////


const SUPABASE_URL = "https://uwqmmnlxapcxejtnnhzs.supabase.co";
const SUPABASE_KEY = "sb_publishable_4kSjmVRyLvesfJo_gkLVtQ_Dy0dbG72";  

const usarSupabase = Boolean(SUPABASE_URL && SUPABASE_KEY && window.supabase);


//////////////////////////////
//Ayudas
//////////////////////////////

/* devuelve la url solo si es http o https (evita enlaces tipo javascript:) */
function urlSegura(texto) {
    try {
        const enlace = new URL(texto);
        return (enlace.protocol === "https:" || enlace.protocol === "http:") ? enlace.href : null;
    } catch (error) {
        return null;
    }
}

function nuevoId() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function extension(nombre) {
    return (nombre.split(".").pop() || "bin").toLowerCase().replace(/[^a-z0-9]/g, "");
}

/* nombre seguro para guardar en el almacenamiento */
function limpiarNombre(nombre) {
    return nombre.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^A-Za-z0-9._-]/g, "_");
}


//////////////////////////////
//MODO LOCAL (IndexedDB en este dispositivo)
//////////////////////////////
function crearDatosLocal() {

    /* abrir la base: cada tienda guarda un tipo de dato */
    function abrirBD() {
        return new Promise((resolve, reject) => {
            const pedido = indexedDB.open("pkview", 2);

            pedido.onupgradeneeded = () => {
                const db = pedido.result;
                if (!db.objectStoreNames.contains("apks")) db.createObjectStore("apks", { keyPath: "id", autoIncrement: true });
                if (!db.objectStoreNames.contains("comentarios")) db.createObjectStore("comentarios", { keyPath: "id", autoIncrement: true });
                if (!db.objectStoreNames.contains("usuarios")) db.createObjectStore("usuarios", { keyPath: "id" });
                if (!db.objectStoreNames.contains("votos")) db.createObjectStore("votos", { keyPath: "id" });
            };
            pedido.onsuccess = () => resolve(pedido.result);
            pedido.onerror = () => reject(pedido.error);
        });
    }

    /* fn recibe las tiendas y devuelve un pedido, una lista de pedidos o nada */
    async function transaccion(nombres, modo, fn) {
        const db = await abrirBD();

        return new Promise((resolve, reject) => {
            const tx = db.transaction(nombres, modo);
            const tiendas = {};
            nombres.forEach(nombre => { tiendas[nombre] = tx.objectStore(nombre); });

            const salida = fn(tiendas);

            tx.oncomplete = () => {
                db.close();
                resolve(Array.isArray(salida) ? salida.map(p => p.result) : (salida ? salida.result : undefined));
            };
            tx.onerror = tx.onabort = () => { db.close(); reject(tx.error); };
        });
    }

    /* las url de fotos se liberan al cerrar la pestaña */
    function urlDe(blob) {
        return blob ? URL.createObjectURL(blob) : null;
    }

    async function hash(texto) {
        if (!(window.crypto && crypto.subtle)) return texto;
        const datos = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(texto));
        return Array.from(new Uint8Array(datos)).map(b => b.toString(16).padStart(2, "0")).join("");
    }

    function aPerfil(u) {
        if (!u) return null;
        return { id: u.id, email: u.email, nombre: u.nombre, foto: urlDe(u.foto) };
    }

    /* ids de las apks que esta persona ya descargó */
    function listaDescargas(usuario) {
        return JSON.parse(localStorage.getItem("descargas:" + usuario.id) || "[]");
    }

    async function todosLosUsuarios() {
        return transaccion(["usuarios"], "readonly", t => t.usuarios.getAll());
    }

    return {
        modo: "local",

        /* ---------- cuentas ---------- */
        async sesion() {
            const id = localStorage.getItem("sesionId");
            if (!id) return null;
            const u = await transaccion(["usuarios"], "readonly", t => t.usuarios.get(id));
            return aPerfil(u);
        },

        async registrar(email, nombre, clave) {
            email = email.toLowerCase();
            const usuarios = await todosLosUsuarios();

            if (usuarios.some(u => u.email === email)) throw new Error("Ese correo ya está registrado");
            if (usuarios.some(u => u.nombre.toLowerCase() === nombre.toLowerCase())) throw new Error("Ese nombre ya está en uso");

            const nuevo = { id: nuevoId(), email: email, nombre: nombre, clave: await hash(clave), foto: null };
            await transaccion(["usuarios"], "readwrite", t => t.usuarios.add(nuevo));

            localStorage.setItem("sesionId", nuevo.id);
            return aPerfil(nuevo);
        },

        async entrar(email, clave) {
            email = email.toLowerCase();
            const u = (await todosLosUsuarios()).find(x => x.email === email);

            if (!u) throw new Error("correo no encontrado");
            if (u.clave !== await hash(clave)) throw new Error("contraseña incorrecta");

            localStorage.setItem("sesionId", u.id);
            return aPerfil(u);
        },

        async salir() {
            localStorage.removeItem("sesionId");
        },

        async actualizarPerfil(id, { nombre, foto }) {
            const usuarios = await todosLosUsuarios();
            const u = usuarios.find(x => x.id === id);

            if (nombre && usuarios.some(x => x.id !== id && x.nombre.toLowerCase() === nombre.toLowerCase())) {
                throw new Error("Ese nombre ya está en uso");
            }

            if (nombre) u.nombre = nombre;
            if (foto) u.foto = foto;

            await transaccion(["usuarios"], "readwrite", t => t.usuarios.put(u));
            return aPerfil(u);
        },

        /* ---------- aplicaciones ---------- */
        async listarApks() {
            const [apks, usuarios, votos] = await transaccion(["apks", "usuarios", "votos"], "readonly",
                t => [t.apks.getAll(), t.usuarios.getAll(), t.votos.getAll()]);

            return apks.reverse().map(a => {
                const autor = usuarios.find(u => u.id === a.autorId);
                const suyos = votos.filter(v => v.apkId === a.id);
                const suma = suyos.reduce((total, v) => total + v.puntos, 0);

                return {
                    id: a.id,
                    autorId: a.autorId || null,
                    autor: autor ? autor.nombre : (a.autor || "anónimo"),
                    autorFoto: autor ? urlDe(autor.foto) : null,
                    nombre: a.nombre,
                    descripcion: a.descripcion || "",
                    tipo: a.tipo || "archivo",
                    url: a.url || null,
                    nombreArchivo: a.nombreArchivo || "",
                    archivoPath: null,
                    fotoUrl: urlDe(a.imagen),
                    descargas: a.descargas || 0,
                    promedio: suyos.length ? Math.round(suma / suyos.length * 10) / 10 : 0,
                    votos: suyos.length,
                    fecha: a.fecha
                };
            });
        },

        async publicar(usuario, { nombre, descripcion, tipo, url, archivo, imagen }) {
            await transaccion(["apks"], "readwrite", t => t.apks.add({
                nombre: nombre,
                descripcion: descripcion,
                tipo: tipo,
                url: url || null,
                autorId: usuario.id,
                fecha: Date.now(),
                archivo: archivo || null,
                nombreArchivo: archivo ? archivo.name : "",
                imagen: imagen || null,
                descargas: 0
            }));
        },

        async eliminar(id) {
            await transaccion(["apks", "comentarios", "votos"], "readwrite", t => {
                t.apks.delete(id);

                const comentarios = t.comentarios.getAll();
                comentarios.onsuccess = () => comentarios.result
                    .filter(c => c.apkId === id).forEach(c => t.comentarios.delete(c.id));

                const votos = t.votos.getAll();
                votos.onsuccess = () => votos.result
                    .filter(v => v.apkId === id).forEach(v => t.votos.delete(v.id));
            });
        },

        /* ---------- descargas ---------- */
        async archivoUrl(apk) {
            const a = await transaccion(["apks"], "readonly", t => t.apks.get(apk.id));
            if (!a || !a.archivo) throw new Error("Este archivo ya no está disponible");
            return URL.createObjectURL(a.archivo);
        },

        /* las apks cuentan una descarga por persona; las páginas cuentan cada visita */
        async yaDescargue(usuario, apkId) {
            return listaDescargas(usuario).includes(apkId);
        },

        async contar(usuario, apk) {
            if (apk.tipo === "archivo") {
                const lista = listaDescargas(usuario);
                if (lista.includes(apk.id)) return;

                lista.push(apk.id);
                localStorage.setItem("descargas:" + usuario.id, JSON.stringify(lista));
            }

            await transaccion(["apks"], "readwrite", t => {
                const pedido = t.apks.get(apk.id);
                pedido.onsuccess = () => {
                    const a = pedido.result;
                    if (a) {
                        a.descargas = (a.descargas || 0) + 1;
                        t.apks.put(a);
                    }
                };
            });
        },

        /* ---------- calificaciones ---------- */
        async calificar(usuario, apkId, puntos) {
            await transaccion(["votos"], "readwrite", t => t.votos.put({
                id: apkId + ":" + usuario.id,
                apkId: apkId,
                usuarioId: usuario.id,
                puntos: puntos
            }));
        },

        async miVoto(usuario, apkId) {
            const voto = await transaccion(["votos"], "readonly", t => t.votos.get(apkId + ":" + usuario.id));
            return voto ? voto.puntos : 0;
        },

        /* ---------- comentarios ---------- */
        async comentarios(apkId) {
            const [lista, usuarios] = await transaccion(["comentarios", "usuarios"], "readonly",
                t => [t.comentarios.getAll(), t.usuarios.getAll()]);

            return lista.filter(c => c.apkId === apkId).map(c => {
                const autor = usuarios.find(u => u.id === c.autorId);
                return {
                    id: c.id,
                    autorId: c.autorId,
                    autor: autor ? autor.nombre : "anónimo",
                    foto: autor ? urlDe(autor.foto) : null,
                    texto: c.texto,
                    fecha: c.fecha
                };
            });
        },

        async comentar(usuario, apkId, texto) {
            await transaccion(["comentarios"], "readwrite", t => t.comentarios.add({
                apkId: apkId,
                autorId: usuario.id,
                texto: texto,
                fecha: Date.now()
            }));
        },

        async borrarComentario(id) {
            await transaccion(["comentarios"], "readwrite", t => t.comentarios.delete(id));
        }
    };
}


//////////////////////////////
//MODO NUBE (Supabase)
//////////////////////////////
function crearDatosSupabase() {
    const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    /* lanza el error de Supabase o devuelve los datos */
    function ok({ data, error }) {
        if (error) {
            if (error.code === "23505") throw new Error("Ese nombre ya está en uso");
            throw new Error(error.message);
        }
        return data;
    }

    /* url pública de un archivo guardado */
    function urlPublica(bucket, ruta, opciones) {
        if (!ruta) return null;
        return sb.storage.from(bucket).getPublicUrl(ruta, opciones).data.publicUrl;
    }

    async function subir(bucket, ruta, archivo) {
        const { error } = await sb.storage.from(bucket).upload(ruta, archivo, { contentType: archivo.type || undefined });
        if (error) throw new Error(error.message);
    }

    async function aPerfil(user) {
        if (!user) return null;
        const { data } = await sb.from("perfiles").select("nombre, foto").eq("id", user.id).maybeSingle();
        return {
            id: user.id,
            email: user.email,
            nombre: data ? data.nombre : "usuario",
            foto: data ? urlPublica("imagenes", data.foto) : null
        };
    }

    return {
        modo: "nube",

        /* ---------- cuentas ---------- */
        async sesion() {
            const { data } = await sb.auth.getSession();
            return aPerfil(data.session ? data.session.user : null);
        },

        /* devuelve null si Supabase pide confirmar el correo antes de entrar */
        async registrar(email, nombre, clave) {
            const { data, error } = await sb.auth.signUp({ email: email, password: clave, options: { data: { nombre: nombre } } });

            if (error) {
                if (error.message.includes("Database error")) throw new Error("Ese nombre ya está en uso");
                throw new Error(error.message);
            }
            return data.session ? aPerfil(data.user) : null;
        },

        async entrar(email, clave) {
            const { data, error } = await sb.auth.signInWithPassword({ email: email, password: clave });
            if (error) throw new Error("correo o contraseña incorrectos");
            return aPerfil(data.user);
        },

        async salir() {
            await sb.auth.signOut();
        },

        async actualizarPerfil(id, { nombre, foto }) {
            const cambios = {};

            if (nombre) cambios.nombre = nombre;

            if (foto) {
                const ruta = id + "/perfil-" + Date.now() + "." + extension(foto.name);
                await subir("imagenes", ruta, foto);
                cambios.foto = ruta;
            }

            if (Object.keys(cambios).length) {
                ok(await sb.from("perfiles").update(cambios).eq("id", id));
            }

            const { data } = await sb.auth.getUser();
            return aPerfil(data.user);
        },

        /* ---------- aplicaciones ---------- */
        async listarApks() {
            const filas = ok(await sb.from("apks_resumen").select("*").order("creado", { ascending: false }));

            return filas.map(a => ({
                id: a.id,
                autorId: a.autor_id,
                autor: a.autor,
                autorFoto: urlPublica("imagenes", a.autor_foto),
                nombre: a.nombre,
                descripcion: a.descripcion || "",
                tipo: a.tipo,
                url: a.url,
                nombreArchivo: a.nombre_archivo || "",
                archivoPath: a.archivo_path,
                fotoUrl: urlPublica("imagenes", a.imagen_path),
                descargas: a.descargas,
                promedio: Number(a.promedio),
                votos: Number(a.votos),
                fecha: new Date(a.creado).getTime()
            }));
        },

        async publicar(usuario, { nombre, descripcion, tipo, url, archivo, imagen }) {
            const marca = Date.now();
            let archivoPath = null;
            let imagenPath = null;

            if (archivo) {
                archivoPath = usuario.id + "/" + marca + "-" + limpiarNombre(archivo.name);
                await subir("archivos", archivoPath, archivo);
            }

            if (imagen) {
                imagenPath = usuario.id + "/" + marca + "-foto." + extension(imagen.name);
                await subir("imagenes", imagenPath, imagen);
            }

            ok(await sb.from("apks").insert({
                autor_id: usuario.id,
                nombre: nombre,
                descripcion: descripcion,
                tipo: tipo,
                url: url || null,
                archivo_path: archivoPath,
                nombre_archivo: archivo ? archivo.name : null,
                imagen_path: imagenPath
            }));
        },

        async eliminar(id) {
            const fila = ok(await sb.from("apks").select("archivo_path, imagen_path").eq("id", id).single());

            ok(await sb.from("apks").delete().eq("id", id));

            if (fila.archivo_path) await sb.storage.from("archivos").remove([fila.archivo_path]);
            if (fila.imagen_path) await sb.storage.from("imagenes").remove([fila.imagen_path]);
        },

        /* ---------- descargas ---------- */
        /* descargar = true fuerza la descarga; false abre el archivo */
        async archivoUrl(apk, descargar) {
            if (!apk.archivoPath) throw new Error("Este archivo ya no está disponible");
            return urlPublica("archivos", apk.archivoPath, descargar ? { download: apk.nombreArchivo || true } : undefined);
        },

        async yaDescargue(usuario, apkId) {
            const fila = ok(await sb.from("descargas_usuario").select("apk_id")
                .eq("apk_id", apkId).eq("usuario_id", usuario.id).maybeSingle());
            return Boolean(fila);
        },

        /* el servidor decide: una descarga por persona en apks, cada visita en páginas */
        async contar(usuario, apk) {
            ok(await sb.rpc("contar_descarga", { p_apk: apk.id }));
        },

        /* ---------- calificaciones ---------- */
        async calificar(usuario, apkId, puntos) {
            ok(await sb.from("calificaciones").upsert({ apk_id: apkId, usuario_id: usuario.id, puntos: puntos }));
        },

        async miVoto(usuario, apkId) {
            const voto = ok(await sb.from("calificaciones").select("puntos")
                .eq("apk_id", apkId).eq("usuario_id", usuario.id).maybeSingle());
            return voto ? voto.puntos : 0;
        },

        /* ---------- comentarios ---------- */
        async comentarios(apkId) {
            const filas = ok(await sb.from("comentarios").select("id, texto, creado, autor_id, perfiles(nombre, foto)")
                .eq("apk_id", apkId).order("creado", { ascending: true }));

            return filas.map(c => ({
                id: c.id,
                autorId: c.autor_id,
                autor: c.perfiles ? c.perfiles.nombre : "anónimo",
                foto: c.perfiles ? urlPublica("imagenes", c.perfiles.foto) : null,
                texto: c.texto,
                fecha: new Date(c.creado).getTime()
            }));
        },

        async comentar(usuario, apkId, texto) {
            ok(await sb.from("comentarios").insert({ apk_id: apkId, autor_id: usuario.id, texto: texto }));
        },

        async borrarComentario(id) {
            ok(await sb.from("comentarios").delete().eq("id", id));
        }
    };
}


//////////////////////////////
//Datos: lo único que usa app.js
//////////////////////////////
const Datos = usarSupabase ? crearDatosSupabase() : crearDatosLocal();
al();
