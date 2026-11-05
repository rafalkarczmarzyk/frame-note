# Powtarzany watermark — otwarta weryfikacja

Stan na 2026-11-05: funkcja zaakceptowana przez użytkownika, z poleceniem
lokalnego commita na `codex/tiled-watermark`. Bez zgody na merge, push lub wydanie.
Wersja produktu pozostaje 0.8.0-beta; zmiany są w Unreleased. Prognoza osobnego
wydania: 0.9.0-beta (nowa możliwość i format presetów v2).

Trwałe zachowanie jest opisane w [USER_GUIDE](../USER_GUIDE.md),
[DESIGN_SYSTEM](../DESIGN_SYSTEM.md) i [PRESET_FORMATS](../PRESET_FORMATS.md).
Mieszanie warstw pozostaje odłożone w NICE_TO_HAVE.

## Weryfikacja zakończona

- 521 testów Vitest, format, lint, typy, tokeny, wersje, build web/Storybook/desktop.
- JPG smoke oraz natywny smoke macOS z JPG/ZIP i konfiguracją.
- Dodatkowa kontrola macOS: drag Tiled przy 45° i jeden krok Undo/Redo.
- Chromium: domyślne Staggered/30°/12%, reset, drag i offset w osiach zdjęcia,
  kliknięcia między kopiami, błąd limitu 2000 kopii i blokada eksportu.
- Ramka odniesienia: hover kopii, wpisu warstwy i obu pól offsetu; brak stałego
  podświetlenia przy samym zaznaczeniu. Bez ikony i bez wpływu na eksport.
- Identyczne piksele podglądu bez dekoracji i PNG; pierwszy PNG z dwuplikowego
  ZIP identyczny z pojedynczym eksportem; tekst+SVG+PNG przy ujemnym offsecie.
- Regresja Glass: tło lokalne pod kopiami, test regresji oraz obecność w PNG.
- Migracja v1 → v2, fixture obu formatów, kopie oryginałów przed zapisem,
  konwerter zachowujący źródło i odrzucający istniejący plik docelowy.

## Otwarte dowody audytu

Sześć scen `pnpm test:visual`: 4 zgodne, 2 różne (`font panel`, `metadata panel`).
Obejrzano expected/actual/diff: różnice obejmują nowy wybór Position oraz
prześwitywanie pod stopką. Zrzuty referencyjne nie zostały zmienione.
Automatyczna kontrola odrzuciła ich zapis bez jawnej akceptacji konkretnych
różnic. Użytkownik otrzymał linki przed/po oraz raport lokalny na porcie 9323;
nie potwierdził dotąd aktualizacji tych dwóch zrzutów.

Ręczny Copy/Paste między różnymi zdjęciami oraz ocena bardzo gęstego Glass
na dużych zdjęciach nie zostały osobno potwierdzone w weryfikacji agenta.
Akceptacja funkcji nie oznacza, że te próby zostały wykonane.
Po rozstrzygnięciu otwartych kontroli przenieść dowody do UI_VISUAL_TESTS
lub odpowiedniego dokumentu i usunąć ten plik.
