# responsiveness.js

## Úvod
Tento script zajišťuje responzivní ovládání mobilní navigace (burger menu) a sticky menu na webu. Umožňuje otevřít a zavřít mobilní menu, přepínat jeho stav mezi hlavní a sticky verzí a blokovat scrollování pozadí při aktivním menu.

## Jak to funguje:
Po načtení stránky (`DOMContentLoaded`) script:

- inicializuje instance třídy `BurgerMenuManager`,

- zaregistrují se event listenery pro burger menu, tlačítko zavření a překryvné overlaye,

- aktivuje se `MutationObserver` pro detekci sticky headeru a jeho inicializaci.

Script reaguje na resize okna a automaticky zavírá menu, pokud šířka překročí definovaný __mobileBreakpoint__ (výchozích 940px).

## Požadavky a kompatibilita:
- JavaScript ES6+

- Funguje bez externích knihoven

- Testováno v:

    - Chrome (139.0.7258.67),

    - Firefox (141.0.3),

    - Edge (139.0.3405.102)

## Požadavky na HTML:
Script očekává určitou strukturu: 

- Hlavní burger menu: `id="burgerMenu"`

- Mobilní navigaci: `id="mobileNav"`

- Overlay menu: `id="menuOverlay"`

- Tlačítko zavření: `id="closeButton"`

v případě použití sticky headeru v HTML (v případě tohoto webu je sticky header pouze vytvořen a definován v __JavaScriptu__ a __CSS__):

- Sticky header: `.sticky-header`

- Sticky burger menu: `id="sticky-burgerMenu"` nebo `.burger-menu`

- Sticky mobilní navigace: `id="sticky-mobileNav"`

- Sticky overlay: `id="sticky-menuOverlay"`

## Proč OOP? 
Některé mé scripty jsou napsané jen jako funkce.

Tady ale dává smysl použít objektově orientované programování, protože:

- navigace má stav (otevřené/zavřené menu, aktivní sticky menu), 

- logika zahrnuje desktop + mobil + sticky header a jejich vzájemné přepínání,

- umožňuje snadno přidávat metody jako __refresh()__, __destroy()__ nebo __reinitializeStickyMenu()__ bez globálních proměnných.

Díky tomu je kód modulární a snadno udržovatelný.

## Instalace:
Do HTML stačí vložit:

```html
<script src="responsiveness.js"></script>
```

Script se spustí automaticky po načtení stránky.

## Použití:
Pro ruční ovládání menu slouží:

```javascript
openMenu(isSticky);
closeMenu(isSticky);
closeAllMenus();
reinitializeStickyMenu();
```

Pro jiná nastavení při inicializaci upravte:

```javascript
  class BurgerMenuManager {
    constructor(options) {
      options = options || {};
      this.mobileBreakpoint = options.mobileBreakpoint || 940;
      this.debounceDelay = options.debounceDelay || 150;
      this.menuTransitionDelay = options.menuTransitionDelay || 50;
      .... další 
    }  
  }    
```
například změněním hodnoty ___940___ u mobileBreakpoint.

## API Reference:
Metody třídy __BurgerMenuManager__:

- init() - spustí inicializaci menu

- openMenu(isSticky) - otevře mobilní menu

- closeMenu(isSticky) - zavře menu

- closeAllMenus() - zavře všechna menu

- refresh() - znovu načte elementy a inicializuje sticky menu

- reinitializeStickyMenu() - znovu inicializuje sticky burger menu

- destroy() - odpojí všechny event listenery a smaže interní stav

## Bezpečnostní poznámky:
Script kontroluje existenci elementů (např. `if (!el) return`) a neblokuje běh, pokud některý selektor chybí.

Debounce zabraňuje přetížení při resize okna.

Interní proměnné a event listenery jsou uzavřené v IIFE (uzavřené do anonymní funkce), takže nekolidují s globalním scope.

