document.addEventListener("DOMContentLoaded", function() {
    // Inicializace dropdown menu
    initializeDropdownMenus();

    function initializeDropdownMenus() {
        // Globální sledování pozice myši
        let mouseX = parseInt(localStorage.getItem('mouseX')) || 0;
        let mouseY = parseInt(localStorage.getItem('mouseY')) || 0;
        let throttleTimer;
        
        // Najdeme dropdown prvky - proměnné budou obnoveny později
        let dropdownToggle = document.getElementById('dropdown-toggle');
        let dropdownContent = document.getElementById('dropdown-content');
        let dropdownToggle2 = document.getElementById('dropdown-toggle2');
        let dropdownContent2 = document.getElementById('dropdown-content2');
        let subDropdownToggle = document.getElementById('sub-dropdown-toggle');
        let subDropdownContent = document.getElementById('sub-dropdown-content');
        
        // Proměnné pro sledování stavu kliknutí
        let isClickOpened = localStorage.getItem('isFirstMenuOpen') === 'true';
        let isClickOpened2 = localStorage.getItem('isSecondMenuOpen') === 'true';
        let isClickOpenedSub = localStorage.getItem('isSubMenuOpen') === 'true';
        
        // Indikátory připravenosti jednotlivých dropdownů
        let firstDropdownReady = false;
        let secondDropdownReady = false;
        let subDropdownReady = false;
        
        // Pomocná proměnná pro sledování, zda byl stav menu již obnoven
        let menuStateRestored = false;
        
        // Okamžitě zkontrolujeme, zda jsou dropdown prvky k dispozici
        checkForDropdownElements();
        
        // NOVÉ: Okamžitě obnovíme stav myši nad prvky
        // Toto provádět ihned, nečekat na obrázky
        let fastRefreshTimer = setTimeout(function() {
            if (!menuStateRestored) {
                checkMousePositionAndRestoreMenu();
            }
        }, 50); // Velmi krátký timeout pro co nejrychlejší reakci
        
        // Bezpečnostní časovač pro případ, že by selhalo načítání
        let safetyTimeout = setTimeout(function() {
            if (!menuStateRestored) {
                restoreMenuStateOnLoad();
            }
        }, 1000);
        
        // Funkce pro kontrolu pozice myši a obnovy menu
        function checkMousePositionAndRestoreMenu() {
            // Zkontrolujeme, zda jsou dropdown prvky k dispozici
            checkForDropdownElements();
            
            // Pokud už byl stav menu obnoven, nečiníme nic
            if (menuStateRestored) return;
            
            // Obnovit stav menu podle pozice myši, ale pouze pokud jsme měli
            // myš nad tlačítkem před refreshem
            const isMouseOverFirstToggle = localStorage.getItem('isMouseOverFirstToggle') === 'true';
            const isMouseOverSecondToggle = localStorage.getItem('isMouseOverSecondToggle') === 'true';
            
            // Ihned zkontrolujeme aktuální pozici myši a porovnáme s uloženými souřadnicemi
            // Toto pomůže zajistit, že pokud je myš skutečně nad tlačítkem, menu se zobrazí
            if (dropdownToggle && firstDropdownReady) {
                const toggleRect = dropdownToggle.getBoundingClientRect();
                const isNowOverFirstToggle = isPointInRect(mouseX, mouseY, toggleRect);
                
                // Pokud byla myš nad prvním tlačítkem před refreshem nebo je nad ním i nyní
                if ((isMouseOverFirstToggle || isNowOverFirstToggle) && !isClickOpened2 && !isClickOpenedSub) {
                    showMenu();
                    if (isMouseOverFirstToggle) {
                        isClickOpened = true;
                        localStorage.setItem('isFirstMenuOpen', 'true');
                    }
                }
            }
            
            if (dropdownToggle2 && secondDropdownReady) {
                const toggleRect2 = dropdownToggle2.getBoundingClientRect();
                const isNowOverSecondToggle = isPointInRect(mouseX, mouseY, toggleRect2);
                
                // Pokud byla myš nad druhým tlačítkem před refreshem nebo je nad ním i nyní
                if ((isMouseOverSecondToggle || isNowOverSecondToggle) && !isClickOpened && !isClickOpenedSub) {
                    showMenu2();
                    if (isMouseOverSecondToggle) {
                        isClickOpened2 = true;
                        localStorage.setItem('isSecondMenuOpen', 'true');
                    }
                }
            }
            
            // Pokud bylo menu otevřeno kliknutím, obnovíme tento stav
            if (isClickOpened && dropdownContent && firstDropdownReady) {
                showMenu();
            }
            
            if (isClickOpened2 && dropdownContent2 && secondDropdownReady) {
                showMenu2();
            }
            
            if (isClickOpenedSub && subDropdownContent && subDropdownReady) {
                showMenuSub();
            }
            
            // Označíme, že menu bylo obnoveno
            menuStateRestored = true;
        }
        
        // Funkce pro kontrolu, zda jsou dropdown prvky k dispozici
        function checkForDropdownElements() {
            // Kontrola prvního dropdownu
            if (!firstDropdownReady) {
                dropdownToggle = document.getElementById('dropdown-toggle');
                dropdownContent = document.getElementById('dropdown-content');
                
                if (dropdownToggle && dropdownContent) {
                    firstDropdownReady = true;
                    setupFirstDropdownListeners();
                }
            }
            
            // Kontrola druhého dropdownu
            if (!secondDropdownReady) {
                dropdownToggle2 = document.getElementById('dropdown-toggle2');
                dropdownContent2 = document.getElementById('dropdown-content2');
                
                if (dropdownToggle2 && dropdownContent2) {
                    secondDropdownReady = true;
                    setupSecondDropdownListeners();
                }
            }
            
            // Kontrola sub-dropdownu
            if (!subDropdownReady) {
                subDropdownToggle = document.getElementById('sub-dropdown-toggle');
                subDropdownContent = document.getElementById('sub-dropdown-content');
                
                if (subDropdownToggle && subDropdownContent) {
                    subDropdownReady = true;
                    setupSubDropdownListeners();
                }
            }
        }
        
        // Při načtení stránky zkontrolujeme, zda máme obnovit menu podle localStorage
        function restoreMenuStateOnLoad() {
            // Pokud už byl stav obnoven, nepokračujeme
            if (menuStateRestored) return;
            
            // Zkontrolujeme, zda jsou dropdown prvky k dispozici
            checkForDropdownElements();
            
            // Obnovit stav menu podle pozice myši
            checkMousePositionAndRestoreMenu();
            
            // Označíme, že menu bylo obnoveno
            menuStateRestored = true;
        }

        // Funkce pro zajištění, že dropdown elementy jsou načteny a připraveny
        function ensureDropdownElementsReady(callback) {
            // Zkontrolujeme, zda jsou dropdown prvky k dispozici
            checkForDropdownElements();
            
            // Pokud jsou všechny ready, voláme callback
            if (firstDropdownReady && secondDropdownReady && subDropdownReady) {
                callback();
                return;
            }
            
            // Pokud ještě nejsou ready, počkáme a zkusíme to znovu
            setTimeout(function() {
                ensureDropdownElementsReady(callback);
            }, 50);
        }
        
        // Funkce pro vyčištění stavu menu v localStorage při navigaci
        function clearMenuStateOnNavigation() {
            localStorage.removeItem('isFirstMenuOpen');
            localStorage.removeItem('isSecondMenuOpen');
            localStorage.removeItem('isSubMenuOpen');
            localStorage.removeItem('isMouseOverFirstToggle');
            localStorage.removeItem('isMouseOverSecondToggle');
        }

        // Implementace throttling pro mousemove událost
        function throttleMouseMove(callback, delay) {
            return function(e) {
                if (!throttleTimer) {
                    throttleTimer = setTimeout(function() {
                        callback(e);
                        throttleTimer = null;
                    }, delay);
                }
            };
        }
        
        // Optimalizovaný event listener pro mousemove
        document.addEventListener("mousemove", throttleMouseMove(function(e) {
            mouseX = e.clientX;
            mouseY = e.clientY;
            
            // Uložíme aktuální pozici myši do localStorage
            localStorage.setItem('mouseX', mouseX);
            localStorage.setItem('mouseY', mouseY);
            
            // Zkontrolujeme, zda jsou dropdown prvky k dispozici
            checkForDropdownElements();
            
            // Kontrola myši nad dropdown tlačítky
            if (firstDropdownReady && dropdownToggle && isElementVisible(dropdownToggle)) {
                const toggleRect = dropdownToggle.getBoundingClientRect();
                const isOverFirstToggle = isPointInRect(mouseX, mouseY, toggleRect);
                localStorage.setItem('isMouseOverFirstToggle', isOverFirstToggle ? 'true' : 'false');
                
                // Pokud máme myš nad tlačítkem a menu není otevřené kliknutím
                if (isOverFirstToggle && !isClickOpened && !isClickOpened2 && !isClickOpenedSub) {
                    showMenu();
                }
            }
            
            if (secondDropdownReady && dropdownToggle2 && isElementVisible(dropdownToggle2)) {
                const toggleRect2 = dropdownToggle2.getBoundingClientRect();
                const isOverSecondToggle = isPointInRect(mouseX, mouseY, toggleRect2);
                localStorage.setItem('isMouseOverSecondToggle', isOverSecondToggle ? 'true' : 'false');
                
                // Pokud máme myš nad druhým tlačítkem a menu není otevřené kliknutím
                if (isOverSecondToggle && !isClickOpened && !isClickOpened2 && !isClickOpenedSub) {
                    showMenu2();
                }
            }
        }, 30)); // Rychlejší throttling pro lepší odezvu
        
        // Pomocná funkce pro kontrolu, zda je bod v obdélníku
        function isPointInRect(x, y, rect) {
            return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
        }
        
        // Pomocná funkce pro kontrolu, zda je element viditelný
        function isElementVisible(el) {
            return el && el.offsetParent !== null;
        }

        // Optimalizované funkce pro zobrazení a skrytí menu
        function showMenu() {
            if (!dropdownContent || !firstDropdownReady) return;
            
            // Použijeme requestAnimationFrame pro plynulejší animace
            requestAnimationFrame(function() {
                dropdownContent.style.display = "block";
                
                // Použijeme další frame pro nastavení opacity (optimalizace reflow)
                requestAnimationFrame(function() {
                    dropdownContent.style.opacity = "1";
                    localStorage.setItem('isFirstMenuOpen', 'true');
                });
            });
        }

        function hideMenu() {
            if (!dropdownContent || !firstDropdownReady) return;
            
            dropdownContent.style.opacity = "0";
            
            // Používáme neanimované skrytí pro rychlejší reakci
            setTimeout(function() {
                // Kontrolujeme, zda mezitím nedošlo k zobrazení menu
                if (dropdownContent && dropdownContent.style.opacity === "0") {
                    dropdownContent.style.display = "none";
                }
            }, 100); // Rychlejší čas pro skrytí
            
            localStorage.setItem('isFirstMenuOpen', 'false');
        }

        function showMenu2() {
            if (!dropdownContent2 || !secondDropdownReady) return;
            
            requestAnimationFrame(function() {
                dropdownContent2.style.display = "block";
                
                requestAnimationFrame(function() {
                    dropdownContent2.style.opacity = "1";
                    localStorage.setItem('isSecondMenuOpen', 'true');
                });
            });
        }

        function hideMenu2() {
            if (!dropdownContent2 || !secondDropdownReady) return;
            
            dropdownContent2.style.opacity = "0";
            
            setTimeout(function() {
                if (dropdownContent2 && dropdownContent2.style.opacity === "0") {
                    dropdownContent2.style.display = "none";
                }
            }, 100);
            
            localStorage.setItem('isSecondMenuOpen', 'false');
        }

        function showMenuSub() {
            if (!subDropdownContent || !subDropdownReady) return;
            
            requestAnimationFrame(function() {
                subDropdownContent.style.display = "block";
                
                requestAnimationFrame(function() {
                    subDropdownContent.style.opacity = "1";
                    localStorage.setItem('isSubMenuOpen', 'true');
                });
            });
        }

        function hideMenuSub() {
            if (!subDropdownContent || !subDropdownReady) return;
            
            subDropdownContent.style.opacity = "0";
            
            setTimeout(function() {
                if (subDropdownContent && subDropdownContent.style.opacity === "0") {
                    subDropdownContent.style.display = "none";
                }
            }, 100);
            
            localStorage.setItem('isSubMenuOpen', 'false');
        }

        // Optimalizovaná funkce pro zavření všech menu
        function closeAllMenus() {
            hideMenu();
            hideMenu2();
            hideMenuSub();
            isClickOpened = false;
            isClickOpened2 = false;
            isClickOpenedSub = false;
        }

        // Funkce pro zavření všech menu kromě specifikovaného
        function closeAllMenusExcept(exceptMenuId) {
            // Zavření prvního menu, pokud není výjimka
            if (exceptMenuId !== 'first-menu' && dropdownContent && dropdownContent.style.opacity === "1") {
                hideMenu();
                isClickOpened = false;
            }
            
            // Zavření druhého menu, pokud není výjimka
            if (exceptMenuId !== 'second-menu' && dropdownContent2 && dropdownContent2.style.opacity === "1") {
                hideMenu2();
                isClickOpened2 = false;
            }
            
            // Zavření podmenu, pokud není výjimka
            if (exceptMenuId !== 'sub-menu' && subDropdownContent && subDropdownContent.style.opacity === "1") {
                hideMenuSub();
                isClickOpenedSub = false;
            }
        }

        // Přidání event listenerů - s kontrolou připravenosti prvního dropdownu
        function setupFirstDropdownListeners() {
            if (!firstDropdownReady || !dropdownToggle || !dropdownContent) {
                return; // Tato funkce bude volána znovu při checkForDropdownElements
            }
            
            // Přidáme event listenery pouze jednou
            if (dropdownToggle.hasAttribute('data-event-listeners-added')) {
                return;
            }
            
            dropdownToggle.setAttribute('data-event-listeners-added', 'true');
            
            dropdownToggle.addEventListener("click", function(e) {
                e.stopPropagation();
                if (isClickOpened) {
                    hideMenu();
                    isClickOpened = false;
                } else {
                    closeAllMenusExcept('first-menu');
                    showMenu();
                    isClickOpened = true;
                }
            });

            dropdownToggle.addEventListener("mouseenter", function() {
                if (!isClickOpened && !isClickOpened2 && !isClickOpenedSub) {
                    showMenu();
                }
            });

            dropdownContent.addEventListener("mouseleave", function(e) {
                if (!isClickOpened) {
                    const rect = dropdownContent.getBoundingClientRect();
                    const isMouseInsideMenu = (
                        mouseX >= rect.left && mouseX <= rect.right &&
                        mouseY >= rect.top && mouseY <= rect.bottom
                    );
                    
                    if (!isMouseInsideMenu && !isPointInRect(mouseX, mouseY, dropdownToggle.getBoundingClientRect())) {
                        hideMenu();
                    }
                }
            });
        }

        // Přidání event listenerů - s kontrolou připravenosti druhého dropdownu
        function setupSecondDropdownListeners() {
            if (!secondDropdownReady || !dropdownToggle2 || !dropdownContent2) {
                return; // Tato funkce bude volána znovu při checkForDropdownElements
            }
            
            // Přidáme event listenery pouze jednou
            if (dropdownToggle2.hasAttribute('data-event-listeners-added')) {
                return;
            }
            
            dropdownToggle2.setAttribute('data-event-listeners-added', 'true');
            
            dropdownToggle2.addEventListener("click", function(e) {
                e.stopPropagation();
                if (isClickOpened2) {
                    hideMenu2();
                    isClickOpened2 = false;
                } else {
                    closeAllMenusExcept('second-menu');
                    showMenu2();
                    isClickOpened2 = true;
                }
            });

            dropdownToggle2.addEventListener("mouseenter", function() {
                if (!isClickOpened && !isClickOpened2 && !isClickOpenedSub) {
                    showMenu2();
                }
            });

            dropdownContent2.addEventListener("mouseleave", function(e) {
                if (!isClickOpened2) {
                    const rect = dropdownContent2.getBoundingClientRect();
                    const isMouseInsideMenu = (
                        mouseX >= rect.left && mouseX <= rect.right &&
                        mouseY >= rect.top && mouseY <= rect.bottom
                    );
                    
                    if (!isMouseInsideMenu && !isPointInRect(mouseX, mouseY, dropdownToggle2.getBoundingClientRect())) {
                        hideMenu2();
                    }
                }
            });
        }

        // Přidání event listenerů - s kontrolou připravenosti sub-dropdownu
        function setupSubDropdownListeners() {
            if (!subDropdownReady || !subDropdownToggle || !subDropdownContent) {
                return; // Tato funkce bude volána znovu při checkForDropdownElements
            }
            
            // Přidáme event listenery pouze jednou
            if (subDropdownToggle.hasAttribute('data-event-listeners-added')) {
                return;
            }
            
            subDropdownToggle.setAttribute('data-event-listeners-added', 'true');
            
            subDropdownToggle.addEventListener("click", function(e) {
                e.stopPropagation();
                if (isClickOpenedSub) {
                    hideMenuSub();
                    isClickOpenedSub = false;
                } else {
                    closeAllMenusExcept('sub-menu');
                    showMenuSub();
                    isClickOpenedSub = true;
                }
            });
        }

        // Event listener pro kliknutí mimo menu - zavře všechny menu
        document.addEventListener("click", function(e) {
            // Rychlá kontrola, zda bylo kliknuto mimo menu
            const target = e.target;
            
            // Nejprve zkontrolujeme, zda cíl kliknutí je odkaz - prioritizujeme nejčastější operaci
            if (target.tagName === 'A' || target.closest('a')) {
                clearMenuStateOnNavigation();
                closeAllMenus();
                return; // Ukončíme funkci, abychom neprováděli zbytečné kontroly
            }
            
            // Poté zkontrolujeme, zda kliknutí bylo mimo menu a tlačítka
            const isOutsideMenus = !(
                (dropdownToggle && dropdownToggle.contains(target)) ||
                (dropdownContent && dropdownContent.contains(target)) ||
                (dropdownToggle2 && dropdownToggle2.contains(target)) ||
                (dropdownContent2 && dropdownContent2.contains(target)) ||
                (subDropdownToggle && subDropdownToggle.contains(target)) ||
                (subDropdownContent && subDropdownContent.contains(target))
            );
            
            if (isOutsideMenus) {
                closeAllMenus();
            }
        }, { passive: true });
        
        
        
        // Event listener pro obnovení stránky (F5, Ctrl+R)
        // Detekce obnovení stránky je těžká, ale můžeme využít beforeunload event 
        // a localStorage pro zachování informace, že se jedná o refresh
        window.addEventListener('beforeunload', function(e) {
            // Nastavíme příznak, že jde o refresh, nikoliv navigaci
            localStorage.setItem('isRefreshing', 'true');
            
            // Nastavíme timeout, který za 500ms smaže příznak refreshe
            // (pokud nebude stránka načtena znovu do té doby)
            setTimeout(function() {
                localStorage.removeItem('isRefreshing');
            }, 500);
        });
        
        // Přidáme event listenery na odkazy v navigaci - vytváříme jen jednou
        if (!document.body.hasAttribute('data-link-listeners-added')) {
            document.body.setAttribute('data-link-listeners-added', 'true');
            document.querySelectorAll('a').forEach(function(link) {
                link.addEventListener('click', function(e) {
                    // Pokud neklikáme na odkaz, který by obnovil stránku (href="#" nebo href="")
                    if (link.getAttribute('href') !== '#' && link.getAttribute('href') !== '') {
                        clearMenuStateOnNavigation();
                    }
                });
            });
        }
        
        // NOVÉ: Zlepšený kód pro agresivnější obnovu stavu menu při refreshi
        function setupAggressiveRefreshHandling() {
            // Kontrolujeme, zda jde o refresh stránky
            const isRefresh = localStorage.getItem('isRefreshing') === 'true';
            localStorage.removeItem('isRefreshing');
            
            if (isRefresh) {
                // Byla to akce refresh - musíme agresivněji obnovit stav
                // Nastavíme sérii časovačů, které budou zkoušet obnovit stav menu
                const refreshTimers = [10, 30, 50, 100, 200, 300, 500, 1000];
                
                refreshTimers.forEach(function(time) {
                    setTimeout(function() {
                        if (!menuStateRestored) {
                            checkForDropdownElements();
                            checkMousePositionAndRestoreMenu();
                        }
                    }, time);
                });
            }
            
            // Zjistíme počet obrázků na stránce
            const images = document.querySelectorAll('img');
            const totalImages = images.length;
            
            // Pokud je na stránce hodně obrázků, budeme agresivněji obnovovat stav menu
            if (totalImages > 20) {
                // Paralelní kontrola pro případ, že by došlo k pomalému načítání
                // Důležité: zkontrolovat stav menu několikrát v různých časech
                const additionalTimers = [50, 150, 300, 600, 1000, 1500, 2000];
                
                additionalTimers.forEach(function(time) {
                    setTimeout(function() {
                        if (!menuStateRestored) {
                            checkForDropdownElements();
                            checkMousePositionAndRestoreMenu();
                        }
                    }, time);
                });
                
                // Pro stránky s hodně obrázky také budeme pravidelně kontrolovat
                // pozici myši a stav menu
                let checkCount = 0;
                const maxChecks = 10;
                const checkInterval = setInterval(function() {
                    checkCount++;
                    
                    if (!menuStateRestored) {
                        checkForDropdownElements();
                        checkMousePositionAndRestoreMenu();
                    }
                    
                    if (menuStateRestored || checkCount >= maxChecks) {
                        clearInterval(checkInterval);
                    }
                }, 200);
            }
        }
        
        // Spustíme agresivní zpracování obnovy při refreshi
        setupAggressiveRefreshHandling();
        
        // Přidáme reakci na načtení všech zdrojů (obrázky, CSS, skripty)
        window.addEventListener('load', function() {
            clearTimeout(safetyTimeout);
            
            // Naposledy zkontrolujeme, zda byl stav menu obnoven
            if (!menuStateRestored) {
                checkForDropdownElements();
                restoreMenuStateOnLoad();
            }
        });
        
        // Přidáme reakci na změnu velikosti okna
        window.addEventListener('resize', throttleMouseMove(function() {
            // Zkontrolujeme, zda byla okna změněna a aktualizujeme stav menu
            checkForDropdownElements();
            
            // Aktualizujeme stav menu podle nové pozice tlačítek
            if (firstDropdownReady && dropdownToggle && isElementVisible(dropdownToggle)) {
                const toggleRect = dropdownToggle.getBoundingClientRect();
                const isOverFirstToggle = isPointInRect(mouseX, mouseY, toggleRect);
                localStorage.setItem('isMouseOverFirstToggle', isOverFirstToggle ? 'true' : 'false');
                
                // Aktualizujeme zobrazení menu podle nové pozice myši
                if (isOverFirstToggle && !isClickOpened2 && !isClickOpenedSub) {
                    if (!isClickOpened) {
                        showMenu();
                    }
                } else if (!isClickOpened && dropdownContent && dropdownContent.style.opacity === "1") {
                    hideMenu();
                }
            }
            
            if (secondDropdownReady && dropdownToggle2 && isElementVisible(dropdownToggle2)) {
                const toggleRect2 = dropdownToggle2.getBoundingClientRect();
                const isOverSecondToggle = isPointInRect(mouseX, mouseY, toggleRect2);
                localStorage.setItem('isMouseOverSecondToggle', isOverSecondToggle ? 'true' : 'false');
                
                // Aktualizujeme zobrazení menu podle nové pozice myši
                if (isOverSecondToggle && !isClickOpened && !isClickOpenedSub) {
                    if (!isClickOpened2) {
                        showMenu2();
                    }
                } else if (!isClickOpened2 && dropdownContent2 && dropdownContent2.style.opacity === "1") {
                    hideMenu2();
                }
            }
        }, 100), { passive: true });
        
        // Bezpečnostní kód pro MutationObserver - detekce změn v DOM
        // Užitečné pro dynamické stránky, kde mohou být dropdown menu přidávány po načtení
        const observer = new MutationObserver(function(mutations) {
            // Kontrolujeme, zda byly přidány nebo změněny dropdown prvky
            let needsCheck = false;
            
            for (let mutation of mutations) {
                if (mutation.type === 'childList' && mutation.addedNodes.length) {
                    needsCheck = true;
                    break;
                }
            }
            
            if (needsCheck) {
                checkForDropdownElements();
                
                // Pokud máme uloženou pozici myši nad některým tlačítkem, obnovíme stav menu
                const isMouseOverFirstToggle = localStorage.getItem('isMouseOverFirstToggle') === 'true';
                const isMouseOverSecondToggle = localStorage.getItem('isMouseOverSecondToggle') === 'true';
                
                if ((isMouseOverFirstToggle || isMouseOverSecondToggle) && !menuStateRestored) {
                    checkMousePositionAndRestoreMenu();
                }
            }
        });
        
        // Spustíme MutationObserver
        observer.observe(document.body, { childList: true, subtree: true });
        
        // Pokud selže všechno ostatní, zkusíme ještě jednou obnovit stav menu
        // pomocí requestIdleCallback (pokud je k dispozici)
        if ('requestIdleCallback' in window) {
            requestIdleCallback(function() {
                if (!menuStateRestored) {
                    checkForDropdownElements();
                    restoreMenuStateOnLoad();
                }
            }, { timeout: 2000 });
        } else {
            // Fallback pro prohlížeče, které nepodporují requestIdleCallback
            setTimeout(function() {
                if (!menuStateRestored) {
                    checkForDropdownElements();
                    restoreMenuStateOnLoad();
                }
            }, 1500);
        }
    }
});
// ----- DROPDOWN MENU FUNCTIONALITY (PRVNÍ MENU) -----
const dropdownToggle = document.querySelector(".dropdown-toggle");
const dropdownContent = document.querySelector(".dropdown-content");

