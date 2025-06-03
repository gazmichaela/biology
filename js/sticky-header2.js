//---------STICKY HEADER FUNCTIONALITY WITH CLICK TOGGLE-------------//
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

// ENHANCED function with click toggle functionality
function initializeStickyDropdowns() {
    const stickyHeader = document.querySelector('.sticky-header');
    if (!stickyHeader) return;
    
    // Initialize mouse tracking
    MouseTracker.init();
    
    // Find all dropdown toggles in the sticky header
    const dropdownToggles = stickyHeader.querySelectorAll('.dropdown-toggle, .dropdown-toggle-second');
    
    console.log(`Found ${dropdownToggles.length} dropdown toggles in sticky header`);
    
    // Initialize dropdown states if not exists
    if (!window.stickyDropdownStates) {
        window.stickyDropdownStates = {};
    }
    
    // Initialize click states tracking
    if (!window.dropdownClickStates) {
        window.dropdownClickStates = {};
    }
    
    // Initialize each dropdown toggle
    dropdownToggles.forEach((toggle, index) => {
        const dropdown = toggle.closest('.dropdown');
        if (!dropdown) {
            console.log(`No dropdown parent found for toggle ${index}`);
            return;
        }
        
        // Create unique ID for each dropdown
        const dropdownId = `sticky-dropdown-${index}`;
        dropdown.setAttribute('data-dropdown-id', dropdownId);
        
        // Find the corresponding dropdown content
        const dropdownContent = dropdown.querySelector('.dropdown-content, .dropdown-content-second');
        if (!dropdownContent) {
            console.log(`No dropdown content found for dropdown ${dropdownId}`);
            return;
        }
        
        // Initialize dropdown state
        window.stickyDropdownStates[dropdownId] = false;
        window.dropdownClickStates[dropdownId] = false;
        
        console.log(`Initializing dropdown ${dropdownId} with toggle:`, toggle, 'and content:', dropdownContent);
        
        // CLICK EVENT - Toggle dropdown
        toggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            console.log(`Click toggle for dropdown ${dropdownId}`);
            
            const isCurrentlyOpen = window.dropdownClickStates[dropdownId];
            
            // Close all other dropdowns first
            closeAllClickedDropdowns(dropdownId);
            
            if (isCurrentlyOpen) {
                // Close this dropdown
                hideDropdown(dropdownContent, dropdownId);
                toggle.classList.remove('clicked');
                window.dropdownClickStates[dropdownId] = false;
                
                // Clear auto-hide timeout
                if (window.autoHideTimeouts[dropdownId]) {
                    clearTimeout(window.autoHideTimeouts[dropdownId]);
                    delete window.autoHideTimeouts[dropdownId];
                }
            } else {
                // Open this dropdown
                showDropdown(dropdownContent, dropdownId);
                toggle.classList.add('clicked');
                window.dropdownClickStates[dropdownId] = true;
                
                // Set auto-hide timeout (5 seconds)
                setAutoHideTimeout(dropdownContent, dropdownId, toggle);
                // Přidej toto:
// Clear auto-hide timeout when hovering content
if (window.autoHideTimeouts[dropdownId]) {
    clearTimeout(window.autoHideTimeouts[dropdownId]);
    delete window.autoHideTimeouts[dropdownId];
}
            }
        });
        
        // MOUSE ENTER on toggle (arrow) - only for hover behavior when not clicked
        toggle.addEventListener('mouseenter', function(e) {
            // Only respond to hover if dropdown is not in clicked state
            if (!window.dropdownClickStates[dropdownId]) {
                e.stopPropagation();
                console.log(`Mouse entered toggle for dropdown ${dropdownId} (hover mode)`);
                
                // Clear any existing timeout
                if (window.dropdownTimeouts && window.dropdownTimeouts[dropdownId]) {
                    clearTimeout(window.dropdownTimeouts[dropdownId]);
                    delete window.dropdownTimeouts[dropdownId];
                }
                
                // Close other hover dropdowns first
                closeOtherHoverDropdowns(dropdownId);
                
                // Show this dropdown
                showDropdown(dropdownContent, dropdownId);
            }
        });
        
        // MOUSE LEAVE from toggle - only for hover behavior when not clicked
        toggle.addEventListener('mouseleave', function(e) {
            // Only respond to hover if dropdown is not in clicked state
            if (!window.dropdownClickStates[dropdownId]) {
                console.log(`Mouse left toggle for dropdown ${dropdownId} (hover mode)`);
                
                // Only schedule close if mouse is not moving toward dropdown content
                setTimeout(() => {
                    if (!dropdownContent.matches(':hover')) {
                        scheduleDropdownClose(dropdownContent, dropdownId, 300);
                    }
                }, 50);
            }
        });
        
  dropdownContent.addEventListener('mouseenter', function(e) {
    e.stopPropagation();
    console.log(`Mouse entered content for dropdown ${dropdownId}`);
    
    // Stop auto-hide timeout when hovering content in click mode
    if (window.dropdownClickStates[dropdownId] && window.autoHideTimeouts[dropdownId]) {
        clearTimeout(window.autoHideTimeouts[dropdownId]);
        delete window.autoHideTimeouts[dropdownId];
        console.log(`Cleared auto-hide timeout for ${dropdownId}`);
    }
    
    // Always show dropdown when hovering content (both hover and click modes)
    showDropdown(dropdownContent, dropdownId);
});
        
  dropdownContent.addEventListener('mouseleave', function(e) {
    console.log(`Mouse left content for dropdown ${dropdownId}`);
    
    if (window.dropdownClickStates[dropdownId]) {
        // Restart auto-hide timeout when leaving in click mode
        console.log(`Restarting auto-hide timeout for ${dropdownId}`);
        setAutoHideTimeout(dropdownContent, dropdownId, toggle);
    } else {
        // Only schedule close if not in clicked state (hover mode)
        scheduleDropdownClose(dropdownContent, dropdownId, 200);
    }
});
        // Initialize sub-dropdowns if any exist
        initializeSubDropdowns(dropdownContent, dropdownId);
    });
    
   // Click outside to close dropdowns
