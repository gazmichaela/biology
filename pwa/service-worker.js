// === Kompatibilní s Chrome, Firefox, Safari a dalšími prohlížeči === //

const BROWSER_SUPPORT = {
  backgroundSync: 'sync' in self.ServiceWorkerRegistration.prototype,
  pushManager: 'PushManager' in self,
  notificationActions: 'Notification' in self && 'actions' in self.Notification.prototype
};

const CONFIG = {
  version: '2.1.3-cross',
  cachePrefix: 'systemova-biologie',
  maxAge: {
    pages: 1000 * 60 * 60 * 24 * 7,      // 7 dní
    assets: 1000 * 60 * 60 * 24 * 30,    // 30 dní
    images: 1000 * 60 * 60 * 24 * 90,    // 90 dní
    api: 1000 * 60 * 60 * 24             // 24 hodin
  },
  maxEntries: {
    pages: 100,
    assets: 200,
    images: 100,
    runtime: 50
  },
  networkTimeout: 5000,  
  browserSupport: BROWSER_SUPPORT
};

const CACHE_NAMES = {
  core: `${CONFIG.cachePrefix}-core-v${CONFIG.version}`,
  pages: `${CONFIG.cachePrefix}-pages-v${CONFIG.version}`,
  assets: `${CONFIG.cachePrefix}-assets-v${CONFIG.version}`,
  images: `${CONFIG.cachePrefix}-images-v${CONFIG.version}`,
  runtime: `${CONFIG.cachePrefix}-runtime-v${CONFIG.version}`,
  api: `${CONFIG.cachePrefix}-api-v${CONFIG.version}`
};

const CORE_FILES = [
  './',
  './index.html',
  './manifest.json',
  './css/style.css',
  './css/navigation-desktop.css',
  './css/navigation-mobile.css',
  './js/dark-mode.js',
  './js/cookies.js',
  './favicon/web-logo-192x192.png'
];

const PAGES_TO_CACHE = [
  './system.html',
  './system-introduction.html',
  './system-approach.html',
  './system-thinking.html',
  './system-theory.html',
  './life.html',
  './life-properties.html',
  './life-origin.html',
  './cell.html',
  './human.html',
  './personal-data.html',
  './sidemap.html'
];

const ASSETS_TO_CACHE = [
  './css/img.css',
  './css/responsiveness.css',
  './js/dropdowns.js',
  './js/active-menu.js',
  './js/source.js',
  './js/sticky-header.js',
  './js/responsiveness.js',
  './favicon/web-logo-180x180-apple-touch.png',
  './favicon/web-logo-120x120-apple-touch.png',
  './favicon/web-logo-32x32.png',
  './favicon/web-logo-64x64-48x48-32x32-16x16.ico'
];

function log(message, data = null) {
  const timestamp = new Date().toISOString();
  const browserInfo = getBrowserInfo();
  console.log(`[SW ${timestamp}] [${browserInfo}] ${message}`, data || '');
}

function logError(message, error) {
  const timestamp = new Date().toISOString();
  const browserInfo = getBrowserInfo();
  console.error(`[SW ERROR ${timestamp}] [${browserInfo}] ${message}`, error);
}

function getBrowserInfo() {
  const ua = self.navigator.userAgent;
  if (ua.includes('Firefox/')) return 'Firefox';
  if (ua.includes('Safari/') && !ua.includes('Chrome/')) return 'Safari';
  if (ua.includes('Chrome/')) return 'Chrome';
  if (ua.includes('Edge/')) return 'Edge';
  return 'Unknown';
}

function fetchWithTimeout(request, timeout = CONFIG.networkTimeout) {
  // Timeout race chrání před zamrznutím requestů
  return Promise.race([
    fetch(request),
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Network timeout')), timeout)
    )
  ]);
}

async function isFileAvailable(url) {
  try {
    const browserInfo = getBrowserInfo();
    // Safari vyžaduje GET s Range místo HEAD detekce
    const method = browserInfo === 'Safari' ? 'GET' : 'HEAD';
    
    const headers = {};
    if (method === 'GET') {
      headers['Range'] = 'bytes=0-0'; 
    }
    
    const response = await fetchWithTimeout(new Request(url, {
      method,
      headers,
      cache: 'no-cache',
      mode: 'cors'
    }), 3000); 
    
    return response.ok || response.status === 206; 
  } catch (error) {
    logError(`File unavailable: ${url}`, error);
    return false;
  }
}

