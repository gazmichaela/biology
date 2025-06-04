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
    z-index: 1000;
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
// Create the sticky header structure
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
    
    // Append the sticky header to the body
    document.body.appendChild(stickyHeader);
    
    console.log('Sticky header created with appropriate navigation structure');
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





//---------RESPONSIVE STICKY HEADER FUNCTIONALITY-------------//
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
    
    // 4. Initialize responsive behavior
    initResponsiveBehavior();
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
    z-index: 1000;
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

/* Desktop Navigation */
.sticky-header .desktop-nav {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
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

/* Burger Menu Styles */
.sticky-header .burger-menu {
    display: none;
    flex-direction: column;
    cursor: pointer;
    padding: 10px;
    margin-right: 15px;
    background: none;
    border: none;
    position: relative;
    z-index: 1001;
}

.sticky-header .burger-line {
    width: 25px;
    height: 3px;
    background-color: #025227;
    margin: 3px 0;
    transition: 0.3s;
    border-radius: 2px;
}

.sticky-header .burger-menu.active .burger-line:nth-child(1) {
    transform: rotate(-45deg) translate(-5px, 6px);
}

.sticky-header .burger-menu.active .burger-line:nth-child(2) {
    opacity: 0;
}

.sticky-header .burger-menu.active .burger-line:nth-child(3) {
    transform: rotate(45deg) translate(-5px, -6px);
}

/* Mobile Navigation */
.sticky-header .mobile-nav {
    display: none;
    position: fixed;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100vh;
    background-color: #77afe0ee;
    backdrop-filter: blur(10px);
    transition: left 0.3s ease;
    z-index: 1000;
    overflow-y: auto;
    padding-top: 80px;
}

.sticky-header .mobile-nav.active {
    left: 0;
}

.sticky-header .mobile-nav ul {
    flex-direction: column;
    padding: 20px;
    margin: 0;
    gap: 10px;
}

.sticky-header .mobile-nav ul li {
    margin: 0;
    width: 100%;
}

.sticky-header .mobile-nav .button-container {
    flex-direction: column;
    margin: 10px 0;
    width: 100%;
}

.sticky-header .mobile-nav .main-button,
.sticky-header .mobile-nav .maine-button {
    width: 100%;
    margin-bottom: 10px;
    border-radius: 20px;
    justify-content: center;
    text-align: center;
}

.sticky-header .mobile-nav .dropdown {
    width: 100%;
    margin-bottom: 10px;
}

.sticky-header .mobile-nav .dropdown-toggle,
.sticky-header .mobile-nav .dropdown-toggle-second {
    width: 100%;
    border-radius: 20px;
    margin-left: 0;
    margin-top: 5px;
    justify-content: space-between;
    padding: 12px 20px;
}

.sticky-header .mobile-nav .dropdown-content,
.sticky-header .mobile-nav .dropdown-content-second {
    position: static;
    width: 100%;
    margin-top: 5px;
    margin-left: 0;
    transform: none;
    box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
    border-radius: 10px;
}

.sticky-header .mobile-nav .sub-dropdown-content {
    position: static;
    margin-left: 20px;
    margin-top: 5px;
    transform: none;
    box-shadow: inset 0 2px 4px rgba(0,0,0,0.15);
}

/* Header Top Row for Mobile */
.sticky-header .mobile-header-top {
    display: none;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    padding: 0 15px;
    position: relative;
    z-index: 1001;
}

.sticky-header .mobile-header-top h1 {
    font-size: 24px;
    margin: 0;
    color: white;
    flex-grow: 1;
    text-align: center;
}

/* Dropdown Styles (Desktop) */
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
    transition: opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1), visibility 0.5s;
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

