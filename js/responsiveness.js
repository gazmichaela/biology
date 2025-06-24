//-----------RESPONSIVENESS FUNCIONALITY--------------//

// Získání elementů - hlavní header
const burgerMenu = document.getElementById('burgerMenu');
const mobileNav = document.getElementById('mobileNav');
const menuOverlay = document.getElementById('menuOverlay');
const closeButton = document.getElementById('closeButton');
const body = document.body;

// Proměnná pro uložení aktuální pozice scrollu
let currentScrollPosition = 0;

// Univerzální funkce pro otevření menu
function openMenu(isSticky = true) {
    // Nejprve zavřeme VŠECHNA menu čistě
    closeAllMenusClean();
    
    // Krátké zpoždění pro zajištění čistého stavu
    setTimeout(() => {
        if (isSticky) {
            // Pro sticky header používáme POUZE sticky elementy
            const stickyMobileNav = document.getElementById('sticky-mobileNav');
            const stickyMenuOverlay = document.getElementById('sticky-menuOverlay');
            
            if (stickyMobileNav && stickyMenuOverlay) {
                // Přidáme třídu specifickou pro sticky menu
                body.classList.add('sticky-menu-open');
                stickyMobileNav.classList.add('mobile-menu-active', 'active');
                stickyMenuOverlay.classList.add('active');
                console.log('Sticky menu opened');
            } else {
                console.error('Sticky mobile navigation elements not found');
            }
        } else {
            // Pro hlavní header používáme původní elementy
            if (mobileNav && menuOverlay) {
                // Přidáme třídu specifickou pro hlavní menu
                body.classList.add('main-menu-open');
                mobileNav.classList.add('mobile-menu-active');
                menuOverlay.classList.add('active');
                console.log('Main menu opened');
            }
        }
    }, 50);
}

// Univerzální funkce pro zavření menu
function closeMenu(isSticky = true) {
    if (isSticky) {
        // Pro sticky header
        const stickyMobileNav = document.getElementById('sticky-mobileNav');
        const stickyMenuOverlay = document.getElementById('sticky-menuOverlay');
        
        if (stickyMobileNav && stickyMenuOverlay) {
            stickyMobileNav.classList.remove('mobile-menu-active', 'active');
            stickyMenuOverlay.classList.remove('active');
            body.classList.remove('sticky-menu-open');
            console.log('Sticky menu closed');
        }
    } else {
        // Pro hlavní header
        if (mobileNav && menuOverlay) {
            mobileNav.classList.remove('mobile-menu-active');
            menuOverlay.classList.remove('active');
            body.classList.remove('main-menu-open');
            console.log('Main menu closed');
        }
    }
}

// funkce pro čisté zavření všech menu
function closeAllMenusClean() {
    // Zavření hlavního menu
    if (mobileNav && menuOverlay) {
        mobileNav.classList.remove('mobile-menu-active');
        menuOverlay.classList.remove('active');
        
        // Zavřeme všechna rozbalovací menu v hlavní navigaci
        const allMainContents = mobileNav.querySelectorAll('.mobile-expand-content, .mobile-sub-expand-content');
        const allMainHeaders = mobileNav.querySelectorAll('.mobile-expand-header, .mobile-sub-expand-header');
        allMainContents.forEach(c => c.classList.remove('expanded'));
        allMainHeaders.forEach(h => h.classList.remove('expanded'));
    }
    
    // Zavření sticky menu
    const stickyMobileNav = document.getElementById('sticky-mobileNav');
    const stickyMenuOverlay = document.getElementById('sticky-menuOverlay');
    
    if (stickyMobileNav && stickyMenuOverlay) {
        stickyMobileNav.classList.remove('mobile-menu-active', 'active');
        stickyMenuOverlay.classList.remove('active');
        
        // Zavřeme všechna rozbalovací menu ve sticky navigaci
        const allStickyContents = stickyMobileNav.querySelectorAll('.mobile-expand-content, .mobile-sub-expand-content');
        const allStickyHeaders = stickyMobileNav.querySelectorAll('.mobile-expand-header, .mobile-sub-expand-header');
        allStickyContents.forEach(c => c.classList.remove('expanded'));
        allStickyHeaders.forEach(h => h.classList.remove('expanded'));
    }
    
    // Odstranění všech body tříd
    body.classList.remove('menu-open', 'main-menu-open', 'sticky-menu-open');
}

