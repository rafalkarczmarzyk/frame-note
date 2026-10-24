# FrameNote

Lokalny edytor podpisów fotograficznych. React + TypeScript + Vite + Tailwind CSS.

## Status: etap 5 — stylowanie i pozycja (do akceptacji)

Gotowe: import jednego JPG, podgląd canvas, odczyt i wyszukiwanie metadanych, szablon podpisu z tokenami i podstawowy eksport. Każdy etap czeka na ocenę użytkownika przed przejściem dalej.

## Uruchomienie

Node.js: wersja wskazana w `.nvmrc` (lub zgodna z wymaganiami zależności).

```sh
pnpm install --frozen-lockfile
pnpm dev
```

## Kontrole

```sh
pnpm check
pnpm exec playwright install chromium
pnpm test:e2e
```

`check` obejmuje formatowanie, ESLint, typy, testy jednostkowe i build. E2E uruchamia własny serwer. Test bootstrapu sprawdza załadowanie aplikacji i błędy przeglądarki; pełny przepływ i regresja wizualna eksportu powstaną razem z eksportem.

Pozostałe polecenia: `lint:fix`, `format`, `test:watch`, `test:e2e:ui`, `preview`.

## Struktura

- `src/components/ui` — komponenty UI zgodne z konfiguracją shadcn/ui.
- `src/lib` — współdzielone funkcje i testy jednostkowe.
- `e2e` — testy Playwright.

Zdjęcia testowe i logika domenowa będą dodawane w następnych etapach. Konva i ExifReader są zainstalowane, ale nie są jeszcze używane przez ekran bootstrapu.

## Ustalony układ interfejsu

Ciemny motyw. Stały header z logotypem SVG i miejscem na opcjonalne linki. Przed wczytaniem zdjęcia: centralny obszar drag & drop z przyciskiem wyboru pliku. Po wczytaniu (kolejny etap): przestrzeń robocza wypełniająca obszar pod headerem, canvas ze zdjęciem i sidebar narzędzi po prawej. W stanie początkowym sidebar jest ukryty. Docelowo import wielu zdjęć; pre-MVP obsługuje jedno.

Podgląd lokalny: http://localhost:3000. Port jest stały; zajęty port powoduje błąd zamiast cichego przełączenia. Testy E2E korzystają z osobnego portu 4173.

## Logo i ikony

Logo jest komponentem inline SVG `FrameNoteLogo` w `src/components/brand`. Zachowuje krzywe dostarczonego znaku, ma `viewBox` i używa `currentColor`. Rozmiar i kolor ustawiamy przez `className`, np. `<FrameNoteLogo className="h-8 w-auto text-primary" />`. Standardowe właściwości SVG są przekazywane do elementu głównego. Ikony Lucide również korzystają z `currentColor` i klas Tailwinda (`size-5 text-primary`). Nie osadzamy znaków wymagających stylowania jako `<img>`.

## Paleta i tokeny semantyczne

Wartości HEX deklarujemy tylko raz w `@theme` w `src/index.css`:

| Nazwa palety | HEX     | Rola                           |
| ------------ | ------- | ------------------------------ |
| slate        | #383F51 | background, card, ciemny tekst |
| porcelain    | #FDFFFC | foreground, primary, ring      |
| mist         | #9CAFB7 | secondary, accent, border      |

Na obecnym etapie dostępne są wyłącznie te cztery kolory. Role `warning` i `destructive` korzystają z tej samej palety; nie mają osobnych barw.

Komponenty korzystają z ról, np. `bg-primary`, `bg-secondary`, `text-secondary-foreground`, `text-foreground`. Navbar i stan przeciągania używają `secondary` i `secondary-foreground`. Nazwy palety opisują kolory; tokeny semantyczne ich zastosowanie. Nie dodajemy HEX-ów w komponentach ani własnych odcieni.

## Typografia

`font-display`: Advercase Regular/Bold z archiwum użytkownika, lokalne WOFF2 w `public/fonts/advercase`. Font ozdobny dla nagłówków. Archiwum nie zawierało pliku licencji; zachowujemy informację o źródle.

`font-sans`: Montserrat Variable z `@fontsource-variable/montserrat`, dołączany do builda lokalnie, dla interfejsu i przycisków. Logotyp SVG zachowuje dostarczone krzywe i nie zależy od fontów.

## Model pre-MVP

`src/domain` zawiera model zdjęcia, pojedynczego podpisu i metadanych. Bez zależności od Reacta, Konvy lub ExifReader. Grupa i nazwa identyfikują pole (`exif:Artist`); zachowujemy wartość surową oraz tekst do wyświetlenia. Lista grup pozostaje otwarta.

