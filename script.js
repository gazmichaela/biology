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

