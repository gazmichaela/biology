/**
 * Inicializace a optimalizace tooltip systému
 *
 * Vyhledává všechny tooltip elementy při načtení stránky a nastavuje jejich chování.
 * Odstraňuje výchozí CSS animace a aplikuje plynulé opacity přechody.
 *
 * @fileoverview Jednoduchý tooltip handler s CSS optimalizací
 * @author Michaela Gažová
 * @version 2.2.0
 * @since 2025-07-24
 * @updated 2026-03-30
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

  // Responzivní umístění tooltipů
  document.addEventListener("mouseover", function (e) {
    if (e.target.closest(".tooltip")) {
      const tooltip = e.target.closest(".tooltip");
      const tooltipText = tooltip.querySelector(".tooltiptext");

      if (tooltipText) {
        if (window.innerWidth > 768) {
          tooltipText.style.left = "50%";
          tooltipText.style.transform = "translateX(-50%)";

          requestAnimationFrame(() => {
            const rect = tooltipText.getBoundingClientRect();
            const clientWidth = document.documentElement.clientWidth;

            if (rect.right > clientWidth - 10) {
              const overflow = rect.right - clientWidth + 10;
              tooltipText.style.transform = `translateX(calc(-50% - ${overflow}px))`;
            } else if (rect.left < 10) {
              const overflow = 10 - rect.left;
              tooltipText.style.transform = `translateX(calc(-50% + ${overflow}px))`;
            }
          });
          return;
        }
        tooltipText.style.transition = "none !important";
        tooltipText.style.left = "0";
        tooltipText.style.transform = "translateX(0)";

        const rect = tooltipText.getBoundingClientRect();
        if (rect.right > document.documentElement.clientWidth) {
          const overflow =
            rect.right - document.documentElement.clientWidth + 10;
          tooltipText.style.transform = `translateX(-${overflow}px)`;
        }

        setTimeout(() => {
          tooltipText.style.transition = "";
        }, 10);
      }
    }
  });
})();

/* (tento script používá formátování prettier) */