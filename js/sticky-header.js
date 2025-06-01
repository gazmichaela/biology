//---------STICKY HEADER FUNCTIONALITY-------------//
// Globální sledování timeoutů pro každý dropdown
window.dropdownTimeouts = window.dropdownTimeouts || {};
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
    margin: 0 1.5vmax;
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
    transition: opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1), visibility 0s 0.5s;
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
    transition: opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1), visibility 0s;
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
                if (scrollY <= mainHeaderHeight) {
                    stickyHeader.classList.remove('visible');
                    stickyHeader.classList.remove('scrolled');
                    
                    // Set transform directly for immediate hiding without animation
                    stickyHeader.style.transform = 'translateY(-100%)';
                    stickyHeader.style.transition = 'none';
                } else {
                    // Restore normal transition behavior
                    stickyHeader.style.transition = '';
                    stickyHeader.style.transform = '';
                    
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
            stickyHeader.style.transition = '';
            stickyHeader.style.transform = '';
            stickyHeader.classList.add('visible');
            
            if (scrollY > mainHeaderHeight + 100) {
                stickyHeader.classList.add('scrolled');
            }
            
            console.log('Sticky header shown on page load at scroll position:', scrollY);
        }
    })();
    
    // Initialize dropdown functionality for the sticky header
    initializeStickyDropdowns();
    
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

// Mouse movement tracking utility
const MouseTracker = {
    lastPositions: [],
    maxPositions: 10,
    lastMoveTime: 0,
    
    trackMousePosition: function(e) {
        const now = Date.now();
        
        if (now - this.lastMoveTime > 30) {
            this.lastMoveTime = now;
            
            this.lastPositions.push({
                x: e.clientX,
                y: e.clientY,
                time: now
            });
            
            if (this.lastPositions.length > this.maxPositions) {
                this.lastPositions.shift();
            }
        }
    },
    
    init: function() {
        document.addEventListener('mousemove', (e) => {
            this.trackMousePosition(e);
        });
        
        console.log('Mouse movement tracking initialized');
    },
    
    isMovingToward: function(element) {
        if (this.lastPositions.length < 3) return false;
        
        const rect = element.getBoundingClientRect();
        const elementCenter = {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2
        };
        
        const pos1 = this.lastPositions[this.lastPositions.length - 1];
        const pos2 = this.lastPositions[this.lastPositions.length - 3];
        
        const moveVector = {
            x: pos1.x - pos2.x,
            y: pos1.y - pos2.y
        };
        
        const toElementVector = {
            x: elementCenter.x - pos1.x,
            y: elementCenter.y - pos1.y
        };
        
        const dotProduct = moveVector.x * toElementVector.x + moveVector.y * toElementVector.y;
        
        return dotProduct > 0;
    },
    
    getCurrentSpeed: function() {
        if (this.lastPositions.length < 2) return 0;
        
        const pos1 = this.lastPositions[this.lastPositions.length - 1];
        const pos2 = this.lastPositions[this.lastPositions.length - 2];
        
        const dx = pos1.x - pos2.x;
        const dy = pos1.y - pos2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        const timeDiff = (pos1.time - pos2.time) / 1000;
        
        return timeDiff > 0 ? distance / timeDiff : 0;
    }
};

// Function to clear all dropdown states
function clearAllDropdownStates() {
    try {
        localStorage.removeItem('stickyDropdownStates');
        if (window.stickyDropdownStates) {
            window.stickyDropdownStates = {};
        }
        console.log('All dropdown states cleared');
    } catch (e) {
        console.error('Error clearing dropdown states:', e);
    }
}

