# sticky-header.js

## Úvod
Tento skript implementuje sticky header, který se zobrazuje při scrollování nahoru a skrývá při scrollování dolů.
Obsahuje navigaci s dropdown menu, burger menu pro mobilní zařízení a podporu klávesové navigace.
Cílem je zajistit stálý přístup k navigaci, aniž by zabírala zbytečné místo na stránce.

## Jak to funguje:
Sticky header pracuje na principu klonování původního `<header>` a jeho zobrazení/skrývání se řídí směrem scrollování a pozicí na stránce.

Script: 

- Klonuje obsah původního headeru včetně navigace a mobilních prvků

-  Sleduje směr scrollování a pozici stránky

- Implementuje vlastní logiku dropdown menu pro sticky verzi

- Vytváří samostatné mobilní menu pro sticky header

- Řídí přístupnost (`tabindex`, `aria` atributy)

## Požadavky a kompatibilita:
- JavaScript ES6+ 

- Funguje bez externích knihoven

- Testováno v:

    - Chrome (139.0.7258.67),

    - Firefox (141.0.3),

    - Edge (139.0.3405.102)

## Požadavky na HTML:
Script očekává určitou strukturu:

- `<header>` element s navigací

- Dropdown menu s třídami `.dropdown`, `.dropdown-toggle`, `.dropdown-content`

- Druhé dropdown menu s `.dropdown-toggle-second`, `.dropdown-content-second`

- Subdropdown s třídami `.sub-dropdown-toggle`, `.sub-dropdown-content`

- Mobilní navigace s  `id="mobileNav"` a overlay `id="menuOverlay"`

- Burger menu s třídou `.burger-menu`

## Proč není použité OOP?
Na rozdíl od jiných skriptů zde nebylo použité objektově orientované programování. Sticky header pracuje s více nezávislými subsystémy: scroll handling, dropdown menu, mobilní navigace a accessibility.

Místo jedné třídy je proto použit funkcionální přístup – jednotlivé části logiky jsou řešeny pomocí samostatných funkcí a listenerů. Kód je sice rozsáhlejší, ale díky tomuto rozdělení je flexibilní a snadno se dá rozšiřovat (např. o další úrovně menu nebo speciální chování).

Použití OOP by vedlo k vytvoření velké třídy s mnoha odpovědnostmi nebo k množství propojených tříd, což by kód zbytečně komplikovalo.

## Instalace:
Do HTML vložte:

```html
<script src="sticky-header.js"></script>
```

Skript se spustí automaticky po načtení stránky.

## Použití:
Pro ruční ovládání sticky headeru a jeho dropdown menu slouží:

```javascript
window.clearAllDropdownStates();
window.initializeStickyDropdowns();
window.closeStickyDropdown_X();
window.closeStickySubDropdown_X();
```

Pro jiná nastavení upravte:

```javascript
const inactivityDelay = 2000;
const clickInactivityDelay = 2000;
```
například změněním hodnoty ___2000___ na ___3000___ u clickInactivityDelay

## API Reference:
Metody :

- clearAllDropdownStates() – zavře všechna dropdown menu.

- initializeStickyDropdowns() – inicializuje dropdown logiku pro sticky header.

- insertStickyHeaderStyles() – vloží potřebné CSS styly.

- createStickyHeader() – vytvoří sticky header element.

- initStickyHeaderFunctionality() – inicializuje scroll a event listenery.

## Bezpečnostní poznámky:
Kontrola existence elementů (`if (!element) return`) zajišťuje, že skript neběží na neexistujících prvcích.

Každý subsystém má vlastní stav, aby se event listenery nemíchaly a logika zůstávala přehledná.

Timeouty a intervaly jsou čištěny, aby se zabránilo opakovanému nebo nekontrolovanému volání funkcí.

Animace a scroll handling používají requestAnimationFrame pro plynulý výkon a minimalizaci zátěže CPU.

## Další informace:
Pro přístup k aktuálnímu kódu navštivte https://github.com/gazmichaela/biology/. Tento repozitář obsahuje zdrojový kód, příklady použití a dokumentaci k projektu. Můžete zde také nahlásit chyby nebo navrhnout vylepšení.

__Autor:__ Michaela Gažová

__Reviewer (documentation & JSDoc):__ Daniel Friedl

__Verze:__ 2.22.0

__Datum:__ 2025-09-11