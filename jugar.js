//////////////////////////////
//JUGAR UN ARCHIVO HTML (página aparte, sin la tienda)
//////////////////////////////
const parametros = new URLSearchParams(location.search);
const idJuego = Number(parametros.get("juego"));
const claveJuego = Datos.modo + ":" + idJuego;

const marco = document.getElementById("Marco");

let apkJuego = null;
let htmlJuego = "";
let progresoJuego = {};
let juegoPausado = false;
let eventoInstalar = null;
let iconoGrande = null;
let segundosJuego = 0;
let ignorarProgresoHasta = 0;
let usuarioJuego = null;
let logrosJuego = { definiciones: [], desbloqueados: [] };


//////////////////////////////
//Ayudas
//////////////////////////////
const COLORES_TEMA = {
    oscuro: "#121318", claro: "#f6f8fc", medianoche: "#000000", oceano: "#08161e", bosque: "#0c150f",
    atardecer: "#170f0d", violeta: "#110d1b", rosa: "#170d14", arena: "#f4eee1"
};

/* usa el mismo tema que elegiste en PkStore */
function aplicarTemaGuardado() {
    let tema = localStorage.getItem("temas") || "oscuro";
    let cuerpo = document.getElementById("body");

    if (tema === "claro") cuerpo.classList.add("Bdc");
    else if (tema !== "oscuro" && COLORES_TEMA[tema]) cuerpo.classList.add("tema-" + tema);

    document.querySelector('meta[name="theme-color"]').setAttribute("content", COLORES_TEMA[tema] || COLORES_TEMA.oscuro);
}

function ajusteGuardado(clave, porDefecto) {
    let ajustes = JSON.parse(localStorage.getItem("ajustes") || "{}");
    return clave in ajustes ? ajustes[clave] : porDefecto;
}

function mostrarMensaje(texto, conBoton) {
    document.getElementById("MensajeTexto").textContent = texto;
    document.getElementById("MensajeBoton").hidden = !conBoton;
    document.getElementById("Mensaje").hidden = false;
}

function IrAPkStore() {
    location.href = "./";
}

async function CopiarEnlaceBtn() {
    let enlace = urlJugar(idJuego, false);

    try {
        await navigator.clipboard.writeText(enlace);
        alert("Enlace copiado");
    } catch (error) {
        prompt("Copia este enlace:", enlace);
    }
}


//////////////////////////////
//Abrir el juego
//////////////////////////////
async function iniciar() {
    aplicarTemaGuardado();

    if (!idJuego) {
        mostrarMensaje("Falta indicar qué juego abrir.", true);
        return;
    }

    try {
        let guardada = await leerOfflineUno(claveJuego);
        let apk = null;
        let html;

        /* con internet se busca la versión más nueva; sin internet se usa la copia guardada */
        if (navigator.onLine) {
            try {
                apk = await Datos.obtenerApk(idJuego);
            } catch (error) {
                console.log("sin datos de la tienda, se usa la copia guardada", error);
            }
        }

        if (apk && apk.tipo !== "html") {
            mostrarMensaje("Este acceso directo no es de un archivo HTML.", true);
            return;
        }

        if (apk) {
            apkJuego = { id: apk.id, nombre: apk.nombre, categoria: apk.categoria, autor: apk.autor, icono: apk.fotoUrl };

            try {
                html = await Datos.htmlTexto(apk);
                if (guardada) await guardarOffline(Object.assign({}, guardada, { html: html }));
            } catch (error) {
                console.log("se usa la copia guardada", error);
            }
        } else if (guardada) {
            apkJuego = { id: idJuego, nombre: guardada.nombre, categoria: guardada.categoria || "general", autor: guardada.autor, icono: guardada.icono || null };
        }

        if (!apkJuego) {
            mostrarMensaje("No se encontró el juego. Ábrelo una vez desde PkStore con internet.", true);
            return;
        }

        if (html === undefined && guardada) html = guardada.html;

        if (html === undefined) {
            mostrarMensaje("Este juego no está guardado en el dispositivo y no hay internet.", true);
            return;
        }

        htmlJuego = html;
        progresoJuego = await leerProgreso(idJuego);
        document.title = apkJuego.nombre;

        await prepararLogros(guardada);

        await prepararInstalacion();

        if (parametros.get("instalar") === "1" && !esAppInstalada()) MostrarInstalar();
        else jugar();
    } catch (error) {
        mostrarMensaje("No se pudo abrir el juego: " + error.message, true);
    }
}