// Initialize dropdowns specifically for the sticky header
function initializeStickyDropdowns() {
    const stickyHeader = document.querySelector('.sticky-header');
    if (!stickyHeader) return;
    
    // Initialize mouse tracking
    MouseTracker.init();
    
    // Find all dropdown toggles in the sticky header
    const dropdownToggles = stickyHeader.querySelectorAll('.dropdown-toggle, .dropdown-toggle-second');
    
    
    console.log(`Found ${dropdownToggles.length} dropdown toggles in sticky header`);
    // NOVÉ: Event listener pro celý sticky header
let headerHoverTimeout;


stickyHeader.addEventListener('mouseleave', (e) => {
    console.log('Mouse left sticky header completely');
    
    headerHoverTimeout = setTimeout(() => {
        // Zavřeme všechny aktivní dropdowny
        stickyHeader.querySelectorAll('.dropdown-content.show, .dropdown-content-second.show').forEach(content => {
            const parentDropdown = content.closest('.dropdown');
            const dropdownId = parentDropdown?.getAttribute('data-dropdown-id');
            
            content.classList.remove('show');
            content.style.opacity = '0';
            content.style.visibility = 'hidden';
            content.setAttribute('data-hiding', 'true');
            
            setTimeout(() => {
                content.style.display = 'none';
            }, 300);
            
            if (dropdownId) {
                window.stickyDropdownStates[dropdownId] = false;
                saveDropdownStates();
            }
        });
        
        // PŘIDAT: Zavřeme všechny aktivní subdropdowny
        stickyHeader.querySelectorAll('.sub-dropdown-content.show').forEach(subContent => {
            subContent.classList.remove('show');
            subContent.style.opacity = '0';
            subContent.style.visibility = 'hidden';
            subContent.setAttribute('data-hiding', 'true');
            
            setTimeout(() => {
                subContent.style.display = 'none';
            }, 200);
        });
        
        // Skryjeme dead zones
        document.querySelectorAll('[class*="dead-zone"]').forEach(zone => {
            zone.style.display = 'none';
        });
        
        window.isSubmenuActive = false;
    }, 150);
});

stickyHeader.addEventListener('mouseenter', () => {
    clearTimeout(headerHoverTimeout);
});
    
    // Save dropdown states
    window.stickyDropdownStates = window.stickyDropdownStates || {};
    
    // Check for navigation from different page and clear states if needed
    try {
        const currentUrl = window.location.href;
        const referrerUrl = document.referrer;
        
        if (!referrerUrl || new URL(referrerUrl).pathname !== new URL(currentUrl).pathname) {
            console.log('Navigation detected from different page, clearing dropdown states');
            clearAllDropdownStates();
        } else {
            const savedStates = localStorage.getItem('stickyDropdownStates');
            if (savedStates) {
                window.stickyDropdownStates = JSON.parse(savedStates);
                console.log('Restored dropdown states from localStorage:', window.stickyDropdownStates);
            }
        }
    } catch (e) {
        console.error('Error handling dropdown states:', e);
        clearAllDropdownStates();
    }
    
    // Apply strict pointer-event rules to button containers
    const buttonContainers = stickyHeader.querySelectorAll('.button-container');
    buttonContainers.forEach(container => {
        container.style.pointerEvents = 'none';
        
        Array.from(container.children).forEach(child => {
            child.style.pointerEvents = 'auto';
        });
    });
    
    // Store mouse position globally for checks
    document.addEventListener('mousemove', (e) => {
        window.lastMouseX = e.clientX;
        window.lastMouseY = e.clientY;
    });
    
    // Initialize each dropdown
    dropdownToggles.forEach((toggle, index) => {
        const dropdown = toggle.closest('.dropdown');
        if (!dropdown) {
            console.warn(`Toggle ${index} has no parent dropdown container`);
            return;
        }
        
        const content = dropdown.querySelector('.dropdown-content, .dropdown-content-second');
        if (!content) {
            console.warn(`Toggle ${index} has no associated dropdown content`);
            return;
        }
        
        const mainButton = dropdown.querySelector('.main-button, .maine-button');
        
        console.log(`Initializing dropdown ${index}:`, {
            toggle: toggle.className,
            content: content.className,
            mainButton: mainButton?.className
        });
        
        // Set unique ID for this dropdown
        const dropdownId = `sticky-dropdown-${index}`;
        dropdown.setAttribute('data-dropdown-id', dropdownId);
        
        // Create dead zone for smoother hover behavior
        const deadZoneId = `sticky-header-dead-zone-${index}`;
        let deadZone = document.getElementById(deadZoneId);
        
        if (!deadZone) {
            deadZone = document.createElement('div');
            deadZone.className = 'sticky-header-dead-zone';
            deadZone.id = deadZoneId;
            deadZone.style.display = 'none';
            document.body.appendChild(deadZone);
        }
        
        // Variables to track state
        let hideTimeout;
        let isOpen = false;
        let hoverIntentTimeout;
        let intentDelay = 50;
        
    function showDropdownImmediate() {
    // Okamžitě zastav všechny timeouty a animace
    clearTimeout(hideTimeout);
    clearTimeout(hoverIntentTimeout);
    
    // Zrušíme timeout pro skrývání pokud běží
    if (window.dropdownTimeouts && window.dropdownTimeouts[dropdownId]) {
        clearTimeout(window.dropdownTimeouts[dropdownId]);
        delete window.dropdownTimeouts[dropdownId];
    }
    
    // Označíme, že dropdown se už neskrývá
    content.removeAttribute('data-hiding');
    
    // Zavři ostatní dropdowny
    stickyHeader.querySelectorAll('.dropdown-content, .dropdown-content-second').forEach(el => {
        if (el !== content && el.classList.contains('show')) {
            el.classList.remove('show');
            el.style.opacity = '0';
            el.style.visibility = 'hidden';
            el.style.display = 'none';
        }
    });
    
    // Okamžitě zobraz tento dropdown
    content.style.transition = 'none';
    content.style.display = 'block';
    content.style.opacity = '1';
    content.style.visibility = 'visible';
    content.classList.add('show');
    
    // Obnov transition
    setTimeout(() => {
        content.style.transition = '';
    }, 1);
    
    isOpen = true;
    positionDeadZone();
    deadZone.style.display = 'block';
    
    // Ulož stav
    window.stickyDropdownStates[dropdownId] = true;
    saveDropdownStates();
    
    console.log(`Dropdown ${dropdownId} opened immediately`);
}
        // Check saved state
        if (window.stickyDropdownStates[dropdownId] === true) {
            setTimeout(() => {
                showDropdown(true);
                console.log(`Reopened dropdown ${dropdownId} from saved state`);
            }, 500);
        }
        
        // Store submenu active state
        window.isSubmenuActive = false;
        
        window.setSubmenuActive = function(active) {
            window.isSubmenuActive = active;
        };
        
        // Position dead zone between toggle and dropdown content
        function positionDeadZone() {
            const toggleRect = toggle.getBoundingClientRect();
            const contentRect = content.getBoundingClientRect();
            
          const padding = 1;

deadZone.style.left = (toggleRect.left + window.scrollX + padding) + 'px';
deadZone.style.width = (toggleRect.width - 2 * padding) + 'px';
deadZone.style.height = Math.max(2, contentRect.top - toggleRect.bottom) + 'px';
            deadZone.style.zIndex = '999';
        }
        
        // Show dropdown
        function showDropdown(fromSavedState = false) {
            clearTimeout(hideTimeout);
            clearTimeout(hoverIntentTimeout);
            
            // Close all other dropdowns first
            stickyHeader.querySelectorAll('.dropdown-content, .dropdown-content-second').forEach(el => {
                const parentDropdown = el.closest('.dropdown');
                const elDropdownId = parentDropdown?.getAttribute('data-dropdown-id');
                
                if (el !== content && el.classList.contains('show')) {
                    el.classList.remove('show');
                    el.style.opacity = '0';
                    el.style.visibility = 'hidden';
                    
                    if (elDropdownId && elDropdownId !== dropdownId) {
                        window.stickyDropdownStates[elDropdownId] = false;
                        saveDropdownStates();
                    }
                    
                    setTimeout(() => {
                        el.style.display = 'none';
                    }, 300);
                }
            });
            
            // Make sure content is visible first for proper positioning
            content.style.display = 'block';
            content.style.opacity = '0';
            content.style.visibility = 'visible';
            
            // Force browser to calculate positioning
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    content.classList.add('show');
                    content.style.opacity = '1';
                });
                
                isOpen = true;
                
                positionDeadZone();
                deadZone.style.display = 'block';
                
                // Save state
                window.stickyDropdownStates[dropdownId] = true;
                saveDropdownStates();
                
                console.log(`Dropdown ${dropdownId} opened`);
            });
        }
