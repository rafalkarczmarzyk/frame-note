# Efekty warstwy: Outline i Shadow/Glow

Aktualny stan wzorców: sześć scen UI i JPG zaktualizowano, zweryfikowano
i zaakceptowano 2026-11-06; commit `a3896b0`. Starsze opisy różnic i oczekiwania
na akceptację wzorców poniżej są dowodami historycznymi. Odbiory funkcjonalne
niewykonane ręcznie zachowują osobny status. Bieżący zakres i kontrole:
[plan 1.0](release-1.0.md).

Stan: etap 2 — funkcja wdrożona w aplikacji, weryfikacja i odbiór (2026-11-06).
Autoryzowany zakres: implementacja w aplikacji, usunięcie tymczasowej próbki,
poprawki listy i precyzji, Blur całej zawartości bez tła, Digital Date ze zrzutu,
Letter spacing w Typography i helper time zamiast dateTime w pickerze.
Branch: `codex/layer-effects`, baza `3eaf5cd`. Użytkownik zlecił lokalny commit
bieżącej implementacji; odbiór etapu pozostaje otwarty.
Weryfikacja przed commitem: 547 testów w 78 plikach, formatowanie, wersje,
tokeny, lint i typy zaliczone. Desktop sprawdzony po naprawie startu;
końcową listę z ikonami, próbkami i bez separatorów obejrzano w Chromium.
Sześć scen wizualnych nadal różni się od starszych wzorców, bez ich aktualizacji.
Kolejny etap domknięcia i operacje Git wymagają polecenia.

## Cel i decyzje

Poprawić czytelność tekstu na zdjęciu i umożliwić wygląd świecącego datownika.
Punktem wyjścia jest wpis „Obrys i cień tekstu” w NICE_TO_HAVE.
Użytkownik rozszerzył zakres na ikony i wektory oraz PNG, jeśli używa tego samego
mechanizmu. Wdrożona jest wspólna maska alfa całej zawartości. Zakres bieżącej implementacji i elementy oczekujące odbioru opisano poniżej.

- Outline/Shadow/Glow obejmują tekst, metadane, ikony, SVG, PNG i separatory.
  Wspólna maska alfa nie wymaga wykluczania bitmap. Tło pozostaje osobno.
  Blur obejmuje całą złożoną zawartość (także efekty tekstu), z osobnym tłem.
- Uzgodniony kierunek: elastyczne, jednoczesne efekty z własnymi offset,
  spread i blur. Użytkownik zaproponował listę podobną do Figmy zamiast
  osobnych checkboxów odsłaniających formularze.
- Wymaganie użytkownika: lista efektów wygląda i zachowuje się jak obecny
  wybór warstw. Wspólny wzorzec wiersza, zaznaczenia, hover, przeciągania,
  widoczności i menu akcji; bez osobnego języka interakcji dla efektów.
- Wybór koloru efektu używa istniejących `ColorControls` i `ColorPickerPanel`
  1:1: szybkie kolory tekstu, pełna paleta i custom HEX/picker. Na start wspólna
  paleta tekstu; można później rozszerzyć ją o kolory efektów bez tworzenia
  równoległego mechanizmu. Paleta otwiera się w zwykłym dodatkowym sidebarze
  workspace, bez pozycjonowania osobnego popupu. Wymaganie użytkownika z 2026-11-06.
- Lista Effects jest nad wspólnym wierszem akcji: `Add effect` i
  `Remove effect` dla zaznaczonego efektu, jak w Layers. Bez stałego opisu;
  informacja o zakresie typów efektów jest tooltipem Add effect.
- `Effects` z `Add effect`, typami `Outline`, `Shadow`, `Glow`, `Blur`.
  Można dodawać wiele wpisów tego samego typu, zmieniać kolejność, duplikować,
  wyłączać i usuwać. Pusta lista oznacza brak efektów.
  Wiersz wykorzystuje pełną szerokość sekcji i pokazuje ikonę typu, nazwę,
  próbkę koloru, główny parametr oraz widoczność. Kliknięcie zaznacza efekt i pokazuje
  jego ustawienia w powiązanym inspektorze, analogicznie do wyboru warstwy.
  Zastępuje to wcześniejszą propozycję otwierania całego formularza w FloatingPanel.
  Picker koloru może nadal korzystać ze wspólnego panelu pomocniczego.
