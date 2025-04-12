document.addEventListener("DOMContentLoaded", function() {
    // ----- DROPDOWN MENU FUNCTIONALITY (PRVNÍ MENU) -----
    const dropdownToggle = document.querySelector(".dropdown-toggle");
    const dropdownContent = document.querySelector(".dropdown-content");
    
    // Ověříme, zda prvky existují
    if (dropdownToggle && dropdownContent) {
        let hideTimeoutFirst;
        let animationTimeoutFirst;
        
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
        
        // Funkce pro nastavení pozice a rozměrů mrtvé zóny
        function positionDeadZone() {
            if (dropdownContent.style.display === "block") {
                const toggleRect = dropdownToggle.getBoundingClientRect();
                const contentRect = dropdownContent.getBoundingClientRect();
                
                // ZMĚNA: Nastavení mrtvé zóny tak, aby měla šířku celého podmenu
                deadZoneElement.style.left = Math.min(toggleRect.left, contentRect.left) + window.scrollX + "px";
                deadZoneElement.style.top = toggleRect.bottom + window.scrollY + "px";
                deadZoneElement.style.width = Math.max(contentRect.width, toggleRect.width) + "px";
                deadZoneElement.style.height = (contentRect.top - toggleRect.bottom) + "px";
                deadZoneElement.style.display = "block";
            } else {
                deadZoneElement.style.display = "none";
            }
        }
        
        // Zobrazení podmenu při najetí kurzoru na tlačítko
        dropdownToggle.addEventListener("mouseenter", function() {
            // Zrušíme všechny předchozí timeouty
            clearTimeout(hideTimeoutFirst);
            clearTimeout(animationTimeoutFirst);
            
            // Nejprve zobrazíme element (ale ještě je neviditelný)
            dropdownContent.style.display = "block";
            
            // Malé zpoždění před animací pro lepší plynulost
            setTimeout(() => {
                dropdownContent.style.opacity = "1";
                dropdownContent.style.visibility = "visible";
                // Nastavíme pozici mrtvé zóny
                positionDeadZone();
            }, 10);
        });
        
        // Udržování podmenu otevřeného při najetí na samotné podmenu
        dropdownContent.addEventListener("mouseenter", function() {
            // Zrušíme všechny předchozí timeouty
            clearTimeout(hideTimeoutFirst);
            clearTimeout(animationTimeoutFirst);
            
            // Zajistíme, že menu zůstane viditelné
            dropdownContent.style.display = "block";
            dropdownContent.style.opacity = "1";
            dropdownContent.style.visibility = "visible";
        });
        
        // Udržování podmenu otevřeného při najetí na mrtvou zónu
        deadZoneElement.addEventListener("mouseenter", function() {
            // Zrušíme všechny předchozí timeouty
            clearTimeout(hideTimeoutFirst);
            clearTimeout(animationTimeoutFirst);
            
            // Ujistíme se, že menu zůstane viditelné
            dropdownContent.style.display = "block";
            dropdownContent.style.opacity = "1";
            dropdownContent.style.visibility = "visible";
        });
        
        // Skrytí podmenu při opuštění kurzoru tlačítka - UPRAVENO
        dropdownToggle.addEventListener("mouseleave", function(e) {
            // Zkontrolujeme, kam kurzor směřuje
            const toElement = e.relatedTarget;
            
            // Pokud kurzor nejde do mrtvé zóny nebo do podmenu, zahájíme skrývání
            if (toElement !== deadZoneElement && !deadZoneElement.contains(toElement) && 
                toElement !== dropdownContent && !dropdownContent.contains(toElement)) {
                
                hideTimeoutFirst = setTimeout(function() {
                    // Nejprve spustíme animaci průhlednosti
                    dropdownContent.style.opacity = "0";
                    dropdownContent.style.visibility = "hidden";
                    
                    // Po dokončení animace skryjeme prvek úplně
                    animationTimeoutFirst = setTimeout(() => {
                        dropdownContent.style.display = "none";
                        deadZoneElement.style.display = "none";
                    }, 300);
                }, 200);
            }
        });
        
        // Skrytí podmenu při opuštění kurzoru podmenu - UPRAVENO
        dropdownContent.addEventListener("mouseleave", function(e) {
            // Zkontrolujeme, kam kurzor směřuje
            const toElement = e.relatedTarget;
            
            // Pokud kurzor nejde do mrtvé zóny nebo do tlačítka, zahájíme skrývání
            if (toElement !== deadZoneElement && !deadZoneElement.contains(toElement) && 
                toElement !== dropdownToggle && !dropdownToggle.contains(toElement)) {
                
                hideTimeoutFirst = setTimeout(function() {
                    // Nejprve spustíme animaci průhlednosti
                    dropdownContent.style.opacity = "0";
                    dropdownContent.style.visibility = "hidden";
                    
                    // Po dokončení animace skryjeme prvek úplně
                    animationTimeoutFirst = setTimeout(() => {
                        dropdownContent.style.display = "none";
                        deadZoneElement.style.display = "none";
                    }, 300);
                }, 200);
            }
        });
        
        // Skrytí podmenu při opuštění mrtvé zóny - UPRAVENO
        deadZoneElement.addEventListener("mouseleave", function(e) {
            // Zkontrolujeme, kam kurzor směřuje
            const toElement = e.relatedTarget;
            
            // Pokud kurzor nejde do menu nebo tlačítka, zahájíme skrývání
            if (toElement !== dropdownToggle && !dropdownToggle.contains(toElement) && 
                toElement !== dropdownContent && !dropdownContent.contains(toElement)) {
                
                hideTimeoutFirst = setTimeout(function() {
                    // Nejprve spustíme animaci průhlednosti
                    dropdownContent.style.opacity = "0";
                    dropdownContent.style.visibility = "hidden";
                    
                    // Po dokončení animace skryjeme prvek úplně
                    animationTimeoutFirst = setTimeout(() => {
                        dropdownContent.style.display = "none";
                        deadZoneElement.style.display = "none";
                    }, 300);
                }, 200);
            }
        });
        
        // Zavření menu kliknutím kamkoliv mimo menu a tlačítko
        document.addEventListener("click", function(event) {
            if (!dropdownToggle.contains(event.target) && 
                !dropdownContent.contains(event.target) &&
                event.target !== deadZoneElement) {
                
                dropdownContent.style.opacity = "0";
                dropdownContent.style.visibility = "hidden";
                
                setTimeout(() => {
                    dropdownContent.style.display = "none";
                    deadZoneElement.style.display = "none";
                }, 300);
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
                
                // ZMĚNA: Nastavení mrtvé zóny tak, aby měla šířku celého podmenu
                deadZoneElement2.style.left = Math.min(toggleRect.left, contentRect.left) + window.scrollX + "px";
                deadZoneElement2.style.top = toggleRect.bottom + window.scrollY + "px";
                deadZoneElement2.style.width = Math.max(contentRect.width, toggleRect.width) + "px";
                deadZoneElement2.style.height = (contentRect.top - toggleRect.bottom) + "px";
                deadZoneElement2.style.display = "block";
            } else {
                deadZoneElement2.style.display = "none";
            }
        }
        
        // Zobrazení druhého podmenu při najetí kurzoru na tlačítko
        dropdownToggle2.addEventListener("mouseenter", function() {
            // Zrušíme všechny předchozí timeouty
            clearTimeout(hideTimeoutSecond);
            clearTimeout(animationTimeoutSecond);
            
            // Nejprve zobrazíme element (ale ještě je neviditelný)
            dropdownContent2.style.display = "block";
            
            // Malé zpoždění před animací pro lepší plynulost
            setTimeout(() => {
                dropdownContent2.style.opacity = "1";
                dropdownContent2.style.visibility = "visible";
                // Nastavíme pozici mrtvé zóny
                positionDeadZone2();
            }, 10);
        });
        
        // Udržování druhého podmenu otevřeného při najetí na samotné podmenu
        dropdownContent2.addEventListener("mouseenter", function() {
            // Zrušíme všechny předchozí timeouty
            clearTimeout(hideTimeoutSecond);
            clearTimeout(animationTimeoutSecond);
            
            // Zajistíme, že menu zůstane viditelné
            dropdownContent2.style.display = "block";
            dropdownContent2.style.opacity = "1";
            dropdownContent2.style.visibility = "visible";
        });
        
        // Udržování podmenu otevřeného při najetí na mrtvou zónu
        deadZoneElement2.addEventListener("mouseenter", function() {
            // Zrušíme všechny předchozí timeouty
            clearTimeout(hideTimeoutSecond);
            clearTimeout(animationTimeoutSecond);
            
            // Ujistíme se, že menu zůstane viditelné
            dropdownContent2.style.display = "block";
            dropdownContent2.style.opacity = "1";
            dropdownContent2.style.visibility = "visible";
        });
        
        // Skrytí druhého podmenu při opuštění kurzoru tlačítka - UPRAVENO
        dropdownToggle2.addEventListener("mouseleave", function(e) {
            // Zkontrolujeme, kam kurzor směřuje
            const toElement = e.relatedTarget;
            
            // Pokud kurzor nejde do mrtvé zóny nebo do podmenu, zahájíme skrývání
            if (toElement !== deadZoneElement2 && !deadZoneElement2.contains(toElement) && 
                toElement !== dropdownContent2 && !dropdownContent2.contains(toElement)) {
                
                hideTimeoutSecond = setTimeout(function() {
                    // Nejprve spustíme animaci průhlednosti
                    dropdownContent2.style.opacity = "0";
                    dropdownContent2.style.visibility = "hidden";
                    
                    // Po dokončení animace skryjeme prvek úplně
                    animationTimeoutSecond = setTimeout(() => {
                        dropdownContent2.style.display = "none";
                        deadZoneElement2.style.display = "none";
                    }, 300);
                }, 200);
            }
        });
        
        // Skrytí druhého podmenu při opuštění kurzoru podmenu - UPRAVENO
        dropdownContent2.addEventListener("mouseleave", function(e) {
            // Zkontrolujeme, kam kurzor směřuje
            const toElement = e.relatedTarget;
            
            // Pokud kurzor nejde do mrtvé zóny nebo do tlačítka, zahájíme skrývání
            if (toElement !== deadZoneElement2 && !deadZoneElement2.contains(toElement) && 
                toElement !== dropdownToggle2 && !dropdownToggle2.contains(toElement)) {
                
                hideTimeoutSecond = setTimeout(function() {
                    // Nejprve spustíme animaci průhlednosti
                    dropdownContent2.style.opacity = "0";
                    dropdownContent2.style.visibility = "hidden";
                    
                    // Po dokončení animace skryjeme prvek úplně
                    animationTimeoutSecond = setTimeout(() => {
                        dropdownContent2.style.display = "none";
                        deadZoneElement2.style.display = "none";
                    }, 300);
                }, 200);
            }
        });
        
        // Skrytí podmenu při opuštění mrtvé zóny - UPRAVENO
        deadZoneElement2.addEventListener("mouseleave", function(e) {
            // Zkontrolujeme, kam kurzor směřuje
            const toElement = e.relatedTarget;
            
            // Pokud kurzor nejde do menu nebo tlačítka, zahájíme skrývání
            if (toElement !== dropdownToggle2 && !dropdownToggle2.contains(toElement) && 
                toElement !== dropdownContent2 && !dropdownContent2.contains(toElement)) {
                
                hideTimeoutSecond = setTimeout(function() {
                    // Nejprve spustíme animaci průhlednosti
                    dropdownContent2.style.opacity = "0";
                    dropdownContent2.style.visibility = "hidden";
                    
                    // Po dokončení animace skryjeme prvek úplně
                    animationTimeoutSecond = setTimeout(() => {
                        dropdownContent2.style.display = "none";
                        deadZoneElement2.style.display = "none";
                    }, 300);
                }, 200);
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
        
        // Předpřiprava stylu pro plynulou animaci - identická jako u hlavního dropdown
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
        
        // Funkce pro nastavení pozice a rozměrů mrtvé zóny
        function positionDeadZoneSub() {
            if (subDropdownContent.style.display === "block") {
                const toggleRect = subDropdownToggle.getBoundingClientRect();
                const contentRect = subDropdownContent.getBoundingClientRect();
                
                // Zjistíme orientaci menu vůči tlačítku
                if (contentRect.top >= toggleRect.bottom) {
                    // Menu je pod tlačítkem - vertikální mrtvá zóna
                    // ZMĚNA: Nastavení mrtvé zóny tak, aby měla šířku celého podmenu
                    deadZoneElementSub.style.left = Math.min(toggleRect.left, contentRect.left) + window.scrollX + "px";
                    deadZoneElementSub.style.top = toggleRect.bottom + window.scrollY + "px";
                    deadZoneElementSub.style.width = Math.max(contentRect.width, toggleRect.width) + "px";
                    deadZoneElementSub.style.height = (contentRect.top - toggleRect.bottom) + "px";
                } else if (contentRect.left >= toggleRect.right) {
                    // Menu je vpravo od tlačítka - horizontální mrtvá zóna
                    deadZoneElementSub.style.left = toggleRect.right + window.scrollX + "px";
                    deadZoneElementSub.style.top = toggleRect.top + window.scrollY + "px";
                    deadZoneElementSub.style.width = (contentRect.left - toggleRect.right) + "px";
                    deadZoneElementSub.style.height = toggleRect.height + "px";
                }
                
                deadZoneElementSub.style.display = "block";
            } else {
                deadZoneElementSub.style.display = "none";
            }
        }
        
        // Zobrazení sub-dropdown při najetí kurzoru na tlačítko
        subDropdownToggle.addEventListener("mouseenter", function(e) {
            // Zrušíme všechny předchozí timeouty
            clearTimeout(hideTimeoutSub);
            clearTimeout(animationTimeoutSub);
            
            // Nejprve zobrazíme element (ale ještě je neviditelný)
            subDropdownContent.style.display = "block";
            
            // Malé zpoždění před animací pro lepší plynulost
            setTimeout(() => {
                subDropdownContent.style.opacity = "1";
                subDropdownContent.style.visibility = "visible";
                // Nastavíme pozici mrtvé zóny
                positionDeadZoneSub();
            }, 10);
        });
        
        // Udržování sub-dropdown otevřeného při najetí na samotné podmenu
        subDropdownContent.addEventListener("mouseenter", function(e) {
            // Zrušíme všechny předchozí timeouty
            clearTimeout(hideTimeoutSub);
            clearTimeout(animationTimeoutSub);
            
            // Zajistíme, že menu zůstane viditelné
            subDropdownContent.style.display = "block";
            subDropdownContent.style.opacity = "1";
            subDropdownContent.style.visibility = "visible";
        });
        
        // Udržování podmenu otevřeného při najetí na mrtvou zónu
        deadZoneElementSub.addEventListener("mouseenter", function() {
            // Zrušíme všechny předchozí timeouty
            clearTimeout(hideTimeoutSub);
            clearTimeout(animationTimeoutSub);
            
            // Ujistíme se, že menu zůstane viditelné
            subDropdownContent.style.display = "block";
            subDropdownContent.style.opacity = "1";
            subDropdownContent.style.visibility = "visible";
        });
        
        // Skrytí sub-dropdown při opuštění kurzoru tlačítka - UPRAVENO
        subDropdownToggle.addEventListener("mouseleave", function(e) {
            // Zkontrolujeme, kam kurzor směřuje
            const toElement = e.relatedTarget;
            
            // Pokud kurzor nejde do mrtvé zóny nebo do podmenu, zahájíme skrývání
            if (toElement !== deadZoneElementSub && !deadZoneElementSub.contains(toElement) && 
                toElement !== subDropdownContent && !subDropdownContent.contains(toElement)) {
                
                hideTimeoutSub = setTimeout(function() {
                    // Nejprve spustíme animaci průhlednosti
                    subDropdownContent.style.opacity = "0";
                    subDropdownContent.style.visibility = "hidden";
                    
                    // Po dokončení animace skryjeme prvek úplně
                    animationTimeoutSub = setTimeout(() => {
                        subDropdownContent.style.display = "none";
                        deadZoneElementSub.style.display = "none";
                    }, 300);
                }, 200);
            }
        });
        
        // Skrytí sub-dropdown při opuštění kurzoru podmenu - UPRAVENO
        subDropdownContent.addEventListener("mouseleave", function(e) {
            // Zkontrolujeme, kam kurzor směřuje
            const toElement = e.relatedTarget;
            
            // Pokud kurzor nejde do mrtvé zóny nebo do tlačítka, zahájíme skrývání
            if (toElement !== deadZoneElementSub && !deadZoneElementSub.contains(toElement) && 
                toElement !== subDropdownToggle && !subDropdownToggle.contains(toElement)) {
                
                hideTimeoutSub = setTimeout(function() {
                    // Nejprve spustíme animaci průhlednosti
                    subDropdownContent.style.opacity = "0";
                    subDropdownContent.style.visibility = "hidden";
                    
                    // Po dokončení animace skryjeme prvek úplně
                    animationTimeoutSub = setTimeout(() => {
                        subDropdownContent.style.display = "none";
                        deadZoneElementSub.style.display = "none";
                    }, 300);
                }, 200);
            }
        });
        
        // Skrytí podmenu při opuštění mrtvé zóny - UPRAVENO
        deadZoneElementSub.addEventListener("mouseleave", function(e) {
            // Zkontrolujeme, kam kurzor směřuje
            const toElement = e.relatedTarget;
            
            // Pokud kurzor nejde do menu nebo tlačítka, zahájíme skrývání
            if (toElement !== subDropdownToggle && !subDropdownToggle.contains(toElement) && 
                toElement !== subDropdownContent && !subDropdownContent.contains(toElement)) {
                
                hideTimeoutSub = setTimeout(function() {
                    // Nejprve spustíme animaci průhlednosti
                    subDropdownContent.style.opacity = "0";
                    subDropdownContent.style.visibility = "hidden";
                    
                    // Po dokončení animace skryjeme prvek úplně
                    animationTimeoutSub = setTimeout(() => {
                        subDropdownContent.style.display = "none";
                        deadZoneElementSub.style.display = "none";
                    }, 300);
                }, 200);
            }
        });
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