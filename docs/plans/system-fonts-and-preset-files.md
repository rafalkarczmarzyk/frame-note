# Fonty systemowe, okno desktopowe i nazwy plików presetów

## Stan i autoryzacja

- Stan: całość zaakceptowana 2026-11-01; wydanie 0.2.0-beta. Użytkownik zlecił squash merge, tag i push.
- Ustalenia pochodzą z rozmowy o fontach desktopowych i plikach presetów.
- Desktop: większe okno, lista fontów systemowych, czytelne nazwy plików.
- Web i modele wspólne: dowolne nazwy fontów w presetach, fallback i ostrzeżenia.
- Lista systemowych fontów wyłącznie w desktopie; użytkownik wykluczył katalog webowy.
- Branch zadania: `codex/system-fonts-and-preset-files`; zaakceptowane zadanie wprowadzamy squash commitem do `master`.
- Poza zakresem: dołączanie plików fontów do presetów, instalowanie fontów,
  publikacja aplikacji i wdrożenie webu.

## Wersja i zgodność

- Wersja bazowa przed zadaniem: `0.1.2-beta`.
- Prognoza: `0.2.0-beta`, funkcja zwiększa MINOR według maintain-versioning.
  Cały zakres jako jedno zadanie oznacza jedno podbicie przy wejściu do master.
  Przed wydaniem ponownie sprawdzić aktualną bazę i przyjęty zakres.
- Format presetów pozostaje v1: jawny wyjątek użytkownika od zamrożonej listy
  `fontFamily`. Dopuszczamy dowolną niepustą nazwę, bez migracji schematu.
- Stare presety nadal działają. Starsze aplikacje mogą odrzucać nowe nazwy.
- Czytelne nazwy plików nie zmieniają JSON ani ID. Nowy czytnik musi odczytywać
  zarówno stare nazwy z ID, jak i kebab-case; starszy czytnik wymaga nazwy z ID.

## Kryteria akceptacji

AC-01–15 zaimplementowane. Testy katalogu, fallbacku, nazw i operacji plikowych przeszły; końcowe testy funkcjonalne przeszły; ograniczenia regresji wizualnej opisano poniżej. Użytkownik zaakceptował cały zakres przed wydaniem.
„Ustalone” oznacza decyzję o zakresie, a nie ukończenie implementacji.

