# Uproszczenie testów FrameNote — plan wykonawczy Luna/Sol

## 1. Stan, autoryzacja i cel

- Data: 2026-11-03. Stan: **plan gotowy, implementacja nieuruchomiona**.
- Użytkownik chce drastycznie ograniczyć Playwright, zachować wartościowe unity
  i integracyjne oraz usunąć testy nadmiarowe po zmianach agentowych.
- Uzgodniony kierunek: kilka screenshotów całej aplikacji i jeden reprezentatywny
  eksport JPG. Bez macierzy przeglądarek, zdjęć, presetów i fontów.
- Bieżące polecenie obejmuje przygotowanie planu. Przyszłe polecenie wykonania
  tego planu autoryzuje jeden etap implementacji z poniższymi punktami kontrolnymi;
  nie wymaga akceptacji każdego punktu osobno. Nie oznacza zgody na commit/push.
- Zakres: testy, konfiguracje, skrypty uruchamiania, aktualna dokumentacja testów.
  Jedyny dopuszczony porządek w kodzie aplikacji: usunięcie potwierdzonej martwej
  funkcji `insertToken`. Bez zmian zachowania produktu, UI, zależności i formatu v1.
- Aktualny punkt odniesienia: commit `35528fd`, produkt `0.4.2-beta`.
  Przy rozpoczęciu sprawdzić ponownie; nie przywracać starego stanu repo.
- Podczas planowania istniała cudza zmiana `docs/plans/update-notification.md`.
  Zachować ją i wszystkie inne niezwiązane zmiany.
- Brak podbicia wersji, changeloga wydania, tagów, publikacji i instalacji aplikacji.
  Reguły: `.agents/skills/maintain-versioning/SKILL.md`. To zadanie testowo-narzędziowe,
  nie etap rozwoju funkcji aplikacji.

## 2. Zweryfikowany punkt wyjścia

| Zestaw          | Liczba przypadków/uruchomień | Stan i uwagi                                                                       |
| --------------- | ---------------------------: | ---------------------------------------------------------------------------------- |
| Vitest          |            449, w 65 plikach | 449 passed, 0 failed, 0 skipped; około 1,3 s według raportu pojedynczego przebiegu |
| E2E             |            188, w 34 plikach | 94 scenariusze × Chromium/WebKit; część nadal oczekuje usuniętego RetiredDisplay   |
| Screenshoty UI  |                           27 | 9 scen × 3 profile                                                                 |
| Glass/Storybook |                           12 | 6 scen × 2 silniki; obejmuje dawny prototyp                                        |
| Razem           |                          676 | Bez osobnych skryptów Electron i smoke testu launchera Windows                     |

Wcześniejsze 257 oznaczało definicje zwrócone przez statyczne `vitest list`,
nie przypadki po rozwinięciu `it.each`/`describe.each`. Nie powielać tej pomyłki.
Nie utożsamiać liczby testów, asercji, plików i uruchomień w różnych profilach.

Dowody audytu zapisano tymczasowo w `/tmp/framenote-vitest-results.json` oraz
`/tmp/framenote-test-inventory.txt`; mogą już nie istnieć. Plan nie zależy od nich.
Pełny Vitest uruchomiono bezpośrednio przez lokalny runner, ponieważ `pnpm`
próbował automatycznie przebudować zależności i zatrzymywał się na braku TTY.
Nie naprawiać tego przez automatyczne kasowanie `node_modules` ani zmianę lockfile.

## 3. Docelowy zestaw i komendy

| Polecenie               | Docelowe znaczenie                                                                            |
| ----------------------- | --------------------------------------------------------------------------------------------- |
| `pnpm test:unit`        | Wszystkie pozostałe Vitest: unit, integracja, narzędzia; zachować alias dla CI                |
| `pnpm test:e2e`         | Dokładnie 1 eksport JPG, Chromium                                                             |
| `pnpm test:visual`      | Dokładnie 6 pełnych screenshotów, `chromium-desktop`                                          |
| `pnpm test`             | Sekwencyjnie Vitest → eksport → screenshoty; bez Storybooka/Electrona                         |
| `pnpm check`            | Dotychczasowe statyczne kontrole, nowy mały `pnpm test`, build                                |
| `pnpm test:desktop`     | Krótki smoke: start → import → natywny zapis JPG → zamknięcie                                 |
| `pnpm test:desktop:dev` | Pozostaje narzędziem diagnostycznym tylko przy zmianach uruchamiania/HMR; poza rutynowym gate |

