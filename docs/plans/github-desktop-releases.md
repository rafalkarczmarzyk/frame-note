# Automatyczne paczki desktopowe w GitHub Releases

## Stan i zakres

- Stan: planowanie, propozycja implementacji do uzgodnienia; aktualizacja 2026-11-02.
- Polecenie użytkownika „zaktualizuj i commit” obejmuje aktualizację i lokalny
  commit tego dokumentu na master. Nie obejmuje implementacji ani pushowania.
- Cel: przygotowanie jednej wersji FrameNote uruchamia na GitHub Actions buildy
  trzech systemów; użytkownik pobiera gotowe paczki z GitHub Releases.
- Decyzje z rozmowy: użytkownik chce darmowego budowania i podpisywania oraz
  planowania rozwiązania. GitHub CLI jest zainstalowany i zalogowany; repozytorium
  `rafalkarczmarzyk/frame-note` było wskazane jako publiczne. Przed wdrożeniem
  ponownie sprawdzić widoczność repo i dostęp narzędzi. Nie zlecono implementacji,
  pushowania ani publikacji; autoryzowano wyłącznie commit planu.
- Proponowane cele początkowe: macOS arm64 DMG, Windows x64 instalator EXE,
  Linux x64 AppImage. Trzy systemy nie oznaczają wszystkich architektur.
- Podpisy: macOS ad hoc bez certyfikatu i notaryzacji; Windows bez podpisu;
  Linux bez zaufanego certyfikatu. Nie przenosimy lokalnych kluczy do GitHuba.
- Proponowany proces: wysłanie tagu `v<wersja>` uruchamia buildy i przygotowuje
  szkic wydania; publikacja ręczna po odbiorze. Próbne buildy z branchu uruchamiane
  ręcznie dają wyłącznie tymczasowe pliki Actions, bez wydania i tagu produktu.
- Web: brak zmiany wdrożenia i zachowania. Wspólny edytor/model: tylko poprawki
  niezbędne do zgodności systemowej, bez nowych funkcji edycji.
- Poza zakresem propozycji: płatne certyfikaty, SignPath, notaryzacja, sklepy,
  aktualizator aplikacji, Intel Mac, Windows/Linux ARM, dodatkowe formaty paczek.
- Przyszła implementacja na branchu `codex/github-desktop-releases`; branch
  obecnie nie istnieje. Bazą aktualizacji planu jest master, HEAD `ebe044e`,
  zgodny z origin/master. Jedynym niezapisanym plikiem przed tą aktualizacją
  był ten plan; po commicie ma być śledzony.

## Stan wyjściowy i zależności

- Manifesty wskazują `0.3.0-beta`. Produkt pozostaje source-only; ten plan
  nie oznacza istnienia paczek dla Windows/Linux ani automatycznych wydań.
- Brak katalogu `.github`. Obecny `@electron/packager` wymusza darwin/arm64,
  narzędzia Apple i ad hoc codesign; tworzenie DMG automatyzuje Finder.
- Main/preload i zapis presetów są współdzielone. Fonty systemowe używają AppKit
  na macOS, a na pozostałych systemach `queryLocalFonts`; wymagają realnych prób.
- Przed publicznym udostępnieniem paczek przeprowadzić aktualny audyt licencji
  wszystkich dołączanych fontów i zależności oraz dołączyć wymagane teksty licencji.
  Podstawą jest obecny katalog opisany w FONT_LIBRARY.md.
- Na master desktop:package nadal czyści release i wykonuje build oraz pakowanie
  aplikacji wraz z DMG; desktop:install buduje i pakuje aplikację bez DMG.
  Nie ma komendy desktop:dist ani mechanizmu ponownego używania aktualnego buildu.
- Osobna praca nad rozdzieleniem komend i cache nie została scalona; jej branch
  usunięto na polecenie użytkownika. Nie zakładać jej obecności w obecnej bazie.
  Potrzebny podział należy zaplanować i wdrożyć w ramach zaakceptowanego zakresu.
- Historia repo została przepisana; do nowych odwołań używać aktualnych SHA.
  Bieżący design i wersja 0.3.0-beta są opublikowane. Logotyp SVG pozostaje
  odrębnym, odłożonym zadaniem; nie zmieniać go w ramach pakowania.
- Weryfikację aplikacji i odtwarzanie wzorców wizualnych po zmianie typografii
  pozostawiono na później zgodnie z poleceniem użytkownika. Obecnego stanu nie
  traktować jako w pełni zweryfikowanego wydania gotowego do dystrybucji.
- Celem pozostaje brak płatnych usług: przed wdrożeniem sprawdzić aktualne zasady
  i limity Actions dla wybranego repo oraz runnerów. Nie włączać większych,
  płatnych maszyn. Ograniczyć retencję plików próbnych.

