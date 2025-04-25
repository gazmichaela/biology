document.addEventListener("DOMContentLoaded", function() {
    // Delay the menu initialization to ensure images have started loading
    setTimeout(initializeDropdownMenus, 300);
    
    function initializeDropdownMenus() {
        // Globální sledování pozice myši pro všechna menu
        let mouseX = 0;
        let mouseY = 0;
        document.addEventListener("mousemove", function(e) {
            mouseX = e.clientX;
            mouseY = e.clientY;
            
            // Uložíme aktuální pozici myši do localStorage
            localStorage.setItem('mouseX', mouseX);
            localStorage.setItem('mouseY', mouseY);
            
            // Kontrola, zda je myš nad dropdown tlačítky
            if (dropdownToggle) {
                const toggleRect = dropdownToggle.getBoundingClientRect();
                if (mouseX >= toggleRect.left && mouseX <= toggleRect.right && 
                    mouseY >= toggleRect.top && mouseY <= toggleRect.bottom) {
                    localStorage.setItem('isMouseOverFirstToggle', 'true');
                } else {
                    localStorage.setItem('isMouseOverFirstToggle', 'false');
                }
            }
        });

        // Globální funkce pro zavření všech menu kromě specifikovaného
        function closeAllMenusExcept(exceptMenuId) {
            // Zavření prvního menu, pokud není výjimka
            if (exceptMenuId !== 'first-menu' && 
                dropdownContent && 
                dropdownContent.style.opacity === "1") {
                hideMenu();
                isClickOpened = false;
            }
            
            // Zavření druhého menu, pokud není výjimka
            if (exceptMenuId !== 'second-menu' && 
                dropdownContent2 && 
                dropdownContent2.style.opacity === "1") {
                hideMenu2();
                isClickOpened2 = false;
            }
            
            // Zavření podmenu, pokud není výjimka
            if (exceptMenuId !== 'sub-menu' && 
                subDropdownContent && 
                subDropdownContent.style.opacity === "1") {
                hideMenuSub();
                isClickOpenedSub = false;
            }
        }

// ----- DROPDOWN MENU FUNCTIONALITY (PRVNÍ MENU) -----
const dropdownToggle = document.querySelector(".dropdown-toggle");
const dropdownContent = document.querySelector(".dropdown-content");

// Ověříme, zda prvky existují
if (dropdownToggle && dropdownContent) {
    let hideTimeoutFirst;
    let animationTimeoutFirst;
    let inactivityTimeoutFirst; // Timeout pro neaktivitu
    let repositionTimeoutFirst; // Timeout pro přepočet pozice
    const inactivityDelay = 2000; // 2 sekundy neaktivity
    let isClickOpened = false; // Flag pro zjištění, zda bylo menu otevřeno kliknutím
    let isSubmenuActive = false; // Flag pro zjištění, zda je aktivní submenu
    let isClosingInProgress = false; // Příznak pro koordinaci animace zavření
    
    // Předpřiprava stylu pro plynulou animaci
    dropdownContent.style.transition = "opacity 0.3s ease-in-out, visibility 0.3s ease-in-out";
    dropdownContent.style.opacity = "0";
    dropdownContent.style.visibility = "hidden";
    dropdownContent.style.display = "none";
    
    // Vytvoříme element pro mrtvou zónu mezi tlačítkem a menu
    const deadZoneElement = document.createElement("div");
    deadZoneElement.className = "dropdown-dead-zone";
    
    // Vložíme element do DOM a nastavíme mu potřebné styly
    document.body.appendChild(deadZoneElement);
    deadZoneElement.style.position = "absolute";
    deadZoneElement.style.display = "none";
    deadZoneElement.style.zIndex = "999"; // Vysoký z-index
    
    // Funkce pro nastavení pozice a rozměrů mrtvé zóny s vyšší spolehlivostí
    function positionDeadZone() {
        if (dropdownContent.style.display === "block") {
            // Použijeme requestAnimationFrame pro lepší optimalizaci
            requestAnimationFrame(() => {
                const toggleRect = dropdownToggle.getBoundingClientRect();
                const contentRect = dropdownContent.getBoundingClientRect();
                
                deadZoneElement.style.left = Math.min(toggleRect.left, contentRect.left) + window.scrollX + "px";
                deadZoneElement.style.top = toggleRect.bottom + window.scrollY + "px";
                deadZoneElement.style.width = Math.max(contentRect.width, toggleRect.width) + "px";
                deadZoneElement.style.height = (contentRect.top - toggleRect.bottom) + "px";
                deadZoneElement.style.display = "block";
            });
        } else {
            deadZoneElement.style.display = "none";
        }
    }
    
    // Funkce pro kontinuální přepočítání pozice
    function startPositionMonitoring() {
        clearTimeout(repositionTimeoutFirst);
        
        // Přepočítej pozici ihned
        positionDeadZone();
        
        // Naplánuj další přepočet
        repositionTimeoutFirst = setTimeout(() => {
            if (dropdownContent.style.display === "block") {
                startPositionMonitoring();
            }
        }, 200); // Každých 200ms kontroluj a přepočítej pozici
    }
    
    // Funkce pro zobrazení menu - UPRAVENO PRO SPOLEHLIVOST
    function showMenu() {
        // Zrušíme všechny předchozí timeouty
        clearTimeout(hideTimeoutFirst);
        clearTimeout(animationTimeoutFirst);
        clearTimeout(inactivityTimeoutFirst);
        
        // Reset stavu zavírání
        isClosingInProgress = false;
        
        // Nejprve zobrazíme element (bez čekání)
        dropdownContent.style.display = "block";
        
        // Použijeme requestAnimationFrame místo setTimeout pro plynulejší animaci
        requestAnimationFrame(() => {
            dropdownContent.style.opacity = "1";
            dropdownContent.style.visibility = "visible";
            
            // Spustíme kontinuální monitorování pozice
            startPositionMonitoring();
        });
        
        // Pokud je menu otevřeno kliknutím, nastavíme timeout pro zavření po neaktivitě
        if (isClickOpened) {
            startInactivityTimer();
            // Uložení stavu do localStorage
            localStorage.setItem('isFirstMenuOpen', 'true');
        }
    }
    
    // Funkce pro spuštění časovače nečinnosti
    function startInactivityTimer() {
        clearTimeout(inactivityTimeoutFirst);
        inactivityTimeoutFirst = setTimeout(() => {
            // Kontrola pozice kurzoru před zavřením
            const menuRect = dropdownContent.getBoundingClientRect();
            const toggleRect = dropdownToggle.getBoundingClientRect();
            
            // Kontrola submenu a jeho prvků
            const subDropdownContent = document.querySelector(".sub-dropdown-content");
            const subDropdownToggle = document.querySelector(".sub-dropdown-toggle");
            const deadZoneElementSub = document.querySelector(".sub-dropdown-dead-zone");
            
            let isMouseOverSubElements = false;
            
            if (subDropdownContent && subDropdownContent.style.display === "block") {
                const subMenuRect = subDropdownContent.getBoundingClientRect();
                if (mouseX >= subMenuRect.left && mouseX <= subMenuRect.right && 
                    mouseY >= subMenuRect.top && mouseY <= subMenuRect.bottom) {
                    isMouseOverSubElements = true;
                }
            }
            
            if (subDropdownToggle) {
                const subToggleRect = subDropdownToggle.getBoundingClientRect();
                if (mouseX >= subToggleRect.left && mouseX <= subToggleRect.right && 
                    mouseY >= subToggleRect.top && mouseY <= subToggleRect.bottom) {
                    isMouseOverSubElements = true;
                }
            }
            
            if (deadZoneElementSub && deadZoneElementSub.style.display === "block") {
                const subDeadRect = deadZoneElementSub.getBoundingClientRect();
                if (mouseX >= subDeadRect.left && mouseX <= subDeadRect.right && 
                    mouseY >= subDeadRect.top && mouseY <= subDeadRect.bottom) {
                    isMouseOverSubElements = true;
                }
            }
            
            // Kontrola hlavních prvků
            const isMouseOverMenu = 
                mouseX >= menuRect.left && 
                mouseX <= menuRect.right && 
                mouseY >= menuRect.top && 
                mouseY <= menuRect.bottom;
                
            const isMouseOverToggle = 
                mouseX >= toggleRect.left && 
                mouseX <= toggleRect.right && 
                mouseY >= toggleRect.top && 
                mouseY <= toggleRect.bottom;
                
            const isMouseOverDeadZone = 
                deadZoneElement.style.display === "block" &&
                mouseX >= deadZoneElement.getBoundingClientRect().left && 
                mouseX <= deadZoneElement.getBoundingClientRect().right && 
                mouseY >= deadZoneElement.getBoundingClientRect().top && 
                mouseY <= deadZoneElement.getBoundingClientRect().bottom;
            
            // Zavřít menu pouze pokud kurzor není nad žádným z menu prvků
            if (!isMouseOverMenu && !isMouseOverToggle && !isMouseOverDeadZone && !isMouseOverSubElements) {
                hideMenu();
                isClickOpened = false;
            } else {
                // Pokud je kurzor nad některým prvkem, prodloužit časovač
                startInactivityTimer();
            }
        }, inactivityDelay);
    }
    
    // Funkce pro skrytí menu - UPRAVENO PRO SPOLEHLIVOST
    function hideMenu() {
        // Zrušíme všechny předchozí timeouty
        clearTimeout(hideTimeoutFirst);
        clearTimeout(animationTimeoutFirst);
        clearTimeout(inactivityTimeoutFirst);
        clearTimeout(repositionTimeoutFirst); // Zrušit monitorování pozice
        
        // Nastavíme příznak, že probíhá zavírání
        isClosingInProgress = true;
        
        // Nejprve spustíme animaci průhlednosti
        dropdownContent.style.opacity = "0";
        dropdownContent.style.visibility = "hidden";
        
        // Také musíme vyvolat zavření submenu
        if (typeof window.closeSubMenuWithParent === 'function') {
            window.closeSubMenuWithParent();
        }
        
        // Po dokončení animace skryjeme prvky úplně
        animationTimeoutFirst = setTimeout(() => {
            dropdownContent.style.display = "none";
            deadZoneElement.style.display = "none";
            
            // Také skryjeme submenu po dokončení animace
            const subDropdownContent = document.querySelector(".sub-dropdown-content");
            if (subDropdownContent) {
                subDropdownContent.style.opacity = "0";
                subDropdownContent.style.visibility = "hidden";
                subDropdownContent.style.display = "none";
                
                const deadZoneElementSub = document.querySelector(".sub-dropdown-dead-zone");
                if (deadZoneElementSub) {
                    deadZoneElementSub.style.display = "none";
                }
            }
            
            isClickOpened = false;
            isSubmenuActive = false; // Resetujeme stav submenu
            // Odstranění stavu z localStorage
            localStorage.removeItem('isFirstMenuOpen');
            localStorage.removeItem('isSubMenuOpen');
            localStorage.removeItem('isMouseOverFirstToggle');
            isClosingInProgress = false;
        }, 300);
        
        // Zrušíme časovač nečinnosti
        clearTimeout(inactivityTimeoutFirst);
    }
    
    // Globální funkce pro zavření všech menu kromě specifikovaného
    window.closeAllMenusExcept = function(exceptMenuId) {
        if (exceptMenuId !== 'first-menu') {
            hideMenu();
        }
    };
    
    // Exportujeme funkci pro zavření prvního menu z jiných menu
    window.closeFirstMenu = function() {
        if (isClickOpened) {
            hideMenu();
            isClickOpened = false;
        }
    };
    
    // Přidáme event listener pro kliknutí na tlačítko - UPRAVENO PRO SPOLEHLIVOST
    dropdownToggle.addEventListener("click", function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        // Zrušíme všechny aktivní timeouty, které by mohly interferovat
        clearTimeout(hideTimeoutFirst);
        clearTimeout(animationTimeoutFirst);
        clearTimeout(inactivityTimeoutFirst);
        
        // Reset stavu zavírání - DŮLEŽITÉ
        isClosingInProgress = false;
        
        if (dropdownContent.style.opacity === "1" && isClickOpened) {
            // Pokud je menu již otevřené kliknutím, zavřeme ho
            hideMenu();
            isClickOpened = false;
        } else {
            // Zavřít všechna ostatní menu
            if (typeof closeAllMenusExcept === 'function') {
                closeAllMenusExcept('first-menu');
            }
            
            // Jinak ho otevřeme a nastavíme flag
            isClickOpened = true;
            
            // PŘIDÁNO: Vždy skrýt submenu při kliknutí na hlavní tlačítko
            const subDropdownContent = document.querySelector(".sub-dropdown-content");
            if (subDropdownContent && subDropdownContent.style.opacity === "1") {
                subDropdownContent.style.opacity = "0";
                subDropdownContent.style.visibility = "hidden";
                
                setTimeout(() => {
                    subDropdownContent.style.display = "none";
                    
                    const deadZoneElementSub = document.querySelector(".sub-dropdown-dead-zone");
                    if (deadZoneElementSub) {
                        deadZoneElementSub.style.display = "none";
                    }
                    
                    localStorage.removeItem('isSubMenuOpen');
                }, 300);
            }
            
            // Vynucené okamžité zobrazení menu
            dropdownContent.style.display = "block";
            
            // Použijeme requestAnimationFrame pro plynulejší animaci
            requestAnimationFrame(() => {
                dropdownContent.style.opacity = "1";
                dropdownContent.style.visibility = "visible";
                
                // Spustíme kontinuální monitorování pozice
                startPositionMonitoring();
                
                // Uložení stavu do localStorage
                localStorage.setItem('isFirstMenuOpen', 'true');
                
                // Spustíme časovač nečinnosti
                startInactivityTimer();
            });
        }
    });
    
    // Přidám event listener pro mouseenter na dropdown tlačítko
    dropdownToggle.addEventListener("mouseenter", function() {
        // Zavření druhého menu pokud je otevřené
        if (window.closeSecondMenu) {
            window.closeSecondMenu();
        }
        
        // Odstraněno podmínkové ověření pro isClosingInProgress, aby se menu vždy zobrazilo
        if (!isClickOpened) {
            // Použijeme requestAnimationFrame pro spolehlivější zobrazení
            requestAnimationFrame(() => {
                showMenu();
            });
        }
        
        // NOVÉ: Uložíme informaci o tom, že kurzor je nad tlačítkem
        localStorage.setItem('isMouseOverFirstToggle', 'true');
        
        // PŘIDÁNO: Pokud existuje otevřené submenu, je potřeba ho skrýt
        const subDropdownContent = document.querySelector(".sub-dropdown-content");
        if (subDropdownContent && subDropdownContent.style.opacity === "1") {
            subDropdownContent.style.opacity = "0";
            subDropdownContent.style.visibility = "hidden";
            
            setTimeout(() => {
                subDropdownContent.style.display = "none";
                
                const deadZoneElementSub = document.querySelector(".sub-dropdown-dead-zone");
                if (deadZoneElementSub) {
                    deadZoneElementSub.style.display = "none";
                }
                
                localStorage.removeItem('isSubMenuOpen');
            }, 300);
        }
    });
    
    // NOVÉ: Přidat listener pro mouseleave na toggle tlačítko pro záznam pozice
    dropdownToggle.addEventListener("mouseleave", function(e) {
        localStorage.removeItem('isMouseOverFirstToggle');
        
        if (isClickOpened) return; // Pokud je otevřeno kliknutím, neskrývat
        
        // Zkontrolujeme, kam kurzor směřuje
        const toElement = e.relatedTarget;
        
        // Pokud kurzor nejde do mrtvé zóny nebo do podmenu, zahájíme skrývání
        if (toElement !== deadZoneElement && !deadZoneElement.contains(toElement) && 
            toElement !== dropdownContent && !dropdownContent.contains(toElement)) {
            
            hideTimeoutFirst = setTimeout(function() {
                if (!isClickOpened) { // Dvojitá kontrola před skrytím
                    hideMenu();
                }
            }, 250);
        }
    });
    
    // Export funkce pro submenu
    window.closeSubMenuWithParent = function() {
        // Tato funkce je volána z hideMenu
        isSubmenuActive = false;
    };
    
    // Udržování podmenu otevřeného při najetí na samotné podmenu
    dropdownContent.addEventListener("mouseenter", function() {
        if (!isClickOpened) {
            // Zrušíme všechny předchozí timeouty
            clearTimeout(hideTimeoutFirst);
            clearTimeout(animationTimeoutFirst);
            
            // Zajistíme, že menu zůstane viditelné
            dropdownContent.style.display = "block";
            
            // Použijeme requestAnimationFrame pro plynulejší animaci
            requestAnimationFrame(() => {
                dropdownContent.style.opacity = "1";
                dropdownContent.style.visibility = "visible";
                
                // Spustíme kontinuální monitorování pozice
                startPositionMonitoring();
            });
        } else if (isClickOpened) {
            // Pokud je otevřeno kliknutím, resetujeme časovač nečinnosti
            startInactivityTimer();
        }
    });
    
    // Přidáme posluchače událostí myši pro resetování časovače nečinnosti
    dropdownContent.addEventListener("mousemove", function() {
        if (isClickOpened) {
            startInactivityTimer();
        }
    });
    
    // Přidáme posluchače pro kliknutí v menu, aby se resetoval časovač
    dropdownContent.addEventListener("click", function() {
        if (isClickOpened) {
            startInactivityTimer();
        }
    });
    
    // Přidáme posluchače pro vyhledávací pole a jiné prvky v menu
    const searchElements = dropdownContent.querySelectorAll('input, select, textarea, button');
    searchElements.forEach(element => {
        // Při interakci s prvkem resetujeme časovač nečinnosti
        element.addEventListener('focus', function() {
            if (isClickOpened) {
                startInactivityTimer();
            }
        });
        
        element.addEventListener('input', function() {
            if (isClickOpened) {
                startInactivityTimer();
            }
        });
        
        element.addEventListener('click', function(e) {
            if (isClickOpened) {
                startInactivityTimer();
                e.stopPropagation(); // Zabrání šíření události, která by mohla zavřít menu
            }
        });
    });
    
    // Přidáme posluchače pro odkazy v menu
    const menuLinks = dropdownContent.querySelectorAll('a');
    menuLinks.forEach(link => {
        // Vyčistíme localStorage před navigací
        link.addEventListener('click', function() {
            // Vyčistíme všechny stavy menu z localStorage
            localStorage.removeItem('isFirstMenuOpen');
            localStorage.removeItem('isSecondMenuOpen');
            localStorage.removeItem('isSubMenuOpen');
            localStorage.removeItem('isMouseOverFirstToggle');
            localStorage.removeItem('isMouseOverSecondToggle');
        });
    });
    
    // Udržování podmenu otevřeného při najetí na mrtvou zónu
    deadZoneElement.addEventListener("mouseenter", function() {
        if (!isClickOpened) {
            // Zrušíme všechny předchozí timeouty
            clearTimeout(hideTimeoutFirst);
            clearTimeout(animationTimeoutFirst);
            
            // Ujistíme se, že menu zůstane viditelné
            dropdownContent.style.display = "block";
            
            // Použijeme requestAnimationFrame pro plynulejší animaci
            requestAnimationFrame(() => {
                dropdownContent.style.opacity = "1";
                dropdownContent.style.visibility = "visible";
            });
        } else if (isClickOpened) {
            // Pokud je otevřeno kliknutím, resetujeme časovač nečinnosti
            startInactivityTimer();
        }
    });
    
    // Skrytí podmenu při opuštění kurzoru podmenu - pouze pokud není otevřeno kliknutím
    dropdownContent.addEventListener("mouseleave", function(e) {
        if (isClickOpened) return; // Pokud je otevřeno kliknutím, neskrývat
        
        // Zkontrolujeme, kam kurzor směřuje
        const toElement = e.relatedTarget;
        
        // Zkontrolujme také prvky podmenu
        const subToggle = document.querySelector(".sub-dropdown-toggle");
        const subContent = document.querySelector(".sub-dropdown-content");
        const subDeadZone = document.querySelector(".sub-dropdown-dead-zone");
        
        // Pokud kurzor nejde do subMenu, mrtvé zóny nebo do tlačítka, zahájíme skrývání
        if ((toElement !== deadZoneElement && !deadZoneElement.contains(toElement)) && 
            (toElement !== dropdownToggle && !dropdownToggle.contains(toElement)) &&
            (toElement !== subToggle && (subToggle && !subToggle.contains(toElement))) &&
            (toElement !== subContent && (subContent && !subContent.contains(toElement))) &&
            (toElement !== subDeadZone && (subDeadZone && !subDeadZone.contains(toElement)))) {
            
            hideTimeoutFirst = setTimeout(function() {
                if (!isClickOpened) { // Dvojitá kontrola před skrytím
                    hideMenu();
                }
            }, 400);
        }
    });
    
    // Skrytí podmenu při opuštění mrtvé zóny - pouze pokud není otevřeno kliknutím
    deadZoneElement.addEventListener("mouseleave", function(e) {
        if (isClickOpened) return; // Pokud je otevřeno kliknutím, neskrývat
        
        // Zkontrolujeme, kam kurzor směřuje
        const toElement = e.relatedTarget;
        
        // Zkontrolujme také prvky podmenu
        const subToggle = document.querySelector(".sub-dropdown-toggle");
        const subContent = document.querySelector(".sub-dropdown-content");
        const subDeadZone = document.querySelector(".sub-dropdown-dead-zone");
        
        // Pokud kurzor nejde do menu, tlačítka nebo prvků podmenu, zahájíme skrývání
        if ((toElement !== dropdownToggle && !dropdownToggle.contains(toElement)) && 
            (toElement !== dropdownContent && !dropdownContent.contains(toElement)) &&
            (toElement !== subToggle && (subToggle && !subToggle.contains(toElement))) &&
            (toElement !== subContent && (subContent && !subContent.contains(toElement))) &&
            (toElement !== subDeadZone && (subDeadZone && !subDeadZone.contains(toElement)))) {
            
            hideTimeoutFirst = setTimeout(function() {
                if (!isClickOpened) { // Dvojitá kontrola před skrytím
                    hideMenu();
                }
            }, 300);
        }
    });
    
    // Zavření menu kliknutím kamkoliv mimo menu a tlačítko
    document.addEventListener("click", function(event) {
        // Kontrola prvků podmenu
        const subToggle = document.querySelector(".sub-dropdown-toggle");
        const subContent = document.querySelector(".sub-dropdown-content");
        const subDeadZone = document.querySelector(".sub-dropdown-dead-zone");
        
        if (!dropdownToggle.contains(event.target) && 
            !dropdownContent.contains(event.target) &&
            event.target !== deadZoneElement &&
            (!subToggle || !subToggle.contains(event.target)) &&
            (!subContent || !subContent.contains(event.target)) &&
            (!subDeadZone || !subDeadZone.contains(event.target))) {
            
            hideMenu();
            isClickOpened = false;
        }
    });
    
    // Export funkce pro submenu, která bude nastavovat stav submenu
    window.setSubmenuActive = function(active) {
        isSubmenuActive = active;
        if (active && isClickOpened) {
            // Pokud je submenu aktivní a hlavní menu otevřeno kliknutím, 
            // resetujeme časovač nečinnosti
            startInactivityTimer();
        }
    };

    // NOVÉ: Funkce pro kontrolu pozice myši při načtení stránky s ohledem na obrázky
    function handlePageLoad() {
        // Počkáme, až budou obrázky načteny, než začneme s inicializací menu
        ensureImagesLoaded().then(() => {
            // Načtení uložené pozice myši
            const savedMouseX = parseInt(localStorage.getItem('mouseX')) || 0;
            const savedMouseY = parseInt(localStorage.getItem('mouseY')) || 0;
            
            // Nastavení globálních proměnných pro pozici myši
            mouseX = savedMouseX;
            mouseY = savedMouseY;
            
            // Zjistíme, zda byl kurzor nad dropdown tlačítkem před refreshem
            if (localStorage.getItem('isMouseOverFirstToggle') === 'true') {
                // Automaticky zobrazíme menu při hoveru
                showMenu();
            }
            
            // Kontrola otevřeného menu z localStorage (pro kliknuté menu)
            if (localStorage.getItem('isFirstMenuOpen') === 'true') {
                isClickOpened = true;
                showMenu();
            }
            
            // NOVÉ: Přepočítáme pozici mrtvé zóny po načtení obrázků
            if (dropdownContent.style.display === "block") {
                startPositionMonitoring();
            }
        });
    }
    
    // Spustíme kontrolu při načtení stránky
    handlePageLoad();
}

// Zajištění sledování pozice myši pro oba dropdowny
// Tyto funkce by měly být definovány v globálním kontextu
// a sdíleny mezi oběma menu
if (typeof mouseX === 'undefined' && typeof mouseY === 'undefined') {
    let mouseX = 0;
    let mouseY = 0;

    // Sledování pozice myši
    document.addEventListener('mousemove', function(e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        // Uložíme pozici do localStorage pro obnovení po refreshi
        localStorage.setItem('mouseX', mouseX);
        localStorage.setItem('mouseY', mouseY);
    });
}

// NOVÉ: Funkce pro zajištění, že obrázky budou načteny nebo alespoň započato jejich načítání
// Tato funkce by měla být umístěna v globálním kontextu, aby byla dostupná pro obě menu
function ensureImagesLoaded() {
    return new Promise((resolve) => {
        // Zjistíme všechny obrázky na stránce
        const images = document.querySelectorAll('img');
        
        // Pokud nejsou žádné obrázky, okamžitě vrátíme true
        if (images.length === 0) {
            resolve(true);
            return;
        }
        
        // Počítadlo načtených obrázků
        let loadedImages = 0;
        
        // Funkce, která se zavolá po načtení obrázku
        function imageLoaded() {
            loadedImages++;
            
            // Pokud jsou všechny obrázky načteny nebo čas vypršel, vrátíme true
            if (loadedImages === images.length) {
                resolve(true);
            }
        }
        
        // Maximální doba čekání před pokračováním (3 sekundy)
        const maxWaitTime = 3000;
        
        // Po vypršení času pokračujeme bez ohledu na stav obrázků
        setTimeout(() => {
            resolve(true);
        }, maxWaitTime);
        
        // Pro každý obrázek přidáme posluchače událostí
        images.forEach(img => {
            // Pokud je již obrázek načten (z cache), přímo zvýšíme počítadlo
            if (img.complete) {
                imageLoaded();
            } else {
                // Jinak přidáme posluchače události pro načtení
                img.addEventListener('load', imageLoaded);
                // Také musíme zachytit chyby načítání
                img.addEventListener('error', imageLoaded);
            }
        });
    });
}
    }
// ----- DROPDOWN MENU FUNCTIONALITY (DRUHÉ MENU) -----
const dropdownToggle2 = document.querySelector(".dropdown-toggle-second");
const dropdownContent2 = document.querySelector(".dropdown-content-second");

// Ověříme, zda prvky existují
if (dropdownToggle2 && dropdownContent2) {
    let hideTimeoutSecond;
    let animationTimeoutSecond;
    let inactivityTimeoutSecond; // Timeout pro neaktivitu
    let repositionTimeoutSecond; // Timeout pro přepočet pozice
    const inactivityDelay = 2000; // 2 sekundy neaktivity
    let isClickOpened2 = false; // Flag pro zjištění, zda bylo menu otevřeno kliknutím
    let isSubmenuActive2 = false; // Flag pro zjištění, zda je aktivní submenu
    let isClosingInProgress2 = false; // Příznak pro koordinaci animace zavření
    
    // Předpřiprava stylu pro plynulou animaci
    dropdownContent2.style.transition = "opacity 0.3s ease-in-out, visibility 0.3s ease-in-out";
    dropdownContent2.style.opacity = "0";
    dropdownContent2.style.visibility = "hidden";
    dropdownContent2.style.display = "none";
    
    // Vytvoříme element pro mrtvou zónu mezi tlačítkem a menu
    const deadZoneElement2 = document.createElement("div");
    deadZoneElement2.className = "dropdown-dead-zone-second";
    
    // Vložíme element do DOM a nastavíme mu potřebné styly
    document.body.appendChild(deadZoneElement2);
    deadZoneElement2.style.position = "absolute";
    deadZoneElement2.style.display = "none";
    deadZoneElement2.style.zIndex = "999"; // Vysoký z-index
    
    // Funkce pro nastavení pozice a rozměrů mrtvé zóny s vyšší spolehlivostí
    function positionDeadZone2() {
        if (dropdownContent2.style.display === "block") {
            // Použijeme requestAnimationFrame pro lepší optimalizaci
            requestAnimationFrame(() => {
                const toggleRect = dropdownToggle2.getBoundingClientRect();
                const contentRect = dropdownContent2.getBoundingClientRect();
                
                deadZoneElement2.style.left = Math.min(toggleRect.left, contentRect.left) + window.scrollX + "px";
                deadZoneElement2.style.top = toggleRect.bottom + window.scrollY + "px";
                deadZoneElement2.style.width = Math.max(contentRect.width, toggleRect.width) + "px";
                deadZoneElement2.style.height = (contentRect.top - toggleRect.bottom) + "px";
                deadZoneElement2.style.display = "block";
            });
        } else {
            deadZoneElement2.style.display = "none";
        }
    }
    
    // Funkce pro kontinuální přepočítání pozice
    function startPositionMonitoring2() {
        clearTimeout(repositionTimeoutSecond);
        
        // Přepočítej pozici ihned
        positionDeadZone2();
        
        // Naplánuj další přepočet
        repositionTimeoutSecond = setTimeout(() => {
            if (dropdownContent2.style.display === "block") {
                startPositionMonitoring2();
            }
        }, 200); // Každých 200ms kontroluj a přepočítej pozici
    }
    
    // Funkce pro zobrazení menu - UPRAVENO PRO SPOLEHLIVOST
    function showMenu2() {
        // Zrušíme všechny předchozí timeouty
        clearTimeout(hideTimeoutSecond);
        clearTimeout(animationTimeoutSecond);
        clearTimeout(inactivityTimeoutSecond);
        
        // Reset stavu zavírání
        isClosingInProgress2 = false;
        
        // Nejprve zobrazíme element (bez čekání)
        dropdownContent2.style.display = "block";
        
        // Použijeme requestAnimationFrame místo setTimeout pro plynulejší animaci
        requestAnimationFrame(() => {
            dropdownContent2.style.opacity = "1";
            dropdownContent2.style.visibility = "visible";
            
            // Spustíme kontinuální monitorování pozice
            startPositionMonitoring2();
        });
        
        // Pokud je menu otevřeno kliknutím, nastavíme timeout pro zavření po neaktivitě
        if (isClickOpened2) {
            startInactivityTimer2();
            // Uložení stavu do localStorage
            localStorage.setItem('isSecondMenuOpen', 'true');
        }
    }
    
    // Funkce pro spuštění časovače nečinnosti
    function startInactivityTimer2() {
        clearTimeout(inactivityTimeoutSecond);
        inactivityTimeoutSecond = setTimeout(() => {
            // Kontrola pozice kurzoru před zavřením
            const menuRect = dropdownContent2.getBoundingClientRect();
            const toggleRect = dropdownToggle2.getBoundingClientRect();
            
            // Kontrola submenu a jeho prvků
            const subDropdownContent2 = document.querySelector(".sub-dropdown-content-second");
            const subDropdownToggle2 = document.querySelector(".sub-dropdown-toggle-second");
            const deadZoneElementSub2 = document.querySelector(".sub-dropdown-dead-zone-second");
            
            let isMouseOverSubElements2 = false;
            
            if (subDropdownContent2 && subDropdownContent2.style.display === "block") {
                const subMenuRect = subDropdownContent2.getBoundingClientRect();
                if (mouseX >= subMenuRect.left && mouseX <= subMenuRect.right && 
                    mouseY >= subMenuRect.top && mouseY <= subMenuRect.bottom) {
                    isMouseOverSubElements2 = true;
                }
            }
            
            if (subDropdownToggle2) {
                const subToggleRect = subDropdownToggle2.getBoundingClientRect();
                if (mouseX >= subToggleRect.left && mouseX <= subToggleRect.right && 
                    mouseY >= subToggleRect.top && mouseY <= subToggleRect.bottom) {
                    isMouseOverSubElements2 = true;
                }
            }
            
            if (deadZoneElementSub2 && deadZoneElementSub2.style.display === "block") {
                const subDeadRect = deadZoneElementSub2.getBoundingClientRect();
                if (mouseX >= subDeadRect.left && mouseX <= subDeadRect.right && 
                    mouseY >= subDeadRect.top && mouseY <= subDeadRect.bottom) {
                    isMouseOverSubElements2 = true;
                }
            }
            
            // Kontrola hlavních prvků
            const isMouseOverMenu = 
                mouseX >= menuRect.left && 
                mouseX <= menuRect.right && 
                mouseY >= menuRect.top && 
                mouseY <= menuRect.bottom;
                
            const isMouseOverToggle = 
                mouseX >= toggleRect.left && 
                mouseX <= toggleRect.right && 
                mouseY >= toggleRect.top && 
                mouseY <= toggleRect.bottom;
                
            const isMouseOverDeadZone = 
                deadZoneElement2.style.display === "block" &&
                mouseX >= deadZoneElement2.getBoundingClientRect().left && 
                mouseX <= deadZoneElement2.getBoundingClientRect().right && 
                mouseY >= deadZoneElement2.getBoundingClientRect().top && 
                mouseY <= deadZoneElement2.getBoundingClientRect().bottom;
            
            // Zavřít menu pouze pokud kurzor není nad žádným z menu prvků
            if (!isMouseOverMenu && !isMouseOverToggle && !isMouseOverDeadZone && !isMouseOverSubElements2) {
                hideMenu2();
                isClickOpened2 = false;
            } else {
                // Pokud je kurzor nad některým prvkem, prodloužit časovač
                startInactivityTimer2();
            }
        }, inactivityDelay);
    }
    
    // Funkce pro skrytí menu - UPRAVENO PRO SPOLEHLIVOST
    function hideMenu2() {
        // Zrušíme všechny předchozí timeouty
        clearTimeout(hideTimeoutSecond);
        clearTimeout(animationTimeoutSecond);
        clearTimeout(inactivityTimeoutSecond);
        clearTimeout(repositionTimeoutSecond); // Zrušit monitorování pozice
        
        // Nastavíme příznak, že probíhá zavírání
        isClosingInProgress2 = true;
        
        // Nejprve spustíme animaci průhlednosti
        dropdownContent2.style.opacity = "0";
        dropdownContent2.style.visibility = "hidden";
        
        // Také musíme vyvolat zavření submenu
        if (typeof window.closeSubMenuWithParent2 === 'function') {
            window.closeSubMenuWithParent2();
        }
        
        // Po dokončení animace skryjeme prvky úplně
        animationTimeoutSecond = setTimeout(() => {
            dropdownContent2.style.display = "none";
            deadZoneElement2.style.display = "none";
            
            // Také skryjeme submenu po dokončení animace
            const subDropdownContent2 = document.querySelector(".sub-dropdown-content-second");
            if (subDropdownContent2) {
                subDropdownContent2.style.opacity = "0";
                subDropdownContent2.style.visibility = "hidden";
                subDropdownContent2.style.display = "none";
                
                const deadZoneElementSub2 = document.querySelector(".sub-dropdown-dead-zone-second");
                if (deadZoneElementSub2) {
                    deadZoneElementSub2.style.display = "none";
                }
            }
            
            isClickOpened2 = false;
            isSubmenuActive2 = false; // Resetujeme stav submenu
            // Odstranění stavu z localStorage
            localStorage.removeItem('isSecondMenuOpen');
            localStorage.removeItem('isSubMenuOpen2');
            localStorage.removeItem('isMouseOverSecondToggle');
            isClosingInProgress2 = false;
        }, 300);
        
        // Zrušíme časovač nečinnosti
        clearTimeout(inactivityTimeoutSecond);
    }
    
    // Globální funkce pro zavření všech menu kromě specifikovaného
    window.closeAllMenusExcept = function(exceptMenuId) {
        if (exceptMenuId !== 'second-menu') {
            hideMenu2();
        }
    };
    
    // Exportujeme funkci pro zavření druhého menu z jiných menu
    window.closeSecondMenu = function() {
        if (isClickOpened2) {
            hideMenu2();
            isClickOpened2 = false;
        }
    };
    
    // Přidáme event listener pro kliknutí na tlačítko - UPRAVENO PRO SPOLEHLIVOST
    dropdownToggle2.addEventListener("click", function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        // Zrušíme všechny aktivní timeouty, které by mohly interferovat
        clearTimeout(hideTimeoutSecond);
        clearTimeout(animationTimeoutSecond);
        clearTimeout(inactivityTimeoutSecond);
        
        // Reset stavu zavírání - DŮLEŽITÉ
        isClosingInProgress2 = false;
        
        if (dropdownContent2.style.opacity === "1" && isClickOpened2) {
            // Pokud je menu již otevřené kliknutím, zavřeme ho
            hideMenu2();
            isClickOpened2 = false;
        } else {
            // Zavřít všechna ostatní menu
            if (typeof closeAllMenusExcept === 'function') {
                closeAllMenusExcept('second-menu');
            }
            
            // Jinak ho otevřeme a nastavíme flag
            isClickOpened2 = true;
            
            // PŘIDÁNO: Vždy skrýt submenu při kliknutí na hlavní tlačítko
            const subDropdownContent2 = document.querySelector(".sub-dropdown-content-second");
            if (subDropdownContent2 && subDropdownContent2.style.opacity === "1") {
                subDropdownContent2.style.opacity = "0";
                subDropdownContent2.style.visibility = "hidden";
                
                setTimeout(() => {
                    subDropdownContent2.style.display = "none";
                    
                    const deadZoneElementSub2 = document.querySelector(".sub-dropdown-dead-zone-second");
                    if (deadZoneElementSub2) {
                        deadZoneElementSub2.style.display = "none";
                    }
                    
                    localStorage.removeItem('isSubMenuOpen2');
                }, 300);
            }
            
            // Vynucené okamžité zobrazení menu
            dropdownContent2.style.display = "block";
            
            // Použijeme requestAnimationFrame pro plynulejší animaci
            requestAnimationFrame(() => {
                dropdownContent2.style.opacity = "1";
                dropdownContent2.style.visibility = "visible";
                
                // Spustíme kontinuální monitorování pozice
                startPositionMonitoring2();
                
                // Uložení stavu do localStorage
                localStorage.setItem('isSecondMenuOpen', 'true');
                
                // Spustíme časovač nečinnosti
                startInactivityTimer2();
            });
        }
    });
    
    // Přidám event listener pro mouseenter na dropdown tlačítko
    dropdownToggle2.addEventListener("mouseenter", function() {
        // Zavření prvního menu pokud je otevřené
        if (window.closeFirstMenu) {
            window.closeFirstMenu();
        }
        
        // Odstraněno podmínkové ověření pro isClosingInProgress, aby se menu vždy zobrazilo
        if (!isClickOpened2) {
            // Použijeme requestAnimationFrame pro spolehlivější zobrazení
            requestAnimationFrame(() => {
                showMenu2();
            });
        }
        
        // NOVÉ: Uložíme informaci o tom, že kurzor je nad tlačítkem
        localStorage.setItem('isMouseOverSecondToggle', 'true');
        
        // PŘIDÁNO: Pokud existuje otevřené submenu, je potřeba ho skrýt
        const subDropdownContent2 = document.querySelector(".sub-dropdown-content-second");
        if (subDropdownContent2 && subDropdownContent2.style.opacity === "1") {
            subDropdownContent2.style.opacity = "0";
            subDropdownContent2.style.visibility = "hidden";
            
            setTimeout(() => {
                subDropdownContent2.style.display = "none";
                
                const deadZoneElementSub2 = document.querySelector(".sub-dropdown-dead-zone-second");
                if (deadZoneElementSub2) {
                    deadZoneElementSub2.style.display = "none";
                }
                
                localStorage.removeItem('isSubMenuOpen2');
            }, 300);
        }
    });
    
    // NOVÉ: Přidat listener pro mouseleave na toggle tlačítko pro záznam pozice
    dropdownToggle2.addEventListener("mouseleave", function(e) {
        localStorage.removeItem('isMouseOverSecondToggle');
        
        if (isClickOpened2) return; // Pokud je otevřeno kliknutím, neskrývat
        
        // Zkontrolujeme, kam kurzor směřuje
        const toElement = e.relatedTarget;
        
        // Pokud kurzor nejde do mrtvé zóny nebo do podmenu, zahájíme skrývání
        if (toElement !== deadZoneElement2 && !deadZoneElement2.contains(toElement) && 
            toElement !== dropdownContent2 && !dropdownContent2.contains(toElement)) {
            
            hideTimeoutSecond = setTimeout(function() {
                if (!isClickOpened2) { // Dvojitá kontrola před skrytím
                    hideMenu2();
                }
            }, 250);
        }
    });
    
    // Export funkce pro submenu
    window.closeSubMenuWithParent2 = function() {
        // Tato funkce je volána z hideMenu
        isSubmenuActive2 = false;
    };
    
    // Udržování podmenu otevřeného při najetí na samotné podmenu
    dropdownContent2.addEventListener("mouseenter", function() {
        if (!isClickOpened2) {
            // Zrušíme všechny předchozí timeouty
            clearTimeout(hideTimeoutSecond);
            clearTimeout(animationTimeoutSecond);
            
            // Zajistíme, že menu zůstane viditelné
            dropdownContent2.style.display = "block";
            
            // Použijeme requestAnimationFrame pro plynulejší animaci
            requestAnimationFrame(() => {
                dropdownContent2.style.opacity = "1";
                dropdownContent2.style.visibility = "visible";
                
                // Spustíme kontinuální monitorování pozice
                startPositionMonitoring2();
            });
        } else if (isClickOpened2) {
            // Pokud je otevřeno kliknutím, resetujeme časovač nečinnosti
            startInactivityTimer2();
        }
    });
    
    // Přidáme posluchače událostí myši pro resetování časovače nečinnosti
    dropdownContent2.addEventListener("mousemove", function() {
        if (isClickOpened2) {
            startInactivityTimer2();
        }
    });
    
    // Přidáme posluchače pro kliknutí v menu, aby se resetoval časovač
    dropdownContent2.addEventListener("click", function() {
        if (isClickOpened2) {
            startInactivityTimer2();
        }
    });
    
    // Přidáme posluchače pro vyhledávací pole a jiné prvky v menu
    const searchElements2 = dropdownContent2.querySelectorAll('input, select, textarea, button');
    searchElements2.forEach(element => {
        // Při interakci s prvkem resetujeme časovač nečinnosti
        element.addEventListener('focus', function() {
            if (isClickOpened2) {
                startInactivityTimer2();
            }
        });
        
        element.addEventListener('input', function() {
            if (isClickOpened2) {
                startInactivityTimer2();
            }
        });
        
        element.addEventListener('click', function(e) {
            if (isClickOpened2) {
                startInactivityTimer2();
                e.stopPropagation(); // Zabrání šíření události, která by mohla zavřít menu
            }
        });
    });
    
    // Přidáme posluchače pro odkazy v menu
    const menuLinks2 = dropdownContent2.querySelectorAll('a');
    menuLinks2.forEach(link => {
        // Vyčistíme localStorage před navigací
        link.addEventListener('click', function() {
            // Vyčistíme všechny stavy menu z localStorage
            localStorage.removeItem('isFirstMenuOpen');
            localStorage.removeItem('isSecondMenuOpen');
            localStorage.removeItem('isSubMenuOpen');
            localStorage.removeItem('isSubMenuOpen2');
            localStorage.removeItem('isMouseOverFirstToggle');
            localStorage.removeItem('isMouseOverSecondToggle');
        });
    });
    
    // Udržování podmenu otevřeného při najetí na mrtvou zónu
    deadZoneElement2.addEventListener("mouseenter", function() {
        if (!isClickOpened2) {
            // Zrušíme všechny předchozí timeouty
            clearTimeout(hideTimeoutSecond);
            clearTimeout(animationTimeoutSecond);
            
            // Ujistíme se, že menu zůstane viditelné
            dropdownContent2.style.display = "block";
            
            // Použijeme requestAnimationFrame pro plynulejší animaci
            requestAnimationFrame(() => {
                dropdownContent2.style.opacity = "1";
                dropdownContent2.style.visibility = "visible";
            });
        } else if (isClickOpened2) {
            // Pokud je otevřeno kliknutím, resetujeme časovač nečinnosti
            startInactivityTimer2();
        }
    });
    
    // Skrytí podmenu při opuštění kurzoru podmenu - pouze pokud není otevřeno kliknutím
    dropdownContent2.addEventListener("mouseleave", function(e) {
        if (isClickOpened2) return; // Pokud je otevřeno kliknutím, neskrývat
        
        // Zkontrolujeme, kam kurzor směřuje
        const toElement = e.relatedTarget;
        
        // Zkontrolujme také prvky podmenu
        const subToggle2 = document.querySelector(".sub-dropdown-toggle-second");
        const subContent2 = document.querySelector(".sub-dropdown-content-second");
        const subDeadZone2 = document.querySelector(".sub-dropdown-dead-zone-second");
        
        // Pokud kurzor nejde do subMenu, mrtvé zóny nebo do tlačítka, zahájíme skrývání
        if ((toElement !== deadZoneElement2 && !deadZoneElement2.contains(toElement)) && 
            (toElement !== dropdownToggle2 && !dropdownToggle2.contains(toElement)) &&
            (toElement !== subToggle2 && (subToggle2 && !subToggle2.contains(toElement))) &&
            (toElement !== subContent2 && (subContent2 && !subContent2.contains(toElement))) &&
            (toElement !== subDeadZone2 && (subDeadZone2 && !subDeadZone2.contains(toElement)))) {
            
            hideTimeoutSecond = setTimeout(function() {
                if (!isClickOpened2) { // Dvojitá kontrola před skrytím
                    hideMenu2();
                }
            }, 400);
        }
    });
    
    // Skrytí podmenu při opuštění mrtvé zóny - pouze pokud není otevřeno kliknutím
    deadZoneElement2.addEventListener("mouseleave", function(e) {
        if (isClickOpened2) return; // Pokud je otevřeno kliknutím, neskrývat
        
        // Zkontrolujeme, kam kurzor směřuje
        const toElement = e.relatedTarget;
        
        // Zkontrolujme také prvky podmenu
        const subToggle2 = document.querySelector(".sub-dropdown-toggle-second");
        const subContent2 = document.querySelector(".sub-dropdown-content-second");
        const subDeadZone2 = document.querySelector(".sub-dropdown-dead-zone-second");
        
        // Pokud kurzor nejde do menu, tlačítka nebo prvků podmenu, zahájíme skrývání
        if ((toElement !== dropdownToggle2 && !dropdownToggle2.contains(toElement)) && 
            (toElement !== dropdownContent2 && !dropdownContent2.contains(toElement)) &&
            (toElement !== subToggle2 && (subToggle2 && !subToggle2.contains(toElement))) &&
            (toElement !== subContent2 && (subContent2 && !subContent2.contains(toElement))) &&
            (toElement !== subDeadZone2 && (subDeadZone2 && !subDeadZone2.contains(toElement)))) {
            
            hideTimeoutSecond = setTimeout(function() {
                if (!isClickOpened2) { // Dvojitá kontrola před skrytím
                    hideMenu2();
                }
            }, 300);
        }
    });
    
    // Zavření menu kliknutím kamkoliv mimo menu a tlačítko
    document.addEventListener("click", function(event) {
        // Kontrola prvků podmenu
        const subToggle2 = document.querySelector(".sub-dropdown-toggle-second");
        const subContent2 = document.querySelector(".sub-dropdown-content-second");
        const subDeadZone2 = document.querySelector(".sub-dropdown-dead-zone-second");
        
        if (!dropdownToggle2.contains(event.target) && 
            !dropdownContent2.contains(event.target) &&
            event.target !== deadZoneElement2 &&
            (!subToggle2 || !subToggle2.contains(event.target)) &&
            (!subContent2 || !subContent2.contains(event.target)) &&
            (!subDeadZone2 || !subDeadZone2.contains(event.target))) {
            
            hideMenu2();
            isClickOpened2 = false;
        }
    });
    
    // Export funkce pro submenu, která bude nastavovat stav submenu
    window.setSubmenuActive2 = function(active) {
        isSubmenuActive2 = active;
        if (active && isClickOpened2) {
            // Pokud je submenu aktivní a hlavní menu otevřeno kliknutím, 
            // resetujeme časovač nečinnosti
            startInactivityTimer2();
        }
    };
    
    // NOVÉ: Funkce pro kontrolu pozice myši při načtení stránky s ohledem na obrázky
    function handlePageLoad2() {
        // Počkáme, až budou obrázky načteny, než začneme s inicializací menu
        ensureImagesLoaded().then(() => {
            // Načtení uložené pozice myši
            const savedMouseX = parseInt(localStorage.getItem('mouseX')) || 0;
            const savedMouseY = parseInt(localStorage.getItem('mouseY')) || 0;
            
            // Nastavení globálních proměnných pro pozici myši
            mouseX = savedMouseX;
            mouseY = savedMouseY;
            
            // Zjistíme, zda byl kurzor nad dropdown tlačítkem před refreshem
            if (localStorage.getItem('isMouseOverSecondToggle') === 'true') {
                // Automaticky zobrazíme menu při hoveru
                showMenu2();
            }
            
            // Kontrola otevřeného menu z localStorage (pro kliknuté menu)
            if (localStorage.getItem('isSecondMenuOpen') === 'true') {
                isClickOpened2 = true;
                showMenu2();
            }
            
            // NOVÉ: Přepočítáme pozici mrtvé zóny po načtení obrázků
            if (dropdownContent2.style.display === "block") {
                startPositionMonitoring2();
            }
        });
    }
    
    // Spustíme kontrolu při načtení stránky
    handlePageLoad2();
}

