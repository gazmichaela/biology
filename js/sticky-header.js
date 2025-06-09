//---------STICKY HEADER FUNCTIONALITY-------------//
// Globální sledování timeoutů pro každý dropdown
window.dropdownTimeouts = window.dropdownTimeouts || {};
// Globální sledování auto-hide timeoutů
window.autoHideTimeouts = window.autoHideTimeouts || {};

document.addEventListener('DOMContentLoaded', function() {
    // 1. Add CSS styles for sticky header
    insertStickyHeaderStyles();
    
    // 2. Create and insert the sticky header into DOM
    createStickyHeader();
    
    // 3. Initialize sticky header behavior and dropdowns
    initStickyHeaderFunctionality();
    
});

// Insert required CSS styles for the sticky header
function insertStickyHeaderStyles() {
    const styleTag = document.createElement('style');
    styleTag.textContent = `
.sticky-header {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    background-color: #77afe0ee;
    text-align: center;
    color: white;
    z-index: 999;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    transition: transform 0.3s ease;
    transform: translateY(-100%);
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 9px 0;
}

.sticky-header.visible {
    transform: translateY(0);
}

.sticky-header h1 {
    font-size: 30px;
    margin: 1px 0 8px 0;
    transition: all 0.3s ease;
}

.sticky-header ul {
    list-style: none;
    padding: 0;
    margin: 1px 0 0 0;
    display: flex;
    justify-content: center;
    position: relative;
}

.sticky-header ul li {
    display: inline;
    margin: 0 15px;
    color: #023f1e;
    text-decoration: none;
    font-size: 18px;
    text-align: center;
    position: relative;
}

.sticky-header .button-container {
    display: flex;
    align-items: center;
     margin: 0 1.43vmax;

    white-space: nowrap;
    margin-top: 1px;
}

.sticky-header .dropdown {
    position: relative;
    display: inline-block;
    margin: 0;
}

.sticky-header .main-button,
.sticky-header .maine-button {
    background-color: #f0f9f0;
    color: #025227;
    font-weight: bold;
    text-decoration: none;
    border-radius: 20px 0 0 20px;
    font-size: 16px;
    border: none;
    cursor: pointer;
    transition: background-color 0.3s ease, color 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 12px 20px;
    height: 18.5px;
}

.sticky-header .maine-button {
    border-radius: 20px;
}
.sticky-mobile-nav {
    /* Zkopíruj všechny styly z původní mobilní navigace */
    /* a přidej specifické styly pro sticky verzi */
}

.sticky-menu-overlay {
    /* Zkopíruj všechny styly z původního overlay */
}

/* Zajisti, že sticky mobilní nav má správný z-index */
.sticky-mobile-nav.active {
    z-index: 10000;
}

.sticky-menu-overlay.active {
    z-index: 9999;
}
.sticky-header .dropdown-toggle,
.sticky-header .dropdown-toggle-second {
    background-color: #f0f9f0;
    color: #025227;
    font-weight: bold;
    text-decoration: none;
    border-radius: 0 20px 20px 0;
    font-size: 16px;
    border: none;
    cursor: pointer;
    transition: background-color 0.3s ease, color 0.3s ease;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 12px 10px;
    height: 42px;
    width: 40px;
    margin-left: 2px;
}

/* Active state for clicked dropdown toggle */
.sticky-header .dropdown-toggle.clicked,
.sticky-header .dropdown-toggle-second.clicked {
    background-color: #309ce5;
    color: white;
}

.sticky-header .dropdown-toggle.clicked .arrow,
.sticky-header .dropdown-toggle-second.clicked .arrow {
    color: white;
}

.sticky-header .arrow {
    font-size: 18px;
    color: #025227;
}

.sticky-header .main-button:hover,
.sticky-header .maine-button:hover,
.sticky-header .dropdown-toggle:hover,
.sticky-header .dropdown-toggle-second:hover {
    background-color: #309ce5;
    color: white;
}

.sticky-header .dropdown-toggle:hover .arrow,
.sticky-header .dropdown-toggle-second:hover .arrow {
    color: white;
}

.sticky-header .dropdown-content,
.sticky-header .dropdown-content-second {
    position: absolute;
    background-color: #f0f9f0;
    box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.2);
    border-radius: 5px;
    padding: 5px;
    z-index: 1000;
    width: 150px;
    margin-top: 3px;
    font-size: medium;
    opacity: 0;
    visibility: hidden;
    display: none;
    transition: opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1), visibility  0.5s;
    left: 50%;
    transform: translateX(-3%);
}

.sticky-header .dropdown-content-second {
    transform: translateX(-20%);
}

.sticky-header .dropdown-content.show,
.sticky-header .dropdown-content-second.show {
    opacity: 1;
    visibility: visible;
    display: block;
    transition: opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1), visibility 0.5s;
}

.sticky-header .dropdown-content a,
.sticky-header .dropdown-content-second a {
    padding: 10px;
    color: #025227;
    text-decoration: none;
    font-weight: bold;
    display: block;
}

.sticky-header .dropdown-content a:hover,
.sticky-header .dropdown-content-second a:hover {
    background-color: #309ce5;
    color: white;
}

.sticky-header .dropdown-content a.centered {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    width: 100%;
    color: #025227;
    text-decoration: none;
    padding-left: 53px;
}

.sticky-header .dropdown-content a.centered:hover {
    cursor: pointer;
    background-color: #309ce5;
    color: white;
}

.sticky-header .sub-dropdown-toggle {
    margin-left: 5px;
    font-size: 16px;
    cursor: pointer;
    color: #025227;
    position: relative;
}

.sticky-header .sub-dropdown-toggle::before {
    content: '';
    position: absolute;
    top: -14px;
    right: -16px;
    bottom: -9.5px;
    left: -4.8px;
    z-index: 1;
    border-top-right-radius: 5px; 
}

.sticky-header .sub-dropdown-content {
    position: absolute;
    left: 100%;
    top: 1px;
    background-color: #f0f9f0;
    box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.2);
    border-radius: 5px;
    padding: 5px;
    min-width: 150px;
    margin-left: 4.5%;
    opacity: 0;
    visibility: hidden;
    display: none;
    transition: opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1), visibility 0s 0.5s;
    z-index: 1000;
}

.sticky-header .sub-dropdown-content.show {
    opacity: 1;
    visibility: visible;
    display: block;
    transition: opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1), visibility 0s;
}

.sticky-header .sub-dropdown-content a {
    padding: 10px;
    color: #025227;
    text-decoration: none;
    font-weight: bold;
    display: block;
}

.sticky-header .sub-dropdown-content a:hover {
    background-color: #309ce5;
    color: white;
}

.sticky-header .main-button.active,
.sticky-header .maine-button.active,
.sticky-header .dropdown-content a.active,
.sticky-header .dropdown-content-second a.active {
    background-color: #1c77e8;
    color: white;
}

/* Dead zone for dropdown hover */
.sticky-header-dead-zone, 
.sub-dropdown-dead-zone {
    position: absolute;
    z-index: 999;
    background-color: transparent;
    pointer-events: auto;
    /* Uncomment next line for debugging */
    /* background-color: rgba(255, 0, 0, 0.2); */
}

.sticky-header .home-icon {
    display: inline-block;
    position: relative;
    text-decoration: none;
    cursor: pointer;
    pointer-events: auto;
}

.sticky-header .home-icon img {
    width: 25px;
    height: auto;
    margin-left: 10px;
    margin-top: 9.3px;
    pointer-events: auto;
}

.sticky-header .home-icon:hover img {
    filter: brightness(0) saturate(100%) invert(38%) sepia(79%) saturate(2126%) hue-rotate(174deg) brightness(105%) contrast(91%);
}

@media screen and (max-width: 768px) {
    .sticky-header h1 {
        font-size: 24px;
        margin-top: 8px;
    }
    
    .sticky-header ul li {
        margin: 0 10px;
        font-size: 16px;
    }
}
/* Sticky header - zvětšení výšky */
/* Základní styly sticky headeru zůstávají nezměněné pro desktop */

/* BURGER MENU TLAČÍTKO - Sticky Header */
.sticky-header .burger-menu {
    display: none;
    flex-direction: column;
    cursor: pointer;
    position: absolute;
    top: 15px;  /* Stejné jako normální header */
    right: 20px; /* Stejné jako normální header */
    z-index: 1003;
    width: 17px;
    height: 17px;
    justify-content: space-between;
}

.sticky-header .burger-line {
    width: 100%;
    height: 3px;
    background-color: #025227;
    border-radius: 2px;
    transition: all 0.3s ease;
}

/* Animace pro otevření burger menu */
.sticky-header .burger-menu.open .burger-line:nth-child(1) {
    transform: rotate(45deg) translate(5px, 5px) !important;
}

.sticky-header .burger-menu.open .burger-line:nth-child(2) {
    opacity: 0 !important;
}

.sticky-header .burger-menu.open .burger-line:nth-child(3) {
    transform: rotate(-45deg) translate(5px, -5px) !important;
}

/* Responsivní zobrazení pro sticky header */
@media screen and (max-width: 1175px) { /* Použij stejný breakpoint jako v normálním headeru */
    .sticky-header .burger-menu {
        display: flex; /* Použij flex místo block pro konzistenci */
    }
    
    /* Skryj normální navigaci na mobilech */
    .sticky-header ul:not(.mobile-menu) {
        display: none;
    }
    
    .sticky-header .button-container {
        display: none;
    }
}

/* Mobile menu ve sticky headeru */
.sticky-header .mobile-menu {
    display: none;
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    width: 100vw; /* Celá šířka obrazovky */
    min-height: 300px; /* Minimální výška pro vyšší lištu */
    background-color: #77afe0ee;
    backdrop-filter: blur(10px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    z-index: 1000;
    /*padding: 20px 0;*/ /* Přidání paddingu pro větší výšku */
}

.sticky-header .mobile-menu.show {
    display: block;
}

.sticky-header .mobile-menu li {
    display: block;
    margin: 0;
    border-bottom: 1px solid rgba(255,255,255,0.1);
}

.sticky-header .mobile-menu a {
    display: block;
    padding: 20px 20px; /* Větší padding pro vyšší položky */
    color: white;
    text-decoration: none;
    font-size: 16px;
    transition: background-color 0.3s ease;
}

  /* Ještě větší výška pro malé telefony */
    .sticky-header {
       /* padding: 12px 0;*/
        min-height: 30px;
    }

.sticky-header .mobile-menu a:hover {
    background-color: rgba(255,255,255,0.1);
}

/* Pro menší telefony - stejné jako normální header */
@media screen and (max-width: 480px) {
    .sticky-header .burger-menu {
        right: 15px; /* Stejné jako normální header */
        top: 12px;   /* Stejné jako normální header */
    }
    
    .sticky-header .mobile-menu {
        width: 100vw; /* Celá šířka i na malých telefonech */
    }
    
    /* Ještě větší výška pro malé telefony */
    .sticky-header {
        padding: 15px 0;
        min-height: 10px;
    }
}

/* Skrytí mobilní navigace ve sticky headeru */
.sticky-header .menu-overlay,
.sticky-header .mobile-nav-container {
    display: none !important;
    visibility: hidden !important;
    opacity: 0 !important;
}

/* Zajištění, že mobilní navigační elementy neovlivní sticky header */
.sticky-header .mobile-nav-list,
.sticky-header .mobile-expandable,
.sticky-header .mobile-expand-header,
.sticky-header .mobile-expand-content,
.sticky-header .mobile-nav-button,
.sticky-header .mobile-sub-item,
.sticky-header .mobile-sub-expandable,
.sticky-header .mobile-sub-expand-header,
.sticky-header .mobile-sub-expand-content,
.sticky-header .mobile-sub-sub-item,
.sticky-header .mobile-home-icon,
.sticky-header .mobile-menu-close-button {
    display: none !important;
    visibility: hidden !important;
}

/* Zajištění, že burger menu ve sticky headeru funguje správně */
@media screen and (max-width: 1175px) {
    .sticky-header .burger-menu {
        display: flex !important;
    }
    
    /* Sticky header má vlastní mobilní menu systém, takže skryjeme novou mobilní navigaci */
    .sticky-header .menu-overlay,
    .sticky-header .mobile-nav-container {
        display: none !important;
    }
}
`;
    document.head.appendChild(styleTag);
}
function clearAllDropdownStates() {
    // Vyčistíme localStorage
    Object.keys(localStorage).forEach(key => {
        if (key.startsWith('sticky_menu_') && key.endsWith('_open')) {
            localStorage.removeItem(key);
        }
        if (key.startsWith('sticky_submenu_') && key.endsWith('_open')) {
            localStorage.removeItem(key);
            
        }
    });
    
    
    // Vyčistíme všechny timeouty
    if (window.dropdownTimeouts) {
        Object.values(window.dropdownTimeouts).forEach(timeout => {
            clearTimeout(timeout);
        });
        window.dropdownTimeouts = {};
    }
    
    if (window.autoHideTimeouts) {
        Object.values(window.autoHideTimeouts).forEach(timeout => {
            clearTimeout(timeout);
        });
        window.autoHideTimeouts = {};
    }
    
    // PŘIDEJ TUTO ČÁST - fyzicky zavřeme všechny dropdowny
    const stickyHeader = document.querySelector('.sticky-header');
    if (stickyHeader) {
        // Zavřeme hlavní dropdowny
        const dropdownContents = stickyHeader.querySelectorAll('.dropdown-content, .dropdown-content-second');
        dropdownContents.forEach(content => {
            content.style.opacity = '0';
            content.style.visibility = 'hidden';
            content.style.display = 'none';
        });
        
        // Zavřeme sub-dropdowny
        const subDropdownContents = stickyHeader.querySelectorAll('.sub-dropdown-content');
        subDropdownContents.forEach(content => {
            content.style.opacity = '0';
            content.style.visibility = 'hidden';
            content.style.display = 'none';
        });
        
        // Zavřeme dead zones
        const deadZones = document.querySelectorAll('.sticky-header-dead-zone, .sub-dropdown-dead-zone');
        deadZones.forEach(zone => {
            zone.style.display = 'none';
        });
        
        // Odebereme aktivní třídy
        const activeToggles = stickyHeader.querySelectorAll('.dropdown-toggle.clicked, .dropdown-toggle-second.clicked');
        activeToggles.forEach(toggle => {
            toggle.classList.remove('clicked');
        });
        // Reset stavových proměnných
if (window.stickyDropdownStates) {
    Object.keys(window.stickyDropdownStates).forEach(key => {
        window.stickyDropdownStates[key].isClickOpened = false;
        window.stickyDropdownStates[key].isSubmenuActive = false;
        window.stickyDropdownStates[key].isClosingInProgress = false;
    });
}
// Reset lokálních stavů v každém dropdown
for (let i = 0; i < 10; i++) {
    if (window[`resetStickyDropdownState_${i}`]) {
        window[`resetStickyDropdownState_${i}`]();
    }
}
    }
}
// Upravená funkce createStickyHeader pro kopírování burger menu
function createStickyHeader() {
    const stickyHeader = document.createElement('div');
    stickyHeader.className = 'sticky-header';
    stickyHeader.id = 'sticky-header';
    
    const originalHeader = document.querySelector('header');
    
    if (!originalHeader) {
        console.error('Original header not found. Cannot create sticky header.');
        return;
    }
    
    // Clone the entire header content to preserve structure and classes
    const headerContent = originalHeader.cloneNode(true);
    
   // Zkopírujeme mobilní navigaci pro sticky header
const mobileNav = headerContent.querySelector('#mobileNav');
const menuOverlay = headerContent.querySelector('#menuOverlay');

if (mobileNav) {
    // Vytvoříme klon mobilní navigace pro sticky header
    const stickyMobileNav = mobileNav.cloneNode(true);
    stickyMobileNav.setAttribute('id', 'sticky-mobileNav');
    stickyMobileNav.classList.add('sticky-mobile-nav');
    document.body.appendChild(stickyMobileNav);
}

if (menuOverlay) {
    // Vytvoříme klon overlay pro sticky header
    const stickyMenuOverlay = menuOverlay.cloneNode(true);
    stickyMenuOverlay.setAttribute('id', 'sticky-menuOverlay');
    stickyMenuOverlay.classList.add('sticky-menu-overlay');
    document.body.appendChild(stickyMenuOverlay);
}

// Nyní odstraníme původní mobilní elementy z headerContent
const mobileElements = headerContent.querySelectorAll('.menu-overlay, .mobile-nav-container, #menuOverlay, #mobileNav');
mobileElements.forEach(element => element.remove());
    // Zkopíruj také CSS třídy a styly z původního headeru
    const originalStyles = window.getComputedStyle(originalHeader);
    stickyHeader.style.overflowX = originalStyles.overflowX;
    stickyHeader.style.overflowY = originalStyles.overflowY;
    
    // Remove any ID attributes from the cloned elements to avoid duplicates
    const elementsWithId = headerContent.querySelectorAll('[id]');
    elementsWithId.forEach(element => {
        const originalId = element.getAttribute('id');
        element.setAttribute('id', 'sticky-' + originalId);
    });
    
    // Add the sticky-clone class to all dropdown elements for later identification
    const dropdownElements = headerContent.querySelectorAll('.dropdown, .dropdown-toggle, .dropdown-content, .dropdown-content-second, .sub-dropdown-toggle, .sub-dropdown-content');
    dropdownElements.forEach(element => {
        element.classList.add('sticky-clone');
    });
    
    // PŘIDÁNO: Kopírování burger menu
    const burgerMenu = headerContent.querySelector('.burger-menu');
    if (burgerMenu) {
        // Ujistíme se, že burger menu má správné ID pro sticky verzi 
        burgerMenu.setAttribute('id', 'sticky-burgerMenu');
        console.log('Burger menu copied to sticky header');
    }
    
    // Extract and append main navigation elements
    const navElement = headerContent.querySelector('nav');
    if (navElement) {
        stickyHeader.appendChild(navElement);
    } else {
        // If no nav element found, try to find ul or other navigation containers
        const ulElement = headerContent.querySelector('ul');
        if (ulElement) {
            stickyHeader.appendChild(ulElement);
        } else {
            // Fallback: copy button containers or other important elements
            const buttonContainers = headerContent.querySelectorAll('.button-container');
            if (buttonContainers.length > 0) {
                const navContainer = document.createElement('div');
                navContainer.className = 'sticky-nav-container';
                
                buttonContainers.forEach(container => {
                    navContainer.appendChild(container);
                });
                
                stickyHeader.appendChild(navContainer);
            } else {
                // UPRAVENO: Pokud nenajdeme button-container, zkusíme najít burger menu
                if (burgerMenu) {
                    stickyHeader.appendChild(burgerMenu);
                } else {
                    // Last resort: copy all visible links
                    const navList = document.createElement('ul');
                    
                    const links = headerContent.querySelectorAll('a');
                    links.forEach(link => {
                        if (link.offsetParent !== null) { // Only visible links
                            const li = document.createElement('li');
                            li.appendChild(link);
                            navList.appendChild(li);
                        }
                    });
                    
                    stickyHeader.appendChild(navList);
                }
            }
        }
    }
    
    // PŘIDÁNO: Pokud burger menu nebylo přidáno výše, přidej ho samostatně
    if (!stickyHeader.querySelector('.burger-menu') && burgerMenu) {
        stickyHeader.appendChild(burgerMenu);
    }
    
    // Append the sticky header to the body
    document.body.appendChild(stickyHeader);
    
    console.log('Sticky header created with burger menu and appropriate navigation structure');
}
// Initialize sticky header functionality
function initStickyHeaderFunctionality() {
    const stickyHeader = document.querySelector('.sticky-header');
    const mainHeader = document.querySelector('header');
    
    if (!stickyHeader || !mainHeader) {
        console.error('Sticky header or main header not found');
        return;
    }
    
    // Initialize home icon functionality
    initializeHomeIcon(stickyHeader);
    
    const mainHeaderHeight = mainHeader.offsetHeight;
    let lastScrollY = window.scrollY || document.documentElement.scrollTop;
    let ticking = false;
    
    // Handle scroll event
    function handleScroll() {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const scrollY = window.scrollY || document.documentElement.scrollTop;
                
                // If we're at the top or within original header area, hide sticky header immediately
              if (scrollY <= Math.max(mainHeaderHeight + 1.5, 10)) { // přidej malý buffer
    stickyHeader.classList.remove('visible');
    clearAllDropdownStates(); // Zavři všechny dropdowny
    stickyHeader.classList.remove('scrolled');
    
    // Plynulé zmizení místo okamžitého
    stickyHeader.style.transition = 'transform 0.2s ease-out, opacity 0.2s ease-out';
    stickyHeader.style.transform = 'translateY(-100%)';
    stickyHeader.style.opacity = '0';
}
                else {
                    // Restore normal transition behavior
                    stickyHeader.style.transition = '';
                    stickyHeader.style.transform = '';
                    stickyHeader.style.opacity = '1'; 
                    
                    // Show header when scrolling up
                    if (scrollY < lastScrollY) {
                        stickyHeader.classList.add('visible');
                        
                        // Add scrolled class for more compact look when further down
                        if (scrollY > mainHeaderHeight + 100) {
                            stickyHeader.classList.add('scrolled');
                        } else {
                            stickyHeader.classList.remove('scrolled');
                        }
                    } 
                    // Hide header when scrolling down
                    else if (scrollY > lastScrollY) {
                        stickyHeader.classList.remove('visible');
                         clearAllDropdownStates(); 
                    }
                }
                
                lastScrollY = scrollY;
                ticking = false;
            });
            
            ticking = true;
        }
    }
    
    window.addEventListener('scroll', handleScroll);
    
