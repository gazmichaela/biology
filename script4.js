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
        
        // Skrytí podmenu při opuštění kurzoru tlačítka
        dropdownToggle.addEventListener("mouseleave", function() {
            hideTimeoutFirst = setTimeout(function() {
                // Nejprve spustíme animaci průhlednosti
                dropdownContent.style.opacity = "0";
                dropdownContent.style.visibility = "hidden";
                
                // Po dokončení animace skryjeme prvek úplně
                animationTimeoutFirst = setTimeout(() => {
                    dropdownContent.style.display = "none";
                }, 300);
            }, 200);
        });
        
        // Skrytí podmenu při opuštění kurzoru podmenu
        dropdownContent.addEventListener("mouseleave", function() {
            hideTimeoutFirst = setTimeout(function() {
                // Nejprve spustíme animaci průhlednosti
                dropdownContent.style.opacity = "0";
                dropdownContent.style.visibility = "hidden";
                
                // Po dokončení animace skryjeme prvek úplně
                animationTimeoutFirst = setTimeout(() => {
                    dropdownContent.style.display = "none";
                }, 300);
            }, 200);
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
        
        // Skrytí druhého podmenu při opuštění kurzoru tlačítka
        dropdownToggle2.addEventListener("mouseleave", function() {
            hideTimeoutSecond = setTimeout(function() {
                // Nejprve spustíme animaci průhlednosti
                dropdownContent2.style.opacity = "0";
                dropdownContent2.style.visibility = "hidden";
                
                // Po dokončení animace skryjeme prvek úplně
                animationTimeoutSecond = setTimeout(() => {
                    dropdownContent2.style.display = "none";
                }, 300);
            }, 200);
        });
        
        // Skrytí druhého podmenu při opuštění kurzoru podmenu
        dropdownContent2.addEventListener("mouseleave", function() {
            hideTimeoutSecond = setTimeout(function() {
                // Nejprve spustíme animaci průhlednosti
                dropdownContent2.style.opacity = "0";
                dropdownContent2.style.visibility = "hidden";
                
                // Po dokončení animace skryjeme prvek úplně
                animationTimeoutSecond = setTimeout(() => {
                    dropdownContent2.style.display = "none";
                }, 300);
            }, 200);
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
        
        // Skrytí sub-dropdown při opuštění kurzoru tlačítka
        subDropdownToggle.addEventListener("mouseleave", function(e) {
            hideTimeoutSub = setTimeout(function() {
                // Nejprve spustíme animaci průhlednosti
                subDropdownContent.style.opacity = "0";
                subDropdownContent.style.visibility = "hidden";
                
                // Po dokončení animace skryjeme prvek úplně
                animationTimeoutSub = setTimeout(() => {
                    subDropdownContent.style.display = "none";
                }, 300);
            }, 200);
        });
        
        // Skrytí sub-dropdown při opuštění kurzoru podmenu
        subDropdownContent.addEventListener("mouseleave", function(e) {
            hideTimeoutSub = setTimeout(function() {
                // Nejprve spustíme animaci průhlednosti
                subDropdownContent.style.opacity = "0";
                subDropdownContent.style.visibility = "hidden";
                
                // Po dokončení animace skryjeme prvek úplně
                animationTimeoutSub = setTimeout(() => {
                    subDropdownContent.style.display = "none";
                }, 300);
            }, 200);
        });
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