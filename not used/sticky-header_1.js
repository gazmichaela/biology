// Globální objekty pro správu timeoutů napříč všemi dropdowny
window.dropdownTimeouts = window.dropdownTimeouts || {};
window.autoHideTimeouts = window.autoHideTimeouts || {};
history.scrollRestoration = "manual";

let isNavigatingAway = false;
document.addEventListener("click", (e) => {
  const link = e.target.closest("a[href]");
  if (link && !link.target && link.href && !link.href.startsWith("#")) {
    isNavigatingAway = true;
  }
});

window.addEventListener("beforeunload", () => {
  if (!isNavigatingAway) {
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
document.addEventListener("DOMContentLoaded", function () {
  createStickyHeader();
  initStickyHeaderFunctionality();
});

// Pomocné: zavření všech sticky dropdownů
function clearAllDropdownStates() {
  Object.keys(localStorage).forEach((key) => {
    if (
      (key.startsWith("sticky_menu_") && key.endsWith("_open")) ||
      (key.startsWith("sticky_submenu_") && key.endsWith("_open")) ||
      key.startsWith("sticky-dropdown-")
    ) {
      localStorage.removeItem(key);
    }
  });

  if (window._stickyDropdownManagers) {
    window._stickyDropdownManagers.forEach((dm) => {
      try { dm.close(); } catch (e) { /* ignoruj */ }
    });
  }
}

window.clearAllDropdownStates = clearAllDropdownStates;

// Home icon
function initializeHomeIcon(stickyHeader) {
  stickyHeader.querySelectorAll(".home-icon").forEach((homeIcon) => {
    const originalHomeIcon = document.querySelector("header .home-icon");

    if (originalHomeIcon && originalHomeIcon.hasAttribute("tabindex")) {
      homeIcon.setAttribute("tabindex", originalHomeIcon.getAttribute("tabindex"));
    } else {
      homeIcon.setAttribute("tabindex", "0");
    }

    homeIcon.style.cursor = "default";
    homeIcon.style.pointerEvents = "none";

    const imgElement = homeIcon.querySelector("img");
    const target = imgElement || homeIcon;

    if (imgElement) {
      imgElement.style.cursor = "pointer";
      imgElement.style.pointerEvents = "auto";
    }

    function findHomepageUrl() {
      const el = document.querySelector("header .home-icon[href]");
      if (el) return el.getAttribute("href") || "./";
      for (const link of document.querySelectorAll("header a[href]")) {
        const href = (link.getAttribute("href") || "").replace("/", "");
        if (href === "" || href === "index.html" || href === "index.php") return link.getAttribute("href");
      }
      return "./";
    }

    function navigateHome(e) {
      e.stopPropagation();
      e.preventDefault();
      clearAllDropdownStates();
      setTimeout(() => { window.location.href = findHomepageUrl(); }, 50);
    }

    target.addEventListener("click", navigateHome);
    if (imgElement) homeIcon.addEventListener("click", navigateHome);

    homeIcon.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); navigateHome(e); }
    });
  });
}
function initializeStickyBurgerMenu() {
  const stickyHeader = document.querySelector(".sticky-header");
  if (!stickyHeader) return;

  const stickyBurgerMenu = stickyHeader.querySelector(".burger-menu");
  if (!stickyBurgerMenu) return;

  const stickyMobileNav    = document.getElementById("sticky-mobileNav");
  const stickyMenuOverlay  = document.getElementById("sticky-menuOverlay");
  if (!stickyMobileNav || !stickyMenuOverlay) {
    console.error("Sticky mobile navigation elements not found");
    return;
  }

  // Burger button
  const newBurger = stickyBurgerMenu.cloneNode(true);
  stickyBurgerMenu.parentNode.replaceChild(newBurger, stickyBurgerMenu);

  newBurger.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    clearAllDropdownStates();
    if (window.openMenu) {
      window.openMenu(true);
    } else {
      const nav     = document.getElementById("sticky-mobileNav");
      const overlay = document.getElementById("sticky-menuOverlay");
      if (nav && overlay) {
        nav.classList.add("active");
        overlay.classList.add("active");
        document.body.classList.add("menu-open");
      }
    }
  });

  // Close button
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
        const nav     = document.getElementById("sticky-mobileNav");
        const overlay = document.getElementById("sticky-menuOverlay");
        if (nav && overlay) {
          nav.classList.remove("active");
          overlay.classList.remove("active");
          document.body.classList.remove("menu-open");
        }
      }
    });
  }

  // Overlay klik
  const newOverlay = stickyMenuOverlay.cloneNode(true);
  stickyMenuOverlay.parentNode.replaceChild(newOverlay, stickyMenuOverlay);

  newOverlay.addEventListener("click", (e) => {
    if (e.target !== newOverlay) return;
    if (window.closeMenu) {
      window.closeMenu(true);
    } else {
      const nav = document.getElementById("sticky-mobileNav");
      if (nav) {
        nav.classList.remove("active");
        newOverlay.classList.remove("active");
        document.body.classList.remove("menu-open");
      }
    }
  });
}
// Inicializace DropdownManagerů pro sticky header

/**
 * Čeká, dokud není dostupná třída DropdownManager (načtena hlavním skriptem),
 * pak pro každý dropdown uvnitř sticky headeru vytvoří vlastní instanci.
 */
