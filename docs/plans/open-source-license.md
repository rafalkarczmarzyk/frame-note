# Licencjonowanie FrameNote — GPL-3.0-or-later

## Stan i zakres

- Data: 2026-11-03. Stan: wdrożenie zaakceptowane przez użytkownika;
  ograniczenia weryfikacji zapisano poniżej.
- Po raporcie audytu i propozycji rozdzielenia kodu od zdjęć użytkownik polecił
  „rob”, akceptując przejście do etapu 2 z osobnymi warunkami zdjęć.
- Cel: jednoznacznie udostępnić własny kod FrameNote na GPL-3.0-or-later,
  zachowując licencje cudzych składników i dostarczając wymagane informacje
  oraz źródła przy dystrybucji aplikacji.
- Kierunek GPLv3 wynika z rozmowy użytkownika; wariant „or later” jest
  rekomendacją agenta przyjętą jako podstawa niniejszej propozycji planu.
- Zakres: repozytorium, manifesty, dokumentacja, About, web build, oba tory
  pakowania desktopu oraz przygotowanie GitHub Releases.
- Modele i presety v1, dane użytkownika, geometria i eksport JPG: bez zmian.
  Zdjęcia użytkowników i wyniki eksportu nie zostają objęte GPL aplikacji.
- Wyłączenia: rebase, force push, przesuwanie tagów, zmiana dawnych buildów,
  automatyczne nadanie GPL cudzym materiałom, redesign logo, CLA i dodatkowe
  zasady marki. Zgody na commit i lokalne wydanie zapisano poniżej;
  brak polecenia pushowania lub publikacji.
- Branch implementacji: `codex/open-source-license`. Zachowano niezależne
  zmiany dokumentacji i README wykonane równolegle. Pierwszy commit: 3f3c905.

## Stan rozpoznany

- Brak głównego LICENSE oraz pól license w manifestach workspace.
- AboutSplash ma już wersję, build, copyright FrameNote i odnośnik do GitHuba.
- `scripts/package-desktop.mjs` kopiuje wybraną listę plików do lokalnej paczki.
- `scripts/dist-desktop.mjs` osobno tworzy manifest i listę plików dla CI;
  żadna z tych list nie obejmuje jeszcze licencji produktu ani notices.
- `scripts/publish-desktop-draft.mjs` dopuszcza dokładnie trzy binaria;
  nowe archiwum źródeł wymaga dostosowania walidacji, sum i przesyłania.
- Fonty Google mają OFL obok plików; istnieje też
  `public/fonts/montserrat/OFL.txt`. Obecny audyt fontów nie zastępuje audytu
  wszystkich składników dostarczanych w aplikacji.
- Dokumentacja NTH-007 wskazuje pochodzenie logotypu z usuniętego fontu.
  Sam brak pliku fontu nie rozstrzyga praw do geometrii SVG.
- Zdjęcia, przykładowe logo, `canon.svg`, tekstury, ikony i fixture'y wymagają
  sprawdzenia pochodzenia; pochodzenie od użytkownika nie oznacza samo w sobie
  zgody na dalszą dystrybucję na GPL.

## Wersja i zgodność

- Wersja przy integracji: 0.3.4-beta; baza zadania 0.3.3-beta.
- Sam plan i audyt: bez podbicia wersji i wpisu wydania.
- Prognoza całego wdrożenia: 0.3.4-beta, jeśli baza pozostanie aktualna.
  Uzasadnienie według maintain-versioning: uzupełnienie informacji prawnych
  i zawartości paczek, bez nowej funkcji edytora lub zmiany formatu danych.
- Wersja jest aktualizowana dopiero przy autoryzowanym wprowadzeniu ukończonego
  zadania do master; wszystkie manifesty zachowują wspólną wersję.
- Nie deklarować automatycznie licencji dla historycznych wersji. Osobne
  oświadczenie o wcześniejszych wersjach wymaga określenia zakresu i praw.

## Etapy

### 1. Audyt praw i składników — do osobnej akceptacji

1. Sprawdzić autorów i wkłady w całej historii, zapożyczony kod, zależności
   runtime i składniki rzeczywiście dołączane przez bundler oraz Electron.
   Uwzględnić ich teksty licencji, notices i wymagania dotyczące źródeł.
