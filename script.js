document.addEventListener("DOMContentLoaded", function () {
    let dropdownToggle = document.querySelector(".dropdown-toggle");
    let dropdownContent = document.querySelector(".dropdown-content");

    let hideTimeout;

    dropdownToggle.addEventListener("mouseenter", function () {
        clearTimeout(hideTimeout);
        dropdownContent.style.display = "block";
        dropdownContent.style.opacity = "1";
        dropdownContent.style.visibility = "visible";
    });

    dropdownContent.addEventListener("mouseenter", function () {
        clearTimeout(hideTimeout);
    });

    dropdownToggle.addEventListener("mouseleave", function () {
        hideTimeout = setTimeout(function () {
            dropdownContent.style.opacity = "0";
            dropdownContent.style.visibility = "hidden";
            setTimeout(() => {
                dropdownContent.style.display = "none";
            }, 300);
        }, 500);
    });

    dropdownContent.addEventListener("mouseleave", function () {
        hideTimeout = setTimeout(function () {
            dropdownContent.style.opacity = "0";
            dropdownContent.style.visibility = "hidden";
            setTimeout(() => {
                dropdownContent.style.display = "none";
            }, 300);
        }, 500);
    });
});

document.addEventListener("DOMContentLoaded", function () {
    const toggle = document.querySelector(".sub-dropdown-toggle");
    const submenu = document.querySelector(".sub-dropdown-content");

    let hideTimeout;

    function showSubmenu() {
        clearTimeout(hideTimeout); 
        submenu.style.display = "block";
    }

    function hideSubmenu() {
       hideTimeout = setTimeout(() => {
            submenu.style.display = "none";
        }, 300); 
    }

    toggle.addEventListener("mouseenter", showSubmenu);
    submenu.addEventListener("mouseenter", showSubmenu);

    toggle.addEventListener("mouseleave", hideSubmenu);
    submenu.addEventListener("mouseleave", hideSubmenu);
});



document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".faq").forEach(faq => {
        faq.addEventListener("click", () => {
            faq.classList.toggle("active");
        });
    });
});





document.addEventListener('DOMContentLoaded', function () {
    // 1. Získáme všechny hlavní tlačítka a podmenu odkazy
    const mainButtons = document.querySelectorAll('.main-button, .maine-button');
    const dropdownLinks = document.querySelectorAll('.dropdown-content a');

    // 2. Přidáme posluchač pro všechny odkazy
    const addActiveClass = (link) => {
        // Odstraníme 'active' třídu ze všech tlačítek
        mainButtons.forEach(button => button.classList.remove('active'));
        dropdownLinks.forEach(link => link.classList.remove('active'));
        
        // Přidáme 'active' třídu na vybraný odkaz
        link.classList.add('active');

        // Pokud je odkaz v podmenu, přidáme 'active' třídu i na odpovídající hlavní tlačítko
        if (link.closest('.dropdown-content')) {
            const parentButton = link.closest('.dropdown').querySelector('.main-button');
            if (parentButton) {
                parentButton.classList.add('active');
            }
        }
    };

    // 3. Udržujeme aktivní tlačítka při kliknutí na hlavní tlačítka
    mainButtons.forEach(button => {
        button.addEventListener('click', function () {
           addActiveClass(button);
        });
    });

    // 4. Udržujeme aktivní tlačítka při kliknutí na položky v podmenu
    dropdownLinks.forEach(link => {
        link.addEventListener('click', function () {
            addActiveClass(link);
        });
    });

    // 5. Udržujeme aktivní tlačítka při načítání stránky, pokud URL odpovídá odkazu
    //mainButtons.forEach(button => {
       // if (window.location.href.includes(button.href)) {
          //  button.classList.add('active');
      // }
    });
   // dropdownLinks.forEach(link => {
       // if (window.location.href.includes(link.href)) {
          //  link.classList.add('active');
          //  const parentButton = link.closest('.dropdown').querySelector('.main-button');
          //  if (parentButton) {
           //     parentButton.classList.add('active');
          //  }
     //   }
  //  });
//});

document.addEventListener('DOMContentLoaded', function () {
    const buttons = document.querySelectorAll('.main-button, .maine-button'); // Všechny tlačítka navigace

    // Funkce pro nastavení aktivního tlačítka
    function setActiveButton(clickedButton) {
        buttons.forEach(button => button.classList.remove('active')); // Odstranění active z všech tlačítek
        clickedButton.classList.add('active'); // Přidání active na kliknuté tlačítko
    }

    // Přidání event listeneru na všechna tlačítka
    buttons.forEach(button => {
        button.addEventListener('click', function () {
            setActiveButton(button);
        });
    });

    // Nastavení aktivního tlačítka podle URL po načtení stránky
    buttons.forEach(button => {
        if (window.location.href.includes(button.href)) {
            setActiveButton(button);
        }
    });
});


