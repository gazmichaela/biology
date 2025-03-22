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
    mainButtons.forEach(button => {
        if (window.location.href.includes(button.href)) {
            button.classList.add('active');
        }
    });
    dropdownLinks.forEach(link => {
        if (window.location.href.includes(link.href)) {
            link.classList.add('active');
            const parentButton = link.closest('.dropdown').querySelector('.main-button');
            if (parentButton) {
                parentButton.classList.add('active');
            }
        }
    });
});
