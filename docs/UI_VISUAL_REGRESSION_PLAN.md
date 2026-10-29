# Regresja wizualna interfejsu — plan

Data planu: 2026-10-28. Checkpoint: 2026-10-29.
**Status: praca niedokończona; zestaw jest niestabilny i nie stanowi jeszcze
wiarygodnej bramki regresji.**

- `pnpm test:visual --list`: 105 testów w profilu podstawowym.
- `pnpm test:visual --all-projects --list`: 268 testów we wszystkich profilach.
- Wcześniejszy przebieg generowania kandydatów przeszedł 214/214; późniejsze
  powtórzenia wykazały błędy i różnice. Nie jest to wynik aktualnej wersji zestawu.
- Ostatnia zmiana przebudowała sceny grafik na niezależne konfiguracje presetów.
  Sprawdzono typy; nie uruchomiono jeszcze ich nowych porównań wizualnych.
- Zapisane PNG są roboczymi kandydatami. Część pochodzi ze starszych wariantów
  scen i może nie odpowiadać aktualnym testom; nie traktować ich jako zaakceptowanych.
- Do dokończenia: zweryfikować nowe sceny grafik, uporządkować ich wzorce,
  usunąć przyczyny niestabilności i potwierdzić powtarzalność pełnego zestawu.
  Nie regenerować obrazów zbiorczo jako sposobu uzyskania zielonych testów.

Dalsza treść opisuje uzgodniony zakres i techniczne założenia, nie potwierdzenie
ukończenia ani przejścia wszystkich testów.

## Stan obecny

- Playwright uruchamia produkcyjny build w Chromium i WebKit.
- Istnieją wzorce eksportowanych JPG oraz testy zachowania i geometrii.
  Nie ma obecnie asercji `toHaveScreenshot` dla interfejsu.
- Storybook używa produkcyjnych komponentów. `Screens/TestPhotos` obejmuje
  zdjęcia, presety, wiele warstw, mieszane grafiki oraz tła Color/Glass.
  `Screens/PhotoSession` renderuje App i importuje serię zdjęć.
- Starsze propozycje w Storybooku nie zawsze odpowiadają wdrożonemu UI.
  Wybieramy jawny katalog scen produkcyjnych, nie wszystkie stories.
- Regresja UI uzupełnia `Photo export`; nie zastępuje testowania pobranego JPG.

## Co porównujemy

1. Całe widoczne okno: header, canvas, sidebar i rolka. Chroni proporcje,
   centrowanie, nakładanie paneli i dostępność akcji.
2. Duże obszary: Layers wraz z inspektorem; panel pomocniczy z fragmentem
   otoczenia; podgląd wraz z linijkami; rolka wraz z kasetą i tłem.
3. Kolejne stany po interakcji: otwarcie panelu, wybór elementu, scroll,
   zmiana zdjęcia, pojawienie się i zniknięcie rolki.

Screenshot całego okna oznacza viewport. `fullPage` nie ujawnia automatycznie
zawartości wewnętrznych przewijanych paneli. Dla inspektora robimy oddzielne
ujęcia góry i dołu po jawnym przewinięciu. Nie rozszerzamy sztucznie wysokości
aplikacji, bo ukryłoby to błędy występujące w normalnym oknie.

Duży obszar ma stałą ramę obejmującą otoczenie: samo przycięcie do ruchomego
elementu może nie wykryć jego przesunięcia. Pozycję względem sąsiadów chroni
ujęcie okna lub dodatkowa asercja geometrii.

## Odtwarzalne scenariusze

Każdy scenariusz dostaje ID, opis chronionego zachowania, stałe dane wejściowe,
konfigurację dokumentu, kroki interakcji, warunek gotowości i nazwane ujęcia.
Każdy uruchamia się niezależnie, w świeżym kontekście przeglądarki.

Używamy istniejących zdjęć z `tests/fixtures` oraz SVG i PNG z `logos`.
Przypisujemy zdjęcia do scenariuszy na stałe; bez losowych danych i zależności
od prywatnych plików użytkownika. Konfiguracje warstw są wersjonowane razem
z testami, zamiast polegać na zmieniających się domyślnych ustawieniach.
Osobne scenariusze celowo testują domyślne ustawienia i wbudowane presety.

Dwie ścieżki przygotowania:

