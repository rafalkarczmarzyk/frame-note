# Windows — odczyt licencji z ASAR

## Zakres i decyzja

2026-11-03 publikacja v0.3.4-beta zatrzymała się w Windows afterPack:
ASAR nie odnalazł renderer/legal/LICENSE.txt. macOS, Linux i źródła przeszły,
release został pominięty i nie powstał. Użytkownik zgłosił log w ramach
trwającego polecenia pushowania i publikacji. Naprawa kontynuuje to zadanie.

Źródło błędu: @electron/asar Filesystem.searchNodeFromDirectory dzieli ścieżkę
po node:path.sep. Na Windows dirname zachowuje slashe w podanej ścieżce, więc
lookup traktuje renderer/legal jako nazwę jednego katalogu. Normalizujemy nazwę
przed extractFile. Nie zmieniamy pakowania plików ani kontroli sum licencji.

- Izolowany worktree codex/fix-windows-legal-check zachowuje równoległe zmiany
  film roll i dokumentacji w głównym katalogu.
- AC-01: poprawny odczyt root i zagnieżdżonych licencji z rzeczywistego ASAR,
  również Windows; brak pliku nadal powoduje błąd.
- AC-02: Windows desktop:dist i smoke testy przechodzą z zachowaną walidacją.
- AC-03: po scaleniu nowa wersja 0.3.5-beta (PATCH), bez przesuwania publicznego
  tagu v0.3.4-beta. Presety, dane, web i wygląd aplikacji bez zmian.
- Zakres autoryzacji: naprawa, commit, merge, push/tag i publikacja jako ciąg
  wcześniej zleconej publikacji. Bez przepisywania historii.

## Weryfikacja

- Dwa nowe testy tworzą realne archiwum ASAR i katalog unpacked, czytają
  zagnieżdżone pliki i sprawdzają odrzucenie brakującego pliku.
- Lokalnie przeszły 444 testy unit (w tym 9 celowanych), lint zmienionych
  plików i typecheck. Izolowany worktree używa zależności istniejącego workspace;
  po podłączeniu brakującego node_modules core usunięto błąd środowiska zod.
- Manualny workflow 41649695431 na commicie 416d2f3 przeszedł dla wszystkich
  trzech systemów. Windows: unit, compile, dist, test spakowanej aplikacji
  i test przenośnego EXE przeszły. Źródła/publication pominięte w manual run.
- Użytkownik autoryzował ciąg publikacji; poprawka scalona do master jako
  lokalne wydanie 0.3.5-beta z changelogiem i tagiem, bez zmiany v0.3.4-beta.
  Równoległe pliki film roll oraz docs/NICE_TO_HAVE pozostają poza commitem.
- Przed wydaniem ręczny workflow na branchu bez publikacji, potem lokalny
  squash do master, wersja/changelog/tag 0.3.5-beta i workflow tagowy.
- Kontrola wizualna nie dotyczy zmiany skryptu weryfikacji bez zmian UI.
