document.addEventListener("DOMContentLoaded", function() {
    // ----- DROPDOWN MENU FUNCTIONALITY (PRVNÍ MENU) -----
    const dropdownToggle = document.querySelector(".dropdown-toggle");
    const dropdownContent = document.querySelector(".dropdown-content");
    
    // Ověříme, zda prvky existují
    if (dropdownToggle && dropdownContent) {
        let hideTimeoutFirst;
        let animationTimeoutFirst;
        
        // Předpřiprava stylu pro plynulou animaci
        dropdownContent.style.transition = "opacity 0.2s ease-in-out, visibility 0.2s ease-in-out";
        
        // Zobrazení podmenu při najetí kurzoru na tlačítko
        dropdownToggle.addEventListener("mouseenter", function() {
            // Zrušíme všechny předchozí timeouty
            clearTimeout(hideTimeoutFirst);
            clearTimeout(animationTimeoutFirst);
            
            // Okamžitě zobrazíme menu (bez zpoždění)
            dropdownContent.style.display = "block";
            // Použijeme requestAnimationFrame pro plynulejší animaci
            requestAnimationFrame(() => {
                dropdownContent.style.opacity = "1";
                dropdownContent.style.visibility = "visible";
            });
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
        
        // Skrytí podmenu při opuštění kurzoru tlačítka
        dropdownToggle.addEventListener("mouseleave", function() {
            hideTimeoutFirst = setTimeout(function() {
                dropdownContent.style.opacity = "0";
                dropdownContent.style.visibility = "hidden";
                
                animationTimeoutFirst = setTimeout(() => {
                    dropdownContent.style.display = "none";
                }, 200); // Zkráceno na 200ms pro rychlejší skrytí
            }, 300); // Zkráceno na 300ms pro rychlejší reakci
        });
        
        // Skrytí podmenu při opuštění kurzoru podmenu
        dropdownContent.addEventListener("mouseleave", function() {
            hideTimeoutFirst = setTimeout(function() {
                dropdownContent.style.opacity = "0";
                dropdownContent.style.visibility = "hidden";
                
                animationTimeoutFirst = setTimeout(() => {
                    dropdownContent.style.display = "none";
                }, 200); // Zkráceno na 200ms pro rychlejší skrytí
            }, 300); // Zkráceno na 300ms pro rychlejší reakci
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
        dropdownContent2.style.transition = "opacity 0.2s ease-in-out, visibility 0.2s ease-in-out";
        
        // Zobrazení druhého podmenu při najetí kurzoru na tlačítko
        dropdownToggle2.addEventListener("mouseenter", function() {
            // Zrušíme všechny předchozí timeouty
            clearTimeout(hideTimeoutSecond);
            clearTimeout(animationTimeoutSecond);
            
            // Okamžitě zobrazíme menu (bez zpoždění)
            dropdownContent2.style.display = "block";
            // Použijeme requestAnimationFrame pro plynulejší animaci
            requestAnimationFrame(() => {
                dropdownContent2.style.opacity = "1";
                dropdownContent2.style.visibility = "visible";
            });
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
        
        // Skrytí druhého podmenu při opuštění kurzoru tlačítka
        dropdownToggle2.addEventListener("mouseleave", function() {
            hideTimeoutSecond = setTimeout(function() {
                dropdownContent2.style.opacity = "0";
                dropdownContent2.style.visibility = "hidden";
                
                animationTimeoutSecond = setTimeout(() => {
                    dropdownContent2.style.display = "none";
                }, 200); // Zkráceno na 200ms pro rychlejší skrytí
            }, 300); // Zkráceno na 300ms pro rychlejší reakci
        });
        
        // Skrytí druhého podmenu při opuštění kurzoru podmenu
        dropdownContent2.addEventListener("mouseleave", function() {
            hideTimeoutSecond = setTimeout(function() {
                dropdownContent2.style.opacity = "0";
                dropdownContent2.style.visibility = "hidden";
                
                animationTimeoutSecond = setTimeout(() => {
                    dropdownContent2.style.display = "none";
                }, 200); // Zkráceno na 200ms pro rychlejší skrytí
            }, 300); // Zkráceno na 300ms pro rychlejší reakci
        });
    }
    
    // ----- SUB-DROPDOWN MENU FUNCTIONALITY -----
    const subDropdownToggle = document.querySelector(".sub-dropdown-toggle");
    const subDropdownContent = document.querySelector(".sub-dropdown-content");
    
    // Ověříme, zda prvky existují
    if (subDropdownToggle && subDropdownContent) {
        let hideTimeoutSub;
        
        // Přidáme plynulé přechody
        subDropdownContent.style.transition = "opacity 0.2s ease-in-out";
        subDropdownContent.style.opacity = "0";
        
        function showSubmenu() {
            clearTimeout(hideTimeoutSub);
            subDropdownContent.style.display = "block";
            // Použijeme requestAnimationFrame pro plynulejší animaci
            requestAnimationFrame(() => {
                subDropdownContent.style.opacity = "1";
            });
        }
        
        function hideSubmenu() {
            hideTimeoutSub = setTimeout(() => {
                subDropdownContent.style.opacity = "0";
                
                setTimeout(() => {
                    subDropdownContent.style.display = "none";
                }, 200);
            }, 300);
        }
        
        subDropdownToggle.addEventListener("mouseenter", showSubmenu);
        subDropdownContent.addEventListener("mouseenter", showSubmenu);
        subDropdownToggle.addEventListener("mouseleave", hideSubmenu);
        subDropdownContent.addEventListener("mouseleave", hideSubmenu);
    }
    
    // ----- FAQ FUNCTIONALITY -----
    // Přepínání otázek v FAQ
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
            // Původní kód byl:
            /*
            if (clickedButton.closest('.dropdown') || clickedButton.closest('.sub-dropdown')) {
                const parentContainer = clickedButton.closest('.dropdown') || clickedButton.closest('.sub-dropdown');
                const parentButton = parentContainer.querySelector('.main-button, .dropdown-toggle, .sub-dropdown-toggle');
                if (parentButton) {
                    parentButton.classList.add('active');
                }
            }
            */
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
            // Původní kód byl:
            /*
            if (link.closest('.dropdown') || link.closest('.sub-dropdown')) {
                const parentContainer = link.closest('.dropdown') || link.closest('.sub-dropdown');
                const parentButton = parentContainer.querySelector('.main-button, .dropdown-toggle, .sub-dropdown-toggle');
                if (parentButton) {
                    parentButton.classList.add('active');
                }
            }
            */
        }
    });
    
    // Speciální případ pro tools.html
    const introLink = document.querySelector('.dropdown-content a[href="tools.html"]');
    if (introLink && window.location.pathname.includes('tools.html')) {
        introLink.classList.add('active');
        
        // ZMĚNA: Odstraněna aktivace nadřazeného tlačítka
        // Původní kód byl:
        /*
        if (introLink.closest('.dropdown')) {
            const parentButton = introLink.closest('.dropdown').querySelector('.dropdown-toggle');
            if (parentButton) {
                parentButton.classList.add('active');
            }
        }
        */
    }
});