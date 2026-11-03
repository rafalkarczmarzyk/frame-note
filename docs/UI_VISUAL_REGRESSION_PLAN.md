# Regresja wizualna UI — smoke tests

Stan: 29 października 2026. Zestaw sprawdza tylko widoki prawdziwej aplikacji. Storybook służy do pracy nad komponentami i nie jest uruchamiany przez `test:visual`.

## Sceny

`tests/visual/licenses.spec.ts` dodaje About licensing footer oraz offline
license reader: wspólny widok About i lokalny odczyt pełnych licencji.
Pierwsze wzorce wymagają oceny użytkownika. `FRAMENOTE_VISUAL_PORT` pozwala
uruchomić zestaw na innym porcie, gdy domyślny 4184 jest zajęty.

| Test                             | Co obejmuje                                                             |
| -------------------------------- | ----------------------------------------------------------------------- |
| Empty editor                     | Puste okno, akcje i układ początkowy.                                   |
| Photo and editor                 | Zdjęcie, podpis, panel boczny i linijki.                                |
| Three layers                     | Lista kilku warstw, wybór i układ edytora.                              |
| Left margin hover                | Jeden reprezentatywny hover kontrolki marginesu i ikony uchwytu.        |
| SVG graphic form                 | Grafika SVG w podpisie oraz jej formularz w kontekście całej aplikacji. |
| Unavailable font inside selector | Oryginalna nazwa brakującego fontu i badge wewnątrz kontrolki wyboru.   |
| Photo roll                       | Dwa zdjęcia i widoczna rolka.                                           |

Nie mnożymy stron marginesu, ikon, jednostek ani kombinacji wyrównania. Szczegółowe zachowanie i eksport JPG pokrywają osobne testy funkcjonalne. Każda scena wizualna robi jeden screenshot całego okna 1440 × 900. Wzorce są w `tests/visual/snapshots/{platform}/{projectName}/smoke.spec.ts`.

## Uruchamianie

- `pnpm test:visual` — siedem scen Chromium desktop, porównanie ze wzorcami.
- `pnpm test:visual --all-projects` — te same sceny w Chromium desktop, Chromium compact i WebKit desktop (21 uruchomień).
- `pnpm test:visual --grep 'left margin hover'` — jedna scena.
- `pnpm test:visual:report` — raport ostatniego przebiegu z expected/actual/diff.
- `pnpm test:visual:update --project chromium-desktop --grep 'nazwa sceny'` — aktualizacja wybranych wzorców.

Zwykłe uruchomienie nigdy nie tworzy wzorców. Po celowej aktualizacji obejrzyj nowe obrazy i różnice w Git przed commitem. Wzorce są zależne od systemu i profilu przeglądarki; nie kopiuj obrazów między profilami. W razie różnicy obejrzyj expected, actual i diff przed zmianą wzorca.

Wzorce każdej sceny i profilu wymagają obejrzenia przed zaakceptowaniem zmiany. Usunięte scenariusze i ich obrazy pozostają dostępne w historii Git sprzed uproszczenia zestawu.

Nowa scena unavailable font inside selector zapisuje również `candidate.png`
w katalogu wyników, aby umożliwić ocenę przed utworzeniem pierwszego wzorca.
Brak zaakceptowanego wzorca nadal oznacza niezaliczoną weryfikację porównania.
