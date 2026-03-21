# focus-outline.js

## Úvod
Tento script řeší zobrazování focus-outline na webu.
Hlavním cílem je zajistit, aby se zvýraznění prvků ve focusu zobrazovalo pouze při navigaci pomocí klávesnice, a nikoliv při kliknutí myší.

Outline je vizuální zvýraznění prvku (např. odkazu nebo tlačítka), které pomáhá uživateli poznat, na kterém elementu se právě nachází při navigaci pomocí klávesy __TAB__.

## Jak to funguje:
Po načtení stránky (`DOMContentLoaded`) script inicializuje sledování způsobu ovládání stránky.

Pokud uživatel klikne myší (`mousedown`), přidá se na `<body>` třída `using-mouse`.

Pokud uživatel použije klávesnici (`keydown`), tato třída se odstraní.

V __CSS__ pak lze podle přítomnosti této třídy řídit, zda se zobrazí zvýraznění prvku (outline), nebo ne.

Script zároveň kontroluje, zda už nebyl spuštěn dříve, aby nedošlo k vícenásobné inicializaci.

## Požadavky a kompatibilita:
- JavaScript ES6+

- Funguje bez externích knihoven

- Testováno v:

    - Chrome (146.0.7680.80),

    - Firefox (148.0.2),

    - Edge (146.0.3856.59)

## Požadavky na HTML:
Script nevyžaduje žádnou speciální HTML strukturu.

Stačí, aby byly na stránce běžné __interaktivní prvky__ (např. odkazy, tlačítka nebo formulářová pole), které mohou získat focus.

Pro správnou funkčnost je, ale potřeba mít odpovídající pravidla v CSS.

__Například:__

```css
body.using-mouse *:focus,
body.using-mouse *:focus-visible {
  outline: none;
}
```

Díky tomu se focus-outline skryje při ovládání myší, ale zůstane viditelný při navigaci klávesnicí.

## Proč není použité OOP?
Na rozdíl od komplexnějších scriptů (např. pro správu navigace) zde není potřeba pracovat se stavem nebo složitější logikou.

Script pouze sleduje způsob ovládání stránky (myš vs. klávesnice) a podle toho přidává nebo odebírá CSS třídu.

Proto je jednodušší použít krátký funkcionální zápis.

Použití objektově orientovaného programování by zde bylo zbytečné a přineslo by více struktury, než je pro tuto jednoduchou funkci potřeba.

## Instalace:
Do HTML vložte: 

```html
<script src="focus-outline.js"></script>
```

Script se spustí automaticky po načtení stránky.

## Použití
Není potřeba žádná ruční inicializace.

Script automaticky sleduje události `mousedown` a `keydown` a podle nich upravuje třídu na `<body>`.

Pro úpravu chování je možné změnit CSS pravidla pro focus.

Pro změnu chování například upravte:

```css
body:not(.using-mouse) *:focus,
body:not(.using-mouse) *:focus-visible {
  outline: black solid 2px;
  outline-offset: 2px;
}
```

Lze tedy snadno upravit vzhled focus-outline podle designu stránky.

## API Reference:
Tento script je navržen minimalisticky - obsahuje pouze interní inicializační funkci:

- `initFocusOutline()` - spustí sledování způsobu ovládání stránky.

Script se automaticky spustí při načtení stránky.

## Bezpečnostní poznámky:
Script kontroluje, zda už byl inicializován (`document.body.dataset.mouseKeyboardTracking`), takže nedojde k vícenásobnému spuštění.

Interní proměnné jsou uzavřeny v IIFE (anonymní funkci), takže se nedostanou do globálního scope a nekolidují s ostatními scripty na stránce.

## Další informace:
Pro přístup k aktuálnímu kódu navštivte https://github.com/gazmichaela/biology/. Tento repozitář obsahuje zdrojový kód, příklady použití a dokumentaci k projektu. Můžete zde také nahlásit chyby nebo navrhnout vylepšení.

__Autor:__ Michaela Gažová

__Reviewer (documentation & JSDoc):__ Daniel Friedl 

__Verze:__ 1.2.1

__Datum:__ 2026-03-15