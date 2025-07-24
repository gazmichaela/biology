document.addEventListener('DOMContentLoaded', function() {
    if(!localStorage.getItem('cookiesAccepted')) {
        // Delay zobrazení cookie lišty
        setTimeout(function() {
            const cookiesNotice = document.getElementById('cookiesMiniNotice');
            if (cookiesNotice) {
                cookiesNotice.classList.add('show');
            }
        }, 1000);
    }
    const acceptButton = document.getElementById('acceptCookies');
    if (acceptButton) {
        acceptButton.addEventListener('click', function() {
            const cookiesNotice = document.getElementById('cookiesMiniNotice');
            if (cookiesNotice) {
                cookiesNotice.classList.remove('show');
            }
            localStorage.setItem('cookiesAccepted', 'true');
        });
    }
});
