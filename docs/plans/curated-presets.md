# Zestaw presetów przed 1.0

Aktualny stan wzorców: sześć scen UI i JPG zaktualizowano, zweryfikowano
i zaakceptowano 2026-11-06; commit `a3896b0`. Starsze opisy różnic i oczekiwania
na akceptację wzorców poniżej są dowodami historycznymi. Odbiory funkcjonalne
niewykonane ręcznie zachowują osobny status. Bieżący zakres i kontrole:
[plan 1.0](release-1.0.md).

Stan: do oceny użytkownika. Data: 2026-11-06.
Autoryzacja: użytkownik zaakceptował propozycję siedmiu presetów (dodano Digital Date na życzenie użytkownika) i zlecił refaktoryzację.
Branch: `codex/curated-presets`. Zgoda użytkownika na lokalny commit udzielona 2026-11-06. Bez zgody na push/wydanie.

## Zakres i zgodność

Photo Details (domyślny, z with-icons.json), Signature, Focus Stack (ze stack.json),
Glass Caption, Proof Watermark, Quartz Date, Digital Date. Wspólny zestaw web/desktop.
Quartz Date: lokalny font DSEG7 Classic Bold Italic OFL, pomarańczowa krótka data 'YY MM DD, mieszanie Add;
z poświatą #B25F0B (blur 0,24%) i rozmyciem tekstu 0,02%, według Quartz-Date-copy.framenote.json. Focus Stack: pełna etykieta tylko przy poprawnych danych.
Własne zapisane presety pozostają bez zmian. Zachowane ID builtin-default,
builtin-signature i builtin-macro. Format v1 bez migracji; starsze aplikacje
nie rozpoznają helpera heliconStackSummary i mogą zastąpić nowy font fontem domyślnym.
Wersja obecna 0.10.0-beta; cel 1.0.0 po odbiorze całego wydania. Osobne wydanie
beta z nowym helperem wymagałoby MINOR. Teraz bez zmiany manifestów.

Formatowanie daty: rozszerzenie date o gotowe formaty i własny wzór przy tokenie,
zaakceptowane przez użytkownika. Zwykłe date zachowuje YYYY-MM-DD. Lista pokazuje wzory, bez gotowego wariantu amerykańskiego (decyzja użytkownika). Obsługiwane
YYYY/YY, MM/M, DD/D i separatory, walidacja i podgląd. Digital Date: Oswald Bold, złoty pomarańcz #DCA52C, Normal. Starsze czytniki nie rozpoznają parametrów date.

## Kryteria i weryfikacja

- AC-01: dokładnie siedem odrębnych presetów, Photo Details domyślny; test biblioteki i ręczny odbiór.
- AC-02: oba układy użytkownika zachowują kompozycję i ikony; Focus Stack bez niepełnej etykiety przy braku danych; test resolvera.
- AC-03: Quartz Date pobiera poprawną datę zdjęcia bez zmiany strefy, font dostępny lokalnie; testy helperów i podgląd/eksport.
- AC-04: presety eksportują/importują zasoby w v1, własne presety nie są modyfikowane; testy round-trip.
- AC-05: aktualne stories, sześć scen pnpm test:visual i jeden eksport JPG; różnice do obejrzenia, bez automatycznej akceptacji wzorców.

- AC-06: format per token, gotowe opcje i własny wzór; poprawna walidacja, podgląd, Undo/Redo, zapis/import v1. Testy domeny i istniejąca scena UI.

## Etapy

1. Implementacja i weryfikacja — autoryzowane.
2. Ocena użytkownika i poprawki; commit i wydanie wyłącznie po poleceniu.

## Wyniki weryfikacji

- AC-01–04, AC-06: zaimplementowane; 530 testów jednostkowych (77 plików) PASS.
  Obejrzano wszystkie siedem stories presetów bez błędów przeglądarki.
- W istniejącej scenie graphic settings sprawdzono gotowe formaty, brak wariantu
  amerykańskiego w liście, odrzucenie błędnego wzoru, Apply, Undo/Redo — PASS.
- DSEG Regular oraz rzeczywisty Italic załadowały się lokalnie w Chromium;
  przycisk Italic aktywny, wariant sprawdzony wizualnie. Bold i Bold Italic dołączono po ocenie referencji użytkownika.
- Lint, typecheck, format:check, check:tokens, check:version, build web,
  build-storybook i desktop:compile — PASS. Buildy ostrzegają o wielkości bundli.
- Test natywnego desktopu macOS — PASS, w tym eksport i konfiguracja.
  Ostatnia drobna poprawka zachowania brakującej daty obok obrazu została po nim
  sprawdzona testami jednostkowymi; nie zmienia natywnych integracji.
