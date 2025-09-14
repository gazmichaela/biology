# dropdowns.js

## Úvod
Tento skript řeší správu víceúrovňových dropdown menu (hlavní menu, druhé menu a submenu) u desktop navigace.
Cílem je zajistit plynulé chování jak na desktopu (hover, klik), tak i při použití klávesnice. Umí si také zapamatovat stav menu a po obnovení stránky je znovu otevřít.

## Jak to funguje:
`DropdownManager` sleduje tři typy menu:

- hlavní dropdown (`.dropdown-toggle`, `.dropdown-content`),

- druhé dropdown (`.dropdown-toggle-second`, `.dropdown-content-second`),

- submenu (`.sub-dropdown-toggle`, `.sub-dropdown-content`).

Každé menu má vlastní logiku zobrazování a skrývání.

Součástí je tzv. ___dead zone___, která zabraňuje nechtěnému zavření při přechodu myší mezi tlačítkem a obsahem.

Stavy menu (otevřeno/zavřeno) se ukládají do `localStorage`, po reloadu zůstane navigace konzistentní.

## Požadavky a kompatibilita:
- JavaScript ES6+

- Funguje bez externích knihoven

- Testováno v:

    - Chrome (139.0.7258.67),

    - Firefox (141.0.3),

    - Edge (139.0.3405.102)

## Požadavky na HTML:
Script očekává určitou strukturu:

- Dropdown kontejner s třídou `.dropdown-toggle` a vnořený element s třídou `.dropdown-content`, který obsahuje obsah __prvního dropdown menu__.

- Pro druhé menu: kontejner s třídou `.dropdown-toggle-second` a obsah s `.dropdown-content-second`.

- Pro submenu: element s třídou `.sub-dropdown-toggle` a obsah s `.sub-dropdown-content`.


## Proč není použité OOP?
Na rozdíl od jiných skriptů (např. pro navigaci) zde nebylo použité objektově orientované programování. Dropdowny totiž nepracují s jedním jasně definovaným stavem, ale s množstvím menších interakcí (hover, klik, časovače, dead-zone výpočty).

Místo jedné třídy je proto použit funkcionální přístup – jednotlivé části logiky jsou řešeny pomocí samostatných funkcí a listenerů. Kód je sice rozsáhlejší, ale díky tomuto rozdělení je flexibilní a snadno se dá rozšiřovat (např. o další úrovně menu nebo speciální chování).

Použití OOP by zde nepřineslo výrazné zjednodušení – naopak by přidalo vrstvu abstrakce, která by práci spíš komplikovala.

## Instalace:
Do HTML vložte:
```html
<script src="dropdowns.js"></script>
```

Script se spustí automaticky po načtení stránky.

## Použití:
Pro ruční ovládání dropdown menu slouží:

```javascript
window.dropdownMenu.closeFirstMenu();
window.dropdownMenu.isFirstMenuOpen();
window.closeSecondMenu();
```

Pro jiná nastavení upravte:

```javascript
const inactivityDelay = 2000;
const clickInactivityDelay = 2000;
```
například změnou inactivityDelay z ___2000___ na ___3000___ 

## API Reference:
Script obsahuje několik veřejných metod:

- closeFirstMenu() - zavře první dropdown menu programaticky.

- isFirstMenuOpen() - vrátí stav prvního menu jako boolean hodnotu.

- getMousePosition() - vrátí aktuální pozici myši.

- closeSecondMenu() - zavře druhé dropdown menu.

- closeAllMenusExcept() - zavře všechna menu kromě zadaného.

- setSubmenuActive() - aktivuje nebo deaktivuje submenu.

Veškerá logika běží automaticky.

## Bezpečnostní poznámky:
Každý blok kontroluje, zda existuje odpovídající HTML element (`if (!el) return`).

Každé menu má vlastní stav, aby se eventy nemíchaly.

Kvůli IIFE (uzavření do anonymní funkce) se interní proměnné nedostávají do globálního scope.

## Příklad HTML:

```html
<li class="dropdown">
    <div class="button-container">
        <a href="system.html" class="main-button" tabindex="0">Základy systémového myšlení</a>
        <button class="dropdown-toggle" aria-label="Rozbalit" tabindex="0"><span class="arrow">&#9662;</span></button>
    </div>
    <div class="dropdown-content" id="dropdown-content" tabindex="-1">
        <div class="sub-dropdown">
            <a href="system-introduction.html" class="centered" tabindex="0">Úvod</a>
            <span class="sub-dropdown-toggle" aria-label="Rozbalit dvě položky v úvodu" tabindex="0">&#9656;</span>
            <div class="sub-dropdown-content">
                <a href="system-approach.html" tabindex="0">Systémový přístup</a>
                <a href="system-thinking.html" tabindex="0">Systémové myšlení</a>
            </div>
        </div>
        <a href="system-theory.html" tabindex="0">Teorie systémů</a>
    </div>
    </li>

    <li class="dropdown">
    <div class="button-container"> 
        <a href="life.html" class="main-button" tabindex="0">Základy živých soustav</a>
        <button class="dropdown-toggle-second" aria-label="Rozbalit" tabindex="0"><span class="arrow">&#9662;</span></button>
    </div>
    <div class="dropdown-content-second" id="dropdown-content-second" tabindex="-1">
        <a href="life-properties.html" tabindex="0">Vlastnosti živých soustav</a>
        <a href="life-origin.html" tabindex="0">Vznik života</a>
    </div>
</li>
```

## Další informace:
Pro přístup k aktuálnímu kódu navštivte https://github.com/gazmichaela/biology/. Tento repozitář obsahuje zdrojový kód, příklady použití a dokumentaci k projektu. Můžete zde také nahlásit chyby nebo navrhnout vylepšení.

__Autor:__ Michaela Gažová

__Reviewer (documentation & JSDoc):__ Daniel Friedl

__Verze:__ 1.21.0

__Datum:__ 2025-09-10