(function () {
  class PdfViewerManager {
    constructor(config, options = {}) {
      if (!config) throw new Error("PDF viewer configuration is required");
      
      this.config = {
        showBtnId: config.showBtnId,
        overlayId: config.overlayId,
        closeBtnId: config.closeBtnId,
        frameId: config.frameId,
        pdfPath: config.pdfPath,
        viewerName: config.viewerName || "PDF Viewer",
        loadingTimeoutDuration: options.loadingTimeoutDuration || 4000,
        maxLoadAttempts: options.maxLoadAttempts || 2,
        enableLogging: options.enableLogging || false,
        enableTouch: options.enableTouch !== false,
        enableKeyboard: options.enableKeyboard !== false
      };

      this.state = {
        isPdfOpen: false,
        pdfHasFocus: false,
        isMobile: false,
        fallbackShown: false,
        pdfLoadAttempts: 0,
        isInitialized: false,
      };

      this.elements = {};
      this.timeouts = { loading: null };
      this.touchData = { startY: 0, startX: 0, moved: false };


      this.handleKeydown = this.handleKeydown.bind(this);
      this.handleTouchStart = this.handleTouchStart.bind(this);
      this.handleTouchMove = this.handleTouchMove.bind(this);
      this.handleTouchEnd = this.handleTouchEnd.bind(this);
      this.handleResize = this.handleResize.bind(this);
      this.openPdfViewer = this.openPdfViewer.bind(this);
      this.closePdfViewer = this.closePdfViewer.bind(this);
      this.handleOverlayClick = this.handleOverlayClick.bind(this);

      this.init();
    }

    init() {
      try {
        this._cacheElements();
        this._validateElements();
        this._createGlobalRetryFunctions();
        this.bindEvents();
        this.state.isInitialized = true;
        this.log(`PDF viewer "${this.config.viewerName}" initialized`);
      } catch (error) {
        console.error(`PDF viewer "${this.config.viewerName}" initialization failed:`, error);
      }  
    }

    _cacheElements() {
      this.elements = {
        showBtn: document.getElementById(this.config.showBtnId),
        overlay: document.getElementById(this.config.overlayId),
        closeBtn: document.getElementById(this.config.closeBtnId),
        frame: document.getElementById(this.config.frameId),
      };  
    }

    _validateElements() {
      const required = ["showBtn", "overlay", "closeBtn", "frame"];
      const missing = required.filter((k) => !this.elements[k]);
      if (!this.elements.showBtn) {
        this.log("Show button not found - viewer skipped");
        return;
      }  
      if (missing.length > 0) {
        throw new Error(`Missing elements: ${missing.join(", ")}`);
      }
    }

    _detectMobile() {
      const ua = navigator.userAgent.toLowerCase();
      const isIOS = /ipad|iphone|ipod/.test(ua);
      const isAndroid = /andriod/.test(ua)
      const isMobile = /mobile|phone|mobi|mini/.test(ua);
      const isTablet = /tablet|ipad|playbook|silk|(puffin(?!.*(IP|AP|WP)))|kindle|nook|kobo/.test(ua);
      const isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0;
      const w = window.innerWidth;
      const isVerySmallScreen = w <= 480;
      return {
        isMobile: isMobile && !isTablet,
        isTablet,
        isMobileOrTablet: isMobile || isTablet,
        isIOS,
        isAndroid,
        isTouchDevice,
        isVerySmallScreen,
        viewportWidth: w,
        viewportHeight: window.innerHeight,
      };
    }

    _checkPdfSupport() {
      return new Promise((resolve) => {
        const mobile = this._detectMobile();
        if (mobile.isIOS || mobile.isVerySmallScreen) return resolve(false);
        if (mobile.isMobileOrTablet) {
          let passed = 0, done = 0, total = 2;
          const frame = document.createElement("iframe");
          frame.style.cssText = "position:absolute;left;-9999px;width:1px;height:1px;opacity:0;";
          frame.src = "data:application/pdf;base64,JVBERi0xLjQKJdPr6eEKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMiAwIFIKPj4KZW5kb2JqCjIgMCBvYmoKPDwKL1R5cGUgL1BhZ2VzCi9LaWRzIFsgMyAwIFIgXQovQ291bnQgMQo+PgplbmRvYmoKMyAwIG9iago8PAovVHlwZSAvUGFnZQovUGFyZW50IDIgMCBSCi9NZWRpYUJveCBbIDAgMCA2MTIgNzkyIF0KPj4KZW5kb2JqCnhyZWYKMCA0CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDAwOSAwMDAwMCBuIAowMDAwMDAwMDU4IDAwMDAwIG4gCjAwMDAwMDAxMTUgMDAwMDAgbiAKdHJhaWxlcgo8PAovU2l6ZSA0Ci9Sb290IDEgMCBSCj4+CnN0YXJ0eHJlZgoxOTQKJSVFT0Y=";
          let resolved = false;
          const finish = () => { done++; if (done >= total) {
            if (document.body.contains(frame)) document.body.removeChild(frame);
            resolve(passed > 0);
          }};
          const t1 = setTimeout(() => { if (!resolved) { resolved = true; finish(); } }, 1000);
          frame.onload = () => { if (!resolved) { resolved = true; clearTimeout(t1); passed++; finish(); }};
          frame.onerror = () => { if (!resolved) { resolved = true; clearTimeout(t1); finish(); }};
          document.body.appendChild(frame);
          setTimeout(() => {
            let m = navigator.mimeTypes && navigator.mimeTypes["application/pdf"] && navigator.mimeTypes["application/pdf"].enabledPlugin;
            if (m) passed++;
            finish();
          }, 200);
        } else resolve(true);
      });  
    }

    _createLoadingIndicator() {
      const loadingDiv = document.createElement("div");
      loadingDiv.id = `${this.config.frameId}_loading`;
      loadingDiv.style.cssText = "position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); background:rgba(255,255,255,0.95); padding:30px; border-radius:12px; box-shadow:0 8px 32px rgba(0,0,0,0.3); text-align:center; z-index:1003; max-width:90%; backdrop-filter:blur(10px);";
      loadingDiv.innerHTML = `<div style="width:40px; height:40px; border:4px solid #f3f3f3; border-top:4px solid #007bff; border-radius:50%; animation:spin 1s linear infinite; margin:0 auto 15px;"></div><h4 style="margin:0 0 10px 0; color: #333; font-size:16px;">Načítám PDF...</h4><p style="margin:0; color: #666; font-size:14px;">Pokud se PDF nenačte, zobrazí se alternativní možnost</p><style>@keyframes spin{0%{transform:rotate(0deg);}100%{transform:rotate(360deg);}}</style>`;
      return loadingDiv;
    }

    _createFallbackButtons() {
      const fallbackDiv = document.createElement("div");
      fallbackDiv.id = `${this.config.frameId}_fallback`;
      fallbackDiv.style.cssText = "position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); background: rgba(255,255,255,0.98); padding:25px; border-radius:16px; box-shadow:0 12px 48px rgba(0,0,0,0.3); text-align:center; z-index:1002; width:min(300px,60vw); max-height:85vh; display:flex; flex-direction:column; justify-content:center; backdrop-filter:blur(20px); border:1px solid rgba(255,255,255,0.3); overflow-y:auto;";
      const mobile = this._detectMobile();
      const downloadUrl = this.config.pdfPath;
      let deviceType = "zařízení";
      if (mobile.isIOS) deviceType = "iOS zařízení";
      else if (mobile.isAndroid) deviceType = "Android zařízení";
      else if (mobile.isTablet) deviceType = "tablet";
      else if (mobile.isMobile) deviceType = "mobilní telefon";
      fallbackDiv.innerHTML = `<h3 style="margin:0 0 15px 0; color: #333; font-size:18px; text-align:center;">PDF viewer</h3>
      <p style="margin: 0 0 20px 0; font-size:15px; color: #555; line-height:1.4;">Vaše ${deviceType} může mít problémy se zobrazováním PDF přímo na stránce. Vyberte si způsob zobrazení:</p>
      <div style="display:flex; flex-direction:column; gap:12px;">
        <a href="${downloadUrl}" target="_blank" style="display:flex; align-items:center; justify-content:center; gap:10px; padding:14px 20px; background: #007bff; color:white; text-decoration:none; border-radius:8px; font-weight:500; transition:all 0.3s; width:100%; box-sizing:border-box; font-size:15px;">Otevřít v novém okně</a>
        <a href="${downloadUrl}" download style="display:flex; align-items:center; justify-content:center; gap:10px; padding:14px 20px; background: #28a745; color:white; text-decoration:none; border-radius:8px; font-weight:500; transition:all 0.3s; width:100%; box-sizing:border-box; font-size:15px;">Stáhnout soubor</a>
        ${this.state.pdfLoadAttempts < this.config.maxLoadAttempts
          ? `<button onclick="window.${this.config.frameId}_retryFromFallback();" style="display:flex; align-items:center; justify-content:center; gap:10px; padding:14px 20px; background: #6c757d; color:white; border:none; border-radius:8px; font-weight:500; cursor:pointer; transition:all 0.3s; width:100%; box-sizing:border-box; font-size:15px;">Zkusit znovu</button>`
          : ""}
      </div>`;
      return fallbackDiv;    
    }

    _applyMobileStyles() {
      const mobile = this._detectMobile();
      if (mobile.isMobileOrTablet) {
        this.elements.frame.style.cssText += "width:100% !important; height:100% !important; border:none !important; position:absolute !important; top:0 !important; left:0 !important; z-index:1001 !important; background:white;";
        this.elements.overlay.style.cssText += "padding:0 !important; background: rgba(0,0,0,0.95) !important; position:fixed !important; top:0 !important; left:0 !important; right:0 !important; bottom:0 !important; z-index:1000 !important;";
        let viewport = document.querySelector('meta[name="viewport"]');
        if (!viewport) {
          viewport = document.createElement("meta");
          viewport.name = "viewport";
          viewport.content = "width=device-width, initial-scale=1.0, user-scalable=yes, minimum-scale=0.5, maximum-scale=3.0";
          document.head.appendChild(viewport);  
        } else {
          viewport.content = "width=device-width, initial-scale=1.0, user-scalable=yes, minimum-scale=0.5, maximum-scale=3.0";   
        }
      }  
    }

    _createGlobalRetryFunctions() {
      window[`${this.config.frameId}_retryLoad`] = () => this.retryLoad();
      window[`${this.config.frameId}_retryFromFallback`] = () => this.retryFromFallback();
    }

    retryLoad() {
      this.state.pdfLoadAttempts++;
      if (this.state.pdfLoadAttempts <= this.config.maxLoadAttempts) {
        const cacheBuster = `?v=${Date.now()}&attempt=${this.state.pdfLoadAttempts}`;
        this.elements.frame.src = `${this.config.pdfPath}${cacheBuster}`;
        this.showLoadingIndicator();
      } else {
        this.showFallbackOptions();
      }
    }

    retryFromFallback() {
      this.hideFallbackOptions();
      this.retryLoad();  
    }

    showLoadingIndicator() {
      this.hideFallbackOptions();
      this.hideLoadingIndicator();
      const loadingDiv = this._createLoadingIndicator();
      this.elements.overlay.appendChild(loadingDiv);
      this.timeouts.loading = setTimeout(() => {
        this.hideLoadingIndicator();
        this.showFallbackOptions();
      }, this.config.loadingTimeoutDuration);
    }

    hideLoadingIndicator() {
      const loadingDiv = document.getElementById(`${this.config.frameId}_loading`);
      if (loadingDiv) loadingDiv.remove();
      if (this.timeouts.loading) {
        clearTimeout(this.timeouts.loading);
        this.timeouts.loading = null;
      }
    }

    hideFallbackOptions() {
      const fallbackDiv = document.getElementById(`${this.config.frameId}_fallback`);
      if (fallbackDiv) fallbackDiv.remove();
      this.state.fallbackShown = false;  
    }

    showFallbackOptions() {
      this.hideLoadingIndicator();
      this.hideFallbackOptions();
      const fallbackDiv = this._createFallbackButtons();
      this.elements.overlay.appendChild(fallbackDiv);
      this.elements.frame.style.display = "none";
      this.state.fallbackShown = true;  
    }

    async openPdfViewer() {
      if (!this.elements.showBtn) {
        this.log("Cannot open PDF - show button not found", "warn");
        return;
      }
      const mobile = this._detectMobile();
      this.state.isMobile = mobile.isMobileOrTablet;
      this.state.fallbackShown = false;
      this.state.pdfLoadAttempts = 0;
      this.elements.overlay.style.display = "block";
      this.state.isPdfOpen = true;
      this._applyMobileStyles();
      document.body.style.overflow = "hidden";
      this.showLoadingIndicator();

      if (this.state.isMobile) {
        const pdfSupported = await this._checkPdfSupport();
        if (!pdfSupported) {
          setTimeout(() => this.showFallbackOptions(), 1500);
          return;  
        }
      }

      this.elements.frame.style.display = "block";
      this.elements.frame.src = `${this.config.pdfPath}?v=${Date.now()}`;
      const loadHandler = () => {
        this.hideLoadingIndicator();
        this.elements.frame.removeEventListener("load", loadHandler);
        this.elements.frame.removeEventListener("error", errorHandler);
      };
      const errorHandler = () => {
        this.elements.frame.removeEventListener("load", loadHandler);
        this.elements.frame.removeEventListener("error", errorHandler);
        this.showFallbackOptions();
      };
      this.elements.frame.addEventListener("load", loadHandler);
      this.elements.frame.addEventListener("error", errorHandler);
      this.log("PDF viewer opened");
    }

    closePdfViewer() {
      if (!this.state.isPdfOpen) return;
      this.elements.overlay.style.display = "none";
      this.elements.frame.src = "";
      this.elements.frame.style.display = "block";
      document.body.style.overflow = "";
      this.hideLoadingIndicator();
      this.hideFallbackOptions();
      this.state.isPdfOpen = false;
      this.state.pdfHasFocus = false;
      this.state.fallbackShown = false;
      this.state.pdfLoadAttempts = 0;
      this.log("PDF viewer closed");   
    }

    handleKeydown(e) {
      if (this.state.isPdfOpen && (e.key === "Escape" || e.keyCode === 27)) {
        this.closePdfViewer();
        e.preventDefault();
        e.stopPropagation();
      }  
    }

    handleTouchStart(e) {
      this.touchData.startY = e.touches[0].clientY;
      this.touchData.startX = e.touches[0].clientX;
      this.touchData.moved = false;  
    }

    handleTouchMove(e) {
      this.touchData.moved = true;  
    }

    handleTouchEnd(e) {
      if (!this.touchData.moved) return;
      const touchEndY = e.changedTouches[0].clientY;
      const touchEndX = e.changedTouches[0].clientX;
      const deltaY = this.touchData.startY - touchEndY;
      const deltaX = Math.abs(this.touchData.startX - touchEndX);
      if (deltaY < -150 && deltaX < 100) {
        if (e.target === this.elements.overlay) this.closePdfViewer();
      } 
    }

    handleOverlayClick(e) {
      if (e.target === this.elements.overlay) {
        this.closePdfViewer();
      }  
    }

    handleResize() {
      if (this.state.isPdfOpen) {
        const mobile = this._detectMobile();
        if (mobile.isMobileOrTablet !== this.state.isMobile) {
          this.state.isMobile = mobile.isMobileOrTablet;
          this._applyMobileStyles();  
        }
      }  
    }

    bindEvents() {
      if (!this.elements.showBtn) return;
      this.elements.showBtn.addEventListener("click", this.openPdfViewer);
      if (this.elements.closeBtn) {
        this.elements.closeBtn.addEventListener("click", this.closePdfViewer);
      }
      if (this.elements.overlay) {
        this.elements.overlay.addEventListener("click", this.handleOverlayClick);
        if (this.config.enableTouch) {
          this.elements.overlay.addEventListener("touchstart", this.handleTouchStart, { passive: true });
          this.elements.overlay.addEventListener("touchmove", this.handleTouchMove, { passive: true });
          this.elements.overlay.addEventListener("touchend", this.handleTouchEnd, { passive: true });  
        }
      }
      if (this.config.enableKeyboard) {
        document.addEventListener("keydown", this.handleKeydown, true);
      }
      window.addEventListener("resize", this.handleResize);
      this.log("Event listeners bound");  
    }

    unbindEvents() {
      if (this.elements.showBtn) {
        this.elements.showBtn.removeEventListener("click", this.openPdfViewer);
      }
      if (this.elements.closeBtn) {
        this.elements.closeBtn.removeEventListener("click", this.closePdfViewer);
      }
      if (this.elements.overlay) {
        this.elements.overlay.removeEventListener("click", this.handleOverlayClick);
        this.elements.overlay.removeEventListener("touchstart", this.handleTouchStart);
        this.elements.overlay.removeEventListener("touchmove", this.handleTouchMove);
        this.elements.overlay.removeEventListener("touchend", this.handleTouchEnd);
      }
      document.removeEventListener("keydown", this.handleKeydown, true);
      window.removeEventListener("resize", this.handleResize);
      if (this.timeouts.loading) {
        clearTimeout(this.timeouts.loading);
      }  
    }

    refresh() {
      this._cacheElements();
      this._validateElements();
      this.unbindEvents();
      this.bindEvents();
      this.log("PDF viewer refreshed");  
    }

    destroy() {
      this.closePdfViewer();
      this.unbindEvents();
      if (window[`${this.config.frameId}_retryLoad`]) delete window[`${this.config.frameId}_retryLoad`];
      if (window[`${this.config.frameId}_retryFromFallback`]) delete window[`${this.config.frameId}_retryFromFallback`];
      this.elements = {};
      this.state.isInitialized = false;
      this.log("PDF viewer destroyed");
    }

    log(message, level = "info") {
      if (!this.config.enableLogging) return;
      const logMethod = console[level] || console.log;
      logMethod(`[PdfViewerManager:${this.config.viewerName}] ${message}`);
    }

    getState() {
      return {
        isInitialized: this.state.isInitialized,
        isPdfOpen: this.state.isPdfOpen,
        isMobile: this.state.isMobile,
        fallbackShown: this.state.fallbackShown,
        pdfLoadAttempts: this.state.pdfLoadAttempts,
        config: this.config,
        elementsFound: {
          showBtn: !!this.elements.showBtn,
          overlay: !!this.elements.overlay,
          closeBtn: !!this.elements.closeBtn,
          frame: !!this.elements.frame,  
        },
      };
    }
  }
  
  class PdfViewerManagerCollection {
    constructor(configs, options = {}) {
      this.viewers = new Map();
      this.globalOptions = options;
      if (Array.isArray(configs)) this.initializeViewers(configs);  
    }
    initializeViewers(configs) {
      configs.forEach((config) => {
        try {
          const viewer = new PdfViewerManager(config, this.globalOptions);
          this.viewers.set(config.viewerName || config.frameId, viewer);  
        } catch (error) {
          console.error(`Failed to initialize PDF viewer ${config.viewerName}:`, error);  
        }
      });  
    }
    getViewer(name) {
      return this.viewers.get(name);  
    }
    getAllViewers() {
      return Array.from(this.viewers.values());  
    }
    getAllStates() {
      const states = {};
      this.viewers.forEach((viewer, name) => {
        states[name] = viewer.getState();
      });
      return states;  
    }
    closeAllViewers() {
      this.viewers.forEach((viewer) => viewer.closePdfViewer());  
    }
    refreshAllViewers() {
      this.viewers.forEach((viewer) => viewer.refresh());  
    }
    destroyAllViewers() {
      this.viewers.forEach((viewer) => viewer.destroy());
      this.viewers.clear();  
    }
    addViewer(config) {
      try {
        const viewer = new PdfViewerManager(config, this.globalOptions);
        this.viewers.set(config.viewerName || config.frameId, viewer);
        return viewer;
      } catch (error) {
        console.error(`Failed to add PDF viewer ${config.viewerName}:`, error);
        return null;
      }  
    }
    removeViewer(name) {
      const viewer = this.viewers.get(name);
      if (viewer) {
        viewer.destroy();
        this.viewers.delete(name);
        return true;
      }
      return false;  
    }
  }

  let pdfViewerCollection;
  document.addEventListener("DOMContentLoaded", () => {
    const pdfViewers = [
      {
        showBtnId: "showPdfBtn",
        overlayId: "pdfOverlay",
        closeBtnId: "pdfCloseBtn",
        frameId: "pdfFrame",
        pdfPath: "pdf/darwin.pdf",
        viewerName: "Darwin",
      },
      {
        showBtnId: "showOriginPdfBtn",
        overlayId: "originPdfOverlay",
        closeBtnId: "originPdfCloseBtn",
        frameId: "originPdfFrame",
        pdfPath: "pdf/origin_of_life.pdf",
        viewerName: "Origin of Life",
      },
      {
        showBtnId: "showPresahPdfBtn",
        overlayId: "presahPdfOverlay",
        closeBtnId: "presahPdfCloseBtn",
        frameId: "presahPdfFrame",
        pdfPath: "pdf/presah.pdf",
        viewerName: "Presah",
      },  
    ];
    pdfViewerCollection = new PdfViewerManagerCollection(pdfViewers, {
      enableLogging: false,
      loadingTimeoutDuration: 4000,
      maxLoadAttempts: 2,  
    });
    Object.assign(window, {
      openAllPdfViewers: () => pdfViewerCollection?.getAllViewers().forEach((v) => v.openPdfViewer()),
      closeAllPdfViewers: () => pdfViewerCollection?.closeAllViewers(),
      refreshAllPdfViewers: () => pdfViewerCollection?.refreshAllViewers(),
      getPdfViewersState: () => pdfViewerCollection?.getAllStates(),  
    });
  });

  if (typeof module !== "undefined" && module.exports) {
    module.exports = { PdfViewerManager, PdfViewerManagerCollection };
  }
  if (typeof window !== "undefined") {
    window.PdfViewerManager = PdfViewerManager;
    window.PdfViewerManagerCollection = PdfViewerManagerCollection;
  }
})();



