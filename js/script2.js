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
        
        // Event listener pro opuštění stránky - NE při navigaci
        window.addEventListener('beforeunload', function(e) {
            // Při zavření stránky zachováme stav myši, ale zrušíme otevřená menu kliknutím
            localStorage.setItem('isFirstMenuOpen', 'false');
            localStorage.setItem('isSecondMenuOpen', 'false');
            localStorage.setItem('isSubMenuOpen', 'false');
        });
        
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
    
    // Speciální případ pro system-introduction.html
    const introLink = document.querySelector('.dropdown-content a[href="system-introduction.html"]');
    if (introLink && window.location.pathname.includes('system-introduction.html')) {
        introLink.classList.add('active');
        // ZMĚNA: Odstraněna aktivace nadřazeného tlačítka
    }




//---------STICKY HEADER FUNCTIONALITY-------------//
document.addEventListener('DOMContentLoaded', function() {
    // 1. Add CSS styles for sticky header
    insertStickyHeaderStyles();
    
    // 2. Create and insert the sticky header into DOM
    createStickyHeader();
    
    // 3. Initialize sticky header behavior and dropdowns
    initStickyHeaderFunctionality();
  });
  
  // Insert required CSS styles for the sticky header
  function insertStickyHeaderStyles() {
    const styleTag = document.createElement('style');
    styleTag.textContent = `
  .sticky-header {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      background-color: #77afe0ee;
      text-align: center;
      color: white;
      z-index: 1000;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      transition: transform 0.3s ease, height 0.3s ease, padding 0.3s ease;
      transform: translateY(-100%); /* Start hidden */
      display: flex;
      flex-direction: column;
      align-items: center;
      padding-top: -1px; /* Add top padding */
      padding-bottom: 1px; /* Add bottom padding */
      padding: 9px 0; /* Changed from 0 to maintain some padding when scrolled */
    }
    
    /* Visible state */
    .sticky-header.visible {
      transform: translateY(0);
    }
    
    
    
    /* Match the structure of your original header */
    .sticky-header p {
      font-weight: 600;
      margin: 5px 0;
      transition: all 0.3s ease;
    }
    
    .sticky-header h1 {
      font-size: 40px;
      margin: 0;
      margin-top: 1px;
      transition: all 0.3s ease;
       font-size: 30px;
      margin-top: 1px;
      margin-bottom: 8px; /* Adjusted from 10px */
    }
    
    /* Navigation styling */
    .sticky-header ul {
      list-style: none;
      padding: 0;
      margin-top: 1px; /* Increased from 1px */
      display: flex;
      justify-content: center;
      padding: 0px 0;
      position: relative;
      transition: all 0.3s ease;
      margin-bottom: 0; /* odstraní spodní mezeru */
    }
    
    .sticky-header.scrolled ul {
      margin-top: 1px; /* Add smaller margin when scrolled */
    }
    
    .sticky-header ul li {
      display: inline;
      margin: 0 15px;
      color: #023f1e;
      text-decoration: none;
      font-size: 18px;
      text-align: center;
    
      position: relative;
    }
    
    /* Button container */
    .sticky-header .button-container {
      display: flex;
      align-items: center;
      margin-right: 1.5vmax;
      margin-left: 1.5vmax;
      white-space: nowrap;
      margin-top: 1px; /* Add space above buttons */
      margin-bottom: 1; /* odstraní jakýkoli spodní margin */
    }
    
    /* Arrow styling */
    .sticky-header .arrow {
      font-size: 18px;
      color: #025227;
    }
    
    /* Dropdown styling */
    .sticky-header .dropdown {
      position: relative;
      display: inline-block;
      margin: 0;
    }
    
    .sticky-header .main-button,
    .sticky-header .maine-button,
    .sticky-header .dropdown-toggle,
    .sticky-header .dropdown-toggle-second {
      background-color: #f0f9f0;
      color: #025227;
      font-weight: bold;
      text-decoration: none;
      border-radius: 20px;
      font-size: 16px;
      border: none;
      cursor: pointer;
      transition: background-color 0.3s ease, color 0.3s ease;
      display: flex;
      align-items: center; 
      justify-content: center;
      padding: 12px 20px;
    }
    
    .sticky-header .main-button {
      border-top-right-radius: 0px;
      border-bottom-right-radius: 0px;
      height: 18.5px;
    }
    
    .sticky-header .maine-button {
      border-top-right-radius: 20px; 
      border-bottom-right-radius: 20px;
      height: 18.5px;
    }
    
    .sticky-header .dropdown-toggle,
    .sticky-header .dropdown-toggle-second {
      width: 100%;
      max-width: 40px;
      border-top-left-radius: 0px;
      border-bottom-left-radius: 0px;
      display: inline-flex;
      height: 42px;
      margin-left: 2px;
      shape-outside: border-box;
    }
    
    .sticky-header .sub-dropdown-toggle {
      margin-left: 5px;
      font-size: 16px;
      cursor: pointer;
      color: #025227;
      position: relative;
    }
    
    .sticky-header .sub-dropdown-toggle::before {
      content: '';
      position: absolute;
      top: -14px;
      right: -16px;
      bottom: -9.5px;
      left: -4.8px;
      z-index: 1;
      border-top-right-radius: 5px; 
    }
    
    .sticky-header .main-button:hover,
    .sticky-header .maine-button:hover,
    .sticky-header .dropdown-toggle:hover,
    .sticky-header .dropdown-toggle-second:hover {
      background-color: #309ce5;
      color: white;
      width: auto;
    }
    
    .sticky-header .dropdown-toggle .arrow,
    .sticky-header .dropdown-toggle-second .arrow {
      color: #025227;
    }
    
    .sticky-header .dropdown-toggle:hover .arrow,
    .sticky-header .dropdown-toggle-second:hover .arrow {
      color: white;
    }
    
    /* Dropdown content styling */
    .sticky-header .dropdown-content,
    .sticky-header .dropdown-content-second {
      position: absolute;
      background-color: #f0f9f0;
      box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.2);
      border-radius: 5px;
      padding: 5px;
      z-index: 1000;
      width: 150px;
      margin-top: 3px;
      font-size: medium;
      opacity: 0;
      visibility: hidden;
      display: none;
      transition: opacity 0.3s ease-in-out, visibility 0s 0.3s;
    }
    
    .sticky-header .dropdown-content.show,
    .sticky-header .dropdown-content-second.show {
      opacity: 1;
      visibility: visible;
      display: block;
      transition: opacity 0.3s ease-in-out, visibility 0s;
    }
    
    .sticky-header .dropdown-content {
      left: 50%;
      transform: translateX(-3%);
    }
    
    .sticky-header .dropdown-content-second {
      left: 50%;
      transform: translateX(-20%);
    }
    
    .sticky-header .sub-dropdown-content {
      position: absolute;
      left: 100%;
      top: 1px;
      background-color: #f0f9f0;
      box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.2);
      border-radius: 5px;
      padding: 5px;
      min-width: 150px;
      margin-left: 4.5%;
      opacity: 0;
      visibility: hidden;
      display: none;
      transition: opacity 0.3s ease-in-out, visibility 0s 0.3s;
      z-index: 1000;
    }
    
    .sticky-header .sub-dropdown-content.show {
      opacity: 1;
      visibility: visible;
      display: block;
      transition: opacity 0.3s ease-in-out, visibility 0s;
    }
    
    .sticky-header .dropdown-content a,
    .sticky-header .dropdown-content-second a,
    .sticky-header .sub-dropdown-content a {
      padding: 10px;
      color: #025227;
      text-decoration: none;
      font-weight: bold;
      display: block;
    }
    
    .sticky-header .dropdown-content a:hover,
    .sticky-header .dropdown-content a.centered:hover,
    .sticky-header .dropdown-content-second a:hover,
    .sticky-header .sub-dropdown-content a:hover  {
      background-color: #309ce5;
      color: white;
    }
    
    .sticky-header .dropdown-content a.centered {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      width: 100%;
      color: #025227;
      text-decoration: none;
      padding-left: 53px;
    }
    
    .sticky-header .dropdown-content a.centered:hover {
      cursor: pointer;
    }
    
    .sticky-header .main-button.active,
    .sticky-header .maine-button.active,
    .sticky-header .dropdown-content a.active,
    .sticky-header .dropdown-content-second a.active {
      background-color: #1c77e8;
      color: white;
    }
    
    /* Dead zone for dropdown hover */
    .sticky-header-dead-zone, 
    .sub-dropdown-dead-zone {
      position: absolute;
      z-index: 999;
      background-color: transparent;
      pointer-events: auto;
      /* Odkomentujte následující řádek pro debugging */
      /* background-color: rgba(255, 0, 0, 0.2); */
    }
    
    /* Media queries for responsive design */
    @media screen and (max-width: 768px) {
      .sticky-header h1 {
        font-size: 30px;
        margin-top: 15px;
      }
      
      .sticky-header.scrolled h1 {
        font-size: 24px;
        margin-top: 8px;
      }
      
      .sticky-header ul li {
        margin: 0 10px;
        font-size: 16px;
      }
    }
    .sticky-header  .home-icon {
    display: inline-block;
    position: relative;
    text-decoration: none;
    pointer-events: auto; /* UPRAVENO: Povolení interakce s celým prvkem */
    cursor: pointer; /* PŘIDÁNO: Zobrazuje kurzor ruky pro klikatelný prvek */
  }
  
   .sticky-header .home-icon img {
    width: 25px;
    height: auto;
    margin-left: 10px;
    margin-top: 9.3px;
    pointer-events: auto; /* Zapne interakci pouze pro obrázek */
  }
  
  .sticky-header .home-icon:hover img {
    filter: brightness(0) saturate(100%) invert(38%) sepia(79%) saturate(2126%) hue-rotate(174deg) brightness(105%) contrast(91%); /*Odpovídá přibližně barvě #309ce5 */
  }
  
    `;
    document.head.appendChild(styleTag);
  }
  
  // Create the sticky header structure
  function createStickyHeader() {
    // Create the sticky header container
    const stickyHeader = document.createElement('div');
    stickyHeader.className = 'sticky-header';
    stickyHeader.id = 'sticky-header';
    
    // Find the original header for reference
    const originalHeader = document.querySelector('header');
    
    if (!originalHeader) {
      console.error('Original header not found. Cannot create sticky header.');
      return;
    }
    
    // Clone the entire header content to preserve structure and classes
    const headerContent = originalHeader.cloneNode(true);
    
    // Remove any ID attributes from the cloned elements to avoid duplicates
    const elementsWithId = headerContent.querySelectorAll('[id]');
    elementsWithId.forEach(element => {
      // Add sticky- prefix to IDs to make them unique
      const originalId = element.getAttribute('id');
      element.setAttribute('id', 'sticky-' + originalId);
    });
    
    // Add the sticky-clone class to all dropdown elements for later identification
    const dropdownElements = headerContent.querySelectorAll('.dropdown, .dropdown-toggle, .dropdown-content, .dropdown-content-second, .sub-dropdown-toggle, .sub-dropdown-content');
    dropdownElements.forEach(element => {
      element.classList.add('sticky-clone');
    });
    
    // Extract and append main navigation elements
    const navElement = headerContent.querySelector('nav');
    if (navElement) {
      stickyHeader.appendChild(navElement);
    } else {
      // If no nav element found, try to find ul or other navigation containers
      const ulElement = headerContent.querySelector('ul');
      if (ulElement) {
        stickyHeader.appendChild(ulElement);
      } else {
        // Fallback: copy button containers or other important elements
        const buttonContainers = headerContent.querySelectorAll('.button-container');
        if (buttonContainers.length > 0) {
          const navContainer = document.createElement('div');
          navContainer.className = 'sticky-nav-container';
          
          buttonContainers.forEach(container => {
            navContainer.appendChild(container);
          });
          
          stickyHeader.appendChild(navContainer);
        } else {
          // Last resort: copy all visible links
          const navList = document.createElement('ul');
          
          const links = headerContent.querySelectorAll('a');
          links.forEach(link => {
            if (link.offsetParent !== null) { // Only visible links
              const li = document.createElement('li');
              li.appendChild(link);
              navList.appendChild(li);
            }
          });
          
          stickyHeader.appendChild(navList);
        }
      }
    }
    
    // Append the sticky header to the body
    document.body.appendChild(stickyHeader);
    
    console.log('Sticky header created with appropriate navigation structure');
  }
  
  // Initialize sticky header functionality
  function initStickyHeaderFunctionality() {
    const stickyHeader = document.querySelector('.sticky-header');
    const mainHeader = document.querySelector('header');
    
    if (!stickyHeader || !mainHeader) {
      console.error('Sticky header or main header not found');
      return;
    }
    
    // PŘIDÁNO: Inicializace funkce domečku
    initializeHomeIcon(stickyHeader);
    
    // Get the height of the main header
    const mainHeaderHeight = mainHeader.offsetHeight;
    
    // Variables for scroll handling
    let lastScrollY = window.scrollY || document.documentElement.scrollTop;
    let ticking = false;
    
    // Handle scroll event
    function handleScroll() {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollY = window.scrollY || document.documentElement.scrollTop;
          
          // Pokud jsme na vrcholu stránky nebo v oblasti původního headeru, okamžitě skryjeme sticky header BEZ ANIMACE
          if (scrollY <= mainHeaderHeight) {
            // Odstraníme třídu 'visible' pro skrytí
            stickyHeader.classList.remove('visible');
            stickyHeader.classList.remove('scrolled');
            
            // Nastavíme transform přímo na translateY(-100%) pro okamžité skrytí bez animace
            stickyHeader.style.transform = 'translateY(-100%)';
            
            // Vypneme transition dočasně pro okamžitý efekt
            stickyHeader.style.transition = 'none';
          } 
          // Jsme pod původním headerem, vrátíme normální chování
          else {
            // Obnovíme normální chování transition a transform řízeného přes CSS
            stickyHeader.style.transition = '';
            stickyHeader.style.transform = '';
            
            // Pokud scrollujeme nahoru, zobrazíme header
            if (scrollY < lastScrollY) {
              stickyHeader.classList.add('visible');
              
              // Přidáme 'scrolled' třídu pro kompaktnější vzhled když jsme dále
              if (scrollY > mainHeaderHeight + 100) {
                stickyHeader.classList.add('scrolled');
              } else {
                stickyHeader.classList.remove('scrolled');
              }
            } 
            // Pokud scrollujeme dolů, skryjeme header
            else if (scrollY > lastScrollY) {
              stickyHeader.classList.remove('visible');
            }
          }
          
          lastScrollY = scrollY;
          ticking = false;
        });
        
        ticking = true;
      }
    }
    
    // Add scroll event listener
    window.addEventListener('scroll', handleScroll);
    
    // Initial check to set correct state - při načtení stránky zkontrolujeme pozici
    // a zobrazíme sticky header, pokud jsme někde uprostřed stránky
    (function initialCheck() {
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      
      // Pokud jsme při načtení stránky skrollnutí níže než původní header a ne na začátku
      if (scrollY > mainHeaderHeight) {
        stickyHeader.classList.add('visible');
        
        if (scrollY > mainHeaderHeight + 100) {
          stickyHeader.classList.add('scrolled');
        }
      }
    })();
    
    // Initialize dropdown functionality for the sticky header
    initializeStickyDropdowns();
    
    console.log('Sticky header functionality initialized');
  }
  
  // PŘIDÁNO: Funkce pro inicializaci domečku
  function initializeHomeIcon(stickyHeader) {
    // Najít všechny prvky s třídou home-icon ve sticky headeru
    const homeIcons = stickyHeader.querySelectorAll('.home-icon');
    
    homeIcons.forEach(homeIcon => {
      // Pokud ikona nemá atribut href, přidáme ho
      if (!homeIcon.hasAttribute('href')) {
        homeIcon.setAttribute('href', '/');  // Nastavte správnou cestu k domovské stránce
      }
      
      // Zajistíme, že element funguje jako odkaz
      homeIcon.style.cursor = 'pointer';
      
      // Přidání event listeneru pro kliknutí
      homeIcon.addEventListener('click', function(e) {
        // Přesměrování na domovskou stránku
        window.location.href = homeIcon.getAttribute('href') || '/';
      });
      
      console.log('Home icon initialized with click functionality');
    });
  }
  
  // Mouse movement tracking utility
  const MouseTracker = {
    // Keep track of mouse movement patterns
    lastPositions: [],
    maxPositions: 10, // Track last 10 positions
    lastMoveTime: 0,
    
    // Store recent mouse positions
    trackMousePosition: function(e) {
      const now = Date.now();
      
      // Only track if enough time has passed (30ms)
      if (now - this.lastMoveTime > 30) {
        this.lastMoveTime = now;
        
        // Add current position to array
        this.lastPositions.push({
          x: e.clientX,
          y: e.clientY,
          time: now
        });
        
        // Limit array size
        if (this.lastPositions.length > this.maxPositions) {
          this.lastPositions.shift();
        }
      }
    },
    
    // Initialize tracking
    init: function() {
      // Add global mouse tracking
      document.addEventListener('mousemove', (e) => {
        this.trackMousePosition(e);
      });
      
      console.log('Mouse movement tracking initialized');
    },
    
    // Predict if user is moving toward an element
    isMovingToward: function(element) {
      if (this.lastPositions.length < 3) return false;
      
      // Get element position
      const rect = element.getBoundingClientRect();
      const elementCenter = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      };
      
      // Get last positions
      const pos1 = this.lastPositions[this.lastPositions.length - 1];
      const pos2 = this.lastPositions[this.lastPositions.length - 3]; // Skip one to get clearer direction
      
      // Calculate movement vector
      const moveVector = {
        x: pos1.x - pos2.x,
        y: pos1.y - pos2.y
      };
      
      // Calculate vector from current position to element
      const toElementVector = {
        x: elementCenter.x - pos1.x,
        y: elementCenter.y - pos1.y
      };
      
      // Calculate dot product to determine if moving toward element
      const dotProduct = moveVector.x * toElementVector.x + moveVector.y * toElementVector.y;
      
      // If dot product is positive, movement is generally toward the element
      return dotProduct > 0;
    },
    
    // Calculate mouse speed (pixels per second)
    getCurrentSpeed: function() {
      if (this.lastPositions.length < 2) return 0;
      
      const pos1 = this.lastPositions[this.lastPositions.length - 1];
      const pos2 = this.lastPositions[this.lastPositions.length - 2];
      
      // Calculate distance
      const dx = pos1.x - pos2.x;
      const dy = pos1.y - pos2.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // Calculate time difference in seconds
      const timeDiff = (pos1.time - pos2.time) / 1000;
      
      // Return speed in pixels per second
      return timeDiff > 0 ? distance / timeDiff : 0;
    }
  };
  
  // Initialize dropdowns specifically for the sticky header
  function initializeStickyDropdowns() {
    const stickyHeader = document.querySelector('.sticky-header');
    if (!stickyHeader) return;
    
    // Initialize mouse tracking
    MouseTracker.init();
    
    // Find all dropdown toggles in the sticky header
    const dropdownToggles = stickyHeader.querySelectorAll('.dropdown-toggle, .dropdown-toggle-second');
    
    console.log(`Found ${dropdownToggles.length} dropdown toggles in sticky header`);
    
    // Save dropdown states
    window.stickyDropdownStates = window.stickyDropdownStates || {};
    
    // Restore dropdown states from localStorage if available
    try {
      const savedStates = localStorage.getItem('stickyDropdownStates');
      if (savedStates) {
        window.stickyDropdownStates = JSON.parse(savedStates);
        console.log('Restored dropdown states from localStorage:', window.stickyDropdownStates);
      }
    } catch (e) {
      console.error('Error restoring dropdown states:', e);
    }
    
    // Apply strict pointer-event rules to all button containers
    const buttonContainers = stickyHeader.querySelectorAll('.button-container');
    buttonContainers.forEach(container => {
      // Make container non-interactive
      container.style.pointerEvents = 'none';
      
      // But all direct children should be interactive
      Array.from(container.children).forEach(child => {
        child.style.pointerEvents = 'auto';
      });
    });
    
    // Initialize each dropdown
    dropdownToggles.forEach((toggle, index) => {
      // Find the parent dropdown container
      const dropdown = toggle.closest('.dropdown');
      if (!dropdown) {
        console.warn(`Toggle ${index} has no parent dropdown container`);
        return;
      }
      
      // Find the dropdown content
      const content = dropdown.querySelector('.dropdown-content, .dropdown-content-second');
      if (!content) {
        console.warn(`Toggle ${index} has no associated dropdown content`);
        return;
      }
      
      // Find main button if it exists
      const mainButton = dropdown.querySelector('.main-button, .maine-button');
      
      console.log(`Initializing dropdown ${index}:`, {
        toggle: toggle.className,
        content: content.className,
        mainButton: mainButton?.className
      });
      
      // Set unique ID for this dropdown
      const dropdownId = `sticky-dropdown-${index}`;
      dropdown.setAttribute('data-dropdown-id', dropdownId);
      
      // Create dead zone for smoother hover behavior
      const deadZoneId = `sticky-header-dead-zone-${index}`;
      let deadZone = document.getElementById(deadZoneId);
      
      if (!deadZone) {
        deadZone = document.createElement('div');
        deadZone.className = 'sticky-header-dead-zone';
        deadZone.id = deadZoneId;
        deadZone.style.display = 'none';
        document.body.appendChild(deadZone);
      }
      
      // Variables to track state
      let hideTimeout;
      let isOpen = false;
      let hoverIntentTimeout;
      let intentDelay = 200; // ms to wait before opening on hover for more intentional interaction
      
      // Check saved state
      if (window.stickyDropdownStates[dropdownId] === true) {
        // If saved as open, open immediately
        setTimeout(() => {
          showDropdown(true); // true = from saved state
          console.log(`Reopened dropdown ${dropdownId} from saved state`);
        }, 500); // Small delay to ensure DOM is ready
      }
      
      // Store submenu active state
      window.isSubmenuActive = false;
      
      // Function for submenus to inform parent about their state
      window.setSubmenuActive = function(active) {
        window.isSubmenuActive = active;
      };
      
      // More precise dead zone positioning to avoid overflow
      function positionDeadZone() {
        const toggleRect = toggle.getBoundingClientRect();
        const contentRect = content.getBoundingClientRect();
        
        // Use smaller padding for more precise targeting
        const padding = 5; // Reduced from 15px
        
        // Calculate position based on actual element bounds
        let leftPosition = Math.min(toggleRect.left, contentRect.left) - padding;
        let topPosition = toggleRect.bottom + window.scrollY;
        let width = Math.max(contentRect.width, toggleRect.width) + (padding * 2);
        
        // Ensure dead zone doesn't extend beyond the dropdown content
        const rightPosition = Math.max(toggleRect.right, contentRect.right) + padding;
        width = rightPosition - leftPosition;
        
        // Calculate height - minimal height to connect toggle and content
        const heightVal = Math.max(5, contentRect.top - toggleRect.bottom);
        
        // Apply calculated values
        deadZone.style.left = (leftPosition + window.scrollX) + 'px';
        deadZone.style.top = topPosition + 'px';
        deadZone.style.width = width + 'px';
        deadZone.style.height = heightVal + 'px';
        deadZone.style.zIndex = '999';
        
        console.log('Dead zone positioned at:', {
          left: deadZone.style.left,
          top: deadZone.style.top,
          width: deadZone.style.width,
          height: deadZone.style.height
        });
      }
      
      // Show dropdown
      function showDropdown(fromSavedState = false) {
        clearTimeout(hideTimeout);
        clearTimeout(hoverIntentTimeout);
        
        // Important: Close all other dropdowns in the sticky header first
        stickyHeader.querySelectorAll('.dropdown-content, .dropdown-content-second').forEach(el => {
          const parentDropdown = el.closest('.dropdown');
          const elDropdownId = parentDropdown?.getAttribute('data-dropdown-id');
          
          if (el !== content && el.classList.contains('show')) {
            el.classList.remove('show');
            el.style.opacity = '0';
            el.style.visibility = 'hidden';
            
            // Update saved state for the other dropdown being closed
            if (elDropdownId && elDropdownId !== dropdownId) {
              window.stickyDropdownStates[elDropdownId] = false;
              saveDropdownStates();
            }
            
            setTimeout(() => {
              el.style.display = 'none';
            }, 300);
          }
        });
        
        // Make sure content is visible first for proper positioning
        content.style.opacity = '0';
        content.style.display = 'block';
        
        // Force browser to calculate layout with display: block before applying transitions
        void content.offsetWidth;
        
        // Position dead zone PŘED zobrazením obsahu
        positionDeadZone();
        deadZone.style.display = 'block';
        
        // Apply ARIA attributes
        toggle.setAttribute('aria-expanded', 'true');
        
        // Use requestAnimationFrame for smoother animation
        requestAnimationFrame(() => {
          // Add show class to start transition
          content.classList.add('show');
          content.style.opacity = '1';
          content.style.visibility = 'visible';
          isOpen = true;
          
          // Save state to localStorage if this wasn't from a saved state restore
          if (!fromSavedState) {
            window.stickyDropdownStates[dropdownId] = true;
            saveDropdownStates();
          }
          
          console.log(`Sticky dropdown ${index} opened`, { content: content.className });
        });
      }
      
      // Hide dropdown
      function hideDropdown(immediate = false) {
        if (!isOpen) return;
        
        // Check if any submenu is active
        if (window.isSubmenuActive && !immediate) {
          console.log("Not closing dropdown because submenu is active");
          return;
        }
        
        // Use timeout for smoother UX, unless immediate is requested
        const delay = immediate ? 0 : 200;
        
        hideTimeout = setTimeout(() => {
          // Start hiding animation
          content.style.opacity = '0';
          content.style.visibility = 'hidden';
          content.classList.remove('show');
          
          // Hide dead zone immediately
          deadZone.style.display = 'none';
          
          // Update ARIA
          toggle.setAttribute('aria-expanded', 'false');
          
          // Wait for transition to complete before setting display: none
          setTimeout(() => {
            if (!content.classList.contains('show')) {
              content.style.display = 'none';
              isOpen = false;
              
              // Save closed state
              window.stickyDropdownStates[dropdownId] = false;
              saveDropdownStates();
              
              console.log(`Sticky dropdown ${index} closed`);
            }
          }, 300); // Match transition duration
        }, delay);
      }
      
      // Save dropdown states to localStorage
      function saveDropdownStates() {
        try {
          localStorage.setItem('stickyDropdownStates', JSON.stringify(window.stickyDropdownStates));
        } catch (e) {
          console.error('Error saving dropdown states:', e);
        }
      }
      
      // Toggle dropdown on click
      toggle.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (!isOpen) {
          showDropdown();
        } else {
          hideDropdown(true); // true = immediate
        }
      });
      
      // Handle main button click if it exists
      if (mainButton) {
        mainButton.addEventListener('click', (e) => {
          // If it's a real link, let it navigate
          if (mainButton.tagName === 'A' && mainButton.getAttribute('href') && mainButton.getAttribute('href') !== '#') {
            return;
          }
          
          e.preventDefault();
          e.stopPropagation();
          
          // Toggle dropdown
          if (!isOpen) {
            showDropdown();
          } else {
            hideDropdown(true);
          }
        });
      }
      
      // More intelligent hover behavior using MouseTracker
      toggle.addEventListener('mouseenter', (e) => {
        clearTimeout(hideTimeout);
        
        // If mouse is moving toward the toggle quickly, open immediately
        const mouseSpeed = MouseTracker.getCurrentSpeed();
        const isMovingToward = MouseTracker.isMovingToward(toggle);
        
        if (mouseSpeed > 500 && isMovingToward) {
          // Fast movement toward toggle - open immediately
          showDropdown();
          console.log('Fast movement toward toggle detected, opening immediately');
        } else {
          // Normal hover intent delay
          hoverIntentTimeout = setTimeout(() => {
            showDropdown();
          }, intentDelay);
        }
      });
      
      // Handle hover leaving
      toggle.addEventListener('mouseleave', () => {
        clearTimeout(hoverIntentTimeout);
        
        // Don't hide if mouse is in content or dead zone
        if (!isMouseInContent && !isMouseInDeadZone) {
          hideDropdown();
        }
      });
      
      // Track mouse in content area
      let isMouseInContent = false;
      content.addEventListener('mouseenter', () => {
        clearTimeout(hideTimeout);
        isMouseInContent = true;
      });
      
      content.addEventListener('mouseleave', () => {
        isMouseInContent = false;
        hideDropdown();
      });
      
      // Track mouse in dead zone
      let isMouseInDeadZone = false;
      deadZone.addEventListener('mouseenter', () => {
        clearTimeout(hideTimeout);
        isMouseInDeadZone = true;
      });
      
      deadZone.addEventListener('mouseleave', () => {
        isMouseInDeadZone = false;
        hideDropdown();
      });
      
      // Close dropdown on document click
      document.addEventListener('click', (e) => {
        // Only close if the click is outside the dropdown and its content
        if (isOpen && !dropdown.contains(e.target) && !deadZone.contains(e.target)) {
          hideDropdown(true); // true = immediate
        }
      });
      
      // Initialize sub-dropdowns within this dropdown
      initializeSubDropdowns(content);
      
      console.log(`Dropdown ${index} fully initialized`);
    });
    
    // Document-level event to close all dropdowns on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeAllStickyDropdowns();
      }
    });
  }
  
  // Initialize all sub-dropdowns within a dropdown content
  function initializeSubDropdowns(parentContent) {
    const subToggles = parentContent.querySelectorAll('.sub-dropdown-toggle');
    
    console.log(`Found ${subToggles.length} sub-dropdown toggles`);
    
    subToggles.forEach((subToggle, subIndex) => {
      // Find associated content
      const subContent = subToggle.nextElementSibling;
      if (!subContent || !subContent.classList.contains('sub-dropdown-content')) {
        console.warn(`Sub-toggle ${subIndex} has no valid content`);
        return;
      }
      
      console.log(`Initializing sub-dropdown ${subIndex}:`, {
        toggle: subToggle.className,
        content: subContent.className
      });
      
      // Create dead zone for smoother hover
      const subDeadZoneId = `sub-dropdown-dead-zone-${subIndex}`;
      let subDeadZone = document.getElementById(subDeadZoneId);
      
      if (!subDeadZone) {
        subDeadZone = document.createElement('div');
        subDeadZone.className = 'sub-dropdown-dead-zone';
        subDeadZone.id = subDeadZoneId;
        subDeadZone.style.display = 'none';
        document.body.appendChild(subDeadZone);
      }
      
      // State tracking
      let isSubOpen = false;
      let subHideTimeout;
      
      // Position the sub-dropdown dead zone
      function positionSubDeadZone() {
        const toggleRect = subToggle.getBoundingClientRect();
        const contentRect = subContent.getBoundingClientRect();
        
        // Calculate position - bridge between toggle and content
        subDeadZone.style.left = (toggleRect.right + window.scrollX) + 'px';
        subDeadZone.style.top = (toggleRect.top + window.scrollY) + 'px';
        subDeadZone.style.width = (contentRect.left - toggleRect.right) + 'px';
        subDeadZone.style.height = toggleRect.height + 'px';
        
        console.log('Sub dead zone positioned');
      }
      
      // Show sub-dropdown
      function showSubDropdown() {
        clearTimeout(subHideTimeout);
        
        // Make sure content is visible first for proper positioning
        subContent.style.opacity = '0';
        subContent.style.display = 'block';
        
        // Notify parent dropdown that submenu is active
        window.setSubmenuActive(true);
        
        // Force browser to calculate layout
        void subContent.offsetWidth;
        
        // Position dead zone
        positionSubDeadZone();
        subDeadZone.style.display = 'block';
        
        // Apply ARIA
        subToggle.setAttribute('aria-expanded', 'true');
        
        // Use requestAnimationFrame for smoother animation
        requestAnimationFrame(() => {
          subContent.classList.add('show');
          subContent.style.opacity = '1';
          subContent.style.visibility = 'visible';
          isSubOpen = true;
        });
      }
      
      // Hide sub-dropdown
      function hideSubDropdown() {
        clearTimeout(subHideTimeout);
        
        subHideTimeout = setTimeout(() => {
          // Start hiding animation
          subContent.style.opacity = '0';
          subContent.style.visibility = 'hidden';
          subContent.classList.remove('show');
          
          // Hide dead zone
          subDeadZone.style.display = 'none';
          
          // Update ARIA
          subToggle.setAttribute('aria-expanded', 'false');
          
          // Notify parent dropdown that submenu is no longer active
          window.setSubmenuActive(false);
          
          // Wait for transition to complete
          setTimeout(() => {
            if (!subContent.classList.contains('show')) {
              subContent.style.display = 'none';
              isSubOpen = false;
            }
          }, 300);
        }, 200);
      }
      
      // Track mouse in sub-toggle
      subToggle.addEventListener('mouseenter', () => {
        clearTimeout(subHideTimeout);
        showSubDropdown();
      });
      
      subToggle.addEventListener('mouseleave', () => {
        // Don't hide if mouse is in content or dead zone
        if (!isMouseInSubContent && !isMouseInSubDeadZone) {
          hideSubDropdown();
        }
      });
      
      // Track mouse in sub-content
      let isMouseInSubContent = false;
      subContent.addEventListener('mouseenter', () => {
        clearTimeout(subHideTimeout);
        isMouseInSubContent = true;
      });
      
      subContent.addEventListener('mouseleave', () => {
        isMouseInSubContent = false;
        hideSubDropdown();
      });
      
      // Track mouse in sub-dead zone
      let isMouseInSubDeadZone = false;
      subDeadZone.addEventListener('mouseenter', () => {
        clearTimeout(subHideTimeout);
        isMouseInSubDeadZone = true;
      });
      
      subDeadZone.addEventListener('mouseleave', () => {
        isMouseInSubDeadZone = false;
        hideSubDropdown();
      });
    });
  }
  
  // Helper function to close all dropdowns
  function closeAllStickyDropdowns() {
    const stickyHeader = document.querySelector('.sticky-header');
    
    if (stickyHeader) {
      const dropdownContents = stickyHeader.querySelectorAll('.dropdown-content.show, .dropdown-content-second.show');
      
      dropdownContents.forEach(content => {
        // Apply hide animation
        content.style.opacity = '0';
        content.style.visibility = 'hidden';
        content.classList.remove('show');
        
        // Wait for animation to complete
        setTimeout(() => {
          content.style.display = 'none';
        }, 300);
        
        // Update ARIA
        const parentDropdown = content.closest('.dropdown');
        if (parentDropdown) {
          const toggle = parentDropdown.querySelector('.dropdown-toggle, .dropdown-toggle-second');
          if (toggle) {
            toggle.setAttribute('aria-expanded', 'false');
          }
          
          // Update saved state
          const dropdownId = parentDropdown.getAttribute('data-dropdown-id');
          if (dropdownId) {
            window.stickyDropdownStates[dropdownId] = false;
            
            // Save to localStorage
            try {
              localStorage.setItem('stickyDropdownStates', JSON.stringify(window.stickyDropdownStates));
            } catch (e) {
              console.error('Error saving dropdown states:', e);
            }
          }
        }
      });
      
      // Hide all dead zones
      document.querySelectorAll('.sticky-header-dead-zone, .sub-dropdown-dead-zone').forEach(zone => {
        zone.style.display = 'none';
      });
    }
  }
  
   // UPRAVENO: Funkce pro inicializaci domečku s přesnou aktivní zónou pouze pro obrázek
