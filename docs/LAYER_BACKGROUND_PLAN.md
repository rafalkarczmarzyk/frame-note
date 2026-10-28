# Tła warstw — plan implementacji

Aktualizacja: 2026-10-28. Dokument zbiera ustalenia z rozmowy i propozycję
kolejności prac. Nie jest poleceniem implementacji wszystkich etapów.
Każdy etap wymaga oceny użytkownika i potwierdzenia przejścia dalej.
Commit wyłącznie na polecenie użytkownika.

## Cel i stan

Dodać tło całego bloku treści warstwy: tekstu, metadanych i grafik inline.
Wielowierszowa treść ma jedno prostokątne tło dopasowane do obrysu całego bloku.

Interaktywna propozycja istnieje w Storybooku: Screens/LayerBackground,
stories None, Color i Glass. Jest prototypem CSS, nie implementacją renderowania
teł w podglądzie canvasowym ani w JPG. Obecny prototyp trzeba jeszcze dopasować
do opisanej poniżej zasady stabilnej pozycji treści.
Wspólny MarginEditor obsługuje etykiety paddingu. W aplikacji poprawiono już
zagnieżdżenie inspektora, aby Layers zwijało także ustawienia zaznaczonej warstwy.
Zmiany pozostają bez commita.

## Warianty i ustawienia

- **None:** obecny wygląd samej treści; ustawienia pozostałych wariantów zachowane,
  ale padding i efekty tła nie wpływają na wynik.
- **Color:** kolor podstawy, niezależne opacity tła, padding i corner radius.
- **Glass:** kolor podstawy (szybkie kolory, paleta, własny HEX), opacity podstawy,
  regulowane rozmycie podłoża, padding i corner radius. Materiał ma wyraźne
  refleksy, jasne krawędzie, wewnętrzne cieniowanie i głębię nawiązującą do
  tooltipów i szklanych kontrolek. Sam blur z przezroczystym wypełnieniem
  nie spełnia oczekiwania. Kolor i opacity podstawy nie wygaszają automatycznie
  refleksów i cieniowania materiału.
- **Drop shadow dla Color:** opcjonalny cień z kolorem (szybkie kolory, paleta,
  HEX), opacity, blur, spread i przesunięciem X/Y. Glass zachowuje własne
  cieniowanie materiału; dodatkowy regulowany drop shadow dla Glass nie został
  osobno uzgodniony.

Opacity treści pozostaje niezależne od opacity podstawy i cienia.
Padding ma cztery wartości i tryby Individual / Paired / Linked. Wykorzystujemy
istniejący MarginEditor z etykietami Padding i resetem do zera, bez kopii kontrolki.
Padding, radius, blur, spread i przesunięcia cienia korzystają z jednostki
wymiarowania dokumentu; opacity pozostaje procentem. Zmiana jednostki przelicza
te wymiary z zachowaniem wyglądu na bieżącym zdjęciu.

## Geometria — stabilna pozycja treści

Przyjmujemy kierunek z ostatniej rozmowy: marginesy dokumentu nadal pozycjonują
blok treści. Dodanie tła i zmiana paddingu nie przesuwają tekstu ani grafik inline.
Tło rośnie na zewnątrz obrysu treści o padding każdej strony.
Przykład: tekst 30 px od lewej krawędzi, padding left 12 px — tekst pozostaje
na 30 px, a tło zaczyna się na 18 px.

- Anchory nadal odnoszą się do bloku treści wewnątrz marginesów dokumentu.
- Manual zachowuje dotychczasowy punkt odniesienia treści i współrzędne X/Y;
  globalne marginesy nadal nie sterują tym trybem.
- None ignoruje padding w geometrii, zachowując jego zapisane wartości.
- Tło i cień mogą wejść w marginesy lub wyjść poza zdjęcie. Wynik przycina się
  na krawędzi zdjęcia, bez automatycznego przesuwania czy zmniejszania treści.
- Obszar wyboru i przeciągania obejmuje treść i tło z paddingiem; cień nie
  powiększa obszaru interakcji. Oddzielić obrys interakcji od punktu pozycjonowania.
