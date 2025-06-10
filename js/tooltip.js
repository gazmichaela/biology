function adjustTooltipPosition() {
    const tooltips = document.querySelectorAll('.tooltip');
    
    tooltips.forEach(tooltip => {
        const tooltipText = tooltip.querySelector('.tooltiptext');
        if (!tooltipText) return;
        
        let isPersistent = false;
        let hoverCount = 0;
        let hoverTimer = null;
        
        tooltip.addEventListener('mouseenter', function() {
            hoverCount++;
            
            // Při druhém najetí udělej tooltip persistent
            if (hoverCount === 2) {
                isPersistent = true;
                tooltipText.style.pointerEvents = 'auto';
                // Vynucuj zobrazení tooltip i při persistent módu
                tooltipText.style.visibility = 'visible';
                tooltipText.style.opacity = '1';
                hoverCount = 0; // Reset po aktivaci
            }
            
            // Reset počítadla po 800ms (čas na druhé najetí)
            clearTimeout(hoverTimer);
            hoverTimer = setTimeout(() => {
                hoverCount = 0;
            }, 800);
            
            // Resetuj na původní pozici
            tooltipText.style.left = '0';
            tooltipText.style.right = 'auto';
            tooltipText.style.maxWidth = '200px';
            tooltipText.style.transform = 'none';
            
            // Krátké timeout aby se tooltip zobrazil a mohli jsme změřit rozměry
            setTimeout(() => {
                const rect = tooltipText.getBoundingClientRect();
                const viewportWidth = window.innerWidth;
                const padding = 10;
                
                // Zkontroluj přetečení vpravo
                if (rect.right > viewportWidth - padding) {
                    const overflow = rect.right - (viewportWidth - padding);
                    const currentLeft = parseInt(tooltipText.style.left) || 0;
                    tooltipText.style.left = `${currentLeft - overflow}px`;
                }
                
                // Zkontroluj přetečení vlevo
                const newRect = tooltipText.getBoundingClientRect();
                if (newRect.left < padding) {
                    tooltipText.style.left = `${padding - rect.left}px`;
                    tooltipText.style.transform = 'none';
                }
                
                // Na malých obrazovkách omezte šířku
                if (viewportWidth < 768) {
                    const maxWidth = Math.min(200, viewportWidth - (padding * 2));
                    tooltipText.style.maxWidth = `${maxWidth}px`;
                    tooltipText.style.whiteSpace = 'normal';
                    tooltipText.style.wordWrap = 'break-word';
                }
            }, 10);
        });
        
        tooltip.addEventListener('mouseleave', function() {
            // Pokud není persistent, tooltip zmizí normálně
            if (!isPersistent) return;
            
            // Pro persistent tooltip - NEZAKAZUJ zobrazení
            // Tooltip zůstane viditelný dokud jsme na slově
        });
        
        // Event listener pro tooltip samotný
        tooltipText.addEventListener('mouseleave', function() {
            if (isPersistent) {
                // Zkontroluj jestli myš není stále nad původním elementem
                setTimeout(() => {
                    if (!tooltip.matches(':hover')) {
                        isPersistent = false;
                        tooltipText.style.pointerEvents = '';
                        // Povol CSS aby tooltip zmizel
                        tooltipText.style.visibility = '';
                        tooltipText.style.opacity = '';
                    }
                }, 50);
            }
        });
        
        // Přidej event listener pro kliknutí mimo tooltip pro jeho zavření
        document.addEventListener('click', function(e) {
            if (isPersistent && !tooltip.contains(e.target) && !tooltipText.contains(e.target)) {
                isPersistent = false;
                tooltipText.style.pointerEvents = '';
                tooltipText.style.visibility = '';
                tooltipText.style.opacity = '';
            }
        });
    });
}

// Spusť po načtení DOM
document.addEventListener('DOMContentLoaded', adjustTooltipPosition);

// Znovu nastav při změně velikosti okna
window.addEventListener('resize', () => {
    // Debounce pro optimalizaci
    clearTimeout(window.tooltipResizeTimeout);
    window.tooltipResizeTimeout = setTimeout(adjustTooltipPosition, 250);
});