function initializeStickyDropdownManagers() {
  const stickyHeader = document.querySelector(".sticky-header");
  if (!stickyHeader) return;

  // Pokud DropdownManager ještě není načten, zkusíme to znovu za chvíli
  if (typeof window.DropdownManager === "undefined") {
    setTimeout(initializeStickyDropdownManagers, 50);
    return;
  }

  window._stickyDropdownManagers = window._stickyDropdownManagers || [];

  // Zničíme případné staré instance (při reinicializaci)
  window._stickyDropdownManagers.forEach((dm) => { try { dm.destroy(); } catch (e) {} });
  window._stickyDropdownManagers = [];

  // ── Dropdown 1: hlavní (s podporou subdropdownu) ──────────────────────────
  const toggle1  = stickyHeader.querySelector(".dropdown-toggle");
  const content1 = stickyHeader.querySelector(".dropdown-content");
  if (toggle1 && content1) {
    // Dočasně nastavíme unikátní ID selektory, aby DropdownManager trefil správné elementy
    const uid1 = "sticky-dm-1-" + Date.now();
    toggle1.setAttribute("data-sticky-dm-id", uid1);
    content1.setAttribute("data-sticky-dm-id", uid1);

    const subToggle1  = stickyHeader.querySelector(".sub-dropdown-toggle");
    const subContent1 = stickyHeader.querySelector(".sub-dropdown-content");
    if (subToggle1) subToggle1.setAttribute("data-sticky-dm-id", uid1 + "-sub-t");
    if (subContent1) subContent1.setAttribute("data-sticky-dm-id", uid1 + "-sub-c");

    const dm1 = new StickyDropdownManager({
      id: "sticky-dropdown-content",
      toggleEl:     toggle1,
      contentEl:    content1,
      subToggleEl:  subToggle1  || null,
      subContentEl: subContent1 || null,
      storagePrefix: "sticky-dropdown-content",
    });
    window._stickyDropdownManagers.push(dm1);
  }

  // ── Dropdown 2 ─────────────────────────────────────────────────────────────
  const toggle2  = stickyHeader.querySelector(".dropdown-toggle-second");
  const content2 = stickyHeader.querySelector(".dropdown-content-second");
  if (toggle2 && content2) {
    const dm2 = new StickyDropdownManager({
      id: "sticky-dropdown-content-second",
      toggleEl:  toggle2,
      contentEl: content2,
      storagePrefix: "sticky-dropdown-content-second",
    });
    window._stickyDropdownManagers.push(dm2);
  }

  // ── Dropdown 3 ─────────────────────────────────────────────────────────────
  const toggle3  = stickyHeader.querySelector(".dropdown-toggle-third");
  const content3 = stickyHeader.querySelector(".dropdown-content-third");
  if (toggle3 && content3) {
    const dm3 = new StickyDropdownManager({
      id: "sticky-dropdown-content-third",
      toggleEl:  toggle3,
      contentEl: content3,
      storagePrefix: "sticky-dropdown-content-third",
      deadzoneMatchContent: true,
    });
    window._stickyDropdownManagers.push(dm3);
  }

  // Vzájemné zavírání sticky dropdownů
  window._stickyCloseAllExcept = function (exceptId) {
    window._stickyDropdownManagers.forEach((dm) => {
      if (dm.id !== exceptId) { try { dm.close(); } catch (e) {} }
    });
  };
}

// StickyDropdownManager – stejná logika jako DropdownManager, ale přijímá
// přímo DOM elementy místo CSS selektorů. Tím se vyhne konfliktům se
// selektory normálního headeru.
class StickyDropdownManager {
  constructor(options = {}) {
    this.id = options.id || "sticky-default";

    this.config = {
      clickInactivityDelay: options.clickInactivityDelay || 2000,
      inactivityDelay:      options.inactivityDelay      || 2000,
      hoverHideDelay:       options.hoverHideDelay       || 200,
      transitionDuration:   options.transitionDuration   || 300,
      deadzoneMatchContent: options.deadzoneMatchContent || false,
      storagePrefix:        options.storagePrefix        || this.id,
    };

    this.elements = {
      toggle:     options.toggleEl     || null,
      content:    options.contentEl    || null,
      subToggle:  options.subToggleEl  || null,
      subContent: options.subContentEl || null,
    };

    this.timers = {
      hide: null, animation: null, inactivity: null, clickInactivity: null,
      subHide: null, subAnimation: null,
    };

    this.state = {
      mouseX: 0, mouseY: 0, lastMouseUpdate: 0,
      isClickOpened: false, isSubmenuActive: false, isClosingInProgress: false,
      isClickOpenedSub: false, isMouseOverMenuSub: false, isClosingInProgressSub: false,
      isKeyboardOpened: false, isSubKeyboardOpened: false,
      currentFocusIndex: -1, focusableElements: [],
    };

    this.deadzoneEl    = null;
    this.subDeadzoneEl = null;
    this.subOriginalDisplay = null;

    // Bound handlers pro správné odebrání listenerů
    this._onDocMouseMove  = this._handleDocMouseMove.bind(this);
    this._onDocClick      = this._handleDocClick.bind(this);
    this._onDocKeyDown    = this._handleDocKeyDown.bind(this);
    this._onWinResize     = this._handleWinResize.bind(this);
    this._onWinScroll     = this._handleWinScroll.bind(this);

    this._init();
  }

  _init() {
    if (!this.elements.toggle || !this.elements.content) {
      console.warn(`[StickyDropdownManager] ${this.id}: chybí toggle nebo content`);
      return;
    }
    this._setupStyles();
    this._createDeadzone();
    this._setupSubDropdown();
    this._bindEvents();
    this.isInitialized = true;
  }

  // ── Styles ────────────────────────────────────────────────────────────────
  _setupStyles() {
    const c = this.elements.content;
    c.style.transition  = `opacity ${this.config.transitionDuration/1000}s ease-in-out, visibility ${this.config.transitionDuration/1000}s ease-in-out`;
    c.style.opacity     = "0";
    c.style.visibility  = "hidden";
    c.style.display     = "none";
  }

  // ── Deadzone (hlavní) ────────────────────────────────────────────────────
  _createDeadzone() {
    this.deadzoneEl = document.createElement("div");
    this.deadzoneEl.id        = `dropdown-deadzone-${this.id}`;
    this.deadzoneEl.className = "dropdown-deadzone sticky-dropdown-deadzone";
    Object.assign(this.deadzoneEl.style, {
      position: "fixed", pointerEvents: "none", display: "none", zIndex: "9999",
    });
    document.body.appendChild(this.deadzoneEl);
  }

