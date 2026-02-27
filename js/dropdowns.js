(function () {
  class DropdownManager {
    constructor(options = {}) {
      this.id = options.id || 'default-menu';

      this.config = {
        toggleSelector: options.toggleSelector || ".dropdown-toggle",
        contentSelector: options.contentSelector || ".dropdown-content",
        subToggleSelector: options.subToggleSelector || null,
        subContentSelector: options.subContentSelector || null,
        clickInactivityDelay: options.clickInactivityDelay || 2000,
        inactivityDelay: options.inactivityDelay || 2000,
        hoverHideDelay: options.hoverHideDelay || 200,
        transitionDuration: options.transitionDuration || 300,
        deadzoneMatchContent: options.deadzoneMatchContent || false,
      };

      this.config.storageKey = {
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
        mouseX: parseInt(localStorage.getItem(this.config.storageKeys.mouseX)) || 0,
        mouseY: parseInt(localStorage.getItem(this.config.storageKeys.mouseY)) || 0,
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
        wasStickyActuallyVisible: false,
      };

      this.deadzoneElement = null;
      this.subDeadzoneElement = null;
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
        this._setupMouseKeyboardTracking();

        this.isInitialized = true;
      } catch (error) {
        console.error(`DropdownManager [${this.id}] init failed:`, error);
      }
    }

    _setupStickyHeaderObserver() {
      const checkStickyHeader = () => {
        const stickyHeader = document.querySelector('.sticky-header');
        if (!stickyHeader) return;

        const hasVisible = stickyHeader.classList.contains('visible');
        const rect = stickyHeader.getBoundingClientRect();

        const isActuallyVisible = hasVisible && rect.top >= -10 && rect.top <= 10;

        if (isActuallyVisible && !this.state.wasStickyActuallyVisible && this.isOpen()) {
          this._closeForStickyHeader();
        }

        this.state.wasStickyActuallyVisible = isActuallyVisible;
      };

      this.stickyCheckInterval = setInterval(checkStickyHeader, 100);
    }

    _setupMouseKeyboardTracking() {
      if (document.body.dataset.mouseKeyboardTracking) return;
      document.body.dataset.mouseKeyboardTracking = 'true';

      document.addEventListener('mousedown', () => {
        document.body.classList.add('using-mouse');
      });

      document.addEventListener('keydown', () => {
        document.body.classList.remove('using-mouse');
      });
    }

    _closeForStickyHeader() {
      this._clearAllTimers();
      this.state.isClosingInProgress = true;
      this.elements.toggle.classList.remove('is-open');

      const originalTransition = this.elements.content.style.transition;
      const originalSubTransition = this.elements.subContent ? this.elements.subContent.style.transition : '';

      this.elements.content.style.transition = 'opacity 0.1s ease-out, visibility 0.1s ease-out';

      if (this.elements.subContent) {
        this.elements.subContent.style.transition = 'opacity 0.1s ease-out, visibility 0.1s ease-out';
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
        subToggle: subToggleSelector ? document.querySelector(subToggleSelector) : null,
        subContent: subContentSelector ? document.querySelector(subContentSelector) : null,
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

    // === NAVIGACE ŠIPKAMI === //
    _onDocumentKeyDown(e) {
      if (!this.isOpen()) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        this._hideMenu();
        this.state.isClickOpened = false;
        this.state.isKeyboardOpened = false;
        return;
      }

      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault();

        this._updateFocusableElements();

        if (this.state.focusableElements.length === 0) return;

        if (e.key === 'ArrowDown') {
          this .state.currentFocusIndex++;
          if (this.state.currentFocusIndex >= this.state.focusableElements.length) {
            this.state.currentFocusIndex = 0;
          }
        } else if (e.key === 'ArrowUp') {
          this.state.currentFocusIndex--;
          if (this.state.currentFocusIndex < 0) {
            this.state.currentFocusIndex = this.state.focusableElements.length - 1;
          }
        }

        const currentElement = this.state.focusableElements[this.state.currentFocusIndex];

        if (!currentElement) return;
        if (this.elements.subToggle && currentElement === this.elements.subToggle) {

          this._clearTimer("subHide");
          this._clearTimer("subAnimation");
          this.state.isClosingInProgressSub = false;
          this.state.isClickOpenedSub = true;
          localStorage.setItem(this.config.storageKeys.isSubMenuOpen, "true");
        }
      }
    }
  }
})