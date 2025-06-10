//-------IMPROVED PDF FUNCTIONALITY WITH MOBILE SUPPORT--------//
document.addEventListener('DOMContentLoaded', function() {
    // Univerzální funkce pro inicializaci PDF vieweru
    function initPdfViewer(config) {
        const {
            showBtnId,
            overlayId, 
            closeBtnId,
            frameId,
            pdfPath,
            viewerName
        } = config;

        const showPdfBtn = document.getElementById(showBtnId);
        
        if (!showPdfBtn) {
            return;
        }
        
        const pdfOverlay = document.getElementById(overlayId);
        const pdfCloseBtn = document.getElementById(closeBtnId);
        const pdfFrame = document.getElementById(frameId);
        
        if (!pdfOverlay || !pdfCloseBtn || !pdfFrame) {
            console.error(`Některé z potřebných elementů pro ${viewerName} PDF prohlížeč nebyly nalezeny`);
            return;
        }
        
        // Stavové proměnné
        let isPdfOpen = false;
        let pdfHasFocus = false;
        let isMobile = false;
        let fallbackShown = false;
        let loadingTimeout = null;
        let pdfLoadAttempts = 0;
        const maxLoadAttempts = 3;
        
        // Vylepšená detekce mobilního zařízení
        function detectMobile() {
            const userAgent = navigator.userAgent.toLowerCase();
            const isMobileUA = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile/i.test(userAgent);
            const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
            const isSmallScreen = window.innerWidth <= 768;
            const isIOS = /ipad|iphone|ipod/.test(userAgent);
            const isAndroid = /android/.test(userAgent);
            
            return {
                isMobile: isMobileUA || (isTouchDevice && isSmallScreen),
                isIOS: isIOS,
                isAndroid: isAndroid,
                isTouchDevice: isTouchDevice,
                isSmallScreen: isSmallScreen
            };
        }
        
        // Detekce podpory PDF v prohlížeči
        function checkPdfSupport() {
            return new Promise((resolve) => {
                // Rychlá kontrola založená na user agentu
                const mobileInfo = detectMobile();
                
                // iOS Safari obvykle nepodporuje PDF v iframe
                if (mobileInfo.isIOS) {
                    resolve(false);
                    return;
                }
                
                // Android Chrome/Firefox obvykle podporuje PDF
                if (mobileInfo.isAndroid) {
                    resolve(true);
                    return;
                }
                
                // Pro desktop a ostatní případy testujeme
                const testFrame = document.createElement('iframe');
                testFrame.style.cssText = 'position: absolute; left: -9999px; width: 1px; height: 1px; opacity: 0;';
                testFrame.src = 'data:application/pdf;base64,JVBERi0xLjQKJdPr6eEKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMiAwIFIKPj4KZW5kb2JqCjIgMCBvYmoKPDwKL1R5cGUgL1BhZ2VzCi9LaWRzIFsgMyAwIFIgXQovQ291bnQgMQo+PgplbmRvYmoKMyAwIG9iago8PAovVHlwZSAvUGFnZQovUGFyZW50IDIgMCBSCi9NZWRpYUJveCBbIDAgMCA2MTIgNzkyIF0KPj4KZW5kb2JqCnhyZWYKMCA0CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDAwOSAwMDAwMCBuIAowMDAwMDAwMDU4IDAwMDAwIG4gCjAwMDAwMDAxMTUgMDAwMDAgbiAKdHJhaWxlcgo8PAovU2l6ZSA0Ci9Sb290IDEgMCBSCj4+CnN0YXJ0eHJlZgoxOTQKJSVFT0Y=';
                
                let resolved = false;
                
                const timeout = setTimeout(() => {
                    if (!resolved) {
                        resolved = true;
                        if (document.body.contains(testFrame)) {
                            document.body.removeChild(testFrame);
                        }
                        resolve(false);
                    }
                }, 2000);
                
                testFrame.onload = () => {
                    if (!resolved) {
                        resolved = true;
                        clearTimeout(timeout);
                        if (document.body.contains(testFrame)) {
                            document.body.removeChild(testFrame);
                        }
                        resolve(true);
                    }
                };
                
                testFrame.onerror = () => {
                    if (!resolved) {
                        resolved = true;
                        clearTimeout(timeout);
                        if (document.body.contains(testFrame)) {
                            document.body.removeChild(testFrame);
                        }
                        resolve(false);
                    }
                };
                
                document.body.appendChild(testFrame);
            });
        }
        
        // Vytvoření loading indikátoru
        function createLoadingIndicator() {
            const loadingDiv = document.createElement('div');
            loadingDiv.id = `${frameId}_loading`;
            loadingDiv.style.cssText = `
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(255, 255, 255, 0.95);
                padding: 30px;
                border-radius: 12px;
                box-shadow: 0 8px 32px rgba(0,0,0,0.3);
                text-align: center;
                z-index: 1003;
                max-width: 90%;
                backdrop-filter: blur(10px);
            `;
            
            loadingDiv.innerHTML = `
                <div style="width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #007bff; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 15px;"></div>
                <h3 style="margin: 0 0 10px 0; color: #333; font-size: 16px;">Načítám PDF...</h3>
                <p style="margin: 0; color: #666; font-size: 14px;">Pokud se PDF nenačte, zobrazí se alternativní možnosti</p>
                <style>
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                </style>
            `;
            
            return loadingDiv;
        }
       // Vylepšené fallback tlačítka
function createFallbackButtons() {
    const fallbackDiv = document.createElement('div');
    fallbackDiv.id = `${frameId}_fallback`;
    fallbackDiv.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(255, 255, 255, 0.98);
        padding: 20px;
        border-radius: 16px;
        box-shadow: 0 12px 48px rgba(0,0,0,0.3);
        text-align: center;
        z-index: 1002;
        width: min(300px, 85vw);
        height: min(300px, 85vh);
        display: flex;
        flex-direction: column;
        justify-content: center;
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255,255,255,0.3);
    `;
    
    const mobileInfo = detectMobile();
    const downloadUrl = pdfPath;
    
    fallbackDiv.innerHTML = `
        <p style="margin: 0 0 20px 0; font-size: 16px; color: #333; line-height: 1.5;">
            Váš mobilní prohlížeč může mít problém zobrazit PDF přímo na stránce. Vyberte si způsob zobrazení:
        </p>
        <div style="display: flex; flex-direction: column; gap: 15px;">
            <a href="${downloadUrl}" target="_blank" 
               style="display: flex; align-items: center; justify-content: center; gap: 10px; padding: 16px 24px; background: #007bff; color: white; text-decoration: none; border-radius: 10px; font-weight: 500; transition: all 0.3s; width: 100%; box-sizing: border-box;"
               onmouseover="this.style.transform='translateY(-2px)';"
               onmouseout="this.style.transform='translateY(0)';">
                <span>Otevřít v novém okně</span>
            </a>
            
            ${mobileInfo.isMobile ? `
                <a href="${downloadUrl}" download 
                   style="display: flex; align-items: center; justify-content: center; gap: 10px; padding: 16px 24px; background: #28a745; color: white; text-decoration: none; border-radius: 10px; font-weight: 500; transition: all 0.3s; width: 100%; box-sizing: border-box;"
                   onmouseover="this.style.transform='translateY(-2px)';"
                   onmouseout="this.style.transform='translateY(0)';">
                    <span>Stáhnout do zařízení</span>
                </a>
            ` : ''}
            
            ${pdfLoadAttempts < maxLoadAttempts ? `
                <button onclick="window.${frameId}_retryFromFallback();"
                        style="display: flex; align-items: center; justify-content: center; gap: 10px; padding: 16px 24px; background: #6c757d; color: white; border: none; border-radius: 10px; font-weight: 500; cursor: pointer; transition: all 0.3s; width: 100%; box-sizing: border-box;"
                        onmouseover="this.style.transform='translateY(-2px)';"
                        onmouseout="this.style.transform='translateY(0)';">
                    <span>Zkusit znovu</span>
                </button>
            ` : ''}
        </div>
    `;
    
    return fallbackDiv;
}
        
        // Aplikace mobilních stylů
        function applyMobileStyles() {
            const mobileInfo = detectMobile();
            
            if (mobileInfo.isMobile) {
                // Iframe styls pro mobil
                pdfFrame.style.cssText += `
                    width: 100% !important;
                    height: 100% !important;
                    border: none !important;
                    position: absolute !important;
                    top: 0 !important;
                    left: 0 !important;
                    z-index: 1001 !important;
                    background: white;
                `;
                
                // Overlay styly pro mobil
                pdfOverlay.style.cssText += `
                    padding: 0 !important;
                    background: rgba(0,0,0,0.95) !important;
                    position: fixed !important;
                    top: 0 !important;
                    left: 0 !important;
                    right: 0 !important;
                    bottom: 0 !important;
                    z-index: 1000 !important;
                `;
                
                // Mobilní viewport meta tag
                let viewport = document.querySelector('meta[name="viewport"]');
                if (!viewport) {
                    viewport = document.createElement('meta');
                    viewport.name = 'viewport';
                    viewport.content = 'width=device-width, initial-scale=1.0, user-scalable=yes, minimum-scale=0.5, maximum-scale=3.0';
                    document.head.appendChild(viewport);
                } else {
                    viewport.content = 'width=device-width, initial-scale=1.0, user-scalable=yes, minimum-scale=0.5, maximum-scale=3.0';
                }
            }
        }
        
        // Funkce pro retry načtení PDF
        window[`${frameId}_retryLoad`] = function() {
            pdfLoadAttempts++;
            console.log(`Pokus o načtení PDF #${pdfLoadAttempts}`);
            
            if (pdfLoadAttempts <= maxLoadAttempts) {
                // Přidáme cache buster
                const cacheBuster = `?v=${Date.now()}&attempt=${pdfLoadAttempts}`;
                pdfFrame.src = `${pdfPath}${cacheBuster}`;
                
                // Zobrazíme loading indikátor
                showLoadingIndicator();
            } else {
                console.log('Maximální počet pokusů dosažen, zobrazuji fallback');
                showFallbackOptions();
            }
        };
        
        // Nová funkce pro retry z fallback dialogu
        window[`${frameId}_retryFromFallback`] = function() {
            console.log(`Retry z fallback dialogu - pokus #${pdfLoadAttempts + 1}`);
            
            // Skryjeme fallback dialog
            hideFallbackOptions();
            
            // Spustíme retry
            window[`${frameId}_retryLoad`]();
        };
        
        // Zobrazení loading indikátoru
        function showLoadingIndicator() {
            // Odebereme existující loading a fallback
            hideFallbackOptions();
            hideLoadingIndicator();
            
            const loadingDiv = createLoadingIndicator();
            pdfOverlay.appendChild(loadingDiv);
            
            // Nastavíme timeout pro loading
            loadingTimeout = setTimeout(() => {
                hideLoadingIndicator();
                console.log(`Loading timeout po ${pdfLoadAttempts}. pokusu`);
                
                // Po timeoutu vždy zobrazíme fallback (bez ohledu na počet pokusů)
                showFallbackOptions();
            }, 5000); // 5 sekund timeout
        }
        
        // Skrytí loading indikátoru
        function hideLoadingIndicator() {
            const loadingDiv = document.getElementById(`${frameId}_loading`);
            if (loadingDiv) {
                loadingDiv.remove();
            }
            
            if (loadingTimeout) {
                clearTimeout(loadingTimeout);
                loadingTimeout = null;
            }
        }
        
        // Skrytí fallback možností
        function hideFallbackOptions() {
            const fallbackDiv = document.getElementById(`${frameId}_fallback`);
            if (fallbackDiv) {
                fallbackDiv.remove();
            }
            fallbackShown = false;
        }
        
        // Zobrazení fallback možností
        function showFallbackOptions() {
            console.log(`Zobrazuji fallback po ${pdfLoadAttempts} pokusech`);
            
            hideLoadingIndicator();
            hideFallbackOptions(); // Odebereme starý fallback pokud existuje
            
            const fallbackDiv = createFallbackButtons();
            pdfOverlay.appendChild(fallbackDiv);
            
            // Skryjeme iframe
            pdfFrame.style.display = 'none';
            fallbackShown = true;
        }
        
        // Hlavní funkce pro otevření PDF
        async function openPdfViewer() {
            const mobileInfo = detectMobile();
            isMobile = mobileInfo.isMobile;
            fallbackShown = false;
            pdfLoadAttempts = 0;
            
            console.log(`Otevírám ${viewerName} PDF viewer`, mobileInfo);
            
            pdfOverlay.style.display = 'block';
            isPdfOpen = true;
            
            // Aplikujeme styly
            applyMobileStyles();
            
            // Blokujeme scrollování na pozadí
            document.body.style.overflow = 'hidden';
            
            // Zobrazíme loading indikátor
            showLoadingIndicator();
            
            // Pro mobilní zařízení zkontrolujeme podporu PDF
            if (isMobile) {
                const pdfSupported = await checkPdfSupport();
                console.log('PDF podpora na mobilu:', pdfSupported);
                
                if (!pdfSupported && mobileInfo.isIOS) {
                    // iOS obvykle nepodporuje PDF v iframe - zobrazíme fallback
                    console.log('iOS detekován - zobrazuji fallback možnosti');
                    setTimeout(() => {
                        showFallbackOptions();
                    }, 1000);
                    return;
                }
            }
            
            // Načteme PDF
            pdfFrame.style.display = 'block';
            pdfFrame.src = `${pdfPath}?v=${Date.now()}`;
            
            // Nastavíme handlers pro načtení
            const loadHandler = () => {
                console.log(`${viewerName} PDF načteno úspěšně`);
                hideLoadingIndicator();
                pdfFrame.removeEventListener('load', loadHandler);
                pdfFrame.removeEventListener('error', errorHandler);
            };
            
            const errorHandler = () => {
                console.log(`Chyba při načítání ${viewerName} PDF - pokus ${pdfLoadAttempts}`);
                pdfFrame.removeEventListener('load', loadHandler);
                pdfFrame.removeEventListener('error', errorHandler);
                
                // Při chybě vždy zobrazíme fallback
                showFallbackOptions();
            };
            
            pdfFrame.addEventListener('load', loadHandler);
            pdfFrame.addEventListener('error', errorHandler);
        }
        
        // Funkce pro zavření PDF
        function closePdfViewer() {
            pdfOverlay.style.display = 'none';
            pdfFrame.src = '';
            pdfFrame.style.display = 'block';
            
            // Obnovíme scrollování
            document.body.style.overflow = '';
            
            // Vyčistíme všechny pomocné elementy
            hideLoadingIndicator();
            hideFallbackOptions();
            
            isPdfOpen = false;
            pdfHasFocus = false;
            fallbackShown = false;
            pdfLoadAttempts = 0;
            
            console.log(`${viewerName} PDF zavřeno`);
        }
        
        // Touch a gesture podpora
        let touchStartY = 0;
        let touchStartX = 0;
        let touchMoved = false;
        
        pdfOverlay.addEventListener('touchstart', function(e) {
            touchStartY = e.touches[0].clientY;
            touchStartX = e.touches[0].clientX;
            touchMoved = false;
        }, { passive: true });
        
        pdfOverlay.addEventListener('touchmove', function(e) {
            touchMoved = true;
        }, { passive: true });
        
        pdfOverlay.addEventListener('touchend', function(e) {
            if (!touchMoved) return; // Pouze pokud byl pohyb
            
            const touchEndY = e.changedTouches[0].clientY;
            const touchEndX = e.changedTouches[0].clientX;
            const deltaY = touchStartY - touchEndY;
            const deltaX = Math.abs(touchStartX - touchEndX);
            
            // Swipe dolů pro zavření (ale ne při horizontálním swipe)
            if (deltaY < -150 && deltaX < 100) {
                if (e.target === pdfOverlay) {
                    closePdfViewer();
                }
            }
        }, { passive: true });
        
        // Keyboard podpora
        function handleKeydown(e) {
            if (isPdfOpen && (e.key === 'Escape' || e.keyCode === 27)) {
                closePdfViewer();
                e.preventDefault();
                e.stopPropagation();
                return;
            }
        }
        
        document.addEventListener('keydown', handleKeydown, true);
        
        // Event listenery pro tlačítka
        showPdfBtn.addEventListener('click', openPdfViewer);
        pdfCloseBtn.addEventListener('click', closePdfViewer);
        
        // Zavření kliknutím na overlay
        pdfOverlay.addEventListener('click', function(e) {
            if (e.target === pdfOverlay) {
                closePdfViewer();
            }
        });
        
        // Responsivní úpravy
        window.addEventListener('resize', function() {
            if (isPdfOpen) {
                const newMobileInfo = detectMobile();
                if (newMobileInfo.isMobile !== isMobile) {
                    isMobile = newMobileInfo.isMobile;
                    applyMobileStyles();
                }
            }
        });
        
        console.log(`${viewerName} PDF viewer inicializován s vylepšenou mobilní podporou`);
    }
    
    // Inicializace všech PDF viewerů
    const pdfViewers = [
        {
            showBtnId: 'showPdfBtn',
            overlayId: 'pdfOverlay',
            closeBtnId: 'pdfCloseBtn',
            frameId: 'pdfFrame',
            pdfPath: 'docs/darwin.pdf',
            viewerName: 'Darwin'
        },
        {
            showBtnId: 'showOriginPdfBtn',
            overlayId: 'originPdfOverlay',
            closeBtnId: 'originPdfCloseBtn',
            frameId: 'originPdfFrame',
            pdfPath: 'docs/origin_of_life.pdf',
            viewerName: 'Origin of Life'
        },
        {
            showBtnId: 'showPresahPdfBtn',
            overlayId: 'presahPdfOverlay',
            closeBtnId: 'presahPdfCloseBtn',
            frameId: 'presahPdfFrame',
            pdfPath: 'docs/presah.pdf',
            viewerName: 'Presah'
        }
    ];
    
    // Inicializujeme všechny PDF viewery
    pdfViewers.forEach(config => {
        initPdfViewer(config);
    });
});
//-------PDF FUNCIONALITY FOR ORIGIN OF LIFE--------//
// Počkáme na načtení stránky
document.addEventListener('DOMContentLoaded', function() {
    // Získáme reference na elementy
    const showPdfBtn = document.getElementById('showOriginPdfBtn');
    
    // Pokud element showOriginPdfBtn neexistuje na aktuální stránce, ukončíme inicializaci PDF prohlížeče
    if (!showPdfBtn) {
        return; // Ukončíme inicializaci, pokud tlačítko neexistuje
    }
    
    // Pokračujeme pouze pokud existuje tlačítko pro zobrazení PDF
    const pdfOverlay = document.getElementById('originPdfOverlay');
    const pdfCloseBtn = document.getElementById('originPdfCloseBtn');
    const pdfFrame = document.getElementById('originPdfFrame');
    
    // Kontrola existence potřebných elementů
    if (!pdfOverlay || !pdfCloseBtn || !pdfFrame) {
        console.error('Některé z potřebných elementů pro PDF prohlížeč nebyly nalezeny');
        return;
    }
    
    // Proměnné pro sledování stavu
    let isPdfOpen = false;
    let pdfHasFocus = false; // Klíčová proměnná - určuje, zda má PDF focus
    
    // Funkce pro detekci typu prohlížeče
    function getBrowserType() {
        const userAgent = navigator.userAgent.toLowerCase();
        if (userAgent.includes('chrome') && !userAgent.includes('edg')) return 'chrome';
        if (userAgent.includes('firefox')) return 'firefox';
        if (userAgent.includes('safari') && !userAgent.includes('chrome')) return 'safari';
        if (userAgent.includes('edg')) return 'edge';
        return 'other';
    }
    
    // Funkce pro simulaci klávesových událostí v PDF
    function simulateKeyInPdf(keyCode, key) {
        try {
            const iframeWindow = pdfFrame.contentWindow;
            if (iframeWindow) {
                const keyEvent = new KeyboardEvent('keydown', {
                    key: key,
                    keyCode: keyCode,
                    which: keyCode,
                    bubbles: true,
                    cancelable: true
                });
                
                if (iframeWindow.document) {
                    iframeWindow.document.dispatchEvent(keyEvent);
                    
                    const keyUpEvent = new KeyboardEvent('keyup', {
                        key: key,
                        keyCode: keyCode,
                        which: keyCode,
                        bubbles: true,
                        cancelable: true
                    });
                    iframeWindow.document.dispatchEvent(keyUpEvent);
                }
            }
        } catch (error) {
            console.log('Fallback: Používám alternativní metodu pro ovládání PDF');
        }
    }
    
    // Funkce pro nastavení focus na PDF
    function setFocusOnPdf() {
        pdfFrame.focus();
        
        const browserType = getBrowserType();
        
        setTimeout(() => {
            try {
                if (pdfFrame.contentWindow && pdfFrame.contentWindow.focus) {
                    pdfFrame.contentWindow.focus();
                }
                
                if (browserType === 'chrome' || browserType === 'edge') {
                    const pdfEmbed = pdfFrame.contentDocument?.querySelector('embed');
                    if (pdfEmbed && pdfEmbed.focus) {
                        pdfEmbed.focus();
                    }
                }
            } catch (error) {
                console.log('Focus management fallback');
            }
        }, 200);
    }
    
    // Funkce pro otevření PDF
    function openPdfViewer() {
        pdfFrame.src = 'docs/origin_of_life.pdf';
        pdfOverlay.style.display = 'block';
        // NEBLOKUJEME scrollování - necháme stránku scrollovatelnou
        // document.body.style.overflow = 'hidden'; // Odstraněno!
        isPdfOpen = true;
        
        // DŮLEŽITÉ: Při otevření PDF NEMÁ automaticky focus
        pdfHasFocus = false;
        
        console.log('PDF otevřeno - šipky ovládají pozadí stránky. Klikněte do PDF pro ovládání PDF.');
    }
    
    // Funkce pro zavření PDF
    function closePdfViewer() {
        pdfOverlay.style.display = 'none';
        pdfFrame.src = '';
        // Nemusíme obnovovat overflow, protože jsme ho neblokovali
        isPdfOpen = false;
        pdfHasFocus = false;
        
        console.log('PDF zavřeno - normální ovládání stránky obnoveno.');
    }
    
    // Hlavní funkce pro obsluhu kláves
    function handleKeydown(e) {
        // ESC vždy zavírá PDF pokud je otevřené
        if (isPdfOpen && (e.key === 'Escape' || e.keyCode === 27)) {
            closePdfViewer();
            e.preventDefault();
            e.stopPropagation();
            return;
        }
        
        // Pokud PDF není otevřené, necháme normální chování
        if (!isPdfOpen) {
            return;
        }
        
        // Pokud je PDF otevřené ale NEMÁ focus, necháme šipky ovládat pozadí
        if (!pdfHasFocus) {
            return; // Šipky budou normálně ovládat stránku v pozadí
        }
        
        // Pouze pokud má PDF focus, přesměrujeme navigační klávesy do PDF
        const key = e.key;
        const keyCode = e.keyCode || e.which;
        
        const navigationKeys = [
            'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
            'PageUp', 'PageDown', 'Home', 'End', 'Space'
        ];
        
        const navigationKeyCodes = [33, 34, 35, 36, 37, 38, 39, 40, 32];
        
        if (navigationKeys.includes(key) || navigationKeyCodes.includes(keyCode)) {
            // Zabráníme výchozímu chování stránky
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            
            // Pošleme klávesu do PDF
            simulateKeyInPdf(keyCode, key);
            
            console.log('Klávesa přesměrována do PDF:', key);
        }
    }
    
    // Přidáme globální handler pro klávesy
    document.addEventListener('keydown', handleKeydown, true);
    
    // Handler pro kliknutí na overlay
    pdfOverlay.addEventListener('click', function(e) {
        if (e.target === pdfOverlay) {
            // Kliknutí mimo PDF - zavřeme PDF
            closePdfViewer();
        }
    });
    
    // KLÍČOVÝ handler - kliknutí DO PDF oblasti nastaví focus
    pdfFrame.addEventListener('click', function(e) {
        pdfHasFocus = true;
        setFocusOnPdf();
        console.log('PDF má nyní focus - šipky ovládají PDF');
        e.stopPropagation();
    });
    
    // Handler pro kliknutí mimo PDF (ale uvnitř overlay) - odebere focus z PDF
    pdfOverlay.addEventListener('click', function(e) {
        // Pokud klikneme mimo PDF iframe, ale stále uvnitř overlay
        if (e.target !== pdfFrame && !pdfFrame.contains(e.target)) {
            pdfHasFocus = false;
            console.log('Focus odebrán z PDF - šipky opět ovládají pozadí stránky');
        }
    });
    
    // Handler při načtení PDF
    pdfFrame.addEventListener('load', function() {
        if (isPdfOpen) {
            // Při načtení PDF stále nemá automaticky focus
            console.log('PDF načteno - čeká na kliknutí pro aktivaci ovládání');
        }
    });
    
    // Event listenery pro tlačítka
    showPdfBtn.addEventListener('click', openPdfViewer);
    pdfCloseBtn.addEventListener('click', closePdfViewer);
    
    // Podpora pro mouse wheel - pouze když má PDF focus
    pdfOverlay.addEventListener('wheel', function(e) {
        if (isPdfOpen && pdfHasFocus) {
            // Necháme wheel události procházet do PDF
            e.stopPropagation();
        }
        // Pokud PDF nemá focus, wheel normálně ovládá pozadí stránku
    }, { passive: true });
    
    // Zablokujeme "beforeunload" varování při zavírání PDF
    function disableBeforeUnloadWarning() {
        // Odstraníme všechny existující beforeunload listenery
        window.onbeforeunload = null;
        
        // Přepíšeme addEventListener pro beforeunload aby se nemohl přidat nový
        const originalAddEventListener = window.addEventListener;
        window.addEventListener = function(type, listener, options) {
            if (type === 'beforeunload') {
                // Ignorujeme beforeunload listenery když je PDF otevřené
                if (isPdfOpen) {
                    console.log('Blokován beforeunload listener kvůli otevřenému PDF');
                    return;
                }
            }
            return originalAddEventListener.call(this, type, listener, options);
        };
    }
    
    // Funkce pro obnovení normálního chování beforeunload
    function enableBeforeUnloadWarning() {
        // Obnovíme originální addEventListener (pokud je potřeba)
        // V praxi obvykle není potřeba, protože po zavření PDF se stránka většinou nezmění
    }
    
    // Přidáme blokování varování při otevření PDF
    const originalOpenPdfViewer = openPdfViewer;
    openPdfViewer = function() {
        originalOpenPdfViewer();
        disableBeforeUnloadWarning();
    };
    
    // Alternativní řešení - kompletně zablokujeme beforeunload pro celou stránku
    // (odkomentujte pokud chcete úplně zakázat všechna varování)
    /*
    window.addEventListener('beforeunload', function(e) {
        // Zablokujeme výchozí chování
        e.preventDefault();
        // Nevracíme žádnou hodnotu - nebude se zobrazovat varování
        return undefined;
    });
    */
    
    console.log('PDF viewer pro Origin of Life inicializován s inteligentním focus managementem a potlačením beforeunload varování');
});


