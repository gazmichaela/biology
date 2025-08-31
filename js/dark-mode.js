(function () {
  class DarkModeManager {
    constructor() {
      this.browserType = this._detectBrowser();
      this.isPrivate = this._detectPrivateMode();
      this.isDarkMode = false;
      this.hasUserPreference = false;
      this.isUsingSystemPreference = true;
      this.isToggleVisible = true;
      this._toggleBtn = null;
      this._iconSpan = null;
      
      this._storage = this._createStorage();
      this._initState();
      this._initCSS();
      this._createToggle();
      this._createReset();
      this._applyAnimations();
      this._bindEvents();
      this._initAPI();
    }

    _detectBrowser() {
      const ua = navigator.userAgent.toLowerCase(); 
      if (ua.includes("firefox")) return "firefox";
      if (ua.includes("chrome") || ua.includes("safari") || ua.includes("edge"))
        return "chromium";
      return "chromium";  
    }

    _detectPrivateMode() {
      try {
        localStorage.setItem("__test__", "1");
        localStorage.removeItem("__test__");
      } catch (e) {
        return true;
      }
      try {
        sessionStorage.setItem("__test__", "1");
        sessionStorage.removeItem("__test__");
      } catch (e) {
        return true;
      }
      if (window.navigator.webdriver) return true;
      return false;
    }

    _createStorage() {
      const domain =
        window.location.hostname.includes(".")
          ? "." + window.location.hostname.split(".").slice(-2).join(".")
          : window.location.hostname;
        
      const cookieStore = {
        setItem: (k, v) => {
          let cookieString = `${k}=${encodeURIComponent(
            v
          )}; max-age=${365 * 24 * 60 * 60}; path=/; SameSite=Lax`;
          if (
            domain && 
            !domain.includes("localhost") &&
            !domain.match(/^\d+\.\d+\.\d+\.\d+$/)
          )
            cookieString += `; domain=${domain}`;
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
          let cookieString = `${k}=; max-age=0; path=/; SameSite=Lax`;
          if (
            domain &&
            !domain.includes("localhost") &&
            !domain.match(/^\d+\.\d+\.\d+\.\d+$/)
          )
            cookieString += `; domain=${domain}`;
          document.cookie = cookieString;  
        },
      };
      
      return {
        get: (key) => {
          if (this.isPrivate) return null;
          const storages =
            this.browserType === "firefox"
              ? [cookieStore, sessionStorage, localStorage]
              : [localStorage, sessionStorage, cookieStore];
          for (const storage of storages) {
            try {
              const value = storage.getItem(key);
              if (value !== null && value !== undefined) return value;  
            } catch (e) {}
          }
          return null;    
        },
        set: (key, value) => {
          if (this.isPrivate) return;
          const storages =
            this.browserType === "firefox"
              ? [cookieStore, sessionStorage, localStorage]
              : [localStorage, sessionStorage, cookieStore];
          for (const storage of storages) {
            try {
              storage.setItem(key, value);
              return true;  
            } catch (e) {}
          }
          return false;          
        },
        remove: (key) => {
          try {
            localStorage.removeItem(key);
          } catch (e) {}
          try {
            sessionStorage.removeItem(key);
          } catch (e) {}
          try {
            cookieStore.removeItem(key);
          } catch (e) {}
        },
      };
    }

    _initState() {
      const storedPref = this._getPref("darkMode");
      if (storedPref !== null) {
        this.isDarkMode = storedPref === "true";
        this.hasUserPreference = true;
        this.isUsingSystemPreference = false;
      } else {
        this.isUsingSystemPreference = true;
        if (
          window.matchMedia && 
          window.matchMedia("(prefers-color-scheme: dark)").matches  
        ) {
          this.isDarkMode = true;  
        }
      }
      const toggleVis = this._getPref("darkModeToggleVisible");
      this.isToggleVisible = toggleVis !== null ? toggleVis === "true" : true;
    }

    _initCSS() {
      const style = document.createElement("style");
      style.type = "text/css";
      style.id = "darkmode-critical-css";
      style.appendChild(document.createTextNode(this._criticalCSS()));
      document.head.appendChild(style);
      
      const mainStyle = document.createElement("style");
      mainStyle.appendChild(document.createTextNode(this._mainCSS()));
      document.head.appendChild(mainStyle);

      const svgStyle = document.createElement("style");
      svgStyle.appendChild(document.createTextNode(`
        .dark-mode .dark-mode-toggle {
          background: #111 !important;
          transition: background 0.22s, box-shadow 0.22s;
        }
        .dark-mode-toggle svg, .dark-mode-toggle .sun-icon {
          background: transparent !important;
          stroke: white !important;
          fill: none !important;
        }
        .dark-mode-toggle .icon-anim {
          transition: transform 0.25s, opacity 0.25s;
        }  
      `));
      document.head.appendChild(svgStyle);

      if (this.isDarkMode) {
        document.documentElement.classList.add("dark-mode");
        document.body.classList.add("dark-mode");
      }
      setTimeout(() => {
        style.remove();
      }, 300);
    }

    _criticalCSS() {
      return `
              ${this.isDarkMode ?`
              html.dark-mode {
                background-color: #222222;
                color: #c8c1b5;
              }
              
              body.dark-mode {
                background-color: #222222;
                color: #c8c1b5;
              }
         ` : `
            html {
              background-color: #f0f9f0;
              color: #023f1e;
            }
            
            body {
              background-color: #f0f9f0;
              color: #023f1e
            }
         `}
         
          .dark-mode-toggle {
            position: fixed !important;
            bottom: 20px !important;
            right: 20px !important;
            width: 50px !important;
            height: 50px !important;
            border-radius: 8px !important;
            border: none !important;
            cursor: pointer !important;
            display: ${this.isToggleVisible ? 'flex' : 'none'} !important;
            align-items: center !important;
            justify-content: center !important;
            font-size: 1.5rem !important;
            z-index: 1000 !important;
            transition: none !important;
            background: white;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          }
          
          .dark-mode-toggle.hidden {
            display: none;
          }
          
          ${this.isDarkMode ? `
              html.dark-mode .dark-mode-toggle,
              body.dark-mode .dark-mode-toggle,
              .dark-mode .dark-mode-toggle {
                background: black !important;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5) !important;
              }
      ` : ''}
              html.ready, body.ready {
                visibility: visible;
                opacity: 1;
                transition: opacity 0.15s ease-in-out;
              }
      `;  
    }

    _mainCSS() {
      return `
            body {
              transition: background-color 0.3s, color 0.3s, border-color 0.3s;
        }

        body.dark-mode {
          background: #222;
          color: #c8c1b5;
        }

        body.dark-mode header {
          background: #77afe0ee;
        }

        body.dark-mode article section h2 {
          background: linear-gradient(to top, #1aff1a44 10%, transparent 60%);
        }

        body.dark-mode article section h3 {
          text-decoration: underline #1aff1a44;
        }

        body.dark-mode .button,
        body.dark-mode .button-light {
          color: #e6e6e6;
        }

        body.dark-mode .button {
          background: #1c78e8f1;
        }

        body.dark-mode .button-light {
          background: #309ce5f1;
        }

        body.dark-mode article section a:link:not(.button):not(.sidemap a):not(.no-a-style) {
          color: skyblue;
        }

        body.dark-mode article section .citace a:visited {
          color: cornflowerblue;
        }

        body.dark-mode .cookies-mini-notice {
          background: black;
          border: 1px solid #585858
        }

        body.dark-mode .cookies-mini-notice p {
          color: #c8c1b5;
        }

        body.dark-mode .cookies-mini-notice a {
          color: skyblue;
        }
        
        body.dark-mode .cookies-mini-notice button {
          background: #2c2c2c;
          border: 1px solid #3b3b3b;
          color: #c8c1b5;
        }
        
        body.dark-mode .cookies-mini-notice button:hover {
          background: #202020;
        }
        
        body.dark-mode table {
          border: 2px solid #c8c1b5;
        }
        
        body.dark-mode th,
        body.dark-mode td {
          border: 1px solid #c8c1b5;
        }
        
        body.dark-mode .tooltip .tooltiptext {
          background: #333;
          color: #e0deda;
        }
        
        body.dark-mode .question {
          background: #333131;
          border: 1px solid #505050
        }
        
        body.dark-mode .answer {
          background: #2b2c2b;
        }
        
        body.dark-mode #toggle-questions-btn {
          background: #309ce5f1;
          color: #e6e6e6;
        }
        
        body:not(.dark-mode) .dark-mode-toggle {
          background: white !important;
        }
      `;
    }

    _initAPI() {
      window.getDarkModePreference = () => this._getPref("darkMode");
      window.saveDarkModePreference = (isDark) => this._savePref("darkMode", isDark ? "true" : "false");
      window.resetToSystemPreferences = () => this._resetSystemPref();
      window.isIncognitoMode = () => this._detectPrivateMode();
      window.getBrowserType = () => this.browserType;  
    }

    _getPref(key) {
      if (this.isPrivate) return null;
      const value = this._storage.get(key);
      return value;  
    }
    _savePref(key, value) {
      if (this.isPrivate) return;
      this._storage.set(key, value);  
    }
    _resetSystemPref() {
      this._storage.remove("darkMode");
      this.isUsingSystemPreference = true;
      const prefersDark = window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches;
      this._applyMode(prefersDark);
      this.isDarkMode = prefersDark;
      this._updateIcon();
      this._toggleBtn.title = prefersDark
        ? "Přepnout na světlý režim"
        : "Přepnout na tmavý režim";    
    }

    _createToggle() {
      let btn = document.getElementById("darkModeToggle");
      if (!btn) {
        btn = document.createElement("button");
        btn.id = "darkModeToggle";
        btn.className = "dark-mode-toggle";
        btn.style.display = this.isToggleVisible ? "flex" : "none";
        btn.title = this.isDarkMode
          ? "Přepnout na světlý režim"
          : "Přepnout na tmavý režim";
        const iconSpan = document.createElement("span");
        iconSpan.id = "darkModeIcon";
        iconSpan.innerHTML = this.isDarkMode
          ? this._createMoonIcon()
          : this._createSunIcon();
        btn.appendChild(iconSpan);
        document.body.appendChild(btn);
        this._iconSpan = iconSpan;
      } else {
        btn.title = this.isDarkMode
          ? "Přepnout na světlý režim"
          : "Přepnout na tmavý režim";
        let iconSpan = btn.querySelector("#darkModeIcon");
        if (!iconSpan) {
          iconSpan = document.createElement("span");
          iconSpan.id = "darkModeIcon";
          btn.appendChild(iconSpan);
        }
        iconSpan.innerHTML = this.isDarkMode 
          ? this._createMoonIcon()
          : this._createSunIcon();
        this._iconSpan = iconSpan;
        btn.style.display = this.isToggleVisible ? "flex" : "none";
      }
      btn.addEventListener("click", () => {
        this._toggleMode();
        this._animateIcon();
      });
      this._toggleBtn = btn;
    }

    _toggleMode() {
      this.isDarkMode = !this.isDarkMode;
      this._applyMode(this.isDarkMode);
      this._savePref("darkMode", this.isDarkMode ? "true" : "false");
      this.isUsingSystemPreference = false;
      this._updateIcon();
      this._toggleBtn.title = this.isDarkMode
        ? "Přepnout na světlý režim"
        : "Přepnout na tmavý režim";  
    }

    _applyMode(isDark) {
      const body = document.body;
      if (isDark) {
        body.classList.add("dark-mode");
        document.documentElement.classList.add("dark-mode");
      } else {
        body.classList.remove("dark-mode");
        document.documentElement.classList.remove("dark-mode");
      } 
    }

    _animateIcon() {
      const icon = this._iconSpan && this._iconSpan.querySelector(".icon-anim");
      if (icon) {
        icon.style.transform = "translateY(10px)";
        icon.style.opacity = "0";
        setTimeout(() => {
          this._iconSpan.innerHTML = this.isDarkMode 
            ? this._createMoonIcon()
            : this._createSunIcon();
          const newIcon = this._iconSpan.querySelector(".icon-anim");
          if (newIcon) {
            newIcon.style.transform = "translateY(-10px)";
            newIcon.style.opacity = "0";
            setTimeout(() => {
              newIcon.style.transform = "translateY(0)";
              newIcon.style.opacity = "1";
            }, 50);
          }
        }, 150);
      }
    }

    _updateIcon() {
      if (this._iconSpan) {
        this._iconSpan.innerHTML = this.isDarkMode
          ? this._createMoonIcon()
          : this._createSunIcon();
      }
    }

    _createSunIcon() {
      return `
        <div class="sun-icon icon-anim">
          <div class="sun"></div>
          <div class="ray"></div>
          <div class="ray"></div>
          <div class="ray"></div>
          <div class="ray"></div>
          <div class="ray"></div>
          <div class="ray"></div>
          <div class="ray"></div>
          <div class="ray"></div>
        </div>
      `;
    }

    _createMoonIcon() {
      return `
        <svg class="icon-anim" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:block;">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
        </svg>
      `;  
    }

    _createReset() {
      const resetBtn = document.getElementById("resetSystemPreferences");
      if (resetBtn) {
        resetBtn.textContent = "Preferovat světlý/tmavý režim prohlížeče";
        resetBtn.addEventListener("click", () => {
          if (
            this._toggleBtn && 
            this._toggleBtn.style.display === "none"
          ) {
            this._toggleBtn.style.display = "flex";
            this._toggleBtn.classList.remove("hidden");
            resetBtn.textContent = "Preferovat světlý/tmavý režim prohlížeče";
            this.isUsingSystemPreference = false;
            this._savePref("darkModeToggleVisible", "true");
          } else {
            this._resetSystemPref();
            this._toggleBtn.style.display = "none";
            this._toggleBtn.classList.add("hidden");
            resetBtn.textContent = "Přepínat ručně světlý/tmavý režim prohlížeče";
            this._savePref("darkModeToggleVisible", "false");
          }  
        });
      }
    }

    _applyAnimations() {
    document.documentElement.classList.add("ready");
    document.body.classList.add("ready");
    
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener("click", function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute("href"));
        if (target) {
            target.scrollIntoView({ behavior: "smooth" });
        }
        });
    });
    }
    
    _bindEvents() {
      document.addEventListener("DOMContentLoaded", () => {
        if (!document.documentElement.classList.contains("ready")) {
          document.documentElement.classList.add("ready");
          document.body.classList.add("ready");  
        }
        if (
          !document.getElementById("darkModeToggle")  
        ) {
          this._createToggle();
        }
        this._createReset();
      });  
    }

    getState() {
      return {
        isInitialized: true,
        isPrivateMode: this.isPrivate,
        isDarkMode: this.isDarkMode,
        isChromium: this.browserType === "chromium",
        isFirefox: this.browserType === "firefox",
        toggleVisible: this.isToggleVisible,
        usingSystemPreference: this.isUsingSystemPreference,
        config: {
          browserType: this.browserType,  
        },
      };  
    }
  }

  let darkModeManager;
  document.addEventListener("DOMContentLoaded", function () {
    darkModeManager = new DarkModeManager();
    window.darkModeManager = darkModeManager;
    window.getDarkModeState = () => darkModeManager.getState();
  });

  if (typeof module !== "undefined" && module.exports) {
    module.exports = DarkModeManager;
  }
  if (typeof window !== "undefined") {
    window.DarkModeManager = DarkModeManager;
  }
})();