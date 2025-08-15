/**
 * Systém pro správu procvičovacích otázek na stránce 
 * 
 * Poskytuje plnou funkcionalitu pro ovládání FAQ sekce včetně
 zobrazování/skrývání všech otázek a jednotlivých odpovědí 
 * 
 * Klíčové funkce: 
 * • Přepínání viditelnosti celé FAQ sekce jedním tlačítkem
 * • Individuální rozbalování/sbalování otázek s odpověďmi
 * • Automatické zavření a skrytí všech otázek při kliknutí na tlačítko "Skrýt otázky"
 * • Error handling a validace DOM elementů
 * 
 * @author Michaela Gažová
 * @version 1.2.0
 * @license MIT
 */


 
try {
    const toggleQuestionsBtn = document.getElementById('toggle-questions-btn');
    const faqContainer = document.getElementById('faq-container');
    
    if (toggleQuestionsBtn && faqContainer) {
        toggleQuestionsBtn.addEventListener('click', () => {
            faqContainer.classList.toggle('hidden');
            
            if (faqContainer.classList.contains('hidden')) {
                toggleQuestionsBtn.textContent = 'Zobrazit otázky';
                
                // Reset otázek při zavření  
                document.querySelectorAll('.answer').forEach(answer => {
                    answer.style.display = 'none';
                });
                
                document.querySelectorAll('.question').forEach(question => {
                    question.classList.remove('open');
                });
            } else {
                toggleQuestionsBtn.textContent = 'Skrýt otázky';
            }
        });
        
        // Otevření/zavření jednotlivých otázek
        document.querySelectorAll('.question').forEach(question => {
            question.addEventListener('click', () => {
                const answer = question.nextElementSibling;
                
                if (!answer) {
                    console.warn('Answer not found for question');
                    return;
                }

                const isOpen = answer.style.display === 'block';
                
                if (isOpen) {
                    answer.style.display = 'none';
                    question.classList.remove('open');
                } else {
                    answer.style.display = 'block';
                    question.classList.add('open');
                }
            });
        });
    }
} catch (error) {
    console.error('FAQ initialization failed:', error);
}