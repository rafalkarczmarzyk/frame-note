# FrameNote — zakres i opis produktu

Stan analizy: 25 października 2026.

Status: projekt do uzgodnienia z użytkownikiem. Dokument porządkuje istniejące
ustalenia; nowe warianty i pytania nie oznaczają zatwierdzenia rozwoju.
Opis dotyczy zachowania produktu, bez ustalania technologii ani układu interfejsu.

## 1. Cel aplikacji

FrameNote pomaga fotografowi przygotować zdjęcie do publikacji przez naniesienie
czytelnych, estetycznych podpisów, parametrów fotograficznych i własnego oznaczenia.
Treść może łączyć tekst wpisany przez użytkownika, dane zapisane w zdjęciu oraz
ikony. Raz przygotowany układ można zapisać i wykorzystać na kolejnych zdjęciach.

Punktem wyjścia jest praca na JPG eksportowanych z Lightroom Classic oraz potrzeby
znane z LR/Mogrify: dostęp do metadanych, w tym UserComment, podgląd na żywo,
elastyczne stylowanie i własne presety. Nie zapisano kompletnej listy funkcji
LR/Mogrify, które mają być odtworzone. Z tego powodu nie można uznać pełnej
zgodności z tym narzędziem za sprawdzone wymaganie ani gotową funkcję.

## 2. Co wynika z porównania dokumentacji z kodem

| Pierwotna potrzeba lub późniejsze uzgodnienie                   | Stan obecny                                                                                                                                                                 |
| --------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Import JPG, podgląd i zapis zdjęcia z utrwalonym podpisem       | Zaimplementowane                                                                                                                                                            |
| Praca lokalna, bez konta i wysyłania zdjęć na serwer            | Zaimplementowane dla obecnego przepływu                                                                                                                                     |
| Dostęp do odczytanych metadanych, wyszukiwanie i wstawianie pól | Zaimplementowane; bez gwarancji wszystkich istniejących tagów                                                                                                               |
| Dostęp do EXIF UserComment                                      | Zaimplementowane                                                                                                                                                            |
| Czytelna informacja o stacku Helicon Focus                      | Zaimplementowane dla rozpoznawanego komentarza z metodą A/B/C; dostępna również sama liczba zdjęć                                                                           |
| Podgląd zmian na żywo                                           | Zaimplementowane                                                                                                                                                            |
| Ułamkowe rozmiary względne, niezależne od skali podglądu        | Zaimplementowane                                                                                                                                                            |
| Wiele kontenerów tekstowych z osobnym stylem                    | Zaimplementowane                                                                                                                                                            |
| Dziewięć punktów zakotwiczenia i dowolna pozycja                | Zaimplementowane; tryby Anchor i Manual oraz przeciąganie                                                                                                                   |
| Wyrównywanie zawartości kontenera „w osiach”                    | Częściowo sprecyzowane: jest wyrównanie tekstu lewo/środek/prawo i pozycjonowanie całego bloku; nie ma osobnego pionowego wyrównania wewnątrz kontenera o zadanej wysokości |
| Wizualna edycja tekstu, tagów i ikon                            | Zaimplementowane; jednolity styl całego bloku                                                                                                                               |
| Ikony SVG w treści i samodzielne logo SVG                       | Zaimplementowane, w tym własne zasoby                                                                                                                                       |
| Własne presety macro, stack macro, wildlife itp.                | Zaimplementowany mechanizm dowolnych presetów; wbudowane: Default, Default dark, Macro                                                                                      |
| Trwały zapis i przenoszenie presetów wraz z grafiką             | Zaimplementowane lokalnie oraz przez import/eksport pliku                                                                                                                   |
| Wiele zdjęć                                                     | Niezaimplementowane; zapisane jako przyszła potrzeba, poza uzgodnionym MVP                                                                                                  |
| Wersja desktopowa                                               | Niezaimplementowana; zapisana jako możliwość na przyszłość                                                                                                                  |
| Końcowa weryfikacja MVP                                         | W dokumentacji oznaczona jako wykonana i oczekująca na ocenę użytkownika                                                                                                    |

