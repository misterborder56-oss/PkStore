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

/* pantallas que viven dentro del panel lateral */
const PANTALLAS_TIENDA = [
    "DvInicio",
    "DvApk",
    "DvDetalle",
    "DvFile",
    "DvCuenta",
    "DvActualizaciones",
    "DvAjustes",
    "DvVisor"
];

/* CERRAR TODO */
function ocultarPantallas() {
    ["DvRegister", "DvLogin", "Shell"].concat(PANTALLAS_TIENDA).forEach(id => cerrar(id));
}

let pantallaActual = "DvInicio";
let vistaAnterior = "DvInicio";
let filtroTipo = "todo";

/* IR A UNA PANTALLA (cierra las demás) */
function ir(id) {
    ocultarPantallas();

    if (PANTALLAS_TIENDA.includes(id)) {
        abrir("Shell");
        abrir(id);
        marcarMenu(id);

        /* el detalle y el visor recuerdan desde dónde se abrieron */
        if (id !== "DvDetalle" && id !== "DvVisor") {
            pantallaActual = id;
            vistaAnterior = id;
        }
    } else {
        abrir(id);
    }

    CerrarMenu();
    window.scrollTo(0, 0);
}

/* resalta la opción del panel lateral */
function marcarMenu(id) {
    if (id === "DvDetalle" || id === "DvVisor") return;

    document.querySelectorAll(".menu-item").forEach(item => {
        let activo = item.dataset.pantalla === id &&
            (!item.dataset.filtro || item.dataset.filtro === filtroTipo);
        item.classList.toggle("activo", activo);
    });
}

function AbrirMenu() {
    document.getElementById("Menu").classList.add("abierto");
    document.getElementById("Fondo").classList.add("abierto");
}

function CerrarMenu() {
    document.getElementById("Menu").classList.remove("abierto");
    document.getElementById("Fondo").classList.remove("abierto");
}


//////////////////////////////
//Navegar entre div
//////////////////////////////

/* inicio */
function InicioBtn() {
    ir("DvInicio");
    mostrarApks();
}

/* aplicaciones */
function ApkBtn() {
    filtroTipo = "archivo";
    ir("DvApk");
    mostrarApks();
}

/* páginas web y html */
function PaginasBtn() {
    filtroTipo = "web";
    ir("DvApk");
    mostrarApks();
}

/* chips de la lista: todo, apps o páginas */
function Filtrar(filtro) {
    filtroTipo = filtro;
    ir("DvApk");
    pintarApks();
}

/* escribir en el buscador abre los resultados */
function BuscarInput() {
    if (pantallaActual !== "DvApk") {
        filtroTipo = "todo";
        ir("DvApk");
    }
    pintarApks();
}

/* ajuste */
function OpcBtn() {
    ir("DvAjustes");
}

/* publicar */
function AbrirDow() {
    ir("DvFile");
}