- **Kompozycje:** dedykowane stories na produkcyjnych komponentach z zadanym
  dokumentem, zdjęciem i zasobami. Krótkie interakcje otwierają panel lub
  wybierają element. Te same sceny można otworzyć ręcznie do oceny.
- **Przejścia:** prawdziwa aplikacja, import przez pole pliku, kliknięcia
  w warstwy, przełączanie zdjęć i zamykanie paneli. Wspólne helpery wykorzystują
  role i etykiety. Nie opieramy każdego zdjęcia na długim łańcuchu klikania.

Preset może przygotować dokument, ale nie odtworzy otwartego panelu, aktywnego
elementu, scrolla, rolki ani ustawień eksportu. Te stany scenariusz ustawia jawnie.
Nie dodajemy publicznego API debugowania do produkcyjnej aplikacji.

## Katalog scenariuszy

Każdy wariant wymieniony w wierszu jest osobnym nazwanym ujęciem. Nie mnożymy
wszystkich wymiarów przez wszystkie zdjęcia, fonty i przeglądarki.

| ID    | Przygotowanie i działanie                                                          | Ujęcia / chroniony fragment                                           |
| ----- | ---------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| UI-01 | Otwórz aplikację z pustym magazynem                                                | Całe okno: pusty edytor, akcje, stopka, stan eksportu                 |
| UI-02 | Bez zdjęcia ustaw tekst i grafikę, następnie importuj wildlife                     | Okno przed i po: przygotowany dokument i pojawienie się podglądu      |
| UI-03 | Import wildlife, jawnie wybierz Default                                            | Całe okno poziomego zdjęcia, sidebar i linijki                        |
| UI-04 | Import portretu, wybierz Signature                                                 | Całe okno pionowego zdjęcia; centrowanie i skala                      |
| UI-05 | Jasne zdjęcie + Default dark; nocny portret + Astrophotography                     | Osobne ujęcia podglądu i kontrolek                                    |
| UI-06 | Rozwiń Photo info, Units & Margins oraz Export settings; przewiń sidebar           | Góra/dół sidebara, odstępy, granice sekcji i scroll                   |
| UI-07 | Ustaw minimalną i maksymalną dozwoloną szerokość sidebara                          | Okno w obu stanach; pola i przyciski bez niezamierzonego obcięcia     |
| UI-08 | Dodaj trzy warstwy z różną treścią, wybierz środkową                               | Lista i cały inspektor; zaznaczenie również na canvasie               |
| UI-09 | Ukryj warstwę; zmień kolejność dwóch nachodzących warstw                           | Lista oraz podgląd przed/po                                           |
| UI-10 | Dodaj 12 warstw z długim tekstem, ikoną, SVG i PNG; wybierz ostatnią               | Przewinięta lista i inspektor; miniatury, wielokropek, aktywny wiersz |
| UI-11 | Usuń wszystkie warstwy, następnie dodaj jedną                                      | Pusta i ponownie zapełniona sekcja Layers                             |
| UI-12 | Wstaw tekst z tokenami, ikoną, SVG, PNG, pustym wierszem i długą linią             | Content w kontekście inspektora; zawijanie edytora i badge            |
| UI-13 | Wybierz metadane: dostępne, znane bez wartości, nieznane; także bez zdjęcia        | Content wraz z Selected element settings i komunikatami               |
| UI-14 | Wybierz ikonę, ustaw Relative/Fixed oraz Top/Center/Bottom                         | Panel elementu i wynik na zdjęciu w wybranych kombinacjach            |
| UI-15 | Wybierz SVG Original/Single color i PNG z ostrzeżeniem o rozdzielczości            | Ustawienia grafiki z Content; właściwe kontrolki i podgląd            |
| UI-16 | Włącz znaczniki formatowania dla spacji, pustych wierszy i długiej linii           | Content z zaznaczonym tokenem; osobno stan po wyłączeniu              |
| UI-17 | Włącz kolejno None, Color z cieniem, Glass; ustaw asymetryczny padding             | Background wraz z sąsiednimi sekcjami oraz podgląd dekoracji          |
| UI-18 | Ustaw dwie nachodzące warstwy Glass/Color, jedną przy krawędzi zdjęcia             | Podgląd na poziomym i pionowym zdjęciu; clipping i kolejność          |
| UI-19 | Ustaw typografię: Montserrat Regular, Bold Italic, Advercase; wieloliniowy tekst   | Typography i podgląd; kontrolki 36 px, segmenty i wyrównanie          |
| UI-20 | Ustaw asymetryczne marginesy, wybierz anchor, następnie Manual X/Y                 | Position, Units & Margins oraz linijki z aktywnym uchwytem            |
| UI-21 | Zmień jednostki px / % krótszego / % dłuższego boku                                | Wartości kontrolek i zachowanie wyglądu podglądu                      |
| UI-22 | Otwórz Metadata, wybierz kategorię, wyszukaj wynik i brak wyników                  | Cały panel z tłem i granicą sidebara; długie wartości                 |
| UI-23 | Otwórz Font, wybierz kategorię, wyszukaj font                                      | Panel, podglądy fontów, wybrany wiersz i pusty wynik                  |
| UI-24 | Otwórz Graphics: ikony, SVG, PNG; wyszukaj i przewiń                               | Panel katalogu, filtry i siatka                                       |
| UI-25 | Otwórz Color, wybierz własny HEX; powtórz dla tła i cienia                         | Paleta oraz custom picker w kontekście miejsca otwarcia               |
| UI-26 | Otwórz listę presetów, menu akcji, Save as i Manage presets z zapisanymi pozycjami | Osobne widoki menu/dialogów, długie nazwy                             |
| UI-27 | Ustaw jakość JPG, rozwiń grupy metadanych; wywołaj ostrzeżenie o brakach           | Export settings i dialog potwierdzenia                                |
| UI-28 | Importuj dwa zdjęcia, przełącz poziome ↔ pionowe, zamknij jedno                    | Okno z rolką i po jej zniknięciu; pozycja canvasu                     |
| UI-29 | Importuj stałą serię 12 zdjęć; przewiń rolkę na początek, środek i koniec          | Cała rolka z kasetą, cieniem krawędzi, tail i zaznaczeniem            |
| UI-30 | Zmień dokument pierwszego zdjęcia, przełącz na drugie i wróć                       | Przywrócony podgląd, warstwy, preset i aktywna klatka                 |
| UI-31 | Wywołaj Photo actions, menu Export all i Dispose roll                              | Menu/dialogi razem z otoczeniem                                       |
| UI-32 | Zatrzymaj kontrolowany import/eksport w ustalonym punkcie                          | Overlay postępu i Cancel bez przesunięcia canvasu/rolki               |
| UI-33 | Przeciągnij plik nad canvas i nad Content                                          | Osobne overlaye drop wraz z obszarem docelowym                        |
| UI-34 | Importuj stały uszkodzony plik; odtwórz błąd importu presetu/grafiki               | Komunikaty w rzeczywistych miejscach UI                               |
| UI-35 | Otwórz tooltip przy krawędzi, przejdź klawiaturą do akcji i klatki rolki           | Tooltip i focus w kontekście otoczenia                                |
| UI-36 | Otwórz About i Changelog                                                           | Dialogi, przewijanie i zamknięcie                                     |

