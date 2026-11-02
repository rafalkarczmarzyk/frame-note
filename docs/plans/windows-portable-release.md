# Windows — pojedynczy portable EXE

## Stan i zakres

- Data: 2026-11-02. Stan: plan, bez implementacji.
- Polecenie użytkownika: zaplanować zmianę, aby Windows otrzymywał wyłącznie
  standalone EXE. macOS pozostaje DMG, bez osobnej paczki samego .app.
- Windows x64: zamienić instalator NSIS na cel portable electron-builder.
  Użytkownik pobiera jeden EXE i uruchamia aplikację bez kreatora instalacji.
- Portable Electron to samorozpakowująca się aplikacja: przy starcie może używać
  katalogu tymczasowego. Nie obiecujemy pojedynczego natywnego pliku bez ekstrakcji.
- Nie oznacza to przenoszenia danych razem z EXE. Zachować obecny katalog presetów
  w katalogu domowym i profil aplikacji; nie zapisywać ich obok pobranego pliku.
- macOS: nadal arm64 DMG zawierający FrameNote.app. Bez dodatkowego ZIP z .app.
  Linux: nadal x64 AppImage. Web, edytor i model danych bez zmian.
- Poza zakresem: podpisywanie Windows, SignPath, obchodzenie Smart App Control,
  nowe architektury, przenośny profil/dane oraz automatyczny aktualizator.
- Użytkownik potwierdził, że na macOS działa zgoda w Privacy & Security,
  a Windows blokuje niepodpisany EXE. Portable nie rozwiązuje blokady SAC.
- Autoryzowane tylko planowanie. Brak zgody na implementację, commit lub push.
  Przed realizacją sprawdzić stan master i inne rozpoczęte zadania.

## Wersja i zgodność

- Obecnie 0.3.2-beta. Prognoza: 0.3.3-beta (PATCH: zmiana sposobu pakowania
  istniejącej aplikacji bez nowych funkcji). Ponownie sprawdzić bazę przed wydaniem.
- Sam plan nie podbija wersji i nie wymaga changeloga.
- Presety pozostają v1; bez migracji. Zachować dotychczasowe zapisane dane.
- Nie przerabiać ani nie nadpisywać historycznych release'ów i tagów. Stary EXE
  instalacyjny pozostaje dostępny przy starym wydaniu.

## Kryteria akceptacji

| AC    | Zachowanie                                                                                                                           | Weryfikacja                                                                                     | Wynik       |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------- | ----------- |
| AC-01 | Windows release ma jeden portable EXE, bez instalatora lub wymaganego ZIP                                                            | Lista assetów i faktyczne uruchomienie pobranego EXE na Windows x64                             | niewykonane |
| AC-02 | Uruchomienie nie pokazuje kreatora instalacji, nie wymaga instalacji do Program Files ani podniesienia uprawnień przez nasz launcher | Przebieg gotowej paczki na zwykłym koncie Windows; nie utożsamiać z polityką blokad systemowych | niewykonane |
| AC-03 | Gotowy portable EXE działa offline: import zdjęcia i eksport JPG; presety pozostają po restarcie                                     | CI i ręcznie, z izolowanym profilem i kontrolą zapisanych plików                                | niewykonane |
| AC-04 | Presety/profil nie są zapisywane obok EXE i nie giną po przeniesieniu EXE                                                            | Kontrola ścieżek i restart po przeniesieniu, bez zmiany konta/profilu                           | niewykonane |
| AC-05 | Release nadal zawiera DMG macOS, AppImage Linux, portable EXE Windows i SHA256SUMS; publikacja Latest po sukcesie kontroli           | Workflow, kontrola nazw/hashów i listy assetów                                                  | niewykonane |
| AC-06 | Dokumentacja jasno odróżnia portable od starego instalatora i opisuje ograniczenie niepodpisanego EXE                                | Przegląd instrukcji i release notes                                                             | niewykonane |

## Etapy

### 1. Pakowanie i testy

