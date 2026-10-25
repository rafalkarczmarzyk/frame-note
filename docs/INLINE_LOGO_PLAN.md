# Refaktor logo — wspólna treść kontenera

Aktualizacja: 25 października 2026, na podstawie kodu po commicie `9c5c73d`.
Status: etap 1 oceniony przez użytkownika; etap 2 wdrożony do oceny. Etap 3
wymaga osobnego polecenia, podobnie jak commit.

## Cel i ustalenia

Użytkownik chce jednego sposobu edycji każdego kontenera. Logo ma być elementem
treści obok tekstu, tagów i ikon, z możliwością dowolnego mieszania ich kolejności
oraz nowych wierszy. Samo logo również mieści się w zwykłym kontenerze.

To zastępuje wcześniejszy kierunek osobnych kontenerów logo. Szczegóły poniżej
są propozycją, nie zaakceptowanymi decyzjami użytkownika.

Użytkownik wskazał również potrzebę logo rastrowego: fotograf nie musi posiadać
wersji wektorowej. Proponowany zakres importu logo obejmuje SVG oraz PNG
z zachowaniem przezroczystości. Pozostałe formaty nie są obecnie proponowane.

## Aktualny punkt wyjścia

- Tiptap przechowuje tekstową templatkę z atomowymi tokenami; konwersja dokumentu
  obsługuje obecnie tylko tekst i nazwę tokenu, bez ustawień jego wystąpienia.
- Ikony inline dziedziczą font-size, kolor i opacity. Ich układ zakłada wysokość
  grafiki równą rozmiarowi fontu oraz stałą wysokość wiersza.
- Logo nadal jest opcjonalnym polem `Caption.logo`, z własnym SVG, szerokością
  w jednostce dokumentu i trybem koloru. Ma osobne kontrolki i geometrię.
- Presety w wersji 1 zapisują ikony i osobne logo. Migracji wymagają zarówno
  presety lokalne, jak i importowane pliki.
- Aktualny sidebar: Photo → Presets → Sizing & Margins → Containers → inspektor
  wybranego kontenera → Export. Tekst ma kompaktowe grupy Content, Typography
  i Position; logo nadal korzysta z osobnej ścieżki.
- Marginesy są globalne; kompaktowy edytor i interaktywne linijki współdzielą
  ich stan. Anchor / Manual oraz przeciąganie odnoszą się do całego kontenera.
- Wspólny Tooltip jest odłożony w NICE_TO_HAVE.md i nie jest częścią refaktoru.

## Proponowane zachowanie

1. Containers oferuje tylko Add container. Inspektor ma nagłówek Container.
2. Content pozwala wstawiać Tags, Icons i Logos w zapamiętanym miejscu kursora
   lub zamiast zaznaczenia. Panel Logos korzysta z obecnego panelu bocznego.
3. Logo jest elementem atomowym: wybór, usuwanie, przeciąganie w treści,
   kopiowanie, wklejanie oraz undo/redo działają jak dla pozostałych elementów.
4. Ustawienia wybranego logo pojawiają się przy Content. Typography nadal
   steruje tekstem i ikonami; Position steruje całym kontenerem.
5. Logo zachowuje proporcje. Proponowane tryby rozmiaru: wysokość względem fontu
   (domyślnie 1×) albo własny wymiar w jednostce dokumentu. Oryginalne kolory
   lub jeden kolor ustawia się dla wystąpienia SVG; PNG domyślnie zachowuje
   oryginalne kolory i przezroczystość. Opacity kontenera obejmuje całość.
6. Ten sam zasób można wstawić wiele razy, z niezależnymi ustawieniami.
   Wymiana grafiki jednego wystąpienia nie powinna zmieniać pozostałych.
7. Większe logo powiększa wiersz. Propozycja: pionowe wyrównanie elementów do
   środka, interlinia jako odstęp wynikający z typografii, bez nakładania wierszy.
   Kontener z samym logo ma obrys grafiki, bez pustej przestrzeni od fontu.