//-------PDF FUNCIONALITY FOR PRESAH--------//
// Počkáme na načtení stránky
document.addEventListener('DOMContentLoaded', function() {
    // Získáme reference na elementy
    const showPdfBtn = document.getElementById('showPresahPdfBtn');
    
    // Pokud element showPresahPdfBtn neexistuje na aktuální stránce, ukončíme inicializaci PDF prohlížeče
    if (!showPdfBtn) {
        return; // Ukončíme inicializaci, pokud tlačítko neexistuje
    }
    
    // Pokračujeme pouze pokud existuje tlačítko pro zobrazení PDF
    const pdfOverlay = document.getElementById('presahPdfOverlay');
    const pdfCloseBtn = document.getElementById('presahPdfCloseBtn');
    const pdfFrame = document.getElementById('presahPdfFrame');
    
    // Kontrola existence potřebných elementů
    if (!pdfOverlay || !pdfCloseBtn || !pdfFrame) {
        console.error('Některé z potřebných elementů pro PDF prohlížeč nebyly nalezeny');
        return;
    }
    
    // Proměnné pro sledování stavu
    let isPdfOpen = false;
    let pdfHasFocus = false; // Klíčová proměnná - určuje, zda má PDF focus
    
    // Funkce pro detekci typu prohlížeče
    function getBrowserType() {
        const userAgent = navigator.userAgent.toLowerCase();
        if (userAgent.includes('chrome') && !userAgent.includes('edg')) return 'chrome';
        if (userAgent.includes('firefox')) return 'firefox';
        if (userAgent.includes('safari') && !userAgent.includes('chrome')) return 'safari';
        if (userAgent.includes('edg')) return 'edge';
        return 'other';
    }
    
    // Funkce pro simulaci klávesových událostí v PDF
    function simulateKeyInPdf(keyCode, key) {
        try {
            const iframeWindow = pdfFrame.contentWindow;
            if (iframeWindow) {
                const keyEvent = new KeyboardEvent('keydown', {
                    key: key,
                    keyCode: keyCode,
                    which: keyCode,
                    bubbles: true,
                    cancelable: true
                });
                
                if (iframeWindow.document) {
                    iframeWindow.document.dispatchEvent(keyEvent);
                    
                    const keyUpEvent = new KeyboardEvent('keyup', {
                        key: key,
                        keyCode: keyCode,
                        which: keyCode,
                        bubbles: true,
                        cancelable: true
                    });
                    iframeWindow.document.dispatchEvent(keyUpEvent);
                }
            }
        } catch (error) {
            console.log('Fallback: Používám alternativní metodu pro ovládání PDF');
        }
    }
    
    // Funkce pro nastavení focus na PDF
    function setFocusOnPdf() {
        pdfFrame.focus();
        
        const browserType = getBrowserType();
        
        setTimeout(() => {
            try {
                if (pdfFrame.contentWindow && pdfFrame.contentWindow.focus) {
                    pdfFrame.contentWindow.focus();
                }
                
                if (browserType === 'chrome' || browserType === 'edge') {
                    const pdfEmbed = pdfFrame.contentDocument?.querySelector('embed');
                    if (pdfEmbed && pdfEmbed.focus) {
                        pdfEmbed.focus();
                    }
                }
            } catch (error) {
                console.log('Focus management fallback');
            }
        }, 200);
    }
    
    // Funkce pro otevření PDF
    function openPdfViewer() {
        pdfFrame.src = 'docs/presah.pdf'; // Změněna cesta k PDF souboru
        pdfOverlay.style.display = 'block';
        // NEBLOKUJEME scrollování - necháme stránku scrollovatelnou
        // document.body.style.overflow = 'hidden'; // Odstraněno!
        isPdfOpen = true;
        
        // DŮLEŽITÉ: Při otevření PDF NEMÁ automaticky focus
        pdfHasFocus = false;
        
        console.log('PDF otevřeno - šipky ovládají pozadí stránky. Klikněte do PDF pro ovládání PDF.');
    }
    
    // Funkce pro zavření PDF
    function closePdfViewer() {
        pdfOverlay.style.display = 'none';
        pdfFrame.src = '';
        // Nemusíme obnovovat overflow, protože jsme ho neblokovali
        isPdfOpen = false;
        pdfHasFocus = false;
        
        console.log('PDF zavřeno - normální ovládání stránky obnoveno.');
    }
    
    // Hlavní funkce pro obsluhu kláves
    function handleKeydown(e) {
        // ESC vždy zavírá PDF pokud je otevřené
        if (isPdfOpen && (e.key === 'Escape' || e.keyCode === 27)) {
            closePdfViewer();
            e.preventDefault();
            e.stopPropagation();
            return;
        }
        
        // Pokud PDF není otevřené, necháme normální chování
        if (!isPdfOpen) {
            return;
        }
        
        // Pokud je PDF otevřené ale NEMÁ focus, necháme šipky ovládat pozadí
        if (!pdfHasFocus) {
            return; // Šipky budou normálně ovládat stránku v pozadí
        }
        
        // Pouze pokud má PDF focus, přesměrujeme navigační klávesy do PDF
        const key = e.key;
        const keyCode = e.keyCode || e.which;
        
        const navigationKeys = [
            'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
            'PageUp', 'PageDown', 'Home', 'End', 'Space'
        ];
        
        const navigationKeyCodes = [33, 34, 35, 36, 37, 38, 39, 40, 32];
        
        if (navigationKeys.includes(key) || navigationKeyCodes.includes(keyCode)) {
            // Zabráníme výchozímu chování stránky
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            
            // Pošleme klávesu do PDF
            simulateKeyInPdf(keyCode, key);
            
            console.log('Klávesa přesměrována do PDF:', key);
        }
    }
    
    // Přidáme globální handler pro klávesy
    document.addEventListener('keydown', handleKeydown, true);
    
    // Handler pro kliknutí na overlay
    pdfOverlay.addEventListener('click', function(e) {
        if (e.target === pdfOverlay) {
            // Kliknutí mimo PDF - zavřeme PDF
            closePdfViewer();
        }
    });
    
    // KLÍČOVÝ handler - kliknutí DO PDF oblasti nastaví focus
    pdfFrame.addEventListener('click', function(e) {
        pdfHasFocus = true;
        setFocusOnPdf();
        console.log('PDF má nyní focus - šipky ovládají PDF');
        e.stopPropagation();
    });
    
    // Handler pro kliknutí mimo PDF (ale uvnitř overlay) - odebere focus z PDF
    pdfOverlay.addEventListener('click', function(e) {
        // Pokud klikneme mimo PDF iframe, ale stále uvnitř overlay
        if (e.target !== pdfFrame && !pdfFrame.contains(e.target)) {
            pdfHasFocus = false;
            console.log('Focus odebrán z PDF - šipky opět ovládají pozadí stránky');
        }
    });
    
    // Handler při načtení PDF
    pdfFrame.addEventListener('load', function() {
        if (isPdfOpen) {
            // Při načtení PDF stále nemá automaticky focus
            console.log('PDF načteno - čeká na kliknutí pro aktivaci ovládání');
        }
    });
    
    // Event listenery pro tlačítka
    showPdfBtn.addEventListener('click', openPdfViewer);
    pdfCloseBtn.addEventListener('click', closePdfViewer);
    
    // Podpora pro mouse wheel - pouze když má PDF focus
    pdfOverlay.addEventListener('wheel', function(e) {
        if (isPdfOpen && pdfHasFocus) {
            // Necháme wheel události procházet do PDF
            e.stopPropagation();
        }
        // Pokud PDF nemá focus, wheel normálně ovládá pozadí stránku
    }, { passive: true });
    
    // Zablokujeme "beforeunload" varování při zavírání PDF
    function disableBeforeUnloadWarning() {
        // Odstraníme všechny existující beforeunload listenery
        window.onbeforeunload = null;
        
        // Přepíšeme addEventListener pro beforeunload aby se nemohl přidat nový
        const originalAddEventListener = window.addEventListener;
        window.addEventListener = function(type, listener, options) {
            if (type === 'beforeunload') {
                // Ignorujeme beforeunload listenery když je PDF otevřené
                if (isPdfOpen) {
                    console.log('Blokován beforeunload listener kvůli otevřenému PDF');
                    return;
                }
            }
            return originalAddEventListener.call(this, type, listener, options);
        };
    }
    
    // Funkce pro obnovení normálního chování beforeunload
    function enableBeforeUnloadWarning() {
        // Obnovíme originální addEventListener (pokud je potřeba)
        // V praxi obvykle není potřeba, protože po zavření PDF se stránka většinou nezmění
    }
    
    // Přidáme blokování varování při otevření PDF
    const originalOpenPdfViewer = openPdfViewer;
    openPdfViewer = function() {
        originalOpenPdfViewer();
        disableBeforeUnloadWarning();
    };
    
    // Alternativní řešení - kompletně zablokujeme beforeunload pro celou stránku
    // (odkomentujte pokud chcete úplně zakázat všechna varování)
    /*
    window.addEventListener('beforeunload', function(e) {
        // Zablokujeme výchozí chování
        e.preventDefault();
        // Nevracíme žádnou hodnotu - nebude se zobrazovat varování
        return undefined;
    });
    */
    
    console.log('PDF viewer pro Presah inicializován s inteligentním focus managementem a potlačením beforeunload varování');
});