/* Mobile Responsive Styles */
@media screen and (max-width: 768px) {
    .sticky-header {
        padding: 5px 0;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
    }
    
    .sticky-header h1 {
        font-size: 20px;
        margin: 0;
        display: none;
    }
    
    .sticky-header .desktop-nav {
        display: none;
    }
    
    .sticky-header .mobile-header-top {
        display: flex;
    }
    
    .sticky-header .burger-menu {
        display: flex;
    }
    
    .sticky-header .mobile-nav {
        display: block;
    }
    
    .sticky-header .mobile-nav ul li {
        font-size: 16px;
    }
    
    .sticky-header .home-icon {
        order: -1;
    }
    
    .sticky-header .home-icon img {
        width: 20px;
        margin: 0;
    }
}

@media screen and (max-width: 480px) {
    .sticky-header .mobile-header-top h1 {
        font-size: 18px;
    }
    
    .sticky-header .mobile-nav ul {
        padding: 15px;
    }
    
    .sticky-header .mobile-nav .main-button,
    .sticky-header .mobile-nav .maine-button,
    .sticky-header .mobile-nav .dropdown-toggle,
    .sticky-header .mobile-nav .dropdown-toggle-second {
        font-size: 14px;
        padding: 10px 15px;
    }
}

/* Tablet Styles */
@media screen and (max-width: 1024px) and (min-width: 769px) {
    .sticky-header h1 {
        font-size: 26px;
    }
    
    .sticky-header ul li {
        margin: 0 12px;
        font-size: 16px;
    }
    
    .sticky-header .button-container {
        margin: 0 1vmax;
    }
    
    .sticky-header .main-button,
    .sticky-header .maine-button,
    .sticky-header .dropdown-toggle,
    .sticky-header .dropdown-toggle-second {
        font-size: 14px;
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
    
    // Fyzicky zavřeme všechny dropdowny
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

// Create the sticky header structure
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
    
    // Create mobile header top
    const mobileHeaderTop = document.createElement('div');
    mobileHeaderTop.className = 'mobile-header-top';
    
    // Add home icon to mobile header
    const homeIcon = headerContent.querySelector('.home-icon');
    if (homeIcon) {
        mobileHeaderTop.appendChild(homeIcon.cloneNode(true));
    }
    
    // Add title to mobile header
    const title = headerContent.querySelector('h1');
    if (title) {
        mobileHeaderTop.appendChild(title.cloneNode(true));
    }
    
    // Create burger menu
    const burgerMenu = document.createElement('button');
    burgerMenu.className = 'burger-menu';
    burgerMenu.innerHTML = `
        <div class="burger-line"></div>
        <div class="burger-line"></div>
        <div class="burger-line"></div>
    `;
    mobileHeaderTop.appendChild(burgerMenu);
    
    // Create desktop navigation
    const desktopNav = document.createElement('div');
    desktopNav.className = 'desktop-nav';
    
    // Extract and append main navigation elements for desktop
    const navElement = headerContent.querySelector('nav');
    if (navElement) {
        desktopNav.appendChild(navElement);
    } else {
        // Fallback navigation creation
        const ulElement = headerContent.querySelector('ul');
        if (ulElement) {
            desktopNav.appendChild(ulElement);
        } else {
            const buttonContainers = headerContent.querySelectorAll('.button-container');
            if (buttonContainers.length > 0) {
                const navContainer = document.createElement('div');
                navContainer.className = 'sticky-nav-container';
                
                buttonContainers.forEach(container => {
                    navContainer.appendChild(container);
                });
                
                desktopNav.appendChild(navContainer);
            }
        }
    }
    
    // Create mobile navigation
    const mobileNav = document.createElement('div');
    mobileNav.className = 'mobile-nav';
    
    // Clone navigation content for mobile
    const mobileNavContent = desktopNav.cloneNode(true);
    mobileNav.appendChild(mobileNavContent);
    
    // Append all components to sticky header
    stickyHeader.appendChild(mobileHeaderTop);
    stickyHeader.appendChild(desktopNav);
    stickyHeader.appendChild(mobileNav);
    
    // Append the sticky header to the body
    document.body.appendChild(stickyHeader);
    
    console.log('Responsive sticky header created with mobile and desktop navigation');
}
function debugBurgerMenu() {
    const burgerMenu = document.querySelector('.sticky-header .burger-menu');
    const mobileHeaderTop = document.querySelector('.sticky-header .mobile-header-top');
    
    console.log('Burger menu element:', burgerMenu);
    console.log('Mobile header top:', mobileHeaderTop);
    console.log('Window width:', window.innerWidth);
    
    if (!burgerMenu) {
        console.error('Burger menu not found - creating it manually');
        createBurgerMenuManually();
    }
}

function createBurgerMenuManually() {
    const stickyHeader = document.querySelector('.sticky-header');
    if (!stickyHeader) return;
    
    let mobileHeaderTop = stickyHeader.querySelector('.mobile-header-top');
    if (!mobileHeaderTop) {
        mobileHeaderTop = document.createElement('div');
        mobileHeaderTop.className = 'mobile-header-top';
        stickyHeader.appendChild(mobileHeaderTop);
    }
    
    const existingBurger = mobileHeaderTop.querySelector('.burger-menu');
    if (existingBurger) {
        existingBurger.remove();
    }
    
    const burgerMenu = document.createElement('button');
    burgerMenu.className = 'burger-menu';
    burgerMenu.innerHTML = `
        <div class="burger-line"></div>
        <div class="burger-line"></div>
        <div class="burger-line"></div>
    `;
    
    mobileHeaderTop.appendChild(burgerMenu);
    initResponsiveBehavior();
}


// Initialize responsive behavior
function initResponsiveBehavior() {
    const burgerMenu = document.querySelector('.sticky-header .burger-menu');
    const mobileNav = document.querySelector('.sticky-header .mobile-nav');
    
    if (!burgerMenu || !mobileNav) {
        console.error('Burger menu or mobile nav not found');
        return;
    }
    
    // Toggle mobile menu
    burgerMenu.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        burgerMenu.classList.toggle('active');
        mobileNav.classList.toggle('active');
        
        // Prevent body scroll when menu is open
        if (mobileNav.classList.contains('active')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
            clearAllDropdownStates();
        }
    });
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', function(e) {
        if (!mobileNav.contains(e.target) && !burgerMenu.contains(e.target)) {
            if (mobileNav.classList.contains('active')) {
                burgerMenu.classList.remove('active');
                mobileNav.classList.remove('active');
                document.body.style.overflow = '';
                clearAllDropdownStates();
            }
        }
    });
    
    // Close mobile menu on window resize
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            burgerMenu.classList.remove('active');
            mobileNav.classList.remove('active');
            document.body.style.overflow = '';
            clearAllDropdownStates();
        }
    });
    
    // Handle mobile dropdown behavior
    initMobileDropdowns();
}