8. Zmiana jednostki przelicza własne wymiary logo z zachowaniem geometrii;
   rozmiar względem fontu pozostaje mnożnikiem. Linijki nadal edytują marginesy.

## Model i zgodność

Oddzielić zasoby graficzne od wystąpień w treści. Zasób ma stabilny identyfikator,
nazwę, typ SVG/PNG i zwalidowaną zawartość. PNG przechowuje również wymiary
pikselowe; proporcje obu formatów wynikają ze źródła. Wystąpienie przechowuje
odwołanie, rozmiar i odpowiednie dla formatu ustawienia koloru.
Nie wiązać ustawień wyłącznie z nazwą zasobu ani indeksem tokenu w tekście.

PNG korzysta z tego samego wstawiania, zaznaczania, skalowania i pozycjonowania
co SVG. Przezroczystość źródła zachować aż do kompozycji ze zdjęciem w JPG.
Przezroczyste obrzeża pozostają częścią wymiarów pliku; nie przycinać ich
automatycznie. Przy powiększeniu ponad rozdzielczość źródłową proponowane jest
nieblokujące oznaczenie możliwej utraty ostrości, liczone dla eksportu,
nie dla skali podglądu.

Import PNG wymaga sprawdzenia rzeczywistego formatu, poprawnego dekodowania,
wymiarów oraz limitów bajtów i liczby pikseli przed kosztownym przetwarzaniem.
Konkretne limity ustalić przed implementacją. Błąd pozostawia poprzednią grafikę.
Preset ma zawierać dane PNG, bez zależności od ścieżki pliku lub adresu Blob.
Obecny limit presetu 5 MB należy ponownie ocenić z uwzględnieniem danych
rastrowych i narzutu ich zapisu w JSON oraz pojemności lokalnego magazynu.

Przed implementacją wybrać zapis treści: strukturalny dokument domenowy lub
rozszerzoną składnię templatki. Sam zapis `{logo:nazwa}` nie wystarczy do
zachowania różnych ustawień dwóch wystąpień. Czytelny tekst schowka można
zachować, ale kopiowanie wewnątrz aplikacji powinno przenosić również ustawienia
i zasoby. Samodzielnie wklejony token bez zasobu musi być oznaczony jako brakujący.

Nowy format presetów powinien mieć wersję 2. Odczyt wersji 1 migruje osobne logo
do jednego elementu treści i zachowuje wymiary, kolory, opacity, kolejność,
anchor i Manual. Wysokość wiersza nie może przesunąć starego logo. Nazwy plików
nie mogą powodować kolizji zasobów. Zachować istniejącą walidację SVG i limity;
nowe limity struktury treści określić wraz z modelem.

## Etapy i kryteria oceny

### 1. Uzgodnienie modelu i przykładów

Status implementacji: przygotowany izolowany prototyp do oceny w Storybooku,
Screens/InlineLogoPrototype (Mixed, BetweenTags, OwnLine, LogoOnly,
LightBackground). Przykładowe SVG i PNG można wstawiać, zaznaczać, wymieniać
i skalować względem fontu lub w px. To próba interakcji; nie implementuje importu,
migracji presetów ani docelowej serializacji. Tryby koloru i jednostki względne
wobec zdjęcia pozostają do uzgodnienia i następnego etapu.

Rozstrzygnąć otwarte decyzje poniżej; przygotować izolowane stories wspólnego
Content z logo obok tekstu, między tagami, w osobnym wierszu oraz jako jedyną
treścią. Zaprezentować ustawienia zaznaczonego logo w kompaktowym inspektorze.
Przykłady obejmują SVG i PNG z przezroczystością na jasnym i ciemnym tle.
Wynik: ocena sposobu edycji przed wymianą obecnej ścieżki w aplikacji.

### 2. Treść, geometria i presety