Najważniejszy wniosek: uzgodniony zakres funkcjonalny MVP jest obecny w kodzie.
Nie należy utożsamiać tego z końcową akceptacją użytkownika ani z realizacją
wszystkich przyszłych potrzeb. Analiza obejmuje również bieżące niezacommitowane
zmiany. Nie wykonano nowej sesji testów ani ręcznej oceny całego interfejsu.
Historyczne wyniki znajdują się w MVP_VERIFICATION.md.

## 3. Projekt opisu działania aplikacji

### Zdjęcie i rozpoczęcie pracy

Użytkownik wybiera lub przeciąga JPG. Aplikacja pokazuje zdjęcie we właściwej
orientacji i odczytuje dostępne metadane. Oryginalny plik pozostaje niezmieniony.
Niepoprawny import nie usuwa poprzedniej poprawnie otwartej pracy.

Obecnie edytowane jest jedno zdjęcie. Wymiana zdjęcia zachowuje układ, style,
grafiki i ustawienia jakości eksportu w bieżącej sesji. Wartości pól podpisu są
ponownie pobierane z nowego zdjęcia. Dzięki temu jeden układ można stosować
kolejno do wielu plików, choć nie jest to przetwarzanie zbiorcze.

### Treść podpisów i metadane

Użytkownik tworzy dowolną liczbę bloków tekstowych. W jednym bloku może łączyć
własny tekst, nowe wiersze, pola metadanych i ikony. Może dodawać, duplikować,
wybierać i usuwać bloki, również usunąć wszystkie.

Pola metadanych są odwołaniami do danych zdjęcia, a nie ręcznie przepisaną
wartością. Aplikacja udostępnia zarówno oryginalne odczytane pola, jak i gotowe
pola pomocnicze: autor, aparat, obiektyw, czas, przysłona, ISO, ogniskowa, data,
prawa autorskie, zbiorcza ekspozycja i informacje o stacku Helicon.

Użytkownik przeszukuje pola, widzi ich wartość oraz źródło i wstawia je w wybranym
miejscu treści. Może również użyć pola, którego bieżące zdjęcie nie zawiera,
aby przygotować układ do innych zdjęć. Edycja podpisu nie zmienia metadanych źródła.

Aplikacja wskazuje brakujące dane i nierozpoznane odwołania. Brakująca wartość
nie jest zastępowana zgadywaną treścią. Wiersz opróżniony przez brakujące dane
jest pomijany; celowo wstawione puste wiersze zachowują odstęp. Własne etykiety
i separatory użytkownika pozostają. Eksport mimo braków wymaga potwierdzenia.

Komentarz Helicon można wykorzystać w całości, jako czytelnie sformatowany opis
stacku albo jako samą liczbę zdjęć. Rozpoznawanie dotyczy ustalonego formatu
komentarza, nie dowolnego opisu stackowania ani wszystkich programów.

### Wygląd i rozmieszczenie

Każdy blok tekstowy ma własny font, grubość, rozmiar, kolor, przezroczystość,
interlinię i wyrównanie. W obecnym zakresie styl obowiązuje cały blok;
różny wygląd treści uzyskuje się przez osobne bloki. Dostępne są Montserrat
i Advercase, odmiany Regular i Bold.

Wspólna jednostka pozwala określać rozmiary w pikselach albo względem krótszego
lub dłuższego boku zdjęcia, również z wartościami ułamkowymi. Rozmiary względne
pomagają zachować proporcje podpisów na zdjęciach o różnej rozdzielczości.
Zmiana jednostki zachowuje wygląd na aktualnym zdjęciu.

Blok można zakotwiczyć w jednym z dziewięciu miejsc względem wspólnych marginesów
albo ustawić ręcznie, także przeciągając go po zdjęciu. Pozycja ręczna jest
względna wobec rozmiarów całego zdjęcia i nie zależy od marginesów. Ostatni
anchor wyznacza punkt odniesienia bloku, co ma znaczenie przy zmianie jego treści.