// Initialize mobile dropdown behavior
function initMobileDropdowns() {
    const mobileNav = document.querySelector('.sticky-header .mobile-nav');
    if (!mobileNav) return;
    
    const mobileDropdowns = mobileNav.querySelectorAll('.dropdown');
    
    mobileDropdowns.forEach((dropdown, index) => {
        const toggle = dropdown.querySelector('.dropdown-toggle, .dropdown-toggle-second');
        const content = dropdown.querySelector('.dropdown-content, .dropdown-content-second');
        
        if (!toggle || !content) return;
        
        // Remove desktop hover behavior for mobile
        toggle.style.pointerEvents = 'auto';
        
        // Add click behavior for mobile dropdowns
        toggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // Close other mobile dropdowns
            mobileDropdowns.forEach((otherDropdown, otherIndex) => {
                if (otherIndex !== index) {
                    const otherContent = otherDropdown.querySelector('.dropdown-content, .dropdown-content-second');
                    if (otherContent) {
                        otherContent.style.display = 'none';
                    }
                }
            });
            
            // Toggle current dropdown
            if (content.style.display === 'block') {
                content.style.display = 'none';
            } else {
                content.style.display = 'block';
                content.style.opacity = '1';
                content.style.visibility = 'visible';
            }
        });
        
        // Handle sub-dropdowns in mobile
        const subDropdowns = content.querySelectorAll('.sub-dropdown-toggle');
        subDropdowns.forEach(subToggle => {
            const subContent = subToggle.nextElementSibling;
            if (!subContent) return;
            
            subToggle.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                if (subContent.style.display === 'block') {
                    subContent.style.display = 'none';
                } else {
                    subContent.style.display = 'block';
                    subContent.style.opacity = '1';
                    subContent.style.visibility = 'visible';
                }
            });
        });
    });
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
                if (scrollY <= Math.max(mainHeaderHeight + 1.5, 10)) {
                    stickyHeader.classList.remove('visible');
                    clearAllDropdownStates();
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
            setTimeout(() => {
                stickyHeader.style.transition = '';
                stickyHeader.style.transform = 'translateY(0)';
                stickyHeader.style.opacity = '1';
                stickyHeader.style.visibility = 'visible';
                stickyHeader.classList.add('visible');
                
                if (scrollY > mainHeaderHeight + 100) {
                    stickyHeader.classList.add('scrolled');
                }
                // Na konec initStickyHeaderFunctionality(), před console.log
    setTimeout(() => {
        debugBurgerMenu();
    }, 500);
    
    console.log('Sticky header functionality initialized');
               console.log('Sticky header forcibly shown on page load');
            }, 100);
        } else {
            stickyHeader.style.transform = 'translateY(-100%)';
            stickyHeader.style.opacity = '0';
            stickyHeader.classList.remove('visible');
        }
    })();
    
    // Initialize dropdown functionality for the sticky header
    initializeStickyDropdowns(stickyHeader);
    
    console.log('Sticky header functionality initialized');
}

