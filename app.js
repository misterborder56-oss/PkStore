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
    "DvMinijuegos",
    "DvDetalle",
    "DvFile",
    "DvCuenta",
    "DvActualizaciones",
    "DvAjustes",
    "DvSeguridad",
    "DvSoporte",
    "DvDescargas",
    "DvEditor",
    "DvVisor"
];

/* CERRAR TODO */
function ocultarPantallas() {
    ["DvRegister", "DvLogin", "DvRecuperar", "Shell"].concat(PANTALLAS_TIENDA).forEach(id => cerrar(id));
}

let pantallaActual = "DvInicio";
let pantallaMostrada = "DvInicio";
let vistaAnterior = "DvInicio";
let filtroTipo = "todo";

/* IR A UNA PANTALLA (cierra las demás) */
function ir(id) {
    ocultarPantallas();
    pantallaMostrada = id;

    if (PANTALLAS_TIENDA.includes(id)) {
        abrir("Shell");
        abrir(id);
        marcarMenu(id);

        /* el detalle y el visor recuerdan desde dónde se abrieron */
        if (id !== "DvDetalle" && id !== "DvVisor" && id !== "DvEditor") {
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
    if (id === "DvDetalle" || id === "DvVisor" || id === "DvEditor") return;

    document.querySelectorAll(".menu-item").forEach(item => {
        let activo = item.dataset.pantalla === (id === "DvSeguridad" ? "DvAjustes" : id) &&
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

/* mini juegos */
function MinijuegosBtn() {
    ir("DvMinijuegos");
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

/* descargas guardadas en el dispositivo (funcionan sin internet) */
function DescargasBtn() {
    ir("DvDescargas");
    mostrarDescargas();
}

/* ajuste */
function OpcBtn() {
    ir("DvAjustes");
    aplicarAjustes();
    mostrarCarpeta();
    mostrarAlmacenamiento();
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

function AbrirRecuperar() {
    document.getElementById("RecEmail").value = document.getElementById("Inpemail").value;
    ["RecCodigo", "RecClave", "RecClave2"].forEach(id => { document.getElementById(id).value = ""; });
    document.getElementById("RecPaso1").hidden = false;
    document.getElementById("RecPaso2").hidden = true;
    ir("DvRecuperar");
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
    else if (id === "DvMinijuegos") pintarMinijuegos();
    else if (id === "DvCuenta") mostrarCuenta();
    else if (id === "DvDescargas") mostrarDescargas();
}


//////////////////////////////
//Temas
//////////////////////////////

/* cada tema es una clase del css (tema-oceano, tema-bosque...); "claro" usa la clase Bdc */
const TEMAS = [
    { id: "oscuro", nombre: "Oscuro", colores: ["#121318", "#1a1f2b", "#377df4"] },
    { id: "claro", nombre: "Claro", colores: ["#f6f8fc", "#ffffff", "#377df4"] },
    { id: "medianoche", nombre: "Medianoche", colores: ["#000000", "#101014", "#6ea8ff"] },
    { id: "oceano", nombre: "Océano", colores: ["#08161e", "#102838", "#22b8cf"] },
    { id: "bosque", nombre: "Bosque", colores: ["#0c150f", "#15271c", "#3fb56b"] },
    { id: "atardecer", nombre: "Atardecer", colores: ["#170f0d", "#2a1a17", "#ff7a45"] },
    { id: "violeta", nombre: "Violeta", colores: ["#110d1b", "#1f1731", "#9b6bff"] },
    { id: "rosa", nombre: "Rosa", colores: ["#170d14", "#2a1624", "#ff5fa2"] },
    { id: "arena", nombre: "Arena", colores: ["#f4eee1", "#ffffff", "#c0762b"] }
];

/* aplica el tema guardado (si no existe, usa el oscuro) */
function aplicarTema(tema) {
    const cuerpo = document.getElementById("body");
    const elegido = TEMAS.find(t => t.id === tema) || TEMAS[0];

    TEMAS.forEach(t => cuerpo.classList.remove("tema-" + t.id));
    cuerpo.classList.toggle("Bdc", elegido.id === "claro");
    if (elegido.id !== "oscuro" && elegido.id !== "claro") cuerpo.classList.add("tema-" + elegido.id);

    /* la barra del navegador toma el color de fondo del tema */
    document.querySelector('meta[name="theme-color"]').setAttribute("content", elegido.colores[0]);
    pintarTemas(elegido.id);
}

/* botones de tema en ajustes, con una muestra de sus colores */
function pintarTemas(activo) {
    const lista = document.getElementById("ListaTemas");

    lista.replaceChildren(...TEMAS.map(tema => {
        const boton = crear("button", "tema-opcion" + (tema.id === activo ? " activo" : ""));
        const muestra = crear("span", "tema-muestra");

        boton.type = "button";
        tema.colores.forEach(color => {
            const franja = document.createElement("span");
            franja.style.background = color;
            muestra.append(franja);
        });

        boton.append(muestra, document.createTextNode(tema.nombre));
        boton.addEventListener("click", () => ElegirTema(tema.id));
        return boton;
    }));
}

/* cambiar y guardar tema */
function ElegirTema(id) {
    aplicarTema(id);
    localStorage.setItem("temas", id);
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
    if (esMinijuego(apk)) return n + (n === 1 ? " partida" : " partidas");
    return n + (n === 1 ? " visita" : " visitas");
}

/* solo el nombre del contador: descargas, partidas o visitas */
function nombreContador(apk) {
    return formatoContador({ tipo: apk.tipo, categoria: apk.categoria, descargas: 2 }).replace(/^\d+ /, "");
}

/* un archivo html marcado como mini juego */
function esMinijuego(apk) {
    return apk.tipo === "html" && apk.categoria === "minijuego";
}

function nombreTipo(apk) {
    if (apk.tipo === "pagina") return "Página web";
    if (esMinijuego(apk)) return "Mini juego";
    if (apk.tipo === "html") return "Archivo HTML";
    return "App";
}

function emojiTipo(apk) {
    if (apk.tipo === "pagina") return "🌐";
    if (esMinijuego(apk)) return "🎮";
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
    localStorage.setItem("ultimoUsuario", perfil.id);
    cargarPendiente();
    actualizarMenuUsuario();
    InicioBtn();
}

/* nombre y foto abajo del panel lateral */
function actualizarMenuUsuario() {
    if (!usuario) {
        ponerAvatar(document.getElementById("MenuAvatar"), "?", null);
        document.getElementById("MenuNombre").textContent = "sin conexión";
        return;
    }

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

    if (!document.getElementById("AceptoTerminos").checked) {
        alert("Debes aceptar los términos y condiciones para registrarte");
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
    await enviarTiempo();
    await Datos.salir();
    usuario = null;
    localStorage.removeItem("ultimoUsuario");
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
        let visitas = mias.filter(a => a.tipo !== "archivo" && !esMinijuego(a)).reduce((total, a) => total + a.descargas, 0);
        let partidas = mias.filter(esMinijuego).reduce((total, a) => total + a.descargas, 0);
        let votos = mias.reduce((total, a) => total + a.votos, 0);
        let suma = mias.reduce((total, a) => total + a.promedio * a.votos, 0);

        document.getElementById("DatoPublicadas").textContent = mias.length;
        document.getElementById("DatoDescargas").textContent = descargas;
        document.getElementById("DatoVisitas").textContent = visitas;
        document.getElementById("DatoPartidas").textContent = partidas;
        mostrarTiempos();
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
let categoriaPublicacion = "general";
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
    document.getElementById("CampoCategoria").hidden = tipo !== "html";
    document.getElementById("TituloArchivo").textContent = tipo === "html" ? "Archivo HTML" : "Archivo de la apk";

    inpArchivo.accept = tipo === "html" ? ".html,.htm,text/html" : "";
    inpArchivo.value = "";

    actualizarSeleccion();
}

/* un archivo html puede ser una página normal o un mini juego */
function ElegirCategoria(categoria) {
    categoriaPublicacion = categoria;

    document.getElementById("CatGeneral").classList.toggle("activo", categoria === "general");
    document.getElementById("CatMinijuego").classList.toggle("activo", categoria === "minijuego");
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
            categoria: tipoPublicacion === "html" ? categoriaPublicacion : "general",
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
    ElegirCategoria("general");
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
        ["Páginas más visitadas", apksCache.filter(a => a.tipo !== "archivo" && !esMinijuego(a) && a.descargas).sort(masVisitas)],
        ["Mini juegos", apksCache.filter(esMinijuego).sort(masVisitas)],
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
            (filtroTipo === "web" && apk.tipo !== "archivo" && !esMinijuego(apk));

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
    pintarMinijuegos();
}

/* sección de mini juegos */
async function pintarMinijuegos() {
    let lista = document.getElementById("ListaMinijuegos");
    let juegos = apksCache.filter(esMinijuego);

    lista.replaceChildren(...(juegos.length
        ? juegos.map(crearTarjetaApp)
        : [crear("p", "vacio", "Todavía no hay mini juegos. Publica un archivo HTML y elige la categoría “mini juego”.")]));

    /* cuánto llevas jugando */
    if (usuario && pantallaMostrada === "DvMinijuegos") {
        let total = await tiemposActuales();
        document.getElementById("TiempoMinijuegos").textContent = "Llevas " + formatoTiempo(total.minijuegos) + " jugando.";
    }
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

        apkDetalleActual = apk;

        let propia = apk.autorId === usuario.id;
        let conCodigo = apk.tipo === "archivo" && apk.acceso === "codigo";

        let [miVoto, comentarios, descargada, desbloqueo, codigos, guardada] = await Promise.all([
            Datos.miVoto(usuario, id),
            Datos.comentarios(id),
            Datos.yaDescargue(usuario, id),
            conCodigo && !propia ? Datos.estadoDesbloqueo(usuario, id) : null,
            conCodigo && propia ? Datos.codigos(id) : null,
            apk.tipo === "html" ? leerOfflineUno(claveOffline(apk)) : null
        ]);

        pintarDetalle(apk, { miVoto, comentarios, descargada, desbloqueo, codigos, guardada: Boolean(guardada) });
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
        [String(apk.descargas), nombreContador(apk)],
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
        [nombreContador(apk).charAt(0).toUpperCase() + nombreContador(apk).slice(1), String(apk.descargas)],
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

    /* cualquiera puede avisar si algo está mal (menos quien lo publicó) */
    if (!propia) {
        let aviso = crear("div", "panel panel-form");
        aviso.append(
            crear("h3", "", "¿Algo está mal?"),
            crear("p", "nota", "Avísanos si esta publicación es peligrosa, engañosa o rompe las reglas."),
            crearBoton("Reportar publicación", "btn chico", () => ReportarBtn(apk))
        );
        lado.append(aviso);
    }

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
        caja.append(crearBoton(esMinijuego(apk) ? "Jugar" : "Abrir en pantalla completa", "btn azul ancho", () => AbrirVisor(apk)));

        /* el editor solo lo ve quien publicó el archivo */
        if (apk.autorId === usuario.id) {
            caja.append(
                crear("p", "nota", "Solo tú puedes editar este archivo."),
                crearBoton("Editar archivo", "btn chico", () => AbrirEditor(apk))
            );
        }

        if (datos.guardada) {
            caja.append(
                crear("p", "nota", "Guardada en este dispositivo: se abre también sin internet."),
                crearBoton("Quitar del dispositivo", "btn peligro chico", () => QuitarOfflineBtn(apk))
            );
        } else {
            caja.append(
                crear("p", "nota", "Descárgala para abrirla sin internet."),
                crearBoton("Descargar para usar sin internet", "btn chico", () => GuardarOfflineBtn(apk))
            );
        }
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

    /* mientras estás en la otra pestaña se cuenta como tiempo en páginas (aproximado) */
    salidaExterna = Date.now();

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
        /* si elegiste una carpeta, el permiso se pide ya (con el toque del botón) */
        let carpeta = await carpetaConPermiso();
        let enlace = await Datos.archivoUrl(usuario, apk, true);
        let enCarpeta = false;

        if (carpeta) {
            try {
                await escribirEnCarpeta(carpeta, enlace, apk.nombreArchivo || apk.nombre);
                enCarpeta = true;
            } catch (error) {
                console.log("no se pudo usar la carpeta, se descarga normal", error);
            }
        }

        if (!enCarpeta) {
            let a = document.createElement("a");

            a.href = enlace;
            a.download = apk.nombreArchivo;
            document.body.append(a);
            a.click();
            a.remove();
        }

        await Datos.contar(usuario, apk);
        await guardarRegistroApk(apk, Date.now());

        if (enCarpeta) alert("Guardada en la carpeta «" + carpeta.name + "»");
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
    if (evento.key !== "Escape") return;

    /* si los términos están abiertos, Esc solo los cierra */
    if (document.getElementById("Terminos").style.display === "block") {
        cerrarTerminos();
        return;
    }

    CerrarLightbox();

    /* con un juego abierto, Esc pausa o sigue */
    if (pantallaMostrada === "DvVisor") AlternarPausa();
});


//////////////////////////////
//Guardar para usar sin internet
//////////////////////////////

/* base aparte, solo en este dispositivo: guarda el texto de cada html descargado */
function abrirOffline() {
    return new Promise((resolve, reject) => {
        const pedido = indexedDB.open("pkview-offline", 2);

        pedido.onupgradeneeded = () => {
            const db = pedido.result;
            if (!db.objectStoreNames.contains("paginas")) db.createObjectStore("paginas", { keyPath: "clave" });
            if (!db.objectStoreNames.contains("ajustes")) db.createObjectStore("ajustes", { keyPath: "clave" });
        };
        pedido.onsuccess = () => resolve(pedido.result);
        pedido.onerror = () => reject(pedido.error);
    });
}

async function operacionOffline(modo, accion, tienda = "paginas") {
    const db = await abrirOffline();

    return new Promise((resolve, reject) => {
        const tx = db.transaction(tienda, modo);
        const pedido = accion(tx.objectStore(tienda));

        tx.oncomplete = () => { db.close(); resolve(pedido ? pedido.result : undefined); };
        tx.onerror = tx.onabort = () => { db.close(); reject(tx.error); };
    });
}

const guardarOffline = item => operacionOffline("readwrite", tienda => tienda.put(item));
const leerOffline = () => operacionOffline("readonly", tienda => tienda.getAll());
const leerOfflineUno = clave => operacionOffline("readonly", tienda => tienda.get(clave));
const borrarOffline = clave => operacionOffline("readwrite", tienda => tienda.delete(clave));

function claveOffline(apk) {
    return Datos.modo + ":" + apk.id;
}

/* descarga el html y lo deja en el dispositivo */
async function GuardarOfflineBtn(apk) {
    try {
        let html = await Datos.htmlTexto(apk);

        await guardarOffline({
            clave: claveOffline(apk),
            nombre: apk.nombre,
            autor: apk.autor,
            categoria: apk.categoria,
            html: html,
            guardadoEn: Date.now()
        });

        /* pide al navegador no borrar lo guardado cuando falte espacio */
        if (navigator.storage && navigator.storage.persist) navigator.storage.persist();

        await refrescarDetalle(apk.id);
    } catch (error) {
        alert("No se pudo descargar: " + error.message);
    }
}

async function QuitarOfflineBtn(apk) {
    if (!confirm("¿Quitar esta página del dispositivo? Ya no se abrirá sin internet.")) return;

    await borrarOffline(claveOffline(apk));
    await refrescarDetalle(apk.id);
}

/* las apks no se guardan aquí (el archivo queda en las descargas del teléfono): solo se anota que las descargaste */
async function guardarRegistroApk(apk, fecha) {
    await guardarOffline({
        clave: claveOffline(apk),
        tipo: "archivo",
        apkId: apk.id,
        nombre: apk.nombre,
        autor: apk.autor,
        usuarioId: usuario.id,
        guardadoEn: fecha
    });
}

/* con internet: agrega a la lista las apks que descargaste antes de esta función */
async function sincronizarApksDescargadas() {
    try {
        let [ids, apks, guardados] = await Promise.all([
            Datos.misDescargas(usuario),
            Datos.listarApks(),
            leerOffline()
        ]);

        apksCache = apks;

        for (let id of ids) {
            let apk = apks.find(a => a.id === id && a.tipo === "archivo");

            if (apk && !guardados.some(g => g.clave === claveOffline(apk))) {
                await guardarRegistroApk(apk, null);
            }
        }
    } catch (error) {
        console.log("no se pudieron revisar las descargas", error);
    }
}

/* fila de una página html guardada: se abre sin internet */
function crearFilaGuardada(item) {
    let fila = crear("div", "guardado");
    let texto = crear("div", "guardado-texto");
    let botones = crear("div", "guardado-botones");

    texto.append(
        crear("strong", "", item.nombre),
        crear("small", "", "de " + item.autor + ", guardada el " + formatoFecha(item.guardadoEn))
    );

    botones.append(
        crearBoton("Abrir", "btn azul chico", () => AbrirVisorGuardado(item)),
        crearBoton("Quitar", "btn peligro chico", async () => {
            if (!confirm("¿Quitar esta página del dispositivo?")) return;
            await borrarOffline(item.clave);
            mostrarDescargas();
        })
    );

    fila.append(crear("div", "guardado-icono", "📄"), texto, botones);
    return fila;
}

/* fila de una apk descargada: necesita internet para abrirse */
function crearFilaApk(item) {
    let fila = crear("div", "guardado");
    let texto = crear("div", "guardado-texto");
    let botones = crear("div", "guardado-botones");
    let sinRed = !navigator.onLine;
    let abrirBtn = crearBoton(sinRed ? "Sin internet" : "Abrir", "btn azul chico", () => abrirApkGuardada(item));

    abrirBtn.disabled = sinRed;

    texto.append(
        crear("strong", "", item.nombre),
        crear("small", "", "de " + item.autor + (item.guardadoEn ? ", descargada el " + formatoFecha(item.guardadoEn) : ", descargada")),
        crear("small", "", "necesita internet para abrirse")
    );

    botones.append(
        abrirBtn,
        crearBoton("Quitar de la lista", "btn chico", async () => {
            /* queda marcada como oculta para que no vuelva a aparecer sola */
            item.oculto = true;
            await guardarOffline(item);
            mostrarDescargas();
        })
    );

    fila.append(crear("div", "guardado-icono", "📦"), texto, botones);
    return fila;
}

/* abre el archivo de una apk descargada (hace falta internet) */
async function abrirApkGuardada(item) {
    let apk = apksCache.find(a => a.id === item.apkId);

    try {
        if (!apk) {
            apksCache = await Datos.listarApks();
            apk = apksCache.find(a => a.id === item.apkId);
        }

        if (!apk) {
            alert("Esta aplicación ya no está disponible");
            return;
        }

        await abrirArchivo(apk);
    } catch (error) {
        alert(error.message);
    }
}

/* lista de lo guardado: páginas html (sin internet) y apks descargadas (con internet) */
async function mostrarDescargas() {
    let lista = document.getElementById("ListaDescargas");
    let guardados = [];

    if (navigator.onLine && usuario) await sincronizarApksDescargadas();

    try {
        guardados = await leerOffline();
    } catch (error) {
        console.log("no se pudo leer lo guardado", error);
    }

    let dueno = usuario ? usuario.id : localStorage.getItem("ultimoUsuario");
    let paginas = guardados.filter(i => i.tipo !== "archivo").sort((a, b) => b.guardadoEn - a.guardadoEn);
    let apks = guardados.filter(i => i.tipo === "archivo" && i.usuarioId === dueno && !i.oculto)
        .sort((a, b) => (b.guardadoEn || 0) - (a.guardadoEn || 0));

    lista.replaceChildren(
        crear("h2", "seccion", "Páginas HTML (sin internet)"),
        ...(paginas.length
            ? paginas.map(crearFilaGuardada)
            : [crear("p", "nota", "Todavía no guardaste ninguna. Abre un archivo HTML y toca “Descargar para usar sin internet”.")]),
        crear("h2", "seccion", "Apps descargadas"),
        ...(apks.length
            ? apks.map(crearFilaApk)
            : [crear("p", "nota", "Cuando descargues una apk aparecerá aquí.")])
    );
}


//////////////////////////////
//Visualizador de archivos html (pantalla completa, con pausa)
//////////////////////////////
let apkVisor = null;
let origenVisor = "detalle";
let visorPausado = false;
let segundosPartida = 0;
let htmlVisor = "";

/* Este código se copia dentro de cada página html que se abre en el visor.
   1) Si el navegador no deja usar localStorage en el marco aislado, le da uno temporal.
   2) Permite pausar: congela relojes, animaciones, temporizadores, sonidos y videos.
   Se escribe como función para que el navegador revise su sintaxis; luego se convierte a texto. */
function arregloPagina() {
    try {
        try {
            window.localStorage;
        } catch (e) {
            var datos = {};
            var almacen = {
                getItem: function (k) { return k in datos ? datos[k] : null; },
                setItem: function (k, v) { datos[k] = String(v); },
                removeItem: function (k) { delete datos[k]; },
                clear: function () { datos = {}; },
                key: function (i) { return Object.keys(datos)[i] || null; },
                get length() { return Object.keys(datos).length; }
            };
            ["localStorage", "sessionStorage"].forEach(function (n) {
                try { Object.defineProperty(window, n, { value: almacen, configurable: true }); } catch (x) {}
            });
        }

        var pausado = false;
        var tPausa = 0, pPausa = 0, desfase = 0, pDesfase = 0;
        var ahoraReal = Date.now.bind(Date);
        var perfReal = performance.now.bind(performance);
        var rafReal = window.requestAnimationFrame.bind(window);
        var timeoutReal = window.setTimeout.bind(window);
        var intervalReal = window.setInterval.bind(window);
        var colaRaf = [], colaTimeout = [], medios = [], detenidos = [], contextos = [], suspendidos = [];

        /* el reloj de la página no avanza mientras está en pausa */
        Date.now = function () { return (pausado ? tPausa : ahoraReal()) - desfase; };
        performance.now = function () { return (pausado ? pPausa : perfReal()) - pDesfase; };

        window.requestAnimationFrame = function (cb) {
            return rafReal(function (t) {
                if (pausado) { colaRaf.push(cb); return; }
                cb(t - pDesfase);
            });
        };

        window.setTimeout = function (fn, ms) {
            var args = Array.prototype.slice.call(arguments, 2);
            if (typeof fn !== "function") return timeoutReal.apply(window, arguments);
            return timeoutReal(function () {
                if (pausado) { colaTimeout.push(function () { fn.apply(window, args); }); return; }
                fn.apply(window, args);
            }, ms);
        };

        window.setInterval = function (fn, ms) {
            var args = Array.prototype.slice.call(arguments, 2);
            if (typeof fn !== "function") return intervalReal.apply(window, arguments);
            return intervalReal(function () { if (!pausado) fn.apply(window, args); }, ms);
        };

        /* sonidos y videos */
        var reproducir = HTMLMediaElement.prototype.play;
        HTMLMediaElement.prototype.play = function () {
            if (pausado) return Promise.resolve();
            if (medios.indexOf(this) < 0) medios.push(this);
            return reproducir.apply(this, arguments);
        };

        var Contexto = window.AudioContext || window.webkitAudioContext;
        if (Contexto) {
            var Envuelto = function () {
                var c = new (Function.prototype.bind.apply(Contexto, [null].concat(Array.prototype.slice.call(arguments))))();
                contextos.push(c);
                return c;
            };
            Envuelto.prototype = Contexto.prototype;
            window.AudioContext = Envuelto;
            window.webkitAudioContext = Envuelto;
        }

        function pausar() {
            if (pausado) return;
            pausado = true;
            tPausa = ahoraReal();
            pPausa = perfReal();

            medios.forEach(function (m) { if (!m.paused) { m.pause(); detenidos.push(m); } });
            contextos.forEach(function (c) {
                if (c.state === "running" && c.suspend) { c.suspend(); suspendidos.push(c); }
            });

            var estilo = document.createElement("style");
            estilo.id = "pk-pausa";
            estilo.textContent = "*{animation-play-state:paused!important;transition:none!important}";
            (document.head || document.documentElement).appendChild(estilo);
        }

        function seguir() {
            if (!pausado) return;
            desfase += ahoraReal() - tPausa;
            pDesfase += perfReal() - pPausa;
            pausado = false;

            var estilo = document.getElementById("pk-pausa");
            if (estilo) estilo.remove();

            detenidos.splice(0).forEach(function (m) { var p = m.play(); if (p && p.catch) p.catch(function () {}); });
            suspendidos.splice(0).forEach(function (c) { c.resume(); });
            colaRaf.splice(0).forEach(function (cb) { window.requestAnimationFrame(cb); });
            colaTimeout.splice(0).forEach(function (fn) { timeoutReal(fn, 0); });
        }

        window.addEventListener("message", function (evento) {
            if (!evento.data || typeof evento.data.pkPausa !== "boolean") return;
            if (evento.data.pkPausa) pausar(); else seguir();
        });
    } catch (error) {
        /* si algo falla, la página sigue funcionando sin pausa */
    }
}

const ARREGLO_PAGINA = "<script>(" + arregloPagina.toString() + ")();<\/script>";

function prepararHtml(html) {
    if (/<head[^>]*>/i.test(html)) return html.replace(/<head[^>]*>/i, m => m + ARREGLO_PAGINA);
    if (/<html[^>]*>/i.test(html)) return html.replace(/<html[^>]*>/i, m => m + ARREGLO_PAGINA);
    return ARREGLO_PAGINA + html;
}

/* pantalla completa del dispositivo (algunos navegadores no la permiten: igual se ve a todo el ancho) */
function pedirPantallaCompleta(forzar) {
    let raiz = document.documentElement;

    /* el ajuste "abrir en pantalla completa" solo cuenta cuando se abre solo, no cuando tocas el botón */
    if (!forzar && !ajustes.pantallaCompleta) return;

    if (!document.fullscreenElement && raiz.requestFullscreen) {
        raiz.requestFullscreen().catch(() => console.log("sin pantalla completa"));
    }
}

function AlternarPantallaCompleta() {
    if (document.fullscreenElement) document.exitFullscreen();
    else pedirPantallaCompleta(true);
}

/* reloj de la partida (no avanza en pausa) */
function actualizarRelojPartida() {
    let minutos = Math.floor(segundosPartida / 60);
    let segundos = String(segundosPartida % 60).padStart(2, "0");

    document.getElementById("VisorTiempo").textContent = minutos + ":" + segundos;
}

/* manda la orden de pausa o de seguir al juego */
function mandarPausa(valor) {
    let ventana = document.getElementById("VisorMarco").contentWindow;

    if (ventana) ventana.postMessage({ pkPausa: valor }, "*");
}

function pausarVisor() {
    if (visorPausado) return;

    visorPausado = true;
    mandarPausa(true);
    document.getElementById("VisorPausa").hidden = false;
    document.getElementById("BtnPausa").textContent = "▶ Seguir";
}

function seguirVisor() {
    visorPausado = false;
    mandarPausa(false);
    document.getElementById("VisorPausa").hidden = true;
    document.getElementById("BtnPausa").textContent = "⏸ Pausa";
}

function AlternarPausa() {
    if (visorPausado) seguirVisor();
    else pausarVisor();
}

/* empieza de nuevo: vuelve a cargar la página y el reloj en cero */
function ReiniciarVisor() {
    segundosPartida = 0;
    actualizarRelojPartida();
    seguirVisor();
    document.getElementById("VisorMarco").srcdoc = "";
    setTimeout(() => { document.getElementById("VisorMarco").srcdoc = prepararHtml(htmlVisor); }, 50);
}

function mostrarVisor(titulo, html) {
    htmlVisor = html;
    segundosPartida = 0;
    actualizarRelojPartida();
    seguirVisor();

    document.getElementById("VisorTitulo").textContent = titulo;
    document.getElementById("VisorMarco").srcdoc = prepararHtml(html);
}

/* desde el detalle: usa la copia guardada si existe; si no, la descarga ahora */
async function AbrirVisor(apk) {
    /* debe ir antes de cualquier espera para que el navegador lo permita */
    pedirPantallaCompleta();

    apkVisor = apk;
    origenVisor = "detalle";
    ir("DvVisor");
    document.body.style.overflow = "hidden";
    mostrarVisor(apk.nombre, "<p style='font-family:sans-serif'>cargando...</p>");

    try {
        let guardada = await leerOfflineUno(claveOffline(apk));
        let html;

        /* con internet se muestra la versión más nueva (y se actualiza la copia guardada) */
        if (navigator.onLine) {
            try {
                html = await Datos.htmlTexto(apk);
                if (guardada) await guardarOffline(Object.assign({}, guardada, { html: html }));
            } catch (error) {
                console.log("se usa la copia guardada", error);
            }
        }

        if (html === undefined && guardada) html = guardada.html;
        if (html === undefined) throw new Error("No se pudo cargar el archivo");

        mostrarVisor(apk.nombre, html);

        /* cuenta la visita (o la partida) solo si hay internet */
        try {
            await Datos.contar(usuario, apk);
        } catch (error) {
            console.log("no se contó la visita", error);
        }
    } catch (error) {
        alert(error.message);
        CerrarVisor();
    }
}

/* desde Descargas: no necesita internet ni cuenta */
function AbrirVisorGuardado(item) {
    pedirPantallaCompleta();

    apkVisor = { id: item.apkId, tipo: "html", categoria: item.categoria || "general" };
    origenVisor = "descargas";
    ir("DvVisor");
    document.body.style.overflow = "hidden";
    mostrarVisor(item.nombre, item.html);
}

function CerrarVisor() {
    seguirVisor();
    document.getElementById("VisorMarco").srcdoc = "";
    document.body.style.overflow = "";

    if (document.fullscreenElement) document.exitFullscreen();

    if (origenVisor === "descargas") {
        ir("DvDescargas");
        mostrarDescargas();
    } else {
        abrirDetalle(apkVisor.id);
    }
}


//////////////////////////////
//Tiempo de uso (apks, páginas y mini juegos)
//////////////////////////////
const CATEGORIAS_TIEMPO = ["apks", "paginas", "minijuegos"];

let tiempoPendiente = { apks: 0, paginas: 0, minijuegos: 0 };
let apkDetalleActual = null;
let salidaExterna = null;

/* segundos 1 a 1 de cada sección; los que no se pudieron enviar quedan guardados en el dispositivo */
function categoriaDe(apk) {
    if (!apk) return null;
    if (apk.tipo === "archivo") return "apks";
    return esMinijuego(apk) ? "minijuegos" : "paginas";
}

/* en qué sección estás ahora (null = no cuenta) */
function categoriaDeUso() {
    switch (pantallaMostrada) {
        case "DvApk": return filtroTipo === "archivo" ? "apks" : (filtroTipo === "web" ? "paginas" : null);
        case "DvMinijuegos": return "minijuegos";
        case "DvDetalle": return categoriaDe(apkDetalleActual);
        case "DvVisor": return visorPausado ? null : categoriaDe(apkVisor);
        default: return null;
    }
}

function duenoTiempo() {
    return usuario ? usuario.id : localStorage.getItem("ultimoUsuario");
}

function formatoTiempo(segundos) {
    if (segundos < 60) return segundos + " s";

    let minutos = Math.floor(segundos / 60);
    if (minutos < 60) return minutos + " min";

    return Math.floor(minutos / 60) + " h " + (minutos % 60) + " min";
}

function guardarPendiente() {
    let dueno = duenoTiempo();
    if (dueno) localStorage.setItem("tiempoPendiente:" + dueno, JSON.stringify(tiempoPendiente));
}

/* recupera lo que quedó sin enviar la última vez */
function cargarPendiente() {
    let dueno = duenoTiempo();
    if (!dueno) return;

    let guardado = JSON.parse(localStorage.getItem("tiempoPendiente:" + dueno) || "{}");
    CATEGORIAS_TIEMPO.forEach(c => { tiempoPendiente[c] = Math.max(tiempoPendiente[c], guardado[c] || 0); });
}

/* envía los segundos acumulados (de a 10 minutos como máximo por vez) */
async function enviarTiempo() {
    if (!usuario || !navigator.onLine) return;

    for (let categoria of CATEGORIAS_TIEMPO) {
        while (tiempoPendiente[categoria] > 0) {
            let segundos = Math.min(tiempoPendiente[categoria], 600);

            tiempoPendiente[categoria] -= segundos;

            try {
                await Datos.sumarTiempo(usuario, categoria, segundos);
            } catch (error) {
                tiempoPendiente[categoria] += segundos;
                guardarPendiente();
                return;
            }
        }
    }

    guardarPendiente();
}

/* lo guardado + lo que todavía no se envió */
async function tiemposActuales() {
    let total = { apks: 0, paginas: 0, minijuegos: 0 };

    try {
        total = await Datos.misTiempos(usuario);
    } catch (error) {
        console.log("no se pudo leer el tiempo", error);
    }

    CATEGORIAS_TIEMPO.forEach(c => { total[c] += tiempoPendiente[c]; });
    return total;
}

async function mostrarTiempos() {
    let total = await tiemposActuales();

    document.getElementById("TiempoApks").textContent = formatoTiempo(total.apks);
    document.getElementById("TiempoPaginas").textContent = formatoTiempo(total.paginas);
    document.getElementById("TiempoJuegos").textContent = formatoTiempo(total.minijuegos);
}

let segundosSinEnviar = 0;

setInterval(() => {
    if (document.hidden) return;

    /* el reloj de la partida solo avanza si el juego no está en pausa */
    if (pantallaMostrada === "DvVisor" && !visorPausado) {
        segundosPartida++;
        actualizarRelojPartida();
    }

    let categoria = categoriaDeUso();
    if (!categoria || !duenoTiempo()) return;

    tiempoPendiente[categoria]++;
    segundosSinEnviar++;

    if (segundosSinEnviar >= 30) {
        segundosSinEnviar = 0;
        guardarPendiente();
        enviarTiempo();
    }
}, 1000);

document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
        /* si sales de la pestaña con un juego abierto, se pausa solo */
        if (pantallaMostrada === "DvVisor" && ajustes.pausaAutomatica) pausarVisor();

        guardarPendiente();
        enviarTiempo();
        return;
    }

    /* volviste de una página externa: ese rato cuenta como tiempo en páginas */
    if (salidaExterna) {
        let segundos = Math.min(Math.round((Date.now() - salidaExterna) / 1000), 7200);

        salidaExterna = null;
        if (duenoTiempo() && segundos > 0) tiempoPendiente.paginas += segundos;
    }
});

window.addEventListener("pagehide", guardarPendiente);


//////////////////////////////
//Carpeta de descargas (ajustes)
//////////////////////////////

/* solo algunos navegadores (Chrome y Edge de computadora) dejan elegir una carpeta */
const soportaCarpeta = typeof window.showDirectoryPicker === "function";

const guardarCarpeta = manija => operacionOffline("readwrite", tienda => tienda.put({ clave: "carpeta", manija: manija }), "ajustes");
const borrarCarpeta = () => operacionOffline("readwrite", tienda => tienda.delete("carpeta"), "ajustes");

async function leerCarpeta() {
    if (!soportaCarpeta) return null;

    try {
        let registro = await operacionOffline("readonly", tienda => tienda.get("carpeta"), "ajustes");
        return registro ? registro.manija : null;
    } catch (error) {
        return null;
    }
}

/* devuelve la carpeta elegida si el navegador da permiso para escribir en ella */
async function carpetaConPermiso() {
    let carpeta = await leerCarpeta();
    if (!carpeta) return null;

    try {
        let opciones = { mode: "readwrite" };

        if (await carpeta.queryPermission(opciones) === "granted") return carpeta;
        if (await carpeta.requestPermission(opciones) === "granted") return carpeta;
    } catch (error) {
        console.log("sin permiso para la carpeta", error);
    }
    return null;
}

/* baja el archivo y lo escribe dentro de la carpeta elegida */
async function escribirEnCarpeta(carpeta, enlace, nombre) {
    let respuesta = await fetch(enlace);
    if (!respuesta.ok) throw new Error("No se pudo descargar el archivo");

    let archivo = await carpeta.getFileHandle(nombre.replace(/[\\/:*?"<>|]/g, "_"), { create: true });
    let escritor = await archivo.createWritable();

    await escritor.write(await respuesta.blob());
    await escritor.close();
}

async function mostrarCarpeta() {
    let carpeta = await leerCarpeta();

    document.getElementById("CarpetaNombre").textContent = !soportaCarpeta
        ? "carpeta del navegador"
        : (carpeta ? carpeta.name : "ninguna elegida (carpeta del navegador)");

    document.getElementById("BtnCarpeta").disabled = !soportaCarpeta;
    document.getElementById("BtnCarpeta").textContent = carpeta ? "cambiar" : "elegir";
    document.getElementById("BtnQuitarCarpeta").hidden = !carpeta;

    document.getElementById("NotaCarpeta").textContent = soportaCarpeta
        ? "Las apks se guardarán en la carpeta que elijas. El navegador te pedirá permiso."
        : "Este navegador no deja elegir carpeta. Las descargas van a la carpeta que tenga configurada el navegador " +
          "(en Chrome para Android: Ajustes, Descargas, Ubicación de descarga, si tu versión lo trae).";
}

async function ElegirCarpetaBtn() {
    try {
        let carpeta = await window.showDirectoryPicker({ mode: "readwrite" });

        await guardarCarpeta(carpeta);
        mostrarCarpeta();
    } catch (error) {
        /* si cerraste el selector no pasa nada */
        if (error.name !== "AbortError") alert("No se pudo elegir la carpeta: " + error.message);
    }
}

async function QuitarCarpetaBtn() {
    await borrarCarpeta();
    mostrarCarpeta();
}


//////////////////////////////
//Editor de archivos html (solo quien publicó)
//////////////////////////////
let apkEditor = null;
let textoGuardado = "";
let temporizadorVista = null;

let cajaEditor = document.getElementById("EditorCodigo");

function editorSinGuardar() {
    return cajaEditor.value !== textoGuardado;
}

function actualizarEstadoEditor() {
    let bytes = new Blob([cajaEditor.value]).size;

    document.getElementById("EditorEstado").textContent =
        (editorSinGuardar() ? "sin guardar" : "guardado") + ", " + Math.ceil(bytes / 1024) + " KB";
}

function dibujarVistaEditor() {
    document.getElementById("EditorVista").srcdoc = prepararHtml(cajaEditor.value);
}

/* en pantallas chicas: cambia entre código y vista previa */
function EditorPestana(pestana) {
    let vista = pestana === "vista";

    document.getElementById("EditorZona").classList.toggle("ver-vista", vista);
    document.getElementById("PestCodigo").classList.toggle("activo", !vista);
    document.getElementById("PestVista").classList.toggle("activo", vista);

    if (vista) dibujarVistaEditor();
}

/* solo se abre si eres quien publicó el archivo */
async function AbrirEditor(apk) {
    if (apk.autorId !== usuario.id) {
        alert("Solo quien publicó puede editar este archivo");
        return;
    }

    apkEditor = apk;
    ir("DvEditor");
    document.getElementById("EditorTitulo").textContent = apk.nombre;
    cajaEditor.value = "cargando...";
    cajaEditor.disabled = true;

    try {
        textoGuardado = await Datos.htmlTexto(apk);
    } catch (error) {
        alert(error.message);
        cajaEditor.disabled = false;
        abrirDetalle(apk.id);
        return;
    }

    cajaEditor.disabled = false;
    cajaEditor.value = textoGuardado;
    EditorPestana("codigo");
    dibujarVistaEditor();
    actualizarEstadoEditor();
}

cajaEditor.addEventListener("input", () => {
    actualizarEstadoEditor();

    /* la vista previa se actualiza sola, sin saltos mientras escribes */
    clearTimeout(temporizadorVista);
    temporizadorVista = setTimeout(dibujarVistaEditor, 500);
});

cajaEditor.addEventListener("keydown", evento => {
    /* Tab escribe dos espacios en vez de saltar a otro botón */
    if (evento.key === "Tab" && !evento.shiftKey) {
        evento.preventDefault();
        cajaEditor.setRangeText("  ", cajaEditor.selectionStart, cajaEditor.selectionEnd, "end");
        cajaEditor.dispatchEvent(new Event("input"));
    }

    if ((evento.ctrlKey || evento.metaKey) && evento.key.toLowerCase() === "s") {
        evento.preventDefault();
        EditorGuardarBtn();
    }
});

/* cargar el contenido de un archivo de tu dispositivo dentro del editor */
document.getElementById("EditorArchivo").addEventListener("change", async function () {
    let archivo = this.files[0];
    this.value = "";

    if (!archivo) return;

    if (archivo.size > MAX_HTML) {
        alert("El archivo html pesa más de 2 MB");
        return;
    }

    cajaEditor.value = await archivo.text();
    actualizarEstadoEditor();
    dibujarVistaEditor();
});

async function EditorGuardarBtn() {
    let boton = document.getElementById("BtnEditorGuardar");
    let texto = cajaEditor.value;

    if (!texto.trim()) {
        alert("El archivo no puede quedar vacío");
        return;
    }

    if (new Blob([texto]).size > MAX_HTML) {
        alert("El archivo html pesa más de 2 MB");
        return;
    }

    boton.disabled = true;

    try {
        await Datos.actualizarHtml(usuario, apkEditor, texto);
        textoGuardado = texto;

        /* si lo tienes guardado para usar sin internet, esa copia también se actualiza */
        let copia = await leerOfflineUno(claveOffline(apkEditor));
        if (copia) await guardarOffline(Object.assign({}, copia, { html: texto }));

        actualizarEstadoEditor();
    } catch (error) {
        alert("No se pudo guardar: " + error.message);
    }

    boton.disabled = false;
}

function CerrarEditor() {
    if (editorSinGuardar() && !confirm("Tienes cambios sin guardar. ¿Salir sin guardarlos?")) return;

    textoGuardado = cajaEditor.value;
    document.getElementById("EditorVista").srcdoc = "";
    abrirDetalle(apkEditor.id);
}

/* avisa si cierras la pestaña con cambios sin guardar */
window.addEventListener("beforeunload", evento => {
    if (document.getElementById("DvEditor").style.display === "block" && editorSinGuardar()) {
        evento.preventDefault();
        evento.returnValue = "";
    }
});


//////////////////////////////
//Seguridad de la cuenta
//////////////////////////////

/* devuelve el problema de la contraseña nueva, o null si está bien */
function problemaClaveNueva(nueva, repetida) {
    if (nueva.length < 8) return "La contraseña nueva debe tener al menos 8 caracteres";
    if (nueva !== repetida) return "Las contraseñas nuevas no coinciden";
    return null;
}

/* en modo local no hay correo: el código aparece en pantalla (solo para probar) */
function avisarCodigoLocal(respuesta) {
    if (respuesta && respuesta.demo) alert("Modo sin correo: tu código es " + respuesta.demo);
}

function valorDe(id) {
    return document.getElementById(id).value;
}

/* ---------- recuperar desde el login ---------- */
async function RecuperarEnviarBtn() {
    let correo = valorDe("RecEmail").trim();

    if (!correo) {
        alert("Escribe tu correo");
        return;
    }

    try {
        avisarCodigoLocal(await Datos.pedirCodigoRecuperacion(correo));

        document.getElementById("RecAviso").textContent =
            "Si el correo está registrado, te enviamos un código. Revisa también la carpeta de spam.";
        document.getElementById("RecPaso1").hidden = true;
        document.getElementById("RecPaso2").hidden = false;
    } catch (error) {
        alert(error.message);
    }
}

async function RecuperarCambiarBtn() {
    let correo = valorDe("RecEmail").trim();
    let codigo = valorDe("RecCodigo").trim();
    let clave = valorDe("RecClave");
    let problema = problemaClaveNueva(clave, valorDe("RecClave2"));
    let boton = document.getElementById("BtnRecCambiar");

    if (!codigo) {
        alert("Escribe el código que te llegó al correo");
        return;
    }

    if (problema) {
        alert(problema);
        return;
    }

    boton.disabled = true;

    try {
        let perfil = await Datos.recuperarConCodigo(correo, codigo, clave);

        alert("Contraseña cambiada. Ya entraste a tu cuenta.");
        iniciarSesion(perfil);
    } catch (error) {
        alert(error.message);
    }

    boton.disabled = false;
}

/* ---------- cambiar la contraseña desde Mi cuenta ---------- */
let modoClave = "actual";
let correoPendiente = null;

/* con la contraseña actual o con un código enviado al correo */
function ElegirModoClave(modo) {
    modoClave = modo;

    document.getElementById("ClaveModoActual").classList.toggle("activo", modo === "actual");
    document.getElementById("ClaveModoCodigo").classList.toggle("activo", modo === "codigo");
    document.getElementById("CampoClaveActual").hidden = modo !== "actual";
    document.getElementById("CampoClaveCodigo").hidden = modo !== "codigo";
}

/* deja los campos de seguridad vacíos cada vez que abres Mi cuenta */
function reiniciarSeguridad() {
    ["ClaveActual", "ClaveCodigo", "ClaveNueva", "ClaveNueva2", "CorreoNuevo", "ClaveParaCorreo", "CodigoCorreo"]
        .forEach(id => { document.getElementById(id).value = ""; });

    ElegirModoClave("actual");
    CancelarCorreoBtn();
}

async function EnviarCodigoClaveBtn() {
    try {
        avisarCodigoLocal(await Datos.pedirCodigoRecuperacion(usuario.email));
        alert("Te enviamos un código a " + usuario.email);
    } catch (error) {
        alert(error.message);
    }
}

async function CambiarClaveBtn() {
    let nueva = valorDe("ClaveNueva");
    let problema = problemaClaveNueva(nueva, valorDe("ClaveNueva2"));
    let boton = document.getElementById("BtnCambiarClave");

    if (modoClave === "actual" && !valorDe("ClaveActual")) {
        alert("Escribe tu contraseña actual");
        return;
    }

    if (modoClave === "codigo" && !valorDe("ClaveCodigo").trim()) {
        alert("Escribe el código que te llegó al correo");
        return;
    }

    if (problema) {
        alert(problema);
        return;
    }

    boton.disabled = true;

    try {
        if (modoClave === "actual") {
            await Datos.cambiarClave(usuario, valorDe("ClaveActual"), nueva);
        } else {
            usuario = await Datos.recuperarConCodigo(usuario.email, valorDe("ClaveCodigo"), nueva);
        }

        alert("Contraseña cambiada");
        reiniciarSeguridad();
    } catch (error) {
        alert(error.message);
    }

    boton.disabled = false;
}

/* ---------- cambiar el correo ---------- */
async function EnviarCodigoCorreoBtn() {
    let nuevo = valorDe("CorreoNuevo").trim();
    let clave = valorDe("ClaveParaCorreo");
    let boton = document.getElementById("BtnEnviarCorreo");

    if (!nuevo || !clave) {
        alert("Escribe el correo nuevo y tu contraseña actual");
        return;
    }

    if (nuevo.toLowerCase() === usuario.email.toLowerCase()) {
        alert("Ese ya es tu correo");
        return;
    }

    boton.disabled = true;

    try {
        avisarCodigoLocal(await Datos.cambiarCorreo(usuario, clave, nuevo));

        correoPendiente = nuevo;
        document.getElementById("CorreoAviso").textContent = "Te enviamos un código a " + nuevo + ". Escríbelo para confirmar.";
        document.getElementById("CorreoPaso1").hidden = true;
        document.getElementById("CorreoPaso2").hidden = false;
        document.getElementById("ClaveParaCorreo").value = "";
    } catch (error) {
        alert(error.message);
    }

    boton.disabled = false;
}

async function ConfirmarCorreoBtn() {
    let codigo = valorDe("CodigoCorreo").trim();

    if (!codigo) {
        alert("Escribe el código que te llegó al correo nuevo");
        return;
    }

    try {
        usuario = await Datos.confirmarCorreo(usuario, correoPendiente, codigo);

        actualizarMenuUsuario();
        alert("Correo cambiado. Ahora entras con " + usuario.email);
        reiniciarSeguridad();
        mostrarSegCorreo();
    } catch (error) {
        alert(error.message);
    }
}

function CancelarCorreoBtn() {
    correoPendiente = null;
    document.getElementById("CodigoCorreo").value = "";
    document.getElementById("CorreoPaso1").hidden = false;
    document.getElementById("CorreoPaso2").hidden = true;
}


//////////////////////////////
//Términos y condiciones
//////////////////////////////
function abrirTerminos() {
    document.getElementById("TerminosContenido").scrollTop = 0;
    abrir("TerminosFondo");
    abrir("Terminos");
}

function cerrarTerminos() {
    cerrar("Terminos");
    cerrar("TerminosFondo");
}


//////////////////////////////
//Ajustes
//////////////////////////////
const AJUSTES_BASE = { texto: "normal", sinAnimaciones: false, pausaAutomatica: true, pantallaCompleta: true };

let ajustes = Object.assign({}, AJUSTES_BASE, JSON.parse(localStorage.getItem("ajustes") || "{}"));

function guardarAjustes() {
    localStorage.setItem("ajustes", JSON.stringify(ajustes));
}

/* pone en pantalla lo que dicen los ajustes */
function aplicarAjustes() {
    let cuerpo = document.getElementById("body");
    let zoom = { pequeno: "0.9", normal: "1", grande: "1.15" }[ajustes.texto] || "1";

    cuerpo.style.zoom = zoom;
    cuerpo.classList.toggle("sin-animaciones", ajustes.sinAnimaciones);

    [["SwSinAnimaciones", "sinAnimaciones"], ["SwPausaAuto", "pausaAutomatica"], ["SwPantallaCompleta", "pantallaCompleta"]]
        .forEach(([id, clave]) => document.getElementById(id).setAttribute("aria-checked", String(ajustes[clave])));

    ["pequeno", "normal", "grande"].forEach(tamano => {
        let id = "Texto" + tamano.charAt(0).toUpperCase() + tamano.slice(1);
        document.getElementById(id).classList.toggle("activo", ajustes.texto === tamano);
    });
}

function AlternarAjuste(clave) {
    ajustes[clave] = !ajustes[clave];
    guardarAjustes();
    aplicarAjustes();
}

function ElegirTexto(tamano) {
    ajustes.texto = tamano;
    guardarAjustes();
    aplicarAjustes();
}

/* cuánto espacio usa PkStore en este dispositivo */
async function mostrarAlmacenamiento() {
    let texto = document.getElementById("AlmacenUso");

    if (!(navigator.storage && navigator.storage.estimate)) {
        texto.textContent = "tu navegador no lo informa";
        return;
    }

    let { usage, quota } = await navigator.storage.estimate();
    let mb = numero => (numero / 1048576).toFixed(1) + " MB";

    texto.textContent = mb(usage || 0) + " usados de " + mb(quota || 0);
}

/* borra las páginas html guardadas para usar sin internet (la lista de apks se queda) */
async function BorrarCopiasBtn() {
    if (!confirm("¿Borrar las páginas guardadas para usar sin internet? Podrás descargarlas otra vez.")) return;

    let guardados = await leerOffline();

    for (let item of guardados.filter(i => i.tipo !== "archivo")) {
        await borrarOffline(item.clave);
    }

    mostrarAlmacenamiento();
    alert("Listo, copias borradas");
}

/* vacía la copia guardada de la app y la vuelve a cargar con lo más nuevo */
async function BuscarActualizacionBtn() {
    if (!navigator.onLine) {
        alert("Necesitas internet para buscar actualizaciones");
        return;
    }

    if (!confirm("Se recargará la app con la versión más nueva. Tu cuenta y tus descargas no se borran. ¿Continuar?")) return;

    try {
        if ("serviceWorker" in navigator) {
            let registros = await navigator.serviceWorker.getRegistrations();
            await Promise.all(registros.map(registro => registro.update()));
        }

        let claves = await caches.keys();
        await Promise.all(claves.map(clave => caches.delete(clave)));
    } catch (error) {
        console.log("no se pudo limpiar la copia guardada", error);
    }

    location.reload();
}

/* tus datos en un archivo, para que los tengas */
async function DescargarDatosBtn() {
    try {
        let apks = await Datos.listarApks();
        let mias = apks.filter(a => a.autorId === usuario.id);
        let tiempos = await tiemposActuales();

        let datos = {
            generado: new Date().toISOString(),
            cuenta: { nombre: usuario.nombre, correo: usuario.email },
            tiempo_en_segundos: tiempos,
            publicaciones: mias.map(a => ({
                nombre: a.nombre,
                tipo: a.tipo,
                categoria: a.categoria,
                descripcion: a.descripcion,
                publicada: new Date(a.fecha).toISOString(),
                descargas_o_visitas: a.descargas,
                calificacion: a.promedio,
                votos: a.votos
            })),
            ajustes: ajustes
        };

        let enlace = document.createElement("a");
        let url = URL.createObjectURL(new Blob([JSON.stringify(datos, null, 2)], { type: "application/json" }));

        enlace.href = url;
        enlace.download = "pkstore-mis-datos.json";
        document.body.append(enlace);
        enlace.click();
        enlace.remove();
        setTimeout(() => URL.revokeObjectURL(url), 5000);
    } catch (error) {
        alert("No se pudieron descargar tus datos: " + error.message);
    }
}


//////////////////////////////
//Seguridad (pantalla dentro de Ajustes)
//////////////////////////////
function mostrarSegCorreo() {
    document.getElementById("SegCorreo").textContent = "Cuenta: " + usuario.email;
}

function AbrirSeguridad() {
    ir("DvSeguridad");
    reiniciarSeguridad();
    mostrarSegCorreo();
}


//////////////////////////////
//Soporte
//////////////////////////////
const TIPOS_SOPORTE = {
    problema: "SoporteProblema",
    sugerencia: "SoporteSugerencia",
    reporte: "SoporteReporte",
    cuenta: "SoporteCuenta"
};

const NOMBRES_SOPORTE = { problema: "Problema", sugerencia: "Sugerencia", reporte: "Reporte", cuenta: "Mi cuenta" };
const ESTADOS_SOPORTE = { abierto: "en revisión", respondido: "respondido", cerrado: "cerrado" };

let tipoSoporte = "problema";

function ElegirTipoSoporte(tipo) {
    tipoSoporte = tipo;

    Object.entries(TIPOS_SOPORTE).forEach(([nombre, id]) => {
        document.getElementById(id).classList.toggle("activo", nombre === tipo);
    });
}

/* "previo" permite abrirlo ya con el tipo, el asunto y el mensaje escritos (por ejemplo al reportar) */
function AbrirSoporte(previo) {
    ir("DvSoporte");

    ElegirTipoSoporte(previo && previo.tipo ? previo.tipo : "problema");
    document.getElementById("SoporteAsunto").value = previo && previo.asunto ? previo.asunto : "";
    document.getElementById("SoporteMensaje").value = previo && previo.mensaje ? previo.mensaje : "";

    mostrarSoportes();
}

function ReportarBtn(apk) {
    AbrirSoporte({
        tipo: "reporte",
        asunto: "Reporte: " + apk.nombre,
        mensaje: "Publicación: " + apk.nombre + " (número " + apk.id + "), de " + apk.autor + ".\nMotivo: "
    });
}

async function EnviarSoporteBtn() {
    let asunto = valorDe("SoporteAsunto").trim();
    let mensaje = valorDe("SoporteMensaje").trim();
    let boton = document.getElementById("BtnSoporte");

    if (asunto.length < 3) {
        alert("Escribe un asunto (mínimo 3 letras)");
        return;
    }

    if (mensaje.length < 10) {
        alert("Cuéntanos un poco más (mínimo 10 letras)");
        return;
    }

    boton.disabled = true;

    try {
        await Datos.enviarSoporte(usuario, { tipo: tipoSoporte, asunto: asunto, mensaje: mensaje });

        document.getElementById("SoporteAsunto").value = "";
        document.getElementById("SoporteMensaje").value = "";

        alert(Datos.modo === "local"
            ? "Mensaje guardado en este dispositivo. Sin Supabase conectado no le llega a nadie."
            : "Mensaje enviado. Aquí abajo verás la respuesta cuando la tengamos.");

        mostrarSoportes();
    } catch (error) {
        alert("No se pudo enviar: " + error.message);
    }

    boton.disabled = false;
}

/* tus mensajes y las respuestas */
async function mostrarSoportes() {
    let lista = document.getElementById("ListaSoporte");
    let mensajes = [];

    try {
        mensajes = await Datos.misSoportes(usuario);
    } catch (error) {
        console.log("no se pudieron leer los mensajes", error);
    }

    if (!mensajes.length) {
        lista.replaceChildren(crear("p", "nota", "Todavía no has enviado mensajes."));
        return;
    }

    lista.replaceChildren(...mensajes.map(m => {
        let ticket = crear("article", "ticket");
        let cabecera = crear("div", "ticket-cab");

        cabecera.append(
            crear("strong", "", m.asunto),
            crear("span", "insignia", ESTADOS_SOPORTE[m.estado] || m.estado)
        );

        ticket.append(
            cabecera,
            crear("small", "nota", NOMBRES_SOPORTE[m.tipo] + ", " + formatoFecha(m.creado)),
            crear("p", "det-texto", m.mensaje)
        );

        if (m.respuesta) {
            let respuesta = crear("div", "ticket-resp");
            respuesta.append(crear("strong", "", "Respuesta"), crear("p", "det-texto", m.respuesta));
            ticket.append(respuesta);
        }

        return ticket;
    }));
}


//////////////////////////////
//Actualizaciones de la página
//////////////////////////////

/* agrega una versión nueva arriba cada vez que cambies la página */
const ACTUALIZACIONES = [
    {
        version: "2.6",
        fecha: "2026-11-07",
        cambios: [
            "Seguridad (contraseña y correo) ahora está en Ajustes",
            "Nuevo apartado Soporte: preguntas frecuentes, mensajes al equipo y botón para reportar publicaciones",
            "Más funciones en Ajustes: tamaño del texto, menos animaciones, opciones de juegos, descargar mis datos, espacio usado y buscar actualización",
            "Accesos directos al mantener pulsado el icono de la app"
        ]
    },
    {
        version: "2.5",
        fecha: "2026-11-06",
        cambios: [
            "Términos y condiciones: casilla al registrarte y acceso desde Ajustes",
            "En Mi cuenta puedes cambiar tu contraseña (con la actual o con un código al correo) y tu correo",
            "En el login: olvidé mi contraseña, con un código enviado al correo"
        ]
    },
    {
        version: "2.4",
        fecha: "2026-11-06",
        cambios: [
            "Nueva sección Mini juegos y la categoría “mini juego” al publicar un archivo HTML",
            "El visor tiene pausa: Seguir, Reiniciar, Pantalla completa y Salir (también con la tecla Esc)",
            "En Mi cuenta ves tu tiempo en apks, páginas y mini juegos",
            "8 temas nuevos en Ajustes: Medianoche, Océano, Bosque, Atardecer, Violeta, Rosa y Arena"
        ]
    },
    {
        version: "2.3",
        fecha: "2026-11-05",
        cambios: [
            "Editor de archivos HTML con vista previa: solo quien publicó puede verlo y usarlo",
            "Al guardar se actualiza el archivo publicado y tu copia sin internet",
            "En Ajustes puedes elegir la carpeta de descargas (en los navegadores que lo permiten)"
        ]
    },
    {
        version: "2.2",
        fecha: "2026-11-05",
        cambios: [
            "En Descargas también aparecen las apks que descargaste",
            "Las apks necesitan internet para abrirse; las páginas HTML guardadas funcionan sin conexión"
        ]
    },
    {
        version: "2.1",
        fecha: "2026-11-04",
        cambios: [
            "Los archivos HTML se abren en pantalla completa, como una página publicada",
            "Puedes descargar un HTML al dispositivo y abrirlo sin internet desde Descargas",
            "La app abre sin conexión y te lleva a tus descargas"
        ]
    },
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
//Sin conexión
//////////////////////////////

/* esconde lo que necesita internet y avisa */
function actualizarRed() {
    let sinRed = !navigator.onLine;

    document.getElementById("body").classList.toggle("sin-red", sinRed);
    document.getElementById("AvisoRed").hidden = !sinRed;

    /* los botones de las apks dependen de la conexión */
    if (pantallaActual === "DvDescargas") mostrarDescargas();
}

window.addEventListener("offline", actualizarRed);
window.addEventListener("online", () => {
    actualizarRed();

    /* si se abrió sin internet y sin cuenta, ahora sí se puede entrar */
    if (!usuario) cargar();
});

//////////////////////////////
//cargar
//////////////////////////////
aplicarTema(localStorage.getItem("temas"));
aplicarAjustes();
ElegirAcceso("libre");

/* los accesos directos del manifest abren la app con ?atajo=nombre */
function abrirAtajo() {
    let atajo = new URLSearchParams(location.search).get("atajo");
    let destinos = {
        minijuegos: MinijuegosBtn,
        publicar: AbrirDow,
        descargas: DescargasBtn,
        soporte: AbrirSoporte,
        cuenta: AbrirCuenta
    };

    if (!atajo || !destinos[atajo]) return false;

    destinos[atajo]();
    return true;
}

async function cargar() {
    document.getElementById("VersionApp").textContent = "Versión " + ACTUALIZACIONES[0].version;
    document.getElementById("ModoDatos").textContent = Datos.modo === "nube"
        ? "datos guardados en la nube (Supabase)"
        : "datos guardados solo en este dispositivo";

    actualizarRed();

    /* sin internet: directo a lo que guardaste en el dispositivo */
    if (!navigator.onLine) {
        actualizarMenuUsuario();
        DescargasBtn();
        return;
    }

    try {
        usuario = await Datos.sesion();
    } catch (error) {
        usuario = null;
    }

    if (usuario) {
        actualizarMenuUsuario();
        if (!abrirAtajo()) InicioBtn();
        console.log("datos cargados");
    } else {
        ir("DvRegister");
        console.log("registrate");
    }
}

window.addEventListener("load", cargar);
