/**
 * InfoBoxManager - Systém interaktivních informačních boxů
 *
 * Řídí zobrazování info elementů s podporou hover a click stavů.
 * Zajišťuje správné chování odkazů uvnitř info boxů a detekci kliknutí uvnitř ikonky kroužku.
 *
 * @fileoverview Systém pro hover/click informační panely s link managementem
 * @author Michaela Gažová
 * @version 2.0.1
 * @since 2025-05-16
 * @updated 2025-08-26
 * @license MIT
 */



(function () {
  class InfoBoxManager {
    constructor(options) {
      options = options || {};
      this.variants = options.variants || ["info-box", "info-icon"];
      this.activeClass = options.activeClass || "active";
      this.hoverClass = options.hoverClass || "hover-active";
      this.forceCloseClass = options.forceCloseClass || "force-close";
      this.linkClass = options.linkClass || "info-box-link";

      this.elements = [];
      this.isInitialized = false;

      this.handleClick = this._onClick.bind(this);
      this.handleDocClick = this._onDocClick.bind(this);
      this.handleDocTouch = this._onDocTouch.bind(this);

      this.init();
    }

    init() {
      this._cacheElements();
      if (!this.elements.length) return;
      this._createStyles();
      this._setupElements();
      this._bindEvents();
      this.isInitialized = true;
    }

    _cacheElements() {
      const selector = this.variants.map((v) => `.${v}`).join(", ");
      this.elements = Array.from(document.querySelectorAll(selector));
    }

    _createStyles() {
      const style = document.createElement("style");
      style.textContent = `
        .${this.variants.join(", .")} {
          user-select: none;
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          -webkit-tap-highlight-color: transparent;
          outline: none;
          cursor: pointer;
        }
        .info-box a, .info-box [href] {
          cursor: pointer !important;
          position: relative !important;
          z-index: 100 !important;
          pointer-events: auto !important;
        }
        .info-box.${this.hoverClass} a:hover,
        .info-box.${this.activeClass} a:hover {
          text-decoration: underline !important;
        }
        .info-icon {
          z-index: 90 !important; 
        }
      `;
      document.head.appendChild(style);
    }

    _setupElements() {
      this.elements.forEach((element) => {
        this._setupLinks(element);
        this._setupHover(element);
      });
    }

    _setupLinks(element) {
      const links = element.querySelectorAll("a, [href]");
      links.forEach((link) => {
        link.classList.add(this.linkClass);
        // Blokování propagace u linků, aby se info box nezavřel
        link.addEventListener("click", (e) => e.stopPropagation());
      });
    }

    _setupHover(element) {
      element.addEventListener("mouseenter", () => {
        if (!element.classList.contains(this.forceCloseClass)) {
          element.classList.add(this.hoverClass);
        }
      });
      element.addEventListener("mouseleave", () => {
        element.classList.remove(this.hoverClass);
      });
    }

    _bindEvents() {
      this.elements.forEach((element) =>
        element.addEventListener("click", this.handleClick)
      );
      document.addEventListener("click", this.handleDocClick);
      document.addEventListener("touchstart", this.handleDocTouch);
    }

    _onClick(e) {
      const element = e.currentTarget;
      // Kliky na linky neovlivní zavření info boxu
      if (this._isClickOnLink(e, element)) {
        e.stopPropagation();
        return;
      }
      const clickedOnIcon = this._isClickOnIcon(e, element);
      if (clickedOnIcon) {
        this._handleIconClick(element);
      } else {
        this._toggleElement(element);
      }
      e.stopPropagation();
    }

    _onDocClick(e) {
      // Kliky na linky v info boxech se ignorují
      if (this._isClickOnInfoBoxLink(e)) return;
      this.elements.forEach((el) => {
        if (!el.contains(e.target)) this._closeElement(el);
      });
    }

    _onDocTouch(e) {
      if (this._isClickOnInfoBoxLink(e)) return;
      this.elements.forEach((el) => {
        if (!el.contains(e.target)) el.classList.remove(this.activeClass);
      });
    }

    _isClickOnLink(e, element) {
      let t = e.target;
      while (t && t !== element) {
        if (
          t.tagName === "A" ||
          t.hasAttribute("href") ||
          t.classList.contains(this.linkClass)
        )
          return true;
        t = t.parentElement;
      }
      return false;
    }

    _isClickOnInfoBoxLink(e) {
      let t = e.target;
      while (t && t !== document) {
        if (
          t.tagName === "A" ||
          t.hasAttribute("href") ||
          t.classList.contains(this.linkClass)
        ) {
          for (let el of this.elements) {
            if (el.contains(t)) return true;
          }
        }
        t = t.parentElement;
      }
      return false;
    }

    _isClickOnIcon(e, element) {
      const isBox = this._hasClassStartingWith(element, "info-box");
      if (isBox) {
        const icon = this._findIcon(element);
        if (icon) return this._isClickOnIconElement(e, icon);
        return true;
      } else {
        return this._isClickOnIconElement(e, element);
      }
    }

    _isClickOnIconElement(e, iconElement) {
      const rect = iconElement.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      // Vzdálenost od středu u kruhových ikon
      if (this._hasClassStartingWith(iconElement, "icon-circle")) {
        const dx = e.clientX - centerX,
          dy = e.clientY - centerY;
        const radius = Math.max(rect.width, rect.height) / 2;
        return Math.sqrt(dx * dx + dy * dy) <= radius;
      } else {
        return (
          e.clientX >= rect.left &&
          e.clientX <= rect.right &&
          e.clientY >= rect.top &&
          e.clientY <= rect.bottom
        );
      }
    }

    _findIcon(element) {
      const iconSelectors = [".info-icon", ".icon-circle"]
        .concat(
          this.variants
            .filter((v) => v.startsWith("info-icon"))
            .map((v) => `.${v}`)
        )
        .join(", ");
      return element.querySelector(iconSelectors);
    }

    _hasClassStartingWith(element, prefix) {
      return Array.from(element.classList).some((cls) =>
        cls.startsWith(prefix)
      );
    }

    _handleIconClick(element) {
      if (element.classList.contains(this.activeClass)) {
        element.classList.remove(this.activeClass);
        element.classList.add(this.forceCloseClass);
        // Odstranění force-close po mouseleave
        const leave = () => {
          element.classList.remove(this.forceCloseClass);
          element.removeEventListener("mouseleave", leave);
        };
        element.addEventListener("mouseleave", leave);
      } else {
        element.classList.add(this.activeClass);
        element.classList.remove(this.forceCloseClass);
      }
    }

    _toggleElement(element) {
      element.classList.toggle(this.activeClass);
      element.classList.remove(this.forceCloseClass);
    }

    _closeElement(element) {
      element.classList.remove(this.activeClass);
      if (element.matches(":hover")) {
        // Force-close při hover slouží k tomu, aby se info-box hned neotevřel kvůli hoveru
        element.classList.add(this.forceCloseClass);
        const leave = () => {
          element.classList.remove(this.forceCloseClass);
          element.removeEventListener("mouseleave", leave);
        };
        element.addEventListener("mouseleave", leave);
      }
    }

    refresh() {
      this.elements.forEach((el) =>
        el.removeEventListener("click", this.handleClick)
      );
      this._cacheElements();
      this._setupElements();
      this.elements.forEach((el) =>
        el.addEventListener("click", this.handleClick)
      );
    }

    destroy() {
      if (!this.elements) return;
      this.elements.forEach((el) => {
        el.removeEventListener("click", this.handleClick);
        const links = el.querySelectorAll("a, [href]");
        links.forEach((link) => link.classList.remove(this.linkClass));
      });
      document.removeEventListener("click", this.handleDocClick);
      document.removeEventListener("touchstart", this.handleDocTouch);
      this.elements = [];
      this.isInitialized = false;
    }

    openElement(element) {
      if (element && this.elements.includes(element)) {
        element.classList.add(this.activeClass);
        element.classList.remove(this.forceCloseClass);
      }
    }
    closeElement(element) {
      if (element && this.elements.includes(element)) {
        this._closeElement(element);
      }
    }
    closeAll() {
      this.elements.forEach((el) => this._closeElement(el));
    }
    toggleElement(element) {
      if (element && this.elements.includes(element)) {
        if (element.classList.contains(this.activeClass)) {
          this.closeElement(element);
        } else {
          this.openElement(element);
        }
      }
    }
  }

  let infoBoxManager;
  document.addEventListener("DOMContentLoaded", function () {
    infoBoxManager = new InfoBoxManager();
    // Globální funkce pro externí ovládání
    window.openInfoBox = (selector) => {
      const el = document.querySelector(selector);
      if (el) infoBoxManager.openElement(el);
    };
    window.closeInfoBox = (selector) => {
      const el = document.querySelector(selector);
      if (el) infoBoxManager.closeElement(el);
    };
    window.toggleInfoBox = (selector) => {
      const el = document.querySelector(selector);
      if (el) infoBoxManager.toggleElement(el);
    };
    window.closeAllInfoBoxes = () => infoBoxManager.closeAll();
  });
})();

/* (tento script používá formátování prettier) */