// Initial check to set correct state on page load
(function initialCheck() {
    const scrollY = window.scrollY || document.documentElement.scrollTop;
    
    if (scrollY > mainHeaderHeight) {
        // VYNUTÍME zobrazení sticky headeru při každém refreshu
        setTimeout(() => {
            stickyHeader.style.transition = '';
            stickyHeader.style.transform = 'translateY(0)';
            stickyHeader.style.opacity = '1';
            stickyHeader.style.visibility = 'visible';
            stickyHeader.classList.add('visible');
            
            if (scrollY > mainHeaderHeight + 100) {
                stickyHeader.classList.add('scrolled');
            }
            
            console.log('Sticky header forcibly shown on page load at scroll position:', scrollY);
        }, 50); // Malé zpoždění zajistí, že se aplikuje po načtení
    }
})();
        // Initialize dropdown functionality for the sticky header
    initializeStickyDropdowns();
    // Debounce funkce pro rychlé přepínání
let themeChangeTimeout;

const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
        if (mutation.type === 'attributes' && 
            (mutation.attributeName === 'class' || mutation.attributeName === 'data-theme')) {
            
            // Zrušíme předchozí timeout pokud existuje
            if (themeChangeTimeout) {
                clearTimeout(themeChangeTimeout);
            }
            
            // Zachováme aktuální stav
            const currentScrollY = window.scrollY || document.documentElement.scrollTop;
            const wasVisible = stickyHeader.classList.contains('visible');
            
            if (wasVisible && currentScrollY > 50) {
                themeChangeTimeout = setTimeout(() => {
                    if (stickyHeader && (window.scrollY || document.documentElement.scrollTop) > 50) {
                        stickyHeader.classList.add('visible');
                        stickyHeader.style.opacity = '1';
                        stickyHeader.style.transform = 'translateY(0)';
                    }
                }, 0);
            }
        }
    });
});