Status: wdrożony do oceny. Produkcyjny Content udostępnia Add image (SVG/PNG),
ustawienia wybranego obrazu, wymianę i usuwanie. Przykład z rzeczywistym zdjęciem:
Screens/TestPhotos/MixedImages, z FrameNote SVG oraz dostarczonym rt.png.
Typography i Position korzystają z dotychczasowych kontrolek aplikacji.
Po korekcie użytkownika usunięto Add logo z Containers oraz osobny inspektor
logo. Wszystkie kontenery korzystają ze wspólnego edytora i nagłówka Container.

Przyjęty zapis wystąpienia: `{image:id:height:font|document:original|single}`.
Pliki są oddzielone od wystąpień i zapisane raz w obrębie kontenera. Ustawienia
wystąpienia przechodzą przez historię edytora oraz schowek. Schowek ma czytelny
zapis tokenów i dodatkową reprezentację FrameNote z dołączonymi zasobami.
Presety zapisują wersję 2; odczyt wersji 1 migruje osobne logo. Klucz lokalnego
magazynu pozostaje ten sam, żeby zachować dostęp do zapisanych presetów.

Limity: PNG do 2 MB, 32 MP i 16384 px na bok; SVG zachowuje dotychczasowy limit
256 KB i walidację. Do 100 zasobów na kontener, preset do 5 MB również przy
zapisie/eksporcie. Przekroczenie pojemności localStorage jest raportowane.
Oryginalne pliki testowe pozostają bez przycinania i zmiany rozdzielczości.

Wdrożyć uzgodniony model, serializację, schowek, undo/redo, zasoby, wspólny układ
podglądu/JPG oraz migrację presetów. Testy domenowe obejmują różne wysokości
wierszy, wiele wystąpień, brakujące zasoby, konwersję jednostek i migrację.
Zweryfikować walidację PNG, zachowanie kanału alfa, ponowne użycie jednego zasobu
bez powielania danych oraz zapis/import presetu zawierającego oba formaty.
Wynik: działające mieszane kontenery do oceny; stare presety zachowują wygląd.

### 3. Integracja i zamknięcie refaktoru

Włączyć wspólny inspektor w aplikacji; usunąć Add logo z Containers oraz osobne
kontrolki i ścieżki renderowania logo po zastąpieniu ich wspólnym mechanizmem.
Sprawdzić wybór i przeciąganie całego bloku, obrys, Anchor / Manual, marginesy,
preset po odświeżeniu oraz piksele JPG dla zdjęcia poziomego i pionowego.
Sprawdzić również przezroczyste krawędzie PNG i skalowanie w eksporcie.
Uaktualnić dokumentację i stories. Wykonać pnpm check, build Storybooka oraz
odpowiednie E2E Chromium/WebKit, bez automatycznej regeneracji wzorców eksportu.

Każdy etap kończy się oceną użytkownika i poprawkami. Przejście dalej oraz commit
wymagają osobnego polecenia.

## Ustalenia z oceny prototypu i rozwiązania etapu 2

- Relative to font: krok 0,25×. Fixed height używa jednostki dokumentu:
  krok 1 px lub 0,1 w jednostkach procentowych.
- Pole Image height pokazuje jednostkę i strzałki; wybrana grafika pozostaje
  zaznaczona podczas edycji formularza na jaśniejszej powierzchni.
- SVG: oryginalne kolory albo kolor kontenera. PNG: oryginalne kolory i alfa.
- Większy obraz rozszerza wysokość wiersza; mieszane elementy są środkowane.
  Sam obraz ma geometrię bez dodatkowej przestrzeni wynikającej z fontu.
- Fixed height przelicza się wraz ze zmianą jednostki dokumentu bez zmiany
  wyglądu na bieżącym zdjęciu. Powiększanie PNG ponad rozdzielczość źródła
  pokazuje nieblokującą informację.
- Jasne warianty prototypu nie są wzorcem interfejsu aplikacji.

Poza tym refaktorem pozostają różne style fragmentów tekstu, automatyczne
zawijanie i zmniejszanie treści oraz pływający pasek edycji na zdjęciu.