W UI-32 nie czekamy na przypadkowy moment prawdziwego kodowania. Potrzebny
jest kontrolowany punkt zatrzymania w środowisku testowym albo story stanu
produkcyjnego overlayu, uzupełnione istniejącym testem prawdziwego przepływu.
Sposób wybierzemy po sprawdzeniu granic importera/eksportera przy implementacji.

## Wymiary i środowisko

### Obowiązkowe rozwinięcie: grafiki, warstwy i marginesy

Te przypadki należą już do pierwszego etapu, ze względu na ostatnie regresje.

- **UI-08/10/11 — liczba warstw:** jawne konfiguracje 0, 1, 3 i 12 warstw.
  Przy 12 wybieramy pierwszą i ostatnią, sprawdzamy przewiniętą listę oraz
  formularz pod nią. Usunięcie aktywnej warstwy ma pokazać formularz sąsiedniej,
  a usunięcie ostatniej — pusty stan. Ujęcie obejmuje wspólny panel Layers.
- **UI-14/15 — formularze grafik:** wybór ikony, SVG i PNG w Content;
  Relative i Fixed z widoczną jednostką; wyrównania Top/Center/Bottom;
  SVG Original/Single color; PNG z ostrzeżeniem rozdzielczości. Osobne ujęcia
  po wymianie grafiki i po Remove, potwierdzające zmianę/zniknięcie formularza.
  Chronimy cały Content wraz z ustawieniami elementu i początkiem następnej
  sekcji, a nie wyłącznie obrazek. Każdy typ grafiki oglądamy przy normalnej
  i minimalnej szerokości sidebara; pełną macierz wyrównań wystarczy wykonać
  na ikonie, z reprezentatywnymi ustawieniami dla SVG i PNG.