observer.observe(document.body, { attributes: true, subtree: false });
observer.observe(document.documentElement, { attributes: true, subtree: false });
    console.log('Sticky header functionality initialized');
}

// Initialize home icon functionality
function initializeHomeIcon(stickyHeader) {
    const homeIcons = stickyHeader.querySelectorAll('.home-icon');
    
    homeIcons.forEach(homeIcon => {
        if (!homeIcon.hasAttribute('href')) {
            homeIcon.setAttribute('href', '/');
        }
        
        homeIcon.style.cursor = 'pointer';
        
        homeIcon.addEventListener('click', function(e) {
            // Clear dropdown states before navigation
            clearAllDropdownStates();
            window.location.href = homeIcon.getAttribute('href') || '/';
        });
        
        console.log('Home icon initialized with click functionality');
    });
}
// UNIVERZÁLNÍ FUNKCE PRO APLIKOVÁNÍ DROPDOWN FUNKCÍ NA STICKY HEADER
// Stačí zavolat initializeStickyDropdowns() po vytvoření sticky headeru

function initializeStickyDropdowns() {
    const stickyHeader = document.querySelector('.sticky-header');
    if (!stickyHeader) {
        console.error('Sticky header not found');
        return;
    }
    
    console.log('Initializing sticky header dropdowns...');
    
    // Najdeme všechny dropdown elementy ve sticky headeru
    const stickyDropdowns = stickyHeader.querySelectorAll('.dropdown');
    
    stickyDropdowns.forEach((dropdown, index) => {
        const dropdownId = `sticky-dropdown-${index}`;
        
        // Najdeme komponenty dropdownu
        const toggle = dropdown.querySelector('.dropdown-toggle, .dropdown-toggle-second');
        const content = dropdown.querySelector('.dropdown-content, .dropdown-content-second');
        
        if (!toggle || !content) {
            console.warn(`Dropdown components not found for dropdown ${index}`);
            return;
        }
        
        // Aplikujeme všechny dropdown funkce z původního kódu
        initializeSingleDropdown(toggle, content, dropdownId, index);
        
        console.log(`Initialized sticky dropdown ${index}`);
    });
    
  function initializeSingleSubDropdown(subDropdownToggle, subDropdownContent, subDropdownId, index) {
    // Vytvoříme jedinečné identifikátory pro tento sub-dropdown
    const timeoutKey = `hideSubTimeout_${subDropdownId}`;
    const animationTimeoutKey = `animationSubTimeout_${subDropdownId}`;
    
    // Inicializujeme timeouty v globálním objektu
    if (!window.dropdownTimeouts) window.dropdownTimeouts = {};
    
    // Stav pro tento konkrétní sub-dropdown
    let isClickOpenedSub = false;
    let isMouseOverMenu = false;
    let isClosingInProgressSub = false;
    
   // Aplikujeme styling
subDropdownContent.style.transition = "opacity 0.3s ease-in-out, visibility 0.3s ease-in-out";
subDropdownContent.style.opacity = "0";
subDropdownContent.style.visibility = "hidden";
subDropdownContent.style.display = "none";
subDropdownContent.style.position = "absolute";

    // Vytvoříme dead zone pro tento sub-dropdown
    const subDeadZone = document.createElement("div");
    subDeadZone.className = `sub-dropdown-dead-zone sub-dead-zone-${index}`;
    subDeadZone.style.position = "absolute";
    subDeadZone.style.display = "none";
    subDeadZone.style.zIndex = "999";
    subDeadZone.style.backgroundColor = "transparent";
    document.body.appendChild(subDeadZone);
    
    // Funkce pro správu timeoutů
    function clearAllSubTimeouts() {
        clearTimeout(window.dropdownTimeouts[timeoutKey]);
        clearTimeout(window.dropdownTimeouts[animationTimeoutKey]);
    }
    
    // Funkce pro nastavení dead zone pozice
    function updateSubDeadZone() {
        if (subDropdownContent.style.display === "block") {
            const toggleRect = subDropdownToggle.getBoundingClientRect();
            const contentRect = subDropdownContent.getBoundingClientRect();
            
            subDeadZone.style.left = toggleRect.right + "px";
            subDeadZone.style.top = Math.min(toggleRect.top, contentRect.top) + "px";
            subDeadZone.style.width = (contentRect.left - toggleRect.right) + "px";
            subDeadZone.style.height = Math.max(toggleRect.height, contentRect.height) + "px";
            subDeadZone.style.display = "block";
        }
    }
    
function showSubMenu() {
    clearAllSubTimeouts();
    isClosingInProgressSub = false;
    
    // Nastavíme display na block, ale ponecháme opacity na 0
    subDropdownContent.style.display = "block";
    subDropdownContent.style.visibility = "visible";
    subDropdownContent.style.opacity = "0";
    
    // Počkáme jeden frame, aby se display:block aplikoval
    requestAnimationFrame(() => {
        // Teprve nyní spustíme animaci opacity
        requestAnimationFrame(() => {
            subDropdownContent.style.opacity = "1";
            updateSubDeadZone();
        });
    });
    
    if (isClickOpenedSub) {
        localStorage.setItem(`sticky_submenu_${index}_open`, 'true');
    }
}
    function hideSubMenu() {
        clearAllSubTimeouts();
        isClosingInProgressSub = true;
        
        subDropdownContent.style.opacity = "0";
        subDropdownContent.style.visibility = "hidden";
        
        window.dropdownTimeouts[animationTimeoutKey] = setTimeout(() => {
            // Zkontrolujeme, jestli mezitím nedošlo k přerušení
            if (isClosingInProgressSub) {
                subDropdownContent.style.display = "none";
                subDeadZone.style.display = "none";
                
                isClickOpenedSub = false;
                isClosingInProgressSub = false;
                localStorage.removeItem(`sticky_submenu_${index}_open`);
            }
        }, 300);
    }

    // Event listeners
    subDropdownToggle.addEventListener("mouseenter", function(e) {
        e.stopPropagation();
        isMouseOverMenu = true;
        if (!isClickOpenedSub) {
            showSubMenu();
        }
    });
    
    subDropdownToggle.addEventListener("mouseleave", function(e) {
        isMouseOverMenu = false;
        const toElement = e.relatedTarget;
        if (toElement !== subDropdownContent && !subDropdownContent.contains(toElement) &&
            toElement !== subDeadZone) {
            window.dropdownTimeouts[timeoutKey] = setTimeout(() => {
                if (!isClickOpenedSub) {
                    hideSubMenu();
                }
            }, 200);
        }
    });
    
    subDropdownToggle.addEventListener("click", function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        clearAllSubTimeouts();
        
        if (subDropdownContent.style.opacity === "1" && isClickOpenedSub) {
            hideSubMenu();
        } else {
            isClickOpenedSub = true;
            showSubMenu();
        }
    });
    
    subDropdownContent.addEventListener("mouseenter", function() {
    isMouseOverMenu = true;
    clearAllSubTimeouts();
    
    // Pokud je menu skryté nebo v procesu mizení, znovu ho zobrazíme s plynulou animací
    if (isClosingInProgressSub || subDropdownContent.style.opacity !== "1") {
        showSubMenu(); // Použijeme stejnou funkci pro konzistentní animaci
    }
});
    
    subDropdownContent.addEventListener("mouseleave", function(e) {
        isMouseOverMenu = false;
        const toElement = e.relatedTarget;
        if (toElement !== subDropdownToggle && toElement !== subDeadZone) {
            window.dropdownTimeouts[timeoutKey] = setTimeout(() => {
                if (!isClickOpenedSub) {
                    hideSubMenu();
                }
            }, 200);
        }
    });
    
  subDeadZone.addEventListener("mouseenter", function() {
    isMouseOverMenu = true;
    clearAllSubTimeouts();
    
    // Pokud je menu skryté nebo v procesu mizení, znovu ho zobrazíme s plynulou animací
    if (isClosingInProgressSub || subDropdownContent.style.opacity !== "1") {
        showSubMenu(); // Použijeme stejnou funkci pro konzistentní animaci
    }
});
    
    subDeadZone.addEventListener("mouseleave", function(e) {
        isMouseOverMenu = false;
        const toElement = e.relatedTarget;
        if (toElement !== subDropdownToggle && toElement !== subDropdownContent && 
            !subDropdownContent.contains(toElement)) {
            window.dropdownTimeouts[timeoutKey] = setTimeout(() => {
                if (!isClickOpenedSub) {
                    hideSubMenu();
                }
            }, 200);
        }
    });
    
    // Zavření při kliknutí mimo
    document.addEventListener("click", function(event) {
        if (!subDropdownToggle.contains(event.target) && 
            !subDropdownContent.contains(event.target) &&
            event.target !== subDeadZone) {
            hideSubMenu();
        }
    });
    
    // Export funkcí pro tento sub-dropdown
    window[`closeStickySubDropdown_${index}`] = function() {
        hideSubMenu();
    };
    
    // Obnovení stavu po refreshu
    if (localStorage.getItem(`sticky_submenu_${index}_open`) === 'true') {
        isClickOpenedSub = true;
        setTimeout(() => {
            showSubMenu();
        }, 100);
    }
}
    initializeStickySubDropdowns(stickyHeader);
}

