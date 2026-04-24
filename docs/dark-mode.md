# dark-mode.js

## Úvod
Tento script spravuje tmavý režim webu. Detekuje systémové preference, ukládá uživatelskou volbu, detekuje anonymní režim prohlížeče a umožňuje přepínání mezi světlým a tmavým režimem pomocí tlačítka pro změnu režimů.

## Jak to funguje:
`DarkModeManager` sleduje aktuální stav tmavého režimu a podle toho:

- aplikuje odpovídající CSS třídy (`dark-mode`) na `html` a `body`,

- ukládá preference uživatele (prohlížeče založené na jádře Chromium a Safari používají localStorage -> sessionStorage -> cookies, Firefox používá cookies -> sessionStorage -> localStorage),

- zohledňuje anonymní režim, kde zápis do storage není možný,

- umožňuje ruční přepínání pomocí tlačítka s ikonkou slunce a měsíce,

- detekuje typ prohlížeče a podle něj nastavuje prioritní storage.

Součástí je i podpora pro skrytí/zobrazení tlačítka pro změnu režimů a resetování na systémové preference, kdy se barevné schéma řídí podle nastavení systému.

## Požadavky a kompatibilita:
- JavaScript ES6+

- Funguje bez externích knihoven

- Testováno v:

    - Chrome (139.0.7258.67),

    - Firefox (141.0.3),

    - Edge (139.0.3405.102)

## Požadavky na HTML:
Script očekává určitou strukturu:

- Tlačítko pro přepínání režimů `id="darkModeToggle"`

- Tlačítko pro reset systémových preferencí `id="resetSystemPreferences"`

Pokud elementy neexistují, script je vytvoří automaticky.

## Proč OOP? 
Některé mé scripty jsou napsané jen jako funkce.

Tady ale dává smysl použít třídu `DarkModeManager` objektově orientovaného programování, protože:

- Tmavý režim má stav (aktivní/neaktivní, viditelnost/neviditelnost tlačítka pro změnu režimů, systémová preference).

- Existuje zde mnoho logiky (detekce anonymního režimu, aplikace CSS, animace ikonky, ukládání do storage/cookies).

- Metody jako `toggleMode()`, `resetSystemPref()`, `getState()` a `_applyMode()` umožňují přehlednou správu a modularitu.

Díky tomu jsou interní proměnné izolované, čímž se vyhneme globálním konfliktům.

## Instalace:
Do HTML stačí vložit:

```html
<script src="dark-mode.js"></script>
```

Script se automaticky spustí po načtení stránky a nastaví režim podle uložených preferencí nebo systémových nastavení.

## Použití:
Pro ruční ovládání režimů slouží:

```javascript
window.saveDarkModePreference(true);  
window.saveDarkModePreference(false); 
window.resetToSystemPreferences();   
window.getDarkModePreference();     
window.getDarkModeState();          
window.isIncognitoMode();             
window.getBrowserType();               
```

Pro jiná nastavení upravte:

```javascript
_criticalCSS() {
    return `
      .dark-mode-toggle {
        position: fixed !important;
        bottom: 20px !important;        
        right: 20px !important;         
        width: 50px !important;         
        height: 50px !important;        
        border-radius: 8px !important;  
        ... další CSS
      }
    `;
  }
```
například změněním hodnoty ___8px___ u border-radius na ___50%___.

## API Reference
Metody třídy `DarkModeManager`:

- getState() – vrátí objekt s aktuálním stavem dark-mode: zda je zapnut tmavý režim (isDarkMode), zda je aktivní anonymní režim (isPrivateMode), zda je viditelné tlačítko pro přepínání (toggleVisible), zda se používá systémová preference (usingSystemPreference) a typ prohlížeče (browserType).

- toggleMode() – přepne mezi tmavým a světlým režimem. Uloží volbu uživatele, aktualizuje CSS třídy.

- applyMode(isDark) – aplikuje CSS třídy podle zvoleného režimu (true = tmavý, false = světlý).

- resetSystemPref() – odstraní uloženou uživatelskou volbu a obnoví systémovou preferenci prohlížeče.

- savePref(key, value) – uloží preferenci do storage (localStorage, sessionStorage nebo cookies podle prohlížeče a režimu).

- getPref(key) – načte preferenci ze storage.

- detectPrivateMode() – zjistí, zda je prohlížeč v anonymním režimu.

- detectBrowser() – detekuje typ prohlížeče (Firefox / Chromium / Safari).

- createToggle() – vytvoří nebo aktualizuje tlačítko pro přepínání režimů.

- createReset() – vytvoří nebo aktualizuje tlačítko pro reset systémových preferencí prohlížeče.

## Bezpečnostní poznámky:
- Script kontroluje existenci elementů před přidáním eventů (`if (!el) return`).

- Každá instance je izolovaná a interní proměnné nejsou v globálním scope díky IIFE (uzavření do anonymní funkce).

- Ukládání preferencí zohledňuje anonymní režim, kde není možné zapisovat do storage.

- Cookies se používají jen v případě potřeby pro kompatibilitu s Firefoxem.

## Příklad HTML:
```html
<button class="dark-mode-toggle" id="darkModeToggle" title="Přepnout tmavý/světlý režim"></button>

<div id="resetSystemPreferences" class="reset-preferences-btn">Preferovat světlý/tmavý režim prohlížeče</div>
```

Po kliknutí na tlačítko (`darkModeToggle`) se režim změní a preference se uloží.

Po kliknutí na reset (`resetSystemPreferences`) se režim vrátí k systémové preferenci a tlačítko lze skrýt nebo zobrazit.

## Další informace:
Pro přístup k aktuálnímu kódu navštivte https://github.com/gazmichaela/biology/. Tento repozitář obsahuje zdrojový kód, příklady použití a dokumentaci k projektu. Můžete zde také nahlásit chyby nebo navrhnout vylepšení.

__Autor:__ Michaela Gažová

__Reviewer (documentation & JSDoc):__ Daniel Friedl

__Verze:__ 2.1.4

__Datum:__ 2026-04-24