- Kolejność: przeciąganie jak w liście warstw oraz menu `Move up`, `Move down`,
  `Bring to front`, `Send to back`; po ruchu zachowane zaznaczenie efektu i fokus.
  Menu zawiera także `Duplicate` i `Delete`. Akcje na krańcach są niedostępne
  z takim samym objaśnieniem jak w warstwach.
- Ikona oka tymczasowo ukrywa efekt bez usuwania ustawień ani zmiany kolejności;
  ukryty wpis jest przygaszony, pozostaje dostępny do zaznaczenia i edycji.
  Ukrycie obowiązuje również w Navigatorze i eksporcie, jest zapisywane w presecie
  i podlega Undo/Redo. Ponowne pokazanie przywraca ten sam efekt.
- Usunięcie wybranego efektu przenosi wybór na sąsiedni wpis; po usunięciu
  ostatniego pozostaje stan pusty z `Add effect` i poprawnym powrotem fokusu.
- Każdy efekt: stabilne ID, typ, enabled, kolor, krycie, offset X/Y, spread,
  blur. Blur udostępnia wyłącznie blur i krycie; pozostałe pola nie są używane.
  Shadow i Glow korzystają z tej samej operacji maski, lecz innych
  wartości początkowych; Glow zaczyna z zerowym offsetem, który można zmieniać.
- Outline: zewnętrzny obrys, spread odpowiada grubości. Zawsze ostry i bez offsetu;
  udostępnia tylko kolor, krycie i thickness. Starsze zapisane offset/blur są
  zachowane w v1, lecz pomijane przy renderowaniu i obliczaniu zasięgu.
  Ujemny spread dla Shadow/Glow może zwężać maskę; grubość Outline jest nieujemna.
- Rozmiary w jednostce dokumentu: px, % krótszego lub dłuższego boku.
  Zmiana jednostki przelicza również ustawienia wyłączonych efektów bez zmiany wyglądu.
- Składanie Outline/Shadow/Glow: każdy efekt powstaje z oryginalnej maski zawartości,
  nie z wyniku poprzedniego efektu. Efekty są pod tekstem, a wyższy wpis listy
  jest nad niższym. Nie powstaje automatycznie cień innego cienia/poświaty.
  Krycie treści obejmuje jej efekty; blending i krycie całej warstwy obejmują
  także efekty oraz istniejące tło. Cień tła pozostaje niezależny.
- Blur jest operacją na złożonej zawartości, po efektach tekstu i przed tłem/blendingiem
  warstwy. Wiele Blur nakłada się od dołu listy do góry; krycie miesza ostrą
  i rozmytą zawartość. Tło i jego cień pozostają osobno.
- Spread/thickness i blur: skok 0,02 w jednostkach procentowych, 0,1 px;
  offset: 0,1% / 1 px. Wpisywanie ręczne dopuszcza wartości pomiędzy krokami.
  Nie wprowadzono globalnego modyfikatora Shift do wszystkich pól.
- Efekty nie zmieniają pozycji, anchor, metryk tekstu ani odstępów wzoru Tiled.
  Poszerzają obszar renderowania i dobór widocznych kopii; nie wolno przycinać
  ich do prostokąta tekstu. Krawędź zdjęcia nadal ogranicza wynik.
- Brak treści nie pozostawia samotnego efektu. Obrót Tiled obraca również cień.

## Zakres i zgodność

Wspólny model, edytor, podgląd, Navigator, JPG/PNG i eksport seryjny dotyczą
webu i desktopu. Natywne menu, instalator i IPC nie wymagają nowej funkcji.
Efekty uczestniczą w Undo/Redo, duplikowaniu, Copy/Paste i presetach.

Wszystkie manifesty mają `0.10.0-beta`. Prognoza samodzielnego wydania funkcji:
`0.11.0-beta` (nowa możliwość). Ostateczny numer zależy od bazy i łącznego
Unreleased przy zleceniu wydania; planowanie nie zmienia manifestów/changeloga.

