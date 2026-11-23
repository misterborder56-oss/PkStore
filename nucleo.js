//////////////////////////////
//NÚCLEO: lo que comparten la tienda (index.html) y la página de juego (jugar.html)
//////////////////////////////

/* ---------- base de este dispositivo: copias sin internet y progreso de los juegos ---------- */
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

/* el número de la publicación, sacado de la clave "modo:número" */
function idDeClave(clave) {
    return Number(String(clave).split(":")[1]);
}


/* ---------- progreso de los juegos (el "localStorage" de cada archivo html) ---------- */
/* cada juego tiene su propio espacio en este dispositivo: no se mezcla con otros ni con PkStore */
const MAX_PROGRESO = 5000000;

function claveProgreso(apkId) {
    return "juego:" + Datos.modo + ":" + apkId;
}

/* se queda solo con textos (como el localStorage de verdad) y con un tamaño razonable */
function limpiarProgreso(datos) {
    const limpio = {};

    if (!datos || typeof datos !== "object") return limpio;

    Object.keys(datos).forEach(clave => {
        if (typeof datos[clave] === "string") limpio[clave] = datos[clave];
    });

    return JSON.stringify(limpio).length <= MAX_PROGRESO ? limpio : {};
}

async function leerProgreso(apkId) {
    try {
        const registro = await operacionOffline("readonly", tienda => tienda.get(claveProgreso(apkId)), "ajustes");
        return registro ? limpiarProgreso(registro.datos) : {};
    } catch (error) {
        return {};
    }
}

const guardarProgreso = (apkId, datos) =>
    operacionOffline("readwrite", tienda => tienda.put({ clave: claveProgreso(apkId), datos: limpiarProgreso(datos) }), "ajustes");

const borrarProgreso = apkId =>
    operacionOffline("readwrite", tienda => tienda.delete(claveProgreso(apkId)), "ajustes");


/* ---------- logros de los mini juegos ---------- */
const MAX_LOGROS = 30;

/* deja solo lo que el juego necesita saber: qué logros existen y cuáles ya tiene la persona */
function limpiarLogros(logros) {
    const limpio = { definiciones: [], desbloqueados: [] };

    if (!logros || typeof logros !== "object") return limpio;

    (logros.definiciones || []).slice(0, MAX_LOGROS).forEach(d => {
        if (!d || typeof d.clave !== "string") return;

        limpio.definiciones.push({
            clave: d.clave.slice(0, 40),
            nombre: String(d.nombre || "").slice(0, 40),
            descripcion: String(d.descripcion || "").slice(0, 120),
            icono: String(d.icono || "🏆").slice(0, 8),
            secreto: Boolean(d.secreto)
        });
    });

    (logros.desbloqueados || []).forEach(c => { if (typeof c === "string") limpio.desbloqueados.push(c); });
    return limpio;
}

/* en este dispositivo se guarda cada logro al momento (aunque no haya internet) y se manda al servidor cuando se puede */
function duenoLogros(usuario) {
    return usuario ? usuario.id : (localStorage.getItem("ultimoUsuario") || "dispositivo");
}

function claveLogros(apkId, usuario) {
    return "logros:" + Datos.modo + ":" + apkId + ":" + duenoLogros(usuario);
}

async function leerRegistroLogros(apkId, usuario) {
    try {
        return await operacionOffline("readonly", tienda => tienda.get(claveLogros(apkId, usuario)), "ajustes");
    } catch (error) {
        return null;
    }
}

/* mapa { clave del logro: fecha } con lo del servidor y lo guardado en este dispositivo */
async function logrosDelUsuario(usuario, apkId) {
    const mapa = {};

    if (usuario) {
        try {
            Object.assign(mapa, await Datos.misLogros(usuario, apkId));
        } catch (error) {
            console.log("no se pudieron leer los logros del servidor", error);
        }
    }

    const registro = await leerRegistroLogros(apkId, usuario);
    if (registro) Object.keys(registro.desbloqueados || {}).forEach(c => { if (!mapa[c]) mapa[c] = registro.desbloqueados[c]; });

    return mapa;
}