// Univerzální funkce pro zavření všech menu
function closeAllMenus() {
    closeAllMenusClean();
}

// Event listenery pro hlavní burger menu
if (burgerMenu) {
    burgerMenu.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        openMenu(false);
    });
}

if (closeButton) {
    closeButton.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        closeMenu(false);
    });
}

if (menuOverlay) {
    menuOverlay.addEventListener('click', function(e) {
        if (e.target === menuOverlay) {
            closeMenu(false);
        }
    });
}

// INICIALIZACE STICKY BURGER MENU
function initializeStickyBurgerMenu() {
    const stickyHeader = document.querySelector('.sticky-header');
    if (!stickyHeader) {
        console.error('Sticky header not found');
        return;
    }
    
    // Najdeme sticky burger menu - zkusíme různé možnosti
    let stickyBurgerMenu = stickyHeader.querySelector('#sticky-burgerMenu');
    if (!stickyBurgerMenu) {
        stickyBurgerMenu = stickyHeader.querySelector('.burger-menu');
    }
    
    if (!stickyBurgerMenu) {
        console.log('Burger menu not found in sticky header');
        return;
    }
    
    // Najdeme sticky mobilní navigaci a overlay
    const stickyMobileNav = document.getElementById('sticky-mobileNav');
    const stickyMenuOverlay = document.getElementById('sticky-menuOverlay');
    
    if (!stickyMobileNav || !stickyMenuOverlay) {
        console.error('Sticky mobile navigation elements not found');
        return;
    }
    
    // Najdeme close button ve sticky mobilní navigaci
    let stickyCloseButton = stickyMobileNav.querySelector('#sticky-closeButton');
    if (!stickyCloseButton) {
        stickyCloseButton = stickyMobileNav.querySelector('#closeButton, .close-button, [id*="close"]');
    }
    
    // Odebereme všechny předchozí event listenery klonováním
    const newStickyBurgerMenu = stickyBurgerMenu.cloneNode(true);
    stickyBurgerMenu.parentNode.replaceChild(newStickyBurgerMenu, stickyBurgerMenu);
    
    // Event listener pro sticky burger menu - OPRAVENÁ VERZE
    newStickyBurgerMenu.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        console.log('Sticky burger menu clicked');
        
        // Nejprve zavřeme všechny dropdowny
        if (window.clearAllDropdownStates) {
            clearAllDropdownStates();
        }
        
        // Otevřeme sticky menu
        openMenu(true);
    });
    
    // Event listener pro zavření sticky mobilní navigace
    if (stickyCloseButton) {
        const newCloseButton = stickyCloseButton.cloneNode(true);
        stickyCloseButton.parentNode.replaceChild(newCloseButton, stickyCloseButton);
        
        newCloseButton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            closeMenu(true);
        });
    }
    
    // Odebereme předchozí event listener z overlay klonováním
    const newStickyMenuOverlay = stickyMenuOverlay.cloneNode(true);
    stickyMenuOverlay.parentNode.replaceChild(newStickyMenuOverlay, stickyMenuOverlay);
    
    // Zavření při kliknutí na sticky overlay
    newStickyMenuOverlay.addEventListener('click', function(e) {
        if (e.target === newStickyMenuOverlay) {
            closeMenu(true);
        }
    });
    
    // Inicializujeme rozbalovací menu pro sticky verzi
    setTimeout(() => {
        initializeStickyExpandableMenus(stickyMobileNav);
    }, 100);
    
    console.log('Sticky burger menu initialized successfully');
}
// funkce pro inicializaci rozbalovacích menu ve sticky verzi
function initializeStickyExpandableMenus(stickyMobileNav) {
    if (!stickyMobileNav) {
        console.error('Sticky mobile nav not found for expandable menus');
        return;
    }
    
    console.log('Initializing sticky expandable menus...');
    
    // Funkce pro aktualizaci šipky
    function updateStickyArrow(header, isExpanded) {
        const arrow = header.querySelector('.expand-arrow, .mobile-expand-arrow, .mobile-arrow, .arrow, [class*="arrow"]');
        if (arrow) {
            if (isExpanded) {
                arrow.classList.add('expanded', 'rotated');
                arrow.style.transform = 'rotate(180deg)';
                arrow.style.transition = 'transform 0.3s ease';
            } else {
                arrow.classList.remove('expanded', 'rotated');
                arrow.style.transform = 'rotate(0deg)';
                arrow.style.transition = 'transform 0.3s ease';
            }
        }
    }
    
    // Funkce pro toggle expandable menu ve sticky verzi
    function toggleStickyExpandableMenu(header, targetId) {
        console.log('Toggling sticky expandable menu:', targetId);
        
        // Najdeme target element - zkusíme více způsobů
        let content = null;
        
        // 1. Přímé ID
        content = document.getElementById(targetId);
        
        // 2. ID s prefixem "sticky-"
        if (!content && !targetId.startsWith('sticky-')) {
            content = document.getElementById('sticky-' + targetId);
        }
        
        // 3. Hledání v rámci sticky navigace podle ID
        if (!content) {
            content = stickyMobileNav.querySelector(`#${targetId}, #sticky-${targetId}`);
        }
        
        // 4. Hledání podle data-id atributu
        if (!content) {
            content = stickyMobileNav.querySelector(`[data-id="${targetId}"]`);
        }
        
        // 5. Hledání jako následující sibling
        if (!content) {
            content = header.nextElementSibling;
            if (content && !content.classList.contains('mobile-expand-content') && 
                !content.classList.contains('mobile-sub-expand-content')) {
                content = null;
            }
        }
        
        // 6. Hledání podle class name (pokud target ID odpovídá class)
        if (!content) {
            const className = targetId.replace(/[^a-zA-Z0-9-_]/g, '');
            content = stickyMobileNav.querySelector(`.${className}`);
        }
        
        if (!content) {
            console.error('Content element not found for target:', targetId);
            console.log('Available elements in sticky nav:', stickyMobileNav.querySelectorAll('*[id], *[class*="expand"]'));
            return;
        }
        
        console.log('Found target content:', content);
        
        const isCurrentlyExpanded = content.classList.contains('expanded');
        const isMainMenu = header.classList.contains('mobile-expand-header');
        const isSubMenu = header.classList.contains('mobile-sub-expand-header');
        
        if (isCurrentlyExpanded) {
            // Zavíráme menu
            content.classList.remove('expanded');
            header.classList.remove('expanded');
            updateStickyArrow(header, false);
            console.log('Closed sticky menu:', targetId);
        } else {
            // Otevíráme menu
            if (isMainMenu) {
                // Pro hlavní menu zavřeme všechna ostatní hlavní menu
                const allMainContents = stickyMobileNav.querySelectorAll('.mobile-expand-content');
                const allMainHeaders = stickyMobileNav.querySelectorAll('.mobile-expand-header');
                
                allMainContents.forEach(c => {
                    if (c !== content) {
                        c.classList.remove('expanded');
                        // Zavřeme také všechna submenu
                        const subContents = c.querySelectorAll('.mobile-sub-expand-content');
                        const subHeaders = c.querySelectorAll('.mobile-sub-expand-header');
                        subContents.forEach(sc => sc.classList.remove('expanded'));
                        subHeaders.forEach(sh => {
                            sh.classList.remove('expanded');
                            updateStickyArrow(sh, false);
                        });
                    }
                });
                
                allMainHeaders.forEach(h => {
                    if (h !== header) {
                        h.classList.remove('expanded');
                        updateStickyArrow(h, false);
                    }
                });
                
                // Zavřeme všechna submenu v aktuálně otevíraném menu
                const currentSubContents = content.querySelectorAll('.mobile-sub-expand-content');
                const currentSubHeaders = content.querySelectorAll('.mobile-sub-expand-header');
                currentSubContents.forEach(sc => sc.classList.remove('expanded'));
                currentSubHeaders.forEach(sh => {
                    sh.classList.remove('expanded');
                    updateStickyArrow(sh, false);
                });
                
            } else if (isSubMenu) {
                // Pro submenu zavřeme pouze ostatní submenu na stejné úrovni
                const parentContent = header.closest('.mobile-expand-content');
                if (parentContent) {
                    const siblingSubContents = parentContent.querySelectorAll('.mobile-sub-expand-content');
                    const siblingSubHeaders = parentContent.querySelectorAll('.mobile-sub-expand-header');
                    
                    siblingSubContents.forEach(c => {
                        if (c !== content) {
                            c.classList.remove('expanded');
                        }
                    });
                    
                    siblingSubHeaders.forEach(h => {
                        if (h !== header) {
                            h.classList.remove('expanded');
                            updateStickyArrow(h, false);
                        }
                    });
                }
            }
            
            // Otevřeme aktuální menu
            content.classList.add('expanded');
            header.classList.add('expanded');
            updateStickyArrow(header, true);
            console.log('Opened sticky menu:', targetId);
        }
    }
    
    // Najdeme všechny expandable headers ve sticky navigaci
    const expandHeaders = stickyMobileNav.querySelectorAll('.mobile-expand-header, .mobile-sub-expand-header');
    console.log(`Found ${expandHeaders.length} sticky expandable headers`);
    
    expandHeaders.forEach((header, index) => {
        // Odebereme staré event listenery klonováním elementu
        const newHeader = header.cloneNode(true);
        header.parentNode.replaceChild(newHeader, header);
        
        // Inicializace šipky
        updateStickyArrow(newHeader, false);
        
        const targetId = newHeader.getAttribute('data-target');
        
        if (!targetId) {
            console.warn(`Header ${index} missing data-target attribute`);
            return;
        }
        
        console.log(`Adding click listener to sticky header ${index} with target:`, targetId);
        
        // Přidáme event listener
        newHeader.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            console.log('Sticky expandable header clicked:', targetId);
            toggleStickyExpandableMenu(this, targetId);
        });
    });
    
    console.log('Sticky expandable menus initialization completed');
}

