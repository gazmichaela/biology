/**
 * NavigationManager - Systém pro správu navigace
 * 
 * Automaticky spravuje aktivní stavy navigačních prvků s podporou
 responzivního designu a párování URL s odkazy.
 * 
 * Klíčové funkce:
 * • Automatická detekce aktivní stránky podle URL
 * • Responzivní přepínání mezi desktop/mobilní navigací
 * • Optimalizované resize handling s debouncing
 * • Flexibilní konfigurace a lifecycle management
 * • Podpora dropdown struktur a přístupnosti
 * 
 * @author Michaela Gažová
 * @version 2.1.0
 * @license MIT
 */


 
class NavigationManager {
    // Výchozí konfigurace a inicializace
    constructor(options = {}) {
        this.config = {
            mobileBreakpoint: options.mobileBreakpoint || 1175,
            debounceDelay: options.debounceDelay || 150,
            enableLogging: options.enableLogging || false,
            activeClass: options.activeClass || 'active',
            ...options
        };

        this.selectors = {
            mainButtons: '.main-button, .main-button-second',
            dropdownLinks: '.dropdown-content a, .dropdown-content-second a, .sub-dropdown-content a',
            mobileButtons: '.mobile-nav-button',
            ...options.selectors
        };

        this.elements = {};
        this.resizeTimeout = null;
        this.isInitialized = false;

        this.handleResize = this.debounce(this.handleResize.bind(this), this.config.debounceDelay);
        this.handlePopState = this.setActiveFromURL.bind(this);
        this.handleClick = this.handleNavigationClick.bind(this);

        this.init();
    }

    init() {
        try {
            this.cacheElements();
            this.validateElements();
            this.bindEvents();
            this.setActiveFromURL();
            this.isInitialized = true;
            this.log('Navigation system initialized successfully');
        } catch (error) {
            console.error('Navigation system initialization failed:', error);
        }
    }

    cacheElements() {
        this.elements = {
            mainButtons: this.querySelectorAllSafe(this.selectors.mainButtons),
            dropdownLinks: this.querySelectorAllSafe(this.selectors.dropdownLinks),
            mobileButtons: this.querySelectorAllSafe(this.selectors.mobileButtons)
        };

        this.elements.desktopItems = [...this.elements.mainButtons, ...this.elements.dropdownLinks];
        this.elements.allItems = [...this.elements.desktopItems, ...this.elements.mobileButtons];
    }

    querySelectorAllSafe(selector) {
        try {
            return Array.from(document.querySelectorAll(selector));
        } catch (error) {
            this.log(`Invalid selector: ${selector}`, 'warn');
            return [];
        }
    }

    // Kontrola existence navigačních prvků
    validateElements() {
        const totalElements = this.elements.allItems.length;
        
        if (totalElements === 0) {
            throw new Error('No navigation elements found. Check your selectors.');
        }

        this.log(`Found ${totalElements} navigation elements`);
        
        if (this.elements.mobileButtons.length === 0) {
            this.log('No mobile navigation buttons found', 'warn');
        }
        
        if (this.elements.desktopItems.length === 0) {
            this.log('No desktop navigation items found', 'warn');
        }
    }

    isMobileView() {
        return window.matchMedia(`(max-width: ${this.config.mobileBreakpoint}px)`).matches;
    }

    // Označení tlačítka jako aktivní
    setActiveButton(clickedButton) {
        if (!clickedButton || !this.isInitialized) return;

        const isMobile = this.isMobileView();
        
        try {
            if (isMobile) {
                this.resetActiveStates(this.elements.mobileButtons);
                if (this.isMobileButton(clickedButton)) {
                    this.setActiveState(clickedButton, true);
                }
            } else {
                this.resetActiveStates(this.elements.desktopItems);
                if (!this.isMobileButton(clickedButton)) {
                    this.setActiveState(clickedButton, true);
                }
            }

            this.log(`Active button set: ${this.getButtonIdentifier(clickedButton)}`);
        } catch (error) {
            console.error('Error setting active button:', error);
        }
    }

    resetActiveStates(elements) {
        elements.forEach(element => {
            if (element) {
                this.setActiveState(element, false);
            }
        });
    }

    setActiveState(element, isActive) {
        if (!element) return;

        if (isActive) {
            element.classList.add(this.config.activeClass);
            element.setAttribute('aria-current', 'page');
        } else {
            element.classList.remove(this.config.activeClass);
            element.removeAttribute('aria-current');
        }
    }

    isMobileButton(button) {
        return button && button.classList.contains('mobile-nav-button');
    }

    getButtonIdentifier(button) {
        return button?.getAttribute('href') || button?.textContent?.trim() || 'unknown';
    }

