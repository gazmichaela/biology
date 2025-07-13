   const mainButtons = document.querySelectorAll('.main-button, .main-button-second');
    const dropdownLinks = document.querySelectorAll('.dropdown-content a, .dropdown-content-second a, .sub-dropdown-content a');

    function setActiveButton(clickedButton) {
        dropdownLinks.forEach(link => link.classList.remove('active'));
        if (clickedButton.closest('.dropdown-content') || 
            clickedButton.closest('.dropdown-content-second') || 
            clickedButton.closest('.sub-dropdown-content')) {
            clickedButton.classList.add('active');
            mainButtons.forEach(button => button.classList.remove('active'));
        } else {
            mainButtons.forEach(button => button.classList.remove('active'));
            clickedButton.classList.add('active');
        }
    }
    [...mainButtons, ...dropdownLinks].forEach(element => {
        element.addEventListener('click', function() {
            setActiveButton(element);
        });
    });
    
    const menuLinks = document.querySelectorAll('.main-button, .main-button-second, .dropdown-content a, .dropdown-content-second a, .sub-dropdown-content a');
    menuLinks.forEach(link => {
        if (link.href === window.location.href) {
            link.classList.add('active');
        }
    });
    
    // Speciální handling pro system-introduction.html
    const introLink = document.querySelector('.dropdown-content a[href="system-introduction.html"]');
    if (introLink && window.location.pathname.includes('system-introduction.html')) {
        introLink.classList.add('active');
    }

