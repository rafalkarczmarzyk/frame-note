# FrameNote — kontekst produktu, pre-MVP i MVP

Stan dokumentu: 25 października 2026. Pre-MVP zostało zaakceptowane przez
użytkownika i zapisane w commicie `9a627af` na branchu `master`.

Ten dokument przekazuje kontekst kolejnym agentom. Opisuje wykonane prace,
ustalone założenia i kierunek rozwoju. Propozycje MVP poniżej nie oznaczają
zgody na ich automatyczne wdrożenie.

## 1. Problem i cel

FrameNote służy do tworzenia podpisów na zdjęciach na podstawie ich metadanych.
Użytkownik eksportuje JPG z Lightroom Classic, przeciąga go do aplikacji,
ustawia podpis na podglądzie i pobiera gotowy JPG z tekstem utrwalonym w pikselach.
Nie chodzi wyłącznie o zapis tagów EXIF w pliku.

Punktem wyjścia był plugin LR/Mogrify. Najważniejsze problemy użytkownika:

- Ograniczona lista pól do podpisu, szczególnie brak dostępu do EXIF UserComment.
- Brak podglądu zmian na żywo.
- Ograniczone stylowanie i całkowite wartości procentowe rozmiaru fontu.
- Rozmiar w pikselach daje niespójną wielkość podpisu na zdjęciach po różnym cropie.
- Potrzeba własnych presetów, np. macro, stack macro i wildlife.

Rozwiązanie ma zapewniać szeroki dostęp do metadanych i wygodniejsze stylowanie.
Nie obiecujemy odczytu dosłownie wszystkich możliwych tagów: obsługa zależy od
parsera i tego, jakie metadane Lightroom zachował podczas eksportu.

## 2. Ustalenia wspólne

- Najpierw aplikacja przeglądarkowa. React + Vite + TypeScript + Tailwind CSS.
- Przetwarzanie zdjęć lokalnie w przeglądarce. Backend i konto nie są potrzebne
  do obecnego przepływu.
- Główna platforma użytkownika to macOS. W przyszłości możliwe opakowanie
  desktopowe, z możliwością budowania również na Windows i Linux.
  Nie wybrano obowiązkowo Electron ani Tauri; Rust nie jest obecnie wymagany.
- Interfejs aplikacji po angielsku; rozmowa i dokumentacja mogą być po polsku.
- Font i marginesy używają globalnej jednostki: px, % krótszego lub % dłuższego
  boku zdjęcia. Domyślnie % krótszego boku, niezależnie od skali podglądu.
- Podgląd i eksport mają korzystać z tej samej geometrii i zasad renderowania.
- Preferujemy reużywalne komponenty UI i ich dokumentację w Storybooku.

## 3. Pre-MVP — cel i ukończony zakres

Celem było wykonanie całego przepływu na jednym zdjęciu, z jednym podpisem
edytowanym tekstowo przez tokeny `{group:name}`. Wielu kontenerów świadomie
nie wprowadzono do tego etapu.

### Etapy realizacji

Poniższe nazwy syntetycznie opisują wykonane etapy; szczegóły kodu opisuje README.

| Etap | Zakres                                                              | Status    |
| ---- | ------------------------------------------------------------------- | --------- |
| 1    | Bootstrap, narzędzia jakości i podstawowy interfejs                 | Ukończony |
| 2    | Model zdjęcia, podpisu i metadanych; fixture i utils                | Ukończony |
| 3    | Import JPG, metadane, podgląd zdjęcia                               | Ukończony |
| 4    | Szablon tokenów, renderowanie podpisu i podstawowy eksport          | Ukończony |
| 5    | Stylowanie, pozycjonowanie i wygodne wstawianie tagów               | Ukończony |
| 6    | Jakość JPG, dokładny rozmiar pliku i regresja eksportu              | Ukończony |
| 7    | Stabilizacja, limity importu, dodatkowa przeglądarka i dokumentacja | Ukończony |

W trakcie iteracji dodano także accordiony, pływający panel narzędzi,
wspólne kontrolki i Storybook.

### Dostępny przepływ

