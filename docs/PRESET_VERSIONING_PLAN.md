# Plan dojścia do 0.1.0-beta — historia wersji, presety i zapis na macOS

Ustalenia: 2026-10-31. Wymaganie użytkownika przed `0.1.0-beta`.
Zastępuje historyczne odłożenie NTH-002. Cel ustalony przez użytkownika:
wdrożyć poniższe wymagania, zweryfikować je i wydać wynik jako `0.1.0-beta`.
Wydanie jest na tym etapie źródłowe: każdy użytkownik sam buduje aplikację.
Nie przechowujemy ani nie publikujemy gotowych buildów lub instalatorów do pobrania.
Użytkownik zlecił implementację 2026-10-31. Realizacja etapami, z oceną przed
przejściem dalej; rozpoczęto od etapu 0. Nie oznacza to wykonania kolejnych etapów.

## Stan obecny

- Normalizacja numeracji jest już przygotowana w niezacommitowanych zmianach:
  dokumentacja, skill i pięć manifestów wskazują obecną wersję `0.0.3-alpha`.
  Lokalne tagi historyczne zmieniono na `v0.0.1-alpha` i `v0.0.2-alpha`, zachowując
  commity. Zmiany tagów nie zostały wysłane na origin. Odczyt origin 2026-10-31
  potwierdził stare tagi `pre-mvp` → `9a627af` i `mvp` → `a60aa97`, zgodne
  z celami nowych tagów lokalnych. Nie utworzono taga obecnej alphy ani bety.
- Desktop korzysta z localStorage Chromium w trwałym profilu FrameNote,
  standardowo `~/Library/Application Support/FrameNote/Local Storage`.
  `--user-data-dir` pozwala wskazać inny profil. Aktualizacja samej aplikacji
  zachowuje profil. Nie są to osobne pliki JSON presetów.
- Web korzysta z localStorage danej strony; web i desktop mają osobne zbiory.
- Eksport/import pozwala przenosić presety w JSON. Obecny `parsePreset` w
  `packages/core/src/presets.ts` ręcznie odczytuje wersje 1/2, waliduje dane
  i obsługuje część historycznych przekształceń. Nie ma schematów Zod.
- `PresetStore` zachowuje odrzucone rekordy oraz udostępnia dane do odzyskania.
  Nowa implementacja musi zachować tę ochronę.

## Wymagania

1. Wersja formatu presetu jest osobną liczbą całkowitą, niezależną od SemVer
   aplikacji. Aktualizacja aplikacji bez zmiany formatu nie zwiększa tej liczby.
   Wersja formatu nie jest historią kolejnych edycji konkretnego presetu.
2. Każda obsługiwana wersja ma własny schemat/parser Zod utrwalający jej kontrakt.
   Zmiana bieżącego modelu aplikacji nie może po cichu zmieniać akceptacji starych
   formatów. Współdzielić można tylko definicje o faktycznie niezmiennej semantyce.
3. Potok odczytu: rozpoznanie wersji → jej walidacja → jawne migracje kolejnych
   wersji → walidacja wyniku w schemacie docelowym → model aplikacji.
   Zachować limity danych i niezależną walidację SVG/PNG.
4. Każda nowa wersja formatu wymaga modułu migracji `vN → vN+1` i testów na
   rzeczywistych historycznych fixture'ach. Ten sam kod wykorzystują aplikacja
   oraz skrypt do konwersji plików; nie utrzymywać dwóch implementacji migracji.
5. Import JSON i odczyt zapisanej biblioteki na webie/desktopie używają tego
   samego potoku. Zapis i eksport generują aktualny format.
6. Konwersja powinna zachować znaczenie i wygląd presetu, na ile to możliwe.
   Rozróżnić migrację bezstratną, konwersję wymagającą decyzji i brak obsługi.
   Nie usuwać po cichu danych ani nie zastępować nieobsługiwanych wartości
   domyślnymi. Konwersje wstecz nie są domyślnie gwarantowane.
7. Nieznana nowsza wersja i uszkodzone dane muszą być rozróżniane; odrzucenie
   nie może powodować nadpisania oryginału. Pozostałe poprawne presety pozostają
   dostępne. Ponowne otwarcie nie może ponownie degradować danych.
8. Przed trwałą migracją biblioteki zachować trwałą kopię oryginału. Zapisywać
   dopiero kompletny zwalidowany wynik, z obsługą błędu zapisu/braku miejsca.
   Skrypt plikowy domyślnie tworzy osobny plik wynikowy, zachowując wejście.
9. Changelog opisuje zmiany formatu i ograniczenia konwersji. Gotowość do bety
   wymaga zweryfikowanego zachowania po aktualizacji desktopu i ponownym starcie.

## Katalog danych desktopu

