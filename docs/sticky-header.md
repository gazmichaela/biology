# sticky-header.js

## Úvod
Tento script řeší zobrazení sticky headeru jako navigační lišty, která se zobrazí při scrollování nahoru a skryje při scrollování dolů. Automaticky přebírá obsah původního headeru včetně dropdownů a mobilní navigace.

## Jak to funguje: 
Script vytváří kopii původního `<header>` a používá ji jako sticky navigační lištu.

Hlavní třída `StickyHeader` kontroluje pozici scrollu a podle směru pohybu rozhoduje, zda se má sticky header zobrazit nebo skrýt.

Součástí je i správa dropdownů ve sticky verzi, kterou zajišťuje třída `StickyDropdownManager`. Ta má vlastní logiku, takže dropdowny fungují stejně jako v normálním headeru (hover, kliknutí i klávesnice).

Navíc se ukládá pozice scrollu při obnovení stránky za pomocí třídy `ScrollStateManager`, aby se uživatel vrátil na stejné místo.

## Požadavky a kompatibilita:
- JavaScript ES6+

- Funguje bez externích knihoven

- Testováno v:

    - Chrome (147.0.7727.102),

    - Firefox (149.0),

    - Edge (147.0.3912.72)

## Požadavky na HTML: 
Script očekává určitou strukturu:

- `<header>` jako hlavní navigaci

- Dropdown prvky (`.dropdown-toggle`, `.dropdown-content`)

- Varianty pro další menu (`.dropdown-content-second`, `.dropdown-toggle-second`, `.dropdown-content-third`, `.dropdown-toggle-third`)

- Volitelně subdropdown (`.sub-dropdown-toggle`, `.sub-dropdown-content`)

- Mobilní navigaci (`.burger-menu`, `#mobileNav`, `#menuOverlay`)

## Proč OOP?
Některé mé scripty jsou napsané jen jako funkce.

Tady ale dává smysl použít třídy jako `StickyHeader`, `StickyDropdownManager` a `ScrollStateManager` objektově orientovaného programování, protože:

- header má stav (viditelnost, scroll pozice, inicializace),

- dropdowny uvnitř mají vlastní logiku a chování,

- část logiky je oddělená (scroll, dropdowny, samotný header),

- metody jako `destroy()` nebo `getState()` pracují se stavem konkrétní instance, takže mají jasné místo v rámci třídy,

Díky tomu je kód přehlednější a lépe rozdělený.

## Instalace:
Do HTML stačí vložit:

```html
<script src="sticky-header.js"></script>
```

Script se spustí automaticky po načtení stránky.

## Použití:
Pro ruční ovládání sticky headeru slouží:

```javascript
// třída StickyHeader
window.stickyHeader.destroy();
window.stickyHeader.getState();

// dropdownManager1 = sticky-dropdown-content
window.stickyHeader.dropdownManager1.open();
window.stickyHeader.dropdownManager1.close();
window.stickyHeader.dropdownManager1.toggle();
window.stickyHeader.dropdownManager1.isOpen();
window.stickyHeader.dropdownManager1.destroy();
window.stickyHeader.dropdownManager1.getState();

// dropdownManager2 = sticky-dropdown-content-second
window.stickyHeader.dropdownManager2.open();
window.stickyHeader.dropdownManager2.close();
window.stickyHeader.dropdownManager2.toggle();
window.stickyHeader.dropdownManager2.isOpen();
window.stickyHeader.dropdownManager2.destroy();
window.stickyHeader.dropdownManager2.getState();

// dropdownManager3 = sticky-dropdown-content-third
window.stickyHeader.dropdownManager3.open();
window.stickyHeader.dropdownManager3.close();
window.stickyHeader.dropdownManager3.toggle();
window.stickyHeader.dropdownManager3.isOpen();
window.stickyHeader.dropdownManager3.destroy();
window.stickyHeader.dropdownManager3.getState();
```

Pro jiná nastavení si můžete vytvořit vlastní instanci:

```javascript
class StickyDropdownManager {
    constructor(options = {}) {
      this.id = options.id || "sticky-default";

      this.config = {
        clickInactivityDelay: options.clickInactivityDelay || 2000,
        inactivityDelay: options.inactivityDelay || 2000,
        hoverHideDelay: options.hoverHideDelay || 200,
        transitionDuration: options.transitionDuration || 300,
        deadzoneMatchContent: options.deadzoneMatchContent || false,
        storagePrefix: options.storagePrefix || options.id || "sticky-default",
      };
      ... další 
    }
  }
```

například změněním hodnoty ___200___ u hoverHideDelay na ___500___.

K dispozici jsou i globální funkce:

```javascript
window.stickyHeader;                                      
window._stickyCloseAllExcept("sticky-dropdown-content"); 
window.clearAllDropdownStates();                          
window._stickyDropdownManagers;                          
window.StickyDropdownManager; 
```

Script také počítá s tím, že následující globální proměnné nastavuje jiný script:

```javascript
window.tabNavigationActive;
window.openMenu;
window.closeMenu;
```

## API Reference:
Metody třídy `StickyHeader`:

- init() - inicializuje sticky header

- destroy() - odpojí eventy a zruší instance dropdownů

- getState() - vrátí aktuální stav

Třída `StickyDropdownManager`:

- open() - otevře dropdown

- close() - zavře dropdown

- toggle() - přepne stav dropdownu

- isOpen() - vrátí, zda je dropdown otevřený

- destroy() - odpojí eventy a odstraní pomocné prvky

- getState() - vrátí stav instance

___Chování při scrollování:___

Sticky header reaguje na směr scrollu:

- při scrollování nahoru se __zobrazí__,

- při scrollování dolů se __skryje__,

- po překročení určité vzdálenosti od vrchu stránky se přidá třída `.scrolled`.

___Klávesnicová navigace:___

Dropdowny podporují ovládání klávesnicí:

- Enter / Mezerník - otevře nebo zavře dropdown

- Šipky - pohyb v dropdownu mezi položkami

- Home / End - přesune focus na první nebo poslední položku

- Escape - zavře dropdown

## Bezpečnostní poznámky:
Script kontroluje existenci potřebných elementů, takže nedojde k chybám při chybějícím HTML.

Každá instance dropdownu má vlastní stav a timery, aby se eventy nemíchaly.

Kvůli IIFE (uzavření do anonymní funkce) se interní proměnné nedostanou do globálního scope.

## Další informace:
Pro přístup k aktuálnímu kódu navštivte https://github.com/gazmichaela/biology/. Tento repozitář obsahuje zdrojový kód, příklady použití a dokumentaci k projektu. Můžete zde také nahlásit chyby nebo navrhnout vylepšení.

__Autor:__ Michaela Gažová 

__Reviewer (documentation & JSDoc):__ Daniel Friedl

__Verze:__ 3.1.1

__Datum:__ 2026-05-18