1. Wybór lub przeciągnięcie jednego JPG.
2. Odczyt metadanych przez ExifReader i podgląd na canvasie.
3. Wpisanie wieloliniowego podpisu, np. `{exif:Artist}`, i wstawianie tokenów z listy.
4. Ustawienie fontu, grubości, rozmiaru, koloru, opacity, interlinii i wyrównania.
5. Wybór anchora 3 × 3 oraz marginesów.
6. Wybór jakości i sprawdzenie dokładnego rozmiaru przygotowanego wyniku.
7. Pobranie JPG w rozdzielczości zdekodowanego oryginału z utrwalonym podpisem.

Lista tagów ma wyszukiwanie, osobny scroll i oznaczenie użytych tokenów.
Wstawianie pamięta kursor/zaznaczenie, także po wyszukiwaniu tagu.
Brakujące pola są raportowane i wymagają potwierdzenia przy eksporcie.

Jakość JPG: Small 60%, Balanced 75%, Best 95% (domyślnie) i suwak 1–100%.
Rozmiar wyniku pochodzi z rzeczywistego kodowania, a pobieranie używa tego samego
Bloba. Wynik większy od wejścia jest oznaczony ostrzeżeniem.

### Znane ograniczenia

- Jeden JPG i jeden blok podpisu. Wymiana zdjęcia zachowuje ustawienia w sesji;
  odświeżenie aplikacji przywraca domyślne wartości.
- Brak zapisanych presetów użytkownika i importu/eksportu presetów.
- Brak specjalnego parsera Helicon, batcha, swobodnego przesuwania podpisu,
  zoom/pan i aplikacji desktopowej.
- Fonty podpisu: Montserrat i Advercase, Regular/Bold.
- Brak automatycznego zawijania lub zmniejszania zbyt długiego podpisu.
- Maksymalnie 100 MB, 50 MP i 16 384 px na bok. Limity nie gwarantują wystarczającej
  pamięci na każdym urządzeniu.
- JPG jest ponownie kodowany. Źródłowe EXIF/IPTC/XMP/GPS i ICC nie są kopiowane.
  Obrót jest utrwalany w pikselach, Canvas używa domyślnego sRGB.
- Zweryfikowano dostarczone zdjęcia sRGB. Inne profile wymagają osobnych testów.
- Duże zdjęcia mogą chwilowo obciążyć główny wątek; kodowanie nie działa w workerze.

### Historyczna weryfikacja przy zamknięciu pre-MVP

- 87 testów jednostkowych: modele, metadane, tokeny, geometria, kolejka,
  format rozmiaru, preferencje i limity.
- Dwa scenariusze E2E w Chromium i WebKit: eksport oraz cykl importu/wymiany/błędów.
- Regresja wizualna pikseli eksportu w macOS/Chromium dla zdjęcia poziomego i pionowego.
- Kontrola wymiarów, rozmiaru w bajtach, jakości, kolorów sRGB i EXIF Orientation 6.
- Build aplikacji i Storybooka; renderowanie 40 stories oraz interakcje Select i Slider.

WebKit nie jest równoznaczny z ręcznym testem aplikacji Safari. Wzorce Chromium
nie stanowią wzorców dla innych silników lub systemów.

### Aktualizacja interfejsu po pre-MVP

Wdrożono globalną jednostkę wymiarowania dokumentu: px, % krótszego boku lub
% dłuższego boku. Jednostka obejmuje font i cztery marginesy; jej zmiana przelicza
wartości z zachowaniem wyglądu na bieżącym zdjęciu. Marginesy mają wizualny edytor,
niezależne wartości i opcję łączenia. Anchory działają względem obszaru wewnątrz
czterech marginesów. Opacity ma slider i pole liczbowe; interlinia pozostaje
mnożnikiem fontu. Są to uzgodnione zmiany interfejsu i modelu, nie realizacja
proponowanych etapów MVP poniżej.

Kolejne zatwierdzone dodatki:

- Stan edytora pozostaje przy wymianie zdjęcia: szablon, styl, jednostka, anchory,
  marginesy i jakość JPG. Nie jest to trwały zapis presetów.
- Font domyślnie 2% krótszego boku, interlinia 1,4×, marginesy po 3%.
- Kolor podpisu wybierany z listy 12 neutralnych/pastelowych odcieni lub własnego
  HEX (3 albo 6 cyfr). Własny kolor działa także w eksporcie.
- Helpery FrameNote bez namespace i grupowanie oryginalnych tagów według namespace.
  Lista i reguły: [CAPTION_TAGS.md](CAPTION_TAGS.md). Domyślny szablon to
  `{author}`, `{lens}`, `{exposure}` w osobnych liniach.
