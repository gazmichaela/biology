    // Získání elementů
        const burgerMenu = document.getElementById('burgerMenu');
        const mobileNav = document.getElementById('mobileNav');
        const menuOverlay = document.getElementById('menuOverlay');
        const closeButton = document.getElementById('closeButton');
        const body = document.body;

        // Funkce pro otevření menu
        function openMenu() {
            mobileNav.classList.add('mobile-menu-active');
            menuOverlay.classList.add('active');
            body.classList.add('menu-open');
        }

        // Funkce pro zavření menu
        function closeMenu() {
            mobileNav.classList.remove('mobile-menu-active');
            menuOverlay.classList.remove('active');
            body.classList.remove('menu-open');
        }

        // Event listenery pro otevření/zavření menu
        burgerMenu.addEventListener('click', openMenu);
        closeButton.addEventListener('click', closeMenu);
        menuOverlay.addEventListener('click', closeMenu);

        // Funkce pro rozbalovací menu
        function toggleExpandableMenu(header, contentId) {
            const content = document.getElementById(contentId);
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

        // Event listenery pro rozbalovací menu
        document.querySelectorAll('.mobile-expand-header, .mobile-sub-expand-header').forEach(header => {
            header.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('data-target');
                toggleExpandableMenu(this, targetId);
            });
        });

        // Zavření menu při změně velikosti okna (pokud se přepne na desktop)
        window.addEventListener('resize', function() {
            if (window.innerWidth > 1175) {
                closeMenu();
            }
        });

        // Prevent scroll na mobilních zařízeních při otevřeném menu
        document.addEventListener('touchmove', function(e) {
            if (body.classList.contains('menu-open')) {
                e.preventDefault();
            }
        }, { passive: false });

 