function jugar() {
    document.getElementById("Mensaje").hidden = true;
    document.getElementById("Instalar").hidden = true;
    marco.hidden = false;
    document.getElementById("BtnMenu").hidden = false;
    marco.srcdoc = prepararHtml(htmlJuego, progresoJuego, logrosJuego);
}

function JugarAhora() {
    if (marco.hidden) jugar();
    else document.getElementById("Instalar").hidden = true;
}


//////////////////////////////
//Agregar a la pantalla principal
//////////////////////////////

/* el navegador toma el nombre y el icono de este manifest, que se arma con los datos del juego */
async function prepararInstalacion() {
    let origen = apkJuego.icono || null;
    let icono192 = await crearIconoPng(origen, apkJuego.nombre, 192);
    let icono512 = await crearIconoPng(origen, apkJuego.nombre, 512);
    let inicio = new URL("jugar.html", location.href);

    inicio.search = "";
    inicio.searchParams.set("juego", idJuego);
    inicio.searchParams.set("modo", Datos.modo);

    /* si el navegador no puede dibujar, se usa el icono de PkStore */
    let rutas192 = icono192 || new URL("icon-192.png", location.href).href;
    let rutas512 = icono512 || new URL("icon-512.png", location.href).href;

    let manifiesto = {
        id: new URL("./", location.href).href + "juego/" + Datos.modo + "-" + idJuego,
        name: apkJuego.nombre,
        short_name: apkJuego.nombre.slice(0, 12),
        description: "Juego de PkStore",
        lang: "es",
        start_url: inicio.href,
        scope: new URL("jugar.html", location.href).href,
        display: "fullscreen",
        display_override: ["fullscreen", "standalone"],
        orientation: "any",
        background_color: "#121318",
        theme_color: "#121318",
        icons: [
            { src: rutas192, sizes: "192x192", type: "image/png", purpose: "any" },
            { src: rutas512, sizes: "512x512", type: "image/png", purpose: "any" },
            { src: rutas192, sizes: "192x192", type: "image/png", purpose: "maskable" },
            { src: rutas512, sizes: "512x512", type: "image/png", purpose: "maskable" }
        ]
    };

    document.getElementById("Manifiesto").setAttribute("href",
        "data:application/manifest+json;charset=utf-8," + encodeURIComponent(JSON.stringify(manifiesto)));
    document.getElementById("IconoApple").setAttribute("href", rutas192);

    iconoGrande = rutas512;
}

window.addEventListener("beforeinstallprompt", evento => {
    evento.preventDefault();
    eventoInstalar = evento;
    actualizarInstalar();
});

window.addEventListener("appinstalled", () => {
    eventoInstalar = null;
    alert("Listo. Busca el icono de «" + apkJuego.nombre + "» en tu pantalla principal.");
    JugarAhora();
});