- Helpery nie zmieniają ani nie ukrywają oryginalnych metadanych. Nie ma jeszcze
  parsera Helicon ani `{stackCount}`; dostępny jest `{exif:UserComment}`.
- Siedem oryginalnych zdjęć testowych; dodatkowe przypadki to jasne tło, makro,
  stack Helicon, pionowe nocne zdjęcie oraz XMP bez danych ekspozycji.
- Obecna weryfikacja: 141 testów jednostkowych, pięć scenariuszy w dwóch silnikach
  (10 testów E2E), build aplikacji i Storybooka.

### Odłożone i wycofane eksperymenty

Edytor podpisu z przeciąganymi badge’ami tagów i jawnymi przełamaniami wierszy
został odłożony. Obecnie pozostaje textarea z wizualnym zawijaniem tekstu; Enter
wyznacza rzeczywiste przełamanie podpisu na zdjęciu. Rozmyte tło ze zdjęcia
i przezroczystość całego edytora wypróbowano i wycofano jako rozpraszające.
Nie przywracać tych zmian bez nowej decyzji użytkownika.

## 4. MVP — oczekiwania i proponowany zakres

Użytkownik określił minimalny cel jako odtworzenie potrzebnych możliwości pluginu
LrC, z dostępem do pól metadanych i lepszym stylowaniem. Podstawowy przepływ
został wydzielony i wykonany jako pre-MVP. Szczegółowa lista etapów MVP nie została
jeszcze zatwierdzona; poniżej rozdzielamy potrzeby od propozycji implementacji.

### Potrzeby zgłoszone przez użytkownika

- Własne presety dla różnych zastosowań: macro, stack macro, wildlife itp.
- Dostęp do UserComment, w tym informacji zapisywanych przez Helicon Focus.
- Rozpoznanie formatu komentarza Helicon i propozycja czytelnego formatowania.
  Przykład z rozmowy: `Stacked from 49 images. Method=B (R=8,S=4)`.
  Dokładna składnia, warianty i sposób prezentacji wymagają weryfikacji na plikach.
- Docelowo kontenery z anchorami 3 × 3 lub dowolną pozycją na zdjęciu;
  anchor zmienialny w dowolnym momencie. W kontenerze pola i sterowanie ich
  stylowaniem oraz wyrównaniem w osiach.
- Możliwość dodawania kilku zdjęć w przyszłości.

### Uzgodniony podział MVP — 24 października 2026

MVP: jedno zdjęcie, wiele kontenerów tekstowych i SVG, wizualny edytor treści
oraz presety całego układu. Każdy etap wymaga oceny użytkownika, poprawek
oraz jego potwierdzenia przed przejściem dalej. Etap 1 zaakceptowano i zapisano w commicie `bacbda4`; następnie zlecono etap 2.

| Etap                       | Zakres                                                                                                         | Stan                            |
| -------------------------- | -------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| 1. Próba Tiptap            | Tekst, badge’e, ikony SVG, zaznaczanie, przeciąganie, undo/redo i schowek `{klucz}`                            | Zaakceptowana; commit `bacbda4` |
| 2. Wiele kontenerów        | Dodawanie, duplikowanie, usuwanie; wybór z listy i canvasu; osobny styl i anchor; globalne marginesy           | Zaakceptowany                   |
| 3. Custom position         | Przeciąganie na zdjęciu, X/Y względne do zdjęcia, przełączanie Anchor/Custom                                   | Zaakceptowany; commit `addfa4f` |
| 4. Docelowy edytor i ikony | Tiptap w sidebarze, picker metadanych, własne SVG z nazwami `{icon:aperture}`, układ tekstu i ikon w eksporcie | Zaakceptowany; commit `a4afee3` |
| 5. Logo SVG                | Osobny kontener, proporcjonalne wymiary, opacity, oryginalne kolory lub jeden kolor, pozycjonowanie            | Zaakceptowany; commit `91b4389` |
| 6. Presety                 | Zapis, wybór, aktualizacja, Save as, usuwanie, trwałość lokalna, import/eksport wraz z SVG                     | Zaakceptowany; commit `e8f5583` |
| 7. Weryfikacja             | Różne zdjęcia/orientacje, brakujące dane, presety, zgodność podglądu i JPG, Chromium/WebKit                    | Zaimplementowana; do oceny      |

