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
<!-- Burger menu tlačítko -->
<div class="burger-menu" id="burgerMenu">
    <div class="burger-line"></div>
    <div class="burger-line"></div>
    <div class="burger-line"></div>
</div>

<!-- Overlay pro zavření menu -->
<div class="menu-overlay" id="menuOverlay"></div>


<!-- Mobilní navigace -->
<nav class="mobile-nav-container" id="mobileNav">
    <button class="menu-close-button" id="closeButton"></button><!-- Křížek pro zavření -->
    <div class="mobile-nav-list">

        <!-- Domů -->
        <a href="index.html" class="mobile-nav-button mobile-nav-button-big">Domů</a>

        <div class="mobile-expandable">

            <!-- Základy systémového myšlení -->
            <a href="system.html" class="mobile-nav-button mobile-nav-button-big">Základy systémového myšlení</a>
                <a href="system-introduction.html" class="mobile-nav-button mobile-nav-button-two mobile-nav-button-mid">Úvod</a>
                    <a href="system-approach.html" class="mobile-nav-button mobile-nav-button-three">Systémový přístup</a>
                <a href="system-theory.html" class="mobile-nav-button mobile-nav-button-big mobile-nav-button-two">Teorie systémů</a>
 
            <!-- Buňka -->
            <a href="cell.html" class="mobile-nav-button mobile-nav-button-big">Buněčné a nebuněčné organismy</a>
        </div>
    </div>
</nav>
<!-- konec navigace pro šířku pod 940px -->
```

## Další informace:
Pro přístup k aktuálnímu kódu navštivte https://github.com/gazmichaela/biology/. Tento repozitář obsahuje zdrojový kód, příklady použití a dokumentaci k projektu. Můžete zde také nahlásit chyby nebo navrhnou vylepšení.

__Autor:__ Michaela Gažová

__Reviewer (documentation & JSDoc):__ Daniel Friedl

__Verze:__ 2.1.1

__Datum:__ 2026-04-27