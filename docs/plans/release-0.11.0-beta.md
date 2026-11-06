# Przygotowanie 0.11.0-beta

Stan: przygotowane i zweryfikowane lokalnie, 2026-11-06. Baza: master `76b73b7`,
poprzednie wydanie `v0.10.0-beta`. Użytkownik zlecił kolejną betę zamiast 1.0.0.
Użytkownik autoryzował publikację: commit wydania, tag v0.11.0-beta, push
mastera i taga oraz budowanie i publikację przez workflow GitHub Actions.

## Wersja i zawartość

MINOR: efekty Outline/Shadow/Glow/Blur, letter spacing, formatowanie dat/czasu,
helpery time i heliconStackSummary, DSEG7 i siedem presetów. Ponadto aktualny
picker fontów, dropdown blendingu, dialogi presetów/Dispose roll, pusty ekran
oraz stos powiadomień i poprawa rozdzielczości podglądu.

Pięć manifestów wskazuje 0.11.0-beta. Lockfile nie zawiera numeru produktu
i nie wymaga zmiany. Changelog przenosi dotychczasowe Unreleased do sekcji
0.11.0-beta z datą 2026-11-06 i zachowuje pusty nagłówek Unreleased.
Format presetów v1 bez migracji; brak nowych opcji daje dotychczasowy wygląd,
starsze aplikacje mogą nie obsługiwać efektów i nowych tokenów.
Szkic 1.0.0 pozostaje dokumentem przyszłego stabilnego wydania.

## Kontrole i odbiór

Cel tej bety: umożliwić końcowe testy użytkowe aplikacji. Użytkownik potwierdził,
że nie wykonał jeszcze takich prób. Wyniki automatyczne nie są odbiorem
funkcjonalnym ani deklaracją gotowości do stabilnego 1.0.0.

- `pnpm check`: PASS — format, wersje, tokeny, lint, typy, 547 testów Vitest,
  JPG 1/1, UI 6/6 i build web.
- `pnpm check:version --base=v0.10.0-beta`: PASS; pięć manifestów zgodnych,
  wersja rośnie, tag v0.11.0-beta nie istnieje lokalnie.
- Storybook: PASS w czystym `/tmp/framenote-storybook-0.11.0-beta` po błędzie
  EEXIST kopiowania plików do domyślnego katalogu. Bez zmian kodu builda.
- Desktop compile i kontrola 101 plików fontów/licencji: PASS.
- Natywny smoke macOS: PASS, po zakończeniu testów przeglądarkowych;
  eksport JPG/ZIP, efekty, konfiguracja i stos powiadomień.
- Obejrzano expected/actual/diff empty editor i About: jedyna różnica to
  numer produktu w stopce. Zaktualizowano wyłącznie te dwa wzorce macOS;
  zwykły przebieg sześciu scen potem przeszedł. JPG bez zmiany wzorca.

Budowanie zgłasza istniejące ostrzeżenia o rozmiarach chunków. Pełne paczki
macOS/Windows/Linux i źródła będą budowane przez workflow wydania, po osobnej
zgodzie na publikację. Nie były przygotowywane lokalnie w tym etapie.

Otwarte próby funkcjonalne oraz Windows/Linux pozostają w
[planie 1.0](release-1.0.md) i powiązanych dokumentach. Przygotowanie bety
nie oznacza, że wykonano te próby lub zakończono odbiór stabilnego produktu.
Push taga w aktualnym workflow uruchamia budowanie, testy paczek, źródła
oraz automatyczną publikację GitHub Release; został autoryzowany poleceniem publikacji.

## Proponowane testy użytkowe na becie

1. Otworzyć kilka własnych JPG/PNG; przełączyć zdjęcia, zastosować preset,
   użyć Copy/Paste i sprawdzić niezależność późniejszych zmian.
2. Sprawdzić siedem presetów, format daty/czasu oraz własny podpis z logo
   i brakującymi metadanymi. Zapisać preset, zamknąć aplikację i odczytać go.
3. Dodać efekty, zmienić ich kolejność i widoczność; porównać Fit/100%,
   Navigator, Manual/Tiled oraz Undo/Redo pisania i przeciągania.
4. Wyeksportować JPG, PNG i ZIP; obejrzeć wynik w zewnętrznej aplikacji,
   sprawdzić podpisy, efekty, rozmiary, przezroczystość PNG i wybór metadanych.
5. Sprawdzić używane fonty, Settings, restart i własny monitor/trackpad.
   Zapisać błędy z numerem wersji/buildem i krokami odtworzenia.

To propozycja odbioru, nie lista już wykonanych prób ani warunek formalnej
akceptacji całego 1.0.0 przed udostępnieniem bety.