// Initialize home icon functionality
function initializeHomeIcon(stickyHeader) {
    const homeIcons = stickyHeader.querySelectorAll('.home-icon');
    
    homeIcons.forEach(homeIcon => {
        homeIcon.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Scroll to top smoothly
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
            
            // Optional: Close mobile menu if open
            const mobileNav = document.querySelector('.sticky-header .mobile-nav');
            const burgerMenu = document.querySelector('.sticky-header .burger-menu');
            
            if (mobileNav && mobileNav.classList.contains('active')) {
                mobileNav.classList.remove('active');
                if (burgerMenu) {
                    burgerMenu.classList.remove('active');
                }
                document.body.style.overflow = '';
                clearAllDropdownStates();
            }
        });
    });
}

// Initialize sticky header dropdowns
function initializeStickyDropdowns(stickyHeader) {
    const dropdowns = stickyHeader.querySelectorAll('.dropdown');
    
    dropdowns.forEach((dropdown, index) => {
        const toggle = dropdown.querySelector('.dropdown-toggle, .dropdown-toggle-second');
        const content = dropdown.querySelector('.dropdown-content, .dropdown-content-second');
        const mainButton = dropdown.querySelector('.main-button, .maine-button');
        
        if (!toggle || !content) return;
        
        // Create unique identifier for this dropdown
        const dropdownId = `sticky-dropdown-${index}`;
        const stateKey = `sticky_menu_${index}_open`;
        
        // Initialize state management for this dropdown
        if (!window.stickyDropdownStates) {
            window.stickyDropdownStates = {};
        }
        
        window.stickyDropdownStates[dropdownId] = {
            isClickOpened: false,
            isSubmenuActive: false,
            isClosingInProgress: false
        };
        
        // Create reset function for this dropdown
        window[`resetStickyDropdownState_${index}`] = function() {
            if (window.stickyDropdownStates[dropdownId]) {
                window.stickyDropdownStates[dropdownId].isClickOpened = false;
                window.stickyDropdownStates[dropdownId].isSubmenuActive = false;
                window.stickyDropdownStates[dropdownId].isClosingInProgress = false;
            }
        };
        
        // Handle desktop behavior (hover + click)
        if (window.innerWidth > 768) {
            // Mouse enter on dropdown container
            dropdown.addEventListener('mouseenter', function() {
                if (window.stickyDropdownStates[dropdownId].isClosingInProgress) return;
                
                clearTimeout(window.autoHideTimeouts[dropdownId]);
                
                if (!window.stickyDropdownStates[dropdownId].isClickOpened) {
                    showDropdown(content, toggle, dropdownId);
                }
            });
            
            // Mouse leave on dropdown container
            dropdown.addEventListener('mouseleave', function() {
                if (window.stickyDropdownStates[dropdownId].isClickOpened || 
                    window.stickyDropdownStates[dropdownId].isSubmenuActive) return;
                
                window.autoHideTimeouts[dropdownId] = setTimeout(() => {
                    hideDropdown(content, toggle, dropdownId);
                }, 300);
            });
            
            // Click on toggle
            toggle.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                const isVisible = content.classList.contains('show');
                
                if (isVisible) {
                    // Close dropdown
                    hideDropdown(content, toggle, dropdownId);
                    window.stickyDropdownStates[dropdownId].isClickOpened = false;
                    localStorage.removeItem(stateKey);
                } else {
                    // Close other dropdowns first
                    closeOtherStickyDropdowns(dropdownId);
                    
                    // Open this dropdown
                    showDropdown(content, toggle, dropdownId);
                    window.stickyDropdownStates[dropdownId].isClickOpened = true;
                    localStorage.setItem(stateKey, 'true');
                }
            });
            
            // Initialize sub-dropdowns
            initializeStickySubDropdowns(content, dropdownId);
        }
        
        // Handle main button clicks
        if (mainButton) {
            mainButton.addEventListener('click', function(e) {
                const href = this.getAttribute('href') || this.getAttribute('data-href');
                if (href && href !== '#') {
                    window.location.href = href;
                }
            });
        }
    });
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', function(e) {
        if (!stickyHeader.contains(e.target)) {
            closeAllStickyDropdowns();
        }
    });
}

