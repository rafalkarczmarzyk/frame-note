# Navigator — plan implementacji

Stan: makieta zaakceptowana; integracja z aplikacją gotowa do odbioru.
Aktualizacja: 2026-11-04. Użytkownik zaakceptował wygląd i zlecił podłączenie
do aplikacji. Bieżące polecenie obejmuje integrację etapów 2/3 i wspólny odbiór
działania w edytorze. Akceptacja makiety nie oznacza odbioru gestów w aplikacji.
Użytkownik zlecił lokalny commit, changelog i tag przygotowanego wydania.
Bez merge, push, publikacji i budowania paczek dystrybucyjnych; wydanie odroczone.
Docelowy branch funkcji: `codex/photo-navigator`.

## Jak używać tego planu

Przeczytać AGENTS.md i wymagane dokumenty oraz change-workflow. Ustalenia w sekcji
„Decyzje” są wymaganiami. Sekcja „Wartości robocze” zamyka wcześniejsze otwarte
pytania na potrzeby pierwszej implementacji: użytkownik zdecydował, że szczegóły
oceni podczas testów. Nie pytać ponownie o każdą z tych wartości przed pracą;
zastosować podane domyślne zachowanie, pokazać je w odbiorze i zmienić po feedbacku.
Wartości robocze nie są końcową akceptacją zachowania ani wyglądu.

## Cel, zakres i zgodność

Navigator wspólnego edytora web/desktop: miniatura z oznaczeniem oglądanego
fragmentu, zoom, przesuwanie widoku, presety i współpraca z linijkami/marginesami.
Stan widoku nie zmienia zdjęcia, geometrii dokumentu, eksportu, presetów v1,
Copy/Paste ani historii Undo/Redo. Bez ramek, cropu i zapisu sesji na dysk.
Brak migracji i wpływu na starsze czytniki presetów.

Baza odczytana podczas planowania: 0.6.1-beta we wszystkich manifestach.
Prognoza osobnego wydania tej funkcji: 0.7.0-beta, ponieważ dodaje nową możliwość.
Przed implementacją sprawdzić bieżącą bazę; nie podbijać wersji przy etapach
ani commitach. Zrealizowane zachowanie zapisywać po angielsku pod Unreleased
zgodnie z maintain-versioning. Sam plan nie wymaga wpisu w changelogu.

## Decyzje użytkownika

- Navigator w głównym sidebarze u góry, bez zasłaniania zdjęcia. Szczegółowy
  design ustalamy w osobnym interaktywnym story, wymagającym oceny użytkownika.
- Ikona nagłówka Lucide `ShipWheel`; po lewej suwaka przycisk `ZoomOut`, po
  prawej `ZoomIn`. Aktualny procent w NumberField z jednostką %, krok 1 punktu
  procentowego. Fit, 100% i pole w jednej InlineInputGroup; przyciski aktywne
  odpowiednio dla trybu Fit i skali 100%. Bez presetu/dropdowna 200%, procentu
  pod nagłówkiem ani opisu pod suwakiem. Ikona używa koloru sekcji pozycjonowania.
- Miniatura zachowuje proporcje, a obrys pokazuje faktycznie widoczny fragment.
- Zoom: macOS Cmd + kółko; Windows/Linux Ctrl + kółko. Punkt obrazu pod
  kursorem pozostaje w tym samym miejscu ekranu, z wyjątkiem ograniczeń pan.
- Pan: Spacja + lewy przycisk i przeciąganie lub przeciąganie wciśniętym kółkiem.
- Z przełącza dwa ostatnie zapisane ustawienia zoomu, nie zawsze Fit ↔ detal.
  Ustawieniem jest wybrany preset lub wynik ręcznej zmiany zoomu.
- Fit nie przekracza 100% i zachowuje obecny sposób rozmieszczenia zdjęcia
  i linijek. Wariant linijek przy powiększeniu oceniamy podczas testów.
- Bez dodatkowej nawigacji widokiem klawiaturą: nie dodawać pan strzałkami,
  Shift + strzałki, skrótów +/− i 0/1 ani przycisków kierunkowych.
  Z i Spacja są wymienionymi wyżej wyjątkami; kontrolki zachowują standardową
  obsługę klawiaturą, w tym strzałki suwaka i uchwytów marginesów.

