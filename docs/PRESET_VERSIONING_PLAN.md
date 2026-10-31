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

- [ ] Brak parserów legacy i migracji historycznych danych.
- [ ] Presety v1 mają schemat Zod, walidację zasobów i testy.
- [ ] Zapis, edycja, usuwanie i ponowne odczytanie presetów działa na macOS.
- [ ] Złe/nowsze pliki i nieudany zapis nie niszczą biblioteki.
- [ ] About identyfikuje wersję i build webu oraz desktopu.
- [ ] Narzędzia synchronizacji i kontroli wersji/changeloga są podłączone.
- [ ] Testy projektu oraz wymagane kontrole wizualne i desktopowe zakończone.
- [ ] Lokalny commit i tag v0.1.0-beta odpowiadają zweryfikowanemu kodowi.

Wersje aplikacji: `0.x.y-alpha`, następnie `0.x.y-beta`, bez dodatkowych liczników.
Poprawki zwiększają PATCH, funkcje i zmiany niezgodne — MINOR i zerują PATCH.
Pierwsze stabilne, ukończone wydanie to `1.0.0`.
