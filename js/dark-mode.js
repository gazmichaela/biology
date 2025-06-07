// VYLEPŠENÉ ŘEŠENÍ PROBLIKÁVÁNÍ - musí být první řádky v externím JS souboru
// Tento kód se spustí okamžitě bez čekání na DOM

// 1. OKAMŽITÉ nastavení před načtením čehokoli jiného
(function() {
    'use strict';
    
    // Kontrola localStorage před vytvořením CSS
    let isDarkMode = false;
    try {
        isDarkMode = localStorage.getItem('darkMode') === 'true';
    } catch (e) {
        // Fallback - zkusíme detekovat z cookie nebo system preference
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            isDarkMode = true;
        }
    }
    
    // Vytvoření kritického CSS jako string pro okamžité vložení
    const criticalCSS = `
    
        /* Základní styly pro okamžité aplikování */
        ${isDarkMode ?`
            html .dark-mode {
                background-color: #222222 !important;
                color: #c8c1b5 !important;
            }
            body .dark-mode {
                background-color: #222222 !important;
                color: #c8c1b5 !important;
            }
        ` : `
            html {
                background-color: #f0f9f0 !important;
                color: #023f1e !important;
            }
            body {
                background-color: #f0f9f0 !important;
                color: #023f1e !important;
            }
        `}
        
        /* Třída pro zobrazení po načtení */
        html.ready, body.ready {
            visibility: visible !important;
            opacity: 1 !important;
            transition: opacity 0.15s ease-in-out !important;
        }
    `;
    
    // Vložení CSS okamžitě do hlavičky
    const style = document.createElement('style');
    style.type = 'text/css';
    style.id = 'anti-flicker-css';
    
    if (style.styleSheet) {
        // IE support
        style.styleSheet.cssText = criticalCSS;
    } else {
        style.appendChild(document.createTextNode(criticalCSS));
    }
    
    // Vložení do head (nebo vytvoření head pokud neexistuje)
    const head = document.head || document.getElementsByTagName('head')[0] || document.documentElement;
    head.insertBefore(style, head.firstChild);
    
    // Nastavení tříd na html element okamžitě
    if (isDarkMode) {
        document.documentElement.className += ' dark-mode';
    }
    
})();

// 2. Načtení hlavních stylů pro tmavý režim
(function() {
    const mainDarkModeCSS = `
        /* Přechody */
        body {
            transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
        }
        
 

        body.dark-mode {
            background-color: #222222 !important;
            color: #c8c1b5 !important;
        }
        
        body.dark-mode header {
            background-color: #77afe0ee;
        }
        
        body.dark-mode article section h2 {
            background: linear-gradient(to top, #1aff1a44 10%, transparent 60%);
        }
        
        body.dark-mode article section h3 {
            text-decoration: underline #1aff1a44;
        }
        
        body.dark-mode .button,
        body.dark-mode .button-light {
            color: #e6e6e6;
        }
        
        body.dark-mode .button {
            background: #1c78e8f1;
        }
        
        body.dark-mode .button-light {
            background: #309ce5f1;
        }
        
        body.dark-mode article section a:link:not(.button) {
            color: skyblue;
        }
        
        body.dark-mode article section .citace a:visited {
            color: cornflowerblue;
        }
        
        body.dark-mode .cookies-mini-notice {
            background: black;
            border: 1px solid #585858;
        }
        
        body.dark-mode .cookies-mini-notice p {
            color: #c8c1b5;
        }
        
        body.dark-mode .cookies-mini-notice a {
            color: skyblue;
        }
        
        body.dark-mode .cookies-mini-notice button {
            background-color: #2c2c2c;
            border: 1px solid #3b3b3b;
            color: #c8c1b5;
        }
        
        body.dark-mode .cookies-mini-notice button:hover {
            background-color: #202020;
        }
        
        body.dark-mode table {
            border: 1px solid white;
        }
        
        body.dark-mode th,
        body.dark-mode td {
            border: 1px solid white;
        }
        
        body.dark-mode .tooltip .tooltiptext {
            background-color: #333;
            color: #e0deda;
        }
        
        body.dark-mode .sidebar-section {
            background: #2a2a2a;
            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
        }
        
        body.dark-mode .sidebar-title {
            color: #64b5f6;
            border-bottom-color: #64b5f6;
        }
        
        body.dark-mode .countdown {
            color: #64b5f6;
        }
        
        body.dark-mode .article-card {
            background: #2a2a2a;
            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
        }
        
        .dark-mode-toggle {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 50px;
            height: 50px;
            border-radius: 8px;
            border: none;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
            transition: all 0.3s ease;
            z-index: 1000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            background: white;
        }
        
        body.dark-mode .dark-mode-toggle {
            background: black;
            box-shadow: 0 4px 12px rgba(0,0,0,0.5);
        }
        
        body.dark-mode .question {
            background-color: #333131;
            border: 1px solid #505050;
        }
        
        body.dark-mode .answer {
            background-color: #2b2c2b;
        }
        
        body.dark-mode #toggle-questions-btn {
            background-color: #309ce5f1;
            color: #e6e6e6;
        }
            
    `;
    
    const mainStyle = document.createElement('style');
    mainStyle.appendChild(document.createTextNode(mainDarkModeCSS));
    document.head.appendChild(mainStyle);
})();

// 3. Funkce pro zobrazení stránky
function showPage() {
    // Odstranění anti-flicker CSS a zobrazení stránky
    document.documentElement.classList.add('ready');
    document.body.classList.add('ready');
    
    // Volitelně - odstranění anti-flicker stylů po krátké době
    setTimeout(() => {
        const antiFlickerStyle = document.getElementById('anti-flicker-css');
        if (antiFlickerStyle) {
            antiFlickerStyle.remove();
        }
    }, 200);
}

