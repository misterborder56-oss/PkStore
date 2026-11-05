//////////////////////////////
//CONFIGURACIÓN (Supabase)
//////////////////////////////

/* Pega aquí los datos de tu proyecto (Project Settings > API).
   Si los dejas vacíos, la app guarda todo solo en este dispositivo. */
const SUPABASE_URL = "https://uwqmmnlxapcxejtnnhzs.supabase.co";
const SUPABASE_KEY = "sb_publishable_4kSjmVRyLvesfJo_gkLVtQ_Dy0dbG72";   /* clave "anon" o "publishable", nunca la service_role */

const usarSupabase = Boolean(SUPABASE_URL && SUPABASE_KEY && window.supabase);

/* códigos de descarga: cuántos se generan y cuánto dura el período para desactivar el enlace */
const TOTAL_CODIGOS = 50;
const HORA = 60 * 60 * 1000;


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

/* código al azar con formato XXXX-XXXX-XXXX (sin letras que se confunden) */
function generarCodigo() {
    const letras = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    const bytes = new Uint8Array(12);
    let texto = "";

    if (window.crypto && crypto.getRandomValues) crypto.getRandomValues(bytes);
    else bytes.forEach((_, i) => { bytes[i] = Math.floor(Math.random() * 256); });

    bytes.forEach((byte, i) => {
        texto += letras[byte % letras.length];
        if (i % 4 === 3 && i < 11) texto += "-";
    });
    return texto;
}