## Wartości robocze do pierwszych testów

| Obszar          | Domyślne zachowanie do zaimplementowania                                                                                                                                                                                                 |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 100%            | 1 piksel obrazu = 1 piksel CSS. DPR zwiększa rozdzielczość renderowania, nie zmienia procentu. Zachowuje obecny maksymalny rozmiar małego zdjęcia w Fit. Fizyczne 1:1 na Retinie pozostaje punktem oceny, nie drugim równoległym trybem. |
| Fit             | Obecne dopasowanie z obecnym odstępem na linijki, maks. skala CSS 1. Dynamiczne po resize.                                                                                                                                               |
| Zakres          | Minimum min(25%, Fit), maksimum 800%. Pozwala dopasować zdjęcie wymagające np. 12%.                                                                                                                                                      |
| Suwak           | Logarytmiczny; ręczne zmiany z suwaka, pola % i scrolla zaokrąglane do pełnych procentów. Fit zachowuje dokładną frakcję (pole pokazuje do 2 miejsc). Małe delty kółka akumulowane bez timera.                                           |
| Przyciski zoomu | Następny/poprzedni poziom z 25, 33, 50, 67, 100, 150, 200, 300, 400, 800%, z dołączeniem aktualnego minimum. Na granicach disabled. Nie aktywują trybu Fit przez samą równość procentu.                                                  |
| Pole zoomu      | NumberField, jednostka %, krok 1 punktu procentowego, wpisywanie i strzałki. Zmiana ręczna z tymi samymi granicami zoomu co suwak.                                                                                                       |
| Zwykły scroll   | Przesuwanie widoku; Shift + pionowe kółko przesuwa poziomo. Nie podwajać natywnego deltaX trackpada.                                                                                                                                     |
| Trackpad        | Dwa palce przesuwają, pinch przybliża wokół punktu gestu dostępnego ze zdarzenia.                                                                                                                                                        |
| Panel           | Zwijana sekcja przed ustawieniami zdjęcia i warstwami, przewija się z sidebarem. Domyślnie rozwinięta, miniatura 160 CSS px. Nagłówek bez procentu; brak opisu zoomu pod suwakiem.                                                       |
| Pamięć          | Zoom, pan i para Z osobno dla zdjęcia w pamięci sesji. Zwinięcie sekcji wspólne dla sesji. Bez localStorage i rozszerzania zapisywanej konfiguracji.                                                                                     |
| Pusty/busy      | Zachować sekcję i miejsce miniatury, pokazać placeholder/status i wyłączyć kontrolki bez gotowego zdjęcia, podczas błędu lub blokującego importu/eksportu.                                                                               |

Definicja 100% świadomie zastępuje wcześniejszą propozycję fizycznego piksela:
nie można zachować obecnej skali małego zdjęcia na Retinie i jednocześnie
nazwać jej fizycznym 100%. W odbiorze pokazać to użytkownikowi wprost.
Ręczne minimum = ceil(min(25%, Fit)); Fit może leżeć poniżej tej całkowitej
wartości. Przyciski zoomu oraz pole respektują ręczne minimum; Fit zachowuje
dokładne dopasowanie. Resize i odtwarzanie liczbowego poziomu również zachowują
całkowity procent, ograniczony do bieżących granic.
Wszystkie progi i poziomy trzymać w jednym module, łatwym do zmiany po testach.

## Dokładne reguły zoomu i Z

Przechowywać ustawienie jako `fit` albo wartość liczbową, nie jako sam tekst
procentu. Para początkowa: aktywne Fit, poprzednie 100%. Z zamienia parę.
Przy równej skali Fit i 100% przełącza tryb bez widocznego skoku; Fit nadal
reaguje na resize, wartość liczbowa nie. Ignorować autorepeat klawisza Z.