function initializeHomeIcon(stickyHeader) {
    // Najít všechny prvky s třídou home-icon ve sticky headeru
    const homeIcons = stickyHeader.querySelectorAll('.home-icon');
  
    homeIcons.forEach(homeIcon => {
      // Najít obrázek uvnitř home-icon
      const img = homeIcon.querySelector('img');
      if (!img) return;
  
      // Získat adresu pro odkaz
      const href = homeIcon.getAttribute('href') || '/';
  
      // Vytvoříme nový kontejner, který bude mít pointer-events: none
      const container = document.createElement('span');
      container.classList.add('home-icon-container');
      container.style.display = 'inline-block';
      container.style.position = 'relative';
      container.style.pointerEvents = 'none'; // Vypne všechny interakce na kontejneru
  
      // Vytvoříme nový img element s vlastními clickable vlastnostmi
      const newImg = document.createElement('img');
      newImg.src = img.src;
      newImg.alt = img.alt || 'Home';
      newImg.style.width = '25px';
      newImg.style.height = 'auto';
      newImg.style.marginLeft = '10px';
      newImg.style.marginTop = '9.3px';
      newImg.style.pointerEvents = 'auto'; // Zapne interakci pouze pro obrázek
      newImg.style.cursor = 'pointer';
  
      // Přidáme event listener přímo na obrázek
      newImg.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        window.location.href = href;
      });
  
      // Efekt při najetí myší
      newImg.addEventListener('mouseenter', function() {
        newImg.style.filter = 'brightness(0) saturate(100%) invert(38%) sepia(79%) saturate(2126%) hue-rotate(174deg) brightness(105%) contrast(91%)';
      });
  
      newImg.addEventListener('mouseleave', function() {
        newImg.style.filter = '';
      });
  
      // Přidáme obrázek do kontejneru
      container.appendChild(newImg);
  
      // Nahradíme původní element novým kontejnerem
      homeIcon.parentNode.replaceChild(container, homeIcon);
  
      console.log('Home icon rebuilt with precise click area limited to the image only');
    });
  }
