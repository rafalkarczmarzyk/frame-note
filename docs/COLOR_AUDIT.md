# Audyt kolorów FrameNote

Stan: 24 października 2026. Audyt źródeł bieżącego drzewa roboczego przed
refaktorem tokenów. Zakres: `src/index.css` i produkcyjne komponenty `src`;
klasy przezroczystości policzono bez stories i testów. Nie obejmuje zdjęć,
wygładzania fontów, interfejsu samego Storybooka ani kolorów systemowych przeglądarki.

## Wyniki

| Kategoria                                      | Liczba | Znaczenie                                                |
| ---------------------------------------------- | -----: | -------------------------------------------------------- |
| Unikalne kolory bazowe HEX                     |      5 | Wszystkie zdefiniowane w `@theme` w `src/index.css`      |
| Tokeny kolorów/powierzchni/cieni w `:root`     |     23 | Zawierają aliasy; nie oznacza to 23 różnych kolorów      |
| Mapowania kolorów w `@theme inline`            |     16 | Udostępniają dotychczasowe role jako utilities Tailwinda |
| Wystąpienia `color-mix()`                      |     34 | Definicje tokenów i lokalne reguły komponentów           |
| Unikalne receptury `color-mix()`               |     29 | Po normalizacji białych znaków, bez rozwijania aliasów   |
| Unikalne klasy koloru z opacity w komponentach |     11 | 10 poziomów opacity; niezależnie od CSS `color-mix()`    |

Tych liczb nie należy sumować: część pozycji reprezentuje ten sam kolor lub
nakłada się na inne kategorie. Liczba końcowych kolorów pikseli nie jest stała:
gradienty, rozmycie, przejścia i mieszanie ze zdjęciem tworzą dodatkowe odcienie.

## Paleta bazowa

| Token          | Wartość | Obecne zastosowanie                                     |
| -------------- | ------- | ------------------------------------------------------- |
| charcoal       | #383F51 | Tło aplikacji, header, sidebar, baza dodatkowego panelu |
| charcoal-dark  | #292E3B | Obszar wokół zdjęcia                                    |
| charcoal-light | #454E64 | Tło accordionów                                         |
| porcelain      | #FDFFFC | Tekst, ikony, uchwyt slidera i źródło rozjaśnień        |
| slate          | #9CAFB7 | Primary, slider fill, akcent i część obramowań          |

Nie znaleziono dodatkowych literalnych kolorów HEX/RGB/HSL w produkcyjnych
komponentach TS/TSX. `currentColor` ikon dziedziczy kolor tekstu; sam nie rozszerza
palety. Systemowe `ButtonText` i `Highlight` w forced-colors służą dostępności.

## Główne źródła rozbieżności

- `primary`, `secondary`, `accent` i `warning` wskazują ten sam slate, choć ich
  nazwy sugerują różne role. `destructive` wskazuje zwykły kolor tekstu.
- Pola i neutralne przyciski współdzielą `control-surface` i `control-hover`.
  Zmiana inputów może przez to zmieniać przyciski. Potrzebują niezależnych aliasów
  zastosowań, nawet jeśli początkowo mają identyczne wartości.
- Tekst pomocniczy korzysta z 48%, 50%, 55%, 65%, 70%, 75% i 80% jasnego tekstu,
  częściowo z CSS, a częściowo z klas. Różnice są często zbyt małe, by uzasadniały
  osobne stany wizualne.
- Cienie mają lokalne mieszanki 30%, 35%, 40%, 45% i 65%. Nie są sterowane jedną
  skalą cieni; panel ma dodatkowo cień Tailwinda obok własnego cienia szkła.
- Wykończenia gradientów, obramowania i focus zawierają lokalne `color-mix()`.
- Przezroczysty panel i menu tworzą odcienie zależne od zdjęcia pod spodem.
  Ich tło, opacity i blur muszą być kontrolowane razem jako materiał.