- **UI-20 — marginesy:** stan neutralny; hover Top/Right/Bottom/Left w diagramie
  sidebara; hover każdej linijki i każdego uchwytu na zdjęciu; fokus każdego
  pola liczbowego; przeciąganie uchwytu w ustalonym punkcie oraz po puszczeniu.
  Cztery strony sprawdzamy w trybie None, a Pairs i All dodatkowo na hoverze
  i przeciąganiu lewego oraz górnego marginesu. Kontrolujemy ikonki, ich rozmiar,
  położenie, etykiety, wartości i podświetlenie powiązanych krawędzi.
  Ujęcia diagramu powtarzamy dla normalnego i wąskiego sidebara, a linijek
  dla zdjęcia poziomego i pionowego. Nie mnożymy wszystkich kombinacji.

Hover wykonujemy rzeczywistym ruchem wskaźnika, a fokus klawiaturą lub przez
pole. Nie ustawiamy CSS-owej klasy imitującej hover. Przed kolejnym przypadkiem
czyścimy poprzedni fokus i hover, ponieważ fokus może mieć pierwszeństwo.
Przy przeciąganiu wykonujemy mouse down → move → ujęcie → mouse up.
Czekamy na oczekiwany stan i wartość, nie na arbitralne opóźnienie.

Obecne testy linijek jawnie oczekują braku ogólnego tooltipa przy uchwycie.
Nie dodajemy tooltipów do UI na potrzeby testu: porównujemy istniejące badge
i prowadnice, a tooltip sprawdzamy tylko tam, gdzie rzeczywiście występuje.
Dla ikonek marginesów zapisujemy małe ujęcie **całego diagramu z otoczeniem**
oraz większe ujęcie podglądu z linijkami. Przesunięcie samej ikonki o 1 px
musi powodować różnicę bez aktualizacji wzorca.

### Profile porównania

- Główne wzorce: Chromium/macOS, 1440 × 900, DPR 1.
- Mniejsze okno: 1100 × 700 dla UI-01, 04, 07, 10, 14, 15, 20, 22, 25, 28, 29.
- DPR 2: reprezentatywne podglądy, Glass i rolka (UI-03, 18, 29).
- WebKit: osobne wzorce dla kluczowych okien, edytora, paneli, Glass i rolki.
  Rozszerzenie po ustabilizowaniu podstawowego pakietu.
- Wersja przeglądarki, system, fonty, locale i strefa czasowa są jawne.
  Nie porównujemy macOS z Linuxem ani Chromium z WebKit tym samym wzorcem.
  Ewentualne CI musi mieć własne stałe środowisko i odpowiedni zestaw wzorców.

## Stabilność i czułość

- Czyścimy stan aplikacji przez izolację kontekstów; potrzebne presety
  i preferencje scenariusz przygotowuje jawnie.
- Czekamy na konkretne fonty, dekodowanie zdjęć/grafik, oczekiwany dokument
  i zakończony render canvasu. Widoczny element ani pojedynczy request nie
  wystarczają. Nie używamy stałych opóźnień jako warunku gotowości.
- Wyłączamy animacje na czas ujęcia, ukrywamy migający kursor tekstowy.
  Położenie wskaźnika, focus i scroll są ustalone; hover jest celowy.
- Nie maskujemy zdjęcia, tekstów, podglądu, badge, cieni ani Glass.
  Ewentualna maska musi dotyczyć konkretnej nieistotnej zmienności i mieć opis.
- Na początku wymagamy zera różnych pikseli w stałym środowisku. Jeśli
  powtórzenia wykażą szum renderowania, najpierw usuwamy jego przyczynę.
  Każda tolerancja musi być minimalna, uzasadniona i sprawdzona celowym błędem.
  Globalny limit procentowy nie może pochłaniać zmiany małej kontrolki.
