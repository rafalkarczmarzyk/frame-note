# FrameNote — monorepo, web i desktop na macOS

Data: 2026-10-30. Status: propozycja etapów do uzgodnienia.
Prośba o plan nie oznacza zgody na implementację, commit ani publikację.
Każdy etap kończy się oceną użytkownika i potwierdzeniem przejścia dalej.

## Cel końcowy i proponowany zakres

Jedno monorepo pnpm, wspólny edytor oraz dwie działające aplikacje:
web na dotychczasowym adresie Netlify i aplikacja macOS instalowana na komputerze
użytkownika, uruchamiana bez serwera deweloperskiego i działająca offline.
Obie obsługują istniejący przepływ: JPG/PNG, metadane, warstwy, grafiki, tła,
presety, podgląd, eksport JPG i serii do ZIP.

Pierwszy desktop obejmuje natywne dialogi plików, drag-and-drop, trwałe presety
i ustawienia, podstawowe menu i skróty oraz obecny katalog lokalnych fontów.
Fonty systemowe i eksport serii do folderu są decyzjami zakresowymi przed
implementacją, nie domyślnym rozszerzeniem tego planu. Nie są warunkiem monorepo.
Zachowujemy React i obecny renderer; nie przepisujemy edytora na natywny interfejs.

Rezultatem jest również lokalny artefakt .app i uzgodniony pakiet instalacyjny,
np. DMG. Publiczna dystrybucja z podpisem i notaryzacją wymaga ustalenia zakresu
oraz dostępnych uprawnień Apple. Lokalny build nie oznacza gotowego wydania
publicznego. Automatyczne aktualizacje nie należą do pierwszego zakresu.

## Stan wyjściowy

- Jedna aplikacja React/Vite, bez konfiguracji desktopu i pakietów monorepo.
- Modele i część logiki nadają się do core. Renderer, pomiar tekstu i dekodowanie
  korzystają z DOM/Canvas i mogą pozostać we wspólnym edytorze.
- extractMetadata przyjmuje bajty oraz opcjonalny parser XML. loadPhoto łączy
  odczyt, walidację, dekodowanie i zarządzanie zasobami.
- Pobieranie JPG, ZIP i presetów jest rozproszone w App, workspace i UI presetów.
- PresetStore ma wstrzykiwany magazyn, ale jego kontrakt i zapis są synchroniczne.
- Fonty są lokalne, a walidacja presetów dopuszcza zamknięty katalog rodzin.
- Nie znaleziono netlify.toml; rzeczywiste ustawienia witryny trzeba odczytać
  z Netlify. Nie zakładamy, że brak pliku oznacza brak konfiguracji.
- Istnieją testy jednostkowe, E2E, eksportu, UI i Glass. Przy pisaniu planu
  nie uruchamiano ich ponownie.

## 1. Punkt odniesienia i zakres pierwszego desktopu

Uruchomić pnpm check i zapisać wynik. Rozwiązać lub oddzielić istniejące błędy
od późniejszego refaktoru. Spisać operacje plikowe, zapis danych i dostarczanie
fontów, wraz z anulowaniem, błędami i zwalnianiem zasobów.

Potwierdzić architekturę Maca użytkownika, minimalny macOS oraz czy pierwsza
wersja jest do użytku lokalnego, czy dystrybucji innym osobom. Potwierdzić zakres
fontów systemowych i eksportu serii. Migracje presetów pozostają poza zakresem
zgodnie z NTH-002. Nie wymagamy nowych funkcji edytora przed przenosinami.

Odbiór: znany wynik testów, uzgodniony zakres i lista zależności od platformy.

## 2. Wybór technologii i próba na macOS

Porównać Electron i Tauri na podstawie aktualnej dokumentacji oraz wymagań:
Canvas/Glass, fonty, pliki, testowanie, utrzymanie i rozmiar aplikacji.
Przed właściwą integracją uzgodnić wybór z użytkownikiem.

W wybranym środowisku sprawdzić istniejący edytor: lokalne zasoby, fonty,
import zdjęcia, Glass i wygenerowanie JPG. Uruchomić spakowaną próbę bez serwera.
Nie tworzyć drugiej kopii edytora. Problemy silnika renderującego wyjaśnić przed
większą reorganizacją. Nie deklarować wsparcia obu architektur Maca bez testów.