// Initialize sub-dropdowns for sticky header
function initializeStickySubDropdowns(parentContent, parentDropdownId) {
    const subDropdownToggles = parentContent.querySelectorAll('.sub-dropdown-toggle');
    
    subDropdownToggles.forEach((subToggle, subIndex) => {
        const subContent = subToggle.nextElementSibling;
        if (!subContent || !subContent.classList.contains('sub-dropdown-content')) return;
        
        const subDropdownId = `${parentDropdownId}-sub-${subIndex}`;
        const subStateKey = `sticky_submenu_${parentDropdownId}_${subIndex}_open`;
        
        // Mouse enter on sub-dropdown toggle
        subToggle.addEventListener('mouseenter', function() {
            clearTimeout(window.autoHideTimeouts[subDropdownId]);
            clearTimeout(window.autoHideTimeouts[parentDropdownId]);
            
            window.stickyDropdownStates[parentDropdownId].isSubmenuActive = true;
            
            // Hide other sub-dropdowns in the same parent
            const otherSubContents = parentContent.querySelectorAll('.sub-dropdown-content');
            otherSubContents.forEach(otherSubContent => {
                if (otherSubContent !== subContent) {
                    otherSubContent.classList.remove('show');
                    otherSubContent.style.opacity = '0';
                    otherSubContent.style.visibility = 'hidden';
                    otherSubContent.style.display = 'none';
                }
            });
            
            // Show current sub-dropdown
            subContent.classList.add('show');
            subContent.style.opacity = '1';
            subContent.style.visibility = 'visible';
            subContent.style.display = 'block';
            localStorage.setItem(subStateKey, 'true');
        });
        
        // Mouse leave on sub-dropdown toggle
        subToggle.addEventListener('mouseleave', function() {
            window.autoHideTimeouts[subDropdownId] = setTimeout(() => {
                if (!subContent.matches(':hover')) {
                    subContent.classList.remove('show');
                    subContent.style.opacity = '0';
                    subContent.style.visibility = 'hidden';
                    subContent.style.display = 'none';
                    localStorage.removeItem(subStateKey);
                    
                    // Reset parent submenu state if no sub-dropdowns are active
                    const activeSubDropdowns = parentContent.querySelectorAll('.sub-dropdown-content.show');
                    if (activeSubDropdowns.length === 0) {
                        window.stickyDropdownStates[parentDropdownId].isSubmenuActive = false;
                    }
                }
            }, 300);
        });
        
        // Mouse enter on sub-dropdown content
        subContent.addEventListener('mouseenter', function() {
            clearTimeout(window.autoHideTimeouts[subDropdownId]);
            clearTimeout(window.autoHideTimeouts[parentDropdownId]);
        });
        
        // Mouse leave on sub-dropdown content
        subContent.addEventListener('mouseleave', function() {
            window.autoHideTimeouts[subDropdownId] = setTimeout(() => {
                subContent.classList.remove('show');
                subContent.style.opacity = '0';
                subContent.style.visibility = 'hidden';
                subContent.style.display = 'none';
                localStorage.removeItem(subStateKey);
                
                // Reset parent submenu state if no sub-dropdowns are active
                const activeSubDropdowns = parentContent.querySelectorAll('.sub-dropdown-content.show');
                if (activeSubDropdowns.length === 0) {
                    window.stickyDropdownStates[parentDropdownId].isSubmenuActive = false;
                }
            }, 300);
        });
    });
}

