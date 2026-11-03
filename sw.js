//////////////////////////////
//SERVICE WORKER (PWA)
//////////////////////////////

/* sube el número cuando cambies archivos para renovar la copia guardada */
const CACHE = "pkview-v2";

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

self.addEventListener("install", evento => {
    evento.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ARCHIVOS)));
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
   Las peticiones a otros sitios (Supabase) no se tocan. */
self.addEventListener("fetch", evento => {
    const pedido = evento.request;

    if (pedido.method !== "GET" || new URL(pedido.url).origin !== self.location.origin) return;

    evento.respondWith(
        fetch(pedido)
            .then(respuesta => {
                if (respuesta.ok) {
                    const copia = respuesta.clone();
                    caches.open(CACHE).then(cache => cache.put(pedido, copia));
                }
                return respuesta;
            })
            .catch(() => caches.match(pedido).then(guardado => guardado || caches.match("index.html")))
    );
});
