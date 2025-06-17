function adjustTooltip(tooltipElement) {
    const tooltipText = tooltipElement.querySelector('.tooltiptext');
    if (!tooltipText) return;
    
    // Dočasně zobraz tooltip pro měření
    tooltipText.style.visibility = 'visible';
    tooltipText.style.opacity = '1';
    
    // Získej rozměry
    const rect = tooltipText.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Reset pozice
    tooltipText.style.left = '0';
    tooltipText.style.transform = 'none';
    tooltipText.style.bottom = '110%';
    tooltipText.style.top = 'auto';
    tooltipText.style.right = 'auto';
    
    // Znovu získej rozměry po resetu
    const newRect = tooltipText.getBoundingClientRect();
    
    // Kontrola horizontální pozice
    if (newRect.left < 0) {
        // Tooltip je moc vlevo - posuň doprava
        tooltipText.style.left = '0';
    } else if (newRect.right > viewportWidth) {
        // Tooltip je moc vpravo - posuň doleva
        const overflow = newRect.right - viewportWidth;
        tooltipText.style.left = `-${overflow + 10}px`;
    }
    
    // Kontrola vertikální pozice
    if (newRect.top < 0) {
        // Tooltip je moc nahoře - přesuň dolu
        tooltipText.style.bottom = 'auto';
        tooltipText.style.top = '110%';
    }
    
    // Skryj tooltip zpět
    tooltipText.style.visibility = '';
    tooltipText.style.opacity = '';
}

// Přidej event listenery - pouze na mobilních zařízeních
document.addEventListener('DOMContentLoaded', function() {
    // Detekce mobilního zařízení
    const isMobile = window.innerWidth <= 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (!isMobile) return; // Na desktopu nedělej nic
    
    const tooltips = document.querySelectorAll('.tooltip');
    
    tooltips.forEach(tooltip => {
        tooltip.addEventListener('mouseenter', function() {
            setTimeout(() => {
                adjustTooltip(this);
            }, 10);
        });
    });
    
    // Přizpůsob při resize okna - pouze na mobilu
    window.addEventListener('resize', function() {
        const isMobileNow = window.innerWidth <= 768;
        if (!isMobileNow) return;
        
        tooltips.forEach(tooltip => {
            if (tooltip.matches(':hover')) {
                adjustTooltip(tooltip);
            }
        });
    });
});