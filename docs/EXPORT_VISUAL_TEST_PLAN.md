# Photo export — plan testów regresji wizualnej

Data: 2026-10-25. Użytkownik zlecił realizację kolejnych etapów, weryfikację
testami oraz commit po każdym etapie.

## Cel i granice

Sprawdzać rzeczywiście pobrany JPG: kompletność treści, wygląd fontów, wymiary,
położenie i wygląd wszystkich widocznych warstw zgodnie z presetem. Osobno
potwierdzać zgodność z podglądem. Zmiany układu sidebara nie powinny zmieniać
wzorców eksportu.

Nazwa zestawu: **Photo export**. Rodzaj testów: **Photo export visual
regression**. Przedmiotem porównania są wynikowe obrazy, nie screenshoty
interfejsu FrameNote. „UI Mode” oznacza wyłącznie gotowy panel narzędzia
Playwright do uruchamiania i przeglądania testów.

„Wszystkie dane” oznaczają pola użyte w presecie, statyczny tekst i jego grafiki.
Nie oznacza to wypisania wszystkich metadanych zdjęcia ani zachowania EXIF
w pliku wynikowym. Obecny eksport nie kopiuje źródłowych tagów.

## Stan wyjściowy

- `e2e/photo-flow.spec.ts`: dwa zdjęcia, prosty podpis, wzorce miniatury oraz
  fragmentu 1400 × 300 px tylko w Chromium/macOS; próg koloru 0,1 i dopuszczalne
  0,1% różniących się pikseli. Ponadto wymiary, bajty, jakość, kolory i obrót EXIF 6.
- Testy presetów obejmują zapis, odświeżenie, import/eksport, SVG, puste wiersze
  i pozycje Manual. Testy grafik i kolejności kontrolują wybrane piksele.
- Testy jednostkowe zabezpieczają część geometrii, jednostek i rozwiązywania tokenów.
- Brakuje pełnej macierzy wzorców dla treści, typografii i ustawień presetów;
  WebKit nie ma własnych wzorców wizualnych eksportu.
- Kod ma osobne ścieżki zwykłego tekstu i treści z grafikami. Obie wymagają
  pokrycia, także dla takiego samego tekstu otoczonego elementami inline.

### Zrealizowano — etap 1

- Nowy zestaw `Photo export` pobiera rzeczywisty JPG z aplikacji i porównuje
  **każdy piksel całego zdjęcia w oryginalnym wymiarze** z osobnym wzorcem dla
  przeglądarki. Porównanie dekoduje oba JPG w tej samej przeglądarce i sRGB;
  próg różnicy wynosi zero. Zapisane wzorce zachowują JPG, a nie screenshot UI.
- Raport przy różnicy dołącza expected, actual i pełnowymiarową mapę pikseli
  różniących się na magenta. Podaje liczbę pikseli, największą różnicę kanału
  oraz pierwszą współrzędną rozbieżności.
- Pierwszy pakiet wzorców Chromium/macOS: Wildlife + Default, jasne tło + Default
  dark, prawdziwy stack Helicon + Macro oraz plansza 640 × 480 dla Advercase Bold,
  polskich znaków i symboli.
- Test kontroluje także konkretny szablon helperów, odczyt komentarza Helicon,
  obecność fontu oraz identyczność kolejnych wyników.
- Dodano skróty `test:photo-export`, `test:photo-export:review` i
  `test:photo-export:report`. Wzorce aktualizujemy wyłącznie w trybie aktualizacji
  Playwrighta; zwykłe uruchomienie nigdy ich nie nadpisuje.
- Weryfikacja: `pnpm check` — 237 testów jednostkowych, lint, typy i build;
  `pnpm test:photo-export --project=chromium` — 5/5. Ponowne przebiegi nie
  zmieniły pikseli zapisanych JPG.

### Zrealizowano — etap 2

- Rozszerzono `Photo export` do 40 przypadków dla Chromium/macOS. Siedem zdjęć
  × trzy wbudowane presety daje 21 pełnoobrazowych wzorców. Brakujący komentarz
  Helicon jest potwierdzany przez użytkownika testowego; warstwa nie pojawia się
  na innych zdjęciach bez rozpoznanych danych.
- Plansza 1200 × 800 sprawdza wszystkie dziewięć anchorów z marginesami
  L=100, R=60, T=40, B=80. Zielony prostokąt 48 × 24 px w JPG mierzymy względem
  niezależnych oczekiwań, w tym środek X=596/Y=368 oraz prawy dolny X=1092/Y=696.
  Dodatkowa pozycja Manual 25%/75% potwierdza punkt odniesienia środka bloku
  (piksele X=276–323, Y=588–611) przy zdefiniowanych marginesach.
