// UNIVERZÁLNÍ FUNKCE PRO BURGER MENU - FUNGUJE PRO HLAVNÍ I STICKY HEADER

// Získání elementů - hlavní header
const burgerMenu = document.getElementById('burgerMenu');
const mobileNav = document.getElementById('mobileNav');
const menuOverlay = document.getElementById('menuOverlay');
const closeButton = document.getElementById('closeButton');
const body = document.body;

// Proměnná pro uložení aktuální pozice scrollu
let currentScrollPosition = 0;

// Univerzální funkce pro otevření menu
function openMenu(isSticky = false) {
    if (isSticky) {
        // Pro sticky header používáme POUZE sticky elementy
        const stickyMobileNav = document.getElementById('sticky-mobileNav');
        const stickyMenuOverlay = document.getElementById('sticky-menuOverlay');
        
        // DŮLEŽITÉ: Nejprve zavřeme hlavní menu, pokud je otevřené
        if (mobileNav && menuOverlay) {
            mobileNav.classList.remove('mobile-menu-active');
            menuOverlay.classList.remove('active');
        }
        
        if (stickyMobileNav && stickyMenuOverlay) {
            stickyMobileNav.classList.add('mobile-menu-active', 'active');
            stickyMenuOverlay.classList.add('active');
            body.classList.add('menu-open');
            console.log('Sticky menu opened');
        } else {
            console.error('Sticky mobile navigation elements not found');
        }
    } else {
        // Pro hlavní header používáme původní elementy
        // DŮLEŽITÉ: Nejprve zavřeme sticky menu, pokud je otevřené
        const stickyMobileNav = document.getElementById('sticky-mobileNav');
        const stickyMenuOverlay = document.getElementById('sticky-menuOverlay');
        
        if (stickyMobileNav && stickyMenuOverlay) {
            stickyMobileNav.classList.remove('mobile-menu-active', 'active');
            stickyMenuOverlay.classList.remove('active');
        }
        
        if (mobileNav && menuOverlay) {
            mobileNav.classList.add('mobile-menu-active');
            menuOverlay.classList.add('active');
            body.classList.add('menu-open');
            console.log('Main menu opened');
        }
    }
}

// Univerzální funkce pro zavření menu
function closeMenu(isSticky = false) {
    if (isSticky) {
        // Pro sticky header
        const stickyMobileNav = document.getElementById('sticky-mobileNav');
        const stickyMenuOverlay = document.getElementById('sticky-menuOverlay');
        
        if (stickyMobileNav && stickyMenuOverlay) {
            stickyMobileNav.classList.remove('mobile-menu-active', 'active');
            stickyMenuOverlay.classList.remove('active');
            body.classList.remove('menu-open');
            console.log('Sticky menu closed');
        }
    } else {
        // Pro hlavní header
        if (mobileNav && menuOverlay) {
            mobileNav.classList.remove('mobile-menu-active');
            menuOverlay.classList.remove('active');
            body.classList.remove('menu-open');
            console.log('Main menu closed');
        }
    }
}

// Univerzální funkce pro zavření všech menu
function closeAllMenus() {
    // Zavřeme hlavní menu
    closeMenu(false);
    // Zavřeme sticky menu
    closeMenu(true);
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

// OPRAVENÁ FUNKCE PRO INICIALIZACI STICKY BURGER MENU
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
        
        // DŮLEŽITÉ: Zavřeme všechna ostatní menu před otevřením sticky menu
        closeAllMenus();
        
        // Krátké zpoždění a pak otevřeme pouze sticky menu
        setTimeout(() => {
            openMenu(true);
        }, 10);
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
    initializeStickyExpandableMenus(stickyMobileNav);
    
    console.log('Sticky burger menu initialized successfully');
}

