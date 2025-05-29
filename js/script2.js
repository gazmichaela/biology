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
    let submenuHideTimeout; // NOVÉ: Timeout specificky pro submenu
    let clickInactivityTimeout; // NOVÝ: Timeout pro zavření po kliknutí při nečinnosti
const clickInactivityDelay = 2000; // 5 sekund pro zavření po kliknutí
    const inactivityDelay = 2000; // 2 sekundy neaktivity
    let isClickOpened = false; // Flag pro zjištění, zda bylo menu otevřeno kliknutím
    let isSubmenuActive = false; // Flag pro zjištění, zda je aktivní submenu
    let isMouseOverSubmenu = false; // NOVÉ: Sledování myši nad submenu
    let lastMouseMoveTime = 0; // NOVÉ: Časová značka posledního pohybu myši
    
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
    
    // NOVÉ: Funkce pro kontrolu, zda je myš nad submenu prvky
    function isMouseOverSubmenuElements() {
        const subDropdownContent = document.querySelector(".sub-dropdown-content");
        const subDropdownToggle = document.querySelector(".sub-dropdown-toggle");
        const deadZoneElementSub = document.querySelector(".sub-dropdown-dead-zone");
        
        if (subDropdownContent && subDropdownContent.style.display === "block") {
            const subMenuRect = subDropdownContent.getBoundingClientRect();
            if (mouseX >= subMenuRect.left && mouseX <= subMenuRect.right && 
                mouseY >= subMenuRect.top && mouseY <= subMenuRect.bottom) {
                return true;
            }
        }
        
        if (subDropdownToggle) {
            const subToggleRect = subDropdownToggle.getBoundingClientRect();
            if (mouseX >= subToggleRect.left && mouseX <= subToggleRect.right && 
                mouseY >= subToggleRect.top && mouseY <= subToggleRect.bottom) {
                return true;
            }
        }
        
        if (deadZoneElementSub && deadZoneElementSub.style.display === "block") {
            const subDeadRect = deadZoneElementSub.getBoundingClientRect();
            if (mouseX >= subDeadRect.left && mouseX <= subDeadRect.right && 
                mouseY >= subDeadRect.top && mouseY <= subDeadRect.bottom) {
                return true;
            }
        }
        
        return false;
    }
    
    // NOVÉ: Debounced funkce pro skrývání submenu
    function debounceSubmenuHide(delay = 150) {
        clearTimeout(submenuHideTimeout);
        submenuHideTimeout = setTimeout(() => {
            // Pouze pokud myš není nad submenu prvky
            if (!isMouseOverSubmenuElements()) {
                hideSubmenuSafely();
            }
        }, delay);
    }
    
    // NOVÉ: Bezpečná funkce pro skrytí submenu
    function hideSubmenuSafely() {
        const subDropdownContent = document.querySelector(".sub-dropdown-content");
        if (subDropdownContent && subDropdownContent.style.opacity === "1") {
            // Zkontrolujeme ještě jednou pozici myši před skrytím
            if (!isMouseOverSubmenuElements()) {
                subDropdownContent.style.opacity = "0";
                subDropdownContent.style.visibility = "hidden";
                
                setTimeout(() => {
                    subDropdownContent.style.display = "none";
                    
                    const deadZoneElementSub = document.querySelector(".sub-dropdown-dead-zone");
                    if (deadZoneElementSub) {
                        deadZoneElementSub.style.display = "none";
                    }
                    
                    localStorage.removeItem('isSubMenuOpen');
                    isSubmenuActive = false;
                }, 300);
            }
        }
    }
    
    // Funkce pro nastavení pozice a rozměrů mrtvé zóny s vyšší spolehlivostí
   
    
    // Funkce pro zobrazení menu - UPRAVENO PRO SPOLEHLIVOST
    function showMenu() {
        // Zrušíme všechny předchozí timeouty
        clearTimeout(hideTimeoutFirst);
        clearTimeout(animationTimeoutFirst);
        clearTimeout(inactivityTimeoutFirst);
        clearTimeout(clickInactivityTimeout);
        clearTimeout(submenuHideTimeout); // PŘIDÁNO: Zrušit timeout submenu
        
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
            
            // UPRAVENO: Použít novou funkci pro kontrolu submenu
            const isMouseOverSubElements = isMouseOverSubmenuElements();
            
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
            
        // Zavřít pouze pokud myš není nad žádným prvkem
if (!isMouseOverMenu && !isMouseOverToggle && !isMouseOverDeadZone && !isMouseOverSubElements) {
    hideMenu();
    isClickOpened = false;
}
// ODSTRANIT ELSE ČÁST - nerestarovat časovač když je myš nad menu
        }, inactivityDelay);
    }
    
    // NOVÁ: Funkce pro spuštění časovače zavření po kliknutí
