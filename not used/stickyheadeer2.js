(function () {
  class ScrollStateManager {
    constructor() {
      history.scrollRestoration = 'manual';
      this._bindEvents();
      this.isInitialized = true;
    }

    _bindEvents() {
      this.isNavigatingAway = false;

      document.addEventListener("click", (e) => {
        const link = e.target.closest("a[href]");
        if (link && !link.target && link.href && !link.href.startsWith("#")) {
          this.isNavigatingAway = true;
        }
      });

      window.addEventListener("beforeunload", () => {
        if (!this.isNavigatingAway) {
          sessionStorage.setItem("scrollPos", window.scrollY);
          sessionStorage.setItem("scrollPosUrl", window.location.href);
        } else {
          sessionStorage.removeItem("scrollPos");
          sessionStorage.removeItem("scrollPosUrl");
        }
      });

      window.addEventListener("load", () => {
        const saved = sessionStorage.getItem("scrollPos");
        const savedUrl = sessionStorage.getItem("scrollPosUrl");
        sessionStorage.removeItem("scrollPos");
        sessionStorage.removeItem("scrollPosUrl");
        if (saved && savedUrl === window.location.href) {
          window.scrollTo(0, parseInt(saved));
        }
      });
    }
  }

  class StickyDropdownManager {
    constructor(options = {}) {
      this.id = options.id || "sticky-default";

      this.config = {
        clickInactivityDelay: options.clickInactivityDelay || 2000,
        inactivityDelay: options.inactivityDelay || 2000,
        hoverHideDelay: options.hoverHideDelay || 200,
        transitionDuration: options.transitionDuration || 300,
        deadzoneMatchContent: options.deadzoneMatchContent || false,
        storagePrefix: options.storagePrefix || options.id || "sticky-default",
      };

      this.config.storageKeys = {
        isSubMenuOpen: `${this.config.storagePrefix}-sub-isOpen`,
      };

      this.elements = {
        toggle: options.toggleEl || null,
        content: options.contentEl || null,
        subToggle: options.subToggleEl || null,
        subContent: options.subContentEl || null,
      };

      this.timers = {
        hide: null,
        animation: null,
        inactivity: null,
        clickInactivity: null,
        subHide: null,
        subAnimation: null,
      };

      this.state = {
        mouseX: 0,
        mouseY: 0,
        isClickOpened: false,
        isClosingInProgress: false,
        isClickOpenedSub: false,
        isMouseOverMenuSub: false,
        isClosingInProgressSub: false,
        isKeyboardOpened: false,
        isSubKeyboardOpened: false,
        currentFocusIndex: -1,
        focusableElements: [],
      };

      this.deadzoneElement = null;
      this.subDeadzoneElement = null;

      this.handleDocumentMouseMove = this._onDocumentMouseMove.bind(this);
      this.handleDocumentClick = this._onDocumentClick.bind(this);
      this.handleDocumentKeyDown = this._onDocumentKeyDown.bind(this);
      this.handleWindowResize = this._onWindowResize.bind(this);
      this.handleWindowScroll = this._onWindowScroll.bind(this);

      this.init();
    }

    init() {
      try {
        this._validateElements();
        this._setupStyles();
        this._createDeadzone();
        this._setupSubDropdown();
        this._bindEvents();
        this.isInitialized = true;
      } catch (error) {
        console.error(`StickyDropdownManager [${this.id}] init failed:`, error);
      }
    }

    _validateElements() {
      if (!this.elements.toggle) {
        throw new Error(`[${this.id}] Missing toggle element`);
      }
      if (!this.elements.content) {
        throw new Error(`[${this.id}] Missing content element`);
      }
    }

    _setupStyles() {
      const { transitionDuration } = this.config;
      this.elements.content.style.cssText = `
        transition: opacity ${transitionDuration / 1000}s ease-in-out, visibility ${transitionDuration / 1000}s ease-in-out;
        opacity: 0;
        visibility: hidden;
        display: none;
      `;
    }

    _createDeadzone() {
      this.deadzoneElement = document.createElement("div");
      this.deadzoneElement.id = `dropdown-deadzone-${this.id}`;
      this.deadzoneElement.className = "dropdown-deadzone sticky-dropdown-deadzone";
      this.deadzoneElement.style.cssText = `
        position: fixed;
        pointer-events: none;
        display: none;
        z-index: 9999;
      `;
      document.body.appendChild(this.deadzoneElement);
    }

    _updateDeadzone() {
      if (!this.deadzoneElement) return;

      const container = this.elements.toggle.closest(".button-container");

      if (!container) { this.deadzoneElement.style.display = "none"; return; }

      const mainButton = container.querySelector(".main-button");
      if (!mainButton) { this.deadzoneElement.style.display = "none"; return; }

      const mainRect = mainButton.getBoundingClientRect();
      const toggleRect = this.elements.toggle.getBoundingClientRect();
      const contentRect = this.elements.content.getBoundingClientRect();

      const top = Math.max(mainRect.bottom, toggleRect.bottom);
      const height = contentRect.top - top;
      if (height <= 0) { this.deadzoneElement.style.display = "none"; return; }

      let left = mainRect.left;
      // -2 kompenzuje border mezi tlačítky
      let width = mainButton.offsetWidth + this.elements.toggle.offsetWidth - 2;

      if (this.config.deadzoneMatchContent) {
        const cs = window.getComputedStyle(this.elements.content);
        left = contentRect.left;
        width = contentRect.width - (parseFloat(cs.paddingRight) || 0);
      }

      this.deadzoneElement.style.left = left + "px";
      this.deadzoneElement.style.top = top + "px";
      this.deadzoneElement.style.width = width + "px";
      this.deadzoneElement.style.height = height + "px";
      this.deadzoneElement.style.display = "block";
    }

    _showDeadzone() { if (this.deadzoneElement) this._updateDeadzone(); }
    _hideDeadzone() { if (this.deadzoneElement) this.deadzoneElement.style.display = "none"; }

    _isMouseInDeadzone() {
      if (!this.deadzoneElement || this.deadzoneElement.style.display === "none") return false;
      const { mouseX, mouseY } = this.state;
      const rect = this.deadzoneElement.getBoundingClientRect();
      return mouseX >= rect.left && mouseX <= rect.right && mouseY >= rect.top && mouseY <= rect.bottom;
    }

    _createSubDeadzone() {
      if (!this.elements.subToggle || !this.elements.subContent) return;

      this.subDeadzoneElement = document.createElement("div");
      this.subDeadzoneElement.id = `subdropdown-deadzone-${this.id}`;
      this.subDeadzoneElement.className = "subdropdown-deadzone sticky-subdropdown-deadzone";
      this.subDeadzoneElement.style.cssText = `
        position: fixed;
        pointer-events: none;
        display: none;
        z-index: 9999;
      `;
      document.body.appendChild(this.subDeadzoneElement);
    }

    _updateSubDeadzone() {
      if (!this.subDeadzoneElement || !this.elements.subToggle || !this.elements.subContent) return;

      const container = this.elements.subToggle.closest(".sub-dropdown") || this.elements.subToggle;
      const contRect = container.getBoundingClientRect();
      const subRect = this.elements.subContent.getBoundingClientRect();

      // Mrtvá zóna nezasahuje pod spodní padding subdropdownu
      const paddingOffset = 5;

      const left = contRect.right;
      const width = subRect.left - contRect.right;
      const top = subRect.top + 2;
      const height = subRect.height - paddingOffset;

      if (width > 0 && height > 0) {
        this.subDeadzoneElement.style.left = left + "px";
        this.subDeadzoneElement.style.top = top + "px";
        this.subDeadzoneElement.style.width = width + "px";
        this.subDeadzoneElement.style.height = height + "px";
        this.subDeadzoneElement.style.display = "block";
      } else {
        this.subDeadzoneElement.style.display = "none";
      }
    }

    _showSubDeadzone() { if (this.subDeadzoneElement) this._updateSubDeadzone(); }
    _hideSubDeadzone() { if (this.subDeadzoneElement) this.subDeadzoneElement.style.display = "none"; }

    _isMouseInSubDeadzone() {
      if (!this.subDeadzoneElement || this.subDeadzoneElement.style.display === "none") return false;
      const { mouseX, mouseY } = this.state;
      const rect = this.subDeadzoneElement.getBoundingClientRect();
      return mouseX >= rect.left && mouseX <= rect.right && mouseY >= rect.top && mouseY <= rect.bottom;
    }

    _setupSubDropdown() {
      const { subToggle, subContent } = this.elements;
      if (!subToggle || !subContent) return;

      this._createSubDeadzone();

      subContent.style.cssText = `
        transition: opacity 0.3s ease-in-out, visibility 0.3s ease-in-out;
        opacity: 0;
        visibility: hidden;
        display: none;
        position: ${subContent.style.position || "absolute"};
      `;

      if (!subToggle.hasAttribute("tabindex")) subToggle.setAttribute("tabindex", "0");
      subContent.classList.add("fade-dropdown");
    }

    _showMenu() {
      this._clearAllTimers();
      this.state.isClosingInProgress = false;
      this.state.currentFocusIndex = -1;
      this._removeKeyboardHoverStyles();

      this.elements.content.style.opacity = "0";
      this.elements.content.style.visibility = "hidden";
      this.elements.content.style.display = "block";

      // Dvojitý rAF zajistí že display: block proběhne dříve než změna opacity (force reflow)
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          this.elements.content.style.opacity = "1";
          this.elements.content.style.visibility = "visible";
          this._showDeadzone();
        });
      });

      // Inaktivitu spouštíme jen při kliknutí, hover se řídí pohybem myši
      if (this.state.isClickOpened) this._startInactivityTimer();
    }

    _hideMenu() {
      if (window.tabNavigationActive) return;

      this._clearAllTimers();
      this.state.isClosingInProgress = true;
      this.state.currentFocusIndex = -1;
      this._removeKeyboardHoverStyles();
      this.elements.toggle.classList.remove("is-open");

      this.elements.content.style.opacity = "0";
      this.elements.content.style.visibility = "hidden";
      this._hideDeadzone();

      if (this.elements.subContent) {
        this.state.isClickOpenedSub = false;
        this._hideSubMenu();
      }

      this.timers.animation = setTimeout(() => {
        this.elements.content.style.display = "none";
        this.state.isClickOpened = false;
        this.state.isClosingInProgress = false;
        this._clearStorageKeys();
      }, this.config.transitionDuration);
    }

    _showSubMenu() {
      if (!this.elements.subContent) return;

      this._clearTimer("subHide");
      this._clearTimer("subAnimation");
      this.state.isClosingInProgressSub = false;

     this.elements.subContent.style.display = "block";

      setTimeout(() => {
        this.elements.subContent.style.opacity = "1";
        this.elements.subContent.style.visibility = "visible";
        this._showSubDeadzone();
      }, 10);

      if (this.state.isClickOpenedSub) {
        localStorage.setItem(this.config.storageKeys.isSubMenuOpen, "true");
      }
    }

    _hideSubMenu(skipDelay = false) {
      if (!this.elements.subContent || this.elements.subContent.style.display === "none") return;

      this._clearTimer("subHide");
      this._clearTimer("subAnimation");
      this.state.isClosingInProgressSub = true;

      let currentElementBeforeClose = null;
      if (
        this.state.currentFocusIndex >= 0 &&
        this.state.currentFocusIndex < this.state.focusableElements.length
      ) {
        currentElementBeforeClose = this.state.focusableElements[this.state.currentFocusIndex];
      }

      const isInSubContent =
        currentElementBeforeClose && this.elements.subContent.contains(currentElementBeforeClose);
      
      this.elements.subContent.style.opacity = "0";
      this.elements.subContent.style.visibility = "hidden";
      this._hideSubDeadzone();

      const animationDuration = 400;
      const delay = skipDelay ? Math.floor(animationDuration / 2) : animationDuration + 50; // 50ms rezerva aby CSS přechod plně doběhl

      this.timers.subAnimation = setTimeout(() => {
        if (!this.state.isMouseOverMenuSub && !this._isMouseInSubDeadzone()) {
          this.elements.subContent.style.display = "none";

          if (this.state.isClickOpenedSub) {
            this.state.isClickOpenedSub = false;
            localStorage.removeItem(this.config.storageKeys.isSubMenuOpen);
          }

          if (currentElementBeforeClose) {
            this._updateFocusableElements();

            if (isInSubContent) {
              const idx = this.state.focusableElements.indexOf(this.elements.subToggle);
              this.state.currentFocusIndex = idx !== -1 ? idx : -1;
            } else {
              const idx = this.state.focusableElements.indexOf(currentElementBeforeClose);
              if (idx !== -1) this.state.currentFocusIndex = idx;
            }
          }
        } else {
          this._showSubMenu();
        }
        this.state.isClosingInProgressSub = false;
      }, delay);
    }

    _startInactivityTimer() {
      this._clearTimer("inactivity");
      this.timers.inactivity = setTimeout(() => {
        if (!window.tabNavigationActive && !this._isMouseOverAnyElement()) {
          this._hideMenu();
          this.state.isClickOpened = false;
        }
      }, this.config.inactivityDelay);
    }

    _startClickInactivityTimer() {
      this._clearTimer("clickInactivity");
      this.timers.clickInactivity = setTimeout(() => {
        if (!window.tabNavigationActive && !this._isMouseOverAnyElement()) {
          this._hideMenu();
          this.state.isClickOpened = false;
        }
      }, this.config.clickInactivityDelay);
    }

    _clearTimer(name) {
      if (this.timers[name]) { clearTimeout(this.timers[name]); this.timers[name] = null; }
    }

    _clearAllTimers() {
      Object.keys(this.timers).forEach((key) => this._clearTimer(key));
    }

    _clearStorageKeys() {
      localStorage.removeItem(this.config.storageKeys.isSubMenuOpen);
    }

    _isMouseOverAnyElement() {
      const { mouseX, mouseY } = this.state;
      const inRect = (r) => mouseX >= r.left && mouseX <= r.right && mouseY >= r.top && mouseY <= r.bottom;

      if (inRect(this.elements.content.getBoundingClientRect())) return true;
      if (inRect(this.elements.toggle.getBoundingClientRect())) return true;
      if (this._isMouseInDeadzone()) return true;
      if (this._isMouseInSubDeadzone()) return true;

      const { subToggle, subContent } = this.elements;
      if (subToggle && inRect(subToggle.getBoundingClientRect())) return true;
      if (subContent && subContent.style.display !== "none" && inRect(subContent.getBoundingClientRect())) return true;
      
      return false;
    }

    _updateFocusableElements() {
      const content = this.elements.content;
      if (!content) return;

      const selector = 
        'a, button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), span[tabindex]:not([tabindex="-1"]), [tabindex]:not([tabindex="-1"]), [role="button"], [role="menuitem"]';
      
      const isVisible = (el) => {
        const s = window.getComputedStyle(el);
        return el.offsetParent !== null && s.display !== "none" && s.visibility !== "hidden" && s.opacity !== "0";
      };

      const all = Array.from(content.querySelectorAll(selector)).filter(isVisible);

      // Pokud je subContent skrytý, vyřadíme jeho potomky z navigace šipkami
      if (!this.elements.subContent || this.elements.subContent.style.opacity !== "1") {
        this.state.focusableElements = this.elements.subContent
          ? all.filter((el) => {
              let p = el.parentElement;
              while (p && p !== content) {
                if (p === this.elements.subContent) return false;
                p = p.parentElement;
              }
              return true;
            })
          : all;
      } else {
        this.state.focusableElements = all;
      }
    }

    _applyKeyboardHoverStyle() {
      this.state.focusableElements.forEach((el) => {
        el.classList.remove("keyboard-hover");
        el.style.backgroundColor = "";
        el.style.color = "";
      });
      if (
        this.state.currentFocusIndex >= 0 &&
        this.state.currentFocusIndex < this.state.focusableElements.length
      ) {
        const el = this.state.focusableElements[this.state.currentFocusIndex];
        el.classList.add("keyboard-hover");
        el.style.backgroundColor = el.classList.contains("active") ? "#388E3C" : "#309ce5";
        el.style.color = "white";
      }
    }

    _removeKeyboardHoverStyles() {
      document.querySelectorAll(".keyboard-hover").forEach((el) => {
        el.classList.remove("keyboard-hover");
        el.style.backgroundColor = "";
        el.style.color = "";
      });
    }

    _showMenuKeyboard() {
      this.state.isKeyboardOpened = true;
      this.state.isClickOpened = true;
      this.elements.toggle.classList.add("is-open");
      this._showMenu();
    }

    _hideMenuKeyboard() {
      this.state.isKeyboardOpened = false;
      this.state.isClickOpened = false;
      this._hideMenu();
      if (this.elements.content.contains(document.activeElement)) {
        setTimeout(() => this.elements.toggle.focus(), 50);
      }
    }

    _showSubMenuKeyboard() {
      this.state.isSubKeyboardOpened = true;
      this.state.isClickOpenedSub = true;
      this._showSubMenu();
    }

    _hideSubMenuKeyboard() {
      this.state.isSubKeyboardOpened = false;
      this.state.isClickOpenedSub = false;
      this._hideSubMenu();
      if (this.elements.subContent && this.elements.subContent.contains(document.activeElement)) {
        setTimeout(() => this.elements.subToggle.focus(), 50);
      }
    }

    _bindEvents() {
      const { toggle, content, subToggle, subContent } = this.elements;

      toggle.addEventListener("mouseenter", () => {
        this._clearTimer("hide");
        if (window._stickyCloseAllExcept) window._stickyCloseAllExcept(this.id);
        if (subContent && !this.state.isClickOpenedSub) this._hideSubMenu();
        if (!this.state.isClickOpened) requestAnimationFrame(() => this._showMenu());
      });

      toggle.addEventListener("mouseleave", (e) => {
        if (this.state.isClickOpened) { this._startClickInactivityTimer(); return; }
        const to = e.relatedTarget;
        if (to !== content && !content.contains(to)) {
          this.timers.hide = setTimeout(() => {
            if (!this.state.isClickOpened && !this._isMouseInDeadzone()) this._hideMenu();
          }, 250);
        }
      });

      toggle.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        this._clearAllTimers();
        this.state.isClosingInProgress = false;

        if (content.style.opacity === "1" && this.state.isClickOpened) {
          this._hideMenu();
          this.state.isClickOpened = false;
        } else {
          if (window._stickyCloseAllExcept) window._stickyCloseAllExcept(this.id);
          this.state.isClickOpened = true;
          this.elements.toggle.classList.add("is-open");
          content.style.display = "block";

          // Vynutíme reflow, jinak CSS přechod po nastavení display: block neproběhne
          void content.offsetHeight;

          requestAnimationFrame(() => {
            content.style.opacity = "1";
            content.style.visibility = "visible";
            this._showDeadzone();
            this._startInactivityTimer();
            this._startClickInactivityTimer();
          });
        }
      });

      toggle.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          e.stopPropagation();
          content.style.opacity === "1" ? this._hideMenuKeyboard() : this._showMenuKeyboard();
        }
        if (e.key === "Escape") { e.preventDefault(); this._hideMenuKeyboard(); }
      });

      toggle.addEventListener("blur", () => {
        setTimeout(() => {
          const active = document.activeElement;
          if (
            !content.contains(active) &&
            !toggle.contains(active) &&
            !(subToggle && subToggle.contains(active)) && 
            !(subContent && subContent.contains(active))
          ) {
            if (this.state.isKeyboardOpened) this._hideMenuKeyboard();
          }
        }, 10);
      });

      content.addEventListener("mouseenter", () => {
        this._clearTimer("hide");
        this._clearTimer("inactivity");
        this._clearTimer("clickInactivity");
        this._clearTimer("animation");

        if (this.state.isClosingInProgress) {
          this.state.isClosingInProgress = false;
          content.style.opacity = "1";
          content.style.visibility = "visible";
          content.style.display = "block";
          this._showDeadzone();
          return;
        }
        if (!this.state.isClickOpened) {
          content.style.display = "block";
          requestAnimationFrame(() => {
            content.style.opacity = "1";
            content.style.visibility = "visible";
          });
        }
      });

      content.addEventListener("mouseleave", (e) => {
        const to = e.relatedTarget;
        if (to === toggle || toggle.contains(to)) return;
        if (!this.state.isClickOpened) {
          this.timers.hide = setTimeout(() => {
            if (!this._isMouseInDeadzone() && !this._isMouseOverAnyElement()) this._hideMenu();
          }, this.config.hoverHideDelay);
        } else {
          this._startClickInactivityTimer();
        }
      });

      content.addEventListener("mousemove", () => {
        if (this.state.isClickOpened) {
          this._clearTimer("clickInactivity");
          this._clearTimer("inactivity");
        }
        this.state.currentFocusIndex = -1;
        this._removeKeyboardHoverStyles();
      });

      content.addEventListener("click", () => {
        if (this.state.isClickOpened) {
          this._clearTimer("clickInactivity");
          this._clearTimer("inactivity");
        }
      });

      content.addEventListener("focusin", () => {
        if (this.state.isKeyboardOpened || this.state.isClickOpened) {
          this._clearTimer("clickInactivity");
          this._clearTimer("inactivity");
        }
      });

      const container = this.elements.toggle.closest(".button-container");