Proponowana opcjonalna uporządkowana lista `effects` na warstwie, oddzielnie
od `background.shadow`. Format pozostaje v1: brak pola oznacza pustą listę, podane znane pola są
walidowane, nieznane zachowywane. Starsze aktualne czytniki mogą zachować pole,
ale nie narysują efektu; historyczne czytniki mogą odrzucić nowy preset.
Bez migracji plików i zmiany klucza biblioteki.

## Miejsca implementacji i ryzyka

- `packages/core/src/document.ts`, `sizing.ts`, `preset-schema.ts`, `presets.ts`:
  model, fabryka ustawień, konwersje, walidacja i normalizacja.
- `packages/editor/src/features/caption/render.ts` i podgląd w
  `features/photo/photo-workspace.tsx`: współdzielone budowanie efektów zawartości.
  Obecnie podgląd ma też osobną ścieżkę ostrych węzłów, a złożona kompozycja
  korzysta z `use-glass-preview.ts`; zmiana tylko eksportu byłaby niewystarczająca.
- Cień nie powinien być wielokrotnie nakładany na styku fragmentów tekstu
  rozdzielonych metadanymi/ikonami. Sprawdzić wspólną maskę tekstu zamiast
  niezależnych cieni każdego fragmentu. Nie rasteryzować stale całego zdjęcia
  wyłącznie dla prostego obrysu bez oceny kosztu.
- Bufory muszą uwzględniać szerokość obrysu, blur i ujemne offsety; kontrola
  pamięci i zwalniania buforów przy eksporcie seryjnym oraz gęstym Tiled.
- UI ponownie wykorzystuje `PickerList` i wzorce z `features/layers/layer-list.tsx`:
  IconButton oka, ActionMenu, zaznaczenie i obsługę fokusu. W razie potrzeby
  wydzielić wspólną kompozycję akcji listy zamiast kopiować style i zachowania.
  Ustawienia składają InspectorSection, FloatingPanel dla pickerów, DimensionInput/NumberField,
  RangeField oraz picker kolorów. Rozszerzyć właściwe stories i kompozycję ekranu.

## Kryteria i wynik

| AC    | Obserwowalne zachowanie                                                                                                         | Weryfikacja                                                     | Wynik / odbiór                           |
| ----- | ------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- | ---------------------------------------- |
| AC-01 | Wiele Outline/Shadow/Glow działa razem; dodawanie, kolejność, duplikowanie, usuwanie i wyłączanie zachowują poprawny wynik      | Storybook i ręcznie web/desktop                                 | częściowo zweryfikowane; odbiór oczekuje |
| AC-02 | Wielowierszowy tekst i metadane mają spójne efekty; ikony, SVG/PNG i separatory otrzymują te same efekty, z osobnym tłem        | test renderowania i ręczny mieszany podpis                      | częściowo zweryfikowane; odbiór oczekuje |
| AC-03 | Zmiana jednostki i zoomu nie zmienia proporcji efektu; anchor i odstępy nie przeskakują                                         | testy geometrii/konwersji i ręcznie                             | częściowo zweryfikowane; odbiór oczekuje |
| AC-04 | Podgląd, Navigator i JPG/PNG pokazują zgodny efekt bez przycinania do tekstu, także Tiled i ujemne offsety                      | istniejący test JPG, testy renderowania, ręczna ocena PNG/Tiled | częściowo zweryfikowane; odbiór oczekuje |
| AC-05 | Krycie, blending, Color/Glass, widoczność i pusta treść zachowują uzgodnioną kolejność składania                                | testy renderowania i ręczna kompozycja                          | częściowo zweryfikowane; odbiór oczekuje |
| AC-06 | Stare presety wyglądają bez zmian; nowe zachowują efekty po zapisie/odczycie, nieznane pola i błędy znanych danych są obsłużone | testy schematu, round-trip i biblioteki                         | częściowo zweryfikowane; odbiór oczekuje |
| AC-07 | Undo/Redo, duplikowanie, Copy/Paste i zmiana zdjęcia zachowują niezależne ustawienia                                            | testy stanu i ręcznie                                           | częściowo zweryfikowane; odbiór oczekuje |
| AC-08 | Klawiatura, picker i pola działają; gęsty Tiled i eksport serii nie powodują błędów ani narastania buforów                      | stories, sześć scen UI, ręcznie seria i ocena wydajności        | częściowo zweryfikowane; odbiór oczekuje |