function hideDropdown() {
    clearTimeout(hideTimeout);
    clearTimeout(hoverIntentTimeout);
    
    if (!isOpen) return;
    
    // Označíme, že dropdown se skrývá
    content.setAttribute('data-hiding', 'true');
            
            // Check if submenu is active
            if (window.isSubmenuActive) {
                console.log('Submenu is active, delaying dropdown hide');
                hideTimeout = setTimeout(hideDropdown, 100);
                return;
            }
            
            // Additional check - is mouse still in relevant area?
            const mouseX = window.lastMouseX || 0;
            const mouseY = window.lastMouseY || 0;
            
            const toggleRect = toggle.getBoundingClientRect();
            const contentRect = content.getBoundingClientRect();
            const deadZoneRect = deadZone.getBoundingClientRect();
            
            const isInToggle = mouseX >= toggleRect.left && mouseX <= toggleRect.right && 
                              mouseY >= toggleRect.top && mouseY <= toggleRect.bottom;
            const isInContent = mouseX >= contentRect.left && mouseX <= contentRect.right && 
                               mouseY >= contentRect.top && mouseY <= contentRect.bottom;
            const isInDeadZone = deadZone.style.display !== 'none' && 
                                mouseX >= deadZoneRect.left && mouseX <= deadZoneRect.right && 
                                mouseY >= deadZoneRect.top && mouseY <= deadZoneRect.bottom;
            
            if (isInToggle || isInContent || isInDeadZone) {
                console.log('Mouse still in dropdown area, not hiding');
                return;
            }
            
            content.classList.remove('show');
            content.style.opacity = '0';
            content.style.visibility = 'hidden';
            
            
         const animationTimeout = setTimeout(() => {
    // Zkontrolujeme, jestli se dropdown nerozhodl znovu zobrazit během animace
    if (content.getAttribute('data-hiding') !== 'true') {
        console.log(`Dropdown ${dropdownId} hide cancelled during animation`);
        return;
    }
    
    content.style.display = 'none';
    deadZone.style.display = 'none';
                
                // Také skryjeme submenu po dokončení animace
                const subDropdownContents = content.querySelectorAll('.sub-dropdown-content');
                subDropdownContents.forEach(subContent => {
                    if (subContent) {
                        subContent.style.opacity = '0';
                        subContent.style.visibility = 'hidden';
                        subContent.style.display = 'none';
                        subContent.classList.remove('show');
                    }
                });
                
                // Skryjeme všechny sub dead zones pro tento dropdown
                const subDeadZones = document.querySelectorAll(`[id^="sub-dropdown-dead-zone-${dropdownId}"]`);
                subDeadZones.forEach(subDeadZone => {
                    if (subDeadZone) {
                        subDeadZone.style.display = 'none';
                    }
                });
                
                // Resetujeme stavy
                isOpen = false;
                window.isSubmenuActive = false;
                
                // Odstranění stavu z storage
                window.stickyDropdownStates[dropdownId] = false;
                saveDropdownStates();
                
                console.log(`Dropdown ${dropdownId} completely closed with cleanup`);
                
            }, 300);
            
            // Store timeout ID for potential clearing
            window.dropdownTimeouts = window.dropdownTimeouts || {};
            window.dropdownTimeouts[dropdownId] = animationTimeout;
        }
        
        function handleHoverIntent(show = true) {
            clearTimeout(hoverIntentTimeout);
            
            if (show) {
                hoverIntentTimeout = setTimeout(() => {
                    showDropdown();
                }, intentDelay);
            } else {
                hoverIntentTimeout = setTimeout(() => {
                    hideDropdown();
                }, 100);
            }
        }
        
