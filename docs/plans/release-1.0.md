# Przygotowanie FrameNote 1.0.0

Stan: etap 1 wykonany, zweryfikowany i zaakceptowany, 2026-11-06.
Baza: master `19314e8`, manifesty `0.10.0-beta`.
Docelowa wersja stabilna: **1.0.0**, wskazana przez użytkownika.

## Zakres i etapy

1. Autoryzowane: przegląd i aktualizacja wzorców do obecnych komponentów,
   porządki w dokumentacji gotowości i kontrola projektu. Bez zmian zachowania
   aplikacji i formatów danych. Sześć istniejących scen macOS/Chromium i jeden JPG.
2. Oczekuje na osobne polecenie: zamknięcie pozostałych decyzji produktu oraz przygotowanie
   konkretnego diffu wydania: wspólne manifesty 1.0.0, angielski changelog i opis
   stabilnego produktu. Nie oznacza to zgody na commit, tag, push ani publikację.

Sama aktualizacja testów i dokumentacji nie wymaga zmiany wersji produktu.
Przy granicy wydania 1.0.0 zbierze wszystkie ukończone zmiany z Unreleased,
bez osobnych podbić za poszczególne zadania. Format presetów pozostaje v1;
reguły tolerowania dodatkowych pól i ograniczenia starszych czytników opisuje
[PRESET_FORMATS](../PRESET_FORMATS.md).

## Kryteria etapu 1

- AC-01: obejrzane expected/actual/diff i świadomie zaktualizowane referencje
  sześciu scen oraz JPG; bez dodatkowych scen i bez osłabienia porównania.
- AC-02: zwykły przebieg sześciu scen oraz JPG przechodzi po aktualizacji.
- AC-03: format, wersje, tokeny, lint, typy, testy jednostkowe, build web,
  Storybook, build i zasoby desktopu oraz natywny smoke mają jawny wynik.
- AC-04: istnieje aktualna lista otwartych odbiorów; żaden plan z otwartymi
  decyzjami lub dowodami audytu nie jest usuwany bez ich zachowania.

## Weryfikacja

AC-01–04: PASS w zakresie tego etapu. Zaktualizowano sześć wzorców macOS
Chromium desktop i jeden JPG po obejrzeniu expected/actual/diff.

- `pnpm test`: PASS — 547 testów Vitest (78 plików), JPG 1/1, UI 6/6,
  zwykły przebieg po aktualizacji, bez zapisu wzorców.
- Format repozytorium, wersje, tokeny, lint i typy: PASS.
- Build web (podczas testów), `pnpm build-storybook`, `pnpm desktop:compile`: PASS.
- `node scripts/verify-desktop-assets.mjs`: PASS — 101 plików fontów/licencji.
- `pnpm test:desktop`: PASS — macOS, po zakończeniu testów przeglądarkowych;
  istniejący smoke eksportu JPG/ZIP i konfiguracji, bez publikowania paczki.
- Format zmienionych dokumentów, lokalne linki i `git diff --check`: PASS.

Pierwsze próby serwerów przeglądarkowych zatrzymał brak dostępu do portów;
kontrole ponowiono z właściwymi uprawnieniami. Build zgłasza ostrzeżenia
rozmiarów chunków; nie blokują kompilacji. Windows/Linux i testy gotowych
paczek wydania nie były wykonywane w tym etapie.

Tożsamość: `0.10.0-beta · 19314e8 dirty` (zmiany referencji i dokumentacji).
Bez zmian kodu aplikacji, manifestów, zależności ani changeloga. Etap wzorców
i porządków zaakceptowany przez użytkownika; lokalny commit autoryzowany.
Wydanie wstrzymane na polecenie użytkownika. Bez taga, push i publikacji.
Otwarte odbiory funkcjonalne poniżej pozostają do potwierdzenia.
Przegląd referencji opisuje [UI_VISUAL_TESTS](../UI_VISUAL_TESTS.md).

## Otwarte przed stabilnym wydaniem

- Odbiór stosu powiadomień i akcji Open Settings:
  [app-notifications](app-notifications.md).

- Odbiór efektów, Blur, zachowania przy zoomie i presetów:
  [layer-effects](layer-effects.md).
- Odbiór presetów wbudowanych i dialogów:
  [curated-presets](curated-presets.md),
  [preset-confirmation](preset-confirmation.md).
- Historia edycji: [edit-history](edit-history.md).
- Navigator: fizyczny trackpad/pinch, Retina i kontrola Windows/Linux;
  [dowody i ograniczenia](../UI_VISUAL_TESTS.md#navigator--weryfikacja-070-beta).
- Ręczny odbiór desktopu na obsługiwanych platformach. Lokalny macOS smoke
  nie zastępuje prób użytkownika ani testów gotowych paczek Windows/Linux.
- Starsze zapisy porządków i audytu mają nadal otwarte kwestie:
  [documentation-cleanup](documentation-cleanup.md),
  [test-suite-simplification](test-suite-simplification.md),
  [typography-cleanup](typography-cleanup.md). Zachowano je do rozstrzygnięcia.

## Dostarczona baza

Undo/Redo (0.5), konfiguracja desktopu (0.6), Navigator (0.7), JPG/PNG i ZIP
(0.8), Tiled (0.9), blending (0.10) oraz obecne zmiany Unreleased: efekty,
letter spacing, helper czasu, formatowanie dat, nowe presety, dialogi i wygląd.
Aktualne zachowanie: [USER_GUIDE](../USER_GUIDE.md),
[DESKTOP](../DESKTOP.md), [CHANGELOG](../../CHANGELOG.md).
Odłożone funkcje, w tym zapisywanie sesji: [NICE_TO_HAVE](../NICE_TO_HAVE.md).
