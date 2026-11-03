# Desktop — live preview

## Zakres i autoryzacja

- Użytkownik 2026-11-03 polecił „zrobmy tak” po propozycji zmiany pnpm desktop
  na live preview. Etap wdrożenia i weryfikacji autoryzowany; bez commita/pusha.
- Bieżący branch codex/open-source-license zawiera wcześniejsze korekty About;
  zachować je. Ta zmiana dotyczy lokalnego uruchamiania, bez redesignu UI.
- pnpm desktop uruchamia lokalny Vite dla wejścia desktopowego i Electron.
  React/CSS odświeżają się przez HMR; main/preload i źródła adaptera presetów
  powodują przebudowanie adaptera i restart procesu. Błąd składni main/preload lub kompilacji adaptera
  pozostawia bieżącą aplikację uruchomioną do poprawienia kodu.
- pnpm desktop:preview zachowuje dotychczasowy build i start bez watchera.
  Buildy/paczki/testy offline nadal korzystają z framenote://app.
- Dev server tylko 127.0.0.1:3001, zajęty port blokuje start. Zamknięcie
  aplikacji lub Ctrl+C sprząta proces i serwer. Zachowane nazwa/ikona dev.
- Modele, presety i web pozostają bez zmian. Restart native resetuje otwartą
  sesję zdjęć; React Fast Refresh zachowuje stan tam, gdzie pozwala zmiana.

## Wersja

Aktualnie 0.3.3-beta. Zmiana narzędzi developerskich nie wymaga osobnego
podbicia produktu ani wpisu wydania. Prognoza szerszego zadania About bez zmian.

## AC i weryfikacja

| AC    | Kryterium                                                                         | Weryfikacja                                     | Wynik    |
| ----- | --------------------------------------------------------------------------------- | ----------------------------------------------- | -------- |
| AC-01 | pnpm desktop ładuje wejście desktopowe z Vite; zmiana UI pojawia się bez restartu | rzeczywisty Electron i tymczasowa edycja źródła | przeszło |
| AC-02 | main/preload/adapter restartują aplikację po poprawnej kompilacji                 | rzeczywisty launcher i zmiana native źródła     | przeszło |
| AC-03 | Close i Ctrl+C zwalniają serwer, kolejny start działa                             | próby lifecycle                                 | przeszło |
| AC-04 | IPC, About/offline notices oraz built preview nadal działają                      | testy desktop dev i istniejące test:desktop     | przeszło |
| AC-05 | Tylko dev może użyć loopback; packaged i zwykły start zachowują zasoby lokalne    | przegląd polityki i rzeczywisty start z buildu  | przeszło |

## Wyniki i ocena

- `pnpm test:desktop:dev` na macOS przeszedł: rzeczywisty Electron ładuje
  wejście desktopowe z loopback Vite, zmiana tekstu pojawia się przez HMR przy
  zachowanym znaczniku JS i tym samym procesie. Błędna składnia preload nie
  zamyka aktualnej aplikacji, poprawienie i kolejne zmiany restartują Electron.
  IPC presetów działa po restarcie. Zamknięcie okna, Ctrl+C i drugi start
  sprzątają serwer/proces; sprawdzono zwolnienie portu.
- `pnpm test:desktop --chrome-only --skip-native-transitions` przeszedł:
  czytnik About offline, fonty, tooltipy i geometria okna. Przejścia native
  minimize/fullscreen jawnie pominięto; nie powtarzano eksportu dla tej zmiany.
- Typecheck, lint, check:version, format zmienionych plików i build desktop
  przeszły. Wersja pozostaje 0.3.3-beta. Zmienione źródła testu przywrócono.
- Przegląd polityki: URL dev jest dopuszczany wyłącznie dla !app.isPackaged,
  wymaga http://127.0.0.1:<port>/; IPC i nawigacja wymagają właściwego okna,
  głównej ramki i tego URL. Zwykły launcher/test usuwa env dev, zachowuje
  framenote://app i dotychczasowy CSP. Nie zbudowano nowego instalatora.
- Brak zmiany wyglądu w tym zadaniu narzędziowym; nowe baseline'y niepotrzebne.
- Oceniany kod: 0.3.3-beta / HEAD 3f3c905 plus niezacommitowane zmiany.
- Ocena użytkownika oczekuje. Ręcznie: uruchomić pnpm desktop i zapisać zmianę
  tekstu/stylu, następnie zamknąć okno; pnpm desktop:preview daje tryb bez HMR.
  Bez nowej zgody na commit.

## Akceptacja i integracja — 2026-11-03

Użytkownik „jest git. commit i rob release (merge ito)” zaakceptował wynik
oraz polecił commit i integrację z master w lokalnym wydaniu 0.3.4-beta.
Ta decyzja zastępuje wcześniejsze statusy oczekiwania i braku zgody na commit.
Zapisane wyniki oraz ograniczenia testów pozostają aktualne. Bez pushowania
lub publikacji GitHub Release.