// Ověříme, zda prvky existují
if (dropdownToggle && dropdownContent) {
    let hideTimeoutFirst;
    let animationTimeoutFirst;
    let inactivityTimeoutFirst; // Timeout pro neaktivitu
    let repositionTimeoutFirst; // Timeout pro přepočet pozice
    const inactivityDelay = 2000; // 2 sekundy neaktivity
    let isClickOpened = false; // Flag pro zjištění, zda bylo menu otevřeno kliknutím
    let isSubmenuActive = false; // Flag pro zjištění, zda je aktivní submenu
    
    // Globální proměnné pro pozici myši - inicializujeme je zde
    let mouseX = parseInt(localStorage.getItem('mouseX')) || 0;
    let mouseY = parseInt(localStorage.getItem('mouseY')) || 0;
    
    // Předpřiprava stylu pro plynulou animaci
    dropdownContent.style.transition = "opacity 0.3s ease-in-out, visibility 0.3s ease-in-out";
    dropdownContent.style.opacity = "0";
    dropdownContent.style.visibility = "hidden";
    dropdownContent.style.display = "none";
    
    // Vytvoříme element pro mrtvou zónu mezi tlačítkem a menu
    const deadZoneElement = document.createElement("div");
    deadZoneElement.className = "dropdown-dead-zone";
    
    // Vložíme element do DOM a nastavíme mu potřebné styly
    document.body.appendChild(deadZoneElement);
    deadZoneElement.style.position = "absolute";
    deadZoneElement.style.display = "none";
    deadZoneElement.style.zIndex = "999"; // Vysoký z-index
    
    // Funkce pro nastavení pozice a rozměrů mrtvé zóny s vyšší spolehlivostí
    function positionDeadZone() {
        if (dropdownContent.style.display === "block") {
            // Použijeme requestAnimationFrame pro lepší optimalizaci
            requestAnimationFrame(() => {
                const toggleRect = dropdownToggle.getBoundingClientRect();
                const contentRect = dropdownContent.getBoundingClientRect();
                
                deadZoneElement.style.left = Math.min(toggleRect.left, contentRect.left) + window.scrollX + "px";
                deadZoneElement.style.top = toggleRect.bottom + window.scrollY + "px";
                deadZoneElement.style.width = Math.max(contentRect.width, toggleRect.width) + "px";
                deadZoneElement.style.height = (contentRect.top - toggleRect.bottom) + "px";
                deadZoneElement.style.display = "block";
            });
        } else {
            deadZoneElement.style.display = "none";
        }
    }
    
    // Funkce pro kontinuální přepočítání pozice
    function startPositionMonitoring() {
        clearTimeout(repositionTimeoutFirst);
        
        // Přepočítej pozici ihned
        positionDeadZone();
        
        // Naplánuj další přepočet
        repositionTimeoutFirst = setTimeout(() => {
            if (dropdownContent.style.display === "block") {
                startPositionMonitoring();
            }
        }, 200); // Každých 200ms kontroluj a přepočítej pozici
    }
    
    // Funkce pro zobrazení menu - UPRAVENO PRO SPOLEHLIVOST
    function showMenu() {
        // Zrušíme všechny předchozí timeouty
        clearTimeout(hideTimeoutFirst);
        clearTimeout(animationTimeoutFirst);
        clearTimeout(inactivityTimeoutFirst);
        
        // Reset stavu zavírání
        isClosingInProgress = false;
        
        // Nejprve zobrazíme element (bez čekání)
        dropdownContent.style.display = "block";
        
        // Použijeme requestAnimationFrame místo setTimeout pro plynulejší animaci
        requestAnimationFrame(() => {
            dropdownContent.style.opacity = "1";
            dropdownContent.style.visibility = "visible";
            
            // Spustíme kontinuální monitorování pozice
            startPositionMonitoring();
        });
        
        // Pokud je menu otevřeno kliknutím, nastavíme timeout pro zavření po neaktivitě
        if (isClickOpened) {
            startInactivityTimer();
            // Uložení stavu do localStorage
            localStorage.setItem('isFirstMenuOpen', 'true');
        }
    }
    
    // Funkce pro spuštění časovače nečinnosti
    function startInactivityTimer() {
        clearTimeout(inactivityTimeoutFirst);
        inactivityTimeoutFirst = setTimeout(() => {
            // Kontrola pozice kurzoru před zavřením
            const menuRect = dropdownContent.getBoundingClientRect();
            const toggleRect = dropdownToggle.getBoundingClientRect();
            
            // Kontrola submenu a jeho prvků
            const subDropdownContent = document.querySelector(".sub-dropdown-content");
            const subDropdownToggle = document.querySelector(".sub-dropdown-toggle");
            const deadZoneElementSub = document.querySelector(".sub-dropdown-dead-zone");
            
            let isMouseOverSubElements = false;
            
            if (subDropdownContent && subDropdownContent.style.display === "block") {
                const subMenuRect = subDropdownContent.getBoundingClientRect();
                if (mouseX >= subMenuRect.left && mouseX <= subMenuRect.right && 
                    mouseY >= subMenuRect.top && mouseY <= subMenuRect.bottom) {
                    isMouseOverSubElements = true;
                }
            }
            
            if (subDropdownToggle) {
                const subToggleRect = subDropdownToggle.getBoundingClientRect();
                if (mouseX >= subToggleRect.left && mouseX <= subToggleRect.right && 
                    mouseY >= subToggleRect.top && mouseY <= subToggleRect.bottom) {
                    isMouseOverSubElements = true;
                }
            }
            
            if (deadZoneElementSub && deadZoneElementSub.style.display === "block") {
                const subDeadRect = deadZoneElementSub.getBoundingClientRect();
                if (mouseX >= subDeadRect.left && mouseX <= subDeadRect.right && 
                    mouseY >= subDeadRect.top && mouseY <= subDeadRect.bottom) {
                    isMouseOverSubElements = true;
                }
            }
            
            // Kontrola hlavních prvků
            const isMouseOverMenu = 
                mouseX >= menuRect.left && 
                mouseX <= menuRect.right && 
                mouseY >= menuRect.top && 
                mouseY <= menuRect.bottom;
                
            const isMouseOverToggle = 
                mouseX >= toggleRect.left && 
                mouseX <= toggleRect.right && 
                mouseY >= toggleRect.top && 
                mouseY <= toggleRect.bottom;
                
            const isMouseOverDeadZone = 
                deadZoneElement.style.display === "block" &&
                mouseX >= deadZoneElement.getBoundingClientRect().left && 
                mouseX <= deadZoneElement.getBoundingClientRect().right && 
                mouseY >= deadZoneElement.getBoundingClientRect().top && 
                mouseY <= deadZoneElement.getBoundingClientRect().bottom;
            
            // Zavřít menu pouze pokud kurzor není nad žádným z menu prvků
            if (!isMouseOverMenu && !isMouseOverToggle && !isMouseOverDeadZone && !isMouseOverSubElements) {
                hideMenu();
                isClickOpened = false;
            } else {
                // Pokud je kurzor nad některým prvkem, prodloužit časovač
                startInactivityTimer();
            }
        }, inactivityDelay);
    }
    
    // Příznak pro koordinaci animace zavření
    let isClosingInProgress = false;
    
    // Funkce pro skrytí menu - UPRAVENO PRO SPOLEHLIVOST
    function hideMenu() {
        // Zrušíme všechny předchozí timeouty
        clearTimeout(hideTimeoutFirst);
        clearTimeout(animationTimeoutFirst);
        clearTimeout(inactivityTimeoutFirst);
        clearTimeout(repositionTimeoutFirst); // Zrušit monitorování pozice
        
        // Nastavíme příznak, že probíhá zavírání
        isClosingInProgress = true;
        
        // Nejprve spustíme animaci průhlednosti
        dropdownContent.style.opacity = "0";
        dropdownContent.style.visibility = "hidden";
        
        // Také musíme vyvolat zavření submenu
        if (typeof window.closeSubMenuWithParent === 'function') {
            window.closeSubMenuWithParent();
        }
        
        // Po dokončení animace skryjeme prvky úplně
        animationTimeoutFirst = setTimeout(() => {
            dropdownContent.style.display = "none";
            deadZoneElement.style.display = "none";
            
            // Také skryjeme submenu po dokončení animace
            const subDropdownContent = document.querySelector(".sub-dropdown-content");
            if (subDropdownContent) {
                subDropdownContent.style.opacity = "0";
                subDropdownContent.style.visibility = "hidden";
                subDropdownContent.style.display = "none";
                
                const deadZoneElementSub = document.querySelector(".sub-dropdown-dead-zone");
                if (deadZoneElementSub) {
                    deadZoneElementSub.style.display = "none";
                }
            }
            
            isClickOpened = false;
            isSubmenuActive = false; // Resetujeme stav submenu
            // Odstranění stavu z localStorage
            localStorage.removeItem('isFirstMenuOpen');
            localStorage.removeItem('isSubMenuOpen');
            localStorage.removeItem('isMouseOverFirstToggle');
            isClosingInProgress = false;
        }, 300);
        
        // Zrušíme časovač nečinnosti
        clearTimeout(inactivityTimeoutFirst);
    }
    
    // Globální funkce pro zavření všech menu kromě specifikovaného
    window.closeAllMenusExcept = function(exceptMenuId) {
        if (exceptMenuId !== 'first-menu') {
            hideMenu();
        }
    };
    
    // Lépe zpracovat událost zobrazení menu po najetí kurzoru
    dropdownToggle.addEventListener("mouseenter", function() {
        // Zavření druhého menu pokud je otevřené
        if (window.closeSecondMenu) {
            window.closeSecondMenu();
        }
        
        // Odstraněno podmínkové ověření pro isClosingInProgress, aby se menu vždy zobrazilo
        if (!isClickOpened) {
            // Použijeme requestAnimationFrame pro spolehlivější zobrazení
            requestAnimationFrame(() => {
                showMenu();
            });
        }
        
        // PŘIDÁNO: Pokud existuje otevřené submenu, je potřeba ho skrýt
        const subDropdownContent = document.querySelector(".sub-dropdown-content");
        if (subDropdownContent && subDropdownContent.style.opacity === "1") {
            subDropdownContent.style.opacity = "0";
            subDropdownContent.style.visibility = "hidden";
            
            setTimeout(() => {
                subDropdownContent.style.display = "none";
                
                const deadZoneElementSub = document.querySelector(".sub-dropdown-dead-zone");
                if (deadZoneElementSub) {
                    deadZoneElementSub.style.display = "none";
                }
                
                localStorage.removeItem('isSubMenuOpen');
            }, 300);
        }
        
        // NOVÉ: Uložíme informaci o tom, že kurzor je nad tlačítkem
        localStorage.setItem('isMouseOverFirstToggle', 'true');
    });
    
    // NOVÉ: Přidat listener pro mouseleave na toggle tlačítko pro záznam pozice
    dropdownToggle.addEventListener("mouseleave", function(e) {
        localStorage.removeItem('isMouseOverFirstToggle');
        
        if (isClickOpened) return; // Pokud je otevřeno kliknutím, neskrývat
        
        // Zkontrolujeme, kam kurzor směřuje
        const toElement = e.relatedTarget;
        
        // Pokud kurzor nejde do mrtvé zóny nebo do podmenu, zahájíme skrývání
        if (toElement !== deadZoneElement && !deadZoneElement.contains(toElement) && 
            toElement !== dropdownContent && !dropdownContent.contains(toElement)) {
            
            hideTimeoutFirst = setTimeout(function() {
                if (!isClickOpened) { // Dvojitá kontrola před skrytím
                    hideMenu();
                }
            }, 250);
        }
    });
    
    // Přidáme event listener pro kliknutí na tlačítko - UPRAVENO PRO SPOLEHLIVOST
    dropdownToggle.addEventListener("click", function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        // Zrušíme všechny aktivní timeouty, které by mohly interferovat
        clearTimeout(hideTimeoutFirst);
        clearTimeout(animationTimeoutFirst);
        clearTimeout(inactivityTimeoutFirst);
        
        // Reset stavu zavírání - DŮLEŽITÉ
        isClosingInProgress = false;
        
        if (dropdownContent.style.opacity === "1" && isClickOpened) {
            // Pokud je menu již otevřené kliknutím, zavřeme ho
            hideMenu();
            isClickOpened = false;
        } else {
            // Zavřít všechna ostatní menu
            if (typeof closeAllMenusExcept === 'function') {
                closeAllMenusExcept('first-menu');
            }
            
            // Jinak ho otevřeme a nastavíme flag
            isClickOpened = true;
            
            // PŘIDÁNO: Vždy skrýt submenu při kliknutí na hlavní tlačítko
            const subDropdownContent = document.querySelector(".sub-dropdown-content");
            if (subDropdownContent && subDropdownContent.style.opacity === "1") {
                subDropdownContent.style.opacity = "0";
                subDropdownContent.style.visibility = "hidden";
                
                setTimeout(() => {
                    subDropdownContent.style.display = "none";
                    
                    const deadZoneElementSub = document.querySelector(".sub-dropdown-dead-zone");
                    if (deadZoneElementSub) {
                        deadZoneElementSub.style.display = "none";
                    }
                    
                    localStorage.removeItem('isSubMenuOpen');
                }, 300);
            }
            
            // Vynucené okamžité zobrazení menu
            dropdownContent.style.display = "block";
            
            // Použijeme requestAnimationFrame pro plynulejší animaci
            requestAnimationFrame(() => {
                dropdownContent.style.opacity = "1";
                dropdownContent.style.visibility = "visible";
                
                // Spustíme kontinuální monitorování pozice
                startPositionMonitoring();
                
                // Uložení stavu do localStorage
                localStorage.setItem('isFirstMenuOpen', 'true');
                
                // Spustíme časovač nečinnosti
                startInactivityTimer();
            });
        }
    });
    
    // Export funkce pro submenu
    window.closeSubMenuWithParent = function() {
        // Tato funkce je volána z hideMenu
        isSubmenuActive = false;
    };
    
    // Exportujeme funkci pro zavření prvního menu z jiných menu
    window.closeFirstMenu = function() {
        if (isClickOpened) {
            hideMenu();
            isClickOpened = false;
        }
    };
    
    // Udržování podmenu otevřeného při najetí na samotné podmenu
    dropdownContent.addEventListener("mouseenter", function() {
        if (!isClickOpened) {
            // Zrušíme všechny předchozí timeouty
            clearTimeout(hideTimeoutFirst);
            clearTimeout(animationTimeoutFirst);
            
            // Zajistíme, že menu zůstane viditelné
            dropdownContent.style.display = "block";
            
            // Použijeme requestAnimationFrame pro plynulejší animaci
            requestAnimationFrame(() => {
                dropdownContent.style.opacity = "1";
                dropdownContent.style.visibility = "visible";
                
                // Spustíme kontinuální monitorování pozice
                startPositionMonitoring();
            });
        } else if (isClickOpened) {
            // Pokud je otevřeno kliknutím, resetujeme časovač nečinnosti
            startInactivityTimer();
        }
    });
    
    // Přidáme posluchače událostí myši pro resetování časovače nečinnosti
    dropdownContent.addEventListener("mousemove", function() {
        if (isClickOpened) {
            startInactivityTimer();
        }
    });
    
    // Přidáme posluchače pro kliknutí v menu, aby se resetoval časovač
    dropdownContent.addEventListener("click", function() {
        if (isClickOpened) {
            startInactivityTimer();
        }
    });
    
    // Přidáme posluchače pro vyhledávací pole a jiné prvky v menu
    const searchElements = dropdownContent.querySelectorAll('input, select, textarea, button');
    searchElements.forEach(element => {
        // Při interakci s prvkem resetujeme časovač nečinnosti
        element.addEventListener('focus', function() {
            if (isClickOpened) {
                startInactivityTimer();
            }
        });
        
        element.addEventListener('input', function() {
            if (isClickOpened) {
                startInactivityTimer();
            }
        });
        
        element.addEventListener('click', function(e) {
            if (isClickOpened) {
                startInactivityTimer();
                e.stopPropagation(); // Zabrání šíření události, která by mohla zavřít menu
            }
        });
    });
    
    // Přidáme posluchače pro odkazy v menu
    const menuLinks = dropdownContent.querySelectorAll('a');
    menuLinks.forEach(link => {
        // Vyčistíme localStorage před navigací
        link.addEventListener('click', function() {
            // Vyčistíme všechny stavy menu z localStorage
            localStorage.removeItem('isFirstMenuOpen');
            localStorage.removeItem('isSecondMenuOpen');
            localStorage.removeItem('isSubMenuOpen');
            localStorage.removeItem('isMouseOverFirstToggle');
            localStorage.removeItem('isMouseOverSecondToggle');
        });
    });
    
    // Udržování podmenu otevřeného při najetí na mrtvou zónu
    deadZoneElement.addEventListener("mouseenter", function() {
        if (!isClickOpened) {
            // Zrušíme všechny předchozí timeouty
            clearTimeout(hideTimeoutFirst);
            clearTimeout(animationTimeoutFirst);
            
            // Ujistíme se, že menu zůstane viditelné
            dropdownContent.style.display = "block";
            
            // Použijeme requestAnimationFrame pro plynulejší animaci
            requestAnimationFrame(() => {
                dropdownContent.style.opacity = "1";
                dropdownContent.style.visibility = "visible";
            });
        } else if (isClickOpened) {
            // Pokud je otevřeno kliknutím, resetujeme časovač nečinnosti
            startInactivityTimer();
        }
    });
    
    // Skrytí podmenu při opuštění kurzoru podmenu - pouze pokud není otevřeno kliknutím
    dropdownContent.addEventListener("mouseleave", function(e) {
        if (isClickOpened) return; // Pokud je otevřeno kliknutím, neskrývat
        
        // Zkontrolujeme, kam kurzor směřuje
        const toElement = e.relatedTarget;
        
        // Zkontrolujme také prvky podmenu
        const subToggle = document.querySelector(".sub-dropdown-toggle");
        const subContent = document.querySelector(".sub-dropdown-content");
        const subDeadZone = document.querySelector(".sub-dropdown-dead-zone");
        
        // Pokud kurzor nejde do subMenu, mrtvé zóny nebo do tlačítka, zahájíme skrývání
        if ((toElement !== deadZoneElement && !deadZoneElement.contains(toElement)) && 
            (toElement !== dropdownToggle && !dropdownToggle.contains(toElement)) &&
            (toElement !== subToggle && (subToggle && !subToggle.contains(toElement))) &&
            (toElement !== subContent && (subContent && !subContent.contains(toElement))) &&
            (toElement !== subDeadZone && (subDeadZone && !subDeadZone.contains(toElement)))) {
            
            hideTimeoutFirst = setTimeout(function() {
                if (!isClickOpened) { // Dvojitá kontrola před skrytím
                    hideMenu();
                }
            }, 400);
        }
    });
    
    // Skrytí podmenu při opuštění mrtvé zóny - pouze pokud není otevřeno kliknutím
    deadZoneElement.addEventListener("mouseleave", function(e) {
        if (isClickOpened) return; // Pokud je otevřeno kliknutím, neskrývat
        
        // Zkontrolujeme, kam kurzor směřuje
        const toElement = e.relatedTarget;
        
        // Zkontrolujme také prvky podmenu
        const subToggle = document.querySelector(".sub-dropdown-toggle");
        const subContent = document.querySelector(".sub-dropdown-content");
        const subDeadZone = document.querySelector(".sub-dropdown-dead-zone");
        
        // Pokud kurzor nejde do menu, tlačítka nebo prvků podmenu, zahájíme skrývání
        if ((toElement !== dropdownToggle && !dropdownToggle.contains(toElement)) && 
            (toElement !== dropdownContent && !dropdownContent.contains(toElement)) &&
            (toElement !== subToggle && (subToggle && !subToggle.contains(toElement))) &&
            (toElement !== subContent && (subContent && !subContent.contains(toElement))) &&
            (toElement !== subDeadZone && (subDeadZone && !subDeadZone.contains(toElement)))) {
            
            hideTimeoutFirst = setTimeout(function() {
                if (!isClickOpened) { // Dvojitá kontrola před skrytím
                    hideMenu();
                }
            }, 300);
        }
    });
    
    // Zavření menu kliknutím kamkoliv mimo menu a tlačítko
    document.addEventListener("click", function(event) {
        // Kontrola prvků podmenu
        const subToggle = document.querySelector(".sub-dropdown-toggle");
        const subContent = document.querySelector(".sub-dropdown-content");
        const subDeadZone = document.querySelector(".sub-dropdown-dead-zone");
        
        if (!dropdownToggle.contains(event.target) && 
            !dropdownContent.contains(event.target) &&
            event.target !== deadZoneElement &&
            (!subToggle || !subToggle.contains(event.target)) &&
            (!subContent || !subContent.contains(event.target)) &&
            (!subDeadZone || !subDeadZone.contains(event.target))) {
            
            hideMenu();
            isClickOpened = false;
        }
    });
    
    // Export funkce pro submenu, která bude nastavovat stav submenu
    window.setSubmenuActive = function(active) {
        isSubmenuActive = active;
        if (active && isClickOpened) {
            // Pokud je submenu aktivní a hlavní menu otevřeno kliknutím, 
            // resetujeme časovač nečinnosti
            startInactivityTimer();
        }
    };

    // NOVÉ: Příznak pro stav načítání DOM
    let domContentLoaded = false;
    let pageLoaded = false;
    
    // NOVÉ: Příznak pro sledování, zda máme zobrazit menu po načtení
    let shouldShowMenuAfterLoad = false;
    
    // NOVÉ: Optimalizovaná funkce pro kontrolu pozice myši
    function checkMousePosition() {
        // Kontrola uložené pozice z localStorage
        const savedMouseX = parseInt(localStorage.getItem('mouseX')) || 0;
        const savedMouseY = parseInt(localStorage.getItem('mouseY')) || 0;
        
        // Nastavení globálních proměnných
        mouseX = savedMouseX;
        mouseY = savedMouseY;
        
        // Získáme aktuální pozice elementů
        const toggleRect = dropdownToggle.getBoundingClientRect();
        
        // Zjistíme, zda je myš nad toggle tlačítkem
        const isOverToggle = 
            mouseX >= toggleRect.left && 
            mouseX <= toggleRect.right && 
            mouseY >= toggleRect.top && 
            mouseY <= toggleRect.bottom;
            
        // Zjistíme, zda byl kurzor nad dropdown tlačítkem před refreshem
        const wasOverToggle = localStorage.getItem('isMouseOverFirstToggle') === 'true';
        
        // Rozhodneme, zda máme zobrazit menu
        if (isOverToggle || wasOverToggle) {
            shouldShowMenuAfterLoad = true;
            if (domContentLoaded) {
                showMenu();
            }
        }
        
        // Kontrola otevřeného menu z localStorage (pro kliknuté menu)
        if (localStorage.getItem('isFirstMenuOpen') === 'true') {
            isClickOpened = true;
            if (domContentLoaded) {
                showMenu();
            } else {
                shouldShowMenuAfterLoad = true;
            }
        }
    }
    
    // NOVÉ: Událost pro DOMContentLoaded - nejrychlejší způsob zjištění, že DOM je připraven
    document.addEventListener('DOMContentLoaded', function() {
        domContentLoaded = true;
        
        // Zkontrolujeme pozici myši ihned po načtení DOM
        checkMousePosition();
        
        // Pokud by mělo být menu zobrazeno, zobrazíme ho ihned
        if (shouldShowMenuAfterLoad) {
            showMenu();
        }
    });
    
    // NOVÉ: Událost pro load - záložní mechanismus, pokud by DOMContentLoaded nebylo zavoláno
    window.addEventListener('load', function() {
        pageLoaded = true;
        
        // Přepočítáme pozici mrtvé zóny po načtení všeho obsahu
        if (dropdownContent.style.display === "block") {
            startPositionMonitoring();
        }
        
        // Pokud by z nějakého důvodu DOMContentLoaded nebylo zavoláno, spustíme kontrolu zde
        if (!domContentLoaded) {
            domContentLoaded = true;
            checkMousePosition();
            
            if (shouldShowMenuAfterLoad) {
                showMenu();
            }
        }
    });
    
    // NOVÉ: Spustíme základní kontrolu ihned a nečekáme na DOMContentLoaded
    // Toto zajistí, že menu může být zobrazeno co nejdříve po načtení stránky
    setTimeout(function() {
        if (!domContentLoaded) {
            checkMousePosition();
        }
    }, 0);
}

