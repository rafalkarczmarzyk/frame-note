# Dziedziczenie i kopiowanie ustawień zdjęć

## Makieta kliszy — 2026-11-03

Użytkownik osobno zlecił interaktywną makietę w Storybooku: tekstowe Copy i Paste
pod każdą klatką, pokazywane na hover i przy fokusie klawiatury. Story:
`Photo session/FilmRoll → Prototype · Copy / Paste below frames`.
Operacje używają przykładowych nazw ustawień i nie przełączają aktywnego zdjęcia.
Wspólny FilmRoll ma opcjonalny slot akcji; aplikacja go nie używa.
To zaczęło się jako makieta; później użytkownik zlecił dodanie obu miejsc do
aplikacji. Header pozostaje bez tych akcji.

Weryfikacja makiety: typecheck, lint zmienionych plików i build Storybooka PASS.
Przeglądarkowa próba hover → Copy → Paste na nieaktywnym zdjęciu PASS;
zachowano wybór aktywnego zdjęcia i sprawdzono przykładowe ustawienia po zmianie
podglądu. Obejrzano zrzuty 1200 i 600 px. Regresja wizualna all-projects
uruchomiona na porcie 4191: 27 scen bez porównania z powodu braku wzorców darwin
(updateSnapshots: none). Nie dodawano wzorców. Produkcyjna funkcja nadal
niezrealizowana, a jej AC pozostają niewykonane.

## Stan i zakres

### Alternatywna makieta stopki sidebara — 2026-11-03

Korekta użytkownika: usunięto komunikat spod przycisków dla czytelności.
Stopka zawiera wyłącznie dwa przyciski, bez dodatkowej linii tekstu.
Kolejna korekta użytkownika: stopka korzysta ze wspólnego materiału szkła
(półprzezroczyste tło i blur). Nakłada się na przewijaną zawartość; dolny padding
pozwala wysunąć ostatnie kontrolki ponad stopkę. Przy ograniczeniu przezroczystości
obowiązuje istniejący nieprzezroczysty fallback. Sprawdzono stałą pozycję podczas
przewijania oraz wygląd przy 1440×900 i 1100×700; typecheck i lint PASS.

### Feedback po kopiowaniu i wklejaniu — 2026-11-03

Użytkownik zaakceptował implementację: globalny tekst feedbacku, pozycjonowany
w granicach canvasu, 12 px od dołu. Komunikat wskazuje źródło lub cel i znika
po 2 sekundach. Jest niezależny od miejsca kliknięcia (sidebar/klisza), bez tła.
Typecheck, lint i build aplikacji PASS; testów nie uruchamiano.

Po ocenie zrzutu użytkownik wskazał, że toast był liczony względem samego zdjęcia,
przez co był przesunięty w lewo. Przeniesiono go na kontener całego ciemnego
obszaru roboczego (canvas i klisza), który ma pozycję względną; toast jest
wyśrodkowany nad dolną krawędzią. Typecheck i build PASS.

Po kolejnej ocenie użytkownik doprecyzował, że dolną krawędzią odniesienia ma być
szare tło canvasu nad kliszą. Toast jest zakotwiczony bezpośrednio do względnego
kontenera canvasu, wyśrodkowany poziomo i odsunięty 32 px od jego dołu. Klisza nie
wchodzi do układu ani pomiaru.

Użytkownik polecił oczyścić Storybook po wdrożeniu. Usunięto prototypy Copy/Paste
z FilmRoll i TestPhotos oraz nieużywany styl ich feedbacku. Pełna sesja pokazuje
teraz prawdziwy import wielozdjęciowy i dokumentuje aktualne akcje; FixedFooter
został jako przykład współdzielonego układu. Typecheck, lint i build Storybooka PASS.

Na osobne polecenie użytkownika dodano wariant w Storybooku:
`Screens/TestPhotos → Prototype · Sidebar settings footer`. Dwa przyciski
Copy settings / Paste settings znajdują się w stałej stopce poza przewijaną
zawartością panelu. W tym wariancie nie dodajemy ich do headera.
Makieta kopiuje rzeczywisty dokument edytora do pamięci i pozwala wkleić go
po próbnych zmianach. Nie jest to wdrożenie funkcji do aplikacji ani ostateczna
decyzja o położeniu akcji. Domyślny układ aplikacji pozostaje bez stopki.