Wymaganie użytkownika: własny katalog FrameNote w katalogu domowym, z presetami
w postaci plików. Przyjęta propozycja lokalizacji: `~/FrameNote/` (widoczny folder).
Katalog wchodzi w użycie wraz ze startem `0.1.0-beta`: utworzy go aplikacja
przy pierwszym uruchomieniu wersji beta. Przed betą nie tworzyć `~/FrameNote`
ani nie przenosić do niego rzeczywistej biblioteki użytkownika. Implementację
i migracje przygotować oraz zweryfikować wcześniej w izolowanym katalogu
testowym. Dotychczasowy zapis pozostaje aktywny w wersjach alpha.

```text
~/FrameNote/
  presets/
    <preset-id>.json
  backups/
```

- Jeden preset użytkownika to jeden samodzielny JSON, zawierający również jego
  zasoby jak przy eksporcie. Nazwę pliku wyznacza bezpieczny identyfikator, nie
  edytowalna nazwa presetu; zmiana nazwy nie zmienia tożsamości pliku.
- Desktop odczytuje i zapisuje bibliotekę przez proces główny Electrona i wąskie
  API. Wspólny edytor korzysta z abstrakcji repozytorium presetów. Dla webu nadal
  dostępna jest pamięć przeglądarki oraz import/eksport; web nie uzyskuje
  automatycznie dostępu do katalogu domowego.
- Przy pierwszym uruchomieniu bety przenieść istniejące presety z localStorage do plików,
  zachowując źródło i kopię bezpieczeństwa. Operacja musi dać się bezpiecznie
  ponowić po przerwaniu, bez duplikowania i nadpisywania istniejących presetów.
  Nie oznaczać migracji jako zakończonej przed udanym zapisem i odczytem wyniku.
- Zapisy wykonywać przez plik tymczasowy i zastąpienie pliku docelowego; błędy
  uprawnień, braku miejsca i uszkodzone JSON-y nie mogą usuwać biblioteki.
  Przed migracją formatu zachować oryginalne pliki w `backups/`.
- Aktualizacja aplikacji zachowuje `~/FrameNote`. Profil Chromium nadal ma swoje
  dotychczasowe zastosowania; nowy katalog nie jest przeniesieniem całego profilu.
  Uruchomienia testowe muszą korzystać z izolowanego katalogu danych, a nie
  rzeczywistej biblioteki użytkownika.
- Katalog może w przyszłości zawierać konfigurację aplikacji. Nie tworzyć teraz
  pustego pliku config ani nie przenosić ustawień bez osobnego zakresu (NTH-005).

## Plan implementacji

Prace prowadzić bezpośrednio na `master`, zgodnie z poleceniem użytkownika. Użytkownik polecił realizację na `master`: każdy etap kończy się weryfikacją
i commitem, po czym automatycznie rozpoczyna się kolejny. Nie wymagamy osobnej
oceny między etapami. Publikacja zdalna pozostaje osobną operacją.
Numer docelowy to `0.1.0-beta`, bez dodatkowego licznika. Po wydaniu poprawki
otrzymują kolejne PATCH, a nowe funkcje i zmiany niezgodne — MINOR z zerowym
PATCH. Wszystkie poniższe prace składają się na jedną pierwszą betę; nie tworzyć
osobnych wersji beta dla etapów przygotowawczych.

### 0. Uporządkowanie historycznych nazw i zasad wersjonowania

| Dotychczasowe oznaczenie | Docelowe oznaczenie | Sposób zmiany                                          |
| ------------------------ | ------------------- | ------------------------------------------------------ |
| `pre-mvp`                | `v0.0.1-alpha`      | Tag na tym samym commicie `9a627af`                    |
| `mvp`                    | `v0.0.2-alpha`      | Tag na tym samym commicie `a60aa97`                    |
| `1.0.0-alpha.1`          | `0.0.3-alpha`       | Obecne manifesty i opis historycznej sekcji changeloga |
| Planowana pierwsza beta  | `0.1.0-beta`        | Dopiero po spełnieniu wymagań etapów 1–5               |

- Sprawdzić już przygotowane zmiany w README, AGENTS.md, skillu, changelogu
  i manifestach; zachować wyjaśnienie zmiany dawnych nazw. Nie przepisywać
  historycznych commitów ani manifestów zapisanych w tych commitach.
- Przy publikacji najpierw sprawdzić tagi origin. Wysłać docelowe tagi; stare
  nazwy usuwać z origin tylko po sprawdzeniu ich celów i w ramach uzgodnionej
  publikacji. Nie przesuwać istniejącego docelowego taga na inny commit.
