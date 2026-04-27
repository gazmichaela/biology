/**
 * NavigationManager - Správa aktivních stavů navigace
 *
 * Automaticky detekuje aktuální stránku podle URL a označuje příslušné tlačítko.
 * Funguje responsivně - rozlišuje desktop a mobilní verzi navigace.
 *
 * @fileoverview Univerzální řešení pro webovou navigaci s podporou dropdownů
 * @author Michaela Gažová
 * @version 3.0.3
 * @since 2025-03-23
 * @updated 2026-04-27
 * @license MIT
 */



(function () {
  class NavigationManager {
    constructor(options) {
      options = options || {};
      this.mobileBreakpoint = options.mobileBreakpoint || 940;
      this.activeClass = options.activeClass || "active";
      this.debounceDelay = options.debounceDelay || 150;

      this.selectors = {
        main: ".main-button, .main-button-second, .main-button-third",
        dropdown:
          ".dropdown-content a, .dropdown-content-second a, .dropdown-content-third a, .sub-dropdown-content a",
        mobile: ".mobile-nav-button",
      };

      this.elements = {};
      this.handleResize = this._debounce(
        this._onResize.bind(this),
        this.debounceDelay,
      );
      this.handleClick = this._onClick.bind(this);

      this.isInitialized = false;
      this.init();
    }

    init() {
      this._cacheElements();
      if (!this.elements.all.length) return;

      this.elements.all.forEach((el) =>
        el.addEventListener("click", this.handleClick),
      );
      window.addEventListener("resize", this.handleResize);
      window.addEventListener("DOMContentLoaded", () =>
        this.setActiveFromUrl(),
      );
      window.addEventListener("popstate", () => this.setActiveFromUrl());
      this.setActiveFromUrl();
      this.isInitialized = true;
    }

    _cacheElements() {
      this.elements.main = Array.from(
        document.querySelectorAll(this.selectors.main),
      );
      this.elements.dropdown = Array.from(
        document.querySelectorAll(this.selectors.dropdown),
      );
      this.elements.mobile = Array.from(
        document.querySelectorAll(this.selectors.mobile),
      );
      this.elements.desktop = this.elements.main.concat(this.elements.dropdown);
      this.elements.all = this.elements.desktop.concat(this.elements.mobile);
    }

    _onClick(e) {
      if (!e || !e.currentTarget) return;
      this.setActiveButton(e.currentTarget);
    }

    setActiveButton(button) {
      if (!button) return;
      // Aktivní prvek nastavujeme odděleně pro desktop a mobile
      const group = this._isMobileButton(button)
        ? this.elements.mobile
        : this.elements.desktop;
      group.forEach((el) => {
        if (el === button) {
          el.classList.add(this.activeClass);
          el.setAttribute("aria-current", "page");
        } else {
          el.classList.remove(this.activeClass);
          el.removeAttribute("aria-current");
        }
      });
    }

    setActiveFromUrl() {
      const page = this._getCurrentPage();
      // Podle velikosti okna vybereme správný typ tlačítek
      const group = this._isMobileView()
        ? this.elements.mobile
        : this.elements.desktop;

      group.forEach((el) => {
        if (!el) return;
        const href = el.getAttribute("href") || "";
        const isHome = this._isHomeLink(el, page);
        const last = href.split("/").pop();
        if (last === page || isHome) {
          el.classList.add(this.activeClass);
          el.setAttribute("aria-current", "page");
        } else {
          el.classList.remove(this.activeClass);
          el.removeAttribute("aria-current");
        }
      });
    }

    _isHomeLink(el, page) {
      if (!el) return false;
      // Domovská stránka má unikátní logiku
      const href = (el.getAttribute("href") || "").replace("/", "");
      return (
        (href === "" || href === "index.html") &&
        (page === "index.html" || page === "")
      );
    }

    _isMobileButton(button) {
      return !!button && button.classList.contains("mobile-nav-button");
    }

    _isMobileView() {
      return window.innerWidth <= this.mobileBreakpoint;
    }

    _getCurrentPage() {
      const path = window.location.pathname;
      return path.split("/").pop() || "index.html";
    }

    _onResize() {
      this.setActiveFromUrl();
    }

    _debounce(fn, delay) {
      let timeout;
      return (...args) => {
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(() => fn.apply(this, args), delay);
      };
    }

    refresh() {
      // Listenery přidáváme znovu po refreshi
      this.elements.all.forEach((el) =>
        el.removeEventListener("click", this.handleClick),
      );
      this._cacheElements();
      this.elements.all.forEach((el) =>
        el.addEventListener("click", this.handleClick),
      );
      this.setActiveFromUrl();
    }

    destroy() {
      if (!this.elements || !this.elements.all) return;
      this.elements.all.forEach((el) =>
        el.removeEventListener("click", this.handleClick),
      );
      window.removeEventListener("resize", this.handleResize);
      this.elements = {};
      this.isInitialized = false;
    }
  }

  let navigationManager;
  document.addEventListener("DOMContentLoaded", function () {
    navigationManager = new NavigationManager();
    window.setActiveBySelector = function (selector) {
      const el = document.querySelector(selector);
      if (el) navigationManager.setActiveButton(el);
    };
  });
})();

/* (tento script používá formátování prettier) */