/**
 * BurgerMenuManager - Správa mobilní burger navigace
 *
 * Kompletní řešení pro burger menu s podporou sticky headeru.
 * Zajišťuje plynulé otevírání/zavírání s overlay efektem a předchází scrollování pozadí.
 *
 * @fileoverview Mobilní menu manager pro responzivní burger navigaci
 * @author Michaela Gažová
 * @version 2.1.0
 * @since 2025-06-05
 * @updated 2025-08-22
 * @license MIT
 */



(function () {
  class BurgerMenuManager {
    constructor(options) {
      options = options || {};
      this.mobileBreakpoint = options.mobileBreakpoint || 1175;
      this.debounceDelay = options.debounceDelay || 150;
      this.menuTransitionDelay = options.menuTransitionDelay || 50;
      this.stickyInitDelay = options.stickyInitDelay || 500;
      this.observerInitDelay = options.observerInitDelay || 100;

      this.selectors = {
        burgerMenu: "#burgerMenu",
        mobileNav: "#mobileNav",
        menuOverlay: "#menuOverlay",
        closeButton: "#closeButton",
        stickyHeader: ".sticky-header",
        stickyBurgerMenu: "#sticky-burgerMenu, .burger-menu",
        stickyMobileNav: "#sticky-mobileNav",
        stickyMenuOverlay: "#sticky-menuOverlay",
        stickyCloseButton:
          '#sticky-closeButton, #closeButton, .close-button, [id*="close"]',
      };

      this.cssClasses = {
        mobileMenuActive: "mobile-menu-active",
        active: "active",
        menuOpen: "menu-open",
        mainMenuOpen: "main-menu-open",
        stickyMenuOpen: "sticky-menu-open",
      };

      this.elements = {};
      this.observer = null;
      this.isInitialized = false;

      this.handleResize = this._debounce(
        this._onResize.bind(this),
        this.debounceDelay
      );
      this.handleDocumentClick = this._onDocumentClick.bind(this);
      this.handleKeydown = this._onKeyDown.bind(this);
      this.handleTouchMove = this._onTouchMove.bind(this);

      this.init();
    }

    init() {
      this._cacheElements();
      this._setupEventListeners();
      this._setupStickyMenuObserver();
      this._initializeStickyMenu();
      this.isInitialized = true;
    }

    _cacheElements() {
      this.elements = {
        burgerMenu: document.querySelector(this.selectors.burgerMenu),
        mobileNav: document.querySelector(this.selectors.mobileNav),
        menuOverlay: document.querySelector(this.selectors.menuOverlay),
        closeButton: document.querySelector(this.selectors.closeButton),
        stickyHeader: document.querySelector(this.selectors.stickyHeader),
        body: document.body,
      };
    }

    _setupEventListeners() {
      if (this.elements.burgerMenu) {
        this.elements.burgerMenu.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.openMenu(false);
        });
      }

      if (this.elements.closeButton) {
        this.elements.closeButton.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.closeMenu(false);
        });
      }

      if (this.elements.menuOverlay) {
        this.elements.menuOverlay.addEventListener("click", (e) => {
          if (e.target === this.elements.menuOverlay) {
            this.closeMenu(false);
          }
        });
      }

      window.addEventListener("resize", this.handleResize);
      document.addEventListener("click", this.handleDocumentClick);
      document.addEventListener("keydown", this.handleKeydown);
      document.addEventListener("touchmove", this.handleTouchMove, {
        passive: false,
      });
    }

    _setupStickyMenuObserver() {
      // Sledujeme přidání sticky headeru do DOM
      this.observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1) {
              if (
                node.classList?.contains("sticky-header") ||
                node.querySelector?.(".sticky-header")
              ) {
                setTimeout(
                  () => this._initializeStickyBurgerMenu(),
                  this.observerInitDelay
                );
              }
            }
          });
        });
      });
      this.observer.observe(document.body, { childList: true, subtree: true });
    }

    _initializeStickyMenu() {
      if (document.querySelector(this.selectors.stickyHeader)) {
        setTimeout(
          () => this._initializeStickyBurgerMenu(),
          this.stickyInitDelay
        );
      }
    }

    openMenu(isSticky = true) {
      this.closeAllMenusClean();
      setTimeout(() => {
        if (isSticky) {
          this._openStickyMenu();
        } else {
          this._openMainMenu();
        }
      }, this.menuTransitionDelay);
    }

    closeMenu(isSticky = true) {
      if (isSticky) {
        this._closeStickyMenu();
      } else {
        this._closeMainMenu();
      }
    }

    closeAllMenus() {
      this.closeAllMenusClean();
    }

    closeAllMenusClean() {
      if (this.elements.mobileNav && this.elements.menuOverlay) {
        this.elements.mobileNav.classList.remove(
          this.cssClasses.mobileMenuActive
        );
        this.elements.menuOverlay.classList.remove(this.cssClasses.active);
      }

      const stickyMobileNav = document.querySelector(
        this.selectors.stickyMobileNav
      );
      const stickyMenuOverlay = document.querySelector(
        this.selectors.stickyMenuOverlay
      );
      if (stickyMobileNav && stickyMenuOverlay) {
        stickyMobileNav.classList.remove(
          this.cssClasses.mobileMenuActive,
          this.cssClasses.active
        );
        stickyMenuOverlay.classList.remove(this.cssClasses.active);
      }

      this.elements.body.classList.remove(
        this.cssClasses.menuOpen,
        this.cssClasses.mainMenuOpen,
        this.cssClasses.stickyMenuOpen
      );
    }

    _openMainMenu() {
      if (this.elements.mobileNav && this.elements.menuOverlay) {
        this.elements.body.classList.add(this.cssClasses.mainMenuOpen);
        this.elements.mobileNav.classList.add(this.cssClasses.mobileMenuActive);
        this.elements.menuOverlay.classList.add(this.cssClasses.active);
      }
    }

    _closeMainMenu() {
      if (this.elements.mobileNav && this.elements.menuOverlay) {
        this.elements.mobileNav.classList.remove(
          this.cssClasses.mobileMenuActive
        );
        this.elements.menuOverlay.classList.remove(this.cssClasses.active);
        this.elements.body.classList.remove(this.cssClasses.mainMenuOpen);
      }
    }

    _openStickyMenu() {
      const stickyMobileNav = document.querySelector(
        this.selectors.stickyMobileNav
      );
      const stickyMenuOverlay = document.querySelector(
        this.selectors.stickyMenuOverlay
      );
      if (stickyMobileNav && stickyMenuOverlay) {
        this.elements.body.classList.add(this.cssClasses.stickyMenuOpen);
        stickyMobileNav.classList.add(
          this.cssClasses.mobileMenuActive,
          this.cssClasses.active
        );
        stickyMenuOverlay.classList.add(this.cssClasses.active);
      }
    }

    _closeStickyMenu() {
      const stickyMobileNav = document.querySelector(
        this.selectors.stickyMobileNav
      );
      const stickyMenuOverlay = document.querySelector(
        this.selectors.stickyMenuOverlay
      );
      if (stickyMobileNav && stickyMenuOverlay) {
        stickyMobileNav.classList.remove(
          this.cssClasses.mobileMenuActive,
          this.cssClasses.active
        );
        stickyMenuOverlay.classList.remove(this.cssClasses.active);
        this.elements.body.classList.remove(this.cssClasses.stickyMenuOpen);
      }
    }

    _initializeStickyBurgerMenu() {
      const stickyHeader = document.querySelector(this.selectors.stickyHeader);
      if (!stickyHeader) return;

      let stickyBurgerMenu = stickyHeader.querySelector(
        this.selectors.stickyBurgerMenu
      );
      if (!stickyBurgerMenu) return;

      const stickyMobileNav = document.querySelector(
        this.selectors.stickyMobileNav
      );
      const stickyMenuOverlay = document.querySelector(
        this.selectors.stickyMenuOverlay
      );
      if (!stickyMobileNav || !stickyMenuOverlay) return;

      // Close button může být pod různými selektory
      let stickyCloseButton =
        stickyMobileNav.querySelector(this.selectors.stickyCloseButton) ||
        stickyMobileNav.querySelector(
          '#closeButton, .close-button, [id*="close"]'
        );

      this._setupStickyBurgerMenu(stickyBurgerMenu);
      this._setupStickyCloseButton(stickyCloseButton);
      this._setupStickyOverlay(stickyMenuOverlay);
    }

    _setupStickyBurgerMenu(stickyBurgerMenu) {
      // Klonování odstraní staré event listenery
      const newStickyBurgerMenu = stickyBurgerMenu.cloneNode(true);
      stickyBurgerMenu.parentNode.replaceChild(
        newStickyBurgerMenu,
        stickyBurgerMenu
      );
      newStickyBurgerMenu.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.openMenu(true);
      });
    }

    _setupStickyCloseButton(stickyCloseButton) {
      if (stickyCloseButton) {
        const newCloseButton = stickyCloseButton.cloneNode(true);
        stickyCloseButton.parentNode.replaceChild(
          newCloseButton,
          stickyCloseButton
        );
        newCloseButton.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.closeMenu(true);
        });
      }
    }

    _setupStickyOverlay(stickyMenuOverlay) {
      const newStickyMenuOverlay = stickyMenuOverlay.cloneNode(true);
      stickyMenuOverlay.parentNode.replaceChild(
        newStickyMenuOverlay,
        stickyMenuOverlay
      );
      newStickyMenuOverlay.addEventListener("click", (e) => {
        if (e.target === newStickyMenuOverlay) {
          this.closeMenu(true);
        }
      });
    }

    _onResize() {
      if (window.innerWidth > this.mobileBreakpoint) {
        this.closeAllMenus();
      }
    }

    _onDocumentClick(e) {
      const isMainBurger = this.elements.burgerMenu?.contains(e.target);
      const isStickyBurger = e.target.closest(".sticky-header .burger-menu");
      const isInsideMobileNav = e.target.closest(
        "#mobileNav, #sticky-mobileNav"
      );

      // Zavřeme menu při kliku mimo oblast menu
      if (!isMainBurger && !isStickyBurger && !isInsideMobileNav) {
        this.closeAllMenus();
      }
    }

    _onKeyDown(e) {
      if (e.key === "Escape") {
        if (
          this.elements.body.classList.contains(this.cssClasses.mainMenuOpen) ||
          this.elements.body.classList.contains(this.cssClasses.stickyMenuOpen)
        ) {
          this.closeAllMenus();
        }
      }
    }

    _onTouchMove(e) {
      if (
        this.elements.body.classList.contains(this.cssClasses.mainMenuOpen) ||
        this.elements.body.classList.contains(this.cssClasses.stickyMenuOpen)
      ) {
        const isInsideMobileNav = e.target.closest(
          "#mobileNav, #sticky-mobileNav"
        );
        // Blokování scrollu pozadí (tedy oblasti stránky mimo menu)
        if (!isInsideMobileNav) {
          e.preventDefault();
        }
      }
    }

    _debounce(fn, delay) {
      let timeout;
      return (...args) => {
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(() => fn.apply(this, args), delay);
      };
    }

    refresh() {
      this._cacheElements();
      this._initializeStickyMenu();
    }

    reinitializeStickyMenu() {
      this._initializeStickyBurgerMenu();
    }

    destroy() {
      window.removeEventListener("resize", this.handleResize);
      document.removeEventListener("click", this.handleDocumentClick);
      document.removeEventListener("keydown", this.handleKeydown);
      document.removeEventListener("touchmove", this.handleTouchMove);

      if (this.observer) {
        this.observer.disconnect();
        this.observer = null;
      }

      this.elements = {};
      this.isInitialized = false;
    }
  }

  let burgerMenuManager;
  document.addEventListener("DOMContentLoaded", function () {
    burgerMenuManager = new BurgerMenuManager();

    window.openMenu = (isSticky) => burgerMenuManager.openMenu(isSticky);
    window.closeMenu = (isSticky) => burgerMenuManager.closeMenu(isSticky);
    window.closeAllMenus = () => burgerMenuManager.closeAllMenus();
    window.initializeStickyBurgerMenu = () =>
      burgerMenuManager._initializeStickyBurgerMenu();
    window.reinitializeStickyMenu = () =>
      burgerMenuManager.reinitializeStickyMenu();
  });
})();