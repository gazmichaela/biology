// === Service Worker === //
// Soubor musí ležet v ROOTU webu (vedle index.html), aby měl scope na celý web

const CONFIG = {
  version: '3.3.0',
  cachePrefix: 'systemova-biologie',
  maxAgeMs: 1000 * 60 * 60 * 170,   // 170 hodin pro veškerý cachovaný obsah
  maxEntries: {
    pages: 100,
    assets: 200,
    images: 300,  // počítej s tím, že obrázků bude přibývat
    runtime: 50
  },
  networkTimeout: 6000
};

const CACHE_NAMES = {
  core: `${CONFIG.cachePrefix}-core-v${CONFIG.version}`,
  pages: `${CONFIG.cachePrefix}-pages-v${CONFIG.version}`,
  assets: `${CONFIG.cachePrefix}-assets-v${CONFIG.version}`,
  images: `${CONFIG.cachePrefix}-images-v${CONFIG.version}`,
  runtime: `${CONFIG.cachePrefix}-runtime-v${CONFIG.version}`
};

// Soubory k precachování při instalaci, vše relativně k rootu (sw.js leží v rootu vedle index.html)
const CORE_FILES = [
  './',
  './index.html',
  './manifest.json',
  './css/style.css',
  './css/navigation-desktop.css',
  './css/navigation-mobile.css',
  './css/sticky-header.css',
  './css/responsiveness.css',
  './css/focus-outline.css',
  './css/img.css',
  './css/flashcard.css',
  './css/pdf.css',
  './css/questions.css',
  './js/dropdowns.js',
  './js/active-menu.js',
  './js/cookies.js',
  './js/dark-mode.js',
  './js/sticky-header.js',
  './js/responsiveness.js',
  './js/focus-outline.js',
  './js/source.js',
  './js/img-zoom.js',
  './js/pdf.js',
  './js/questions.js',
  './js/tooltips.js',
  './favicon/web-logo-192x192.png',
  './favicon/web-logo-180x180-apple-touch.png',
  './favicon/web-logo-120x120-apple-touch.png',
  './favicon/web-logo-32x32.png',
  './favicon/web-logo-64x64-48x48-32x32-16x16.ico'
];

// Všechny HTML stránky webu (podle sidemap.html) precachují se hned při instalaci
const PAGES_TO_CACHE = [
  './introduction.html',
  './basic-principles.html',
  './system-approach.html',
  './system-thinking.html',
  './system-theory.html',
  './life-properties.html',
  './life-origin.html',
  './human.html',
  './cell.html',
  './tissues.html',
  './organ-system.html',
  './genetics.html',
  './environment.html',
  './ecology-introduction.html',
  './ecosystems.html',
  './environmental-protection.html',
  './climate-change.html',
  './personal-data.html',
  './sidemap.html'
];

function logError(...args) {
  console.error(`[SW v${CONFIG.version}]`, ...args);
}

function fetchWithTimeout(request, timeout = CONFIG.networkTimeout) {
  return Promise.race([
    fetch(request),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Network timeout')), timeout)
    )
  ]);
}

async function cacheAll(cacheName, urls) {
  const cache = await caches.open(cacheName);
  await Promise.allSettled(
    urls.map(url => cache.add(url))
  );
}

function addTimestamp(response) {
  try {
    const headers = new Headers(response.headers);
    headers.set('sw-cached-at', new Date().toISOString());
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers
    });
  } catch {
    return response;
  }
}

function isExpired(response) {
  if (!response) return true;
  const cachedAt = response.headers.get('sw-cached-at');
  if (!cachedAt) return false; // bez razítka (např. precache při instalaci) nikdy nevyprší samo
  const age = Date.now() - new Date(cachedAt).getTime();
  return age > CONFIG.maxAgeMs;
}

async function trimCache(cacheName, maxEntries) {
  try {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    if (keys.length <= maxEntries) return;
    const toDelete = keys.slice(0, keys.length - maxEntries);
    await Promise.all(toDelete.map(req => cache.delete(req)));
  } catch (err) {
    logError('trimCache error:', err);
  }
}


async function cacheFirst(request, cacheName, maxEntries) {
  // Nejdřív zkusí přesně cílené cache
  const cache = await caches.open(cacheName);
  let cached = await cache.match(request);

  if (!cached) {
    cached = await caches.match(request);
  }

  // Platná (nevypršelá) cache se vrátí rovnou bez dotazu na síť
  if (cached && !isExpired(cached)) return cached;

  try {
    const response = await fetchWithTimeout(request.clone());
    if (response && response.ok) {
      await cache.put(request, addTimestamp(response.clone()));
      trimCache(cacheName, maxEntries);
    }
    return response;
  } catch (err) {
    // Síť selhala a vypršeli cache, pokud jsou alespoň zastaralé cache, vrátí je jako fallback
    if (cached) {
      return cached;
    }
    logError('cacheFirst fetch selhal:', request.url, err);
    throw err;
  }
}