// Show dropdown function
function showDropdown(content, toggle, dropdownId) {
    content.classList.add('show');
    content.style.opacity = '1';
    content.style.visibility = 'visible';
    content.style.display = 'block';
    toggle.classList.add('clicked');
    
    // Create and position dead zone
    createStickyDeadZone(content, toggle, dropdownId);
}

// Hide dropdown function
function hideDropdown(content, toggle, dropdownId) {
    window.stickyDropdownStates[dropdownId].isClosingInProgress = true;
    
    content.classList.remove('show');
    content.style.opacity = '0';
    content.style.visibility = 'hidden';
    content.style.display = 'none';
    toggle.classList.remove('clicked');
    
    // Remove dead zone
    removeStickyDeadZone(dropdownId);
    
    // Hide all sub-dropdowns
    const subDropdowns = content.querySelectorAll('.sub-dropdown-content');
    subDropdowns.forEach(subContent => {
        subContent.classList.remove('show');
        subContent.style.opacity = '0';
        subContent.style.visibility = 'hidden';
        subContent.style.display = 'none';
    });
    
    setTimeout(() => {
        window.stickyDropdownStates[dropdownId].isClosingInProgress = false;
    }, 100);
}

// Create dead zone for smooth hover experience
function createStickyDeadZone(content, toggle, dropdownId) {
    removeStickyDeadZone(dropdownId); // Remove existing dead zone first
    
    const deadZone = document.createElement('div');
    deadZone.className = 'sticky-header-dead-zone';
    deadZone.id = `sticky-dead-zone-${dropdownId}`;
    
    const toggleRect = toggle.getBoundingClientRect();
    const contentRect = content.getBoundingClientRect();
    
    // Position dead zone between toggle and content
    deadZone.style.position = 'fixed';
    deadZone.style.left = `${Math.min(toggleRect.left, contentRect.left)}px`;
    deadZone.style.top = `${toggleRect.bottom}px`;
    deadZone.style.width = `${Math.max(toggleRect.width, contentRect.width)}px`;
    deadZone.style.height = `${Math.abs(contentRect.top - toggleRect.bottom)}px`;
    deadZone.style.zIndex = '999';
    deadZone.style.backgroundColor = 'transparent';
    deadZone.style.pointerEvents = 'auto';
    
    document.body.appendChild(deadZone);
}

// Remove dead zone
function removeStickyDeadZone(dropdownId) {
    const existingDeadZone = document.getElementById(`sticky-dead-zone-${dropdownId}`);
    if (existingDeadZone) {
        existingDeadZone.remove();
    }
}

