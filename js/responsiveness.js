// INICIALIZACE
document.addEventListener('DOMContentLoaded', function() {
    const burger = document.getElementById('burgerMenu');
    const navContainer = document.getElementById('mobileMenu');
    const body = document.body;
    const closeButton = document.querySelector('.menu-close-button');
    const overlay = document.querySelector('.menu-overlay');

    // Ujistí se, že menu je při načítání zavřené
    if (burger) burger.classList.remove('active');
    if (navContainer) navContainer.classList.remove('mobile-menu-active');
    if (body) body.classList.remove('menu-open');
    if (overlay) overlay.classList.remove('active');

    // Funkce pro zavření všech rozbalených sekcí
    function closeAllExpandedSections() {
        // Zavře všechny hlavní sekce
        const expandedHeaders = document.querySelectorAll('.mobile-expand-header.expanded');
        expandedHeaders.forEach(header => {
            header.classList.remove('expanded');
            const content = header.nextElementSibling;
            if (content) content.classList.remove('expanded');
        });

        // Zavře všechny pod-sekce
        const expandedSubHeaders = document.querySelectorAll('.mobile-sub-expand-header.expanded');
        expandedSubHeaders.forEach(header => {
            header.classList.remove('expanded');
            const content = header.nextElementSibling;
            if (content) content.classList.remove('expanded');
        });
    }

    // Funkce pro zavření menu
    function closeMenu() {
        if (burger) burger.classList.remove('active');
        if (overlay) overlay.classList.remove('active');
        
        if (navContainer) {
            // Nejdřív nastavíme visibility visible aby animace byla viditelná
            navContainer.style.visibility = 'visible';
            
            // Pak odebereme active třídu aby se spustila animace zasunutí
            navContainer.classList.remove('mobile-menu-active');
            
            // Zavřeme všechny rozbalené sekce
            closeAllExpandedSections();
            
            // Po dokončení animace skryjeme menu a uvolníme scroll
            setTimeout(() => {
                navContainer.style.visibility = 'hidden';
                if (body) body.classList.remove('menu-open');
            }, 320); // Delší než CSS transition (300ms)
        }
    }

    // Funkce pro otevření menu
    function openMenu() {
        if (burger) burger.classList.add('active');
        if (body) body.classList.add('menu-open');
        if (overlay) overlay.classList.add('active');
        
        if (navContainer) {
            // Nejdřív nastavíme visibility visible
            navContainer.style.visibility = 'visible';
            // Pak přidáme active třídu pro animaci vysunutí
            navContainer.classList.add('mobile-menu-active');
        }
    }

    // Event listener pro burger menu
    if (burger && navContainer) {
        burger.addEventListener('click', function(e) {
            e.stopPropagation(); // Zabrání bublinkovému efektu
            
            if (navContainer.classList.contains('mobile-menu-active')) {
                closeMenu();
            } else {
                openMenu();
            }
        });
    }

    // Event listener pro křížek (zavření menu)
    if (closeButton) {
        closeButton.addEventListener('click', function(e) {
            e.stopPropagation(); // Zabrání bublinkovému efektu
            closeMenu();
        });
    }

    // Event listener pro overlay (zavření menu kliknutím mimo)
    if (overlay) {
        overlay.addEventListener('click', function() {
            closeMenu();
        });
    }

    // Zavře menu při kliknutí mimo menu oblast
    document.addEventListener('click', function(e) {
        // Zkontroluje, jestli je menu otevřené
        if (navContainer && navContainer.classList.contains('mobile-menu-active')) {
            // Zkontroluje, jestli kliknutí nebylo uvnitř menu nebo na burger tlačítko
            if (!navContainer.contains(e.target) && !burger.contains(e.target)) {
                closeMenu();
            }
        }
    });

    // Zabrání zavření menu při kliknutí uvnitř menu
    if (navContainer) {
        navContainer.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }

    // Funkce pro okamžité zavření menu bez animace (pro odkazy)
    function closeMenuInstantly() {
        if (burger) burger.classList.remove('active');
        if (overlay) overlay.classList.remove('active');
        if (body) body.classList.remove('menu-open');
        
        if (navContainer) {
            navContainer.classList.remove('mobile-menu-active');
            navContainer.style.visibility = 'hidden';
        }
        
        // Zavře všechny rozbalené sekce
        closeAllExpandedSections();
    }

    // Zavře menu při kliknutí na odkaz (ale ne na rozbalovací hlavičky)
    const menuLinks = document.querySelectorAll('.mobile-nav-container a:not(.mobile-expand-header):not(.mobile-sub-expand-header)');
    menuLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (window.innerWidth <= 768) {
                closeMenuInstantly(); // Použije okamžité zavření bez animace
            }
        });
    });

    // Zavře menu při změně velikosti okna
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            // Pro desktop - okamžitě skryje bez animace
            if (burger) burger.classList.remove('active');
            if (navContainer) {
                navContainer.classList.remove('mobile-menu-active');
                navContainer.style.visibility = 'hidden';
            }
            if (body) body.classList.remove('menu-open');
            if (overlay) overlay.classList.remove('active');
            // Zavře také všechny rozbalené sekce při přechodu na desktop
            closeAllExpandedSections();
        } else {
            // Pro mobilní - ujistí se, že menu je skryté při změně velikosti
            if (navContainer && !navContainer.classList.contains('mobile-menu-active')) {
                navContainer.style.visibility = 'hidden';
            }
        }
    });

    // Zavře menu při stisknutí ESC klávesy
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && navContainer && navContainer.classList.contains('mobile-menu-active')) {
            closeMenu();
        }
    });
});

// Funkce pro rozbalování hlavních sekcí
function toggleMobileExpand(element) {
    const content = element.nextElementSibling;
    const arrow = element.querySelector('.mobile-expand-arrow');
    
    element.classList.toggle('expanded');
    content.classList.toggle('expanded');
}

// Funkce pro rozbalování pod-sekcí
function toggleMobileSubExpand(element) {
    const content = element.nextElementSibling;
    const arrow = element.querySelector('.mobile-expand-arrow');
    
    element.classList.toggle('expanded');
    content.classList.toggle('expanded');
}

// Zavře menu při refresh
window.addEventListener('beforeunload', function() {
    const burger = document.getElementById('burgerMenu');
    const navContainer = document.getElementById('mobileMenu');
    const body = document.body;
    const overlay = document.querySelector('.menu-overlay');

    if (burger) burger.classList.remove('active');
    if (navContainer) navContainer.classList.remove('mobile-menu-active');
    if (body) body.classList.remove('menu-open');
    if (overlay) overlay.classList.remove('active');
});