function esIphone() {
    return /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

/* si el navegador no ofrece instalar directo, se explica cómo hacerlo a mano */
function actualizarInstalar() {
    let instrucciones = document.getElementById("InstruccionesInstalar");

    if (eventoInstalar) {
        instrucciones.textContent = "";
        return;
    }

    instrucciones.textContent = esIphone()
        ? "En Safari toca el botón Compartir y elige “Agregar a pantalla de inicio”."
        : "Si no aparece el aviso, abre el menú ⋮ del navegador y elige “Agregar a la pantalla principal” o “Instalar app”.";
}

function MostrarInstalar() {
    document.getElementById("Pausa").hidden = true;
    document.getElementById("Mensaje").hidden = true;
    document.getElementById("InstalarNombre").textContent = apkJuego.nombre;
    document.getElementById("InstalarIcono").src = iconoGrande;
    document.getElementById("Instalar").hidden = false;

    actualizarInstalar();
}

async function AgregarAhora() {
    if (!eventoInstalar) {
        actualizarInstalar();
        alert(document.getElementById("InstruccionesInstalar").textContent);
        return;
    }

    eventoInstalar.prompt();
    await eventoInstalar.userChoice;
    eventoInstalar = null;
    actualizarInstalar();
}


//////////////////////////////
//Pausa
//////////////////////////////
function mandarAlJuego(mensaje) {
    if (marco.contentWindow) marco.contentWindow.postMessage(mensaje, "*");
}

function PausarJuego() {
    if (juegoPausado) return;

    juegoPausado = true;
    mandarAlJuego({ pkPausa: true });
    document.getElementById("Pausa").hidden = false;
}

function SeguirJuego() {
    juegoPausado = false;
    mandarAlJuego({ pkPausa: false });
    document.getElementById("Pausa").hidden = true;
}

function ReiniciarJuego() {
    SeguirJuego();
    segundosJuego = 0;
    marco.srcdoc = "";
    setTimeout(() => { marco.srcdoc = prepararHtml(htmlJuego, progresoJuego, logrosJuego); }, 50);
}

async function BorrarProgresoJuego() {
    if (!confirm("¿Borrar el progreso guardado de este juego?")) return;

    /* el juego viejo todavía puede mandar su progreso al cerrarse: se ignora un momento */
    ignorarProgresoHasta = Date.now() + 800;

    await borrarProgreso(idJuego);
    progresoJuego = {};
    ReiniciarJuego();
}

function PantallaCompletaJuego() {
    if (document.fullscreenElement) document.exitFullscreen();
    else if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen().catch(() => {});
}

/* el juego manda su "localStorage" para que se guarde en este dispositivo */
window.addEventListener("message", evento => {
    if (evento.source !== marco.contentWindow || !evento.data) return;

    /* el juego avisa que la persona logró algo */
    if (typeof evento.data.pkLogro === "string") {
        manejarLogroJuego(evento.data.pkLogro);
        return;
    }

    if (!evento.data.pkAlmacen) return;
    if (Date.now() < ignorarProgresoHasta) return;

    progresoJuego = limpiarProgreso(evento.data.pkAlmacen);
    guardarProgreso(idJuego, progresoJuego).catch(error => console.log("no se pudo guardar el progreso", error));
});

document.addEventListener("keydown", evento => {
    if (evento.key !== "Escape" || marco.hidden) return;

    if (juegoPausado) SeguirJuego();
    else PausarJuego();
});


//////////////////////////////
//Logros
//////////////////////////////

/* qué logros tiene el juego y cuáles ya tiene la persona (con su cuenta, si tiene sesión) */
async function prepararLogros(guardada) {
    if (apkJuego.categoria !== "minijuego") return;

    let definiciones = [];

    if (navigator.onLine) {
        try {
            usuarioJuego = await Datos.sesion();
        } catch (error) {
            usuarioJuego = null;
        }

        try {
            definiciones = await Datos.listarLogros(idJuego);
        } catch (error) {
            definiciones = [];
        }

        /* la copia guardada se queda con los logros más nuevos, para el modo sin internet */
        if (guardada && definiciones.length) {
            guardada.logros = definiciones;
            await guardarOffline(guardada);
        }
    }

    if (!definiciones.length && guardada && guardada.logros) definiciones = guardada.logros;

    logrosJuego = {
        definiciones: definiciones,
        desbloqueados: Object.keys(await logrosDelUsuario(usuarioJuego, idJuego))
    };
}

/* el juego pidió desbloquear un logro */
async function manejarLogroJuego(clave) {
    let logro = logrosJuego.definiciones.find(d => d.clave === clave);

    if (!logro || logrosJuego.desbloqueados.includes(clave)) return;

    logrosJuego.desbloqueados.push(clave);
    mostrarToast("🏆 Logro desbloqueado", logro.icono + " " + logro.nombre);

    try {
        await registrarLogro(usuarioJuego, idJuego, clave);
    } catch (error) {
        console.log("no se pudo guardar el logro", error);
    }
}


//////////////////////////////
//Tiempo jugado: lo recoge PkStore la próxima vez que abra
//////////////////////////////
let segundosSinVolcar = 0;

/* se suma en una clave aparte para no pisar lo que PkStore guarda por su lado */
function volcarTiempo() {
    let dueno = localStorage.getItem("ultimoUsuario");

    if (!dueno || segundosSinVolcar <= 0 || !apkJuego) return;

    let categoria = apkJuego.categoria === "minijuego" ? "minijuegos" : "paginas";
    let clave = "tiempoJugador:" + dueno;
    let total = JSON.parse(localStorage.getItem(clave) || "{}");

    total[categoria] = (total[categoria] || 0) + segundosSinVolcar;
    localStorage.setItem(clave, JSON.stringify(total));
    segundosSinVolcar = 0;
}

setInterval(() => {
    if (document.hidden || juegoPausado || marco.hidden) return;

    segundosJuego++;
    segundosSinVolcar++;

    if (segundosSinVolcar >= 30) volcarTiempo();
}, 1000);

document.addEventListener("visibilitychange", () => {
    if (!document.hidden) return;

    /* al salir de la pestaña se pausa solo (si no lo apagaste en Ajustes) y se guarda todo */
    if (!marco.hidden && ajusteGuardado("pausaAutomatica", true)) PausarJuego();
    mandarAlJuego({ pkGuardarYa: true });
    volcarTiempo();
});

window.addEventListener("pagehide", volcarTiempo);

iniciar();