- Ujęcie poprzedzają asercje właściwego stanu: np. aktywna warstwa, widoczny
  panel, liczba klatek, konkretny tekst. Screenshot loadera nie może zastąpić
  oczekiwanego gotowego edytora.

## Wzorce i codzienna praca

Pierwsze kandydaty zapisujemy z bieżącego checkoutu, z identyfikatorem commita
i informacją o lokalnych zmianach. Obecny wygląd jest punktem odniesienia,
nie dowodem braku wcześniejszych usterek. Podejrzane miejsca zaznaczamy przy
przeglądzie zamiast poprawiać je po cichu podczas tworzenia wzorców.

Raport ma pokazywać nazwę sceny, expected, actual i diff oraz parametry
środowiska. Katalog scen umożliwia również ręczne otwarcie konfiguracji.
Wzorce PNG i dane scenariuszy są wersjonowane w repozytorium.

Zwykły przebieg nie tworzy ani nie aktualizuje wzorców; brak wzorca jest błędem.
Aktualizacja dotyczy wyłącznie wskazanych scen po obejrzeniu różnic.
Nie używamy szerokiego `test:e2e:update` do akceptowania zmian UI, bo może objąć
także eksport. Osobne komendy:

- `test:visual`: porównanie UI;
- `test:visual:review`: uruchomienie z interfejsem do przeglądu;
- `test:visual:report`: otwarcie raportu;
- `test:visual:update`: jawna aktualizacja wybranych scen/projektów.

Zmiana wspólnych styli lub kontrolek wymaga pełnego pakietu UI. Zmiana renderera
wymaga również istniejącego pakietu Photo export. Przed commitem zakończonego
zadania uruchamiamy odpowiednie porównania bez aktualizowania wzorców.

## Realizacja techniczna