toggle.addEventListener('mouseenter', () => {
    console.log(`Mouse entered toggle ${dropdownId}`);
    
    // Aktualizujeme čas posledního pohybu myši
    window.lastMouseMoveTime = Date.now();
    
    // Zavření ostatních dropdown menu
    stickyHeader.querySelectorAll('.dropdown-content, .dropdown-content-second').forEach(el => {
        const parentDropdown = el.closest('.dropdown');
        const elDropdownId = parentDropdown?.getAttribute('data-dropdown-id');
        
        if (el !== content && el.classList.contains('show') && elDropdownId !== dropdownId) {
            el.classList.remove('show');
            el.style.opacity = '0';
            el.style.visibility = 'hidden';
            setTimeout(() => {
                el.style.display = 'none';
            }, 300);
            
            if (elDropdownId) {
                window.stickyDropdownStates[elDropdownId] = false;
                saveDropdownStates();
            }
        }
    });
    
    // Okamžitě zruš VŠECHNY timeouty
    clearTimeout(hideTimeout);
    clearTimeout(hoverIntentTimeout);
    
    // Zrušíme všechny dropdown timeouty při najetí na hlavní tlačítko
    if (window.dropdownTimeouts && window.dropdownTimeouts[dropdownId]) {
        clearTimeout(window.dropdownTimeouts[dropdownId]);
    }
    
    // Okamžitě zobraz dropdown bez jakéhokoliv delay
    // Použijeme requestAnimationFrame pro spolehlivější zobrazení
    requestAnimationFrame(() => {
        showDropdownImmediate();
    });
    
    // Uložíme informaci o tom, že kurzor je nad tlačítkem
    window.stickyDropdownStates[dropdownId + '_mouseOver'] = true;
    saveDropdownStates();
});
toggle.addEventListener('mouseleave', (e) => {
    console.log(`Mouse left toggle ${dropdownId}`);
    
    // Odstraníme informaci o kurzoru nad tlačítkem
    delete window.stickyDropdownStates[dropdownId + '_mouseOver'];
    saveDropdownStates();
    
    setTimeout(() => {
        const isOverContent = content.matches(':hover');
        const isOverDeadZone = deadZone.matches(':hover');
        const isOverStickyHeader = stickyHeader.matches(':hover');
        
        // Zkontrolujeme, kam kurzor směřuje
        const toElement = e.relatedTarget;
        
 // Kontrola, jestli kurzor nejde do jiného dropdownu nebo jeho obsahu
const isGoingToAnotherDropdown = toElement && (
    toElement.closest('.dropdown-toggle') || 
    toElement.closest('.dropdown-content') ||
    toElement.closest('.dropdown-content-second')
);

if (isGoingToAnotherDropdown && toElement.closest('.dropdown') !== toggle.closest('.dropdown')) {
    console.log(`Mouse going to another dropdown, closing current dropdown ${dropdownId}`);
    hideTimeout = setTimeout(() => {
        hideDropdown();
    }, 100);
    return;
}
        // Pokud kurzor nejde do mrtvé zóny nebo do podmenu, zahájíme skrývání
        if (toElement !== deadZone && !deadZone.contains(toElement) && 
            toElement !== content && !content.contains(toElement) &&
            !isOverContent && !isOverDeadZone) {
            
            hideTimeout = setTimeout(() => {
                hideDropdown();
            }, 150);
        }
    }, 30);
});
        // Click handler for toggle
        toggle.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            console.log(`Toggle ${dropdownId} clicked`);
            
            // Auto close after 5 seconds
            setTimeout(() => {
                if (isOpen) {
                    hideDropdown();
                }
            }, 5000);
            
            if (isOpen) {
                hideDropdown();
            } else {
                showDropdown();
            }
        });
        
    // Event listeners for dropdown content
