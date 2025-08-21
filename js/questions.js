/**
 * Systém pro správu otázek na stránce
 *
 * Vyhledává FAQ elementy při načtení stránky a nastavuje click event listenery.
 * Synchronizuje stav otázek s textem tlačítka a skryje všechny odpovědi při skrytí sekce.
 *
 * @fileoverview FAQ handler pro interaktivní otázky a odpovědi
 * @author Michaela Gažová
 * @version 2.0.0
 * @since 2025-04-03
 * @updated 2025-08-19
 * @license MIT
 */



(function () {
  document.addEventListener("DOMContentLoaded", () => {
    // requestAnimationFrame zajišťuje vykreslení před spuštěním nastavování event listenerů
    requestAnimationFrame(() => {
      const toggleQuestionsBtn = document.getElementById("toggle-questions-btn");
      const faqContainer = document.getElementById("faq-container");

      if (!toggleQuestionsBtn || !faqContainer) {
        return;
      }

      toggleQuestionsBtn.addEventListener("click", () => {
        faqContainer.classList.toggle("hidden");

        if (faqContainer.classList.contains("hidden")) {
          toggleQuestionsBtn.textContent = "Zobrazit otázky";

          // Při aktivaci tlačítka pro zavření otázek dojde k resetování všech odpovědí do zavřeného stavu
          document.querySelectorAll(".answer").forEach((answer) => {
            answer.style.display = "none";
          });
          document.querySelectorAll(".question").forEach((question) => {
            question.classList.remove("open");
          });
        } else {
          toggleQuestionsBtn.textContent = "Skrýt otázky";
        }
      });

      document.querySelectorAll(".question").forEach((question) => {
        question.addEventListener("click", () => {
          // Hledáme následující sourozenecký element jako odpověď
          const answer = question.nextElementSibling;

          if (!answer) {
            console.warn("no found answer to the question");
            return;
          }

          // Kontrolujeme současný stav viditelnosti
          const isOpen = answer.style.display === "block";

          if (isOpen) {
            answer.style.display = "none";
            question.classList.remove("open");
          } else {
            answer.style.display = "block";
            question.classList.add("open");
          }
        });
      });
    });
  });
})();