/**
 * BurgerMenuManager - Správa mobilní burger navigace
 *
 * Kompletní řešení pro burger menu s podporou sticky headeru.
 * Zajišťuje plynulé otevírání/zavírání s overlay efektem a předchází scrollování pozadí.
 *
 * @fileoverview Mobilní menu manager pro responzivní burger navigaci
 * @author Michaela Gažová
 * @version 2.2.4
 * @since 2025-06-05
 * @updated 2026-05-18
 * @license MIT
 */



(function () {
  class BurgerMenuManager {
    constructor(options) {
      options = options || {};
      this.mobileBreakpoint = options.mobileBreakpoint || 940;
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
        this.debounceDelay,
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
          if (this.elements.burgerMenu.classList.contains("is-open")) {
            this.closeMenu(false);
          } else {
            this.openMenu(false);
          }
        });

        this.elements.burgerMenu.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            this.elements.burgerMenu.click();
          }
          // Tab z otevřeného burgeru, se přesune na první položku menu
          if (
            e.key === "Tab" &&
            !e.shiftKey &&
            this.elements.burgerMenu.classList.contains("is-open")
          ) {
            e.preventDefault();
            const firstItem = this.elements.mobileNav?.querySelector(
              'a, button, [tabindex="0"]',
            );
            if (firstItem) firstItem.focus();
          }
        });

        // Shift+Tab z první položky menu, přesune focus zpět na burger
        const firstItem = this.elements.mobileNav?.querySelector(
          'a, button, [tabindex="0"]',
        );
        if (firstItem) {
          firstItem.addEventListener("keydown", (e) => {
            if (
              e.key === "Tab" &&
              e.shiftKey &&
              this.elements.burgerMenu.classList.contains("is-open")
            ) {
              e.preventDefault();
              this.elements.burgerMenu.focus();
            }
          });
        }

        // Tab z poslední viditelné položky menu, zavře menu
        this.elements.mobileNav?.addEventListener("keydown", (e) => {
          if (e.key === "Tab" && !e.shiftKey) {
            const allItems = [
              ...this.elements.mobileNav.querySelectorAll("a, button"),
            ].filter((el) => {
              const style = window.getComputedStyle(el);
              return (
                style.display !== "none" &&
                style.visibility !== "hidden" &&
                el.offsetParent !== null
              );
            });
            const lastVisible = allItems[allItems.length - 1];
            if (document.activeElement === lastVisible) {
              this.closeMenu(false);
            }
          }
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
                  this.observerInitDelay,
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
          this.stickyInitDelay,
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
      this._unlockScroll();
      if (this.elements.mobileNav && this.elements.menuOverlay) {
        this.elements.mobileNav.classList.remove(
          this.cssClasses.mobileMenuActive,
        );
        this.elements.menuOverlay.classList.remove(this.cssClasses.active);
        this.elements.burgerMenu?.classList.remove("is-open");
      }

      const stickyMobileNav = document.querySelector(
        this.selectors.stickyMobileNav,
      );
      const stickyMenuOverlay = document.querySelector(
        this.selectors.stickyMenuOverlay,
      );
      if (stickyMobileNav && stickyMenuOverlay) {
        stickyMobileNav.classList.remove(
          this.cssClasses.mobileMenuActive,
          this.cssClasses.active,
        );
        stickyMenuOverlay.classList.remove(this.cssClasses.active);
      }

      this.elements.body.classList.remove(
        this.cssClasses.menuOpen,
        this.cssClasses.mainMenuOpen,
        this.cssClasses.stickyMenuOpen,
      );

      document.querySelectorAll(".mobile-acc-toggle").forEach(function (btn) {
        btn.setAttribute("aria-expanded", "false");
        btn.nextElementSibling.classList.remove("open");
      });
    }
    _lockScroll() {
      const scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth;
      document.documentElement.style.overflow = "hidden";
      document.body.style.paddingRight = scrollbarWidth + "px";
      const toggleBtn = document.getElementById("darkModeToggle");
      if (toggleBtn) {
        toggleBtn.style.transition = "none";
        toggleBtn.style.right = 20 + scrollbarWidth + "px";
        toggleBtn.offsetHeight;
        toggleBtn.style.transition = "";
      }
    }

    _unlockScroll() {
      document.documentElement.style.overflow = "";
      document.body.style.paddingRight = "";
      const toggleBtn = document.getElementById("darkModeToggle");
      if (toggleBtn) {
        toggleBtn.style.transition = "none";
        toggleBtn.style.right = "";
        toggleBtn.offsetHeight;
        toggleBtn.style.transition = "";
      }
    }
    _openMainMenu() {
      if (this.elements.mobileNav && this.elements.menuOverlay) {
        this._lockScroll();
        this.elements.body.classList.add(this.cssClasses.mainMenuOpen);
        this.elements.mobileNav.classList.add(this.cssClasses.mobileMenuActive);
        this.elements.menuOverlay.classList.add(this.cssClasses.active);
        this.elements.burgerMenu?.classList.add("is-open");
      }
    }

    _closeMainMenu() {
      if (this.elements.mobileNav && this.elements.menuOverlay) {
        this._unlockScroll();
        this.elements.mobileNav.classList.remove(
          this.cssClasses.mobileMenuActive,
        );
        this.elements.menuOverlay.classList.remove(this.cssClasses.active);
        this.elements.body.classList.remove(this.cssClasses.mainMenuOpen);
        this.elements.burgerMenu?.classList.remove("is-open");
      }
    }

    _openStickyMenu() {
      const stickyMobileNav = document.querySelector(
        this.selectors.stickyMobileNav,
      );
      const stickyMenuOverlay = document.querySelector(
        this.selectors.stickyMenuOverlay,
      );
      const stickyBurger = document.querySelector("#sticky-burgerMenu");
      if (stickyMobileNav && stickyMenuOverlay) {
        this._lockScroll();
        this.elements.body.classList.add(this.cssClasses.stickyMenuOpen);
        stickyMobileNav.classList.add(
          this.cssClasses.mobileMenuActive,
          this.cssClasses.active,
        );
        stickyMenuOverlay.classList.add(this.cssClasses.active);
        stickyBurger?.classList.add("is-open");
        stickyBurger?.setAttribute("tabindex", "0");
      }
    }

    _closeStickyMenu() {
      const stickyMobileNav = document.querySelector(
        this.selectors.stickyMobileNav,
      );
      const stickyMenuOverlay = document.querySelector(
        this.selectors.stickyMenuOverlay,
      );
      const stickyBurger = document.querySelector("#sticky-burgerMenu");

      if (stickyMobileNav && stickyMenuOverlay) {
        this._unlockScroll();
        stickyMobileNav.classList.remove(
          this.cssClasses.mobileMenuActive,
          this.cssClasses.active,
        );
        stickyMenuOverlay.classList.remove(this.cssClasses.active);
        stickyBurger?.classList.remove("is-open"); // nejdřív animace
        stickyMobileNav
          .querySelectorAll(".mobile-acc-toggle")
          .forEach((btn) => {
            btn.setAttribute("aria-expanded", "false");
            btn.nextElementSibling?.classList.remove("open");
          });
        setTimeout(() => {
          this.elements.body.classList.remove(this.cssClasses.stickyMenuOpen); // pak MutationObserver
        }, 320);
      }
    }

    _initializeStickyBurgerMenu() {
      const stickyHeader = document.querySelector(this.selectors.stickyHeader);
      if (!stickyHeader) return;

      let stickyBurgerMenu = stickyHeader.querySelector(
        this.selectors.stickyBurgerMenu,
      );
      if (!stickyBurgerMenu) return;

      const stickyMobileNav = document.querySelector(
        this.selectors.stickyMobileNav,
      );
      const stickyMenuOverlay = document.querySelector(
        this.selectors.stickyMenuOverlay,
      );
      if (!stickyMobileNav || !stickyMenuOverlay) return;

      const body = document.body;
      let savedRect = null;

      const detachBurger = () => {
        savedRect = stickyBurgerMenu.getBoundingClientRect();
        body.appendChild(stickyBurgerMenu);
        stickyBurgerMenu.style.cssText = `
            position: fixed !important;
            z-index: 9999 !important;
            top: ${savedRect.top}px !important;
            left: ${savedRect.left}px !important;
            width: ${savedRect.width}px !important;
            height: ${savedRect.height}px !important;
            right: auto !important;
            margin: 0 !important;
            transform: none !important;
        `;
      };

      const returnBurgerToHeader = () => {
        if (stickyBurgerMenu.parentElement !== stickyHeader) {
          setTimeout(() => {
            if (body.classList.contains(this.cssClasses.stickyMenuOpen)) return;
            stickyHeader.appendChild(stickyBurgerMenu);
            stickyBurgerMenu.style.cssText = `
        position: absolute !important;
        top: ${savedRect.top}px !important;
        left: ${savedRect.left}px !important;
        width: ${savedRect.width}px !important;
        height: ${savedRect.height}px !important;
        right: auto !important;
        margin: 0 !important;
        transform: none !important;
      `;
            if (closeFromKeyboard) {
              stickyBurgerMenu.focus(); // focus po návratu do headeru
              closeFromKeyboard = false;
            }
          }, 320);
        }
      };

      let isAnimating = false;
      let closeFromKeyboard = false;

      stickyBurgerMenu.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (body.classList.contains(this.cssClasses.stickyMenuOpen)) {
          // Zavírání — blokuje rychlé opakované klikání
          if (isAnimating) return;
          isAnimating = true;
          setTimeout(() => {
            isAnimating = false;
          }, 400);
          returnBurgerToHeader();
          this._closeStickyMenu();
        } else {
          // Otevírání — neblokuje, ať jde menu zavřít i během animace
          detachBurger();
          this._openStickyMenu();
          stickyBurgerMenu.focus();
        }
      });
      stickyBurgerMenu.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          if (body.classList.contains(this.cssClasses.stickyMenuOpen)) {
            closeFromKeyboard = true;
          }
          stickyBurgerMenu.click();
          setTimeout(() => stickyBurgerMenu.focus(), 50);
        }
        if (
          e.key === "Tab" &&
          !e.shiftKey &&
          body.classList.contains(this.cssClasses.stickyMenuOpen)
        ) {
          e.preventDefault();
          const firstItem = stickyMobileNav?.querySelector(
            'a, button, [tabindex="0"]',
          );
          if (firstItem) firstItem.focus();
        }
      });

      const firstStickyItem = stickyMobileNav?.querySelector(
        'a, button, [tabindex="0"]',
      );
      if (firstStickyItem) {
        firstStickyItem.addEventListener("keydown", (e) => {
          if (
            e.key === "Tab" &&
            e.shiftKey &&
            body.classList.contains(this.cssClasses.stickyMenuOpen)
          ) {
            e.preventDefault();
            stickyBurgerMenu.focus();
          }
        });
      }

      stickyMobileNav?.addEventListener("keydown", (e) => {
        if (e.key === "Tab" && !e.shiftKey) {
          const allItems = [
            ...stickyMobileNav.querySelectorAll("a, button"),
          ].filter((el) => {
            const style = window.getComputedStyle(el);
            return (
              style.display !== "none" &&
              style.visibility !== "hidden" &&
              el.offsetParent !== null
            );
          });
          const lastVisible = allItems[allItems.length - 1];
          if (document.activeElement === lastVisible) {
            closeFromKeyboard = true;
            this._closeStickyMenu();
          }
        }
      });
      // Tab ze zavřeného burgeru → první element na stránce pod sticky headerem
      document.addEventListener(
        "keydown",
        (e) => {
          if (document.activeElement !== stickyBurgerMenu) return;
          if (
            e.key === "Tab" &&
            !e.shiftKey &&
            !body.classList.contains(this.cssClasses.stickyMenuOpen)
          ) {
            e.preventDefault();
            const stickyBottom = document
              .querySelector(".sticky-header")
              .getBoundingClientRect().bottom;
            const focusable = [
              ...document.querySelectorAll(
                'a:not([tabindex="-1"]), button:not([tabindex="-1"]), input:not([tabindex="-1"])',
              ),
            ].filter((el) => {
              const rect = el.getBoundingClientRect();
              return (
                rect.top >= stickyBottom &&
                !el.closest(".sticky-header") &&
                !el.closest("header") &&
                !el.classList.contains("skip-to-content")
              );
            });
            if (focusable.length) focusable[0].focus();
          }
        },
        true,
      );

      new MutationObserver(() => {
        if (!body.classList.contains(this.cssClasses.stickyMenuOpen)) {
          returnBurgerToHeader();
        }
      }).observe(body, {
        attributes: true,
        attributeFilter: ["class"],
      });

      // Close button
      let stickyCloseButton =
        stickyMobileNav.querySelector(this.selectors.stickyCloseButton) ||
        stickyMobileNav.querySelector(
          '#closeButton, .close-button, [id*="close"]',
        );

      if (stickyCloseButton) {
        const newCloseButton = stickyCloseButton.cloneNode(true);
        stickyCloseButton.parentNode.replaceChild(
          newCloseButton,
          stickyCloseButton,
        );
        newCloseButton.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          this._closeStickyMenu();
        });
      }

      // Overlay
      const newStickyMenuOverlay = stickyMenuOverlay.cloneNode(true);
      stickyMenuOverlay.parentNode.replaceChild(
        newStickyMenuOverlay,
        stickyMenuOverlay,
      );
      newStickyMenuOverlay.addEventListener("click", (e) => {
        if (e.target === newStickyMenuOverlay) {
          this._closeStickyMenu();
        }
      });
    }

    _onResize() {
      if (window.innerWidth > this.mobileBreakpoint) {
        this._unlockScroll();
        this.closeAllMenus();
      }
    }

    _onDocumentClick(e) {
      const isMainBurger = this.elements.burgerMenu?.contains(e.target);
      const stickyBurger = document.querySelector("#sticky-burgerMenu");
      const isStickyBurger = stickyBurger?.contains(e.target);
      const isInsideMobileNav = e.target.closest(
        "#mobileNav, #sticky-mobileNav",
      );

      if (!isMainBurger && !isStickyBurger && !isInsideMobileNav) {
        this.closeAllMenus();
      }
    }

    _onKeyDown(e) {
      if (e.key === "Escape") {
        if (
          this.elements.body.classList.contains(this.cssClasses.mainMenuOpen)
        ) {
          this.closeMenu(false);
        } else if (
          this.elements.body.classList.contains(this.cssClasses.stickyMenuOpen)
        ) {
          this.closeMenu(true);
        }
      }
    }

    _onTouchMove(e) {
      if (
        this.elements.body.classList.contains(this.cssClasses.mainMenuOpen) ||
        this.elements.body.classList.contains(this.cssClasses.stickyMenuOpen)
      ) {
        const isInsideMobileNav = e.target.closest(
          "#mobileNav, #sticky-mobileNav",
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

  document.addEventListener("DOMContentLoaded", function () {
    function initAccordion() {
      document.querySelectorAll(".mobile-acc-toggle").forEach(function (btn) {
        if (btn.dataset.accInit) return;
        btn.dataset.accInit = "true";
        btn.addEventListener("click", function (e) {
          e.stopPropagation();
          const sub = btn.nextElementSibling;
          const isOpen = btn.getAttribute("aria-expanded") === "true";

          // Zavři všechny toggle na celé stránce kromě aktuálního a jeho předků
          document.querySelectorAll(".mobile-acc-toggle").forEach(function (b) {
            if (b !== btn && !b.nextElementSibling.contains(btn)) {
              b.setAttribute("aria-expanded", "false");
              b.nextElementSibling.classList.remove("open");
            }
          });

          btn.setAttribute("aria-expanded", isOpen ? "false" : "true");
          sub.classList.toggle("open", !isOpen);
        });
      });
    }

    initAccordion();

    const observer = new MutationObserver(function () {
      initAccordion();
    });
    observer.observe(document.body, { childList: true, subtree: true });
  });
})();

/* (tento script používá formátování prettier) */