content.addEventListener('mouseenter', () => {
    console.log(`Mouse entered content ${dropdownId}`);
    clearTimeout(hideTimeout);
    clearTimeout(hoverIntentTimeout);
    
    // Pokud se dropdown skrývá, znovu ho zobrazíme
    if (content.getAttribute('data-hiding') === 'true') {
        console.log(`Re-showing dropdown ${dropdownId} during hide animation`);
        showDropdownImmediate();
    }
});
        content.addEventListener('mouseleave', () => {
            console.log(`Mouse left content ${dropdownId}`);
            
            setTimeout(() => {
                const isOverDeadZone = deadZone.matches(':hover');
                const isOverToggle = toggle.matches(':hover');
                
                if (!isOverDeadZone && !isOverToggle) {
                    handleHoverIntent(false);
                }
            }, 50);
        });
        
    // Event listeners for dead zone
deadZone.addEventListener('mouseenter', () => {
    console.log(`Mouse entered dead zone ${dropdownId}`);
    clearTimeout(hideTimeout);
    clearTimeout(hoverIntentTimeout);
    
    // Pokud se dropdown skrývá, znovu ho zobrazíme
    if (content.getAttribute('data-hiding') === 'true') {
        console.log(`Re-showing dropdown ${dropdownId} from dead zone during hide`);
        showDropdownImmediate();
    }
});
        
        deadZone.addEventListener('mouseleave', () => {
            console.log(`Mouse left dead zone ${dropdownId}`);
            handleHoverIntent(false);
        });
        
        // Main button click handler
        if (mainButton) {
            mainButton.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                console.log(`Main button clicked for dropdown ${dropdownId}`);
                
               const href = mainButton.getAttribute('href');
                if (href) {
                    clearAllDropdownStates();
                    window.location.href = href;
                } else {
                    console.warn('Main button has no href attribute');
                }
            });
        }
        
        // Initialize sub-dropdowns within this dropdown
        initializeSubDropdowns(content, dropdownId);
    });
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', (e) => {
        const isInsideDropdown = e.target.closest('.sticky-header .dropdown');
        if (!isInsideDropdown) {
            stickyHeader.querySelectorAll('.dropdown-content, .dropdown-content-second').forEach(content => {
                if (content.classList.contains('show')) {
                    content.classList.remove('show');
                    content.style.opacity = '0';
                    content.style.visibility = 'hidden';
                    setTimeout(() => {
                        content.style.display = 'none';
                    }, 300);
                }
            });
            clearAllDropdownStates();
        }
    });
    
    console.log('Sticky header dropdowns initialized');
}