- Dla obecnej alphy można utworzyć `v0.0.3-alpha` dopiero na commicie zawierającym
  normalizację manifestów; nie tagować obecnego HEAD, którego manifesty nadal
  mają poprzedni numer. Wymaga to polecenia commita, nie samego planowania.
- Wynik: spójna mapa dawnych nazw, zgodne manifesty i zasady `0.x.y-alpha/beta`,
  a po publikacji również zgodny zestaw tagów zdalnych.

### 1. Kontrakt formatu i historyczne dane

- Przejrzeć formaty 1/2 w historii, parserze, wbudowanych presetach i fixture'ach.
  Zapisać obsługiwane warianty; dotychczas format rozwijano w miejscu, dlatego
  sam numer nie wystarcza do ustalenia kształtu danych.
- Ustalić docelowy format dla bety. Robocza propozycja to wersja 3, oddzielająca
  pierwszy zamrożony kontrakt od historycznych formatów 1/2; potwierdzić po audycie.
- Dodać historyczne przykłady jako fixture'y i opisać, które migracje zachowują
  dane, a które wymagają ostrzeżenia lub nie są możliwe.
- Wynik: tabela wersji/konwersji i kryteria zgodności, zanim zmienimy parser.

### 2. Schematy Zod i wspólny silnik migracji

- W `packages/core` utworzyć osobne moduły schematów każdej obsługiwanej wersji,
  moduły kolejnych migracji i jeden punkt odczytu do aktualnego modelu.
- Wprowadzić rozróżnienie błędnych danych, nowszej nieobsługiwanej wersji
  i niepełnej konwersji. Zachować limity rozmiaru/liczby elementów i walidację
  zasobów SVG/PNG. Nie uruchamiać logiki wymagającej DOM w procesie głównym.
- Podłączyć potok do obecnego importu i biblioteki webowej bez zmiany backendu
  przeglądarki. Nowe zapisy i eksport mają aktualny numer formatu.
- Przygotować skrypt migracji JSON korzystający z tego samego silnika, zapisujący
  osobny wynik i raport bez nadpisywania wejścia.
- Wynik: testy każdej migracji i całego łańcucha, ponownego odczytu aktualnych
  danych, odrzuceń oraz zachowania układu i zasobów.

### 3. Biblioteka plikowa desktopu i pierwsze uruchomienie bety

- Zastąpić synchroniczny port localStorage abstrakcją repozytorium obsługującą
  asynchroniczne operacje plikowe. Zachować kolejność zapisów i spójność UI:
  błąd zapisu nie może wyglądać jak zapisany preset.
- Dodać operacje biblioteki w procesie głównym i ograniczone API preload.
  Ścieżki wyznacza aplikacja, a nie dowolny tekst przekazany z edytora.
- Wdrożyć `~/FrameNote/presets` i `backups`, bezpieczne identyfikatory plików,
  zapis przez plik tymczasowy oraz odczyt niezależnych rekordów.
- Dodać jednorazową, wznawialną migrację z localStorage: kopia oryginału,
  konwersja, zapis, odczyt kontrolny, dopiero potem oznaczenie zakończenia.
  Konflikt istniejącego ID nie może po cichu zastąpić innego presetu.
- Aktywować rzeczywisty katalog użytkownika dopiero w becie. W developmencie
  i testach używać jawnie wskazanego katalogu testowego; zachować izolację
  również przy testowaniu paczki z numerem beta.
- Wynik: dodawanie, edycja, duplikowanie i usuwanie presetów działa po restarcie;
  uszkodzony rekord, błąd zapisu i przerwana migracja nie niszczą oryginałów.

### 4. Wersja produktu i rozpoznawanie buildu

- Dodać narzędzie synchronizacji wersji wszystkich manifestów i kontrolę zgodności
  SemVer, sekcji changeloga oraz istniejących tagów. Włączyć kontrolę do `pnpm check`.
  Regułę podbicia sprawdzać względem jawnie wskazanego punktu bazowego, bez
  zakładania, że każdy commit na branchu musi mieć nową wersję.
- Zapisywać wersję, skrót commita i stan dirty podczas budowania webu i desktopu.
  Pokazywać je we wspólnym About i pozostałych istniejących miejscach z wersją.
  Oddzielić produktowy SemVer od wymagań numerów w metadanych macOS.
- Zaktualizować skill i dokumentację do rzeczywistych poleceń/checków; dodać
  regułę wymagającą schematu, migracji i fixture'ów przy zmianach formatu presetów.
- Wynik: można wskazać konkretny build na obu platformach; kontrola wykrywa
  rozbieżne wersje i brak wpisu dla przygotowywanej numerowanej wersji.

### 5. Weryfikacja i wydanie `0.1.0-beta`