Nazwy kontenerów nie są wymagane: lista pokazuje fragment treści lub miniaturę SVG.
Sidebar edytuje aktywny kontener; na canvasie wybiera się i przesuwa cały blok.
Jednostka wymiarowania jest wspólna, styl jednolity wewnątrz kontenera, ale osobny
dla każdego bloku. Ikony inline domyślnie dziedziczą rozmiar i kolor tekstu.
Preset zapisuje odwołania do metadanych, wszystkie kontenery i użyte zasoby SVG.
Jakość JPG proponowana jako osobna preferencja eksportu.

Do oceny przy etapie 3 pozostaje punkt odniesienia pozycji Custom: proponowany
ostatni wybrany anchor. Poza MVP: batch, desktop, formatowanie pojedynczych
fragmentów tekstu, dziedziczenie stylów i parser Helicon.

### Etap 1 — próba edytora

Dostęp: Storybook → Screens/CaptionEditorPrototype → Playground.
Odizolowany od edytora zdjęć i eksportu, używa przykładowych metadanych oraz
ikon SVG aperture i camera z Lucide. Brakujące tokeny/ikony zachowują nazwę.
Pisanie pełnego tokenu oraz wklejanie zamienia je na elementy atomowe.
Kopiowanie i wycinanie używa tekstu `{klucz}`; pole Clipboard playground
pozwala sprawdzić zawartość schowka. Enter zachowuje nowe wiersze.
Upload własnych SVG i renderowanie podpisów należą do późniejszych etapów.

### Etap 2 — wiele kontenerów tekstowych

Lista Containers pokazuje fragment treści oraz anchor, bez wymaganych nazw.
Dodawanie kopiuje styl i pozycję aktywnego kontenera z treścią „Sample text”; duplikowanie
kopiuje również treść. Usunięcie wybiera sąsiedni kontener; pusty układ jest dozwolony.
Wybór na canvasie i z listy steruje tym samym sidebarem. Ramka zaznaczenia jest
wyłącznie elementem podglądu. Kontenery mają osobne style i anchory; marginesy oraz jednostka
jest wspólna i jej zmiana przelicza wszystkie bloki. Cały układ pozostaje przy
wymianie zdjęcia; eksport uwzględnia wszystkie kontenery i ich brakujące pola.
Storybook: Screens/TestPhotos/MultipleCaptions.

Weryfikacja: 159 testów jednostkowych, 12 testów E2E (Chromium/WebKit),
w tym wybór na canvasie, niezależne ustawienia i zmiana pikseli JPG po usunięciu
jednego kontenera. Istniejące wzorce eksportu pozostają bez zmian.

## 5. UX i design system — zachować przy rozwoju

- Ciemny interfejs z kontrolkami inspirowanymi powierzchniami macOS.
  Primary emerald (`#14CC60`) wyróżnia główną akcję Export JPG.
- Header: logo SVG, akcje; eksport w navbarze.
- Start bezpośrednio w pustym edytorze; w pustym canvasie wybór zdjęcia,
  informacja o drop i prywatności; na dole wersja aplikacji i linki.
- Podczas przeciągania pliku: kontrastowy overlay, gruba przerywana zaokrąglona
  ramka odsunięta od krawędzi i komunikat upuszczenia.
- Po imporcie: przestrzeń canvasu pod headerem, główne narzędzia po prawej.
- Sekcje Photo, Caption, Sizing, Typography, Position, Margins, Export zwijane niezależnie.
- Browse available tags należy do Caption.
- Pomocniczy panel tagów/fontów/kolorów pływa nad canvasem, ma przydymione szkło i osobny
  scroll. Otwarcie panelu nie może zmieniać wymiarów zdjęcia.
- Wspólne prymitywy zamiast osobnych kopii kontrolek. Podział Storybooka na Design, Components (UI/Layout/Brand) i Screens.
- Montserrat dla interfejsu, Advercase dla ozdobnych nagłówków.
- Paleta bazowa: charcoal (wariant bazowy, ciemny i jasny), slate, porcelain.
  Primary używa emerald; ikony sekcji mają osobne akcenty. Tło przeciągania
  pozostaje slate, niezależnie od primary. Header i sidebar mają tło charcoal. HEX tylko w definicjach
  `src/index.css`; komponenty korzystają z tokenów semantycznych.
- Logo i ikony SVG dziedziczą `currentColor`; wymiary i kolor przez Tailwind.
  Ikony: Lucide.

## 6. Zasady pracy dla agenta