// Initialize sub-dropdowns within a parent dropdown
function initializeSubDropdowns(parentContent, parentDropdownId) {
    const subDropdownToggles = parentContent.querySelectorAll('.sub-dropdown-toggle');
    
    subDropdownToggles.forEach((subToggle, subIndex) => {
        const subContent = subToggle.nextElementSibling;
        if (!subContent || !subContent.classList.contains('sub-dropdown-content')) {
            console.warn(`Sub-dropdown toggle ${subIndex} has no associated content`);
            return;
        }
        
        const subDropdownId = `${parentDropdownId}-sub-${subIndex}`;
        subToggle.setAttribute('data-sub-dropdown-id', subDropdownId);
        
        console.log(`Initializing sub-dropdown ${subDropdownId}`);
        
        // Create dead zone for sub-dropdown
        const subDeadZoneId = `sub-dropdown-dead-zone-${parentDropdownId}-${subIndex}`;
        let subDeadZone = document.getElementById(subDeadZoneId);
        
        if (!subDeadZone) {
            subDeadZone = document.createElement('div');
            subDeadZone.className = 'sub-dropdown-dead-zone';
            subDeadZone.id = subDeadZoneId;
            subDeadZone.style.display = 'none';
            document.body.appendChild(subDeadZone);
        }
        
        let subHideTimeout;
        let isSubOpen = false;
        
        // Position sub-dropdown dead zone
        function positionSubDeadZone() {
            const toggleRect = subToggle.getBoundingClientRect();
            const contentRect = subContent.getBoundingClientRect();
            
            const padding = 1;
            
            subDeadZone.style.left = (toggleRect.right + window.scrollX) + 'px';
            subDeadZone.style.top = (toggleRect.top + window.scrollY) + 'px';
            subDeadZone.style.width = Math.max(5, contentRect.left - toggleRect.right) + 'px';
           subDeadZone.style.height = toggleRect.height + 'px';
            subDeadZone.style.zIndex = '999';
        }
        
       // Show sub-dropdown
function showSubDropdown() {
    clearTimeout(subHideTimeout);
    
    // Zrušíme timeout pro skrývání pokud běží
    if (window.dropdownTimeouts && window.dropdownTimeouts[subDropdownId]) {
        clearTimeout(window.dropdownTimeouts[subDropdownId]);
        delete window.dropdownTimeouts[subDropdownId];
    }
    
    // Označíme, že sub-dropdown se už neskrývá
    subContent.removeAttribute('data-hiding');
            
            // Close other sub-dropdowns in the same parent
            parentContent.querySelectorAll('.sub-dropdown-content').forEach(el => {
                if (el !== subContent && el.classList.contains('show')) {
                    el.classList.remove('show');
                    el.style.opacity = '0';
                    el.style.visibility = 'hidden';
                    setTimeout(() => {
                        el.style.display = 'none';
                    }, 200);
                }
            });
            
            subContent.style.display = 'block';
            subContent.style.opacity = '0';
            subContent.style.visibility = 'visible';
            
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    subContent.classList.add('show');
                    subContent.style.opacity = '1';
                });
                
                isSubOpen = true;
                window.setSubmenuActive(true);
                
                positionSubDeadZone();
                subDeadZone.style.display = 'block';
                
                console.log(`Sub-dropdown ${subDropdownId} opened`);
            });
        }
        // Pokud myš opustila sticky header úplně, nezahajuj skrývání