## Etapy

AC-09: lista efektów jest wizualnie i interakcyjnie spójna z listą warstw;
przeciąganie i menu zmieniają ten sam porządek renderowania, oko zachowuje
ustawienia, a wybór i fokus pozostają poprawne po ruchu i usunięciu.
Weryfikacja: interaktywne stories, testy stanu listy, istniejąca kompozycja
wizualna i ręczna obsługa klawiaturą web/desktop. Wynik: częściowo zweryfikowane; odbiór oczekuje.

1. **Uzgodnienie i próbka w Storybooku.** Zamknąć zakres tekst/grafiki,
   semantykę stosu i spread dla Outline, domyślne wartości i bezpieczne zakresy
   liczbowe. Po zgodzie zbudować interaktywną próbkę wyglądu i kontrolek,
   sprawdzić obrys oraz składanie cienia mieszanego tekstu. Odbiór użytkownika.
2. **Model i działająca funkcja.** Po zleceniu etapu podłączyć ustawienia,
   zapis, historię, wspólny renderer, podgląd i eksport. Testy celowane oraz
   odbiór działania na web/desktop według AC.
3. **Domknięcie.** Po zleceniu: pełne odpowiednie kontrole, aktualizacja
   dokumentacji i angielskiego Unreleased, końcowy odbiór. Bez automatycznej
   zmiany Digital Date — zastosowanie efektu w gotowym presecie wymaga uzgodnienia.

W etapach UI: `pnpm test:visual` (istniejące sześć scen) i obejrzenie
expected/actual/diff; aktualizacja tylko zaakceptowanych różnic. Uzupełnić
istniejący test JPG, nie dodawać profilu/scen bez zgody. Końcowo `pnpm check`,
`pnpm build-storybook`, `pnpm desktop:compile` i `pnpm test:desktop` w sesji
graficznej z wymaganymi uprawnieniami. Desktop i przeglądarka kolejno.

## Etap 2 — wynik i dowody

- Produkcyjny `EffectsControls` składa `PickerList`, wspólne `OrderedListActions`,
  `ColorControls`, `RangeField` i `NumberField`. `LayerList` używa tych samych
  akcji i mechanizmu przywracania fokusu. Bez równoległej implementacji pickerów.
- Tymczasowe `Proposals/LayerEffects` usunięte; pozostałe stories nietknięte.
- Model i v1: opcjonalne `effects`, brak normalizowany do pustej listy;
  unikalne ID w obrębie warstwy, do 100 efektów, walidacja znanych pól,
  zachowanie nieznanych danych. Konwersje jednostek obejmują ukryte wpisy.
- Renderer tworzy wspólną maskę alfa wszystkich elementów zawartości. Rasteryzowana jest
  lokalna zawartość motywu, raz dla Tiled; kopie współdzielą bufor. Bufory
  zwalniane po eksporcie; limit rozmiaru dekoracji: bok 16384 px / 64 mln pikseli.
  Zbyt duży efekt zgłasza błąd zamiast alokować nieograniczony bufor.
- Wartości startowe: Outline thickness 0,12% krótszego boku, Blur 0,2%
  krótszego boku (polecenie użytkownika). Shadow offset 0,2% / 0,2% krótszego boku,
  Shadow/Glow blur 6 px w odniesieniu do krótszego boku 600 px. Krycie 80%, Blur 100%.
  Rozmiary pól ograniczone do dłuższego boku zdjęcia, Outline/blur ≥0.
- Potwierdzone w Chromium: produkcyjny dodatkowy sidebar palety, custom HEX,
  menu zmiany kolejności z zachowaniem wyboru/fokusu, duplikacja, usuwanie
  sąsiedniego wyboru i powrót fokusu do Add effect po usunięciu ostatniego.
- Renderer: PNG identyczny ze wspólną kompozycją 1000×600; ukryte efekty dają
  wynik bez efektów; pusta treść nie pozostawia efektu; ikona bez tekstu
  otrzymuje Outline/Shadow/Glow; Blur zmienia ikony i logo. Sprawdzono stos
  masek i mieszaną treść, ujemne spread/offset, Glass, Tiled, krycie i blending.
  Pięć renderów gęstego Tiled/Glass 1000×600: 624 ms łącznie; to pomiar próbki,
  nie gwarancja wydajności ani dowód braku narastania pamięci w długiej sesji.
