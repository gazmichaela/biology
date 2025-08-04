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

        ['handleAcceptClick', 'checkPrivateMode', 'forcedSync', 'handleWindowFocus'].forEach(method => {
            this[method] = this[method].bind(this);
        });

        this.init();
    }

    init() {
        try {
            this.cacheElements();
            if (!this.elements.cookieNotice) throw new Error(`Cookie notice not found: ${this.config.cookieNoticeSelector}`);
            this.bindEvents();
            this.startMonitoring();
            if (this.shouldShowNotice()) this.showNotice();
            this.isInitialized = true;
            this.log('Initialized');
        } catch (error) {
            console.error('Cookie manager init failed:', error);
        }
    }

    cacheElements() {
        this.elements = {
            cookieNotice: document.querySelector(this.config.cookieNoticeSelector),
            acceptButton: document.querySelector(this.config.acceptButtonSelector)
        };
    }

    isPrivateMode() {
        try { localStorage.setItem('__test__', '1'); localStorage.removeItem('__test__'); return false; } catch { return true; }
    }

    storageOp(op, val) {
        const ts = Date.now().toString();
        const storages = [
            () => localStorage,
            () => sessionStorage,
            () => ({
                setItem: (k, v) => {
                    const exp = new Date(); exp.setFullYear(exp.getFullYear() + 1);
                    document.cookie = `${k}=${v}; expires=${exp.toUTCString()}; path=/; SameSite=Lax`;
                },
                getItem: k => (document.cookie.split('; ').find(r => r.startsWith(k + '=')) || '').split('=')[1] || null,
                removeItem: k => document.cookie = `${k}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
            })
        ];

        let success = false;
        for (const getStorage of storages) {
            try {
                const s = getStorage();
                if (op === 'get' && s.getItem(this.config.storageKey) === 'true') return true;
                if (op === 'set') { s.setItem(this.config.storageKey, 'true'); s.setItem(this.config.syncKey, ts); success = true; }
                if (op === 'remove') { s.removeItem(this.config.storageKey); s.setItem(this.config.syncKey, ts); success = true; }
            } catch {}
        }

        if (op === 'get') return false;
        if (success) {
            this.state.lastSyncValue = ts;
            window.dispatchEvent(new StorageEvent('storage', { key: this.config.storageKey, newValue: op === 'set' ? 'true' : null, url: location.href }));
        }
    }

    shouldShowNotice() { return this.isPrivateMode() || !this.storageOp('get'); }

    showNotice() {
        if (!this.elements.cookieNotice) return;
        if (this.showTimeout) clearTimeout(this.showTimeout);
        this.showTimeout = setTimeout(() => {
            this.elements.cookieNotice.classList.add(this.config.showClass);
            this.log('Shown');
        }, this.config.showDelay);
    }

    hideNotice() {
        if (this.elements.cookieNotice) {
            this.elements.cookieNotice.classList.remove(this.config.showClass);
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
        const curr = this.isPrivateMode();
        if (this.state.lastPrivateMode !== null && this.state.lastPrivateMode !== curr && curr) {
            this.showNotice();
            this.log('Switched to private');
        }
        this.state.lastPrivateMode = curr;
    }

    updateNoticeState() {
        setTimeout(() => {
            const shouldShow = this.shouldShowNotice();
            const isVisible = this.elements.cookieNotice?.classList.contains(this.config.showClass);
            if (shouldShow !== isVisible) {
                shouldShow ? this.showNotice() : this.hideNotice();
                this.log(shouldShow ? 'Showing' : 'Hiding');
            }
        }, shouldShow ? 100 : 200);
    }

    handleWindowFocus() { this.updateNoticeState(); }

    startMonitoring() {
        this.intervals.check = setInterval(this.checkPrivateMode, this.config.checkInterval);
        this.intervals.sync = setInterval(this.forcedSync, 2000);
        this.log('Monitoring started');
    }

    forcedSync() {
        const sources = [
            () => localStorage.getItem(this.config.syncKey),
            () => sessionStorage.getItem(this.config.syncKey),
            () => (document.cookie.split('; ').find(r => r.startsWith(this.config.syncKey + '=')) || '').split('=')[1] || null
        ];

        for (const getSrc of sources) {
            try {
                const syncVal = getSrc();
                if (syncVal && syncVal !== this.state.lastSyncValue) {
                    this.state.lastSyncValue = syncVal;
                    setTimeout(() => this.updateNoticeState(), 50);
                    return;
                }
            } catch {}
        }
    }

    bindEvents() {
        if (this.elements.acceptButton) {
            this.elements.acceptButton.addEventListener('click', this.handleAcceptClick);
        }

        const storageHandler = (e) => { if (e.key === this.config.storageKey) this.updateNoticeState(); };
        const focusHandler = () => { if (!document.hidden) this.handleWindowFocus(); };

        window.addEventListener('storage', storageHandler);
        window.addEventListener('focus', this.handleWindowFocus);
        document.addEventListener('visibilitychange', focusHandler);

        this.unbindEvents = () => {
            this.elements.acceptButton?.removeEventListener('click', this.handleAcceptClick);
            window.removeEventListener('storage', storageHandler);
            window.removeEventListener('focus', this.handleWindowFocus);
            document.removeEventListener('visibilitychange', focusHandler);
            if (this.showTimeout) { clearTimeout(this.showTimeout); this.showTimeout = null; }
            Object.values(this.intervals).forEach(i => i && clearInterval(i));
            this.intervals = { check: null, sync: null };
        };

        this.log('Events bound');
    }

    // API
    show() { this.showNotice(); }
    hide() { this.hideNotice(); }
    reset() { try { this.storageOp('remove'); this.updateNoticeState(); this.log('Reset'); } catch { this.log('Reset failed', 'warn'); } }
    refresh() { this.cacheElements(); this.updateNoticeState(); this.log('Refreshed'); }
    destroy() { this.unbindEvents(); this.elements = {}; this.isInitialized = false; this.log('Destroyed'); }
    
    log(msg, lvl = 'info') { if (this.config.enableLogging) (console[lvl] || console.log)(`[CookieManager] ${msg}`); }

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
    cookieManager = new CookieManager({ enableLogging: true });
    Object.assign(window, {
        showCookieNotice: () => cookieManager?.show(),
        hideCookieNotice: () => cookieManager?.hide(),
        resetCookies: () => cookieManager?.reset(),
        debugCookieState: () => {
            console.log('State:', cookieManager?.getState());
            console.log('localStorage:', localStorage.getItem('cookiesAccepted'));
            console.log('sessionStorage:', sessionStorage.getItem('cookiesAccepted'));
            console.log('cookie:', document.cookie);
        }
    });
});

if (typeof module !== 'undefined' && module.exports) module.exports = CookieManager;
if (typeof window !== 'undefined') window.CookieManager = CookieManager;