/**
 * Zobrazení focus-outline pouze při navigaci klávesnicí
 *
 * Sleduje způsob ovládání stránky a přidává nebo odebírá třídu "using-mouse" na elementu body.
 * Třída slouží k řízení viditelnosti focus-outline v CSS stylech.
 *
 * @fileoverview Správa viditelnosti focus-outline podle způsobu ovládání
 * @author Michaela Gažová
 * @version 1.2.1
 * @since 2026-02-28
 * @updated 2026-03-15
 * @license MIT
 */



// Zobrazení focus-outline pouze při navigaci klávesnicí
(function () {
  const initFocusOutline = () => {
    // Zabránění vícenásobné inicializaci
    if (document.body.dataset.mouseKeyboardTracking) {
      console.warn("FocusOutline: already initialized");
      return;
    }

    document.body.dataset.mouseKeyboardTracking = "true";

    // Přidání třídy "using-mouse" pro řízení viditelnosti focus-outline v CSS
    document.addEventListener("mousedown", () => {
      document.body.classList.add("using-mouse");
    });

    document.addEventListener("keydown", () => {
      document.body.classList.remove("using-mouse");
    });
  };

  document.addEventListener("DOMContentLoaded", () => {
    initFocusOutline();
  });
})();

/* (tento script používá formátování prettier) */