function initializeSingleDropdown(dropdownToggle, dropdownContent, dropdownId, index) {
    // Vytvoříme jedinečné identifikátory pro tento dropdown
    // Globální stav pro tento dropdown
if (!window.stickyDropdownStates) window.stickyDropdownStates = {};
const stateKey = `dropdown_${index}`;
window.stickyDropdownStates[stateKey] = {
    isClickOpened: false,
    isSubmenuActive: false,
    isClosingInProgress: false
};
    const timeoutKey = `hideTimeout_${dropdownId}`;
    const animationTimeoutKey = `animationTimeout_${dropdownId}`;
    const inactivityTimeoutKey = `inactivityTimeout_${dropdownId}`;
    const clickInactivityTimeoutKey = `clickInactivityTimeout_${dropdownId}`;
    
    // Inicializujeme timeouty v globálním objektu
    if (!window.dropdownTimeouts) window.dropdownTimeouts = {};
    if (!window.autoHideTimeouts) window.autoHideTimeouts = {};
    
    // Stav pro tento konkrétní dropdown
    let isClickOpened = false;
    let isSubmenuActive = false;
    let isClosingInProgress = false;
    let repositionTimeoutSticky;
    let mouseX = 0, mouseY = 0;
    
    const inactivityDelay = 2000;
    const clickInactivityDelay = 2000;
    
    // Aplikujeme styling
    dropdownContent.style.transition = "opacity 0.3s ease-in-out, visibility 0.3s ease-in-out";
    dropdownContent.style.opacity = "0";
    dropdownContent.style.visibility = "hidden";
    dropdownContent.style.display = "none";
    
    // Vytvoříme dead zone pro tento dropdown
    const deadZoneElement = document.createElement("div");
    deadZoneElement.className = `sticky-header-dead-zone sticky-dead-zone-${index}`;
    deadZoneElement.style.position = "absolute";
    deadZoneElement.style.display = "none";
    deadZoneElement.style.zIndex = "1050";
    deadZoneElement.style.backgroundColor = "transparent";
    deadZoneElement.style.pointerEvents = "auto";
    document.body.appendChild(deadZoneElement);
    
    // Funkce pro správu timeoutů
    function clearAllTimeouts() {
        clearTimeout(window.dropdownTimeouts[timeoutKey]);
        clearTimeout(window.dropdownTimeouts[animationTimeoutKey]);
        clearTimeout(window.autoHideTimeouts[inactivityTimeoutKey]);
        clearTimeout(window.autoHideTimeouts[clickInactivityTimeoutKey]);
    }
    function startStickyPositionMonitoring() {
    function updatePositions() {
        if (dropdownContent.style.display === "block") {
            updateDeadZonePosition();
            repositionTimeoutSticky = setTimeout(updatePositions, 100);
        }
    }
    clearTimeout(repositionTimeoutSticky);
    updatePositions();
}
function updateDeadZonePosition() {
    if (dropdownContent.style.display === "block") {
        const toggleRect = dropdownToggle.getBoundingClientRect();
        const contentRect = dropdownContent.getBoundingClientRect();
        
     deadZoneElement.style.left = toggleRect.left + "px";
deadZoneElement.style.top = toggleRect.bottom + "px";
deadZoneElement.style.width = toggleRect.width + "px";
deadZoneElement.style.height = Math.max(5, contentRect.top - toggleRect.bottom) + "px";
        deadZoneElement.style.display = "block";
        deadZoneElement.style.pointerEvents = "auto";
        deadZoneElement.style.zIndex = "999";
    }
}
    // Funkce pro zobrazení menu
    function showMenu() {
    clearAllTimeouts();
    isClosingInProgress = false;
    
  dropdownContent.style.display = "block";

requestAnimationFrame(() => {
    dropdownContent.style.opacity = "1";
    dropdownContent.style.visibility = "visible";
    updateDeadZonePosition(); 
    startStickyPositionMonitoring();
    // Jen jeden volání až po zobrazení
        });
        
        if (isClickOpened) {
            startInactivityTimer();
            localStorage.setItem(`sticky_menu_${index}_open`, 'true');
        }
    }
    
    // Funkce pro skrytí menu
    function hideMenu() {
        clearAllTimeouts();
        clearTimeout(repositionTimeoutSticky);
        isClosingInProgress = true;
        
        dropdownContent.style.opacity = "0";
        dropdownContent.style.visibility = "hidden";
        
        // Odebereme aktivní stav z toggle
       
        
        window.dropdownTimeouts[animationTimeoutKey] = setTimeout(() => {
            dropdownContent.style.display = "none";
            deadZoneElement.style.display = "none";
            
            isClickOpened = false;
            isSubmenuActive = false;
            isClosingInProgress = false;
            localStorage.removeItem(`sticky_menu_${index}_open`);
        }, 300);
    }
    
    // Funkce pro časovač nečinnosti
    function startInactivityTimer() {
        clearTimeout(window.autoHideTimeouts[inactivityTimeoutKey]);
        window.autoHideTimeouts[inactivityTimeoutKey] = setTimeout(() => {
            const menuRect = dropdownContent.getBoundingClientRect();
            const toggleRect = dropdownToggle.getBoundingClientRect();
            
            const isMouseOverMenu = 
                mouseX >= menuRect.left && mouseX <= menuRect.right && 
                mouseY >= menuRect.top && mouseY <= menuRect.bottom;
                
            const isMouseOverToggle = 
                mouseX >= toggleRect.left && mouseX <= toggleRect.right && 
                mouseY >= toggleRect.top && mouseY <= toggleRect.bottom;
            
            if (!isMouseOverMenu && !isMouseOverToggle) {
                hideMenu();
            }
        }, inactivityDelay);
    }
    
    // Funkce pro časovač po kliknutí
    function startClickInactivityTimer() {
        clearTimeout(window.autoHideTimeouts[clickInactivityTimeoutKey]);
        window.autoHideTimeouts[clickInactivityTimeoutKey] = setTimeout(() => {
            const menuRect = dropdownContent.getBoundingClientRect();
            const toggleRect = dropdownToggle.getBoundingClientRect();
            
            const isMouseOverMenu = 
                mouseX >= menuRect.left && mouseX <= menuRect.right && 
                mouseY >= menuRect.top && mouseY <= menuRect.bottom;
                
            const isMouseOverToggle = 
                mouseX >= toggleRect.left && mouseX <= toggleRect.right && 
                mouseY >= toggleRect.top && mouseY <= toggleRect.bottom;
            
            if (!isMouseOverMenu && !isMouseOverToggle) {
                hideMenu();
            }
        }, clickInactivityDelay);
    }
    
    // Event listenery pro tento dropdown
    
dropdownToggle.addEventListener("mouseenter", function(e) {
    // PŘIDEJ TUTO KONTROLU NA ZAČÁTEK:
    if (isClickOpened) {
        return; // Pokud je dropdown otevřený kliknutím, ignoruj mouseenter
    }
    
    if (e.target.closest('.sub-dropdown-toggle')) {
        return;
    }
    
    // zbytek kódu zůstává stejný...
    
    // Zavřeme ostatní dropdowns
    closeOtherStickyDropdowns(index);
    
    // PŘIDÁNO: Zavřeme všechny otevřené subdropdowns v tomto dropdown
    const allSubDropdowns = dropdownContent.querySelectorAll('.sub-dropdown-content');
    allSubDropdowns.forEach((subContent, subIndex) => {
        if (window[`closeStickySubDropdown_${subIndex}`]) {
            window[`closeStickySubDropdown_${subIndex}`]();
        }
    });
    
    if (!isClickOpened) {
        requestAnimationFrame(() => {
            showMenu();
        });
    }
});
    
    // Mouseleave z toggle
    dropdownToggle.addEventListener("mouseleave", function(e) {
        if (isClickOpened) {
            startClickInactivityTimer();
            return;
        }
        
        const toElement = e.relatedTarget;
        if (toElement !== deadZoneElement && !deadZoneElement.contains(toElement) && 
            toElement !== dropdownContent && !dropdownContent.contains(toElement)) {
            
            window.dropdownTimeouts[timeoutKey] = setTimeout(function() {
                if (!isClickOpened) {
                    hideMenu();
                }
            }, 250);
        }
    });
    
    // Click na toggle
    dropdownToggle.addEventListener("click", function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        clearAllTimeouts();
        isClosingInProgress = false;
        
        if (dropdownContent.style.opacity === "1" && isClickOpened) {
            hideMenu();
        } else {
            closeOtherStickyDropdowns(index);
            isClickOpened = true;
            
            dropdownContent.style.display = "block";
            requestAnimationFrame(() => {
                dropdownContent.style.opacity = "1";
                dropdownContent.style.visibility = "visible";
                
                updateDeadZonePosition();
                
                localStorage.setItem(`sticky_menu_${index}_open`, 'true');
                startInactivityTimer();
                startClickInactivityTimer();
            });
        }
    });
    
    // Mouseenter na content
    dropdownContent.addEventListener("mouseenter", function() {
        if (!isClickOpened) {
            clearAllTimeouts();
            dropdownContent.style.display = "block";
            requestAnimationFrame(() => {
                dropdownContent.style.opacity = "1";
                dropdownContent.style.visibility = "visible";
                updateDeadZonePosition();
            });
        } else {
            clearTimeout(window.autoHideTimeouts[clickInactivityTimeoutKey]);
            clearTimeout(window.autoHideTimeouts[inactivityTimeoutKey]);
        }
    });
    
    // Mouseleave z content
    dropdownContent.addEventListener("mouseleave", function(e) {
        if (isClickOpened) {
            startClickInactivityTimer();
            return;
        }
        
        const toElement = e.relatedTarget;
        
        if ((toElement !== deadZoneElement && !deadZoneElement.contains(toElement)) && 
            (toElement !== dropdownToggle && !dropdownToggle.contains(toElement))) {
            
            window.dropdownTimeouts[timeoutKey] = setTimeout(function() {
                if (!isClickOpened) {
                    hideMenu();
                }
            }, 400);
        }
    });
    
    // Interakce s obsahem resetují časovače
    dropdownContent.addEventListener("mousemove", function() {
        if (isClickOpened) {
            clearTimeout(window.autoHideTimeouts[clickInactivityTimeoutKey]);
            clearTimeout(window.autoHideTimeouts[inactivityTimeoutKey]);
        }
    });
    
    dropdownContent.addEventListener("click", function() {
        if (isClickOpened) {
            clearTimeout(window.autoHideTimeouts[clickInactivityTimeoutKey]);
            clearTimeout(window.autoHideTimeouts[inactivityTimeoutKey]);
        }
    });
    
    // Dead zone listeners
    deadZoneElement.addEventListener("mouseenter", function() {
        if (!isClickOpened) {
            clearAllTimeouts();
            dropdownContent.style.display = "block";
            requestAnimationFrame(() => {
                dropdownContent.style.opacity = "1";
                dropdownContent.style.visibility = "visible";
            });
        }
    });
    