- Dodano cztery pełnoobrazowe warianty fontu: Montserrat Regular/Bold i Advercase
  Regular/Bold. Tekst zawiera `Żółw © · ×`; test potwierdza też gotowość konkretnej
  rodziny i grubości fontu.
- Eksport mieszanej warstwy tekstowej z SVG i PNG sprawdza pełny wynik po
  odtworzeniu zasobów z presetu.
- Weryfikacja: `pnpm check` — 237 testów jednostkowych, lint, typy i build;
  pełny `pnpm test:photo-export --project=chromium` — 40/40. Wszystkie
  zapisane pełne obrazy mają zerową różnicę pikseli.

### Zrealizowano — etap 3

- Dodano oddzielne, pełnoobrazowe wzorce WebKit/macOS dla wszystkich 40
  przypadków etapu 2 oraz mieszanego SVG + PNG. Wzorce Chromium pozostają
  niezależne od wzorców WebKit.
- Eksport Wildlife jest porównywany bajt w bajt po otwarciu w osobnych
  kontekstach przeglądarki przy viewportach 900 × 700 / DPR 1 oraz
  1500 × 1000 / DPR 2. Eksport nie zależy od rozmiaru podglądu ani skali ekranu.
- Test opóźnia żądanie Advercase Bold, sprawdza, że pobieranie pozostaje
  wyłączone do czasu załadowania fontu, a potem porównuje cały JPG z wzorcem.
- Test podglądu używa markera SVG w kontrolowanym położeniu Manual. Mierzy
  jego położenie w canvasie podglądu i w zapisanym JPG; uwzględnia skalę
  podglądu i tolerancję kompresji JPG.
- Weryfikacja: `pnpm check` — 237 testów jednostkowych, lint, typy i build;
  pełne `pnpm test:photo-export --project=chromium` — 43/43 oraz
  `pnpm test:photo-export --project=webkit` — 43/43. Oba przebiegi korzystały
  z istniejących wzorców bez ich aktualizacji; wszystkie piksele pełnych JPG
  zgadzały się dokładnie.

## Trzy uzupełniające się kontrole

1. **Treść i ustawienia.** Do pary zdjęcie + preset dołączamy ręcznie sprawdzony
   manifest: oczekiwane teksty poszczególnych wierszy, brakujące pola, widoczność,
   kolejność, zasoby i parametry warstw. Porównujemy z rzeczywistym wynikiem
   rozwiązywania treści. Ta kontrola nie dowodzi jeszcze, że tekst trafił do JPG.
2. **Geometria.** Sprawdzamy w pikselach zdjęcia rozmiary, pozycje i odstępy.
   Oczekiwań nie wyliczamy funkcjami produkcyjnymi, które testujemy. Proste,
   kontrastowe grafiki na jednolitym tle umożliwiają także pomiar bezpośrednio
   w pobranym JPG. Rozróżniamy prostokąt układu tekstu i widoczne piksele liter.
3. **Obraz.** Dekodujemy pobrany JPG i porównujemy cały obraz z zaakceptowanym
   wzorcem piksel po pikselu, w oryginalnej rozdzielczości. Domyślnie wymagamy
   zera różnic w każdym kanale koloru, również na wygładzonych krawędziach.
   Bez masek, pomijania antyaliasingu, skalowania lub automatycznego wyrównywania
   obrazu przed porównaniem. Sprawdzamy piksele, nie identyczność bajtów pliku.

Wszystkie trzy kontrole muszą przejść. Poprawny manifest nie zastępuje obrazu,
a identyczny obraz nie potwierdza poprawności pierwszego wzorca. Dla dużych zdjęć
można porównywać pełny obraz kaflami bez utraty rozdzielczości.

Nie trzeba przygotowywać ani zatwierdzać wycinków zdjęcia. Miniatura, powiększenie
1:1 i ewentualne automatyczne zbliżenie miejsca różnicy są wyłącznie sposobami
oglądania raportu; nie ograniczają obszaru objętego testem. Wzorzec może być
bezstratnym PNG otrzymanym przez zdekodowanie zaakceptowanego JPG, bez dodatkowego
kodowania stratnego. Oryginalny pobrany JPG zachowujemy jako materiał do oceny.

## Macierz pokrycia

