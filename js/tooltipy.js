document.addEventListener('DOMContentLoaded', function() {
    const tooltipTexts = document.querySelectorAll('.tooltip .tooltiptext');
    
    tooltipTexts.forEach(function(tooltipText) {
        // Zrušíme animaci visibilityTooltext která způsobuje probliknutí
        tooltipText.style.animation = 'none';
        // Odstraníme delay z transition pro okamžité zobrazení
        tooltipText.style.transition = 'opacity 0.3s ease';
    });
});