# questions.js

## Úvod
Tento script řeší interaktivní zobrazení otázek a odpovědí (FAQ) na webu. Hlavním cílem je umožnit uživateli pohodlně zobrazit nebo skrýt seznam otázek a jednotlivé odpovědi.

Otázky jsou obvykle zobrazeny jako tlačítka (`.question`), po jejichž kliknutí se zobrazí související odpověď (`.answer`).

## Jak to funguje:
Po načtení stránky (`DOMContentLoaded`) script: 

- Vyhledá tlačítko pro zobrazení/skrývání všech otázek (`#toggle-questions-btn`) a kontejner obsahující otázky (`#faq-container`).

- Nastaví klikací event listener na tlačítko, který přepíná viditelnost celého kontejneru.

- Resetuje stav všech odpovědí při zavření FAQ, aby se při dalším otevření začínalo z čistého stavu.

- Přidá klikací event listenery na jednotlivé otázky (`.question`), aby jejich odpovědi (`.answer`) mohly být zobrazeny nebo skryty nezávisle.

## Požadavky a kompatibilita:
- JavaScript ES6+

- Funguje bez externích knihoven

- Testováno v:

    - Chrome (139.0.7258.67),

    - Firefox (141.0.3),

    - Edge (139.0.3405.102)

## Požadavky na HTML:
Script očekává určitou strukturu:

- Tlačítko pro zobrazení/skrytí FAQ s __id__ `#toggle-questions-btn`.

- Kontejner všech otázek s __id__ `#faq-container`.

- Každou otázku s třídou `.question` a její odpověď ihned následující s třídou `.answer`.

Odpovědi mohou být na začátku skryté pomocí CSS (`display: none;`).

## Proč není použité OOP? 
Na rozdíl od komplexnějších scriptů (např. správa navigace) není potřeba udržovat složitý stav ani vytvářet třídy.

Každý prvek má jasný a izolovaný úkol: kliknutí na otázku odhalí nebo skryje odpověď, tlačítko ovládá zobrazení celého seznamu otázek.

Použití jednoduchého funcionálního zápisu na rozdíl od objektově orientovaného programování zajišťuje:

- kratší a přehlednější kód,

- snadnou údržbu,

- ždnou zbytečnou složitost.

## Instalace:
Do HTML vložte:

```html
<script src="question.js"></script>
```

Script se spustí automaticky po načtení stránky.

## Použití:
Pro úpravu parametrů, jako je změna způsobu zobrazení odpovědi, upravte:

```javascript
answer.style.display = "none";
```
například změnou answer.style.diplay z ___none___ na ___block___

## API Reference:
Tento script nepoužívá žádné API, komponenty fungují prostřednictvím event listenerů.

Veškerá logika probíhá automaticky po načtení stránky.

## Bezpečnostní poznámky:
Script kontroluje, zda existuje tlačítko a kontejner FAQ, aby se zabránilo chybám.

Díky použití requestAnimationFrame se event listenery natavují až po vykreslení DOM a CSS, čímž se minimalizuje vizuální skákání elementů.

Interní proměnné zůstávají uzavřené v anonymní funkci a nekolidují s ostatními scrioty.

## Příklad HTML:
```html
<div id="faq-container" class="hidden">
    <div class="faq-item">
        <div class="question" title="Kliknutím lze zobrazit/skrýt odpověď na tuto otázku."> Co je systémový celek a jak vzniká?</div>
        <div class="answer">Systémový celek vzniká propojením jednotlivých prvků, které spolu interagují a vytvářejí nové vlastnosti – celek je více než součet částí.</div>
    </div>

    <div class="faq-item">
        <div class="question" title="Kliknutím lze zobrazit/skrýt odpověď na tuto otázku.">Co je to subsystém a jaký má vztah k celku?</div>
        <div class="answer">Subsystém je menší část většího systému, která má vlastní strukturu a funkci – více subsystémů dohromady tvoří celý systém.</div>
    </div>
</div>
```

## Další informace:
Pro přístup k aktuálnímu kódu navštivte https://github.com/gazmichaela/biology/. Tento repozitář obsahuje zdrojový kód, příklady použití a dokumentaci k projektu. Můžete zde také nahlásit chyby nebo návrhnout vylepšení.

__Autor:__ Michaela Gažová

__Reviewer (documentation & JSDoc):__ Daniel Friedl

__Verze:__ 2.0.0

__Datum:__ 2025-08-19