ToolSidebarFooter ma przykład `Sidebar & panels/ToolSidebar → Fixed Footer`.
Kontrola typów, lint i build Storybooka PASS. Próba w przeglądarce potwierdziła
stan disabled przed Copy, komunikaty Copy/Paste i nieruchomą pozycję stopki
podczas przewijania. Obejrzano zrzuty przy 1440×900 i 1100×700.
Regresja sceny photo roll w trzech profilach ponownie nie wykonała porównania
z powodu brakujących wzorców macOS; nie aktualizowano wzorców.

- Stan: implementacja, 2026-11-03. Użytkownik zlecił oba miejsca ze Storybooka
  w aplikacji. Header pozostaje bez akcji.
- Cel: nowe zdjęcia przejmują bieżący układ aktywnego zdjęcia; użytkownik może
  ręcznie skopiować i wkleić układ między istniejącymi zdjęciami.
- Wspólny zakres web i desktop: sesja zdjęć, import, sidebar, klisza i eksport.
- Bez automatycznej synchronizacji, wielokrotnego zaznaczania, wyboru części
  ustawień, zapisu nowego presetu i akcji w headerze.
- Proponowany branch implementacji: `codex/photo-settings-copy-paste`.
  Obecnie master zawiera niezwiązane lokalne zmiany; zachować je i przed
  implementacją uzgodnić stan bazy przez inspekcję, bez włączania ich do zadania.

## Decyzje użytkownika i propozycje

- 2026-11-03: użytkownik wymaga dziedziczenia ustawień przy dodawaniu kolejnych
  zdjęć; następnie zlecił stopkę sidebara i przyciski pod klatkami kliszy. Nie
  dodawać akcji do headera. Późniejsze zmiany nie propagują się automatycznie.

## Zachowanie

### Import

Po zatwierdzeniu edytowanych pól, przed rozpoczęciem importu, utworzyć niezależny
snapshot aktualnego dokumentu. Każdy poprawnie dodany plik w tej operacji otrzyma
własną kopię tego samego snapshotu. Dotyczy pojedynczego pliku i wielu plików,
także pierwszego importu do pustego edytora. Źródłem jest aktualny stan edytora,
łącznie z niezapisanymi zmianami, a nie definicja zapisanego presetu.

Nie pobierać źródła ponownie po automatycznym aktywowaniu pierwszego importowanego
zdjęcia. Błąd pliku lub anulowanie zachowuje już dodane zdjęcia i dotychczasową
obsługę błędów; kolejne poprawne pliki korzystają z początkowego snapshotu.
Zachować dotychczasową zasadę aktywowania pierwszego poprawnie dodanego zdjęcia.

### Copy / Paste

- Copy settings zapisuje snapshot układu aktywnego zdjęcia w pamięci aplikacji.
  Późniejsza edycja źródła nie zmienia tej kopii. Kolejne Copy zastępuje kopię.
- Paste settings zastępuje cały układ aktywnego zdjęcia niezależną kopią.
  Nie zmienia aktywnego zdjęcia, jego pliku, metadanych ani innych zdjęć.
  Można wklejać wielokrotnie bez ponownego kopiowania.
- Kopiowane: jednostka, marginesy i ich łączenie, wszystkie warstwy wraz
  z kolejnością, widocznością, treścią, stylami i pozycjami oraz zasoby SVG.
  Tokeny pozostają tokenami i są rozwiązywane z metadanych zdjęcia docelowego.
  Wartości procentowe i px są kopiowane bez przeliczania względem źródła.
- Zachować identyfikację presetu źródłowego zgodnie z istniejącą obsługą
  niezapisanych zmian; nie zapisywać ani nie aktualizować plików presetów.
- Nie kopiować jakości JPG, preferencji eksportu, zoomu, pan, zaznaczenia warstwy
  ani stanu paneli. Po wklejeniu poprawnie ustawić wybór warstwy i odświeżyć edytor.
- Przyciski dostępne przy otwartym zdjęciu; Paste wymaga także kopii.
  Oba zablokowane w czasie operacji blokujących edycję, np. importu/eksportu.
  Pusty edytor nadal jest źródłem ustawień pierwszego importu.
- Kopia jest wewnętrzna, bez dostępu do systemowego schowka, bez trwałego zapisu;
  pozostaje po zamknięciu zdjęcia/rolki, znika po przeładowaniu/zamknięciu aplikacji.
- Krótka dostępna informacja po Copy i Paste; tooltipy i nazwy dostępności.
  Bez nowych skrótów klawiaturowych i bez dialogu przed każdym wklejeniem.
- Pełne undo dokumentu nie jest częścią tego zadania. Wcześniejsza sugestia
  agenta o cofnięciu wklejenia nie była decyzją użytkownika; nie należy
  utożsamiać historii tekstu Tiptap z historią całego układu.

