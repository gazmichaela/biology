document.addEventListener("DOMContentLoaded", function () {
    let dropdownToggle = document.querySelector(".dropdown-toggle");
    let dropdownContent = document.querySelector(".dropdown-content");
    let hideTimeout;

    // Zobrazení podmenu při najetí kurzoru na tlačítko
    dropdownToggle.addEventListener("mouseenter", function () {
        clearTimeout(hideTimeout);
        dropdownContent.classList.add('show'); // Přidáme třídu 'show' pro zobrazení podmenu
    });

    // Skrytí podmenu při opuštění kurzoru tlačítka
    dropdownToggle.addEventListener("mouseleave", function () {
        hideTimeout = setTimeout(function () {
            dropdownContent.classList.remove('show'); // Odebereme třídu 'show' pro skrytí podmenu
        }, 300); // Časová prodleva pro skrytí
    });

    // Udržování podmenu otevřeného při najetí na samotné podmenu
    dropdownContent.addEventListener("mouseenter", function () {
        clearTimeout(hideTimeout); // Zrušíme časovač skrytí, pokud se kurzor vrátí na podmenu
    });

    // Skrytí podmenu při opuštění kurzoru podmenu
    dropdownContent.addEventListener("mouseleave", function () {
        hideTimeout = setTimeout(function () {
            dropdownContent.classList.remove('show'); // Odebereme třídu 'show' pro skrytí podmenu
        }, 300); // Časová prodleva pro skrytí
    });
});

// Pro druhé dropdown menu
document.addEventListener("DOMContentLoaded", function () {
    let dropdownToggle2 = document.querySelector(".dropdown-toggle-second");
    let dropdownContent2 = document.querySelector(".dropdown-content-second");
    let hideTimeout;

    dropdownToggle2.addEventListener("mouseenter", function () {
        clearTimeout(hideTimeout);
        dropdownContent2.classList.add('show'); // Přidáme třídu 'show' pro zobrazení podmenu
    });

    dropdownContent2.addEventListener("mouseenter", function () {
        clearTimeout(hideTimeout);
    });

    dropdownToggle2.addEventListener("mouseleave", function () {
        hideTimeout = setTimeout(function () {
            dropdownContent2.classList.remove('show'); // Odebereme třídu 'show' pro skrytí podmenu
        }, 300);
    });

    dropdownContent2.addEventListener("mouseleave", function () {
        hideTimeout = setTimeout(function () {
            dropdownContent2.classList.remove('show'); // Odebereme třídu 'show' pro skrytí podmenu
        }, 300);
    });
});