## Wersja i zgodność

- Aktualna wersja produktu: `0.3.0-beta`.
- Prognoza implementacji według maintain-versioning: `0.4.0-beta`, bo dochodzi dystrybucja
  aplikacji dla Windows/Linux. Ponownie wyliczyć przy integracji, jeżeli baza
  wersji lub zakres ulegną zmianie. Jeden przyrost dla ukończonego zadania.
- Sam zapis planu nie zmienia wersji ani changeloga. Robocze commity nie podbijają
  wersji. Wpis angielski Unreleased powstanie dla rzeczywiście wdrożonych zmian.
- Format presetów pozostaje v1, bez migracji. Czytniki v1 zachowują zgodność;
  dostępność fontu systemowego zależy od urządzenia. Podgląd i eksport muszą
  zachować obecny mechanizm zastępowania niedostępnych rodzin przez Montserrat.

## Kryteria akceptacji

| AC    | Obserwowalne zachowanie                                                                                                                  | Weryfikacja                                                                             | Wynik       | Odbiór   |
| ----- | ---------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | ----------- | -------- |
| AC-01 | Ta sama wersja i commit dają macOS arm64 DMG, Windows x64 EXE i Linux x64 AppImage z jednoznacznymi nazwami                              | Mac lokalnie i Actions dla każdego celu; inspekcja paczek i About                       | niewykonane | oczekuje |
| AC-02 | Zainstalowana/rozpakowana paczka uruchamia się poza repozytorium i działa offline                                                        | Smoke test gotowej paczki na każdym systemie; ręczna instalacja                         | niewykonane | oczekuje |
| AC-03 | Import JPG/PNG, fonty wbudowane/systemowe, eksport JPG/ZIP, zapis/odczyt presetów v1 po restarcie działają na każdym celu                | Testy natywne, kontrola plików, ręczne dialogi i ścieżki ze spacjami/znakami narodowymi | niewykonane | oczekuje |
| AC-04 | macOS ma prawidłowy podpis ad hoc; instalacja nie wymaga wyłączania ochrony systemu                                                      | codesign verify i próba pobrania na drugim Macu; udokumentowane Open Anyway             | niewykonane | oczekuje |
| AC-05 | Tag zgodny z manifestami buduje dokładnie wskazany commit; błędna wersja lub nieudany wymagany build nie daje kompletnego szkicu wydania | Test walidacji tagu i negatywnych ścieżek, przegląd zależności zadań                    | niewykonane | oczekuje |
| AC-06 | Po sukcesie wszystkich celów szkic wydania ma komplet paczek, SHA256SUMS i informacje o braku zaufanych podpisów                         | Odczyt szkicu przez gh, porównanie sum i listy plików                                   | niewykonane | oczekuje |
| AC-07 | Ręczny build próbny nie publikuje wydania, a ponowienie zadania nie nadpisuje opublikowanej wersji                                       | Próbny workflow i kontrola obsługi istniejących wydań                                   | niewykonane | oczekuje |
| AC-08 | Nie ma płatnych usług, sekretów podpisujących ani regresji lokalnych komend macOS, webu i presetów                                       | Przegląd uprawnień/dependencies, odpowiednie testy projektu                             | niewykonane | oczekuje |
| AC-09 | Wszystkie redystrybuowane fonty i zależności mają ustalone licencje dołączone do paczek                                                  | Audyt zasobów przed zdalnym buildem                                                     | niewykonane | oczekuje |

## Etapy

### 1. Pakowanie i zgodność lokalna

- Przed zdalnym udostępnieniem paczek skontrolować licencje aktualnie dołączanych
  zasobów i zależności, bez zmiany logotypu lub dodawania nowych fontów.
- Wybrać narzędzie pakujące; preferowana wspólna konfiguracja electron-builder
  dla DMG/NSIS/AppImage, po porównaniu z rozszerzeniem obecnego Packagera.
  Zachować działanie desktop:install i jawnego lokalnego podpisywania certyfikatem.
- Oddzielić budowanie od pakowania i obsługi Finder; przygotować generowanie DMG
  bez interakcji, zachowując zaakceptowany wygląd instalatora, o ile wykonalne.
- Dodać ikony i metadane poszczególnych paczek. Sprawdzić menu, fonty, zapis
  i ścieżki Windows/Linux; poprawki ograniczyć do niezbędnej zgodności.
- Lokalna weryfikacja macOS i kontrola konfiguracji innych celów. Status innych
  systemów pozostaje niewykonany do ich rzeczywistego uruchomienia w etapie 2.
- Odbiór użytkownika przed kolejnym etapem. Stan: oczekuje na zlecenie.

### 2. Próbne buildy i testy na GitHub Actions

- Po zgodzie na push workflow: ręczne uruchamianie na branchu, osobne standardowe
  maszyny macOS arm64, Windows x64 i Linux x64, przypięte wspierane środowiska.
