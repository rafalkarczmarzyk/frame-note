# Automatyczne paczki desktopowe w GitHub Releases

## Stan i zakres

- Stan: konfiguracja i pakowanie zaimplementowane lokalnie; przygotowanie
  commita/tagu 0.3.1-beta. Przebieg GitHub Actions i Windows/Linux niewykonany.
- Najnowsze polecenie obejmuje konfigurację workflow i przygotowanie nowego
  commita/tagu dla master. Publiczna publikacja szkicu nie jest autoryzowana.
- Cel: przygotowanie jednej wersji FrameNote uruchamia na GitHub Actions buildy
  trzech systemów; użytkownik pobiera gotowe paczki z GitHub Releases.
- Decyzje z rozmowy: użytkownik chce darmowego budowania i podpisywania oraz
  planowania rozwiązania. GitHub CLI jest zainstalowany i zalogowany; repozytorium
  `rafalkarczmarzyk/frame-note` było wskazane jako publiczne. Przed wdrożeniem
  ponownie sprawdzić widoczność repo i dostęp narzędzi. Wcześniejsze ograniczenie do commita planu zostało zastąpione poleceniem
  przygotowania konfiguracji i tagu; brak osobnego polecenia pushowania.
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
- Advercase został usunięty z bieżących źródeł i katalogu fontów w osobnym
  zadaniu (`ebe044e`, wersja `0.3.0-beta`). Typografia UI korzysta obecnie
  z Montserrat Variable. Uzyskanie licencji Advercase nie jest już zależnością
  tego planu: nowe paczki nie mają zawierać jego plików. Przed pakowaniem
  wyczyścić stare wyniki i sprawdzić zawartość gotowych paczek, aby nie przenieść
  zasobów z wcześniejszych lokalnych buildów.
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
- Prognoza implementacji według maintain-versioning: `0.3.1-beta`, bo automatyzujemy pakowanie istniejącej aplikacji bez dodawania funkcji.
  Użytkownik potwierdził PATCH zamiast MINOR. Ponownie wyliczyć przy integracji, jeżeli baza
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

## Realizacja — 2026-11-02

- Najnowsze polecenie użytkownika obejmuje przygotowanie nowego tagu/commita
  i konfiguracji Actions dla tagowanych commitów na master. Łączy prace nad
  pakowaniem i workflow; nie jest zgodą na publiczne opublikowanie szkicu release.
- Zakres: istniejąca aplikacja, bez dodawania wsparcia funkcjonalnego lub nowych
  funkcji Windows/Linux. Wersja PATCH 0.3.1-beta zastępuje prognozę MINOR.
- Dodano osobny desktop:dist (electron-builder 26), zachowując lokalne skrypty
  Packagera i instalacji. Cele: macOS arm64 DMG, Windows x64 NSIS, Linux x64
  AppImage. Staging bez workspace dependencies, pakowanie bez Findera.
- Workflow reaguje na push tagu v*, sprawdza wersję i przynależność commita do
  origin/master. Untagowany push nie buduje. Ręczna próba daje tylko artefakty.
- Wszystkie wymagane buildy poprzedzają szkic release; weryfikowana jest dokładna
  lista plików i sumy SHA256. Ponowienie nie modyfikuje opublikowanego release.
- Akcje przypięto do odczytanych SHA. Uprawnienie contents:write tylko przy
  przygotowywaniu szkicu; brak sekretów certyfikatów i płatnych runnerów.
- Zaktualizowano dwa nieaktualne testy po wcześniejszym usunięciu fontu: 25
  rodzin w katalogu i Manrope jako istniejący przykład bez italic.
- Kontrole dotychczas: lint i typecheck przeszły, 415/415 testów jednostkowych,
  build desktop i porównanie 96 plików fontów/licencji przeszły. Pierwszy lokalny
  DMG i codesign verify przeszły; po korekcie izolacji stagingu wymagane ponowienie.
- Nie wykonano jeszcze zdalnych buildów Windows/Linux ani ręcznego odbioru tych
  systemów. Sukces pakowania nie oznacza ich weryfikacji funkcjonalnej.
- Pozostałe AC wymagają przebiegu workflow i odbioru gotowych paczek.

### Wyniki końcowe lokalnej weryfikacji

- 415/415 testów jednostkowych, lint, typecheck, build web i build desktop: PASS.
- Czysto izolowane pakowanie DMG bez Findera i codesign verify: PASS.
- Smoke gotowej paczki macOS: uruchomienie i eksport JPG offline PASS. Testowany
  build: 0.3.1-beta, baza 9da1952 + niezacommitowane zmiany (dirty).
