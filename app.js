//////////////////////////////
//ABRIR Y CERRAR REUTILIZABLES
//////////////////////////////

/* ABRIR */
function abrir(id) {
    document.getElementById(id).style.display = "block";
}

/* CERRAR */
function cerrar(id) {
    document.getElementById(id).style.display = "none";
}

/* CERRAR TODO */
function ocultarPantallas() {
    const pantallas = [
        "DvRegister",
        "DvLogin",
        "inicio",
        "DvAjustes",
        "DvApk",
        "DvDetalle",
        "DvFile",
        "DvCuenta",
        "DvActualizaciones"
    ];
    pantallas.forEach(id => cerrar(id));
}

/* IR A UNA PANTALLA (cierra las demás) */
function ir(id) {
    ocultarPantallas();
    abrir(id);
    window.scrollTo(0, 0);
}


//////////////////////////////
//Navegar entre div
//////////////////////////////

/* ajuste */
function OpcBtn() {
    ir("DvAjustes");
}

/* cerrar ajuste */
function CerrarAjustes() {
    ir("inicio");
}

/* aplicaciones */
function ApkBtn() {
    ir("DvApk");
    mostrarApks();
}

/* cerrar aplicaciones */
function CerrarApk() {
    ir("inicio");
}

/* publicar */
function AbrirDow() {
    ir("DvFile");
}

/* cerrar publicar */
function cerrarSbFile() {
    ir("DvApk");
}

/* cerrar detalle */
function CerrarDetalle() {
    ir("DvApk");
    pintarApks();
}

/* login y registro */
function AbrirLogin() {
    ir("DvLogin");
}

function AbrirRegistro() {
    ir("DvRegister");
}

/* cuenta */
function AbrirCuenta() {
    ir("DvCuenta");
    mostrarCuenta();
}

function CerrarCuenta() {
    ir("inicio");
}

/* actualizaciones */
function AbrirActualizaciones() {
    ir("DvActualizaciones");
    mostrarActualizaciones();
}

function CerrarActualizaciones() {
    ir("inicio");
}


//////////////////////////////
//Temas
//////////////////////////////

/* aplica el tema: los colores los pone el css con la clase Bdc */
function aplicarTema(tema) {
    const claro = tema === "claro";

    document.getElementById("body").classList.toggle("Bdc", claro);
    document.getElementById("Cambiar").textContent = claro ? "☀" : "☪︎";
}

/* cambiar y guardar tema */
function Estilo() {
    const claro = !document.getElementById("body").classList.contains("Bdc");
    const tema = claro ? "claro" : "oscuro";

    aplicarTema(tema);
    localStorage.setItem("temas", tema);
}


//////////////////////////////
//Ayudas
//////////////////////////////

const MAX_ARCHIVO = 50 * 1024 * 1024;
const MAX_IMAGEN = 3 * 1024 * 1024;

let usuario = null;

/* crea un elemento con clase y texto */
function crear(etiqueta, clase, texto) {
    let elemento = document.createElement(etiqueta);
    elemento.className = clase;
    if (texto) elemento.textContent = texto;
    return elemento;
}