- Zaliczone na bieżącym źródle: 546 testów Vitest, lint, tokeny, typy,
  check:version, format:check, build web i desktop oraz natywny test macOS offline
  z Letter spacing 0,04 em, Outline, sidebarową paletą Sage, Undo, Blur 0,22%,
  JPG i ZIP czterech zdjęć. Build Storybooka po usunięciu próbki także zaliczony.
- Chromium potwierdził Copy/Paste efektów pomiędzy zdjęciami i niezależność
  późniejszych zmian, źródło wyboru koloru z palety, custom HEX, pełną szerokość
  listy bez kółek oraz krok 0,02%. Digital Date sprawdzony w aplikacji:
  Bold wyłączony, Outline 80%, thickness 0,06%, blur 0.
- Letter spacing: sprawdzono dodatnią i ujemną wartość, stały prawy anchor,
  przesuwanie ikony za rozszerzonym tekstem, zgodność PNG/kompozycji,
  krok 0,01 em i Undo. Time jest widoczny i wstawia `{time}`; dateTime
  nie występuje w pickerze. Testy jednostkowe obejmują też błędne/brakujące
  timestampy i zachowaną obsługę starego helpera.
- Sześć scen Chromium: 6 różnic względem starszych wzorców. Obejrzano
  expected/actual/diff. Istniejące różnice to Photo Details zamiast Default,
  ikony/metadane ekspozycji i DSEG7 Classic; nowe różnice obejmują Letter spacing
  i przesunięcie dalszych kontrolek w font/metadata/graphic settings.
  Wzorców nie zmieniono. Raport: `visual-test-results`.
- Istniejący pojedynczy test JPG rozszerzony o efekty i Undo: poprawny plik
  5964×3976, porównanie obrazu niezgodne ze starym wzorcem. Obejrzano
  expected/actual/diff; bez aktualizacji wzorca. W reprezentatywnym obrazie
  Blur ograniczony do 0,02%, aby kontrola pozostała czytelna i sprawdzała
  precyzję steppera. Ostatnia kontrola: wszystkie kroki funkcjonalne i eksport
  przeszły; porównanie ze wzorcem zgłasza 46952 różniące się piksele.

## Odbiór

Wszystkie AC pozostają bez odbioru użytkownika. Implementacja obejmuje AC-01–09;
konwersje, schemat i historia mają testy jednostkowe; renderer, lista i sidebar
mają kontrole Chromium oraz natywną kontrolę macOS opisaną wyżej.
Do ręcznej oceny: końcowy wygląd efektów i Blur, zachowanie przy zoomie,
Navigator, klawiatura/przeciąganie, zapis/odczyt presetów i dłuższa seria zdjęć.
Windows/Linux nieweryfikowane. Wzorce UI/JPG wymagają osobnej akceptacji.

Wersja `0.10.0-beta · 3eaf5cd dirty`, bez zmian manifestów, taga i commita.
Wpis funkcji w angielskim Unreleased. Prognoza samodzielnego wydania nadal
`0.11.0-beta`. Na polecenie użytkownika Digital Date: Oswald 400 (bez Bold), czarny Outline
80%, thickness 0,06% krótszego boku, offset 0/0 i blur 0. Grafiki są objęte efektami Outline/Shadow/Glow wraz z resztą zawartości.

## Rozszerzenia użytkownika — 2026-11-06

- AC-10: Letter spacing w Typography, w jednym wierszu z font size i line height,
  ikona Lucide LetterSpacing i tooltip zamiast widocznej etykiety, zachowana nazwa
  dostępności. Em, zakres -0,1–1, krok 0,01,
  domyślnie 0. Wspólna geometria prostego/mieszanego tekstu, efekty, Navigator,
  eksport, historia i opcjonalne `style.letterSpacing` w v1. Stare presety
  interpretują brak jako 0. Jednostka em nie zmienia się przy konwersji dokumentu.
