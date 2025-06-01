// Funkce pro vytvoření ikony slunce
function createSunIcon() {
    return `
        <div class="sun-icon">
            <div class="sun"></div>
            <div class="ray"></div>
            <div class="ray"></div>
            <div class="ray"></div>
            <div class="ray"></div>
            <div class="ray"></div>
            <div class="ray"></div>
            <div class="ray"></div>
            <div class="ray"></div>
        </div>
    `;
}

// Funkce pro vytvoření ikony měsíce
function createMoonIcon() {
    return '<div class="moon-icon"></div>';
}

//-------DARK MODE FUNCIONALITY---------//

// Inicializace proměnných
let isClickOpened = false;
let positionMonitoringInterval = null;
let inactivityTimer = null;

// Funkce pro monitorování pozice (kontinuální sledování)
function startPositionMonitoring() {
    // Zastavíme předchozí monitorování, pokud běží
    if (positionMonitoringInterval) {
        clearInterval(positionMonitoringInterval);
    }
    
    positionMonitoringInterval = setInterval(() => {
        // Zde můžete přidat logiku pro sledování pozice myši nebo menu
        // Například kontrola, jestli je myš stále v oblasti menu
        // console.log('Monitoring position...'); // Odebráno pro čistší console
    }, 100); // Kontrola každých 100ms
}

// Funkce pro zastavení monitorování pozice
function stopPositionMonitoring() {
    if (positionMonitoringInterval) {
        clearInterval(positionMonitoringInterval);
        positionMonitoringInterval = null;
    }
}

// Funkce pro spuštění časovače neaktivity
function startInactivityTimer() {
    // Zastavíme předchozí timer, pokud běží
    if (inactivityTimer) {
        clearTimeout(inactivityTimer);
    }
    
    inactivityTimer = setTimeout(() => {
        // Po určité době neaktivity zavřeme menu
        if (isClickOpened) {
            isClickOpened = false;
            localStorage.removeItem('isFirstMenuOpen');
            stopPositionMonitoring();
            console.log('Menu zavřeno kvůli neaktivitě');
        }
    }, 5000); // 5 sekund neaktivity
}

// Funkce pro zastavení časovače neaktivity
function stopInactivityTimer() {
    if (inactivityTimer) {
        clearTimeout(inactivityTimer);
        inactivityTimer = null;
    }
}

// Funkce pro vytvoření ikony slunce (vaše původní, ale s cross-browser CSS)
function createSunIcon() {
    return `
        <div class="sun-icon">
            <div class="sun"></div>
            <div class="ray"></div>
            <div class="ray"></div>
            <div class="ray"></div>
            <div class="ray"></div>
            <div class="ray"></div>
            <div class="ray"></div>
            <div class="ray"></div>
            <div class="ray"></div>
        </div>
    `;
}

// Funkce pro vytvoření ikony měsíce
function createMoonIcon() {
    return `
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
        </svg>
    `;
}

// Funkce pro tmavý režim
const darkModeToggle = document.getElementById('darkModeToggle');
const body = document.body;

// Zkontrolujeme, jestli element existuje
if (darkModeToggle) {
    // Přidáme plynulou animaci pro změnu pozadí a barev
    body.style.transition = 'background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease';
    
    // Kontrola uložené preference
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    if (isDarkMode) {
        body.classList.add('dark-mode');
        darkModeToggle.innerHTML = createMoonIcon(); // Měsíc v tmavém režimu
    } else {
        darkModeToggle.innerHTML = createSunIcon(); // Slunce ve světlém režimu
    }

    // Přepínač tmavého režimu s animací posunu pouze ikon
    darkModeToggle.addEventListener('click', () => {
        body.classList.toggle('dark-mode');
        const isDark = body.classList.contains('dark-mode');
        
        // Uložení preference
        localStorage.setItem('darkMode', isDark);
        
        // Najdeme ikonu uvnitř tlačítka
        const currentIcon = darkModeToggle.querySelector('.sun-icon, svg');
        
        if (currentIcon) {
            // Animace - posun současné ikony dolů (jen 10px)
            currentIcon.style.transform = 'translateY(10px)';
            currentIcon.style.opacity = '0';
            currentIcon.style.transition = 'all 0.25s ease';
            
            setTimeout(() => {
                // Změna ikony s logickou návazností
                if (isDark) {
                    // Tmavý režim = zobrazit měsíc
                    darkModeToggle.innerHTML = createMoonIcon();
                } else {
                    // Světlý režim = zobrazit slunce
                    darkModeToggle.innerHTML = createSunIcon();
                }
                
                // Najdeme novou ikonu
                const newIcon = darkModeToggle.querySelector('.sun-icon, svg');
                
                if (newIcon) {
                    // Nastavíme novou ikonu mimo obrazovku (nahoře, jen -10px)
                    newIcon.style.transform = 'translateY(-10px)';
                    newIcon.style.opacity = '0';
                    newIcon.style.transition = 'all 0.25s ease';
                    
                    // Malá pauza a pak animace příchodu nové ikony
                    setTimeout(() => {
                        newIcon.style.transform = 'translateY(0)';
                        newIcon.style.opacity = '1';
                    }, 50);
                }
                
            }, 150); // Polovina animace
        }
    });
}

// Odpočítávání - pouze pokud element existuje
function updateCountdown() {
    const countdownElement = document.getElementById('countdown');
    if (!countdownElement) return; // Ukončí funkci, pokud element neexistuje
    
    const now = new Date().getTime();
    const launchTime = new Date('2025-05-28T01:15:00').getTime();
    const timeLeft = launchTime - now;
    
    if (timeLeft > 0) {
        const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
        
        countdownElement.textContent = 
            String(days).padStart(2, '0') + ':' +
            String(hours).padStart(2, '0') + ':' +
            String(minutes).padStart(2, '0') + ':' +
            String(seconds).padStart(2, '0');
    } else {
        countdownElement.textContent = 'SPUŠTĚNO!';
    }
}

// Aktualizace odpočítávání každou sekundu - pouze pokud element existuje
if (document.getElementById('countdown')) {
    setInterval(updateCountdown, 1000);
    updateCountdown();
}

// Plynulé scrollování
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// Animace při načtení stránky
window.addEventListener('load', () => {
    document.querySelectorAll('.main-article, .sidebar-section, .article-card').forEach((element, index) => {
        if (element) { // Kontrola existence elementu
            element.style.opacity = '0';
            element.style.transform = 'translateY(20px)';
            setTimeout(() => {
                element.style.transition = 'all 0.6s ease';
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }, index * 100);
        }
    });
    
    // NOVÉ: Vyčištění starých stavů při načtení stránky (prevence chyb)
    // Po 5 sekundách vyčistíme všechny stavy, aby nedošlo k chybám
    setTimeout(function() {
        if (!isClickOpened) {
            localStorage.removeItem('isFirstMenuOpen');
        }
        localStorage.removeItem('isMouseOverFirstToggle');
    }, 5000);
});