//----- ZOOM FUNCTIONALITY -----//
document.addEventListener('DOMContentLoaded', function() {
    // Vytvořit modal element
    var modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'none';
    
    // Kontejner pro obrázek
    var imageContainer = document.createElement('div');
    imageContainer.className = 'image-container';
    
    var modalImg = document.createElement('img');
    modalImg.className = 'modal-content';
    
    var closeBtn = document.createElement('span');
    closeBtn.className = 'close';
    closeBtn.innerHTML = '&times;';
    
    // Sestavení DOM struktury
    imageContainer.appendChild(modalImg);
    modal.appendChild(closeBtn);
    modal.appendChild(imageContainer);
    document.body.appendChild(modal);
    
    // Proměnné pro posouvání obrázku
    var isDragging = false;
    var wasDragging = false;
    var startX, startY, translateX = 0, translateY = 0;
    var initialTranslateX = 0, initialTranslateY = 0; // Počáteční pozice pro tažení
    var isZoomed = false;
    var currentScale = 1;
    var minScale = 1;
    var maxScale = 3;
    var mouseIsOverImage = false; // Sledování, zda je myš nad obrázkem
    
    // Přidat event listener pouze na obrázky s třídou 'zoomable'
    var images = document.querySelectorAll('img.zoomable');
    images.forEach(function(img) {
        img.addEventListener('click', function() {
            openModal(this.src);
        });
    });
    
    // Funkce pro otevření modálního okna
    function openModal(imgSrc) {
        modal.style.display = 'flex';
        modalImg.src = imgSrc;
        isZoomed = false;
        currentScale = 1;
        modalImg.classList.remove('zoomed');
        resetImagePosition();
        
        // Zabránit scrollování stránky v pozadí
        document.body.style.overflow = 'hidden';
    }
    
    // Kliknutí na obrázek pro přepínání zvětšení
    modalImg.addEventListener('click', function(e) {
        setTimeout(function() {
            if (!isDragging && !wasDragging) {
                toggleZoom(e);
            }
        }, 10);
        e.stopPropagation();
    });
    
    // Funkce pro přepínání zvětšení
    function toggleZoom(e) {
        if (!isZoomed) {
            zoomIn(e);
        } else {
            zoomOut();
        }
    }
    
    // Funkce pro zvětšení s určením středu zvětšení
    function zoomIn(e) {
        isZoomed = true;
        currentScale = 2; // Nastavení na fixní hodnotu zvětšení
        modalImg.classList.add('zoomed');
        
        // Zvětšení na pozici kurzoru
        if (e) {
            var rect = modalImg.getBoundingClientRect();
            var mouseX = e.clientX - rect.left;
            var mouseY = e.clientY - rect.top;
            var centerX = rect.width / 2;
            var centerY = rect.height / 2;
            translateX = (centerX - mouseX) * 2;
            translateY = (centerY - mouseY) * 2;
            
            // Omezení posunu na hranice obrázku
            constrainTranslation();
        }
        updateImagePosition();
    }
    
    // Funkce pro zmenšení
    function zoomOut() {
        isZoomed = false;
        currentScale = 1;
        modalImg.classList.remove('zoomed');
        resetImagePosition();
    }
    
    // Funkce pro resetování pozice obrázku
    function resetImagePosition() {
        translateX = 0;
        translateY = 0;
        updateImagePosition();
    }
    
    // Funkce pro aktualizaci pozice obrázku
    function updateImagePosition() {
        modalImg.style.transform = `scale(${currentScale}) translate(${translateX/currentScale}px, ${translateY/currentScale}px)`;
    }
    
    // Omezení posunu na hranice obrázku
    function constrainTranslation() {
        // Získat velikost obrázku a kontejneru
        var imgRect = modalImg.getBoundingClientRect();
        var containerRect = imageContainer.getBoundingClientRect();
        
        // Vypočítat maximální posun, který je možný v každém směru
        var maxTranslateX = (imgRect.width * (currentScale - 1)) / 2;
        var maxTranslateY = (imgRect.height * (currentScale - 1)) / 2;
        
        // Omezit posun na hranice obrázku
        translateX = Math.min(Math.max(translateX, -maxTranslateX), maxTranslateX);
        translateY = Math.min(Math.max(translateY, -maxTranslateY), maxTranslateY);
    }
    
    // Sledování myši nad obrázkem
    modalImg.addEventListener('mouseenter', function() {
        mouseIsOverImage = true;
    });
    
    modalImg.addEventListener('mouseleave', function() {
        mouseIsOverImage = false;
    });
    
    // Začátek tažení (drag) obrázku
    modalImg.addEventListener('mousedown', function(e) {
        if (isZoomed) {
            isDragging = true;
            wasDragging = false;
            startX = e.clientX;
            startY = e.clientY;
            initialTranslateX = translateX; // Uložit počáteční pozici
            initialTranslateY = translateY;
            modalImg.classList.add('grabbing');
            e.preventDefault();
        }
    });
    
    // Posouvání obrázku při tažení - plynulejší varianta optimalizovaná i pro touchpad
    document.addEventListener('mousemove', function(e) {
        if (isDragging && isZoomed) {
            var moveX = e.clientX - startX;
            var moveY = e.clientY - startY;
            
            // Pokud došlo k významnému posunu, označíme, že bylo taženo
            if (Math.abs(moveX) > 5 || Math.abs(moveY) > 5) {
                wasDragging = true;
            }
            
            // Výpočet nové pozice na základě počáteční pozice a celkového posunu
            var sensitivityFactor = 1.5; // Zvýšení citlivosti pro touchpad
            translateX = initialTranslateX + (moveX * sensitivityFactor);
            translateY = initialTranslateY + (moveY * sensitivityFactor);
            
            // Omezení posunu na hranice obrázku
            constrainTranslation();
            
            updateImagePosition();
            e.preventDefault();
        }
    });
    
    // Ukončení tažení
    document.addEventListener('mouseup', function(e) {
        if (isDragging) {
            isDragging = false;
            modalImg.classList.remove('grabbing');
        }
    });
    
    // Odchod kurzoru z okna - také ukončí tažení, ale nezavře modal
    document.addEventListener('mouseleave', function() {
        if (isDragging) {
            isDragging = false;
            modalImg.classList.remove('grabbing');
        }
    });
    
    // Podpora pro kolečko myši pouze pro zoom, bez posunu
    modalImg.addEventListener('wheel', function(e) {
        e.preventDefault(); // Zabraňujeme defaultnímu scrollování stránky
        
        // Zjistíme směr scrollu (nahoru = přiblížení, dolů = oddálení)
        if (e.deltaY < 0) {
            // Scroll nahoru - přiblížit
            if (!isZoomed) {
                zoomIn(e);
            }
        } else {
            // Scroll dolů - oddálit
            if (isZoomed) {
                zoomOut();
            }
        }
    }, { passive: false });
    
    // Podpora pro dotyková zařízení - pinch to zoom
    var lastTouchDistance = 0;
    var initialScale = 1;
    
    modalImg.addEventListener('touchstart', function(e) {
        if (e.touches.length === 2) {
            lastTouchDistance = getTouchDistance(e.touches);
            initialScale = currentScale;
            e.preventDefault();
        } else if (isZoomed) {
            isDragging = true;
            wasDragging = false;
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            initialTranslateX = translateX;
            initialTranslateY = translateY;
            e.preventDefault();
        }
    }, { passive: false });
    
    modalImg.addEventListener('touchmove', function(e) {
        if (e.touches.length === 2) {
            // Pinch to zoom
            var currentDistance = getTouchDistance(e.touches);
            var scale = initialScale * (currentDistance / lastTouchDistance);
            currentScale = Math.max(minScale, Math.min(maxScale, scale));
            
            if (currentScale > 1) {
                isZoomed = true;
                modalImg.classList.add('zoomed');
            } else {
                isZoomed = false;
                modalImg.classList.remove('zoomed');
                resetImagePosition();
            }
            
            constrainTranslation();
            updateImagePosition();
            e.preventDefault();
        } else if (isDragging && isZoomed) {
            // Drag na dotykových zařízeních
            var moveX = e.touches[0].clientX - startX;
            var moveY = e.touches[0].clientY - startY;
            
            if (Math.abs(moveX) > 5 || Math.abs(moveY) > 5) {
                wasDragging = true;
            }
            
            translateX = initialTranslateX + moveX;
            translateY = initialTranslateY + moveY;
            
            constrainTranslation();
            updateImagePosition();
            e.preventDefault();
        }
    }, { passive: false });
    
    modalImg.addEventListener('touchend', function(e) {
        isDragging = false;
        
        setTimeout(function() {
            wasDragging = false;
        }, 100);
    });
    
    function getTouchDistance(touches) {
        var dx = touches[0].clientX - touches[1].clientX;
        var dy = touches[0].clientY - touches[1].clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    // Zavřít modal při kliknutí na křížek
    closeBtn.addEventListener('click', function(e) {
        closeModal();
        e.stopPropagation();
    });
    
    // Zavřít modal při kliknutí na jakoukoliv oblast modalu
    modal.addEventListener('click', function(e) {
        // Zavřeme modal pouze pokud nebylo předtím taženo
        if (!wasDragging) {
            // Zkontrolujme, že kliknutí není přímo na obrázek
            if (e.target !== modalImg) {
                closeModal();
            }
        }
        // Reset příznaku tažení po krátké prodlevě
        setTimeout(function() {
            wasDragging = false;
        }, 10);
    });
    
    // Funkce pro zavření modalu
    function closeModal() {
        modal.style.display = 'none';
        isZoomed = false;
        currentScale = 1;
        modalImg.classList.remove('zoomed');
        modalImg.classList.remove('grabbing');
        resetImagePosition();
        wasDragging = false; // Reset příznaku tažení
        
        // Obnovení scrollování stránky
        document.body.style.overflow = '';
    }
    
    // Zavřít modal pomocí klávesy Escape
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            closeModal();
        }
    });
});