deadZoneElement.addEventListener("mouseleave", function(e) {
    if (isClickOpened) return;
    
    const toElement = e.relatedTarget;
    if (toElement !== dropdownToggle && !dropdownToggle.contains(toElement) && 
        toElement !== dropdownContent && !dropdownContent.contains(toElement)) {
        
        window.dropdownTimeouts[timeoutKey] = setTimeout(() => {
            if (!isClickOpened) {
                hideMenu();
            }
        }, 100);
    }
});
    
    // Sledování pozice myši
    document.addEventListener('mousemove', function(e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });
    
    // Zavření při kliknutí mimo
    document.addEventListener("click", function(event) {
        if (!dropdownToggle.contains(event.target) && 
            !dropdownContent.contains(event.target) &&
            event.target !== deadZoneElement) {
            
            hideMenu();
        }
    });
    
    // Export funkcí pro tento dropdown
    window[`closeStickyDropdown_${index}`] = function() {
        hideMenu();
    
    };
    // Export reset funkce pro tento dropdown
    window[`resetStickyDropdownState_${index}`] = function() {
        isClickOpened = false;
        isSubmenuActive = false;
        isClosingInProgress = false;
    };
    
    // Obnovení stavu po refreshu
    if (localStorage.getItem(`sticky_menu_${index}_open`) === 'true') {
        isClickOpened = true;
        setTimeout(() => {
            showMenu();
        }, 100);
    }
}

