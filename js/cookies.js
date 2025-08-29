(function () {
  class CookieManager {
    constructor(options = {}) {
      this.config = {
        showDelay: options.showDelay || 1000,
        checkInterval: options.checkInterval || 1500,
        enableLogging: options.enableLogging || false,
        showClass: options.showClass || 'show',
        storageKey: options.storageKey || 'cookiesAccepted',
        syncKey: options.syncKey || 'cookiesSync',
        cookieNoticeSelector: options.cookieNoticeSelector || '#cookiesMiniNotice',
        acceptButtonSelector: options.acceptButtonSelector || '#acceptCookies',
        domain: options.domain || this._getDomain(),
        forceCookies: options.forceCookies || false,
        firefoxMode: options.firefoxMode !== false 
      };
      
      this.elements = {};
      this.showTimeout = null;
      this.intervals = { check: null, sync: null };
      this.isInitialized = false;

      this.state = {
        lastPrivateMode: null,
        lastSyncValue: null,
        isFirefox: this._isFirefox(),
        isChrome: this._isChrome(),
        privateModeDetected: false
      };

      this.handleAcceptClick = this._onAcceptClick.bind(this);
      this.handleWindowFocus = this._onWindowFocus.bind(this);
      this.handleStorageEvent = this._onStorageEvent.bind(this);
      this.checkPrivateMode = this._checkPrivateMode.bind(this);
      this.forcedSync = this._forcedSync.bind(this);

      this.init();
    }

    init() {
      try {
        this._cacheElements();
        this._validateElements();
        this._bindEvents();
        this._startMonitoring();

        if (this._shouldShowNotice()) {
          this._showNotice();  
        }

        this.isInitialized = true;
        this._log(`Initialized (Firefox: ${this.state.isFirefox}, Chrome: ${this.state.isChrome}, Private: ${this._isPrivateMode()})`);
      } catch (error) {
        console.error(`Cookie manager init failed:`, error);
      }
    }

    _cacheElements() {
      const { cookieNoticeSelector, acceptButtonSelector } = this.config;
      this.elements = {
        cookieNotice: document.querySelector(cookieNoticeSelector),
        acceptButton: document.querySelector(acceptButtonSelector)
      }; 
    }

    _validateElements() {
      if (!this.elements.cookieNotice) {
        throw new Error(`Cookie notice not found: ${this.config.cookieNoticeSelector}`);
      }
    }

    _getDomain() {
      const hostname = window.location.hostname;
      const parts = hostname.split('.');
      if (parts.length > 2) {
        return '.' + parts.slice(-2).join('.');
      }
      return hostname;  
    }

    _isFirefox() {
      return navigator.userAgent.toLowerCase().includes('firefox');  
    }

    _isChrome() {
      return navigator.userAgent.toLowerCase().includes('chrome') &&
        !navigator.userAgent.toLowerCase().includes('edg');
    }

    _isPrivateMode() {
      // Pro Firefox: VŽDY nejdřív zkontrolovat cookies
      if (this.state.isFirefox) {
        const cookies = document.cookie;
        if (cookies.includes(this.config.storageKey + '=true') || 
            cookies.includes(this.config.storageKey + '=' + encodeURIComponent('true'))) {
          // Cookie existuje = normální režim
          this.state.privateModeDetected = false;
          return false;
        }
        // Žádná cookie = anonymní režim nebo první návštěva
        // Pro Firefox: pokud není cookie, považuj za anonymní
        this.state.privateModeDetected = true;
        return true;
      }
      
      // Pro ostatní prohlížeče původní logika
      if (this.state.privateModeDetected !== undefined) {
        return this.state.privateModeDetected;
      }
      
      try {
        localStorage.setItem('__test__', '1');
        const testValue = localStorage.getItem('__test__');
        localStorage.removeItem('__test__');
        if (!testValue) {
          this.state.privateModeDetected = true;
          return true;  
        }
        if (this.state.isChrome) {
          if (!window.indexedDB) {
            this.state.privateModeDetected = true;
            return true;
          }
          if ('storage' in navigator && 'estimate' in navigator.storage) {
            navigator.storage.estimate().then(estimate => {
              if (estimate.quota < 50 * 1024 * 1024) {
                this.state.privateModeDetected = true;
              }  
            }).catch(() => {
              this.state.privateModeDetected = true;
            });
          }
          if (window.RTCPeerConnection) {
            try {
              const pc = new RTCPeerConnection({ iceServers: [{urls: "stun:stun.1.google.com:19302"}] });
              pc.createDataChannel('test');
              pc.close();
            } catch (e) {
              if (e.name === 'NotSupportedError' || e.name === 'NotAllowedError') {
                this.state.privateModeDetected = true;
                return true;
              }  
            }
          }
          if (window.webkitRequestFileSystem) {
            window.webkitRequestFileSystem(
              window.TEMPORARY, 1,
              () => { if (this.state.privateModeDetected === undefined) { this.state.privateModeDetected = false; } },
              () => { this.state.privateModeDetected = true; }  
            );
          }  
        }
        sessionStorage.setItem('__sessiontest__', '1');
        const sessionValue = sessionStorage.getItem('__sessiontest__');
        sessionStorage.removeItem('__sessiontest__');
        if (!sessionValue) {
          this.state.privateModeDetected = true;
          return true;  
        }
        if (navigator.userAgent.includes('Safari') && !navigator.userAgent.includes('Chrome')) {
          try {
            window.openDatabase(null, null, null, null);
          } catch (e) {
            this.state.privateModeDetected = true;
            return true;
          }
        }
        if (this.state.privateModeDetected === undefined) {
          this.state.privateModeDetected = false;  
        }
        return this.state.privateModeDetected;
      } catch (e) {
        this.state.privateModeDetected = true;
        return true;
      }
    }

    _storageOp(op, val) {
      if (this._isPrivateMode()) return false;
      const ts = Date.now().toString();
      const { storageKey, syncKey, domain, forceCookies } = this.config;
      
      // Pro Firefox použít pouze cookies
      const storages = this.state.isFirefox 
        ? [() => this._getCookieStorage()]
        : [() => localStorage, () => sessionStorage, () => this._getCookieStorage()];
      
      let success = false, result = false;
      for (const getStorage of storages) {
        try {
          const storage = getStorage();
          if (op === 'get') {
            const value = storage.getItem(storageKey);
            if (value === 'true') {
              result = true;
              break;  
            }
          }
          if (op === 'set') {
            storage.setItem(storageKey, 'true');
            storage.setItem(syncKey, ts);
            success = true;
            if (this.state.isFirefox) setTimeout(() => this._triggerSyncEvent(ts), 10);
            break;
          }
          if (op === 'remove') {
            storage.removeItem(storageKey);
            storage.setItem(syncKey, ts);
            success = true;
            if (this.state.isFirefox) setTimeout(() => this._triggerSyncEvent(ts), 10);
            break;
          }  
        } catch (error) {
          this._log(`Storage error: ${error.message}`, 'warn');
        }
      }
      if (op === 'get') return result;
      if (success) {
        this.state.lastSyncValue = ts;
        this._broadcastChange(op, ts);
      }
      return success;    
    }

    _getCookieStorage() {
      const { domain } = this.config;
      return {
        setItem: (k, v) => {
          const maxAge = 365 * 24 * 60 * 60;
          let cookieString = `${k}=${encodeURIComponent(v)}; max-age=${maxAge}; path=/`;
          // Vždy nastavit domain pro Firefox
          cookieString += `; domain=${domain}`;
          cookieString += '; SameSite=Lax';
          if (location.protocol === 'https:') cookieString += '; Secure';
          document.cookie = cookieString;
          this._log(`Cookie set: ${cookieString}`);
        },
        getItem: k => {
          const name = `${k}=`;
          const cookies = document.cookie.split(';');
          for (let cookie of cookies) {
            cookie = cookie.trim();
            if (cookie.startsWith(name)) {
              return decodeURIComponent(cookie.substring(name.length));
            }
          }
          return null;
        },
        removeItem: k => {
          let cookieString = `${k}=; max-age=0; path=/`;
          cookieString += `; domain=${domain}`;
          cookieString += '; SameSite=Lax';
          document.cookie = cookieString;
        }
      };
    }

    _broadcastChange(operation, timestamp) {
      try {
        if (window.BroadcastChannel) {
          const channel = new BroadcastChannel('cookieManager');
          channel.postMessage({ type: 'cookieChange', operation, timestamp, key: this.config.storageKey });
          channel.close();
        }
        const storageEvent = new StorageEvent('storage', {
          key: this.config.storageKey,
          newValue: operation === 'set' ? 'true' : null,
          url: location.href
        });
        setTimeout(() => window.dispatchEvent(storageEvent), this.state.isFirefox ? 100 : 0);
      } catch (error) {
        this._log(`Broadcast error: ${error.message}`, 'warn');
      }
    }

    _triggerSyncEvent(timestamp) {
      try {
        window.dispatchEvent(new CustomEvent('cookieManagerSync', {
          detail: { timestamp, key: this.config.storageKey }
        }));
      } catch (error) {
        this._log(`Sync trigger error: ${error.message}`, 'warn');
      }
    }

    _shouldShowNotice() {
      if (this._isPrivateMode()) {
        try {
          return !sessionStorage.getItem(this.config.storageKey);
        } catch (e) {
          return true;
        }
      }
      
      // Firefox double-check přes cookies
      if (this.state.isFirefox) {
        const cookies = document.cookie;
        const cookieVariants = [
          `${this.config.storageKey}=true`,
          `${this.config.storageKey}=${encodeURIComponent('true')}`
        ];
        for (const variant of cookieVariants) {
          if (cookies.includes(variant)) {
            return false;
          }
        }
      }
      
      return !this._storageOp('get');
    }

    _showNotice() {
      if (!this.elements.cookieNotice) return;
      if (this.showTimeout) clearTimeout(this.showTimeout);
      this.showTimeout = setTimeout(() => {
        this.elements.cookieNotice.classList.add(this.config.showClass);
        this._log('Notice shown');
      }, this.config.showDelay);
    }

    _hideNotice() {
      const { cookieNotice } = this.elements;
      if (cookieNotice) {
        cookieNotice.classList.remove(this.config.showClass);
        this._log('Notice hidden');
      }
    }

    _onAcceptClick() {
      this._hideNotice();
      if (!this._isPrivateMode()) {
        const success = this._storageOp('set');
        this._log(success ? 'Cookies accepted & saved' : 'Failed to save cookies');
      } else {
        try {
          sessionStorage.setItem(this.config.storageKey, 'true');
          this._log('Cookies accepted (private mode - saved to session)');
        } catch (e) {
          this._log('Cookies accepted (private mode - not saved)');
        }
      }
    }

    _checkPrivateMode() {
      // Pro Firefox vždy resetovat detekci
      if (this.state.isFirefox) {
        this.state.privateModeDetected = undefined;
      } else {
        this.state.privateModeDetected = undefined;
      }
      
      const currentPrivateMode = this._isPrivateMode();
      const { lastPrivateMode } = this.state;
      if (lastPrivateMode !== null && lastPrivateMode !== currentPrivateMode) {
        if (currentPrivateMode) {
          this._showNotice();
          this._log('Switched to private mode - showing notice');
        } else {
          this._log('Switched from private mode - checking saved state');
          setTimeout(() => this._updateNoticeState(), 200);
        }
      }
      this.state.lastPrivateMode = currentPrivateMode;
    }

    _updateNoticeState() {
      const shouldShow = this._shouldShowNotice();
      const delay = this.state.isFirefox ? 150 : (shouldShow ? 100 : 200);
      setTimeout(() => {
        const isVisible = this.elements.cookieNotice?.classList.contains(this.config.showClass);
        if (shouldShow !== isVisible) {
          shouldShow ? this._showNotice() : this._hideNotice();
          this._log(shouldShow ? 'Showing notice' : 'Hiding notice');
        }
      }, delay);
    }

    _onWindowFocus() {
      this.state.privateModeDetected = undefined;
      const wasPrivate = this.state.lastPrivateMode;
      const isPrivateNow = this._isPrivateMode();
      if (wasPrivate !== isPrivateNow) {
        this._log('Private mode changed on focus: ' + wasPrivate + ' -> ' + isPrivateNow);
        this.state.lastPrivateMode = isPrivateNow;
        if (isPrivateNow) setTimeout(() => this._showNotice(), 100);
      }
      setTimeout(() => { this._updateNoticeState(); }, this.state.isFirefox ? 200 : 50);
      
      // Firefox extra cross-domain check
      if (this.state.isFirefox) {
        setTimeout(() => this._firefoxCrossDomainCheck(), 100);
      }
    }

    _onStorageEvent(event) {
      if (event.key === this.config.storageKey || event.key === this.config.syncKey) {
        this._log('Storage event received: ' + event.key);
        setTimeout(() => this._updateNoticeState(), this.state.isFirefox ? 100 : 50);
      }
    }

    _startMonitoring() {
      const checkInterval = this.state.isFirefox ? 2000 : this.config.checkInterval;
      const syncInterval = this.state.isFirefox ? 500 : 2000; // Rychlejší sync pro Firefox
      this.intervals.check = setInterval(this.checkPrivateMode, checkInterval);
      this.intervals.sync = setInterval(this.forcedSync, syncInterval);
      this._log(`Monitoring started (check: ${checkInterval}ms, sync: ${syncInterval}ms)`);
    }

    _forcedSync() {
      const { syncKey } = this.config;
      const sources = [
        () => {
          const cookie = document.cookie.split('; ').find(row => row.startsWith(`${syncKey}=`));
          return cookie ? decodeURIComponent(cookie.split('=')[1]) : null;
        },
        () => localStorage.getItem(syncKey),
        () => sessionStorage.getItem(syncKey)
      ];
      for (const getSource of sources) {
        try {
          const syncValue = getSource();
          if (syncValue && syncValue !== this.state.lastSyncValue) {
            this.state.lastSyncValue = syncValue;
            this._log('Forced sync triggered: ' + syncValue);
            const delay = this.state.isFirefox ? 100 : 50;
            setTimeout(() => this._updateNoticeState(), delay);
            return;
          }
        } catch (error) {
          this._log(`Sync source error: ${error.message}`, 'warn');
        }
      }
    }

    _firefoxCrossDomainCheck() {
      if (!this.state.isFirefox) return;
      
      // Zkontroluj všechny možné cookie formáty
      const cookies = document.cookie;
      if (cookies.includes(this.config.storageKey + '=true') || 
          cookies.includes(this.config.storageKey + '=' + encodeURIComponent('true'))) {
        setTimeout(() => this._updateNoticeState(), 50);
      }
    }

    _bindEvents() {
      const { acceptButton } = this.elements;
      if (acceptButton) {
        acceptButton.addEventListener('click', this.handleAcceptClick);
      }
      window.addEventListener('storage', this.handleStorageEvent);
      window.addEventListener('cookieManagerSync', (event) => {
        if (event.detail.key === this.config.storageKey) {
          this._log('Custom sync event received');
          setTimeout(() => this._updateNoticeState(), this.state.isFirefox ? 100 : 50);
        }
      });
      if (window.BroadcastChannel) {
        try {
          this.broadcastChannel = new BroadcastChannel('cookieManager');
          this.broadcastChannel.addEventListener('message', (event) => {
            if (event.data.type === 'cookieChange' && event.data.key === this.config.storageKey) {
              this._log('Broadcast message received');
              setTimeout(() => this._updateNoticeState(), this.state.isFirefox ? 100 : 50);
            }
          });
        } catch (error) {
          this._log('BroadcastChannel not available', 'warn');
        }
      }
      window.addEventListener('focus', this.handleWindowFocus);
      
      // Firefox specifické události
      if (this.state.isFirefox) {
        window.addEventListener('focus', () => {
          setTimeout(() => this._firefoxCrossDomainCheck(), 100);
        });
      }
      
      const focusHandler = () => { if (!document.hidden) this.handleWindowFocus(); };
      document.addEventListener('visibilitychange', focusHandler);
      this._unbindEvents = () => {
        acceptButton?.removeEventListener('click', this.handleAcceptClick);
        window.removeEventListener('storage', this.handleStorageEvent);
        window.removeEventListener('focus', this.handleWindowFocus);
        document.removeEventListener('visibilitychange', focusHandler);
        if (this.broadcastChannel) this.broadcastChannel.close();
        if (this.showTimeout) { clearTimeout(this.showTimeout); this.showTimeout = null; }
        Object.values(this.intervals).forEach(interval => { if (interval) clearInterval(interval); });
        this.intervals = { check: null, sync: null };
      };
      this._log('Events bound');
    }

    _log(message, level = 'info') {
      if (!this.config.enableLogging) return;
      const logMethod = console[level] || console.log;
      logMethod(`[CookieManager${this.state.isFirefox ? ' Firefox' : ''}] ${message}`);
    }

    show() { this._showNotice(); }
    hide() { this._hideNotice(); }
    reset() {
      try {
        this._storageOp('remove');
        try {
          sessionStorage.removeItem(this.config.storageKey);
        } catch (e) {
          // ignore
        }
        setTimeout(() => this._updateNoticeState(), this.state.isFirefox ? 150 : 100);
        this._log('Reset completed');
      } catch (error) {
        this._log('Reset failed: ' + error.message, 'warn');
      }
    }
    refresh() {
      this._cacheElements();
      setTimeout(() => this._updateNoticeState(), this.state.isFirefox ? 100 : 50);
      this._log('Refreshed');
    }
    destroy() {
      if (this._unbindEvents) this._unbindEvents();
      this.elements = {};
      this.isInitialized = false;
      this._log('Destroyed');
    }

    getState() {
      this.state.privateModeDetected = undefined;
      return {
        isInitialized: this.isInitialized,
        isPrivateMode: this._isPrivateMode(),
        isFirefox: this.state.isFirefox,
        isChrome: this.state.isChrome,
        cookiesAccepted: this._storageOp('get'),
        noticeVisible: this.elements.cookieNotice?.classList.contains(this.config.showClass) || false,
        domain: this.config.domain,
        config: this.config 
      };
    }
  }

  let cookieManager;
  document.addEventListener('DOMContentLoaded', function () {
    cookieManager = new CookieManager({
      enableLogging: false,
      firefoxMode: navigator.userAgent.toLowerCase().includes('firefox'),
      forceCookies: navigator.userAgent.toLowerCase().includes('firefox'),
      domain: window.location.hostname.includes('.') ?
        '.' + window.location.hostname.split('.').slice(-2).join('.') :
        window.location.hostname      
    });
    window.showCookieNotice = () => { if (cookieManager) cookieManager.show(); };
    window.hideCookieNotice = () => { if (cookieManager) cookieManager.hide(); };
    window.resetCookies = () => { if (cookieManager) cookieManager.reset(); };
    window.cookieManagerState = () => cookieManager ? cookieManager.getState() : null;
  });

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = CookieManager;
  }
  if (typeof window !== 'undefined') {
    window.CookieManager = CookieManager;
  }
})();