Zachować komendy report/review i kontrolowanego update screenshotów. Usunąć
`test:glass-trial`. `--all-projects` może pozostać kompatybilnym aliasem jedynego
profilu, lecz nie może przywracać WebKit/compact. Dokumentacja ma to jasno mówić.
Nie tworzyć nowych runnerów, frameworków, coverage gate ani osobnych projektów
Vitest tylko dla kosmetycznego rozdzielenia unit/integration/tools. W dokumentacji
wyjaśnić mieszany zakres `test:unit`; cały zestaw jest tani.

## 4. Playwright — dokładne decyzje

### 4.1 Sześć pełnych ekranów

Zastąpić zawartość `tests/visual/smoke.spec.ts` poniższymi scenami. Użyć istniejących
helperów z `tests/visual/helpers.ts`, fixture zdjęcia wildlife i mechanizmu importu
presetu z `tests/visual/fixtures/graphics.ts`. Dodać tylko niewielki wspólny fixture
przygotowanej sesji, jeżeli jest potrzebny. Każdy test ma własny kontekst.

| Nazwa testu              | Przygotowanie i jedno porównanie całego okna                                                                                                    |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `empty editor`           | Pusta aplikacja, akcje, header, canvas                                                                                                          |
| `prepared photo session` | Zdjęcie, 3 warstwy, rolka z dwoma wpisami, aktywna warstwa i podstawowy inspektor; drugie zdjęcie może używać tych samych bajtów pod inną nazwą |
| `font panel`             | Przygotowane zdjęcie, otwarty rzeczywisty panel fontów, widoczne próbki gotowe do renderowania                                                  |
| `metadata panel`         | Przygotowane zdjęcie i otwarty panel tagów: kategorie, wyszukiwanie, lista                                                                      |
| `graphic settings`       | Grafika SVG/PNG w treści, zaznaczona i widoczny inspektor jej ustawień                                                                          |
| `About`                  | Otwarty rzeczywisty dialog About nad aplikacją                                                                                                  |

- Jeden screenshot/test, 1440 × 900, DPR 1, macOS/Chromium, software renderer
  zgodnie z istniejącym profilem. Nie dodawać klipów, miniatur i wariantów.
- Usunąć `tests/visual/licenses.spec.ts`: About przenieść do powyższego zestawu;
  czytnik licencji nie ma osobnego screenshotu. Testy plików licencji Vitest zostają.
- Usunąć osobne sceny photo/editor, three layers, photo roll, hover marginesu
  i unavailable font; ich część wizualną obejmuje kompozycja lub kontrola ręczna.
- Neutralny kursor, wyłączone animacje/caret, stała lokalizacja i strefa czasowa.
  Czekać na fonty, obrazy, gotowy eksport i widoczność panelu, nie na stałe opóźnienia.
- W konfiguracji zachować `retries: 0`, `workers: 1`, `updateSnapshots: 'none'`,
  świeży serwer (`reuseExistingServer: false`) i trace na błąd.
- Początkowo zachować ścisłość istniejących screenshotów. Jeśli identyczny kod
  daje różnice: obejrzeć obrazy i naprawić gotowość/środowisko. Dopiero udowodnione
  drobne różnice rasteryzacji uzasadniają małą, opisaną tolerancję. Nie maskować UI.

### 4.2 Jeden eksport

Utworzyć `e2e/export-smoke.spec.ts`, jeden test `exports representative composition`.
Zanim usuniesz stare testy, wykorzystaj ich gotowe importy, obsługę download i fixture.
Nie przepisywać parsera JPEG ani silnika renderowania na potrzeby testu.

- Jedno istniejące zdjęcie `wildlifeFixture`, bez generowania nowych fotografii.
- Jeden stały preset v1, przygotowany jako dane, nie wielominutowe klikanie:
  3–4 warstwy z tekstem literalnym i metadanymi `{author}`/`{exposure}`, fontem
  Montserrat, SVG oraz PNG z lokalnych fixture. Jedna warstwa Glass, druga z tłem
  kolorowym; reprezentant pozycji Anchor i Custom. Elementy mają być czytelne,
  nie przykrywać się całkowicie i faktycznie pojawiać się w wynikowym obrazie.