function startClickInactivityTimer() {
    clearTimeout(clickInactivityTimeout);
    clickInactivityTimeout = setTimeout(() => {
        // Kontrola, zda myš není nad žádným dropdown prvkem
        const menuRect = dropdownContent.getBoundingClientRect();
        const toggleRect = dropdownToggle.getBoundingClientRect();
        const isMouseOverSubElements = isMouseOverSubmenuElements();
        
        const isMouseOverMenu = 
            mouseX >= menuRect.left && mouseX <= menuRect.right && 
            mouseY >= menuRect.top && mouseY <= menuRect.bottom;
            
        const isMouseOverToggle = 
            mouseX >= toggleRect.left && mouseX <= toggleRect.right && 
            mouseY >= toggleRect.top && mouseY <= toggleRect.bottom;
            
        const isMouseOverDeadZone = 
            deadZoneElement.style.display === "block" &&
            mouseX >= deadZoneElement.getBoundingClientRect().left && 
            mouseX <= deadZoneElement.getBoundingClientRect().right && 
            mouseY >= deadZoneElement.getBoundingClientRect().top && 
            mouseY <= deadZoneElement.getBoundingClientRect().bottom;
        
        // Zavřít pouze pokud myš není nad žádným prvkem
        if (!isMouseOverMenu && !isMouseOverToggle && !isMouseOverDeadZone && !isMouseOverSubElements) {
            hideMenu();
            isClickOpened = false;

        }
    }, clickInactivityDelay);
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
        clearTimeout(submenuHideTimeout); // PŘIDÁNO: Zrušit timeout submenu
        
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
            isMouseOverSubmenu = false; // PŘIDÁNO: Reset stavu myši
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
    
  // UPRAVENO: Lépe zpracovat událost zobrazení menu po najetí kurzoru
dropdownToggle.addEventListener("mouseenter", function() {
    // Aktualizujeme čas posledního pohybu myši
    lastMouseMoveTime = Date.now();
    
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
    
    // UPRAVENO: Zrušíme všechny submenu timeouty při najetí na hlavní tlačítko
    clearTimeout(submenuHideTimeout);
    
    // NOVÉ: Uložíme informaci o tom, že kurzor je nad tlačítkem
    localStorage.setItem('isMouseOverFirstToggle', 'true');
});
    
    // NOVÉ: Přidat listener pro mouseleave na toggle tlačítko pro záznam pozice
    dropdownToggle.addEventListener("mouseleave", function(e) {
        localStorage.removeItem('isMouseOverFirstToggle');
        
       // NOVÉ: Pokud je otevřeno kliknutím, restartovat časovač při odchodu myši
if (isClickOpened) {
    startClickInactivityTimer();
    return;
}

        
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
        clearTimeout(submenuHideTimeout); // PŘIDÁNO
        
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
            
            // UPRAVENO: Použít bezpečnou funkci pro skrytí submenu
            // UPRAVENO: Zrušíme timeout pro skrytí submenu při kliknutí
clearTimeout(submenuHideTimeout);
            
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
                // Spustíme nový časovač pro zavření po kliknutí
startClickInactivityTimer();
            });
        }
    });

    
    // Export funkce pro submenu
    window.closeSubMenuWithParent = function() {
        // Tato funkce je volána z hideMenu
        isSubmenuActive = false;
        isMouseOverSubmenu = false;
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
        // Zrušíme timeout pro skrytí submenu
        clearTimeout(submenuHideTimeout);
        
        
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
    // Pokud je otevřeno kliknutím, ZRUŠÍME OBA časovače
    clearTimeout(clickInactivityTimeout);
    clearTimeout(inactivityTimeoutFirst);
}
    });
    
    // Přidáme posluchače událostí myši pro resetování časovače nečinnosti
    dropdownContent.addEventListener("mousemove", function() {
     if (isClickOpened) {
    clearTimeout(clickInactivityTimeout);
    clearTimeout(inactivityTimeoutFirst);
}
    });
    
    // Přidáme posluchače pro kliknutí v menu, aby se resetoval časovač
    dropdownContent.addEventListener("click", function() {
     if (isClickOpened) {
    clearTimeout(clickInactivityTimeout);
    clearTimeout(inactivityTimeoutFirst);
}
    });
    
    // Přidáme posluchače pro vyhledávací pole a jiné prvky v menu
    const searchElements = dropdownContent.querySelectorAll('input, select, textarea, button');
    searchElements.forEach(element => {
        // Při interakci s prvkem resetujeme časovač nečinnosti
        element.addEventListener('focus', function() {
          if (isClickOpened) {
    clearTimeout(clickInactivityTimeout);
    clearTimeout(inactivityTimeoutFirst);
}
        });
        
        element.addEventListener('input', function() {
            if (isClickOpened) {
    clearTimeout(clickInactivityTimeout);
    clearTimeout(inactivityTimeoutFirst);
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
        // Zrušíme timeout pro skrytí submenu
        clearTimeout(submenuHideTimeout);
        
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
// NOVÉ: Pokud je otevřeno kliknutím, restartovat časovač při odchodu myši
if (isClickOpened) {
    startClickInactivityTimer();
    return;
}

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
    
    // UPRAVENO: Export funkce pro submenu, která bude nastavovat stav submenu
    window.setSubmenuActive = function(active) {
        isSubmenuActive = active;
        isMouseOverSubmenu = active; // PŘIDÁNO: Synchronizace stavů
        
        if (active) {
            // Zrušíme timeout pro skrytí submenu když je aktivní
            clearTimeout(submenuHideTimeout);
            
            if (isClickOpened) {
                // Pokud je submenu aktivní a hlavní menu otevřeno kliknutím, 
                // resetujeme časovač nečinnosti
                startInactivityTimer();
            }
        }
    };

    // NOVÉ: Příznak pro stav načítání DOM
    let domContentLoaded = false;
    let pageLoaded = false;
    
    // NOVÉ: Příznak pro sledování, zda máme zobrazit menu po načtení
    let shouldShowMenuAfterLoad = false;
    
    // NOVÉ: Optimalizovaná funkce pro kontrolu pozice myši
function checkMousePosition() {
    // Aktualizujeme pozici myši z localStorage
    const savedMouseX = parseInt(localStorage.getItem('mouseX')) || 0;
    const savedMouseY = parseInt(localStorage.getItem('mouseY')) || 0;
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
    
    // Také zkusíme CSS :hover selector jako záložní metodu
    let isCurrentlyHovered = false;
    try {
        isCurrentlyHovered = dropdownToggle.matches(':hover');
    } catch (e) {
        // Fallback pokud matches není podporováno
        isCurrentlyHovered = false;
    }
    
    // Rozhodneme, zda máme zobrazit menu - UPRAVENO pro lepší detekci
    if (isOverToggle || wasOverToggle || isCurrentlyHovered) {
        shouldShowMenuAfterLoad = true;
        if (domContentLoaded) {
            // Malé zpoždění pro jistotu, že DOM je plně připraven
            setTimeout(() => {
                showMenu();
            }, 50);
        }
    }
    
    // Kontrola otevřeného menu z localStorage (pro kliknuté menu)
    if (localStorage.getItem('isFirstMenuOpen') === 'true') {
        isClickOpened = true;
        if (domContentLoaded) {
            setTimeout(() => {
                showMenu();
            }, 50);
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

// UPRAVENO: Sledování pozice myši s optimalizací
let mouseMoveThrottle = false;
document.addEventListener('mousemove', function(e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    // Throttling pro zápis do localStorage (optimalizace výkonu)
    if (!mouseMoveThrottle) {
        mouseMoveThrottle = true;
        setTimeout(() => {
            localStorage.setItem('mouseX', mouseX);
            localStorage.setItem('mouseY', mouseY);
            mouseMoveThrottle = false;
        }, 50); // Throttling na 50ms pro lepší výkon
    }
});

// NOVÉ: Optimalizace sledování pozice myši s debouncing
let lastMouseUpdate = 0;
const MOUSE_UPDATE_INTERVAL = 100; // Minimální interval mezi aktualizacemi v ms

document.addEventListener('mousemove', function(e) {
    const now = Date.now();
    
    // Vždy aktualizujeme globální proměnné pro okamžité použití
    mouseX = e.clientX;
    mouseY = e.clientY;
    lastMouseMoveTime = now;
    
    // Ale localStorage aktualizujeme pouze s intervalem
    if (now - lastMouseUpdate > MOUSE_UPDATE_INTERVAL) {
        localStorage.setItem('mouseX', mouseX);
        localStorage.setItem('mouseY', mouseY);
        lastMouseUpdate = now;
    }
});

// NOVÉ: Vyčištění localStorage při zavření stránky
window.addEventListener('beforeunload', function() {
    // Vyčistíme pouze pozici myši, ale zachováme stavy menu
    // které mohou být potřebné po refreshu
    localStorage.removeItem('mouseX');
    localStorage.removeItem('mouseY');
    localStorage.removeItem('isMouseOverFirstToggle');
});

// NOVÉ: Vyčištění starých stavů při načtení stránky (prevence chyb)
window.addEventListener('load', function() {
    // Po 5 sekundách vyčistíme všechny stavy, aby nedošlo k chybám
    setTimeout(function() {
        if (!isClickOpened) {
            localStorage.removeItem('isFirstMenuOpen');
        }
        localStorage.removeItem('isMouseOverFirstToggle');
    }, 5000);
});

// Export globálních funkcí pro použití v jiných skriptech
window.dropdownMenu = {
    closeFirstMenu: function() {
        if (typeof window.closeFirstMenu === 'function') {
            window.closeFirstMenu();
        }
    },
    
    isFirstMenuOpen: function() {
        return dropdownContent && dropdownContent.style.opacity === "1";
    },
    
    getMousePosition: function() {
        return { x: mouseX, y: mouseY };
    }
};

// NOVÉ: Debug funkce pro vývojáře (pouze v development módu)
if (typeof console !== 'undefined' && console.log) {
    window.debugDropdown = function() {
        console.log('Dropdown Debug Info:', {
            isClickOpened: isClickOpened,
            isSubmenuActive: isSubmenuActive,
            isMouseOverSubmenu: isMouseOverSubmenu,
            mousePosition: { x: mouseX, y: mouseY },
            menuVisible: dropdownContent.style.opacity === "1",
            localStorage: {
                isFirstMenuOpen: localStorage.getItem('isFirstMenuOpen'),
                isMouseOverFirstToggle: localStorage.getItem('isMouseOverFirstToggle'),
                mouseX: localStorage.getItem('mouseX'),
                mouseY: localStorage.getItem('mouseY')
            }
            
        });
    };
}

// Konec dropdown menu funkcionality

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
    
      .sticky-header .sub-dropdown-content.show {
      opacity: 1;
      visibility: visible;
      display: block;
      transition: opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1), visibility 0s;
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
          transition: opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1), visibility 0s 0.5s;

      z-index: 1000;
    }
      .sticky-header .dropdown-content.show,
.sticky-header .dropdown-content-second.show {
  opacity: 1;
  visibility: visible;
  display: block;
  transition: opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1), visibility 0s;
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
  
  // Pokud jsme při načtení stránky skrollnutí níže než původní header
  if (scrollY > mainHeaderHeight) {
    // Obnovíme normální chování transition a transform
    stickyHeader.style.transition = '';
    stickyHeader.style.transform = '';
    
    // Zobrazíme header
    stickyHeader.classList.add('visible');
    
    if (scrollY > mainHeaderHeight + 100) {
      stickyHeader.classList.add('scrolled');
    }
    
    console.log('Sticky header shown on page load at scroll position:', scrollY);
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
        // NOVÉ: Před navigací vyčistíme dropdown stavy
        clearAllDropdownStates();
        
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
  
  // NOVÉ: Funkce pro vyčištění všech uložených stavů dropdownů
  function clearAllDropdownStates() {
    try {
      localStorage.removeItem('stickyDropdownStates');
      if (window.stickyDropdownStates) {
        window.stickyDropdownStates = {};
      }
      console.log('All dropdown states cleared');
    } catch (e) {
      console.error('Error clearing dropdown states:', e);
    }
  }
  
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
    
    // UPRAVENO: Při načtení stránky nejdříve zkontrolujeme, jestli je referrer jiný než současná stránka
    // Pokud ano, vyčistíme stavy (znamená to navigaci z jiné stránky)
    try {
      const currentUrl = window.location.href;
      const referrerUrl = document.referrer;
      
      // Pokud je referrer z jiné stránky nebo je prázdný, vyčistíme stavy
      if (!referrerUrl || new URL(referrerUrl).pathname !== new URL(currentUrl).pathname) {
        console.log('Navigation detected from different page, clearing dropdown states');
        clearAllDropdownStates();
      } else {
        // Jen pokud jsme na stejné stránce, obnovíme stavy
        const savedStates = localStorage.getItem('stickyDropdownStates');
        if (savedStates) {
          window.stickyDropdownStates = JSON.parse(savedStates);
          console.log('Restored dropdown states from localStorage:', window.stickyDropdownStates);
        }
      }
    } catch (e) {
      console.error('Error handling dropdown states:', e);
      clearAllDropdownStates();
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
      let intentDelay = 50; // ms to wait before opening on hover for more intentional interaction
      
      // Check saved state - POUZE pokud jsme nepřišli z jiné stránky
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
content.style.display = 'block';
content.style.opacity = '0';
content.style.visibility = 'visible';

// Force browser to calculate positioning
requestAnimationFrame(() => {
  requestAnimationFrame(() => { // Dvojitý requestAnimationFrame pro správnou animaci
    // Show dropdown with animation
    content.classList.add('show');
    content.style.opacity = '1';
  });
          


        });
      }
      
      // Hide dropdown
function hideDropdown() {
  clearTimeout(hideTimeout);
  clearTimeout(hoverIntentTimeout);
  
  if (!isOpen) return;
  
  // Check if submenu is active before hiding
  if (window.isSubmenuActive) {
    console.log('Submenu is active, delaying dropdown hide');
    hideTimeout = setTimeout(hideDropdown, 100);
    return;
  }
  
  // Dodatečná kontrola - je myš stále v relevantní oblasti?
  const mouseX = window.lastMouseX || 0;
  const mouseY = window.lastMouseY || 0;
  
  const toggleRect = toggle.getBoundingClientRect();
  const contentRect = content.getBoundingClientRect();
  const deadZoneRect = deadZone.getBoundingClientRect();
  
  // Kontrola jestli je myš v některé z oblastí
  const isInToggle = mouseX >= toggleRect.left && mouseX <= toggleRect.right && 
                    mouseY >= toggleRect.top && mouseY <= toggleRect.bottom;
  const isInContent = mouseX >= contentRect.left && mouseX <= contentRect.right && 
                     mouseY >= contentRect.top && mouseY <= contentRect.bottom;
 const isInDeadZone = deadZone.style.display !== 'none' && 
                    mouseX >= deadZoneRect.left && mouseX <= deadZoneRect.right && 
                    mouseY >= deadZoneRect.top && mouseY <= deadZoneRect.bottom;
  
  if (isInToggle || isInContent || isInDeadZone) {
    console.log('Mouse still in dropdown area, not hiding');
    return;
  }
  
  content.classList.remove('show');
  content.style.opacity = '0';
  content.style.visibility = 'hidden';
  
  setTimeout(() => {
    content.style.display = 'none';
  }, 300);
  
  deadZone.style.display = 'none';
  isOpen = false;
  
  // Save state
  window.stickyDropdownStates[dropdownId] = false;
  saveDropdownStates();
  
  console.log(`Dropdown ${dropdownId} closed`);
}
function handleHoverIntent(show = true) {
  clearTimeout(hoverIntentTimeout);
  
  if (show) {
    hoverIntentTimeout = setTimeout(() => {
      showDropdown();
    }, intentDelay);
  } else {
    hoverIntentTimeout = setTimeout(() => {
      hideDropdown();
    }, 100);
  }
}
      
      // Event listeners for toggle button
   toggle.addEventListener('mouseenter', () => {
  console.log(`Mouse entered toggle ${dropdownId}`);
  clearTimeout(hideTimeout);
  if (!isOpen) {
    setTimeout(() => {
      if (toggle.matches(':hover')) {
        showDropdown();
      }
    }, 50);
  }
});

      
content.addEventListener('mouseleave', () => {
  console.log(`Mouse left content ${dropdownId}`);
  
  setTimeout(() => {
    const isOverDeadZone = deadZone.matches(':hover');
    const isOverToggle = toggle.matches(':hover');
    
    if (!isOverDeadZone && !isOverToggle) {
      hideDropdown();
    }
  }, 100);
});

      
      // Click handler for toggle (alternative activation)
      toggle.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        console.log(`Toggle ${dropdownId} clicked`);
        // Automatické zavření po 5 sekundách (můžete změnit čas)
setTimeout(() => {
  if (isOpen) {
    hideDropdown();
  }
}, 5000); // 5000ms = 5 sekund
        if (isOpen) {
          hideDropdown();
        } else {
          showDropdown();
        }
      });
      
   content.addEventListener('mouseleave', () => {
  console.log(`Mouse left content ${dropdownId}`);
  
  // Krátké zpoždění pro kontrolu, jestli myš není v dead zone
  setTimeout(() => {
    const isOverDeadZone = deadZone.matches(':hover');
    const isOverToggle = toggle.matches(':hover');
    
    // Skryjeme dropdown pouze pokud není myš ani v dead zone ani nad tlačítkem
    if (!isOverDeadZone && !isOverToggle) {
      handleHoverIntent(false);
    }
  }, 50);
});
      // Event listeners for dead zone
      deadZone.addEventListener('mouseenter', () => {
        console.log(`Mouse entered dead zone ${dropdownId}`);
        clearTimeout(hideTimeout);
        clearTimeout(hoverIntentTimeout);
      });
      
      deadZone.addEventListener('mouseleave', () => {
        console.log(`Mouse left dead zone ${dropdownId}`);
        handleHoverIntent(false);
      });
      
      // Main button click handler (if exists)
      if (mainButton) {
        mainButton.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          
          console.log(`Main button clicked for dropdown ${dropdownId}`);
          
          // Navigate to main button link if it has href
          const href = mainButton.getAttribute('href');
          if (href && href !== '#') {
            // Clear dropdown states before navigation
            clearAllDropdownStates();
            window.location.href = href;
          }
        });
      }
      
      // Initialize sub-dropdowns within this dropdown
      initializeSubDropdowns(content, dropdownId);
    });
    
    // Handle clicks outside dropdowns to close them
    document.addEventListener('click', (e) => {
      const isInsideStickyHeader = e.target.closest('.sticky-header');
      const isInsideDropdown = e.target.closest('.dropdown-content, .dropdown-content-second, .sub-dropdown-content');
      
      if (!isInsideStickyHeader && !isInsideDropdown) {
        // Close all open dropdowns
        stickyHeader.querySelectorAll('.dropdown-content.show, .dropdown-content-second.show').forEach(content => {
          const dropdown = content.closest('.dropdown');
          const dropdownId = dropdown?.getAttribute('data-dropdown-id');
          
          content.classList.remove('show');
          content.style.opacity = '0';
          content.style.visibility = 'hidden';
          
          setTimeout(() => {
            content.style.display = 'none';
          }, 300);
          
          if (dropdownId) {
            window.stickyDropdownStates[dropdownId] = false;
            saveDropdownStates();
          }
        });
        
        // Hide all dead zones
        document.querySelectorAll('.sticky-header-dead-zone').forEach(zone => {
          zone.style.display = 'none';
        });
      }
    });
    
    console.log('Sticky header dropdowns initialized successfully');
  }
  
  // Initialize sub-dropdowns (for nested menus)
  function initializeSubDropdowns(parentContent, parentDropdownId) {
    const subDropdownToggles = parentContent.querySelectorAll('.sub-dropdown-toggle');
    
    console.log(`Found ${subDropdownToggles.length} sub-dropdown toggles in ${parentDropdownId}`);
        // Store mouse position globally for subdropdown checks
    document.addEventListener('mousemove', (e) => {
      window.lastMouseX = e.clientX;
      window.lastMouseY = e.clientY;
    });

    
    subDropdownToggles.forEach((subToggle, subIndex) => {
      const subContent = subToggle.nextElementSibling;
      if (!subContent || !subContent.classList.contains('sub-dropdown-content')) {
        console.warn(`Sub-toggle ${subIndex} has no associated sub-dropdown content`);
        return;
      }
      
      const subDropdownId = `${parentDropdownId}-sub-${subIndex}`;
      let subHideTimeout;
      let isSubOpen = false;
      
      // Create sub-dropdown dead zone
      const subDeadZoneId = `sub-dropdown-dead-zone-${parentDropdownId}-${subIndex}`;
      let subDeadZone = document.getElementById(subDeadZoneId);
      
      if (!subDeadZone) {
        subDeadZone = document.createElement('div');
        subDeadZone.className = 'sub-dropdown-dead-zone';
        subDeadZone.id = subDeadZoneId;
        subDeadZone.style.display = 'none';
        document.body.appendChild(subDeadZone);
      }
      
      function positionSubDeadZone() {
        const toggleRect = subToggle.getBoundingClientRect();
        const contentRect = subContent.getBoundingClientRect();
        
        const padding = 5;
        
        subDeadZone.style.left = (toggleRect.right + window.scrollX) + 'px';
        subDeadZone.style.top = (toggleRect.top + window.scrollY) + 'px';
        subDeadZone.style.width = Math.max(5, contentRect.left - toggleRect.right) + 'px';
        subDeadZone.style.height = Math.max(toggleRect.height, contentRect.height) + 'px';
        subDeadZone.style.zIndex = '999';
      }
      
     function showSubDropdown() {
        clearTimeout(subHideTimeout);
        
        // Inform parent that submenu is active
        window.setSubmenuActive(true);
        
        // Make sure content is visible first for proper positioning
        subContent.style.display = 'block';
        subContent.style.opacity = '0';
        subContent.style.visibility = 'visible';
        
        // Force browser to calculate positioning
        requestAnimationFrame(() => {
          requestAnimationFrame(() => { // Dvojitý requestAnimationFrame pro správnou animaci
            // Show dropdown with animation
            subContent.classList.add('show');
            subContent.style.opacity = '1';
          });
          
          isSubOpen = true;
          
          positionSubDeadZone();
          subDeadZone.style.display = 'block';
          
          console.log(`Sub-dropdown ${subDropdownId} opened`);
        });
      }

      
      // Event listeners for sub-dropdown
      subToggle.addEventListener('mouseenter', () => {
        console.log(`Mouse entered sub-toggle ${subDropdownId}`);
        showSubDropdown();
      });
      
      subToggle.addEventListener('mouseleave', () => {
        console.log(`Mouse left sub-toggle ${subDropdownId}`);
        subHideTimeout = setTimeout(() => {
          const isOverContent = subContent.matches(':hover');
          const isOverDeadZone = subDeadZone.matches(':hover');
          
          if (!isOverContent && !isOverDeadZone) {
            hideSubDropdown();
          }
        }, 150);
      });
      
      subContent.addEventListener('mouseenter', () => {
        console.log(`Mouse entered sub-content ${subDropdownId}`);
        clearTimeout(subHideTimeout);
      });
      
      subContent.addEventListener('mouseleave', () => {
        console.log(`Mouse left sub-content ${subDropdownId}`);
        subHideTimeout = setTimeout(hideSubDropdown, 150);
      });
      
      subDeadZone.addEventListener('mouseenter', () => {
        clearTimeout(subHideTimeout);
      });
      
      subDeadZone.addEventListener('mouseleave', () => {
        subHideTimeout = setTimeout(hideSubDropdown, 150);
      });
      
      // Click handler for sub-dropdown links
      const subLinks = subContent.querySelectorAll('a');
      subLinks.forEach(link => {
        link.addEventListener('click', () => {
          // Clear all dropdown states before navigation
          clearAllDropdownStates();
        });
      });
    });
  }
  
  // Save dropdown states to localStorage
  function saveDropdownStates() {
    try {
      localStorage.setItem('stickyDropdownStates', JSON.stringify(window.stickyDropdownStates));
      console.log('Dropdown states saved:', window.stickyDropdownStates);
    } catch (e) {
      console.error('Error saving dropdown states:', e);
    }
  }
  
  // Handle page visibility changes (when user switches tabs)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      // Page is hidden - save current states
      saveDropdownStates();
    } else {
      // Page is visible again - could restore states if needed
      console.log('Page visible again');
    }
  });
  
  // Handle page unload
  window.addEventListener('beforeunload', () => {
    // Save states before leaving
    saveDropdownStates();
  });
  
  // Cleanup function (for development/debugging)
  window.cleanupStickyHeader = function() {
    // Remove sticky header
    const stickyHeader = document.querySelector('.sticky-header');
    if (stickyHeader) {
      stickyHeader.remove();
    }
    
    // Remove dead zones
    document.querySelectorAll('.sticky-header-dead-zone, .sub-dropdown-dead-zone').forEach(zone => {
      zone.remove();
    });
    
    // Clear saved states
    clearAllDropdownStates();
    
    // Remove event listeners (they'll be removed with elements)
    console.log('Sticky header cleaned up');
  };
  
  console.log('Sticky header script loaded successfully');