1. Przeczytaj ten dokument, README i `docs/DESIGN_SYSTEM.md`. Sprawdź aktualny kod
   oraz status Git; dokument opisuje stan na wskazany dzień i może się zestarzeć.
2. Implementuj uzgodniony etap, przekaż do oceny i iteruj poprawki.
   Użytkownik sam potwierdza przejście do kolejnego etapu.
3. Polecenie wykonania jednego etapu nie upoważnia do realizacji całej roadmapy.
   Commit wykonuj na prośbę użytkownika.
4. Używaj pnpm. Główny branch to `master`. Aplikacja działa na porcie 3000,
   Storybook na 6006, E2E na 4173.
5. Logikę domenową i utils zabezpieczaj testami jednostkowymi od początku.
   Użytkownik nie chce dużej liczby kruchych E2E zależnych od szybko zmieniającego się UI.
   Zachowaj mały zestaw testów przepływu i regresję samego eksportu.
6. Nie regeneruj wzorców eksportu tylko dlatego, że test nie przeszedł.
   Zmianę wyniku trzeba wyjaśnić i obejrzeć.
7. Rozbudowuj istniejący design system i stories wraz z kontrolkami.
8. Nie deklaruj obsługi wszystkich EXIF, pełnej zgodności kolorystycznej lub
   wsparcia każdej przeglądarki bez odpowiednich danych i testów.

## 7. Punkty wejścia w repozytorium

- [README](../README.md): uruchomienie, komendy, bieżące możliwości i ograniczenia.
- [Design system](DESIGN_SYSTEM.md): komponenty, panele i zasady rozbudowy.
- `src/domain`: modele dokumentu i metadanych.
- `src/features/photo`: import, metadane i kompozycja przestrzeni roboczej.
- `src/features/caption`: tokeny, geometria, renderowanie i eksport.
- `src/components/ui`, `src/components/layout`: komponenty współdzielone.
- `tests/fixtures`: oryginalne zdjęcia LrC i ich oczekiwane parametry.
- `e2e`: przepływy Playwright i wzorce eksportu.

Przed oddaniem zmian: `pnpm check`. Dla zmian przepływu/renderowania także
`pnpm test:e2e`; dla design systemu `pnpm build-storybook` i przegląd stories.

### Korekta etapu 2 — globalne marginesy

Marginesy i tryb ich łączenia należą do dokumentu, nie do kontenerów. Wszystkie
anchory używają wspólnego obszaru wewnętrznego. Lokalna grupa Selected container
ma jaśniejsze tło i cienką ramkę; zawiera Caption, Typography i Position.
Poniżej Document zawiera Sizing, Margins i Photo, dostępne również bez kontenerów.
Ramka canvasu pojawia się przy hoverze na canvasie/liście i podczas edycji treści.
Add container tworzy widoczny Sample text. Nakładanie pod wspólnym anchorem jest
dozwolone; lista pozwala wybrać każdy kontener, a komunikat sugeruje zmianę anchora.

Aktualna kolejność sidebara: Photo → Sizing → Margins → Containers → Selected
container → Export. Nowe kontenery wybierają wolne narożniki przeciwnie do ruchu
wskazówek zegara, następnie środki krawędzi, na końcu środek. Duplikat zachowuje
anchor. Pozycje na liście pokazują również ikonę kierunku. Storybook zawiera
AllPhotos z siedmioma zdjęciami. Vite i Storybook są dostępne w LAN.

### Etap 3 — swobodne pozycjonowanie

Użytkownik zlecił implementację etapu 3. Kontenery można przeciągać po zdjęciu;
tryb Custom zapisuje X/Y w procentach całego zdjęcia, zachowując ostatni anchor
jako punkt odniesienia. Przejście Anchor → Custom nie zmienia geometrii.
W Custom marginesy nie wpływają na pozycję. Wybór punktu siatki przywraca Anchor.
Punkt odniesienia ograniczony do 0–100%; nie jest to gwarancja zmieszczenia całego
bloku. Duplikowanie zachowuje pozycję Custom, nowy kontener zaczyna od anchora.
Podgląd i eksport korzystają z tych samych obliczeń. Przykład CustomPosition
w Storybooku. Etap pozostaje do oceny, bez zgody na etap 4 ani commit.

### Etap 4 — integracja Tiptap i ikony inline