- 96 fontów/plików licencji zgodnych ze źródłem; usunięty font nie jest kopiowany.
- Parser YAML oraz negatywna walidacja niepoprawnego/niezgodnego tagu: PASS.
- Format całego repo: dwa wcześniejsze problemy w docs/EXPORT_VISUAL_TEST_PLAN.md
  i e2e/photo-export-matrix.spec.ts; pliki tego zadania formatowane osobno.
- Dodano smoke uruchomienia gotowej paczki i JPG offline dla trzech systemów.
  Linux CI używa Xvfb; --no-sandbox dotyczy wyłącznie izolowanego procesu testowego
  na Linux CI, nie konfiguracji aplikacji dystrybuowanej użytkownikom.
- Windows/Linux, pełny natywny test presetów/ZIP, pobranie na drugim Macu,
  rzeczywisty upload szkicu i instalacja z pobranych paczek: NIEWYKONANE.
- Brak zmian UI aplikacji; nie aktualizowano wzorców wizualnych. Wygląd nowego
  DMG wymaga ręcznego odbioru; dotychczasowe lokalne pakowanie pozostaje bez zmian.

### Pierwszy przebieg Actions — naprawa instalacji zależności

- Run `41483924033`, tag `v0.3.1-beta`: validate PASS; wszystkie trzy buildy
  zatrzymane podczas pnpm install przez ERR_PNPM_IGNORED_BUILDS dla
  electron-winstaller@5.4.0. Nie rozpoczęto pakowania ani testów aplikacji.
- Lokalna poprawka: jawne allowBuilds electron-winstaller: false. Pakiet służy
  do niewykorzystywanego celu Squirrel.Windows; wybrany instalator Windows to
  NSIS. Pozostałe zasady strictDepBuilds i frozen-lockfile pozostają aktywne.
- Czysta instalacja w odseparowanym katalogu tymczasowym, CI=true,
  pnpm 11.21.0 i frozen-lockfile: PASS (645 pakietów). Pobranie binarnego
  Electrona pominięto tylko w tym teście instalacji; workflow nadal instaluje je
  osobnym krokiem. Nie oznacza to zweryfikowania dalszych kroków pipeline'u.
- Poprawka jeszcze bez commita/pusha. Ponowienie starego run użyłoby starego
  commita tagu i nie zawierałoby naprawy. Następny krok: po poleceniu użytkownika
  commit/push i ręczny build próbny master; nie przesuwać istniejącego tagu.

- Użytkownik potwierdził commit/push poprawki i próbny build master. Zmiana
  określa politykę skryptu niewykorzystywanego narzędzia Squirrel; nie zmienia
  aplikacji, formatu paczek ani runtime dependencies. Klasyfikacja: narzędzia CI,
  bez nowej wersji produktu, changeloga i tagu. Nie przesuwamy v0.3.1-beta.

### Próbny build master — 43135a0

- Run 41485465703: instalacja przechodzi na trzech systemach; macOS i Linux
  zakończone sukcesem (pakowanie, smoke eksportu JPG offline, upload artefaktów).
- Windows: dwa testy preset-files-failure nie wstrzykiwały błędu, ponieważ
  endsWith('/nazwa.json') nie pasuje do separatora Windows. Zastąpiono je
  basename(destination), bez zmiany kodu aplikacji. Trzy testy pliku lokalnie PASS.
- Kontynuacja autoryzowanej naprawy CI: test-only commit/push i kolejny próbny
  workflow, bez podbijania wersji i bez przesuwania istniejącego tagu.

### Potwierdzony wynik próbnego workflow

- Run 41485878143, commit 58ad0f5, workflow_dispatch na master: SUCCESS.
- Każdy z trzech celów przeszedł instalację, testy jednostkowe, build, weryfikację
  zasobów, pakowanie, uruchomienie gotowej aplikacji i eksport JPG offline.
- Artefakty desktop-mac-arm64, desktop-windows-x64 i desktop-linux-x64 dostępne
  w Actions przez 7 dni. To próbne paczki wersji 0.3.1-beta z commita 58ad0f5,
  nie build historycznego tagu v0.3.1-beta (4a61f9d).
- Nie utworzono szkicu release: ręczne uruchomienie celowo pomija zadanie release.
  Dalsza dystrybucja wymaga nowego zgodnego tagu po ustaleniu wersji; istniejącego
  v0.3.1-beta nie przesunięto. Manualna instalacja, ZIP i restart presetów na
  Windows/Linux oraz drugi Mac nadal do odbioru.

### Przygotowanie szkicu do odbioru — 0.3.2-beta

- Użytkownik oczekuje gotowego szkicu do sprawdzenia po uzgodnieniu automatycznego
  procesu. Przygotowujemy nowy commit/tag 0.3.2-beta z poprawkami z master i
  uruchamiamy tagowany build, bez publicznego publikowania wydania.