Podgląd odzwierciedla zmiany treści, stylu i położenia. Oznaczenia wyboru,
podpowiedzi i zaślepki pustych bloków służą wyłącznie edycji i nie trafiają
do gotowego zdjęcia. Bloki mogą się nakładać i wychodzić poza kadr;
obecnie aplikacja nie dopasowuje automatycznie długiej treści.

### Ikony i logo

Ikony wewnątrz podpisu zachowują proporcje i przyjmują rozmiar, kolor oraz
przezroczystość tekstu. Użytkownik może korzystać z dostępnych ikon lub dodać
własną grafikę SVG i nadać jej nazwę.

Samodzielne logo jest osobnym blokiem. Można zmieniać jego rozmiar z zachowaniem
proporcji, przezroczystość i pozycję, zachować oryginalne kolory albo nadać jeden
kolor. Wymiana grafiki zachowuje ustawienia bloku. Aplikacja przyjmuje samodzielne
SVG spełniające ograniczenia importu; nie każdy dowolny plik SVG jest obsługiwany.

### Presety i ponowne wykorzystanie

Preset zapisuje cały układ: bloki, odwołania do metadanych, tekst stały, style,
pozycje, marginesy, jednostkę oraz użyte ikony i logo. Nie zapisuje zdjęcia,
konkretnych wartości jego metadanych ani jakości JPG.

Użytkownik może zastosować preset na aktualnym zdjęciu, utworzyć własny,
zaktualizować go, zapisać kopię, zmienić nazwę i usunąć. Zmiany wymagają jawnego
zapisu. Presety wbudowane stanowią punkt wyjścia do własnych kopii.

Własne presety pozostają w tej samej przeglądarce i pod tym samym adresem
aplikacji. Można je przenieść lub zabezpieczyć przez eksport do pliku, a następnie
zaimportować. Grafiki nie wymagają osobnego przenoszenia. Błędny import nie
zastępuje bieżącego układu. Niezapisana sesja i zdjęcie nie wracają po odświeżeniu.

### Eksport

Użytkownik pobiera nowy JPG z podpisami i grafiką utrwalonymi w obrazie.
Wynik zachowuje wymiary prawidłowo zorientowanego zdjęcia. Użytkownik wybiera
jakość, widzi rzeczywisty rozmiar przygotowanego pliku oraz informację, jeżeli
wynik jest większy od wejścia. Podgląd i eksport mają odpowiadać sobie pod
względem treści, stylu i geometrii.

Obecny eksport ponownie kompresuje JPG i nie przenosi źródłowych metadanych
ani profilu ICC. Sprawdzenie kolorów obejmuje dostarczone zdjęcia sRGB;
obsługa pozostałych profili nie jest potwierdzona.

### Charakter produktu

Aplikacja ma angielski interfejs i służy przede wszystkim fotografowi pracującemu
na komputerze, z macOS jako główną platformą użytkownika. Obecny przepływ działa
lokalnie w przeglądarce i nie wymaga konta. Nie ustalono integracji uruchamianej
bezpośrednio z Lightroom, synchronizacji chmurowej ani pełnej edycji zdjęć.

## 4. Co pozostaje poza obecnym zakresem

Zapisane potrzeby przyszłe: wiele zdjęć i możliwa aplikacja desktopowa.
Nie są to zaległości w zaakceptowanym zakresie MVP.

Odłożone możliwości: zoom i przesuwanie podglądu, linijki, formatowanie fragmentów
tekstu oraz dziedziczenie stylów. Pływający pasek edycji na zdjęciu wymaga osobnej
decyzji. Ich brak nie oznacza automatycznej zgody na dodanie.

