document.addEventListener("DOMContentLoaded", function() {
    // Globální sledování pozice myši pro všechna menu
    let mouseX = 0;
    let mouseY = 0;
    document.addEventListener("mousemove", function(e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
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
    const inactivityDelay = 2000; // Změněno z 20000 na 2000 (2 sekundy neaktivity)
    let isClickOpened = false; // Flag pro zjištění, zda bylo menu otevřeno kliknutím
    let isSubmenuActive = false; // Flag pro zjištění, zda je aktivní submenu
    
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
    
    // Globální sledování pohybu myši
    let mouseX = 0, mouseY = 0;
    document.addEventListener('mousemove', function(e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });
    
    // Funkce pro nastavení pozice a rozměrů mrtvé zóny
    function positionDeadZone() {
        if (dropdownContent.style.display === "block") {
            const toggleRect = dropdownToggle.getBoundingClientRect();
            const contentRect = dropdownContent.getBoundingClientRect();
            
            deadZoneElement.style.left = Math.min(toggleRect.left, contentRect.left) + window.scrollX + "px";
            deadZoneElement.style.top = toggleRect.bottom + window.scrollY + "px";
            deadZoneElement.style.width = Math.max(contentRect.width, toggleRect.width) + "px";
            deadZoneElement.style.height = (contentRect.top - toggleRect.bottom) + "px";
            deadZoneElement.style.display = "block";
        } else {
            deadZoneElement.style.display = "none";
        }
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
            // Nastavíme pozici mrtvé zóny
            positionDeadZone();
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
    
    // Příznak pro koordinaci animace zavření
    let isClosingInProgress = false;
    
    // Funkce pro skrytí menu - UPRAVENO PRO SPOLEHLIVOST
    function hideMenu() {
        // Zrušíme všechny předchozí timeouty
        clearTimeout(hideTimeoutFirst);
        clearTimeout(animationTimeoutFirst);
        clearTimeout(inactivityTimeoutFirst);
        
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
    
    // Zobrazení podmenu při najetí kurzoru na tlačítko (pouze pokud není otevřeno kliknutím) - UPRAVENO
    dropdownToggle.addEventListener("mouseenter", function() {
        // NOVÉ: Zavření druhého menu pokud je otevřené
        if (window.closeSecondMenu) {
            window.closeSecondMenu();
        }
        
        // Odstraněno podmínkové ověření pro isClosingInProgress, aby se menu vždy zobrazilo
        if (!isClickOpened) {
            showMenu();
        }
        
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
                positionDeadZone();
                
                // Uložení stavu do localStorage
                localStorage.setItem('isFirstMenuOpen', 'true');
                
                // Spustíme časovač nečinnosti
                startInactivityTimer();
            });
        }
    });
    
    // Export funkce pro submenu
    window.closeSubMenuWithParent = function() {
        // Tato funkce je volána z hideMenu
        isSubmenuActive = false;
    };
    
    // Exportujeme funkci pro zavření prvního menu z jiných menu
    window.closeFirstMenu = function() {
        if (isClickOpened) {
            hideMenu();
            isClickOpened = false;
        }
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
    
    // Skrytí podmenu při opuštění kurzoru tlačítka - pouze pokud není otevřeno kliknutím
    dropdownToggle.addEventListener("mouseleave", function(e) {
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
            }, 200);
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
            }, 200);
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
            }, 200);
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

    // Při načtení stránky zkontrolujeme localStorage a případně otevřeme menu
    document.addEventListener("DOMContentLoaded", function() {
        if (localStorage.getItem('isFirstMenuOpen') === 'true') {
            isClickOpened = true;
            showMenu();
        }
    });
}
    // ----- SECOND DROPDOWN MENU FUNCTIONALITY -----
const dropdownToggle2 = document.querySelector(".dropdown-toggle-second");
const dropdownContent2 = document.querySelector(".dropdown-content-second");