  _updateDeadzone() {
    if (!this.deadzoneEl) return;
    const container = this.elements.toggle.closest(".button-container");
    if (!container) { this.deadzoneEl.style.display = "none"; return; }

    const mainButton   = container.querySelector(".main-button");
    if (!mainButton)  { this.deadzoneEl.style.display = "none"; return; }

    const mainRect    = mainButton.getBoundingClientRect();
    const toggleRect  = this.elements.toggle.getBoundingClientRect();
    const contentRect = this.elements.content.getBoundingClientRect();

    const top    = Math.max(mainRect.bottom, toggleRect.bottom);
    const height = contentRect.top - top;
    if (height <= 0) { this.deadzoneEl.style.display = "none"; return; }

    let left  = mainRect.left;
    let width = mainButton.offsetWidth + this.elements.toggle.offsetWidth - 2;

    if (this.config.deadzoneMatchContent) {
      const cs = window.getComputedStyle(this.elements.content);
      left  = contentRect.left;
      width = contentRect.width - (parseFloat(cs.paddingRight) || 0);
    }

    Object.assign(this.deadzoneEl.style, {
      left: left + "px", top: top + "px",
      width: width + "px", height: height + "px", display: "block",
    });
  }

  _showDeadzone() { if (this.deadzoneEl) this._updateDeadzone(); }
  _hideDeadzone() { if (this.deadzoneEl) this.deadzoneEl.style.display = "none"; }

  _isMouseInDeadzone() {
    if (!this.deadzoneEl || this.deadzoneEl.style.display === "none") return false;
    const { mouseX: x, mouseY: y } = this.state;
    const r = this.deadzoneEl.getBoundingClientRect();
    return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
  }

  // ── Sub-deadzone ──────────────────────────────────────────────────────────
  _createSubDeadzone() {
    if (!this.elements.subToggle || !this.elements.subContent) return;
    this.subDeadzoneEl = document.createElement("div");
    this.subDeadzoneEl.id        = `subdropdown-deadzone-${this.id}`;
    this.subDeadzoneEl.className = "subdropdown-deadzone sticky-subdropdown-deadzone";
    Object.assign(this.subDeadzoneEl.style, {
      position: "fixed", pointerEvents: "none", display: "none", zIndex: "9999",
    });
    document.body.appendChild(this.subDeadzoneEl);
  }

  _updateSubDeadzone() {
    if (!this.subDeadzoneEl || !this.elements.subToggle || !this.elements.subContent) return;
    const container    = this.elements.subToggle.closest(".sub-dropdown") || this.elements.subToggle;
    const contRect     = container.getBoundingClientRect();
    const subRect      = this.elements.subContent.getBoundingClientRect();
    const paddingOff   = 5;
    const left   = contRect.right;
    const width  = subRect.left - contRect.right;
    const top    = subRect.top + 2;
    const height = subRect.height - paddingOff;

    if (width > 0 && height > 0) {
      Object.assign(this.subDeadzoneEl.style, {
        left: left + "px", top: top + "px",
        width: width + "px", height: height + "px", display: "block",
      });
    } else {
      this.subDeadzoneEl.style.display = "none";
    }
  }

  _showSubDeadzone() { if (this.subDeadzoneEl) this._updateSubDeadzone(); }
  _hideSubDeadzone() { if (this.subDeadzoneEl) this.subDeadzoneEl.style.display = "none"; }

  _isMouseInSubDeadzone() {
    if (!this.subDeadzoneEl || this.subDeadzoneEl.style.display === "none") return false;
    const { mouseX: x, mouseY: y } = this.state;
    const r = this.subDeadzoneEl.getBoundingClientRect();
    return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
  }

  // ── Sub-dropdown setup ───────────────────────────────────────────────────
  _setupSubDropdown() {
    const { subToggle, subContent } = this.elements;
    if (!subToggle || !subContent) return;

    this._createSubDeadzone();
    this.subOriginalDisplay = "block";

    Object.assign(subContent.style, {
      transition:  "opacity 0.3s ease-in-out, visibility 0.3s ease-in-out",
      opacity:     "0",
      visibility:  "hidden",
      display:     "none",
      position:    subContent.style.position || "absolute",
    });

    if (!subToggle.hasAttribute("tabindex")) subToggle.setAttribute("tabindex", "0");
    subContent.classList.add("fade-dropdown");
  }