async function safeAddAll(cache, urls, cacheName) {
  const results = {
    successful: [],
    failed: []
  };
  
  const browserInfo = getBrowserInfo();
  // Safari má pomalejší cache batching
  const batchSize = browserInfo === 'Safari' ? 3 : 5;
  
  for (let i = 0; i < urls.length; i += batchSize) {
    const batch = urls.slice(i, i + batchSize);
    
    await Promise.all(batch.map(async (url) => {
      try {
        const isAvailable = await isFileAvailable(url);
        
        if (isAvailable) {
          await cache.add(url);
          results.successful.push(url);
          log(`Cached: ${url}`);
        } else {
          results.failed.push({ url, reason: 'File not found' });
          log(`Skipped (404): ${url}`);
        }
      } catch (error) {
        results.failed.push({ url, reason: error.message });
        logError(`Caching error: ${url}`, error);
      }
    }));
    
    if (browserInfo === 'Safari' && i + batchSize < urls.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  log(`Cache ${cacheName}: ${results.successful.length} successful, ${results.failed.length} failed`);
  return results;
}

async function cleanupCache(cacheName, maxEntries, maxAge) {
  try {
    const cache = await caches.open(cacheName);
    const requests = await cache.keys();
    
    if (requests.length <= maxEntries) return;
    
    const browserInfo = getBrowserInfo();
    
    // Mazání bez timestamp logiky
    if (browserInfo === 'Safari') {
      const toDelete = requests.slice(0, requests.length - maxEntries);
      await Promise.all(toDelete.map(request => cache.delete(request)));
      log(`Safari: Cleaned ${toDelete.length} entries from ${cacheName}`);
      return;
    }
    
    const requestsWithTime = [];
    
    for (const request of requests) {
      try {
        const response = await cache.match(request);
        const dateHeader = response?.headers.get('date') || response?.headers.get('sw-cached-at');
        const time = dateHeader ? new Date(dateHeader).getTime() : 0;
        requestsWithTime.push({ request, time });
      } catch (error) {
        requestsWithTime.push({ request, time: 0 });
      }
    }
    
    requestsWithTime.sort((a, b) => a.time - b.time);
    
    const toDelete = requestsWithTime.slice(0, requests.length - maxEntries);
    await Promise.all(toDelete.map(item => cache.delete(item.request)));
    
    log(`Cleaned ${toDelete.length} old entries from ${cacheName}`);
  } catch (error) {
    logError(`Error cleaning cache ${cacheName}:`, error);
  }
}

function addTimestamp(response) {
  try {
    const headers = new Headers(response.headers);
    headers.set('sw-cached-at', new Date().toISOString());
    headers.set('sw-version', CONFIG.version);
    headers.set('sw-browser', getBrowserInfo());
    
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: headers
    });
  } catch (error) {
    logError('Cannot add timestamp to response:', error);
    return response;
  }
}

async function cacheFirst(request, cacheConfig) {
  try {
    const cache = await caches.open(cacheConfig.name);
    const cached = await cache.match(request);
    
    if (cached) {
      const cachedAt = cached.headers.get('sw-cached-at') || cached.headers.get('date');
      if (cachedAt) {
        const age = Date.now() - new Date(cachedAt).getTime();
        if (age < cacheConfig.maxAge) {
          log(`Cache hit (${cacheConfig.name}):`, request.url);
          return cached;
        }
      } else {
        const browserInfo = getBrowserInfo();
        if (browserInfo === 'Safari') {
          log(`Safari cache hit (no timestamp):`, request.url);
          return cached;
        }
      }
    }
    
    log(`Network fetch (${cacheConfig.name}):`, request.url);
    const response = await fetchWithTimeout(request.clone());
    
    if (response.ok) {
      try {
        const responseToCache = addTimestamp(response.clone());
        await cache.put(request, responseToCache);
        await cleanupCache(cacheConfig.name, CONFIG.maxEntries.assets || 30, cacheConfig.maxAge);
      } catch (cacheError) {
        logError('Cache put failed:', cacheError);
      }
    }
    
    return response;
  } catch (error) {
    const cache = await caches.open(cacheConfig.name);
    const cached = await cache.match(request);
    if (cached) {
      log(`Fallback cache hit (${cacheConfig.name}):`, request.url);
      return cached;
    }
    throw error;
  }
}

async function networkFirst(request, cacheConfig) {
  try {
    log(`Network first attempt (${cacheConfig.name}):`, request.url);
    const response = await fetchWithTimeout(request.clone());
    
    if (response.ok) {
      try {
        const cache = await caches.open(cacheConfig.name);
        const responseToCache = addTimestamp(response.clone());
        await cache.put(request, responseToCache);
        await cleanupCache(cacheConfig.name, CONFIG.maxEntries.runtime || 30, cacheConfig.maxAge);
      } catch (cacheError) {
        logError('Cache put failed:', cacheError);
      }
    }
    
    return response;
  } catch (error) {
    log(`Network failed, trying cache (${cacheConfig.name}):`, request.url);
    const cache = await caches.open(cacheConfig.name);
    const cached = await cache.match(request);
    
    if (cached) {
      log(`Cache fallback hit (${cacheConfig.name}):`, request.url);
      return cached;
    }
    
    throw error;
  }
}