- Stałe rozmiary, kolory, jakość JPG (np. 95) oraz jawna polityka metadanych.
  Nie polegać na presetach wbudowanych i zmiennych domyślnych wartościach UI.
- Import zdjęcia i presetu przez publiczne wejścia aplikacji; oczekiwanie na gotowość;
  jeden download przez przycisk Export JPG.
- Sprawdzić zdekodowanie JPG, wymiary oryginału i niepuste dane. Sprawdzić nazwę
  pobranego pliku, jeśli nie wymaga osobnego przepływu.
- Jedno porównanie całego zdekodowanego JPG do zatwierdzonego obrazu wzorcowego.
  Nie wystarczy stwierdzenie, że plik istnieje lub zaczyna się od `ffd8`.
- Preferować standardowe porównanie obrazu Playwright: dekodowanie JPG do PNG
  w przeglądarce, porównanie bufora PNG i standardowe expected/actual/diff.
  Można uprościć/reużyć `e2e/photo-export-image.ts`, ale usunąć automatyczne
  zapisywanie brakujących wzorców w zwykłym run i ręczne skanowanie milionów pikseli,
  jeśli zastępuje je standardowy matcher. Bez nowej zależności do obrazów.
- Start od porównania ścisłego w ustalonym środowisku; ewentualna tolerancja
  wymaga opisania obserwacji, nie zwiększania aż test przejdzie.
- Nie sprawdzać w tym teście wszystkich jakości, anchorów, orientacji, ZIP,
  przeładowania presetów, viewportów i fontów. Ich osobne E2E usuwamy świadomie.

W `playwright.config.ts` zostawić wyłącznie Chromium, 1 worker, 0 retries również
w CI, jawne stałe parametry renderowania oraz `updateSnapshots: 'none'`.
Nie współdzielić starego serwera aplikacji. Wzorce zależne od OS/profilu.
Instrukcja celowego tworzenia nowego wzorca musi wskazywać ten jeden test/projekt.

### 4.3 Usuwanie starych zestawów

- Usunąć wszystkie dotychczasowe `e2e/*.spec.ts` po utworzeniu nowego testu eksportu.
  Oczekiwany finalny stan: tylko `e2e/export-smoke.spec.ts` jako spec E2E.
- Przejrzeć referencje do helperów `caption-helpers.ts`, `sidebar-helpers.ts`,
  `photo-export-image.ts`; usunąć wyłącznie te, których nowy zestaw nie używa.
- Usunąć `tests/browser/canvas-glass.spec.ts` i `canvas-glass.config.ts` oraz skrypt
  `test:glass-trial`. Nie usuwać funkcji Glass ani produkcyjnych stories.
- Usunąć śledzone wzorce tylko usuniętych testów/profili; pozostałe fotografie
  w `tests/fixtures` zachować — używają ich Vitest i Storybook.
- Nie zostawiać starego zestawu jako `.skip`, katalogu archiwalnego, ukrytego globu
  ani opcjonalnego wielkiego gate. Historia Git wystarcza.
- Nie kasować cudzych lokalnych raportów/trace jako części porządkowania repo.

## 5. Vitest — ograniczony, konkretny pakiet zmian

Nie przeprowadzać kolejnego pełnego audytu. Wykonać poniższe decyzje; inne testy
zostawić, chyba że usunięty import wymaga mechanicznej korekty.