- AC-11: picker pokazuje osobny helper `time` (HH:mm), bez `dateTime`.
  `{date} {time}` pozwala składać podpis; stare `{dateTime}` i formatowane
  daty z godziną zachowują obsługę. Brak godziny nie oznacza północy.
  Źródła EXIF/XMP, bez konwersji stref czasowych. Weryfikacja: testy
  poprawnej/błędnej/brakującej daty i godziny oraz kontrola pickera.
- Oba rozszerzenia wpływają na wspólne web/desktop i presety v1,
  prognoza MINOR pozostaje bez zmian. Odbiór użytkownika oczekuje.

Kontrola poprawki wiersza Typography: Chromium potwierdził ten sam poziom
trzech pól, ikonę Lucide LetterSpacing, zachowaną nazwę dostępności i zmianę
0,03 → 0,04 em klawiszem ArrowUp. Sprawdzono screenshot
`/tmp/typography-row.png`. Typy, lint i tokeny zaliczone. Zmiana wyłącznie
układu kontrolek, bez zmian modelu i renderera. Końcowy test sześciu scen
pozostaje porównaniem z niezaakceptowanymi starszymi wzorcami.

Poprawka akcji Effects (2026-11-06): istniejące ActionMenu i Button w wariancie
outline/sm tworzą wiersz pod listą. Remove effect korzysta z tej samej operacji
usunięcia co menu wiersza; oba przywracają fokus wspólnym `focusPickerAfterDelete`,
również dla warstw. ActionMenu ma opcjonalny opis tooltipa niezależny od nazwy
akcji. Brak aktywnego efektu blokuje Remove effect. Stały opis usunięty.
Typy, lint i tokeny zaliczone; kontrola Chromium sprawdza położenie akcji,
tooltip, usunięcie aktywnego efektu, wybór sąsiada i fokus po opróżnieniu listy.

Wiersze Add/Remove pod Layers i Effects dzielą pełną dostępną szerokość po połowie
(grid dwóch równych kolumn, wspólne istniejące przyciski), również przy zmianie
szerokości sidebara. Bez nowego komponentu i bez zmian zachowania akcji.

Kontrola szerokości: Chromium potwierdził równe kolumny i wyrównanie do obydwu
krawędzi wiersza dla Layers (160/160 px) i Effects (151/151 px) przy domyślnej
szerokości sidebara. Etykiety efektów pozostają w jednej linii; obejrzano
`/tmp/effects-full-width.png`. Typy, lint i tokeny zaliczone. Sześć scen UI
nadal wykazuje znane różnice i zamierzone poszerzenie przycisków; wzorce nietknięte.

Outline jako osobny ostry obrys: po decyzji użytkownika nie ma offsetu ani blur
w inspektorze ani renderowaniu. Pozostają kolor, krycie i nieujemna grubość.
Shadow/Glow zachowują komplet dotychczasowych parametrów. Brak migracji plików.

Weryfikacja ostrego Outline: 13 testów efektów, typy i lint zaliczone. Chromium
potwierdził wyłącznie kolor/krycie/thickness w inspektorze; screenshot
`/tmp/outline-sharp-settings.png`. Test potwierdza pomijanie dawnych offset/blur
w parametrach renderowania i zasięgu bufora. Sześć scen UI nadal różni się od
starszych niezaakceptowanych wzorców; wzorce pozostają bez zmian.

## Ostatnie rozszerzenie zakresu i inspektor efektu

- Outline/Shadow/Glow obejmują całą zawartość: tekst, ikony, SVG, PNG i
  separatory. PNG korzysta z dokładnie tej samej alfy i nie wymaga wykluczenia.
  Tło jest osobnym węzłem, więc nie trafia do maski. Zapis v1 bez zmiany schematu.
- `renderContentEffects` zastępuje maskę ograniczoną do węzłów Text maską całej
  oryginalnej grupy zawartości. Samodzielne logo również otrzymuje efekty i ma
  odpowiednio poszerzony dobór kopii Tiled.
- Inspektor efektu jest wewnątrz Effects, pod listą i akcjami, w wyraźnym boxie.
  `InspectorSection surface="selected"` i edytor elementów współdzielą
  `selected-settings-panel`, bez nowej palety ani kopiowania klas stylu.