// this metoda
/*document.addEventListener('DOMContentLoaded', function() {
    // Univerzální funkce pro inicializaci PDF vieweru
    function initPdfViewer(config) {
        const {
            showBtnId,
            overlayId, 
            closeBtnId,
            frameId,
            pdfPath,
            viewerName
        } = config;

        const showPdfBtn = document.getElementById(showBtnId);
        
        if (!showPdfBtn) {
            return;
        }
        
        const pdfOverlay = document.getElementById(overlayId);
        const pdfCloseBtn = document.getElementById(closeBtnId);
        const pdfFrame = document.getElementById(frameId);
        
        if (!pdfOverlay || !pdfCloseBtn || !pdfFrame) {
            console.error(`Some of the required elements for ${viewerName} PDF viewer were not found`);
            return;
        }
        
        // Stavové proměnné
        let isPdfOpen = false;
        let pdfHasFocus = false;
        let isMobile = false;
        let fallbackShown = false;
        let loadingTimeout = null;
        let pdfLoadAttempts = 0;
        const maxLoadAttempts = 2;
        const loadingTimeoutDuration = 4000; // 4 sekundy
        
        // Vylepšená detekce mobilního zařízení a tabletů
        function detectMobile() {
            const userAgent = navigator.userAgent.toLowerCase();
            const platform = navigator.platform?.toLowerCase() || '';
            
            // Detekce různých zařízení - rozšířené vzory
            const patterns = {
                iOS: /ipad|iphone|ipod/,
                android: /android/,
                windows: /windows phone|windows mobile|wpdesktop|windows nt.*touch/,
                blackberry: /blackberry|bb10|rim/,
                opera: /opera mini|opera mobi/,
                mobile: /mobile|phone|mobi|mini/,
                tablet: /tablet|ipad|playbook|silk|(puffin(?!.*(IP|AP|WP)))|kindle|nook|kobo/ 
            };
            
            const isIOS = patterns.iOS.test(userAgent);
            const isAndroid = patterns.android.test(userAgent);
            const isWindowsMobile = patterns.windows.test(userAgent);
            const isBlackberry = patterns.blackberry.test(userAgent);
            const isOperaMobile = patterns.opera.test(userAgent);
            const isMobilePattern = patterns.mobile.test(userAgent);
            const isTabletPattern = patterns.tablet.test(userAgent);
            
            // Touch podpora
            const isTouchDevice = 'ontouchstart' in window || 
                                navigator.maxTouchPoints > 0 || 
                                navigator.msMaxTouchPoints > 0;
            
            // Velikost obrazovky - vylepšené hranice
            const screenWidth = Math.max(window.screen.width, window.screen.height);
            const screenHeight = Math.min(window.screen.width, window.screen.height);
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            
            const isVerySmallScreen = viewportWidth <= 480;
            const isSmallScreen = viewportWidth <= 768;
            const isMediumScreen = viewportWidth > 768 && viewportWidth <= 1024;
            const isLargeScreen = viewportWidth > 1024;
            
            // Orientace
            const isPortrait = viewportHeight > viewportWidth;
            const isLandscape = viewportWidth > viewportHeight;
            
            // Pixel density
            const pixelRatio = window.devicePixelRatio || 1;
            const isHighDPI = pixelRatio > 1.5;
            
            // Detekce specifických tabletů pomocí kombinace faktorů
            const isLikelyTablet = (
                // Explicitní tablet vzory
                isTabletPattern ||
                // iPad detekce
                (isIOS && screenWidth >= 768) ||
                // Android tablet - kombinace Android + dotyková obrazovka + větší rozlišení + absence "mobile" v UA
                (isAndroid && isTouchDevice && viewportWidth >= 600 && !isMobilePattern) ||
                // Obecné tablety - dotyková zařízení s rozlišením typickým pro tablety
                (isTouchDevice && viewportWidth >= 768 && viewportWidth <= 1366 && isHighDPI) ||
                // Windows tablety
                (isWindowsMobile && viewportWidth >= 768) ||
                // Kindle, Nook a podobné
                /kindle|nook|kobo/.test(userAgent)
            );
            
            // Kombinované vyhodnocení pro mobilní telefony
            const isMobileDevice = (
                // Explicitní mobilní vzory
                isMobilePattern ||
                // iOS telefony
                (isIOS && !isLikelyTablet) ||
                // Android telefony
                (isAndroid && (isMobilePattern || viewportWidth < 600)) ||
                // Windows Mobile
                (isWindowsMobile && !isLikelyTablet) ||
                // BlackBerry
                isBlackberry ||
                // Opera Mobile
                isOperaMobile ||
                // Velmi malé obrazovky
                isVerySmallScreen ||
                // Malé dotykové zařízení
                (isTouchDevice && isSmallScreen && !isLikelyTablet)
            ) && !isLikelyTablet; // Tablet má přednost
            
            const result = {
                isMobile: isMobileDevice,
                isTablet: isLikelyTablet,
                isMobileOrTablet: isMobileDevice || isLikelyTablet,
                isIOS: isIOS,
                isAndroid: isAndroid,
                isWindowsMobile: isWindowsMobile,
                isTouchDevice: isTouchDevice,
                isSmallScreen: isSmallScreen,
                isMediumScreen: isMediumScreen,
                isLargeScreen: isLargeScreen,
                isVerySmallScreen: isVerySmallScreen,
                isPortrait: isPortrait,
                isLandscape: isLandscape,
                screenWidth: screenWidth,
                screenHeight: screenHeight,
                viewportWidth: viewportWidth,
                viewportHeight: viewportHeight,
                pixelRatio: pixelRatio,
                isHighDPI: isHighDPI,
                userAgent: userAgent,
                platform: platform
            };
            
            return result;
        }
        
        // Vylepšená detekce podpory PDF v prohlížeči
        function checkPdfSupport() {
            return new Promise((resolve) => {
                const mobileInfo = detectMobile();
                
                // Pro iOS zařízení (iPhone, iPad) - obvykle mají problémy s PDF v iframe
                if (mobileInfo.isIOS) {
                    resolve(false);
                    return;
                }
                
                // Pro mobilní zařízení s velmi malou obrazovkou
                if (mobileInfo.isVerySmallScreen) {
                    resolve(false);
                    return;
                }
                
                // Pro všechna mobilní/tablet zařízení zkusíme důkladnější test
                if (mobileInfo.isMobileOrTablet) {
                    
                    // Zkusíme více způsobů detekce
                    let testsPassed = 0;
                    let testsCompleted = 0;
                    const totalTests = 2;
                    
                    // Test 1: Zkusíme načíst minimální PDF
                    const testFrame = document.createElement('iframe');
                    testFrame.style.cssText = 'position: absolute; left: -9999px; width: 1px; height: 1px; opacity: 0;';
                    testFrame.src = 'data:application/pdf;base64,JVBERi0xLjQKJdPr6eEKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMiAwIFIKPj4KZW5kb2JqCjIgMCBvYmoKPDwKL1R5cGUgL1BhZ2VzCi9LaWRzIFsgMyAwIFIgXQovQ291bnQgMQo+PgplbmRvYmoKMyAwIG9iago8PAovVHlwZSAvUGFnZQovUGFyZW50IDIgMCBSCi9NZWRpYUJveCBbIDAgMCA2MTIgNzkyIF0KPj4KZW5kb2JqCnhyZWYKMCA0CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDAwOSAwMDAwMCBuIAowMDAwMDAwMDU4IDAwMDAwIG4gCjAwMDAwMDAxMTUgMDAwMDAgbiAKdHJhaWxlcgo8PAovU2l6ZSA0Ci9Sb290IDEgMCBSCj4+CnN0YXJ0eHJlZgoxOTQKJSVFT0Y=';
                    
                    let test1Resolved = false;
                    
                    const finishTest = () => {
                        testsCompleted++;
                        if (testsCompleted >= totalTests) {
                            if (document.body.contains(testFrame)) {
                                document.body.removeChild(testFrame);
                            }
                            
                            // Pokud prošel alespoň jeden test, považujeme PDF za podporované
                            const isSupported = testsPassed > 0;
                            resolve(isSupported);
                        }
                    };
                    
                    const test1Timeout = setTimeout(() => {
                        if (!test1Resolved) {
                            test1Resolved = true;
                            finishTest();
                        }
                    }, 1000);
                    
                    testFrame.onload = () => {
                        if (!test1Resolved) {
                            test1Resolved = true;
                            clearTimeout(test1Timeout);
                            testsPassed++;
                            finishTest();
                        }
                    };
                    
                    testFrame.onerror = () => {
                        if (!test1Resolved) {
                            test1Resolved = true;
                            clearTimeout(test1Timeout);
                            finishTest();
                        }
                    };
                    
                    document.body.appendChild(testFrame);
                    
                    // Test 2: Kontrola MIME typu podpory
                    setTimeout(() => {
                        try {
                            const mimeSupported = navigator.mimeTypes && 
                                                 navigator.mimeTypes['application/pdf'] && 
                                                 navigator.mimeTypes['application/pdf'].enabledPlugin;

                            if (mimeSupported) {
                                testsPassed++;
                            } else {
                            }
                        } catch (e) {
                            console.warn('PDF test 2 error:', e);
                        }

                        finishTest();
                    }, 200);
                    
                } else {
                    // Desktop - obvykle podporuje PDF
                    resolve(true);
                }
            });
        }
        
        // Vytvoření loading indikátoru
        function createLoadingIndicator() {
            const loadingDiv = document.createElement('div');
            loadingDiv.id = `${frameId}_loading`;
            loadingDiv.style.cssText = `
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(255, 255, 255, 0.95);
                padding: 30px;
                border-radius: 12px;
                box-shadow: 0 8px 32px rgba(0,0,0,0.3);
                text-align: center;
                z-index: 1003;
                max-width: 90%;
                backdrop-filter: blur(10px);
            `;
            
            loadingDiv.innerHTML = `
                <div style="width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #007bff; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 15px;"></div>
                <h4 style="margin: 0 0 10px 0; color: #333; font-size: 16px;">Načítám PDF...</h4>
                <p style="margin: 0; color: #666; font-size: 14px;">Pokud se PDF nenačte, zobrazí se alternativní možnosti</p>
                <style>
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                </style>
            `;
            
            return loadingDiv;
        }
        
        // Vylepšené fallback tlačítka s lepším rozpoznáním zařízení
        function createFallbackButtons() {
            const fallbackDiv = document.createElement('div');
            fallbackDiv.id = `${frameId}_fallback`;
            fallbackDiv.style.cssText = `
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(255, 255, 255, 0.98);
                padding: 25px;
                border-radius: 16px;
                box-shadow: 0 12px 48px rgba(0,0,0,0.3);
                text-align: center;
                z-index: 1002;
                width: min(300px, 60vw);
                max-height: 85vh;
                display: flex;
                flex-direction: column;
                justify-content: center;
                backdrop-filter: blur(20px);
                border: 1px solid rgba(255,255,255,0.3);
                overflow-y: auto;
            `;
            
            const mobileInfo = detectMobile();
            const downloadUrl = pdfPath;
            
            let deviceType = 'zařízení';
            if (mobileInfo.isIOS) deviceType = 'iOS zařízení';
            else if (mobileInfo.isAndroid) deviceType = 'Android zařízení';
            else if (mobileInfo.isTablet) deviceType = 'tablet';
            else if (mobileInfo.isMobile) deviceType = 'mobilní telefon';
            
            fallbackDiv.innerHTML = `
                <h3 style="margin: 0 0 15px 0; color: #333; font-size: 18px; text-align: center;">
                    PDF viewer
                </h3>
                <p style="margin: 0 0 20px 0; font-size: 15px; color: #555; line-height: 1.4;">
                    Vaše ${deviceType} může mít problémy se zobrazením PDF přímo na stránce. Vyberte si způsob zobrazení:
                </p>
                <div style="display: flex; flex-direction: column; gap: 12px;">
                    <a href="${downloadUrl}" target="_blank" 
                       style="display: flex; align-items: center; justify-content: center; gap: 10px; padding: 14px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 8px; font-weight: 500; transition: all 0.3s; width: 100%; box-sizing: border-box; font-size: 15px;"
                       onmouseover="this.style.transform='translateY(-1px)'; this.style.boxShadow='0 4px 12px rgba(0,123,255,0.3)';"
                       onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none';">
                        <span>Otevřít v novém okně</span>
                    </a>
                    
                    <a href="${downloadUrl}" download 
                       style="display: flex; align-items: center; justify-content: center; gap: 10px; padding: 14px 20px; background: #28a745; color: white; text-decoration: none; border-radius: 8px; font-weight: 500; transition: all 0.3s; width: 100%; box-sizing: border-box; font-size: 15px;"
                       onmouseover="this.style.transform='translateY(-1px)'; this.style.boxShadow='0 4px 12px rgba(40,167,69,0.3)';"
                       onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none';">
                        <span>Stáhnout soubor</span>
                    </a>
                    
                    ${pdfLoadAttempts < maxLoadAttempts ? `
                        <button onclick="window.${frameId}_retryFromFallback();"
                                style="display: flex; align-items: center; justify-content: center; gap: 10px; padding: 14px 20px; background: #6c757d; color: white; border: none; border-radius: 8px; font-weight: 500; cursor: pointer; transition: all 0.3s; width: 100%; box-sizing: border-box; font-size: 15px;"
                                onmouseover="this.style.transform='translateY(-1px)'; this.style.boxShadow='0 4px 12px rgba(108,117,125,0.3)';"
                                onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none';">
                            <span>Zkusit znovu</span>
                        </button>
                    ` : ''}
                </div>
                
            `;
            
            return fallbackDiv;
        }
        
        // Aplikace mobilních stylů
        function applyMobileStyles() {
            const mobileInfo = detectMobile();
            
            if (mobileInfo.isMobileOrTablet) {
                // Iframe styly pro mobilní zařízení
                pdfFrame.style.cssText += `
                    width: 100% !important;
                    height: 100% !important;
                    border: none !important;
                    position: absolute !important;
                    top: 0 !important;
                    left: 0 !important;
                    z-index: 1001 !important;
                    background: white;
                `;
                
                // Overlay styly pro mobilní zařízení
                pdfOverlay.style.cssText += `
                    padding: 0 !important;
                    background: rgba(0,0,0,0.95) !important;
                    position: fixed !important;
                    top: 0 !important;
                    left: 0 !important;
                    right: 0 !important;
                    bottom: 0 !important;
                    z-index: 1000 !important;
                `;
                
                // Viewport meta tag pro mobilní zařízení
                let viewport = document.querySelector('meta[name="viewport"]');
                if (!viewport) {
                    viewport = document.createElement('meta');
                    viewport.name = 'viewport';
                    viewport.content = 'width=device-width, initial-scale=1.0, user-scalable=yes, minimum-scale=0.5, maximum-scale=3.0';
                    document.head.appendChild(viewport);
                } else {
                    viewport.content = 'width=device-width, initial-scale=1.0, user-scalable=yes, minimum-scale=0.5, maximum-scale=3.0';
                }
            }
        }
        
        // Funkce pro retry načtení PDF
        window[`${frameId}_retryLoad`] = function() {
            pdfLoadAttempts++;
            
            if (pdfLoadAttempts <= maxLoadAttempts) {
                // Přidáme cache buster
                const cacheBuster = `?v=${Date.now()}&attempt=${pdfLoadAttempts}`;
                pdfFrame.src = `${pdfPath}${cacheBuster}`;
                
                // Zobrazíme loading indikátor
                showLoadingIndicator();
            } else {
                showFallbackOptions();
            }
        };
        
        // funkce pro retry z fallback dialogu
        window[`${frameId}_retryFromFallback`] = function() {
            
            // Skryjeme fallback dialog
            hideFallbackOptions();
            
            // Spustíme retry
            window[`${frameId}_retryLoad`]();
        };
        
        // Zobrazení loading indikátoru
        function showLoadingIndicator() {
            // Odebereme existující loading a fallback
            hideFallbackOptions();
            hideLoadingIndicator();
            
            const loadingDiv = createLoadingIndicator();
            pdfOverlay.appendChild(loadingDiv);
            
            // Nastavíme timeout pro loading
            loadingTimeout = setTimeout(() => {
                hideLoadingIndicator();
                
                // Po timeoutu zobrazíme fallback
                showFallbackOptions();
            }, loadingTimeoutDuration);
        }
        
        // Skrytí loading indikátoru
        function hideLoadingIndicator() {
            const loadingDiv = document.getElementById(`${frameId}_loading`);
            if (loadingDiv) {
                loadingDiv.remove();
            }
            
            if (loadingTimeout) {
                clearTimeout(loadingTimeout);
                loadingTimeout = null;
            }
        }
        
        // Skrytí fallback možností
        function hideFallbackOptions() {
            const fallbackDiv = document.getElementById(`${frameId}_fallback`);
            if (fallbackDiv) {
                fallbackDiv.remove();
            }
            fallbackShown = false;
        }
        
        // Zobrazení fallback možností
        function showFallbackOptions() {
            
            hideLoadingIndicator();
            hideFallbackOptions(); // Odebereme starý fallback pokud existuje
            
            const fallbackDiv = createFallbackButtons();
            pdfOverlay.appendChild(fallbackDiv);
            
            // Skryjeme iframe
            pdfFrame.style.display = 'none';
            fallbackShown = true;
        }
        
        // Hlavní funkce pro otevření PDF
        async function openPdfViewer() {
            const mobileInfo = detectMobile();
            isMobile = mobileInfo.isMobileOrTablet;
            fallbackShown = false;
            pdfLoadAttempts = 0;
            
            
            pdfOverlay.style.display = 'block';
            isPdfOpen = true;
            
            // Aplikujeme styly
            applyMobileStyles();
            
            // Blokujeme scrollování na pozadí
            document.body.style.overflow = 'hidden';
            
            // Zobrazíme loading indikátor nejdříve
            showLoadingIndicator();
            
            // Pro mobilní a tablet zařízení zkontrolujeme podporu PDF
            if (isMobile) {
                const pdfSupported = await checkPdfSupport();
                
                if (!pdfSupported) {
                    // Zobrazíme fallback po loading období
                    setTimeout(() => {
                        showFallbackOptions();
                    }, 1500); // Delší čekání aby bylo vidět loading
                    return;
                }
            }
            
            // Zobrazíme loading indikátor nejdříve
            showLoadingIndicator();
            
            // Načteme PDF
            pdfFrame.style.display = 'block';
            pdfFrame.src = `${pdfPath}?v=${Date.now()}`;
            
            // Nastavíme handlers pro načtení
            const loadHandler = () => {
                hideLoadingIndicator();
                pdfFrame.removeEventListener('load', loadHandler);
                pdfFrame.removeEventListener('error', errorHandler);
            };
            
            const errorHandler = () => {
                pdfFrame.removeEventListener('load', loadHandler);
                pdfFrame.removeEventListener('error', errorHandler);
                
                // Při chybě zobrazíme fallback
                showFallbackOptions();
            };
            
            pdfFrame.addEventListener('load', loadHandler);
            pdfFrame.addEventListener('error', errorHandler);
        }
        
        // Funkce pro zavření PDF
        function closePdfViewer() {
            pdfOverlay.style.display = 'none';
            pdfFrame.src = '';
            pdfFrame.style.display = 'block';
            
            // Obnovíme scrollování
            document.body.style.overflow = '';
            
            // Vyčistíme všechny pomocné elementy
            hideLoadingIndicator();
            hideFallbackOptions();
            
            isPdfOpen = false;
            pdfHasFocus = false;
            fallbackShown = false;
            pdfLoadAttempts = 0;
            
        }
        
        // Touch a gesture podpora
        let touchStartY = 0;
        let touchStartX = 0;
        let touchMoved = false;
        
        pdfOverlay.addEventListener('touchstart', function(e) {
            touchStartY = e.touches[0].clientY;
            touchStartX = e.touches[0].clientX;
            touchMoved = false;
        }, { passive: true });
        
        pdfOverlay.addEventListener('touchmove', function(e) {
            touchMoved = true;
        }, { passive: true });
        
        pdfOverlay.addEventListener('touchend', function(e) {
            if (!touchMoved) return; // Pouze pokud byl pohyb
            
            const touchEndY = e.changedTouches[0].clientY;
            const touchEndX = e.changedTouches[0].clientX;
            const deltaY = touchStartY - touchEndY;
            const deltaX = Math.abs(touchStartX - touchEndX);
            
            // Swipe dolů pro zavření (ale ne při horizontálním swipe)
            if (deltaY < -150 && deltaX < 100) {
                if (e.target === pdfOverlay) {
                    closePdfViewer();
                }
            }
        }, { passive: true });
        
        // Keyboard podpora
        function handleKeydown(e) {
            if (isPdfOpen && (e.key === 'Escape' || e.keyCode === 27)) {
                closePdfViewer();
                e.preventDefault();
                e.stopPropagation();
                return;
            }
        }
        
        document.addEventListener('keydown', handleKeydown, true);
        
        // Event listenery pro tlačítka
        showPdfBtn.addEventListener('click', openPdfViewer);
        pdfCloseBtn.addEventListener('click', closePdfViewer);
        
        // Zavření kliknutím na overlay
        pdfOverlay.addEventListener('click', function(e) {
            if (e.target === pdfOverlay) {
                closePdfViewer();
            }
        });
        
        // Responsivní úpravy
        window.addEventListener('resize', function() {
            if (isPdfOpen) {
                const newMobileInfo = detectMobile();
                if (newMobileInfo.isMobileOrTablet !== isMobile) {
                    isMobile = newMobileInfo.isMobileOrTablet;
                    applyMobileStyles();
                }
            }
        });
        
    }
    
    // Inicializace všech PDF viewerů
    const pdfViewers = [
        {
            showBtnId: 'showPdfBtn',
            overlayId: 'pdfOverlay',
            closeBtnId: 'pdfCloseBtn',
            frameId: 'pdfFrame',
            pdfPath: 'pdf/darwin.pdf',
            viewerName: 'Darwin'
        },
        {
            showBtnId: 'showOriginPdfBtn',
            overlayId: 'originPdfOverlay',
            closeBtnId: 'originPdfCloseBtn',
            frameId: 'originPdfFrame',
            pdfPath: 'pdf/origin_of_life.pdf',
            viewerName: 'Origin of Life'
        },
        {
            showBtnId: 'showPresahPdfBtn',
            overlayId: 'presahPdfOverlay',
            closeBtnId: 'presahPdfCloseBtn',
            frameId: 'presahPdfFrame',
            pdfPath: 'pdf/presah.pdf',
            viewerName: 'Presah'
        }
    ];
    
    // Inicializujeme všechny PDF viewery
    pdfViewers.forEach(config => {
        initPdfViewer(config);
    });
});*/