| Plik (względem repo)                                        | Operacja                                                                                                                                                                                                                                                                                     |
| ----------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/editor/src/features/caption/insert-token.test.ts` | Usunąć 3 testy `insertToken`, zachować test `usedTokens`. Przed usunięciem funkcji z sąsiedniego `.ts` ponownie sprawdzić wszystkie referencje `rg`; jeśli pojawił się konsument, zostawić funkcję i testy oraz opisać zmianę stanu                                                          |
| `packages/editor/src/domain/layer-background.test.ts`       | Usunąć 2 testy kopiujące domyślne ustawienia Glass/Color. Zachować geometrię, konwersję jednostek, niezależność kopii i walidację presetów; usunąć nieużywane importy                                                                                                                        |
| `packages/editor/src/domain/presets.test.ts`                | 21 kolorów round-trip zastąpić 3 jawnymi reprezentantami: `caption-white`, `caption-dark-gray`, `#AABBCC`. Zachować 4 wyrównania i pozostałe przypadki. Usunąć nieużywane importy palet                                                                                                      |
| `packages/editor/src/features/caption/layout.test.ts`       | Usunąć 9 symetrycznych przypadków `positions the measured block`; zachować 9 asymetrycznych z konkretnymi oczekiwanymi współrzędnymi. Skalowanie ograniczyć do `top-left`, `center`, `bottom-right` (9 → 3). Zachować wszystkie 9 przejść Anchor → Custom i przypadek zmiany wymiarów tekstu |
| `packages/editor/src/domain/fonts.test.ts`                  | Usunąć tylko `toHaveLength(25)`; zachować round-trip katalogu, dostępność wariantów i nieznany font                                                                                                                                                                                          |
| `packages/editor/src/domain/builtin-presets.test.ts`        | Usunąć wymóg dokładnej listy nazw/kolejności/liczby. Zachować niepustą bibliotekę, unikalność ID, poprawność round-trip, aktywnej warstwy, tokenów i zasobów. Poprawić nazwę testu; nie kopiować całego katalogu do expected                                                                 |
| `packages/editor/src/domain/font-style.test.ts`             | W istniejącym teście rzeczywiście usunąć `fontStyle` z serializowanych danych i sprawdzić odczyt z domyślnym normal. Zostawić round-trip italic. Nie zmieniać formatu produktu, żeby dopasować test; ujawnioną niezgodność zgłosić                                                           |

Oczekiwana redukcja: 3 + 2 + 18 + 15 = **38 przypadków**, 449 → **411**,
jeśli punkt wyjścia się nie zmienił. Nie scalać przypadków w pętlę tylko dla licznika.
Nie usuwać testów granic Unicode/nazw plików, metadanych, async, rollback,
instalacji, wydania, ZIP, logo ani kompatybilności. Logo nadal ma konsumentów
w renderowaniu i podglądzie; nie jest martwe mimo starszej nazwy.

Testy narzędzi mogą pozostać w tym samym przebiegu Vitest: ich rozdzielenie nie
daje istotnej oszczędności, a zwiększa liczbę konfiguracji. Opisać ich rolę w docs.

## 6. Desktop i release — nie zgubić różnicy web/paczka

- `scripts/test-desktop.mjs`: uprościć do izolowanego profilu, uruchomienia aplikacji,
  importu jednej fotografii, zapisu JPG przez rzeczywisty most desktopowy (mock
  dialogu wyboru ścieżki jest dozwolony), odczytu pliku, kontroli wymiarów i braku
  błędów strony, zamknięcia procesu i sprzątnięcia temp w `finally`. Po późniejszej
  decyzji użytkownika rozszerzyć smoke o cztery fotografie, przełączanie rolki,
  batch ZIP, zmianę szerokości okna i round-trip fullscreen.
- Usunąć z tego smoke testu wybór Helvetica, kontrolę tooltipów, minimalizowanie,
  fullscreen i rozbudowane scenariusze presetów. Te interakcje są ręczne.
- Zachować `FRAMENOTE_PACKAGED`, guard środowiska, tymczasowy profil i brak dostępu
  do prawdziwej biblioteki użytkownika. Usunąć `--chrome-only` i nieaktualne opisy.
- `scripts/smoke-dist-desktop.mjs` już sprawdza paczkę na macOS/Windows/Linux.
  Utrzymać krótki start/import/natywny eksport; nie podłączać pełnego web E2E do CI.
  Czytnik licencji nie jest obowiązkową interakcją UI smoke; testy plików i
  `verify-desktop-assets.mjs` zostają. Wspólny niewielki helper obu smoke jest
  dozwolony tylko gdy usuwa realne powielenie, bez budowania frameworka.
- Zbadać odwołania do `desktop-window-chrome.mjs`, `desktop-tooltip-material.mjs`,
  `desktop-license-reader.mjs`; usunąć tylko osierocone helpery. Nie zmieniać kodu
  okna/tooltipów/licencji aplikacji w reakcji na usunięcie ich testów.
- Zachować `scripts/smoke-portable-windows.mjs`: sprawdza oddzielny launcher EXE,
  nie duplikuje uruchamiania unpacked aplikacji.
- Zachować `test-desktop-dev.mjs` jako jawne narzędzie diagnostyczne; nie uruchamiać
  w tej pracy, jeśli nie zmieniono HMR/dev launchera. Edytuje źródła tymczasowo.