// Ověříme, zda prvky existují
if (dropdownToggle2 && dropdownContent2) {
    let hideTimeoutSecond;
    let animationTimeoutSecond;
    let inactivityTimeoutSecond;
    const inactivityDelay = 2000; // Změněno z 20000 na 5000 (5 sekund neaktivity)
    let isClickOpened2 = false;
    
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
    
    // Funkce pro nastavení pozice a rozměrů mrtvé zóny
    function positionDeadZone2() {
        if (dropdownContent2.style.display === "block") {
            const toggleRect = dropdownToggle2.getBoundingClientRect();
            const contentRect = dropdownContent2.getBoundingClientRect();
            
            deadZoneElement2.style.left = Math.min(toggleRect.left, contentRect.left) + window.scrollX + "px";
            deadZoneElement2.style.top = toggleRect.bottom + window.scrollY + "px";
            deadZoneElement2.style.width = Math.max(contentRect.width, toggleRect.width) + "px";
            deadZoneElement2.style.height = (contentRect.top - toggleRect.bottom) + "px";
            deadZoneElement2.style.display = "block";
        } else {
            deadZoneElement2.style.display = "none";
        }
    }
    
    // Funkce pro spuštění časovače nečinnosti
    function startInactivityTimer2() {
        console.log("Spuštěn časovač neaktivity pro druhé menu");
        clearTimeout(inactivityTimeoutSecond);
        inactivityTimeoutSecond = setTimeout(() => {
            console.log("Vypršel časovač neaktivity - kontroluji pozici myši");
            
            // Kontrola pozice kurzoru před zavřením
            const menuRect = dropdownContent2.getBoundingClientRect();
            const toggleRect = dropdownToggle2.getBoundingClientRect();
            
            // Kontrola, zda kurzor není nad menu nebo nad tlačítkem
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
            
            // Zavřít menu pouze pokud kurzor není nad menu ani nad tlačítkem
            if (!isMouseOverMenu && !isMouseOverToggle) {
                console.log("Vypršel časovač neaktivity - zavírám druhé menu");
                hideMenu2();
                isClickOpened2 = false;
            } else {
                // Pokud je kurzor nad menu nebo tlačítkem, prodloužit časovač
                startInactivityTimer2();
            }
        }, inactivityDelay);
    }
    
    // Funkce pro zobrazení menu
    function showMenu2() {
        // Zrušíme všechny předchozí timeouty
        clearTimeout(hideTimeoutSecond);
        clearTimeout(animationTimeoutSecond);
        clearTimeout(inactivityTimeoutSecond);
        
        // Nejprve zobrazíme element (ale ještě je neviditelný)
        dropdownContent2.style.display = "block";
        
        // Malé zpoždění před animací pro lepší plynulost
        setTimeout(() => {
            dropdownContent2.style.opacity = "1";
            dropdownContent2.style.visibility = "visible";
            // Nastavíme pozici mrtvé zóny
            positionDeadZone2();
        }, 10);
        
        // Pokud je menu otevřeno kliknutím, nastavíme timeout pro zavření po neaktivitě
        if (isClickOpened2) {
            startInactivityTimer2();
            // Uložení stavu do localStorage
            localStorage.setItem('isSecondMenuOpen', 'true');
        }
    }
    
    // Funkce pro skrytí menu
    function hideMenu2() {
        // Nejprve spustíme animaci průhlednosti
        dropdownContent2.style.opacity = "0";
        dropdownContent2.style.visibility = "hidden";
        
        // Po dokončení animace skryjeme prvek úplně
        animationTimeoutSecond = setTimeout(() => {
            dropdownContent2.style.display = "none";
            deadZoneElement2.style.display = "none";
            isClickOpened2 = false;
            // Odstranění stavu z localStorage
            localStorage.removeItem('isSecondMenuOpen');
        }, 300);
        
        // Zrušíme časovač nečinnosti
        clearTimeout(inactivityTimeoutSecond);
    }
    
    // Exportujeme funkci pro zavření druhého menu z jiných menu
    window.closeSecondMenu = function() {
        if (isClickOpened2) {
            hideMenu2();
            isClickOpened2 = false;
        }
    };
    
    // Zobrazení druhého podmenu při najetí kurzoru na tlačítko
    dropdownToggle2.addEventListener("mouseenter", function() {
        // NOVÉ: Zavřít první menu, pokud je otevřené
        if (window.closeFirstMenu) {
            window.closeFirstMenu();
        }
        
        if (!isClickOpened2) {
            showMenu2();
        }
    });
    
    // Přidáme event listener pro kliknutí na tlačítko
    dropdownToggle2.addEventListener("click", function(e) {
        e.preventDefault(); // Zabrání výchozí akci odkazu, pokud je tlačítko <a>
        e.stopPropagation(); // Zabrání šíření události ke globálnímu document click handleru
        
        if (dropdownContent2.style.opacity === "1" && isClickOpened2) {
            // Pokud je menu již otevřené kliknutím, zavřeme ho
            hideMenu2();
            isClickOpened2 = false;
        } else {
            // Zavřít všechna ostatní menu
            closeAllMenusExcept('second-menu');
            
            // Jinak ho otevřeme a nastavíme flag
            isClickOpened2 = true;
            showMenu2();
            // Spustíme časovač nečinnosti
            startInactivityTimer2();
        }
    });
    
    // Udržování druhého podmenu otevřeného při najetí na samotné podmenu
    dropdownContent2.addEventListener("mouseenter", function() {
        if (!isClickOpened2) {
            // Zrušíme všechny předchozí timeouty
            clearTimeout(hideTimeoutSecond);
            clearTimeout(animationTimeoutSecond);
            
            // Zajistíme, že menu zůstane viditelné
            dropdownContent2.style.display = "block";
            dropdownContent2.style.opacity = "1";
            dropdownContent2.style.visibility = "visible";
        } else {
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
    
    // NOVÉ: Přidáme posluchače pro vyhledávací pole a jiné prvky v menu
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
    
    // NOVÉ: Přidáme posluchače pro odkazy v menu
    const menuLinks2 = dropdownContent2.querySelectorAll('a');
    menuLinks2.forEach(link => {
        // Vyčistíme localStorage před navigací
        link.addEventListener('click', function() {
            // Vyčistíme všechny stavy menu z localStorage
            localStorage.removeItem('isFirstMenuOpen');
            localStorage.removeItem('isSecondMenuOpen');
            localStorage.removeItem('isSubMenuOpen');
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
            dropdownContent2.style.opacity = "1";
            dropdownContent2.style.visibility = "visible";
        } else {
            // Pokud je otevřeno kliknutím, resetujeme časovač nečinnosti
            startInactivityTimer2();
        }
    });
    
    // Skrytí druhého podmenu při opuštění kurzoru tlačítka - pouze pokud není otevřeno kliknutím
    dropdownToggle2.addEventListener("mouseleave", function(e) {
        if (isClickOpened2) return; // Pokud je otevřeno kliknutím, neskrývat
        
        // Zkontrolujeme, kam kurzor směřuje
        const toElement = e.relatedTarget;
        
        // Pokud kurzor nejde do mrtvé zóny nebo do podmenu, zahájíme skrývání
        if (toElement !== deadZoneElement2 && !deadZoneElement2.contains(toElement) && 
            toElement !== dropdownContent2 && !dropdownContent2.contains(toElement)) {
            
            hideTimeoutSecond = setTimeout(function() {
                hideMenu2();
            }, 200);
        }
    });
    
    // Skrytí druhého podmenu při opuštění kurzoru podmenu - pouze pokud není otevřeno kliknutím
    dropdownContent2.addEventListener("mouseleave", function(e) {
        if (isClickOpened2) return; // Pokud je otevřeno kliknutím, neskrývat
        
        // Zkontrolujeme, kam kurzor směřuje
        const toElement = e.relatedTarget;
        
        // Pokud kurzor nejde do mrtvé zóny nebo do tlačítka, zahájíme skrývání
        if (toElement !== deadZoneElement2 && !deadZoneElement2.contains(toElement) && 
            toElement !== dropdownToggle2 && !dropdownToggle2.contains(toElement)) {
            
            hideTimeoutSecond = setTimeout(function() {
                hideMenu2();
            }, 200);
        }
    });
    
    // Skrytí podmenu při opuštění mrtvé zóny - pouze pokud není otevřeno kliknutím
    deadZoneElement2.addEventListener("mouseleave", function(e) {
        if (isClickOpened2) return; // Pokud je otevřeno kliknutím, neskrývat
        
        // Zkontrolujeme, kam kurzor směřuje
        const toElement = e.relatedTarget;
        
        // Pokud kurzor nejde do menu nebo tlačítka, zahájíme skrývání
        if (toElement !== dropdownToggle2 && !dropdownToggle2.contains(toElement) && 
            toElement !== dropdownContent2 && !dropdownContent2.contains(toElement)) {
            
            hideTimeoutSecond = setTimeout(function() {
                hideMenu2();
            }, 200);
        }
    });
    
    // Zavření menu kliknutím kamkoliv mimo menu a tlačítko
    document.addEventListener("click", function(event) {
        if (!dropdownToggle2.contains(event.target) && 
            !dropdownContent2.contains(event.target) &&
            event.target !== deadZoneElement2) {
            
            hideMenu2();
            isClickOpened2 = false;
        }
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
    
    // Předpřiprava stylu pro plynulou animaci
    subDropdownContent.style.transition = "opacity 0.3s ease-in-out, visibility 0.3s ease-in-out";
    subDropdownContent.style.opacity = "0";
    subDropdownContent.style.visibility = "hidden";
    subDropdownContent.style.display = "none";
    
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
        if (subDropdownContent.style.display === "block") {
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
    
    // Funkce pro zobrazení menu
    function showMenuSub() {
        // Zrušíme všechny předchozí timeouty
        clearTimeout(hideTimeoutSub);
        clearTimeout(animationTimeoutSub);
        
        // Resetujeme příznak zavírání
        isClosingInProgressSub = false;
        
        // Nejprve zobrazíme element (ale ještě je neviditelný)
        subDropdownContent.style.display = "block";
        
        // Malé zpoždění před animací pro lepší plynulost
        setTimeout(() => {
            subDropdownContent.style.opacity = "1";
            subDropdownContent.style.visibility = "visible";
            // Nastavíme pozici mrtvé zóny
            positionDeadZoneSub();
        }, 10);
        
        // DŮLEŽITÁ ZMĚNA: Informujeme hlavní menu o aktivaci submenu
        if (window.setSubmenuActive) {
            window.setSubmenuActive(true);
        }
        
        // Pokud je menu otevřeno kliknutím, uložíme stav do localStorage
        if (isClickOpenedSub) {
            localStorage.setItem('isSubMenuOpen', 'true');
        }
    }
    
    // Funkce pro plynulé zavření submenu
    function smoothCloseSubMenu(skipDelay = false) {
        // Pokud je menu již zavřené nebo se zavírá, neděláme nic
        if (subDropdownContent.style.opacity === "0") return;
        
        // Nastavíme příznak, že probíhá zavírání
        isClosingInProgressSub = true;
        
        // Změníme styl pro spuštění animace
        subDropdownContent.style.opacity = "0";
        subDropdownContent.style.visibility = "hidden";
        
        // Počkáme na dokončení animace a potom skryjeme menu
        const delay = skipDelay ? 10 : 300; // Při skipDelay použijeme jen krátké zpoždění
        animationTimeoutSub = setTimeout(() => {
            // Zkontrolujeme, zda mezitím uživatel nenavedl myš zpět na menu
            if (!isMouseOverMenu) {
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
    
    // Funkce pro skrytí menu - koordinovaná s hlavním menu
    function hideMenuSub() {
        // Kontrola, zda je myš stále nad menu - pokud ano, nezavírat
        if (isMouseOverMenu) return;
        
        // Nastavíme příznak, že probíhá zavírání
        isClosingInProgressSub = true;
        
        // Používáme hlavní funkci pro zavření, která zavře obě menu současně
        const dropdownContent = document.querySelector(".dropdown-content");
        if (dropdownContent && dropdownContent.style.opacity === "1") {
            // Pokud je viditelné hlavní menu, použijeme jeho funkci pro zavření
            
            // Je důležité, aby zavření probíhalo přes hlavní menu
            const dropdownToggle = document.querySelector(".dropdown-toggle");
            if (dropdownToggle) {
                // Simulujeme kliknutí na hlavní menu pro zavření
                const clickEvent = new MouseEvent('click', {
                    bubbles: true,
                    cancelable: true,
                    view: window
                });
                dropdownToggle.dispatchEvent(clickEvent);
            } else {
                // Záložní metoda pro zavření - použijeme plynulé zavření
                smoothCloseSubMenu();
            }
        } else {
            // Pokud hlavní menu není viditelné, zavřeme jen submenu
            smoothCloseSubMenu();
        }
    }
    
    // Zpracování žádosti o společné zavření z hlavního menu
    window.closeSubMenuWithParent = function() {
        // Pouze nastavíme příznaky - zavření submenu bude řízeno stejnými pravidly
        // jako u běžného submenu, tedy včetně přerušení mizení při najetí myší
        isClickOpenedSub = false;
        
        // Zavíráme s animací
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
    
    // Přidáme event listener pro kliknutí na tlačítko
    subDropdownToggle.addEventListener("click", function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        if (subDropdownContent.style.opacity === "1" && isClickOpenedSub) {
            // Pokud je menu již otevřené kliknutím, zavřeme ho
            isMouseOverMenu = false;
            hideMenuSub();
            isClickOpenedSub = false;
        } else {
            // Zobrazíme toto sub-menu
            isClickOpenedSub = true;
            isMouseOverMenu = true;
            showMenuSub();
        }
    });
    
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
                hideMenuSub();
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
                hideMenuSub();
            }, 100);
        }
    });
    
    // Zavření menu při kliknutí kamkoliv mimo menu
    document.addEventListener("click", function(e) {
        // Kontrola, zda kliknutí není na menu nebo toggle tlačítko
        if (!subDropdownContent.contains(e.target) && e.target !== subDropdownToggle) {
            isMouseOverMenu = false;
            
            // Pouze pokud bylo otevřeno kliknutím
            if (isClickOpenedSub) {
                hideMenuSub();
                isClickOpenedSub = false;
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


document.addEventListener('DOMContentLoaded', function() {
    // Create a clone of the header for the sticky version
    const originalHeader = document.querySelector('body > header');
    const stickyHeader = originalHeader.cloneNode(true);
    stickyHeader.classList.add('sticky-header');
    
    // Insert the sticky header right after the body opening tag
    document.body.insertBefore(stickyHeader, document.body.firstChild);
    
    // Získáme vertikální pozici menu v původním headeru
    const menuElement = originalHeader.querySelector('nav') || originalHeader.querySelector('.menu') || originalHeader;
    const menuPosition = menuElement.getBoundingClientRect().top + window.pageYOffset;
    
    // Initialize dropdown functionality for both headers
    initializeDropdowns(originalHeader);
    initializeDropdowns(stickyHeader);
    
    let lastScrollTop = 0;
    const scrollThreshold = 100; // How far user needs to scroll before header behavior kicks in
    
    // CSS pro plynulé vyjetí z vrchu a okamžité zmizení
    const style = document.createElement('style');
    style.innerHTML = `
      .sticky-header {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        z-index: 1000;
        transform: translateY(-100%);
        transition: transform 0.3s ease-out;
        visibility: hidden;
      }
      
      .sticky-header.visible {
        transform: translateY(0);
        visibility: visible;
        transition: transform 0.3s ease-out;
      }
      
      .sticky-header.hiding {
        transform: translateY(-100%);
        visibility: visible;
        transition: transform 0.3s ease-out;
      }
      
      .sticky-header.instant-hide {
        transform: translateY(-100%);
        transition: none;
        visibility: hidden;
      }
    `;
    document.head.appendChild(style);
    
    // NOVÉ: Kontrola při načtení stránky, jestli jsme uprostřed
    function checkInitialPosition() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Pokud jsme níže na stránce při načtení (pod původním menu)
        if (scrollTop > menuPosition && scrollTop > scrollThreshold) {
            stickyHeader.classList.add('visible');
        }
    }
    
    // Spustíme kontrolu pozice po malé prodlevě, aby se stránka správně načetla
    setTimeout(checkInitialPosition, 100);
    
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Determine scroll direction
        if (scrollTop > lastScrollTop) {
            // Scrolling DOWN - PLYNULÉ ZAJETÍ NAHORU
            if (stickyHeader.classList.contains('visible')) {
                stickyHeader.classList.remove('visible');
                stickyHeader.classList.add('hiding');
            }
        } else {
            // Scrolling UP
            
            // Jsme v oblasti menu nebo výš?
            if (scrollTop <= menuPosition) {
                // Když jsme na úrovni menu nebo výš, sticky header OKAMŽITĚ zmizí
                stickyHeader.classList.add('instant-hide');
                stickyHeader.classList.remove('visible');
                stickyHeader.classList.remove('hiding');
                
                // Odstraníme třídu pro okamžité zmizení po malé prodlevě
                // (aby nepřekážela při následném zobrazení s animací)
                setTimeout(() => {
                    stickyHeader.classList.remove('instant-hide');
                }, 50);
            } else if (scrollTop > scrollThreshold) {
                // Jsme pod menu, sticky header by měl plynule vyjet z vrchu
                stickyHeader.classList.remove('instant-hide');
                stickyHeader.classList.remove('hiding');
                stickyHeader.classList.add('visible');
            } else {
                stickyHeader.classList.remove('visible');
            }
        }
        
        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop; // For Mobile or negative scrolling
    });
    
    // Function to initialize dropdown functionality
    function initializeDropdowns(headerElement) {
        // Handle main dropdowns
        const dropdownToggles = headerElement.querySelectorAll('.dropdown-toggle');
        dropdownToggles.forEach(toggle => {
            toggle.addEventListener('click', function(e) {
                e.preventDefault();
                const dropdownContent = this.nextElementSibling;
                
                // Close all other dropdowns first
                headerElement.querySelectorAll('.dropdown-content.show, .dropdown-content-second.show').forEach(dropdown => {
                    if (dropdown !== dropdownContent) {
                        dropdown.classList.remove('show');
                    }
                });
                
                // Toggle current dropdown
                dropdownContent.classList.toggle('show');
            });
        });
        
        // Handle second-level dropdowns
        const secondDropdownToggles = headerElement.querySelectorAll('.dropdown-toggle-second');
        secondDropdownToggles.forEach(toggle => {
            toggle.addEventListener('click', function(e) {
                e.preventDefault();
                const dropdownContent = this.nextElementSibling;
                
                // Close all other dropdowns first
                headerElement.querySelectorAll('.dropdown-content.show, .dropdown-content-second.show').forEach(dropdown => {
                    if (dropdown !== dropdownContent) {
                        dropdown.classList.remove('show');
                    }
                });
                
                // Toggle current dropdown
                dropdownContent.classList.toggle('show');
            });
        });
        
        // Handle sub-dropdowns
        const subDropdowns = headerElement.querySelectorAll('.sub-dropdown-toggle');
        subDropdowns.forEach(toggle => {
            toggle.addEventListener('mouseenter', function() {
                const subDropdownContent = this.nextElementSibling;
                if (subDropdownContent) {
                    subDropdownContent.classList.add('show');
                }
            });
            
            const subDropdownContainer = toggle.closest('.sub-dropdown');
            if (subDropdownContainer) {
                subDropdownContainer.addEventListener('mouseleave', function() {
                    const subDropdownContent = this.querySelector('.sub-dropdown-content');
                    if (subDropdownContent) {
                        subDropdownContent.classList.remove('show');
                    }
                });
            }
        });
        
        // Close dropdowns when clicking outside
        document.addEventListener('click', function(e) {
            if (!e.target.closest('.dropdown')) {
                headerElement.querySelectorAll('.dropdown-content.show, .dropdown-content-second.show').forEach(dropdown => {
                    dropdown.classList.remove('show');
                });
            }
        });
    }
});

// Funkce pro synchronizaci horizontálního scrollu sticky headeru
function syncStickyHeaderScroll() {
    const stickyHeader = document.querySelector('.sticky-header');
    if (stickyHeader && (stickyHeader.classList.contains('visible') || stickyHeader.classList.contains('hiding'))) {
        // Získá horizontální pozici scrollu stránky
        const pageScrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
        
        // Nastaví horizontální scroll uvnitř sticky headeru podle scrollu stránky
        stickyHeader.scrollLeft = pageScrollLeft;
    }
}

// Přidá event listener pro scroll události
window.addEventListener('scroll', syncStickyHeaderScroll);

// Inicializuje při načtení stránky
document.addEventListener('DOMContentLoaded', syncStickyHeaderScroll);

// Přidá event listener pro resize události
window.addEventListener('resize', syncStickyHeaderScroll);