/* volver desde el detalle */
function CerrarDetalle() {
    ir(vistaAnterior);
    repintar(vistaAnterior);
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

/* actualizaciones */
function AbrirActualizaciones() {
    ir("DvActualizaciones");
    mostrarActualizaciones();
}

/* vuelve a dibujar la pantalla a la que se regresa */
function repintar(id) {
    if (id === "DvInicio") pintarInicio();
    else if (id === "DvApk") pintarApks();
    else if (id === "DvCuenta") mostrarCuenta();
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
const MAX_VIDEO = 40 * 1024 * 1024;
const MAX_HTML = 2 * 1024 * 1024;
const MAX_IMAGEN = 3 * 1024 * 1024;
const MAX_CAPTURAS = 8;

let usuario = null;

/* crea un elemento con clase y texto */
function crear(etiqueta, clase, texto) {
    let elemento = document.createElement(etiqueta);
    elemento.className = clase;
    if (texto) elemento.textContent = texto;
    return elemento;
}

/* crea un botón con texto y acción */
function crearBoton(texto, clase, accion) {
    let boton = crear("button", clase, texto);
    boton.type = "button";
    boton.addEventListener("click", accion);
    return boton;
}

/* texto sin mayúsculas ni acentos, para el buscador */
function normalizar(texto) {
    return texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function formatoFecha(fecha) {
    return new Date(fecha).toLocaleDateString("es");
}

function formatoPromedio(apk) {
    return apk.votos ? "★ " + apk.promedio.toFixed(1) : "★ sin votos";
}

/* las apks se descargan; las páginas y los html se visitan */
function formatoContador(apk) {
    let n = apk.descargas;

    if (apk.tipo === "archivo") return n + (n === 1 ? " descarga" : " descargas");
    return n + (n === 1 ? " visita" : " visitas");
}

function nombreTipo(apk) {
    if (apk.tipo === "pagina") return "Página web";
    if (apk.tipo === "html") return "Archivo HTML";
    return "App";
}

function emojiTipo(apk) {
    if (apk.tipo === "pagina") return "🌐";
    if (apk.tipo === "html") return "📄";
    return "📦";
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

/* icono de la aplicación, o el emoji de su tipo si no tiene */
function crearIcono(apk, clase) {
    if (apk.fotoUrl) {
        let imagen = crear("img", clase);
        imagen.src = apk.fotoUrl;
        imagen.alt = "Icono de " + apk.nombre;
        return imagen;
    }
    return crear("div", clase + " vacia", emojiTipo(apk));
}

/* copia al portapapeles (con plan B para navegadores sin permiso) */
async function copiarTexto(texto) {
    try {
        await navigator.clipboard.writeText(texto);
        return true;
    } catch (error) {
        let caja = document.createElement("textarea");
        let copiado = false;

        caja.value = texto;
        caja.style.position = "fixed";
        caja.style.opacity = "0";
        document.body.append(caja);
        caja.select();

        try {
            copiado = document.execCommand("copy");
        } catch (error2) {
            copiado = false;
        }

        caja.remove();
        return copiado;
    }
}


//////////////////////////////
//Registro y login
//////////////////////////////

/* entra a la app con la cuenta ya validada */
function iniciarSesion(perfil) {
    usuario = perfil;
    actualizarMenuUsuario();
    InicioBtn();
}

/* nombre y foto abajo del panel lateral */
function actualizarMenuUsuario() {
    ponerAvatar(document.getElementById("MenuAvatar"), usuario.nombre, usuario.foto);
    document.getElementById("MenuNombre").textContent = usuario.nombre;
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

/* foto, nombre, números y publicaciones propias */
async function mostrarCuenta() {
    fotoNueva = null;

    document.getElementById("InpCuentaNombre").value = usuario.nombre;
    document.getElementById("CuentaCorreo").textContent = usuario.email;
    ponerAvatar(document.getElementById("AvatarCuenta"), usuario.nombre, usuario.foto);

    try {
        apksCache = await Datos.listarApks();
        let mias = apksCache.filter(a => a.autorId === usuario.id);

        /* descargas (apks) y visitas (páginas y html) por separado */
        let descargas = mias.filter(a => a.tipo === "archivo").reduce((total, a) => total + a.descargas, 0);
        let visitas = mias.filter(a => a.tipo !== "archivo").reduce((total, a) => total + a.descargas, 0);
        let votos = mias.reduce((total, a) => total + a.votos, 0);
        let suma = mias.reduce((total, a) => total + a.promedio * a.votos, 0);

        document.getElementById("DatoPublicadas").textContent = mias.length;
        document.getElementById("DatoDescargas").textContent = descargas;
        document.getElementById("DatoVisitas").textContent = visitas;
        document.getElementById("DatoCalificacion").textContent =
            votos ? (suma / votos).toFixed(1) + " / 10" : "—";

        let lista = document.getElementById("MisApks");
        lista.replaceChildren(...(mias.length
            ? mias.map(crearTarjetaApp)
            : [crear("p", "vacio", "Aún no publicaste nada.")]));
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
        actualizarMenuUsuario();
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
let accesoPublicacion = "libre";
let urlsPrevias = [];

let inpArchivo = document.getElementById("SubirFile");
let inpImagen = document.getElementById("SubirImagen");
let inpCapturas = document.getElementById("SubirCapturas");
let inpVideo = document.getElementById("SubirVideo");

/* apk, página web o html: cambia los campos que se ven */
function ElegirTipo(tipo) {
    tipoPublicacion = tipo;

    document.getElementById("TipoArchivo").classList.toggle("activo", tipo === "archivo");
    document.getElementById("TipoPagina").classList.toggle("activo", tipo === "pagina");
    document.getElementById("TipoHtml").classList.toggle("activo", tipo === "html");

    document.getElementById("InpApkUrl").hidden = tipo !== "pagina";
    document.getElementById("LabelArchivo").hidden = tipo === "pagina";
    document.getElementById("CampoAcceso").hidden = tipo !== "archivo";
    document.getElementById("TituloArchivo").textContent = tipo === "html" ? "Archivo HTML" : "Archivo de la apk";

    inpArchivo.accept = tipo === "html" ? ".html,.htm,text/html" : "";
    inpArchivo.value = "";

    actualizarSeleccion();
}

/* descarga libre o con código de un solo uso */
function ElegirAcceso(acceso) {
    accesoPublicacion = acceso;

    document.getElementById("AccesoLibre").classList.toggle("activo", acceso === "libre");
    document.getElementById("AccesoCodigo").classList.toggle("activo", acceso === "codigo");

    document.getElementById("NotaAcceso").hidden = acceso !== "codigo";
    document.getElementById("NotaAcceso").textContent =
        "Se crean " + TOTAL_CODIGOS + " códigos que solo tú puedes ver y copiar. " +
        "Cada código desbloquea la descarga para una persona.";
}

/* muestra lo que se eligió antes de publicar */
function actualizarSeleccion() {
    let archivo = inpArchivo.files[0];
    let imagen = inpImagen.files[0];
    let capturas = Array.from(inpCapturas.files);
    let video = inpVideo.files[0];
    let fila = document.getElementById("PrevCapturas");

    urlsPrevias.forEach(url => URL.revokeObjectURL(url));
    urlsPrevias = [];

    document.getElementById("PrevArchivo").textContent = archivo ? archivo.name : "ningún archivo elegido";
    document.getElementById("PrevIcono").textContent = imagen ? imagen.name : "ningún icono elegido";
    document.getElementById("PrevVideo").textContent = video ? video.name : "un solo video (opcional)";
    document.getElementById("PrevCapturasTexto").textContent =
        capturas.length ? capturas.length + " de " + MAX_CAPTURAS + " imágenes" : "hasta " + MAX_CAPTURAS + " imágenes";

    fila.replaceChildren(...capturas.map(captura => {
        let url = URL.createObjectURL(captura);
        let miniatura = crear("img", "prev-mini");

        urlsPrevias.push(url);
        miniatura.src = url;
        miniatura.alt = captura.name;
        return miniatura;
    }));
}

[inpArchivo, inpImagen, inpVideo].forEach(input => input.addEventListener("change", actualizarSeleccion));

inpCapturas.addEventListener("change", function () {
    if (inpCapturas.files.length > MAX_CAPTURAS) {
        alert("Puedes subir hasta " + MAX_CAPTURAS + " capturas");
        inpCapturas.value = "";
    }
    actualizarSeleccion();
});

async function PublicarBtn() {
    let archivo = inpArchivo.files[0];
    let imagen = inpImagen.files[0];
    let capturas = Array.from(inpCapturas.files);
    let video = inpVideo.files[0];
    let nombre = document.getElementById("InpApkNombre").value.trim();
    let descripcion = document.getElementById("InpApkDescripcion").value.trim();
    let enlace = null;
    let boton = document.getElementById("BtnPublicar");

    if (tipoPublicacion === "pagina") {
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
    } else {
        if (!archivo) {
            alert("Elige un archivo para publicar");
            return;
        }

        if (tipoPublicacion === "html") {
            if (!/\.html?$/i.test(archivo.name)) {
                alert("El archivo debe terminar en .html");
                return;
            }
            if (archivo.size > MAX_HTML) {
                alert("El archivo html pesa más de 2 MB");
                return;
            }
        } else if (archivo.size > MAX_ARCHIVO) {
            alert("El archivo pesa más de 50 MB");
            return;
        }

        if (!nombre) nombre = archivo.name;
    }

    if (imagen && imagen.size > MAX_IMAGEN) {
        alert("El icono pesa más de 3 MB");
        return;
    }

    if (capturas.some(captura => captura.size > MAX_IMAGEN)) {
        alert("Cada captura debe pesar menos de 3 MB");
        return;
    }

    if (video && video.size > MAX_VIDEO) {
        alert("El video pesa más de 40 MB");
        return;
    }

    boton.disabled = true;

    try {
        await Datos.publicar(usuario, {
            nombre: nombre,
            descripcion: descripcion,
            tipo: tipoPublicacion,
            acceso: accesoPublicacion,
            url: enlace,
            archivo: archivo,
            imagen: imagen || null,
            capturas: capturas,
            video: video || null
        });
    } catch (error) {
        alert("No se pudo publicar: " + error.message);
        boton.disabled = false;
        return;
    }

    boton.disabled = false;

    /* limpiar formulario */
    ["InpApkNombre", "InpApkDescripcion", "InpApkUrl"].forEach(id => { document.getElementById(id).value = ""; });
    [inpArchivo, inpImagen, inpCapturas, inpVideo].forEach(input => { input.value = ""; });
    ElegirAcceso("libre");
    ElegirTipo("archivo");

    /* abre lo que acabas de publicar (si tiene códigos, ahí los ves) */
    vistaAnterior = "DvInicio";
    await mostrarApks();
    let nueva = apksCache.find(a => a.autorId === usuario.id);

    if (nueva) abrirDetalle(nueva.id);
    else InicioBtn();
}


//////////////////////////////
//Inicio y lista de aplicaciones
//////////////////////////////

let apksCache = [];

/* tarjeta: icono, nombre, autor, calificación y contador */
function crearTarjetaApp(apk) {
    let tarjeta = crear("article", "tarjeta-app");
    let meta = crear("div", "tarjeta-meta");

    tarjeta.tabIndex = 0;
    tarjeta.setAttribute("role", "button");

    meta.append(
        crear("span", "apk-estrella", formatoPromedio(apk)),
        crear("span", "", formatoContador(apk))
    );

    tarjeta.append(
        crearIcono(apk, "tarjeta-icono"),
        crear("strong", "tarjeta-nombre", apk.nombre),
        crear("span", "tarjeta-autor", apk.autor),
        meta
    );

    if (apk.tipo === "html") tarjeta.append(crear("span", "insignia", "HTML"));
    else if (apk.tipo === "pagina") tarjeta.append(crear("span", "insignia", "página web"));
    else if (apk.acceso === "codigo") tarjeta.append(crear("span", "insignia", "🔒 con código"));

    tarjeta.addEventListener("click", () => abrirDetalle(apk.id));
    tarjeta.addEventListener("keydown", evento => {
        if (evento.key === "Enter") abrirDetalle(apk.id);
    });

    return tarjeta;
}

/* una fila de tarjetas que se mueve hacia los lados */
function crearFila(titulo, lista) {
    let bloque = crear("section", "bloque");
    let cabecera = crear("div", "bloque-cab");
    let fila = crear("div", "fila");

    cabecera.append(
        crear("h2", "bloque-titulo", titulo),
        crearBoton("ver todo", "enlace", () => Filtrar("todo"))
    );
    fila.append(...lista.slice(0, 12).map(crearTarjetaApp));
    bloque.append(cabecera, fila);

    return bloque;
}

/* pantalla de inicio: filas como en una tienda */
function pintarInicio() {
    let contenedor = document.getElementById("InicioFilas");

    if (!apksCache.length) {
        contenedor.replaceChildren(crear("p", "vacio",
            "Aún no hay nada publicado. Toca Publicar para subir lo primero."));
        return;
    }

    let masVisitas = (a, b) => b.descargas - a.descargas;

    let secciones = [
        ["Mejor calificadas", apksCache.filter(a => a.votos).sort((a, b) => b.promedio - a.promedio || b.votos - a.votos)],
        ["Apps más descargadas", apksCache.filter(a => a.tipo === "archivo" && a.descargas).sort(masVisitas)],
        ["Páginas más visitadas", apksCache.filter(a => a.tipo !== "archivo" && a.descargas).sort(masVisitas)],
        ["Nuevas", apksCache.slice()]
    ];

    contenedor.replaceChildren(...secciones
        .filter(([, lista]) => lista.length)
        .map(([titulo, lista]) => crearFila(titulo, lista)));
}

/* dibuja la lista aplicando el filtro y el buscador */
function pintarApks() {
    let lista = document.getElementById("ListaApks");
    let texto = normalizar(document.getElementById("BuscarApk").value.trim());

    let titulos = { todo: "Todo", archivo: "Apps", web: "Páginas y HTML" };
    document.getElementById("TituloLista").textContent = texto ? "Resultados" : titulos[filtroTipo];

    document.getElementById("FiltroTodo").classList.toggle("activo", filtroTipo === "todo");
    document.getElementById("FiltroArchivo").classList.toggle("activo", filtroTipo === "archivo");
    document.getElementById("FiltroWeb").classList.toggle("activo", filtroTipo === "web");

    let filtradas = apksCache.filter(apk => {
        let delTipo = filtroTipo === "todo" ||
            (filtroTipo === "archivo" && apk.tipo === "archivo") ||
            (filtroTipo === "web" && apk.tipo !== "archivo");

        return delTipo && normalizar(apk.nombre + " " + apk.descripcion + " " + apk.autor).includes(texto);
    });

    if (!filtradas.length) {
        lista.replaceChildren(crear("p", "vacio", apksCache.length
            ? "No hay resultados."
            : "Aún no hay aplicaciones. Toca Publicar para subir la primera."));
        return;
    }

    lista.replaceChildren(...filtradas.map(crearTarjetaApp));
}

/* lee todo de nuevo y dibuja inicio y lista */
async function mostrarApks() {
    try {
        apksCache = await Datos.listarApks();
    } catch (error) {
        console.log("no se pudo leer la lista", error);
        apksCache = [];
    }

    pintarInicio();
    pintarApks();
}


//////////////////////////////
//Detalle: descripción, capturas, calificación y comentarios
//////////////////////////////

/* abre el detalle de una aplicación */
async function abrirDetalle(id) {
    ir("DvDetalle");
    document.getElementById("ContenidoDetalle").replaceChildren(crear("p", "nota", "cargando..."));
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

        let propia = apk.autorId === usuario.id;
        let conCodigo = apk.tipo === "archivo" && apk.acceso === "codigo";

        let [miVoto, comentarios, descargada, desbloqueo, codigos] = await Promise.all([
            Datos.miVoto(usuario, id),
            Datos.comentarios(id),
            Datos.yaDescargue(usuario, id),
            conCodigo && !propia ? Datos.estadoDesbloqueo(usuario, id) : null,
            conCodigo && propia ? Datos.codigos(id) : null
        ]);

        pintarDetalle(apk, { miVoto, comentarios, descargada, desbloqueo, codigos });
    } catch (error) {
        alert(error.message);
        CerrarDetalle();
    }
}

function pintarDetalle(apk, datos) {
    let contenido = document.getElementById("ContenidoDetalle");
    let propia = apk.autorId === usuario.id;

    let grid = crear("div", "det-grid");
    let principal = crear("div", "det-principal");
    let lado = crear("aside", "panel-lado");

    /* icono, nombre y autor */
    let cabecera = crear("div", "det-cabecera");
    let info = crear("div", "");
    let autor = crear("div", "det-autor");
    let insignias = crear("div", "det-badges");

    autor.append(crearAvatar(apk.autor, apk.autorFoto), crear("span", "", apk.autor));
    insignias.append(crear("span", "insignia", nombreTipo(apk)));
    if (apk.tipo === "archivo" && apk.acceso === "codigo") insignias.append(crear("span", "insignia", "🔒 descarga con código"));

    info.append(crear("h1", "det-titulo", apk.nombre), autor, insignias);
    cabecera.append(crearIcono(apk, "det-icono"), info);
    principal.append(cabecera);

    /* números */
    let stats = crear("div", "det-stats");
    [
        [apk.votos ? apk.promedio.toFixed(1) + " ★" : "—", apk.votos + (apk.votos === 1 ? " voto" : " votos")],
        [String(apk.descargas), apk.tipo === "archivo" ? "descargas" : "visitas"],
        [nombreTipo(apk), "tipo"]
    ].forEach(([valor, nombre]) => {
        let stat = crear("div", "det-stat");
        stat.append(crear("strong", "", valor), crear("span", "", nombre));
        stats.append(stat);
    });
    principal.append(stats);

    /* descargar, desbloquear o abrir */
    principal.append(crearAcciones(apk, datos));

    /* video y capturas */
    if (apk.videoUrl || apk.capturas.length) {
        let carrusel = crear("div", "carrusel");

        if (apk.videoUrl) {
            let video = crear("video", "car-video");
            video.src = apk.videoUrl;
            video.controls = true;
            video.preload = "metadata";
            video.setAttribute("playsinline", "");
            carrusel.append(video);
        }

        apk.capturas.forEach((url, i) => {
            let captura = crear("img", "car-img");
            captura.src = url;
            captura.alt = "Captura " + (i + 1) + " de " + apk.nombre;
            captura.loading = "lazy";
            captura.addEventListener("click", () => AbrirLightbox(url));
            carrusel.append(captura);
        });

        principal.append(crear("h2", "seccion", "Vista previa"), carrusel);
    }

    /* descripción */
    if (apk.descripcion) {
        principal.append(crear("h2", "seccion", "Acerca de"), crear("p", "det-texto", apk.descripcion));
    }

    /* calificar del 1 al 10 */
    let calif = crear("div", "calif");
    calif.append(crear("div", "calif-numero", apk.votos ? apk.promedio.toFixed(1) : "—"));

    if (propia) {
        calif.append(crear("p", "nota", "No puedes calificar tu propia publicación."));
    } else {
        let puntos = crear("div", "puntos");

        for (let i = 1; i <= 10; i++) {
            let punto = crear("button", "chip punto" + (i === datos.miVoto ? " activo" : ""), String(i));
            punto.type = "button";
            punto.setAttribute("aria-label", "calificar con " + i);
            punto.addEventListener("click", () => CalificarBtn(apk.id, i));
            puntos.append(punto);
        }
        calif.append(puntos);
    }
    principal.append(crear("h2", "seccion", "Calificación"), calif);

    /* códigos de descarga: solo para quien publicó */
    if (propia && datos.codigos) principal.append(crear("h2", "seccion", "Códigos de descarga"), crearPanelCodigos(datos.codigos, apk.id));

    /* comentarios */
    principal.append(crear("h2", "seccion", "Comentarios (" + datos.comentarios.length + ")"));

    if (!datos.comentarios.length) principal.append(crear("p", "nota", "Sé el primero en comentar."));
    datos.comentarios.forEach(c => principal.append(crearComentario(apk.id, c)));

    let formulario = crear("div", "form-comentario");
    let caja = crear("input", "input");

    caja.id = "InpComentario";
    caja.type = "text";
    caja.maxLength = 300;
    caja.placeholder = "escribe un comentario";
    caja.setAttribute("aria-label", "escribe un comentario");
    caja.addEventListener("keydown", evento => {
        if (evento.key === "Enter") ComentarBtn(apk.id);
    });

    formulario.append(caja, crearBoton("comentar", "btn azul", () => ComentarBtn(apk.id)));
    principal.append(formulario);

    /* eliminar (solo quien la publicó) */
    if (propia) {
        principal.append(crearBoton("Eliminar publicación", "btn peligro ancho", () => EliminarBtn(apk.id)));
    }

    /* panel derecho: información y más del autor */
    let informacion = crear("div", "panel");
    informacion.append(crear("h3", "", "Información"));
    [
        ["Publicado por", apk.autor],
        ["Fecha", formatoFecha(apk.fecha)],
        ["Tipo", nombreTipo(apk)],
        [apk.tipo === "archivo" ? "Descargas" : "Visitas", String(apk.descargas)],
        ["Calificación", apk.votos ? apk.promedio.toFixed(1) + " / 10" : "sin votos"]
    ].forEach(([nombre, valor]) => {
        let fila = crear("div", "info-fila");
        fila.append(crear("span", "", nombre), crear("strong", "", valor));
        informacion.append(fila);
    });
    if (apk.tipo === "archivo") {
        let fila = crear("div", "info-fila");
        fila.append(crear("span", "", "Descarga"), crear("strong", "", apk.acceso === "codigo" ? "con código" : "libre"));
        informacion.append(fila);
    }
    lado.append(informacion);

    let masDelAutor = apksCache.filter(a => a.autorId === apk.autorId && a.id !== apk.id).slice(0, 5);
    if (masDelAutor.length) {
        let mas = crear("div", "panel");
        mas.append(crear("h3", "", "Más de " + apk.autor), ...masDelAutor.map(crearMiniFila));
        lado.append(mas);
    }

    grid.append(principal, lado);
    contenido.replaceChildren(grid);
}

/* fila pequeña: icono, nombre y calificación */
function crearMiniFila(apk) {
    let fila = crear("div", "mini-fila");
    let texto = crear("div", "mini-texto");

    fila.tabIndex = 0;
    fila.setAttribute("role", "button");

    texto.append(crear("span", "", apk.nombre), crear("small", "", formatoPromedio(apk)));
    fila.append(crearIcono(apk, "mini-icono"), texto);

    fila.addEventListener("click", () => abrirDetalle(apk.id));
    fila.addEventListener("keydown", evento => {
        if (evento.key === "Enter") abrirDetalle(apk.id);
    });
    return fila;
}

/* el botón principal cambia según el tipo y el estado de la descarga */
function crearAcciones(apk, datos) {
    let caja = crear("div", "acciones");

    if (apk.tipo === "pagina") {
        caja.append(crearBoton("Abrir página", "btn azul ancho", () => AbrirPagina(apk)));

        if (urlSegura(apk.url)) caja.append(crear("p", "nota", "abre " + new URL(apk.url).hostname));
        return caja;
    }

    if (apk.tipo === "html") {
        caja.append(crearBoton("Abrir visualizador", "btn azul ancho", () => AbrirVisor(apk)));
        return caja;
    }

    /* ya la descargó: solo puede abrirla */
    if (datos.descargada) {
        caja.append(
            crearBoton("Abrir", "btn azul ancho", () => abrirArchivoBtn(apk)),
            crear("p", "nota", "Ya la descargaste. Toca Abrir para abrirla.")
        );
        return caja;
    }

    /* con código y todavía bloqueada */
    if (datos.desbloqueo && !datos.desbloqueo.desbloqueada) {
        let candado = crear("div", "candado");
        let fila = crear("div", "form-comentario");
        let campo = crear("input", "input");

        campo.id = "InpCodigo";
        campo.type = "text";
        campo.maxLength = 20;
        campo.placeholder = "XXXX-XXXX-XXXX";
        campo.autocomplete = "off";
        campo.setAttribute("aria-label", "código de descarga");
        campo.addEventListener("keydown", evento => {
            if (evento.key === "Enter") DesbloquearBtn(apk.id);
        });

        fila.append(campo, crearBoton("Desbloquear", "btn azul", () => DesbloquearBtn(apk.id)));
        candado.append(
            crear("strong", "", "🔒 Descarga con código"),
            crear("p", "nota", "Pídele un código de un solo uso a quien la publicó."),
            fila
        );
        caja.append(candado);
        return caja;
    }

    caja.append(crearBoton("Descargar", "btn azul ancho", () => DescargarBtn(apk)));

    /* desbloqueada con código: durante la primera hora se puede desactivar */
    if (datos.desbloqueo && datos.desbloqueo.desbloqueada) {
        let minutos = 60 - Math.floor((Date.now() - datos.desbloqueo.canjeadoEn) / 60000);

        if (minutos > 0) {
            caja.append(
                crear("p", "nota", "Enlace activo. Durante " + minutos + " min más puedes desactivarlo y el código se restablece."),
                crearBoton("Desactivar enlace", "btn peligro chico", () => DesactivarBtn(apk.id))
            );
        } else {
            caja.append(crear("p", "nota", "Enlace activo."));
        }
    }

    return caja;
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

/* abrir una página: cuenta una visita */
async function AbrirPagina(apk) {
    let enlace = urlSegura(apk.url);

    if (!enlace) {
        alert("El enlace no es válido");
        return;
    }

    window.open(enlace, "_blank", "noopener");

    try {
        await Datos.contar(usuario, apk);
        await refrescarDetalle(apk.id);
    } catch (error) {
        alert(error.message);
    }
}

/* descargar una apk: cuenta una sola vez por persona */
async function DescargarBtn(apk) {
    try {
        let enlace = await Datos.archivoUrl(usuario, apk, true);
        let a = document.createElement("a");

        a.href = enlace;
        a.download = apk.nombreArchivo;
        document.body.append(a);
        a.click();
        a.remove();

        await Datos.contar(usuario, apk);
        await refrescarDetalle(apk.id);
    } catch (error) {
        alert(error.message);
        refrescarDetalle(apk.id);
    }
}

async function abrirArchivoBtn(apk) {
    try {
        await abrirArchivo(apk);
    } catch (error) {
        alert(error.message);
    }
}

/* abre el archivo ya descargado en una pestaña nueva (no cuenta otra descarga) */
async function abrirArchivo(apk) {
    /* se abre la pestaña ya, para que el navegador no la bloquee */
    let ventana = window.open("", "_blank");

    try {
        let enlace = await Datos.archivoUrl(usuario, apk, false);

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
//Códigos de descarga
//////////////////////////////

/* quien descarga: usa un código para desbloquear el enlace */
async function DesbloquearBtn(apkId) {
    let codigo = document.getElementById("InpCodigo").value.trim();

    if (!codigo) {
        alert("Escribe el código");
        return;
    }

    try {
        await Datos.canjear(usuario, apkId, codigo);
        await refrescarDetalle(apkId);
    } catch (error) {
        alert(error.message);
    }
}

/* durante la primera hora: el código vuelve a estar disponible */
async function DesactivarBtn(apkId) {
    if (!confirm("¿Desactivar el enlace? El código se restablece y tendrás que usar uno nuevo para descargar.")) return;

    try {
        await Datos.desactivarEnlace(usuario, apkId);
        await refrescarDetalle(apkId);
    } catch (error) {
        alert(error.message);
        refrescarDetalle(apkId);
    }
}

/* quien publicó: ve y copia sus códigos */
function crearPanelCodigos(codigos, apkId) {
    let panel = crear("div", "codigos");
    let cabecera = crear("div", "codigos-cab");
    let rejilla = crear("div", "codigos-grid");
    let libres = codigos.filter(c => !c.usado);

    /* si por algún error no se crearon, se pueden generar desde aquí */
    if (!codigos.length) {
        panel.append(
            crear("p", "nota", "Aún no se generaron los códigos de esta publicación."),
            crearBoton("Generar " + TOTAL_CODIGOS + " códigos", "btn azul chico", async () => {
                try {
                    await Datos.generarCodigos(apkId);
                    await refrescarDetalle(apkId);
                } catch (error) {
                    alert(error.message);
                }
            })
        );
        return panel;
    }

    cabecera.append(
        crear("span", "nota", "Solo tú los ves. " + libres.length + " de " + codigos.length + " disponibles."),
        crearBoton("copiar disponibles", "chip", async function () {
            let copiado = await copiarTexto(libres.map(c => c.codigo).join("\n"));
            this.textContent = copiado ? "¡copiados!" : "no se pudo copiar";
            setTimeout(() => { this.textContent = "copiar disponibles"; }, 1800);
        })
    );

    codigos.forEach(c => {
        let fila = crear("div", "codigo-fila" + (c.usado ? " usado" : ""));

        fila.append(
            crear("code", "", c.codigo),
            c.usado
                ? crear("span", "nota", "usado")
                : crearBoton("copiar", "chip", async function () {
                    let copiado = await copiarTexto(c.codigo);
                    this.textContent = copiado ? "¡copiado!" : "error";
                    setTimeout(() => { this.textContent = "copiar"; }, 1500);
                })
        );
        rejilla.append(fila);
    });

    panel.append(cabecera, rejilla);
    return panel;
}


//////////////////////////////
//Capturas en grande
//////////////////////////////
function AbrirLightbox(url) {
    document.getElementById("LightboxImg").src = url;
    document.getElementById("Lightbox").hidden = false;
}

function CerrarLightbox() {
    document.getElementById("Lightbox").hidden = true;
}

document.addEventListener("keydown", evento => {
    if (evento.key === "Escape") CerrarLightbox();
});


//////////////////////////////
//Visualizador de archivos html
//////////////////////////////
let apkVisor = null;

/* el html se muestra en un marco aislado: no puede tocar tu sesión ni tus datos */
async function AbrirVisor(apk) {
    let marco = document.getElementById("VisorMarco");

    apkVisor = apk;
    ir("DvVisor");
    document.getElementById("VisorTitulo").textContent = apk.nombre;
    marco.srcdoc = "<p style='font-family:sans-serif'>cargando...</p>";

    try {
        marco.srcdoc = await Datos.htmlTexto(apk);
        await Datos.contar(usuario, apk);
    } catch (error) {
        alert(error.message);
        CerrarVisor();
    }
}

function CerrarVisor() {
    document.getElementById("VisorMarco").srcdoc = "";
    abrirDetalle(apkVisor.id);
}


//////////////////////////////
//Actualizaciones de la página
//////////////////////////////

/* agrega una versión nueva arriba cada vez que cambies la página */
const ACTUALIZACIONES = [
    {
        version: "2.0",
        fecha: "2026-11-04",
        cambios: [
            "Nuevo diseño con panel lateral, inicio con filas y detalle como en una tienda",
            "Apks con descarga libre o con código de un solo uso (50 códigos que solo ve quien publica)",
            "Puedes desactivar un enlace durante la primera hora y el código se restablece",
            "Capturas y un video en cada publicación",
            "Publicar archivos HTML que se ven dentro de la página, además de webs por url"
        ]
    },
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
    document.getElementById("FilaInstalar").hidden = false;
});

async function InstalarBtn() {
    if (!instalador) return;

    instalador.prompt();
    await instalador.userChoice;

    instalador = null;
    document.getElementById("FilaInstalar").hidden = true;
}

/* el service worker se registra en index.html, antes que este archivo */


//////////////////////////////
//cargar
//////////////////////////////
aplicarTema(localStorage.getItem("temas"));
ElegirAcceso("libre");

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
        actualizarMenuUsuario();
        InicioBtn();
        console.log("datos cargados");
    } else {
        ir("DvRegister");
        console.log("registrate");
    }
}

window.addEventListener("load", cargar);