- Workflow `.github/workflows/desktop-release.yml` nadal uruchamia Vitest i smoke
  paczek. Nie zmieniać platform, publikacji, podpisywania ani strategii wydania.

Skrypty desktopowe nie wchodzą do limitu 7 webowych przypadków. Wszystkie próby
Electrona na macOS od pierwszej próby przez `require_escalated`, zgodnie z AGENTS.
Nie usuwać znaczników środowiska. Brak uprawnień/sesji oznacza „niewykonane”.

## 7. Dokumentacja i reguły przeciw ponownemu rozrostowi

Zaktualizować `AGENTS.md`, `docs/DEVELOPMENT.md`, `docs/UI_VISUAL_REGRESSION_PLAN.md`,
sekcję testowania `docs/DESKTOP.md` i stosowne opisy w README. Usunąć obowiązek
wielu projektów przy zmianie wspólnego UI; nowa reguła to 6 scen w jednym profilu.
Nie przepisywać historycznych planów, changeloga ani historycznych wyników produktu.
W DESIGN_SYSTEM poprawić jedynie bieżące odwołanie do `--all-projects`, jeśli potrzebne.

Zapisać krótką politykę:

1. Reguły danych/geometrii i błędy zapisu testujemy najniższą sensowną warstwą.
2. Przed dodaniem testu wskazać nowy wykrywany błąd i sprawdzić istniejące pokrycie.
3. UI: rozbudować jedną z 6 kompozycji zamiast tworzyć osobny test każdej kontrolki.
4. Nowy E2E lub dodatkowy profil wymaga uzgodnienia zwiększenia zakresu z użytkownikiem.
5. Brak fixed sleep, retries maskujących błędy, automatycznej akceptacji baseline
   i testów odtwarzających dowolne wartości wyglądu bez wymagania produktu.
6. Jedna odpowiedzialność scenariusza. Fixture nie jest kopią implementacji.
7. Ręcznie przy zmianach sprawdzać drag/drop, fokus/klawiaturę, schowek, batch ZIP,
   pozostałe przeglądarki i natywne przejścia okna; nie obiecywać automatycznego pokrycia.

## 8. Kolejność wykonania — jeden etap, punkty kontrolne

1. **Stan repo:** wymagane dokumenty AGENTS, git status/branch, manifest, konfiguracje.
   Dla refaktoru użyć `codex/simplify-tests`, jeżeli nie ma już właściwego brancha.
   Nie resetować ani przenosić cudzych zmian. Nie wykonywać commita.
2. **Vitest:** wykonać dokładnie tabelę z sekcji 5, uruchomić dotknięte pliki,
   zapisać wynik/liczbę. Nie dodawać nowych testów do testowania usuwania testów.
3. **Nowy export + 6 scen:** najpierw przygotować działające replacementy,
   następnie usunąć stare specy, zbędne helpery i ich wzorce.
4. **Konfiguracje/skrypty:** jeden profil, 0 retries, świeży serwer, mały agregator.
   Sprawdzić listing: 1 E2E i 6 visual. Brak Glass w agregatorze.
5. **Desktop:** uprościć istniejące smoke, zachować wydanie/launcher Windows.
6. **Dokumentacja:** zaktualizować reguły i komendy, usunąć aktywne odwołania do
   wycofanych zestawów. Zapisać w tym planie rzeczywisty zakres, liczby i ograniczenia.
7. **Baseline i weryfikacja:** według sekcji 9; przekazać wynik do oceny użytkownika.

To nie są kolejne etapy produktowe wymagające osobnych zgód. Po poleceniu wykonania
całego planu realizować je kolejno; zgłosić tylko rzeczywistą blokadę lub konieczną
zmianę zachowania aplikacji. Nie uruchamiać subagentów bez osobnego zlecenia.

## 9. Weryfikacja, wzorce i kryteria akceptacji

### Procedura

- Vitest: pełny przebieg z raportem JSON, liczyć `numTotalTests` i statusy wyników,
  nie długość statycznego `list`. Zapisać czasy jako obserwację, nie sztywny limit CI.
- Listingi Playwright przed pierwszym pełnym run: 1 E2E, 6 visual, jeden projekt
  w każdej konfiguracji. Brak `skip`, `fixme`, `.only` i dodatkowych projektów.
- Formatowanie zmienionych plików, lint, typecheck, check:tokens, check:version,
  build. Następnie nowy `pnpm check` jako finalna kontrola integracji poleceń;
  nie powtarzać wszystkich wcześniejszych komend bez potrzeby.