Rozmiar fontu i oba marginesy zapisujemy jako ułamkowe procenty krótszego boku zdjęcia. Interlinia jest mnożnikiem fontu, opacity mieści się docelowo w zakresie 0–1. Kolor wskazuje nazwę palety zamiast HEX-a. Domyślne ustawienia są punktem startowym do późniejszej iteracji interfejsu. Model dokumentu nie przechowuje obiektów File, adresów blob ani elementów canvas; zasoby przeglądarki będą obsługiwane oddzielnie.

`tests/fixtures.ts` udostępnia przenośną ścieżkę, oczekiwane wartości i sumę oryginalnego JPG. Test kontroluje niezmienność pliku. Testy odczytu ExifReader pojawią się wraz z adapterem w etapie 3, testy tokenów w etapie 4, geometrii w etapie 5. Nie wdrożono jeszcze importu, parsera szablonu ani renderowania podpisu.

## Etap 3

Przycisk i drag & drop otwierają jeden JPG. Sprawdzamy sygnaturę pliku, dekodujemy zdjęcie w przeglądarce i czytamy EXIF/IPTC/XMP/ICC przez ExifReader. Canvas dopasowuje zdjęcie do obszaru pod headerem, a prawy panel pozwala wyszukiwać pola i wartości. Wartości wyświetlamy jako tekst, bez interpretowania HTML. Obiekty URL są zwalniane przy wymianie zdjęcia i zamknięciu widoku, a spóźnione importy nie zastępują nowszych. Błąd wymiany pozostawia poprzednie zdjęcie.

Sprawdzone E2E: import oryginalnego JPG, render obrazu w canvasie, pola EXIF i XMP, wyszukiwanie, drop i błędna wymiana. Edycja podpisu, wstawianie tokenów i eksport pozostają na etap 4. ExifReader i canvas są ładowane na żądanie.

## Etap 4

Jeden wieloliniowy szablon z tokenami `{group:name}`. Kliknięcie pola wstawia token w pozycji kursora (lub zastępuje zaznaczenie). Brakujące pola są raportowane, a puste linie usuwane. Eksport nierozwiązanych tokenów wymaga potwierdzenia. Metadane są traktowane jak tekst.

Podgląd i eksport używają wspólnej geometrii Konva: Montserrat, 1,35% krótszego boku, lewy dolny róg i marginesy 3%. Kontrolki stylu i anchorów pozostają na etap 5. Eksport JPG ma oryginalne wymiary i jakość 0,95, nazwę `*-framenote.jpg`. Font jest ładowany przed renderowaniem. Na tym etapie metadane nie są kopiowane, a zachowanie źródłowego profilu kolorów nie jest zapewnione; eksport przeglądarkowy ponownie koduje zdjęcie.

Testy: unity tokenów, brakujących pól, składni i geometrii; jeden funkcjonalny E2E od importu do pobranego JPG, z kontrolą wymiarów i obecności tekstu w pikselach. To nie jest jeszcze regresja wizualna z zaakceptowanym wzorcem (etap 6). Wcześniejsze testy zależne od szczegółów UI zostały zastąpione tym przepływem.

## Etap 5

Kontrolki: Montserrat/Advercase Regular/Bold, rozmiar jako ułamkowy procent krótszego boku, cztery kolory palety, przezroczystość, interlinia, wyrównanie, dziewięć anchorów i dwa marginesy względne. Anchor pozycjonuje rzeczywiście zmierzony blok; wyrównanie dotyczy linii wewnątrz bloku. Zmiana anchora przenosi blok do wskazanego punktu. Dla środkowej osi margines na tej osi jest pomijany.

Wspólne pomiary tekstu i geometria są używane w podglądzie i eksporcie. Font jest ładowany przy zmianie rodziny lub grubości. Ustawienia są na razie przypisane do bieżącego zdjęcia; wymiana zdjęcia przywraca domyślne. Bardzo długi podpis może wyjść poza kadr i zostać przycięty; nie wprowadzamy automatycznego zmniejszania ani zawijania tekstu. Zoom i pan pozostają poza tym etapem.

### Iteracja paneli

Eksport jest w navbarze. Przycisk na stałym dole panelu ustawień otwiera osobny panel tagów po jego lewej stronie. Lista tagów ma własny scroll, niezależny od ustawień. Edytor zapamiętuje kursor i zaznaczenie przy opuszczeniu pola, także na czas wyszukiwania; wstawienie zastępuje zaznaczenie i aktualizuje pozycję następnego wstawienia. Obecność dokładnego tokenu w szablonie oznacza tag jako Used i nadaje mu kolor primary.