Etap 3 zaakceptowano i zapisano w commicie `addfa4f`. Użytkownik zlecił etap 4.
Caption w aplikacji korzysta ze współdzielonego edytora Tiptap, rzeczywistych
metadanych i atomowych elementów inline. Biblioteka prototypu i aplikacja używają
tego samego rozszerzenia, widoku tokenów i konwersji tekstu. Tagi wstawiane są
w zapamiętanej pozycji kursora. Kopiowanie i wycinanie daje `{klucz}`, wklejanie
odtwarza badge’e i ikony. SVG inline pokazuje sam symbol z tokenem w tooltipie.
Panel Browse icons: nazwa, upload samodzielnego SVG i wybór do wstawienia.
Ikony dziedziczą font-size, kolor i opacity oraz zachowują proporcje. Układ tekstu
i ikon jest wspólny dla podglądu i JPG, z wyrównaniem i pozycją Anchor/Custom.
Brakujące ikony zachowują zapis i uruchamiają ostrzeżenie przed eksportem.
Zasoby pozostają w sesji przy wymianie zdjęcia; trwałość należy do etapu 6.
Limit SVG: 256 KB i 2000 elementów; brak skryptów, zasobów zewnętrznych, obrazów,
tekstu i arkuszy stylów (tekst zamienić na krzywe). Samodzielne logo to etap 5.
Storybook: Screens/TestPhotos/InlineIcons. Etap 4 do oceny, bez commita.

### Etap 5 — samodzielne logo SVG

Etap 4 zaakceptowano i zapisano w commicie `a4afee3`. Użytkownik zlecił etap 5.
Add logo dodaje SVG do modelu kontenera (asset, szerokość i tryb kolorów).
Rozmiary zachowują proporcje i wspólną jednostkę dokumentu. Original colors lub
Single color, opacity, wymiana pliku z zachowaniem szerokości/stylu/pozycji.
Kontener logo ma wspólny z tekstem mechanizm wyboru, duplikowania, usuwania,
anchorów, globalnych marginesów i Custom z przeciąganiem. Nowy kontener tekstowy
nie dziedziczy grafiki z aktywnego logo. Miniatura i nazwa pliku identyfikują logo
na liście. Podgląd i eksport korzystają z logoLayout; nieudany upload nie niszczy
poprzedniego pliku. Zasoby pozostają w sesji; presety to etap 6.
Przykład: Screens/TestPhotos/StandaloneLogo. Etap 5 pozostaje do oceny, bez commita.

### Etap 6 — presety układu

Zaimplementowano lokalne presety całego układu: zapis, wybór, aktualizacja,
Save as new, usuwanie i import/eksport JSON v1 z użytymi SVG. Bez zdjęcia,
wartości metadanych i jakości JPG. Import sprawdza strukturę, zakresy wartości
i SVG; nie nadpisuje istniejących presetów. Etap pozostaje do oceny użytkownika;
nie rozpoczęto etapu 7.

### Etap 7 — końcowa weryfikacja MVP

Wykonano sprawdzenie pełnego przepływu, presetów z SVG po odświeżeniu,
bezpiecznego odrzucania błędnego importu, dwóch orientacji oraz wzorców JPG
w Chromium/WebKit. Siedem oryginalnych zdjęć sprawdzono w obu silnikach.
Poprawiono zachowanie celowych pustych wierszy i generowanie ID na HTTP w LAN.
Raport: [MVP_VERIFICATION.md](MVP_VERIFICATION.md). Zmiany pozostają do oceny
użytkownika; bez automatycznego commita.

### Start w pustym edytorze — 26 października 2026

Po ocenie wariantów użytkownik odrzucił artwork w canvasie i wrócił do prostego
pustego edytora: przycisk wyboru zdjęcia, informacja o drop JPG/PNG i prywatności.
Na dole canvasu wersja aplikacji oraz GitHub i Changelog. Bez fotografii,
osobnego splasha i timera. Logo w headerze pozostaje nieklikalne. Iteracje
oceniamy wizualnie bez pełnych testów/buildów. Użytkownik zlecił commit tej wersji.

### Sesja wielu zdjęć i eksport rolki — 2026-10-27

Użytkownik zaakceptował POC rolki z dostarczonych SVG i zlecił implementację
całego uzgodnionego przepływu. Bieżący zakres jest realizowany do jego oceny:

- Add photos i drop na canvas dodają jeden lub wiele JPG/PNG do sesji.
  Kolejne operacje importu są kolejkowane; drop do Content nadal wstawia grafikę.
