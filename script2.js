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
    let dropdownToggle2 = document.querySelector(".dropdown-toggle-second");
    let dropdownContent2 = document.querySelector(".dropdown-second-content");

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
    const dropdownToggles = document.querySelectorAll(".dropdown-toggle");
    const dropdownContents = document.querySelectorAll(".dropdown-content");

    // Funkce pro nastavení co nejmenší mezery
    function adjustDropdownMargin() {
        dropdownToggles.forEach((toggle, index) => {
            const content = dropdownContents[index];
            const toggleHeight = toggle.offsetHeight;  // Výška tlačítka
            // Snížíme mezeru na co nejmenší hodnotu, například na 1px nebo 0px
            content.style.marginTop = `-0.5px`;  // Úplně žádná mezera, nebo nastavte na 1px
        });
    }

    // Zavoláme funkci pro nastavení mezery při načítání stránky
    adjustDropdownMargin();

    // Zavoláme funkci i při změně velikosti okna
    window.addEventListener("resize", adjustDropdownMargin);
});

document.addEventListener("DOMContentLoaded", function () {
    const dropdownToggles2 = document.querySelectorAll(".dropdown-toggle-second");
    const dropdownContents2 = document.querySelectorAll(".dropdown-second-content");

    // Funkce pro nastavení co nejmenší mezery
    function adjustDropdownMargin() {
        dropdownToggles2.forEach((toggle, index) => {
            const content = dropdownContents2[index];
            const toggleHeight = toggle.offsetHeight;  // Výška tlačítka
            // Snížíme mezeru na co nejmenší hodnotu, například na 1px nebo 0px
            content.style.marginTop = `-0.5px`;  // Úplně žádná mezera, nebo nastavte na 1px
        });
    }

    // Zavoláme funkci pro nastavení mezery při načítání stránky
    adjustDropdownMargin();

    // Zavoláme funkci i při změně velikosti okna
    window.addEventListener("resize", adjustDropdownMargin);
});






document.addEventListener("DOMContentLoaded", function () {
    const dropdownContent2 = document.querySelector(".dropdown-second-content");

    // Příklad: nastavení vlastnosti top a left pro posun podmenu
    dropdownContent2.style.position = "absolute"; // Pokud chceš absolutní pozicování
    dropdownContent2.style.top = "60px"; // Posun o 100px od vrchu
    dropdownContent2.style.left = "783px"; // Posun o 50px od levé strany
});