Ręczna akcja obejmuje kolejne zmiany polem %, kółkiem, suwakiem i przyciskami ZoomIn/Out,
także z przerwami. Sam upływ czasu, puszczenie suwaka, zwolnienie modyfikatora
ani wyjechanie kursorem poza zdjęcie nie kończą akcji. Kończą ją:

- rozpoczęcie pan (również przez miniaturę), użycie innego narzędzia,
- wybór presetu, naciśnięcie Z,
- zmiana/usunięcie zdjęcia, utrata fokusu okna albo blokujący stan aplikacji.

Zapamiętać stan sprzed akcji i bieżący wynik. Przy zamknięciu zapisać tylko
rzeczywistą zmianę. Z najpierw zatwierdza akcję, potem zamienia parę. Pan
zatwierdza wynik zoomu, ale nie jest nowym poziomem. Preset najpierw zamyka
akcję ręczną, potem zapisuje własne ustawienie. Klik aktywnego presetu nic
nie zmienia. Resize w Fit nie dodaje historii. Nie używać debounce jako granicy
historii; można go użyć wyłącznie do optymalizacji kosztownych obliczeń.

Jeśli ręczna akcja wróci do wyjściowej skali, zachować wcześniejszą parę
(i tryb Fit, jeżeli od niego zaczęto). Porównywać skale z tolerancją numeryczną,
nie po zaokrąglonym procencie. Jawny wybór Fit/100% rozróżnia tryby nawet przy
identycznej skali. Przy resize podczas otwartej akcji najpierw ją zamknąć.

| Sekwencja                          | Oczekiwane Z                                                |
| ---------------------------------- | ----------------------------------------------------------- |
| 100% → 150% → pauza → 200%         | 100%; ponowne Z daje 200%                                   |
| 100% → 150% → pan → 200%           | 150%                                                        |
| Fit → 100% → ręcznie 175%          | 100%                                                        |
| 100% → ręcznie 150% → ręcznie 100% | Poprzednia para pozostaje bez zmian                         |
| Fit → resize                       | Brak nowego poziomu; powrót do Fit używa nowego dopasowania |

Z/presety/pole %/suwak/przyciski kotwiczą zoom w centrum viewportu, nie w położeniu
kursora nad panelem. Z nie odtwarza dawnego pan.

## Geometria i miniatura

Jedno źródło transformacji: skala `s` i przesunięcie `tx, ty` w CSS px.
Punkt ekranowy = przesunięcie + punkt obrazu × s. Dla zoomu pod kursorem
najpierw wyliczyć punkt obrazu `(cursor - offset) / oldScale`, następnie nowe
przesunięcie `cursor - imagePoint * newScale`, na końcu zastosować ograniczenia.
Nie powiększać fizycznego rozmiaru Stage do wymiarów powiększonego zdjęcia.

Mniejszą oś zdjęcia wyśrodkować. Dla większej ograniczyć pan, aby nie można było
odsunąć zdjęcia i odsłonić pustki za jego krawędzią. Używać jednego zdefiniowanego
prostokąta dostępnego podglądu (z uwzględnieniem obecnych odstępów), wspólnego
dla Fit, pan i miniatury. Resize poza Fit zachowuje skalę i punkt centralny
obrazu, po czym ogranicza pan. Gdy zmieni się minimum zoomu, ograniczyć skalę
bez dopisywania historii; wcześniej zapisane wartości ograniczać przy odtwarzaniu.

Miniatura: cała kompozycja (zdjęcie + warstwy), bez zaznaczeń i uchwytów.
Dopasowanie contain, bez rozciągania. Obrys = przecięcie viewportu ze zdjęciem,
przeliczone do miniatury jednakową skalą w obu osiach. Gdy jedna oś zdjęcia jest
mniejsza od viewportu, obrys pokazuje proporcje widocznego fragmentu zdjęcia,
nie sztucznie narzucone proporcje całego viewportu. W Fit obejmuje całą miniaturę.

Klik wewnątrz obrysu zaczyna drag bez skoku; poza obrysem centruje na punkcie.
Klik pustego pola poza miniaturą ignorować. Zastosować te same ograniczenia pan.
Nie powiększać wizualnie małego obrysu; można zwiększyć niewidoczne hit area.
Przy całym zdjęciu widocznym pan nie zmienia widoku. Nie renderować ponownie
miniatury przy każdym pan: aktualizować obrys, obraz dopiero po zmianie kompozycji.