Klasy opacity w komponentach: `bg-background/30`, `bg-foreground/5`,
`bg-secondary/15`, `border-foreground/15`, `shadow-background/40`,
`text-foreground/35`, `text-foreground/50`, `text-foreground/55`,
`text-foreground/70`, `text-foreground/75`, `text-foreground/80`.

## Docelowe ograniczenia

1. Zachować 5 bazowych kolorów. Nie dodawać nowej palety w tym refaktorze.
2. Oddzielić paletę od tokenów zastosowań: `input-base`, `accordion-base`,
   `sidebar-base`, `panel-base`, `button-primary-base`, `segment-selected` itd.
   Kilka ról może wskazywać tę samą wartość bez tworzenia nowego odcienia.
3. Udostępnić role w `@theme inline`, np. `--color-input-base`, aby komponent
   mógł użyć `bg-input-base` i `text-input-text`.
4. Przenieść wszystkie mieszanki do definicji tokenów. Komponenty nie powinny
   dobierać własnych procentów przez `bg-foreground/…` czy `text-foreground/…`.
5. Po zachowującym wygląd przepięciu ujednolicić kolory wtórne: jedna rola etykiet,
   jedna tekstu pomocniczego i jedna placeholder/disabled (zależnie od czytelności).
6. Ujednolicić cienie i refleksy jako tokeny efektów, osobno od kolorów tła.
   Przezroczystość chwytu slidera zachować jako świadomy stan interakcji.
7. Kolory podpisu na zdjęciu utrzymać niezależnie od tokenów UI. Obecne opcje to
   porcelain, charcoal i slate. Refaktor nazewnictwa nie może zmienić pikseli eksportu.

## Kolejność wdrożenia

- Najpierw nadać nazwy zastosowań i przepiąć komponenty bez zmiany wyglądu.
- Następnie przedstawić do oceny redukcję podobnych odcieni i poziomów opacity.
  Scalenie ich wymaga niewielkich zmian wyglądu; nie jest neutralnym przemianowaniem.
- W Storybooku pokazać paletę bazową, powierzchnie według użycia i stany kontrolek.
- Kontrolować brak nowych literalnych kolorów poza paletą oraz brak lokalnych
  mieszanek i przypadkowych opacity w komponentach. Nie blokować opacity fotografii,
  podpisu ani stanów disabled, które nie są nowymi kolorami bazowymi.
- Po refaktorze powtórzyć pomiar receptur, sprawdzić stories i regresję eksportu.

## Wynik wdrożonego refaktoru

| Miara                                           | Przed |  Po |
| ----------------------------------------------- | ----: | --: |
| Kolory bazowe HEX                               |     5 |   5 |
| Unikalne receptury `color-mix()`                |    29 |  13 |
| Wystąpienia `color-mix()`                       |    34 |  13 |
| Mieszanki poza definicjami tokenów              |    26 |   0 |
| Klasy kolorów z lokalnym opacity w komponentach |    11 |   0 |

Tekst pomocniczy i etykiety współdzielą poziom 70%, a placeholdery i przygaszone
ikony 50%. Wspólne obramowania i refleksy korzystają z jednej receptury 16%; cienie
z jednej receptury 40%. Zachowano oddzielną przezroczystość uchwytu slidera w czasie
chwytu. Panel i menu dzielą jedną recepturę szkła 98% z nieprzezroczystym fallbackiem.

Tokenów zastosowań jest więcej niż wcześniej, ale są to głównie aliasy do tego
samego, mniejszego zestawu receptur. Inputy i przyciski mają niezależne nazwy.
`pnpm check:tokens` pilnuje granic palety, receptur, lokalnego opacity i deklaracji
zmiennych; działa też w `pnpm check`.

Pierwotny audyt był tylko odczytem. Powyższa sekcja opisuje późniejsze, zatwierdzone
wdrożenie uproszczeń.
