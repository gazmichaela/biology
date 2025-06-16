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
sourceContainer.style.fontSize = window.innerWidth < 768 ? '12px' : '14px';
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
        
      // Pro mobilní zařízení - pouze click event
img.addEventListener('touchend', function(event) {
    // Zkontrolujeme, zda se nejedná o scroll/swipe
    if (!event.cancelable) return;
    
    // Otevřeme modal pouze při skutečném kliknutí (ne při scrollování)
    openModal(this.src, this.getAttribute('data-source') || '');
    event.preventDefault();
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
    
   
    document.addEventListener('mousemove', function(e) {
        if (isDragging && isZoomed) {
            // Vypočítáme delta pohybu od posledního pohybu
            const deltaX = e.clientX - lastX;
            const deltaY = e.clientY - lastY;
            
            // Aktualizujeme poslední pozici
            lastX = e.clientX;
            lastY = e.clientY;
            
           
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
            
          
        handleZoomToggle(touch.clientX, touch.clientY);
        e.preventDefault();
        }
    });
    
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


// Responzivní úpravy
function updateResponsiveLayout() {
    if (window.innerWidth < 768) {
        // Při malých obrazovkách
        sourceContainer.style.fontSize = '12px';
        sourceContainer.style.position = 'relative';
        sourceContainer.style.top = 'auto';
        sourceContainer.style.transform = 'none';
        sourceContainer.style.right = 'auto';
        sourceContainer.style.marginTop = '10px';
        mainContainer.style.flexDirection = 'column';
    } else {
        // Při velkých obrazovkách (původní nastavení)
        sourceContainer.style.fontSize = '14px';
        sourceContainer.style.position = 'absolute';
        sourceContainer.style.top = '90%';
        sourceContainer.style.transform = 'translateY(-90%)';
        sourceContainer.style.right = '20px';
        sourceContainer.style.marginTop = '0';
        mainContainer.style.flexDirection = 'row';
    }
}

window.addEventListener('resize', updateResponsiveLayout);
});