- Przy jednym zdjęciu rolka jest ukryta, przy co najmniej dwóch pojawia się pod
  canvasem, bez zajmowania szerokości paneli. Wysokość kasetki wynosi 195 px;
  klatki zachowują poprawione proporcje 3:2. Pionowe kółko przewija rolkę poziomo.
- Pojedynczy pierwszy import zachowuje układ przygotowany przed otwarciem zdjęcia.
  Pierwszy import wielu plików i każde kolejne zdjęcie zaczynają od Default.
  Pierwsze poprawnie wczytane zdjęcie z dodanej partii staje się aktywne.
- Układ, grafiki, aktywna warstwa i wybór presetu są niezależne dla zdjęć.
  Zmiana zapisanego presetu nie nadpisuje układów pozostałych otwartych zdjęć.
  Edytor treści jest odtwarzany przy zmianie dokumentu: historia tekstowego
  undo/redo nie przenosi się między zdjęciami i nie jest zachowywana po przełączeniu.
- Close photo usuwa aktywne zdjęcie i wybiera sąsiednie. Dispose roll… po
  potwierdzeniu zamyka całą serię. Ostatni aktywny układ pozostaje w pustym
  edytorze, zgodnie z zachowaniem zamykania pojedynczego zdjęcia. Pliki źródłowe
  i zapisane presety pozostają na miejscu.
- Export JPG dotyczy aktywnego zdjęcia. Export all w menu split buttona
  przygotowuje kolejno wszystkie JPG i pobiera framenote-roll.zip. Jakość
  i opcje metadanych są wspólne. Nazwy kolidujących plików otrzymują sufiksy.
- Brakujące pola/niepoprawne tokeny wszystkich widocznych warstw są zbierane
  w jednym potwierdzeniu. Błąd pojedynczego pliku nie przerywa importu/eksportu
  pozostałych; eksportuje się poprawne wyniki i pokazuje listę niepowodzeń.
- Import i eksport mają postęp i anulowanie w szklanym overlayu na środku canvasu.
  Przełączanie zdjęć nie dodaje belki ani nie przesuwa canvasu i rolki. Podczas eksportu edycja oraz zmiany
  sesji są zablokowane. Anulowanie czeka na zakończenie bieżącego dekodowania
  lub kodowania, odrzuca spóźnione wyniki i nie pobiera częściowego ZIP-a.

Sesja przechowuje pliki źródłowe, metadane, dokumenty i małe miniatury (maks.
320 px na dłuższym boku). Poza importem pełny obraz jest zachowywany dla aktywnego
zdjęcia; eksport serii wczytuje dodatkowo tylko bieżący plik. Renderowanie JPG
współdzieli jedną kolejkę z automatycznym przygotowaniem aktywnego eksportu.
Nie przygotowujemy JPG wszystkich zdjęć po każdej zmianie. ZIP przechowuje
skompresowane JPG bez ponownego pakowania; zgromadzone wyniki mają limit 1 GB.
Dotychczasowe limity pojedynczego pliku pozostają w mocy. Nie zadeklarowano
obsługi nieograniczonych serii ani budżetu pamięci dla każdego urządzenia.

Sesja nie jest trwale zapisywana; odświeżenie strony usuwa otwarte zdjęcia i ich
niezapisane ustawienia. Synchronizacja układów nie należy do uzgodnionego zakresu.
Storybook: Screens/PhotoSession/ImportedSeries używa produkcyjnej aplikacji.

Weryfikacja implementacji: `pnpm check` (306 testów jednostkowych), build
Storybooka oraz kontrola wizualna produkcyjnego edytora z rolką. Regresja
przeglądarkowa obejmuje 158 scenariuszy w Chromium/WebKit. Po pełnym przebiegu
zaktualizowano starsze scenariusze do zwijanych paneli, osobnego custom pickera
oraz dodawania zamiast zastępowania zdjęć; wszystkie nieudane scenariusze
zweryfikowano ponownie. Końcowy przebieg 10/10 obejmuje eksport poziomy/pionowy,
niezależność dokumentów, zgodność JPG pojedynczego i w ZIP, kolizje nazw,
zwalnianie zasobów, anulowanie oraz układ przygotowany przed importem.
Istniejących wzorców pikseli nie regenerowano. Implementacja pozostaje do oceny
użytkownika; commit nie oznacza akceptacji etapu ani wydania.