| AC    | Obserwowalne zachowanie                                                                                                                                                                                     | Status zakresu                                                     | Weryfikacja                                    |
| ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ | ---------------------------------------------- |
| AC-01 | Okno startuje większe i mieści się w dostępnym obszarze ekranu. Docelowo 2240 × 1560 jednostek logicznych, każdy wymiar ograniczony dostępnym obszarem ekranu; okno wyśrodkowane, bez pamiętania geometrii. | ustalone na podstawie pełnej rozdzielczości; potwierdzić wizualnie | desktop automatyczny i ręczny, mały/duży ekran |
| AC-02 | Desktop udostępnia fonty zainstalowane w systemie, także przez użytkownika, w kategorii System.                                                                                                             | ustalone                                                           | adapter/katalog unit, desktop ręczny           |
| AC-03 | System ma wyszukiwanie i podglądy; All obejmuje bibliotekę i system. Podglądy ładują się dla widocznych pozycji.                                                                                            | ustalone                                                           | unit, Storybook, przepływ                      |
| AC-04 | Używamy dostępnej odmiany, brakujące przełączniki Bold/Italic są zablokowane.                                                                                                                               | ustalone                                                           | unit wariantów, ręczny                         |
| AC-05 | Podgląd zdjęcia i JPG używają tego samego dostępnego fontu lub tego samego Montserrat jako zamiennika.                                                                                                      | ustalone                                                           | test renderowania/eksportu i ręczny            |
| AC-06 | Web i desktop odczytują dowolną niepustą nazwę fontu w v1; stare presety pozostają poprawne.                                                                                                                | ustalone, wyjątek v1                                               | fixtures i unit parsera                        |
| AC-07 | Niedostępny lub nierozpoznany font daje Montserrat; oryginalna nazwa pozostaje w modelu i zapisie.                                                                                                          | ustalone                                                           | unit, przepływ obu platform                    |
| AC-08 | Select fontu w edytorze warstwy, w zamkniętej kontrolce pokazującej aktualny wybór, zawiera oryginalną nazwę brakującego fontu oraz badge Unavailable obok niej, wewnątrz tej samej kontrolki.              | ustalone                                                           | Storybook, regresja wizualna, ręczny           |
| AC-09 | Jawny wybór dostępnego fontu usuwa ostrzeżenie; aktualizacja/Save as zapisuje nowy font. Zapis bez zmiany zachowuje oryginalny.                                                                             | ustalone                                                           | unit i trwałość po restarcie                   |
| AC-10 | Każdy preset ma osobny plik kebab-case; ID i oryginalna nazwa pozostają w JSON.                                                                                                                             | ustalone                                                           | unit i integracja plikowa                      |
| AC-11 | Konwersja upraszcza polskie litery, zmienia separatory na myślniki, scala je i usuwa skrajne, obsługuje nazwy puste i zastrzeżone.                                                                          | ustalone                                                           | parametryzowane unit                           |
| AC-12 | Limit podstawy to 180 znaków ASCII, potem sufiks i .json; kolizje bez względu na wielkość liter dostają -2, -3. Własne ID nie powoduje kolizji.                                                             | ustalone                                                           | unit granic i kolizji                          |
| AC-13 | Zmiana nazwy aktualizuje plik; odczyt starych plików nadal działa. Stare nazwy zmieniamy przy następnym zapisie danego presetu.                                                                             | ustalone                                                           | integracja i restart                           |
| AC-14 | Nieudany zapis/zmiana nazwy nie nadpisuje innego presetu i zachowuje dotychczasowy poprawny zapis.                                                                                                          | wymagane bezpieczeństwo zapisu                                     | integracja błędów, kolizji i odtwarzania       |
| AC-15 | Web nie listuje fontów systemowych i nie prosi o dostęp do nich. Preset z fontem spoza biblioteki zachowuje nazwę, pokazuje Unavailable i używa Montserrat.                                                 | ustalone                                                           | przepływ Chromium/WebKit i ręczny              |

## Etapy implementacji

1. Okno desktopowe (AC-01); commit roboczy c6168a5.
2. Wspólne v1, rozwiązywanie fontów i ostrzeżenia (AC-05–09); commit roboczy 796e63f.
3. Katalog systemowy desktopu i picker, zachowanie webu bez dostępu do fontów systemowych (AC-02–05, AC-15); commit roboczy 5569760.
4. Nazwy plików i bezpieczny zapis (AC-10–14); commit roboczy 537835f.
5. Końcowa weryfikacja obu platform i akceptacja całego zakresu.

## Decyzje i założenia do weryfikacji

- Potwierdzono: katalog systemowy wyłącznie w desktopie, również w Chrome/Edge web nie otrzymuje tej funkcji.
- Okno: użytkownik wskazał 2264 × 1574 px ze screenshota, dopuścił zaokrąglenie i podał „More Space, pełna rozdzielczość”. Przyjmujemy 2240 × 1560 jednostek logicznych, zakładając pracę w pełnej rozdzielczości bez skali 2×. Przy wdrożeniu potwierdzić rzeczywiste skalowanie i wygląd na monitorze użytkownika; nie uznawać deklaracji za pomiar skali. Wymiary ograniczamy niezależnie do workArea wybranego ekranu, następnie centrujemy. Pamiętanie geometrii odłożone do NTH-006.
- Potwierdzono: stare pliki zmieniają nazwę przy kolejnym zapisie danego presetu.
- Potwierdzono: brak odmiany systemowej oznacza użycie dostępnej i blokadę brakujących przełączników.
- Potwierdzono przez użytkownika 2026-11-01: biblioteka dołączona ma
  pierwszeństwo nad systemową rodziną o tej samej nazwie; ASCII-only nazwa pliku
  upraszcza łacińskie akcenty, inne nieobsługiwane znaki stają się separatorami;
  nie usuwamy automatycznie końcówki „json” wpisanej jako część nazwy presetu.