| Obszar       | Przypadki i oczekiwania                                                                                                                                                                                                                             |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Dane         | Wszystkie aktualne helpery FrameNote, oryginalne tokeny EXIF/XMP/IPTC, UserComment i Helicon, tekst stały, powtórzone tokeny, długie wartości i wartości zawierające znaki specjalne. Każdy przypadek ma jawny oczekiwany tekst.                    |
| Braki        | Pole nieobecne/puste, częściowo dostępny exposure, brak Helicon, brak ikony/grafiki. Ostrzeżenie, właściwa treść po potwierdzeniu oraz usuwanie wierszy opróżnionych przez braki. Celowy pusty wiersz pozostaje. Ukryta warstwa nie zgłasza braków. |
| Fonty        | Montserrat i Advercase × Regular/Bold; tekst jednoliniowy i wieloliniowy; mały, ułamkowy i duży rozmiar; cyfry, polskie znaki, symbole używane w podpisach, np. ©, ·, ×. Osobna kontrola dostępności glifów w dostarczonych fontach.                |
| Układ tekstu | Left/center/right przy różnej długości wierszy, kilka interlinii, celowe puste wiersze, tekst przy grafikach i bez nich. Długi tekst zachowuje obecny brak automatycznego zawijania lub zmniejszania.                                               |
| Jednostki    | px, % krótszego i % dłuższego boku; wartości ułamkowe; konwersja jednostek zachowuje wygląd na tym samym zdjęciu. Wymiana zdjęcia przelicza jednostki względne, a px zachowuje rozmiar.                                                             |
| Anchory      | Wszystkie 9 punktów; marginesy zerowe, symetryczne i asymetryczne. Środek liczony wewnątrz marginesów. Osobno wyrównanie tekstu wewnątrz bloku.                                                                                                     |
| Manual       | X/Y 0, 50, 100% oraz wartości ułamkowe, różne punkty odniesienia; pozycja pomija marginesy. Przejście Anchor → Manual zachowuje położenie. Kontrolowane wyjście poza kadr ma oczekiwane przycięcie.                                                 |
| Grafiki      | Ikony, SVG i PNG; same grafiki oraz tekst + grafiki; różne proporcje, wysokość względem fontu i dokumentu; oryginalne kolory, jednokolorowy SVG, alfa PNG; grafika wyższa od tekstu zwiększa wiersz.                                                |
| Warstwy      | Wiele niezależnych stylów, nakładanie, kolejność, ukrycie, opacity 0/50/100%, pusta warstwa i pusty dokument. Żadne zaznaczenia, linijki, prowadnice ani zaślepki edytora nie trafiają do JPG.                                                      |
| Presety      | Default, Default dark, Macro i kontrolowane presety testowe; zapis → odświeżenie → zastosowanie, eksport JSON → import w czystej sesji, aktualizacja i ponowne użycie. Porównanie JPG przed i po odtworzeniu.                                       |
| Zdjęcia      | Poziom, pion, kwadrat, różne rozdzielczości, jasne/ciemne tło; JPG oraz PNG z alfa; wszystkie wartości EXIF Orientation 1–8 na małej planszy z oznaczonymi narożnikami.                                                                             |
| Gotowy plik  | JPG, dokładna szerokość/wysokość po orientacji, liczba bajtów zgodna z przygotowanym wynikiem, jakość 60/75/95 oraz skrajne 1/100; alfa zdjęcia spłaszczona do oczekiwanego tła. Jakość jest ustawiana osobno, bo nie należy do presetu.            |
| Aktualność   | Szybka zmiana zdjęcia, presetu, fontu lub zasobu podczas przygotowania eksportu. Pobranie zawiera ostatni stan; opóźniony wynik nie zastępuje aktualnego.                                                                                           |

Nie mnożymy wszystkich cech przez wszystkie pozostałe. Pełne kombinacje
9 anchorów × 3 jednostki × 3 orientacje są tanie w testach geometrii. Wzorce
wizualne dobieramy tak, by każda cecha i istotna interakcja miały pokrycie,
szczególnie font × grubość, orientacja × jednostka i tekst × grafika.

## Materiały testowe

- Siedem istniejących oryginalnych zdjęć × trzy wbudowane presety: 21 kombinacji
  na silnik. Braki danych mają jawne oczekiwania; nie są automatycznie błędem.
- Małe, deterministyczne plansze do precyzyjnych pomiarów, typografii, alfa,
  rotacji i nakładania warstw. Czytelne kolory i asymetryczne kształty ujawniają
  przesunięcie, odbicie i błędną skalę.
- Presety testowe w aktualnym formacie, obejmujące całą macierz. Osobny manifest
  oczekiwań, niezależny od domyślnych wartości i funkcji renderera.
- Dla realnych zdjęć teksty ustalone na podstawie znanych metadanych. Dodatkowe
  kontrolowane pliki z metadanymi pokrywają pola nieobecne w oryginałach.