// Funkce pro rozbalovací menu POUZE v hlavním headeru - OPRAVENÁ VERZE
function toggleMainExpandableMenu(header, contentId) {
    const content = document.getElementById(contentId);
    if (!content) return;
    
    // Funkce pro aktualizaci šipky v hlavním menu
    function updateMainArrow(header, isExpanded) {
        const arrow = header.querySelector('.expand-arrow, .mobile-expand-arrow, .arrow, [class*="arrow"]');
        if (arrow) {
            if (isExpanded) {
                arrow.classList.add('expanded', 'rotated');
                arrow.style.transform = 'rotate(180deg)';
            } else {
                arrow.classList.remove('expanded', 'rotated');
                arrow.style.transform = 'rotate(0deg)';
            }
        }
    }
    
    const isCurrentlyExpanded = content.classList.contains('expanded');
    
    if (isCurrentlyExpanded) {
        content.classList.remove('expanded');
        header.classList.remove('expanded');
        updateMainArrow(header, false);
    } else {
        // Zavřít všechna ostatní rozbalovací menu POUZE v hlavní navigaci
        const mainNav = document.getElementById('mobileNav');
        if (mainNav) {
            // Určíme, jestli je to hlavní menu nebo submenu
            const isMainMenu = header.classList.contains('mobile-expand-header');
            const isSubMenu = header.classList.contains('mobile-sub-expand-header');
            
            if (isMainMenu) {
                // Pokud otevíráme hlavní menu, zavřeme všechna ostatní hlavní menu
                const allMainContents = mainNav.querySelectorAll('.mobile-expand-content');
                const allMainHeaders = mainNav.querySelectorAll('.mobile-expand-header');
                
                allMainContents.forEach(c => {
                    if (c !== content) {
                        c.classList.remove('expanded');
                        // Zavřeme také všechna submenu v tomto hlavním menu
                        const subContents = c.querySelectorAll('.mobile-sub-expand-content');
                        const subHeaders = c.querySelectorAll('.mobile-sub-expand-header');
                        subContents.forEach(sc => sc.classList.remove('expanded'));
                        subHeaders.forEach(sh => {
                            sh.classList.remove('expanded');
                            updateMainArrow(sh, false);
                        });
                    }
                });
                
                allMainHeaders.forEach(h => {
                    if (h !== header) {
                        h.classList.remove('expanded');
                        updateMainArrow(h, false);
                    }
                });
                
                // Zavřeme všechna submenu v aktuálně otevíraném hlavním menu
                const currentSubContents = content.querySelectorAll('.mobile-sub-expand-content');
                const currentSubHeaders = content.querySelectorAll('.mobile-sub-expand-header');
                currentSubContents.forEach(sc => sc.classList.remove('expanded'));
                currentSubHeaders.forEach(sh => {
                    sh.classList.remove('expanded');
                    updateMainArrow(sh, false);
                });
                } else if (isSubMenu) {
                // Pokud otevíráme submenu, zavřeme pouze ostatní submenu na stejné úrovni
                const parentExpandContent = header.closest('.mobile-expand-content');
                if (parentExpandContent) {
                    const siblingSubContents = parentExpandContent.querySelectorAll('.mobile-sub-expand-content');
                    const siblingSubHeaders = parentExpandContent.querySelectorAll('.mobile-sub-expand-header');
                    
                    siblingSubContents.forEach(c => {
                        if (c !== content) {
                            c.classList.remove('expanded');
                        }
                    });
                    
                    siblingSubHeaders.forEach(h => {
                        if (h !== header) {
                            h.classList.remove('expanded');
                            updateMainArrow(h, false);
                        }
                    });
                }
            }
        }
        
        // Otevřít aktuální menu
        content.classList.add('expanded');
        header.classList.add('expanded');
        updateMainArrow(header, true);
    }
}