- Potwierdzono odczyt katalogu fontów ponownie po restarcie. Odświeżanie bez
  restartu i osobna obsługa wag poza istniejącym Regular/Bold nie należą do zakresu.
- Potwierdzono limit 180 znaków ASCII podstawy nazwy pliku.
- Próba odczytu skalowania przez system_profiler nie zwróciła danych monitorów;
  skali nie zmierzono. Ręczna ocena AC-01 potwierdzi dobrany rozmiar.
- 2026-11-01 użytkownik zlecił wszystkie etapy po kolei i commity robocze pomiędzy nimi, bez czekania na ocenę. To jawny wyjątek od bramek między etapami; nie jest zgodą na końcowy merge, wydanie lub push.
- Etap 2: 357 unit testów oraz test importu i jawnej zmiany fontu w Chromium/WebKit; nowa scena wizualna oczekuje na ocenę wzorca.

## Zestaw testów nazw do zachowania

1. Macro → macro.json.
2. Wildlife Night Photos → wildlife-night-photos.json.
3. Skrajne i wielokrotne spacje → macro-flowers.json.
4. Zażółć gęślą jaźń → zazolc-gesla-jazn.json.
5. Crème brûlée → creme-brulee.json.
6. Café w NFC/NFD → cafe.json.
7. Slash i backslash pomiędzy słowami → myślniki.
8. Znaki niedozwolone Windows → jeden separator w serii.
9. Podkreślenia i serie myślników → jeden myślnik.
10. Kropki otaczające Macro → macro.json.
11. Tabulatory i nowe linie → separatory.
12. NUL pomiędzy słowami → separator.
13. Emoji przy Macro Flowers → macro-flowers.json.
14. Próby ../ i backslash przed Macro → macro.json w katalogu presetów.
15. Pusto/same spacje/znaki/emoji → preset.json.
16. CON/NUL/COM1/LPT9 → prefiks preset-.
17. CONcert/COM10 → bez prefiksu.
18. Istniejące MACRO.json innego ID → macro-2.json.
19. Zajęte macro.json i macro-2.json → macro-3.json.
20. Aktualizacja tego samego ID → własna nazwa bez dodatkowego numeru.

Dodatkowo: 180/181 znaków, skrócenie powodujące kolizję, Unicode spoza alfabetu
łacińskiego, powtórzone ID oraz zachowanie przy błędzie zmiany nazwy/usuwania.

## Weryfikacja i wydanie

- Etap 1: build desktopowy `0.1.2-beta`, baza `a54b230`, dirty.
- Test desktopowy `pnpm test:desktop --chrome-only` przeszedł: okno
  x=800, y=265, 2240 × 1560; workArea x=0, y=30, 3840 × 2031.
  Kontrole nagłówka, 1440/800 px, minimalizacji i fullscreen również przeszły.
- `pnpm desktop:build`, lint, typy, formatowanie i 355 unit testów przeszły.
- Pełne `pnpm check`: 180/180 E2E przeszło, regresja wszystkich profili 14/18.
  Obejrzano expected/actual/diff czterech scen: trzy puste edytory różnią się
  wyłącznie stopką 0.1.0-beta → 0.1.2-beta, left margin hover ma znaną różnicę
  materiału etykiety (4810 px). Nie zmieniono wzorców. Testy szkła 12/12 i build Storybooka przeszły.
  Pełne pnpm check kończy się błędem wyłącznie z powodu powyższych różnic UI;
  nie zgłaszamy pełnego zielonego wyniku.
  Pierwsza próba była ograniczona uprawnieniami do lokalnych serwerów.
- Dodatkowa kontrola rzeczywistych opcji okna z main.cjs na mockach workArea:
  4K, 1080p, ujemny początek monitora, 640 × 480 — okno i minimum mieszczą się
  w obszarze. Nie zastępuje fizycznego sprawdzenia na drugim monitorze.
- Ręczna ocena AC-01: uruchomić `pnpm desktop`, sprawdzić wielkość i położenie
  okna na 4K oraz wygodę edycji poziomego zdjęcia. Po ręcznej zmianie rozmiaru
  zamknąć i uruchomić ponownie, sprawdzić powrót do rozmiaru startowego.
  Na mniejszym ekranie sprawdzić dopasowanie do dostępnego obszaru; takiego
  monitora nie zweryfikowano fizycznie. Akceptacja użytkownika oczekuje.