2. Zinwentaryzować zasoby repozytorium, w tym zdjęcia testowe, dokumentację,
   grafiki, fonty i materiały generowane. Oddzielić kod własny od materiałów
   na innych licencjach; zapisać ścieżki, pochodzenie i podstawę dystrybucji.
3. Potwierdzić zapis właściciela praw i lat copyright na podstawie autorstwa;
   kandydat z historii Git: Rafał Karczmarzyk. Nie przypisywać mu cudzych praw.
4. Przedstawić raport: zgodne / wymagane notices / nierozstrzygnięte.
   Kwestie wymagające informacji od autora zebrać w jednej krótkiej liście.
   Materiału o niejasnych prawach nie oznaczać jako GPL ani zgodnego.
5. Określić kompletny zakres Corresponding Source dla wydawanych binariów,
   w tym wymagane źródła bibliotek, konfigurację i skrypty budowania.
   Sam lockfile i automatyczne archiwum GitHuba nie są dowodem kompletności.

Etap kończy raport i ocena użytkownika. Jeśli audyt wykaże potrzebę wymiany
materiału, uzgodnić konkretną zmianę przed jej realizacją; nie rozszerzać
automatycznie zadania o odłożony redesign logotypu.

### 2. Wdrożenie i weryfikacja — po akceptacji etapu 1

1. Dodać niezmieniony tekst GPLv3 jako `LICENSE`; wariant „or later” określić
   w deklaracjach projektu i nagłówkach własnego kodu (SPDX).
   Nie zmieniać nagłówków ani licencji cudzych plików. Dla plików bez komentarzy
   zastosować centralną mapę licencji zamiast psucia ich formatu.
2. Ustawić `license: GPL-3.0-or-later` w manifestach workspace i generowanym
   manifeście dystrybucyjnym. `private: true` może pozostać: dotyczy npm,
   a nie dostępności kodu na GitHubie.
3. Dodać README: licencja, autorstwo, prawa do wyników eksportu, wyjątki
   zasobów, link do pełnych notices i źródeł. Udokumentować budowanie wydania.
4. Przygotować zestaw notices i tekstów licencji rzeczywiście dostarczanych
   składników, obejmujący fonty oraz Electron/Chromium; zachować ich oryginalne
   informacje. Zapewnić aktualizację zestawu przy zmianie zależności.
5. Wspólne About web/desktop rozszerzyć o krótką informację o GPL i braku
   gwarancji, dostęp do pełnej licencji i third-party notices oraz źródeł
   odpowiadających buildowi. Teksty prawne dostępne lokalnie również offline.
   Użyć istniejących komponentów i stories; bez przeprojektowania ekranu.
6. Dołączyć LICENSE i notices do builda web oraz obu ścieżek pakowania desktopu.
   Sprawdzić zawartość finalnego archiwum/paczki, nie tylko katalogu staging.
7. Przygotować archiwum odpowiadających źródeł według wyniku audytu etapu 1.
   Powiązać je z wersją i commitem, opisać sposób odtworzenia builda i licencje.
   GitHub Release ma oferować wyraźny dostęp do tych źródeł obok binariów.
   Rozszerzyć walidację assetów, sumy kontrolne oraz scenariusze recovery/retry;
   zachować blokadę modyfikowania już opublikowanych wydań.
8. Dodać celowane kontrole zgodności metadanych i obecności notices/źródeł.
   Brak wymaganych materiałów ma blokować przygotowanie wydania.
9. Uzupełnić angielski Unreleased w changelogu; sprawdzić diff i oddać do oceny.

## Kryteria akceptacji