- Chromium potwierdził wszystkie trzy efekty osobno na ikonie, SVG, PNG z alfą
  i separatorze, a także samodzielne logo. PNG mieszanej treści jest identyczny
  ze wspólną kompozycją. Potwierdzono strukturę i wygląd boxa:
  `/tmp/selected-effect-box.png`. 547 testów Vitest, lint, tokeny i typy przeszły;
  desktop skompilowany. Natywny smoke macOS zaliczony: Outline, Blur, picker,
  precyzja pól oraz eksport JPG i ZIP. JPG Chromium poprawnie eksportuje
  5964×3976; porównanie zgłasza 39500 pikseli różnicy względem starego wzorca.
  Obejrzano expected/actual/diff JPG i scen UI; wzorce pozostają nietknięte.

Shadow i Glow: pola długości są w siatce dwóch kolumn — Offset X/Y w pierwszym
wierszu, Spread/Blur w drugim. Wspólne NumberField i precyzja bez zmian;
Outline i Blur zachowują pojedyncze pole pełnej szerokości.

Kontrola układu Shadow/Glow: Chromium potwierdził dwa wspólne poziomy pól,
zachowany krok Spread 0,02% i wygląd `/tmp/glow-compact.png` oraz
`/tmp/shadow-compact.png`. Typy, lint i tokeny zaliczone. Sześć scen UI
nadal różni się od starszych wzorców; żaden wzorzec nie został zmieniony.

Panel efektu używa krótkich etykiet Offset X, Offset Y, Spread, Blur i Opacity;
bez zbędnego prefiksu Effect. Testy eksportu używają nowych nazw dostępności.

Ikony pól efektu zgodnie z decyzją użytkownika: Offset X — ArrowRightLeft,
Offset Y — ArrowUpDown, Spread/Thickness — Expand, Blur — Opacity. Widoczne
etykiety zastąpione ikonami, nazwy zachowane w tooltipach i dostępności.
Ikona krycia jest spójna: Blend w Typography, Blending, Effects i Background.

Kontrola ikon: Chromium potwierdził Expand zarówno dla Thickness, jak i Spread,
Opacity dla Blur, obie strzałki offsetów oraz Blend dla krycia efektu i blendingu.
Domyślne offsety Shadow w aplikacji wynoszą 0,2% / 0,2%. Obejrzano
`/tmp/outline-icons.png` i `/tmp/shadow-icons.png`. Typy, lint i tokeny zaliczone;
sześć scen UI nadal różni się od starszych wzorców, bez ich aktualizacji.

Odstępy Content i Effects są symetryczne: 12 px od zawartości/listy do akcji
oraz 12 px od akcji do boxa ustawień zaznaczenia. Ikona Blur to lokalny OpacityIcon
z SVG dostarczonego przez użytkownika (currentColor, zachowana geometria);
krycie nadal używa Blend, bez konfliktu znaczeń.
Lista efektów używa istniejącego slotu leading w PickerList: TypeOutline dla
Outline, Moon dla Shadow, Sun dla Glow i dostarczonego OpacityIcon dla Blur.
Odstęp ikony od nazwy wynosi 8 px. Wiersze podsumowują kolor (istniejący
ColorSwatch w rozmiarze 12 px zamiast nazwy lub HEX) i główny parametr
w jednym wierszu, oddzielone odstępami 8 px bez separatorów tekstowych,
w aktualnej jednostce dokumentu: grubość Outline, rozmycie Shadow/Glow oraz
promień Blur (bez koloru). Nazwa koloru lub HEX i pełna treść są dostępne w tooltipie, nazwy
dostępności pozostają krótkie i stabilne.
Usunięto import niedostępnego eksportu Opacity, który blokował start edytora.
Wersja Lucide i lockfile pozostają bez zmian. Chromium potwierdził start,
przeładowanie bez błędów oraz odstępy 12/12 px w Content i Effects.
Po tej poprawce kompilacja desktopu, natywny test aplikacji (w tym efekty,
eksport i konfiguracja), typy, lint, tokeny i build Storybooka zaliczone.
Sześć scen testu wizualnego nadal różni się od starszych wzorców; obejrzano
expected/actual/diff panelu fontów, bez aktualizacji wzorców.