- Przy implementacji: pnpm check, testy plikowe i odpowiednie przepływy desktop/web,
  eksport JPG, Storybook oraz pnpm test:visual; dla wspólnych komponentów/styli
  także pnpm test:visual --all-projects. Obejrzeć każdą różnicę przed zmianą wzorców.
- Każdy etap: build/version/commit lub dirty, wyniki AC i krótka ręczna lista
  sprawdzenia; zapisać rzeczywistą decyzję użytkownika.
- Wydanie dopiero po akceptacji i odpowiedniej autoryzacji Git, zgodnie ze skillami
  change-workflow i maintain-versioning. Wpisy Unreleased powstają wraz z kodem;
  etap 1 ma wpis Changed w Unreleased. Brak commita, taga, pushowania lub wdrożenia.

## Źródła decyzji o wyłączeniu katalogu systemowego w webie

Sprawdzono 2026-11-01: Local Font Access wymaga obsługującej przeglądarki,
bezpiecznego kontekstu i zgody; nie stanowi uniwersalnej funkcji webu.

- https://developer.chrome.com/docs/capabilities/web-apis/local-fonts
- https://developer.mozilla.org/en-US/docs/Web/API/Window/queryLocalFonts

### Wyniki etapu 3

- 359 unit testów, typy, build desktopu i lint przeszły.
- Katalog Chromium zwrócił pustą listę; na macOS zastosowano natywny odczyt
  NSFontManager przez lokalny osascript, bez automatyzowania innych aplikacji.
- Rzeczywisty picker System / Helvetica i kontrole okna przeszły w Electronie.
- Odczyt katalogu jest buforowany do restartu; web nie ma takiego adaptera.

### Etap 4

- Kebab-case, 33 przypadki parametryzowane plus kolizje i testy plikowe.
- Zapis przekazuje ID jawnie zapisanych presetów, także bez zmiany JSON.
  Dzięki temu tylko zapisany preset zmienia starą nazwę z ID.
- Publikacja nowych nazw nie nadpisuje kolizji; kopie poprzednich plików
  umożliwiają rollback całego żądania. Zewnętrzne zmiany blokują nadpisanie.
- W razie awarii samego odzyskiwania kopie pozostają w katalogu i błąd wskazuje
  miejsce odzyskania. Weryfikacja końcowa zakończona; wyniki poniżej.

### Końcowa weryfikacja — wyniki

- Etapy 1–4 zapisane w commitach roboczych, bez podbicia wersji.
- 402 unit testy przeszły, w tym nazwy i rollback operacji plikowych.
- Pełny desktop z `--skip-native-transitions` przeszedł: System/Helvetica,
  JPG/ZIP, czytelna nazwa pliku i odczyt presetu po restarcie, izolacja renderera.
- Końcowa weryfikacja minimalizacji/fullscreen niewykonana: sesja macOS nie
  zwraca fokusu aplikacji. Dodano ograniczenia czasu i jawny tryb pomijania.
- Dodano porównanie eksportu JPG dla nieznanego fontu i jawnie wybranego
  Montserrat oraz scenę wizualną badge w selectcie. Nowe wzorce wymagają oceny.

### Podsumowanie końcowe i ocena ręczna

- Build webu, desktopu i Storybooka, lint, typy, formatowanie, tokeny i kontrola
  wspólnej wersji przeszły. Produkt pozostaje 0.1.2-beta na branchu zadania.
- Pełne E2E: 182/182 Chromium/WebKit, w tym identyczne bajty JPG dla brakującego
  fontu i jawnie wybranego Montserrat oraz znikanie badge po wyborze.
- Testy jednostkowe: 403/403 po dodatkowym sprawdzeniu zachowania kopii
  odzyskiwania, gdy samo wycofanie zapisu również ulega awarii.
- Glass: 12/12. Pełne pnpm check kończy się błędem wyłącznie zestawu Visual UI.
- Visual UI wszystkie profile: 14/21. Obejrzano expected/actual/diff czterech
  istniejących różnic (stopki i znana etykieta); trzy nowe sceny nie mają
  zaakceptowanych wzorców. Wzorców nie dodawano ani nie aktualizowano.