## Wersja i zgodność

- Aktualne manifesty: wspólna wersja `0.3.4-beta` (lokalne zmiany na master).
- Prognoza: `0.4.0-beta`, nowa funkcja, MINOR według maintain-versioning.
  Przeliczyć przy wydaniu, jeśli zmieni się baza. Sam plan nie podbija wersji.
- Presety nadal v1: wykorzystujemy istniejący SessionDocument (layout, icons,
  presetId). Bez nowych pól formatu, migracji ani wpływu na starsze czytniki.
- Changelog po implementacji: zwięzły angielski wpis w Unreleased o dziedziczeniu
  i ręcznym kopiowaniu ustawień. Brak commita, merge'a, tagu i publikacji bez zlecenia.

## Kryteria akceptacji

Implementacja jest gotowa do oceny. Typecheck, lint, build aplikacji i `git diff --check` przeszły. Testy nie były uruchamiane. Ręczna ocena użytkownika oczekuje.

| AC    | Obserwowalne zachowanie                                                                                                            | Weryfikacja                                                       |
| ----- | ---------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| AC-01 | Jeden i wiele nowych plików dostaje aktualny układ zdjęcia aktywnego na początku importu, także niezapisane zmiany                 | Unit snapshotów i mały przepływ importu E2E; ręcznie web/desktop  |
| AC-02 | Pierwszy import jednego/wielu zdjęć przejmuje układ przygotowany bez zdjęcia; błędny plik nie zmienia źródła ustawień              | Unit i przepływ błędu importu                                     |
| AC-03 | Importowane zdjęcia, źródło i kopia są niezależne; późniejsze zmiany nie propagują się                                             | Unit niezależności i ręczne przełączanie zdjęć                    |
| AC-04 | Copy → zmiana zdjęcia → Paste przenosi cały układ i SVG bez tworzenia presetu; wielokrotne Paste zachowuje snapshot                | Unit oraz jeden przepływ E2E                                      |
| AC-05 | Tokeny używają metadanych celu, plik celu i preferencje eksportu nie zmieniają się; podgląd i JPG odpowiadają nowemu układowi      | Unit granic danych, E2E z różnymi metadanymi i eksportem          |
| AC-06 | Akcje w stopce sidebara i pod klatkami mają tooltipy, obsługę klawiatury i właściwe stany disabled; układ mieści się w web/desktop | Storybook, regresja wizualna i ręcznie przy różnych szerokościach |
| AC-07 | Wklejenie odświeża treść i wybór warstwy także dla pustego układu, tekstu i grafik; zapisane presety pozostają bez zmian           | Unit/przepływ i ręcznie                                           |

## Etap implementacji i ocena

Jeden etap do zatwierdzenia: logika snapshotów i importu, Copy/Paste,
Copy/Paste w obu wskazanych miejscach oraz weryfikacja AC-01–07. Potem ocena
użytkownika i poprawki.

Punkty wejścia: `use-photo-session.ts`, `session-document.ts`, `session-state.ts`,
`App.tsx`, `film-roll.tsx`, `editor-workspace.tsx` i `photo-workspace.tsx`.
Wydzielić logikę kopiowania dokumentu do funkcji testowalnej bez przeglądarki.
Zatwierdzać drafty kontrolek przed pobraniem snapshotu, również przy kliknięciu Copy.

Weryfikacja: `pnpm check`, `pnpm test:e2e`, `pnpm build-storybook`,
`pnpm test:visual`; dla zmian wspólnych komponentów również
`pnpm test:visual --all-projects`. Obejrzeć expected/actual/diff przed oceną
zmian wzorców. Desktop sprawdzić kolejno po testach przeglądarkowych;
`pnpm test:desktop` od pierwszej próby z wymaganym dostępem poza ograniczonym
środowiskiem. Raportować niewykonane kontrole i niezwiązane błędy osobno.

Ręczna ocena: przygotować własny układ z SVG i tokenami, dodać kilka zdjęć,
zmienić źródło i potwierdzić niezależność; wykonać Copy/Paste na innym zdjęciu,
sprawdzić metadane celu, pusty układ i wynik JPG. Podać build/wersję i dirty state.

## Wydanie

Brak akceptacji działania i autoryzacji commita/merge'a/pusha.
Wersja, changelog i tag dopiero przy autoryzowanym wprowadzeniu ukończonego
zadania do master; publikacja pozostaje osobnym zakresem.