## Linijki, marginesy i konflikty interakcji

Roboczy wariant do Storybooka i testów: linijki podążają za górną/lewą krawędzią
zdjęcia, a po jej wyjściu poza dostępny obszar przyklejają się do brzegu.
Każda oś działa niezależnie. W Fit położenie jest takie jak obecnie. Przypięcie
nie zmienia rozmiaru viewportu i nie powoduje skoku zoomu. Chronić pole chwytania
uchwytów na skrajach przed obcięciem; nie dodawać podwójnie odstępu na linijki.

Zero podziałki = lewy górny róg zdjęcia. Aktualne jednostki i adaptacyjne kroki
bez zmian. Rysować tylko widoczny zakres, bez podziałki nad pustą przestrzenią.
Marginesy i prowadnice używają współrzędnych obrazu; rozmiar uchwytów, tekstu,
linii i hit area pozostaje stały ekranowo. Niewidocznych uchwytów nie przyklejać
sztucznie do brzegu. Panel nadal pozwala zmienić margines poza widokiem, bez
automatycznego pan. Zachować istniejące zasady pokazywania prowadnic.
Drag marginesu przeliczać przez aktualną skalę; jednostki, link modes, limity
oraz Undo/Redo edycji marginesów pozostają bez zmian.

- Spacja przed drag lub środkowy przycisk mają pierwszeństwo przed drag warstwy.
  Nie zaznaczać warstwy przy pan. Wyłączyć przeglądarkowy autoscroll dla MMB.
- Rozpoczętego drag warstwy/marginesu nie zamieniać w pan. W trakcie drag
  blokować zoom. Puszczenie Spacji podczas pan nie rozpoczyna drag warstwy.
- Kursor grab/grabbing. Escape podczas pan przywraca pozycję sprzed gestu;
  pointercancel anuluje gest, blur kończy gest i czyści stan klawiszy/przycisków.
- Przy zmianie zdjęcia, resize lub DPR zakończyć aktywny drag przed zmianą
  geometrii, zwolnić capture i nie przenosić zdarzeń na następne zdjęcie.
- Z i Spacja nie przejmują pisania w input/textarea/contenteditable ani obsługi
  otwartego menu/modalu. Z tylko bez Ctrl/Cmd/Alt; nie przechwytywać Undo/Redo.
- Klik viewportu może przywrócić mu fokus bez przewijania strony. Spacja przy
  pozostawionym fokusie edytora tekstu nadal wpisuje spację.
- Obsługa wheel tylko nad viewportem; nad sidebarem scroll przewija sidebar.
  Nie przejmować globalnego zoomu strony Cmd/Ctrl +/−/0.
- Normalizować deltaMode. Pinch może być dostarczany jako ctrl+wheel;
  zweryfikować adapter na docelowych systemach, nie dodawać dwóch reakcji na
  ten sam gest. Ograniczenia wykrywania pinch raportować w odbiorze.

## Mapa kodu i granice implementacji

- `packages/editor/src/features/photo/photo-workspace.tsx`: obecne Fit,
  ResizeObserver, Stage i draggable warstwy; tu integracja. Wyodrębnić czystą
  geometrię i stan widoku zamiast rozbudowywać cały komponent o obliczenia.
- `packages/editor/src/features/photo/margin-rulers.tsx` oraz
  `packages/editor/src/components/ui/ruler.tsx`: rozszerzyć o widoczny zakres
  i przesunięcie początku; bez kopiowania linijek do nowego feature.
- `packages/editor/src/components/ui/slider.tsx`: wykorzystać istniejący Slider;
  rozszerzyć tylko konieczne API, bez timera historii w komponencie ogólnym.
- `packages/editor/src/features/photo/history-interactions.tsx`: sprawdzić
  granice historii edycji; nowe gesty widoku nie mogą tworzyć jej transakcji.