    // Označení aktivního odkazu podle URL
    setActiveFromURL() {
        if (!this.isInitialized) return;

        const currentPage = this.getCurrentPage();
        const isMobile = this.isMobileView();
        
        try {
            this.resetActiveStates(this.elements.allItems);

            const menuToCheck = isMobile ? this.elements.mobileButtons : this.elements.desktopItems;
            const activeLink = this.findMatchingLink(menuToCheck, currentPage);

            if (activeLink) {
                this.setActiveState(activeLink, true);
                this.log(`Active link set from URL: ${this.getButtonIdentifier(activeLink)}`);
            } else {
                this.log(`No matching link found for page: ${currentPage}`, 'warn');
            }
        } catch (error) {
            console.error('Error setting active state from URL:', error);
        }
    }

    getCurrentPage() {
        const path = window.location.pathname;
        return path.split('/').pop() || 'index.html';
    }

    // Vyhledání odpovídajícího odkazu
    findMatchingLink(links, currentPage) {
        if (this.isHomePage(currentPage)) {
            const homeLink = links.find(link => this.isHomeLink(link));
            if (homeLink) return homeLink;
        }

        let exactMatch = links.find(link => {
            const href = link.getAttribute('href') || '';
            const linkPage = href.split('/').pop();
            return linkPage === currentPage;
        });

        if (exactMatch) return exactMatch;

        const currentPageNoExt = currentPage.replace('.html', '');
        return links.find(link => {
            const href = link.getAttribute('href') || '';
            const linkPage = href.split('/').pop();
            const linkPageNoExt = linkPage.replace('.html', '');
            return linkPageNoExt === currentPageNoExt;
        });
    }

    isHomePage(page) {
        return page === 'index.html' || page === '' || page === '/';
    }

    isHomeLink(link) {
        const href = link.getAttribute('href') || '';
        const page = href.split('/').pop();
        return page === 'index.html' || href === '/' || href === './' || href === '';
    }

    handleNavigationClick(event) {
        const clickedElement = event.currentTarget;
        this.setActiveButton(clickedElement);
    }


    handleResize() {
        this.setActiveFromURL();
        this.log('Navigation recalculated after resize');
    }

    bindEvents() {
        // Event listenery pro navigaci a resize 
        this.elements.allItems.forEach(element => {
            element.addEventListener('click', this.handleClick);
        });

        window.addEventListener('DOMContentLoaded', this.handlePopState);
        window.addEventListener('popstate', this.handlePopState);
        window.addEventListener('resize', this.handleResize);

        this.log('Event listeners bound successfully');
    }

    unbindEvents() {
        this.elements.allItems.forEach(element => {
            element.removeEventListener('click', this.handleClick);
        });

        window.removeEventListener('DOMContentLoaded', this.handlePopState);
        window.removeEventListener('popstate', this.handlePopState);
        window.removeEventListener('resize', this.handleResize);

        if (this.resizeTimeout) {
            clearTimeout(this.resizeTimeout);
        }
    }

    // Debounce pro optimalizaci resize
    debounce(func, wait) {
        return (...args) => {
            clearTimeout(this.resizeTimeout);
            this.resizeTimeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    setActiveBySelector(selector) {
        try {
            const element = document.querySelector(selector);
            if (element) {
                this.setActiveButton(element);
                return true;
            } else {
                this.log(`Element not found for selector: ${selector}`, 'warn');
                return false;
            }
        } catch (error) {
            console.error('Error setting active by selector:', error);
            return false;
        }
    }

    refresh() {
        this.cacheElements();
        this.validateElements();
        this.unbindEvents();
        this.bindEvents();
        this.setActiveFromURL();
        this.log('Navigation system refreshed');
    }

    destroy() {
        this.unbindEvents();
        this.elements = {};
        this.isInitialized = false;
        this.log('Navigation system destroyed');
    }

    log(message, level = 'info') {
        if (!this.config.enableLogging) return;

        const logMethod = console[level] || console.log;
        logMethod(`[NavigationManager] ${message}`);
    }

    getState() {
        return {
            isInitialized: this.isInitialized,
            isMobile: this.isMobileView(),
            currentPage: this.getCurrentPage(),
            elementsCount: {
                mainButtons: this.elements.mainButtons?.length || 0,
                dropdownLinks: this.elements.dropdownLinks?.length || 0,
                mobileButtons: this.elements.mobileButtons?.length || 0,
                total: this.elements.allItems?.length || 0
            },
            config: this.config
        };
    }
}

let navigationManager;

document.addEventListener('DOMContentLoaded', () => {
    navigationManager = new NavigationManager({
        enableLogging: false 
    });

    window.setActiveBySelector = (selector) => {
        return navigationManager?.setActiveBySelector(selector) || false;
    };
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = NavigationManager;
}

if (typeof window !== 'undefined') {
    window.NavigationManager = NavigationManager;
}