Wykorzystamy obecny Playwright i Storybook, bez dodatkowej usługi SaaS.
Playwright będzie otwierał scenę, wykonywał interakcje i porównywał PNG przez
`expect(page).toHaveScreenshot` lub odpowiednik dla obszaru. Porównania
i obsługę serwerów opisuje dokumentacja [visual comparisons](https://playwright.dev/docs/test-snapshots)
oraz [webServer](https://playwright.dev/docs/test-webserver).

### Proponowane pliki

```text
playwright.visual.config.ts        # osobna konfiguracja UI
tests/visual/
  scenes.ts                       # katalog ID, wariantów i danych
  fixtures/                       # jawne dokumenty i ustawienia scen
  helpers/                        # otwarcie, gotowość, interakcje, ujęcia
  workspace.spec.ts               # okno aplikacji i sesja zdjęć
  layers.spec.ts                  # 0/1/3/12 warstw i ich formularze
  graphics.spec.ts                # wybór i edycja ikon/SVG/PNG
  margins.spec.ts                 # hover, focus i drag
  panels.spec.ts                  # panele pomocnicze i dialogi
  snapshots/                     # PNG według projektu/platformy/sceny
src/stories/visual-regression/    # produkcyjne kompozycje do ręcznego otwarcia
scripts/run-visual-tests.mjs      # wybór scen i kontrolowana aktualizacja
```

Testy trafiają poza `e2e`, aby zwykły zestaw E2E ani jego komenda aktualizacji
nie przejęły wzorców UI. Raport i pliki diagnostyczne otrzymają osobne katalogi
`playwright-visual-report` i `test-results/visual`; nie będą wersjonowane.

`scenes.ts` jest katalogiem, nie nowym frameworkiem testowym. Wpis opisuje
ID, wariant, źródło (App albo story), zdjęcie, dokument, profil okna i nazwane
ujęcia. Kroki pozostają czytelnym kodem Playwright w plikach testów.
Ten sam dokument wejściowy może zasilać story i test, ale oczekiwanej geometrii
nie obliczamy produkcyjną funkcją, której poprawność weryfikujemy.

### Uruchomienie aplikacji i scen

Konfiguracja będzie budowała i uruchamiała dwa lokalne serwery: produkcyjną
aplikację na 4184 i statyczny Storybook na 6018. Porty są oddzielone od zwykłego
E2E i próby Glass. Playwright zarządza startem i zamknięciem procesów;
`reuseExistingServer: false` zapobiega użyciu starej wersji. Zajęty port daje
czytelny błąd. Build wykonujemy przed porównaniem, również po zmianie CSS.
Serwowanie Storybooka może wykorzystać ten sam mechanizm co obecny test Glass.

Sceny otwieramy bez nawigacji i ramek Storybooka, przez jego iframe; testy
przejść otwierają główny adres aplikacji. Pierwszy profil nazwany
`chromium-desktop` ma 1440 × 900 i DPR 1. Kolejne profile to `chromium-compact`,
`chromium-retina` i `webkit-desktop`; przypisujemy im tylko właściwe sceny.

Bazowe ustawienia: jeden worker, brak retry, stałe locale `en-US`, strefa
`Europe/Warsaw`, ciemny schemat, screenshoty bez animacji i kursora tekstowego.
`updateSnapshots: 'none'` jest jawne: brak wzorca ma zgłosić błąd, bez jego
samoczynnego utworzenia. Porównanie ma `threshold: 0` i `maxDiffPixels: 0` (kalibracja poniżej). Ścieżka PNG zawiera platformę, projekt, ID i nazwę ujęcia.
Opcje aktualizacji określa [TestConfig](https://playwright.dev/docs/api/class-testconfig#test-config-update-snapshots).

### Przebieg jednego testu

1. Otwórz świeży kontekst i konkretną scenę, np. UI-15 / PNG / Fixed.
2. Załaduj stałe zdjęcie i grafikę, przygotuj dokument i ustaw szerokość panelu.
3. Wybierz PNG rzeczywistym kliknięciem w Content, przełącz Fixed i wpisz wysokość.
4. Sprawdź obecność formularza, jego wartości, zaznaczony element i brak loadera.
5. Poczekaj na używane fonty, zasoby i render odpowiadający bieżącemu dokumentowi.
   Helper ma ustalony timeout z diagnostyką brakującego warunku. Sama stabilność
   dwóch screenshotów nie dowodzi, że canvas wyrenderował właściwy dokument.
6. Ustaw scroll i wskaźnik; zrób ujęcie Content + formularz + sąsiednia sekcja.
7. Porównaj z zapisanym PNG. Przy różnicy dołącz actual, expected, diff i trace.

Przy braku dostępnego sygnału gotowości renderera implementacja powinna
udostępnić minimalny obserwowalny znacznik zakończonej rewizji renderu,
bez możliwości sterowania dokumentem przez publiczne debug API. Dla stanów
bez canvasu wystarczą gotowe fonty, zasoby i asercje formularza.

Katalog ręcznych scen otworzymy w Storybooku pod `Screens/VisualRegression`.
Stałe kompozycje otrzymają własne stories, a krótkie sekwencje mogą używać
wspólnej funkcji przygotowania dostępnej z `play`. Nie zakładamy, że samo
otwarcie iframe oznacza zakończenie `play`; test sprawdza jego stan końcowy.
Przejścia przez całą aplikację można odtwarzać w Playwright UI.

## Jak uruchamiać

**Poniższe komendy są dostępne w repozytorium.**
Uruchamia się je w katalogu projektu, przy Node i pnpm wskazanych przez repo.

Przy pierwszej instalacji środowiska:

```sh
pnpm install --frozen-lockfile
pnpm exec playwright install chromium webkit
```

Codzienne porównanie podstawowego profilu — komenda sama zbuduje i uruchomi
potrzebne serwery:

```sh
pnpm test:visual
```

Tylko grafiki albo hover marginesów:

```sh
pnpm test:visual --grep 'UI-14|UI-15'
pnpm test:visual --grep 'UI-20'
```

Uruchomienie z wyborem testów i śledzeniem kroków oraz otwarcie raportu:

```sh
pnpm test:visual:review --grep 'UI-20'
pnpm test:visual:report
```

Raport służy do oglądania różnic. Przycisk aktualizacji dostępny w narzędziu
nie stanowi automatycznej akceptacji wyglądu. Do zapisu zaakceptowanych wzorców
używamy osobnej, zawężonej komendy poniżej.

Pierwsze utworzenie wybranego wzorca lub zaakceptowana zmiana jego wyglądu:

```sh
pnpm test:visual:update --project chromium-desktop --grep 'UI-20 / left-hover / none'
pnpm test:visual --grep 'UI-20 / left-hover / none'
```

Tytuły testów będą miały format `ID / wariant / stan`, zgodny z powyższym
filtrem. Skrypt aktualizacji wymaga obu argumentów, wyświetla dopasowane testy
i kończy się błędem przy pustym dopasowaniu. Przekazuje do Playwright tryb
aktualizacji tylko dla tego projektu i filtra; zwykły skrypt odrzuca flagi
aktualizacji. Pierwszy pakiet tworzymy wskazując jawnie ID zaakceptowanego zakresu.
Zmiana profilu lub przeglądarki nie aktualizuje wzorców innych środowisk.

Sprawdzenie powtarzalności oraz dodatkowych profili po ich wdrożeniu:

```sh
pnpm test:visual --repeat-each=3 --retries=0
pnpm test:visual --project chromium-compact
pnpm test:visual --project webkit-desktop
pnpm test:visual --all-projects
```

`--all-projects` to argument naszego skryptu, który uruchamia wszystkie
skonfigurowane projekty; nie jest flagą Playwright. Bez niego i bez `--project`
skrypt wybiera `chromium-desktop`. `--grep`, `--repeat-each` i `--retries`
przekazuje do Playwright. `test:visual:report` otwiera osobny raport UI.

Jeśli test nie przejdzie: otwieramy raport, sprawdzamy scenę i diff, następnie
naprawiamy niezamierzoną zmianę albo świadomie aktualizujemy wskazany wzorzec.
Nie zwiększamy tolerancji i nie odświeżamy wszystkich obrazów, żeby uzyskać
zielony wynik. Aktualizacja wzorców nie wykonuje commita.

## Etapy do zatwierdzenia

1. **Fundament i pierwszy użyteczny zestaw:** osobna konfiguracja, helpery,
   raport, katalog scen oraz UI-01, 03, 04, 08, 10, 11, 12, 14, 15, 17, 20,
   22, 25, 28, 29 (15 rodzin scenariuszy, więcej niż 15 ujęć).
   Obecne wzorce do oceny; trzy pełne powtórzenia bez różnic i bez retry.
   Celowa tymczasowa zmiana wysokości kontrolki, przesunięcie panelu o 1 px
   oraz ukrycie ikony muszą zostać wykryte. Usuwamy te zmiany po próbie.
2. **Kompletny katalog:** pozostałe scenariusze, stany błędów i przejścia,
   niższy viewport oraz przypadki scrolla. Ocena nowych wzorców.
3. **Dodatkowe środowiska i rutyna:** wybrane wzorce WebKit/DPR 2,
   dokumentacja użycia i ustalenie środowiska automatycznych uruchomień.

Każdy etap kończy się oceną użytkownika. Ten dokument nie stanowi zlecenia
implementacji następnego etapu ani zgody na commit.

## Stan implementacji

Konfiguracja znajduje się w `playwright.visual.config.ts`, scenariusze w
`tests/visual`, katalog kompozycji w `scenes.ts`. Ręczne kompozycje są dostępne
w Storybooku pod Screens/VisualRegression. Testy przejść uruchamiają prawdziwą
aplikację, a kompozycje otwierają produkcyjne stories przez iframe.

Dostępne są cztery profile: chromium-desktop (domyślny), chromium-compact,
chromium-retina oraz webkit-desktop. DPR 2 obejmuje poziomy podgląd, Glass i rolkę. WebKit obejmuje kompozycje, formularze grafik, panele i sesję zdjęć.
Każdy wariant testu i każde ujęcie mają osobną ścieżkę PNG; nazwy nie kolidują.
Wzorce pozostają kandydatami do przeglądu użytkownika.

Systemowe potwierdzenia Dispose roll i brakujących metadanych są natywnymi
dialogami przeglądarki: sprawdzamy komunikat i reakcję, ponieważ screenshot
strony nie obejmuje interfejsu przeglądarki. Changelog prowadzi do GitHuba;
nie tworzymy fikcyjnego dialogu ani wzorca zewnętrznej strony.
Katalog Graphics ma zakładki, bez wyszukiwarki; sprawdzamy istniejące kontrolki.

Stany loadera pokazują produkcyjny komponent w kontrolowanym story, także z Cancel.
Rzeczywisty import, anulowanie i eksport nadal chronią istniejące testy E2E.
Zmiana scenariuszy nie modyfikuje zachowania aplikacji.

### Pokrycie i interpretacja wyników

- UI-01–07: pusty edytor, przygotowanie przed importem, zdjęcia i geometria okna.
- UI-08–11: 0/1/3/12 warstw, lista z grafikami, wybór, kolejność i widoczność.
- UI-12–16: mieszana treść, metadane dostępne/brakujące/nieznane, formularze
  ikony/SVG/PNG, Relative/Fixed, wyrównania, wymiana, usuwanie i znaczniki.
- UI-17–21: Color/Glass, cień, asymetryczny padding, nakładanie przy krawędzi,
  fonty, jednostki, anchory/Manual i marginesy.
- UI-22–27: wyszukiwanie i kategorie, grafiki, kolory tekstu/tła/cienia,
  presety, jakość JPG, wybór metadanych i ostrzeżenie eksportu.
- UI-28–36: rolka i jej granice, przywracanie dokumentu, menu i potwierdzenia,
  kontrolowane overlaye, błędy importu, focus/tooltip i About.

Pełna lista rzeczywistych tytułów: `pnpm test:visual --list --all-projects`.
Nie każdy wiersz planu jest pojedynczym testem: test może wykonywać kilka ujęć,
np. formularz grafiki przed i po zmianie wyrównania. Każde ujęcie ma osobny PNG.
FontPreview udostępnia wyłącznie obserwowalne atrybuty stanu ładowania;
helper czeka na gotowe próbki widoczne w panelu, bez zmiany interfejsu.

Test sensitivity najpierw potwierdza stały obraz, następnie tymczasowo przesuwa
sidebar o 1 px, ukrywa ikony i zmienia wysokość przycisków. Każda zmiana musi
zmienić obraz. Style próbne są usuwane i nie trafiają do kodu aplikacji.
Nie uruchomiono hostowanego CI: wzorce są dla lokalnego macOS, a uruchomienie
na innym obrazie systemu wymaga osobnej weryfikacji środowiska i wzorców.

### Powtarzalne renderowanie — 2026-10-29

Profile Chromium uruchamiają przeglądarkę z `--disable-gpu`. Wszystkie profile mają `reducedMotion: reduce`, co wyłącza przejścia kontrolek przed interakcjami, a nie dopiero podczas wykonywania ujęcia. Próba trzech
niezależnych kontekstów wykazała przy rendererze domyślnym różnice pojedynczych
pikseli szkła/antyaliasingu, a przy programowym rendererze trzy identyczne obrazy.
Konfiguracja zachowuje `threshold: 0` i `maxDiffPixels: 0`; nie ma masek,
limitu procentowego ani dopuszczalnej liczby różnych pikseli.
Zmiana renderera dotyczy wyłącznie środowiska testowego, nie działania aplikacji.

Test sensitivity w zwykłym przebiegu wywołuje ten sam matcher screenshotów
przeciw stabilnemu wzorcowi dla każdej próbnej regresji i wymaga odrzucenia
obrazu. Obsłużony błąd porównania jest oczekiwany wewnątrz tego testu; sam test
przechodzi tylko wtedy, gdy wszystkie trzy regresje zostaną odrzucone.
Przy generowaniu kandydatów nie wolno nadpisywać stabilnego wzorca obrazem
z próbnej regresji, dlatego w tym trybie porównujemy jedynie obrazy w pamięci.

### Usterka wykryta przez nowy zestaw

WebKit zgłosił `WebKitBlobResource error 1` dla miniatury zdjęcia w rolce.
Efekt sprzątający zasoby mógł użyć listy zdjęć z wcześniejszego renderu
po dopisaniu nowej miniatury i przedwcześnie zwolnić jej URL. Retencja korzysta
teraz z najnowszego zatwierdzonego stanu sesji. Osobny test E2E importuje
24 zdjęcia, sprawdza załadowanie wszystkich miniatur i potwierdza, że żaden
adres aktywnej miniatury nie został zwolniony. Przechodzi w Chromium i WebKit.
Helper screenshotów wymaga poprawnego dekodowania obrazów, zamiast ignorować
błędy ich ładowania i zapisywać uszkodzony obraz jako wzorzec. Techniczne separatory ProseMirror bez źródła obrazu nie są zasobami do dekodowania.