- `packages/editor/src/hooks/use-platform.ts` i provider: korzystać ze wspólnego
  mechanizmu platformy. Dla web sprawdzić dostępne rozpoznawanie OS; jeśli brak,
  dodać je w warstwie platformy, nie rozproszone wykrywanie w kontrolkach.
- Wspólne SidebarSection, IconButton, Button, Select, Slider i tokeny.
  Nowy Navigator w feature photo, story obok. Żadnych nowych zależności bez potrzeby.
- Stories odniesienia: `features/photo/margin-rulers.stories.tsx`,
  `components/ui/ruler.stories.tsx`, `components/ui/slider.stories.tsx`,
  `stories/editor-test-photos.stories.tsx` (wszystkie pod packages/editor/src).
- Sprawdzić źródło/rozdzielczość podglądu. Nie uruchamiać przygotowania JPG
  ani zapisu dokumentu przy zoom/pan. Zachować aktualne cache/font/asset loading.

## Etapy i odbiór

### Etap 1 — interaktywny Navigator w Storybooku

Pierwszy etap po poleceniu rozpoczęcia implementacji. Osobna strona story
z docelowym komponentem oraz lekkim demonstratorem zdjęcia i linijek.
Pokazać Fit, zoom/pan, miniaturę, suwak, presety, zwinięcie, disabled/empty,
pion, panoramę i małe zdjęcie. Wykorzystać istniejące lokalne zdjęcia testowe.
Robocza wysokość i układ mogą zmienić się po ocenie; oznaczyć story jako propozycję.
Można zbudować potrzebne czyste funkcje geometrii, ale nie integrować jeszcze
z produkcyjnym PhotoWorkspace. Oddać działające story i listę decyzji do testów.
**Punkt zatrzymania: ocena designu i zachowania przez użytkownika.**

### Etap 2 — model widoku i interakcje w edytorze

Po poleceniu następnego etapu: wspólna geometria, stan per zdjęcie, Z,
wheel/pinch/pan, linijki i konflikty z drag warstw/marginesów. Testy jednostkowe
geometrii i przejść stanu. Zachować istniejący renderer i eksport.
**Punkt zatrzymania: ocena sterowania, Fit/100%, linijek i limitów.**

### Etap 3 — pełna integracja i regresja

Po poleceniu następnego etapu: zaakceptowany Navigator w sidebarze, rzeczywista
miniatura kompozycji, stany ładowania/błędu, dokumentacja, pełna weryfikacja.
Dodać stany do istniejących kompozycji wizualnych; nie zwiększać liczby testów
przeglądarkowych/profili bez uzgodnienia. Oddać checklistę web/desktop.
**Punkt zatrzymania: końcowa ocena funkcji.** Git i wydanie osobnymi poleceniami.

## Kryteria akceptacji i dowody

Makieta zaakceptowana przez użytkownika 2026-11-04; kolejne polecenie objęło
podłączenie do aplikacji. Etapy 2/3 połączone w jeden odbiór działającego edytora.
Akceptacja końcowa gestów i integracji: brak.

Źródła: `codex/photo-navigator`, baza `ed13006`. Przygotowana wersja
`0.7.0-beta` i lokalny tag `v0.7.0-beta` zgodnie z poleceniem użytkownika.
Brak zgody na merge/push/publikację. Otwarte kontrole ręczne pozostają poniżej.
Aplikacja: http://localhost:3000. Story komponentu:
http://localhost:6006/?path=/story/photo-session-photo-navigator--playground.
Changelog `0.7.0-beta` opisuje dodaną funkcję; Unreleased jest puste.
Pięć manifestów ma wspólną wersję 0.7.0-beta; lockfile nie zawiera wersji produktu.
Format presetów v1 pozostaje bez zmian. Wzorce empty/About pokazują 0.7.0-beta
w stopce; obejrzano expected/actual/diff — zmienił się wyłącznie numer wersji.

Dowody bieżącej integracji:

- PASS: typecheck, lint, check:tokens oraz 493 testy Vitest (72 pliki), w tym
  21 testów geometrii, pary Z, resize, pamięci per zdjęcie i adaptera wheel/OS.