- Wykonać `pnpm check`, testy webowe i desktopowe oraz regresję eksportu JPG.
  Uruchomić `pnpm test:visual`, a przy zmianach współdzielonych komponentów
  również `pnpm test:visual --all-projects`; obejrzeć każdą różnicę.
- Sprawdzić na izolowanych danych: aktualizację z alphy z istniejącymi presetami,
  świeżą instalację, restart, ponowienie migracji, błędy/nowsze formaty, konflikty
  plików, błędy zapisu oraz import/eksport między webem i desktopem.
- Porównać wygląd i eksport historycznych presetów po migracji. Brak możliwości
  konwersji musi być widoczny i pozostawiać dane do odzyskania.
- Po zamknięciu kryteriów i ocenie użytkownika przygotować squash do `master`,
  wspólne `0.1.0-beta`, datowany changelog oraz lokalny tag
  `v0.1.0-beta`. Zachować przypisanie historycznych etapów do tagów alpha.
- Z finalnego commita lokalnie zbudować web i paczkę macOS do weryfikacji.
  Sprawdzić zainstalowaną aplikację, zgodność wyświetlanej wersji/builda oraz
  trwałość presetów po aktualizacji. Te artefakty służą testom, nie publikacji.
- Udostępnić kod oznaczony tagiem `v0.1.0-beta` wraz z changelogiem i instrukcją
  samodzielnego budowania z tego tagu. Push wykonać w ramach polecenia publikacji,
  nie samego przygotowania planu. Nie dodawać binarnych załączników do wydań,
  nie commitować buildów i nie wdrażać hostingu artefaktów ani automatycznego
  deploymentu webu w ramach tego zadania.
- Podpisywanie i notaryzacja do publicznej dystrybucji gotowych paczek nie są
  warunkiem tej bety źródłowej. Dokumentacja ma jasno opisywać lokalny build
  i jego ograniczenia, bez sugerowania podpisanej dystrybucji.

## Warunki zakończenia

- [x] Historyczne nazwy mają udokumentowaną mapę i lokalne tagi wskazują właściwe commity.
- [ ] Zmiany numeracji są zapisane w repozytorium; stan tagów origin jest sprawdzony
      i uporządkowany w ramach publikacji.
- [ ] Obsługiwane historyczne formaty mają osobne schematy i testowane migracje.
- [ ] Nieobsługiwane lub uszkodzone dane pozostają możliwe do odzyskania.
- [ ] Desktop bety zapisuje presety w `~/FrameNote/presets` i zachowuje je po aktualizacji.
- [ ] Przejście z dotychczasowej biblioteki jest bezpieczne i wznawialne.
- [ ] Web i desktop współdzielą format oraz potok importu/migracji/eksportu.
- [ ] Skrypt konwersji działa na plikach, zachowując wejście.
- [ ] Wersja i build są rozpoznawalne; kontrola wersji/changeloga działa.
- [ ] Wymagane testy i ocena użytkownika zakończone, ograniczenia udokumentowane.
- [ ] Lokalne buildy weryfikacyjne odpowiadają oznaczonemu commitowi `0.1.0-beta`.
- [ ] Beta 1 udostępniona jako kod/tag z instrukcją samodzielnego budowania,
      bez gotowych buildów do pobrania.

Plik konfiguracji, synchronizacja chmurowa i ogólna konwersja do starszych
formatów pozostają poza tym zakresem. Beta nie jest stabilnym `1.0.0`.

## Postęp realizacji

### Etap 0 — normalizacja lokalna, 2026-10-31

- Utworzono branch `codex/beta-1-preparation`, zachowując przygotowane zmiany.
- Zsynchronizowano pięć manifestów na `0.0.3-alpha`; README, changelog,
  AGENTS.md i skill opisują numerację bez licznika po nazwie kanału.
- Lokalne tagi `v0.0.1-alpha` i `v0.0.2-alpha` wskazują odpowiednio `9a627af`
  oraz `a60aa97`. Odczyt tagów origin potwierdził zgodność historycznych celów.
- Nie wykonano commita, merge'a, push ani publikacji; nie utworzono taga
  `v0.0.3-alpha`, ponieważ normalizacja nie jest jeszcze zapisana w commicie.
- Etap 0 oczekuje oceny użytkownika. Zmiana tagów na origin pozostaje częścią
  publikacji. Schematy Zod, migracje i zapis plikowy nie są jeszcze wdrożone.

### Etapy 0–1 — wykonane

- Etap 0: commit `50ebf71`, lokalny tag `v0.0.3-alpha`.
- Etap 1: audyt opisany w `PRESET_FORMATS.md`; dodano odtwarzalne przykłady
  historycznych kontraktów v1/v2. Docelowy format pierwszej bety: v3.
- Dalsza realizacja obejmuje testy i commity bez zatrzymywania między etapami.