| AC    | Obserwowalne zachowanie                                                                                                | Weryfikacja                                                               | Wynik       | Akceptacja |
| ----- | ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- | ----------- | ---------- |
| AC-01 | Własność i licencje kodu oraz zasobów są opisane; nierozstrzygnięte materiały mają jawny status                        | Raport audytu i ocena autora, etap 1                                      | niewykonane | oczekuje   |
| AC-02 | LICENSE, README, deklaracje własnego kodu i wszystkie manifesty zgodnie wskazują GPL-3.0-or-later, z jawnymi wyjątkami | Przegląd diff i kontrola metadanych                                       | niewykonane | oczekuje   |
| AC-03 | About w web i desktop pokazuje informację prawną; pełne teksty są dostępne offline i obsługiwalne klawiaturą           | Storybook, test interakcji, ręczna ocena obu platform                     | niewykonane | oczekuje   |
| AC-04 | Web build oraz paczki lokalne/CI zawierają komplet wymaganych licencji i notices zgodnych z audytem                    | Kontrola zawartości buildów i paczek na docelowych systemach              | niewykonane | oczekuje   |
| AC-05 | Każde nowe wydanie oferuje odpowiadające źródła, identyfikację builda i instrukcję budowania                           | Próba odtworzenia ze źródeł; kontrola assetów i SHA256SUMS bez publikacji | niewykonane | oczekuje   |
| AC-06 | Brak wymaganej licencji, notices lub źródeł blokuje wydanie; recovery uwzględnia nowe assety                           | Celowane testy pozytywne i negatywne przygotowania wydania                | niewykonane | oczekuje   |
| AC-07 | UI pozostaje czytelne, a presety i eksport nie zmieniają zachowania                                                    | Kontrole projektu, regresja wizualna i ocena użytkownika                  | niewykonane | oczekuje   |

## Weryfikacja i wydanie

### Wynik wdrożenia — 2026-11-03

- Użytkownik „jest git. commit i rob release (merge ito)” zaakceptował wynik
  i autoryzował commit, squash merge do master, wspólną wersję 0.3.4-beta,
  datowany changelog i lokalny tag. Akceptacja obejmuje kolejne korekty About,
  linków, canvasu oraz narzędzi desktopowych. Nie oznacza zniesienia zapisanych
  ograniczeń audytu lub testów ani zgody na push/publikację GitHub Release.
- Wydanie lokalne: 0.3.4-beta (PATCH z 0.3.3-beta); presety i dane bez migracji.
  Przygotowano squash do master, wspólną wersję pięciu manifestów i sekcję
  changeloga 2026-11-03; po commicie lokalny tag v0.3.4-beta.
  Końcowa regresja: 442/442 testy unit, lint i tokeny przeszły.
  Bieżące decyzje i wyniki powyżej zastępują historyczne statusy „oczekuje”
  przy wcześniejszych iteracjach. Nierozstrzygnięte prawa i pełny zakres źródeł
  native pozostają jawne; wydania publicznego w tej turze nie przygotowujemy.

- Dalsza korekta użytkownika: Licenses otrzymuje dekoracyjną ikonę ScrollText
  12 px, tak jak pozostałe linki About. Stopka pustego canvasu pokazuje wyłącznie
  FrameNote · v<wersja>; GitHub i Changelog pozostają w About. AC: brak linków
  w pustym canvasie, wersja widoczna, komplet trzech ikon w About i działające
  przejście do czytnika. Wspólne web/desktop, dane i prognoza wersji bez zmian.
  Chromium/WebKit: po pełnym załadowaniu pustego canvasu potwierdzono stopkę
  bez linków, widoczną wersję, trzy dekoracyjne ikony 12 px w About i działający
  czytnik. Obejrzano aktualne zrzuty. Typecheck, lint zmienianych plików, tokeny
  i build web przeszły. Sześć scen visual (About/empty editor, wszystkie profile)
  nadal bez wzorców; nie aktualizowano ich. Ocena oczekuje, bez commita.

- Drobna korekta linków About: GitHub z oficjalnym znakiem Primer Octicons
  (MIT, notices dołączone do buildów), Changelog z Lucide History. Ikony 12 px
  przed etykietą zastępują powtarzane strzałki; tekst i dostępne nazwy zachowane.
  Wspólne web/desktop, bez zmian linków pustego canvasu. AC: czytelne linki,
  dekoracyjne ikony i działający czytnik. Prognoza wersji bez zmian.
  Typecheck, lint, tokeny, 7 testów legal-materials, build web i Storybook
  przeszły. Zweryfikowano notices Octicons w buildzie web; obejrzano linki
  (ikony 12 px) i stories Default/Accent (oba 24 × 24 px, różnią się kolorem).
  Visual About we wszystkich trzech profilach nadal bez wzorców; bez aktualizacji.
  Ocena użytkownika oczekuje, bez commita.