Odbiór: wybrana technologia i działająca próba krytycznych funkcji na macOS.

## 3. Wydzielenie usług platformy

W obecnej strukturze oddzielić wybieranie plików, zapisywanie wyników
(JPG, ZIP, presety, kopia odzyskiwania) oraz magazyn presetów i preferencji.
Usługi przekazywać przy uruchomieniu aplikacji. UI nie wykrywa desktopu
ani nie importuje jego API. Drag-and-drop korzysta ze wspólnego importu.

Operacje projektować asynchronicznie, rozróżniając sukces, anulowanie i błąd.
W webie rozpoczęcie pobierania nie oznacza potwierdzonego zapisu na dysku.
Zachować kolejność zapisów presetów, ochronę uszkodzonych danych, istniejące
klucze magazynu i brak komunikatu sukcesu po nieudanym zapisie.

Utrzymać własne kopie źródeł sesji, niezależne układy zdjęć, sekwencyjny eksport
i anulowanie. Nie zmieniać przy okazji modelu sesji ani zarządzania pamięcią.
Nie usuwać DOM z interfejsu i renderera: wydzielamy operacje systemowe.

Odbiór: web zachowuje działanie; testy błędów, anulowania i kolejnych zapisów
oraz istniejące testy przepływów przechodzą.

## 4. Monorepo i Netlify

Docelowa struktura:

```text
apps/web          uruchomienie webu i jego usługi platformy
apps/desktop      powłoka macOS i jej usługi platformy
packages/editor   wspólny UI, sesja, renderer i kontrakty usług
packages/core     modele i czysta logika bez React/DOM
```

Użyć pnpm workspace, bez dodatkowego narzędzia orkiestracji na start.
Przenieść próbę desktopową do apps/desktop. Zachować komendy z katalogu głównego,
Storybook, fixture’y, zasoby i profile testów. Nie tworzyć pakietu dla każdej funkcji.
Zależności biegną od aplikacji do edytora i od edytora do core, nigdy odwrotnie.
Kod dekodowania, pomiaru tekstu i walidacji SVG używający DOM pozostaje poza core.

Odczytać ustawienia Netlify: repozytorium, gałąź, katalog bazowy, komendę builda,
katalog publikacji, wersje narzędzi, przekierowania i środowisko. Dodać powtarzalną
konfigurację budowania webu z katalogu głównego workspace i publikacji apps/web/dist.
Zachować domenę, routing oraz działanie fontów i grafik. Netlify publikuje tylko web.

Sprawdzić Deploy Preview przed produkcją. Produkcyjny deploy wykonać po poleceniu
publikacji; przygotować możliwość powrotu do poprzedniego działającego deploya.

Odbiór: web i Storybook budują się, testy przechodzą, podgląd Netlify działa.
Żadna aplikacja nie utrzymuje osobnej kopii edytora.

## 5. Pełna integracja desktopu z macOS

Podłączyć natywne otwieranie wielu zdjęć, zapis JPG/ZIP/presetów, import grafik
oraz trwałe przechowywanie presetów i ustawień. Obsłużyć anulowanie dialogu,
błędy odczytu/zapisu, potwierdzenie nadpisania i nazwy plików. Zapewnić drop zdjęć.

System udostępniać przez wąski, walidowany most. Edytor i importowane treści
nie dostają dowolnego dostępu do plików ani wykonywania poleceń. Zachować
ograniczenia importu SVG/PNG. Sprawdzić ładowanie zasobów w spakowanej aplikacji
oraz koszt kopiowania dużych zdjęć przez granice procesów.

Dodać podstawowe menu i skróty: otwórz, eksport, schowek, undo/redo, zamknij.
Uzgodnić i wdrożyć ostrzeganie o utracie niezapisanej pracy oraz zachowanie przy
zamykaniu podczas importu/eksportu. Nie obiecywać automatycznego odzyskiwania sesji.
Presety webu i desktopu są zapisane osobno; przenoszenie odbywa się przez pliki.

