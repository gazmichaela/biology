//-----------DARK MODE FUNCIONALITY-------------//

// 1. OKAMŽITÉ nastavení před načtením čehokoli jiného
(function() {
    'use strict';
    
    // Kontrola localStorage před vytvořením CSS
    let isDarkMode = false;
    let hasUserPreference = false;
    
    try {
        const storedPreference = localStorage.getItem('darkMode');
        if (storedPreference !== null) {
            // Uživatel už má uloženou preferenci
            isDarkMode = storedPreference === 'true';
            hasUserPreference = true;
        }
    } catch (e) {
        // localStorage není dostupný
        console.warn('localStorage není dostupný:', e);
    }
    
    // Pokud uživatel nemá uloženou preferenci, použij systémovou
    if (!hasUserPreference) {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            isDarkMode = true;
            console.log('Aplikace systémové preference: tmavý režim');
        } else {
            isDarkMode = false;
            console.log('Aplikace systémové preference: světlý režim');
        }
    } else {
        console.log('Aplikace uživatelské preference:', isDarkMode ? 'tmavý režim' : 'světlý režim');
    }
    
    // Uložení informace o tom, zda byla použita systémová preference
    window.isUsingSystemPreference = !hasUserPreference;
    
    // Vytvoření kritického CSS jako string pro okamžité vložení
    const criticalCSS = `
    
        /* Základní styly pro okamžité aplikování */
        ${isDarkMode ?`
            html.dark-mode {
                background-color: #222222 !important;
                color: #c8c1b5 !important;
            }
            body.dark-mode {
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
        
        .dark-mode-toggle {
            position: fixed !important;
            bottom: 20px !important;
            right: 20px !important;
            width: 50px !important;
            height: 50px !important;
            border-radius: 8px !important;
            border: none !important;
            cursor: pointer !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            font-size: 1.5rem !important;
            z-index: 1000 !important;
            transition: none !important;
            ${isDarkMode ? `
                background: black !important;
                box-shadow: 0 4px 12px rgba(0,0,0,0.5) !important;
            ` : `
                background: white !important;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3) !important;
            `}
        }
        
       
        html.dark-mode .dark-mode-toggle,
        body.dark-mode .dark-mode-toggle,
        .dark-mode .dark-mode-toggle {
            background: black !important;
            box-shadow: 0 4px 12px rgba(0,0,0,0.5) !important;
        }
       
@media (max-width: 768px) {
    .dark-mode-toggle {
        width: 40px !important;
        height: 40px !important;
        bottom: 15px !important;
        right: 15px !important;
        font-size: 1.2rem !important;
    }
}

@media (max-width: 480px) {
    .dark-mode-toggle {
        width: 35px !important;
        height: 35px !important;
        bottom: 10px !important;
        right: 10px !important;
        font-size: 1rem !important;
    }
}
   
     
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
    
    // OKAMŽITÉ vytvoření tlačítka s odpovídající ikonou
    window.createToggleButtonEarly = function() {
        const existingButton = document.getElementById('darkModeToggle');
        if (existingButton) return; // Již existuje
        
        const button = document.createElement('button');
        button.id = 'darkModeToggle';
        button.className = 'dark-mode-toggle';
        
        // Přidání tooltip pro lepší UX
        button.title = isDarkMode ? 'Přepnout na světlý režim' : 'Přepnout na tmavý režim';
        
        // Nastavení správného stylu okamžitě podle režimu
        if (isDarkMode) {
            button.style.background = 'black';
            button.style.boxShadow = '0 4px 12px rgba(0,0,0,0.5)';
            button.innerHTML = createMoonIcon();
        } else {
            button.style.background = 'white';
            button.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
            button.innerHTML = createSunIcon();
        }
        
        // Vložení tlačítka okamžitě do body (pokud existuje) nebo do documentElement
        const container = document.body || document.documentElement;
        container.appendChild(button);
        
        // Přidání transition až po malé chvíli
        setTimeout(() => {
            button.classList.add('loaded');
        }, 100);
        
        return button;
    };
    
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
        
        body.dark-mode article section a:link:not(.button):not(.sidemap a) {
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
            border: 2px solid #c8c1b5;
        }
        
        body.dark-mode th,
        body.dark-mode td {
            border: 1px solid #c8c1b5;
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
        
        /* ODSTRANĚNÍ základního stylu tlačítka - už je v kritickém CSS */
        /* Tmavý režim pro tlačítko - musí být zde s !important */
        body.dark-mode .dark-mode-toggle {
            background: black !important;
            box-shadow: 0 4px 12px rgba(0,0,0,0.5) !important;
        }
            
    `;
    
    const mainStyle = document.createElement('style');
    mainStyle.appendChild(document.createTextNode(mainDarkModeCSS));
    document.head.appendChild(mainStyle);
})();

// 3. Listener pro změny systémových preferencí
(function() {
    if (window.matchMedia) {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        
        // Funkce pro reakci na změnu systémových preferencí
        function handleSystemPreferenceChange(e) {
            // Pouze reaguj na změnu, pokud uživatel nemá vlastní preferenci
            if (window.isUsingSystemPreference) {
                const shouldBeDark = e.matches;
                const body = document.body;
                const currentlyDark = body.classList.contains('dark-mode');
                
                if (shouldBeDark !== currentlyDark) {
                    console.log('Změna systémové preference na:', shouldBeDark ? 'tmavý režim' : 'světlý režim');
                    
                    // Aplikuj změnu
                    if (shouldBeDark) {
                        body.classList.add('dark-mode');
                        document.documentElement.classList.add('dark-mode');
                    } else {
                        body.classList.remove('dark-mode');
                        document.documentElement.classList.remove('dark-mode');
                    }
                    
                    // Aktualizuj ikonu tlačítka
                    const toggle = document.getElementById('darkModeToggle');
                    if (toggle) {
                        toggle.innerHTML = shouldBeDark ? createMoonIcon() : createSunIcon();
                        toggle.title = shouldBeDark ? 'Přepnout na světlý režim' : 'Přepnout na tmavý režim';
                    }
                }
            }
        }
        
        // Přidání listeneru pro změny
        if (mediaQuery.addEventListener) {
            mediaQuery.addEventListener('change', handleSystemPreferenceChange);
        } else {
            // Fallback pro starší prohlížeče
            mediaQuery.addListener(handleSystemPreferenceChange);
        }
    }
})();

// 4. Funkce pro zobrazení stránky
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

// 5. Hlavní inicializace - spustí se co nejdříve
function initializeEarly() {
    // Kontrola a aplikace tmavého režimu
    let isDarkMode = false;
    let hasUserPreference = false;
    
    try {
        const storedPreference = localStorage.getItem('darkMode');
        if (storedPreference !== null) {
            isDarkMode = storedPreference === 'true';
            hasUserPreference = true;
        }
    } catch (e) {
        // Fallback
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            isDarkMode = true;
        }
    }
    
    if (!hasUserPreference && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        isDarkMode = true;
    }
    
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        document.documentElement.classList.add('dark-mode');
    }
    
    // Vytvoření tlačítka co nejdříve
    if (window.createToggleButtonEarly) {
        window.createToggleButtonEarly();
    }
    
    // Zobrazení stránky
    showPage();
}

// 6. Spuštění inicializace - vícenásobná detekce pro zajištění rychlého spuštění
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
    
    // Double-check pro tlačítko
    if (!document.getElementById('darkModeToggle') && window.createToggleButtonEarly) {
        window.createToggleButtonEarly();
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
    let darkModeToggle = document.getElementById('darkModeToggle');
    
    // Pokud tlačítko neexistuje, vytvoříme ho
    if (!darkModeToggle && window.createToggleButtonEarly) {
        darkModeToggle = window.createToggleButtonEarly();
    }
    
    if (!darkModeToggle) return;

    const body = document.body;

    // Nastavení ikony podle aktuálního stavu (pokud ještě není nastavena)
    if (!darkModeToggle.innerHTML.trim()) {
        if (body.classList.contains('dark-mode')) {
            darkModeToggle.innerHTML = createMoonIcon();
        } else {
            darkModeToggle.innerHTML = createSunIcon();
        }
    }

    // Přepínač tmavého režimu - pouze pokud již není event listener nastaven
    if (!darkModeToggle.hasAttribute('data-listener-added')) {
        darkModeToggle.setAttribute('data-listener-added', 'true');
        
        darkModeToggle.addEventListener('click', () => {
            body.classList.toggle('dark-mode');
            const isDark = body.classList.contains('dark-mode');
            
            // Aplikace na html element také
            if (isDark) {
                document.documentElement.classList.add('dark-mode');
            } else {
                document.documentElement.classList.remove('dark-mode');
            }
            
            // Uložení preference - tímto se uživatel "odpojí" od systémových preferencí
            try {
                localStorage.setItem('darkMode', isDark);
                document.cookie = `darkMode=${isDark};path=/;max-age=31536000`;
                // Označení, že uživatel má vlastní preferenci
                window.isUsingSystemPreference = false;
                console.log('Uložena uživatelská preference:', isDark ? 'tmavý režim' : 'světlý režim');
            } catch (e) {
                console.warn('Nepodařilo se uložit preferenci tmavého režimu');
            }
            
            // Aktualizace tooltip
            darkModeToggle.title = isDark ? 'Přepnout na světlý režim' : 'Přepnout na tmavý režim';
            
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
                
            }
        }
    }, 5000);
});