- Korekta czytnika na polecenie użytkownika: Licenses podmienia treść wewnątrz
  tej samej geometrii modala; jedno zdjęcie pozostaje pod spodem. Lewy panel
  About rozmywa zdjęcie przez backdrop-filter, a czytnik rozmywa je na całym
  obszarze. Aplikacja za oknem nadal bez blura i przyciemnienia. AC: identyczne
  położenie i wymiary przed/po przełączeniu, czytelne teksty, powrót fokusu,
  działające błędy i notices native. Bez zmian danych/presetów; prognoza PATCH
  0.3.4-beta bez zmian.
  Weryfikacja: 6/6 E2E Chromium/WebKit z kontrolą identycznych bounds przeszło;
  dodatkowo oba silniki w 1440 × 900, 1100 × 700 i 390 × 568 zachowały wymiary
  i fokus. Desktop offline przeszedł z --chrome-only --skip-native-transitions;
  przejścia native pominięte. Typecheck, lint zmienianych plików, tokeny, format,
  build web/desktop/Storybook przeszły. Obejrzano About i czytnik, w tym mobile.
  Sześć scen visual we wszystkich profilach bez wzorców; nie aktualizowano ich.
  Ocena użytkownika oczekuje, bez commita.

- Najnowsza korekta: użytkownik odrzucił również przyciemnienie aplikacji za
  About. Backdrop jest transparentny, bez filtra, również przy ograniczonej
  przezroczystości. Dotyczy About i czytnika na web/desktop; panel informacji
  wewnątrz modala pozostaje bez zmian. AC: niezmieniony wygląd aplikacji za
  oknem, działające zamykanie i czytnik. Bez wpływu na dane ani prognozę wersji.
  Chromium/WebKit: potwierdzono transparentny backdrop bez filtra, odczyt
  licencji i zamykanie; obejrzano aktualny zrzut. Build web, format i tokeny
  przeszły. Visual we wszystkich 3 profilach bez wzorców (bez aktualizacji).
  Ocena użytkownika oczekuje.

- Kolejna korekta użytkownika: usunąć blur aplikacji za oknem About.
  AC: backdrop nadal przyciemnia aplikację, ale jego backdrop-filter wynosi
  none na web i desktop, również w czytniku licencji. Zmiana dotyczy tylko
  selektora About; dane, presety i prognoza wersji pozostają bez zmian.
  Potwierdzono backdrop-filter: none w Chromium i WebKit dla About oraz
  czytnika licencji; obejrzano aktualny zrzut. Build web, format i kontrola
  tokenów przeszły. Kontrole wizualne domyślna i wszystkich profili uruchomione,
  nadal bez wzorców; nie aktualizowano baseline. Ocena użytkownika oczekuje.

- Korekta po ocenie użytkownika po commicie 3f3c905: jeden ciągły obraz pod
  całym modalem, bez osobnego rozmytego zdjęcia po lewej. Przyciemnienie jest
  nakładką pod tekstem. Kadr przesunięty i powiększony, by prawy pionowy słupek
  znalazł się poza oknem, a ptaszek pozostał widoczny. AC poprawki: jedno zdjęcie,
  brak prawego słupka, czytelne informacje i działające linki na web/desktop.
  Bez zmian danych/presetów; prognoza integracji nadal PATCH 0.3.4-beta.
  6/6 E2E Chromium/WebKit (otwieranie, fokus, linki i czytnik) przeszło.
  Typecheck, lint, kontrola tokenów, build web i desktop przeszły. Obejrzano
  nowy kadr w 1440 × 900, 1100 × 700 i 390 × 568. Kontrole wizualne About
  w domyślnym i wszystkich profilach nadal bez wzorców; nie tworzono baseline.
  Ocena użytkownika oczekuje; bez nowej zgody na commit.

