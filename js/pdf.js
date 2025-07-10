//-------PDF FUNCIONALITY--------//

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
            console.error(`Some of the required elements for ${viewerName} PDF viewer were not found`);
            return;
        }
        
        // Stavové proměnné
        let isPdfOpen = false;
        let pdfHasFocus = false;
        let isMobile = false;
        let fallbackShown = false;
        let loadingTimeout = null;
        let pdfLoadAttempts = 0;
        const maxLoadAttempts = 2;
        const loadingTimeoutDuration = 4000; // 4 sekundy
        
        // Vylepšená detekce mobilního zařízení a tabletů
        function detectMobile() {
            const userAgent = navigator.userAgent.toLowerCase();
            const platform = navigator.platform?.toLowerCase() || '';
            
            // Detekce různých zařízení - rozšířené vzory
            const patterns = {
                iOS: /ipad|iphone|ipod/,
                android: /android/,
                windows: /windows phone|windows mobile|wpdesktop|windows nt.*touch/,
                blackberry: /blackberry|bb10|rim/,
                opera: /opera mini|opera mobi/,
                mobile: /mobile|phone|mobi|mini/,
                tablet: /tablet|ipad|playbook|silk|(puffin(?!.*(IP|AP|WP)))|kindle|nook|kobo/ 
            };
            
            const isIOS = patterns.iOS.test(userAgent);
            const isAndroid = patterns.android.test(userAgent);
            const isWindowsMobile = patterns.windows.test(userAgent);
            const isBlackberry = patterns.blackberry.test(userAgent);
            const isOperaMobile = patterns.opera.test(userAgent);
            const isMobilePattern = patterns.mobile.test(userAgent);
            const isTabletPattern = patterns.tablet.test(userAgent);
            
            // Touch podpora
            const isTouchDevice = 'ontouchstart' in window || 
                                navigator.maxTouchPoints > 0 || 
                                navigator.msMaxTouchPoints > 0;
            
            // Velikost obrazovky - vylepšené hranice
            const screenWidth = Math.max(window.screen.width, window.screen.height);
            const screenHeight = Math.min(window.screen.width, window.screen.height);
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            
            const isVerySmallScreen = viewportWidth <= 480;
            const isSmallScreen = viewportWidth <= 768;
            const isMediumScreen = viewportWidth > 768 && viewportWidth <= 1024;
            const isLargeScreen = viewportWidth > 1024;
            
            // Orientace
            const isPortrait = viewportHeight > viewportWidth;
            const isLandscape = viewportWidth > viewportHeight;
            
            // Pixel density
            const pixelRatio = window.devicePixelRatio || 1;
            const isHighDPI = pixelRatio > 1.5;
            
            // Detekce specifických tabletů pomocí kombinace faktorů
            const isLikelyTablet = (
                // Explicitní tablet vzory
                isTabletPattern ||
                // iPad detekce
                (isIOS && screenWidth >= 768) ||
                // Android tablet - kombinace Android + dotyková obrazovka + větší rozlišení + absence "mobile" v UA
                (isAndroid && isTouchDevice && viewportWidth >= 600 && !isMobilePattern) ||
                // Obecné tablety - dotyková zařízení s rozlišením typickým pro tablety
                (isTouchDevice && viewportWidth >= 768 && viewportWidth <= 1366 && isHighDPI) ||
                // Windows tablety
                (isWindowsMobile && viewportWidth >= 768) ||
                // Kindle, Nook a podobné
                /kindle|nook|kobo/.test(userAgent)
            );
            
            // Kombinované vyhodnocení pro mobilní telefony
            const isMobileDevice = (
                // Explicitní mobilní vzory
                isMobilePattern ||
                // iOS telefony
                (isIOS && !isLikelyTablet) ||
                // Android telefony
                (isAndroid && (isMobilePattern || viewportWidth < 600)) ||
                // Windows Mobile
                (isWindowsMobile && !isLikelyTablet) ||
                // BlackBerry
                isBlackberry ||
                // Opera Mobile
                isOperaMobile ||
                // Velmi malé obrazovky
                isVerySmallScreen ||
                // Malé dotykové zařízení
                (isTouchDevice && isSmallScreen && !isLikelyTablet)
            ) && !isLikelyTablet; // Tablet má přednost
            
            const result = {
                isMobile: isMobileDevice,
                isTablet: isLikelyTablet,
                isMobileOrTablet: isMobileDevice || isLikelyTablet,
                isIOS: isIOS,
                isAndroid: isAndroid,
                isWindowsMobile: isWindowsMobile,
                isTouchDevice: isTouchDevice,
                isSmallScreen: isSmallScreen,
                isMediumScreen: isMediumScreen,
                isLargeScreen: isLargeScreen,
                isVerySmallScreen: isVerySmallScreen,
                isPortrait: isPortrait,
                isLandscape: isLandscape,
                screenWidth: screenWidth,
                screenHeight: screenHeight,
                viewportWidth: viewportWidth,
                viewportHeight: viewportHeight,
                pixelRatio: pixelRatio,
                isHighDPI: isHighDPI,
                userAgent: userAgent,
                platform: platform
            };
            
            return result;
        }
        
        // Vylepšená detekce podpory PDF v prohlížeči
        function checkPdfSupport() {
            return new Promise((resolve) => {
                const mobileInfo = detectMobile();
                
                // Pro iOS zařízení (iPhone, iPad) - obvykle mají problémy s PDF v iframe
                if (mobileInfo.isIOS) {
                    resolve(false);
                    return;
                }
                
                // Pro mobilní zařízení s velmi malou obrazovkou
                if (mobileInfo.isVerySmallScreen) {
                    resolve(false);
                    return;
                }
                
                // Pro všechna mobilní/tablet zařízení zkusíme důkladnější test
                if (mobileInfo.isMobileOrTablet) {
                    
                    // Zkusíme více způsobů detekce
                    let testsPassed = 0;
                    let testsCompleted = 0;
                    const totalTests = 2;
                    
                    // Test 1: Zkusíme načíst minimální PDF
                    const testFrame = document.createElement('iframe');
                    testFrame.style.cssText = 'position: absolute; left: -9999px; width: 1px; height: 1px; opacity: 0;';
                    testFrame.src = 'data:application/pdf;base64,JVBERi0xLjQKJdPr6eEKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMiAwIFIKPj4KZW5kb2JqCjIgMCBvYmoKPDwKL1R5cGUgL1BhZ2VzCi9LaWRzIFsgMyAwIFIgXQovQ291bnQgMQo+PgplbmRvYmoKMyAwIG9iago8PAovVHlwZSAvUGFnZQovUGFyZW50IDIgMCBSCi9NZWRpYUJveCBbIDAgMCA2MTIgNzkyIF0KPj4KZW5kb2JqCnhyZWYKMCA0CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDAwOSAwMDAwMCBuIAowMDAwMDAwMDU4IDAwMDAwIG4gCjAwMDAwMDAxMTUgMDAwMDAgbiAKdHJhaWxlcgo8PAovU2l6ZSA0Ci9Sb290IDEgMCBSCj4+CnN0YXJ0eHJlZgoxOTQKJSVFT0Y=';
                    
                    let test1Resolved = false;
                    
                    const finishTest = () => {
                        testsCompleted++;
                        if (testsCompleted >= totalTests) {
                            if (document.body.contains(testFrame)) {
                                document.body.removeChild(testFrame);
                            }
                            
                            // Pokud prošel alespoň jeden test, považujeme PDF za podporované
                            const isSupported = testsPassed > 0;
                            resolve(isSupported);
                        }
                    };
                    
                    const test1Timeout = setTimeout(() => {
                        if (!test1Resolved) {
                            test1Resolved = true;
                            finishTest();
                        }
                    }, 1000);
                    
                    testFrame.onload = () => {
                        if (!test1Resolved) {
                            test1Resolved = true;
                            clearTimeout(test1Timeout);
                            testsPassed++;
                            finishTest();
                        }
                    };
                    
                    testFrame.onerror = () => {
                        if (!test1Resolved) {
                            test1Resolved = true;
                            clearTimeout(test1Timeout);
                            finishTest();
                        }
                    };
                    
                    document.body.appendChild(testFrame);
                    
                    // Test 2: Kontrola MIME typu podpory
                    setTimeout(() => {
                        try {
                            const mimeSupported = navigator.mimeTypes && 
                                                 navigator.mimeTypes['application/pdf'] && 
                                                 navigator.mimeTypes['application/pdf'].enabledPlugin;

                            if (mimeSupported) {
                                testsPassed++;
                            } else {
                            }
                        } catch (e) {
                            console.warn('PDF test 2 error:', e);
                        }

                        finishTest();
                    }, 200);
                    
                } else {
                    // Desktop - obvykle podporuje PDF
                    resolve(true);
                }
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
                <h4 style="margin: 0 0 10px 0; color: #333; font-size: 16px;">Načítám PDF...</h4>
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
        
        // Vylepšené fallback tlačítka s lepším rozpoznáním zařízení
        function createFallbackButtons() {
            const fallbackDiv = document.createElement('div');
            fallbackDiv.id = `${frameId}_fallback`;
            fallbackDiv.style.cssText = `
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(255, 255, 255, 0.98);
                padding: 25px;
                border-radius: 16px;
                box-shadow: 0 12px 48px rgba(0,0,0,0.3);
                text-align: center;
                z-index: 1002;
                width: min(300px, 60vw);
                max-height: 85vh;
                display: flex;
                flex-direction: column;
                justify-content: center;
                backdrop-filter: blur(20px);
                border: 1px solid rgba(255,255,255,0.3);
                overflow-y: auto;
            `;
            
            const mobileInfo = detectMobile();
            const downloadUrl = pdfPath;
            
            let deviceType = 'zařízení';
            if (mobileInfo.isIOS) deviceType = 'iOS zařízení';
            else if (mobileInfo.isAndroid) deviceType = 'Android zařízení';
            else if (mobileInfo.isTablet) deviceType = 'tablet';
            else if (mobileInfo.isMobile) deviceType = 'mobilní telefon';
            
            fallbackDiv.innerHTML = `
                <h3 style="margin: 0 0 15px 0; color: #333; font-size: 18px; text-align: center;">
                    PDF viewer
                </h3>
                <p style="margin: 0 0 20px 0; font-size: 15px; color: #555; line-height: 1.4;">
                    Vaše ${deviceType} může mít problémy se zobrazením PDF přímo na stránce. Vyberte si způsob zobrazení:
                </p>
                <div style="display: flex; flex-direction: column; gap: 12px;">
                    <a href="${downloadUrl}" target="_blank" 
                       style="display: flex; align-items: center; justify-content: center; gap: 10px; padding: 14px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 8px; font-weight: 500; transition: all 0.3s; width: 100%; box-sizing: border-box; font-size: 15px;"
                       onmouseover="this.style.transform='translateY(-1px)'; this.style.boxShadow='0 4px 12px rgba(0,123,255,0.3)';"
                       onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none';">
                        <span>Otevřít v novém okně</span>
                    </a>
                    
                    <a href="${downloadUrl}" download 
                       style="display: flex; align-items: center; justify-content: center; gap: 10px; padding: 14px 20px; background: #28a745; color: white; text-decoration: none; border-radius: 8px; font-weight: 500; transition: all 0.3s; width: 100%; box-sizing: border-box; font-size: 15px;"
                       onmouseover="this.style.transform='translateY(-1px)'; this.style.boxShadow='0 4px 12px rgba(40,167,69,0.3)';"
                       onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none';">
                        <span>Stáhnout soubor</span>
                    </a>
                    
                    ${pdfLoadAttempts < maxLoadAttempts ? `
                        <button onclick="window.${frameId}_retryFromFallback();"
                                style="display: flex; align-items: center; justify-content: center; gap: 10px; padding: 14px 20px; background: #6c757d; color: white; border: none; border-radius: 8px; font-weight: 500; cursor: pointer; transition: all 0.3s; width: 100%; box-sizing: border-box; font-size: 15px;"
                                onmouseover="this.style.transform='translateY(-1px)'; this.style.boxShadow='0 4px 12px rgba(108,117,125,0.3)';"
                                onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none';">
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
            
            if (mobileInfo.isMobileOrTablet) {
                // Iframe styly pro mobilní zařízení
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
                
                // Overlay styly pro mobilní zařízení
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
                
                // Viewport meta tag pro mobilní zařízení
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
            
            if (pdfLoadAttempts <= maxLoadAttempts) {
                // Přidáme cache buster
                const cacheBuster = `?v=${Date.now()}&attempt=${pdfLoadAttempts}`;
                pdfFrame.src = `${pdfPath}${cacheBuster}`;
                
                // Zobrazíme loading indikátor
                showLoadingIndicator();
            } else {
                showFallbackOptions();
            }
        };
        
        // funkce pro retry z fallback dialogu
        window[`${frameId}_retryFromFallback`] = function() {
            
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
                
                // Po timeoutu zobrazíme fallback
                showFallbackOptions();
            }, loadingTimeoutDuration);
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
            isMobile = mobileInfo.isMobileOrTablet;
            fallbackShown = false;
            pdfLoadAttempts = 0;
            
            
            pdfOverlay.style.display = 'block';
            isPdfOpen = true;
            
            // Aplikujeme styly
            applyMobileStyles();
            
            // Blokujeme scrollování na pozadí
            document.body.style.overflow = 'hidden';
            
            // Zobrazíme loading indikátor nejdříve
            showLoadingIndicator();
            
            // Pro mobilní a tablet zařízení zkontrolujeme podporu PDF
            if (isMobile) {
                const pdfSupported = await checkPdfSupport();
                
                if (!pdfSupported) {
                    // Zobrazíme fallback po loading období
                    setTimeout(() => {
                        showFallbackOptions();
                    }, 1500); // Delší čekání aby bylo vidět loading
                    return;
                }
            }
            
            // Zobrazíme loading indikátor nejdříve
            showLoadingIndicator();
            
            // Načteme PDF
            pdfFrame.style.display = 'block';
            pdfFrame.src = `${pdfPath}?v=${Date.now()}`;
            
            // Nastavíme handlers pro načtení
            const loadHandler = () => {
                hideLoadingIndicator();
                pdfFrame.removeEventListener('load', loadHandler);
                pdfFrame.removeEventListener('error', errorHandler);
            };
            
            const errorHandler = () => {
                pdfFrame.removeEventListener('load', loadHandler);
                pdfFrame.removeEventListener('error', errorHandler);
                
                // Při chybě zobrazíme fallback
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
                if (newMobileInfo.isMobileOrTablet !== isMobile) {
                    isMobile = newMobileInfo.isMobileOrTablet;
                    applyMobileStyles();
                }
            }
        });
        
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

// -------PDF FUNCIONALITY ORIGIN OF LIFE------- //

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
        console.error('Some of the required elements for PDF viewer were not found');
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
            console.warn('Fallback: Using alternative method for PDF control');
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
                console.warn('Focus management fallback');
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
        
    }
    
    // Funkce pro zavření PDF
    function closePdfViewer() {
        pdfOverlay.style.display = 'none';
        pdfFrame.src = '';
        // Nemusíme obnovovat overflow, protože jsme ho neblokovali
        isPdfOpen = false;
        pdfHasFocus = false;
        
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
        e.stopPropagation();
    });
    
    // Handler pro kliknutí mimo PDF (ale uvnitř overlay) - odebere focus z PDF
    pdfOverlay.addEventListener('click', function(e) {
        // Pokud klikneme mimo PDF iframe, ale stále uvnitř overlay
        if (e.target !== pdfFrame && !pdfFrame.contains(e.target)) {
            pdfHasFocus = false;
        }
    });
    
    // Handler při načtení PDF
    pdfFrame.addEventListener('load', function() {
        if (isPdfOpen) {
            // Při načtení PDF stále nemá automaticky focus
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
    
});

// -------PDF FUNCIONALITY PRESAH------- //

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
        console.error('Some of the required elements for PDF viewer were not found');
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
            console.warn('Fallback: Using alternative method for PDF control');
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
                console.warn('Focus management fallback');
            }
        }, 200);
    }
    
    // Funkce pro otevření PDF
    function openPdfViewer() {
        pdfFrame.src = 'docs/presah.pdf'; // Změněna cesta k PDF souboru
        pdfOverlay.style.display = 'block';
        isPdfOpen = true;
        pdfHasFocus = false;
    }
    
    // Funkce pro zavření PDF
    function closePdfViewer() {
        pdfOverlay.style.display = 'none';
        pdfFrame.src = '';
        // Nemusíme obnovovat overflow, protože jsme ho neblokovali
        isPdfOpen = false;
        pdfHasFocus = false;
        
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
        e.stopPropagation();
    });
    
    // Handler pro kliknutí mimo PDF (ale uvnitř overlay) - odebere focus z PDF
    pdfOverlay.addEventListener('click', function(e) {
        // Pokud klikneme mimo PDF iframe, ale stále uvnitř overlay
        if (e.target !== pdfFrame && !pdfFrame.contains(e.target)) {
            pdfHasFocus = false;
        }
    });
    
    // Handler při načtení PDF
    pdfFrame.addEventListener('load', function() {
        if (isPdfOpen) {
            // Při načtení PDF stále nemá automaticky focus
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
    
});