//--------IMAGES FUNCTIONALITY----------//
document.addEventListener('DOMContentLoaded', function() {
    // Vytvoření modálního okna a všech jeho komponent
    var modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'none';
    modal.style.position = 'fixed';
    modal.style.zIndex = '1000';
    modal.style.left = '0';
    modal.style.top = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.overflow = 'hidden';
    modal.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    
    // Hlavní kontejner pro obrázek a zdroje
    var mainContainer = document.createElement('div');
    mainContainer.className = 'main-container';
    mainContainer.style.position = 'relative';
    mainContainer.style.width = '90%';
    mainContainer.style.height = '90%';
    mainContainer.style.display = 'flex';
    mainContainer.style.flexDirection = 'row'; // Horizontální uspořádání
    mainContainer.style.alignItems = 'center';
    mainContainer.style.justifyContent = 'center';
    
    // Kontejner pro obrázek
    var imageContainer = document.createElement('div');
    imageContainer.className = 'image-container';
    imageContainer.style.position = 'relative';
    imageContainer.style.width = '100%';
    imageContainer.style.height = '100%';
    imageContainer.style.display = 'flex';
    imageContainer.style.alignItems = 'center';
    imageContainer.style.justifyContent = 'center';
    imageContainer.style.overflow = 'hidden';
    
    // Kontejner pro zdroje
// Upravená část kódu pro zobrazení zdrojů na pravé straně modálu
// Nahraďte původní definici sourceContainer touto verzí:

// Kontejner pro zdroje - umístěný na pravé straně
var sourceContainer = document.createElement('div');
sourceContainer.className = 'source-container';
sourceContainer.style.position = 'absolute';
sourceContainer.style.top = '90%'; // Vertikální centrování
sourceContainer.style.transform = 'translateY(-90%)'; // Vycentrování podle výšky
sourceContainer.style.right = '20px'; // Odsazení zprava
sourceContainer.style.backgroundColor = 'transparent'; // Bez pozadí
sourceContainer.style.color = '#fff';
sourceContainer.style.padding = '10px';
sourceContainer.style.width = '150px'; // Pevná šířka prostoru pro zdroje
sourceContainer.style.fontSize = '14px';
sourceContainer.style.zIndex = '9999';
sourceContainer.style.transition = 'opacity 0.1s ease';
sourceContainer.style.opacity = '1';
sourceContainer.style.textAlign = 'left'; // Text zarovnaný vlevo
    
    var modalImg = document.createElement('img');
    modalImg.className = 'modal-content';
    modalImg.style.display = 'block';
    modalImg.style.maxWidth = '100%';
    modalImg.style.maxHeight = '100%';
    modalImg.style.cursor = 'zoom-in';
    modalImg.style.transition = 'transform 0.4s ease, border-radius 0.4s ease'; // Přidána animace pro border-radius
    modalImg.style.objectFit = 'contain';
    modalImg.style.outline = 'none';
    modalImg.style.webkitTapHighlightColor = 'transparent';
    modalImg.setAttribute('draggable', 'false');
    modalImg.style.userSelect = 'none';
    modalImg.style.webkitUserSelect = 'none';
    modalImg.style.msUserSelect = 'none';
    modalImg.style.mozUserSelect = 'none';
    modalImg.tabIndex = -1;
    
    
    // Kontejner pro tlačítko zavření
    var closeBtnContainer = document.createElement('div');
    closeBtnContainer.style.position = 'absolute';
    closeBtnContainer.style.top = '15px';
    closeBtnContainer.style.right = '15px';
    closeBtnContainer.style.width = '30px';
    closeBtnContainer.style.height = '30px';
    closeBtnContainer.style.overflow = 'hidden';
    closeBtnContainer.style.zIndex = '1001';
    closeBtnContainer.style.display = 'flex';
    closeBtnContainer.style.alignItems = 'center';
    closeBtnContainer.style.justifyContent = 'center';
    
    var closeBtn = document.createElement('span');
    closeBtn.className = 'close';
    closeBtn.innerHTML = '&times;';
    closeBtn.style.fontSize = '45px';
    closeBtn.style.fontWeight = 'bold';
    closeBtn.style.color = '#bbb';
    closeBtn.style.textDecoration = 'none';
    closeBtn.style.margin = '0';
    closeBtn.style.padding = '0';
    closeBtn.style.width = '40px';
    closeBtn.style.height = '40px';
    closeBtn.style.display = 'flex';
    closeBtn.style.alignItems = 'center';
    closeBtn.style.justifyContent = 'center';
    closeBtn.style.cursor = 'pointer';
    closeBtn.style.lineHeight = '0.5';
    closeBtn.style.outline = 'none';
    closeBtn.style.webkitTapHighlightColor = 'transparent';
    closeBtn.style.userSelect = 'none';
    closeBtn.style.webkitUserSelect = 'none';
    closeBtn.style.msUserSelect = 'none';
    closeBtn.style.mozUserSelect = 'none';
    closeBtn.tabIndex = -1;
    
    // Sestavení DOM struktury
    imageContainer.appendChild(modalImg);
    mainContainer.appendChild(imageContainer);
    mainContainer.appendChild(sourceContainer);
    closeBtnContainer.appendChild(closeBtn);
    modal.appendChild(closeBtnContainer);
    modal.appendChild(mainContainer);
    document.body.appendChild(modal);
    
    // Proměnné pro ovládání obrázku - VYLEPŠENÉ
    var isDragging = false;
    var wasDragging = false;
    var startX, startY;
    var lastX, lastY; // Pro plynulejší sledování pohybu
    var translateX = 0, translateY = 0;
    var initialTranslateX = 0, initialTranslateY = 0;
    var isZoomed = false;
    var currentScale = 1;
    var zoomFactor = 2.5;
    var imgNaturalWidth = 0;
    var imgNaturalHeight = 0;
    
    
    // Detekce mobilního zařízení
    var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    console.log("Je mobilní zařízení:", isMobile);
    
    // Přidání event listenerů na obrázky s třídou 'zoomable'
    var images = document.querySelectorAll('img.zoomable');
    images.forEach(function(img) {
        img.addEventListener('click', function() {
            openModal(this.src, this.getAttribute('data-source') || '');
        });
        
        // Nastavíme pouze cursor: pointer bez efektu zvětšení
        img.style.cursor = 'pointer';
        
        // Pro mobilní zařízení - reagujeme na dotyk bez zvětšení
        img.addEventListener('touchstart', function(event) {
            // Zabráníme výchozímu chování
            event.preventDefault();
        }, { passive: false });
        
        img.addEventListener('touchend', function() {
            openModal(this.src, this.getAttribute('data-source') || '');
        });
    });
    
    // Funkce pro skrytí/zobrazení zdrojů
    function toggleSourceVisibility(visible) {
        sourceContainer.style.opacity = visible ? '1' : '0';
    }
    
    // Funkce pro otevření modálního okna
    function openModal(imgSrc, sourceText) {
        modal.style.display = 'flex';
        modalImg.src = imgSrc;
        
        // Nastavení textu se zdrojem
        sourceContainer.innerHTML = sourceText || '';
        
        // Zobrazení/skrytí kontejneru se zdrojem podle toho, zda máme text
        sourceContainer.style.display = sourceText ? 'block' : 'none';
        
        // Resetování hodnot při otevření
        resetZoom();
        
        // Počkat na načtení obrázku a poté zjistit jeho rozměry
        modalImg.onload = function() {
            // Zjištění přesné velikosti obrázku
            imgNaturalWidth = this.naturalWidth;
            imgNaturalHeight = this.naturalHeight;
            
            // Nastavení specifického zvětšení pro konkrétní obrázky
            if (imgNaturalWidth === 5780 && imgNaturalHeight === 3987) {
                zoomFactor = 0.5;
                console.log("Myšlenková mapa: nastaven zoom factor", zoomFactor);
           } else if (imgNaturalWidth === 2200 && imgNaturalHeight === 1772) {
                zoomFactor = 0.7;
                console.log("Ž: nastaven zoom factor", zoomFactor);
            } else if (imgNaturalWidth === 2052 && imgNaturalHeight === 1508) {
                zoomFactor = 0.8;
                console.log("R: nastaven zoom factor", zoomFactor);
            } else if (imgNaturalWidth === 505 && imgNaturalHeight === 448) {
                zoomFactor = 2.0;
                console.log("Virus: nastaven zoom factor", zoomFactor);
            } else if (imgNaturalWidth === 679 && imgNaturalHeight === 416) {
                zoomFactor = 2.0;
                console.log("Buňka-popis: nastaven zoom factor", zoomFactor);
            } else if (imgNaturalWidth === 1076 && imgNaturalHeight === 1064) {
                zoomFactor = 0.8;
                console.log("Buňka hub: nastaven zoom factor", zoomFactor);
            } else {
                // Pro všechny ostatní obrázky nastavíme zvětšení podle velikosti
                if (imgNaturalWidth > 3000) {
                    zoomFactor = 0.6;
                } else if (imgNaturalWidth > 1500) {
                    zoomFactor = 3.0;
                } else if (imgNaturalWidth > 800) {
                    zoomFactor = 2.5;
                } else if (imgNaturalWidth > 400) {
                    zoomFactor = 2.0;
                } else {
                    zoomFactor = 1.8;
                }
                console.log("Standardní obrázek: nastaven zoom factor", zoomFactor);
            }
            
            // Zajištění, že modalImg je správně inicializován
            resetZoom();
        };
        
        // Zabránit scrollování stránky v pozadí
        document.body.style.overflow = 'hidden';
    }
    
    // Vytvoření tlačítka pro zoom pro mobilní zařízení
    if (isMobile) {
        var zoomButton = document.createElement('div');
        zoomButton.className = 'zoom-button';
        zoomButton.style.position = 'absolute';
        zoomButton.style.bottom = '20px';
        zoomButton.style.right = '20px';
        zoomButton.style.width = '50px';
        zoomButton.style.height = '50px';
        zoomButton.style.borderRadius = '50%';
        zoomButton.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        zoomButton.style.display = 'flex';
        zoomButton.style.alignItems = 'center';
        zoomButton.style.justifyContent = 'center';
        zoomButton.style.zIndex = '1001';
        zoomButton.style.cursor = 'pointer';
        
        var zoomIcon = document.createElement('div');
        zoomIcon.style.color = '#fff';
        zoomIcon.style.fontSize = '24px';
        zoomIcon.style.fontWeight = 'bold';
        zoomIcon.innerHTML = '+';
        
        zoomButton.appendChild(zoomIcon);
        modal.appendChild(zoomButton);
        
        // Event listener pro tlačítko zoom na dotyk
        zoomButton.addEventListener('touchend', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            handleZoomToggle(window.innerWidth / 2, window.innerHeight / 2);
            zoomIcon.innerHTML = isZoomed ? '-' : '+';
        }, { passive: false });
        
        // Event listener pro tlačítko zoom na klik
        zoomButton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            handleZoomToggle(window.innerWidth / 2, window.innerHeight / 2);
            zoomIcon.innerHTML = isZoomed ? '-' : '+';
        });
    }
    
    // Resetování funkce pro zoom
    function resetZoom() {
        isZoomed = false;
        currentScale = 1;
        translateX = 0;
        translateY = 0;
        
        modalImg.style.cursor = isMobile ? 'default' : 'zoom-in';
        modalImg.style.maxWidth = '100%';
        modalImg.style.maxHeight = '100%';
        modalImg.style.borderRadius = '10px';
        
        // Důležité: Nastavení transformOrigin na střed a reset transformace
        modalImg.style.transformOrigin = 'center';
        modalImg.style.transform = 'translate(0px, 0px) scale(1)';
        
        // Zobrazíme zdroje při resetování zoomu
        toggleSourceVisibility(true);
        
        console.log("Reset zoom: isZoomed =", isZoomed);
    }

    // VYLEPŠENÁ funkce pro zvětšení v místě kliknutí/dotyku
    function zoomAtPoint(pointX, pointY) {
        // Zaznamenáme přesnou pozici kliknutí v kontextu okna
        console.log("Kliknutí na souřadnice:", { pointX, pointY });
        
        // Získáme aktuální rozměry a pozici obrázku
        const rect = modalImg.getBoundingClientRect();
        console.log("Původní rozměry obrázku:", { 
            width: rect.width, 
            height: rect.height,
            left: rect.left,
            top: rect.top
        });
        
        // Zjistíme rozměry obrázku pro identifikaci
        const imgWidth = modalImg.naturalWidth;
        const imgHeight = modalImg.naturalHeight;
        
        // Vypočítáme relativní pozici kliknutí v rámci obrázku
        const relX = (pointX - rect.left) / rect.width;
        const relY = (pointY - rect.top) / rect.height;    
        console.log("Relativní pozice kliknutí v obrázku:", { relX, relY });
        
        // Určíme střed obrazovky pro centrování
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        console.log("Střed obrazovky:", { centerX, centerY });

        // Použijeme zoomFactor z nastavení
        currentScale = zoomFactor;

        // Definice korekčních faktorů podle typu obrázku
        let korekceFaktorX = 1.0;
        let korekceFaktorY = 1.0;
        let fixniKorekceX = 0;
        let fixniKorekceY = 0;
        
        // Nastavení korekčních faktorů podle typu obrázku
        if (imgWidth === 5780 && imgHeight === 3987) {
            // Myšlenková mapa
            korekceFaktorX = 0.49;
            korekceFaktorY = 0.49;
        } else if (imgWidth === 2200 && imgHeight === 1772) {
            // Ž
            korekceFaktorX = 0.65;
            korekceFaktorY = 0.65;
        } else if (imgWidth === 2052 && imgHeight === 1508) {
            // R
            korekceFaktorX = 0.75; 
            korekceFaktorY = 0.75;
        } else if (imgWidth === 505 && imgHeight === 448) {
            // Virus
            korekceFaktorX = 2.0;
            korekceFaktorY = 2.0;
        } else if (imgWidth === 679 && imgHeight === 416) {
            // Buňka-popis
            korekceFaktorX = 2.0;
            korekceFaktorY = 2.0;
        } else if (imgWidth === 1076 && imgHeight === 1064) {
            // Buňka hub
            korekceFaktorX = 0.7;
            korekceFaktorY = 0.7;
        } else {
            // Výchozí hodnoty pro ostatní obrázky
            korekceFaktorX = 0.58;
            korekceFaktorY = 0.58;
        }
        
        console.log("Použité korekční faktory:", {
            korekceFaktorX, 
            korekceFaktorY,
            fixniKorekceX,
            fixniKorekceY,
            scale: currentScale
        });
        
        // Vypnutí omezení velikosti před transformací
        modalImg.style.maxWidth = 'none';
        modalImg.style.maxHeight = 'none';
        
        // Nastavení zaoblených rohů při zvětšení
        modalImg.style.borderRadius = '20px'; // Přidání zaoblení při zvětšení
        
        // Skryjeme zdroje při zoomu
        toggleSourceVisibility(false);
        
        // Použijeme promisy pro správné načasování operací
        return new Promise(resolve => {
            // Čekáme na první snímek po resetu transformací
            requestAnimationFrame(() => {
                // Získáme rozměry obrázku po resetu
                const resetRect = modalImg.getBoundingClientRect();
                
                // Nejprve provedeme samotné zvětšení bez posunu
                modalImg.style.transform = `scale(${currentScale})`;
                
                // Čekáme na aplikaci změny měřítka
                requestAnimationFrame(() => {
                    // Získáme nové rozměry po změně měřítka
                    const scaledRect = modalImg.getBoundingClientRect();
                    
                    // Vypočítáme aktuální pozici kliknutého bodu po zvětšení
                    const scaledPointX = scaledRect.left + (relX * scaledRect.width);
                    const scaledPointY = scaledRect.top + (relY * scaledRect.height);
                    
                    // Vypočítáme základní posun
                    let baseTranslateX = centerX - scaledPointX;
                    let baseTranslateY = centerY - scaledPointY;
                    
                    // Aplikujeme korekční faktory - VYLEPŠENO pro stabilnější chování
                    translateX = (baseTranslateX * korekceFaktorX) + fixniKorekceX;
                    translateY = (baseTranslateY * korekceFaktorY) + fixniKorekceY;
                    
                    console.log("Vypočtené posuny:", {
                        baseTranslateX,
                        baseTranslateY,
                        translationWithCorrections: {
                            translateX,
                            translateY
                        }
                    });
                    
                    // Uložíme výchozí pozice pro drag
                    initialTranslateX = translateX;
                    initialTranslateY = translateY;
                    
                    // Aplikujeme transformaci s korekcemi
                    const finalTransform = `translate(${translateX}px, ${translateY}px) scale(${currentScale})`;
                    modalImg.style.transform = finalTransform;
                    
                    // Provedeme ještě jednu kontrolu po aplikaci transformace
                    requestAnimationFrame(() => {
                        // Získáme konečné rozměry obrázku
                        const finalRect = modalImg.getBoundingClientRect();
                        
                        // Vypočítáme finální pozici kliknutého bodu
                        const finalPointX = finalRect.left + (relX * finalRect.width);
                        const finalPointY = finalRect.top + (relY * finalRect.height);
                        
                        // Zobrazíme výsledek
                        console.log("Finální pozice bodu:", {
                            finalPointX,
                            finalPointY,
                            centerX,
                            centerY,
                            odchylkaX: centerX - finalPointX,
                            odchylkaY: centerY - finalPointY
                        });
                        
                        resolve();
                    });
                });
            });
        });
    }

    // Funkce pro přesné centrování objektu uprostřed obrazovky
    function centerElementExactly(element) {
        if (!element) return;
        
        // Resetujeme existující transformace
        element.style.transform = 'none';
        
        // Počkáme na vykreslení
        requestAnimationFrame(() => {
            // Získáme rozměry elementu a obrazovky
            const rect = element.getBoundingClientRect();
            const windowWidth = window.innerWidth;
            const windowHeight = window.innerHeight;
            
            // Vypočítáme přesný střed obrazovky
            const centerX = windowWidth / 2;
            const centerY = windowHeight / 2;
            
            // Vypočítáme střed elementu
            const elementCenterX = rect.left + (rect.width / 2);
            const elementCenterY = rect.top + (rect.height / 2);
            
            // Vypočítáme posun potřebný pro centrování
            const translateX = centerX - elementCenterX;
            const translateY = centerY - elementCenterY;
            
            // Aplikujeme transformaci
            element.style.transform = `translate(${translateX}px, ${translateY}px)`;
            
            console.log("Element centrován:", {
                translateX,
                translateY,
                windowCenter: { x: centerX, y: centerY },
                elementCenter: { x: elementCenterX, y: elementCenterY }
            });
        });
    }

    // Přímé volání pro centrování rostlinné buňky
    function centerPlantCell() {
        const cellElement = modalImg || document.querySelector('.modal-content img') || document.getElementById('rostlinna-bunka');
        
        if (cellElement) {
            centerElementExactly(cellElement);
        } else {
            console.error("Element rostlinné buňky nebyl nalezen!");
        }
    }
    
    // Jednotná funkce pro přepínání zoomu (pro desktop i mobil)
    function handleZoomToggle(x, y) {
        if (!isZoomed) {
            // Zvětšení obrázku
            isZoomed = true;
            currentScale = zoomFactor;
            modalImg.style.cursor = 'grab';
            
            // Použijeme zvětšení v místě kliknutí/dotyku
            zoomAtPoint(x, y);
            
            console.log("Zvětšeno: isZoomed =", isZoomed, ", scale =", currentScale);
        } else {
            // Zmenšení obrázku
            resetZoom();
            console.log("Zmenšeno: isZoomed =", isZoomed);
        }
    }
    
    // Kliknutí na obrázek pro přepínání zvětšení (desktop)
    modalImg.addEventListener('click', function(e) {
        if (!isMobile && !isDragging && !wasDragging) {
            if (!isZoomed) {
                // Zvětšení obrázku
                isZoomed = true;
                currentScale = zoomFactor;
                modalImg.style.cursor = 'grab';
                
                // Použijeme jednotnou funkci pro zvětšení v místě kliknutí
                zoomAtPoint(e.clientX, e.clientY);
                
                console.log("Zvětšeno kliknutím: isZoomed =", isZoomed, ", scale =", currentScale);
            } else {
                // Zmenšení obrázku
                resetZoom();
            }
        }
        e.preventDefault();
        e.stopPropagation();
    });
    
    // VYLEPŠENÁ ČÁST PRO MOBILNÍ ZAŘÍZENÍ
    let touchStartX = 0;
    let touchStartY = 0;
    let touchMoved = false;
    
    // Začátek dotyku
    modalImg.addEventListener('touchstart', function(e) {
        // Zaznamenáme pozici dotyku
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        touchMoved = false;
        
        if (isZoomed) {
            // Začátek tažení při zvětšeném obrázku
            isDragging = true;
            wasDragging = false;
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            lastX = startX;  // Pro plynulejší pohyb
            lastY = startY;  // Pro plynulejší pohyb
            initialTranslateX = translateX;
            initialTranslateY = translateY;
        }
    }, { passive: true });
    
    // VYLEPŠENÝ pohyb při dotyku
    modalImg.addEventListener('touchmove', function(e) {
        // Získání souřadnic aktuálního dotyku
        const touchX = e.touches[0].clientX;
        const touchY = e.touches[0].clientY;
        
        // Detekce většího pohybu - zabráníme interpretaci jako tap 
        // využíváme citlivost na menší hodnotu pro lepší detekci
        if (Math.abs(touchX - touchStartX) > 3 || 
            Math.abs(touchY - touchStartY) > 3) {
            touchMoved = true;
        }
        
        // Posouvání zvětšeného obrázku
        if (isDragging && isZoomed) {
            // Vypočítáme delta pohybu od posledního pohybu
            const deltaX = touchX - lastX;
            const deltaY = touchY - lastY;
            
            // Aktualizujeme poslední pozici
            lastX = touchX;
            lastY = touchY;
            
            // Přímá aktualizace posunu - VYLEPŠENO pro plynulejší pohyb
            translateX += deltaX;
            translateY += deltaY;
            
            // Rychlá aplikace transformace pro okamžitou odezvu
            modalImg.style.transform = `translate(${translateX}px, ${translateY}px) scale(${currentScale})`;
            
            if (Math.abs(touchX - startX) > 5 || Math.abs(touchY - startY) > 5) {
                wasDragging = true;
            }
            
            e.preventDefault();
        }
    }, { passive: false });
    
    // Konec dotyku
    modalImg.addEventListener('touchend', function(e) {
        // Ukončení tažení
        if (isDragging) {
            isDragging = false;
            
            // Krátké zpoždění pro přesnější detekci kliknutí vs tažení
            setTimeout(function() {
                wasDragging = false;
            }, 100);
        }
        
        // Pokud byl minimální pohyb, interpretujeme jako tap
        if (!touchMoved && !wasDragging) {
            // Získáme poslední pozici dotyku
            var touch = e.changedTouches[0];
            
            // Pouze pro mobilní zařízení používáme jednotnou funkci pro přepínání zoomu
            if (isMobile) {
                handleZoomToggle(touch.clientX, touch.clientY);
                e.preventDefault();
            }
        }
    });
    
    // VYLEPŠENÝ začátek tažení obrázku (desktop)
    modalImg.addEventListener('mousedown', function(e) {
        if (isZoomed) {
            isDragging = true;
            wasDragging = false;
            startX = e.clientX;
            startY = e.clientY;
            lastX = startX;  // Pro plynulejší pohyb
            lastY = startY;  // Pro plynulejší pohyb 
            initialTranslateX = translateX;
            initialTranslateY = translateY;
            modalImg.style.cursor = 'grabbing';
            e.preventDefault();
        }
    });
    
    // VYLEPŠENÉ posouvání obrázku při tažení (desktop)
    document.addEventListener('mousemove', function(e) {
        if (isDragging && isZoomed) {
            // Vypočítáme delta pohybu od posledního pohybu
            const deltaX = e.clientX - lastX;
            const deltaY = e.clientY - lastY;
            
            // Aktualizujeme poslední pozici
            lastX = e.clientX;
            lastY = e.clientY;
            
            // Přímá aktualizace posunu - VYLEPŠENO
            // Přímá aktualizace posunu - VYLEPŠENO pro plynulejší pohyb
            translateX += deltaX;
            translateY += deltaY;
            
            // Rychlá aplikace transformace pro okamžitou odezvu
            modalImg.style.transform = `translate(${translateX}px, ${translateY}px) scale(${currentScale})`;
            
            if (Math.abs(touchX - startX) > 5 || Math.abs(touchY - startY) > 5) {
                wasDragging = true;
            }
            
            e.preventDefault();
        }
    }, { passive: false });
    
    // Konec dotyku
    modalImg.addEventListener('touchend', function(e) {
        // Ukončení tažení
        if (isDragging) {
            isDragging = false;
            
            // Krátké zpoždění pro přesnější detekci kliknutí vs tažení
            setTimeout(function() {
                wasDragging = false;
            }, 100);
        }
        
        // Pokud byl minimální pohyb, interpretujeme jako tap
        if (!touchMoved && !wasDragging) {
            // Získáme poslední pozici dotyku
            var touch = e.changedTouches[0];
            
            // Pouze pro mobilní zařízení používáme jednotnou funkci pro přepínání zoomu
            if (isMobile) {
                handleZoomToggle(touch.clientX, touch.clientY);
                e.preventDefault();
            }
        }
    });
    
    // VYLEPŠENÝ začátek tažení obrázku (desktop)
    modalImg.addEventListener('mousedown', function(e) {
        if (isZoomed) {
            isDragging = true;
            wasDragging = false;
            startX = e.clientX;
            startY = e.clientY;
            lastX = startX;  // Pro plynulejší pohyb
            lastY = startY;  // Pro plynulejší pohyb 
            initialTranslateX = translateX;
            initialTranslateY = translateY;
            modalImg.style.cursor = 'grabbing';
            e.preventDefault();
        }
    });
    
    // VYLEPŠENÉ posouvání obrázku při tažení (desktop)
    document.addEventListener('mousemove', function(e) {
        if (isDragging && isZoomed) {
            // Vypočítáme delta pohybu od posledního pohybu
            const deltaX = e.clientX - lastX;
            const deltaY = e.clientY - lastY;
            
            // Aktualizujeme poslední pozici
            lastX = e.clientX;
            lastY = e.clientY;
            
            // Přímá aktualizace posunu - VYLEPŠENO pro plynulejší pohyb
            translateX += deltaX;
            translateY += deltaY;
            
            // Rychlá aplikace transformace pro okamžitou odezvu
            modalImg.style.transform = `translate(${translateX}px, ${translateY}px) scale(${currentScale})`;
            
            if (Math.abs(e.clientX - startX) > 3 || Math.abs(e.clientY - startY) > 3) {
                wasDragging = true;
            }
            
            e.preventDefault();
        }
    });
    
    // Ukončení tažení (desktop)
    document.addEventListener('mouseup', function() {
        if (isDragging) {
            isDragging = false;
            if (isZoomed) {
                modalImg.style.cursor = 'grab';
            }
            
            // Krátké zpoždění pro přesnější detekci kliknutí vs tažení
            setTimeout(function() {
                wasDragging = false;
            }, 100);
        }
    });
    
    // Odchod kurzoru z okna
    document.addEventListener('mouseleave', function() {
        if (isDragging) {
            isDragging = false;
            if (isZoomed) {
                modalImg.style.cursor = 'grab';
            }
        }
    });
    
    // Podpora pro kolečko myši pro zoom (desktop)
    modalImg.addEventListener('wheel', function(e) {
        e.preventDefault();
        
        if (e.deltaY < 0 && !isZoomed) {
            // Scroll nahoru - přiblížit
            handleZoomToggle(e.clientX, e.clientY);
        } else if (e.deltaY > 0 && isZoomed) {
            // Scroll dolů - oddálit
            resetZoom();
        }
    }, { passive: false });
    
    // Styl křížku (hover efekt)
    if (!isMobile) {
        closeBtn.addEventListener('mouseenter', function() {
            this.style.color = '#fff';
        });
        
        closeBtn.addEventListener('mouseleave', function() {
            this.style.color = '#bbb';
        });
    }
    
    
    // Zavřít modal při kliknutí na křížek
    closeBtnContainer.addEventListener('click', function(e) {
        closeModal();
        e.stopPropagation();
        e.preventDefault();
    });
    
    // Pro mobilní zařízení - dotyk na tlačítko zavřít
    closeBtnContainer.addEventListener('touchend', function(e) {
        closeModal();
        e.stopPropagation();
        e.preventDefault();
    });
    
    
    // Zavřít modal při kliknutí na pozadí
    modal.addEventListener('click', function(e) {
        if (!wasDragging && e.target !== modalImg) {
            closeModal();
        }
    });
    
    // Funkce pro zavření modalu
    function closeModal() {
        modal.style.display = 'none';
        resetZoom();
        // Obnovení scrollování stránky
        document.body.style.overflow = '';
    }
    
    // Zavřít modal pomocí klávesy Escape
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            closeModal();
        }
    });
    
    // Potlačení výchozích dotykových gest prohlížeče v modalu
    modal.addEventListener('touchmove', function(e) {
        if (isZoomed) {
            e.preventDefault();
        }
    }, { passive: false });
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

