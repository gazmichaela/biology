//-------PDF FUNCIONALITY--------//
// Počkáme na načtení stránky
document.addEventListener('DOMContentLoaded', function() {
    // Získáme reference na elementy
    const showPdfBtn = document.getElementById('showPdfBtn');
    
    // Pokud element showPdfBtn neexistuje na aktuální stránce, ukončíme inicializaci PDF prohlížeče
    if (!showPdfBtn) {
        return; // Ukončíme inicializaci, pokud tlačítko neexistuje
    }
    
    // Pokračujeme pouze pokud existuje tlačítko pro zobrazení PDF
    const pdfOverlay = document.getElementById('pdfOverlay');
    const pdfCloseBtn = document.getElementById('pdfCloseBtn');
    const pdfFrame = document.getElementById('pdfFrame');
    
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
        pdfFrame.src = 'docs/darwin.pdf';
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
    
    console.log('PDF viewer inicializován s inteligentním focus managementem a potlačením beforeunload varování');
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