/* para comparar códigos sin importar guiones, espacios ni mayúsculas */
function limpiarCodigo(texto) {
    return String(texto || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
}


//////////////////////////////
//MODO LOCAL (IndexedDB en este dispositivo)
//////////////////////////////
function crearDatosLocal() {

    /* abrir la base: cada tienda guarda un tipo de dato */
    function abrirBD() {
        return new Promise((resolve, reject) => {
            const pedido = indexedDB.open("pkview", 3);

            pedido.onupgradeneeded = () => {
                const db = pedido.result;
                if (!db.objectStoreNames.contains("apks")) db.createObjectStore("apks", { keyPath: "id", autoIncrement: true });
                if (!db.objectStoreNames.contains("comentarios")) db.createObjectStore("comentarios", { keyPath: "id", autoIncrement: true });
                if (!db.objectStoreNames.contains("codigos")) db.createObjectStore("codigos", { keyPath: "id", autoIncrement: true });
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

    async function todosLosUsuarios() {
        return transaccion(["usuarios"], "readonly", t => t.usuarios.getAll());
    }

    /* ids de las apks que esta persona ya descargó */
    function listaDescargas(usuario) {
        return JSON.parse(localStorage.getItem("descargas:" + usuario.id) || "[]");
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
                    acceso: a.acceso || "libre",
                    url: a.url || null,
                    nombreArchivo: a.nombreArchivo || "",
                    archivoPath: null,
                    fotoUrl: urlDe(a.imagen),
                    capturas: (a.capturas || []).map(c => urlDe(c)),
                    videoUrl: urlDe(a.video),
                    descargas: a.descargas || 0,
                    promedio: suyos.length ? Math.round(suma / suyos.length * 10) / 10 : 0,
                    votos: suyos.length,
                    fecha: a.fecha
                };
            });
        },

        /* con acceso "codigo" se crean los 50 códigos de un solo uso */
        async publicar(usuario, { nombre, descripcion, tipo, url, archivo, imagen, capturas, video, acceso }) {
            await transaccion(["apks", "codigos"], "readwrite", t => {
                const pedido = t.apks.add({
                    nombre: nombre,
                    descripcion: descripcion,
                    tipo: tipo,
                    acceso: tipo === "archivo" ? (acceso || "libre") : "libre",
                    url: url || null,
                    autorId: usuario.id,
                    fecha: Date.now(),
                    archivo: archivo || null,
                    nombreArchivo: archivo ? archivo.name : "",
                    imagen: imagen || null,
                    capturas: capturas || [],
                    video: video || null,
                    descargas: 0
                });

                if (tipo === "archivo" && acceso === "codigo") {
                    pedido.onsuccess = () => {
                        const codigos = new Set();
                        while (codigos.size < TOTAL_CODIGOS) codigos.add(generarCodigo());
                        codigos.forEach(codigo => t.codigos.add({
                            apkId: pedido.result,
                            codigo: codigo,
                            usuarioId: null,
                            canjeadoEn: null
                        }));
                    };
                }
            });
        },

        async eliminar(id) {
            await transaccion(["apks", "comentarios", "votos", "codigos"], "readwrite", t => {
                t.apks.delete(id);

                [["comentarios", "id"], ["votos", "id"], ["codigos", "id"]].forEach(([nombre]) => {
                    const todos = t[nombre].getAll();
                    todos.onsuccess = () => todos.result
                        .filter(x => x.apkId === id).forEach(x => t[nombre].delete(x.id));
                });
            });
        },

        /* texto de un archivo html (para el visualizador) */
        async htmlTexto(apk) {
            const a = await transaccion(["apks"], "readonly", t => t.apks.get(apk.id));
            if (!a || !a.archivo) throw new Error("Este archivo ya no está disponible");
            return a.archivo.text();
        },

        /* ---------- descargas ---------- */
        async archivoUrl(usuario, apk, descargar) {
            const a = await transaccion(["apks"], "readonly", t => t.apks.get(apk.id));
            if (!a || !a.archivo) throw new Error("Este archivo ya no está disponible");

            if (apk.acceso === "codigo" && apk.autorId !== usuario.id) {
                const estado = await this.estadoDesbloqueo(usuario, apk.id);
                if (!estado.desbloqueada) throw new Error("Desbloquea la descarga con un código");
            }
            return URL.createObjectURL(a.archivo);
        },

        /* las apks cuentan una descarga por persona; las páginas y html cuentan cada visita */
        async yaDescargue(usuario, apkId) {
            return listaDescargas(usuario).includes(apkId);
        },

        /* ids de todas las apks que esta persona descargó */
        async misDescargas(usuario) {
            return listaDescargas(usuario);
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

        /* ---------- códigos de descarga ---------- */
        /* solo para quien publicó la apk */
        async codigos(apkId) {
            const todos = await transaccion(["codigos"], "readonly", t => t.codigos.getAll());

            return todos.filter(c => c.apkId === apkId).map(c => ({
                id: c.id,
                codigo: c.codigo,
                usado: Boolean(c.usuarioId),
                canjeadoEn: c.canjeadoEn
            }));
        },

        async generarCodigos(apkId) {
            await transaccion(["codigos"], "readwrite", t => {
                const pedido = t.codigos.getAll();
                pedido.onsuccess = () => {
                    if (pedido.result.some(c => c.apkId === apkId)) return;

                    const nuevos = new Set();
                    while (nuevos.size < TOTAL_CODIGOS) nuevos.add(generarCodigo());
                    nuevos.forEach(codigo => t.codigos.add({ apkId: apkId, codigo: codigo, usuarioId: null, canjeadoEn: null }));
                };
            });
        },

        async estadoDesbloqueo(usuario, apkId) {
            const todos = await transaccion(["codigos"], "readonly", t => t.codigos.getAll());
            const c = todos.find(x => x.apkId === apkId && x.usuarioId === usuario.id);

            return { desbloqueada: Boolean(c), canjeadoEn: c ? c.canjeadoEn : null };
        },

        async canjear(usuario, apkId, codigo) {
            const limpio = limpiarCodigo(codigo);
            let error = null;

            await transaccion(["codigos"], "readwrite", t => {
                const pedido = t.codigos.getAll();
                pedido.onsuccess = () => {
                    const suyos = pedido.result.filter(c => c.apkId === apkId);
                    const libre = suyos.find(c => !c.usuarioId && limpiarCodigo(c.codigo) === limpio);

                    if (suyos.some(c => c.usuarioId === usuario.id)) error = "Ya desbloqueaste esta aplicación";
                    else if (!libre) error = "Código inválido o ya usado";
                    else {
                        libre.usuarioId = usuario.id;
                        libre.canjeadoEn = Date.now();
                        t.codigos.put(libre);
                    }
                };
            });

            if (error) throw new Error(error);
        },

        /* durante la primera hora, y si aún no la descargó, el código se restablece */
        async desactivarEnlace(usuario, apkId) {
            let error = null;

            await transaccion(["codigos"], "readwrite", t => {
                const pedido = t.codigos.getAll();
                pedido.onsuccess = () => {
                    const c = pedido.result.find(x => x.apkId === apkId && x.usuarioId === usuario.id);

                    if (!c) error = "No tienes un enlace activo";
                    else if (listaDescargas(usuario).includes(apkId)) error = "Ya descargaste esta aplicación";
                    else if (Date.now() - c.canjeadoEn > HORA) error = "Pasó más de una hora desde que lo activaste";
                    else {
                        c.usuarioId = null;
                        c.canjeadoEn = null;
                        t.codigos.put(c);
                    }
                };
            });

            if (error) throw new Error(error);
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
                acceso: a.acceso || "libre",
                url: a.url,
                nombreArchivo: a.nombre_archivo || "",
                archivoPath: a.archivo_path,
                fotoUrl: urlPublica("imagenes", a.imagen_path),
                capturas: (a.capturas || []).map(ruta => urlPublica("imagenes", ruta)),
                videoUrl: urlPublica("videos", a.video_path),
                descargas: a.descargas,
                promedio: Number(a.promedio),
                votos: Number(a.votos),
                fecha: new Date(a.creado).getTime()
            }));
        },

        /* con acceso "codigo" el archivo va a un lugar privado y el servidor crea los 50 códigos */
        async publicar(usuario, { nombre, descripcion, tipo, url, archivo, imagen, capturas, video, acceso }) {
            const base = usuario.id + "/" + Date.now();
            const protegido = tipo === "archivo" && acceso === "codigo";
            const rutasCapturas = [];
            let archivoPath = null;
            let imagenPath = null;
            let videoPath = null;

            if (archivo) {
                archivoPath = base + "-" + limpiarNombre(archivo.name);
                await subir(protegido ? "protegidos" : "archivos", archivoPath, archivo);
            }

            if (imagen) {
                imagenPath = base + "-icono." + extension(imagen.name);
                await subir("imagenes", imagenPath, imagen);
            }

            const lista = capturas || [];
            for (let i = 0; i < lista.length; i++) {
                const ruta = base + "-captura" + i + "." + extension(lista[i].name);
                await subir("imagenes", ruta, lista[i]);
                rutasCapturas.push(ruta);
            }

            if (video) {
                videoPath = base + "-video." + extension(video.name);
                await subir("videos", videoPath, video);
            }

            const nueva = ok(await sb.from("apks").insert({
                autor_id: usuario.id,
                nombre: nombre,
                descripcion: descripcion,
                tipo: tipo,
                acceso: tipo === "archivo" ? (acceso || "libre") : "libre",
                url: url || null,
                archivo_path: archivoPath,
                nombre_archivo: archivo ? archivo.name : null,
                imagen_path: imagenPath,
                capturas: rutasCapturas,
                video_path: videoPath
            }).select("id").single());

            if (protegido) await this.generarCodigos(nueva.id);
        },

        async eliminar(id) {
            const fila = ok(await sb.from("apks")
                .select("archivo_path, imagen_path, capturas, video_path, acceso").eq("id", id).single());

            ok(await sb.from("apks").delete().eq("id", id));

            if (fila.archivo_path) {
                await sb.storage.from(fila.acceso === "codigo" ? "protegidos" : "archivos").remove([fila.archivo_path]);
            }

            const imagenes = (fila.capturas || []).concat(fila.imagen_path ? [fila.imagen_path] : []);
            if (imagenes.length) await sb.storage.from("imagenes").remove(imagenes);
            if (fila.video_path) await sb.storage.from("videos").remove([fila.video_path]);
        },

        /* texto de un archivo html (para el visualizador) */
        async htmlTexto(apk) {
            const enlace = urlPublica("archivos", apk.archivoPath);
            if (!enlace) throw new Error("Este archivo ya no está disponible");

            const respuesta = await fetch(enlace);
            if (!respuesta.ok) throw new Error("No se pudo cargar el archivo");
            return respuesta.text();
        },

        /* ---------- descargas ---------- */
        /* descargar = true fuerza la descarga; false abre el archivo.
           Los archivos con código solo dan enlace a quien lo desbloqueó (lo decide el servidor). */
        async archivoUrl(usuario, apk, descargar) {
            if (!apk.archivoPath) throw new Error("Este archivo ya no está disponible");

            const opciones = descargar ? { download: apk.nombreArchivo || true } : undefined;

            if (apk.tipo === "archivo" && apk.acceso === "codigo") {
                const { data, error } = await sb.storage.from("protegidos").createSignedUrl(apk.archivoPath, 300, opciones);
                if (error) throw new Error("Desbloquea la descarga con un código");
                return data.signedUrl;
            }

            return urlPublica("archivos", apk.archivoPath, opciones);
        },

        async yaDescargue(usuario, apkId) {
            const fila = ok(await sb.from("descargas_usuario").select("apk_id")
                .eq("apk_id", apkId).eq("usuario_id", usuario.id).maybeSingle());
            return Boolean(fila);
        },

        /* ids de todas las apks que esta persona descargó */
        async misDescargas(usuario) {
            const filas = ok(await sb.from("descargas_usuario").select("apk_id").eq("usuario_id", usuario.id));
            return filas.map(f => f.apk_id);
        },

        /* el servidor decide: una descarga por persona en apks, cada visita en páginas y html */
        async contar(usuario, apk) {
            ok(await sb.rpc("contar_descarga", { p_apk: apk.id }));
        },

        /* ---------- códigos de descarga ---------- */
        /* el servidor solo se los muestra a quien publicó la apk */
        async codigos(apkId) {
            const filas = ok(await sb.from("codigos_descarga").select("id, codigo, usado_por, usado_en")
                .eq("apk_id", apkId).order("id", { ascending: true }));

            return filas.map(c => ({
                id: c.id,
                codigo: c.codigo,
                usado: Boolean(c.usado_por),
                canjeadoEn: c.usado_en ? new Date(c.usado_en).getTime() : null
            }));
        },

        /* crea los 50 códigos (el servidor solo lo permite una vez y solo al autor) */
        async generarCodigos(apkId) {
            ok(await sb.rpc("generar_codigos", { p_apk: apkId, p_cantidad: TOTAL_CODIGOS }));
        },

        async estadoDesbloqueo(usuario, apkId) {
            const fila = ok(await sb.from("accesos").select("activado_en")
                .eq("apk_id", apkId).eq("usuario_id", usuario.id).maybeSingle());

            return {
                desbloqueada: Boolean(fila),
                canjeadoEn: fila ? new Date(fila.activado_en).getTime() : null
            };
        },

        async canjear(usuario, apkId, codigo) {
            ok(await sb.rpc("canjear_codigo", { p_apk: apkId, p_codigo: codigo }));
        },

        async desactivarEnlace(usuario, apkId) {
            ok(await sb.rpc("devolver_codigo", { p_apk: apkId }));
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
