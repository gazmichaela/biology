/**
 * Úprava chování tooltipů
 * 
 * Zajišťuje plynulé zobrazení tooltipů odstraněním animací,  
 a nastavením optimalizovaných CSS přechodů.
 * 
 * Ostatní funkcionalita (zobrazování, pozicování) je řešena v CSS.
 * 
 * Klíčové funkce:
 * • Vyhledání všech tooltip textů na stránce
 * • Deaktivace rušivých CSS animací
 * • Nastavení plynulých opacity přechodů 
 * 
 * @author Michaela Gažová
 * @version 1.0.0
 * @license MIT
 */


 
// Zabránění problikávání tooltipů 
document.addEventListener('DOMContentLoaded', () => {
    try {
        const tooltipTexts = document.querySelectorAll('.tooltip .tooltiptext');

        if (tooltipTexts.length === 0) {
            console.warn('No tooltip elements found');
            return;
        }

        // Plynulé přechody místo animací
        tooltipTexts.forEach((tooltipText) => {
            if (tooltipText) {
                tooltipText.style.animation = 'none';
                tooltipText.style.transition = 'opacity 0.3s ease';
            }
        });

    } catch (error) {
        console.error('Tooltip initialization failed:', error);
    }
});