Odbiór: pełny przepływ działa w desktopie; presety i preferencje wracają po
ponownym uruchomieniu, a błędy i anulowanie nie niszczą bieżącej pracy.

## 6. Fonty i zgodność presetów

Zapewnić wspólne źródło dołączanych fontów i grafik bez dublowania plików
w repozytorium. Sprawdzić ich obecność w obu buildach i działanie offline desktopu.
Zachować identyfikatory fontów i zgodność przenoszenia obecnych presetów.

Oddzielić katalog/identyfikację fontów od dostarczania. Jeżeli uzgodniono fonty
systemowe w pierwszym desktopie, dodać ich dostawcę i obsługę dostępnych odmian.
Ustalić zachowanie brakującego fontu po przeniesieniu presetu: zachować jego
identyfikator, pokazać brak i wymagać jawnego wyboru zamiennika przed eksportem.
Nie zapisywać ścieżek systemowych w przenośnym presecie ani nie obiecywać
osadzania plików fontów. Bez rozszerzenia zakresu pozostaje obecny katalog.
Nie rozbudowywać migracji presetów ani formatu dla hipotetycznych potrzeb.

Przed dystrybucją rozstrzygnąć opisaną w FONT_LIBRARY.md licencję Advercase.

Odbiór: fonty i presety działają na obu platformach; brak cichego zastępowania
fontu w eksporcie i uzgodnione zachowanie ewentualnych fontów systemowych.

## 7. Pakowanie i weryfikacja obu aplikacji

Przygotować powtarzalny build .app i uzgodnionego pakietu instalacyjnego.
Zainstalować poza repozytorium, wyłączyć serwer deweloperski i sieć; sprawdzić
import, fonty, Glass, presety i eksport. Zweryfikować nazwę, ikonę, identyfikator
aplikacji oraz miejsce danych użytkownika.

Uruchomić pnpm check i build Storybooka. Dodać mały zestaw testów integracji
desktopowej odpowiedni dla wybranej technologii. Na tych samych fixture’ach
sprawdzić orientację, wymiary, metadane, treść, fonty i geometrię eksportu.
Nie zakładać identycznych bajtów JPG między silnikami; różnice pikseli obejrzeć
i wyjaśnić. Wzorce desktopowe tworzyć dopiero po ocenie wyników, osobno dla
właściwego środowiska. Nie aktualizować wzorców tylko dla uzyskania zielonych testów.

Sprawdzić większą serię zdjęć, pamięć, responsywność i anulowanie; zapisać warunki
pomiaru i ograniczenia. Przy zmianach UI uruchomić pnpm test:visual, a przy zmianach
wspólnych komponentów/styli również pnpm test:visual --all-projects.
Brak właściwego środowiska zgłosić jako niewykonaną weryfikację.

Odbiór: instalowalna aplikacja działa offline na Macu użytkownika, web przechodzi
regresję, a wyniki i znane ograniczenia są zapisane.

## 8. Udostępnienie i odbiór końcowy

Po poleceniu publikacji wdrożyć sprawdzony web na dotychczasowy adres Netlify
i przeprowadzić krótki test produkcyjny. Przekazać pakiet macOS, instrukcję
instalacji i aktualizacji ręcznej oraz opis przechowywania danych.
Sprawdzić przenoszenie presetu web → desktop → web.

Jeśli uzgodniono publiczną dystrybucję macOS, przed nią wykonać podpisywanie,
notaryzację i test instalacji pobranego pakietu z autoryzowanego konta Apple.
Brak uprawnień pozostawić jako jawną zaległość dystrybucyjną, bez obchodzenia
zabezpieczeń systemu. Nie utożsamiać lokalnego builda z publicznym wydaniem.

Odbiór końcowy: działający web pod istniejącym adresem, działająca zainstalowana
aplikacja macOS, wspólny kod, powtarzalne buildy i testy oraz akceptacja użytkownika.
Zaktualizować README i status planu na podstawie rzeczywistych wyników.

## Poza proponowanym pierwszym zakresem

Windows/Linux, synchronizacja, automatyczne aktualizacje, odzyskiwanie sesji,
nowy renderer i integracja z Lightroom. To granice tej propozycji, nie nowe
zapisane decyzje użytkownika o odłożeniu funkcji.
