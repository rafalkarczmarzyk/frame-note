# Desktop — build tworzy działającą aplikację

## Zakres i decyzja

2026-11-03 użytkownik potwierdził: „Tak, build ma tworzyć FrameNote.app”.
Autoryzowany lokalny build bez instalacji i bez DMG; bez commita/pusha.
Bieżący branch codex/open-source-license zachowuje wcześniejsze zmiany About
oraz live preview. Zmiana dotyczy narzędzi budowania, bez nowego zachowania UI.

- pnpm desktop:build na macOS Apple Silicon kompiluje kod i przygotowuje
  release/FrameNote-darwin-arm64/FrameNote.app, lokalnie podpisane ad hoc
  dotychczasową ścieżką packagera, z weryfikacją notices i podpisu.
- pnpm desktop:compile to wcześniejsza kompilacja renderera i adaptera.
  Korzystają z niej CI/source build, dist, testy i desktop:preview.
- pnpm desktop pozostaje live preview. release/dev jest pomocniczym runtime,
  nie aplikacją użytkownika. Build nie czyści tego cache i nie tworzy DMG.
- Instalacja nie pakuje aplikacji drugi raz. Paczki DMG/signed zachowują
  dotychczasowy zakres. Windows/Linux nadal korzystają z compile + dist.
- Web, dane i presety bez zmian. Obecnie 0.3.3-beta; reorganizacja lokalnych
  poleceń nie wymaga osobnego podbicia produktu. Prognoza About bez zmian.

## AC

| AC    | Zachowanie                                                                            | Dowód                               | Wynik    |
| ----- | ------------------------------------------------------------------------------------- | ----------------------------------- | -------- |
| AC-01 | desktop:build tworzy samodzielny FrameNote.app                                        | lokalny build i uruchomienie wyniku | przeszło |
| AC-02 | Aplikacja pokazuje FrameNote, nie ekran powitalny Electrona; notices offline działają | test rzeczywistego .app             | przeszło |
| AC-03 | Build nie instaluje ani nie tworzy DMG, nie usuwa runtime dev                         | przegląd skryptów i wyniku builda   | przeszło |
| AC-04 | CI/dist/install/preview nie wykonują zbędnego ani mac-only pakowania                  | przegląd wywołań, kontrole projektu | przeszło |

## Weryfikacja i ocena

- `pnpm desktop:build` przeszedł na macOS arm64: kompilacja, pakowanie,
  Icon Composer, lokalny podpis ad hoc oraz sprawdzenie zawartości legal.
  Wynik: release/FrameNote-darwin-arm64/FrameNote.app. Nie powstał DMG;
  istniejący release/dev pozostał na miejscu. Bez instalacji.
- Rzeczywisty wynik uruchomiono przez FRAMENOTE_PACKAGED i test:desktop
  --chrome-only --skip-native-transitions. Edytor, About/licencje offline,
  fonty, tooltipy, nazwa i geometria okna przeszły. Przejścia native pominięto;
  eksportu nie powtarzano. Test zamknął aplikację po sprawdzeniu.
- Lint, check:version, format zmienionych plików i git diff --check przeszły;
  typecheck stanowi część kompilacji. Nadal 0.3.3-beta / HEAD 3f3c905 + dirty.
- CI/source job oraz matrix packaging używają desktop:compile; Windows/Linux
  i podpisy Developer ID nie były tu uruchamiane. Ścieżki wywołań przejrzane,
  instalacja/pakowanie nie dublują budowania .app.
- Ocena użytkownika oczekuje: otworzyć gotowy FrameNote.app z podanej ścieżki.
  Bez zgody na commit/push ani publikacji.

## Akceptacja i integracja — 2026-11-03

Użytkownik „jest git. commit i rob release (merge ito)” zaakceptował wynik
oraz polecił commit i integrację z master w lokalnym wydaniu 0.3.4-beta.
Ta decyzja zastępuje wcześniejsze statusy oczekiwania i braku zgody na commit.
Zapisane wyniki oraz ograniczenia testów pozostają aktualne. Bez pushowania
lub publikacji GitHub Release.