- Użytkownik polecił „implementuj na web i desktop, posprzataj storybook” po
  ocenie wariantu Photographic. Zaakceptowany układ przeniesiono do wspólnego
  AboutSplash: panel informacji po lewej, ostry kadr po prawej, zwykłe linki
  projektu i Licenses. Zachowano build identity, źródła konkretnego builda,
  lokalne pełne notices, błędy odczytu oraz native notices Electron/Chromium.
  Usunięto about-proposal.stories.tsx i odrzucone warianty; Storybook pokazuje
  wyłącznie rzeczywisty About i czytnik licencji. Przycisk web About i natywne
  menu desktopu prowadzą do tego samego komponentu. Bez automatycznego startupu,
  którego reguł użytkownik nadal nie zatwierdził. Bez commita, wydania i pushowania.
- Weryfikacja wdrożonego układu: 442 testy jednostkowe; 8/8 celowanych E2E
  Chromium/WebKit, obejmujących About, linki, czytnik, fokus i tooltip Close;
  typecheck, lint, tokeny, build web, desktop i Storybook przeszły.
  Zbudowany Storybook zawiera dokładnie About i LicenseReader (plus stronę docs),
  bez AboutProposal. Obejrzano docelowy widok; sprawdzono rozmiary 1440 × 900,
  1100 × 700 i 390 × 568, przewijanie i dostęp do linków.
- Desktop offline: nowy czytnik oraz dotychczasowy import, JPG, ZIP, presety
  i izolacja przeszły z `--skip-native-transitions`. Przejścia native pominięte
  ze względu na wcześniej odnotowany timeout fullscreen.
- Visual: wykonano 2 sceny About/czytnika i 6 we wszystkich profilach; brak
  wzorców, bez ich tworzenia lub aktualizacji. Szerszy test tooltipów zgłosił
  dwa istniejące timeouty wyboru usuniętego fontu RetiredDisplay; nie zmieniano
  tego niezależnego scenariusza. Test tooltipa w nowym About przeszedł.
- Ocena implementacji przez użytkownika oczekuje. Do sprawdzenia: webowy About
  obok logo i FrameNote → About FrameNote na desktopie, ostrość zdjęcia/krawędź
  panelu, link Licenses i powrót do About. Wersja robocza 0.3.3-beta / HEAD 988db09
  plus niezacommitowane zmiany; prognoza przy integracji nadal 0.3.4-beta.

- Zatwierdzona zmiana webu: tekstowy przycisk About obok logo w nagłówku.
  Otwiera istniejący AboutSplash przez ten sam stan co logo. Desktop nadal
  korzysta z menu aplikacji. Nowego projektu modala ani startowego popupu
  to polecenie nie wdraża. AC: przycisk widoczny obok logo tylko na webie,
  otwiera dialog i pozwala go zamknąć; sprawdzenie E2E oraz story AppHeader/About.
- Wynik przycisku web About: 6/6 E2E Chromium/WebKit przeszło, typecheck, lint
  i kontrola tokenów przeszły. Story nagłówka macOS nie ma dodatkowego przycisku.
  Kontrole wizualne nagłówka: 2 sceny domyślne i 6 we wszystkich profilach
  uruchomione; wszystkie zatrzymane przez brak wzorców, bez ich aktualizacji.

- Ocena wariantu Photographic: użytkownik pozytywnie ocenił wygląd, zgłosił
  rozmycie zdjęcia i artefakty przy lewej krawędzi. Prawy obraz rysowany jest
  bez transformacji scale (większy obszar obrazu przy tym samym kadrze),
  a lewy blur dotyczy własnej warstwy obrazu przyciętej wewnątrz panelu,
  zamiast backdrop-filter na całym panelu. To nadal korekta prototypu.
- Użytkownik rozważa pokazywanie okna przy uruchomieniu desktopu i pyta o web.
  Nie zatwierdzono zachowania startowego ani persystencji. Rekomendacja agenta:
  desktop przy pierwszym uruchomieniu i opcjonalne Show on startup dla kolejnych;
  web na razie ręcznie przez About. To propozycja do uzgodnienia, bez implementacji.

