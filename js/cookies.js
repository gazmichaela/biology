/**
 * CookieManager - Správa cookies souhlasů
 *
 * Řešení pro cookie notifikace s automatickou detekcí anonymního režimu.
 * Zajišťuje synchronizaci stavu napříč taby v prohlížeči a poskytuje fallback mechanismy pro různé storage možnosti.
 *
 * @fileoverview Automatický systém správy cookie notifikací s cross-tab synchronizací
 * @author Michaela Gažová
 * @version 3.2.2
 * @since 2025-05-10
 * @updated 2026-03-15
 * @license MIT
 */



(function () {
  class CookieManager {
    constructor(options = {}) {
      this.config = {
        showDelay: options.showDelay || 1000,
        checkInterval: options.checkInterval || 1500,
        showClass: options.showClass || "show",
        storageKey: options.storageKey || "cookiesAccepted",
        syncKey: options.syncKey || "cookiesSync",
        cookieNoticeSelector:
          options.cookieNoticeSelector || "#cookiesMiniNotice",
        acceptButtonSelector: options.acceptButtonSelector || "#acceptCookies",
        domain: options.domain || this._getDomain(),
        forceCookies: options.forceCookies || false,
        // Firefox má problém s rychlým přepínáním mezi anonymním a normálním režimem
        firefoxMode: options.firefoxMode !== false,
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
        privateModeDetected: false,
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
      } catch (error) {
        console.error(`Cookie manager init failed:`, error);
      }
    }

    _cacheElements() {
      const { cookieNoticeSelector, acceptButtonSelector } = this.config;
      this.elements = {
        cookieNotice: document.querySelector(cookieNoticeSelector),
        acceptButton: document.querySelector(acceptButtonSelector),
      };
    }

    _validateElements() {
      if (!this.elements.cookieNotice) {
        throw new Error(
          `Cookie notice not found: ${this.config.cookieNoticeSelector}`,
        );
      }
    }

    _getDomain() {
      const hostname = window.location.hostname;
      const parts = hostname.split(".");
      if (parts.length > 2) {
        return "." + parts.slice(-2).join(".");
      }
      return hostname;
    }

    _isFirefox() {
      return navigator.userAgent.toLowerCase().includes("firefox");
    }

    _isChrome() {
      return (
        navigator.userAgent.toLowerCase().includes("chrome") &&
        !navigator.userAgent.toLowerCase().includes("edg")
      );
    }

    _isPrivateMode() {
      if (this.state.privateModeDetected !== undefined) {
        return this.state.privateModeDetected;
      }
      try {
        localStorage.setItem("__test__", "1");
        const testValue = localStorage.getItem("__test__");
        localStorage.removeItem("__test__");
        if (!testValue) {
          this.state.privateModeDetected = true;
          return true;
        }
        if (this.state.isChrome) {
          // Chrome v anonymním režimu má limit uložiště
          if (!window.indexedDB) {
            this.state.privateModeDetected = true;
            return true;
          }
          if ("storage" in navigator && "estimate" in navigator.storage) {
            navigator.storage
              .estimate()
              .then((estimate) => {
                if (estimate.quota < 50 * 1024 * 1024) {
                  this.state.privateModeDetected = true;
                }
              })
              .catch(() => {
                this.state.privateModeDetected = true;
              });
          }
          if (window.RTCPeerConnection) {
            try {
              const pc = new RTCPeerConnection({
                iceServers: [{ urls: "stun:stun.1.google.com:19302" }],
              });
              pc.createDataChannel("test");
              pc.close();
            } catch (e) {
              if (
                e.name === "NotSupportedError" ||
                e.name === "NotAllowedError"
              ) {
                this.state.privateModeDetected = true;
                return true;
              }
            }
          }
          if (window.webkitRequestFileSystem) {
            window.webkitRequestFileSystem(
              window.TEMPORARY,
              1,
              () => {
                if (this.state.privateModeDetected === undefined) {
                  this.state.privateModeDetected = false;
                }
              },
              () => {
                this.state.privateModeDetected = true;
              },
            );
          }
        }
        sessionStorage.setItem("__sessiontest__", "1");
        const sessionValue = sessionStorage.getItem("__sessiontest__");
        sessionStorage.removeItem("__sessiontest__");
        if (!sessionValue) {
          this.state.privateModeDetected = true;
          return true;
        }
        // Safari má vlastní způsob detekce anonymního režimu
        if (
          navigator.userAgent.includes("Safari") &&
          !navigator.userAgent.includes("Chrome")
        ) {
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
      // Firefox preferuje cookies kvůli localStorage bugům v anonymním režimu
      const storages =
        this.state.isFirefox || forceCookies
          ? [
              () => this._getCookieStorage(),
              () => localStorage,
              () => sessionStorage,
            ]
          : [
              () => localStorage,
              () => sessionStorage,
              () => this._getCookieStorage(),
            ];
      let success = false,
        result = false;
      for (const getStorage of storages) {
        try {
          const storage = getStorage();
          if (op === "get") {
            const value = storage.getItem(storageKey);
            if (value === "true") {
              result = true;
              break;
            }
          }
          if (op === "set") {
            storage.setItem(storageKey, "true");
            storage.setItem(syncKey, ts);
            success = true;
            if (this.state.isFirefox)
              setTimeout(() => this._triggerSyncEvent(ts), 10);
            break;
          }
          if (op === "remove") {
            storage.removeItem(storageKey);
            storage.setItem(syncKey, ts);
            success = true;
            if (this.state.isFirefox)
              setTimeout(() => this._triggerSyncEvent(ts), 10);
            break;
          }
        } catch (error) {
          console.error(`Storage error: ${error.message}`);
        }
      }
      if (op === "get") return result;
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
          let cookieString = `${k}=${encodeURIComponent(
            v,
          )}; max-age=${maxAge}; path=/`;

          // Pro Firefox NIKDY nepřidávat domain
          if (
            !this.state.isFirefox &&
            domain &&
            !domain.includes("localhost") &&
            !domain.includes("127.0.0.1")
          ) {
            cookieString += `; domain=${domain}`;
          }

          cookieString += "; SameSite=Lax";
          if (location.protocol === "https:") cookieString += "; Secure";
          document.cookie = cookieString;
        },
        getItem: (k) => {
          const name = `${k}=`;
          const cookies = document.cookie.split(";");
          for (let cookie of cookies) {
            cookie = cookie.trim();
            if (cookie.startsWith(name)) {
              return decodeURIComponent(cookie.substring(name.length));
            }
          }
          return null;
        },
        removeItem: (k) => {
          let cookieString = `${k}=; max-age=0; path=/`;

          // Pro Firefox NIKDY nepřidávat domain
          if (
            !this.state.isFirefox &&
            domain &&
            !domain.includes("localhost") &&
            !domain.includes("127.0.0.1")
          ) {
            cookieString += `; domain=${domain}`;
          }

          cookieString += "; SameSite=Lax";
          document.cookie = cookieString;
        },
      };
    }

    _broadcastChange(operation, timestamp) {
      try {
        if (window.BroadcastChannel) {
          const channel = new BroadcastChannel("cookieManager");
          channel.postMessage({
            type: "cookieChange",
            operation,
            timestamp,
            key: this.config.storageKey,
          });
          channel.close();
        }
        const storageEvent = new StorageEvent("storage", {
          key: this.config.storageKey,
          newValue: operation === "set" ? "true" : null,
          url: location.href,
        });
        setTimeout(
          () => window.dispatchEvent(storageEvent),
          this.state.isFirefox ? 100 : 0,
        );
      } catch (error) {
        console.error(`Broadcast error: ${error.message}`);
      }
    }

    _triggerSyncEvent(timestamp) {
      try {
        window.dispatchEvent(
          new CustomEvent("cookieManagerSync", {
            detail: { timestamp, key: this.config.storageKey },
          }),
        );
      } catch (error) {
        console.error(`Sync trigger error: ${error.message}`);
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
      return !this._storageOp("get");
    }

    _showNotice() {
      if (!this.elements.cookieNotice) return;
      if (this.showTimeout) clearTimeout(this.showTimeout);
      this.showTimeout = setTimeout(() => {
        this.elements.cookieNotice.classList.add(this.config.showClass);
      }, this.config.showDelay);
    }

    _hideNotice() {
      const { cookieNotice } = this.elements;
      if (cookieNotice) {
        cookieNotice.classList.remove(this.config.showClass);
      }
    }

    _onAcceptClick() {
      this._hideNotice();
      if (!this._isPrivateMode()) {
        this._storageOp("set");
      } else {
        try {
          sessionStorage.setItem(this.config.storageKey, "true");
        } catch (e) {
          console.error(`Failed to save cookies to session: ${e.message}`);
        }
      }
    }

    _checkPrivateMode() {
      this.state.privateModeDetected = undefined;
      const currentPrivateMode = this._isPrivateMode();
      const { lastPrivateMode } = this.state;
      if (lastPrivateMode !== null && lastPrivateMode !== currentPrivateMode) {
        if (currentPrivateMode) {
          this._showNotice();
        } else {
          setTimeout(() => this._updateNoticeState(), 200);
        }
      }
      this.state.lastPrivateMode = currentPrivateMode;
    }

    _updateNoticeState() {
      const shouldShow = this._shouldShowNotice();
      const delay = this.state.isFirefox ? 150 : shouldShow ? 100 : 200;
      setTimeout(() => {
        const isVisible = this.elements.cookieNotice?.classList.contains(
          this.config.showClass,
        );
        if (shouldShow !== isVisible) {
          shouldShow ? this._showNotice() : this._hideNotice();
        }
      }, delay);
    }

    _onWindowFocus() {
      this.state.privateModeDetected = undefined;
      const wasPrivate = this.state.lastPrivateMode;
      const isPrivateNow = this._isPrivateMode();
      if (wasPrivate !== isPrivateNow) {
        this.state.lastPrivateMode = isPrivateNow;
        if (isPrivateNow) setTimeout(() => this._showNotice(), 100);
      }
      setTimeout(
        () => {
          this._updateNoticeState();
        },
        this.state.isFirefox ? 200 : 50,
      );
    }

    _onStorageEvent(event) {
      if (
        event.key === this.config.storageKey ||
        event.key === this.config.syncKey
      ) {
        setTimeout(
          () => this._updateNoticeState(),
          this.state.isFirefox ? 100 : 50,
        );
      }
    }

    _startMonitoring() {
      const checkInterval = this.state.isFirefox
        ? 2000
        : this.config.checkInterval;
      const syncInterval = this.state.isFirefox ? 3000 : 2000;
      this.intervals.check = setInterval(this.checkPrivateMode, checkInterval);
      this.intervals.sync = setInterval(this.forcedSync, syncInterval);
    }

    _forcedSync() {
      const { syncKey } = this.config;
      const sources = [
        () => {
          const cookie = document.cookie
            .split("; ")
            .find((row) => row.startsWith(`${syncKey}=`));
          return cookie ? decodeURIComponent(cookie.split("=")[1]) : null;
        },
        () => localStorage.getItem(syncKey),
        () => sessionStorage.getItem(syncKey),
      ];
      for (const getSource of sources) {
        try {
          const syncValue = getSource();
          if (syncValue && syncValue !== this.state.lastSyncValue) {
            this.state.lastSyncValue = syncValue;
            const delay = this.state.isFirefox ? 100 : 50;
            setTimeout(() => this._updateNoticeState(), delay);
            return;
          }
        } catch (error) {
          console.error(`Sync source error: ${error.message}`);
        }
      }
    }

    _bindEvents() {
      const { acceptButton } = this.elements;
      if (acceptButton) {
        acceptButton.addEventListener("click", this.handleAcceptClick);
      }
      window.addEventListener("storage", this.handleStorageEvent);
      window.addEventListener("cookieManagerSync", (event) => {
        if (event.detail.key === this.config.storageKey) {
          setTimeout(
            () => this._updateNoticeState(),
            this.state.isFirefox ? 100 : 50,
          );
        }
      });
      if (window.BroadcastChannel) {
        this.broadcastChannel = new BroadcastChannel("cookieManager");
        this.broadcastChannel.addEventListener("message", (event) => {
          if (
            event.data.type === "cookieChange" &&
            event.data.key === this.config.storageKey
          ) {
            setTimeout(
              () => this._updateNoticeState(),
              this.state.isFirefox ? 100 : 50,
            );
          }
        });
      }
      // Fallback na storage events pro starší prohlížeče
      window.addEventListener("focus", this.handleWindowFocus);
      const focusHandler = () => {
        if (!document.hidden) this.handleWindowFocus();
      };
      document.addEventListener("visibilitychange", focusHandler);
      this._unbindEvents = () => {
        acceptButton?.removeEventListener("click", this.handleAcceptClick);
        window.removeEventListener("storage", this.handleStorageEvent);
        window.removeEventListener("focus", this.handleWindowFocus);
        document.removeEventListener("visibilitychange", focusHandler);
        if (this.broadcastChannel) this.broadcastChannel.close();
        if (this.showTimeout) {
          clearTimeout(this.showTimeout);
          this.showTimeout = null;
        }
        Object.values(this.intervals).forEach((interval) => {
          if (interval) clearInterval(interval);
        });
        this.intervals = { check: null, sync: null };
      };
    }

    show() {
      this._showNotice();
    }
    hide() {
      this._hideNotice();
    }
    reset() {
      try {
        this._storageOp("remove");
        try {
          sessionStorage.removeItem(this.config.storageKey);
        } catch (e) {
          console.error(`SessionStorage cleanup failed: ${e.message}`);
        }
        setTimeout(
          () => this._updateNoticeState(),
          this.state.isFirefox ? 150 : 100,
        );
      } catch (error) {
        console.error(`Reset failed: ${error.message}`);
      }
    }
    refresh() {
      this._cacheElements();
      setTimeout(
        () => this._updateNoticeState(),
        this.state.isFirefox ? 100 : 50,
      );
    }
    destroy() {
      if (this._unbindEvents) this._unbindEvents();
      this.elements = {};
      this.isInitialized = false;
    }

    getState() {
      this.state.privateModeDetected = undefined;
      return {
        isInitialized: this.isInitialized,
        isPrivateMode: this._isPrivateMode(),
        isFirefox: this.state.isFirefox,
        isChrome: this.state.isChrome,
        cookiesAccepted: this._storageOp("get"),
        noticeVisible:
          this.elements.cookieNotice?.classList.contains(
            this.config.showClass,
          ) || false,
        domain: this.config.domain,
        config: this.config,
      };
    }
  }

  let cookieManager;
  document.addEventListener("DOMContentLoaded", function () {
    cookieManager = new CookieManager({
      firefoxMode: navigator.userAgent.toLowerCase().includes("firefox"),
      forceCookies: navigator.userAgent.toLowerCase().includes("firefox"),
      domain: window.location.hostname.includes(".")
        ? "." + window.location.hostname.split(".").slice(-2).join(".")
        : window.location.hostname,
    });
    window.showCookieNotice = () => {
      if (cookieManager) cookieManager.show();
    };
    window.hideCookieNotice = () => {
      if (cookieManager) cookieManager.hide();
    };
    window.resetCookies = () => {
      if (cookieManager) cookieManager.reset();
    };
    window.cookieManagerState = () =>
      cookieManager ? cookieManager.getState() : null;
  });

  if (typeof module !== "undefined" && module.exports) {
    module.exports = CookieManager;
  }
  if (typeof window !== "undefined") {
    window.CookieManager = CookieManager;
  }
})();

/* (tento script používá formátování prettier) */