// Event listenery pro rozbalovací menu pouze v hlavním headeru
document.addEventListener('DOMContentLoaded', function() {
    const mainNav = document.getElementById('mobileNav');
    if (mainNav) {
        const mainExpandHeaders = mainNav.querySelectorAll('.mobile-expand-header, .mobile-sub-expand-header');
        mainExpandHeaders.forEach(header => {
            // Inicializujeme šipku
            function updateMainArrow(header, isExpanded) {
                const arrow = header.querySelector('.expand-arrow, .mobile-expand-arrow, .arrow, [class*="arrow"]');
                if (arrow) {
                    if (isExpanded) {
                        arrow.classList.add('expanded', 'rotated');
                        arrow.style.transform = 'rotate(180deg)';
                    } else {
                        arrow.classList.remove('expanded', 'rotated');
                        arrow.style.transform = 'rotate(0deg)';
                    }
                }
            }
            
            updateMainArrow(header, false);
            
            header.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('data-target');
                toggleMainExpandableMenu(this, targetId);
            });
        });
    }
    

    // Pokud sticky header už existuje, inicializujeme hned
    if (document.querySelector('.sticky-header')) {
        setTimeout(initializeStickyBurgerMenu, 500);
    }
    
    // Observer pro sledování, kdy se sticky header objeví
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1) { // Element node
                        if (node.classList && node.classList.contains('sticky-header')) {
                            console.log('Sticky header detected, initializing burger menu...');
                            setTimeout(initializeStickyBurgerMenu, 100);
                        }
                        // Zkusíme najít sticky header i uvnitř přidaného elementu
                        if (node.querySelector && node.querySelector('.sticky-header')) {
                            console.log('Sticky header found inside added element, initializing...');
                            setTimeout(initializeStickyBurgerMenu, 100);
                        }
                    }
                });
            }
        });
    });
    
    // Sledujeme změny v celém dokumentu
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
});

