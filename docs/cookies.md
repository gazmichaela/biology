# cookies.js 

## Úvod 
V tomto scriptu nejsou řešena cookies pro jiné funkce webu!

Tento script spravuje notifikaci o cookies a ukládá souhlas uživatele na webu. Zobrazuje upozornění, detekuje anonymní režim v prohlížečích, synchronizuje stav mezi taby v prohlížečích a zajišťuje správné ukládání souhlasu pomocí cookies, localStorage nebo sessionStorage.

## Jak to funguje:
`CookieManager` sleduje, zda uživatel již souhlasil s cookies, a podle toho:

- zobrazuje nebo skrývá notifikace,

- reaguje na změnu anonymního režimu.

Prohlížeče založené na jádře Chromium a Safari používají localStorage -> sessionStorage -> cookies, Firefox kvůli lepší kompatibilitě používá cookies -> sessionStorage -> localStorage.

Script používá storage eventy pro automatickou synchronizaci mezi taby a fallback mechanismus pro synchronizaci mezi různými úložišti.

Anonymní režim se detekuje pokusem o zápis do localStorage.

Součástí je i zpožděné zobrazení (`showDelay`) a podpora pro různé prohlížeče (Firefox, Safari a prohlížeče založené na Chromiu).

## Požadavky a kompatibilita:
- JavaScript ES6+ 

- Funguje bez externích knihoven

- Testováno v:

    - Chrome (139.0.7258.67),

    - Firefox (141.0.3),

    - Edge (139.0.3405.102)

## Požadavky na HTML:
Script očekává určitou strukturu:

- Element pro notifikaci: `id="cookiesMiniNotice"`

- Tlačítko pro přijetí: `id="acceptCookies"`

## Proč OOP?
Některé mé scripty jsou napsané jen jako funkce.

Tady ale dává smysl použít třídu (`CookieManager`) objektově orientovaného programování, protože:

- Notifikace má stav (zobrazená/skrytá, cookies akceptovány, anonymní režim, typ prohlížeče).

- Existuje více logiky (detekce anonymního režimu, synchronizace, eventy, zpoždění zobrazení).

- Metody jako `show()`, `hide()`, `reset()` a `destroy()` jsou jasně oddělené a umožňují přehlednější správu.

Díky kód zůstává modulární a čistější.

## Instalace: 
Do HTML stačí vložit:

```html
<script src="cookies.js"></script>
```

Notifikace se sama spustí po načtení stránky s výchozími nastaveními.

## Použití:
Pro ruční ovládání notifikace slouží:

```javascript
showCookieNotice();    
hideCookieNotice();   
resetCookies();      
cookieManagerState();  
```

Pro vytvoření vlastní instance upravte:

```javascript
class CookieManager {
  constructor(options = {}) {
    this.config = {
      showDelay: options.showDelay || 1000,
      checkInterval: options.checkInterval || 1500,
      enableLogging: options.enableLogging || false,
      showClass: options.showClass || "show",
      storageKey: options.storageKey || "cookiesAccepted",
      ... další 
    };
  }
}
```
například změněním hodnoty ___1000___ u showDelay na ___2000___

## API Reference:
Metody třídy __CookieManager__:

- init() - inicializuje správu notifikace a monitoring anonymního režimu

- show() - zobrazí upozornění na cookies

- hide() - skryje upozornění na cookies

- reset() - resetuje stav cookies a znovu nastaví notifikaci

- refresh() - znovu načte elementy a aktualizuje zobrazení

- destory() - odpojí všechny eventy a vyčistí stav

- getState() - vrátí objekt s aktuálním stavem (cookiesAccept, noticeVisible, isPrivateMode, isFirefox, atd.)

## Bezpečnostní poznámky:
Kód kontroluje existenci elementů před přidáním eventů (`if (!el) return`).

Každá instance je izolovaná a interní proměnné nejsou v globálním scope díky IIFE (uzavření do anonymní funkce).

Cookies se ukládají s `SameSite=Lax` a `Secure` (pro HTTPS), aby se minimalizovalo riziko zněužití.

V anonymním režimu se používá __sessionStorage__, pokud není možné zapisovat do localStorage/cookies.

## Příklad HTML:

```html
<div id="cookiesMiniNotice" class="cookies-mini-notice">
    <p>Tento web používá pouze nezbytné cookies pro zajištění jeho správné funkčnosti.</p>
    <a href="personal-data.html" aria-label="Více informací o používání cookies">Více informací</a>
    <br>
    <br>
    <button id="acceptCookies">Rozumím</button>
</div>
```

Po kliknutí na tlačítko __Rozumím__ se upozornění skryje a stav uloží. Pokud uživatel otevře novou záložku, notifikace zůstane skrytá díky synchronizaci.

## Další informace:
Pro přístup k aktuálnímu kódu navštivte https://github.com/gazmichaela/biology/. Tento repozitář obsahuje zdrojový kód, příklady použití a dokumentaci k projektu. Můžete zde také nahlásit chyby nebo navrhnout vylepšení.

__Autor:__ Michaela Gažová 

__Reviewer (documentation & JSDoc):__ Daniel Friedl

__Verze:__ 3.2.1

__Datum:__ 2025-01-09