document.addEventListener('click', function(e) {
    const stickyHeader = document.querySelector('.sticky-header');
    
    // Check if click is outside sticky header
    if (!stickyHeader.contains(e.target)) {
        console.log('Click outside sticky header - closing all clicked dropdowns');
        closeAllClickedDropdowns();
    }
    // Check if click is inside sticky header but NOT on dropdown elements
    else if (stickyHeader.contains(e.target)) {
        // Don't close if clicking on dropdown toggles, dropdown content, or buttons
        const isDropdownElement = e.target.closest('.dropdown-toggle, .dropdown-toggle-second, .dropdown-content, .dropdown-content-second, .main-button, .maine-button');
        
        if (!isDropdownElement) {
            console.log('Click on sticky header background - closing all clicked dropdowns');
            closeAllClickedDropdowns();
        }
    }
});
    
    // Enhanced sticky header mouse leave behavior
    let headerHoverTimeout;

    stickyHeader.addEventListener('mouseleave', (e) => {
        console.log('Mouse left sticky header completely');
        
        headerHoverTimeout = setTimeout(() => {
            // Close all hover dropdowns (not clicked ones)
            stickyHeader.querySelectorAll('.dropdown-content.show, .dropdown-content-second.show').forEach(content => {
                const parentDropdown = content.closest('.dropdown');
                const dropdownId = parentDropdown?.getAttribute('data-dropdown-id');
                
                // Only close if not in clicked state
                if (dropdownId && !window.dropdownClickStates[dropdownId]) {
                    hideDropdown(content, dropdownId);
                }
            });
            
            // Close all active subdropdowns
            stickyHeader.querySelectorAll('.sub-dropdown-content.show').forEach(subContent => {
                const subToggle = subContent.previousElementSibling;
                const subDropdownId = subToggle?.getAttribute('data-sub-dropdown-id');
                
                hideSubDropdown(subContent, subDropdownId);
            });
            
            // Hide dead zones
            document.querySelectorAll('[class*="dead-zone"]').forEach(zone => {
                zone.style.display = 'none';
            });
            
            window.isSubmenuActive = false;
        }, 150);
    });

    stickyHeader.addEventListener('mouseenter', () => {
        clearTimeout(headerHoverTimeout);
    });
}