## Příklad HTML:
```html
<!-- NAVIGACE PRO ŠÍŘKU POD 940PX (mobilní)-->

            <!-- Overlay pro zavření menu -->
            <div class="menu-overlay" id="menuOverlay"></div>

            <!-- Položky v mobilní navigaci -->
            <div class="mobile-nav-container" id="mobileNav">
                <div class="mobile-nav-list">
                            
                        <a href="index.html" class="mobile-nav-button mobile-nav-button-big">Domů</a>

                        <div class="mobile-accordion">

                            <div class="mobile-acc-item">
                                <button class="mobile-acc-toggle" aria-expanded="false">
                                    Úvod <span class="mobile-acc-chevron" aria-hidden="true">❯</span>
                                </button>
                                <div class="mobile-acc-sub">
                                    <a href="introduction.html" class="mobile-acc-link mobile-acc-link-parent">→ Přejít na Úvod</a>
                                    <button class="mobile-acc-toggle" aria-expanded="false">
                                    Základní principy <span class="mobile-acc-chevron" aria-hidden="true">❯</span>
                                    </button>
                                    <div class="mobile-acc-sub">
                                    <a href="basic-principles.html" class="mobile-acc-link mobile-acc-link-parent">→ Přejít na Základní principy</a>
                                        <a href="system-approach.html" class="mobile-acc-link mobile-acc-link-deep">Systémový přístup</a>
                                        <a href="system-thinking.html" class="mobile-acc-link mobile-acc-link-deep">Systémové myšlení</a>
                                    </div>
                                    <a href="system-theory.html" class="mobile-acc-link">Teorie systémů</a>
                                    <a href="life-properties.html" class="mobile-acc-link">Vlastnosti živých soustav</a>
                                    <a href="life-origin.html" class="mobile-acc-link">Vznik života</a>
                                </div>
                             </div>

                            <div class="mobile-acc-item">
                                <button class="mobile-acc-toggle" aria-expanded="false">
                                    Člověk <span class="mobile-acc-chevron" aria-hidden="true">❯</span>
                                </button>
                                <div class="mobile-acc-sub">
                                    <a href="human.html" class="mobile-acc-link mobile-acc-link-parent">→ Přejít na Člověk</a>
                                    <a href="cell.html" class="mobile-acc-link">Buněčné a nebuněčné organismy</a>
                                    <a href="tissues.html" class="mobile-acc-link">Tkáně</a>
                                    <a href="organ-system.html" class="mobile-acc-link">Orgánové soustavy</a>
                                    <a href="genetics.html" class="mobile-acc-link">Genetika</a>
                                </div>
                            </div>

                            <div class="mobile-acc-item">
                                <button class="mobile-acc-toggle" aria-expanded="false">
                                    Životní prostředí <span class="mobile-acc-chevron" aria-hidden="true">❯</span>
                                </button>
                                <div class="mobile-acc-sub">
                                    <a href="environment.html" class="mobile-acc-link mobile-acc-link-parent">→ Přejít na Životní prostředí</a>
                                    <a href="ecology-introduction.html" class="mobile-acc-link">Základy ekologie</a>
                                    <a href="ecosystems.html" class="mobile-acc-link">Ekosystémy</a>
                                    <a href="climate-change.html" class="mobile-acc-link">Klimatická změna</a>
                                    <a href="environmental-protection.html" class="mobile-acc-link">Ochrana prostředí</a>
                                </div>
                            </div>
                        </div>
                    </div>
            </div>
        </nav>
            <!-- Burger menu tlačítko -->
            <div class="burger-menu" id="burgerMenu">
                <div class="burger-line"></div>
                <div class="burger-line"></div>
                <div class="burger-line"></div>
            </div>
        <!-- konec navigace pro šířku pod 940px -->
    </div>
```

## Další informace:
Pro přístup k aktuálnímu kódu navštivte https://github.com/gazmichaela/biology/. Tento repozitář obsahuje zdrojový kód, příklady použití a dokumentaci k projektu. Můžete zde také nahlásit chyby nebo navrhnou vylepšení.

__Autor:__ Michaela Gažová

__Reviewer (documentation & JSDoc):__ Daniel Friedl

__Verze:__ 2.2.3

__Datum:__ 2026-05-16