- Lista pokrycia wiąże każdą pozycję macierzy z konkretnym testem. Liczba wzorców
  wynika z tej listy; sam duży licznik testów nie jest kryterium kompletności.

Większość scenariuszy przygotowuje stan przez import gotowego presetu i zdjęcia.
Niewielki zestaw pozostaje pełnym przepływem tworzenia/zapisu przez UI. Wszystkie
porównania końcowego wyniku korzystają z rzeczywistej akcji pobierania aplikacji.

## Fonty i zgodność z podglądem

Potwierdzać załadowanie konkretnych lokalnych fontów i odmian przed pomiarem,
dekodowanie grafik i gotowość właściwego eksportu. Samo `document.fonts.ready`
nie dowodzi użycia oczekiwanego fontu lub dostępności każdego glifu. Potrzebne
są także kontrola załadowanych odmian, metryki tekstów wzorcowych i obraz 1:1.

Test z opóźnionym ładowaniem fontu ma wykrywać przedwczesny eksport fontem
zastępczym. Zablokowany font nie może dać zielonego wyniku testu zgodności.
Ewentualna polityka błędu w produkcie wymaga osobnej decyzji, jeśli test ujawni lukę.
Nie przyjmujemy bez sprawdzenia, że Advercase zawiera wszystkie polskie glify.

Podgląd sprawdzamy po sprowadzeniu współrzędnych do pikseli zdjęcia, przy dwóch
rozmiarach okna i DPR 1/2. Eksport ma pozostać taki sam. Dodatkowy test małej
planszy w skali 1:1 porównuje podgląd bez nakładek edytora z JPG, z tolerancją
kompresji. Nie wymagamy identycznych pikseli między pomniejszonym canvasem
a pełnowymiarowym JPG.

## Środowisko, tolerancje i raport