const stickyHeaderRect = document.querySelector('.sticky-header').getBoundingClientRect();
const mouseX = window.lastMouseX || 0;
const mouseY = window.lastMouseY || 0;

const isMouseInHeader = mouseX >= stickyHeaderRect.left && 
                       mouseX <= stickyHeaderRect.right && 
                       mouseY >= stickyHeaderRect.top && 
                       mouseY <= stickyHeaderRect.bottom;

// Pokud myš není v headeru, použij kratší delay
const hideDelay = isMouseInHeader ? 200 : 100;
      // Hide sub-dropdown
function hideSubDropdown() {
    clearTimeout(subHideTimeout);
    
    if (!isSubOpen) return;
    
    // Označíme, že sub-dropdown se skrývá
    subContent.setAttribute('data-hiding', 'true');
            subContent.classList.remove('show');
            subContent.style.opacity = '0';
            subContent.style.visibility = 'hidden';
            
            const subAnimationTimeout = setTimeout(() => {
    // Zkontrolujeme, jestli se sub-dropdown nerozhodl znovu zobrazit během animace
    if (subContent.getAttribute('data-hiding') !== 'true') {
        console.log(`Sub-dropdown ${subDropdownId} hide cancelled during animation`);
        return;
    }
    
    subContent.style.display = 'none';
    subDeadZone.style.display = 'none';
    isSubOpen = false;
    window.setSubmenuActive(false);
    
    console.log(`Sub-dropdown ${subDropdownId} completely closed`);
}, hideDelay);

// Uložíme timeout ID pro možné zrušení
window.dropdownTimeouts = window.dropdownTimeouts || {};
window.dropdownTimeouts[subDropdownId] = subAnimationTimeout;
            
            subDeadZone.style.display = 'none';
            isSubOpen = false;
            window.setSubmenuActive(false);
            
            console.log(`Sub-dropdown ${subDropdownId} closed`);
        }
        
        // Event listeners for sub-dropdown toggle
  subToggle.addEventListener('mouseenter', () => {
    console.log(`Mouse entered sub-toggle ${subDropdownId}`);
    clearTimeout(subHideTimeout);
    
    // Pokud se sub-dropdown skrývá, okamžitě ho znovu zobrazíme
    if (subContent.getAttribute('data-hiding') === 'true') {
        console.log(`Re-showing sub-dropdown ${subDropdownId} from toggle during hide`);
        showSubDropdownImmediate();
    } else if (!isSubOpen) {
        setTimeout(() => {
            if (subToggle.matches(':hover')) {
                showSubDropdown();
            }
        }, 80); // Zkráceno z 100ms na 80ms
    }
});
        
      subHideTimeout = setTimeout(() => {
    const isOverSubContent = subContent.matches(':hover');
    const isOverSubDeadZone = subDeadZone.matches(':hover');
    
    if (!isOverSubContent && !isOverSubDeadZone) {
        hideSubDropdown();
    }
}, 100); // Zkráceno z 150ms na 100ms
        
   // Event listeners for sub-dropdown content
subContent.addEventListener('mouseenter', () => {
    console.log(`Mouse entered sub-content ${subDropdownId}`);
    clearTimeout(subHideTimeout);
    
    // Pokud se sub-dropdown skrývá, znovu ho zobrazíme
    if (subContent.getAttribute('data-hiding') === 'true') {
        console.log(`Re-showing sub-dropdown ${subDropdownId} during hide animation`);
        showSubDropdownImmediate();
    }
});
        
        subContent.addEventListener('mouseleave', () => {
            console.log(`Mouse left sub-content ${subDropdownId}`);
            subHideTimeout = setTimeout(() => {
                const isOverSubToggle = subToggle.matches(':hover');
                const isOverSubDeadZone = subDeadZone.matches(':hover');
                
                if (!isOverSubToggle && !isOverSubDeadZone) {
                    hideSubDropdown();
                }
            }, 150);
        });
        // Show sub-dropdown immediately (pro přerušení animace skrývání)
