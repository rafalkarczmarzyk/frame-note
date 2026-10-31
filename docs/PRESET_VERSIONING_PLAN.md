# Plan i realizacja 0.1.0-beta

Aktualizacja: 2026-10-31. Użytkownik zatwierdził realizację na `master`,
z weryfikacją i commitem po etapie, bez zatrzymywania między etapami.

## Obowiązujący zakres

1. Usunąć przygotowaną obsługę legacy i migracje historycznych formatów.
2. Wprowadzić pierwszy format presetów **v1** z osobnym parserem Zod.
   Starsze JSON-y i dotychczasowe biblioteki nie są wspierane ani przenoszone.
   Nie dodawać rozpoznawania legacy, migracji, czyszczenia ani zabezpieczeń
   specjalnie dla starych danych. Jeśli stare localStorage przeszkadza, jego
   usunięcie pozostaje po stronie użytkownika.
3. Zapisywać presety macOS w `~/FrameNote/presets`, każdy w samodzielnym JSON.
4. Przy przyszłej zmianie formatu wymagać nowego schematu, migracji z poprzedniej
   wersji, skryptu konwersji plików i testów. Dla v1 migracji jeszcze nie ma.
5. Dodać identyfikator buildu i kontrolę zgodności wersji/changeloga.
6. Zweryfikować i zakończyć wersją **`0.1.0-beta`**: lokalny commit i tag,
   instrukcja samodzielnego budowania. Bez gotowych buildów do pobrania.
   Push i publikacja zdalna nie są częścią samego lokalnego wydania.

## Zapis presetów

- macOS: `~/FrameNote/presets/<preset-id>.json`, katalog tworzony automatycznie
  od pierwszego uruchomienia bety. Nazwa presetu jest w JSON, nie wyznacza ścieżki.
- Operacje dyskowe wykonuje proces główny Electrona przez ograniczone API;
  wspólny edytor korzysta z asynchronicznego repozytorium presetów.
- Zapis przez plik tymczasowy i podmianę; nieudany zapis nie zmienia stanu UI.
  Uszkodzony lub nowszy plik nie może zostać usunięty przy zapisie innych presetów.
- Testy i izolowane profile korzystają z osobnego katalogu danych, nie z HOME.
- Web zachowuje dotychczasowy klucz `framenote.presets.v1` w pamięci przeglądarki.
  Nie zmieniamy miejsca zapisu webu. Import/eksport używa tego samego parsera
  v1 co desktop; nie dodajemy obsługi historycznych formatów.
- JSON pojedynczego presetu jest identyczny na webie i desktopie, zawiera
  `version: 1` i przechodzi ten sam schemat Zod. Różni się wyłącznie nośnik:
  biblioteka w localStorage albo osobne pliki JSON w katalogu macOS.
- Konfiguracja w tym katalogu pozostaje na później (NTH-005). Nie tworzyć pustego
  configu, nie przenosić obecnych preferencji ani całego profilu Chromium.

## Historia nazw wersji aplikacji

| Dawna nazwa   | Obecna nazwa | Stan                                         |
| ------------- | ------------ | -------------------------------------------- |
| pre-mvp       | v0.0.1-alpha | Lokalny tag na niezmienionym 9a627af         |
| mvp           | v0.0.2-alpha | Lokalny tag na niezmienionym a60aa97         |
| 1.0.0-alpha.1 | 0.0.3-alpha  | Normalizacja zapisana w 50ebf71; lokalny tag |

Na origin pozostają stare nazwy tagów; żadnych tagów zdalnych nie zmieniano.
Historia commitów nie jest przepisywana. Wcześniejsze propozycje obsługi starych
formatów i v3 są **wycofane**; nie stanowią obowiązującego zakresu.

## Proste zachowanie pierwszej bety

- Pliki odczytujemy przy starcie, bez obserwowania folderu na żywo.
- Usunięcie presetu usuwa plik, bez kosza i historii zmian.
- Błąd zapisu pokazuje komunikat i nie oznacza operacji jako zapisanej.
- About pokazuje skrót commita i `dirty`; bez licznika buildów.

## Kryteria zakończenia

- [x] Brak parserów legacy i migracji historycznych danych.
- [x] Presety v1 mają schemat Zod, walidację zasobów i testy.
- [x] Zapis, edycja, usuwanie i ponowne odczytanie presetów działa na macOS.
- [x] Złe/nowsze pliki i nieudany zapis nie niszczą biblioteki.
- [x] About identyfikuje wersję i build webu oraz desktopu.
- [x] Narzędzia synchronizacji i kontroli wersji/changeloga są podłączone.
- [x] Testy projektu oraz wymagane kontrole wizualne i desktopowe zakończone (wyniki i wcześniejsza różnica poniżej).
- [x] Lokalny commit i tag v0.1.0-beta odpowiadają zweryfikowanemu kodowi.

Wersje aplikacji: `0.x.y-alpha`, następnie `0.x.y-beta`, bez dodatkowych liczników.
Poprawki zwiększają PATCH, funkcje i zmiany niezgodne — MINOR i zerują PATCH.
Pierwsze stabilne, ukończone wydanie to `1.0.0`.

## Wyniki weryfikacji

- Testy jednostkowe: 352/352; TypeScript, lint, formatowanie, tokeny kolorów
  i kontrola wersji/changeloga przechodzą.
- Desktop na izolowanym profilu: zapis rzeczywistego pliku JSON v1, identyczność
  danych przez API, restart z zachowaniem presetu, offline, JPG i ZIP przechodzą.
- Różnice wzorców pustego edytora obejrzano w trzech profilach; dotyczą wyłącznie
  świadomej zmiany numeru wersji. Tylko te wzorce są aktualizowane.
- Znana wcześniejsza różnica: Chromium desktop / left margin hover, materiał
  etykiety (4810 pikseli). Odtworzona identycznie na niezmienionym `083aa25`
  w osobnym katalogu testowym. To nie regresja tego zadania; wzorzec pozostaje
  niezmieniony. Z tego powodu pełny test wizualny nie jest całkowicie zielony.
- Pełne E2E: 178/180 w jednym przebiegu; dwa timeouty WebKit powtórzono
  osobno bez zmian kodu: 2/2 zaliczone. Wszystkie 180 scenariuszy zweryfikowane.
- Końcowa regresja wizualna: domyślna 5/6; wszystkie profile 16/18. Jeden błąd
  to powyższy, potwierdzony wcześniej hover; drugi to timeout WebKit w scenie
  three layers: po osobnym powtórzeniu zaliczony (1/1). Trzy wzorce pustego edytora z numerem bety
  zapisano po obejrzeniu expected/actual/diff.
- Storybook oraz Glass: build poprawny, 12/12 testów Chromium/WebKit zaliczonych.
- Finalna paczka macOS: zbudowana i przetestowana w izolowanym profilu.
  Potwierdzono zapis JSON v1 na dysku, zgodność danych przez API, restart,
  offline, natywny JPG i siedmiozdjęciowy ZIP. Artefakty służą wyłącznie lokalnym
  testom i nie są publikowane.
- Realizacja lokalna zakończona jako `0.1.0-beta`; publikacji zdalnej nie wykonano.