if (container) {
  const mainButton = container.querySelector(".main-button, .main-button-second");
  if (mainButton) {
    mainButton.addEventListener("focus", (e) => {
      if (e.target.classList.contains("active")) {
        e.target.classList.add("keyboard-focus");
      } else {
        e.target.style.backgroundColor = "#309ce5";
        e.target.style.color = "white";
      }
    });

    mainButton.addEventListener("blur", (e) => {
      setTimeout(() => {
        e.target.classList.remove("keyboard-focus");
        e.target.style.backgroundColor = "";
        e.target.style.color = "";
      }, 10);
    });
  }
}

      content.addEventListener("focusout", () => {
        setTimeout(() => {
          const active = document.activeElement;
          if (
            !content.contains(active) &&
            !toggle.contains(active) &&
            !(subToggle && subToggle.contains(active)) &&
            !(subContent && subContent.contains(active))
          ) {
            content.querySelectorAll("a, button, span, [tabindex]").forEach((el) => {
              el.style.backgroundColor = "";
              el.style.color = "";
              el.classList.remove("keyboard-hover");
            });
            this._removeKeyboardHoverStyles();
            if (this.state.isKeyboardOpened) this._hideMenuKeyboard();
          }
        }, 10);
      });

      content.querySelectorAll("input, select, textarea, button").forEach((el) => {
        el.addEventListener("focus", () => {
          if (this.state.isClickOpened) { this._clearTimer("clickInactivity"); this._clearTimer("inactivity"); }
        });
        el.addEventListener("input", () => {
          if (this.state.isClickOpened) { this._clearTimer("clickInactivity"); this._clearTimer("inactivity"); }
        });
        el.addEventListener("click", (e) => {
          if (this.state.isClickOpened) { this._startInactivityTimer(); e.stopPropagation(); }
        });
        el.addEventListener("mouseenter", () => this._removeKeyboardHoverStyles());
      });

      content.querySelectorAll(
        "a, button, input, select, textarea, span[tabindex], [tabindex]:not([tabindex='-1'])"
      ).forEach((el) => {
        if (el.tagName === "A") el.addEventListener("click", () => this._clearStorageKeys());

        el.addEventListener("focus", (e) => {
          setTimeout(() => {
            if (document.body.classList.contains("using-mouse")) return;
            content.querySelectorAll("a, button, span, [tabindex]").forEach((other) => {
              if (other !== e.target) {
                other.style.backgroundColor = "";
                other.style.color = "";
                other.classList.remove("keyboard-hover");
              }
            });
            e.target.classList.add("keyboard-hover");
            e.target.style.backgroundColor = e.target.classList.contains("active") ? "#388E3C" : "#309ce5";
            e.target.style.color = "white";
          }, 0);
        });

        el.addEventListener("mouseenter", () => this._removeKeyboardHoverStyles());
      });

      if (subToggle && subContent) this._bindSubEvents();

      document.addEventListener("click", this.handleDocumentClick);
      document.addEventListener("mousemove", this.handleDocumentMouseMove);
      document.addEventListener("keydown", this.handleDocumentKeyDown);
      window.addEventListener("resize", this.handleWindowResize);
      window.addEventListener("scroll", this.handleWindowScroll);
    }

    _bindSubEvents() {
      const { subToggle, subContent, content } = this.elements;

      subToggle.addEventListener("mouseenter", () => {
        this.state.isMouseOverMenuSub = true;
        if (this.state.isClosingInProgressSub) this._showSubMenu();
        else if (!this.state.isClickOpenedSub) this._showSubMenu();
      });

      subToggle.addEventListener("mouseleave", () => {
        this.state.isMouseOverMenuSub = false;
      });

      subToggle.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        this._clearTimer("subHide");
        this._clearTimer("subAnimation");

        if (subContent.style.opacity === "1" && this.state.isClickOpenedSub) {
          this.state.isMouseOverMenuSub = false;
          this.state.isClickOpenedSub = false;
          localStorage.removeItem(this.config.storageKeys.isSubMenuOpen);
          this._hideSubMenu(true);
        } else {
          this.state.isClickOpenedSub = true;
          this.state.isMouseOverMenuSub = true;
          this.state.isClosingInProgressSub = false;
          localStorage.setItem(this.config.storageKeys.isSubMenuOpen, "true");
          this._showSubMenu();
        }
      });

      subToggle.addEventListener("keydown", this._onSubToggleKeyDown.bind(this));
      subToggle.addEventListener("focus", this._onSubToggleFocus.bind(this));
      subToggle.addEventListener("blur", this._onSubToggleBlur.bind(this));

      subContent.addEventListener("mouseenter", () => {
        this.state.isMouseOverMenuSub = true;
        if (this.state.isClosingInProgressSub) this._showSubMenu();
      });

      subContent.addEventListener("mouseleave", () => {
        this.state.isMouseOverMenuSub = false;
        if (!this.state.isClickOpenedSub && !this._isMouseInSubDeadzone()) {
          this.timers.subHide = setTimeout(() => {
            if (!this._isMouseInSubDeadzone()) this._hideSubMenu();
          }, 300);
        }
      });

      subContent.addEventListener("focusin", this._onSubContentFocusIn.bind(this));
      subContent.addEventListener("focusout", this._onSubContentFocusOut.bind(this));

      content.addEventListener("mousemove", (e) => {
        const el = document.elementFromPoint(e.clientX, e.clientY);
        if (
          content.contains(el) &&
          !subToggle.contains(el) &&
          !subContent.contains(el) &&
          !this._isMouseInSubDeadzone()
        ) {
          this.state.isMouseOverMenuSub = false;
          if (subContent.style.opacity === "1" && !this.state.isClickOpenedSub) this._hideSubMenu();
        }
      });

      const arrow = subToggle.querySelector(".arrow, .dropdown-arrow, .caret, .arrow-icon, i.fa-chevron-down");
      if (arrow) {
        arrow.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          subToggle.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, view: window }));
        });
      }
    }

    _onSubToggleKeyDown(e) {
      if (!this.elements.subContent) return;
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        e.stopPropagation();
        this.elements.subContent.style.opacity === "1"
          ? this._hideSubMenuKeyboard()
          : this._showSubMenuKeyboard();
      }
      if (e.key === "Escape") { e.preventDefault(); this._hideSubMenuKeyboard(); }
    }

    _onSubToggleFocus() {
      if (this.elements.subContent && this.elements.subContent.style.opacity !== "1") {
        this._showSubMenuKeyboard();
      }
    }

    _onSubToggleBlur() {
      setTimeout(() => {
        const active = document.activeElement;
        if (
          !(this.elements.subToggle && this.elements.subToggle.contains(active)) &&
          !(this.elements.subContent && this.elements.subContent.contains(active))
        ) {
          if (this.state.isSubKeyboardOpened) this._hideSubMenuKeyboard();
        }
      }, 0);
    }

    _onSubContentFocusIn() {
      if (this.state.isSubKeyboardOpened || this.state.isClickOpenedSub) this._clearTimer("subHide");
    }

    _onSubContentFocusOut() {
      setTimeout(() => {
        if (this.state.currentFocusIndex >= 0) return;

        const active = document.activeElement;
        if (
          !(this.elements.subToggle && this.elements.subToggle.contains(active)) &&
          !(this.elements.subContent && this.elements.subContent.contains(active))
        ) {
          if (this.elements.subContent) {
            this.elements.subContent.querySelectorAll("a, button, span, [tabindex]").forEach((el) => {
              el.style.backgroundColor = "";
              el.style.color = "";
              el.classList.remove("keyboard-hover");
            });
          }
          this._removeKeyboardHoverStyles();
          if (this.state.isSubKeyboardOpened) this._hideSubMenuKeyboard();
        }
      }, 0);
    }

    _onDocumentMouseMove(e) {
      this.state.mouseX = e.clientX;
      this.state.mouseY = e.clientY;

      if (this.elements.content.style.opacity === "1") {
        this._updateDeadzone();
        if (this.elements.subContent && this.elements.subContent.style.opacity === "1") {
          this._updateSubDeadzone();
        }

        const over = this._isMouseOverAnyElement();
        if (!this.state.isClickOpened && !over) {
          if (!this.timers.hide) {
            this.timers.hide = setTimeout(() => {
              if (!this._isMouseOverAnyElement()) this._hideMenu();
            }, this.config.hoverHideDelay);
          }
        } else if (!this.state.isClickOpened) {
          this._clearTimer("hide");
        }

        if (this.state.isClickOpened && !over) {
          if (!this.timers.clickInactivity) this._startClickInactivityTimer();
        } else if (this.state.isClickOpened) {
          this._clearTimer("clickInactivity");
          this._clearTimer("inactivity");
        }
      }
    }

    _onDocumentClick(e) {
      const { toggle, content, subToggle, subContent } = this.elements;
      if (
        !toggle.contains(e.target) &&
        !content.contains(e.target) &&
        !(subToggle && subToggle.contains(e.target)) &&
        !(subContent && subContent.contains(e.target))
      ) {
        this._hideMenu();
        this.state.isClickOpened = false;
      }
    }

    _onDocumentKeyDown(e) {
      if (!this.isOpen()) return;

      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        this._hideMenu();
        this.state.isClickOpened = false;
        this.state.isKeyboardOpened = false;
        return;
      }

      if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        e.preventDefault();
        this._updateFocusableElements();
        if (!this.state.focusableElements.length) return;

        if (e.key === "ArrowDown") {
          this.state.currentFocusIndex++;
          if (this.state.currentFocusIndex >= this.state.focusableElements.length) {
            this.state.currentFocusIndex = 0;
          }
        } else {
          this.state.currentFocusIndex--;
          if (this.state.currentFocusIndex < 0) {
            this.state.currentFocusIndex = this.state.focusableElements.length - 1;
          }
        }

        const current = this.state.focusableElements[this.state.currentFocusIndex];
        if (!current) return;

        if (this.elements.subToggle && current === this.elements.subToggle) {
          this._clearTimer("subHide");
          this._clearTimer("subAnimation");
          this.state.isClosingInProgressSub = false;
          this.state.isClickOpenedSub = true;
          if (this.elements.subContent.style.display === "none") {
           this.elements.subContent.style.display = "block";
            setTimeout(() => {
              this.elements.subContent.style.opacity = "1";
              this.elements.subContent.style.visibility = "visible";
              this._showSubDeadzone();
            }, 10);
          } else {
            this.elements.subContent.style.opacity = "1";
            this.elements.subContent.style.visibility = "visible";
            this._showSubDeadzone();
          }
        }

        if (this.elements.subContent && this.elements.subContent.style.opacity === "1") {
          const inSub = this.elements.subContent.contains(current) || current === this.elements.subToggle;
          if (!inSub) {
            this.state.isClickOpenedSub = false;
            localStorage.removeItem(this.config.storageKeys.isSubMenuOpen);
            this.elements.subContent.style.opacity = "0";
            this.elements.subContent.style.visibility = "hidden";
            this._hideSubDeadzone();
            requestAnimationFrame(() => {
              this._updateFocusableElements();
              const newIdx = this.state.focusableElements.indexOf(current);
              if (newIdx !== -1) this.state.currentFocusIndex = newIdx;
            });
            setTimeout(() => {
              if (!this.state.isClickOpenedSub) this.elements.subContent.style.display = "none";
            }, 300);
          }
        }

        this._applyKeyboardHoverStyle();
        current.focus();
      }

      if (e.key === "Home") {
        e.preventDefault();
        this._updateFocusableElements();
        if (this.state.focusableElements.length) {
          this.state.currentFocusIndex = 0;
          this._applyKeyboardHoverStyle();
          this.state.focusableElements[0].focus();
        }
      }

      if (e.key === "End") {
        e.preventDefault();
        this._updateFocusableElements();
        if (this.state.focusableElements.length) {
          this.state.currentFocusIndex = this.state.focusableElements.length - 1;
          this._applyKeyboardHoverStyle();
          this.state.focusableElements[this.state.currentFocusIndex].focus();
        }
      }
    }

    _onWindowResize() {
      if (this.elements.content.style.opacity === "1") {
        this._updateDeadzone();
        if (this.elements.subContent && this.elements.subContent.style.opacity === "1") {
          this._updateSubDeadzone();
        }
      }
    }

    _onWindowScroll() {
      if (this.elements.content.style.opacity === "1") {
        this._updateDeadzone();
        if (this.elements.subContent && this.elements.subContent.style.opacity === "1") {
          this._updateSubDeadzone();
        }
      }
    }

    open() { this.state.isClickOpened = true; this._showMenu(); }
    close() { this._hideMenu(); this.state.isClickOpened = false; }
    toggle() { this.isOpen() ? this.close() : this.open(); }
    // Stav odvozujeme z opacity protože display a visibility se mění asynchronně přes přechod
    isOpen() { return this.elements.content.style.opacity === "1"; }

    destroy() {
      document.removeEventListener("click", this.handleDocumentClick);
      document.removeEventListener("mousemove", this.handleDocumentMouseMove);
      document.removeEventListener("keydown", this.handleDocumentKeyDown);
      window.removeEventListener("resize", this.handleWindowResize);
      window.removeEventListener("scroll", this.handleWindowScroll);

      [this.deadzoneElement, this.subDeadzoneElement].forEach((el) => {
        if (el && el.parentNode) el.parentNode.removeChild(el);
      });

      this._clearAllTimers();
      this._clearStorageKeys();
      this.elements = {};
      this.isInitialized = false;
    }

    getState() {
      return {
        id: this.id,
        isInitialized: this.isInitialized,
        isOpen: this.isOpen(),
        isClickOpened: this.state.isClickOpened,
        isKeyboardOpened: this.state.isKeyboardOpened,
        hasSubDropdown: !!(this.elements.subToggle && this.elements.subContent),
        subDropdownOpen: this.elements.subContent
          ? this.elements.subContent.style.opacity === "1"
          : false,
      };
    }
  }

  class StickyHeader {
    constructor(options = {}) {
      this.config = {
        focusableSelectors: options.focusableSelectors || "a, button, [tabindex]",
      };

      this.mainHeader = null;
      this.stickyHeader = null;

      this.lastScrollY = window.scrollY || document.documentElement.scrollTop;
      this.ticking = false;
      this.isScrollRestoring = true;

      this.dropdownManager1 = null;
      this.dropdownManager2 = null;
      this.dropdownManager3 = null;

      this.handleScroll = this._onScroll.bind(this);
      this.handleResize = this._applyLayout.bind(this);

      this.init();
    }

    init() {
      new ScrollStateManager();

      document.addEventListener("DOMContentLoaded", () => {
        try {
          this._cacheElements();
          this._buildDOM();
          this._bindHomeIcon();
          this._bindBurgerMenu();
          this._setupScrollRestoreGuard();
          this._setupThemeObserver();
          this._applyLayout();
          this._initialScrollCheck();

          window.addEventListener("scroll", this.handleScroll);
          window.addEventListener("resize", this.handleResize);

          setTimeout(() => this._initDropdowns(), 0);

          this.isInitialized = true;
        } catch (error) {
          console.error("StickyHeader init failed:", error);
        }
      });
    }

    _cacheElements() {
      this.mainHeader = document.querySelector("header");
      if (!this.mainHeader) throw new Error("StickyHeader: original header not found");
    }

    _buildDOM() {
      const originalHeader = this.mainHeader;

      this.stickyHeader = document.createElement("div");
      this.stickyHeader.className = "sticky-header";
      this.stickyHeader.id = "sticky-header";

      const headerContent = originalHeader.cloneNode(true);

      this._moveMobileNavToBody(headerContent);

      headerContent.querySelectorAll(
        ".menu-overlay, .mobile-nav-container, #menuOverlay, #mobileNav, .mobile-nav"
      ).forEach((el) => el.remove());

      const originalStyles = window.getComputedStyle(originalHeader);
      this.stickyHeader.style.overflowX = originalStyles.overflowX;
      this.stickyHeader.style.overflowY = originalStyles.overflowY;

      headerContent.querySelectorAll(
        ".dropdown, .dropdown-toggle, .dropdown-content, .dropdown-content-second, .dropdown-content-third, .sub-dropdown-toggle, .sub-dropdown-content"
      ).forEach((el) => el.classList.add("sticky-clone"));

      const burgerMenu = headerContent.querySelector(".burger-menu");
      if (burgerMenu) burgerMenu.setAttribute("id", "sticky-burgerMenu");

      this._appendNavigation(headerContent, burgerMenu);

      document.body.appendChild(this.stickyHeader);

      // Dokud není sticky header viditelný, vyřadíme jeho prvky z pořadí focus
      this.stickyHeader.querySelectorAll("a, button, [tabindex]")
        .forEach((el) => el.setAttribute("tabindex", "-1"));
      
      const stickyUl = this.stickyHeader.querySelector("ul");
      if (stickyUl) stickyUl.setAttribute("aria-hidden", "true");
    }

    _moveMobileNavToBody(headerContent) {
      const mobileNav = headerContent.querySelector("#mobileNav, .mobile-nav-container, .mobile-nav");
      const menuOverlay = headerContent.querySelector("#menuOverlay, .menu-overlay");

      if (mobileNav) {
        const stickyMobileNav = mobileNav.cloneNode(true);
        stickyMobileNav.setAttribute("id", "sticky-mobileNav");
        stickyMobileNav.classList.add("sticky-mobile-nav");
        stickyMobileNav.querySelectorAll("[id]").forEach((el) => {
          const origId = el.getAttribute("id");
          if (origId !== "sticky-mobileNav") el.setAttribute("id", "sticky-" + origId);
        });
        document.body.appendChild(stickyMobileNav);
      }

      if (menuOverlay) {
        const stickyMenuOverlay = menuOverlay.cloneNode(true);
        stickyMenuOverlay.setAttribute("id", "sticky-menuOverlay");
        stickyMenuOverlay.classList.add("sticky-menu-overlay");
        document.body.appendChild(stickyMenuOverlay);
      }
    }

    _appendNavigation(headerContent, burgerMenu) {
      const navContainer = headerContent.querySelector(".header-nav-container");
      if (navContainer) {
        this.stickyHeader.appendChild(navContainer);
      } else {
        const ulElement = headerContent.querySelector("ul");
        if (ulElement) {
          this.stickyHeader.appendChild(ulElement);
        } else {
          const buttonContainers = headerContent.querySelectorAll(".button-container");
          if (buttonContainers.length > 0) {
            const nc = document.createElement("div");
            nc.className = "sticky-nav-container";
            buttonContainers.forEach((c) => nc.appendChild(c));
            this.stickyHeader.appendChild(nc);
          }
        }
      }

      const burgerInContainer = this.stickyHeader.querySelector(".header-nav-container .burger-menu");
      if (burgerInContainer) {
        burgerInContainer.parentNode.removeChild(burgerInContainer);
        this.stickyHeader.appendChild(burgerInContainer);
      } else if (burgerMenu) {
        this.stickyHeader.appendChild(burgerMenu);
      }
    }

    _applyLayout() {
      const { mainHeader, stickyHeader } = this;
      if (!mainHeader || !stickyHeader) return;

      const mainNavContainer = mainHeader.querySelector(".header-nav-container");
      const stickyNavContainer = stickyHeader.querySelector(".header-nav-container");

      if (!mainNavContainer || !stickyNavContainer) return;

      const mainHeaderHeight = mainHeader.offsetHeight;
      stickyHeader.style.minHeight = mainHeaderHeight + "px";
      stickyHeader.style.maxHeight = mainHeaderHeight + "px";

      const mainLogo = mainHeader.querySelector("img.logo");
      const stickyLogo = stickyHeader.querySelector("img.logo");

      if (mainLogo && stickyLogo) {
        const mainLogoRect = mainLogo.getBoundingClientRect();
        stickyLogo.style.height = mainLogoRect.height + "px";
        stickyLogo.style.width = mainLogoRect.width + "px";
      }

      if (window.innerWidth <= 940) {
        this._applyMobileLayout(stickyNavContainer, stickyLogo, mainLogo);
      } else {
        this._applyDesktopLayout(stickyNavContainer, stickyLogo, mainNavContainer);
      }
    }

    _applyMobileLayout(stickyNavCont, stickyLogo, mainLogo) {
      const mainBurger = this.mainHeader.querySelector(".burger-menu");
      const stickyBurger = this.stickyHeader.querySelector(".burger-menu");

      stickyNavCont.style.cssText = `
        padding-left: 0px;
        padding-right: 0px;
        width: 100%;
        box-sizing: border-box;
        justify-content: flex-start;
      `;

      if (stickyLogo) stickyLogo.style.marginLeft = "";

      // Pozice loga a burgeru nejsou dostupné před vykreslením
      requestAnimationFrame(() => {
        if (mainLogo && stickyLogo) {
          const mainLogoRect = mainLogo.getBoundingClientRect();
          const stickyLogoRect = stickyLogo.getBoundingClientRect();
          const diff = mainLogoRect.left - stickyLogoRect.left;
          stickyNavCont.style.paddingLeft = diff + "px";
        }

        if (mainBurger && stickyBurger) {
          const burgerRect = mainBurger.getBoundingClientRect();
          const hRect = this.stickyHeader.getBoundingClientRect();
          stickyBurger.style.right = (hRect.right - burgerRect.right) + "px";
          stickyBurger.style.left = "auto";
        }
      });
    }

    _applyDesktopLayout(stickyNavCont, stickyLogo, mainNavCont) {
      const headerRect = this.mainHeader.getBoundingClientRect();
      const mainRect = mainNavCont.getBoundingClientRect();
      const paddingLeft = mainRect.left - headerRect.left;
      const paddingRight = headerRect.right - mainRect.right;

      stickyNavCont.style.cssText = `
        padding-left: ${paddingLeft}px;
        padding-right: ${paddingRight}px;
        width: 100%;
        box-sizing: border-box;
        justify-content: flex-start;
        max-width: none;
      `;

      if (stickyLogo) stickyLogo.style.marginLeft = "";

      const stickyBurger = this.stickyHeader.querySelector(".burger-menu");
      if (stickyBurger) {
        stickyBurger.style.right = "";
        stickyBurger.style.left = "";
      }
    }

    // Při obnově pozice po refreshi ignorujeme scroll eventy, aby se sticky header nezobrazil předčasně
    _setupScrollRestoreGuard() {
      window.addEventListener("load", () => {
        const endRestoring = () => {
          this.isScrollRestoring = false;
          window.removeEventListener("mousedown", endRestoring);
          window.removeEventListener("touchstart", endRestoring);
          window.removeEventListener("keydown", endRestoring);
          window.removeEventListener("wheel", endRestoring);
        };
        window.addEventListener("mousedown", endRestoring);
        window.addEventListener("touchstart", endRestoring);
        window.addEventListener("keydown", endRestoring);
        window.addEventListener("wheel", endRestoring);
        setTimeout(() => { this.isScrollRestoring = false; }, 3000);
      });
    }

    _onScroll() {
      if (document.body.style.position === "fixed") return;
      if (this.ticking) return;

      window.requestAnimationFrame(() => {
        const scrollY = window.scrollY || document.documentElement.scrollTop;
        const mainHeaderHeight = this.mainHeader.offsetHeight;

        // 1.5px tolerance kvůli subpixelovému vykreslování
        if (scrollY <= Math.max(mainHeaderHeight + 1.5, 10)) {
          this._hideStickyHeader(true);
          this.stickyHeader.classList.remove("scrolled");
        } else {
          this.stickyHeader.style.transition = "";
          this.stickyHeader.style.transform = "";
          this.stickyHeader.style.opacity = "1";
          this._enableFocus();

          if (scrollY < this.lastScrollY || this.isScrollRestoring) {
            this._showStickyHeader();
            scrollY > mainHeaderHeight + 100
              ? this.stickyHeader.classList.add("scrolled")
              : this.stickyHeader.classList.remove("scrolled");
          // lastScrollY > 0 zamezí skrytí při inicializaci kdy je lastScrollY ještě 0
          } else if (scrollY > this.lastScrollY && this.lastScrollY > 0 && !this.isScrollRestoring) {
            this._hideStickyHeader(false);
          }
        }

        this.lastScrollY = scrollY;
        this.ticking = false;
      });

      this.ticking = true;
    }

    _initialScrollCheck() {
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      const mainHeaderHeight = this.mainHeader.offsetHeight;

      if (scrollY > mainHeaderHeight) {
        setTimeout(() => {
          this.stickyHeader.style.cssText += `
            transform: translateY(0);
            opacity: 1;
            visibility: visible;
          `;
          this.stickyHeader.classList.add("visible");
          this.stickyHeader.setAttribute("aria-hidden", "false");
          this._enableFocus();
          if (scrollY > mainHeaderHeight + 100) this.stickyHeader.classList.add("scrolled");
        }, 50);
      }
    }

    _showStickyHeader() {
      this.stickyHeader.classList.add("visible");
      this.stickyHeader.style.transition = "";
      this.stickyHeader.style.transform = "";
      this.stickyHeader.style.opacity = "1";
      this.stickyHeader.setAttribute("aria-hidden", "false");
      this._enableFocus();
    }

    _hideStickyHeader(animate = false) {
      this.stickyHeader.classList.remove("visible");
      if (window.clearAllDropdownStates) window.clearAllDropdownStates();
      if (animate) {
        this.stickyHeader.style.transition = "opacity 0.1s ease-out";
        this.stickyHeader.style.opacity = "0";
      }
      this._disableFocus();
    }

    _enableFocus() {
      const stickyEls = this.stickyHeader.querySelectorAll(this.config.focusableSelectors);
      const originalEls = this.mainHeader.querySelectorAll(this.config.focusableSelectors);

      stickyEls.forEach((stickyEl) => {
        const originalIndex = stickyEl.getAttribute("data-original-index");
        if (originalIndex !== null) {
          const matching = originalEls[parseInt(originalIndex)];
          if (matching) {
            matching.hasAttribute("tabindex")
              ? stickyEl.setAttribute("tabindex", matching.getAttribute("tabindex"))
              : stickyEl.removeAttribute("tabindex");
            return;
          }
        }

        const text = stickyEl.textContent.trim();
        const href = stickyEl.getAttribute("href");
        const matching = Array.from(originalEls).find((origEl) =>
          text === origEl.textContent.trim() || (href && href === origEl.getAttribute("href"))
        );

        if (matching) {
          matching.hasAttribute("tabindex")
            ? stickyEl.setAttribute("tabindex", matching.getAttribute("tabindex"))
            : stickyEl.removeAttribute("tabindex");
        } else {
          stickyEl.removeAttribute("tabindex");
        }
      });

      const stickyUl = this.stickyHeader.querySelector("ul");
      if (stickyUl) stickyUl.setAttribute("aria-hidden", "false");

      this.stickyHeader.querySelectorAll(".home-icon").forEach((el) => {
        const originalHomeIcon = this.mainHeader.querySelector(".home-icon");
        if (originalHomeIcon && originalHomeIcon.hasAttribute("tabindex")) {
          el.setAttribute("tabindex", originalHomeIcon.getAttribute("tabindex"));
        } else {
          el.removeAttribute("tabindex");
        }
      });
    }

    _disableFocus() {
      this.stickyHeader
        .querySelectorAll(this.config.focusableSelectors)
        .forEach((el) => el.setAttribute("tabindex", "-1"));

      const stickyUl = this.stickyHeader.querySelector("ul");
      if (stickyUl) stickyUl.setAttribute("aria-hidden", "true");
    }

    _setupThemeObserver() {
      let themeChangeTimeout;

      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (
            mutation.type === "attributes" &&
            (mutation.attributeName === "class" || mutation.attributeName === "data-theme")
          ) {
            clearTimeout(themeChangeTimeout);
            const scrollY = window.scrollY || document.documentElement.scrollTop;
            const wasVisible = this.stickyHeader.classList.contains("visible");

            // Změna třídy nebo data-theme může způsobit vizuální zmizení sticky headeru, obnovíme opacity a transform
            if (wasVisible && scrollY > 50) {
              themeChangeTimeout = setTimeout(() => {
                const currentScrollY = window.scrollY || document.documentElement.scrollTop;
                if (this.stickyHeader && currentScrollY > 50) {
                  this.stickyHeader.classList.add("visible");
                  this.stickyHeader.style.opacity = "1";
                  this.stickyHeader.style.transform = "translateY(0)";
                }
              }, 0);
            }
          }
        });
      });

      observer.observe(document.documentElement, { attributes: true, subtree: false });
      observer.observe(document.body, { attributes: true, subtree: false });
    }

    _bindHomeIcon() {
      const findHomepageUrl = () => {
        const el = document.querySelector("header .home-icon[href]");
        if (el) return el.getAttribute("href") || "./";
        for (const link of document.querySelectorAll("header a[href]")) {
          const href = (link.getAttribute("href") || "").replace("/", "");
          if (href === "" || href === "index.html" || href === "index.php") return link.getAttribute("href");
        }
        return "./";
      };

      this.stickyHeader.querySelectorAll(".home-icon").forEach((homeIcon) => {
        const originalHomeIcon = document.querySelector("header .home-icon");

        if (originalHomeIcon && originalHomeIcon.hasAttribute("tabindex")) {
          homeIcon.setAttribute("tabindex", originalHomeIcon.getAttribute("tabindex"));
        } else {
          homeIcon.setAttribute("tabindex", "0");
        }

        // Wrapper může přesahovat přes okolní prvky, proto events jen na samotném img
        homeIcon.style.cursor = "default";
        homeIcon.style.pointerEvents = "none";

        const imgElement = homeIcon.querySelector("img");
        const target = imgElement || homeIcon;

        if (imgElement) {
          imgElement.style.cursor = "pointer";
          imgElement.style.pointerEvents = "auto";
        }

        const navigateHome = (e) => {
          e.stopPropagation();
          e.preventDefault();
          if (window.clearAllDropdownStates) window.clearAllDropdownStates();
          setTimeout(() => { window.location.href = findHomepageUrl(); }, 50);
        };

        target.addEventListener("click", navigateHome);
        if (imgElement) homeIcon.addEventListener("click", navigateHome);
        homeIcon.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") { e.preventDefault(); navigateHome(e); }
        });
      });
    }

    _bindBurgerMenu() {
      const stickyBurgerMenu = this.stickyHeader.querySelector(".burger-menu");
      if (!stickyBurgerMenu) return;

      const stickyMobileNav = document.getElementById("sticky-mobileNav");
      const stickyMenuOverlay = document.getElementById("sticky-menuOverlay");

      if (!stickyMobileNav || !stickyMenuOverlay) {
        console.error("StickyHeader: sticky mobile navigation elements not found");
        return;
      }

      // Klon odstraní listenery přidané při stavbě sticky headeru
      const newBurger = stickyBurgerMenu.cloneNode(true);
      stickyBurgerMenu.parentNode.replaceChild(newBurger, stickyBurgerMenu);

      newBurger.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (window.clearAllDropdownStates) window.clearAllDropdownStates();
        if (window.openMenu) {
          window.openMenu(true);
        } else {
          stickyMobileNav.classList.add("active");
          stickyMenuOverlay.classList.add("active");
          document.body.classList.add("menu-open");
        }
      });

      const stickyCloseButton = stickyMobileNav.querySelector('#closeButton, .close-button, [id*="close"]');
      if (stickyCloseButton) {
        const newClose = stickyCloseButton.cloneNode(true);
        stickyCloseButton.parentNode.replaceChild(newClose, stickyCloseButton);

        newClose.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          if (window.closeMenu) {
            window.closeMenu(true);
          } else {
            stickyMobileNav.classList.remove("active");
            stickyMenuOverlay.classList.remove("active");
            document.body.classList.remove("menu-open");
          }
        });
      }

      const newOverlay = stickyMenuOverlay.cloneNode(true);
      stickyMenuOverlay.parentNode.replaceChild(newOverlay, stickyMenuOverlay);

      newOverlay.addEventListener("click", (e) => {
        if (e.target !== newOverlay) return;
        if (window.closeMenu) {
          window.closeMenu(true);
        } else {
          stickyMobileNav.classList.remove("active");
          newOverlay.classList.remove("active");
          document.body.classList.remove("menu-open");
        }
      });
    }

    _initDropdowns() {
      // Čekáme na inicializaci hlavního DropdownManageru, sticky se inicializuje asynchronně
      if (typeof window.DropdownManager === "undefined") {
        setTimeout(() => this._initDropdowns(), 50);
        return;
      }

      const toggle1 = this.stickyHeader.querySelector(".dropdown-toggle");
      const content1 = this.stickyHeader.querySelector(".dropdown-content");
      if (toggle1 && content1) {
        this.dropdownManager1 = new StickyDropdownManager({
          id: "sticky-dropdown-content",
          toggleEl: toggle1,
          contentEl: content1,
          subToggleEl: this.stickyHeader.querySelector(".sub-dropdown-toggle") || null,
          subContentEl: this.stickyHeader.querySelector(".sub-dropdown-content") || null,
          storagePrefix: "sticky-dropdown-content",
        });
      }

      const toggle2 = this.stickyHeader.querySelector(".dropdown-toggle-second");
      const content2 = this.stickyHeader.querySelector(".dropdown-content-second");
      if (toggle2 && content2) {
        this.dropdownManager2 = new StickyDropdownManager({
          id: "sticky-dropdown-content-second",
          toggleEl: toggle2,
          contentEl: content2,
          storagePrefix: "sticky-dropdown-content-second",
        });
      }

      const toggle3 = this.stickyHeader.querySelector(".dropdown-toggle-third");
      const content3 = this.stickyHeader.querySelector(".dropdown-content-third");
      if (toggle3 && content3) {
        this.dropdownManager3 = new StickyDropdownManager({
          id: "sticky-dropdown-content-third",
          toggleEl: toggle3,
          contentEl: content3,
          storagePrefix: "sticky-dropdown-content-third",
          deadzoneMatchContent: true,
        });
      }

      this._exposeGlobals();
      this._bindFocusInMonitor();

      setTimeout(() => this._applyLayout(), 100);
      const stickyItems = this.stickyHeader.querySelectorAll(
        ".main-button, .main-button-second, .dropdown-content a, .dropdown-content-second a, .sub-dropdown-content a"
      );

      stickyItems.forEach((el) => {
        el.addEventListener("click", () => {
          stickyItems.forEach((item) => {
            item.classList.remove("active");
            item.removeAttribute("aria-current");
          });
          el.classList.add("active");
          el.setAttribute("aria-current", "page");
        });
      });
    }

    // Fokus přes Tab dovnitř obsahu zruší timery, aby se dropdown předčasně nezavřel
    _bindFocusInMonitor() {
      document.addEventListener("focusin", (e) => {
        if (!this.stickyHeader || !this.stickyHeader.classList.contains("visible")) return;

        const dropdownContent = e.target.closest(
          ".dropdown-content, .dropdown-content-second, .dropdown-content-third"
        );
        if (dropdownContent && this.stickyHeader.contains(dropdownContent)) {
          const managers = [this.dropdownManager1, this.dropdownManager2, this.dropdownManager3].filter(Boolean);
          managers.forEach((dm) => {
            dm._clearTimer("hide");
            dm._clearTimer("inactivity");
            dm._clearTimer("clickInactivity");
            dm._clearTimer("animation");
          });
          dropdownContent.style.opacity = "1";
          dropdownContent.style.visibility = "visible";
          dropdownContent.style.display = "block";
        }
      });
    }

    _exposeGlobals() {
      const managers = [this.dropdownManager1, this.dropdownManager2, this.dropdownManager3].filter(Boolean);

      window._stickyCloseAllExcept = function (exceptId) {
        managers.forEach((dm) => {
          if (dm.id !== exceptId) { try { dm.close(); } catch (e) {} }
        });
      };

      window.clearAllDropdownStates = function () {
        Object.keys(localStorage).forEach((key) => {
          if (
            (key.startsWith("sticky_menu_") && key.endsWith("_open")) ||
            (key.startsWith("sticky_submenu_") && key.endsWith("_open")) ||
            key.startsWith("sticky-dropdown-")
          ) {
            localStorage.removeItem(key);
          }
        });
        managers.forEach((dm) => { try { dm.close(); } catch (e) {} });
      };

      window._stickyDropdownManagers = managers;
      window.StickyDropdownManager = StickyDropdownManager;
    }

    destroy() {
      window.removeEventListener("scroll", this.handleScroll);
      window.removeEventListener("resize", this.handleResize);
      [this.dropdownManager1, this.dropdownManager2, this.dropdownManager3].forEach((dm) => {
        if (dm) { try { dm.destroy(); } catch (e) {} }
      });
      this.isInitialized = false;
    }

    getState() {
      return {
        isInitialized: this.isInitialized,
        isScrollRestoring: this.isScrollRestoring,
        dropdownManager1: this.dropdownManager1?.getState() || null,
        dropdownManager2: this.dropdownManager2?.getState() || null,
        dropdownManager3: this.dropdownManager3?.getState() || null,
      };
    }
  }

  const stickyHeader = new StickyHeader();

  if (typeof window !== "undefined") {
    window.stickyHeader = stickyHeader;
  }
})();