async function staleWhileRevalidate(request, cacheConfig) {
  const cache = await caches.open(cacheConfig.name);
  const cached = await cache.match(request);
  
  // Background fetch aktualizuje cache bez blokování
  fetchWithTimeout(request.clone())
    .then(response => {
      if (response.ok) {
        const responseToCache = addTimestamp(response.clone());
        cache.put(request, responseToCache).catch(error => {
          logError('Background cache put failed:', error);
        });
        cleanupCache(cacheConfig.name, CONFIG.maxEntries.pages || 30, cacheConfig.maxAge);
      }
    })
    .catch(error => {
      logError(`Background fetch failed for ${request.url}:`, error);
    });
  
  if (cached) {
    log(`Stale cache hit (${cacheConfig.name}):`, request.url);
    return cached;
  }
  
  log(`No cache, waiting for network (${cacheConfig.name}):`, request.url);
  return fetchWithTimeout(request.clone());
}

self.addEventListener('install', event => {
  log('Installing Service Worker...', `version ${CONFIG.version}`);
  
  event.waitUntil(
    (async () => {
      try {
        const coreCache = await caches.open(CACHE_NAMES.core);
        const coreResults = await safeAddAll(coreCache, CORE_FILES, 'core');
        
        const pagesCache = await caches.open(CACHE_NAMES.pages);
        const pagesResults = await safeAddAll(pagesCache, PAGES_TO_CACHE, 'pages');
        
        const assetsCache = await caches.open(CACHE_NAMES.assets);
        const assetsResults = await safeAddAll(assetsCache, ASSETS_TO_CACHE, 'assets');
        
        const totalSuccessful = coreResults.successful.length + pagesResults.successful.length + assetsResults.successful.length;
        const totalFailed = coreResults.failed.length + pagesResults.failed.length + assetsResults.failed.length;
        
        log(`Installation completed: ${totalSuccessful} successful, ${totalFailed} failed`);
        
        await self.skipWaiting();
        
      } catch (error) {
        logError('Installation error:', error);
        await self.skipWaiting();
      }
    })()
  );
});

self.addEventListener('activate', event => {
  log('Activating Service Worker...', `version ${CONFIG.version}`);
  
  event.waitUntil(
    (async () => {
      try {
        const cacheNames = await caches.keys();
        const oldCaches = cacheNames.filter(name => 
          name.startsWith(CONFIG.cachePrefix) && 
          !Object.values(CACHE_NAMES).includes(name)
        );
        
        if (oldCaches.length > 0) {
          await Promise.all(oldCaches.map(name => caches.delete(name)));
          log('Old caches deleted:', oldCaches);
        }
        
        await self.clients.claim();
        
        const clients = await self.clients.matchAll();
        clients.forEach(client => {
          try {
            client.postMessage({
              type: 'SW_UPDATED',
              version: CONFIG.version,
              browser: getBrowserInfo(),
              support: CONFIG.browserSupport,
              timestamp: new Date().toISOString()
            });
          } catch (error) {
            logError('Cannot send message to client:', error);
          }
        });
        
        log('Service Worker activation completed');
        
      } catch (error) {
        logError('Activation error:', error);
      }
    })()
  );
});

// Fetch event
self.addEventListener('fetch', event => {
  if (!isCacheable(event.request)) return;
  
  const cacheConfig = getCacheStrategy(event.request);
  
  event.respondWith(
    (async () => {
      try {
        switch (cacheConfig.strategy) {
          case 'cacheFirst':
            return await cacheFirst(event.request, cacheConfig);
          case 'networkFirst':
            return await networkFirst(event.request, cacheConfig);
          case 'staleWhileRevalidate':
            return await staleWhileRevalidate(event.request, cacheConfig);
          default:
            return await networkFirst(event.request, cacheConfig);
        }
        
      } catch (error) {
        logError(`Fetch failed for ${event.request.url}:`, error);
        
        if (event.request.destination === 'document') {
          const cache = await caches.open(CACHE_NAMES.core);
          const offlinePage = await cache.match('./index.html');
          if (offlinePage) return offlinePage;
    
        }
        
        return new Response('Offline - file not available', {
          status: 503,
          statusText: 'Service Unavailable'
        });
      }
    })()
  );
});

// Background sync pouze, pokud ho prohlížeč podporuje
if (CONFIG.browserSupport.backgroundSync) {
  self.addEventListener('sync', event => {
    log('Background sync:', event.tag);
    
    if (event.tag === 'background-sync-cache-cleanup') {
      event.waitUntil(
        (async () => {
          for (const [key, cacheName] of Object.entries(CACHE_NAMES)) {
            const maxEntries = CONFIG.maxEntries[key] || 30;
            const maxAge = CONFIG.maxAge[key] || CONFIG.maxAge.assets;
            await cleanupCache(cacheName, maxEntries, maxAge);
          }
          log('Background cache cleanup done');
        })()
      );
    }
  });
}