- PASS: istniejący test eksportu JPG (1/1), bez zmiany wzorca eksportu.
- PASS: sześć istniejących scen Chromium desktop po świadomej aktualizacji
  wzorców dla zaakceptowanego Navigatora. Obejrzano expected/actual/diff wszystkich
  scen przed zapisem. Zmiany dotyczyły sidebara i jego scrolla; zdjęcie i About
  pozostały wizualnie bez zmian. W istniejących scenach prepared/graphic
  doprecyzowano scroll, aby nadal pokazać Navigator/listę warstw i ustawienia grafiki.
  Nie dodano testu ani profilu. Nowe pełne wzorce obejrzano po zapisie.
  Prepared obejmuje też niedostępną strzałkę zmniejszania przy ułamkowym Fit
  poniżej całkowitego minimum ręcznego zoomu (różnicę expected/actual/diff obejrzano).
- PASS: końcowe `pnpm check` (format, wersje, tokeny, lint, typy, 493 testy,
  eksport JPG, sześć scen wizualnych i build web) oraz build-storybook.
- PASS: natywny smoke macOS po kompilacji desktopu: import/przełączanie zdjęć,
  JPG/ZIP, konfiguracja, okna i Settings. Zweryfikowano końcowe źródła po
  korektach DPR, cache miniatury, UI oraz zaokrąglania zoomu.
- PASS, kontrole Chromium w aplikacji: Fit/100%, Z, Spacja-pan, MMB-pan,
  scroll, Cmd-wheel, Escape podczas pan; brak zmiany miniatury i Undo przy
  nawigacji; niezależne widoki dwóch zdjęć; wpisywanie Z/Spacji w edytorze tekstu;
  drag marginesu w Fit; drag warstwy i Undo na DPR 2; małe zdjęcie Fit=100% na
  DPR 2; pole % ze strzałkami 1 (klawiatura i przyciski), aktywne Fit/100%,
  wspólna grupa, brak outline viewportu i brak wpisów Undo po zmianie pola %;
  ręczny zoom z pola/scrolla zaokrąglany (100,5% → 101%), małe delty wheel
  akumulowane, Z przywraca dokładny Fit; lokalne strzałki/Home/End suwaka
  działają przy całkowitych procentach; +/− nie zmieniają zdjęcia;
  przy 800% canvas nadal 2112×1704 px (viewport 1056×852 CSS px, DPR 2).
- Implementacja: ograniczona geometria Stage, podgląd oryginału gdy wymaga tego
  zoom/DPR, miniatura z klonu wspólnej sceny bez zaznaczeń i placeholderów.
  Zoom/pan nie są zależnościami rasteryzacji miniatury ani przygotowania JPG.
  Stany widoku są w osobnym module i nie trafiają do historii dokumentu.

Otwarta ocena ręczna: rzeczywisty trackpad/pinch i jego adapter na docelowych OS,
sterowanie na Windows/Linux, odbiór 100% na fizycznej Retinie, wszystkie
kombinacje marginesów/jednostek przy zoom oraz pointercancel/blur podczas różnych
rodzajów drag. Adapter platformowy jest przetestowany jednostkowo; nie zastępuje
fizycznych gestów. Brak własnych skrótów +/− do zoomu zdjęcia (potwierdzone z użytkownikiem).
Motyw obecnego UI sprawdzony; osobnej oceny innych motywów brak.

Do odbioru: wygoda zakresu minimum/Fit–800%, kroków przycisków, pary Z,
przypinania linijek i gestów. UI zachowuje zaakceptowany układ makiety:
miniatura 160 px. Korekty użytkownika: pole % z krokiem 1, wspólna grupa
Fit/100%/NumberField i aktywne przyciski, bez trzeciego presetu i dodatkowych
opisów procentu; ikona z kolorem sekcji pozycjonowania.
Obszar roboczy zachowuje fokus dla skrótów bez widocznego outline (decyzja użytkownika).
100% nadal oznacza piksel CSS, również na Retinie. Dokumentacja trwałego
zachowania jest w USER_GUIDE/PRODUCT/DESIGN_SYSTEM; plan i wpis NTH pozostają
otwarte do końcowej akceptacji.

