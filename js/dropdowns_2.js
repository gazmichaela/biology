(function () {
  class DropdownManager {
    constructor(options = {}) {
      // Unikátní ID pro tento dropdown
      this.id = options.id || 'default-menu';
      
      this.config = {
        toggleSelector: options.toggleSelector || ".dropdown-toggle",
        contentSelector: options.contentSelector || ".dropdown-content",
        subToggleSelector: options.subToggleSelector || ".sub-dropdown-toggle",
        subContentSelector:
          options.subContentSelector || ".sub-dropdown-content",
        enableLogging: options.enableLogging || false,
        clickInactivityDelay: options.clickInactivityDelay || 2000,
        inactivityDelay: options.inactivityDelay || 2000,
        hoverHideDelay: options.hoverHideDelay || 200,
        transitionDuration: options.transitionDuration || 300,
        deadzonePadding: options.deadzonePadding || 10,
      };

      // Storage keys - po inicializaci config, aby this.id bylo dostupné
      this.config.storageKeys = {
        mouseX: "mouseX", // Sdílené pro všechny dropdowny
        mouseY: "mouseY", // Sdílené pro všechny dropdowny
        isMenuOpen: `${this.id}-isOpen`, // Unikátní pro každé menu
        isMouseOverToggle: `${this.id}-mouseOver`, // Unikátní pro každé menu
      };

      this.elements = {};
      this.timers = {
        hide: null,
        animation: null,
        inactivity: null,
        submenuHide: null,
        clickInactivity: null,
      };

      this.state = {
        mouseX: parseInt(localStorage.getItem(this.config.storageKeys.mouseX)) || 0,
        mouseY: parseInt(localStorage.getItem(this.config.storageKeys.mouseY)) || 0,
        lastMouseMoveTime: 0,
        lastMouseUpdate: 0,
        isClickOpened: false,
        isSubmenuActive: false,
        isMouseOverSubmenu: false,
        isClosingInProgress: false,
      };

      // Deadzone element - unikátní pro každý dropdown
      this.deadzoneElement = null;

      // Bound handlers pro event listenery
      this.handleToggleMouseEnter = this._onToggleMouseEnter.bind(this);
      this.handleToggleMouseLeave = this._onToggleMouseLeave.bind(this);
      this.handleToggleClick = this._onToggleClick.bind(this);
      this.handleContentMouseEnter = this._onContentMouseEnter.bind(this);
      this.handleContentMouseLeave = this._onContentMouseLeave.bind(this);
      this.handleContentMouseMove = this._onContentMouseMove.bind(this);
      this.handleContentClick = this._onContentClick.bind(this);
      this.handleDocumentClick = this._onDocumentClick.bind(this);
      this.handleDocumentMouseMove = this._onDocumentMouseMove.bind(this);
      this.handleWindowResize = this._onWindowResize.bind(this);
      this.handleWindowScroll = this._onWindowScroll.bind(this);
      this.handleWindowLoad = this._onWindowLoad.bind(this);

      this.init();
    }

    init() {
      try {
        this._cacheElements();
        this._validateElements();
        this._setupStyles();
        this._createDeadzone();
        this._bindEvents();
        this._checkInitialState();

        this.isInitialized = true;
        this._log("Initialized successfully");
      } catch (error) {
        console.error(`DropdownManager [${this.id}] init failed:`, error);
      }
    }

    _cacheElements() {
      const {
        toggleSelector,
        contentSelector,
        subToggleSelector,
        subContentSelector,
      } = this.config;

      this.elements = {
        toggle: document.querySelector(toggleSelector),
        content: document.querySelector(contentSelector),
        subToggle: document.querySelector(subToggleSelector),
        subContent: document.querySelector(subContentSelector),
      };
    }

    _validateElements() {
      if (!this.elements.toggle) {
        throw new Error(
          `Dropdown toggle not found: ${this.config.toggleSelector}`
        );
      }
      if (!this.elements.content) {
        throw new Error(
          `Dropdown content not found: ${this.config.contentSelector}`
        );
      }
    }

    _createDeadzone() {
      // Create deadzone element s unikátním ID
      this.deadzoneElement = document.createElement('div');
      this.deadzoneElement.id = `dropdown-deadzone-${this.id}`;
      this.deadzoneElement.className = 'dropdown-deadzone';
      this.deadzoneElement.style.position = 'fixed';
      this.deadzoneElement.style.backgroundColor = 'rgba(255, 0, 0, 0.3)'; // Red for debugging
      this.deadzoneElement.style.pointerEvents = 'none';
      this.deadzoneElement.style.display = 'none';
      this.deadzoneElement.style.zIndex = '9999';
      this.deadzoneElement.style.border = '2px solid red';
      
      document.body.appendChild(this.deadzoneElement);
    }

    _updateDeadzone() {
      if (!this.deadzoneElement) return;

      const container = this.elements.toggle.closest('.button-container');
      
      if (!container) {
        this.deadzoneElement.style.display = 'none';
        return;
      }

      const mainButton = container.querySelector('.main-button');
      const dropdownToggle = this.elements.toggle;
      
      if (!mainButton) {
        this.deadzoneElement.style.display = 'none';
        return;
      }

      const mainButtonRect = mainButton.getBoundingClientRect();
      const toggleRect = dropdownToggle.getBoundingClientRect();
      const contentRect = this.elements.content.getBoundingClientRect();

      // Calculate total width from actual element widths minus 2px for alignment
      const totalWidth = mainButton.offsetWidth + dropdownToggle.offsetWidth - 2;
      
      // Start from left edge of main button
      const left = mainButtonRect.left;
      
      // Top starts at bottom of buttons
      const top = Math.max(mainButtonRect.bottom, toggleRect.bottom);
      const height = contentRect.top - top;

      // Only show deadzone if there's actually a gap
      if (height > 0) {
        this.deadzoneElement.style.left = left + 'px';
        this.deadzoneElement.style.top = top + 'px';
        this.deadzoneElement.style.width = totalWidth + 'px';
        this.deadzoneElement.style.height = height - 'px';
        this.deadzoneElement.style.display = 'block';
      } else {
        this.deadzoneElement.style.display = 'none';
      }
    }

    _showDeadzone() {
      if (this.deadzoneElement) {
        this._updateDeadzone();
      }
    }

    _hideDeadzone() {
      if (this.deadzoneElement) {
        this.deadzoneElement.style.display = 'none';
      }
    }

    _isMouseInDeadzone() {
      if (!this.deadzoneElement || this.deadzoneElement.style.display === 'none') {
        return false;
      }

      const { mouseX, mouseY } = this.state;
      const rect = this.deadzoneElement.getBoundingClientRect();

      return (
        mouseX >= rect.left &&
        mouseX <= rect.right &&
        mouseY >= rect.top &&
        mouseY <= rect.bottom
      );
    }

    _setupStyles() {
      const { content } = this.elements;
      const { transitionDuration } = this.config;

      content.style.transition = `opacity ${
        transitionDuration / 1000
      }s ease-in-out, visibility ${transitionDuration / 1000}s ease-in-out`;
      content.style.opacity = "0";
      content.style.visibility = "hidden";
      content.style.display = "none";
    }

    _isMouseOverSubmenuElements() {
      const { subContent, subToggle } = this.elements;
      const { mouseX, mouseY } = this.state;

      if (subContent && subContent.style.display === "block") {
        const rect = subContent.getBoundingClientRect();
        if (
          mouseX >= rect.left &&
          mouseX <= rect.right &&
          mouseY >= rect.top &&
          mouseY <= rect.bottom
        ) {
          return true;
        }
      }

      if (subToggle) {
        const rect = subToggle.getBoundingClientRect();
        if (
          mouseX >= rect.left &&
          mouseX <= rect.right &&
          mouseY >= rect.top &&
          mouseY <= rect.bottom
        ) {
          return true;
        }
      }

      return false;
    }

    _showMenu() {
      this._clearAllTimers();
      this.state.isClosingInProgress = false;

      this.elements.content.style.display = "block";

      requestAnimationFrame(() => {
        this.elements.content.style.opacity = "1";
        this.elements.content.style.visibility = "visible";
        
        // Show deadzone when menu opens
        this._showDeadzone();
      });

      if (this.state.isClickOpened) {
        this._startInactivityTimer();
        localStorage.setItem(this.config.storageKeys.isMenuOpen, "true");
      }

      this._log("Menu shown");
    }

    _hideMenu() {
      if (window.tabNavigationActive) {
        return;
      }

      this._clearAllTimers();
      this.state.isClosingInProgress = true;

      this.elements.content.style.opacity = "0";
      this.elements.content.style.visibility = "hidden";
      
      // Hide deadzone at the same time as menu starts fading
      this._hideDeadzone();

      if (typeof window.closeSubMenuWithParent === "function") {
        window.closeSubMenuWithParent();
      }

      this.timers.animation = setTimeout(() => {
        this.elements.content.style.display = "none";

        this._hideSubmenu();

        this.state.isClickOpened = false;
        this.state.isSubmenuActive = false;
        this.state.isMouseOverSubmenu = false;
        this.state.isClosingInProgress = false;

        this._clearStorageKeys();
      }, this.config.transitionDuration);

      this._log("Menu hidden");
    }

    _hideSubmenu() {
      const { subContent } = this.elements;
      if (!subContent) return;

      subContent.style.opacity = "0";
      subContent.style.visibility = "hidden";
      subContent.style.display = "none";
    }

    _startInactivityTimer() {
      this._clearTimer("inactivity");

      this.timers.inactivity = setTimeout(() => {
        if (window.tabNavigationActive) {
          return;
        }

        if (!this._isMouseOverAnyElement()) {
          this._hideMenu();
          this.state.isClickOpened = false;
        }
      }, this.config.inactivityDelay);
    }

    _startClickInactivityTimer() {
      this._clearTimer("clickInactivity");

      this.timers.clickInactivity = setTimeout(() => {
        if (window.tabNavigationActive) {
          return;
        }

        if (!this._isMouseOverAnyElement()) {
          this._hideMenu();
          this.state.isClickOpened = false;
        }
      }, this.config.clickInactivityDelay);
    }

    _isMouseOverAnyElement() {
      const { mouseX, mouseY } = this.state;
      const menuRect = this.elements.content.getBoundingClientRect();
      const toggleRect = this.elements.toggle.getBoundingClientRect();

      const isMouseOverMenu =
        mouseX >= menuRect.left &&
        mouseX <= menuRect.right &&
        mouseY >= menuRect.top &&
        mouseY <= menuRect.bottom;

      const isMouseOverToggle =
        mouseX >= toggleRect.left &&
        mouseX <= toggleRect.right &&
        mouseY >= toggleRect.top &&
        mouseY <= toggleRect.bottom;

      const isMouseOverSub = this._isMouseOverSubmenuElements();
      const isMouseInDeadzone = this._isMouseInDeadzone();

      return (
        isMouseOverMenu ||
        isMouseOverToggle ||
        isMouseOverSub ||
        isMouseInDeadzone
      );
    }

    _onToggleMouseEnter() {
      this._clearTimer("hide");
      this.state.lastMouseMoveTime = Date.now();

      // Zavřít ostatní menu při hoveru pomocí ID
      if (window.closeAllMenusExcept) {
        window.closeAllMenusExcept(this.id);
      }

      if (!this.state.isClickOpened) {
        requestAnimationFrame(() => {
          this._showMenu();
        });
      }

      this._clearTimer("submenuHide");
      localStorage.setItem(
        this.config.storageKeys.isMouseOverToggle,
        "true"
      );
    }

    _onToggleMouseLeave(e) {
      localStorage.removeItem(this.config.storageKeys.isMouseOverToggle);

      if (this.state.isClickOpened) {
        this._startClickInactivityTimer();
        return;
      }

      const toElement = e.relatedTarget;

      if (
        toElement !== this.elements.content &&
        !this.elements.content.contains(toElement)
      ) {
        this.timers.hide = setTimeout(() => {
          // Check if mouse is in deadzone before hiding
          if (!this.state.isClickOpened && !this._isMouseInDeadzone()) {
            this._hideMenu();
          }
        }, 250);
      }
    }

    _onToggleClick(e) {
      e.preventDefault();
      e.stopPropagation();

      this._clearAllTimers();
      this.state.isClosingInProgress = false;

      if (
        this.elements.content.style.opacity === "1" &&
        this.state.isClickOpened
      ) {
        this._hideMenu();
        this.state.isClickOpened = false;
      } else {
        if (typeof window.closeAllMenusExcept === "function") {
          window.closeAllMenusExcept(this.id);
        }

        this.state.isClickOpened = true;
        this._clearTimer("submenuHide");

        this.elements.content.style.display = "block";

        requestAnimationFrame(() => {
          this.elements.content.style.opacity = "1";
          this.elements.content.style.visibility = "visible";
          this._showDeadzone(); // Show deadzone on click

          localStorage.setItem(
            this.config.storageKeys.isMenuOpen,
            "true"
          );

          this._startInactivityTimer();
          this._startClickInactivityTimer();
        });
      }

      this._log("Toggle clicked");
    }

    _onContentMouseEnter() {
      this._clearTimer("hide");
      this._clearTimer("submenuHide");

      if (!this.state.isClickOpened) {
        this._clearTimer("hide");
        this._clearTimer("animation");

        this.elements.content.style.display = "block";

        requestAnimationFrame(() => {
          this.elements.content.style.opacity = "1";
          this.elements.content.style.visibility = "visible";
        });
      } else {
        this._clearTimer("clickInactivity");
        this._clearTimer("inactivity");
      }
    }

    _onContentMouseLeave(e) {
      if (!this.state.isClickOpened) {
        this.timers.hide = setTimeout(() => {
          // Check if mouse is in deadzone before hiding
          if (!this._isMouseInDeadzone()) {
            this._hideMenu();
          }
        }, this.config.hoverHideDelay);
      } else {
        this._startClickInactivityTimer();
      }
    }

    _onContentMouseMove() {
      if (this.state.isClickOpened) {
        this._clearTimer("clickInactivity");
        this._clearTimer("inactivity");
      }
    }

    _onContentClick() {
      if (this.state.isClickOpened) {
        this._clearTimer("clickInactivity");
        this._clearTimer("inactivity");
      }
    }

    _onDocumentClick(event) {
      const { subToggle, subContent } = this.elements;

      if (
        !this.elements.toggle.contains(event.target) &&
        !this.elements.content.contains(event.target) &&
        (!subToggle || !subToggle.contains(event.target)) &&
        (!subContent || !subContent.contains(event.target))
      ) {
        this._hideMenu();
        this.state.isClickOpened = false;
      }
    }

    _onDocumentMouseMove(e) {
      const now = Date.now();

      this.state.mouseX = e.clientX;
      this.state.mouseY = e.clientY;
      this.state.lastMouseMoveTime = now;

      if (now - this.state.lastMouseUpdate > 100) {
        localStorage.setItem(this.config.storageKeys.mouseX, this.state.mouseX);
        localStorage.setItem(this.config.storageKeys.mouseY, this.state.mouseY);
        this.state.lastMouseUpdate = now;
      }

      // Update deadzone position if menu is open
      if (this.elements.content.style.opacity === "1") {
        this._updateDeadzone();
        
        const isMouseOver = this._isMouseOverAnyElement();
        
        // Handle hover mode
        if (!this.state.isClickOpened && !isMouseOver) {
          if (!this.timers.hide) {
            this.timers.hide = setTimeout(() => {
              this._hideMenu();
            }, this.config.hoverHideDelay);
          }
        } else if (!this.state.isClickOpened) {
          this._clearTimer("hide");
        }
        
        // Handle click mode - start inactivity timer when mouse leaves area
        if (this.state.isClickOpened && !isMouseOver) {
          if (!this.timers.clickInactivity) {
            this._startClickInactivityTimer();
          }
        } else if (this.state.isClickOpened) {
          this._clearTimer("clickInactivity");
          this._clearTimer("inactivity");
        }
      }
    }

    _onWindowResize() {
      // Update deadzone on resize if menu is open
      if (this.elements.content.style.opacity === "1") {
        this._updateDeadzone();
      }
    }

    _onWindowScroll() {
      // Update deadzone on scroll if menu is open
      if (this.elements.content.style.opacity === "1") {
        this._updateDeadzone();
      }
    }

    _onWindowLoad() {
      // Reserved for future use
    }

    _checkInitialState() {
      const savedMouseX =
        parseInt(localStorage.getItem(this.config.storageKeys.mouseX)) || 0;
      const savedMouseY =
        parseInt(localStorage.getItem(this.config.storageKeys.mouseY)) || 0;

      this.state.mouseX = savedMouseX;
      this.state.mouseY = savedMouseY;

      const toggleRect = this.elements.toggle.getBoundingClientRect();

      const isOverToggle =
        savedMouseX >= toggleRect.left &&
        savedMouseX <= toggleRect.right &&
        savedMouseY >= toggleRect.top &&
        savedMouseY <= toggleRect.bottom;

      const wasOverToggle =
        localStorage.getItem(
          this.config.storageKeys.isMouseOverToggle
        ) === "true";

      let isCurrentlyHovered = false;
      try {
        isCurrentlyHovered = this.elements.toggle.matches(":hover");
      } catch (e) {
        isCurrentlyHovered = false;
      }

      if (isOverToggle || wasOverToggle || isCurrentlyHovered) {
        setTimeout(() => {
          this._showMenu();
        }, 50);
      }

      if (
        localStorage.getItem(this.config.storageKeys.isMenuOpen) === "true"
      ) {
        this.state.isClickOpened = true;
        setTimeout(() => {
          this._showMenu();
        }, 50);
      }
    }

    _bindEvents() {
      const { toggle, content } = this.elements;

      // Toggle events
      toggle.addEventListener("mouseenter", this.handleToggleMouseEnter);
      toggle.addEventListener("mouseleave", this.handleToggleMouseLeave);
      toggle.addEventListener("click", this.handleToggleClick);

      // Content events
      content.addEventListener("mouseenter", this.handleContentMouseEnter);
      content.addEventListener("mouseleave", this.handleContentMouseLeave);
      content.addEventListener("mousemove", this.handleContentMouseMove);
      content.addEventListener("click", this.handleContentClick);

      // Interactive elements
      const interactiveElements = content.querySelectorAll(
        "input, select, textarea, button"
      );
      interactiveElements.forEach((element) => {
        element.addEventListener("focus", () => {
          if (this.state.isClickOpened) {
            this._clearTimer("clickInactivity");
            this._clearTimer("inactivity");
          }
        });

        element.addEventListener("input", () => {
          if (this.state.isClickOpened) {
            this._clearTimer("clickInactivity");
            this._clearTimer("inactivity");
          }
        });

        element.addEventListener("click", (e) => {
          if (this.state.isClickOpened) {
            this._startInactivityTimer();
            e.stopPropagation();
          }
        });
      });

      // Menu links cleanup
      const menuLinks = content.querySelectorAll("a");
      menuLinks.forEach((link) => {
        link.addEventListener("click", () => {
          this._clearStorageKeys();
        });
      });

      // Document events
      document.addEventListener("click", this.handleDocumentClick);
      document.addEventListener("mousemove", this.handleDocumentMouseMove);

      // Window events
      window.addEventListener("resize", this.handleWindowResize);
      window.addEventListener("load", this.handleWindowLoad);

      this._log("Events bound");
    }

    _clearTimer(timerName) {
      if (this.timers[timerName]) {
        clearTimeout(this.timers[timerName]);
        this.timers[timerName] = null;
      }
    }

    _clearAllTimers() {
      Object.keys(this.timers).forEach((key) => {
        this._clearTimer(key);
      });
    }

    _clearStorageKeys() {
      Object.values(this.config.storageKeys).forEach((key) => {
        localStorage.removeItem(key);
      });
    }

    _log(message, level = "info") {
      if (!this.config.enableLogging) return;
      const logMethod = console[level] || console.log;
      logMethod(`[DropdownManager:${this.id}] ${message}`);
    }

    // Public API
    open() {
      this.state.isClickOpened = true;
      this._showMenu();
    }

    close() {
      this._hideMenu();
      this.state.isClickOpened = false;
    }

    toggle() {
      if (this.elements.content.style.opacity === "1") {
        this.close();
      } else {
        this.open();
      }
    }

    isOpen() {
      return this.elements.content.style.opacity === "1";
    }

    setSubmenuActive(active) {
      this.state.isSubmenuActive = active;
      this.state.isMouseOverSubmenu = active;

      if (active) {
        this._clearTimer("submenuHide");
        if (this.state.isClickOpened) {
          this._startInactivityTimer();
        }
      }
    }

    refresh() {
      this._cacheElements();
      this._log("Refreshed");
    }

    destroy() {
      // Remove event listeners
      const { toggle, content } = this.elements;

      toggle.removeEventListener("mouseenter", this.handleToggleMouseEnter);
      toggle.removeEventListener("mouseleave", this.handleToggleMouseLeave);
      toggle.removeEventListener("click", this.handleToggleClick);

      content.removeEventListener("mouseenter", this.handleContentMouseEnter);
      content.removeEventListener("mouseleave", this.handleContentMouseLeave);
      content.removeEventListener("mousemove", this.handleContentMouseMove);
      content.removeEventListener("click", this.handleContentClick);

      document.removeEventListener("click", this.handleDocumentClick);
      document.removeEventListener("mousemove", this.handleDocumentMouseMove);

      window.removeEventListener("resize", this.handleWindowResize);
      window.removeEventListener("load", this.handleWindowLoad);

      // Remove deadzone element
      if (this.deadzoneElement && this.deadzoneElement.parentNode) {
        this.deadzoneElement.parentNode.removeChild(this.deadzoneElement);
      }

      // Clear timers
      this._clearAllTimers();

      // Clear storage
      this._clearStorageKeys();

      this.elements = {};
      this.isInitialized = false;

      this._log("Destroyed");
    }

    getState() {
      return {
        id: this.id,
        isInitialized: this.isInitialized,
        isOpen: this.isOpen(),
        isClickOpened: this.state.isClickOpened,
        isSubmenuActive: this.state.isSubmenuActive,
        mousePosition: {
          x: this.state.mouseX,
          y: this.state.mouseY,
        },
        config: this.config,
      };
    }
  }

  // Global API setup - inicializace všech tří dropdownů
  let dropdownManager1;
  let dropdownManager2;
  let dropdownManager3;

  document.addEventListener("DOMContentLoaded", function () {
    // První dropdown
    dropdownManager1 = new DropdownManager({
      id: "first-menu",
      toggleSelector: ".dropdown-toggle",
      contentSelector: ".dropdown-content",
      subToggleSelector: ".sub-dropdown-toggle",
      subContentSelector: ".sub-dropdown-content",
      enableLogging: false,
    });

    // Druhý dropdown
    dropdownManager2 = new DropdownManager({
      id: "second-menu",
      toggleSelector: ".dropdown-toggle-second",
      contentSelector: ".dropdown-content-second",
      enableLogging: false,
    });

    // Třetí dropdown
    dropdownManager3 = new DropdownManager({
      id: "dropdown-content-third",
      toggleSelector: ".dropdown-toggle-third",
      contentSelector: ".dropdown-content-third",
      enableLogging: false,
    });

    // Global helper functions
    window.closeAllMenusExcept = function (exceptMenuId) {
      if (exceptMenuId !== "first-menu" && dropdownManager1) {
        dropdownManager1.close();
      }
      if (exceptMenuId !== "second-menu" && dropdownManager2) {
        dropdownManager2.close();
      }
      if (exceptMenuId !== "dropdown-content-third" && dropdownManager3) {
        dropdownManager3.close();
      }
    };

    // Jednotlivé zavírací funkce
    window.closeFirstMenu = function () {
      if (dropdownManager1) {
        dropdownManager1.close();
      }
    };

    window.closeSecondMenu = function () {
      if (dropdownManager2) {
        dropdownManager2.close();
      }
    };

    window.closeThirdMenu = function () {
      if (dropdownManager3) {
        dropdownManager3.close();
      }
    };

    window.closeSubMenuWithParent = function () {
      if (dropdownManager1) {
        dropdownManager1.setSubmenuActive(false);
      }
    };

    window.setSubmenuActive = function (active) {
      if (dropdownManager1) {
        dropdownManager1.setSubmenuActive(active);
      }
    };

    // Expose public API pro všechny dropdowny
    window.dropdownMenus = {
      first: {
        open: () => dropdownManager1?.open(),
        close: () => dropdownManager1?.close(),
        toggle: () => dropdownManager1?.toggle(),
        isOpen: () => dropdownManager1?.isOpen() || false,
        getState: () => dropdownManager1?.getState() || null,
        refresh: () => dropdownManager1?.refresh(),
        destroy: () => dropdownManager1?.destroy(),
      },
      second: {
        open: () => dropdownManager2?.open(),
        close: () => dropdownManager2?.close(),
        toggle: () => dropdownManager2?.toggle(),
        isOpen: () => dropdownManager2?.isOpen() || false,
        getState: () => dropdownManager2?.getState() || null,
        refresh: () => dropdownManager2?.refresh(),
        destroy: () => dropdownManager2?.destroy(),
      },
      third: {
        open: () => dropdownManager3?.open(),
        close: () => dropdownManager3?.close(),
        toggle: () => dropdownManager3?.toggle(),
        isOpen: () => dropdownManager3?.isOpen() || false,
        getState: () => dropdownManager3?.getState() || null,
        refresh: () => dropdownManager3?.refresh(),
        destroy: () => dropdownManager3?.destroy(),
      },
    };

    // Zpětná kompatibilita - původní API pro první dropdown
    window.dropdownMenu = window.dropdownMenus.first;
  });

  // Module exports
  if (typeof module !== "undefined" && module.exports) {
    module.exports = DropdownManager;
  }
  if (typeof window !== "undefined") {
    window.DropdownManager = DropdownManager;
  }
})();