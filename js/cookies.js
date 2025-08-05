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

        // Bind methods
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

    isPrivateMode() {
        try { 
            localStorage.setItem('__test__', '1'); 
            localStorage.removeItem('__test__'); 
            return false; 
        } catch { 
            return true; 
        }
    }

    storageOp(op, val) {
        const ts = Date.now().toString();
        const { storageKey, syncKey } = this.config;
        
        const storages = [
            () => localStorage,
            () => sessionStorage,
            () => ({
                setItem: (k, v) => {
                    // Set cookie with 1 year expiration
                    const maxAge = 365 * 24 * 60 * 60; // 1 year in seconds
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
                    // Properly remove cookie by setting max-age=0
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
                    storage.setItem(syncKey, ts); 
                    success = true;
                    break; // Stop after first successful storage
                }
                
                if (op === 'remove') { 
                    storage.removeItem(storageKey); 
                    storage.setItem(syncKey, ts); 
                    success = true;
                    break; // Stop after first successful removal
                }
            } catch (error) {
                // Continue to next storage option
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
                    setTimeout(() => this.updateNoticeState(), 50);
                    return;
                }
            } catch (error) {
                // Silent fail
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

        // Store unbind function
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

    // Public API methods
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
    
    // Global helper functions
    Object.assign(window, {
        showCookieNotice: () => cookieManager?.show(),
        hideCookieNotice: () => cookieManager?.hide(),
        resetCookies: () => cookieManager?.reset()
    });
});

// Module exports
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CookieManager;
}

if (typeof window !== 'undefined') {
    window.CookieManager = CookieManager;
}