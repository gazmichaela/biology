//---------COOKIES FUNCIONALITY--------------//

document.addEventListener('DOMContentLoaded', function() {
    // Kontrola, zda již bylo oznámení potvrzeno
    if(!localStorage.getItem('cookiesAccepted')) {
        // Pokud ne, zobrazit oznámení po 1 sekundě
        setTimeout(function() {
            const cookiesNotice = document.getElementById('cookiesMiniNotice');
            if (cookiesNotice) {
                cookiesNotice.classList.add('show');
            }
        }, 1000);
    }
    
    // Posluchač události na tlačítko
    const acceptButton = document.getElementById('acceptCookies');
    if (acceptButton) {
        acceptButton.addEventListener('click', function() {
            // Skrýt oznámení
            const cookiesNotice = document.getElementById('cookiesMiniNotice');
            if (cookiesNotice) {
                cookiesNotice.classList.remove('show');
            }
            // Uložit nastavení do localStorage
            localStorage.setItem('cookiesAccepted', 'true');
        });
    }
});