Aktualizować tę tabelę po każdym etapie, nie utożsamiać testów z akceptacją.

| AC    | Obserwowalne zachowanie                                        | Weryfikacja                                                                     | Stan integracji                                                |
| ----- | -------------------------------------------------------------- | ------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| AC-01 | Fit pokazuje całość, maks. 100%, z dotychczasowym układem      | Testy geometrii; story małego zdjęcia; ocena DPR 1/2                            | PASS geometria/DPR2; odbiór ręczny otwarty                     |
| AC-02 | Zoom pod kursorem zachowuje punkt, pan respektuje granice      | Testy obu osi, panoramy/pionu, min/max; ręcznie wheel i trackpad                | PASS geometria i wheel Chromium; fizyczny pinch not-run        |
| AC-03 | Miniatura i obrys wiernie mapują fragment; drag bez skoku      | Testy mapowania i interaktywne story                                            | PASS geometria/drag/miniatura; odbiór otwarty                  |
| AC-04 | Z spełnia wszystkie sekwencje tabeli, pauza nie dzieli akcji   | Testy maszyny stanu, no-op, presetów, blur, resize i zmiany zdjęcia             | PASS model Z i skrót w Chromium                                |
| AC-05 | Linijki i marginesy zgadzają się z obrazem przy zoom/pan       | Stories i testy przeliczeń wszystkich jednostek/link modes; uchwyty na brzegach | PASS podstawowy drag i demonstrator; pełna macierz not-run     |
| AC-06 | Gesty nie ruszają warstw, nie przejmują tekstu i Undo          | Testy interakcji; ręcznie fokus, MMB, Spacja, Escape, blur, pointercancel       | PASS Spacja/MMB, tekst, Escape, Undo; dalsze przypadki not-run |
| AC-07 | Widok per zdjęcie; dokument/presety/eksport/historia bez zmian | Testy izolacji stanu, istniejący test JPG, ręcznie Undo i przełączanie zdjęć    | PASS dwa zdjęcia, JPG, desktop JPG/ZIP                         |
| AC-08 | Czytelny Navigator i dostępne kontrolki w obu motywach         | Storybook, sześć scen wizualnych, małe okno, klawiatura kontrolek               | PASS Storybook i sześć scen; odbiór otwarty                    |
| AC-09 | Zoom nie tworzy ogromnego canvasu ani nie odświeża JPG         | Inspekcja renderowania/dependencies; ręcznie duże zdjęcie przy 800%             | PASS DPR2/800% i inspekcja zależności                          |
| AC-10 | Cmd na macOS, Ctrl na Windows/Linux, również web               | Testy adaptera platformy; rzeczywiste środowiska oznaczać pass/not-run          | PASS testy OS; fizyczny Windows/Linux not-run                  |

Etap 1: typecheck, lint, testy zmienionej logiki, build-storybook i oględziny
story. Zmiany UI wymagają pnpm test:visual: sześć istniejących scen Chromium.
Etapy 2/3: wymagane odpowiednie kontrole projektu; przed końcowym odbiorem
pnpm check i build-storybook, desktop smoke z sesją graficzną macOS oraz ręczne
sprawdzenie gestów. Desktop od pierwszej próby z require_escalated, testy desktop
oraz przeglądarkowe kolejno. Sprawdzić expected/actual/diff; nie regenerować
wzorców tylko dla przejścia testów. Jeden istniejący test JPG, bez nowych E2E
bez zgody. Brak właściwego środowiska oznacza not-run, nie pass.

W przekazaniu etapu podać stan źródeł/build, wyniki AC, otwarte problemy,
link do story/aplikacji i krótką checklistę. Szczególnie pokazać do oceny:
100% na Retinie, zakres 25/Fit–800%, grupowanie Z, kroki przycisków, przypinanie
linijek i scroll/trackpad. Po akceptacji zastąpić wartości robocze decyzjami.
Po zamknięciu całego zadania przenieść trwałe zachowanie do USER_GUIDE/PRODUCT,
usunąć wykonany wpis NTH i ten plan, zachowując nierozwiązane dowody audytu.