- Poprzedni tag v0.3.1-beta pozostaje niezmieniony; ręczny build 58ad0f5
  potwierdził trzy paczki i smoke eksportu. Nowy tag identyfikuje dokładnie
  nową wersję manifestów, buildów i instalatorów.
- Jedyny przyrost PATCH dla przygotowania poprawionego wydania po pierwszym
  nieudanym tagowanym buildzie; format presetów pozostaje v1.

- Tagowany run 41487711759: wszystkie trzy buildy i smoke PASS, uploady PASS.
  Krok release wykrył nazwę AppImage linux-x86_64 zamiast oczekiwanego linux-x64.
  Poprawiono wyłącznie kontrolę nazwy w narzędziu publikacji, bez zmiany paczek.
  Szkic przygotowujemy tym samym skryptem z dokładnych artefaktów runu; master
  zachowuje poprawkę dla przyszłych wydań. Tag v0.3.2-beta nie jest przesuwany.

### Szkic gotowy do oceny użytkownika

- Recovery workflow 41489122899: SUCCESS. Szkic release 431742014,
  tag v0.3.2-beta, draft=true, prerelease=true.
- Dołączone DMG mac-arm64, EXE win-x64, AppImage linux-x86_64 i SHA256SUMS.
  Wszystkie trzy sumy zgodne z digestami assetów GitHuba; uploady zakończone.
- Recovery sprawdza tag/commit oryginalnego runu i sukces validate oraz trzech
  buildów, a następnie pobiera jego artefakty bez ponownego budowania. Używa
  jawnego RELEASE_TAG zamiast zarezerwowanego GITHUB_REF_NAME.
- Poprawki narzędzi publikacji nie zmieniają aplikacji ani istniejącego tagu;
  są na master dla następnych wydań. Zdalne odzyskanie zastąpiło wolne lokalne
  pobieranie, które zatrzymano. Publikacji publicznej NIE wykonano.

### Automatyczna publikacja — zmiana decyzji 2026-11-02

- Użytkownik zlecił pominięcie ręcznego zatwierdzania szkiców. Dla kolejnych tagów
  główny workflow publikuje wydanie po sukcesie trzech buildów/testów i weryfikacji
  wszystkich assetów. Ten zapis zastępuje wcześniejszy wymóg ręcznej publikacji.
- Szkic pozostaje stanem przejściowym na czas uploadu. Błąd uploadu lub niezgodne
  nazwy, liczba plików, rozmiary czy SHA-256 blokują publikację. Beta to prerelease.
- Ręczne próbne buildy nie publikują. Recovery pozostaje domyślnie draft-only.
  Istniejącego wydania 0.3.2-beta ani jego tagu nie zmieniamy.
- Dodano link do wydania/szkicu w podsumowaniu Actions. Brak zmian aplikacji
  i presetów; konfiguracja publikacji do sprawdzenia przed commitem/pushem.
- Weryfikacja lokalna: 421/421 testów jednostkowych (w tym 6 przypadków publikacji:
  sukces, brak flagi, błąd uploadu, błędny digest, brak pliku i istniejące publiczne
  wydanie), lint zmienionych skryptów/testów, typecheck i formatowanie PASS.
- To zmiana orkiestracji CI, bez zmiany instalatorów lub działania aplikacji;
  nie przygotowano nowej wersji ani tagu produktu. Commit/push jeszcze niewykonane.
  Rzeczywistej publicznej publikacji nie uruchamiano w ramach lokalnej weryfikacji.

### Widoczność wydania na stronie głównej — decyzja 2026-11-02

- Użytkownik chce widzieć wydanie w panelu Releases na stronie głównej.
  Na jego polecenie obecne 0.3.2-beta ma prerelease=false i Latest; nazwa beta,
  tag i instalatory pozostają bez zmian. Jest to świadomy wyjątek od wcześniejszej
  reguły oznaczania beta jako GitHub Pre-release.
- Lokalna konfiguracja kolejnych automatycznych publikacji ma jawnie ustawiać
  prerelease=false i Latest. Zastępuje to wcześniejszą decyzję o etykiecie.

- Użytkownik polecił skonfigurować docelowy proces: automatyczny release Latest
  po nowym zgodnym tagu na master, z zachowaniem starszych wydań i instalatorów.
  Polecenie obejmuje wdrożenie konfiguracji na GitHubie. Skrypt nie usuwa historii
  wydań; ponowne użycie opublikowanego tagu kończy się odmową modyfikacji.
- Końcowe 6 testów publikacji PASS, lint PASS. Wcześniej pełny zestaw 421/421,
  typy i formatowanie PASS. Nie uruchamiamy nowego tagu tylko dla zmiany CI.
  Brak zmiany aplikacji lub formatu paczek — bez podbijania wersji produktu.