// Set auto-hide timeout for clicked dropdowns
function setAutoHideTimeout(dropdownContent, dropdownId, toggle) {
    // Clear existing timeout
    if (window.autoHideTimeouts[dropdownId]) {
        clearTimeout(window.autoHideTimeouts[dropdownId]);
    }
    
 window.autoHideTimeouts[dropdownId] = setTimeout(() => {
    console.log(`Auto-hiding dropdown ${dropdownId} after timeout`);
    hideDropdown(dropdownContent, dropdownId);
    
    // Close all sub-dropdowns in this dropdown at the same time
    // Immediately close all sub-dropdowns without animation
dropdownContent.querySelectorAll('.sub-dropdown-toggle').forEach(subToggle => {
    const subDropdownId = subToggle.getAttribute('data-sub-dropdown-id');
    const subContent = subToggle.nextElementSibling;
    
    if (subDropdownId && window.subDropdownClickStates[subDropdownId] && subContent) {
        // Close immediately without animation
        subContent.classList.remove('show');
        subContent.style.display = 'none';
        subContent.style.visibility = 'hidden';
        subContent.style.opacity = '0';
        subToggle.classList.remove('clicked');
        window.subDropdownClickStates[subDropdownId] = false;
        
        // Clear timeout
        if (window.subAutoHideTimeouts && window.subAutoHideTimeouts[subDropdownId]) {
            clearTimeout(window.subAutoHideTimeouts[subDropdownId]);
            delete window.subAutoHideTimeouts[subDropdownId];
        }
    }
});
    
    toggle.classList.remove('clicked');
    window.dropdownClickStates[dropdownId] = false;
    delete window.autoHideTimeouts[dropdownId];
}, 2000);
}

// Close all clicked dropdowns except the specified one
function closeAllClickedDropdowns(exceptDropdownId = null) {
    const stickyHeader = document.querySelector('.sticky-header');
    if (!stickyHeader) return;
    
    // Find all dropdowns and close clicked ones
    stickyHeader.querySelectorAll('.dropdown').forEach(dropdown => {
        const dropdownId = dropdown.getAttribute('data-dropdown-id');
        
        if (dropdownId && dropdownId !== exceptDropdownId && window.dropdownClickStates[dropdownId]) {
            const content = dropdown.querySelector('.dropdown-content, .dropdown-content-second');
            const toggle = dropdown.querySelector('.dropdown-toggle, .dropdown-toggle-second');
            
            if (content && toggle) {
                hideDropdown(content, dropdownId);
                toggle.classList.remove('clicked');
                window.dropdownClickStates[dropdownId] = false;
                
                // Clear auto-hide timeout
                if (window.autoHideTimeouts[dropdownId]) {
                    clearTimeout(window.autoHideTimeouts[dropdownId]);
                    delete window.autoHideTimeouts[dropdownId];
                }
            }
        }
    });
        
    // Also close all clicked sub-dropdowns
    stickyHeader.querySelectorAll('.sub-dropdown-toggle').forEach(subToggle => {
        const subDropdownId = subToggle.getAttribute('data-sub-dropdown-id');
        
        if (subDropdownId && window.subDropdownClickStates && window.subDropdownClickStates[subDropdownId]) {
            const subContent = subToggle.nextElementSibling;
            
            if (subContent && subContent.classList.contains('sub-dropdown-content')) {
                hideSubDropdown(subContent, subDropdownId);
                subToggle.classList.remove('clicked');
                window.subDropdownClickStates[subDropdownId] = false;
                
                // Clear auto-hide timeout
                if (window.subAutoHideTimeouts && window.subAutoHideTimeouts[subDropdownId]) {
                    clearTimeout(window.subAutoHideTimeouts[subDropdownId]);
                    delete window.subAutoHideTimeouts[subDropdownId];
                }
            }
        }
    });

}