// Close other sticky dropdowns
function closeOtherStickyDropdowns(currentDropdownId) {
    if (!window.stickyDropdownStates) return;
    
    Object.keys(window.stickyDropdownStates).forEach(dropdownId => {
        if (dropdownId !== currentDropdownId) {
            const index = dropdownId.split('-')[2];
            const content = document.querySelector(`.sticky-header .dropdown:nth-child(${parseInt(index) + 1}) .dropdown-content, .sticky-header .dropdown:nth-child(${parseInt(index) + 1}) .dropdown-content-second`);
            const toggle = document.querySelector(`.sticky-header .dropdown:nth-child(${parseInt(index) + 1}) .dropdown-toggle, .sticky-header .dropdown:nth-child(${parseInt(index) + 1}) .dropdown-toggle-second`);
            
            if (content && toggle) {
                hideDropdown(content, toggle, dropdownId);
                window.stickyDropdownStates[dropdownId].isClickOpened = false;
                localStorage.removeItem(`sticky_menu_${index}_open`);
            }
        }
    });
}

// Close all sticky dropdowns
function closeAllStickyDropdowns() {
    if (!window.stickyDropdownStates) return;
    
    Object.keys(window.stickyDropdownStates).forEach(dropdownId => {
        const index = dropdownId.split('-')[2];
        const dropdown = document.querySelector(`.sticky-header .dropdown:nth-child(${parseInt(index) + 1})`);
        
        if (dropdown) {
            const content = dropdown.querySelector('.dropdown-content, .dropdown-content-second');
            const toggle = dropdown.querySelector('.dropdown-toggle, .dropdown-toggle-second');
            
            if (content && toggle) {
                hideDropdown(content, toggle, dropdownId);
                window.stickyDropdownStates[dropdownId].isClickOpened = false;
                window.stickyDropdownStates[dropdownId].isSubmenuActive = false;
            }
        }
        
        // Clean up localStorage
        localStorage.removeItem(`sticky_menu_${index}_open`);
        
        // Clean up sub-dropdown states
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith(`sticky_submenu_${dropdownId}_`) && key.endsWith('_open')) {
                localStorage.removeItem(key);
            }
        });
    });
    
    // Clean up all dead zones
    const deadZones = document.querySelectorAll('.sticky-header-dead-zone, .sub-dropdown-dead-zone');
    deadZones.forEach(zone => zone.remove());
}

// Handle window resize
window.addEventListener('resize', function() {
    clearAllDropdownStates();
    
    // Reinitialize dropdowns based on new screen size
    const stickyHeader = document.querySelector('.sticky-header');
    if (stickyHeader) {
        // Clear existing event listeners and reinitialize
        setTimeout(() => {
            initializeStickyDropdowns(stickyHeader);
            if (window.innerWidth <= 768) {
                initMobileDropdowns();
            }
        }, 100);
    }
});

// Handle page visibility change
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        clearAllDropdownStates();
    }
});

// Cleanup on page unload
window.addEventListener('beforeunload', function() {
    clearAllDropdownStates();
});

console.log('Responsive sticky header script loaded successfully');

// Force burger menu creation after everything loads
setTimeout(() => {
    const stickyHeader = document.querySelector('.sticky-header');
    if (!stickyHeader) return;
    
    // Force show mobile header elements
    const mobileHeaderTop = stickyHeader.querySelector('.mobile-header-top');
    if (mobileHeaderTop) {
        mobileHeaderTop.style.display = 'flex !important';
        mobileHeaderTop.style.visibility = 'visible';
    }
    
    // Force create burger menu if missing
    let burgerMenu = stickyHeader.querySelector('.burger-menu');
    if (!burgerMenu && mobileHeaderTop) {
        burgerMenu = document.createElement('button');
        burgerMenu.className = 'burger-menu';
        burgerMenu.style.display = 'flex';
        burgerMenu.innerHTML = `
            <div class="burger-line"></div>
            <div class="burger-line"></div>
            <div class="burger-line"></div>
        `;
        mobileHeaderTop.appendChild(burgerMenu);
        
        // Add click event
        burgerMenu.addEventListener('click', function(e) {
            e.preventDefault();
            const mobileNav = document.querySelector('.sticky-header .mobile-nav');
            if (mobileNav) {
                burgerMenu.classList.toggle('active');
                mobileNav.classList.toggle('active');
            }
        });
    }
    
    console.log('Burger menu forced creation completed');
}, 1000);