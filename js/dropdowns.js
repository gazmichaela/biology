/**
 * DropdownManager - Systém pro správu víceúrovňových dropdown menu
 *
 * Řešení pro dropdown menu a vnořeného subdropdownu s podporou hoveru, kliků a ovládání pomocí klávesnice.
 * Zajišťuje synchronizaci stavu napříč taby v prohlížeči a poskytuje mechanismy pro plynulý přechod mezi tlačítkem a obsahem pomocí mrtvých zón.
 *
 * @fileoverview Automatický systém správy dropdown menu s cross-tab synchronizací a podporou subdropdownů
 * @author Michaela Gažová
 * @version 2.6.0
 * @since 2026-02-07
 * @updated 2026-03-31
 * @license MIT
 */



(function () {
  class DropdownManager {
    constructor(options = {}) {
      this.id = options.id || "default-menu";

      this.config = {
        toggleSelector: options.toggleSelector || ".dropdown-toggle",
        contentSelector: options.contentSelector || ".dropdown-content",
        subToggleSelector: options.subToggleSelector || null,
        subContentSelector: options.subContentSelector || null,
        clickInactivityDelay: options.clickInactivityDelay || 2000,
        inactivityDelay: options.inactivityDelay || 2000,
        hoverHideDelay: options.hoverHideDelay || 200,
        transitionDuration: options.transitionDuration || 300,
        // Pokud true, mrtvá zóna kopíruje šířku obsahu místo šířky tlačítek
        deadzoneMatchContent: options.deadzoneMatchContent || false,
      };

      // Klíče jsou prefixovány ID instance, aby se více dropdownů navzájem nepřepisovalo
      this.config.storageKeys = {
        mouseX: "mouseX",
        mouseY: "mouseY",
        isMouseOverToggle: `${this.id}-mouseOver`,
        isSubMenuOpen: `${this.id}-sub-isOpen`,
      };

      this.elements = {};
      this.timers = {
        hide: null,
        animation: null,
        inactivity: null,
        clickInactivity: null,
        subHide: null,
        subAnimation: null,
      };

      this.state = {
        mouseX:
          parseInt(localStorage.getItem(this.config.storageKeys.mouseX)) || 0,
        mouseY:
          parseInt(localStorage.getItem(this.config.storageKeys.mouseY)) || 0,
        lastMouseUpdate: 0,
        isClickOpened: false,
        isSubmenuActive: false,
        isClosingInProgress: false,
        isClickOpenedSub: false,
        isMouseOverMenuSub: false,
        isClosingInProgressSub: false,
        isKeyboardOpened: false,
        isSubKeyboardOpened: false,
        currentFocusIndex: -1,
        focusableElements: [],
        // Samotná třída visible nestačí, header může být mimo viewport během přechodu
        wasStickyActuallyVisible: false,
      };

      this.deadzoneElement = null;
      this.subDeadzoneElement = null;
      // Uchováváme původní display hodnotu subdropdownu pro obnovení při znovuotevření
      this.subOriginalDisplay = null;

      this.handleToggleMouseEnter = this._onToggleMouseEnter.bind(this);
      this.handleToggleMouseLeave = this._onToggleMouseLeave.bind(this);
      this.handleToggleClick = this._onToggleClick.bind(this);
      this.handleToggleKeyDown = this._onToggleKeyDown.bind(this);
      this.handleToggleBlur = this._onToggleBlur.bind(this);
      this.handleContentMouseEnter = this._onContentMouseEnter.bind(this);
      this.handleContentMouseLeave = this._onContentMouseLeave.bind(this);
      this.handleContentMouseMove = this._onContentMouseMove.bind(this);
      this.handleContentClick = this._onContentClick.bind(this);
      this.handleContentFocusIn = this._onContentFocusIn.bind(this);
      this.handleContentFocusOut = this._onContentFocusOut.bind(this);
      this.handleDocumentClick = this._onDocumentClick.bind(this);
      this.handleDocumentMouseMove = this._onDocumentMouseMove.bind(this);
      this.handleDocumentKeyDown = this._onDocumentKeyDown.bind(this);
      this.handleWindowResize = this._onWindowResize.bind(this);
      this.handleWindowScroll = this._onWindowScroll.bind(this);

      this.init();
    }

    init() {
      try {
        this._cacheElements();
        this._validateElements();
        this._setupStyles();
        this._createDeadzone();
        this._createSubDeadzone();
        this._setupSubDropdown();
        this._bindEvents();
        this._checkInitialState();
        this._setupStickyHeaderObserver();

        this.isInitialized = true;
      } catch (error) {
        console.error(`DropdownManager [${this.id}] init failed:`, error);
      }
    }

    _setupStickyHeaderObserver() {
      const checkStickyHeader = () => {
        const stickyHeader = document.querySelector(".sticky-header");
        if (!stickyHeader) return;

        const hasVisible = stickyHeader.classList.contains("visible");
        const rect = stickyHeader.getBoundingClientRect();

        // Tolerance 10px kvůli vykreslování subdropdownu a plynulým přechodům
        const isActuallyVisible =
          hasVisible && rect.top >= -10 && rect.top <= 10;

        // Dropdown zavíráme jen při přechodu z neviditelného na viditelný
        if (
          isActuallyVisible &&
          !this.state.wasStickyActuallyVisible &&
          this.isOpen()
        ) {
          this._closeForStickyHeader();
        }

        this.state.wasStickyActuallyVisible = isActuallyVisible;
      };

      // Sleduje přechod z neviditelného na viditelný stav, aby se dropdown nezobrazoval přes sticky header
      this.stickyCheckInterval = setInterval(checkStickyHeader, 100);
    }

    _closeForStickyHeader() {
      this._clearAllTimers();
      this.state.isClosingInProgress = true;
      this.elements.toggle.classList.remove("is-open");

      const originalTransition = this.elements.content.style.transition;
      const originalSubTransition = this.elements.subContent
        ? this.elements.subContent.style.transition
        : "";

      this.elements.content.style.transition =
        "opacity 0.1s ease-out, visibility 0.1s ease-out";

      if (this.elements.subContent) {
        this.elements.subContent.style.transition =
          "opacity 0.1s ease-out, visibility 0.1s ease-out";
      }

      requestAnimationFrame(() => {
        this.elements.content.style.opacity = "0";
        this.elements.content.style.visibility = "hidden";
        this._hideDeadzone();

        if (this.elements.subContent) {
          this.state.isClickOpenedSub = false;
          this.elements.subContent.style.opacity = "0";
          this.elements.subContent.style.visibility = "hidden";
          this._hideSubDeadzone();
        }
      });

      setTimeout(() => {
        this.elements.content.style.display = "none";
        this.elements.content.style.transition = originalTransition;

        if (this.elements.subContent) {
          this.elements.subContent.style.display = "none";
          this.elements.subContent.style.transition = originalSubTransition;
        }

        this.state.isClickOpened = false;
        this.state.isSubmenuActive = false;
        this.state.isClosingInProgress = false;

        this._clearStorageKeys();
      }, 30);
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
        subToggle: subToggleSelector
          ? document.querySelector(subToggleSelector)
          : null,
        subContent: subContentSelector
          ? document.querySelector(subContentSelector)
          : null,
      };
    }

    _validateElements() {
      if (!this.elements.toggle) {
        throw new Error(
          `Dropdown toggle not found: ${this.config.toggleSelector}`,
        );
      }
      if (!this.elements.content) {
        throw new Error(
          `Dropdown content not found: ${this.config.contentSelector}`,
        );
      }
    }

    // ==== NAVIGACE ŠIPKAMI ==== //
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

        if (this.state.focusableElements.length === 0) return;

        if (e.key === "ArrowDown") {
          this.state.currentFocusIndex++;
          if (
            this.state.currentFocusIndex >= this.state.focusableElements.length
          ) {
            this.state.currentFocusIndex = 0;
          }
        } else if (e.key === "ArrowUp") {
          this.state.currentFocusIndex--;
          if (this.state.currentFocusIndex < 0) {
            this.state.currentFocusIndex =
              this.state.focusableElements.length - 1;
          }
        }

        const currentElement =
          this.state.focusableElements[this.state.currentFocusIndex];

        if (!currentElement) return;
        if (
          this.elements.subToggle &&
          currentElement === this.elements.subToggle
        ) {
          this._clearTimer("subHide");
          this._clearTimer("subAnimation");
          this.state.isClosingInProgressSub = false;
          this.state.isClickOpenedSub = true;
          localStorage.setItem(this.config.storageKeys.isSubMenuOpen, "true");

          if (this.elements.subContent.style.display === "none") {
            this.elements.subContent.style.display =
              this.subOriginalDisplay || "block";

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

          if (window.setSubmenuActive) {
            window.setSubmenuActive(true);
          }
        }

        if (
          this.elements.subContent &&
          this.elements.subContent.style.opacity === "1"
        ) {
          const isInSubContent =
            this.elements.subContent.contains(currentElement);
          const isSubToggle = currentElement === this.elements.subToggle;

          if (!isInSubContent && !isSubToggle) {
            this.state.isClickOpenedSub = false;
            localStorage.removeItem(this.config.storageKeys.isSubMenuOpen);

            this.elements.subContent.style.opacity = "0";
            this.elements.subContent.style.visibility = "hidden";
            this._hideSubDeadzone();

            requestAnimationFrame(() => {
              // subContent mění display až v dalším snímku, focusableElements musíme přepočítat až po té změně
              this._updateFocusableElements();
              const newIndex =
                this.state.focusableElements.indexOf(currentElement);
              if (newIndex !== -1) {
                this.state.currentFocusIndex = newIndex;
              }
            });

            setTimeout(() => {
              if (
                this.elements.subContent &&
                this.state.isClickOpenedSub === false
              ) {
                this.elements.subContent.style.display = "none";
              }
            }, 300);
          }
        }

        this._applyKeyboardHoverStyle();

        currentElement.focus();
      }

      if (e.key === "Home" && this.isOpen()) {
        e.preventDefault();
        this._updateFocusableElements();
        if (this.state.focusableElements.length > 0) {
          this.state.currentFocusIndex = 0;
          this._applyKeyboardHoverStyle();
          this.state.focusableElements[0].focus();
        }
      }

      if (e.key === "End" && this.isOpen()) {
        e.preventDefault();
        this._updateFocusableElements();
        if (this.state.focusableElements.length > 0) {
          this.state.currentFocusIndex =
            this.state.focusableElements.length - 1;
          this._applyKeyboardHoverStyle();
          this.state.focusableElements[this.state.currentFocusIndex].focus();
        }
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
        const currentElement =
          this.state.focusableElements[this.state.currentFocusIndex];
        currentElement.classList.add("keyboard-hover");
        if (currentElement.classList.contains("active")) {
          currentElement.style.backgroundColor = "#388E3C";
        } else {
          currentElement.style.backgroundColor = "#309ce5";
        }
        currentElement.style.color = "white";
      }
    }

    _removeKeyboardHoverStyles() {
      const allKeyboardHovered = document.querySelectorAll(".keyboard-hover");
      allKeyboardHovered.forEach((el) => {
        el.classList.remove("keyboard-hover");
        el.style.backgroundColor = "";
        el.style.color = "";
      });
    }

    _updateFocusableElements() {
      const content = this.elements.content;
      if (!content) return;

      const selector =
        'a, button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), span[tabindex]:not([tabindex="-1"]), [tabindex]:not([tabindex="-1"]), [role="button"], [role="menuitem"]';

      const isVisible = (el) => {
        const style = window.getComputedStyle(el);
        return (
          el.offsetParent !== null &&
          style.display !== "none" &&
          style.visibility !== "hidden" &&
          style.opacity !== "0"
        );
      };

      const allContentElements = Array.from(
        content.querySelectorAll(selector),
      ).filter(isVisible);

      if (
        !this.elements.subContent ||
        this.elements.subContent.style.opacity !== "1"
      ) {
        if (this.elements.subContent) {
          this.state.focusableElements = allContentElements.filter((el) => {
            let parent = el.parentElement;
            while (parent && parent !== content) {
              if (parent === this.elements.subContent) {
                return false;
              }
              parent = parent.parentElement;
            }
            return true;
          });
        } else {
          this.state.focusableElements = allContentElements;
        }
        return;
      }

      this.state.focusableElements = allContentElements;
    }

    // ==== OVLÁDÁNÍ KLÁVESNICÍ ==== //
    _onToggleKeyDown(e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        e.stopPropagation();

        const isOpen = this.elements.content.style.opacity === "1";

        if (isOpen) {
          this._hideMenuKeyboard();
        } else {
          this._showMenuKeyboard();
        }
      }

      if (e.key === "Escape") {
        e.preventDefault();
        this._hideMenuKeyboard();
      }
    }

    _onToggleBlur(e) {
      setTimeout(() => {
        const activeElement = document.activeElement;

        const isFocusInContent = this.elements.content.contains(activeElement);
        const isFocusInToggle = this.elements.toggle.contains(activeElement);
        const isFocusInSubToggle =
          this.elements.subToggle &&
          this.elements.subToggle.contains(activeElement);
        const isFocusInSubContent =
          this.elements.subContent &&
          this.elements.subContent.contains(activeElement);

        if (
          !isFocusInContent &&
          !isFocusInToggle &&
          !isFocusInSubToggle &&
          !isFocusInSubContent
        ) {
          if (this.state.isKeyboardOpened) {
            this._hideMenuKeyboard();
          }
        }
      }, 10);
    }

    _onContentFocusIn(e) {
      if (this.state.isKeyboardOpened || this.state.isClickOpened) {
        this._clearTimer("clickInactivity");
        this._clearTimer("inactivity");
      }
    }

    _onContentFocusOut(e) {
      setTimeout(() => {
        const activeElement = document.activeElement;

        const isFocusInContent = this.elements.content.contains(activeElement);
        const isFocusInToggle = this.elements.toggle.contains(activeElement);
        const isFocusInSubToggle =
          this.elements.subToggle &&
          this.elements.subToggle.contains(activeElement);
        const isFocusInSubContent =
          this.elements.subContent &&
          this.elements.subContent.contains(activeElement);

        if (
          !isFocusInContent &&
          !isFocusInToggle &&
          !isFocusInSubToggle &&
          !isFocusInSubContent
        ) {
          const allElementsInMenu = this.elements.content.querySelectorAll(
            "a, button, span, [tabindex]",
          );
          allElementsInMenu.forEach((el) => {
            el.style.backgroundColor = "";
            el.style.color = "";
            el.classList.remove("keyboard-hover");
          });

          this._removeKeyboardHoverStyles();

          if (this.state.isKeyboardOpened) {
            this._hideMenuKeyboard();
          }
        }
      }, 10);
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

      const activeElement = document.activeElement;
      if (this.elements.content.contains(activeElement)) {
        setTimeout(() => {
          this.elements.toggle.focus();
        }, 50);
      }
    }

    // ==== OVLÁDÁNÍ SUBDROPDOWNU KLÁVESNICÍ ==== //
    _onSubToggleKeyDown(e) {
      if (!this.elements.subContent) return;

      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        e.stopPropagation();

        const isOpen = this.elements.subContent.style.opacity === "1";

        if (isOpen) {
          this._hideSubMenuKeyboard();
        } else {
          this._showSubMenuKeyboard();
        }
      }

      if (e.key === "Escape") {
        e.preventDefault();
        this._hideSubMenuKeyboard();
      }
    }

    _onSubToggleFocus() {
      if (
        this.elements.subContent &&
        this.elements.subContent.style.opacity !== "1"
      ) {
        this._showSubMenuKeyboard();
      }
    }

    _onSubToggleBlur() {
      setTimeout(() => {
        const activeElement = document.activeElement;

        const isFocusInSubToggle =
          this.elements.subToggle &&
          this.elements.subToggle.contains(activeElement);
        const isFocusInSubContent =
          this.elements.subContent &&
          this.elements.subContent.contains(activeElement);

        if (!isFocusInSubToggle && !isFocusInSubContent) {
          if (this.state.isSubKeyboardOpened) {
            this._hideSubMenuKeyboard();
          }
        }
      }, 0);
    }

    _onSubContentFocusIn(e) {
      if (this.state.isSubKeyboardOpened || this.state.isClickOpenedSub) {
        this._clearTimer("subHide");
      }
    }

    _onSubContentFocusOut(e) {
      setTimeout(() => {
        const activeElement = document.activeElement;

        const isFocusInSubToggle =
          this.elements.subToggle &&
          this.elements.subToggle.contains(activeElement);
        const isFocusInSubContent =
          this.elements.subContent &&
          this.elements.subContent.contains(activeElement);

        // Fokus při klávesnicové navigaci řídí _onDocumentKeyDown, jinak by se subdropdown zavřel uprostřed procházení
        if (this.state.currentFocusIndex >= 0) {
          return;
        }

        if (!isFocusInSubToggle && !isFocusInSubContent) {
          if (this.elements.subContent) {
            const allElementsInSubMenu =
              this.elements.subContent.querySelectorAll(
                "a, button, span, [tabindex]",
              );
            allElementsInSubMenu.forEach((el) => {
              el.style.backgroundColor = "";
              el.style.color = "";
              el.classList.remove("keyboard-hover");
            });
          }

          this._removeKeyboardHoverStyles();

          if (this.state.isSubKeyboardOpened) {
            this._hideSubMenuKeyboard();
          }
        }
      }, 0);
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

      const activeElement = document.activeElement;
      if (
        this.elements.subContent &&
        this.elements.subContent.contains(activeElement)
      ) {
        setTimeout(() => {
          this.elements.subToggle.focus();
        }, 50);
      }
    }

    // ==== MRTVÁ ZÓNA SUBDROPDOWNU ==== //
    _createSubDeadzone() {
      if (!this.elements.subToggle || !this.elements.subContent) {
        return;
      }

      this.subDeadzoneElement = document.createElement("div");
      this.subDeadzoneElement.id = `subdropdown-deadzone-${this.id}`;
      this.subDeadzoneElement.className = "subdropdown-deadzone";
      this.subDeadzoneElement.style.position = "fixed";
      this.subDeadzoneElement.style.pointerEvents = "none";
      this.subDeadzoneElement.style.display = "none";
      this.subDeadzoneElement.style.zIndex = "9999";
      this.subDeadzoneElement.style.backgroundColor = "red";

      document.body.appendChild(this.subDeadzoneElement);
    }

    _updateSubDeadzone() {
      if (
        !this.subDeadzoneElement ||
        !this.elements.subToggle ||
        !this.elements.subContent
      ) {
        return;
      }

      const subDropdownContainer =
        this.elements.subToggle.closest(".sub-dropdown");
      const containerRect = subDropdownContainer
        ? subDropdownContainer.getBoundingClientRect()
        : this.elements.subToggle.getBoundingClientRect();

      const subContentRect = this.elements.subContent.getBoundingClientRect();

      // Mrtvá zóna nezasahuje pod spodní padding subdropdownu
      const paddingOffset = 5;

      const left = containerRect.right;
      const width = subContentRect.left - containerRect.right;
      const top = subContentRect.top + 2;
      const height = subContentRect.height - paddingOffset;

      // Mrtvou zónu zobrazujeme, jen pokud je mezi togglem a obsahem skutečná mezera
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

    _showSubDeadzone() {
      if (this.subDeadzoneElement) {
        this._updateSubDeadzone();
      }
    }

    _hideSubDeadzone() {
      if (this.subDeadzoneElement) {
        this.subDeadzoneElement.style.display = "none";
      }
    }

    _isMouseInSubDeadzone() {
      if (
        !this.subDeadzoneElement ||
        this.subDeadzoneElement.style.display === "none"
      ) {
        return false;
      }

      const { mouseX, mouseY } = this.state;
      const rect = this.subDeadzoneElement.getBoundingClientRect();

      return (
        mouseX >= rect.left &&
        mouseX <= rect.right &&
        mouseY >= rect.top &&
        mouseY <= rect.bottom
      );
    }

    // ==== NASTAVENÍ SUBDROPDOWNU ==== //
    _setupSubDropdown() {
      const { subToggle, subContent } = this.elements;

      if (!subToggle || !subContent) {
        return;
      }

      this.subOriginalDisplay = window.getComputedStyle(subContent).display;
      subContent.style.cssText = `
        transition: opacity 0.3s ease-in-out, visibility 0.3s ease-in-out;
        opacity: 0;
        visibility: hidden;
        display: none;
      `;

      if (!subToggle.hasAttribute("tabindex")) {
        subToggle.setAttribute("tabindex", "0");
      }
      subToggle.classList.add("has-click-listener");
      subContent.classList.add("fade-dropdown");

      if (
        localStorage.getItem(this.config.storageKeys.isSubMenuOpen) === "true"
      ) {
        this.state.isClickOpenedSub = true;
        setTimeout(() => this._showSubMenu(), 50);
      }
    }

    _showSubMenu() {
      if (!this.elements.subContent) return;

      this._clearTimer("subHide");
      this._clearTimer("subAnimation");
      this.state.isClosingInProgressSub = false;

      this.elements.subContent.style.display =
        this.subOriginalDisplay || "block";

      setTimeout(() => {
        this.elements.subContent.style.opacity = "1";
        this.elements.subContent.style.visibility = "visible";
        this._showSubDeadzone();
      }, 10);

      if (window.setSubmenuActive) {
        window.setSubmenuActive(true);
      }

      if (this.state.isClickOpenedSub) {
        localStorage.setItem(this.config.storageKeys.isSubMenuOpen, "true");
      }
    }

    _hideSubMenu(skipDelay = false) {
      if (
        !this.elements.subContent ||
        this.elements.subContent.style.display === "none"
      )
        return;

      this._clearTimer("subHide");
      this._clearTimer("subAnimation");
      this.state.isClosingInProgressSub = true;

      let currentElementBeforeClose = null;
      if (
        this.state.currentFocusIndex >= 0 &&
        this.state.currentFocusIndex < this.state.focusableElements.length
      ) {
        currentElementBeforeClose =
          this.state.focusableElements[this.state.currentFocusIndex];
      }

      const isInSubContent =
        currentElementBeforeClose &&
        this.elements.subContent.contains(currentElementBeforeClose);

      this.elements.subContent.style.opacity = "0";
      this.elements.subContent.style.visibility = "hidden";
      this._hideSubDeadzone();

      const animationDuration = 400;
      const delay = skipDelay
        ? Math.floor(animationDuration / 2)
        : animationDuration + 50; // 50ms rezerva aby CSS přechod plně doběhl

      this.timers.subAnimation = setTimeout(() => {
        if (!this.state.isMouseOverMenuSub && !this._isMouseInSubDeadzone()) {
          this.elements.subContent.style.display = "none";

          if (this.state.isClickOpenedSub) {
            this.state.isClickOpenedSub = false;
            localStorage.removeItem(this.config.storageKeys.isSubMenuOpen);
          }

          if (window.setSubmenuActive) {
            window.setSubmenuActive(false);
          }

          if (currentElementBeforeClose) {
            this._updateFocusableElements();

            if (isInSubContent) {
              const subToggleIndex = this.state.focusableElements.indexOf(
                this.elements.subToggle,
              );
              if (subToggleIndex !== -1) {
                this.state.currentFocusIndex = subToggleIndex;
              } else {
                this.state.currentFocusIndex = -1;
              }
            } else {
              const newIndex = this.state.focusableElements.indexOf(
                currentElementBeforeClose,
              );
              if (newIndex !== -1) {
                this.state.currentFocusIndex = newIndex;
              }
            }
          }
        } else {
          this._showSubMenu();
        }

        this.state.isClosingInProgressSub = false;
      }, delay);
    }

    // ==== HLAVNÍ DROPDOWNY ==== //
    _createDeadzone() {
      // Mrtvá zóna zabraňuje zavření menu při přesunu myši z tlačítka na obsah
      this.deadzoneElement = document.createElement("div");
      this.deadzoneElement.id = `dropdown-deadzone-${this.id}`;
      this.deadzoneElement.className = "dropdown-deadzone";
      this.deadzoneElement.style.position = "fixed";
      this.deadzoneElement.style.pointerEvents = "none";
      this.deadzoneElement.style.display = "none";
      this.deadzoneElement.style.zIndex = "9999";
      this.deadzoneElement.style.backgroundColor = "red";

      document.body.appendChild(this.deadzoneElement);
    }

    _updateDeadzone() {
      if (!this.deadzoneElement) return;

      const container = this.elements.toggle.closest(".button-container");

      // Bez button-container nelze spolehlivě určit rozměry mrtvé zóny
      if (!container) {
        this.deadzoneElement.style.display = "none";
        return;
      }

      const mainButton = container.querySelector(".main-button");
      const dropdownToggle = this.elements.toggle;

      if (!mainButton) {
        this.deadzoneElement.style.display = "none";
        return;
      }

      const mainButtonRect = mainButton.getBoundingClientRect();
      const toggleRect = dropdownToggle.getBoundingClientRect();
      const contentRect = this.elements.content.getBoundingClientRect();

      // -2 kompenzuje border mezi tlačítky
      const totalWidth =
        mainButton.offsetWidth + dropdownToggle.offsetWidth - 2;
      const left = mainButtonRect.left;
      const top = Math.max(mainButtonRect.bottom, toggleRect.bottom);
      const height = contentRect.top - top;

      if (height > 0) {
        let width = totalWidth;
        let left = mainButtonRect.left;

        if (this.config.deadzoneMatchContent) {
          const computedStyle = window.getComputedStyle(this.elements.content);
          const paddingRight = parseFloat(computedStyle.paddingRight) || 0;
          left = contentRect.left;
          width = contentRect.width - paddingRight;
        }
        this.deadzoneElement.style.left = left + "px";
        this.deadzoneElement.style.top = top + "px";
        this.deadzoneElement.style.width = width + "px";
        this.deadzoneElement.style.height = height + "px";
        this.deadzoneElement.style.display = "block";
      } else {
        this.deadzoneElement.style.display = "none";
      }
    }

    _showDeadzone() {
      if (this.deadzoneElement) {
        this._updateDeadzone();
      }
    }

    _hideDeadzone() {
      if (this.deadzoneElement) {
        this.deadzoneElement.style.display = "none";
      }
    }

    _isMouseInDeadzone() {
      if (
        !this.deadzoneElement ||
        this.deadzoneElement.style.display === "none"
      ) {
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

      if (subContent && subContent.style.display !== "none") {
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
      this.state.currentFocusIndex = -1;
      this._removeKeyboardHoverStyles();

      this.elements.content.style.opacity = "0";
      this.elements.content.style.visibility = "hidden";
      this.elements.content.style.display = "block";

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          this.elements.content.style.opacity = "1";
          this.elements.content.style.visibility = "visible";
          this._showDeadzone();
        });
      });

      if (this.state.isClickOpened) {
        this._startInactivityTimer();
      }
    }

    _hideMenu() {
      if (window.tabNavigationActive) {
        return;
      }

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
        this.state.isSubmenuActive = false;
        this.state.isClosingInProgress = false;
        this._clearStorageKeys();
      }, this.config.transitionDuration);
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
      const isMouseInSubDeadzone = this._isMouseInSubDeadzone();

      return (
        isMouseOverMenu ||
        isMouseOverToggle ||
        isMouseOverSub ||
        isMouseInDeadzone ||
        isMouseInSubDeadzone
      );
    }

    _onToggleMouseEnter() {
      this._clearTimer("hide");

      if (window.closeAllMenusExcept) {
        window.closeAllMenusExcept(this.id);
      }

      if (this.elements.subContent && !this.state.isClickOpenedSub) {
        this._hideSubMenu();
      }

      if (!this.state.isClickOpened) {
        requestAnimationFrame(() => {
          this._showMenu();
        });
      }

      localStorage.setItem(this.config.storageKeys.isMouseOverToggle, "true");
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
        this.elements.toggle.classList.add("is-open");
        this.elements.content.style.display = "block";

        // Vynutíme reflow, jinak CSS přechod po nastavení display: block neproběhne
        void this.elements.content.offsetHeight;

        requestAnimationFrame(() => {
          this.elements.content.style.opacity = "1";
          this.elements.content.style.visibility = "visible";
          this._showDeadzone();
          this._startInactivityTimer();
          this._startClickInactivityTimer();
        });
      }
    }

    _onContentMouseEnter() {
      this._clearTimer("hide");
      this._clearTimer("inactivity");
      this._clearTimer("clickInactivity");
      this._clearTimer("animation");

      if (this.state.isClosingInProgress) {
        this.state.isClosingInProgress = false;
        this.elements.content.style.opacity = "1";
        this.elements.content.style.visibility = "visible";
        this.elements.content.style.display = "block";
        this._showDeadzone();
        return;
      }

      if (this.state.isClickOpened) {
        this._clearTimer("clickInactivity");
        this._clearTimer("inactivity");
      } else {
        this.elements.content.style.display = "block";
        requestAnimationFrame(() => {
          this.elements.content.style.opacity = "1";
          this.elements.content.style.visibility = "visible";
        });
      }
    }
    _onContentMouseLeave(e) {
      const toElement = e.relatedTarget;

      // Pokud myš přechází na toggle nebo jeho potomka, nezavírej
      if (
        toElement === this.elements.toggle ||
        this.elements.toggle.contains(toElement)
      ) {
        return;
      }

      if (!this.state.isClickOpened) {
        this.timers.hide = setTimeout(() => {
          if (!this._isMouseInDeadzone() && !this._isMouseOverAnyElement()) {
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

      this.state.currentFocusIndex = -1;
      this._removeKeyboardHoverStyles();
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

      // Throttling zápisu do localStorage, mousemove se spouští desetkrát za sekundu
      if (now - this.state.lastMouseUpdate > 100) {
        localStorage.setItem(this.config.storageKeys.mouseX, this.state.mouseX);
        localStorage.setItem(this.config.storageKeys.mouseY, this.state.mouseY);
        this.state.lastMouseUpdate = now;
      }

      if (this.elements.content.style.opacity === "1") {
        this._updateDeadzone();

        if (
          this.elements.subContent &&
          this.elements.subContent.style.opacity === "1"
        ) {
          this._updateSubDeadzone();
        }

        const isMouseOver = this._isMouseOverAnyElement();
        if (!this.state.isClickOpened && !isMouseOver) {
          if (!this.timers.hide) {
            this.timers.hide = setTimeout(() => {
              if (!this._isMouseOverAnyElement()) {
                this._hideMenu();
              }
            }, this.config.hoverHideDelay);
          }
        } else if (!this.state.isClickOpened) {
          this._clearTimer("hide");
        }

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
      if (this.elements.content.style.opacity === "1") {
        this._updateDeadzone();
        if (
          this.elements.subContent &&
          this.elements.subContent.style.opacity === "1"
        ) {
          this._updateSubDeadzone();
        }
      }
    }

    _onWindowScroll() {
      if (this.elements.content.style.opacity === "1") {
        this._updateDeadzone();
        if (
          this.elements.subContent &&
          this.elements.subContent.style.opacity === "1"
        ) {
          this._updateSubDeadzone();
        }
      }
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
        localStorage.getItem(this.config.storageKeys.isMouseOverToggle) ===
        "true";

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
      // Subdropdown při načtení stránky nikdy neobnovujeme, pouze hlavní dropdown
      localStorage.removeItem(this.config.storageKeys.isSubMenuOpen);
    }

    _bindEvents() {
      const { toggle, content, subToggle, subContent } = this.elements;

      toggle.addEventListener("mouseenter", this.handleToggleMouseEnter);
      toggle.addEventListener("mouseleave", this.handleToggleMouseLeave);
      toggle.addEventListener("click", this.handleToggleClick);
      toggle.addEventListener("keydown", this.handleToggleKeyDown);
      toggle.addEventListener("blur", this.handleToggleBlur);

      const container = toggle.closest(".button-container");
      if (container) {
        const mainButton = container.querySelector(
          ".main-button, .main-button-second",
        );
        if (mainButton) {
          mainButton.addEventListener("focus", (e) => {
            const allDropdowns = document.querySelectorAll(
              ".dropdown-content, .dropdown-content-second, .dropdown-content-third, .sub-dropdown-content",
            );
            allDropdowns.forEach((dropdown) => {
              const allElements = dropdown.querySelectorAll(
                "a, button, span, [tabindex]",
              );
              allElements.forEach((el) => {
                el.style.backgroundColor = "";
                el.style.color = "";
                el.classList.remove("keyboard-hover");
              });
            });

            const dropdownToggle = container.querySelector(
              ".dropdown-toggle, .dropdown-toggle-second, .dropdown-toggle-third",
            );
            if (dropdownToggle) {
              dropdownToggle.style.backgroundColor = "";
              dropdownToggle.style.color = "";
              const arrow = dropdownToggle.querySelector(".arrow");
              if (arrow) {
                arrow.style.color = "";
              }
            }
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

      content.addEventListener("mouseenter", this.handleContentMouseEnter);
      content.addEventListener("mouseleave", this.handleContentMouseLeave);
      content.addEventListener("mousemove", this.handleContentMouseMove);
      content.addEventListener("click", this.handleContentClick);
      content.addEventListener("focusin", this.handleContentFocusIn);
      content.addEventListener("focusout", this.handleContentFocusOut);

      if (subToggle && subContent) {
        this._bindSubDropdownEvents();
      }

      const interactiveElements = content.querySelectorAll(
        "input, select, textarea, button",
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

        element.addEventListener("mouseenter", () => {
          this._removeKeyboardHoverStyles();
        });
      });

      const allFocusableElements = content.querySelectorAll(
        "a, button, input, select, textarea, [tabindex]:not([tabindex='-1'])",
      );
      allFocusableElements.forEach((element) => {
        if (element.tagName === "A") {
          element.addEventListener("click", () => {
            this._clearStorageKeys();
          });
        }

        element.addEventListener("focus", (e) => {
          setTimeout(() => {
            if (document.body.classList.contains("using-mouse")) return;
            const allDropdowns = document.querySelectorAll(
              ".dropdown-content, .dropdown-content-second, .dropdown-content-third, .sub-dropdown-content",
            );
            allDropdowns.forEach((dropdown) => {
              const allElements = dropdown.querySelectorAll(
                "a, button, span, [tabindex]",
              );
              allElements.forEach((el) => {
                if (el !== e.target) {
                  el.style.backgroundColor = "";
                  el.style.color = "";
                  el.classList.remove("keyboard-hover");
                }
              });
            });

            e.target.classList.add("keyboard-hover");
            if (e.target.classList.contains("active")) {
              e.target.style.backgroundColor = "#388E3C";
            } else {
              e.target.style.backgroundColor = "#309ce5";
            }
            e.target.style.color = "white";
          }, 0);
        });

        element.addEventListener("mouseenter", () => {
          this._removeKeyboardHoverStyles();
        });
      });

      document.addEventListener("click", this.handleDocumentClick);
      document.addEventListener("mousemove", this.handleDocumentMouseMove);
      document.addEventListener("keydown", this.handleDocumentKeyDown);

      window.addEventListener("resize", this.handleWindowResize);
      window.addEventListener("scroll", this.handleWindowScroll);
    }

    _bindSubDropdownEvents() {
      const { subToggle, subContent, content } = this.elements;

      subToggle.addEventListener(
        "keydown",
        this._onSubToggleKeyDown.bind(this),
      );
      subToggle.addEventListener("focus", this._onSubToggleFocus.bind(this));
      subToggle.addEventListener("blur", this._onSubToggleBlur.bind(this));

      subContent.addEventListener(
        "focusin",
        this._onSubContentFocusIn.bind(this),
      );
      subContent.addEventListener(
        "focusout",
        this._onSubContentFocusOut.bind(this),
      );

      subToggle.addEventListener("mouseenter", () => {
        this.state.isMouseOverMenuSub = true;
        if (this.state.isClosingInProgressSub) {
          this._showSubMenu();
        } else if (!this.state.isClickOpenedSub) {
          this._showSubMenu();
        }
      });

      subToggle.addEventListener("mouseleave", () => {
        this.state.isMouseOverMenuSub = false;
      });

      subToggle.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();

        this._clearTimer("subHide");
        this._clearTimer("subAnimation");

        const isCurrentlyVisible = subContent.style.opacity === "1";

        if (isCurrentlyVisible && this.state.isClickOpenedSub) {
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

      const arrowElement = subToggle.querySelector(
        ".arrow, .dropdown-arrow, .caret, .arrow-icon, i.fa-chevron-down",
      );
      if (arrowElement) {
        arrowElement.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          const clickEvent = new MouseEvent("click", {
            bubbles: true,
            cancelable: true,
            view: window,
          });
          subToggle.dispatchEvent(clickEvent);
        });
      }

      subContent.addEventListener("mouseenter", () => {
        this.state.isMouseOverMenuSub = true;
        if (this.state.isClosingInProgressSub) {
          this._showSubMenu();
        }
        if (window.setSubmenuActive) {
          window.setSubmenuActive(true);
        }
      });

      subContent.addEventListener("mouseleave", () => {
        this.state.isMouseOverMenuSub = false;
        if (!this.state.isClickOpenedSub && !this._isMouseInSubDeadzone()) {
          this.timers.subHide = setTimeout(() => {
            if (!this._isMouseInSubDeadzone()) {
              this._hideSubMenu();
            }
          }, 300);
        }
      });

      content.addEventListener("mousemove", (e) => {
        const elementUnderMouse = document.elementFromPoint(
          e.clientX,
          e.clientY,
        );

        if (
          content.contains(elementUnderMouse) &&
          !subToggle.contains(elementUnderMouse) &&
          !subContent.contains(elementUnderMouse) &&
          !this._isMouseInSubDeadzone()
        ) {
          this.state.isMouseOverMenuSub = false;

          if (
            subContent.style.opacity === "1" &&
            !this.state.isClickOpenedSub
          ) {
            this._hideSubMenu();
          }
        }
      });

      const subFocusableElements = subContent.querySelectorAll(
        "a, button, input, select, textarea, [tabindex]:not([tabindex='-1'])",
      );
      subFocusableElements.forEach((element) => {
        element.addEventListener("focus", (e) => {
          setTimeout(() => {
            if (document.body.classList.contains("using-mouse")) return;
            const allDropdowns = document.querySelectorAll(
              ".dropdown-content, .dropdown-content-second, .dropdown-content-third, .sub-dropdown-content",
            );
            allDropdowns.forEach((dropdown) => {
              const allElements = dropdown.querySelectorAll(
                "a, button, span, [tabindex]",
              );
              allElements.forEach((el) => {
                if (el !== e.target) {
                  el.style.backgroundColor = "";
                  el.style.color = "";
                  el.classList.remove("keyboard-hover");
                }
              });
            });

            e.target.classList.add("keyboard-hover");
            if (e.target.classList.contains("active")) {
              e.target.style.backgroundColor = "#388E3C";
            } else {
              e.target.style.backgroundColor = "#309ce5";
            }
            e.target.style.color = "white";
          }, 0);
        });
      });
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

      if (active) {
        if (this.state.isClickOpened) {
          this._startInactivityTimer();
        }
      }
    }

    refresh() {
      this._cacheElements();
    }

    destroy() {
      const { toggle, content } = this.elements;

      toggle.removeEventListener("mouseenter", this.handleToggleMouseEnter);
      toggle.removeEventListener("mouseleave", this.handleToggleMouseLeave);
      toggle.removeEventListener("click", this.handleToggleClick);
      toggle.removeEventListener("keydown", this.handleToggleKeyDown);
      toggle.removeEventListener("blur", this.handleToggleBlur);

      content.removeEventListener("mouseenter", this.handleContentMouseEnter);
      content.removeEventListener("mouseleave", this.handleContentMouseLeave);
      content.removeEventListener("mousemove", this.handleContentMouseMove);
      content.removeEventListener("click", this.handleContentClick);
      content.removeEventListener("focusin", this.handleContentFocusIn);
      content.removeEventListener("focusout", this.handleContentFocusOut);

      document.removeEventListener("click", this.handleDocumentClick);
      document.removeEventListener("mousemove", this.handleDocumentMouseMove);
      document.removeEventListener("keydown", this.handleDocumentKeyDown);

      window.removeEventListener("resize", this.handleWindowResize);
      window.removeEventListener("scroll", this.handleWindowScroll);

      if (this.deadzoneElement && this.deadzoneElement.parentNode) {
        this.deadzoneElement.parentNode.removeChild(this.deadzoneElement);
      }

      if (this.subDeadzoneElement && this.subDeadzoneElement.parentNode) {
        this.subDeadzoneElement.parentNode.removeChild(this.subDeadzoneElement);
      }

      if (this.stickyCheckInterval) {
        clearInterval(this.stickyCheckInterval);
      }

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
        subDropdownOpen: this.elements.subContent
          ? this.elements.subContent.style.opacity === "1"
          : false,
        isSubKeyboardOpened: this.state.isSubKeyboardOpened,
        mousePosition: {
          x: this.state.mouseX,
          y: this.state.mouseY,
        },
        config: this.config,
      };
    }
  }

  let dropdownManager1;
  let dropdownManager2;
  let dropdownManager3;

  document.addEventListener("DOMContentLoaded", function () {
    dropdownManager1 = new DropdownManager({
      id: "dropdown-content",
      toggleSelector: ".dropdown-toggle",
      contentSelector: ".dropdown-content",
      subToggleSelector: ".sub-dropdown-toggle",
      subContentSelector: ".sub-dropdown-content",
    });

    dropdownManager2 = new DropdownManager({
      id: "dropdown-content-second",
      toggleSelector: ".dropdown-toggle-second",
      contentSelector: ".dropdown-content-second",
    });

    dropdownManager3 = new DropdownManager({
      id: "dropdown-content-third",
      toggleSelector: ".dropdown-toggle-third",
      contentSelector: ".dropdown-content-third",
      deadzoneMatchContent: true,
    });

    window.closeAllMenusExcept = function (exceptMenuId) {
      if (exceptMenuId !== "dropdown-content" && dropdownManager1) {
        dropdownManager1.close();
      }
      if (exceptMenuId !== "dropdown-content-second" && dropdownManager2) {
        dropdownManager2.close();
      }
      if (exceptMenuId !== "dropdown-content-third" && dropdownManager3) {
        dropdownManager3.close();
      }
    };

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
      if (dropdownManager1 && dropdownManager1.elements.subContent) {
        dropdownManager1.state.isClickOpenedSub = false;
        dropdownManager1._hideSubMenu();
      }
    };

    window.setSubmenuActive = function (active) {
      if (dropdownManager1) {
        dropdownManager1.setSubmenuActive(active);
      }
    };

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

    window.dropdownMenu = window.dropdownMenus.first;
  });

  if (typeof module !== "undefined" && module.exports) {
    module.exports = DropdownManager;
  }
  if (typeof window !== "undefined") {
    window.DropdownManager = DropdownManager;
  }
})();

/* (tento script používá formátování prettier) */