- Dla nowej sceny zapisano i obejrzano candidate.png w trzech profilach:
  release/visual-font-candidates/smoke-unavailable-font-inside-selector-<profil>/candidate.png.
  Nazwa i badge mieszczą się wewnątrz selecta, również w wariancie compact.
- Pełny desktop przeszedł z jawnym --skip-native-transitions; końcowe przejścia
  minimalizacji/fullscreen pozostają nieweryfikowane, ponieważ sesja nie oddaje
  aplikacji fokusu. Mniejszy fizyczny monitor również nie był sprawdzany.
- Po przeglądzie zastosowano wspólny InlineNotice do błędu katalogu oraz usunięto
  nieprawdziwą obietnicę ponowienia podglądu przez samo otwarcie pickera.

Do ręcznej oceny całego zakresu (bez akceptacji domniemanej):

1. Uruchomić pnpm desktop, otworzyć poziome zdjęcie i ocenić rozmiar 2240 × 1560;
   po ręcznym resize zamknąć i uruchomić ponownie, sprawdzić rozmiar startowy.
2. Wybrać System, wyszukać zainstalowaną rodzinę, sprawdzić podgląd i dostępne
   Bold/Italic oraz eksport JPG.
3. Zapisać preset z fontem systemowym, otworzyć go w webie: nazwa i Unavailable
   wewnątrz selecta, podgląd i JPG w Montserrat. Wybrać dostępny font i zapisać;
   potwierdzić nową nazwę fontu po ponownym otwarciu presetu.
4. Zapisać dwa presety o tej samej nazwie z polskimi znakami; sprawdzić kebab-case,
   sufiks kolizji, zmianę nazwy i odczyt po restarcie. Stary plik z ID powinien
   zmienić nazwę dopiero przy zapisie tego konkretnego presetu.
5. Ocenić obraz nowej sceny i zdecydować o utworzeniu jej wzorców. Ocena wyglądu
   nie zastępuje osobnego polecenia merge'a/pushowania.

Całość zaakceptowana przez użytkownika 2026-11-01. Wydanie 0.2.0-beta przygotowywane zgodnie z poniższą autoryzacją.

## Akceptacja i wydanie — 2026-11-01

- Użytkownik zaakceptował całość: „jest git, merguj, taguj i pushuj”.
  Obejmuje końcowy squash merge do master, wersję 0.2.0-beta, lokalny tag
  v0.2.0-beta i push master oraz tego taga do origin. Nie oznacza publikacji
  paczki desktopowej ani ręcznego wdrożenia webu.
- Nowa scena badge została zaakceptowana razem z implementacją; zapisujemy jej
  pierwsze wzorce oraz stopki z numerem wersji wydania. Znana różnica etykiety
  marginesu pozostaje bez aktualizacji wzorca.
- Wersja formatu presetów pozostaje v1 zgodnie z jawnym wyjątkiem użytkownika.

### Kontrole wydania 0.2.0-beta

- Zdalny master sprawdzono przez fetch; baza bez rozbieżności (a54b230).
- Pięć manifestów ma wspólną wersję 0.2.0-beta; lockfile nie zawiera
  zmienianej metadanej wersji tych projektów. Kontrola wzrostu wersji względem
  a54b230 przeszła; wersja i tag były wcześniej nieużywane.
- Zapisano i obejrzano zaakceptowane wzorce empty editor (stopka 0.2.0-beta)
  oraz unavailable font inside selector w trzech profilach.
- Końcowa regresja wszystkich profili: 20/21; jedyna różnica to wcześniejszy
  left margin hover Chromium desktop (4810 px). Tego wzorca nie zmieniono.
- Ponowny zestaw unit testów: 403/403. Build webu i typy przeszły w kontroli
  wizualnej; formatowanie i kontrola wersji również przeszły.
- Kod aplikacji poza wersją jest identyczny z zaakceptowanym zadaniem.
  Wyniki 182 E2E, 12 Glass i ograniczenie natywnych przejść okna pozostają aktualne.