- Dodatkowa propozycja About na podstawie referencji użytkownika: story
  Photographic obok prostego Proposal. Lewa połowa przyciemniona i rozmyta,
  z logotypem, wersją, dużym sloganem i informacjami; prawa połowa pokazuje
  wyraźne zdjęcie ptaszka. Używa obecnego fontu i istniejących zasobów.
  Bez akcji importu zdjęcia z referencji, ponieważ nadal jest to okno About.
  Prosty wariant pozostaje dostępny; żaden nie został wdrożony do aplikacji.

- Obowiązujący kierunek propozycji About: użytkownik odrzucił układ fotograficzny
  i trzy kolumny. Powstaje prosty modal bez zdjęcia, z ikoną, nazwą i wersją,
  krótkim opisem oraz informacją o lokalnym przetwarzaniu. W stopce copyright,
  licencja i zwykłe linki projektu. Usunięto story i parametr Compact.
  Nadal tylko Storybook do akceptacji; produkcyjny About bez zmian.

- Najnowsza propozycja na polecenie użytkownika: trzy kolumny na zdjęciu —
  ikona i wersja po lewej, pusty środek dla ptaszka, slogan/opis/prywatność
  po prawej. Na samym dole wyśrodkowane linki GitHub, Changelog i Licenses,
  nad nimi krótka informacja prawna. Licenses nadal otwiera lokalny czytnik.
  Poprzedni wariant pionowy zastąpiono tylko w Storybooku, bez wdrożenia do aplikacji.

- Korekta kadru propozycji: użytkownik chce widocznego ptaszka, większego zdjęcia,
  ikony i wersji u góry oraz krótkiej sekcji informacji i stopki pod zdjęciem.
  Powiększono nagłówek fotograficzny, wyrównano nakładkę do góry, ustawiono kadr
  od górnej krawędzi i zmniejszono odstępy/padding dolnych sekcji.
  Nadal wyłącznie Storybook; aplikacja czeka na akceptację propozycji.

- Kolejna decyzja użytkownika: przywrócić informację o prywatności w nowym
  układzie propozycji. „Photos stay on your device.” z ikoną kłódki znajduje się
  w dolnej sekcji pod opisem aplikacji, przed odnośnikami projektu.

- Aktualizacja propozycji About po doprecyzowaniu użytkownika: pierwsza sekcja
  to zdjęcie w tle, duża ikona aplikacji (zamiast logotypu) i wersja pod ikoną.
  Pod nią duża sekcja z jednolitym tłem, opisem i tekstowymi odnośnikami
  GitHub/Changelog w stylu stopki pustego canvasu. Usunięto osobny wiersz
  informacji o prywatności. Stopka prawna i czytnik pozostają dostępne.
  To nadal tylko propozycja Storybooka; nie jest akceptacją wdrożenia do aplikacji.

- Ocena użytkownika: obecny About ma wadliwy, przeładowany układ. Polecenie:
  przygotować propozycję w Storybooku z dużym logo, aktualną wersją, linkami
  GitHub/Changelog i niższą częścią fotograficzną. Autoryzowano tylko prototyp,
  bez zastępowania produkcyjnego About przed akceptacją.
- Propozycja: Screens/AboutProposal — Proposal, Compact, LicenseReader;
  logo i wersja w osobnej górnej sekcji, zgrupowane linki, zdjęcie 160–176 px,
  oddzielna stopka prawna. Używa istniejących Button, IconButton i FrameNoteLogo.
  AC: czytelna wersja, brak osieroconego linku Changelog, responsywność,
  neutralny fokus po otwarciu oraz możliwość zamknięcia i podejrzenia licencji.
  To makieta do oceny; produkcyjny About pozostaje bez zmian.
- Korekta propozycji po uwadze o ramce: jedna ciągła linia border-panel-border,
  bez focus outline na statycznym kontenerze i bez inset refleksu shadow-panel.
  Zmiana wyłącznie prototypu Storybooka, bez zmian globalnych styli.
- Weryfikacja propozycji: typecheck, lint, kontrola tokenów i build Storybooka
  przeszły. Obejrzano desktop i widok 390 × 844; brak poziomego overflow,
  neutralny fokus, zamykanie, powrót fokusu oraz czytnik licencji sprawdzone
  w działającym Storybooku. Akceptacja wyglądu oczekuje; nie zmieniano aplikacji.

