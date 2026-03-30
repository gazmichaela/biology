# tooltips.js

## Úvod
Tento script řeší inicializaci tooltipů na webu.
Hlavním cílem je zabránit jejich problikávání při načítání stránky a také zajistit, aby se tooltipy plynule a spolehlivě zobrazovaly. Tooltipy jsou malá vyskakovací okna, ve kterých je (nejčastěji) popsán význam daného slova (samozřejmě mohou být použity pro jiný účel). Taková slova jsou na stránce zvýrazněná a po najetí myší na ně se zobrazí daný tooltip.

## Jak to funguje:
Po načtení stránky (`DOMContentLoaded`) script vyhledá všechny prvky s třídou `.tooltip`, `.tooltioptext`.

Každému z nich nastaví základní CSS přechod a záložní animaci, čímž eliminuje vizuální problémy (jako je probliknutí, které by se mohlo objevit při čistém CSS řešení).

Navíc se přidá pomocná třída `tooltiptext--ready`, která může být využita v CSS k dalšímu doladění chování tooltipů.

## Požadavky a kompatibilita:
- JavaScript ES6+ 

- Funguje bez externích knihoven

- Testováno v:
 
    - Chrome (139.0.7258.67),
    
    - Firefox (141.0.3),

    - Edge (139.0.3405.102)

## Požadavky na HTML:
Script očekává určitou strukturu:
- Tooltipový kontejner s třídou `.tooltip` (např. `<dfn class="tooltip">`).
- Vnořený element s třídou `.tooltiptext`, který obsahuje text __tooltipu__.

Tooltip může být aplikován na text, tlačítko nebo jiný interaktivní prvek.

## Proč není použité OOP?
Na rozdíl od komplexnějších scriptů (např. pro správu navigace) zde není potřeba udržovat stav ani pracovat s více variantami logiky.

Tooltipy mají pouze jeden úkol - správně se vykreslit po načtení stránky. 

Proto je jednodušší a přehlednější použít prostý funkcionální zápis.

Kód je krátký a snadno čitelný, snáze se udržuje a neobsahuje zbytečnou strukturu.

Použití objektově orientovaného programování by zde bylo nadbytečné a přineslo by více složitosti než užitku.

## Instalace:
Do HTML vložte: 

```html
<script src="tooltips.js"></script>
```

Script se spustí automaticky po načtení stránky.

## Použítí
Pro ruční inicializaci tooltipů (např. po dynamickém vložení HTML) slouží:

```javascript
initTooltips();
```

Pro jiná nastavení upravte:

```javascript
el.style.animation = "none";
el.style.transition = "opacity 0.3s ease";
```
například změnou el.style.transition z ___opacity 0.3s ease___ na ___opacity 0.5s linear___.

Po najetí kurzorem na dané slovo se tooltip zobrazí a po odjetí kurzoru zmizí. Veškeré přechody a animace jsou řízeny kaskádovými styly, script pouze inicializuje tooltipy a zabraňuje vizuálním problémům při načtení.

V CSS zůstává nastavení animace jako fallback pro případ, kdyby JS nebyl povolen.

## API Reference:
Tento script je navržen minimalisticky - obsahuje pouze jednu veřejnou metodu:

- initTooltips() - spustí inicializaci a správu tooltipů.

Veškerá základní logika probíhá automaticky při načtení stránky.

Pokud je potřeba rozšířit funkcionalitu, lze to udělat pouze úpravou kaskádových stylů nebo doplněním vlastních event listenerů.

## Bezpečnostní poznámky:
Script kontroluje, zda existují nějaké tooltipy (`if (!tooltipTexts.length) return;`), takže se nespustí zbytečně a nezatěžuje prohlížeč.

Kvůli DOMContentLoaded listeneru a použití requestAnimationFrame se tooltipy inicializují až po vykreslení DOM a CSS, čímž se zabrání jejich problikávání. Interní proměnné zůstavají uzavřené a nekolidují s ostantími scripty na stránce.

## Příklad HTML:
```html
<p>Základním principem kybernetických systémů je schopnost zpracovávat informace a používat je k dosažení cílů systému prostřednictvím <dfn class="tooltip">autonomní regulace<span class="tooltiptext">systém se sám rozhoduje <br> a upravuje své chování, <br> bez zásahu zvenčí</span></dfn></p>
```

## Další informace:
Pro přístup k aktuálnímu kódu navštivte https://github.com/gazmichaela/biology/. Tento repozitář obsahuje zdrojový kód, příklady použití a dokumentaci k projektu. Můžete zde také nahlásit chyby nebo navrhnout vylepšení.

__Autor:__ Michaela Gažová

__Reviewer (documentation & JSDoc):__ Daniel Friedl

__Verze:__ 2.2.0

__Datum:__ 2026-03-30