// Vylepšené zavření menu při změně velikosti okna
window.addEventListener('resize', function() {
    if (window.innerWidth > 1175) {
        closeAllMenus();
    }
});

// Vylepšené prevent scroll na mobilních zařízeních
document.addEventListener('touchmove', function(e) {
    if (body.classList.contains('main-menu-open') || body.classList.contains('sticky-menu-open')) {
        // Povolíme scroll pouze uvnitř mobilní navigace
        const isInsideMobileNav = e.target.closest('#mobileNav, #sticky-mobileNav');
        if (!isInsideMobileNav) {
            e.preventDefault();
        }
    }
}, { passive: false });

// Vylepšené zavření všech menu při kliknutí mimo
document.addEventListener('click', function(e) {
    // Zkontrolujeme, jestli klik nebyl na burger menu nebo uvnitř mobilní navigace
    const isMainBurger = burgerMenu && burgerMenu.contains(e.target);
    const isStickyBurger = e.target.closest('.sticky-header .burger-menu');
    const isInsideMobileNav = e.target.closest('#mobileNav, #sticky-mobileNav');
    
    if (!isMainBurger && !isStickyBurger && !isInsideMobileNav) {
        closeAllMenus();
    }
});

// Dodatečné zajištění pro escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        if (body.classList.contains('main-menu-open') || body.classList.contains('sticky-menu-open')) {
            closeAllMenus();
        }
    }
});