- Dalsza poprawka lokalnego podglądu: po gotowości aplikacji macOS jawnie
  ustawia ikonę Docka z framenote-app-icon.png, wyłącznie dla !app.isPackaged.
  Paczki produkcyjne zachowują natywną ikonę i warianty Icon Composer.
  Sprawdzenie: rzeczywiste uruchomienie prywatnego runtime, odczyt grafiki
  przez nativeImage oraz widoczność Docka. Ponowne uruchomienie wymagane.

- Poprawka po ocenie użytkownika: lokalny macOS pokazywał Electron w pasku
  menu mimo app.setName. `pnpm desktop`, start workspace i test desktopowy
  używają teraz prywatnej, lokalnie podpisanej kopii runtime w release/dev
  z CFBundleName/CFBundleDisplayName FrameNote. Oryginalna zależność Electron
  pozostaje bez zmian; wersja runtime i ikona określają klucz cache.
  Web, modele i presety bez zmian. Prognoza zadania pozostaje PATCH.
- AC poprawki nazwy: NSRunningApplication.localizedName oraz etykieta menu
  muszą wynosić FrameNote. Kontrola rzeczywistego procesu macOS przeszła;
  odczyt licencji offline w tym runtime też przeszedł. Test nazwy zapisano
  w desktop-window-chrome.mjs. Bez instalacji, publikacji i commita.

- Poprawka po ocenie użytkownika: otwarcie About ustawia fokus na kontenerze
  dialogu zamiast na Close, tak jak neutralny fokus kontenera w panelu assetów.
  AC: brak aktywnego Close i tooltipa po otwarciu; Tab nadal wybiera Close,
  pokazuje tooltip, a zamknięcie przywraca fokus wyzwalaczowi. Weryfikacja E2E
  Chromium/WebKit oraz ponowna kontrola scen About.
- Wynik poprawki fokusu: 4/4 E2E Chromium/WebKit przeszły, typecheck i lint
  przeszły, web i desktop zbudowane. Test klawiatury uwzględnia Option+Tab
  dla przycisków w Safari. Kontrole wizualne sceny About (domyślna i wszystkie
  3 profile) nadal bez wzorców; nie aktualizowano baseline'ów.

- AC-01: audyt przyjęty poleceniem „rob”; pozostają jawne wyjątki zasobów.
- AC-02: wdrożone LICENSE, LICENSING.md, osobne PHOTOGRAPHS.txt, deklaracje
  wszystkich pięciu manifestów, wygenerowanego manifestu oraz SPDX w zmienianym
  własnym kodzie. Centralna deklaracja obejmuje też pozostałe własne pliki bez
  masowego przepisywania istniejącego kodu.
- AC-03: wdrożony wspólny czytnik w About, wraz z fokusem, stanem błędu i
  lokalnymi notices native. E2E Chromium/WebKit i odczyt desktop offline przeszły.
- AC-04: oba tory pakowania uzupełnione; sprawdzono tymczasowe zasoby rozpakowane
  i ASAR, zachowanie pełnych tekstów oraz odrzucenie uszkodzonej licencji.
  Nie budowano finalnych instalatorów ani nie testowano Windows/Linux.
- AC-05: wdrożony generator źródeł i osobny job CI; pobrano i sprawdzono źródła
  93 składników desktopu (44 archiwa upstream plus oryginalne pakiety npm).
  Dwa niedostępne gitHead zastąpiono przypiętymi źródłami z kontrolą zgodności
  transpilacji wszystkich modułów. Pełnego archiwum projektu dla nowego tagu
  nie tworzono: zadanie pozostaje bez commita i tagu. Nie wykonywano pełnego
  odtworzenia finalnego instalatora ze źródeł ani audytu źródeł native runtime.
- AC-06: testy brakujących licencji, źródeł, niedopasowanej provenance i
  niezgodnej transpilacji; publikator odrzuca brak archiwum źródeł przed
  komunikacją z GitHubem. Recovery wymaga sukcesu joba source.