// Funkce pro zavření ostatních sticky dropdowns
function closeOtherStickyDropdowns(currentIndex) {
    const stickyHeader = document.querySelector('.sticky-header');
    if (!stickyHeader) return;
    
    const allDropdowns = stickyHeader.querySelectorAll('.dropdown');
    allDropdowns.forEach((dropdown, index) => {
        if (index !== currentIndex) {
            // Zavřeme ostatní dropdowns
            if (window[`closeStickyDropdown_${index}`]) {
                window[`closeStickyDropdown_${index}`]();
            }
            
            // Odebereme aktivní třídy
            const toggle = dropdown.querySelector('.dropdown-toggle, .dropdown-toggle-second');
            if (toggle) {
                toggle.classList.remove('clicked');
            }
        }
    });
}
function initializeSingleSubDropdown(subDropdownToggle, subDropdownContent, subDropdownId, index) {
    // Vytvoříme jedinečné identifikátory pro tento sub-dropdown
    const timeoutKey = `hideSubTimeout_${subDropdownId}`;
    const animationTimeoutKey = `animationSubTimeout_${subDropdownId}`;
    
    // Inicializujeme timeouty v globálním objektu
    if (!window.dropdownTimeouts) window.dropdownTimeouts = {};
    
    // Stav pro tento konkrétní sub-dropdown
    let isClickOpenedSub = false;
    let isMouseOverMenu = false;
    let isClosingInProgressSub = false;
    
// Aplikujeme styling
subDropdownContent.style.transition = "opacity 0.3s ease-in-out, visibility 0.3s ease-in-out";
subDropdownContent.style.opacity = "0";
subDropdownContent.style.visibility = "hidden";
subDropdownContent.style.display = "none";
subDropdownContent.style.position = "absolute";

    
    // Vytvoříme dead zone pro tento sub-dropdown
    const subDeadZone = document.createElement("div");
    subDeadZone.className = `sub-dropdown-dead-zone sub-dead-zone-${index}`;
    subDeadZone.style.position = "absolute";
    subDeadZone.style.display = "none";
    subDeadZone.style.zIndex = "999";
    subDeadZone.style.backgroundColor = "transparent";
    document.body.appendChild(subDeadZone);
    
    // Funkce pro správu timeoutů
    function clearAllSubTimeouts() {
        clearTimeout(window.dropdownTimeouts[timeoutKey]);
        clearTimeout(window.dropdownTimeouts[animationTimeoutKey]);
    }
    
    // Funkce pro nastavení dead zone pozice
    function updateSubDeadZone() {
        if (subDropdownContent.style.display === "block") {
            const toggleRect = subDropdownToggle.getBoundingClientRect();
            const contentRect = subDropdownContent.getBoundingClientRect();
            
            subDeadZone.style.left = toggleRect.right + "px";
            subDeadZone.style.top = Math.min(toggleRect.top, contentRect.top) + "px";
            subDeadZone.style.width = (contentRect.left - toggleRect.right) + "px";
            subDeadZone.style.height = Math.max(toggleRect.height, contentRect.height) + "px";
            subDeadZone.style.display = "block";
        }
    }
    
function showSubMenu() {
    clearAllSubTimeouts();
    isClosingInProgressSub = false;
    
    // Nastavíme display na block, ale ponecháme opacity na 0
    subDropdownContent.style.display = "block";
    subDropdownContent.style.visibility = "visible";
    subDropdownContent.style.opacity = "0";
    
    // Počkáme jeden frame, aby se display:block aplikoval
    requestAnimationFrame(() => {
        // Teprve nyní spustíme animaci opacity
        requestAnimationFrame(() => {
            subDropdownContent.style.opacity = "1";
            updateSubDeadZone();
        });
    });
    
    if (isClickOpenedSub) {
        localStorage.setItem(`sticky_submenu_${index}_open`, 'true');
    }
}
    // Funkce pro skrytí sub-menu
    function hideSubMenu() {
        clearAllSubTimeouts();
        isClosingInProgressSub = true;
        
        subDropdownContent.style.opacity = "0";
        subDropdownContent.style.visibility = "hidden";
        
        window.dropdownTimeouts[animationTimeoutKey] = setTimeout(() => {
            subDropdownContent.style.display = "none";
            subDeadZone.style.display = "none";
            
            isClickOpenedSub = false;
            isClosingInProgressSub = false;
            localStorage.removeItem(`sticky_submenu_${index}_open`);
        }, 300);
    }
subDropdownToggle.addEventListener("mouseenter", function(e) {
    e.stopPropagation(); // Přidáno pro zabránění propagace eventu
    isMouseOverMenu = true;
    if (!isClickOpenedSub) {
        showSubMenu();
    }
});
    
    subDropdownToggle.addEventListener("mouseleave", function(e) {
        isMouseOverMenu = false;
        const toElement = e.relatedTarget;
        if (toElement !== subDropdownContent && !subDropdownContent.contains(toElement) &&
            toElement !== subDeadZone) {
            window.dropdownTimeouts[timeoutKey] = setTimeout(() => {
                if (!isClickOpenedSub) {
                    hideSubMenu();
                }
            }, 200);
        }
    });
    
    subDropdownToggle.addEventListener("click", function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        clearAllSubTimeouts();
        
        if (subDropdownContent.style.opacity === "1" && isClickOpenedSub) {
            hideSubMenu();
        } else {
            isClickOpenedSub = true;
            showSubMenu();
        }
    });
    
subDropdownContent.addEventListener("mouseenter", function() {
    isMouseOverMenu = true;
    clearAllSubTimeouts();
    
    // Pokud je menu skryté nebo v procesu mizení, znovu ho zobrazíme s plynulou animací
    if (isClosingInProgressSub || subDropdownContent.style.opacity !== "1") {
        showSubMenu(); // Použijeme stejnou funkci pro konzistentní animaci
    }
});
    
    subDropdownContent.addEventListener("mouseleave", function(e) {
        isMouseOverMenu = false;
        const toElement = e.relatedTarget;
        if (toElement !== subDropdownToggle && toElement !== subDeadZone) {
            window.dropdownTimeouts[timeoutKey] = setTimeout(() => {
                if (!isClickOpenedSub) {
                    hideSubMenu();
                }
            }, 200);
        }
    });
    
  subDeadZone.addEventListener("mouseenter", function() {
    isMouseOverMenu = true;
    clearAllSubTimeouts();
    
    // Pokud je menu skryté nebo v procesu mizení, znovu ho zobrazíme s plynulou animací
    if (isClosingInProgressSub || subDropdownContent.style.opacity !== "1") {
        showSubMenu(); // Použijeme stejnou funkci pro konzistentní animaci
    }
});
    
    subDeadZone.addEventListener("mouseleave", function(e) {
        isMouseOverMenu = false;
        const toElement = e.relatedTarget;
        if (toElement !== subDropdownToggle && toElement !== subDropdownContent && 
            !subDropdownContent.contains(toElement)) {
            window.dropdownTimeouts[timeoutKey] = setTimeout(() => {
                if (!isClickOpenedSub) {
                    hideSubMenu();
                }
            }, 200);
        }
    });
    
    // Zavření při kliknutí mimo
    document.addEventListener("click", function(event) {
        if (!subDropdownToggle.contains(event.target) && 
            !subDropdownContent.contains(event.target) &&
            event.target !== subDeadZone) {
            hideSubMenu();
        }
    });
    
    // Export funkcí pro tento sub-dropdown
    window[`closeStickySubDropdown_${index}`] = function() {
        hideSubMenu();
    };
    
    // Obnovení stavu po refreshu
    if (localStorage.getItem(`sticky_submenu_${index}_open`) === 'true') {
        isClickOpenedSub = true;
        setTimeout(() => {
            showSubMenu();
        }, 100);
    }
}
// Funkce pro inicializaci sub-dropdowns ve sticky headeru
function initializeStickySubDropdowns(stickyHeader) {
    const subDropdowns = stickyHeader.querySelectorAll('.sub-dropdown-toggle');
    
    subDropdowns.forEach((subToggle, index) => {
        const subContent = subToggle.nextElementSibling;
        if (!subContent || !subContent.classList.contains('sub-dropdown-content')) return;
        
        const subDropdownId = `sticky-subdropdown-${index}`;
        initializeSingleSubDropdown(subToggle, subContent, subDropdownId, index);
        
        console.log(`Initialized sticky sub-dropdown ${index}`);
    });
}




// Export hlavní funkce
window.initializeStickyDropdowns = initializeStickyDropdowns;
window.clearAllDropdownStates = clearAllDropdownStates;