// Close other hover dropdowns (not clicked ones)
function closeOtherHoverDropdowns(exceptDropdownId) {
    const stickyHeader = document.querySelector('.sticky-header');
    if (!stickyHeader) return;
    
    // Find all active dropdowns except the current one
    stickyHeader.querySelectorAll('.dropdown-content.show, .dropdown-content-second.show').forEach(content => {
        const parentDropdown = content.closest('.dropdown');
        const currentDropdownId = parentDropdown?.getAttribute('data-dropdown-id');
        
        if (currentDropdownId && currentDropdownId !== exceptDropdownId && !window.dropdownClickStates[currentDropdownId]) {
            hideDropdown(content, currentDropdownId);
        }
    });
}

function showDropdown(dropdownContent, dropdownId) {
    if (!dropdownContent) return;
    
    console.log(`Showing dropdown ${dropdownId}`);
    
    // Clear any hover timeout for this dropdown
    if (window.dropdownTimeouts && window.dropdownTimeouts[dropdownId]) {
        clearTimeout(window.dropdownTimeouts[dropdownId]);
        delete window.dropdownTimeouts[dropdownId];
    }
    
    // Set state
    if (window.stickyDropdownStates) {
        window.stickyDropdownStates[dropdownId] = true;
    }
    
    // Cancel any hiding state and stop hiding animation
    dropdownContent.removeAttribute('data-hiding');
    
    // Immediate visibility setup
    dropdownContent.style.display = 'block';
    dropdownContent.style.visibility = 'visible';
    
    // Force show animation if not already shown
    if (!dropdownContent.classList.contains('show') || dropdownContent.style.opacity !== '1') {
        // Reset opacity for clean start
        dropdownContent.style.opacity = '0';
        
        // Use requestAnimationFrame for smooth transition
        requestAnimationFrame(() => {
            dropdownContent.classList.add('show');
            dropdownContent.style.opacity = '1';
        });
    }
}

function hideDropdown(dropdownContent, dropdownId) {
    if (!dropdownContent) return;
    
    console.log(`Hiding dropdown ${dropdownId}`);
    
    // Clear any timeout for this dropdown
    if (window.dropdownTimeouts && window.dropdownTimeouts[dropdownId]) {
        clearTimeout(window.dropdownTimeouts[dropdownId]);
        delete window.dropdownTimeouts[dropdownId];
    }
    
    // Set state
    if (window.stickyDropdownStates) {
        window.stickyDropdownStates[dropdownId] = false;
    }
    
    // Mark element as hiding to prevent interference
    dropdownContent.setAttribute('data-hiding', 'true');
    
    // Start hiding animation
    dropdownContent.classList.remove('show');
    dropdownContent.style.opacity = '0';
    
    // Complete hiding after transition
    setTimeout(() => {
        // Only complete hiding if element is still marked as hiding
        if (dropdownContent.getAttribute('data-hiding') === 'true') {
            dropdownContent.style.display = 'none';
            dropdownContent.style.visibility = 'hidden';
            dropdownContent.removeAttribute('data-hiding');
        }
    }, 500); // Match CSS transition duration
}

function scheduleDropdownClose(dropdownContent, dropdownId, delay = 300) {
    if (!dropdownContent || !dropdownId) return;
    
    console.log(`Scheduling close for dropdown ${dropdownId} with delay ${delay}ms`);
    
    // Clear any existing timeout
    if (window.dropdownTimeouts && window.dropdownTimeouts[dropdownId]) {
        clearTimeout(window.dropdownTimeouts[dropdownId]);
    }
    
    // Set new timeout
    if (!window.dropdownTimeouts) {
        window.dropdownTimeouts = {};
    }
    
    window.dropdownTimeouts[dropdownId] = setTimeout(() => {
        // Double-check that mouse is not over dropdown before hiding
        if (!dropdownContent.matches(':hover')) {
            hideDropdown(dropdownContent, dropdownId);
        }
        
        // Clean up timeout reference
        if (window.dropdownTimeouts[dropdownId]) {
            delete window.dropdownTimeouts[dropdownId];
        }
    }, delay);
}