if (CONFIG.browserSupport.pushManager) {
  self.addEventListener('push', event => {
    if (!event.data) return;
    
    try {
      const data = event.data.json();
      const browserInfo = getBrowserInfo();
      
      const notificationOptions = {
        body: data.body || 'Nový obsah je k dispozici',
        icon: './favicon/web-logo-192x192.png',
        badge: './favicon/web-logo-32x32.png',
        data: data.url || './'
      };
      
      if (CONFIG.browserSupport.notificationActions && browserInfo !== 'Safari') {
        notificationOptions.actions = [
          {
            action: 'open',
            title: 'Otevřít'
          }
        ];
      }
      
      event.waitUntil(
        self.registration.showNotification(
          data.title || 'Systémová biologie',
          notificationOptions
        )
      );
      
      log('Push notification displayed:', data);
    } catch (error) {
      logError('Error when displaying push notification:', error);
    }
  });
  
  self.addEventListener('notificationclick', event => {
    event.notification.close();
    
    const url = event.notification.data || './';
    
    event.waitUntil(
      self.clients.matchAll({ type: 'window' }).then(clients => {
        for (const client of clients) {
          if (client.url === url && 'focus' in client) {
            return client.focus();
          }
        }
        
        if (self.clients.openWindow) {
          return self.clients.openWindow(url);
        }
      })
    );
  });
}

function isCacheable(request) {
  const url = new URL(request.url);
  
  if (request.method !== 'GET') return false;
  if (!url.protocol.startsWith('http')) return false;
  if (url.search && !url.search.includes('v=') && !url.search.includes('version=')) {
    return false;
  }
  
  return true;
}

function getCacheStrategy(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  
  if (pathname.includes('/api/') || pathname.includes('api.')) {
    return { name: CACHE_NAMES.api, strategy: 'networkFirst', maxAge: CONFIG.maxAge.api };
  }
  
  if (pathname.match(/\.(jpg|jpeg|png|gif|webp|svg|ico)$/i)) {
    return { name: CACHE_NAMES.images, strategy: 'cacheFirst', maxAge: CONFIG.maxAge.images };
  }
  
  if (pathname.match(/\.(css|js|woff|woff2|ttf|eot)$/i)) {
    return { name: CACHE_NAMES.assets, strategy: 'cacheFirst', maxAge: CONFIG.maxAge.assets };
  }
  
  if (pathname.endsWith('.html') || pathname === '/' || !pathname.includes('.')) {
    return { name: CACHE_NAMES.pages, strategy: 'staleWhileRevalidate', maxAge: CONFIG.maxAge.pages };
  }
  
  return { name: CACHE_NAMES.runtime, strategy: 'networkFirst', maxAge: CONFIG.maxAge.assets };
}

self.addEventListener('message', event => {
  const { type, data } = event.data || {};
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'GET_VERSION':
      event.ports[0]?.postMessage({ 
        version: CONFIG.version,
        browser: getBrowserInfo(),
        support: CONFIG.browserSupport
      });
      break;
      
    case 'GET_CACHE_STATUS':
      event.waitUntil(
        (async () => {
          try {
            const status = {};
            for (const [key, name] of Object.entries(CACHE_NAMES)) {
              const cache = await caches.open(name);
              const keys = await cache.keys();
              status[key] = {
                name,
                entries: keys.length,
                urls: keys.slice(0, 5).map(req => req.url)
              };
            }
            event.ports[0]?.postMessage({ cacheStatus: status });
          } catch (error) {
            event.ports[0]?.postMessage({ error: error.message });
          }
        })()
      );
      break;
  }
});

if (CONFIG.browserSupport.backgroundSync) {
  setInterval(() => {
    if (self.registration && self.registration.sync) {
      self.registration.sync.register('background-sync-cache-cleanup');
    }
  }, 1000 * 60 * 60 * 24);
// Fallback cleanup bez background sync 
} else {
  setInterval(async () => {
    try {
      for (const [key, cacheName] of Object.entries(CACHE_NAMES)) {
        const maxEntries = CONFIG.maxEntries[key] || 30;
        const maxAge = CONFIG.maxAge[key] || CONFIG.maxAge.assets;
        await cleanupCache(cacheName, maxEntries, maxAge);
      }
    } catch (error) {
      logError('Manual cleanup failed:', error);
    }
  // Automatický cleanup každých 24 hodin
  }, 1000 * 60 * 60 * 24); 
}

log(`Cross-browser Service Worker loaded - version ${CONFIG.version}`, {
  browser: getBrowserInfo(),
  support: CONFIG.browserSupport,
  caches: Object.keys(CACHE_NAMES).length
});