// OPRAVENÁ FUNKCE PRO INICIALIZACI STICKY BURGER MENU
function initializeStickyBurgerMenu() {
    const stickyHeader = document.querySelector('.sticky-header');
    if (!stickyHeader) {
        console.error('Sticky header not found');
        return;
    }
    
    const stickyBurgerMenu = stickyHeader.querySelector('.burger-menu');
    if (!stickyBurgerMenu) {
        console.log('Burger menu not found in sticky header');
        return;
    }
    
    // OPRAVA: Správně najdeme sticky verze mobilní navigace
    const stickyMobileNav = document.getElementById('sticky-mobileNav');
    const stickyMenuOverlay = document.getElementById('sticky-menuOverlay');
    
    if (!stickyMobileNav || !stickyMenuOverlay) {
        console.error('Sticky mobile navigation elements not found');
        console.log('Available elements:', {
            stickyMobileNav: !!stickyMobileNav,
            stickyMenuOverlay: !!stickyMenuOverlay
        });
        return;
    }
    
    // Najdeme close button ve sticky mobilní navigaci
    const stickyCloseButton = stickyMobileNav.querySelector('#closeButton, .close-button, [id*="close"]');
    
    // OPRAVA: Odebereme všechny předchozí event listenery z burger menu
    const newStickyBurgerMenu = stickyBurgerMenu.cloneNode(true);
    stickyBurgerMenu.parentNode.replaceChild(newStickyBurgerMenu, stickyBurgerMenu);
    
    // Event listener pro sticky burger menu
    newStickyBurgerMenu.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        console.log('Sticky burger menu clicked');
        clearAllDropdownStates();
        
        // OPRAVA: Ujistíme se, že pracujeme se správnými elementy
        const activeStickyMobileNav = document.getElementById('sticky-mobileNav');
        const activeStickyMenuOverlay = document.getElementById('sticky-menuOverlay');
        
        if (activeStickyMobileNav && activeStickyMenuOverlay) {
            // Otevřeme sticky mobilní navigaci
            activeStickyMobileNav.classList.add('active');
            activeStickyMenuOverlay.classList.add('active');
            document.body.classList.add('menu-open');
            
            console.log('Sticky mobile navigation opened successfully');
        } else {
            console.error('Could not find sticky mobile navigation elements on click');
        }
    });
    
    // Event listener pro zavření sticky mobilní navigace
    if (stickyCloseButton) {
        // Odebereme staré event listenery
        const newCloseButton = stickyCloseButton.cloneNode(true);
        stickyCloseButton.parentNode.replaceChild(newCloseButton, stickyCloseButton);
        
        newCloseButton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const activeStickyMobileNav = document.getElementById('sticky-mobileNav');
            const activeStickyMenuOverlay = document.getElementById('sticky-menuOverlay');
            
            if (activeStickyMobileNav && activeStickyMenuOverlay) {
                activeStickyMobileNav.classList.remove('active');
                activeStickyMenuOverlay.classList.remove('active');
                document.body.classList.remove('menu-open');
                console.log('Sticky mobile navigation closed');
            }
        });
    }
    
    // OPRAVA: Odebereme předchozí event listener z overlay
    const newStickyMenuOverlay = stickyMenuOverlay.cloneNode(true);
    stickyMenuOverlay.parentNode.replaceChild(newStickyMenuOverlay, stickyMenuOverlay);
    
    // Zavření při kliknutí na overlay
    newStickyMenuOverlay.addEventListener('click', function(e) {
        if (e.target === newStickyMenuOverlay) {
            const activeStickyMobileNav = document.getElementById('sticky-mobileNav');
            
            if (activeStickyMobileNav) {
                activeStickyMobileNav.classList.remove('active');
                newStickyMenuOverlay.classList.remove('active');
                document.body.classList.remove('menu-open');
                console.log('Sticky mobile navigation closed via overlay');
            }
        }
    });
    
    console.log('Sticky burger menu initialized successfully');
}

// OPRAVENÁ FUNKCE PRO VYTVOŘENÍ STICKY HEADER
function createStickyHeader() {
    const stickyHeader = document.createElement('div');
    stickyHeader.className = 'sticky-header';
    stickyHeader.id = 'sticky-header';
    
    const originalHeader = document.querySelector('header');
    
    if (!originalHeader) {
        console.error('Original header not found. Cannot create sticky header.');
        return;
    }
    
    // Clone the entire header content to preserve structure and classes
    const headerContent = originalHeader.cloneNode(true);
    
    // OPRAVA: Správně zkopírujeme mobilní navigaci pro sticky header
    const mobileNav = headerContent.querySelector('#mobileNav, .mobile-nav-container, .mobile-nav');
    const menuOverlay = headerContent.querySelector('#menuOverlay, .menu-overlay');
    
    if (mobileNav) {
        // Vytvoříme klon mobilní navigace pro sticky header
        const stickyMobileNav = mobileNav.cloneNode(true);
        stickyMobileNav.setAttribute('id', 'sticky-mobileNav');
        stickyMobileNav.classList.add('sticky-mobile-nav');
        
        // OPRAVA: Aktualizujeme všechny ID uvnitř mobilní navigace
        const elementsWithId = stickyMobileNav.querySelectorAll('[id]');
        elementsWithId.forEach(element => {
            const originalId = element.getAttribute('id');
            if (originalId !== 'sticky-mobileNav') { // Nezměníme hlavní ID
                element.setAttribute('id', 'sticky-' + originalId);
            }
        });
        
        document.body.appendChild(stickyMobileNav);
        console.log('Sticky mobile nav created with ID:', stickyMobileNav.id);
    }

    if (menuOverlay) {
        // Vytvoříme klon overlay pro sticky header
        const stickyMenuOverlay = menuOverlay.cloneNode(true);
        stickyMenuOverlay.setAttribute('id', 'sticky-menuOverlay');
        stickyMenuOverlay.classList.add('sticky-menu-overlay');
        
        document.body.appendChild(stickyMenuOverlay);
        console.log('Sticky menu overlay created with ID:', stickyMenuOverlay.id);
    }

    // Nyní odstraníme původní mobilní elementy z headerContent
    const mobileElements = headerContent.querySelectorAll('.menu-overlay, .mobile-nav-container, #menuOverlay, #mobileNav, .mobile-nav');
    mobileElements.forEach(element => element.remove());
    
    // Zkopíruj také CSS třídy a styly z původního headeru
    const originalStyles = window.getComputedStyle(originalHeader);
    stickyHeader.style.overflowX = originalStyles.overflowX;
    stickyHeader.style.overflowY = originalStyles.overflowY;
    
    // Remove any ID attributes from the cloned elements to avoid duplicates
    const elementsWithId = headerContent.querySelectorAll('[id]');
    elementsWithId.forEach(element => {
        const originalId = element.getAttribute('id');
        element.setAttribute('id', 'sticky-' + originalId);
    });
    
    // Add the sticky-clone class to all dropdown elements for later identification
    const dropdownElements = headerContent.querySelectorAll('.dropdown, .dropdown-toggle, .dropdown-content, .dropdown-content-second, .sub-dropdown-toggle, .sub-dropdown-content');
    dropdownElements.forEach(element => {
        element.classList.add('sticky-clone');
    });
    
    // OPRAVA: Správně zkopírujeme burger menu
    const burgerMenu = headerContent.querySelector('.burger-menu');
    if (burgerMenu) {
        // Ujistíme se, že burger menu má správné ID pro sticky verzi 
        burgerMenu.setAttribute('id', 'sticky-burgerMenu');
        console.log('Burger menu copied to sticky header with ID:', burgerMenu.id);
    }
    
    // Extract and append main navigation elements
    const navElement = headerContent.querySelector('nav');
    if (navElement) {
        stickyHeader.appendChild(navElement);
    } else {
        // If no nav element found, try to find ul or other navigation containers
        const ulElement = headerContent.querySelector('ul');
        if (ulElement) {
            stickyHeader.appendChild(ulElement);
        } else {
            // Fallback: copy button containers or other important elements
            const buttonContainers = headerContent.querySelectorAll('.button-container');
            if (buttonContainers.length > 0) {
                const navContainer = document.createElement('div');
                navContainer.className = 'sticky-nav-container';
                
                buttonContainers.forEach(container => {
                    navContainer.appendChild(container);
                });
                
                stickyHeader.appendChild(navContainer);
            } else {
                // UPRAVENO: Pokud nenajdeme button-container, zkusíme najít burger menu
                if (burgerMenu) {
                    stickyHeader.appendChild(burgerMenu);
                } else {
                    // Last resort: copy all visible links
                    const navList = document.createElement('ul');
                    
                    const links = headerContent.querySelectorAll('a');
                    links.forEach(link => {
                        if (link.offsetParent !== null) { // Only visible links
                            const li = document.createElement('li');
                            li.appendChild(link);
                            navList.appendChild(li);
                        }
                    });
                    
                    stickyHeader.appendChild(navList);
                }
            }
        }
    }
    
    // OPRAVA: Ujistíme se, že burger menu je v sticky headeru
    if (!stickyHeader.querySelector('.burger-menu') && burgerMenu) {
        stickyHeader.appendChild(burgerMenu);
    }
    
    // Append the sticky header to the body
    document.body.appendChild(stickyHeader);
    
    console.log('Sticky header created with burger menu and mobile navigation');
    
    // OPRAVA: Přidáme timeout pro zajištění, že elementy jsou připravené
    setTimeout(() => {
        const checkStickyMobileNav = document.getElementById('sticky-mobileNav');
        const checkStickyMenuOverlay = document.getElementById('sticky-menuOverlay');
        
        console.log('Post-creation check:', {
            stickyMobileNav: !!checkStickyMobileNav,
            stickyMenuOverlay: !!checkStickyMenuOverlay
        });
    }, 100);
}