/*/**
 * CookieManager - Správa souhlasů cookie
 * 
 * Spravuje zobrazování cookie notifikací s detekcí anonymního režimu
 a fallback mechanismem pro různé typy úložišť. 
 * 
 * Klíčové funkce:  
 * • Detekce incognito/private mode s okamžitou reakcí
 * • Cascading storage: localStorage → sessionStorage → cookies
 * • Synchronizace změn mezi okny a taby
 * • Konfigurovatelný timing a zobrazení
 * • Fallback mechanismy pro prohlížeče s omezeními
 * • Kompletní lifecycle management
 * 
 * @author Michaela Gažová
 * @version 2.2.0
 * @license MIT
 */

/*
//this metoda
class CookieManager {
    constructor(options = {}) {
        this.config = {
            showDelay: options.showDelay || 1000,
            checkInterval: options.checkInterval || 1500,
            enableLogging: options.enableLogging || false,
            showClass: options.showClass || 'show',
            storageKey: options.storageKey || 'cookiesAccepted',
            syncKey: options.syncKey || 'cookiesSync',
            cookieNoticeSelector: options.cookieNoticeSelector || '#cookiesMiniNotice',
            acceptButtonSelector: options.acceptButtonSelector || '#acceptCookies',
            ...options
        };

        this.elements = {};
        this.showTimeout = null;
        this.intervals = { check: null, sync: null };
        this.isInitialized = false;
        this.state = { lastPrivateMode: null, lastSyncValue: null };

        this.handleAcceptClick = this.handleAcceptClick.bind(this);
        this.checkPrivateMode = this.checkPrivateMode.bind(this);
        this.forcedSync = this.forcedSync.bind(this);
        this.handleWindowFocus = this.handleWindowFocus.bind(this);

        this.init();
    }

    init() {
        try {
            this.cacheElements();
            this.validateElements();
            this.bindEvents();
            this.startMonitoring();
            
            if (this.shouldShowNotice()) {
                this.showNotice();
            }
            
            this.isInitialized = true;
            this.log('Initialized');
        } catch (error) {
            console.error('Cookie manager init failed:', error);
        }
    }

    cacheElements() {
        const { cookieNoticeSelector, acceptButtonSelector } = this.config;
        
        this.elements = {
            cookieNotice: document.querySelector(cookieNoticeSelector),
            acceptButton: document.querySelector(acceptButtonSelector)
        };
    }

    validateElements() {
        if (!this.elements.cookieNotice) {
            throw new Error(`Cookie notice not found: ${this.config.cookieNoticeSelector}`);
        }
    }

    // Test incognito režimu 
    isPrivateMode() {
        try { 
            localStorage.setItem('__test__', '1'); 
            localStorage.removeItem('__test__'); 
            return false; 
        } catch { 
            return true; 
        }
    }

    // Fallback localStorage → sessionStorage → cookies
    storageOp(op, val) {
        const ts = Date.now().toString();
        const { storageKey, syncKey } = this.config;
        
        const storages = [
            () => localStorage,
            () => sessionStorage,
            () => ({
                // Fallback na cookies
                setItem: (k, v) => {
                    const maxAge = 365 * 24 * 60 * 60; // Rok v sekundách
                    document.cookie = `${k}=${encodeURIComponent(v)}; max-age=${maxAge}; path=/; SameSite=Lax; Secure=${location.protocol === 'https:'}`;
                },
                getItem: k => {
                    const name = `${k}=`;
                    const cookies = document.cookie.split(';');
                    
                    for (let cookie of cookies) {
                        cookie = cookie.trim();
                        if (cookie.startsWith(name)) {
                            return decodeURIComponent(cookie.substring(name.length));
                        }
                    }
                    return null;
                },
                removeItem: k => {
                    document.cookie = `${k}=; max-age=0; path=/; SameSite=Lax`; 
                }
            })
        ];

        let success = false;
        
        for (const getStorage of storages) {
            try {
                const storage = getStorage();
                
                if (op === 'get' && storage.getItem(storageKey) === 'true') {
                    return true;
                }
                
                if (op === 'set') { 
                    storage.setItem(storageKey, 'true'); 
                    storage.setItem(syncKey, ts); // Synchronizace změn mezi okny/taby
                    success = true;
                    break;
                }
                
                if (op === 'remove') { 
                    storage.removeItem(storageKey); 
                    storage.setItem(syncKey, ts); 
                    success = true;
                    break;
                }
            } catch (error) {
            }
        }

        if (op === 'get') return false;
        
        if (success) {
            this.state.lastSyncValue = ts;
            const storageEvent = new StorageEvent('storage', { 
                key: storageKey, 
                newValue: op === 'set' ? 'true' : null, 
                url: location.href 
            });
            // Manuální spuštění storage eventu
            window.dispatchEvent(storageEvent);
        }
    }

    shouldShowNotice() { 
        return this.isPrivateMode() || !this.storageOp('get'); 
    }

    showNotice() {
        if (!this.elements.cookieNotice) return;
        
        if (this.showTimeout) {
            clearTimeout(this.showTimeout);
        }
        
        this.showTimeout = setTimeout(() => {
            this.elements.cookieNotice.classList.add(this.config.showClass);
            this.log('Shown');
        }, this.config.showDelay);
    }

    hideNotice() {
        const { cookieNotice } = this.elements;
        
        if (cookieNotice) {
            cookieNotice.classList.remove(this.config.showClass);
            this.log('Hidden');
        }
    }

    handleAcceptClick() {
        this.hideNotice();
        
        if (!this.isPrivateMode()) {
            this.storageOp('set');
            this.log('Accepted & saved');
        } else {
            this.log('Accepted (private mode)');
        }
    }

    checkPrivateMode() {
        const currentPrivateMode = this.isPrivateMode();
        const { lastPrivateMode } = this.state;
        
        if (lastPrivateMode !== null && lastPrivateMode !== currentPrivateMode && currentPrivateMode) {
            this.showNotice();
            this.log('Switched to private');
        }
        
        this.state.lastPrivateMode = currentPrivateMode;
    }

    updateNoticeState() {
        const shouldShow = this.shouldShowNotice();
        const delay = shouldShow ? 100 : 200;
        
        setTimeout(() => {
            const isVisible = this.elements.cookieNotice?.classList.contains(this.config.showClass);
            
            if (shouldShow !== isVisible) {
                shouldShow ? this.showNotice() : this.hideNotice();
                this.log(shouldShow ? 'Showing' : 'Hiding');
            }
        }, delay);
    }

    handleWindowFocus() { 
        this.updateNoticeState(); 
    }

    startMonitoring() {
        this.intervals.check = setInterval(this.checkPrivateMode, this.config.checkInterval);
        this.intervals.sync = setInterval(this.forcedSync, 2000);
        this.log('Monitoring started');
    }

    // Fallback kontrola stavu z více úložišť
    forcedSync() {
        const { syncKey } = this.config;
        
        const sources = [
            () => localStorage.getItem(syncKey),
            () => sessionStorage.getItem(syncKey),
            () => {
                const cookie = document.cookie
                    .split('; ')
                    .find(row => row.startsWith(`${syncKey}=`));
                return cookie ? cookie.split('=')[1] : null;
            }
        ];

        for (const getSource of sources) {
            try {
                const syncValue = getSource();
                
                if (syncValue && syncValue !== this.state.lastSyncValue) {
                    this.state.lastSyncValue = syncValue;
                    // Krátké zpoždění pro synchronizaci
                    setTimeout(() => this.updateNoticeState(), 50);
                    return;
                }
            } catch (error) {
            }
        }
    }

    bindEvents() {
        const { acceptButton } = this.elements;
        
        if (acceptButton) {
            acceptButton.addEventListener('click', this.handleAcceptClick);
        }

        const storageHandler = (event) => { 
            if (event.key === this.config.storageKey) {
                this.updateNoticeState(); 
            }
        };
        
        const focusHandler = () => { 
            if (!document.hidden) {
                this.handleWindowFocus(); 
            }
        };

        window.addEventListener('storage', storageHandler);
        window.addEventListener('focus', this.handleWindowFocus);
        document.addEventListener('visibilitychange', focusHandler);

        this.unbindEvents = () => {
            acceptButton?.removeEventListener('click', this.handleAcceptClick);
            window.removeEventListener('storage', storageHandler);
            window.removeEventListener('focus', this.handleWindowFocus);
            document.removeEventListener('visibilitychange', focusHandler);
            
            if (this.showTimeout) { 
                clearTimeout(this.showTimeout); 
                this.showTimeout = null; 
            }
            
            Object.values(this.intervals).forEach(interval => {
                if (interval) clearInterval(interval);
            });
            
            this.intervals = { check: null, sync: null };
        };

        this.log('Events bound');
    }

    show() { 
        this.showNotice(); 
    }
    
    hide() { 
        this.hideNotice(); 
    }
    
    reset() { 
        try { 
            this.storageOp('remove'); 
            this.updateNoticeState(); 
            this.log('Reset'); 
        } catch (error) { 
            this.log('Reset failed', 'warn'); 
        } 
    }
    
    refresh() { 
        this.cacheElements(); 
        this.updateNoticeState(); 
        this.log('Refreshed'); 
    }
    
    destroy() { 
        this.unbindEvents(); 
        this.elements = {}; 
        this.isInitialized = false; 
        this.log('Destroyed'); 
    }
    
    log(message, level = 'info') { 
        if (!this.config.enableLogging) return;
        
        const logMethod = console[level] || console.log;
        logMethod(`[CookieManager] ${message}`); 
    }

    getState() {
        return {
            isInitialized: this.isInitialized,
            isPrivateMode: this.isPrivateMode(),
            cookiesAccepted: this.storageOp('get'),
            noticeVisible: this.elements.cookieNotice?.classList.contains(this.config.showClass) || false,
            config: this.config
        };
    }
}

let cookieManager;

document.addEventListener('DOMContentLoaded', () => {
    cookieManager = new CookieManager({ 
        enableLogging: false 
    });
    
    Object.assign(window, {
        showCookieNotice: () => cookieManager?.show(),
        hideCookieNotice: () => cookieManager?.hide(),
        resetCookies: () => cookieManager?.reset()
    });
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = CookieManager;
}

if (typeof window !== 'undefined') {
    window.CookieManager = CookieManager;
}

*/