# Regresja wizualna UI — smoke tests

Stan: 3 listopada 2026. Zestaw sprawdza widoki prawdziwej aplikacji w jednym profilu Chromium desktop. Storybook nie jest uruchamiany przez `test:visual`.

## Sceny

Numer kompilacji (`data-build-info`) jest ukrywany wyłącznie na screenshotach
przez `tests/visual/screenshot.css`, aby wzorce nie zależały od commita.
W aplikacji pozostaje widoczny.

Scena About obejmuje prawdziwy dialog aplikacji; osobny widok czytnika licencji
pozostaje poza screenshotami. `FRAMENOTE_VISUAL_PORT` pozwala
uruchomić zestaw na innym porcie, gdy domyślny 4184 jest zajęty.

| Test                   | Co obejmuje                                             |
| ---------------------- | ------------------------------------------------------- |
| Empty editor           | Puste okno, akcje i układ początkowy.                   |
| Prepared photo session | Zdjęcie, trzy warstwy i podstawowy inspektor.           |
| Font panel             | Prawdziwy panel fontów i próbki gotowe do renderowania. |
| Metadata panel         | Kategorie i wyszukiwanie metadanych.                    |
| Graphic settings       | Grafika SVG i jej ustawienia.                           |
| About                  | Rzeczywisty dialog About.                               |

Nie mnożymy stron marginesu, ikon, jednostek ani kombinacji wyrównania. Dane i geometria pozostają w Vitest, a wynikowy obraz ma jeden reprezentatywny test eksportu JPG. Każda scena wizualna robi jeden screenshot całego okna 1440 × 900. Wzorce są w `tests/visual/snapshots/{platform}/{projectName}/smoke.spec.ts`.

## Uruchamianie

- `pnpm test:visual` — sześć scen Chromium desktop, porównanie ze wzorcami.
- `pnpm test:visual --all-projects` — alias zgodności, nadal tylko Chromium desktop.
- `pnpm test:visual --grep 'metadata panel'` — jedna scena.
- `pnpm test:visual:report` — raport ostatniego przebiegu z expected/actual/diff.
- `pnpm test:visual:update --project chromium-desktop --grep 'nazwa sceny'` — aktualizacja wybranych wzorców.

Zwykłe uruchomienie nigdy nie tworzy wzorców. Po celowej aktualizacji obejrzyj nowe obrazy i różnice w Git przed commitem. Wzorce są zależne od systemu i profilu przeglądarki; nie kopiuj obrazów między profilami. W razie różnicy obejrzyj expected, actual i diff przed zmianą wzorca.

Wzorce każdej sceny i profilu wymagają obejrzenia przed zaakceptowaniem zmiany. Usunięte scenariusze i ich obrazy pozostają dostępne w historii Git sprzed uproszczenia zestawu.

Brak wzorca powoduje niezaliczoną weryfikację; aktualizuj go wyłącznie jawnie
wybraną sceną i po obejrzeniu pełnego obrazu.