// PŘIDEJTE TAKÉ TUTO KONTROLNÍ FUNKCE PRO DEBUGGING
function debugStickyElements() {
    console.log('=== DEBUGGING STICKY ELEMENTS ===');
    
    const stickyHeader = document.querySelector('.sticky-header');
    const stickyBurgerMenu = document.querySelector('.sticky-header .burger-menu');
    const stickyMobileNav = document.getElementById('sticky-mobileNav');
    const stickyMenuOverlay = document.getElementById('sticky-menuOverlay');
    
    console.log('Sticky Header:', !!stickyHeader);
    console.log('Sticky Burger Menu:', !!stickyBurgerMenu);
    console.log('Sticky Mobile Nav:', !!stickyMobileNav);
    console.log('Sticky Menu Overlay:', !!stickyMenuOverlay);
    
    if (stickyMobileNav) {
        console.log('Sticky Mobile Nav classes:', stickyMobileNav.className);
    }
    if (stickyMenuOverlay) {
        console.log('Sticky Menu Overlay classes:', stickyMenuOverlay.className);
    }
    
    console.log('=== END DEBUG ===');
}

// Zavolejte debugStickyElements() po inicializaci pro kontrolu
// Upravte funkce initStickyHeaderFunctionality - přidejte volání inicializace burger menu
function initStickyHeaderFunctionality() {
    const stickyHeader = document.querySelector('.sticky-header');
    const mainHeader = document.querySelector('header');
    
    if (!stickyHeader || !mainHeader) {
        console.error('Sticky header or main header not found');
        return;
    }
    
    // Initialize home icon functionality
    initializeHomeIcon(stickyHeader);
    
    // PŘIDEJTE TOTO - inicializace burger menu
    initializeStickyBurgerMenu();
    
    const mainHeaderHeight = mainHeader.offsetHeight;
    let lastScrollY = window.scrollY || document.documentElement.scrollTop;
    let ticking = false;
    
    // Handle scroll event
    function handleScroll() {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const scrollY = window.scrollY || document.documentElement.scrollTop;
                
                // If we're at the top or within original header area, hide sticky header immediately
                if (scrollY <= Math.max(mainHeaderHeight + 1.5, 10)) { // přidej malý buffer
                    stickyHeader.classList.remove('visible');
                    clearAllDropdownStates(); // Zavři všechny dropdowny
                    stickyHeader.classList.remove('scrolled');
                    
                    // Plynulé zmizení místo okamžitého
                    stickyHeader.style.transition = 'transform 0.2s ease-out, opacity 0.2s ease-out';
                    stickyHeader.style.transform = 'translateY(-100%)';
                    stickyHeader.style.opacity = '0';
                }
                else {
                    // Restore normal transition behavior
                    stickyHeader.style.transition = '';
                    stickyHeader.style.transform = '';
                    stickyHeader.style.opacity = '1'; 
                    
                    // Show header when scrolling up
                    if (scrollY < lastScrollY) {
                        stickyHeader.classList.add('visible');
                        
                        // Add scrolled class for more compact look when further down
                        if (scrollY > mainHeaderHeight + 100) {
                            stickyHeader.classList.add('scrolled');
                        } else {
                            stickyHeader.classList.remove('scrolled');
                        }
                    } 
                    // Hide header when scrolling down
                    else if (scrollY > lastScrollY) {
                        stickyHeader.classList.remove('visible');
                        clearAllDropdownStates(); 
                    }
                }
                
                lastScrollY = scrollY;
                ticking = false;
            });
            
            ticking = true;
        }
    }
    
    window.addEventListener('scroll', handleScroll);
    
    // Initial check to set correct state on page load
    (function initialCheck() {
        const scrollY = window.scrollY || document.documentElement.scrollTop;
        
        if (scrollY > mainHeaderHeight) {
            // VYNUTÍME zobrazení sticky headeru při každém refreshu
            setTimeout(() => {
                stickyHeader.style.transition = '';
                stickyHeader.style.transform = 'translateY(0)';
                stickyHeader.style.opacity = '1';
                stickyHeader.style.visibility = 'visible';
                stickyHeader.classList.add('visible');
                
                if (scrollY > mainHeaderHeight + 100) {
                    stickyHeader.classList.add('scrolled');
                }
                
                console.log('Sticky header forcibly shown on page load at scroll position:', scrollY);
            }, 50); // Malé zpoždění zajistí, že se aplikuje po načtení
        }
    })();
    
    // Initialize dropdown functionality for the sticky header
    initializeStickyDropdowns();
    
    // Debounce funkce pro rychlé přepínání
    let themeChangeTimeout;

    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && 
                (mutation.attributeName === 'class' || mutation.attributeName === 'data-theme')) {
                
                // Zrušíme předchozí timeout pokud existuje
                if (themeChangeTimeout) {
                    clearTimeout(themeChangeTimeout);
                }
                
                // Zachováme aktuální stav
                const currentScrollY = window.scrollY || document.documentElement.scrollTop;
                const wasVisible = stickyHeader.classList.contains('visible');
                
                if (wasVisible && currentScrollY > 50) {
                    themeChangeTimeout = setTimeout(() => {
                        if (stickyHeader && (window.scrollY || document.documentElement.scrollTop) > 50) {
                            stickyHeader.classList.add('visible');
                            stickyHeader.style.opacity = '1';
                            stickyHeader.style.transform = 'translateY(0)';
                        }
                    }, 0);
                }
            }
        });
    });

    observer.observe(document.body, { attributes: true, subtree: false });
    observer.observe(document.documentElement, { attributes: true, subtree: false });
    
    console.log('Sticky header functionality initialized');
}

// ALTERNATIVNÍ ŘEŠENÍ - pokud výše uvedené nefunguje, zkuste toto:
// Můžete také přidat tuto kontrolu do funkce clearAllDropdownStates:

function clearAllDropdownStatesUpdated() {
    // Vyčistíme localStorage
    Object.keys(localStorage).forEach(key => {
        if (key.startsWith('sticky_menu_') && key.endsWith('_open')) {
            localStorage.removeItem(key);
        }
        if (key.startsWith('sticky_submenu_') && key.endsWith('_open')) {
            localStorage.removeItem(key);
            
        }
    });
    
    // Vyčistíme všechny timeouty
    if (window.dropdownTimeouts) {
        Object.values(window.dropdownTimeouts).forEach(timeout => {
            clearTimeout(timeout);
        });
        window.dropdownTimeouts = {};
    }
    
    if (window.autoHideTimeouts) {
        Object.values(window.autoHideTimeouts).forEach(timeout => {
            clearTimeout(timeout);
        });
        window.autoHideTimeouts = {};
    }
    
    // PŘIDEJ TUTO ČÁST - fyzicky zavřeme všechny dropdowny
    const stickyHeader = document.querySelector('.sticky-header');
    if (stickyHeader) {
        // Zavřeme hlavní dropdowny
        const dropdownContents = stickyHeader.querySelectorAll('.dropdown-content, .dropdown-content-second');
        dropdownContents.forEach(content => {
            content.style.opacity = '0';
            content.style.visibility = 'hidden';
            content.style.display = 'none';
        });
        
        // Zavřeme sub-dropdowny
        const subDropdownContents = stickyHeader.querySelectorAll('.sub-dropdown-content');
        subDropdownContents.forEach(content => {
            content.style.opacity = '0';
            content.style.visibility = 'hidden';
            content.style.display = 'none';
        });
        
        // Zavřeme dead zones
        const deadZones = document.querySelectorAll('.sticky-header-dead-zone, .sub-dropdown-dead-zone');
        deadZones.forEach(zone => {
            zone.style.display = 'none';
        });
        
        // Odebereme aktivní třídy
        const activeToggles = stickyHeader.querySelectorAll('.dropdown-toggle.clicked, .dropdown-toggle-second.clicked');
        activeToggles.forEach(toggle => {
            toggle.classList.remove('clicked');
        });
        
        // PŘIDÁNO: Ujistíme se, že burger menu je stále viditelné
        const stickyBurgerMenu = stickyHeader.querySelector('.burger-menu');
        if (stickyBurgerMenu) {
            stickyBurgerMenu.style.display = ''; // Reset display
            stickyBurgerMenu.style.visibility = 'visible';
            stickyBurgerMenu.style.opacity = '1';
        }
        
        // Reset stavových proměnných
        if (window.stickyDropdownStates) {
            Object.keys(window.stickyDropdownStates).forEach(key => {
                window.stickyDropdownStates[key].isClickOpened = false;
                window.stickyDropdownStates[key].isSubmenuActive = false;
                window.stickyDropdownStates[key].isClosingInProgress = false;
            });
        }
        
        // Reset lokálních stavů v každém dropdown
        for (let i = 0; i < 10; i++) {
            if (window[`resetStickyDropdownState_${i}`]) {
                window[`resetStickyDropdownState_${i}`]();
            }
        }
    }
}