// Sledování pozice myši
document.addEventListener('mousemove', function(e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    // Uložíme pozici do localStorage pro obnovení po refreshi
    localStorage.setItem('mouseX', mouseX);
    localStorage.setItem('mouseY', mouseY);
});    
// ----- SECOND DROPDOWN MENU FUNCTIONALITY -----
const dropdownToggle2 = document.querySelector(".dropdown-toggle-second");
const dropdownContent2 = document.querySelector(".dropdown-content-second");

// Ověříme, zda prvky existují
if (dropdownToggle2 && dropdownContent2) {
    let hideTimeoutSecond;
    let animationTimeoutSecond;
    let inactivityTimeoutSecond;
    let repositionTimeoutSecond; // Timeout pro přepočet pozice
    const inactivityDelay = 2000; // 2 sekundy neaktivity
    let isClickOpened2 = false;
    let isClosingInProgress2 = false; // Příznak pro koordinaci animace zavření
    
    // Předpřiprava stylu pro plynulou animaci
    dropdownContent2.style.transition = "opacity 0.3s ease-in-out, visibility 0.3s ease-in-out";
    dropdownContent2.style.opacity = "0";
    dropdownContent2.style.visibility = "hidden";
    dropdownContent2.style.display = "none";
    
    // Vytvoříme element pro mrtvou zónu mezi tlačítkem a menu
    const deadZoneElement2 = document.createElement("div");
    deadZoneElement2.className = "dropdown-dead-zone-second";
    
    // Vložíme element do DOM a nastavíme mu potřebné styly
    document.body.appendChild(deadZoneElement2);
    deadZoneElement2.style.position = "absolute";
    deadZoneElement2.style.display = "none";
    deadZoneElement2.style.zIndex = "999"; // Vysoký z-index
    
    // NOVÉ: Příznak pro stav načítání DOM
    let domContentLoaded2 = false;
    let pageLoaded2 = false;
    
    // NOVÉ: Příznak pro sledování, zda máme zobrazit menu po načtení
    let shouldShowMenuAfterLoad2 = false;
    
    // Funkce pro nastavení pozice a rozměrů mrtvé zóny s vyšší spolehlivostí
    function positionDeadZone2() {
        if (dropdownContent2.style.display === "block") {
            // Použijeme requestAnimationFrame pro lepší optimalizaci
            requestAnimationFrame(() => {
                const toggleRect = dropdownToggle2.getBoundingClientRect();
                const contentRect = dropdownContent2.getBoundingClientRect();
                
                deadZoneElement2.style.left = Math.min(toggleRect.left, contentRect.left) + window.scrollX + "px";
                deadZoneElement2.style.top = toggleRect.bottom + window.scrollY + "px";
                deadZoneElement2.style.width = Math.max(contentRect.width, toggleRect.width) + "px";
                deadZoneElement2.style.height = (contentRect.top - toggleRect.bottom) + "px";
                deadZoneElement2.style.display = "block";
            });
        } else {
            deadZoneElement2.style.display = "none";
        }
    }
    
    // Funkce pro kontinuální přepočítání pozice
    function startPositionMonitoring2() {
        clearTimeout(repositionTimeoutSecond);
        
        // Přepočítej pozici ihned
        positionDeadZone2();
        
        // Naplánuj další přepočet
        repositionTimeoutSecond = setTimeout(() => {
            if (dropdownContent2.style.display === "block") {
                startPositionMonitoring2();
            }
        }, 200); // Každých 200ms kontroluj a přepočítej pozici
    }
    
    // Funkce pro spuštění časovače nečinnosti
    function startInactivityTimer2() {
        clearTimeout(inactivityTimeoutSecond);
        inactivityTimeoutSecond = setTimeout(() => {
            // Kontrola pozice kurzoru před zavřením
            const menuRect = dropdownContent2.getBoundingClientRect();
            const toggleRect = dropdownToggle2.getBoundingClientRect();
            
            // Kontrola, zda kurzor není nad menu nebo nad tlačítkem
            const isMouseOverMenu = 
                mouseX >= menuRect.left && 
                mouseX <= menuRect.right && 
                mouseY >= menuRect.top && 
                mouseY <= menuRect.bottom;
                
            const isMouseOverToggle = 
                mouseX >= toggleRect.left && 
                mouseX <= toggleRect.right && 
                mouseY >= toggleRect.top && 
                mouseY <= toggleRect.bottom;
                
            const isMouseOverDeadZone = 
                deadZoneElement2.style.display === "block" &&
                mouseX >= deadZoneElement2.getBoundingClientRect().left && 
                mouseX <= deadZoneElement2.getBoundingClientRect().right && 
                mouseY >= deadZoneElement2.getBoundingClientRect().top && 
                mouseY <= deadZoneElement2.getBoundingClientRect().bottom;
            
            // Zavřít menu pouze pokud kurzor není nad žádným z menu prvků
            if (!isMouseOverMenu && !isMouseOverToggle && !isMouseOverDeadZone) {
                hideMenu2();
                isClickOpened2 = false;
            } else {
                // Pokud je kurzor nad některým prvkem, prodloužit časovač
                startInactivityTimer2();
            }
        }, inactivityDelay);
    }
    
    // Funkce pro zobrazení menu - UPRAVENO PRO SPOLEHLIVOST
    function showMenu2() {
        // Zrušíme všechny předchozí timeouty
        clearTimeout(hideTimeoutSecond);
        clearTimeout(animationTimeoutSecond);
        clearTimeout(inactivityTimeoutSecond);
        
        // Reset stavu zavírání
        isClosingInProgress2 = false;
        
        // Nejprve zobrazíme element (bez čekání)
        dropdownContent2.style.display = "block";
        
        // Použijeme requestAnimationFrame místo setTimeout pro plynulejší animaci
        requestAnimationFrame(() => {
            dropdownContent2.style.opacity = "1";
            dropdownContent2.style.visibility = "visible";
            
            // NOVÉ: Spustíme kontinuální monitorování pozice
            startPositionMonitoring2();
        });
        
        // Pokud je menu otevřeno kliknutím, nastavíme timeout pro zavření po neaktivitě
        if (isClickOpened2) {
            startInactivityTimer2();
            // Uložení stavu do localStorage
            localStorage.setItem('isSecondMenuOpen', 'true');
        }
    }
    
    // Funkce pro skrytí menu - UPRAVENO PRO SPOLEHLIVOST
    function hideMenu2() {
        // Zrušíme všechny předchozí timeouty
        clearTimeout(hideTimeoutSecond);
        clearTimeout(animationTimeoutSecond);
        clearTimeout(inactivityTimeoutSecond);
        clearTimeout(repositionTimeoutSecond); // NOVÉ: Zrušit monitorování pozice
        
        // Nastavíme příznak, že probíhá zavírání
        isClosingInProgress2 = true;
        
        // Nejprve spustíme animaci průhlednosti
        dropdownContent2.style.opacity = "0";
        dropdownContent2.style.visibility = "hidden";
        
        // Po dokončení animace skryjeme prvky úplně
        animationTimeoutSecond = setTimeout(() => {
            dropdownContent2.style.display = "none";
            deadZoneElement2.style.display = "none";
            
            isClickOpened2 = false;
            // Odstranění stavu z localStorage
            localStorage.removeItem('isSecondMenuOpen');
            localStorage.removeItem('isMouseOverSecondToggle');
            isClosingInProgress2 = false;
        }, 300);
        
        // Zrušíme časovač nečinnosti
        clearTimeout(inactivityTimeoutSecond);
    }
    
    // Exportujeme funkci pro zavření druhého menu z jiných menu
    window.closeSecondMenu = function() {
        if (isClickOpened2) {
            hideMenu2();
            isClickOpened2 = false;
        }
    };
    
    // NOVÉ: Optimalizovaná funkce pro kontrolu pozice myši
    function checkMousePosition2() {
        // Kontrola uložené pozice z localStorage
        const savedMouseX = parseInt(localStorage.getItem('mouseX')) || 0;
        const savedMouseY = parseInt(localStorage.getItem('mouseY')) || 0;
        
        // Nastavení globálních proměnných
        mouseX = savedMouseX;
        mouseY = savedMouseY;
        
        // Získáme aktuální pozice elementů
        const toggleRect = dropdownToggle2.getBoundingClientRect();
        
        // Zjistíme, zda je myš nad toggle tlačítkem
        const isOverToggle = 
            mouseX >= toggleRect.left && 
            mouseX <= toggleRect.right && 
            mouseY >= toggleRect.top && 
            mouseY <= toggleRect.bottom;
            
        // Zjistíme, zda byl kurzor nad dropdown tlačítkem před refreshem
        const wasOverToggle = localStorage.getItem('isMouseOverSecondToggle') === 'true';
        
        // Rozhodneme, zda máme zobrazit menu
        if (isOverToggle || wasOverToggle) {
            shouldShowMenuAfterLoad2 = true;
            if (domContentLoaded2) {
                showMenu2();
            }
        }
        
        // Kontrola otevřeného menu z localStorage (pro kliknuté menu)
        if (localStorage.getItem('isSecondMenuOpen') === 'true') {
            isClickOpened2 = true;
            if (domContentLoaded2) {
                showMenu2();
            } else {
                shouldShowMenuAfterLoad2 = true;
            }
        }
    }
    
    // NOVÉ: Událost pro DOMContentLoaded - nejrychlejší způsob zjištění, že DOM je připraven
    document.addEventListener('DOMContentLoaded', function() {
        domContentLoaded2 = true;
        
        // Zkontrolujeme pozici myši ihned po načtení DOM
        checkMousePosition2();
        
        // Pokud by mělo být menu zobrazeno, zobrazíme ho ihned
        if (shouldShowMenuAfterLoad2) {
            showMenu2();
        }
    });
    
    // NOVÉ: Událost pro load - záložní mechanismus, pokud by DOMContentLoaded nebylo zavoláno
    window.addEventListener('load', function() {
        pageLoaded2 = true;
        
        // Přepočítáme pozici mrtvé zóny po načtení všeho obsahu
        if (dropdownContent2.style.display === "block") {
            startPositionMonitoring2();
        }
        
        // Pokud by z nějakého důvodu DOMContentLoaded nebylo zavoláno, spustíme kontrolu zde
        if (!domContentLoaded2) {
            domContentLoaded2 = true;
            checkMousePosition2();
            
            if (shouldShowMenuAfterLoad2) {
                showMenu2();
            }
        }
    });
    
    // NOVÉ: Spustíme základní kontrolu ihned a nečekáme na DOMContentLoaded
    // Toto zajistí, že menu může být zobrazeno co nejdříve po načtení stránky
    setTimeout(function() {
        if (!domContentLoaded2) {
            checkMousePosition2();
        }
    }, 0);
    
    // NOVÉ: Lépe zpracovat událost zobrazení menu po najetí kurzoru
    dropdownToggle2.addEventListener("mouseenter", function() {
        // Zavření prvního menu pokud je otevřené
        if (window.closeFirstMenu) {
            window.closeFirstMenu();
        }
        
        // Odstraněno podmínkové ověření pro isClosingInProgress2, aby se menu vždy zobrazilo
        if (!isClickOpened2) {
            // NOVÉ: Použijeme requestAnimationFrame pro spolehlivější zobrazení
            requestAnimationFrame(() => {
                showMenu2();
            });
        }
        
        // NOVÉ: Uložíme informaci o tom, že kurzor je nad tlačítkem
        localStorage.setItem('isMouseOverSecondToggle', 'true');
    });
    
    // NOVÉ: Přidat listener pro mouseleave na toggle tlačítko pro záznam pozice
    dropdownToggle2.addEventListener("mouseleave", function(e) {
        localStorage.removeItem('isMouseOverSecondToggle');
        
        if (isClickOpened2) return; // Pokud je otevřeno kliknutím, neskrývat
        
        // Zkontrolujeme, kam kurzor směřuje
        const toElement = e.relatedTarget;
        
        // Pokud kurzor nejde do mrtvé zóny nebo do podmenu, zahájíme skrývání
        if (toElement !== deadZoneElement2 && !deadZoneElement2.contains(toElement) && 
            toElement !== dropdownContent2 && !dropdownContent2.contains(toElement)) {
            
            hideTimeoutSecond = setTimeout(function() {
                if (!isClickOpened2) { // Dvojitá kontrola před skrytím
                    hideMenu2();
                }
            }, 250);
        }
    });
    
    // Přidáme event listener pro kliknutí na tlačítko - UPRAVENO PRO SPOLEHLIVOST
    dropdownToggle2.addEventListener("click", function(e) {
        e.preventDefault(); // Zabrání výchozí akci odkazu, pokud je tlačítko <a>
        e.stopPropagation(); // Zabrání šíření události ke globálnímu document click handleru
        
        // Zrušíme všechny aktivní timeouty, které by mohly interferovat
        clearTimeout(hideTimeoutSecond);
        clearTimeout(animationTimeoutSecond);
        clearTimeout(inactivityTimeoutSecond);
        
        // Reset stavu zavírání - DŮLEŽITÉ
        isClosingInProgress2 = false;
        
        if (dropdownContent2.style.opacity === "1" && isClickOpened2) {
            // Pokud je menu již otevřené kliknutím, zavřeme ho
            hideMenu2();
            isClickOpened2 = false;
        } else {
            // Zavřít všechna ostatní menu
            if (typeof closeAllMenusExcept === 'function') {
                closeAllMenusExcept('second-menu');
            }
            
            // Jinak ho otevřeme a nastavíme flag
            isClickOpened2 = true;
            
            // Vynucené okamžité zobrazení menu
            dropdownContent2.style.display = "block";
            
            // Použijeme requestAnimationFrame pro plynulejší animaci
            requestAnimationFrame(() => {
                dropdownContent2.style.opacity = "1";
                dropdownContent2.style.visibility = "visible";
                
                // NOVÉ: Spustíme kontinuální monitorování pozice
                startPositionMonitoring2();
                
                // Uložení stavu do localStorage
                localStorage.setItem('isSecondMenuOpen', 'true');
                
                // Spustíme časovač nečinnosti
                startInactivityTimer2();
            });
        }
    });
    
    // Udržování druhého podmenu otevřeného při najetí na samotné podmenu
    dropdownContent2.addEventListener("mouseenter", function() {
        if (!isClickOpened2) {
            // Zrušíme všechny předchozí timeouty
            clearTimeout(hideTimeoutSecond);
            clearTimeout(animationTimeoutSecond);
            
            // Zajistíme, že menu zůstane viditelné
            dropdownContent2.style.display = "block";
            
            // Použijeme requestAnimationFrame pro plynulejší animaci
            requestAnimationFrame(() => {
                dropdownContent2.style.opacity = "1";
                dropdownContent2.style.visibility = "visible";
                
                // NOVÉ: Spustíme kontinuální monitorování pozice
                startPositionMonitoring2();
            });
        } else if (isClickOpened2) {
            // Pokud je otevřeno kliknutím, resetujeme časovač nečinnosti
            startInactivityTimer2();
        }
    });
    
    // Přidáme posluchače událostí myši pro resetování časovače nečinnosti
    dropdownContent2.addEventListener("mousemove", function() {
        if (isClickOpened2) {
            startInactivityTimer2();
        }
    });
    
    // Přidáme posluchače pro kliknutí v menu, aby se resetoval časovač
    dropdownContent2.addEventListener("click", function() {
        if (isClickOpened2) {
            startInactivityTimer2();
        }
    });
    
    // Přidáme posluchače pro vyhledávací pole a jiné prvky v menu
    const searchElements2 = dropdownContent2.querySelectorAll('input, select, textarea, button');
    searchElements2.forEach(element => {
        // Při interakci s prvkem resetujeme časovač nečinnosti
        element.addEventListener('focus', function() {
            if (isClickOpened2) {
                startInactivityTimer2();
            }
        });
        
        element.addEventListener('input', function() {
            if (isClickOpened2) {
                startInactivityTimer2();
            }
        });
        
        element.addEventListener('click', function(e) {
            if (isClickOpened2) {
                startInactivityTimer2();
                e.stopPropagation(); // Zabrání šíření události, která by mohla zavřít menu
            }
        });
    });
    
    // Přidáme posluchače pro odkazy v menu
    const menuLinks2 = dropdownContent2.querySelectorAll('a');
    menuLinks2.forEach(link => {
        // Vyčistíme localStorage před navigací
        link.addEventListener('click', function() {
            // Vyčistíme všechny stavy menu z localStorage
            localStorage.removeItem('isFirstMenuOpen');
            localStorage.removeItem('isSecondMenuOpen');
            localStorage.removeItem('isSubMenuOpen');
            localStorage.removeItem('isMouseOverFirstToggle');
            localStorage.removeItem('isMouseOverSecondToggle');
        });
    });
    
    // Udržování podmenu otevřeného při najetí na mrtvou zónu
    deadZoneElement2.addEventListener("mouseenter", function() {
        if (!isClickOpened2) {
            // Zrušíme všechny předchozí timeouty
            clearTimeout(hideTimeoutSecond);
            clearTimeout(animationTimeoutSecond);
            
            // Ujistíme se, že menu zůstane viditelné
            dropdownContent2.style.display = "block";
            
            // Použijeme requestAnimationFrame pro plynulejší animaci
            requestAnimationFrame(() => {
                dropdownContent2.style.opacity = "1";
                dropdownContent2.style.visibility = "visible";
            });
        } else if (isClickOpened2) {
            // Pokud je otevřeno kliknutím, resetujeme časovač nečinnosti
            startInactivityTimer2();
        }
    });
    
    // Skrytí druhého podmenu při opuštění kurzoru podmenu - pouze pokud není otevřeno kliknutím
    dropdownContent2.addEventListener("mouseleave", function(e) {
        if (isClickOpened2) return; // Pokud je otevřeno kliknutím, neskrývat
        
        // Zkontrolujeme, kam kurzor směřuje
        const toElement = e.relatedTarget;
        
        // Pokud kurzor nejde do mrtvé zóny nebo do tlačítka, zahájíme skrývání
        if (toElement !== deadZoneElement2 && !deadZoneElement2.contains(toElement) && 
            toElement !== dropdownToggle2 && !dropdownToggle2.contains(toElement)) {
            
            hideTimeoutSecond = setTimeout(function() {
                if (!isClickOpened2) { // Dvojitá kontrola před skrytím
                    hideMenu2();
                }
            }, 400);
        }
    });
    
    // Skrytí podmenu při opuštění mrtvé zóny - pouze pokud není otevřeno kliknutím
    deadZoneElement2.addEventListener("mouseleave", function(e) {
        if (isClickOpened2) return; // Pokud je otevřeno kliknutím, neskrývat
        
        // Zkontrolujeme, kam kurzor směřuje
        const toElement = e.relatedTarget;
        
        // Pokud kurzor nejde do menu nebo tlačítka, zahájíme skrývání
        if (toElement !== dropdownToggle2 && !dropdownToggle2.contains(toElement) && 
            toElement !== dropdownContent2 && !dropdownContent2.contains(toElement)) {
            
            hideTimeoutSecond = setTimeout(function() {
                if (!isClickOpened2) { // Dvojitá kontrola před skrytím
                    hideMenu2();
                }
            }, 300);
        }
    });
    
    // Zavření menu kliknutím kamkoliv mimo menu a tlačítko
    document.addEventListener("click", function(event) {
        if (!dropdownToggle2.contains(event.target) && 
            !dropdownContent2.contains(event.target) &&
            event.target !== deadZoneElement2) {
            
            hideMenu2();
            isClickOpened2 = false;
        }
    });
}