// NAHRADIT CELOU FUNKCI initializeSubDropdowns() - řádek cca 642
function initializeSubDropdowns(parentContent, parentDropdownId) {
    if (!parentContent) return;
    
    const subDropdownToggles = parentContent.querySelectorAll('.sub-dropdown-toggle');
    
    console.log(`Found ${subDropdownToggles.length} sub-dropdown toggles in ${parentDropdownId}`);
    
    // Initialize sub-dropdown click states if not exists
    if (!window.subDropdownClickStates) {
        window.subDropdownClickStates = {};
    }
    
    // Initialize auto-hide timeouts for sub-dropdowns
    if (!window.subAutoHideTimeouts) {
        window.subAutoHideTimeouts = {};
    }
    
    subDropdownToggles.forEach((subToggle, subIndex) => {
        const subDropdownId = `${parentDropdownId}-sub-${subIndex}`;
        subToggle.setAttribute('data-sub-dropdown-id', subDropdownId);
        
        const subDropdownContent = subToggle.nextElementSibling;
        if (!subDropdownContent || !subDropdownContent.classList.contains('sub-dropdown-content')) {
            console.log(`No sub-dropdown content found for toggle ${subDropdownId}`);
            return;
        }
        
        console.log(`Initializing sub-dropdown ${subDropdownId}`);
        
        // Initialize click state
        window.subDropdownClickStates[subDropdownId] = false;
        
        // CLICK EVENT - Toggle sub-dropdown (stejná logika jako u hlavních dropdownů)
        subToggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            console.log(`Click toggle for sub-dropdown ${subDropdownId}`);
            
            const isCurrentlyOpen = window.subDropdownClickStates[subDropdownId];
            
            // Close all other sub-dropdowns first
            closeAllClickedSubDropdowns(parentContent, subDropdownId);
            
            if (isCurrentlyOpen) {
                // Close this sub-dropdown
                hideSubDropdown(subDropdownContent, subDropdownId);
                subToggle.classList.remove('clicked');
                window.subDropdownClickStates[subDropdownId] = false;
                
                // Clear auto-hide timeout
                if (window.subAutoHideTimeouts[subDropdownId]) {
                    clearTimeout(window.subAutoHideTimeouts[subDropdownId]);
                    delete window.subAutoHideTimeouts[subDropdownId];
                }
            } else {
                // Open this sub-dropdown
                showSubDropdown(subDropdownContent, subDropdownId);
                subToggle.classList.add('clicked');
                window.subDropdownClickStates[subDropdownId] = true;
                
                // Set auto-hide timeout (2 seconds)
                setSubAutoHideTimeout(subDropdownContent, subDropdownId, subToggle);
            }
        });
        
        // MOUSE ENTER on sub-toggle - only for hover behavior when not clicked
        subToggle.addEventListener('mouseenter', function(e) {
            if (!window.subDropdownClickStates[subDropdownId]) {
                e.stopPropagation();
                console.log(`Mouse entered sub-toggle ${subDropdownId} (hover mode)`);
                
                // Close other hover sub-dropdowns
                closeOtherHoverSubDropdowns(parentContent, subDropdownId);
                
                // Show this sub-dropdown
                showSubDropdown(subDropdownContent, subDropdownId);
                
                // Create dead zone for smoother navigation
                createSubDropdownDeadZone(subToggle, subDropdownContent);
            }
        });
        
        // MOUSE LEAVE from sub-toggle - only for hover behavior when not clicked
        subToggle.addEventListener('mouseleave', function(e) {
            if (!window.subDropdownClickStates[subDropdownId]) {
                console.log(`Mouse left sub-toggle ${subDropdownId} (hover mode)`);
                
                setTimeout(() => {
                    if (!subDropdownContent.matches(':hover') && !subToggle.matches(':hover')) {
                        scheduleSubDropdownClose(subDropdownContent, subDropdownId, 200);
                    }
                }, 50);
            }
        });
        
        // MOUSE ENTER on sub-dropdown content
        subDropdownContent.addEventListener('mouseenter', function(e) {
            e.stopPropagation();
            console.log(`Mouse entered sub-content ${subDropdownId}`);
            
            // Stop auto-hide timeout when hovering content in click mode
            if (window.subDropdownClickStates[subDropdownId] && window.subAutoHideTimeouts[subDropdownId]) {
                clearTimeout(window.subAutoHideTimeouts[subDropdownId]);
                delete window.subAutoHideTimeouts[subDropdownId];
                console.log(`Cleared sub-dropdown auto-hide timeout for ${subDropdownId}`);
            }
            
            // Always show sub-dropdown when hovering content
            showSubDropdown(subDropdownContent, subDropdownId);
        });
        
        // MOUSE LEAVE from sub-dropdown content
        subDropdownContent.addEventListener('mouseleave', function(e) {
            console.log(`Mouse left sub-content ${subDropdownId}`);
            
            if (window.subDropdownClickStates[subDropdownId]) {
                // Restart auto-hide timeout when leaving in click mode
                console.log(`Restarting sub-dropdown auto-hide timeout for ${subDropdownId}`);
                setSubAutoHideTimeout(subDropdownContent, subDropdownId, subToggle);
            } else {
                // Only schedule close if not in clicked state (hover mode)
                scheduleSubDropdownClose(subDropdownContent, subDropdownId, 150);
            }
        });
    });
}