function showSubDropdownImmediate() {
    clearTimeout(subHideTimeout);
    
    // Zrušíme timeout pro skrývání pokud běží
    if (window.dropdownTimeouts && window.dropdownTimeouts[subDropdownId]) {
        clearTimeout(window.dropdownTimeouts[subDropdownId]);
        delete window.dropdownTimeouts[subDropdownId];
    }
    
    // Označíme, že sub-dropdown se už neskrývá
    subContent.removeAttribute('data-hiding');
    
    // Close other sub-dropdowns in the same parent
    parentContent.querySelectorAll('.sub-dropdown-content').forEach(el => {
        if (el !== subContent && el.classList.contains('show')) {
            el.classList.remove('show');
            el.style.opacity = '0';
            el.style.visibility = 'hidden';
            setTimeout(() => {
                el.style.display = 'none';
            }, 200);
        }
    });
    
    // Okamžitě zobraz sub-dropdown
    subContent.style.transition = 'none';
    subContent.style.display = 'block';
    subContent.style.opacity = '1';
    subContent.style.visibility = 'visible';
    subContent.classList.add('show');
    
    // Obnov transition
    setTimeout(() => {
        subContent.style.transition = '';
    }, 1);
    
    isSubOpen = true;
    window.setSubmenuActive(true);
    positionSubDeadZone();
    subDeadZone.style.display = 'block';
    
    console.log(`Sub-dropdown ${subDropdownId} opened immediately`);
}
      // Event listeners for sub-dropdown dead zone
subDeadZone.addEventListener('mouseenter', () => {
    console.log(`Mouse entered sub-dead zone ${subDropdownId}`);
    clearTimeout(subHideTimeout);
    
    // Pokud se sub-dropdown skrývá, znovu ho zobrazíme
    if (subContent.getAttribute('data-hiding') === 'true') {
        console.log(`Re-showing sub-dropdown ${subDropdownId} from dead zone during hide`);
        showSubDropdownImmediate();
    }
});
        
        subDeadZone.addEventListener('mouseleave', () => {
            console.log(`Mouse left sub-dead zone ${subDropdownId}`);
            subHideTimeout = setTimeout(hideSubDropdown, 100);
        });
        
        // Click handler for sub-dropdown links
        const subLinks = subContent.querySelectorAll('a');
        subLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (href) {
                    clearAllDropdownStates();
                    // Allow default navigation behavior
                }
            });
        });
    });
}

// Save dropdown states to localStorage
function saveDropdownStates() {
    try {
        localStorage.setItem('stickyDropdownStates', JSON.stringify(window.stickyDropdownStates));
        console.log('Dropdown states saved:', window.stickyDropdownStates);
    } catch (e) {
        console.error('Error saving dropdown states:', e);
    }
}

// Initialize page visibility change handler
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        // Page is being hidden (user switched tabs, etc.)
        console.log('Page hidden, saving dropdown states');
        saveDropdownStates();
    } else {
        // Page is visible again
        console.log('Page visible again');
    }
});

// Initialize page unload handler
window.addEventListener('beforeunload', function() {
    saveDropdownStates();
    console.log('Page unloading, dropdown states saved');
});

// Initialize page focus handlers
window.addEventListener('blur', function() {
    console.log('Window lost focus');
    saveDropdownStates();
});

window.addEventListener('focus', function() {
    console.log('Window gained focus');
});
// PŘIDAT GLOBÁLNÍ FUNKCI pro zavření všech menu kromě specifikovaného
window.closeAllMenusExcept = function(exceptMenuId) {
    const stickyHeader = document.querySelector('.sticky-header');
    if (!stickyHeader) return;
    
    stickyHeader.querySelectorAll('.dropdown-content, .dropdown-content-second').forEach(el => {
        const parentDropdown = el.closest('.dropdown');
        const elDropdownId = parentDropdown?.getAttribute('data-dropdown-id');
        
        if (elDropdownId !== exceptMenuId && el.classList.contains('show')) {
            el.classList.remove('show');
            el.style.opacity = '0';
            el.style.visibility = 'hidden';
            setTimeout(() => {
                el.style.display = 'none';
            }, 300);
            
            if (elDropdownId) {
                window.stickyDropdownStates[elDropdownId] = false;
                saveDropdownStates();
            }
        }
    });
};
console.log('Sticky header script fully loaded and initialized');