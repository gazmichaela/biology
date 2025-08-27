# pdf.js

## Úvod
Tento script poskytuje komplexní správu PDF souborů přímo na webu. Umí zobrazit PDF v overlay okně, detekovat mobilní zařízení a nabídnout fallback možnosti (otevření v novém okně nebo stažení souboru), pokud prohlížeč PDF nepodporuje.

## Jak to funguje: 
`PdfViewerManager` spravuje jednotlivé PDF viewery - otevírání, zavírání, načítání a fallback logiku.

Zobrazuje PDF v overlay iframe.

Ukazuje loading indikátor během načítání.

Poskytuje fallback tlačítka pro mobilní a nepodporované prohlžeče.

Přizpůsobuje se responsivně pro mobilní zařízení. 

Podporuje swipy a klávesovou zkratku (ESC) pro zavření.

Obsahuje retry logiku při selhání načtení PDF.

Pro správu více PDF souborů se používá `PdfViewerManagerCollection`, který umožňuje přidávání, odebírání, správu všech PDF viewerů na stránce. 

## Požadavky a kompatibilita: 
- JavaScript ES6+

- Funguje bez externích knihoven

- Testováno v:

    - Chrome (139.0.7258.67),

    - Firefox (141.0.3),

    - Edge (139.0.3405.102)

## Požadavky na HTML:
Script očekává určitou strukturu HTML elementů:

- Tlačítko pro otevření PDF: `id="showBtnId"`

- Overlay (tmavé pozadí při otevření PDF): `id="overlayId"`

- Tlačítko pro zavření: `id="closeBtnId"`

- Iframe pro PDF: `id="frameId"`

## Proč OOP?
Některé mé scripty jsou napsané jen jako funkce. 

Tady ale dává smysl použití třídy (`PdfViewerManager`) objektově orientovaného programování, protože:

- Každý PDF viewer má svůj vlastní stav (otevřeno, počet pokusů pro refresh, fallback zobrazení).

- Jednoduché přidávání nových metod jako __refresh()__ nebo __destroy()__. 

- Snadná správa více viewerů přes `PdfViewerManagerCollection`.

Díky tomu je kód udržovatelnější a modulární. 

## Instalace:
Do HTML stačí vložit: 

```html
<script src="pdf.js"></script>
```

Po načtení stránky se PDF viewery inicializují automaticky podle definované konfigurace.

## Použití: 
Pro ruční ovládání slouží:

```javascript
openAllPdfViewers();
closeAllPdfViewers();
refreshAllPdfViewers();
getPdfViewersState();
pdfViewerCollection.getViewer("Darwin").openPdfViewer(); 
pdfViewerCollection.getViewer("Origin of Life").openPdfViewer();
pdfViewerCollection.getViewer("Presah").openPdfViewer();
```

Pro vlastní konfiguraci upravte:

```javascript
const pdfViewers = [
  {
    showBtnId: "showPdfBtn",
    overlayId: "pdfOverlay", 
    closeBtnId: "pdfCloseBtn",
    frameId: "pdfFrame",
    pdfPath: "pdf/darwin.pdf",
    viewerName: "Darwin",
  }
];
```
například změněním u pdfPath ___"pdf/darwin.pdf"___ na jinou cestu, kterou používáte.

## API Reference:
Metody třídy __PdfViewerManager__:

- init() - inicializuje viewer a binduje eventy

- openPdfViewer() - otevře overlay s PDF

- closePdfViewer() - zavře overlay a resetuje stav

- retryLoad() - zkusí znovu načíst PDF

- retryFromFallback() - retry z fallback možností

- refresh() - znovu načte elementy a binduje eventy

- destroy() - odpojí všechny eventy a odstraní viewer ze stránky

- getState() - vrátí aktuální stav vieweru

Metody třídy __PdfViewerManagerCollection__:

- initializeViewers(configs) - inicializuje více viewerů

- getViewer(name) - získá konkrétní viewer podle jména

- getAllViewers - vrátí všechny viewery

- getAllStates() - vrátí stav všech viewerů

- closeAllViewers() - zavře všechny viewery

- refreshAllViewers() - refresh všech viewerů

- destroyAllViewers() - odstraní všechny viewery

- addViewer(config) - přidá nový viewer

- removeViewer(name) - odstraní viewer podle jména

## Bezpečnostní poznámky:
Kontroly existujících elementů (`if (!el) return`) zabraňují chybám při chybějícím HTML.

Každá instance má vlastní retry logiku a timeouty.

Eventy jsou pečlivě odpojeny při __destroy()__, aby nedocházelo k memory leak. 

Díky IIFE (uzavření do anonymní funkce) se interní proměnné a metody nedostávají do globálního scope.

## Příklad:
```html 
<div class="pdf-overlay" id="presahPdfOverlay">
  <div class="pdf-viewer-container">
    <div class="pdf-close-button" id="presahPdfCloseBtn">&times;</div>
    <iframe class="pdf-iframe" id="presahPdfFrame"></iframe>
  </div>
</div> 
```

## Další informace:
Pro přístup k aktuálnímu kódu navštivte https://github.com/gazmichaela/biology/. Tento repozitář obsahuje zdrojový kód, příklady použití a dokumentaci k projektu. Můžete zde také nahlásit chyby nebo navrhnout vylepšení. 

__Autor:__ Michaela Gažová

__Reviewer (documentation & JSDoc):__ Daniel Friedl

__Verze:__ 2.2.0

__Datum:__ 2025-08-25