async function staleWhileRevalidate(request, cacheName, maxEntries) {
  const cache = await caches.open(cacheName);
  let cached = await cache.match(request);
  if (!cached) {
    cached = await caches.match(request);
  }

  const networkUpdate = fetchWithTimeout(request.clone())
    .then(response => {
      if (response && response.ok) {
        cache.put(request, addTimestamp(response.clone()));
        trimCache(cacheName, maxEntries);
      }
      return response;
    })
    .catch(err => {
      return null;
    });

  // Platná cache se vrátí okamžitě, aktualizace běží na pozadí
  if (cached && !isExpired(cached)) return cached;

  // Vypršelá cache: zkusí počkat na síť, pokud selže, použij ji jako fallback
  const fresh = await networkUpdate;
  if (fresh) return fresh;
  if (cached) {
    return cached;
  }
  throw new Error('Nic v cache ani na síti pro ' + request.url);
}

async function networkFirst(request, cacheName, maxEntries) {
  try {
    const response = await fetchWithTimeout(request.clone());
    if (response && response.ok) {
      const cache = await caches.open(cacheName);
      await cache.put(request, addTimestamp(response.clone()));
      trimCache(cacheName, maxEntries);
    }
    return response;
  } catch (err) {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);
    if (cached) return cached;
    throw err;
  }
}

// Precachování základních souborů a stránek při instalaci, aby pwa fungovala offline napoprvé
self.addEventListener('install', event => {
  event.waitUntil(
    (async () => {
      await cacheAll(CACHE_NAMES.core, CORE_FILES);
      await cacheAll(CACHE_NAMES.pages, PAGES_TO_CACHE);
      await self.skipWaiting();
    })()
  );
});

// Smazání starých verzí cache při aktivaci nového service workera
self.addEventListener('activate', event => {
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();
      const validNames = Object.values(CACHE_NAMES);
      const oldCaches = cacheNames.filter(
        name => name.startsWith(CONFIG.cachePrefix) && !validNames.includes(name)
      );
      await Promise.all(oldCaches.map(name => caches.delete(name)));

      await self.clients.claim();
    })()
  );
});

// Vybere odpovídající cache a strategii podle přípony/typu requestu
function getStrategy(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;

  if (pathname.match(/\.(jpg|jpeg|png|gif|webp|svg|ico)$/i)) {
    return { name: CACHE_NAMES.images, fn: cacheFirst, maxEntries: CONFIG.maxEntries.images };
  }
  if (pathname.match(/\.(css|js|woff2?|ttf|eot)$/i)) {
    return { name: CACHE_NAMES.assets, fn: cacheFirst, maxEntries: CONFIG.maxEntries.assets };
  }
  if (pathname.endsWith('.html') || pathname.endsWith('/')) {
    return { name: CACHE_NAMES.pages, fn: staleWhileRevalidate, maxEntries: CONFIG.maxEntries.pages };
  }
  if (pathname.endsWith('.json')) {
    return { name: CACHE_NAMES.core, fn: cacheFirst, maxEntries: CONFIG.maxEntries.assets };
  }
  return { name: CACHE_NAMES.runtime, fn: networkFirst, maxEntries: CONFIG.maxEntries.runtime };
}

self.addEventListener('fetch', event => {
  const { request } = event;

  if (request.method !== 'GET') return;
  if (!request.url.startsWith('http')) return;

  // Cross-origin requesty (jiné domény) nechává projít normálně, neukládá je
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  const strategy = getStrategy(request);

  event.respondWith(
    (async () => {
      try {
        return await strategy.fn(request, strategy.name, strategy.maxEntries);
      } catch (err) {
        logError('Fetch selhal:', request.url, err);

        // Offline fallback pro stránky: ukaže alespoň index.html
        if (request.destination === 'document') {
          const coreCache = await caches.open(CACHE_NAMES.core);
          const fallback = await coreCache.match('./index.html');
          if (fallback) return fallback;
        }

        return new Response('Offline – obsah není dostupný v cache.', {
          status: 503,
          statusText: 'Service Unavailable',
          headers: { 'Content-Type': 'text/plain; charset=utf-8' }
        });
      }
    })()
  );
});

// Umožňuje stránce vynutit okamžitou aktivaci nového service workera
self.addEventListener('message', event => {
  const { type } = event.data || {};
  if (type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});