function debugStickyMenu() {
    console.log('=== STICKY MENU DEBUG ===');
    
    const stickyHeader = document.querySelector('.sticky-header');
    const stickyMobileNav = document.getElementById('sticky-mobileNav');
    
    console.log('Sticky header found:', !!stickyHeader);
    console.log('Sticky mobile nav found:', !!stickyMobileNav);
    
    if (!stickyMobileNav) {
        console.error('Sticky mobile nav not found!');
        return;
    }
    
    // Najdeme všechny expandable headers
    const headers = stickyMobileNav.querySelectorAll('.mobile-expand-header, .mobile-sub-expand-header');
    console.log('Found expandable headers:', headers.length);
    
    headers.forEach((header, index) => {
        const targetId = header.getAttribute('data-target');
        console.log(`Header ${index}:`);
        console.log('  - Text:', header.textContent.trim());
        console.log('  - Target ID:', targetId);
        console.log('  - Classes:', header.className);
        
        if (targetId) {
            const targetElement = document.getElementById(targetId) || 
                                document.getElementById('sticky-' + targetId) ||
                                stickyMobileNav.querySelector(`#${targetId}, #sticky-${targetId}`);
            console.log('  - Target element found:', !!targetElement);
            if (targetElement) {
                console.log('  - Target element ID:', targetElement.id);
                console.log('  - Target element classes:', targetElement.className);
            }
        }
    });
    
    // Najdeme všechny expandable contents
    const contents = stickyMobileNav.querySelectorAll('.mobile-expand-content, .mobile-sub-expand-content');
    console.log('Found expandable contents:', contents.length);
    
    contents.forEach((content, index) => {
        console.log(`Content ${index}:`);
        console.log('  - ID:', content.id);
        console.log('  - Classes:', content.className);
        console.log('  - Is expanded:', content.classList.contains('expanded'));
    });
    
    console.log('=== END DEBUG ===');
}

// funkce pro manuální reinicializaci sticky menu (pro debugging)
function reinitializeStickyMenu() {
    console.log('Manually reinitializing sticky menu...');
    const stickyMobileNav = document.getElementById('sticky-mobileNav');
    if (stickyMobileNav) {
        initializeStickyExpandableMenus(stickyMobileNav);
    } else {
        console.error('Sticky mobile nav not found for reinitialization');
    }
}

// Export funkcí pro použití v jiných částech kódu
window.openMenu = openMenu;
window.closeMenu = closeMenu;
window.closeAllMenus = closeAllMenus;
window.initializeStickyBurgerMenu = initializeStickyBurgerMenu;
window.initializeStickyExpandableMenus = initializeStickyExpandableMenus;
window.debugStickyMenu = debugStickyMenu;
window.reinitializeStickyMenu = reinitializeStickyMenu;