// 4. Hlavní inicializace - spustí se co nejdříve
function initializeEarly() {
    // Kontrola a aplikace tmavého režimu
    let isDarkMode = false;
    try {
        isDarkMode = localStorage.getItem('darkMode') === 'true';
    } catch (e) {
        // Fallback
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            isDarkMode = true;
        }
    }
    
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        document.documentElement.classList.add('dark-mode');
    }
    
    // Zobrazení stránky
    showPage();
    
}


// 5. Spuštění inicializace - vícenásobná detekce pro zajištění rychlého spuštění
if (document.readyState === 'loading') {
    // DOM se ještě načítá
    document.addEventListener('DOMContentLoaded', initializeEarly);
} else {
    // DOM je už načten
    initializeEarly();
}

// Další listener pro případ, že by první nevypálil
document.addEventListener('DOMContentLoaded', function() {
    // Double-check pro zobrazení
    if (!document.documentElement.classList.contains('ready')) {
        showPage();
    }
});

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
    return `
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
        </svg>
    `;
}

//-------DARK MODE FUNCTIONALITY---------//

// Inicializace proměnných
let isClickOpened = false;
let positionMonitoringInterval = null;
let inactivityTimer = null;

// Funkce pro monitorování pozice (kontinuální sledování)
function startPositionMonitoring() {
    if (positionMonitoringInterval) {
        clearInterval(positionMonitoringInterval);
    }
    
    positionMonitoringInterval = setInterval(() => {
        // Zde můžete přidat logiku pro sledování pozice myši nebo menu
    }, 100);
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
    if (inactivityTimer) {
        clearTimeout(inactivityTimer);
    }
    
    inactivityTimer = setTimeout(() => {
        if (isClickOpened) {
            isClickOpened = false;
            stopPositionMonitoring();
            console.log('Menu zavřeno kvůli neaktivitě');
        }
    }, 5000);
}

// Funkce pro zastavení časovače neaktivity
function stopInactivityTimer() {
    if (inactivityTimer) {
        clearTimeout(inactivityTimer);
        inactivityTimer = null;
    }
}

// Inicializace tmavého režimu při načtení DOM
function initializeDarkMode() {
    const darkModeToggle = document.getElementById('darkModeToggle');
    const body = document.body;

    if (!darkModeToggle) return;

    // Nastavení ikony podle aktuálního stavu
    if (body.classList.contains('dark-mode')) {
        darkModeToggle.innerHTML = createMoonIcon();
    } else {
        darkModeToggle.innerHTML = createSunIcon();
    }

    // Přepínač tmavého režimu
    
    darkModeToggle.addEventListener('click', () => {
        body.classList.toggle('dark-mode');
        const isDark = body.classList.contains('dark-mode');
        
        // Aplikace na html element také
        if (isDark) {
            document.documentElement.classList.add('dark-mode');
        } else {
            document.documentElement.classList.remove('dark-mode');
        }
        
      // Uložení preference
try {
    localStorage.setItem('darkMode', isDark);
    document.cookie = `darkMode=${isDark};path=/;max-age=31536000`; // PŘIDEJ TENTO ŘÁDEK
} catch (e) {
    console.warn('Nepodařilo se uložit preferenci tmavého režimu');
}
        
        // Animace ikony
        const currentIcon = darkModeToggle.querySelector('.sun-icon, svg');
        
        if (currentIcon) {
            currentIcon.style.transform = 'translateY(10px)';
            currentIcon.style.opacity = '0';
            currentIcon.style.transition = 'all 0.25s ease';
            
            setTimeout(() => {
                darkModeToggle.innerHTML = isDark ? createMoonIcon() : createSunIcon();
                
                const newIcon = darkModeToggle.querySelector('.sun-icon, svg');
                if (newIcon) {
                    newIcon.style.transform = 'translateY(-10px)';
                    newIcon.style.opacity = '0';
                    newIcon.style.transition = 'all 0.25s ease';
                    
                    setTimeout(() => {
                        newIcon.style.transform = 'translateY(0)';
                        newIcon.style.opacity = '1';
                    }, 50);
                }
            }, 150);
        }
    });
}

// Odpočítávání
function updateCountdown() {
    const countdownElement = document.getElementById('countdown');
    if (!countdownElement) return;
    
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

// Plynulé scrollování
function initializeSmoothScroll() {
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
}

// Animace při načtení stránky
function initializeLoadAnimations() {
    document.querySelectorAll('.main-article, .sidebar-section, .article-card').forEach((element, index) => {
        if (element) {
            element.style.opacity = '0';
            element.style.transform = 'translateY(20px)';
            setTimeout(() => {
                element.style.transition = 'all 0.6s ease';
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }, index * 100);
        }
    });
}

// Hlavní inicializace při načtení DOM
document.addEventListener('DOMContentLoaded', function() {
    initializeDarkMode();
    initializeSmoothScroll();
    
    if (document.getElementById('countdown')) {
        setInterval(updateCountdown, 1000);
        updateCountdown();
    }
});

// Animace při načtení stránky
window.addEventListener('load', function() {
    initializeLoadAnimations();
    
    setTimeout(function() {
        if (!isClickOpened) {
            try {
                localStorage.removeItem('isFirstMenuOpen');
                localStorage.removeItem('isMouseOverFirstToggle');
            } catch (e) {
                // Ignored
            }
        }
    }, 5000);
});