- Na macOS przygotować nowe wzorce tylko jawnie wybranych 7 scen. Zwykły run
  nie może tworzyć ani aktualizować wzorców. Stare sceny porównać z wcześniejszymi
  obrazami, nowe obejrzeć w pełnym rozmiarze; do oceny udostępnić obrazy lokalnie.
- **Nowy wzorzec nie jest dowodem poprawności sam w sobie.** Obejrzeć kompozycję,
  tekst, grafikę, tła i brak loaderów/błędów. Obrazy przygotowane przez agenta mają
  status kandydatów do akceptacji użytkownika; passing względem nich opisać osobno.
  Nie żądać zatwierdzenia przed przygotowaniem konkretnych obrazów do oceny.
- Po obejrzeniu kandydatów uruchomić 7 przypadków `--repeat-each=3`, sekwencyjnie
  dla obu konfiguracji. 21 wyników bez retry. To jednorazowy audyt stabilności,
  nie nowy koszt każdego release. Jeśli finalny `check` daje kolejny zwykły run,
  nie dodawać dalszych powtórzeń.
- Przy różnicy obejrzeć expected/actual/diff i trace. Nie podnosić timeoutów ani
  tolerancji bez wskazania przyczyny. Po dwóch nieudanych poprawkach tego samego
  problemu opisać dowody i blokadę zamiast kolejnych szerokich przeróbek.
- Desktop po browserach: `desktop:compile`, potem krótki smoke z wymaganym dostępem.
  Nie budować wszystkich paczek, nie uruchamiać release i nie instalować aplikacji
  tylko dla tego refaktoru. Cross-platform smoke w CI pozostaje nieweryfikowany
  lokalnie; jawnie odróżnić test skryptu od testu gotowego instalatora.

Jeśli `pnpm` blokuje lokalny runner automatyczną synchronizacją zależności, najpierw
sprawdzić `.nvmrc`/wersje i stan instalacji. Diagnostycznie dostępne są:

```sh
node node_modules/vitest/vitest.mjs run --reporter=json --outputFile=/tmp/framenote-tests-after.json
node node_modules/@playwright/test/cli.js test --list
node node_modules/@playwright/test/cli.js test --config=playwright.visual.config.ts --list
```

Bezpośredni Vitest potwierdza testy, ale nie dowodzi, że `pnpm check` działa.
Nie raportować gate jako passed, jeśli jego uruchomienie było zablokowane.

| AC    | Kryterium                                                                                     | Dowód do zapisania                                    | Stan                                                  |
| ----- | --------------------------------------------------------------------------------------------- | ----------------------------------------------------- | ----------------------------------------------------- |
| AC-01 | Zwykły Playwright ma dokładnie 7 przypadków i po jednym profilu Chromium w obu konfiguracjach | Listingi 1 + 6                                        | Spełnione                                             |
| AC-02 | 6 pełnych okien obejmuje uzgodnione widoki                                                    | Kandydackie obrazy, 18/18 przebiegów                  | Kandydaci gotowi do oceny użytkownika                 |
| AC-03 | Jeden JPG zawiera reprezentatywną kompozycję, poprawne wymiary i porównanie obrazu            | PNG expected, normalny przebieg 1/1                   | Spełnione; wzorzec do akceptacji                      |
| AC-04 | Stare specy, Glass gate i nieużywane baseline są usunięte, nie tylko wyłączone                | Diff, listing, wyszukanie referencji                  | Spełnione                                             |
| AC-05 | Vitest ma wykonane konkretne cięcia i poprawkę testu starszego `fontStyle`                    | JSON: 426 passed, 0 failed, 0 skipped                 | Spełnione; liczba różni się od prognozy               |
| AC-06 | Zwykłe testy nie zapisują baseline; brak retry/fixed sleep w nowych scenach                   | Obie konfiguracje, przegląd kodu                      | Spełnione                                             |
| AC-07 | 3 powtórzenia nowych scen przechodzą bez retry                                                | 18 wyników w tym samym środowisku                     | Spełnione                                             |
| AC-08 | Komendy i bieżąca dokumentacja zgadzają się, `check` używa małego zestawu                     | Lint, typy, version, tokens; `check` zatrzymał format | Częściowo; istnieje wcześniejszy problem formatowania |
| AC-09 | Smoke desktopu zachowuje izolację oraz sprawdza cztery zdjęcia, ZIP i natywną geometrię okna  | `desktop:compile` i smoke na macOS                    | Spełnione                                             |
| AC-10 | Bez zmian działania aplikacji, wersji, lockfile i cudzych plików                              | Końcowy diff i status                                 | Spełnione                                             |