  // ── Show / Hide hlavní menu ───────────────────────────────────────────────
  _showMenu() {
    this._clearAllTimers();
    this.state.isClosingInProgress  = false;
    this.state.currentFocusIndex    = -1;
    this._removeKeyboardHoverStyles();

    const c = this.elements.content;
    c.style.opacity    = "0";
    c.style.visibility = "hidden";
    c.style.display    = "block";

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        c.style.opacity    = "1";
        c.style.visibility = "visible";
        this._showDeadzone();
      });
    });

    if (this.state.isClickOpened) this._startInactivityTimer();
  }

  _hideMenu() {
    if (window.tabNavigationActive) return;

    this._clearAllTimers();
    this.state.isClosingInProgress = true;
    this.state.currentFocusIndex   = -1;
    this._removeKeyboardHoverStyles();
    this.elements.toggle.classList.remove("is-open");

    const c = this.elements.content;
    c.style.opacity    = "0";
    c.style.visibility = "hidden";
    this._hideDeadzone();

    if (this.elements.subContent) {
      this.state.isClickOpenedSub = false;
      this._hideSubMenu();
    }

    this.timers.animation = setTimeout(() => {
      c.style.display             = "none";
      this.state.isClickOpened    = false;
      this.state.isSubmenuActive  = false;
      this.state.isClosingInProgress = false;
      this._clearStorageKeys();
    }, this.config.transitionDuration);
  }

  // ── Show / Hide sub-menu ─────────────────────────────────────────────────
  _showSubMenu() {
    if (!this.elements.subContent) return;
    this._clearTimer("subHide");
    this._clearTimer("subAnimation");
    this.state.isClosingInProgressSub = false;

    this.elements.subContent.style.display    = this.subOriginalDisplay || "block";
    this.elements.subContent.style.visibility = "visible";

    setTimeout(() => {
      this.elements.subContent.style.opacity = "1";
      this._showSubDeadzone();
    }, 10);

    if (this.state.isClickOpenedSub) {
      localStorage.setItem(`${this.config.storagePrefix}-sub-isOpen`, "true");
    }
  }

  _hideSubMenu(skipDelay = false) {
    if (!this.elements.subContent || this.elements.subContent.style.display === "none") return;

    this._clearTimer("subHide");
    this._clearTimer("subAnimation");
    this.state.isClosingInProgressSub = true;

    let currentEl = null;
    if (this.state.currentFocusIndex >= 0 && this.state.currentFocusIndex < this.state.focusableElements.length) {
      currentEl = this.state.focusableElements[this.state.currentFocusIndex];
    }
    const isInSubContent = currentEl && this.elements.subContent.contains(currentEl);

    this.elements.subContent.style.opacity    = "0";
    this.elements.subContent.style.visibility = "hidden";
    this._hideSubDeadzone();

    const delay = skipDelay ? 200 : 450;

    this.timers.subAnimation = setTimeout(() => {
      if (!this.state.isMouseOverMenuSub && !this._isMouseInSubDeadzone()) {
        this.elements.subContent.style.display = "none";

        if (this.state.isClickOpenedSub) {
          this.state.isClickOpenedSub = false;
          localStorage.removeItem(`${this.config.storagePrefix}-sub-isOpen`);
        }

        if (currentEl) {
          this._updateFocusableElements();
          if (isInSubContent) {
            const idx = this.state.focusableElements.indexOf(this.elements.subToggle);
            this.state.currentFocusIndex = idx !== -1 ? idx : -1;
          } else {
            const idx = this.state.focusableElements.indexOf(currentEl);
            if (idx !== -1) this.state.currentFocusIndex = idx;
          }
        }
      } else {
        this._showSubMenu();
      }
      this.state.isClosingInProgressSub = false;
    }, delay);
  }

  // ── Timery ────────────────────────────────────────────────────────────────
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
    Object.keys(this.timers).forEach((k) => this._clearTimer(k));
  }

  _clearStorageKeys() {
    localStorage.removeItem(`${this.config.storagePrefix}-mouseOver`);
    localStorage.removeItem(`${this.config.storagePrefix}-sub-isOpen`);
  }

  // ── Detekce myši ──────────────────────────────────────────────────────────
  _isMouseOverAnyElement() {
    const { mouseX: x, mouseY: y } = this.state;
    const inRect = (r) => x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;

    if (inRect(this.elements.content.getBoundingClientRect())) return true;
    if (inRect(this.elements.toggle.getBoundingClientRect()))  return true;
    if (this._isMouseInDeadzone())                             return true;
    if (this._isMouseInSubDeadzone())                          return true;

    const { subToggle, subContent } = this.elements;
    if (subToggle  && inRect(subToggle.getBoundingClientRect()))  return true;
    if (subContent && subContent.style.display !== "none" &&
        inRect(subContent.getBoundingClientRect()))               return true;

    return false;
  }

  // ── Keyboard ──────────────────────────────────────────────────────────────
  _updateFocusableElements() {
    const content = this.elements.content;
    if (!content) return;

    const selector = 'a, button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), span[tabindex]:not([tabindex="-1"]), [tabindex]:not([tabindex="-1"]), [role="button"], [role="menuitem"]';
    const isVisible = (el) => {
      const s = window.getComputedStyle(el);
      return el.offsetParent !== null && s.display !== "none" && s.visibility !== "hidden" && s.opacity !== "0";
    };

    const all = Array.from(content.querySelectorAll(selector)).filter(isVisible);

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
    if (this.state.currentFocusIndex >= 0 && this.state.currentFocusIndex < this.state.focusableElements.length) {
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
    this.state.isClickOpened    = true;
    this.elements.toggle.classList.add("is-open");
    this._showMenu();
  }

  _hideMenuKeyboard() {
    this.state.isKeyboardOpened = false;
    this.state.isClickOpened    = false;
    this._hideMenu();
    if (this.elements.content.contains(document.activeElement)) {
      setTimeout(() => this.elements.toggle.focus(), 50);
    }
  }

  _showSubMenuKeyboard() {
    this.state.isSubKeyboardOpened = true;
    this.state.isClickOpenedSub    = true;
    this._showSubMenu();
  }

  _hideSubMenuKeyboard() {
    this.state.isSubKeyboardOpened = false;
    this.state.isClickOpenedSub    = false;
    this._hideSubMenu();
    if (this.elements.subContent && this.elements.subContent.contains(document.activeElement)) {
      setTimeout(() => this.elements.subToggle.focus(), 50);
    }
  }

  // ── Event handlers ────────────────────────────────────────────────────────
  _bindEvents() {
    const { toggle, content, subToggle, subContent } = this.elements;

    // Toggle
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
        void content.offsetHeight;
        requestAnimationFrame(() => {
          content.style.opacity    = "1";
          content.style.visibility = "visible";
          this._showDeadzone();
          this._startInactivityTimer();
          this._startClickInactivityTimer();
        });
      }
    });

    toggle.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault(); e.stopPropagation();
        content.style.opacity === "1" ? this._hideMenuKeyboard() : this._showMenuKeyboard();
      }
      if (e.key === "Escape") { e.preventDefault(); this._hideMenuKeyboard(); }
    });

    toggle.addEventListener("blur", () => {
      setTimeout(() => {
        const active = document.activeElement;
        if (!content.contains(active) && !toggle.contains(active) &&
            !(subToggle && subToggle.contains(active)) &&
            !(subContent && subContent.contains(active))) {
          if (this.state.isKeyboardOpened) this._hideMenuKeyboard();
        }
      }, 10);
    });

    // Content
    content.addEventListener("mouseenter", () => {
      this._clearTimer("hide");
      this._clearTimer("inactivity");
      this._clearTimer("clickInactivity");
      this._clearTimer("animation");

      if (this.state.isClosingInProgress) {
        this.state.isClosingInProgress = false;
        content.style.opacity    = "1";
        content.style.visibility = "visible";
        content.style.display    = "block";
        this._showDeadzone();
        return;
      }
      if (!this.state.isClickOpened) {
        content.style.display = "block";
        requestAnimationFrame(() => {
          content.style.opacity    = "1";
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

    content.addEventListener("focusout", () => {
      setTimeout(() => {
        const active = document.activeElement;
        if (!content.contains(active) && !toggle.contains(active) &&
            !(subToggle && subToggle.contains(active)) &&
            !(subContent && subContent.contains(active))) {
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

    // Interaktivní elementy uvnitř contentu (inputy apod.)
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

    // Focus styling na focusable elementech uvnitř contentu
   content.querySelectorAll("a, button, input, select, textarea, span[tabindex], [tabindex]:not([tabindex='-1'])").forEach((el) => {
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

    // Sub-dropdown
    if (subToggle && subContent) this._bindSubEvents();

    // Globální
    document.addEventListener("click",     this._onDocClick);
    document.addEventListener("mousemove", this._onDocMouseMove);
    document.addEventListener("keydown",   this._onDocKeyDown);
    window.addEventListener("resize",      this._onWinResize);
    window.addEventListener("scroll",      this._onWinScroll);
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
      e.preventDefault(); e.stopPropagation();
      this._clearTimer("subHide"); this._clearTimer("subAnimation");

      if (subContent.style.opacity === "1" && this.state.isClickOpenedSub) {
        this.state.isMouseOverMenuSub  = false;
        this.state.isClickOpenedSub    = false;
        localStorage.removeItem(`${this.config.storagePrefix}-sub-isOpen`);
        this._hideSubMenu(true);
      } else {
        this.state.isClickOpenedSub    = true;
        this.state.isMouseOverMenuSub  = true;
        this.state.isClosingInProgressSub = false;
        localStorage.setItem(`${this.config.storagePrefix}-sub-isOpen`, "true");
        this._showSubMenu();
      }
    });

    subToggle.addEventListener("keydown",  this._onSubToggleKeyDown.bind(this));
    subToggle.addEventListener("focus",    this._onSubToggleFocus.bind(this));
    subToggle.addEventListener("blur",     this._onSubToggleBlur.bind(this));

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

    subContent.addEventListener("focusin",  this._onSubContentFocusIn.bind(this));
    subContent.addEventListener("focusout", this._onSubContentFocusOut.bind(this));

    // Pohyb myši uvnitř hlavního contentu zavírá sub, pokud myš není nad ním
    content.addEventListener("mousemove", (e) => {
      const el = document.elementFromPoint(e.clientX, e.clientY);
      if (content.contains(el) && !subToggle.contains(el) && !subContent.contains(el) && !this._isMouseInSubDeadzone()) {
        this.state.isMouseOverMenuSub = false;
        if (subContent.style.opacity === "1" && !this.state.isClickOpenedSub) this._hideSubMenu();
      }
    });

    // Arrow element v sub-toggle
    const arrow = subToggle.querySelector(".arrow, .dropdown-arrow, .caret, .arrow-icon, i.fa-chevron-down");
    if (arrow) {
      arrow.addEventListener("click", (e) => {
        e.preventDefault(); e.stopPropagation();
        subToggle.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, view: window }));
      });
    }
  }

  _onSubToggleKeyDown(e) {
    if (!this.elements.subContent) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault(); e.stopPropagation();
      this.elements.subContent.style.opacity === "1" ? this._hideSubMenuKeyboard() : this._showSubMenuKeyboard();
    }
    if (e.key === "Escape") { e.preventDefault(); this._hideSubMenuKeyboard(); }
  }

  _onSubToggleFocus() {
    if (this.elements.subContent && this.elements.subContent.style.opacity !== "1") this._showSubMenuKeyboard();
  }

  _onSubToggleBlur() {
    setTimeout(() => {
      const active = document.activeElement;
      if (!(this.elements.subToggle && this.elements.subToggle.contains(active)) &&
          !(this.elements.subContent && this.elements.subContent.contains(active))) {
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
      if (!(this.elements.subToggle && this.elements.subToggle.contains(active)) &&
          !(this.elements.subContent && this.elements.subContent.contains(active))) {
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

  // ── Globální document handlers ────────────────────────────────────────────
  _handleDocMouseMove(e) {
    const now = Date.now();
    this.state.mouseX = e.clientX;
    this.state.mouseY = e.clientY;

    if (now - this.state.lastMouseUpdate > 100) {
      this.state.lastMouseUpdate = now;
    }

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

  _handleDocClick(e) {
    const { toggle, content, subToggle, subContent } = this.elements;
    if (!toggle.contains(e.target) && !content.contains(e.target) &&
        !(subToggle && subToggle.contains(e.target)) &&
        !(subContent && subContent.contains(e.target))) {
      this._hideMenu();
      this.state.isClickOpened = false;
    }
  }

  _handleDocKeyDown(e) {
    if (!this.isOpen()) return;

    if (e.key === "Escape") {
      e.preventDefault(); e.stopPropagation();
      this._hideMenu();
      this.state.isClickOpened    = false;
      this.state.isKeyboardOpened = false;
      return;
    }

    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
      this._updateFocusableElements();
      if (!this.state.focusableElements.length) return;

      if (e.key === "ArrowDown") {
        this.state.currentFocusIndex++;
        if (this.state.currentFocusIndex >= this.state.focusableElements.length) this.state.currentFocusIndex = 0;
      } else {
        this.state.currentFocusIndex--;
        if (this.state.currentFocusIndex < 0) this.state.currentFocusIndex = this.state.focusableElements.length - 1;
      }

      const current = this.state.focusableElements[this.state.currentFocusIndex];
      if (!current) return;

      // Otevři sub-menu pokud focus přišel na sub-toggle
      if (this.elements.subToggle && current === this.elements.subToggle) {
        this._clearTimer("subHide"); this._clearTimer("subAnimation");
        this.state.isClosingInProgressSub = false;
        this.state.isClickOpenedSub       = true;
        if (this.elements.subContent.style.display === "none") {
          this.elements.subContent.style.display = this.subOriginalDisplay || "block";
          setTimeout(() => {
            this.elements.subContent.style.opacity    = "1";
            this.elements.subContent.style.visibility = "visible";
            this._showSubDeadzone();
          }, 10);
        } else {
          this.elements.subContent.style.opacity    = "1";
          this.elements.subContent.style.visibility = "visible";
          this._showSubDeadzone();
        }
      }

      // Zavři sub-menu pokud focus odejde mimo sub-toggle/sub-content
      if (this.elements.subContent && this.elements.subContent.style.opacity === "1") {
        const inSub = this.elements.subContent.contains(current) || current === this.elements.subToggle;
        if (!inSub) {
          this.state.isClickOpenedSub = false;
          localStorage.removeItem(`${this.config.storagePrefix}-sub-isOpen`);
          this.elements.subContent.style.opacity    = "0";
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

  _handleWinResize() {
    if (this.elements.content.style.opacity === "1") {
      this._updateDeadzone();
      if (this.elements.subContent && this.elements.subContent.style.opacity === "1") this._updateSubDeadzone();
    }
  }

  _handleWinScroll() {
    if (this.elements.content.style.opacity === "1") {
      this._updateDeadzone();
      if (this.elements.subContent && this.elements.subContent.style.opacity === "1") this._updateSubDeadzone();
    }
  }

  // ── Public API ────────────────────────────────────────────────────────────
  open()   { this.state.isClickOpened = true;  this._showMenu(); }
  close()  { this._hideMenu(); this.state.isClickOpened = false; }
  toggle() { this.isOpen() ? this.close() : this.open(); }
  isOpen() { return this.elements.content.style.opacity === "1"; }

  setSubmenuActive(active) {
    this.state.isSubmenuActive = active;
    if (active && this.state.isClickOpened) this._startInactivityTimer();
  }

  destroy() {
    const { toggle, content } = this.elements;
    if (toggle) {
      toggle.replaceWith(toggle.cloneNode(true)); // odstraní všechny listenery
    }
    document.removeEventListener("click",     this._onDocClick);
    document.removeEventListener("mousemove", this._onDocMouseMove);
    document.removeEventListener("keydown",   this._onDocKeyDown);
    window.removeEventListener("resize",      this._onWinResize);
    window.removeEventListener("scroll",      this._onWinScroll);

    [this.deadzoneEl, this.subDeadzoneEl].forEach((el) => el && el.parentNode && el.parentNode.removeChild(el));
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
      isSubmenuActive: this.state.isSubmenuActive,
      hasSubDropdown: !!(this.elements.subToggle && this.elements.subContent),
      subDropdownOpen: this.elements.subContent ? this.elements.subContent.style.opacity === "1" : false,
    };
  }
}

window.StickyDropdownManager = StickyDropdownManager;

// Vytvoření DOM sticky headeru (klonování)
function createStickyHeader() {
  const originalHeader = document.querySelector("header");
  if (!originalHeader) {
    console.error("Original header not found. Cannot create sticky header.");
    return;
  }

  const stickyHeader = document.createElement("div");
  stickyHeader.className = "sticky-header";
  stickyHeader.id        = "sticky-header";

  const headerContent = originalHeader.cloneNode(true);

  // ── Mobile nav & overlay – přesuneme mimo sticky header do body ──────────
  const mobileNav   = headerContent.querySelector("#mobileNav, .mobile-nav-container, .mobile-nav");
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

  // Odstraníme mobilní elementy z klonu headeru (jsou teď v body)
  headerContent.querySelectorAll(".menu-overlay, .mobile-nav-container, #menuOverlay, #mobileNav, .mobile-nav")
    .forEach((el) => el.remove());

  // Overflow ze vzorového headeru
  const originalStyles = window.getComputedStyle(originalHeader);
  stickyHeader.style.overflowX = originalStyles.overflowX;
  stickyHeader.style.overflowY = originalStyles.overflowY;

  // Přidáme třídu sticky-clone dropdownovým elementům
  headerContent.querySelectorAll(
    ".dropdown, .dropdown-toggle, .dropdown-content, .dropdown-content-second, .dropdown-content-third, .sub-dropdown-toggle, .sub-dropdown-content"
  ).forEach((el) => el.classList.add("sticky-clone"));

  // Burger menu ID
  const burgerMenu = headerContent.querySelector(".burger-menu");
  if (burgerMenu) burgerMenu.setAttribute("id", "sticky-burgerMenu");

  // Vložíme navigaci do sticky headeru
/*  const navElement = headerContent.querySelector("nav");
  if (navElement) {
    stickyHeader.appendChild(navElement);*/
const navContainer = headerContent.querySelector(".header-nav-container");
  if (navContainer) {
    stickyHeader.appendChild(navContainer);
  } else {
    const ulElement = headerContent.querySelector("ul");
    if (ulElement) {
      stickyHeader.appendChild(ulElement);
    } else {
      const buttonContainers = headerContent.querySelectorAll(".button-container");
      if (buttonContainers.length > 0) {
        const nc = document.createElement("div");
        nc.className = "sticky-nav-container";
        buttonContainers.forEach((c) => nc.appendChild(c));
        stickyHeader.appendChild(nc);
      }
    }
  }

  // Burger menu přesuneme z header-nav-container přímo do sticky headeru,
  // aby byl pozicován absolutně stejně jako v normálním headeru
  const burgerInContainer = stickyHeader.querySelector(".header-nav-container .burger-menu");
  if (burgerInContainer) {
    burgerInContainer.parentNode.removeChild(burgerInContainer);
    stickyHeader.appendChild(burgerInContainer);
  } else if (burgerMenu) {
    stickyHeader.appendChild(burgerMenu);
  }

  document.body.appendChild(stickyHeader);

  const focusableSelectors = "a, button, [tabindex]";
  stickyHeader.querySelectorAll(focusableSelectors).forEach((el) => el.setAttribute("tabindex", "-1"));
  const stickyUl = stickyHeader.querySelector("ul");
  if (stickyUl) stickyUl.setAttribute("aria-hidden", "true");
}

// Scroll logika + inicializace
function initStickyHeaderFunctionality() {
   localStorage.removeItem("sticky-dropdown-content-mouseOver");
  localStorage.removeItem("sticky-dropdown-content-second-mouseOver");
  localStorage.removeItem("sticky-dropdown-content-third-mouseOver");

  const stickyHeader = document.querySelector(".sticky-header");
  const mainHeader   = document.querySelector("header");
  if (!stickyHeader || !mainHeader) {
    console.error("Sticky header or main header not found");
    return;
  }

  initializeHomeIcon(stickyHeader);
  initializeStickyBurgerMenu();

  // DropdownManagery inicializujeme asynchronně, aby hlavní skript stihl načíst třídu DropdownManager
  setTimeout(initializeStickyDropdownManagers, 0);

  const mainHeaderHeight = mainHeader.offsetHeight;
  let lastScrollY = window.scrollY || document.documentElement.scrollTop;
  let ticking = false;
let isScrollRestoring = true;
window.addEventListener("load", () => {
  const endRestoring = () => {
    isScrollRestoring = false;
    window.removeEventListener("mousedown", endRestoring);
    window.removeEventListener("touchstart", endRestoring);
    window.removeEventListener("keydown", endRestoring);
    window.removeEventListener("wheel", endRestoring);
  };
  window.addEventListener("mousedown", endRestoring);
  window.addEventListener("touchstart", endRestoring);
  window.addEventListener("keydown", endRestoring);
  window.addEventListener("wheel", endRestoring);
  setTimeout(() => { isScrollRestoring = false; }, 3000);
});

  const focusableSelectors = "a, button, [tabindex]";

  function enableFocus() {
    const stickyEls   = stickyHeader.querySelectorAll(focusableSelectors);
    const originalEls = mainHeader.querySelectorAll(focusableSelectors);

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

      // Párování podle textu / href
      const text = stickyEl.textContent.trim();
      const href = stickyEl.getAttribute("href");
      const matching = Array.from(originalEls).find((origEl) => {
        return text === origEl.textContent.trim() || (href && href === origEl.getAttribute("href"));
      });
      if (matching) {
        matching.hasAttribute("tabindex")
          ? stickyEl.setAttribute("tabindex", matching.getAttribute("tabindex"))
          : stickyEl.removeAttribute("tabindex");
      } else {
        stickyEl.removeAttribute("tabindex");
      }
    });

    const stickyUl = stickyHeader.querySelector("ul");
    if (stickyUl) stickyUl.setAttribute("aria-hidden", "false");
        stickyHeader.querySelectorAll(".home-icon").forEach((el) => {
      const originalHomeIcon = mainHeader.querySelector(".home-icon");
      if (originalHomeIcon && originalHomeIcon.hasAttribute("tabindex")) {
        el.setAttribute("tabindex", originalHomeIcon.getAttribute("tabindex"));
      } else {
        el.removeAttribute("tabindex");
      }
    });
  }

  function disableFocus() {
    stickyHeader.querySelectorAll(focusableSelectors).forEach((el) => el.setAttribute("tabindex", "-1"));
    const stickyUl = stickyHeader.querySelector("ul");
    if (stickyUl) stickyUl.setAttribute("aria-hidden", "true");
  }

  function showStickyHeader() {
    stickyHeader.classList.add("visible");
    stickyHeader.style.transition = "";
    stickyHeader.style.transform  = "";
    stickyHeader.style.opacity    = "1";
    stickyHeader.setAttribute("aria-hidden", "false");
    enableFocus();
  }

  function hideStickyHeader(animate = false) {
    stickyHeader.classList.remove("visible");
    clearAllDropdownStates();
    if (animate) {
      stickyHeader.style.transition = "opacity 0.1s ease-out";
      stickyHeader.style.opacity    = "0";
      // bez transform!
    }
    disableFocus();
  }

  function handleScroll() {
      if (document.body.style.position === "fixed") return;
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const scrollY = window.scrollY || document.documentElement.scrollTop;

        if (scrollY <= Math.max(mainHeaderHeight + 1.5, 10)) {
          hideStickyHeader(true);
          stickyHeader.classList.remove("scrolled");
        } else {
          stickyHeader.style.transition = "";
          stickyHeader.style.transform  = "";
          stickyHeader.style.opacity    = "1";

          enableFocus();

          if (scrollY < lastScrollY || isScrollRestoring) {
  showStickyHeader();
            scrollY > mainHeaderHeight + 100
              ? stickyHeader.classList.add("scrolled")
              : stickyHeader.classList.remove("scrolled");
          } else if (scrollY > lastScrollY && lastScrollY > 0 && !isScrollRestoring) {
            hideStickyHeader(false);
          }
        }

        lastScrollY = scrollY;
        ticking = false;
      });
      ticking = true;
    }
  }

  window.addEventListener("scroll", handleScroll);

  // Počáteční check – pokud je stránka načtena dole
  (function initialCheck() {
    const scrollY = window.scrollY || document.documentElement.scrollTop;
    if (scrollY > mainHeaderHeight) {
      setTimeout(() => {
        stickyHeader.style.transition  = "";
        stickyHeader.style.transform   = "translateY(0)";
        stickyHeader.style.opacity     = "1";
        stickyHeader.style.visibility  = "visible";
        stickyHeader.classList.add("visible");
        stickyHeader.setAttribute("aria-hidden", "false");
        enableFocus();
        if (scrollY > mainHeaderHeight + 100) stickyHeader.classList.add("scrolled");
      }, 50);
    }
  })();

  // Observer pro změny tématu (dark/light mode atd.)
  let themeChangeTimeout;
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === "attributes" &&
          (mutation.attributeName === "class" || mutation.attributeName === "data-theme")) {
        clearTimeout(themeChangeTimeout);
        const scrollY    = window.scrollY || document.documentElement.scrollTop;
        const wasVisible = stickyHeader.classList.contains("visible");
        if (wasVisible && scrollY > 50) {
          themeChangeTimeout = setTimeout(() => {
            if (stickyHeader && (window.scrollY || document.documentElement.scrollTop) > 50) {
              stickyHeader.classList.add("visible");
              stickyHeader.style.opacity    = "1";
              stickyHeader.style.transform  = "translateY(0)";
            }
          }, 0);
        }
      }
    });
  });

  observer.observe(document.body, { attributes: true, subtree: false });
  observer.observe(document.documentElement, { attributes: true, subtree: false });
  setTimeout(syncStickyHeaderLayout, 100);
}

// Focus monitoring – zachovává dropdown otevřený při TAB navigaci
document.addEventListener("focusin", function (e) {
  const stickyHeader = document.querySelector(".sticky-header");
  if (!stickyHeader || !stickyHeader.classList.contains("visible")) return;

  const dropdownContent = e.target.closest(".dropdown-content, .dropdown-content-second, .dropdown-content-third");
  if (dropdownContent && stickyHeader.contains(dropdownContent)) {
    // Zrušíme všechny hide timery ve sticky managerech
    if (window._stickyDropdownManagers) {
      window._stickyDropdownManagers.forEach((dm) => {
        dm._clearTimer("hide");
        dm._clearTimer("inactivity");
        dm._clearTimer("clickInactivity");
        dm._clearTimer("animation");
      });
    }
    dropdownContent.style.opacity    = "1";
    dropdownContent.style.visibility = "visible";
    dropdownContent.style.display    = "block";
  }
});
  function syncStickyHeaderLayout() {
  const mainHeader = document.querySelector("header");
  const stickyHeader = document.querySelector(".sticky-header");
  if (!mainHeader || !stickyHeader) return;
  const mainNavContainer = mainHeader.querySelector(".header-nav-container");
  const stickyNavContainer = stickyHeader.querySelector(".header-nav-container");
  if (!mainNavContainer || !stickyNavContainer) return;

  function applyLayout() {
    const headerRect = mainHeader.getBoundingClientRect();

    // Výška — vždy stejná jako normální header
    const mainHeaderHeight = mainHeader.offsetHeight;
    stickyHeader.style.minHeight = mainHeaderHeight + "px";
    stickyHeader.style.maxHeight = mainHeaderHeight + "px";

    // Logo — vždy stejná velikost jako normální header
    const mainLogoSync = mainHeader.querySelector("img.logo");
    const stickyLogoSync = stickyHeader.querySelector("img.logo");
    if (mainLogoSync && stickyLogoSync) {
      const mainLogoRect = mainLogoSync.getBoundingClientRect();
      stickyLogoSync.style.height = mainLogoRect.height + "px";
      stickyLogoSync.style.width = mainLogoRect.width + "px";
    }

    if (window.innerWidth <= 940) {
      const mainLogo = mainHeader.querySelector("img.logo");
      const stickyLogo = stickyHeader.querySelector("img.logo");
      const mainBurger = mainHeader.querySelector(".burger-menu");
      const stickyBurger = stickyHeader.querySelector(".burger-menu");

      // Reset
      stickyNavContainer.style.paddingLeft = "0px";
      stickyNavContainer.style.paddingRight = "0px";
      stickyNavContainer.style.marginLeft = "";
      stickyNavContainer.style.width = "100%";
      stickyNavContainer.style.boxSizing = "border-box";
      stickyNavContainer.style.justifyContent = "flex-start";
      if (stickyLogo) stickyLogo.style.marginLeft = "";

      // Počkáme na překreslení a pak změříme
      requestAnimationFrame(() => {
        if (mainLogo && stickyLogo) {
          const mainLogoRect = mainLogo.getBoundingClientRect();
          const stickyLogoRect = stickyLogo.getBoundingClientRect();
          const diff = mainLogoRect.left - stickyLogoRect.left;
          stickyNavContainer.style.paddingLeft = diff + "px";
        }

        if (mainBurger && stickyBurger) {
          const burgerRect = mainBurger.getBoundingClientRect();
          const hRect = stickyHeader.getBoundingClientRect();
          stickyBurger.style.right = (hRect.right - burgerRect.right) + "px";
          stickyBurger.style.left = "auto";
        }
      });

 } else {
      // Desktop — původní logika
      const mainRect = mainNavContainer.getBoundingClientRect();
      const paddingLeft = mainRect.left - headerRect.left;
      const paddingRight = headerRect.right - mainRect.right;
      stickyNavContainer.style.paddingLeft = paddingLeft + "px";
      stickyNavContainer.style.paddingRight = paddingRight + "px";
      stickyNavContainer.style.width = "100%";
      stickyNavContainer.style.boxSizing = "border-box";
      stickyNavContainer.style.justifyContent = "flex-start";  // ← změna z center na flex-start
      stickyNavContainer.style.maxWidth = "none";               // ← zrušit max-width
      // Reset mobilních stylů
      const stickyLogo = stickyHeader.querySelector("img.logo");
      const stickyBurger = stickyHeader.querySelector(".burger-menu");
      if (stickyLogo) stickyLogo.style.marginLeft = "";
      if (stickyBurger) {
        stickyBurger.style.right = "";
        stickyBurger.style.left = "";
      }
    }
  }

  applyLayout();
  window.addEventListener("resize", applyLayout);
}