// Zajištění sledování pozice myši pro oba dropdowny
// Tyto funkce by měly být definovány v globálním kontextu
// a sdíleny mezi oběma menu
if (typeof mouseX === 'undefined' && typeof mouseY === 'undefined') {
    let mouseX = 0;
    let mouseY = 0;

    // Sledování pozice myši
    document.addEventListener('mousemove', function(e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        // Uložíme pozici do localStorage pro obnovení po refreshi
        localStorage.setItem('mouseX', mouseX);
        localStorage.setItem('mouseY', mouseY);
    });
}

// NOVÉ: Funkce pro zajištění, že obrázky budou načteny nebo alespoň započato jejich načítání
// Tato funkce by měla být umístěna v globálním kontextu, aby byla dostupná pro obě menu
function ensureImagesLoaded() {
    return new Promise((resolve) => {
        // Zjistíme všechny obrázky na stránce
        const images = document.querySelectorAll('img');
        
        // Pokud nejsou žádné obrázky, okamžitě vrátíme true
        if (images.length === 0) {
            resolve(true);
            return;
        }
        
        // Počítadlo načtených obrázků
        let loadedImages = 0;
        
        // Funkce, která se zavolá po načtení obrázku
        function imageLoaded() {
            loadedImages++;
            
            // Pokud jsou všechny obrázky načteny nebo čas vypršel, vrátíme true
            if (loadedImages === images.length) {
                resolve(true);
            }
        }
        
        // Maximální doba čekání před pokračováním (3 sekundy)
        const maxWaitTime = 3000;
        
        // Po vypršení času pokračujeme bez ohledu na stav obrázků
        setTimeout(() => {
            resolve(true);
        }, maxWaitTime);
        
        // Pro každý obrázek přidáme posluchače událostí
        images.forEach(img => {
            // Pokud je již obrázek načten (z cache), přímo zvýšíme počítadlo
            if (img.complete) {
                imageLoaded();
            } else {
                // Jinak přidáme posluchače události pro načtení
                img.addEventListener('load', imageLoaded);
                // Také musíme zachytit chyby načítání
                img.addEventListener('error', imageLoaded);
            }
        });
    });
}
// ----- SUB-DROPDOWN MENU FUNCTIONALITY -----
const subDropdownToggle = document.querySelector(".sub-dropdown-toggle");
const subDropdownContent = document.querySelector(".sub-dropdown-content");