- Promień narożników ograniczamy w renderowaniu do połowy mniejszego wymiaru tła.
- Pusta warstwa i warstwa bez widocznej treści po rozwiązaniu brakujących
  metadanych nie rysują tła. Placeholder edytora nie jest treścią eksportu.

## Interfejs

Background należy do jaśniejszej sekcji aktualnie zaznaczonej warstwy.
Używamy zwykłej grupy inspektora, bez kolejnego accordiona.
None pokazuje tylko przełącznik typu; pozostałe ustawienia są warunkowe.
Glass pokazuje Base color oraz czytelną regulację Blur (suwak i pole liczbowe).
Drop shadow ujawnia kontrolki po włączeniu przełącznika.
Layers zwija jednocześnie listę i cały inspektor aktywnej warstwy.
Kontrolki korzystają z istniejącego design systemu, tooltipów i pickerów.

## Renderowanie i eksport

Podgląd i JPG mają używać wspólnej geometrii oraz implementacji materiału.
CSS ze Storybooka jest referencją wizualną; nie przenosi się automatycznie do JPG.

Dla Glass składamy efekt w kolejności:

1. Pobieramy fragment kompozycji poniżej bieżącej warstwy: zdjęcie oraz widoczne
   niższe warstwy, z zapasem pikseli wokół obszaru potrzebnym do rozmycia.
2. Rozmywamy fragment i przycinamy efekt do zaokrąglonego tła.
3. Nakładamy kolor podstawy z jego opacity.
4. Rysujemy refleksy, krawędzie i cieniowanie materiału.
5. Rysujemy ostrą treść zgodnie z jej dotychczasowym opacity.

Ramki zaznaczenia, uchwyty i inne elementy edytora nie trafiają do podłoża szkła
ani do eksportu. Nakładające się szkła uwzględniają kolejność warstw.
Zmiana niższej warstwy unieważnia wynik zależnych szklanych warstw powyżej.
Przeliczamy potrzebne fragmenty zamiast rozmywać osobno całe zdjęcie dla każdej
warstwy. Uwzględniamy zwalnianie buforów i koszt pamięci przy dużych zdjęciach.
Filtr Konva wymaga próby zgodności w Chromium i WebKit, także dla różnych skal
podglądu, promieni blur i eksportu w pełnej rozdzielczości.

### Przeciąganie — opcja do oceny po pomiarach

Najpierw mierzymy płynność pełnego efektu. Jeśli jest niewystarczająca, podczas
przeciągania można wyłączyć samo rozmycie, zachowując podstawę, opacity,
cieniowanie, treść i wymiary. Po upuszczeniu przeliczamy rozmycie dla nowej
pozycji; anulowanie przywraca wynik w poprzedniej pozycji.
Nie jest to jeszcze obowiązkowe zachowanie. Eksport zawsze zawiera pełny efekt
niezależnie od uproszczeń interakcyjnego podglądu.

## Proponowane etapy

1. **Próba canvasowa Glass.** Odtworzenie materiału 3D, koloru podstawy i blur
   na rzeczywistym zdjęciu, z eksportem JPG; porównanie Chromium/WebKit,
   krawędzi i kosztu dużej rozdzielczości. Ocena wyglądu przed docelową integracją.
2. **Model i geometria None / Color.** Typy, domyślne wartości, walidacja,
   padding, radius, jednostki i stabilna pozycja treści. Zapis w presetach,
   duplikowanie i zachowanie ustawień przy przełączaniu wariantów.
   Ustalenie zachowania pustej treści.
3. **Integracja Color i Drop shadow.** Inspektor aktywnej warstwy, wspólny edytor
   paddingu, kolor i parametry cienia, wybór i przeciąganie rozszerzonego obrysu,
   wspólny podgląd i eksport. Ocena wygody długiej sekcji.
