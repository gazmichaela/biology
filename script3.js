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
                if (dropdownContent) {
                    dropdownContent.classList.toggle('show');
                } else {
                    console.log('Element dropdownContent nebyl nalezen');
                }
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
                if (dropdownContent) {
                    dropdownContent.classList.toggle('show');
                } else {
                    console.log('Element dropdownContent nebyl nalezen');
                }
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