Inne obecne ograniczenia, dla których nie ma zatwierdzonego rozszerzenia zakresu:
brak automatycznego zawijania i zmniejszania podpisu, przywracania niezapisanej
pracy, sterowania kolejnością nakładania bloków oraz dodatkowych formatów zdjęć
i eksportu. Nie ustalono też pełnego zarządzania kolorami i zachowywania metadanych
wyniku. Lokalny zapis presetów nie stanowi synchronizacji ani kopii zapasowej.

## 5. Decyzje potrzebne do pełnego zakresu docelowego

1. **Wiele zdjęć:** czy docelowy produkt ma pozostać edytorem pojedynczego zdjęcia,
   czy obejmować zestaw z przeglądaniem, wspólnym presetem i zbiorczym eksportem?
   Jeżeli zestaw: czy dopuszczamy osobne poprawki układu dla każdego zdjęcia?
2. **Granice obróbki:** czy tylko nakładanie treści, czy również ramki/dodawanie
   przestrzeni wokół zdjęcia, zmiana rozmiaru wyniku lub inne funkcje LR/Mogrify?
   Takiej listy nie zapisano w pierwotnych ustaleniach.
3. **Kontener:** czy wystarcza jednolity styl i blok dopasowany do treści, czy
   potrzebny jest obszar o zadanych wymiarach, zawijanie, pionowe wyrównanie
   i różne style wewnątrz jednej treści?
4. **Braki i przepełnienia:** czy pozostawić ostrzeżenie i kontrolę użytkownika,
   czy wprowadzić warunkowe etykiety/całe bloki, własne wartości zastępcze
   oraz automatyczne dopasowanie treści?
5. **Plik wynikowy:** czy JPG o oryginalnych wymiarach wystarcza? Czy użytkownik
   ma wybierać zachowanie metadanych, w szczególności autora, copyright i GPS,
   oraz wymagać obsługi profili innych niż sRGB?
6. **Trwałość pracy:** czy wystarczają lokalne presety z eksportem, czy potrzebny
   jest automatyczny powrót do ostatniej sesji lub zapis edytowalnego projektu?
7. **Forma aplikacji:** czy przeglądarka jest rozwiązaniem docelowym, czy wersja
   desktopowa i współpraca z Lightroom mają wejść do pełnego opisu produktu?

Najpierw należy rozstrzygnąć punkty 1–3, które najbardziej zmieniają charakter
produktu. Pozostałe można doprecyzować na ich podstawie. Odpowiedzi mają określić
zachowanie aplikacji, bez wybierania technologii i rozmieszczenia kontrolek.

## 6. Rozbieżności w istniejącej dokumentacji

- PRODUCT_PLAN.md zawiera zarówno aktualną tabelę etapów, jak i starsze akapity
  o jednym bloku, braku presetów, textarea i parserze Helicon poza MVP. Są to
  historyczne stany, które bez wyraźnego oznaczenia dają sprzeczny obraz produktu.
- README.md wymienia obecne funkcje, ale zachowuje starszy opis statusu,
  nieaktualne liczby testów i zapowiedzi późniejszego zapisu SVG.
- DESIGN_SYSTEM.md kumuluje kolejne warianty interfejsu; starsze informacje
  o panelach, grupach ustawień i braku rozpoznawania Helicon zostały zastąpione
  późniejszymi zmianami.
- CAPTION_TAGS.md opisuje ISO bez prefiksu, podczas gdy aktualny kod helpera
  zwraca również „ISO”. Stary opis pomijania wszystkich pustych wierszy jest
  zbyt szeroki: celowe odstępy są zachowywane.
- MVP_VERIFICATION.md jest raportem historycznego sprawdzenia. Nie zastępuje
  ponownej weryfikacji późniejszych zmian ani decyzji użytkownika o akceptacji.

Źródła analizy: PRODUCT_PLAN.md, README.md, DESIGN_SYSTEM.md, CAPTION_TAGS.md,
MVP_VERIFICATION.md oraz aktualne modele dokumentu, kontenerów, presetów,
helperów Helicon, edytora, importu i eksportu w katalogu src.
