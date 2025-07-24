(function() {
    'use strict';
    
    let isDarkMode = false;
    let hasUserPreference = false;
    
    const storedPreference = getDarkModePreference();
    if (storedPreference !== null) {
        isDarkMode = storedPreference;
        hasUserPreference = true;
    }
    
    let isToggleVisible = true;
    try {
        const storedVisibility = localStorage.getItem('darkModeToggleVisible');
        if (storedVisibility !== null) {
            isToggleVisible = storedVisibility === 'true';
        }
    } catch (e) {
        // Fallback na cookies
        const value = `; ${document.cookie}`;
        const parts = value.split(`; darkModeToggleVisible=`);
        if (parts.length === 2) {
            isToggleVisible = parts.pop().split(';').shift() === 'true';
        }
    }
    if (!hasUserPreference) {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            isDarkMode = true;
        } else {
            isDarkMode = false;
        }
    }

    window.isUsingSystemPreference = !hasUserPreference;
    // Anti-flicker css vložené před zobrazením 
    const criticalCSS = `
    
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
            display: ${isToggleVisible ? 'flex' : 'none'} !important;
            align-items: center !important;
            justify-content: center !important;
            font-size: 1.5rem !important;
            z-index: 1000 !important;
            transition: none !important;
        
        
            .dark-mode-toggle.hidden {
            display: none !important;
        }
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
    
    const style = document.createElement('style');
    style.type = 'text/css';
    style.id = 'anti-flicker-css';
    
    if (style.styleSheet) {
        style.styleSheet.cssText = criticalCSS;
    } else {
        style.appendChild(document.createTextNode(criticalCSS));
    }
    
    const head = document.head || document.getElementsByTagName('head')[0] || document.documentElement;
    head.insertBefore(style, head.firstChild);
    
    if (isDarkMode) {
        document.documentElement.className += ' dark-mode';
    }
    
    window.createToggleButtonEarly = function() {
        const existingButton = document.getElementById('darkModeToggle');
        if (existingButton) return; 
        
        const button = document.createElement('button');
        button.id = 'darkModeToggle';
        button.className = 'dark-mode-toggle';
        
        button.title = isDarkMode ? 'Přepnout na světlý režim' : 'Přepnout na tmavý režim';
        
        
        if (isDarkMode) {
            button.style.background = 'black';
            button.style.boxShadow = '0 4px 12px rgba(0,0,0,0.5)';
            button.innerHTML = createMoonIcon();
        } else {
            button.style.background = 'white';
            button.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
            button.innerHTML = createSunIcon();
        }
        
        const isVisible = getToggleVisibilityState();
        if (!isVisible) {
            button.classList.add('hidden');
        }

        const container = document.body || document.documentElement;
        container.appendChild(button);

        setTimeout(() => {
            button.classList.add('loaded');
        }, 100);
        

        return button;
    };
    
})();

(function() {
    const mainDarkModeCSS = `
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
        
        body.dark-mode .dark-mode-toggle {
            background: black !important;
            box-shadow: 0 4px 12px rgba(0,0,0,0.5) !important;
        }
            
    `;
    
    const mainStyle = document.createElement('style');
    mainStyle.appendChild(document.createTextNode(mainDarkModeCSS));
    document.head.appendChild(mainStyle);
})();

function getCookie(name) {
    try {
        if (!document.cookie) return null;
        
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        
        if (parts.length === 2) {
            const cookieValue = parts.pop().split(';').shift();
            return decodeURIComponent(cookieValue);
        }
        return null;
    } catch (error) {
        console.warn(`Error reading cookie '${name}':`, error);
        return null;
    }
}

function getDarkModePreference() {
    try {
        // Nejdříve zkusíme localStorage
        const localStorageValue = localStorage.getItem('darkMode');
        if (localStorageValue !== null) {
            return localStorageValue === 'true';
        }
    } catch (e) {
        console.warn('localStorage not available');
    }
    
    // Pokud localStorage není dostupný nebo nemá hodnotu, zkusíme cookies
    const cookieValue = getCookie('darkMode');
    if (cookieValue !== null) {
        return cookieValue === 'true';
    }
    
    // Pokud nemáme žádnou uloženou preferenci, vrátíme null
    return null;
}

// Incognito mode test
function isIncognitoMode() {
    try {
        // Zkusíme zapsat do localStorage
        localStorage.setItem('test', 'test');
        localStorage.removeItem('test');
        return false;
    } catch (e) {
        return true;
    }
}

function saveDarkModePreference(isDark) {
    if (isIncognitoMode()) {
        return;
    }
    
    try {
        localStorage.setItem('darkMode', isDark);
    } catch (e) {
        console.warn('Failed to save to localStorage');
    }
    
    try {
        document.cookie = `darkMode=${encodeURIComponent(isDark)};path=/;max-age=31536000`;
    } catch (error) {
        console.error('Error saving darkMode cookie:', error);
    }
}

function saveToggleVisibilityState(isVisible) {
    if (isIncognitoMode()) {
        return;
    }
    
    try {
        localStorage.setItem('darkModeToggleVisible', isVisible);
    } catch (e) {
        console.warn('Failed to save toggle visibility to localStorage');
    }
    
    try {
        document.cookie = `darkModeToggleVisible=${encodeURIComponent(isVisible)};path=/;max-age=31536000`;
    } catch (error) {
        console.error('Error saving darkModeToggleVisible cookie:', error);
    }
}

function getToggleVisibilityState() {
    try {
        const localStorageValue = localStorage.getItem('darkModeToggleVisible');

        if (localStorageValue !== null) {
            return localStorageValue === 'true';
        }
    } catch (e) {
        console.warn('localStorage not available');
    }
    
    // Fallback na cookies
    const cookieValue = getCookie('darkModeToggleVisible');
    if (cookieValue !== null) {
        return cookieValue === 'true';
    }
    
    // Výchozí stav - tlačítko je viditelné
    return true;
}

function saveButtonTextState(text) {
    if (isIncognitoMode()) {
        return;
    }
    
    try {
        localStorage.setItem('resetButtonText', text);
    } catch (e) {
        console.warn('Failed to save button text to localStorage');
    }
    
    try {
        document.cookie = `resetButtonText=${encodeURIComponent(text)};path=/;max-age=31536000`;
    } catch (error) {
        console.error('Error saving resetButtonText cookie:', error);
    }
}

function getButtonTextState() {
    try {
        const localStorageValue = localStorage.getItem('resetButtonText');
        if (localStorageValue !== null) {
            return localStorageValue;
        }
    } catch (e) {
        console.warn('localStorage not available');
    }
    
    const cookieValue = getCookie('resetButtonText');
    if (cookieValue !== null) {
        return decodeURIComponent(cookieValue);
    }
    
    return 'Preferovat světlý/tmavý režim prohlížeče';
}

(function() {
    if (window.matchMedia) {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        
        // Handler pro změny OS color scheme
        function handleSystemPreferenceChange(e) {
            // Pouze reaguj na změnu, pokud uživatel nemá vlastní preferenci
            if (window.isUsingSystemPreference) {
                const shouldBeDark = e.matches;
                const body = document.body;
                const currentlyDark = body.classList.contains('dark-mode');
                
                if (shouldBeDark !== currentlyDark) {
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
                        toggle.title = shouldBeDark ? 'Switch to light mode' : 'Switch to dark mode';
                    }
                }
            }
        }
        
    // Registrace media query listener
    if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleSystemPreferenceChange);
    } else {
        // Fallback pro starší prohlížeče
        mediaQuery.addListener(handleSystemPreferenceChange);
    }
 }
})();

// Reset na system default
function resetToSystemPreferences() {
    // Vymazání preference z localStorage
    try {
        localStorage.removeItem('darkMode');
    } catch (e) {
        console.warn('Failed to remove from localStorage');
    }
    // Vymazání preference z cookies
    try {
    document.cookie = 'darkMode=;path=/;max-age=0';
    } catch (error) {
        console.error('Error deleting darkMode cookie:', error);
    }
    
    // Nastavení system preference flag
    window.isUsingSystemPreference = true;
    
    // Aplikace OS color scheme
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const body = document.body;
    
    if (prefersDark) {
        body.classList.add('dark-mode');
        document.documentElement.classList.add('dark-mode');
    } else {
        body.classList.remove('dark-mode');
        document.documentElement.classList.remove('dark-mode');
    }
    
    // Aktualizace toggle icon state
    const toggle = document.getElementById('darkModeToggle');
    if (toggle) {
        toggle.innerHTML = prefersDark ? createMoonIcon() : createSunIcon();
        toggle.title = prefersDark ? 'Switch to light mode' : 'Switch to dark mode';
    }

      // Uložení stavu, že tlačítko je skryté
    saveToggleVisibilityState(false);
    // Aktualizace button text state
    saveButtonTextState('Přepínat ručně světlý/tmavý režim prohlížeče');
}

function showPage() {
    // Odstranění anti-flicker CSS a zobrazení stránky
    document.documentElement.classList.add('ready');
    document.body.classList.add('ready');
    
    // Cleanup anti-flicker stylů po transition
    setTimeout(() => {
        const antiFlickerStyle = document.getElementById('anti-flicker-css');
        if (antiFlickerStyle) {
            antiFlickerStyle.remove();
        }
    }, 200);
}

function initializeEarly() {
    // Inicializace dark mode state
    let isDarkMode = false;
    let hasUserPreference = false;
    
    try {
        const storedPreference = localStorage.getItem('darkMode');
        if (storedPreference !== null) {
            isDarkMode = storedPreference === 'true';
            hasUserPreference = true;
        }
    } catch (e) {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            isDarkMode = true;
        }
    }
    
    if (!hasUserPreference && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        isDarkMode = true;
    }
    
    // Nastavení globálního system preference flag
    window.isUsingSystemPreference = !hasUserPreference;
        if (isDarkMode) {
            document.body.classList.add('dark-mode');
            document.documentElement.classList.add('dark-mode');
        }
        // Vytvoření toggle button v early init
        if (window.createToggleButtonEarly) {
            window.createToggleButtonEarly();
        }
        // Zobrazení page content
        showPage();
}

if (document.readyState === 'loading') {
    // DOM se načítá
    document.addEventListener('DOMContentLoaded', initializeEarly);
} else {
    // DOM je již načten
    initializeEarly();
}

document.addEventListener('DOMContentLoaded', function() {
    if (!document.documentElement.classList.contains('ready')) {
        showPage();
    }

    if (!document.getElementById('darkModeToggle') && window.createToggleButtonEarly) {
        window.createToggleButtonEarly();
    }
});

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

function createMoonIcon() {
    return `
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
        </svg>
    `;
}

/*let isClickOpened = false;
let positionMonitoringInterval = null;
let inactivityTimer = null;

/*function startPositionMonitoring(){
    
}*/
/*function startPositionMonitoring(callback = null) {
    if (positionMonitoringInterval) {
       clearInterval(positionMonitoringInterval);
    }
    
   positionMonitoringInterval = setInterval(() => {
        // Callback pattern - zavolá předanou funkci 
        if (callback && typeof callback === 'function') {
            callback();
        }
    }, 100);
}

function stopPositionMonitoring() {
    if (positionMonitoringInterval) {
        clearInterval(positionMonitoringInterval);
        positionMonitoringInterval = null;
    }
}

function startInactivityTimer() {
    if (inactivityTimer) {
        clearTimeout(inactivityTimer);
    }
    
    inactivityTimer = setTimeout(() => {
        if (isClickOpened) {
            isClickOpened = false;
            stopPositionMonitoring();
        }
    }, 5000);
}

function stopInactivityTimer() {
    if (inactivityTimer) {
        clearTimeout(inactivityTimer);
        inactivityTimer = null;
    }
}*/
//--------------------------------------------------
function initializeDarkMode() {
    let darkModeToggle = document.getElementById('darkModeToggle');
    
    // Vytvoření toggle pokud chybí
    if (!darkModeToggle && window.createToggleButtonEarly) {
        darkModeToggle = window.createToggleButtonEarly();
    }
    
    if (!darkModeToggle) return;

    // Nastavení viditelnosti podle uloženého stavu
    const isVisible = getToggleVisibilityState();
    if (!isVisible) {
        darkModeToggle.style.display = 'none';
    }

    const body = document.body;

    // Nastavení ikony podle aktuálního stavu (pokud ještě není nastavena)
    if (!darkModeToggle.innerHTML.trim()) {
        if (body.classList.contains('dark-mode')) {
            darkModeToggle.innerHTML = createMoonIcon();
        } else {
            darkModeToggle.innerHTML = createSunIcon();
        }
    }

    // Přidání event listener pokud již není attached
    if (!darkModeToggle.hasAttribute('data-listener-added')) {
        darkModeToggle.setAttribute('data-listener-added', 'true');
        
        darkModeToggle.addEventListener('click', () => {
            body.classList.toggle('dark-mode');
            const isDark = body.classList.contains('dark-mode');
            
            // Aplikace na html element pro konzistenci
            if (isDark) {
                document.documentElement.classList.add('dark-mode');
            } else {
                document.documentElement.classList.remove('dark-mode');
            }
                // Uložení user preference
                saveDarkModePreference(isDark);

            // Označení jako user-defined preference
            window.isUsingSystemPreference = false;
            
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
    const resetButton = document.getElementById('resetSystemPreferences');
        if (resetButton) {
        // Načtení saved button text
        const savedText = getButtonTextState();
        resetButton.textContent = savedText;
            resetButton.addEventListener('click', () => {
                const darkModeToggle = document.getElementById('darkModeToggle');
        
        // Kontrola toggle visibility state
        if (darkModeToggle && darkModeToggle.style.display === 'none') {
            // Zobrazení toggle a aktualizace text
            darkModeToggle.style.display = 'flex';
            resetButton.textContent = ' Preferovat světlý/tmavý režim prohlížeče';
            saveButtonTextState(' Preferovat světlý/tmavý režim prohlížeče');
            // Označení jako user-defined preference
            window.isUsingSystemPreference = false;
            
            // Uložení toggle visibility state
            saveToggleVisibilityState(true);
            
        } else {
            // Skrytí toggle a reset na system
            resetToSystemPreferences();
            
            if (darkModeToggle) {
                darkModeToggle.style.display = 'none';
            }
            
            // Okamžitá změna textu
            resetButton.textContent = 'Přepínat ručně světlý/tmavý režim prohlížeče';
            saveButtonTextState('Přepínat ručně světlý/tmavý režim prohlížeče');
            
            // Uložení stavu, že tlačítko je skryté
            saveToggleVisibilityState(false);
        }
    });
}
}  

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

document.addEventListener('DOMContentLoaded', function() {
    initializeDarkMode();
    initializeSmoothScroll();
    
});

window.addEventListener('load', function() {
    initializeLoadAnimations();
    
   /* setTimeout(function() {
        if (!isClickOpened) {
            try {
                localStorage.removeItem('isFirstMenuOpen');
                localStorage.removeItem('isMouseOverFirstToggle');
            } catch (e) {
                
            }
        }
    }, 5000);*/
});