// Ověříme, zda prvky existují
if (subDropdownToggle && subDropdownContent) {
    let hideTimeoutSub;
    let animationTimeoutSub;
    let isClickOpenedSub = false;
    let isMouseOverMenu = false; // Proměnná pro sledování, jestli je myš nad menu
    
    // KOMPLETNÍ PŘEPRACOVÁNÍ ANIMACE:
    // 1. Nejdřív aplikujeme CSS přímo do elementu pro zajištění konzistence
    const originalDisplay = window.getComputedStyle(subDropdownContent).display;
    // Nastavíme transition na všechny vlastnosti pro zajištění plynulosti
    subDropdownContent.style.cssText = `
        transition: opacity 0.3s ease-in-out, visibility 0.3s ease-in-out;
        opacity: 0;
        visibility: hidden;
        display: none;
    `;
    
    // Vytvoříme element pro mrtvou zónu mezi tlačítkem a menu
    const deadZoneElementSub = document.createElement("div");
    deadZoneElementSub.className = "sub-dropdown-dead-zone";
    
    // Vložíme element do DOM a nastavíme mu potřebné styly
    document.body.appendChild(deadZoneElementSub);
    deadZoneElementSub.style.position = "absolute";
    deadZoneElementSub.style.display = "none";
    deadZoneElementSub.style.zIndex = "999"; // Vysoký z-index
    
    // Příznak pro koordinaci animace zavření
    let isClosingInProgressSub = false;
    
    // Funkce pro nastavení pozice a rozměrů mrtvé zóny
    function positionDeadZoneSub() {
        if (subDropdownContent.style.display !== "none") {
            const toggleRect = subDropdownToggle.getBoundingClientRect();
            const contentRect = subDropdownContent.getBoundingClientRect();
            
            // Zjistíme orientaci menu vůči oknu
            const viewportWidth = window.innerWidth;
            const isMenuRightAligned = (toggleRect.right + contentRect.width > viewportWidth);
            
            // Podle orientace menu nastavíme mrtvou zónu
            if (isMenuRightAligned) {
                // Menu je zarovnáno doprava od tlačítka
                deadZoneElementSub.style.left = (contentRect.right - Math.max(contentRect.width, toggleRect.width)) + window.scrollX + "px";
                deadZoneElementSub.style.top = toggleRect.bottom + window.scrollY + "px";
                deadZoneElementSub.style.width = Math.max(contentRect.width, toggleRect.width) + "px";
                deadZoneElementSub.style.height = (contentRect.top - toggleRect.bottom) + "px";
            } else {
                // Menu je zarovnáno doleva nebo pod tlačítkem
                deadZoneElementSub.style.left = Math.min(toggleRect.left, contentRect.left) + window.scrollX + "px";
                deadZoneElementSub.style.top = toggleRect.bottom + window.scrollY + "px";
                deadZoneElementSub.style.width = Math.max(contentRect.width, toggleRect.width) + "px";
                deadZoneElementSub.style.height = (contentRect.top - toggleRect.bottom) + "px";
            }
            
            deadZoneElementSub.style.display = "block";
        } else {
            deadZoneElementSub.style.display = "none";
        }
    }
    
    // ZCELA PŘEPRACOVANÁ FUNKCE PRO ZOBRAZENÍ
    function showMenuSub() {
        // Zrušíme všechny předchozí timeouty
        clearTimeout(hideTimeoutSub);
        clearTimeout(animationTimeoutSub);
        
        // Resetujeme příznak zavírání
        isClosingInProgressSub = false;
        
        // DŮLEŽITÉ: Sekvence zobrazení
        // 1. Nejprve nastavíme display na block, ale stále s opacity 0
        subDropdownContent.style.display = originalDisplay || "block";
        
        // 2. Krátké zpoždění pro aplikaci display
        setTimeout(() => {
            // 3. Následně spustíme animaci nastavením opacity
            subDropdownContent.style.opacity = "1";
            subDropdownContent.style.visibility = "visible";
            
            // 4. Nastavíme pozici mrtvé zóny
            positionDeadZoneSub();
        }, 10);
        
        // Informujeme hlavní menu o aktivaci submenu
        if (window.setSubmenuActive) {
            window.setSubmenuActive(true);
        }
        
        // Pokud je menu otevřeno kliknutím, uložíme stav do localStorage
        if (isClickOpenedSub) {
            localStorage.setItem('isSubMenuOpen', 'true');
        }
    }
    
    // ZCELA PŘEPRACOVANÁ FUNKCE PRO PLYNULÉ ZAVŘENÍ 
    function smoothCloseSubMenu(skipDelay = false) {
        // Pokud je menu již zavřené, neděláme nic
        if (subDropdownContent.style.display === "none") return;
        
        // Zrušíme případné předchozí timeouty pro zavírání
        clearTimeout(hideTimeoutSub);
        clearTimeout(animationTimeoutSub);
        
        // Nastavíme příznak, že probíhá zavírání
        isClosingInProgressSub = true;
        
        // KRITICKÉ: Explicitně zajistíme, že menu je viditelné během animace
        // Tím se zajistí, že bude vidět animace opacity
        if (subDropdownContent.style.display === "none") {
            subDropdownContent.style.display = originalDisplay || "block";
            // Dáme prohlížeči čas aplikovat display
            requestAnimationFrame(() => {
                // Pak teprve spustíme animaci opacity
                subDropdownContent.style.opacity = "0";
                subDropdownContent.style.visibility = "hidden";
            });
        } else {
            // Menu je již zobrazené, spustíme animaci opacity
            subDropdownContent.style.opacity = "0";
            subDropdownContent.style.visibility = "hidden";
        }
        
        // Zásadní krok: Počkáme na dokončení animace
        const animationDuration = 400; // Musí odpovídat transition time v CSS
        const delay = skipDelay ? Math.floor(animationDuration / 2) : animationDuration + 50; // Přidáme malou rezervu
        
        animationTimeoutSub = setTimeout(() => {
            // Zkontrolujeme, zda mezitím uživatel nenavedl myš zpět na menu
            if (!isMouseOverMenu) {
                // Dokončíme skrytí až po dokončení animace fade-out
                subDropdownContent.style.display = "none";
                deadZoneElementSub.style.display = "none";
                
                // Pokud bylo menu otevřeno kliknutím, resetujeme příznak
                if (isClickOpenedSub) {
                    isClickOpenedSub = false;
                    localStorage.removeItem('isSubMenuOpen');
                }
                
                // Informujeme hlavní menu
                if (window.setSubmenuActive) {
                    window.setSubmenuActive(false);
                }
            } else {
                // Uživatel navedl myš zpět na menu během animace - zrušíme zavírání
                showMenuSub();
            }
            
            isClosingInProgressSub = false;
        }, delay);
    }
    
    // Funkce pro skrytí menu - koordinovaná s hlavním menu - vždy používá plynulé zavření
    function hideMenuSub() {
        // Kontrola, zda je myš stále nad menu - pokud ano, nezavírat
        if (isMouseOverMenu) return;
        
        smoothCloseSubMenu();
    }
    
    // Zpracování žádosti o společné zavření z hlavního menu
    window.closeSubMenuWithParent = function() {
        // Pouze nastavíme příznaky a zavřeme s plynulou animací
        isClickOpenedSub = false;
        smoothCloseSubMenu();
    };
    
    // Monitorování hlavního menu pro koordinaci chování
    const mainDropdownToggle = document.querySelector(".dropdown-toggle");
    if (mainDropdownToggle) {
        mainDropdownToggle.addEventListener("mouseenter", function() {
            // Při najetí na hlavní menu zavřeme submenu plynule
            if (!isMouseOverMenu) {
                smoothCloseSubMenu();
            }
        });
    }
    
    // Monitorování hlavního dropdown obsahu
    const mainDropdownContent = document.querySelector(".dropdown-content");
    if (mainDropdownContent) {
        // Zajistíme, že při najetí na hlavní dropdown obsah se submenu také zavře,
        // pokud nejsme přímo nad toggle tlačítkem submenu
        mainDropdownContent.addEventListener("mouseenter", function(e) {
            // Zkontrolujeme, že jsme opravdu v hlavním dropdown, ale ne nad submenu toggle
            if (e.target === mainDropdownContent && !subDropdownToggle.contains(e.target)) {
                smoothCloseSubMenu();
            }
        });
        
        // Přidáme event listener pro pohyb myši v hlavním dropdown menu
        mainDropdownContent.addEventListener("mousemove", function(e) {
            // Získáme aktuální element pod myší
            const elementUnderMouse = document.elementFromPoint(e.clientX, e.clientY);
            
            // Pokud je myš v hlavním menu, ale není nad toggle tlačítkem submenu ani nad submenu obsahem
            if (mainDropdownContent.contains(elementUnderMouse) && 
                !subDropdownToggle.contains(elementUnderMouse) && 
                !subDropdownContent.contains(elementUnderMouse) &&
                !deadZoneElementSub.contains(elementUnderMouse)) {
                
                // Nastavíme příznak, že myš není nad submenu
                isMouseOverMenu = false;
                
                // Zavřeme submenu plynule, pokud je otevřené (pouze pokud nebylo otevřeno kliknutím)
                if (subDropdownContent.style.opacity === "1" && !isClickOpenedSub) {
                    smoothCloseSubMenu();
                }
            }
        });
    }
    
    // Zobrazení sub-menu při najetí kurzoru na tlačítko
    subDropdownToggle.addEventListener("mouseenter", function() {
        isMouseOverMenu = true;
        
        // Důležitá změna: Kontrolujeme, zda probíhá zavírání
        if (isClosingInProgressSub) {
            // Pokud probíhá animace zavírání, přerušíme ji a znovu zobrazíme menu
            showMenuSub();
        } else if (!isClickOpenedSub) {
            showMenuSub();
        }
    });
    
    // Nastaví příznak, že myš opustila tlačítko
    subDropdownToggle.addEventListener("mouseleave", function() {
        isMouseOverMenu = false;
    });
    
    // Přidáme event listener pro kliknutí na tlačítko - OPTIMALIZOVÁNO PRO SPOLEHLIVOST
    subDropdownToggle.addEventListener("click", function(e) {
        // Vždy zastavíme výchozí chování a propagaci
        e.preventDefault();
        e.stopPropagation();
        
        // Zrušíme všechny běžící timeouty pro zamezení konfliktů
        clearTimeout(hideTimeoutSub);
        clearTimeout(animationTimeoutSub);
        
        // Aktualizujeme stav menu podle aktuálního viditelného stavu
        const isCurrentlyVisible = subDropdownContent.style.opacity === "1";
        
        if (isCurrentlyVisible && isClickOpenedSub) {
            // Pokud je menu již otevřené kliknutím, zavřeme ho
            isMouseOverMenu = false;
            isClickOpenedSub = false;
            localStorage.removeItem('isSubMenuOpen');
            smoothCloseSubMenu(true); // Používáme true pro rychlejší reakci
        } else {
            // Vždy zajistíme, že menu bude otevřené po kliknutí
            isClickOpenedSub = true;
            isMouseOverMenu = true;
            isClosingInProgressSub = false; // Zrušíme případné probíhající zavírání
            
            // Explicitně nastavíme stav jako otevřený
            localStorage.setItem('isSubMenuOpen', 'true');
            
            // Aktivně zobrazíme menu
            showMenuSub();
        }
        
        // Explicitně zaznamenáme, že došlo ke kliknutí na toggle
        console.log("Toggle clicked, menu is now: " + (!isCurrentlyVisible || !isClickOpenedSub ? "open" : "closed"));
    });
    
    // Přidáme speciální třídu pro šipku v dropdown menu, pokud existuje
    const arrowElement = subDropdownToggle.querySelector(".arrow, .dropdown-arrow, .caret, .arrow-icon, i.fa-chevron-down");
    if (arrowElement) {
        // Zajistíme, že kliknutí na šipku bude spolehlivě fungovat
        arrowElement.addEventListener("click", function(e) {
            e.preventDefault(); 
            e.stopPropagation(); // Zastavíme propagaci, aby nedošlo k dvojímu zpracování
            
            // Simulujeme kliknutí přímo na toggle element pro jednotné chování
            const clickEvent = new MouseEvent('click', {
                bubbles: true,
                cancelable: true,
                view: window
            });
            
            // Zašleme událost kliknutí přímo na toggle element
            subDropdownToggle.dispatchEvent(clickEvent);
        });
    }
    
    // Udržování sub-menu otevřeného při najetí na samotné menu
    subDropdownContent.addEventListener("mouseenter", function() {
        isMouseOverMenu = true;
        
        // DŮLEŽITÁ ZMĚNA: Pokud probíhá animace zavírání, zrušíme ji a znovu zobrazíme menu
        if (isClosingInProgressSub) {
            showMenuSub();
        }
        
        // Informujeme hlavní menu o aktivaci submenu
        if (window.setSubmenuActive) {
            window.setSubmenuActive(true);
        }
    });
    
    // Skrytí menu při opuštění menu kurzorem
    subDropdownContent.addEventListener("mouseleave", function() {
        isMouseOverMenu = false;
        
        // Pokud menu není otevřeno kliknutím, zavřeme ho
        if (!isClickOpenedSub) {
            hideTimeoutSub = setTimeout(() => {
                smoothCloseSubMenu();
            }, 300);
        }
    });
    
    // Mrtvá zóna pomáhá udržet menu otevřené
    deadZoneElementSub.addEventListener("mouseenter", function() {
        isMouseOverMenu = true;
        clearTimeout(hideTimeoutSub);
        
        // Pokud probíhá animace zavírání, zrušíme ji a obnovíme menu
        if (isClosingInProgressSub) {
            showMenuSub();
        }
    });
    
    deadZoneElementSub.addEventListener("mouseleave", function() {
        isMouseOverMenu = false;
        
        // Pokud menu není otevřeno kliknutím, zavřeme ho
        if (!isClickOpenedSub) {
            hideTimeoutSub = setTimeout(() => {
                smoothCloseSubMenu();
            }, 100);
        }
    });
    
    // Zavření menu při kliknutí kamkoliv mimo menu - VYLEPŠENO
    document.addEventListener("click", function(e) {
        // Důkladná kontrola, že kliknutí není na menu nebo toggle tlačítko nebo jejich potomky
        if (!subDropdownContent.contains(e.target) && 
            !subDropdownToggle.contains(e.target) &&
            !deadZoneElementSub.contains(e.target)) {
            
            isMouseOverMenu = false;
            
            // Zavřeme menu, pokud bylo otevřeno kliknutím
            if (isClickOpenedSub) {
                isClickOpenedSub = false;
                localStorage.removeItem('isSubMenuOpen');
                smoothCloseSubMenu();
            }
        }
    });
    
    // Obsluha změny velikosti okna pro správné pozicování
    window.addEventListener("resize", positionDeadZoneSub);
    
    // Kontrola, zda bylo menu otevřeno před obnovením stránky
    if (localStorage.getItem('isSubMenuOpen') === 'true') {
        isClickOpenedSub = true;
        showMenuSub();
    }
    
    // Přidáme speciální indikátor pro rozlišení kliknutí vs hover
    subDropdownToggle.classList.add("has-click-listener");
    
    // Přidáme třídu pro animaci
    subDropdownContent.classList.add("fade-dropdown");
    
    // Zkontrolujeme zda menu má nastavenou transition v CSS - pokud ne, přidáme inline
    const computedStyle = window.getComputedStyle(subDropdownContent);
    if (!computedStyle.transition || computedStyle.transition === "all 0s ease 0s") {
        // Přidáme tranzici přímo do elementu pro zajištění animace
        subDropdownContent.style.transition = "opacity 0.3s ease-in-out, visibility 0.3s ease-in-out";
    }
}
    // Zbytek kódu zůstává beze změny
    // ----- FAQ FUNCTIONALITY -----
    const faqItems = document.querySelectorAll(".faq");
    if (faqItems.length > 0) {
        faqItems.forEach(faq => {
            faq.addEventListener("click", () => {
                faq.classList.toggle("active");
            });
        });
    }
    
    // ----- FAQ CONTAINER TOGGLE -----
    const toggleQuestionsBtn = document.getElementById('toggle-questions-btn');
    const faqContainer = document.getElementById('faq-container');
    
    if (toggleQuestionsBtn && faqContainer) {
        toggleQuestionsBtn.addEventListener('click', () => {
            faqContainer.classList.toggle('hidden');
            
            if (faqContainer.classList.contains('hidden')) {
                toggleQuestionsBtn.textContent = 'Zobrazit otázky';
                
                // Skrytí všech odpovědí při zavření
                document.querySelectorAll('.answer').forEach(answer => {
                    answer.style.display = 'none';
                });
                
                // Odebrání stmavení všech otázek
                document.querySelectorAll('.question').forEach(question => {
                    question.classList.remove('open');
                });
            } else {
                toggleQuestionsBtn.textContent = 'Skrýt otázky';
            }
        });
        
        // Přidání funkce pro rozkliknutí jednotlivých otázek + stmavení
        document.querySelectorAll('.question').forEach(question => {
            question.addEventListener('click', () => {
                const answer = question.nextElementSibling;
                const isOpen = answer.style.display === 'block';
                
                if (isOpen) {
                    answer.style.display = 'none';
                    question.classList.remove('open');
                } else {
                    answer.style.display = 'block';
                    question.classList.add('open');
                }
            });
        });
    }
    
    // ----- ACTIVE MENU ITEM FUNCTIONALITY -----
    // Získáme všechny hlavní tlačítka a odkazy v podmenu
    const mainButtons = document.querySelectorAll('.main-button, .maine-button');
    const dropdownLinks = document.querySelectorAll('.dropdown-content a, .dropdown-content-second a, .sub-dropdown-content a');
    
    // Nastavení aktivního tlačítka při kliknutí
    function setActiveButton(clickedButton) {
        // Odstranění active z podmenu
        dropdownLinks.forEach(link => link.classList.remove('active'));
        
        // Přidání active pouze na kliknutý odkaz v podmenu
        if (clickedButton.closest('.dropdown-content') || 
            clickedButton.closest('.dropdown-content-second') || 
            clickedButton.closest('.sub-dropdown-content')) {
            clickedButton.classList.add('active');
            
            // Najdeme hlavní tlačítko a zajistíme správné zvýraznění
            mainButtons.forEach(button => button.classList.remove('active'));
            
            // ZMĚNA: Nebudeme zvýrazňovat nadřazené tlačítko při kliknutí na položku podmenu
        } else {
            // Pokud klikneme na hlavní tlačítko, resetujeme podmenu a zvýrazníme jen hlavní tlačítko
            mainButtons.forEach(button => button.classList.remove('active'));
            clickedButton.classList.add('active');
        }
    }
    
    // Přidání event listeneru na všechna tlačítka a odkazy
    [...mainButtons, ...dropdownLinks].forEach(element => {
        element.addEventListener('click', function() {
            setActiveButton(element);
        });
    });
    
    // Nastavení aktivního tlačítka podle URL po načtení stránky
    const menuLinks = document.querySelectorAll('.main-button, .maine-button, .dropdown-content a, .dropdown-content-second a, .sub-dropdown-content a');
    menuLinks.forEach(link => {
        if (link.href === window.location.href) {
            link.classList.add('active');
            // ZMĚNA: Nebudeme zvýrazňovat nadřazené tlačítko, pokud jsme na stránce z podmenu
        }
    });
    
    // Speciální případ pro tools.html
    const introLink = document.querySelector('.dropdown-content a[href="tools.html"]');
    if (introLink && window.location.pathname.includes('tools.html')) {
        introLink.classList.add('active');
        // ZMĚNA: Odstraněna aktivace nadřazeného tlačítka
    }
});










//document.addEventListener('DOMContentLoaded', function() {
  //  setupStickyNav();
    

   // navHeight = header.offsetHeight;
    
 
   // window.addEventListener('scroll', handleScroll);
    
    
    //handleScroll();
//});


//window.addEventListener('resize', function() {
 //   navHeight = header.offsetHeight;
//});

