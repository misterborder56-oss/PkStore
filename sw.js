//////////////////////////////
//SERVICE WORKER (PWA)
//////////////////////////////

/* sube el número cuando cambies archivos para renovar la copia guardada */
const CACHE = "pkStore-v6";

/* rutas relativas: funcionan también en https://usuario.github.io/PkStore/ */
const ARCHIVOS = [
    "./",
    "index.html",
    "style.css",
    "app.js",
    "datos.js",
    "manifest.json",
    "icon-192.png",
    "icon-512.png",
    "icon1.png",
    "icon2.png"
];

/* la librería de Supabase también se guarda, para que la app abra sin internet */
const LIBRERIA = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.min.js";

/* cada archivo se guarda por separado: si falta uno, el service worker se instala igual */
self.addEventListener("install", evento => {
    evento.waitUntil(
        caches.open(CACHE).then(cache => Promise.all(
            ARCHIVOS.map(archivo => cache.add(archivo).catch(() => console.log("no se guardó", archivo)))
                .concat(fetch(LIBRERIA, { mode: "no-cors" })
                    .then(respuesta => cache.put(LIBRERIA, respuesta))
                    .catch(() => console.log("no se guardó la librería")))
        ))
    );
    self.skipWaiting();
});

self.addEventListener("activate", evento => {
    evento.waitUntil(
        caches.keys()
            .then(claves => Promise.all(claves.filter(c => c !== CACHE).map(c => caches.delete(c))))
            .then(() => self.clients.claim())
    );
});

/* primero la red (siempre lo más nuevo); sin conexión, la copia guardada.
   Las demás peticiones a otros sitios (datos de Supabase) no se tocan. */
self.addEventListener("fetch", evento => {
    const pedido = evento.request;
    const propia = new URL(pedido.url).origin === self.location.origin;

    if (pedido.method !== "GET" || (!propia && pedido.url !== LIBRERIA)) return;

    evento.respondWith(
        fetch(pedido)
            .then(respuesta => {
                if (respuesta.ok || respuesta.type === "opaque") {
                    const copia = respuesta.clone();
                    caches.open(CACHE).then(cache => cache.put(pedido, copia));
                }
                return respuesta;
            })
            .catch(() => caches.match(pedido, { ignoreSearch: true })
                .then(guardado => guardado || caches.match("index.html")))
    );
});