// Zajištění sledování pozice myši pro oba dropdowny
// Tyto funkce by měly být definovány v globálním kontextu
// a sdíleny mezi oběma menu
let mouseX = 0;
let mouseY = 0;

// Sledování pozice myši
document.addEventListener('mousemove', function(e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    // Uložíme pozici do localStorage pro obnovení po refreshi
    localStorage.setItem('mouseX', mouseX);
    localStorage.setItem('mouseY', mouseY);
});
// ----- SUB-DROPDOWN MENU FUNCTIONALITY -----
const subDropdownToggle = document.querySelector(".sub-dropdown-toggle");
const subDropdownContent = document.querySelector(".sub-dropdown-content");

// Ověříme, zda prvky existují
if (subDropdownToggle && subDropdownContent) {
    let hideTimeoutSub;
    let animationTimeoutSub;
    let isClickOpenedSub = false;
    let isMouseOverMenu = false; // Proměnná pro sledování, jestli je myš nad menu
    
    // KOMPLETNÍ PŘEPRACOVÁNÍ ANIMACE:
    // 1. Nejdřív aplikujeme CSS přímo do elementu pro zajištění konzistence
    const originalDisplay = window.getComputedStyle(subDropdownContent).display;
    // Nastavíme transition na všechny vlastnosti pro zajištění plynulosti
    subDropdownContent.style.cssText = `
        transition: opacity 0.3s ease-in-out, visibility 0.3s ease-in-out;
        opacity: 0;
        visibility: hidden;
        display: none;
    `;
    
    // Vytvoříme element pro mrtvou zónu mezi tlačítkem a menu
    const deadZoneElementSub = document.createElement("div");
    deadZoneElementSub.className = "sub-dropdown-dead-zone";
    
    // Vložíme element do DOM a nastavíme mu potřebné styly
    document.body.appendChild(deadZoneElementSub);
    deadZoneElementSub.style.position = "absolute";
    deadZoneElementSub.style.display = "none";
    deadZoneElementSub.style.zIndex = "999"; // Vysoký z-index
    
    // Příznak pro koordinaci animace zavření
    let isClosingInProgressSub = false;
    
    // Funkce pro nastavení pozice a rozměrů mrtvé zóny
    function positionDeadZoneSub() {
        if (subDropdownContent.style.display !== "none") {
            const toggleRect = subDropdownToggle.getBoundingClientRect();
            const contentRect = subDropdownContent.getBoundingClientRect();
            
            // Zjistíme orientaci menu vůči oknu
            const viewportWidth = window.innerWidth;
            const isMenuRightAligned = (toggleRect.right + contentRect.width > viewportWidth);
            
            // Podle orientace menu nastavíme mrtvou zónu
            if (isMenuRightAligned) {
                // Menu je zarovnáno doprava od tlačítka
                deadZoneElementSub.style.left = (contentRect.right - Math.max(contentRect.width, toggleRect.width)) + window.scrollX + "px";
                deadZoneElementSub.style.top = toggleRect.bottom + window.scrollY + "px";
                deadZoneElementSub.style.width = Math.max(contentRect.width, toggleRect.width) + "px";
                deadZoneElementSub.style.height = (contentRect.top - toggleRect.bottom) + "px";
            } else {
                // Menu je zarovnáno doleva nebo pod tlačítkem
                deadZoneElementSub.style.left = Math.min(toggleRect.left, contentRect.left) + window.scrollX + "px";
                deadZoneElementSub.style.top = toggleRect.bottom + window.scrollY + "px";
                deadZoneElementSub.style.width = Math.max(contentRect.width, toggleRect.width) + "px";
                deadZoneElementSub.style.height = (contentRect.top - toggleRect.bottom) + "px";
            }
            
            deadZoneElementSub.style.display = "block";
        } else {
            deadZoneElementSub.style.display = "none";
        }
    }
    
    // ZCELA PŘEPRACOVANÁ FUNKCE PRO ZOBRAZENÍ
    function showMenuSub() {
        // Zrušíme všechny předchozí timeouty
        clearTimeout(hideTimeoutSub);
        clearTimeout(animationTimeoutSub);
        
        // Resetujeme příznak zavírání
        isClosingInProgressSub = false;
        
        // DŮLEŽITÉ: Sekvence zobrazení
        // 1. Nejprve nastavíme display na block, ale stále s opacity 0
        subDropdownContent.style.display = originalDisplay || "block";
        
        // 2. Krátké zpoždění pro aplikaci display
        setTimeout(() => {
            // 3. Následně spustíme animaci nastavením opacity
            subDropdownContent.style.opacity = "1";
            subDropdownContent.style.visibility = "visible";
            
            // 4. Nastavíme pozici mrtvé zóny
            positionDeadZoneSub();
        }, 10);
        
        // Informujeme hlavní menu o aktivaci submenu
        if (window.setSubmenuActive) {
            window.setSubmenuActive(true);
        }
        
        // Pokud je menu otevřeno kliknutím, uložíme stav do localStorage
        if (isClickOpenedSub) {
            localStorage.setItem('isSubMenuOpen', 'true');
        }
    }
    
    // ZCELA PŘEPRACOVANÁ FUNKCE PRO PLYNULÉ ZAVŘENÍ 
    function smoothCloseSubMenu(skipDelay = false) {
        // Pokud je menu již zavřené, neděláme nic
        if (subDropdownContent.style.display === "none") return;
        
        // Zrušíme případné předchozí timeouty pro zavírání
        clearTimeout(hideTimeoutSub);
        clearTimeout(animationTimeoutSub);
        
        // Nastavíme příznak, že probíhá zavírání
        isClosingInProgressSub = true;
        
        // KRITICKÉ: Explicitně zajistíme, že menu je viditelné během animace
        // Tím se zajistí, že bude vidět animace opacity
        if (subDropdownContent.style.display === "none") {
            subDropdownContent.style.display = originalDisplay || "block";
            // Dáme prohlížeči čas aplikovat display
            requestAnimationFrame(() => {
                // Pak teprve spustíme animaci opacity
                subDropdownContent.style.opacity = "0";
                subDropdownContent.style.visibility = "hidden";
            });
        } else {
            // Menu je již zobrazené, spustíme animaci opacity
            subDropdownContent.style.opacity = "0";
            subDropdownContent.style.visibility = "hidden";
        }
        
        // Zásadní krok: Počkáme na dokončení animace
        const animationDuration = 400; // Musí odpovídat transition time v CSS
        const delay = skipDelay ? Math.floor(animationDuration / 2) : animationDuration + 50; // Přidáme malou rezervu
        
        animationTimeoutSub = setTimeout(() => {
            // Zkontrolujeme, zda mezitím uživatel nenavedl myš zpět na menu
            if (!isMouseOverMenu) {
                // Dokončíme skrytí až po dokončení animace fade-out
                subDropdownContent.style.display = "none";
                deadZoneElementSub.style.display = "none";
                
                // Pokud bylo menu otevřeno kliknutím, resetujeme příznak
                if (isClickOpenedSub) {
                    isClickOpenedSub = false;
                    localStorage.removeItem('isSubMenuOpen');
                }
                
                // Informujeme hlavní menu
                if (window.setSubmenuActive) {
                    window.setSubmenuActive(false);
                }
            } else {
                // Uživatel navedl myš zpět na menu během animace - zrušíme zavírání
                showMenuSub();
            }
            
            isClosingInProgressSub = false;
        }, delay);
    }
    
    // Funkce pro skrytí menu - koordinovaná s hlavním menu - vždy používá plynulé zavření
    function hideMenuSub() {
        // Kontrola, zda je myš stále nad menu - pokud ano, nezavírat
        if (isMouseOverMenu) return;
        
        smoothCloseSubMenu();
    }
    
    // Zpracování žádosti o společné zavření z hlavního menu
    window.closeSubMenuWithParent = function() {
        // Pouze nastavíme příznaky a zavřeme s plynulou animací
        isClickOpenedSub = false;
        smoothCloseSubMenu();
    };
    
    // Monitorování hlavního menu pro koordinaci chování
    const mainDropdownToggle = document.querySelector(".dropdown-toggle");
    if (mainDropdownToggle) {
        mainDropdownToggle.addEventListener("mouseenter", function() {
            // Při najetí na hlavní menu zavřeme submenu plynule
            if (!isMouseOverMenu) {
                smoothCloseSubMenu();
            }
        });
    }
    
    // Monitorování hlavního dropdown obsahu
    const mainDropdownContent = document.querySelector(".dropdown-content");
    if (mainDropdownContent) {
        // Zajistíme, že při najetí na hlavní dropdown obsah se submenu také zavře,
        // pokud nejsme přímo nad toggle tlačítkem submenu
        mainDropdownContent.addEventListener("mouseenter", function(e) {
            // Zkontrolujeme, že jsme opravdu v hlavním dropdown, ale ne nad submenu toggle
            if (e.target === mainDropdownContent && !subDropdownToggle.contains(e.target)) {
                smoothCloseSubMenu();
            }
        });
        
        // Přidáme event listener pro pohyb myši v hlavním dropdown menu
        mainDropdownContent.addEventListener("mousemove", function(e) {
            // Získáme aktuální element pod myší
            const elementUnderMouse = document.elementFromPoint(e.clientX, e.clientY);
            
            // Pokud je myš v hlavním menu, ale není nad toggle tlačítkem submenu ani nad submenu obsahem
            if (mainDropdownContent.contains(elementUnderMouse) && 
                !subDropdownToggle.contains(elementUnderMouse) && 
                !subDropdownContent.contains(elementUnderMouse) &&
                !deadZoneElementSub.contains(elementUnderMouse)) {
                
                // Nastavíme příznak, že myš není nad submenu
                isMouseOverMenu = false;
                
                // Zavřeme submenu plynule, pokud je otevřené (pouze pokud nebylo otevřeno kliknutím)
                if (subDropdownContent.style.opacity === "1" && !isClickOpenedSub) {
                    smoothCloseSubMenu();
                }
            }
        });
    }
    
    // Zobrazení sub-menu při najetí kurzoru na tlačítko
    subDropdownToggle.addEventListener("mouseenter", function() {
        isMouseOverMenu = true;
        
        // Důležitá změna: Kontrolujeme, zda probíhá zavírání
        if (isClosingInProgressSub) {
            // Pokud probíhá animace zavírání, přerušíme ji a znovu zobrazíme menu
            showMenuSub();
        } else if (!isClickOpenedSub) {
            showMenuSub();
        }
    });
    
    // Nastaví příznak, že myš opustila tlačítko
    subDropdownToggle.addEventListener("mouseleave", function() {
        isMouseOverMenu = false;
    });
    
    // Přidáme event listener pro kliknutí na tlačítko - OPTIMALIZOVÁNO PRO SPOLEHLIVOST
    subDropdownToggle.addEventListener("click", function(e) {
        // Vždy zastavíme výchozí chování a propagaci
        e.preventDefault();
        e.stopPropagation();
        
        // Zrušíme všechny běžící timeouty pro zamezení konfliktů
        clearTimeout(hideTimeoutSub);
        clearTimeout(animationTimeoutSub);
        
        // Aktualizujeme stav menu podle aktuálního viditelného stavu
        const isCurrentlyVisible = subDropdownContent.style.opacity === "1";
        
        if (isCurrentlyVisible && isClickOpenedSub) {
            // Pokud je menu již otevřené kliknutím, zavřeme ho
            isMouseOverMenu = false;
            isClickOpenedSub = false;
            localStorage.removeItem('isSubMenuOpen');
            smoothCloseSubMenu(true); // Používáme true pro rychlejší reakci
        } else {
            // Vždy zajistíme, že menu bude otevřené po kliknutí
            isClickOpenedSub = true;
            isMouseOverMenu = true;
            isClosingInProgressSub = false; // Zrušíme případné probíhající zavírání
            
            // Explicitně nastavíme stav jako otevřený
            localStorage.setItem('isSubMenuOpen', 'true');
            
            // Aktivně zobrazíme menu
            showMenuSub();
        }
        
        // Explicitně zaznamenáme, že došlo ke kliknutí na toggle
        console.log("Toggle clicked, menu is now: " + (!isCurrentlyVisible || !isClickOpenedSub ? "open" : "closed"));
    });
    
    // Přidáme speciální třídu pro šipku v dropdown menu, pokud existuje
    const arrowElement = subDropdownToggle.querySelector(".arrow, .dropdown-arrow, .caret, .arrow-icon, i.fa-chevron-down");
    if (arrowElement) {
        // Zajistíme, že kliknutí na šipku bude spolehlivě fungovat
        arrowElement.addEventListener("click", function(e) {
            e.preventDefault(); 
            e.stopPropagation(); // Zastavíme propagaci, aby nedošlo k dvojímu zpracování
            
            // Simulujeme kliknutí přímo na toggle element pro jednotné chování
            const clickEvent = new MouseEvent('click', {
                bubbles: true,
                cancelable: true,
                view: window
            });
            
            // Zašleme událost kliknutí přímo na toggle element
            subDropdownToggle.dispatchEvent(clickEvent);
        });
    }
    
    // Udržování sub-menu otevřeného při najetí na samotné menu
    subDropdownContent.addEventListener("mouseenter", function() {
        isMouseOverMenu = true;
        
        // DŮLEŽITÁ ZMĚNA: Pokud probíhá animace zavírání, zrušíme ji a znovu zobrazíme menu
        if (isClosingInProgressSub) {
            showMenuSub();
        }
        
        // Informujeme hlavní menu o aktivaci submenu
        if (window.setSubmenuActive) {
            window.setSubmenuActive(true);
        }
    });
    
    // Skrytí menu při opuštění menu kurzorem
    subDropdownContent.addEventListener("mouseleave", function() {
        isMouseOverMenu = false;
        
        // Pokud menu není otevřeno kliknutím, zavřeme ho
        if (!isClickOpenedSub) {
            hideTimeoutSub = setTimeout(() => {
                smoothCloseSubMenu();
            }, 300);
        }
    });
    
    // Mrtvá zóna pomáhá udržet menu otevřené
    deadZoneElementSub.addEventListener("mouseenter", function() {
        isMouseOverMenu = true;
        clearTimeout(hideTimeoutSub);
        
        // Pokud probíhá animace zavírání, zrušíme ji a obnovíme menu
        if (isClosingInProgressSub) {
            showMenuSub();
        }
    });
    
    deadZoneElementSub.addEventListener("mouseleave", function() {
        isMouseOverMenu = false;
        
        // Pokud menu není otevřeno kliknutím, zavřeme ho
        if (!isClickOpenedSub) {
            hideTimeoutSub = setTimeout(() => {
                smoothCloseSubMenu();
            }, 100);
        }
    });
    
    // Zavření menu při kliknutí kamkoliv mimo menu - VYLEPŠENO
    document.addEventListener("click", function(e) {
        // Důkladná kontrola, že kliknutí není na menu nebo toggle tlačítko nebo jejich potomky
        if (!subDropdownContent.contains(e.target) && 
            !subDropdownToggle.contains(e.target) &&
            !deadZoneElementSub.contains(e.target)) {
            
            isMouseOverMenu = false;
            
            // Zavřeme menu, pokud bylo otevřeno kliknutím
            if (isClickOpenedSub) {
                isClickOpenedSub = false;
                localStorage.removeItem('isSubMenuOpen');
                smoothCloseSubMenu();
            }
        }
    });
    
    // Obsluha změny velikosti okna pro správné pozicování
    window.addEventListener("resize", positionDeadZoneSub);
    
    // Kontrola, zda bylo menu otevřeno před obnovením stránky
    if (localStorage.getItem('isSubMenuOpen') === 'true') {
        isClickOpenedSub = true;
        showMenuSub();
    }
    
    // Přidáme speciální indikátor pro rozlišení kliknutí vs hover
    subDropdownToggle.classList.add("has-click-listener");
    
    // Přidáme třídu pro animaci
    subDropdownContent.classList.add("fade-dropdown");
    
    // Zkontrolujeme zda menu má nastavenou transition v CSS - pokud ne, přidáme inline
    const computedStyle = window.getComputedStyle(subDropdownContent);
    if (!computedStyle.transition || computedStyle.transition === "all 0s ease 0s") {
        // Přidáme tranzici přímo do elementu pro zajištění animace
        subDropdownContent.style.transition = "opacity 0.3s ease-in-out, visibility 0.3s ease-in-out";
    }
}
    // Zbytek kódu zůstává beze změny
    // ----- FAQ FUNCTIONALITY -----
    const faqItems = document.querySelectorAll(".faq");
    if (faqItems.length > 0) {
        faqItems.forEach(faq => {
            faq.addEventListener("click", () => {
                faq.classList.toggle("active");
            });
        });
    }
    
    // ----- FAQ CONTAINER TOGGLE -----
    const toggleQuestionsBtn = document.getElementById('toggle-questions-btn');
    const faqContainer = document.getElementById('faq-container');
    
    if (toggleQuestionsBtn && faqContainer) {
        toggleQuestionsBtn.addEventListener('click', () => {
            faqContainer.classList.toggle('hidden');
            
            if (faqContainer.classList.contains('hidden')) {
                toggleQuestionsBtn.textContent = 'Zobrazit otázky';
                
                // Skrytí všech odpovědí při zavření
                document.querySelectorAll('.answer').forEach(answer => {
                    answer.style.display = 'none';
                });
                
                // Odebrání stmavení všech otázek
                document.querySelectorAll('.question').forEach(question => {
                    question.classList.remove('open');
                });
            } else {
                toggleQuestionsBtn.textContent = 'Skrýt otázky';
            }
        });
        
        // Přidání funkce pro rozkliknutí jednotlivých otázek + stmavení
        document.querySelectorAll('.question').forEach(question => {
            question.addEventListener('click', () => {
                const answer = question.nextElementSibling;
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
    
    // ----- ACTIVE MENU ITEM FUNCTIONALITY -----
    // Získáme všechny hlavní tlačítka a odkazy v podmenu
    const mainButtons = document.querySelectorAll('.main-button, .maine-button');
    const dropdownLinks = document.querySelectorAll('.dropdown-content a, .dropdown-content-second a, .sub-dropdown-content a');
    
    // Nastavení aktivního tlačítka při kliknutí
    function setActiveButton(clickedButton) {
        // Odstranění active z podmenu
        dropdownLinks.forEach(link => link.classList.remove('active'));
        
        // Přidání active pouze na kliknutý odkaz v podmenu
        if (clickedButton.closest('.dropdown-content') || 
            clickedButton.closest('.dropdown-content-second') || 
            clickedButton.closest('.sub-dropdown-content')) {
            clickedButton.classList.add('active');
            
            // Najdeme hlavní tlačítko a zajistíme správné zvýraznění
            mainButtons.forEach(button => button.classList.remove('active'));
            
            // ZMĚNA: Nebudeme zvýrazňovat nadřazené tlačítko při kliknutí na položku podmenu
        } else {
            // Pokud klikneme na hlavní tlačítko, resetujeme podmenu a zvýrazníme jen hlavní tlačítko
            mainButtons.forEach(button => button.classList.remove('active'));
            clickedButton.classList.add('active');
        }
    }
    
    // Přidání event listeneru na všechna tlačítka a odkazy
    [...mainButtons, ...dropdownLinks].forEach(element => {
        element.addEventListener('click', function() {
            setActiveButton(element);
        });
    });
    
    // Nastavení aktivního tlačítka podle URL po načtení stránky
    const menuLinks = document.querySelectorAll('.main-button, .maine-button, .dropdown-content a, .dropdown-content-second a, .sub-dropdown-content a');
    menuLinks.forEach(link => {
        if (link.href === window.location.href) {
            link.classList.add('active');
            // ZMĚNA: Nebudeme zvýrazňovat nadřazené tlačítko, pokud jsme na stránce z podmenu
        }
    });
    
    // Speciální případ pro tools.html
    const introLink = document.querySelector('.dropdown-content a[href="tools.html"]');
    if (introLink && window.location.pathname.includes('tools.html')) {
        introLink.classList.add('active');
        // ZMĚNA: Odstraněna aktivace nadřazeného tlačítka
    }











//document.addEventListener('DOMContentLoaded', function() {
  //  setupStickyNav();
    

   // navHeight = header.offsetHeight;
    
 
   // window.addEventListener('scroll', handleScroll);
    
    
    //handleScroll();
//});


//window.addEventListener('resize', function() {
 //   navHeight = header.offsetHeight;
//});