- Przypięty pnpm/Node zgodny z repozytorium, frozen lockfile, cache zależności;
  Actions przypięte do zweryfikowanych commitów. Bez sekretów w buildach.
- Osobne katalogi wyjściowe; pliki próbne z krótką retencją, np. 7 dni.
- Uruchomienie i smoke test gotowej aplikacji na każdym systemie. Linux może
  wymagać Xvfb i kontrolowanego testu AppImage/FUSE; nie obchodzić ochrony
  Electrona jako domyślnego sposobu uruchamiania przez użytkownika.
- Rozdzielić testy przenośne od natywnych testów macOS; brak sesji graficznej
  oznacza niewykonaną kontrolę, nie zaliczenie. Nie regenerować wzorców wizualnych
  na innym systemie. Testy UI i desktopowe kolejno.
- Ręczny odbiór instalacji Windows/Linux na dostępnych urządzeniach lub VM.
  Sam sukces pakowania nie oznacza akceptacji wsparcia systemu.
- Odbiór użytkownika przed etapem 3. Stan: oczekuje.

### 3. Szkic wydania i dokumentacja

- Trigger po push tagu `v*`; sprawdzenie zgodności wersji i checkout dokładnego
  commita tagu. Ręczne próby nadal nie tworzą wydania.
- Dopiero po wszystkich wymaganych buildach/testach zadanie publikujące pobiera
  ich wyniki, oblicza SHA-256 i tworzy szkic z kompletem plików. Beta oznaczona
  jako prerelease. Token GitHuba ma contents:write tylko w tym zadaniu;
  pozostałe zadania contents:read, bez uprzywilejowanych buildów obcego kodu.
- Obsłużyć ponowienia: uzupełnianie wyłącznie właściwego szkicu dla tego tagu,
  odmowa automatycznej zmiany opublikowanych wydań. Kontrola współbieżności.
- Release notes z właściwej sekcji changeloga, instrukcje instalacji i ostrzeżenia
  macOS/Windows, architektury i wymagania systemowe oparte na faktycznych próbach.
- Uaktualnić README/DESKTOP i projektowe instrukcje mówiące dziś o source-only,
  bez zmiany reguły oddzielnej zgody na zdalne operacje.
- Weryfikacja szkicu i pobranych plików. Ręczna publikacja dopiero po osobnym
  poleceniu użytkownika. Stan: oczekuje.

## Weryfikacja i ocena

- W ramach aktualizacji planu odczytano kod, manifesty i historię Git.
  Nie uruchamiano buildów, testów aplikacji ani generowania wzorców.
- Przed testami implementacji uzgodnić wznowienie odłożonej weryfikacji aplikacji
  i aktualizacji wzorców. Dotychczasowy zakaz ich uruchamiania pozostaje w mocy
  do nowego polecenia; zapis poniższej listy nie jest zgodą na ich wykonanie.
- Dla implementacji: format/lint/typecheck, kontrola wersji, testy jednostkowe,
  build web/desktop oraz testy adekwatne do zmian. Desktop macOS od pierwszej
  próby z require_escalated według AGENTS.md. Zmiany UI wymagają test:visual,
  a wspólne komponenty również --all-projects i obejrzenia różnic.
- Dla każdego celu zapisać wersję OS, architekturę, commit, nazwę paczki i sumę;
  osobno wynik automatyczny, ręczny oraz akceptację użytkownika.
- Ręcznie: pobranie i instalacja poza repo, uruchomienie offline (AC-02/04),
  fonty/import/eksport i restart z presetami (AC-03), komplet plików (AC-06).

## Wydanie i uprawnienia

- Plan nie jest zgodą na implementację ani zdalne operacje. Etapy wymagają
  oddzielnego odbioru, chyba że użytkownik wyraźnie połączy zgody.
- Commit/merge, push tagu uruchamiającego pakowanie i utworzenie szkicu oraz
  publiczna publikacja wymagają odpowiedniego polecenia. Przy ich uzyskiwaniu
  pokazać gotowy diff, wyniki i przewidywany skutek workflow.
- Nie tworzyć tagu produktu dla niezaakceptowanego brancha. Pierwszy pełny szkic
  release w etapie 3 sprawdzać po autoryzowanym włączeniu zadania do master,
  utworzeniu wersji/tagu i zgodzie na ich push oraz przygotowanie paczek.
- Użytkownik autoryzował lokalny commit samego planu 2026-11-02. Nie podbijamy
  wersji, nie dodajemy wpisu changeloga ani tagu: jest to wyłącznie dokumentacja.
- Nie ma implementacji workflow, tagu produktu, szkicu ani publikacji tego zadania.
  Commit planu nie autoryzuje pushowania ani uruchomienia buildów.