## 10. Bilans docelowy i przekazanie

- Vitest: raport uruchomienia końcowego **426 passed**; prognoza 411 z audytu nie odtworzyła się i nie jest raportowanym wynikiem.
- Playwright web: z planowanych 227 uruchomień do **7 przypadków** (1 eksport + 6 scen UI).
- Suma z końcowego Vitest: **433** (426 + 1 + 6); licznik audytu 676 pozostaje historycznym punktem odniesienia.
- Osobne smoke desktop/launcher i diagnostyczny HMR jawnie poza tą sumą.
- Licznik nie jest celem nadrzędnym: nie usuwać wartościowych sprawdzeń, jeśli
  zmieniony stan repo uniemożliwia dokładnie taki wynik.

Końcowa odpowiedź wykonawcy: tabela przed/po, zmienione pliki/grupy, wyniki AC,
czas Vitest, dowody powtórzeń Playwright, obrazy do oceny, niewykonane kontrole,
stan git. Bez twierdzenia o zerowej flakiness na podstawie trzech przebiegów.
Bez commita, pushowania i automatycznego zaakceptowania wyglądu.

## 12. Wykonanie 2026-11-03

- Branch roboczy: `codex/simplify-tests`; punkt bazowy `35528fd`.
- Wykonano punkty 1–6 oraz przygotowano kandydackie wzorce; cudza zmiana
  `docs/plans/update-notification.md` pozostała nietknięta.
- Listing Playwright: 1 E2E i 6 UI, tylko Chromium; Glass gate usunięty.
- Vitest: 426/426, 0 pominiętych. Wcześniejsza prognoza 411 była niedokładna.
- E2E export: 1/1 po utworzeniu oczekiwanego PNG.
- Visual: 6 kandydackich PNG obejrzanych; 18/18 powtórzeń bez retry.
- Build web, `desktop:compile`, smoke desktop, lint, typecheck, version i tokeny
  zakończyły się powodzeniem.
- `pnpm check` zatrzymał się na `docs/EXPORT_VISUAL_TEST_PLAN.md`, który już
  przed zmianą nie przechodził Prettiera. Nie zmieniono tej niezwiązanej dokumentacji.
- Nie wykonano cross-platform smoke paczek ani `test:desktop:dev`. Brak zmian
  wersji, lockfile i changeloga wydania.
- Po ocenie smoke desktopu użytkownik poprosił o cztery zdjęcia. Rozszerzono go
  o selekcję aktywnej klatki, eksport ZIP i natywne zmiany geometrii; końcowy
  `pnpm test:desktop` zakończył się kodem 0. To asercje flow bez screenshotów;
  baseline’y pozostają częścią webowego zestawu wizualnego.
- Wzorce pozostają kandydatami. Użytkownik powinien obejrzeć 6 UI PNG i PNG
  eksportu przed ich zaakceptowaniem.

## 11. Prompt startowy dla Luna/Sol

> Wykonaj cały jeden etap refaktoryzacji opisany w
> `docs/plans/test-suite-simplification.md`, od punktu kontrolnego 1 do 7.
> Plan jest zakresem wykonania; nie przeprowadzaj ponownego szerokiego audytu.
> Zachowaj 6 pełnych screenshotów UI, 1 test eksportu JPG i wartościowe Vitest;
> wykonaj konkretne cięcia z tabeli, uprość smoke desktopu i zaktualizuj instrukcje.
> Nie dodawaj wariantów/testów poza planem ani subagentów. Pracuj do zakończenia
> implementacji i dostępnej weryfikacji. Nowe wzorce przygotuj i obejrzyj, przedstaw
> jako kandydatów do mojej oceny. Zapisz postęp oraz wyniki AC w planie.
> Nie commituj, nie pushuj, nie publikuj i nie podbijaj wersji. Nie zmieniaj
> zachowania aplikacji, żeby dostosować ją do testu. Przy rzeczywistym błędzie
> produktu lub blokadzie środowiska przedstaw konkretny dowód i pozostały zakres.