//----RESOURCE FUNCIONALITY-----//
document.addEventListener('DOMContentLoaded', function() {
  const infoVariants = [
    'info-box', 'info-box-short', 'info-box-medium', 'info-box-medium-second', 
    'info-box-medium-third', 'info-box-left', 'info-box-long', 'info-box-short-second', 
    'info-box-short-third', 'info-box-short-fourth', 'info-box-long-left',
    'info-icon', 'info-icon-short', 'info-icon-medium', 'info-icon-medium-second', 
    'info-icon-medium-third', 'info-icon-left', 'info-icon-long', 'info-icon-short-second', 
    'info-icon-short-third', 'info-icon-short-fourth', 'info-icon-long-left',
    'info-icon-circle', 'info-icon-circle-short', 'info-icon-circle-medium', 
    'info-icon-circle-medium-second', 'info-icon-circle-medium-third', 'info-icon-circle-left', 
    'info-icon-circle-long', 'info-icon-circle-short-second', 'info-icon-circle-short-third', 
    'info-icon-circle-short-fourth', 'info-icon-circle-long-left'
  ];
  
  const selector = infoVariants.join(', .');
  
  const infoElements = document.querySelectorAll('.' + selector);
  
  const style = document.createElement('style');
  style.textContent = `
    .info-box, .info-box-short, .info-box-medium, .info-box-medium-second, 
    .info-box-medium-third, .info-box-left, .info-box-long, .info-box-short-second, 
    .info-box-short-third, .info-box-short-fourth, .info-box-long-left,
    .info-icon, .info-icon-short, .info-icon-medium, .info-icon-medium-second, 
    .info-icon-medium-third, .info-icon-left, .info-icon-long, .info-icon-short-second, 
    .info-icon-short-third, .info-icon-short-fourth, .info-icon-long-left,
    .info-icon-circle, .info-icon-circle-short, .info-icon-circle-medium, 
    .info-icon-circle-medium-second, .info-icon-circle-medium-third, .info-icon-circle-left, 
    .info-icon-circle-long, .info-icon-circle-short-second, .info-icon-circle-short-third, 
    .info-icon-circle-short-fourth, .info-icon-circle-long-left {
      user-select: none;
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      -webkit-tap-highlight-color: transparent;
      outline: none;
      cursor: pointer;
    }
    
    /* Zajištění, že odkazy v info-boxech budou vždy klikatelné */
    .info-box a, .info-box-short a, .info-box-medium a, .info-box-medium-second a, 
    .info-box-medium-third a, .info-box-left a, .info-box-long a, .info-box-short-second a, 
    .info-box-short-third a, .info-box-short-fourth a, .info-box-long-left a,
    .info-box [href], .info-box-short [href], .info-box-medium [href], .info-box-medium-second [href], 
    .info-box-medium-third [href], .info-box-left [href], .info-box-long [href], .info-box-short-second [href], 
    .info-box-short-third [href], .info-box-short-fourth [href], .info-box-long-left [href] {
      cursor: pointer !important;
      position: relative !important;
      z-index: 100 !important;
      pointer-events: auto !important;
    }
    
    /* Zdůrazněný kurzor pro odkazy při hoveru */
    .info-box.hover-active a:hover, .info-box-short.hover-active a:hover, 
    .info-box-medium.hover-active a:hover, .info-box-medium-second.hover-active a:hover,
    .info-box-medium-third.hover-active a:hover, .info-box-left.hover-active a:hover, 
    .info-box-long.hover-active a:hover, .info-box-short-second.hover-active a:hover,
    .info-box-short-third.hover-active a:hover, .info-box-short-fourth.hover-active a:hover, 
    .info-box-long-left.hover-active a:hover,
    .info-box.active a:hover, .info-box-short.active a:hover, .info-box-medium.active a:hover,
    .info-box-medium-second.active a:hover, .info-box-medium-third.active a:hover,
    .info-box-left.active a:hover, .info-box-long.active a:hover, 
    .info-box-short-second.active a:hover, .info-box-short-third.active a:hover, 
    .info-box-short-fourth.active a:hover, .info-box-long-left.active a:hover {
      text-decoration: underline !important;
    }
    
    /* Info-box ikony musí mít nižší z-index než odkazy */
    .info-icon, .info-icon-short, .info-icon-medium, .info-icon-medium-second, 
    .info-icon-medium-third, .info-icon-left, .info-icon-long, .info-icon-short-second, 
    .info-icon-short-third, .info-icon-short-fourth, .info-icon-long-left,
    .info-icon-circle, .info-icon-circle-short, .info-icon-circle-medium, 
    .info-icon-circle-medium-second, .info-icon-circle-medium-third, .info-icon-circle-left, 
    .info-icon-circle-long, .info-icon-circle-short-second, .info-icon-circle-short-third, 
    .info-icon-circle-short-fourth, .info-icon-circle-long-left {
      z-index: 90 !important;
    }
  `;
  document.head.appendChild(style);
  
  // Funkce pro zjištění, zda element obsahuje třídu začínající specifickým prefixem
  function hasClassStartingWith(element, prefix) {
    return Array.from(element.classList).some(cls => cls.startsWith(prefix));
  }
  
  // Získáme všechny odkazy v info-boxech a přizpůsobíme je
  infoElements.forEach(function(infoElement) {
    // Najdeme všechny odkazy v každém info-boxu
    const links = infoElement.querySelectorAll('a, [href]');
    
    // Upravíme každý odkaz pro zajištění klikatelnosti
    links.forEach(function(link) {
      // Přidáme třídu pro lepší cílení v CSS
      link.classList.add('info-box-link');
      
      // Přidáme speciální event listener pro odkazy, který zastaví propagaci
      link.addEventListener('click', function(e) {
        e.stopPropagation(); // Zastaví propagaci události, aby se info-box nezavřel
      });
    });
    
    // Zjistíme, jestli je to box nebo ikona
    const isBox = hasClassStartingWith(infoElement, 'info-box');
    
    // Získání ikony (pokud se jedná o box, který by měl mít vnořenou ikonu)
    let icon = null;
    if (isBox) {
      // Hledáme ikonu uvnitř boxu 
      const iconSelectors = ['.info-icon', '.info-icon-circle'].map(s => 
        s + ', ' + infoVariants.filter(v => v.startsWith('info-icon')).map(v => '.' + v).join(', ')
      ).join(', ');
      
      icon = infoElement.querySelector(iconSelectors);
    }
    
    // Funkce pro zjištění, zda bylo kliknuto na ikonu
    function isClickOnIcon(event, element) {
      const rect = element.getBoundingClientRect();
      const centerX = rect.left + (rect.width / 2);
      const centerY = rect.top + (rect.height / 2);
      
      // Pro kruhy používáme vzdálenost od středu
      if (hasClassStartingWith(element, 'info-icon-circle')) {
        const clickX = event.clientX;
        const clickY = event.clientY;
        
        const distance = Math.sqrt(
          Math.pow(clickX - centerX, 2) + 
          Math.pow(clickY - centerY, 2)
        );
        
        const radius = Math.max(rect.width, rect.height) / 2;
        return distance <= radius;
      } 
      // Pro ostatní ikony používáme boundary check
      else {
        return (
          event.clientX >= rect.left &&
          event.clientX <= rect.right &&
          event.clientY >= rect.top &&
          event.clientY <= rect.bottom
        );
      }
    }
    
    // Click handler pro element
    infoElement.addEventListener('click', function(e) {
      // Kontrola, zda se kliklo na odkaz nebo jeho potomka
      let target = e.target;
      let isLink = false;
      
      // Kontrola jestli kliknutý element je odkaz nebo je vnořen v odkazu
      while (target && target !== this) {
        if (target.tagName === 'A' || target.hasAttribute('href') || target.classList.contains('info-box-link')) {
          isLink = true;
          break;
        }
        target = target.parentElement;
      }
      
      // Pokud je to odkaz, dovolíme mu provést výchozí akci (přesměrování)
      if (isLink) {
        e.stopPropagation(); // Zastavíme bubbling
        return; // Neděláme nic dalšího - necháme odkaz fungovat normálně
      }
      
      // Rozhodneme, zda bylo kliknuto na ikonu
      let clickedOnIcon = false;
      
      if (icon) {
        // Pokud máme ikonu v boxu, kontrolujeme klik na ikonu
        clickedOnIcon = isClickOnIcon(e, icon);
      } else if (!isBox) {
        // Pokud je element samostatná ikona, kontrolujeme klik na sebe sama
        clickedOnIcon = isClickOnIcon(e, this);
      } else {
        // Pokud je to box bez ikony, reaguje celý box
        clickedOnIcon = true;
      }
      
      // Pokud bylo kliknuto na ikonu
      if (clickedOnIcon) {
        // Pokud je již aktivní, zavřeme ho
        if (this.classList.contains('active')) {
          this.classList.remove('active');
          this.classList.add('force-close');
          
          const handleMouseLeave = () => {
            this.classList.remove('force-close');
            this.removeEventListener('mouseleave', handleMouseLeave);
          };
          
          this.addEventListener('mouseleave', handleMouseLeave);
        } else {
          // Jinak ho otevřeme
          this.classList.add('active');
          this.classList.remove('force-close');
        }
      } else {
        // Pokud se kliklo na jinou část boxu než ikonu
        this.classList.toggle('active');
        this.classList.remove('force-close');
      }
      
      e.stopPropagation();
    });
    
    // Přidáme posluchače pro hover efekt pokud není force-close
    infoElement.addEventListener('mouseenter', function() {
      if (!this.classList.contains('force-close')) {
        this.classList.add('hover-active');
      }
    });
    
    infoElement.addEventListener('mouseleave', function() {
      this.classList.remove('hover-active');
    });
  });
  
  // Zavření info boxů/ikon při kliknutí kamkoliv jinam
  document.addEventListener('click', function(e) {
    // Kontrola, zda kliknutí bylo na odkaz uvnitř info-boxu
    let clickedOnInfoBoxLink = false;
    let target = e.target;
    
    // Kontrolujeme, zda je kliknutý element nebo jeho rodič odkaz v nějakém info-boxu
    while (target && target !== document) {
      if ((target.tagName === 'A' || target.hasAttribute('href') || target.classList.contains('info-box-link'))) {
        // Kontrolujeme, zda je tento odkaz uvnitř nějakého info-boxu
        for (let infoElement of infoElements) {
          if (infoElement.contains(target)) {
            clickedOnInfoBoxLink = true;
            break;
          }
        }
      }
      if (clickedOnInfoBoxLink) break;
      target = target.parentElement;
    }
    
    // Pokud se kliklo na odkaz v info-boxu, neděláme nic
    if (clickedOnInfoBoxLink) {
      return;
    }
    
    // Jinak zavřeme všechny info-boxy, které neobsahují kliknutý element
    infoElements.forEach(function(infoElement) {
      if (!infoElement.contains(e.target)) {
        infoElement.classList.remove('active');
        
        if (infoElement.matches(':hover')) {
          infoElement.classList.add('force-close');
          
          const handleMouseLeave = () => {
            infoElement.classList.remove('force-close');
            infoElement.removeEventListener('mouseleave', handleMouseLeave);
          };
          
          infoElement.addEventListener('mouseleave', handleMouseLeave);
        }
      }
    });
  });
  
  // Podpora pro mobilní zařízení - zavření při touchstart mimo element
  document.addEventListener('touchstart', function(e) {
    // Kontrola, zda se dotýká odkazu v info-boxu
    let touchedInfoBoxLink = false;
    let target = e.target;
    
    while (target && target !== document) {
      if ((target.tagName === 'A' || target.hasAttribute('href') || target.classList.contains('info-box-link'))) {
        for (let infoElement of infoElements) {
          if (infoElement.contains(target)) {
            touchedInfoBoxLink = true;
            break;
          }
        }
      }
      if (touchedInfoBoxLink) break;
      target = target.parentElement;
    }
    
    // Pokud se dotýká odkazu v info-boxu, neděláme nic
    if (touchedInfoBoxLink) {
      return;
    }
    
    // Jinak zavřeme všechny info-boxy, které neobsahují dotčený element
    infoElements.forEach(function(infoElement) {
      if (!infoElement.contains(e.target)) {
        infoElement.classList.remove('active');
      }
    });
  });
});


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