function showSubDropdown(subDropdownContent, subDropdownId) {
    if (!subDropdownContent) return;
    
    console.log(`Showing sub-dropdown ${subDropdownId}`);
    
    // Cancel any hiding state
    subDropdownContent.removeAttribute('data-hiding');
    
    // Immediate visibility setup
    subDropdownContent.style.display = 'block';
    subDropdownContent.style.visibility = 'visible';
    
    // Force show animation
    if (!subDropdownContent.classList.contains('show')) {
        subDropdownContent.style.opacity = '0';
        
        requestAnimationFrame(() => {
            subDropdownContent.classList.add('show');
            subDropdownContent.style.opacity = '1';
        });
    }
    
    window.isSubmenuActive = true;
}

function hideSubDropdown(subDropdownContent, subDropdownId) {
    if (!subDropdownContent) return;
    
    console.log(`Hiding sub-dropdown ${subDropdownId}`);
    
    // Mark as hiding
    subDropdownContent.setAttribute('data-hiding', 'true');
    
    // Start hiding animation
    subDropdownContent.classList.remove('show');
    subDropdownContent.style.opacity = '0';
    
    // Complete hiding after transition
    setTimeout(() => {
        if (subDropdownContent.getAttribute('data-hiding') === 'true') {
            subDropdownContent.style.display = 'none';
            subDropdownContent.style.visibility = 'hidden';
            subDropdownContent.removeAttribute('data-hiding');
        }
    }, 500);
    
    // Remove dead zone
    const deadZone = document.querySelector(`.sub-dropdown-dead-zone[data-sub-dropdown="${subDropdownId}"]`);
    if (deadZone) {
        deadZone.remove();
    }
}

function scheduleSubDropdownClose(subDropdownContent, subDropdownId, delay = 200) {
    if (!subDropdownContent || !subDropdownId) return;
    
    console.log(`Scheduling sub-dropdown close for ${subDropdownId} with delay ${delay}ms`);
    
    setTimeout(() => {
        if (!subDropdownContent.matches(':hover')) {
            hideSubDropdown(subDropdownContent, subDropdownId);
        }
    }, delay);
}

function closeOtherSubDropdowns(parentContent, exceptSubDropdownId) {
    if (!parentContent) return;
    
    const activeSubDropdowns = parentContent.querySelectorAll('.sub-dropdown-content.show');
    
    activeSubDropdowns.forEach(subContent => {
        const subToggle = subContent.previousElementSibling;
        const currentSubDropdownId = subToggle?.getAttribute('data-sub-dropdown-id');
        
        if (currentSubDropdownId && currentSubDropdownId !== exceptSubDropdownId) {
            hideSubDropdown(subContent, currentSubDropdownId);
        }
    });
}

