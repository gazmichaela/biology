/**
 * Inicializace a optimalizace tooltip systému
 *
 * Vyhledává všechny tooltip elementy při načtení stránky a nastavuje jejich chování.
 * Odstraňuje výchozí CSS animace a aplikuje plynulé opacity přechody.
 *
 * @fileoverview Jednoduchý tooltip handler s CSS optimalizací
 * @author Michaela Gažová
 * @version 2.1.0
 * @since 2025-07-24
 * @updated 2025-08-18
 * @license MIT
 */



// Zabránění problikávání tooltipů
(function () {
  const initTooltips = () => {
    const tooltipTexts = document.querySelectorAll(".tooltip .tooltiptext");

    if (!tooltipTexts.length) {
      console.warn("Tooltip: no tooltips found");
      return;
    }

    tooltipTexts.forEach((el) => {
      // Nastavení záložní CSS animace
      el.style.animation = "none";
      el.style.transition = "opacity 0.3s ease";

      el.classList.add("tooltiptext--ready");
    });
  };

  // Načtení DOM před inicializací tooltipů
  document.addEventListener("DOMContentLoaded", () => {
    requestAnimationFrame(() => {
      initTooltips();
    });
  });
})();