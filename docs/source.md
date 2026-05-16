# source.js

## Úvod
Tento script řeší správu tzv. "info-boxů" (zdrojů u obrázků) na webové stránce. Umožňuje jejich otevírání/zavírání kliknutím nebo hoverem a zároveň správně zachází s odkazy uvnitř, aby se při kliknutí na odkaz info-box hned nezavíral.

## Jak to funguje: 
`InfoBoxManager` si najde všechny prvky s třídami `.info-box`, `.info-icon` (případně další varianty) a nastaví jim potřebnou logiku.

Force-close - aplikuje se automaticky, aby se info-box hned znovu nezavřel kvůli hover efektu.

Klikací plocha podle tvaru - u kruhových ikon s třídou `.icon-circle` se kontroluje vzdálenost od středu místo obdelníku.

Klikem na prvek se otevře nebo zavře. Pokud jde o ikonku, chová se speciálně (force.close, klikací plocha podle tvaru).

Při najetí myší se aplikuje třída `hover-active`, při odjetí zmizí.

Odkazy mají vlastní třídu `info-box-link`, takže se nepropaguje klik na rodiče.

Klik mimo info-box na dokument zavře otevřený info-boxy. 

## Požadavky a kompatibilita: 
- JavaScript ES6+

- Funguje bez externích knihoven

- Testováno v:

    - Chrome (139.0.7258.67),

    - Firefox (141.0.3),

    - Edge (139.0.3405.102)

## Požadavky na HTML: 
Script očekává určitou strukturu:

- Info-boxy s třídou `.info-box`

- Ikony s třídou `.info-icon` a `.icon-circle`

- Odkazy uvnitř (`<a> nebo [href]`) - automaticky dostanou třídu `.info-box-link`

## Proč OOP?
Některé mé scripty jsou napsané jen jako funkce.

Tady ale dává smysl použít třídu (`InfoBoxManager`) objektově orientovaného programování, protože:

- Info-boxy mají stav (otevřené/zavřené, force-close, hover). 

- Je tu více různých logických větví (kliknutí, hover efekt, odkazy, dotyková gesta).

- Metody jako __openElement()__, __closeAll()__ nebo __toggleElement()__ jsou jasně oddělené a tím se kód snadněji udržuje.

Díky tomu celý kód zůstane čistý a přehledný.

## Instalace: 
Do HTML stačí vložit:

```html
<script src="source.js"></script>
```

Po načtení stránky se script spustí automaticky.

## Použití:
Pro ruční ovládání použijte:

```javascript
openInfoBox(".info-box");     
closeInfoBox(".info-box");    
toggleInfoBox(".info-box");   
closeAllInfoBoxes();          
```

Pro jiné nastavení si můžete vytvořit vlastní instanci:

```javascript
 class InfoBoxManager {
    constructor(options) {
      options = options || {};
      this.variants = options.variants || ['info-box', 'info-icon'];
      this.activeClass = options.activeClass || 'active';
      this.hoverClass = options.hoverClass || 'hover-active';
       ...další
      }
   };  
```
například změněním activeClass z ___active___ na ___open___.

## API Reference:
Metody třídy __InfoBoxManager__:

- init() - spustí správu boxů při prvním načtení 

- refresh() - znovu načte prvky a nastaví event listenery (užitečné při dynamicky přidaném obsahu)

- destroy() - odpojí všechny eventy a smaže stav

- openElement(element) - otevře konkrétní info-box

- closeElement(element) - zavře konkrétní info-boxi
- closeAll() - zavře všechny otevřené boxy najednou

- toggleElement()element - přepne konkrétní info-box mezi otevřeným a zavřeným stavem

## Bezpečnostní poznámky:
Script kontroluje, zda prvek existuje (`if (!el) return`) a zabrání chybám při nepřítomnosti HTML elementu.

Kliky na odkazy uvnitř se správně izolují, aby se box nezavíral.

Kvůli IIFE (uzavření do anonymní funkce) se interní věci nedostávají do globálního scope.

## Příklad HTML:
```html
<div class="img-wrapper img-right-top">
    <picture>
        <source srcset="images/webp/system-mysl-ai.webp" type="image/webp">
        <img src="images/png/system-mysl-ai.png">
    </picture> 
    <div class="info-box" aria-hidden="true">
        <div class="icon-circle">i</div>
        <span>Zdroj: <a href="https://deepai.org/machine-learning-model/text2img" target="_blank" tabindex="-1">DeepAI</a></span>
    </div>
</div>

```

Po kliknutí nebo tapnutí na ikonu se info-box otevře. Kliknutím nebo tapnutím mimo něj se zavře.

## Další informace:
Pro přístup k aktuálnímu kódu navštivte https://github.com/gazmichaela/biology/. Tento repozitář obsahuje zdrojový kód, příklady použití a dokumentaci k projektu. Můžete zde také nahlásit chyby nebo navrhnout vylepšení.


__Autor:__ Michaela Gažová

__Reviewer (documentation & JSDoc):__ Daniel Friedl

__Verze:__ 2.0.2

__Datum:__ 2026-05-08