/* texto sin mayúsculas ni acentos, para el buscador */
function normalizar(texto) {
    return texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function formatoFecha(fecha) {
    return new Date(fecha).toLocaleDateString("es");
}

/* las apks se descargan y las páginas se visitan */
function formatoContador(apk) {
    let n = apk.descargas;

    if (apk.tipo === "pagina") return n + (n === 1 ? " visita" : " visitas");
    return n + (n === 1 ? " descarga" : " descargas");
}

function formatoPromedio(apk) {
    return apk.votos ? "★ " + apk.promedio.toFixed(1) : "★ sin votos";
}

/* círculo con la foto o la inicial del nombre */
function ponerAvatar(elemento, nombre, foto) {
    if (foto) {
        let imagen = document.createElement("img");
        imagen.src = foto;
        imagen.alt = "Foto de " + nombre;
        elemento.replaceChildren(imagen);
    } else {
        elemento.replaceChildren(document.createTextNode(nombre.charAt(0).toUpperCase()));
    }
}

function crearAvatar(nombre, foto) {
    let avatar = crear("span", "avatar chico");
    ponerAvatar(avatar, nombre, foto);
    return avatar;
}


//////////////////////////////
//Registro y login
//////////////////////////////

/* entra a la app con la cuenta ya validada */
function iniciarSesion(perfil) {
    usuario = perfil;
    ir("inicio");
    mostrarApks();
}

async function RegistrarBtn() {
    let nombre = document.getElementById("InpName").value.trim();
    let correo = document.getElementById("InpEmail").value.trim();
    let Contrasena = document.getElementById("InpPassword").value;

    if (!nombre || !correo || !Contrasena) {
        alert("Completa todos los campos");
        return;
    }

    if (nombre.length > 20) {
        alert("El nombre es demasiado largo");
        return;
    }

    if (nombre.length < 4) {
        alert("El nombre es demasiado corto");
        return;
    }

    if (Contrasena.length < 8) {
        alert("La contraseña debe tener al menos 8 caracteres");
        return;
    }

    try {
        let perfil = await Datos.registrar(correo, nombre, Contrasena);

        /* sin perfil: hay que confirmar el correo antes de entrar */
        if (!perfil) {
            alert("Cuenta creada. Revisa tu correo para confirmarla y luego entra.");
            AbrirLogin();
            return;
        }

        iniciarSesion(perfil);
    } catch (error) {
        alert(error.message);
    }
}


async function LoginBtn() {
    let correo = document.getElementById("Inpemail").value.trim();
    let password = document.getElementById("Inppassword").value;

    if (!correo || !password) {
        alert("Completa todos los campos");
        return;
    }

    try {
        iniciarSesion(await Datos.entrar(correo, password));
    } catch (error) {
        alert(error.message);
    }
}


async function SalirBtn() {
    await Datos.salir();
    usuario = null;
    ir("DvLogin");
}


//////////////////////////////
//Mi cuenta
//////////////////////////////

let fotoNueva = null;

/* foto, nombre y números de lo que publicaste */
async function mostrarCuenta() {
    fotoNueva = null;

    document.getElementById("InpCuentaNombre").value = usuario.nombre;
    document.getElementById("CuentaCorreo").textContent = usuario.email;
    ponerAvatar(document.getElementById("AvatarCuenta"), usuario.nombre, usuario.foto);

    try {
        let apks = await Datos.listarApks();
        let mias = apks.filter(a => a.autorId === usuario.id);

        /* descargas (apks) y visitas (páginas) por separado */
        let descargas = mias.filter(a => a.tipo === "archivo").reduce((total, a) => total + a.descargas, 0);
        let visitas = mias.filter(a => a.tipo === "pagina").reduce((total, a) => total + a.descargas, 0);
        let votos = mias.reduce((total, a) => total + a.votos, 0);
        let suma = mias.reduce((total, a) => total + a.promedio * a.votos, 0);

        document.getElementById("DatoPublicadas").textContent = mias.length;
        document.getElementById("DatoDescargas").textContent = descargas;
        document.getElementById("DatoVisitas").textContent = visitas;
        document.getElementById("DatoCalificacion").textContent =
            votos ? (suma / votos).toFixed(1) + " / 10" : "—";
    } catch (error) {
        console.log("no se pudieron cargar los números", error);
    }
}

/* vista previa de la foto elegida */
document.getElementById("SubirFoto").addEventListener("change", function () {
    let archivo = this.files[0];
    if (!archivo) return;

    if (archivo.size > MAX_IMAGEN) {
        alert("La foto pesa más de 3 MB");
        this.value = "";
        return;
    }

    fotoNueva = archivo;
    ponerAvatar(document.getElementById("AvatarCuenta"), usuario.nombre, URL.createObjectURL(archivo));
});

async function GuardarCuentaBtn() {
    let nombre = document.getElementById("InpCuentaNombre").value.trim();
    let boton = document.getElementById("BtnGuardarCuenta");

    if (nombre.length < 4 || nombre.length > 20) {
        alert("El nombre debe tener entre 4 y 20 caracteres");
        return;
    }

    boton.disabled = true;

    try {
        usuario = await Datos.actualizarPerfil(usuario.id, { nombre: nombre, foto: fotoNueva });
        fotoNueva = null;
        mostrarCuenta();
    } catch (error) {
        alert(error.message);
    }

    boton.disabled = false;
}


//////////////////////////////
//Publicar
//////////////////////////////

let tipoPublicacion = "archivo";
let urlPrevia = null;

let inpArchivo = document.getElementById("SubirFile");
let inpImagen = document.getElementById("SubirImagen");

/* archivo o página web: cambia los campos que se ven */
function ElegirTipo(tipo) {
    tipoPublicacion = tipo;

    document.getElementById("TipoArchivo").classList.toggle("activo", tipo === "archivo");
    document.getElementById("TipoPagina").classList.toggle("activo", tipo === "pagina");

    document.getElementById("InpApkUrl").hidden = tipo !== "pagina";
    document.getElementById("LabelArchivo").hidden = tipo !== "archivo";

    actualizarSeleccion();
}

/* muestra lo que se eligió antes de publicar */
function actualizarSeleccion() {
    let archivo = inpArchivo.files[0];
    let imagen = inpImagen.files[0];
    let prev = document.getElementById("PrevImagen");
    let texto = document.getElementById("PrevArchivo");

    if (tipoPublicacion === "pagina") {
        texto.textContent = imagen ? imagen.name : "foto opcional";
    } else {
        texto.textContent = archivo ? archivo.name : "ningún archivo elegido";
    }

    if (urlPrevia) URL.revokeObjectURL(urlPrevia);
    urlPrevia = imagen ? URL.createObjectURL(imagen) : null;

    prev.hidden = !imagen;
    if (imagen) prev.src = urlPrevia;
}

inpArchivo.addEventListener("change", actualizarSeleccion);
inpImagen.addEventListener("change", actualizarSeleccion);

async function PublicarBtn() {
    let archivo = inpArchivo.files[0];
    let imagen = inpImagen.files[0];
    let nombre = document.getElementById("InpApkNombre").value.trim();
    let descripcion = document.getElementById("InpApkDescripcion").value.trim();
    let enlace = null;
    let boton = document.getElementById("BtnPublicar");

    if (tipoPublicacion === "archivo") {
        if (!archivo) {
            alert("Elige un archivo para publicar");
            return;
        }
        if (archivo.size > MAX_ARCHIVO) {
            alert("El archivo pesa más de 50 MB");
            return;
        }
        if (!nombre) nombre = archivo.name;
    } else {
        enlace = urlSegura(document.getElementById("InpApkUrl").value.trim());
        if (!enlace) {
            alert("Escribe un enlace que empiece por https://");
            return;
        }
        if (!nombre) {
            alert("Escribe un nombre para la página");
            return;
        }
        archivo = null;
    }

    if (imagen && imagen.size > MAX_IMAGEN) {
        alert("La imagen pesa más de 3 MB");
        return;
    }

    boton.disabled = true;

    try {
        await Datos.publicar(usuario, {
            nombre: nombre,
            descripcion: descripcion,
            tipo: tipoPublicacion,
            url: enlace,
            archivo: archivo,
            imagen: imagen || null
        });
    } catch (error) {
        alert("No se pudo publicar: " + error.message);
        boton.disabled = false;
        return;
    }

    boton.disabled = false;

    /* limpiar formulario */
    document.getElementById("InpApkNombre").value = "";
    document.getElementById("InpApkDescripcion").value = "";
    document.getElementById("InpApkUrl").value = "";
    inpArchivo.value = "";
    inpImagen.value = "";
    ElegirTipo("archivo");

    cerrarSbFile();
    mostrarApks();
}


//////////////////////////////
//Lista de aplicaciones
//////////////////////////////

let apksCache = [];

/* tarjeta: foto, nombre, quién la subió, calificación y descargas */
function crearTarjeta(apk) {
    let tarjeta = crear("article", "apk");
    let info = crear("div", "apk-info");
    let meta = crear("div", "apk-meta");

    tarjeta.tabIndex = 0;
    tarjeta.setAttribute("role", "button");

    if (apk.fotoUrl) {
        let foto = crear("img", "apk-foto");
        foto.src = apk.fotoUrl;
        foto.alt = "Foto de " + apk.nombre;
        tarjeta.append(foto);
    } else {
        tarjeta.append(crear("div", "apk-foto vacia", apk.tipo === "pagina" ? "🌐" : "📦"));
    }

    meta.append(
        crear("span", "apk-estrella", formatoPromedio(apk)),
        crear("span", "", formatoContador(apk))
    );

    info.append(
        crear("strong", "apk-nombre", apk.nombre),
        crear("span", "apk-autor", "subido por " + apk.autor),
        meta
    );

    if (apk.tipo === "pagina") info.append(crear("span", "insignia", "página web"));

    tarjeta.append(info);

    tarjeta.addEventListener("click", () => abrirDetalle(apk.id));
    tarjeta.addEventListener("keydown", evento => {
        if (evento.key === "Enter") abrirDetalle(apk.id);
    });

    return tarjeta;
}

/* dibuja la lista aplicando el buscador */
function pintarApks() {
    let lista = document.getElementById("ListaApks");
    let texto = normalizar(document.getElementById("BuscarApk").value.trim());

    let filtradas = apksCache.filter(apk =>
        normalizar(apk.nombre + " " + apk.descripcion + " " + apk.autor).includes(texto));

    if (!apksCache.length) {
        lista.replaceChildren(crear("p", "apk-vacio",
            "Aún no hay aplicaciones. Toca + para publicar la primera."));
        return;
    }

    if (!filtradas.length) {
        lista.replaceChildren(crear("p", "apk-vacio", "No hay resultados para esa búsqueda."));
        return;
    }

    lista.replaceChildren(...filtradas.map(crearTarjeta));
}

async function mostrarApks() {
    try {
        apksCache = await Datos.listarApks();
    } catch (error) {
        console.log("no se pudo leer la lista", error);
        apksCache = [];
    }

    pintarApks();
}


//////////////////////////////
//Detalle: descripción, calificación y comentarios
//////////////////////////////

/* abre el detalle de una aplicación */
async function abrirDetalle(id) {
    ir("DvDetalle");
    document.getElementById("ContenidoDetalle").replaceChildren(crear("p", "apk-vacio", "cargando..."));
    await refrescarDetalle(id);
}

/* vuelve a leer los datos y dibuja el detalle */
async function refrescarDetalle(id) {
    try {
        apksCache = await Datos.listarApks();

        let apk = apksCache.find(a => a.id === id);
        if (!apk) {
            CerrarDetalle();
            return;
        }

        let [miVoto, comentarios, descargada] = await Promise.all([
            Datos.miVoto(usuario, id),
            Datos.comentarios(id),
            Datos.yaDescargue(usuario, id)
        ]);

        pintarDetalle(apk, miVoto, comentarios, descargada);
    } catch (error) {
        alert(error.message);
        CerrarDetalle();
    }
}

function pintarDetalle(apk, miVoto, comentarios, descargada) {
    let contenido = document.getElementById("ContenidoDetalle");
    let propia = apk.autorId === usuario.id;
    let partes = [];

    /* foto, nombre y autor */
    if (apk.fotoUrl) {
        let foto = crear("img", "detalle-foto");
        foto.src = apk.fotoUrl;
        foto.alt = "Foto de " + apk.nombre;
        partes.push(foto);
    } else {
        partes.push(crear("div", "detalle-foto vacia", apk.tipo === "pagina" ? "🌐" : "📦"));
    }

    partes.push(crear("h2", "detalle-titulo", apk.nombre));

    let autor = crear("div", "detalle-autor");
    autor.append(
        crearAvatar(apk.autor, apk.autorFoto),
        crear("span", "", "subido por " + apk.autor + " el " + formatoFecha(apk.fecha))
    );
    partes.push(autor);

    /* números */
    let datos = crear("div", "datos");
    [
        [apk.votos ? apk.promedio.toFixed(1) : "—", "calificación"],
        [apk.votos, apk.votos === 1 ? "voto" : "votos"],
        [apk.descargas, formatoContador(apk).replace(/^\d+ /, "")]
    ].forEach(([valor, nombre]) => {
        let dato = crear("div", "dato");
        dato.append(crear("strong", "", String(valor)), crear("span", "", nombre));
        datos.append(dato);
    });
    partes.push(datos);

    /* descripción */
    if (apk.descripcion) partes.push(crear("p", "detalle-texto", apk.descripcion));

    /* descargar la primera vez; después solo abrir */
    let textoBoton = "Descargar";
    if (apk.tipo === "pagina") textoBoton = "Abrir página";
    else if (descargada) textoBoton = "Abrir";

    let descargar = crear("button", "btn azul ancho", textoBoton);
    descargar.type = "button";
    descargar.addEventListener("click", () => DescargarBtn(apk, descargada));
    partes.push(descargar);

    if (apk.tipo === "archivo" && descargada) {
        partes.push(crear("p", "nota", "Ya la descargaste. Toca Abrir para abrirla."));
    }

    if (apk.tipo === "pagina" && urlSegura(apk.url)) {
        partes.push(crear("p", "nota", "abre " + new URL(apk.url).hostname));
    }

    /* calificar del 1 al 10 */
    partes.push(crear("h3", "detalle-seccion", "Tu calificación"));

    if (propia) {
        partes.push(crear("p", "nota", "No puedes calificar tu propia publicación."));
    } else {
        let puntos = crear("div", "puntos");
        for (let i = 1; i <= 10; i++) {
            let punto = crear("button", "chip punto" + (i === miVoto ? " activo" : ""), String(i));
            punto.type = "button";
            punto.setAttribute("aria-label", "calificar con " + i);
            punto.addEventListener("click", () => CalificarBtn(apk.id, i));
            puntos.append(punto);
        }
        partes.push(puntos);
    }

    /* comentarios */
    partes.push(crear("h3", "detalle-seccion", "Comentarios (" + comentarios.length + ")"));

    if (!comentarios.length) partes.push(crear("p", "nota", "Sé el primero en comentar."));

    comentarios.forEach(c => partes.push(crearComentario(apk.id, c)));

    let formulario = crear("div", "form-comentario");
    let caja = crear("input", "input");
    let enviar = crear("button", "btn azul", "comentar");

    caja.id = "InpComentario";
    caja.type = "text";
    caja.maxLength = 300;
    caja.placeholder = "escribe un comentario";
    caja.setAttribute("aria-label", "escribe un comentario");
    caja.addEventListener("keydown", evento => {
        if (evento.key === "Enter") ComentarBtn(apk.id);
    });

    enviar.type = "button";
    enviar.addEventListener("click", () => ComentarBtn(apk.id));

    formulario.append(caja, enviar);
    partes.push(formulario);

    /* eliminar (solo quien la publicó) */
    if (propia) {
        let borrar = crear("button", "btn peligro ancho", "Eliminar publicación");
        borrar.type = "button";
        borrar.addEventListener("click", () => EliminarBtn(apk.id));
        partes.push(borrar);
    }

    contenido.replaceChildren(...partes);
}

function crearComentario(apkId, comentario) {
    let fila = crear("div", "comentario");
    let cuerpo = crear("div", "comentario-cuerpo");
    let autor = crear("div", "comentario-autor", comentario.autor);

    autor.append(crear("span", "comentario-fecha", formatoFecha(comentario.fecha)));
    cuerpo.append(autor, crear("p", "comentario-texto", comentario.texto));
    fila.append(crearAvatar(comentario.autor, comentario.foto), cuerpo);

    /* cada quien puede borrar sus comentarios */
    if (comentario.autorId === usuario.id) {
        let borrar = crear("button", "apk-borrar", "✕");
        borrar.type = "button";
        borrar.setAttribute("aria-label", "borrar comentario");
        borrar.addEventListener("click", async () => {
            if (!confirm("¿Borrar este comentario?")) return;
            try {
                await Datos.borrarComentario(comentario.id);
                await refrescarDetalle(apkId);
            } catch (error) {
                alert(error.message);
            }
        });
        fila.append(borrar);
    }

    return fila;
}

/* abrir una página (cuenta una visita), descargar una apk (cuenta una vez) o abrirla si ya se descargó */
async function DescargarBtn(apk, descargada) {
    try {
        if (apk.tipo === "pagina") {
            let enlace = urlSegura(apk.url);
            if (!enlace) {
                alert("El enlace no es válido");
                return;
            }
            window.open(enlace, "_blank", "noopener");
            await Datos.contar(usuario, apk);
        } else if (descargada) {
            await abrirArchivo(apk);
            return;
        } else {
            let enlace = await Datos.archivoUrl(apk, true);
            let a = document.createElement("a");

            a.href = enlace;
            a.download = apk.nombreArchivo;
            document.body.append(a);
            a.click();
            a.remove();

            await Datos.contar(usuario, apk);
        }

        await refrescarDetalle(apk.id);
    } catch (error) {
        alert(error.message);
    }
}

/* abre el archivo ya descargado en una pestaña nueva (no cuenta otra descarga) */
async function abrirArchivo(apk) {
    /* se abre la pestaña ya, para que el navegador no la bloquee */
    let ventana = window.open("", "_blank");

    try {
        let enlace = await Datos.archivoUrl(apk, false);

        if (ventana) ventana.location.href = enlace;
        else window.location.href = enlace;
    } catch (error) {
        if (ventana) ventana.close();
        throw error;
    }
}

async function CalificarBtn(apkId, puntos) {
    try {
        await Datos.calificar(usuario, apkId, puntos);
        await refrescarDetalle(apkId);
    } catch (error) {
        alert(error.message);
    }
}

async function ComentarBtn(apkId) {
    let texto = document.getElementById("InpComentario").value.trim();
    if (!texto) return;

    try {
        await Datos.comentar(usuario, apkId, texto);
        await refrescarDetalle(apkId);
    } catch (error) {
        alert(error.message);
    }
}

async function EliminarBtn(apkId) {
    if (!confirm("¿Eliminar esta publicación? No se puede deshacer.")) return;

    try {
        await Datos.eliminar(apkId);
        await mostrarApks();
        CerrarDetalle();
    } catch (error) {
        alert(error.message);
    }
}


//////////////////////////////
//Actualizaciones de la página
//////////////////////////////

/* agrega una versión nueva arriba cada vez que cambies la página */
const ACTUALIZACIONES = [
    {
        version: "1.3",
        fecha: "2026-11-03",
        cambios: [
            "Las páginas cuentan visitas y las apks cuentan descargas, por separado",
            "Cada apk se descarga una sola vez por persona; después el botón cambia a Abrir",
            "Tu cuenta muestra tus descargas y tus visitas por separado"
        ]
    },
    {
        version: "1.2",
        fecha: "2026-11-02",
        cambios: [
            "Comentarios, descripción y calificación del 1 al 10 en cada publicación",
            "Contador de descargas",
            "Publicar páginas web con su enlace",
            "Cuenta con foto de perfil, nombre y tus números",
            "Buscador de aplicaciones",
            "Ya se puede instalar como app"
        ]
    },
    {
        version: "1.1",
        fecha: "2026-11-02",
        cambios: [
            "Publicar archivos con una imagen",
            "Lista de aplicaciones con foto, autor y descarga"
        ]
    },
    {
        version: "1.0",
        fecha: "2026-10-01",
        cambios: [
            "Registro y login",
            "Tema claro y oscuro"
        ]
    }
];

function mostrarActualizaciones() {
    let lista = document.getElementById("ListaActualizaciones");

    lista.replaceChildren(...ACTUALIZACIONES.map(version => {
        let tarjeta = crear("article", "version");
        let cambios = crear("ul", "");

        version.cambios.forEach(cambio => cambios.append(crear("li", "", cambio)));

        tarjeta.append(
            crear("h2", "version-titulo", "Versión " + version.version),
            crear("span", "apk-fecha", formatoFecha(version.fecha)),
            cambios
        );
        return tarjeta;
    }));
}


//////////////////////////////
//Instalar como app (PWA)
//////////////////////////////
let instalador = null;

window.addEventListener("beforeinstallprompt", evento => {
    evento.preventDefault();
    instalador = evento;
    document.getElementById("BtnInstalar").hidden = false;
});

async function InstalarBtn() {
    if (!instalador) return;

    instalador.prompt();
    await instalador.userChoice;

    instalador = null;
    document.getElementById("BtnInstalar").hidden = true;
}

if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker.register("sw.js").catch(() => console.log("sin service worker"));
    });
}


//////////////////////////////
//cargar
//////////////////////////////
aplicarTema(localStorage.getItem("temas"));

async function cargar() {
    document.getElementById("ModoDatos").textContent = Datos.modo === "nube"
        ? "datos guardados en la nube (Supabase)"
        : "datos guardados solo en este dispositivo";

    try {
        usuario = await Datos.sesion();
    } catch (error) {
        usuario = null;
    }

    if (usuario) {
        ir("inicio");
        mostrarApks();
        console.log("datos cargados");
    } else {
        ir("DvRegister");
        console.log("registrate");
    }
}

window.addEventListener("load", cargar);
