# active-menu.js

 ## Úvod
 Tento script řeší správu navigačních tlačítek na webu (hlavní menu, dropdowny a mobilní verze). Umí si zapamatovat, na které stránce se uživatel nachází, a podle toho nastavit aktivní odkaz.

## Jak to funguje:
NavigationManager hlídá, která navigační položka má být zrovna aktivní - podle toho, co je v URL, nebo když uživatel klikne na tlačítko.

Součástí je i responzivní logika - při určité šířce okna (výchozí hranice 1175 px) se přepne z desktopové navigace na mobilní, takže aktivní stav se udržuje v obou variantách.

## Požadavky a kompatibilita:
- JavaScript ES6+ 

- Funguje bez externích knihoven

- Testováno v:

    - Chrome (139.0.7258.67),

    - Firefox (141.0.3),

    - Edge (139.0.3405.102)

## Požadavky na HTML: 
Script očekává určitou strukturu:
- Tlačítka s třídami `.main-button`, `.main-button-second`
- Mobilní verze s `.mobile-nav-button`
- Dropdown s `.dropdown-content`

## Proč OOP?
Některé mé scripty jsou napsané jen jako funkce.
Tady ale dává větší smysl použít přístup (třídu) objektově orientovaného programování, protože:

- navigace má stav (aktivní tlačítko, seznam prvků),

- je tu víc logiky (desktop + mobil + URL), která k sobě patří,

- můžu snadno přidat matody jako __refresh()__ nebo __destroy()__, což je čistší než řešit globální proměnné a funkce.

Díky tomu je kód přehlednější a udržovatelnější.

## Instalace:
Do HTML stačí vložit:

``` html
<script src="active-menu.js"></script>
```

Navigace se sama spustí po načtení stránky s výchozími nastaveními.

## Použití:
Pro ruční nastavení aktivního tlačítka slouží:

``` javascript
setActiveBySelector(".main-button-second");
```

Pro jiná nastavení si vytvořte vlastní instanci: 

``` javascript
class NavigationManager {
    constructor(options) {
      options = options || {};
      this.mobileBreakpoint = options.mobileBreakpoint || 1175 ;
      this.activeClass = options.activeClass || "active";
      .... další 
    }
} 
```
například změněním hodnoty ___1175___ u mobileBreakpoint.

## API Reference:
Metody třídy:

- init() - spustí správu navigace.

- setActiveButton(button) - ručně nastaví aktivní odkaz.

- setActiveFromUrl() - nastaví aktivní tlačítko podle adresy stránky.

- refresh() - znovu načte elementy a obnoví listenery (užitečné, když se obsah menu změní).

- destroy() - odpojí všechny eventy a smaže stav (např. před odstraněním navigace).

## Bezpečnostní poznámky:
Kód počítá s tím, že nějaký element nemusí existovat (kontroly if (!el) return).

Každá instance má vlastní debounce,aby se eventy nemíchaly.

Kvůli IIFE (uzavření do anonymní funkce) se nedostávájí interní věci do globálného scope.

## Příklad HTML:

### Desktop navigace:

```html
        <ul>
            <a href="index.html" class="home-icon" aria-label="Přejít na domovskou stránku">
                <picture>
                    <source srcset="images/webp/home.webp" type="image/webp">
                    <img src="images/png/home.png" alt="Domů" class="button-container" title="Vrátit se na hlavní stránku">
                </picture>
            </a>

            <!-- Základy systémového myšlení -->
            <li class="dropdown">
                <div class="button-container">
                    <a href="system.html" class="main-button">Základy systémového myšlení</a>
                    <button class="dropdown-toggle"><span class="arrow" id="arrow">&#9662;</span></button>
                </div>
                <div class="dropdown-content" id="dropdown-content" tabindex="-1">
                    <div class="sub-dropdown">
                        <a href="system-introduction.html" class="centered" tabindex="0">Úvod</a>
                        <span class="sub-dropdown-toggle">&#9656;</span>
                        <div class="sub-dropdown-content">
                            <a href="system-approach.html" tabindex="0">Systémový přístup</a>
                            <a href="system-thinking.html" tabindex="0">Systémové myšlení</a>
                        </div>
                    </div>
                    <a href="system-theory.html" tabindex="0">Teorie systémů</a>
                </div>
            </li>

            <!-- Základy živých soustav **SECOND** -->
            <li class="dropdown">
                <div class="button-container"> 
                    <a href="life.html" class="main-button">Základy živých soustav</a>
                    <button class="dropdown-toggle-second"><span class="arrow" id="arrow">&#9662;</span></button>
                </div>
                <div class="dropdown-content-second" id="dropdown-content-second" tabindex="-1">
                    <a href="life-properties.html" tabindex="0">Vlastnosti živých soustav</a>
                    <a href="life-origin.html" tabindex="0">Vznik života</a>
                </div>
            </li>

            <!-- Buňka, Člověk -->
            <div class="button-container">
                <a href="cell.html" class="main-button-second">Buněčné a nebuněčné organismy</a>
            </div>
            <div class="button-container">
                <a href="human.html" class="main-button-second">Člověk</a>
            </div>
        </ul>
```

### Mobilní navigace:

```html
                <div class="mobile-expandable">
                    <a href="system.html" class="mobile-nav-button mobile-nav-button-big">Základy systémového myšlení</a>
                        <a href="system-introduction.html" class="mobile-nav-button mobile-nav-button-two mobile-nav-button-mid">Úvod</a>
                            <a href="system-approach.html" class="mobile-nav-button mobile-nav-button-three">Systémový přístup</a>
                            <a href="system-thinking.html" class="mobile-nav-button mobile-nav-button-three">Systémové myšlení</a>
                        <a href="system-theory.html" class="mobile-nav-button mobile-nav-button-big mobile-nav-button-two">Teorie systémů</a>
         
                <!-- Základy živých soustav -->
                    <a href="life.html" class="mobile-nav-button mobile-nav-button-big">Základy živých soustav</a>
                        <a href="life-properties.html" class="mobile-nav-button mobile-nav-button-two">Vlastnosti živých soustav</a>
                        <a href="life-origin.html" class="mobile-nav-button mobile-nav-button-big mobile-nav-button-two">Vznik života na Zemi</a>
           
                <!-- Buňka, člověk -->
                    <a href="cell.html" class="mobile-nav-button mobile-nav-button-big">Buněčné a nebuněčné organismy</a>
                    <a href="human.html" class="mobile-nav-button mobile-nav-button-big">Člověk</a>
                </div>
```

Po kliknutí na libovolný odkaz se správně označí aktivní stránka. Je ale nutné mít správně nastavené kaskádové styly.

## Další informace
Pro přístup k aktuálnímu kódu navštivte https://github.com/gazmichaela/biology/. Tento repozitář obsahuje zdrojový kód, příklady použití a dokumentaci k projektu. Můžete zde také nahlásit chyby nebo navrhnout vylepšení.


__Autor:__ Michaela Gažová 

__Reviewer (documentation & JSDoc):__ Daniel Friedl

__Verze:__ 3.0.0

__Datum:__ 2025-08-18