/* anota un logro nuevo: primero en este dispositivo, luego en el servidor */
async function registrarLogro(usuario, apkId, clave) {
    const nombre = claveLogros(apkId, usuario);
    const registro = (await leerRegistroLogros(apkId, usuario)) ||
        { clave: nombre, apkId: apkId, dueno: duenoLogros(usuario), desbloqueados: {}, pendientes: [] };

    if (registro.desbloqueados[clave]) return;

    registro.desbloqueados[clave] = Date.now();
    registro.pendientes.push(clave);
    await operacionOffline("readwrite", tienda => tienda.put(registro), "ajustes");

    await sincronizarLogros(usuario);
}

/* manda al servidor los logros que quedaron pendientes (por falta de internet o de sesión) */
async function sincronizarLogros(usuario) {
    if (!usuario || !navigator.onLine) return;

    let todos = [];

    try {
        todos = await operacionOffline("readonly", tienda => tienda.getAll(), "ajustes");
    } catch (error) {
        return;
    }

    for (const registro of todos) {
        if (!String(registro.clave).startsWith("logros:" + Datos.modo + ":")) continue;
        if (registro.dueno !== usuario.id || !registro.pendientes || !registro.pendientes.length) continue;

        const restantes = [];

        for (const clave of registro.pendientes) {
            try {
                await Datos.desbloquearLogro(usuario, registro.apkId, clave);
            } catch (error) {
                restantes.push(clave);
            }
        }

        registro.pendientes = restantes;
        await operacionOffline("readwrite", tienda => tienda.put(registro), "ajustes");
    }
}


/* ---------- aviso emergente (logros y otros) ---------- */
const colaAvisos = [];
let avisoActivo = false;

function mostrarToast(titulo, texto) {
    colaAvisos.push({ titulo: titulo, texto: texto });
    if (!avisoActivo) siguienteToast();
}

function siguienteToast() {
    const item = colaAvisos.shift();

    if (!item) {
        avisoActivo = false;
        return;
    }

    avisoActivo = true;

    let caja = document.getElementById("Toast");

    if (!caja) {
        caja = document.createElement("div");
        caja.id = "Toast";
        caja.className = "toast";
        caja.setAttribute("role", "status");
        caja.setAttribute("aria-live", "polite");
        document.body.append(caja);
    }

    const titulo = document.createElement("strong");
    const texto = document.createElement("span");

    titulo.textContent = item.titulo;
    texto.textContent = item.texto;
    caja.replaceChildren(titulo, texto);
    caja.classList.add("visible");

    setTimeout(() => {
        caja.classList.remove("visible");
        setTimeout(siguienteToast, 400);
    }, 3500);
}


/* ---------- enlace directo a un juego ---------- */
/* jugar.html abre el juego a pantalla completa, sin la tienda (se puede agregar a la pantalla principal) */
function urlJugar(apkId, instalar) {
    const url = new URL("jugar.html", location.href);

    url.search = "";
    url.searchParams.set("juego", apkId);
    url.searchParams.set("modo", Datos.modo);
    if (instalar) url.searchParams.set("instalar", "1");

    return url.href;
}

/* ¿se está usando como app instalada? */
function esAppInstalada() {
    return window.matchMedia("(display-mode: standalone), (display-mode: fullscreen)").matches || navigator.standalone === true;
}


/* ---------- icono de un juego (para la pantalla principal) ---------- */
function cargarImagen(url) {
    return new Promise((resolve, reject) => {
        const imagen = new Image();

        imagen.crossOrigin = "anonymous";
        imagen.onload = () => resolve(imagen);
        imagen.onerror = () => reject(new Error("no se pudo cargar la imagen"));
        imagen.src = url;
    });
}

/* dibuja un icono cuadrado: la imagen del juego, o su inicial sobre el color de PkStore.
   Devuelve una imagen en texto (data:) o null si el navegador no puede dibujar. */
