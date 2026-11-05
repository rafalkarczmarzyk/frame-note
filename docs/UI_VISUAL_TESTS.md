# Regresja wizualna UI — smoke tests

Stan: 5 listopada 2026. Zestaw sprawdza widoki prawdziwej aplikacji w jednym profilu Chromium desktop. Storybook nie jest uruchamiany przez `test:visual`.

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
| Prepared photo session | Zdjęcie, Navigator i trzy warstwy.                      |
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

## Navigator — weryfikacja 0.7.0-beta

Wydany kod: `716f083`, tag `v0.7.0-beta`. [Proces wydania](https://github.com/rafalkarczmarzyk/frame-note/actions/runs/41985599461)
zakończył się sukcesem 2026-11-05: walidacja, źródła, paczki macOS/Windows/Linux,
testy gotowych aplikacji i launchera Windows oraz publikacja.

Przed wydaniem przeszły `pnpm check` (493 testy Vitest, w tym 21 testów
geometrii/stanu zoomu/adaptera OS, istniejący eksport JPG, sześć scen Chromium
i build web), build Storybooka oraz natywny smoke macOS z JPG/ZIP i konfiguracją.
Nie dodano testu ani profilu przeglądarkowego. Zmiany wzorców obejrzano jako
expected/actual/diff; dotyczyły zaakceptowanego Navigatora, scrolla sidebara,
stanu strzałki przy ułamkowym Fit i numeru wersji w stopce empty/About.

Kontrole interaktywne Chromium objęły Fit/100%, całkowite procenty ręcznego
zoomu, Z (także powrót do dokładnego Fit), akumulację małych delt wheel,
Spację/MMB, scroll, Cmd-wheel, Escape podczas pan, pole % i jego strzałki,
niezależne widoki dwóch zdjęć, fokus tekstu, drag marginesu w Fit oraz drag
warstwy i Undo na DPR 2. Zoom/pan nie zmieniały rastra miniatury ani Undo. Małe zdjęcie
w Fit zachowało skalę 100% na DPR 2; przy 800% canvas miał nadal 2112×1704 px
dla viewportu 1056×852 CSS px. Nie ma własnych skrótów +/− do zoomu zdjęcia.

Otwarte kontrole ręczne, nieweryfikowane przez opublikowane paczki CI:

- Fizyczny trackpad/pinch i sterowanie na Windows/Linux; test adaptera OS nie
  potwierdza sposobu dostarczania gestów przez konkretny sprzęt i przeglądarkę.
- Odbiór skali 100% na fizycznej Retinie (definicja pozostaje 1 piksel CSS).
- Pełna macierz jednostek/link modes marginesów przy zoom, uchwyty na brzegach
  oraz pointercancel/blur podczas różnych rodzajów drag.
- Osobna ocena motywów i profili poza obecnym UI i profilem Chromium desktop.

Bieżące zachowanie opisuje [instrukcja użytkownika](USER_GUIDE.md#navigating-the-photo).

## Presets — weryfikacja 0.7.1-beta

Ochrona niezapisanych zmian: 496 testów Vitest, eksport JPG, sześć scen Chromium,
build web/desktop i Storybook oraz natywny smoke macOS przeszły przed wydaniem.
Kontrole interakcji Chromium objęły gwiazdkę, zapis nowego i istniejącego presetu,
reset własnego i wbudowanego presetu, wybór z selecta i panelu oraz zachowanie
zmian po Cancel/Escape. Użytkownik zaakceptował etap i zlecił wydanie.

Wzorzec prepared photo session zmienia tylko pasek presetów: gwiazdka przy nazwie
zastępuje Modified. Expected/actual/diff obejrzano przed aktualizacją.
Przy wydaniu wzorce empty editor i About zaktualizowano po obejrzeniu
expected/actual/diff: zmienił się wyłącznie numer wersji w stopce.
Nie rozszerzono zestawu testów ani profili. Nowy dialog obejrzano w Chromium;
natywny smoke potwierdza ogólne działanie desktopu, bez osobnego sprawdzenia
nowego przepływu w natywnym oknie. Zachowanie opisuje instrukcja użytkownika.