Propozycja podstawowa: macOS, Chromium i WebKit, osobne zaakceptowane wzorce.
Przypinamy zależności, wersje przeglądarek, pliki fontów, viewport, DPR,
locale, strefę czasową i jakość JPG. Uruchomienie na innej platformie wymaga
osobnych wzorców; brak wzorca nie może być cichym pominięciem kontroli.
Render może różnić się między środowiskami — zob.
[dokumentacja porównań Playwright](https://playwright.dev/docs/test-snapshots).

- Wymiary pliku i treść: dokładna zgodność.
- Geometria modelu: dokładna wartość z małym epsilonem wyłącznie dla obliczeń
  zmiennoprzecinkowych; bez tolerowania przesunięcia całej warstwy o 1 px.
- Piksele eksportu względem wzorca: zero różnic jako punkt wyjścia. Kilka
  powtórzeń tego samego eksportu w świeżych sesjach sprawdza deterministyczność.
  Sama stratność JPG nie uzasadnia tolerancji między powtarzalnymi eksportami.
  Nie przenosimy obecnego progu 0,1 ani limitu 0,1% do nowego zestawu.
  Wykryta niestabilność wymaga ustalenia przyczyny. Ewentualny wyjątek musi być
  opisany dla konkretnego przypadku i uzgodniony, bez globalnego poluzowania.
- Pomiar krawędzi względem idealnej geometrii i dodatkowe porównanie podglądu
  z JPG mogą uwzględniać rasteryzację/kompresję. To osobne kontrole, które nie
  rozluźniają porównania gotowego eksportu z jego wzorcem.
- Błąd zapisuje pobrany JPG, expected/actual/diff, liczbę zmienionych pikseli,
  preset, manifest i różnice liczbowe oraz wersje środowiska. Przy niezgodności
  geometrii raport wskazuje warstwę i parametr, np. „oczekiwane X=36 px,
  otrzymane X=48 px”. Różnicę obrazu pokazuje w jej rzeczywistym położeniu.
- Zwykły przebieg nie aktualizuje wzorców. Kandydaty przeglądamy wizualnie
  z oczekiwaniami, wyjaśniamy każdą zmianę i dopiero akceptujemy nowy wzorzec.

## Panel przeglądu i zatwierdzanie wzorców

Wykorzystujemy istniejący Playwright. Włączamy raport HTML dostępny w przeglądarce
oraz udostępniamy panel uruchamiania testów. Nie budujemy osobnej aplikacji do
zarządzania snapshotami. Proponowane polecenia, do dodania podczas implementacji:

- `pnpm test:photo-export` — automatyczne uruchomienie zestawu eksportu.
- `pnpm test:photo-export:review` — otwarcie panelu Playwrighta dla tego zestawu.
- `pnpm test:photo-export:report` — otwarcie raportu HTML ostatniego przebiegu.

Scenariusze mają czytelne nazwy, np. `Macro / portrait / Advercase Bold`.
Panel pokazuje listę przypadków i wynik każdego z nich. Test sam otwiera
FrameNote, importuje zdjęcie i preset, pobiera JPG oraz porównuje wynik.
Użytkownik nie wykonuje tych czynności ręcznie.

Raport udostępnia **Expected** (zaakceptowany wzorzec), **Actual** (aktualny
eksport) i **Diff** (mapa różnic). Obrazy pozostają dostępne w pełnej rozdzielczości,
także gdy panel pokazuje miniaturę. W pierwszym przebiegu dołączamy kandydaty
i oczekiwania do przeglądu nawet wtedy, gdy nie ma jeszcze wzorca.

### Pierwsze wzorce

1. Generujemy kandydatów z ustalonych zdjęć, presetów i jakości eksportu.
2. Sprawdzamy treść oraz geometrię według niezależnych oczekiwań i powtarzalność
   pikseli. Sam aktualny wynik renderera nie jest dowodem poprawności.
3. Użytkownik ogląda obrazy w raporcie i akceptuje wskazane przypadki.
4. Agent zapisuje zaakceptowane wzorce i ponownie uruchamia testy. Kandydat
   wygenerowany przez narzędzie nie staje się zaakceptowanym wzorcem samoczynnie.

### Kolejne przebiegi i zamierzone zmiany

1. Identyczny eksport przechodzi automatycznie, bez kolejnego zatwierdzania.
2. Różnica powoduje błąd i powstanie raportu porównawczego. Brak wzorca również
   nie oznacza sukcesu. Zwykły przebieg ma wyłączone aktualizowanie wzorców.
3. Jeśli różnica jest błędem, poprawiamy implementację i zachowujemy wzorzec.
4. Jeśli wygląd zmieniono celowo, użytkownik ogląda porównanie i zatwierdza
   konkretne przypadki, np. „akceptuję nowy wynik Macro w pionie”.
5. Agent aktualizuje wyłącznie wskazane wzorce i uruchamia ponownie testy.
   Nie aktualizujemy całego zestawu jednym poleceniem jako sposobu naprawy błędów.

Oglądanie raportu nie modyfikuje wzorców. Akceptacja następuje w rozmowie,
a agent wykonuje aktualizację; plan nie zakłada własnego przycisku „Approve”
w raporcie HTML. Zgoda na wzorzec nie jest zgodą na commit. Wzorce będą częścią
repozytorium i podlegają przeglądowi zmian tak samo jak kod.

## Etapy realizacji i warunki odbioru

1. **Fundament i próbka do oceny.** Wspólne pobieranie/dekodowanie JPG,
   ścisłe porównanie pełnego obrazu, presety i manifesty, pomiary, panel oraz
   raport Expected/Actual/Diff. Kilka reprezentatywnych scen: metadane,
   asymetryczne marginesy, oba fonty i mieszana grafika. Powtarzanie eksportów
   weryfikuje zero różnic. Pierwsze wzorce Chromium/macOS i próbna zamierzona
   różnica pozwalają przejść cały proces oceny i akceptacji przez użytkownika.
2. **Pełne pokrycie eksportu i presetów.** Uzupełnienie macierzy, 21 kombinacji
   rzeczywistych zdjęć, odtwarzanie presetów i przypadki graniczne. Każda pozycja
   macierzy ma test oraz oczekiwania. Ocena użytkownika przed kolejnym etapem.
3. **WebKit, podgląd i odporność zestawu.** Osobne wzorce WebKit, DPR/viewport,
   opóźnione fonty/zasoby i ostatni stan eksportu; powtórzenia potwierdzające
   stabilność oraz końcowy przegląd wzorców.

Przy odbiorze celowo zmieniamy kopię danych testowych: usuwamy cyfrę z ISO,
podmieniamy font lub grubość, przesuwamy warstwę o 1 px, zmieniamy rozmiar grafiki,
ukrywamy warstwę i zamieniamy kolejność nakładających się elementów. Odpowiednie
kontrole muszą zgłosić błąd. Zmiany próbne nie pozostają w produkcji ani wzorcach.

Po implementacji obowiązują `pnpm check`, odpowiednie testy E2E oraz cały zestaw
regresji eksportu. Etapy kończą się oceną i potwierdzeniem użytkownika.
Zmiany renderera wykryte jako potrzebne przez testy opisujemy oddzielnie od
rozszerzania pokrycia. Ten plan nie rozszerza obsługi profili barwnych ani formatów
presetów i nie deklaruje jednakowego rasteryzowania fontów na różnych systemach.