async function crearIconoPng(url, nombre, lado) {
    try {
        const lienzo = document.createElement("canvas");
        lienzo.width = lienzo.height = lado;

        const c = lienzo.getContext("2d");
        if (!c) return null;

        c.fillStyle = "#377df4";
        c.fillRect(0, 0, lado, lado);

        let dibujado = false;

        if (url) {
            try {
                const imagen = await cargarImagen(url);
                const lado2 = Math.min(imagen.naturalWidth, imagen.naturalHeight);

                c.drawImage(imagen, (imagen.naturalWidth - lado2) / 2, (imagen.naturalHeight - lado2) / 2, lado2, lado2, 0, 0, lado, lado);
                dibujado = true;
            } catch (error) {
                dibujado = false;
            }
        }

        if (!dibujado) {
            c.fillStyle = "white";
            c.font = "bold " + Math.round(lado * 0.5) + "px system-ui, sans-serif";
            c.textAlign = "center";
            c.textBaseline = "middle";
            c.fillText((nombre || "?").charAt(0).toUpperCase(), lado / 2, lado / 2);
        }

        return lienzo.toDataURL("image/png");
    } catch (error) {
        return null;
    }
}


/* ---------- código que se copia dentro de cada página html ---------- */
/* Se copia dentro de cada página html que se abre en el visor o en jugar.html.
   1) Si el navegador no deja usar localStorage en el marco aislado, le da uno que SÍ se guarda:
      cada cambio se manda a PkStore (que lo guarda en este dispositivo) y al volver a abrir
      el juego se le devuelve. sessionStorage sigue siendo temporal.
   2) Permite pausar: congela relojes, animaciones, temporizadores, sonidos y videos.
   Se escribe como función para que el navegador revise su sintaxis; luego se convierte a texto. */