- AC-07: 442 testy jednostkowe, typecheck, lint, check:tokens, check:version,
  build web, desktop i Storybook przeszły. 96 plików fontów/licencji zgodnych.
  Test desktopowy z `--skip-native-transitions` przeszedł, w tym import offline,
  JPG, ZIP i presety. Pełny przebieg zatrzymał timeout przejścia macOS do fullscreen.
- `pnpm test:visual` i `pnpm test:visual --all-projects` uruchomiono; odpowiednio
  9 i 27 scen bez wzorców. Obejrzano About i czytnik na aktualnych zrzutach,
  nie utworzono baseline'ów. Brak expected uniemożliwia ocenę expected/actual/diff.
  Domyślny port był zajęty; użyto `FRAMENOTE_VISUAL_PORT=4194`.
- Format zmienianych plików sprawdzony osobno. Globalny format:check zgłasza
  istniejące problemy w docs/EXPORT_VISUAL_TEST_PLAN.md i e2e/photo-export-matrix.spec.ts;
  nie zmieniano ich w tym zadaniu.
- Oceniany kod: 0.3.3-beta, baza HEAD `988db09` plus niezacommitowane zmiany.
  Prognoza przy integracji nadal 0.3.4-beta, pod warunkiem niezmienionej bazy wersji.
- Akceptacja implementacji użytkownika: oczekuje. Do sprawdzenia About → Licenses,
  przewijanie tekstów, powrót do About i warunki fotografii w LICENSING.md.

### Rozpoznanie i plan kontroli

- Raport etapu 1: [audyt licencji](../audits/open-source-license.md),
  [inwentarz z SHA-256](../audits/open-source-license-inventory.json).
- W etapie 1 rozpoznano 134 pakiety i 146 zasobów; zapisano niewiadome.
  Audyt przyjęto z jawnymi wyjątkami; nieustalone prawa do grafik pozostają
  niepotwierdzone także po akceptacji kierunku wdrożenia.
- Decyzja z rozmowy: zdjęcia należą do użytkownika, ale brak zgody na ich
  swobodną sprzedaż przez innych. Nie obejmować ich automatycznie GPL.
- Jawny wyjątek użytkownika: pominąć dalszą weryfikację logotypu FrameNote
  i canon.svg; pozostawić bez zmian i bez deklarowania zweryfikowanych praw.
- W etapie 1 brakowało lokalnych binariów Electron. W etapie 2 pobrano je
  i sprawdzono pliki notices oraz ich zachowanie w zasobach aplikacji.
  Raport nie stwierdza kompletnej zgodności dystrybucji native runtime.

- Na etapie planowania: wyłącznie format dokumentu i przegląd diff.
- Implementacja: format, lint, typecheck, check:version, celowane testy
  licencji/packagingu/release oraz build web i desktop.
- UI: `pnpm test:visual` i `pnpm test:visual --all-projects` dla wspólnego About;
  obejrzeć expected/actual/diff; nie aktualizować wzorców bez akceptacji scen.
- Desktop: `pnpm test:desktop` od pierwszej próby z wymaganym dostępem macOS;
  testy desktopowe i przeglądarkowe kolejno.
- Budowanie paczek i próby na macOS/Windows/Linux wymagają odpowiednich
  środowisk i autoryzacji pakowania; brak dostępu oznaczyć jako niewykonane.
  Kod CI przygotować bez uruchamiania publikacji.
- Kontrola ręczna: About i teksty offline, link do konkretnych źródeł,
  zawartość paczki i czytelne informacje na projektowej stronie wydania.
- 2026-11-03 użytkownik polecił „commit”: autoryzowany zapis wszystkich zmian
  zadania na `codex/open-source-license`. Bez merge'a, podbicia wersji, tagu,
  pushowania i publikacji. Wersja pozostaje 0.3.3-beta, a wpisy w Unreleased.
  Znane ograniczenia weryfikacji pozostają zapisane powyżej.

## Źródła zasad licencjonowania

- [GNU: stosowanie licencji](https://www.gnu.org/licenses/gpl-howto.en.html).
- [GNU FAQ: odpowiadające źródła i dystrybucja](https://www.gnu.org/licenses/gpl-faq.en.html#DistributeWithSourceOnInternet).
- Projektowe skille: change-workflow oraz maintain-versioning.
