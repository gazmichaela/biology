# img-zoom.js

## Úvod
Tento script řeší interaktivní zvětšení obrázků na webu. Po kliknutí nebo dotyku se obrázek otevře v modálním okně, kde je možné jej přibližovat, posouvat a zobrazit zdroje. Podporuje desktop i mobilní zařízení a automaticky přizpůsobuje ovládání podle zařížení.

## Jak to funguje:
`ModalImageViewer` sleduje všechny obrázky s třídou `.zoomable` a při rozkliknutí je zobrazuje v modálním okně.

Script zvládne:

- zvětšit (rozkliknout) obrázek na stránce kliknutím nebo tapem (tj.vytvořit modál),

- přiblížit zvětšený (rozkliknutý) obrázek kliknutím (pouze desktop)

- posouvat přiblížený obrázek tažením myší,

- zavřít modál kliknutím mimo obrázek nebo kliknutím na křížek,

- dynamicky přizpůsobit pozici textu zdroje (`data-source`) podle velikosti okna,

- přizpůsobit zoom faktor velikosti obrázku.

Pokud modální elementy neexistují, script je vytvoří automaticky.

## Požadavky a kompatibilita
- JavaScript ES6+

- Funguje bez externích knihoven

- Testováno v:

    - Chrome (139.0.7258.67),

    - Firefox (141.0.3),

    - Edge (139.0.3405.102)

## Požadavky na HTML: 
Script očekává určitou strukturu: 

- Obrázky s třídou `.zoomable`

- Volitelné atributy:

    - `data-full` - URL pro plnou verzi obrázku

    - `data-fallback` - fallback obrázek

    - `data-source` - text zdroje obrázku

## Proč OOP? 
Některé mé scripty jsou napsané jen jako funkce.

Tady ale dává smysl použít třídu `ModalImageViewer` objektově orientovaného programování, protože:

- Viewer má stav (aktuálně zvětšený obrázek, pozice, měřítko, stav pro tažení), který je třeba sledovat individuálně pro každý obrázek.

- Logika je složitější, obsahuje desktopové i mobilní chování, zoom, drag, preload obrázků a modální strukturu, které spolu úzce souvisí.

- Za pomocí objektově orientovaného přístupu lze snadno přidávat metody jako `refresh()` nebo `destroy()` bez zásahu do globálního scope.

Díky tomu je kód přehlednější, udržovatelnější a snadněji rozšiřitelný pro případné budoucí funkce (např. nové typy interakcí s obrázky).

## Instalace:
Do HTML vložte:

```html
<script src="img-zoom.js"></script>
```

Script se automaticky inicializuje po načtení stránky (je nutné mít u obrázků `.zoomable`).

## Použití:
Pro ruční ovládání modálního okna slouží:

```javascript
openModal(imgSrc, sourceText, thumbSrc, fallbackSrc);  
closeModal();                                         
refreshModalViewer(); 
```

Pro jiné nastavení si můžete vytvořit vlastní instanci:

```javascript
class ModalImageViewer {
  constructor(options) {
    options = options || {};
    this.zoomFactor = options.zoomFactor || 2.5;           
    this.debounceDelay = options.debounceDelay || 100;    
    this.transitionDelay = options.transitionDelay || 50;  
    
    this.selectors = {
      zoomableImages: options.imageSelector || 'img.zoomable', 
      modal: options.modalSelector || '.modal-image-viewer', 
      ...další
    };
  };
};
```
například změněním hodnoty ___100___ u debounceDelay na ___200___.

## API Reference:
Metody třídy `ModalImageViewer`:

- init() – spustí a nastaví modální viewer.

- openModal(imgSrc, sourceText, thumbSrc, fallbackSrc) – otevře modál s obrázkem.

- closeModal() – zavře modální okno.

- resetZoom() – vrátí obrázek do výchozího stavu (bez zoomu a posunu).

- refresh() – znovu načte obrázky a nastaví event listenery.

- destroy() – odstraní modál, všechny eventy a resetuje stav.

Interní metody:

- _createModalStructure() – vytvoří základní DOM strukturu modalu.

- _createElement(tag, options) – pomocná metoda pro rychlé vytváření elementů.

- _cacheElements() – uloží reference na elementy do `this.elements`.

- _setupImageListeners() – nastaví click listener pro všechny `.zoomable` obrázky.

- _setupModalEventListeners() – nastaví interakce uvnitř modálu.

- _handleZoomToggle(x, y) – rozhoduje o zoomu na základě současného stavu.

- _handleDrag(x, y) – posouvá přiblížený obrázek.

- _toggleSourceVisibility(visible) – skryje nebo zobrazí text zdroje.

- _updateSourceContainerLayout() – vypočítá nejlepší pozici textu zdroje.

- _zoomAtPoint(pointX, pointY) - provádí samotný zoom na konkrétní bod.

- _calculateBestLayout() -  určuje optimální umístění kontejneru se zdrojem obrázku.

- _getCorrectionFactors() - vrací korekční faktory pro různé rozměry obrázků.

## Bezpečnostní poznámky:
- Kód kontroluje existenci elementů (`if (!el) return`) a počítá s tím, že nemusí existovat.

- Každý obrázek má vlastní stav pro tažení, aby se eventy nemíchaly.

- Logika je uzavřená v IIFE (uzavření do anonymní funkce), interní proměnné nejsou dostupné v globální scope.

## Příklad HTML:
```html
<div class="img-wrapper img-next">
    <picture>
        <source srcset="images/webp/rostlinna-bunka-popis.webp" type="image/webp" data-src="images/webp/rostlinna-bunka-popis.webp"
            data-source="Autor: Michal Maňas – created by LadyofHats translated by Michal Maňas, Volné dílo, Wikimedia Commons">
        <img src="images/png/rostlinna-bunka-popis.png" data-src="images/png/rostlinna-bunka-popis.png" loading="lazy" class="zoomable" 
            alt="Schéma stavby rostlinné buňky s popisky jednotlivých částí buňky."
            data-source="Autor: Michal Maňas – created by LadyofHats translated by Michal Maňas, Volné dílo, Wikimedia Commons">
    </picture>
</div>
```

Po kliknutí se obrázek zobrazí v modálním okně, kde je možné ho přiblížit a posouvat.

## Další informace:
Pro přístup k aktuálnímu kódu navštivte https://github.com/gazmichaela/biology/. Tento repozitář obsahuje zdrojový kód, příklady použití a dokumentaci k projektu. Můžete zde také nahlásit chyby nebo navrhnout vylepšení.

__Autor:__ Michaela Gažová

__Reviewer (documentation & JSDoc):__ Daniel Friedl 

__Verze:__ 2.0.1

__Datum:__ 2026-04-05