//---------COOKIES FUNCIONALITY--------------//
// JavaScript pro fungování oznámení o cookies

document.addEventListener('DOMContentLoaded', function() {
    // Kontrola, zda již bylo oznámení potvrzeno
    if(!localStorage.getItem('cookiesAccepted')) {
        // Pokud ne, zobrazit oznámení po 1 sekundě
        setTimeout(function() {
            const cookiesNotice = document.getElementById('cookiesMiniNotice');
            if (cookiesNotice) {
                cookiesNotice.classList.add('show');
            }
        }, 1000);
    }
    
    // Přidat posluchač události na tlačítko
    const acceptButton = document.getElementById('acceptCookies');
    if (acceptButton) {
        acceptButton.addEventListener('click', function() {
            // Skrýt oznámení
            const cookiesNotice = document.getElementById('cookiesMiniNotice');
            if (cookiesNotice) {
                cookiesNotice.classList.remove('show');
            }
            // Uložit nastavení do localStorage
            localStorage.setItem('cookiesAccepted', 'true');
        });
    }
});

// ZDROJE V OBRÁZCÍCH
document.addEventListener('DOMContentLoaded', function() {
      const infoBox = document.querySelector('.info-box');
      
      infoBox.addEventListener('click', function(e) {
        e.stopPropagation();
        
        // Kontrola, zda bylo kliknuto v oblasti ikony "i"
        const rect = this.getBoundingClientRect();
        const centerX = rect.left + 12; // Střed tlačítka X
        const centerY = rect.top + 12;  // Střed tlačítka Y
        const clickX = e.clientX;
        const clickY = e.clientY;
        
        // Výpočet vzdálenosti od středu kruhu
        const distance = Math.sqrt(
          Math.pow(clickX - centerX, 2) + 
          Math.pow(clickY - centerY, 2)
        );
        
        // Pokud je vzdálenost menší než poloměr kruhu (10px)
        if (distance <= 10) {
          // Pokud je již aktivní, tak ho zavřeme
          if (this.classList.contains('active')) {
            this.classList.remove('active');
            // Přidáme force-close třídu, aby se ignoroval hover
            this.classList.add('force-close');
            
            // Detekce opuštění prvku myší
            const handleMouseLeave = () => {
              infoBox.classList.remove('force-close');
              infoBox.removeEventListener('mouseleave', handleMouseLeave);
            };
            
            // Přidáme event listener na opuštění prvku myší
            infoBox.addEventListener('mouseleave', handleMouseLeave);
          } else {
            // Jinak ho otevřeme
            this.classList.add('active');
            this.classList.remove('force-close');
          }
        } else {
          // Pokud se kliklo na jinou část tlačítka než ikonku
          this.classList.toggle('active');
          this.classList.remove('force-close');
        }
        
        // Zabránit přepínání při pouhém najetí myši
        e.preventDefault();
      });
      
      // Při kliknutí kamkoliv jinam na stránku se tlačítko zavře
      document.addEventListener('click', function(e) {
        if (!infoBox.contains(e.target)) {
          infoBox.classList.remove('active');
          // Pokud se zavírá z důvodu kliknutí jinam, také použijeme force-close
          if (infoBox.matches(':hover')) {
            infoBox.classList.add('force-close');
            
            // Detekce opuštění prvku myší
            const handleMouseLeave = () => {
              infoBox.classList.remove('force-close');
              infoBox.removeEventListener('mouseleave', handleMouseLeave);
            };
            
            // Přidáme event listener na opuštění prvku myší
            infoBox.addEventListener('mouseleave', handleMouseLeave);
          }
        }
      });
    });