document.addEventListener('DOMContentLoaded', function () {
    const buttons = document.querySelectorAll('.main-button, .maine-button'); // Všechny hlavní tlačítka
    const dropdownLinks = document.querySelectorAll('.dropdown-content a, .dropdown-content-second a'); // Odkazy v podmenu

    // Funkce pro nastavení aktivního tlačítka
    function setActiveButton(clickedButton) {
        // Odstranění active z podmenu
        dropdownLinks.forEach(link => link.classList.remove('active'));
        
        // Přidání active pouze na kliknutý odkaz v podmenu
        if (clickedButton.closest('.dropdown-content') || clickedButton.closest('.dropdown-content-second')) {
            clickedButton.classList.add('active');
            
            // Najdeme hlavní tlačítko a zajistíme, že zůstane bez active třídy
            const parentButton = clickedButton.closest('.dropdown, .dropdown-content-second').querySelector('.main-button');
            if (parentButton) {
                buttons.forEach(button => button.classList.remove('active')); // Odstraníme active z hlavních tlačítek
            }
        } else {
            // Pokud klikneme na hlavní tlačítko, resetujeme podmenu a zvýrazníme jen hlavní tlačítko
            buttons.forEach(button => button.classList.remove('active'));
            clickedButton.classList.add('active');
        }
    }

    // Přidání event listeneru na všechna tlačítka a odkazy
    [...buttons, ...dropdownLinks].forEach(element => {
        element.addEventListener('click', function () {
            setActiveButton(element);
        });
    });

    // Nastavení aktivního tlačítka podle URL po načtení stránky
    dropdownLinks.forEach(link => {
        if (window.location.href.includes(link.href)) {
            link.classList.add('active');
        }
    });
});





document.addEventListener("DOMContentLoaded", function () { 
    // Selektory pro druhé podmenu
    let dropdownToggle2 = document.querySelector(".dropdown-toggle-second");
    let dropdownContent2 = document.querySelector(".dropdown-content-second");

    let hideTimeout;

    // Otevření druhého podmenu při najetí myší na tlačítko
    dropdownToggle2.addEventListener("mouseenter", function () {
        clearTimeout(hideTimeout); // Zrušíme případný timeout pro skrytí
        dropdownContent2.style.display = "block";  // Zobrazíme podmenu
        dropdownContent2.style.opacity = "1";      // Uděláme viditelné
        dropdownContent2.style.visibility = "visible"; // Uděláme viditelné
    });

    // Udržování podmenu otevřeného při najetí myší na něj
    dropdownContent2.addEventListener("mouseenter", function () {
        clearTimeout(hideTimeout); // Zrušíme případný timeout pro skrytí
    });

    // Skrytí podmenu, pokud myš opustí tlačítko nebo podmenu
    dropdownToggle2.addEventListener("mouseleave", function () {
        hideTimeout = setTimeout(function () {
            dropdownContent2.style.opacity = "0"; // Skrytí podmenu s animací
            dropdownContent2.style.visibility = "hidden"; // Skrytí podmenu
            setTimeout(() => {
                dropdownContent2.style.display = "none"; // Skrytí podmenu
            }, 300); // Doba pro animaci skrytí
        }, 500); // Prodleva před skrytím podmenu
    });

    dropdownContent2.addEventListener("mouseleave", function () {
        hideTimeout = setTimeout(function () {
            dropdownContent2.style.opacity = "0"; // Skrytí podmenu s animací
            dropdownContent2.style.visibility = "hidden"; // Skrytí podmenu
            setTimeout(() => {
                dropdownContent2.style.display = "none"; // Skrytí podmenu
            }, 300); // Doba pro animaci skrytí
        }, 500); // Prodleva před skrytím podmenu
    });
});


document.addEventListener("DOMContentLoaded", function () { 
    let dropdownToggle2 = document.querySelector(".dropdown-toggle-second");
    let dropdownContent2 = document.querySelector(".dropdown-content-second");

    // Ověříme, zda prvky existují → pokud ne, ukončíme funkci
    if (!dropdownToggle2 || !dropdownContent2) return;

    let hideTimeout;

    dropdownToggle2.addEventListener("mouseenter", function () {
        clearTimeout(hideTimeout); 
        dropdownContent2.style.display = "block";  
        dropdownContent2.style.opacity = "1";      
        dropdownContent2.style.visibility = "visible"; 
    });

    dropdownContent2.addEventListener("mouseenter", function () {
        clearTimeout(hideTimeout);
    });

    dropdownToggle2.addEventListener("mouseleave", function () {
        hideTimeout = setTimeout(function () {
            dropdownContent2.style.opacity = "0"; 
            dropdownContent2.style.visibility = "hidden"; 
            setTimeout(() => {
                dropdownContent2.style.display = "none"; 
            }, 300);
        }, 500);
    });

    dropdownContent2.addEventListener("mouseleave", function () {
        hideTimeout = setTimeout(function () {
            dropdownContent2.style.opacity = "0"; 
            dropdownContent2.style.visibility = "hidden"; 
            setTimeout(() => {
                dropdownContent2.style.display = "none"; 
            }, 300);
        }, 500);
    });
});




window.addEventListener('DOMContentLoaded', (event) => {
    // Získáme všechny odkazy v menu
    const menuLinks = document.querySelectorAll('.main-button, .dropdown-content a, .sub-dropdown-content a');

    menuLinks.forEach(link => {
        // Zkontrolujeme, zda URL odkazu odpovídá aktuální stránce
        if (link.href === window.location.href) {
            // Přidáme třídu 'active' k tomu odkazu
            link.classList.add('active');
        }
    });
});


window.addEventListener('DOMContentLoaded', (event) => {
    // Získáme odkaz na "Úvod" podle jeho href atributu
    const introLink = document.querySelector('.dropdown-content a[href="tools.html"]');
    
    // Pokud je aktuální stránka "tools.html", přidáme třídu 'active'
    if (window.location.pathname.includes('tools.html')) {
        introLink.classList.add('active');
    }
});