- AC-05: pnpm test:visual uruchomione, 1/6 PASS, 5/6 różnic wzorców.
  Obejrzano expected/actual/diff: zmiana nazwy Default → Photo Details,
  ikonowy podpis, rozmiar edytora treści, dodatkowy font i liczba helperów.
  Brak nieoczekiwanych zmian geometrii zdjęcia. Wzorców nie aktualizowano.
- Jeden test JPG: plik wygenerowany, odczytany, rozmiar 5964×3976 poprawny;
  porównanie obrazu FAIL (24990 pikseli) ze względu na nowy podpis z ikonami.
  Obejrzano expected/actual/diff; wzorzec pozostaje do akceptacji.
- Raporty: playwright-visual-report oraz playwright-report; porównania w
  visual-test-results i test-results. Pełny odbiór Windows/Linux niewykonany.
- Próba desktop:build skompilowała renderer, ale pakowanie nie zakończyło się
  z powodu niedostępnego github.com przy pobieraniu Electrona. Nie tworzono wydania.

## Przekazanie

0.10.0-beta · baza 72de466 · dirty, branch codex/curated-presets.
Do oceny: wszystkie siedem kompozycji, Quartz Date z Add i domyślną kursywą,
Digital Date oraz własny format daty na zdjęciu z datą i bez niej.
Odbiór użytkownika i akceptacja nowych wzorców pozostają otwarte.
Lokalny commit autoryzowany; bez push, zmiany wersji ani wydania.

Digital Date: Oswald Bold, #DCA52C. Testy biblioteki 5/5 PASS, check:tokens i build-storybook PASS; podgląd obejrzany w Chromium.

Quartz Date: #DA6E00; Digital Date: #DCA52C według osobnej referencji użytkownika. Naprawa rozdzielczości podglądu zaakceptowana; [weryfikacja](../UI_VISUAL_TESTS.md#ostrość-podglądu-efektów--2026-11-06).

## Dopracowanie Digital Date — 2026-11-06

Autoryzowane: Oswald Bold, #DCA52C, domyślnie YYYY/MM/DD; opcjonalnie
YYYY/MM/DD HH:mm w kontrolce formatu. Bez zmian obrysu/cienia — odłożone w NICE_TO_HAVE.
Formaty z czasem czytają pełny DateTimeOriginal EXIF/XMP, bez konwersji strefy
ani dopisywania godziny dla samej daty. Presety v1, starsze czytniki nie rozumieją
nowych pól wzoru. AC: poprawne źródło i walidacja czasu, brak czasu daje ostrzeżenie,
format per token, zgodny podgląd/eksport; unit i istniejąca scena graphic settings.
Baza a891f89, 0.10.0-beta. Lokalny commit autoryzowany przez użytkownika; bez zgody na push/wydanie.

Weryfikacja dopracowania Digital Date: testy formatów i biblioteki 8/8 PASS,
lint, typecheck, build web, Storybook, desktop:compile, formatowanie, tokeny i wersja PASS.
Obejrzano podgląd z godziną i bez; format z HH:mm oraz jego Undo przeszły
w istniejącej scenie graphic settings. Zestaw wizualny nadal 1/6 PASS i 5 różnic
po wcześniejszych zmianach presetów, bez nadpisania wzorców. JPG wyeksportowany,
porównanie nadal niezgodne ze starym wzorcem podpisu. Nowe HH:mm nie jest formatem
czasu systemowego — tylko poprawną godziną zdjęcia z EXIF/XMP.
Natywnego smoke testu nie powtarzano w tej korekcie; brak zmian natywnych,
renderer desktopu skompilowany. Lokalny commit autoryzowany; akceptacja wzorców wizualnych pozostaje otwarta.

## Domyślny Quartz Date — 2026-11-06

Autoryzowane: ustawienia z pliku użytkownika Quartz-Date-copy.framenote.json jako
wbudowany Quartz Date. Zachowane ID/nazwa presetu; efekty w kolejności Glow, Blur.
AC-07: kompozycja odpowiada plikowi (poza technicznymi ID), własne presety bez zmian.
Web/desktop współdzielą definicję; format v1 bez migracji. Wersja 0.10.0-beta
bez podbicia; samodzielna korekta odpowiada PATCH przy przyszłym wydaniu.
Weryfikacja: test biblioteki 5/5 PASS; web build, lint, typy, format i tokeny PASS.
Sześć scen wykonanych: 6 różnic wcześniejszych zmian UI; expected/actual/diff obejrzane,
bez aktualizacji wzorców. JPG nadal różni się podpisem (39651 pikseli); obrazy obejrzane.
Odbiór tej korekty otwarty. Lokalny commit tej korekty autoryzowany 2026-11-06; bez push/wydania.
