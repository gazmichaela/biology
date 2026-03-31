# dropdowns.js

## Úvod
Tento script řeší správu víceúrovňových dropdown menu (první menu, druhé menu, třetí menu a submenu) u desktop navigace. Zajišťuje jejich správné otevírání, zavírání a plynulé chování při práci s myší i klávesnicí.

## Jak to funguje:
`DropdownManager` spravuje jednotlivé dropdowny a hlídá jejich stav – jestli jsou otevřené, jakým způsobem byly aktivovány a jak se uživatel pohybuje mezi jejich prvky.

Každý dropdown funguje jako samostatná instance, takže se navzájem neovlivňují.

Součástí je i logika pro plynulé přechody mezi tlačítkem a obsahem dropdownu (tzv. „mrtvá zóna“), která zabraňuje nechtěnému zavření při pohybu myši.

## Požadavky a kompatibilita:
- JavaScript ES6+

- Funguje bez externích knihoven

- Testováno v:

    - Chrome (146.0.7680.154),

    - Firefox (148.0.2),

    - Edge (146.0.3856.62)

## Požadavky na HTML: 
Script očekává určitou strukturu:

- Tlačítka s třídami `.dropdown-toggle`, `.dropdown-toggle-second`, `.dropdown-toggle-third`

- Obsah dropdownů s třídami `.dropdown-content`, `.dropdown-content-second`, `.dropdown-content-third`

- Volitelně subdropdown s třídami `.sub-dropdown-toggle` a `.sub-dropdown-content`

## Proč OOP?
Některé mé scripty jsou napsané jen jako funkce.

Tady ale dává smysl použít třídu `DropdownManager` objektově orientovaného programování, protože:

- každý dropdown má vlastní stav (otevřený/zavřený, způsob aktivace),

- je tu víc logiky (hover, click, klávesnice, subdropdowny), která k sobě patří,

- každá instance běží samostatně a nepřepisuje ostatní,

Díky tomu je kód přehlednější a lépe se udržuje i při větším počtu dropdownů.

## Instalace:
Do HTML vložte:

```html
<script src="dropdowns.js"></script>
```

Dropdowny se automaticky inicializují po načtení stránky.

## Použití:
Pro ruční ovládání dropdownů slouží:

``` javascript
window.dropdownMenus.first.open();
window.dropdownMenus.second.open();
window.dropdownMenus.third.open();
window.closeAllMenusExcept(exceptMenuId);
window.closeFirstMenu();
window.closeSecondMenu();
window.closeThirdMenu();
window.closeSubMenuWithParent();
window.setSubmenuActive(active);
window.dropdownMenu = window.dropdownMenus.first;
```

Pro jiné nastavení si můžete vytvořit vlastní instanci:

``` javascript
class DropdownManager {
    constructor(options = {}) {
      this.id = options.id || "default-menu";

      this.config = {
        toggleSelector: options.toggleSelector || ".dropdown-toggle",
        contentSelector: options.contentSelector || ".dropdown-content",
        subToggleSelector: options.subToggleSelector || null,
        subContentSelector: options.subContentSelector || null,
        clickInactivityDelay: options.clickInactivityDelay || 2000,
        ... další 
      };
    }
  }
```
například změněním hodnoty ___2000___ u clickInactivityDelay na ___3000___.

## API Reference:
Metody třídy __DropdownManager__:

- init() - inicializuje dropdown

- open() - otevře dropdown

- close() - zavře dropdown

- toggle() - přepne stav dropdownu

- isOpen() - vrátí, zda je dropdown otevřený

- refresh() - znovu načte elementy a obnoví listenery

- destroy() - odpojí všechny eventy a vyčistí stav

- getState() - vrátí aktuální stav instance

- setSubmenuActive(active) - nastaví, zda je subdropdown aktivní

___Klávesnicová přístupnost:___

Script podporuje ovládání klávesnicí:

- Enter / Mezerník - otevře nebo zavře dropdown

- Šipky - pohyb v dropdownu mezi položkami

- Home / End - přesune focus na první nebo poslední položku

- Escape - zavře dropdown

## Bezpečnostní poznámky:
- Script kontroluje existenci elementů před jejich použitím, takže nedojde k chybám při chybějící struktuře.

- Každá instance pracuje samostatně, takže se dropdowny navzájem neovlivňují.

- Kvůli IIFE (uzavření do anonymní funkce) se interní logika nedostává do globálního scope.

- Zápisy do localStorage jsou omezené, aby nedocházelo ke zbytečnému zatěžování při pohybu myši.

## Příklad HTML:

```html
<li class="nav-right dropdown">
    <div class="button-container">
        <a href="system.html" class="main-button" tabindex="0">Úvod</a>
        <button class="dropdown-toggle" aria-label="Rozbalit" tabindex="0"><span class="arrow">&#9662;</span></button>
    </div>
    <div class="dropdown-content" id="dropdown-content" tabindex="-1">
        <div class="sub-dropdown">
            <a href="system-introduction.html" class="centered" tabindex="0">Základní principy</a>
            <span class="sub-dropdown-toggle" aria-label="Dvě položky pod základními principy jsou rozbaleny" tabindex="0">&#9656;</span>
            <div class="sub-dropdown-content">
                <a href="system-approach.html" tabindex="0">Systémový přístup</a>
                <a href="system-thinking.html" tabindex="0">Systémové myšlení</a>
            </div>
        </div>
        <a href="system-theory.html" tabindex="0">Teorie systémů</a>
        <a href="life-properties.html" tabindex="0">Vlastnosti živých soustav</a>
        <a href="life-origin.html" tabindex="0">Vznik života</a>
    </div>
</li>
```

## Další informace:
Pro přístup k aktuálnímu kódu navštivte https://github.com/gazmichaela/biology/. Tento repozitář obsahuje zdrojový kód, příklady použití a dokumentaci k projektu. Můžete zde také nahlásit chyby nebo navrhnout vylepšení.

__Autor:__ Michaela Gažová

__Reviewer (documentation & JSDoc):__ Daniel Friedl

__Verze:__ 2.5.0

__Datum:__ 2026-03-31