// Funkce pro inicializaci rozbalovacích menu ve sticky verzi
function initializeStickyExpandableMenus(stickyMobileNav) {
    // Funkce pro rozbalovací menu
    function toggleExpandableMenu(header, contentId) {
        const content = document.getElementById(contentId);
        if (!content) return;
        
        const arrow = header.querySelector('.mobile-expand-arrow');
        
        if (content.classList.contains('expanded')) {
            content.classList.remove('expanded');
            header.classList.remove('expanded');
        } else {
            // Zavřít všechna ostatní rozbalovací menu na stejné úrovni
            const allContents = stickyMobileNav.querySelectorAll('.mobile-expand-content, .mobile-sub-expand-content');
            const allHeaders = stickyMobileNav.querySelectorAll('.mobile-expand-header, .mobile-sub-expand-header');
            
            allContents.forEach(c => {
                if (c !== content) {
                    c.classList.remove('expanded');
                }
            });
            
            allHeaders.forEach(h => {
                if (h !== header) {
                    h.classList.remove('expanded');
                }
            });
            
            // Otevřít aktuální menu
            content.classList.add('expanded');
            header.classList.add('expanded');
        }
    }
    
    // Event listenery pro rozbalovací menu ve sticky verzi
    const expandHeaders = stickyMobileNav.querySelectorAll('.mobile-expand-header, .mobile-sub-expand-header');
    expandHeaders.forEach(header => {
        // Odebereme staré listenery klonováním
        const newHeader = header.cloneNode(true);
        header.parentNode.replaceChild(newHeader, header);
        
        newHeader.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('data-target');
            toggleExpandableMenu(this, targetId);
        });
    });
}

// Funkce pro rozbalovací menu v hlavním headeru (původní kód)
function toggleExpandableMenu(header, contentId) {
    const content = document.getElementById(contentId);
    if (!content) return;
    
    const arrow = header.querySelector('.mobile-expand-arrow');
    
    if (content.classList.contains('expanded')) {
        content.classList.remove('expanded');
        header.classList.remove('expanded');
    } else {
        // Zavřít všechna ostatní rozbalovací menu na stejné úrovni
        const allContents = document.querySelectorAll('.mobile-expand-content, .mobile-sub-expand-content');
        const allHeaders = document.querySelectorAll('.mobile-expand-header, .mobile-sub-expand-header');
        
        allContents.forEach(c => {
            if (c !== content) {
                c.classList.remove('expanded');
            }
        });
        
        allHeaders.forEach(h => {
            if (h !== header) {
                h.classList.remove('expanded');
            }
        });
        
        // Otevřít aktuální menu
        content.classList.add('expanded');
        header.classList.add('expanded');
    }
}

// Event listenery pro rozbalovací menu v hlavním headeru
document.querySelectorAll('.mobile-expand-header, .mobile-sub-expand-header').forEach(header => {
    header.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('data-target');
        toggleExpandableMenu(this, targetId);
    });
});

// Zavření menu při změně velikosti okna
window.addEventListener('resize', function() {
    if (window.innerWidth > 1175) {
        closeAllMenus();
    }
});

// Prevent scroll na mobilních zařízeních při otevřeném menu
document.addEventListener('touchmove', function(e) {
    if (body.classList.contains('menu-open')) {
        e.preventDefault();
    }
}, { passive: false });

// Zavření všech menu při kliknutí mimo
document.addEventListener('click', function(e) {
    // Zkontrolujeme, jestli klik nebyl na burger menu nebo uvnitř mobilní navigace
    const isMainBurger = burgerMenu && burgerMenu.contains(e.target);
    const isStickyBurger = e.target.closest('.sticky-header .burger-menu');
    const isInsideMobileNav = e.target.closest('#mobileNav, #sticky-mobileNav');
    
    if (!isMainBurger && !isStickyBurger && !isInsideMobileNav) {
        closeAllMenus();
    }
});

// Export funkcí pro použití v jiných částech kódu
window.openMenu = openMenu;
window.closeMenu = closeMenu;
window.closeAllMenus = closeAllMenus;
window.initializeStickyBurgerMenu = initializeStickyBurgerMenu;