### Cofnięcie optymalizacji przełączania — 2026-10-27

Po ocenie użytkownik nie zauważył odczuwalnej poprawy szybkości i zdecydował
wrócić do prostszego wczytywania aktywnego zdjęcia. Cofnięto cache LRU, ponowne
użycie metadanych przy przełączaniu/eksporcie, opóźnianie loadera, osobne
wczytywanie oryginału dla aktywnego JPG oraz kolejkę szybkich przełączeń.
Pozostają sesja wielu zdjęć, rolka, niezależne dokumenty, eksport ZIP i szklany
overlay na środku canvasu, bez belki ani zmiany geometrii widoku.

Po cofnięciu: `pnpm check` (306 testów jednostkowych), build Storybooka oraz
16/16 testów importu, sesji, eksportu i geometrii overlayu w Chromium/WebKit.
Wzorce pikseli eksportu pozostały bez zmian.

### Tła warstw — propozycja rozszerzenia

Ustalenia z 2026-10-28, zakres kontrolek, geometria zachowująca pozycję treści,
próba renderowania Glass i proponowane etapy znajdują się w opisie tła warstw. Storybook zawiera
prototyp interfejsu Screens/LayerBackground. Plan nie oznacza zgody na
automatyczną implementację kolejnych etapów.

### Tła warstw — realizacja 2026-10-28

Użytkownik zlecił kolejne etapy po szybkiej weryfikacji i commicie, bez osobnego
potwierdzania każdego przejścia. Wdrożono model/presety i jednostki, Color wraz
z cieniem oraz Glass we właściwym edytorze i wspólnym rendererze JPG/batch.
Padding rozszerza obrys dekoracji bez zmiany pozycji treści. Kontrolki Background
należą do jaśniejszego inspektora; Layers zwija całość. Przypadki produkcyjne
są w Storybooku Screens/TestPhotos. Szczegóły w sekcji o tle warstw poniżej.
Separatory poziome są odłożone jako NTH-004. Nie zmieniono wersji ani nie
przygotowano wydania.

### Web i macOS — rozpoczęta realizacja 2026-10-30

Na polecenie użytkownika kolejne etapy mają testy i commit, bez zatrzymywania
między etapami. Aktualny podział to apps/web, apps/desktop, packages/editor
oraz packages/core. Powłoka macOS korzysta z Electron; podstawowy katalog fontów
jest wspólny i lokalny. Szczegóły, rzeczywiste wyniki i pozostałe zależności:
[plan](DESKTOP_PREPARATION_PLAN.md), [postęp](DESKTOP_PROGRESS.md),
[uruchamianie desktopu](DESKTOP.md). Starsze opisy etapów i ścieżek powyżej
są historyczne; nie oznaczają braku funkcji obecnych w nowszym kodzie.

Etap 7 zakończono 2026-10-31 dla lokalnego macOS Apple Silicon na Electron.
Weryfikacja obejmuje web, aplikację zainstalowaną poza repozytorium, offline,
JPG i siedmiozdjęciowy ZIP oraz presety i jakość JPG po restarcie. Pełne wyniki
(w tym ponowienia E2E) zawiera DESKTOP_PROGRESS.md. Powstał lokalny, niepodpisany
DMG; publikacja Netlify, podpisywanie i notaryzacja nie zostały wykonane.

### Pierwsza beta źródłowa — 2026-10-31

Na polecenie użytkownika wdrożono `0.1.0-beta`: pierwszy oficjalny format
presetów v1 z parserem Zod, identyczny dla webu i macOS. Web zachowuje obecny
localStorage; macOS zapisuje osobne JSON-y w `~/FrameNote/presets`. Nie wspieramy
ani nie przenosimy wcześniejszych danych. Przyszła zmiana formatu wymaga nowego
schematu, migracji z poprzedniej wspieranej wersji, skryptu i testów.

About pokazuje wersję i identyfikator buildu; manifesty i changelog mają wspólną
kontrolę wersjonowania. Użytkownik sam buduje aplikację; nie publikujemy gotowych
buildów. Szczegóły i rzeczywiste wyniki (w tym powtórzenia timeoutów i znana
wcześniejsza różnica hovera) są w [planie bety](PRESET_VERSIONING_PLAN.md).
Lokalny commit/tag nie oznaczają wykonania push ani zdalnej publikacji.