4. **Integracja Glass.** Pełne składanie niższych warstw, cache i unieważnianie,
   wszystkie kontrolki, presety, podgląd i eksport. Decyzja o uproszczeniu podczas
   przeciągania na podstawie pomiarów.
5. **Weryfikacja końcowa.** Jasne i ciemne zdjęcia, pion/poziom, skraje obrazu,
   różne jednostki, duże pliki, kilka szkieł, ukrywanie i kolejność warstw,
   batch oraz zgodność podglądu z JPG. Ocena użytkownika.

Testy domenowe obejmują geometrię i walidację, a mały zestaw testów przeglądarkowych
przepływ oraz piksele eksportu. Dotychczasowe układy None muszą zachować wygląd.
Nie aktualizujemy istniejących wzorców eksportu bez wyjaśnienia zmiany.
Format presetów pozostaje rozwojowy zgodnie z NTH-002; nie rozszerzamy zakresu
na system migracji. Przed oddaniem etapów: pnpm check; dla UI build Storybooka,
a dla renderowania i przepływu odpowiednie testy E2E.

## Etap 1 — wykonana próba canvasowa (do oceny)

Storybook: **Screens/LayerBackground/CanvasTrial** → Glass, Overlap, PhotoEdge.
Próba ma faktyczny renderer pikselowy: rozmycie fragmentu kompozycji filtrem
Konva, kolor podstawy i opacity, gradient refleksu, krawędzie materiału oraz
cień. Treść rysowana jest po efekcie. Padding rośnie na zewnątrz bez zmiany
pozycji treści. Kolejne panele pobierają także wcześniejsze szkło i jego tekst.

Przycisk Export trial JPG koduje ten sam canvas, który pokazuje podgląd;
Compare encoded JPG pozwala obejrzeć zakodowany wynik. Jest przełącznik pełnej
rozdzielczości zdjęcia, dwa zdjęcia (w tym jasne), nakładanie paneli i pomiar czasu.
Próba nie jest jeszcze zintegrowana z modelem warstw, presetami ani głównym
eksportem aplikacji. Nie ma przeciągania, docelowego cache ani nasycenia z CSS;
materiał jest przybliżeniem referencji, wymagającym oceny wizualnej.

Wstępne pojedyncze pomiary dla 5964 × 3976 px: Chromium około 60 ms renderowania

- 184 ms kodowania, WebKit około 72 ms + 198 ms. Nie obejmują dekodowania zdjęcia,
  fontów ani serii przeciągnięć. Nie są pomiarem pamięci ani gwarancją wydajności.
  Nie podejmujemy jeszcze decyzji o wyłączaniu blur podczas przeciągania.

Weryfikacja: pnpm check (320 testów jednostkowych), build Storybooka;
osobny zestaw przeglądarkowy uruchamia się przez `pnpm test:glass-trial`.
Sprawdza zgodność wymiarów i pikseli JPG z podglądem (z tolerancją strat JPG),
regulację efektu, nakładanie i przycięcie paneli, a także renderowanie pełnej
rozdzielczości w Chromium/WebKit. Pomiary są wyświetlane w UI i logu testu.
Kontynuacja od etapu 2 wymaga potwierdzenia użytkownika. Bez commita.

### Etap 2 — model i geometria

Wdrożone: opcjonalne ustawienia tła, walidacja presetów, przeliczanie wszystkich
wymiarów i niezależne duplikowanie. None zachowuje ustawienia. Padding
rozszerza wyłącznie obrys dekoracji; pusta treść nie zostawia panelu.
Użytkownik zlecił kontynuowanie kolejnych etapów po szybkiej weryfikacji i commicie.

### Etap 3 — Color i Drop shadow

Kontrolki w jaśniejszej sekcji warstwy; None ograniczone do wyboru typu.
Kolor, opacity, wspólny MarginEditor dla paddingu, radius i cień z kolorem,
opacity, blur, spread i przesunięciami działają w podglądzie i JPG.
Obrys wyboru obejmuje padding, punkt pozycjonowania pozostaje przy treści.
Edycja paddingu nie podświetla linijek marginesów dokumentu.