- Zmienić win.target z nsis na portable w scripts/dist-desktop.mjs; usunąć
  nieużywaną konfigurację kreatora NSIS. Nie usuwać zależności lub reguł pnpm
  bez sprawdzenia, czy portable także korzysta z narzędzi NSIS.
- Preferowana jednoznaczna nazwa: FrameNote-<version>-win-x64-portable.exe.
  Zaktualizować kontrolę kompletności assetów i testy publikacji.
- Obecny smoke uruchamia win-unpacked/FrameNote.exe. To za mało: dodać próbę
  uruchomienia rzeczywistego portable EXE (launcher + rozpakowanie + Electron).
  Ustalić, jak Playwright podłącza się do procesu potomnego; nie raportować
  testu rozpakowanej aplikacji jako testu portable. Cleanup po zamknięciu i timeout.
- Sprawdzić uprawnienia, ścieżki ze spacjami/znakami narodowymi oraz trwałość
  presetów po restarcie i przeniesieniu pliku. Jeśli SAC blokuje próbę na urządzeniu,
  zapisać ją jako blokadę środowiska, nie sukces.
- Uruchomić adekwatne testy skryptów, lint/typecheck i próbny build Windows
  (zdalny push/uruchomienie po poleceniu użytkownika).
- Odbiór użytkownika przed wydaniem; implementacja jeszcze niezlecona.

### 2. Dokumentacja i wydanie

- Zaktualizować docs/DESKTOP.md, docs/DEVELOPMENT.md, opisy w skrypcie publikacji
  i ewentualne wzmianki README, zachowując krótkie główne README.
- Podkreślić: zmiana formatu nie usuwa blokady Smart App Control; nie oferować
  portable jako obejścia podpisywania. Nie zmieniać ustawień zabezpieczeń użytkownika.
- Angielski wpis Unreleased dla rzeczywistej zmiany; po odbiorze wersja PATCH,
  commit/tag i push wyłącznie po poleceniu użytkownika.
- Push tagu po wdrożonej konfiguracji uruchamia automatyczną PUBLICZNĄ publikację
  Latest po sukcesie buildów. Uwzględnić to przy uzyskiwaniu zgody na push tagu.
- Wydanie pozostawia historię starszych paczek dostępną do pobrania.

## Weryfikacja i ocena

- Wykonano tylko odczyt aktualnych skryptów: win.target=nsis, osobny smoke
  gotowej rozpakowanej aplikacji i kontrola nazw assetów w publikacji.
- Brak buildów, zmian kodu, testów i akceptacji implementacji tego zadania.
- Przy odbiorze zapisać commit/dirty, wersję Windows i stan SAC, użyty plik EXE
  oraz wyniki AC-01–06. Brak zmian UI edytora; nie regenerować wzorców UI.

## Realizacja — autoryzacja i postęp

- Polecenie użytkownika obejmuje implementację, commit i push z nowym tagiem,
  aby powstała wersja. Zgoda łączy etapy i automatyczną publiczną publikację Latest.
- Portable target i nazwa win-x64-portable.exe; requestExecutionLevel=user.
  macOS DMG i Linux AppImage bez zmian. Dane i model presetów bez zmian.
- Zachowano smoke unpacked dla eksportu JPG; dodatkowy test uruchamia prawdziwy
  portable EXE z katalogu ze spacjami, łączy się przez lokalny CDP i sprawdza
  import offline. Nie zastępuje to ręcznego sprawdzenia SAC ani restartu presetów.

- Lokalna weryfikacja: 421/421 testów jednostkowych PASS; lint, typy i kontrola
  wersji PASS. Brak zmian UI aplikacji. Gotowy EXE i jego nowy launcher smoke
  wymagają przebiegu Windows Actions; ręczny restart presetów/SAC nadal do odbioru.
- Wydanie 0.3.3-beta — PATCH za zmianę pakowania. Zgodnie z poleceniem użytkownika
  commit/tag i push uruchamiają buildy oraz automatyczną publiczną publikację Latest.