function arregloPagina(guardado, logros) {
    try {
        var timeoutReal = window.setTimeout.bind(window);
        var intervalReal = window.setInterval.bind(window);
        var rafReal = (window.requestAnimationFrame || function (cb) { return timeoutReal(function () { cb(perfReal()); }, 16); }).bind(window);
        var ahoraReal = Date.now.bind(Date);
        var perfReal = performance.now.bind(performance);

        /* ----- almacenamiento ----- */
        var datos = {};
        var sesion = {};
        var envioPendiente = null;
        var clave;

        if (guardado) {
            for (clave in guardado) {
                if (Object.prototype.hasOwnProperty.call(guardado, clave)) datos[clave] = String(guardado[clave]);
            }
        }

        function enviar() {
            envioPendiente = null;
            try { parent.postMessage({ pkAlmacen: datos }, "*"); } catch (e) {}
        }

        function programarEnvio() {
            if (envioPendiente === null) envioPendiente = timeoutReal(enviar, 150);
        }

        function crearAlmacen(contenedor, alCambiar) {
            var tiene = function (k) { return Object.prototype.hasOwnProperty.call(contenedor, k); };
            var metodos = {
                getItem: function (k) { k = String(k); return tiene(k) ? contenedor[k] : null; },
                setItem: function (k, v) {
                    k = String(k);
                    v = String(v);

                    var habia = tiene(k);
                    var antes = contenedor[k];

                    contenedor[k] = v;

                    if (JSON.stringify(contenedor).length > 5000000) {
                        if (habia) contenedor[k] = antes; else delete contenedor[k];
                        throw new DOMException("The quota has been exceeded.", "QuotaExceededError");
                    }

                    if (alCambiar) alCambiar();
                },
                removeItem: function (k) { delete contenedor[String(k)]; if (alCambiar) alCambiar(); },
                clear: function () {
                    Object.keys(contenedor).forEach(function (c) { delete contenedor[c]; });
                    if (alCambiar) alCambiar();
                },
                key: function (i) { return Object.keys(contenedor)[i] || null; }
            };

            return new Proxy({}, {
                get: function (_, prop) {
                    if (prop === "length") return Object.keys(contenedor).length;
                    if (typeof prop === "string" && metodos[prop]) return metodos[prop];
                    return typeof prop === "string" && tiene(prop) ? contenedor[prop] : undefined;
                },
                set: function (_, prop, valor) { metodos.setItem(prop, valor); return true; },
                deleteProperty: function (_, prop) { metodos.removeItem(prop); return true; },
                has: function (_, prop) { return !!metodos[prop] || tiene(prop); },
                ownKeys: function () { return Object.keys(contenedor); },
                getOwnPropertyDescriptor: function (_, prop) {
                    return tiene(prop) ? { value: contenedor[prop], enumerable: true, configurable: true, writable: true } : undefined;
                }
            });
        }

        var nativo = true;
        try { window.localStorage; } catch (e) { nativo = false; }

        if (!nativo) {
            try { Object.defineProperty(window, "localStorage", { value: crearAlmacen(datos, programarEnvio), configurable: true }); } catch (x) {}
            try { Object.defineProperty(window, "sessionStorage", { value: crearAlmacen(sesion, null), configurable: true }); } catch (x) {}
            window.addEventListener("pagehide", enviar);
        }

        /* ----- logros: lo que el juego puede usar ----- */
        var definiciones = (logros && logros.definiciones) || [];
        var validas = {};
        var conseguidos = {};

        definiciones.forEach(function (d) { validas[d.clave] = d; });
        ((logros && logros.desbloqueados) || []).forEach(function (c) { conseguidos[c] = true; });

        var PkStore = {
            version: 1,

            /* desbloquea un logro; devuelve una promesa con true si se desbloqueó ahora, false si ya lo tenía */
            desbloquearLogro: function (clave) {
                clave = String(clave);

                if (!validas[clave]) {
                    console.warn("PkStore: el logro «" + clave + "» no existe. Agrégalo en Editar publicación, sección Logros.");
                    return Promise.resolve(false);
                }

                if (conseguidos[clave]) return Promise.resolve(false);

                conseguidos[clave] = true;
                try { parent.postMessage({ pkLogro: clave }, "*"); } catch (e) {}
                return Promise.resolve(true);
            },

            /* true si la persona ya tiene ese logro */
            logroDesbloqueado: function (clave) {
                return !!conseguidos[String(clave)];
            },

            /* lista de logros con su estado; la descripción de un logro secreto bloqueado viene vacía */
            logros: function () {
                return definiciones.map(function (d) {
                    var tiene = !!conseguidos[d.clave];

                    return {
                        clave: d.clave,
                        nombre: d.nombre,
                        descripcion: d.secreto && !tiene ? "" : d.descripcion,
                        icono: d.icono,
                        secreto: !!d.secreto,
                        desbloqueado: tiene
                    };
                });
            }
        };

        try {
            Object.defineProperty(window, "PkStore", { value: Object.freeze(PkStore), configurable: false });
        } catch (x) {}

        /* ----- pausa ----- */
        var pausado = false;
        var tPausa = 0, pPausa = 0, desfase = 0, pDesfase = 0;
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
            if (!evento.data) return;
            if (evento.data.pkGuardarYa) { enviar(); return; }
            if (typeof evento.data.pkPausa !== "boolean") return;
            if (evento.data.pkPausa) pausar(); else seguir();
        });
    } catch (error) {
        /* si algo falla, la página sigue funcionando sin pausa */
    }
}

/* devuelve el html listo para el marco aislado; "guardado" es el progreso que se le devuelve al juego */
function prepararHtml(html, guardado, logros) {
    const datos = guardado ? JSON.stringify(limpiarProgreso(guardado)).replace(/</g, "\\u003c") : "null";
    const info = JSON.stringify(limpiarLogros(logros)).replace(/</g, "\\u003c");
    const script = "<script>(" + arregloPagina.toString() + ")(" + datos + "," + info + ");<\/script>";

    if (/<head[^>]*>/i.test(html)) return html.replace(/<head[^>]*>/i, m => m + script);
    if (/<html[^>]*>/i.test(html)) return html.replace(/<html[^>]*>/i, m => m + script);
    return script + html;
}