function createSubDropdownDeadZone(subToggle, subDropdownContent) {
    const subDropdownId = subToggle.getAttribute('data-sub-dropdown-id');
    
    // Remove existing dead zone
    const existingDeadZone = document.querySelector(`.sub-dropdown-dead-zone[data-sub-dropdown="${subDropdownId}"]`);
    if (existingDeadZone) {
        existingDeadZone.remove();
    }
    
    const toggleRect = subToggle.getBoundingClientRect();
    const contentRect = subDropdownContent.getBoundingClientRect();
    
    const deadZone = document.createElement('div');
    deadZone.className = 'sub-dropdown-dead-zone';
    deadZone.setAttribute('data-sub-dropdown', subDropdownId);
    
    // Position dead zone between toggle and content
    const left = Math.min(toggleRect.right, contentRect.left);
    const right = Math.max(toggleRect.right, contentRect.left);
    const top = Math.min(toggleRect.top, contentRect.top);
    const bottom = Math.max(toggleRect.bottom, contentRect.bottom);
    
    deadZone.style.cssText = `
        position: fixed;
        left: ${left}px;
        top: ${top}px;
        width: ${right - left}px;
        height: ${bottom - top}px;
        z-index: 999;
        background-color: transparent;
        pointer-events: auto;
    `;
    
    document.body.appendChild(deadZone);
    
    // Auto-remove dead zone after 3 seconds
    setTimeout(() => {
        if (deadZone.parentNode) {
            deadZone.remove();
        }
    }, 3000);
}

// Utility function to clean up on page unload
window.addEventListener('beforeunload', function() {
    // Clear all timeouts
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
    
    // Remove dead zones
    document.querySelectorAll('[class*="dead-zone"]').forEach(zone => {
        zone.remove();
    });
        if (window.subAutoHideTimeouts) {
        Object.values(window.subAutoHideTimeouts).forEach(timeout => {
            clearTimeout(timeout);
        });
        window.subAutoHideTimeouts = {};
    }
    console.log('Sticky header cleanup completed');
});
// Set auto-hide timeout for clicked sub-dropdowns
function setSubAutoHideTimeout(subDropdownContent, subDropdownId, subToggle) {
    // Clear existing timeout
    if (window.subAutoHideTimeouts[subDropdownId]) {
        clearTimeout(window.subAutoHideTimeouts[subDropdownId]);
    }
    
    // Set new timeout (2 seconds = 2000ms)
    window.subAutoHideTimeouts[subDropdownId] = setTimeout(() => {
        console.log(`Auto-hiding sub-dropdown ${subDropdownId} after timeout`);
        hideSubDropdown(subDropdownContent, subDropdownId);
        subToggle.classList.remove('clicked');
        window.subDropdownClickStates[subDropdownId] = false;
        delete window.subAutoHideTimeouts[subDropdownId];
        
    }, 2000);
}

// Close all clicked sub-dropdowns except the specified one
function closeAllClickedSubDropdowns(parentContent, exceptSubDropdownId = null) {
    if (!parentContent) return;
    
    // Find all sub-dropdowns and close clicked ones
    parentContent.querySelectorAll('.sub-dropdown-toggle').forEach(subToggle => {
        const subDropdownId = subToggle.getAttribute('data-sub-dropdown-id');
        
        if (subDropdownId && subDropdownId !== exceptSubDropdownId && window.subDropdownClickStates[subDropdownId]) {
            const subContent = subToggle.nextElementSibling;
            
            if (subContent && subContent.classList.contains('sub-dropdown-content')) {
                hideSubDropdown(subContent, subDropdownId);
                subToggle.classList.remove('clicked');
                window.subDropdownClickStates[subDropdownId] = false;
                
                // Clear auto-hide timeout
                if (window.subAutoHideTimeouts[subDropdownId]) {
                    clearTimeout(window.subAutoHideTimeouts[subDropdownId]);
                    delete window.subAutoHideTimeouts[subDropdownId];
                }
            }
        }
    });
}

// Close other hover sub-dropdowns (not clicked ones)
function closeOtherHoverSubDropdowns(parentContent, exceptSubDropdownId) {
    if (!parentContent) return;
    
    const activeSubDropdowns = parentContent.querySelectorAll('.sub-dropdown-content.show');
    
    activeSubDropdowns.forEach(subContent => {
        const subToggle = subContent.previousElementSibling;
        const currentSubDropdownId = subToggle?.getAttribute('data-sub-dropdown-id');
        
        if (currentSubDropdownId && currentSubDropdownId !== exceptSubDropdownId && !window.subDropdownClickStates[currentSubDropdownId]) {
            hideSubDropdown(subContent, currentSubDropdownId);
        }
    });
}

console.log('Sticky header dropdown functionality fully loaded');
console.log('Sticky header dropdown functionality fully loaded');
