# Metadane fotograficzne — audyt i plan rozszerzenia

Data: 2026-10-25. Status: implementacja etapowa rozpoczęta na polecenie użytkownika.

Rekomendacja: rozszerzyć obecną ścieżkę ExifReader → MetadataField → captionTags.
Nie potrzeba osobnego systemu helperów, bazy modeli sprzętu, pakietu domenowego
ani ExifTool w aplikacji. Potrzebne są walidacja zależna od semantyki pola,
deterministyczne reguły wyboru i zachowanie informacji, które obecnie giną
podczas ekstrakcji XMP. Sama rozbudowa list aliasów nie wystarczy.

## 1. Zakres i wiarygodność audytu

Przeczytano dokumenty wymagane przez AGENTS.md, CAPTION_TAGS.md,
MVP_VERIFICATION.md, kod importu, model metadanych, wszystkie helpery, resolver
szablonów, picker, granice presetów oraz związane testy. Zbadano zainstalowany
ExifReader **4.52.0**, zgodny z lockfile, w tym implementacje EXIF, XMP, PNG,
IPTC i MakerNotes. Nie zakładano zgodności nazw ExifTool z nazwami ExifReader.

Wykonano:

- `pnpm test`: **218/218 testów, 32 pliki — zaliczone**.
- Odczyt siedmiu istniejących JPG i przeliczenie helperów rzeczywistym kodem.
- Próby graniczne bieżących helperów oraz parsera na danych w pamięci.
- Syntetyczne PNG 1 × 1: bez metadanych, z eXIf, z XMP iTXt, z oboma oraz
  ze skompresowanym XMP iTXt. Blok eXIf pochodził z istniejącej próbki Canon;
  to test transportu metadanych, nie autentyczny eksport PNG z aparatu.

Nie uruchamiano ponownie E2E ani buildów; produkcja nie była zmieniana.
Nie pobierano zdjęć, nie dodawano binariów, nie zmieniano oryginałów ani
zależności. Jedyną zmianą repozytorium jest ten dokument. Nie wykonano commita.

Poniżej „potwierdzone” oznacza wynik inspekcji lub wykonanej próby.
Reguły docelowe i etapy są rekomendacjami, nie opisem działającego rozwiązania.

## 2. Potwierdzony stan repozytorium

| Obszar                     | Ocena                         | Ustalenie                                                                                                   |
| -------------------------- | ----------------------------- | ----------------------------------------------------------------------------------------------------------- |
| JPEG/JPG                   | Spełnione dla obecnej ścieżki | `load-photo.ts` sprawdza sygnaturę, czyta cały plik, używa `expanded: true, async: true`.                   |
| PNG jako zdjęcie           | Brak                          | Import odrzuca PNG; `Photo.mimeType` dopuszcza tylko JPEG; input wybiera JPG. PNG inline to inny przepływ.  |
| EXIF/XMP/IPTC              | Częściowe                     | Są czytane oddzielnie, ale reprezentacje XMP i szczegóły pochodzenia nie są w pełni zachowane.              |
| Normalizacja               | Częściowe                     | Istnieje `normalizeMetadata`, lecz to adapter do listy pól, nie normalizacja semantyki fotografii.          |
| Reguły konfliktów          | Częściowe                     | Stała lista źródeł; wygrywa pierwsza niepusta wartość, którą uda się sformatować.                           |
| Źródła helperów            | Częściowe                     | `sources` trafia do istniejącego `Source:`; brak pełnego namespace XMP i zależności typu SensitivityType.   |
| Zgodność szablonów         | Spełnione obecnie             | Helpery i `{group:name}` współistnieją. Presety zapisują szablony, nie wartości zdjęcia.                    |
| Braki danych               | Spełnione obecnie             | Pusta wartość, lista braków i obecna obsługa eksportu; bez domyślnych parametrów ekspozycji.                |
| Wspólne exposure           | Spełnione                     | Składa wyniki shutter/aperture/iso wraz ze źródłami, bez ponownej ekstrakcji.                               |
| Nazwy sprzętu              | Zasadniczo spełnione          | Model i obiektyw pozostają tekstem źródła; kod przycina zewnętrzne spacje. Brak bazy nazw i dodawania Make. |
| Rzeczywista ogniskowa      | Spełnione                     | Helper korzysta tylko z FocalLength, nie ekwiwalentu 35 mm.                                                 |
| APEX                       | Brak                          | ShutterSpeedValue i ApertureValue nie uczestniczą w helperach.                                              |
| ISO                        | Częściowe                     | Są podstawowe aliasy; brak SensitivityType, SOS, REI, ISOSpeed i obsługi wartości granicznej.               |
| Data                       | Częściowe                     | Zachowuje zapisany dzień, ale nie waliduje kalendarza i ma niepoprawną nazwę fallbacku IPTC.                |
| Helicon                    | Spełnione, zamrożone          | Dwa helpery mają osobny parser i testy; ich reguł nie zmieniamy.                                            |
| Wiele marek i edytorów     | Niezweryfikowane              | Zestaw realnych próbek jest zdominowany przez Canon i Lightroom.                                            |
| Wspólna domena web/desktop | Dobra podstawa                | Helpery i modele są bez React/DOM. `loadPhoto` łączy ekstrakcję z przeglądarkowym dekodowaniem.             |

Główne miejsca w kodzie:

- `src/features/photo/load-photo.ts:11`: import, parser, dekodowanie, limity.
- `src/features/photo/metadata.ts:3`: adapter i zachowanie `rawValue`.
- `src/domain/metadata.ts`: tożsamość `{group:name}` i model pola.
- `src/domain/caption-tags.ts:7`: definicje; `:40`: liczby; `:105`: wybór;
  `:133`: kompozycja exposure.
- `src/features/caption/template.ts`: braki, składnia i podstawianie.
- `src/features/caption/metadata-picker.tsx`: istniejące źródła w UI.
- `src/domain/document.ts:11`, `src/App.tsx:131`: ograniczenie do JPEG.
- `src/features/caption/render.ts:201`: nazwa eksportu usuwa wyłącznie jpg/jpeg.

### 2.1. Konkretne błędy i nieobsługiwane reprezentacje

1. **Tablica liczb zawsze może zostać uznana za ułamek.**
   Próba `ISOSpeedRatings.value = [100, 200]` zwróciła `ISO 0.5`.
   Typ/kontekst tagu musi odróżniać listę wartości od pojedynczego RATIONAL.
   To potwierdzony błąd na wejściu domenowym, nie dowód występowania takiej
   tablicy w obecnych zdjęciach Canon.
2. **ISO 65535 jest traktowane jako dokładna wartość.** Przy jednoczesnym
   `SensitivityType=3` i `ISOSpeed=102400` wynik nadal wynosi `ISO 65535`.
3. **APEX nie daje wyniku.** Same ShutterSpeedValue=7 i ApertureValue=6
   pozostawiają shutter/aperture puste. Oczekiwana konwersja: 1/128 s i f/8.
4. **Daty są sprawdzane wyrażeniem regularnym.** `2026:02:31 10:00:00`
   daje `2026-02-31`. Offset i ułamki sekund nie są modelowane; nie dochodzi
   natomiast do błędnej automatycznej konwersji na UTC.
5. **IPTC DateCreated nie odpowiada nazwie parsera.** ExifReader zwraca
   `iptc:Date Created` i `iptc:Time Created`; helper szuka `iptc:DateCreated`.
   Podstawowy fallback daty IPTC jest więc pominięty.
6. **Wynik zależy od opisów biblioteki.** Liczby najpierw korzystają z rawValue,
   ale mają fallback do description. Obiekty elementów RDF nie są rozpakowywane
   semantycznie. Np. pojedyncze ISO w RDF Seq działa przez opis tekstowy.
   Ułamki zapisane jako tekst nie obsługują znaku minus; to istotne dla APEX.
7. **Utrata namespace XMP następuje już w ExifReader.** Dwa pola
   `tiff:Model` i `custom:Model` trafiają pod jeden klucz `xmp.Model`.
   Próba wykazała zmianę zwycięzcy po odwróceniu kolejności elementów XML.
   `expanded: true` oddziela EXIF od XMP, ale nie rozwiązuje tego problemu.
8. **Adapter odrzuca surowy pakiet XMP.** `xmp._raw` jest tekstem, więc nie
   przechodzi warunku obiektu z `value`. Odrzucane są także dostępne atrybuty
   tagu na jego najwyższym poziomie. Wewnętrzne obiekty rawValue pozostają.
9. **Warianty językowe copyright są sklejane.** Próba RDF Alt z en-US i
   x-default dała opis `English rights, Default rights`; helper przejmuje go
   zamiast świadomie wybrać wersję językową.
10. **PNG wymaga kontroli wymiarów z właściwego nagłówka.** Próba zwróciła
    wymiary w `pngFile:Image Width/Height`; obecny importer szuka `file:*`.
    Nie wolno opierać limitu na rozmiarze ze starego EXIF w przeskalowanym PNG.

Nie ma w helperach warunków `Make === Canon`, whitelisty producentów ani
specjalnego przemianowywania sprzętu. Canonowe są przede wszystkim dane
walidacyjne i założenia o prostych reprezentacjach tagów. W samym ExifReader
obsługa MakerNotes jest ograniczona do Canon i części Pentax; nie ma równoważnych
dekoderów Sony, Nikon, Fujifilm, Panasonic czy Olympus/OM.

### 2.2. Co rzeczywiście pokrywają zdjęcia

Sześć JPG zawiera Make=Canon, modele EOS R6m2/EOS RP i oznaczenie Lightroom
Classic 15.6. Siódmy, Agata-104.jpg, ma XMP i CreatorTool Lightroom Classic 9.3,
ale brak odczytanego modelu oraz ekspozycji. Nazwa obiektywu nie upoważnia do
przypisania mu producenta aparatu. Helicon jest potwierdzony komentarzem stacku.

Nie ma realnych próbek pozostałych pięciu rodzin producentów, eksportów Capture
One i DxO ani potwierdzonego osobnego eksportu z aplikacji Photoshop. Ciąg
„Adobe Photoshop Lightroom Classic” nie jest dowodem przetwarzania w Photoshopie.
Obecne testy fixture sprawdzają sumy plików i komentarz Helicon; nie stanowią
pełnej macierzy oczekiwanych helperów każdego zdjęcia.

CAPTION_TAGS.md błędnie opisuje `{iso}` jako liczbę bez prefiksu. Kod i testy
zwracają `ISO 400`. Zachowujemy implementację, poprawiamy dokumentację.

## 3. Ocena ekstraktora i potrzebnych granic

**Zachować ExifReader 4.52.0 jako punkt wyjścia.** Potwierdzono odczyt zwykłych
EXIF/XMP w JPEG oraz eXIf i nieskompresowanego XMP iTXt w syntetycznym PNG.
Biblioteka rozpoznaje potrzebne standardowe tagi ISO i APEX. Ich nieużywanie
jest głównie ograniczeniem resolvera, nie powodem wymiany biblioteki.

**Nie spełnia jednak samodzielnie całego kontraktu.** Spłaszczenie namespace XMP
uniemożliwia wiarygodny wybór w kolizjach. Wymagane jest zachowanie dowodów
pochodzenia przed ich utratą. Rekomendacja: mały adapter odczytujący wyłącznie
potrzebne właściwości z zachowanego XML, z rozpoznaniem URI przestrzeni nazw,
RDF Seq/Bag/Alt oraz zapisu atrybutowego i elementowego. Prefiks XML może być
dowolny; sam napis `exif:` nie wystarcza. Nie pisać drugiego parsera EXIF/JPEG.

Jeśli publiczny wynik biblioteki nie zachowuje któregoś pakietu lub duplikatu,
nie da się go odzyskać w resolverze. Etap adaptera musi objąć standardowe i
rozszerzone XMP oraz konflikty pakietów. Ewentualny patch biblioteki należy
zaproponować na podstawie reprodukcji; bez automatycznej zamiany zależności.

Próba skompresowanego XMP iTXt nie zwróciła parametrów ekspozycji, nawet przy
`async: true`; kod ścieżki XMP pomija flagę kompresji. To ograniczenie odporności
na wariant pliku, nie dowód niespełnienia podstawowego sposobu osadzania XMP:
[specyfikacja PNG zaleca dla XMP iTXt bez kompresji](https://www.w3.org/TR/png-3/#11keywords).
Wsparcie wariantu skompresowanego wymaga świadomego zakresu i limitu dekompresji.

Proponowane granice, wewnątrz obecnego repozytorium:

1. `features/photo/extract-metadata.ts` — `ArrayBuffer → Promise<MetadataField[]>`;
   jedyne miejsce użycia ExifReader i adaptera XML. Bez React, File i dekodowania.
2. `domain/metadata.ts` — rozszerzenie istniejącego modelu o opcjonalne dowody
   pochodzenia: semantyczny identyfikator, URI XMP, typ/reprezentację wartości,
   źródło i ewentualne alternatywne wystąpienia. Zachować key/rawValue/displayValue
   dla istniejących oryginalnych tokenów. Kolizje można przechować jako dowody
   przy tym samym polu, bez drugiego globalnego magazynu metadanych.
3. `domain/metadata-values.ts` — małe funkcje walidacji liczb, tekstów i dat.
4. `domain/photographic-metadata.ts` — jedna czysta funkcja rozwiązująca dziesięć
   istniejących pól; wynik przechowuje wartość semantyczną, wybrane źródło
   i użyte dane pomocnicze. Żadnych obiektów DOM ani typów ExifReader.
5. `domain/caption-tags.ts` — obecne nazwy helperów, formatowanie i exposure;
   Helicon zachowuje istniejącą ścieżkę. UI i template używają tego samego API.

To podział odpowiedzialności, nie wymóg stworzenia osobnej klasy dla każdego
punktu. Funkcje walidacji można początkowo trzymać przy resolverze, jeśli plik
pozostanie czytelny. Brak potrzeby rejestru pluginów, DI, Rusta czy implementacji
Tauri teraz. Przyszły adapter desktopowy dostarcza ten sam model; reguły i testy
domeny pozostają wspólne. WebView może nadal używać obecnego ekstraktora.

## 4. Proponowane reguły rozwiązywania

Najpierw ustalić semantykę i poprawność kandydata, dopiero potem jego priorytet.
Nigdy nie wybierać według kolejności pól w obiekcie, marki ani programu eksportu.
EXIF nie jest nieomylny; jego pierwszeństwo dla równoważnych danych technicznych
to jawna polityka aplikacji. Bez historii edycji nie można ustalić, czy sprzeczne
XMP jest korektą autora. Nie używać daty modyfikacji jako arbitra.

Przy równym priorytecie najpierw porównać wartości znormalizowane. Tożsame wartości
mają stały wybór źródła. Sprzeczne duplikaty tej samej właściwości o jednakowej
wiarygodności odrzucić i próbować kolejnej kategorii; jeśli jej brak, brak danych.
To deterministyczne rozstrzygnięcie nie udaje wiedzy, której plik nie zawiera.

| Helper      | Rekomendowane źródła i reguły                                                                                                                                                                                                                                           |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| author      | `dc:creator` z XMP → EXIF Artist → IPTC By-line. Zachować kolejność wielu autorów. Nie używać CreatorTool, Software ani By-line Title. Dodać standardowy odpowiednik XMP tiff:Artist jako niższy fallback.                                                              |
| camera      | EXIF Model → XMP tiff:Model. Wymagany tekst modelu; nie dopisywać Make, nie zastępować brakującego modelu samą marką, nie używać UniqueCameraModel jako automatycznego zamiennika.                                                                                      |
| lens        | EXIF LensModel → XMP exifEX:LensModel → XMP aux:Lens → zweryfikowany tekst modelu z obsługiwanych MakerNotes. Nie używać LensID/LensType ani nie konstruować nazwy z LensSpecification.                                                                                 |
| shutter     | Poprawne EXIF ExposureTime → XMP exif:ExposureTime → EXIF ShutterSpeedValue → XMP exif:ShutterSpeedValue. Jawny czas ma pierwszeństwo przed APEX również pomiędzy EXIF/XMP.                                                                                             |
| aperture    | EXIF FNumber → XMP exif:FNumber → EXIF ApertureValue → XMP exif:ApertureValue. MaxApertureValue nie jest przysłoną zdjęcia.                                                                                                                                             |
| iso         | Osobna polityka opisana poniżej; standardowe spójne dane EXIF → standardowe spójne XMP → wyłącznie potwierdzona reprezentacja producenta.                                                                                                                               |
| focalLength | EXIF FocalLength → XMP exif:FocalLength. Pomijać FocalLengthIn35mmFormat, zwracane przez ExifReader FocalLengthIn35mmFilm i zakres ogniskowych obiektywu.                                                                                                               |
| date        | EXIF DateTimeOriginal → XMP exif:DateTimeOriginal → XMP photoshop:DateCreated → IPTC Date Created. Używać powiązanych offsetów/czasu wyłącznie z odpowiedniego źródła.                                                                                                  |
| copyright   | XMP dc:rights → EXIF Copyright → IPTC Copyright Notice; XMP tiff:Copyright jako dodatkowy standardowy fallback. Dla RDF Alt wybierać x-default, potem jedyną dostępną wersję; przy wielu pozostałych językach ustalić stały wybór, bez zależności od locale urządzenia. |
| exposure    | Składać już rozwiązane i sformatowane shutter, aperture, iso, w dotychczasowej kolejności i z ich źródłami.                                                                                                                                                             |

Dla tiff:Artist/tiff:Copyright rekomendowany priorytet jest po podstawowym
EXIF, przed IPTC. Przy wielu wariantach językowych bez x-default proponowany
remis rozstrzyga leksykograficzny kod języka, o ile każdy wariant jest poprawnym
tekstem; nie sklejać tłumaczeń. Nazw sprzętu nie normalizować typograficznie ani
marketingowo; dopuszczalne jest tylko dotychczasowe usunięcie zewnętrznych spacji
i technicznych terminatorów tekstu.

### 4.1. ISO: znaczenie, wartość graniczna i konflikty

Tag EXIF 0x8827 nazywał się ISOSpeedRatings, a później PhotographicSensitivity;
ExifReader nadal wystawia pierwszą nazwę. Oznacza czułość przy wykonaniu zdjęcia,
interpretowaną z SensitivityType. Wartość 65535 jest granicą pola SHORT i może
oznaczać wyższą czułość. Nie wolno jej przedstawiać automatycznie jako dokładnego
ISO. [CIPA, definicja PhotographicSensitivity](https://www.cipa.jp/std/documents/e/DC-008-2012_E_C.pdf).

SensitivityType wskazuje: 1=SOS, 2=REI, 3=ISO Speed, 4=SOS+REI,
5=SOS+ISO Speed, 6=REI+ISO Speed, 7=wszystkie; kombinacje opisują parametry
o jednakowej wartości. [CIPA, SensitivityType](https://www.cipa.jp/std/documents/e/CIPA_DC-X008-Translation-2016-E.pdf).

Proponowana polityka aplikacji:

- Akceptować dodatni całkowity skalar 0x8827 poniżej 65535 także bez
  SensitivityType lub z typem 0, aby zachować starsze poprawne zdjęcia.
- Dla 65535 odczytać pełną wartość SOS/REI/ISOSpeed wskazaną przez SensitivityType
  w tym samym zestawie źródłowym. Nie łączyć bez dowodu typu z EXIF z wartością XMP.
- Gdy głównego pola brak, pozwolić na jednoznaczny, poprawny odpowiednik wskazany
  przez SensitivityType. To tolerancja niepełnego eksportu, nie domyślna zamiana
  wszystkich tagów ISO na aliasy.
- Dla typów wielokrotnych porównać obecne wskazane wartości. Sprzeczność oznacza
  niespójny zestaw; spróbować innego wiarygodnego źródła, inaczej pozostawić brak.
  Nie wybierać największej, najmniejszej ani „najbardziej typowej” liczby.
- Gdy zwykłe pole i wskazany odpowiednik nie zgadzają się, również traktować
  zestaw jako niespójny. Nie porównywać jako konfliktu innych, niewskazanych
  parametrów ISO 12232, które mogą oznaczać coś innego.
- Przy braku typu nie zgadywać wyboru pomiędzy SOS, REI i ISOSpeed. Samotne
  takie pole bez wystarczającego kontekstu nie zastępuje ISO zdjęcia.
- XMP: rozpoznawać starsze exif:ISOSpeedRatings oraz exifEX:PhotographicSensitivity,
  SensitivityType i trzy powiązane pola po URI i nazwie właściwości. Starsze
  wieloelementowe listy z różnymi wartościami są niejednoznaczne; nie dzielić ich.
- Ogólne `ISO` akceptować tylko jako alias potwierdzony kontraktem adaptera,
  nie dowolny tag XMP o tej nazwie. Odrzucać Auto ISO, Base ISO, ExposureIndex
  i parametry latitude jako automatyczne zastępniki ISO zdjęcia.

Kolejność wyznacza wiarygodność zestawu, nie tylko nazwę tagu. Dla spójnych EXIF
i XMP z różnymi wartościami preferować EXIF. Gdy EXIF jest graniczne,
niejednoznaczne lub uszkodzone, preferować poprawne XMP. Zapisywać źródło liczby
oraz SensitivityType użyty do jej interpretacji. Reguły dotyczące niepełnych
zestawów i konserwatywnego odrzucania wymagają zatwierdzenia.

Nazwy i reprezentacje XMP można porównać z
[tabelami źródłowymi ExifTool](https://raw.githubusercontent.com/exiftool/exiftool/master/lib/Image/ExifTool/XMP.pm).
Wynik ExifTool nie jest gotową specyfikacją helpera: potrafi zawierać wartości
przeliczone i identyfikację obiektywu, której FrameNote nie ma wykonywać.

### 4.2. Liczby, APEX, daty i format

Parser wartości musi odróżniać skalar, jednoelementową listę i RATIONAL dzięki
typowi oraz znaczeniu tagu. Obsłużyć liczby, ścisły tekst liczbowy, ułamki tekstowe
ze znakiem, pary numerator/denominator i zagnieżdżone elementy RDF. Nie dodawać
formatów obiektowych niezweryfikowanych u ekstraktora. Odrzucać mianownik zero,
NaN/Infinity, pusty tekst, niejednoznaczne listy i niedopuszczalne dla pola wartości.
Nie ratować ewidentnie uszkodzonego rawValue zaokrąglonym opisem biblioteki.

APEX przeliczać dokładnie raz, z surowej wartości:

- `seconds = 2 ** (-ShutterSpeedValue)`; ujemny Tv jest poprawny dla długich czasów.
- `fNumber = 2 ** (ApertureValue / 2)`.

Wynik także musi być skończony i dodatni. Opis ExifReader może być już przeliczony;
nie podawać go ponownie do wzoru. Zachować aktualny format: `ISO 800`, `f/8`,
`1/100 s`, `100 mm`, `1/100 s · f/8 · ISO 800`. Dla APEX nie przyciągać wyniku
do tabeli standardowych nastaw aparatu: stosować dotychczasową precyzję formattera.
To zapobiega wymyślaniu np. 1/125 z danych oznaczających 1/128.

Datę rozłożyć na części i zweryfikować kalendarz, bez `new Date(text)` i bez
dopisywania Z. Zachować lokalne części czasu, jawny offset lub stan „brak offsetu”,
ułamki sekund i precyzję daty. Dla EXIF użyć OffsetTimeOriginal/SubSecTimeOriginal;
dla IPTC Date Created i Time Created; dla XMP offset pochodzi z tej wartości.
Helper nadal pokazuje wyłącznie YYYY-MM-DD w zapisanej strefie. Nie uzupełniać
brakującego czasu północą. Częściowa data bez dnia nie wystarcza do tego formatu.

Rekomenduję usunąć ogólny XMP CreateDate z fallbacków capture date: może oznaczać
utworzenie zasobu. Nie używać DateTimeDigitized, ModifyDate ani czasu systemu
plików zamiast daty wykonania. To świadoma zmiana zachowania dla części plików;
obecny test CreateDate należy zmienić dopiero po zatwierdzeniu polityki.

Źródła nadal pokazuje obecny picker. Zachować `Source: exif:ISOSpeedRatings`
(repozytorium używa dwukropka, nie kropki). Dla nowych niejednoznacznych pól XMP
etykieta powinna wskazywać także namespace, np. `xmp:exifEX.PhotographicSensitivity`.
To opis pochodzenia, nie nowa składnia tokenów. Nie dodawać panelu konfliktów.

## 5. Plan małych etapów

Każdy etap kończy się oceną użytkownika. Zatwierdzenie planu nie jest poleceniem
wykonania wszystkich etapów. Żaden etap nie obejmuje nowych publicznych helperów,
zmiany Helicon, RAW ani komercyjnych nazw sprzętu.

### Etap 1 — kontrakt i testy charakterystycznych przypadków

- **Cel:** zamrozić zgodność i ustalić oczekiwane wyniki przed refaktorem.
- **Pliki:** `src/domain/caption-tags.test.ts`, `src/features/photo/metadata.test.ts`,
  `tests/fixtures.test.ts`, `tests/fixtures.ts`, `tests/fixtures/README.md`;
  proponowany `tests/metadata-cases.ts`.
- **Zmiany:** tabelaryczne oczekiwania dla siedmiu JPG, każdego helpera i źródła;
  generator małych JPEG/PNG w pamięci oraz przypadki wadliwych reprezentacji.
  Nowe wymagania odróżnić od zaliczanej regresji obecnego zachowania.
- **Testy:** raw/helper tokens, puste dane, Helicon, exposure, brak mutacji pól,
  potwierdzone błędy; manifest przyszłych realnych próbek i oczekiwanych braków.
- **Ryzyko:** uznanie generowanego pliku za dowód wsparcia producenta.
- **Odbiór:** utrwalone obecne poprawne wyniki, lista braków pokrycia i uzgodniona
  polityka; żadnej zmiany produkcyjnego działania.

### Etap 2 — ekstrakcja i pochodzenie XMP

- **Cel:** dostarczyć resolverowi wartości z jednoznacznym znaczeniem.
- **Pliki:** `src/domain/metadata.ts`, `src/features/photo/metadata.ts`,
  `src/features/photo/load-photo.ts`; nowe `extract-metadata.ts`,
  `xmp-evidence.ts` i testy obok nich.
- **Zmiany:** wydzielić odczyt bajtów; wzbogacić istniejące MetadataField;
  wykorzystać XML przed jego odrzuceniem; zachować namespace URI, struktury,
  języki i kolidujące wystąpienia. Zachować stare klucze surowych tokenów.
- **Testy:** element/atrybut, zmienione prefiksy, namespace o tej samej nazwie,
  RDF Seq/Bag/Alt, duplikaty, extended XMP, niepoprawny XML i brak XMP;
  rzeczywisty parser w Node oraz docelowo Chromium/WebKit.
- **Ryzyko:** różnice parserów XML i utrata pakietów przed adapterem; brak
  możliwości bezpiecznego odzyskania danych wymaga decyzji o patchu.
- **Odbiór:** tiff:Model nie jest zastępowane przez custom:Model po przestawieniu
  XML; śledzenie źródła jest prawdziwe; stare tokeny i Helicon zachowują wynik.

### Etap 3 — czas, przysłona i ogniskowa

- **Cel:** typowana walidacja i poprawne APEX bez zmiany formatu.
- **Pliki:** nowe `src/domain/metadata-values.ts`, `photographic-metadata.ts`,
  ich testy; integracja w `src/domain/caption-tags.ts` i jego testach.
- **Zmiany:** ścisłe liczby/rational/listy, wybór bezpośredniej wartości przed
  APEX, wspólne wartości semantyczne i dotychczasowe formatowanie.
- **Testy:** reprezentacje równoważne, zero/NaN/Infinity, dzielenie przez zero,
  Tv dodatni/zerowy/ujemny, Av=6, konflikty EXIF/XMP, zakaz 35 mm i MaxApertureValue.
- **Ryzyko:** zmiana zaokrągleń albo dwukrotne przeliczenie description.
- **Odbiór:** znane Canon zachowują tekst; APEX daje wartości matematyczne;
  niejednoznaczność daje brak; exposure korzysta z tych samych wyników.

### Etap 4 — ISO

- **Cel:** czułość zdjęcia zgodna ze znaczeniem tagów.
- **Pliki:** `src/domain/photographic-metadata.ts`, `metadata-values.ts`,
  `caption-tags.ts` oraz testy; adapter aliasów tylko jeśli potrzebny.
- **Zmiany:** tabela SensitivityType, wartość graniczna, spójność zestawu,
  EXIF/XMP, jawne aliasy ekstraktora i źródła pomocnicze.
- **Testy:** typy 0–7 i reserved, brak typu, wszystkie trzy pełne pola,
  ISO >65535, 65535 bez dopełnienia, sprzeczne zestawy, tablice, XMP Seq;
  negatywne przypadki Base/Auto ISO i latitude.
- **Ryzyko:** mniej uzupełnionych pól w niespójnych eksportach; nie wolno
  kompensować tego zgadywaniem lub osłabieniem testów.
- **Odbiór:** `[100,200]` nigdy nie daje ISO 0.5; poprawny zestaw graniczny daje
  102400; dokładna liczba ma rzeczywiste źródło; sam sentinel daje brak.

### Etap 5 — tekst, sprzęt i data

- **Cel:** domknąć author/camera/lens/date/copyright.
- **Pliki:** resolver i walidatory domenowe, `caption-tags.ts`, ich testy;
  `src/features/photo/metadata.test.ts` i `docs/CAPTION_TAGS.md`.
- **Zmiany:** właściwe nazwy IPTC, daty i offsety, teksty RDF, selekcja języka,
  nazwy sprzętu bez przepisywania. Ewentualny MakerNote LensModel tylko po
  potwierdzeniu rzeczywistego tekstu i jego semantyki na próbce.
- **Testy:** lata przestępne, błędne dni, daty z/bez offsetu i przy granicy dnia,
  Date Created/Time Created, wielu autorów, lang-alt, identyfikatory obiektywów,
  identyczny model Canon EOS R6m2 i model bez prefiksu producenta.
- **Ryzyko:** zniknięcie date opartego wyłącznie na CreateDate; zmiana wybranego
  języka copyright; nieudokumentowany MakerNote nie może wejść jako fallback.
- **Odbiór:** poprawny dzień bez konwersji strefy, brak daty z czasu eksportu,
  tekst sprzętu bez zmian i jawne źródła. Wszystkie testy Helicon bez zmian.

### Etap 6 — PNG jako zdjęcie

- **Cel:** uruchomić ten sam resolver na JPEG i PNG.
- **Pliki:** `src/App.tsx`, `src/domain/document.ts`,
  `src/features/photo/{metadata,extract-metadata,load-photo,limits}.ts`,
  `src/features/caption/render.ts`, testy importu/renderowania oraz
  `e2e/import-lifecycle.spec.ts` i `e2e/caption-tags.spec.ts`.
- **Zmiany:** pełna sygnatura PNG, prawidłowy MIME, accept i komunikaty,
  wymiary z IHDR przed decode, nazwa eksportu bez podwójnego rozszerzenia.
  Eksport pozostaje JPG. Wspólna decyzja o tle dla PNG z alfa w preview i JPG.
  Skompresowane XMP tylko w zatwierdzonym wariancie adaptera z limitem rozmiaru.
- **Testy:** PNG eXIf/XMP/oba/brak, kompresja jeśli zatwierdzona, alfa,
  zły MIME/rozszerzenie, błędny nagłówek, limity, podmiana JPEG↔PNG,
  zasoby Blob i zachowanie poprzedniego zdjęcia po błędzie.
- **Ryzyko:** obejście limitu przez złą grupę wymiarów; rozbieżność alfa/JPG;
  brak metadanych mylony z uszkodzonym obrazem.
- **Odbiór:** identyczne metadane dają identyczne helpery i źródła niezależnie
  od kontenera; PNG bez metadanych importuje się z brakami; inne formaty nadal
  pozostają poza zakresem. Uszkodzone metadane nie mogą tworzyć fałszywych wartości.

### Etap 7 — macierz realnych plików i regresja

- **Cel:** potwierdzić zadeklarowany zakres producentów i eksportów.
- **Pliki:** `tests/fixtures*`, testy ekstrakcji i resolvera, istniejące E2E
  helperów/presetów/eksportu; README, CAPTION_TAGS i raport weryfikacji.
- **Zmiany:** wyłącznie zatwierdzone próbki, ich pochodzenie, SHA-256 i oczekiwane
  wyniki ze źródłami; mały zestaw testów UI, większość macierzy poza UI.
- **Testy:** macierz poniżej, `pnpm check`, właściwe E2E w Chromium/WebKit,
  istniejące wzorce JPG. Storybook sprawdzić, gdy zmienią się jego integracje.
- **Ryzyko:** brak praw do próbek lub brak eksportu z danego programu;
  syntetyczne dane nie zastępują brakującego dowodu.
- **Odbiór:** każdy wymagany wiersz ma rzeczywistą próbkę i wynik albo jawny
  niezamknięty brak; zgodność presetów bez migracji; brak automatycznej
  aktualizacji wzorców maskującej zmianę podpisów. Całości nie deklarować jako
  zweryfikowanej, dopóki wymagane rzeczywiste próbki nie są dostępne.

## 6. Macierz walidacyjna

| Rodzina                 | Dziś                                 | Minimum do odbioru                                                        |
| ----------------------- | ------------------------------------ | ------------------------------------------------------------------------- |
| Canon                   | 6 JPG z modelem, Lightroom; 2 modele | Zachować wszystkie, dodać przypadek wysokiego ISO w danych testowych.     |
| Sony                    | Brak                                 | Rzeczywisty JPEG z jawnymi polami ekspozycji i sprzętu.                   |
| Nikon                   | Brak                                 | Rzeczywisty JPEG; także oczekiwany brak lens, jeśli zostaje tylko LensID. |
| Fujifilm                | Brak                                 | Rzeczywisty JPEG, zachowany dokładny model i test standardowego ISO.      |
| Panasonic/Lumix         | Brak                                 | Rzeczywisty JPEG, brak utożsamiania ISO z konfiguracją Auto ISO.          |
| Olympus/OM System       | Brak                                 | Rzeczywisty JPEG; preferowane próbki obu oznaczeń marki.                  |
| Inny/nieznany producent | Brak                                 | Syntetyczny test dowodzi braku whitelisty; realna próbka opcjonalna.      |

To macierz początkowa, nie gwarancja wszystkich modeli i firmware danej marki.
Nie trzeba iloczynu każdej marki i każdego edytora. Niezależna oś eksportów ma
obejmować Lightroom, osobny Photoshop, Capture One, DxO PhotoLab oraz inny
program, np. potwierdzony workflow Helicon. Każdy przypadek zapisuje wersję
programu, jeśli jest znana, obecność EXIF/XMP/IPTC i oczekiwane braki po eksporcie.

Wspólna macierz formatów i wartości:

- JPEG EXIF-only, XMP-only, EXIF+XMP zgodne i sprzeczne, brak metadanych.
- PNG eXIf, iTXt XMP, oba, brak; IPTC tam, gdzie rzeczywiście dostępne
  przez ekstraktor; wariant skompresowany jako osobno oznaczony test zgodności.
- EXIF obie kolejności bajtów, RATIONAL/SRATIONAL, string/scalar/list/RDF,
  zerowy mianownik, wartości puste i uszkodzone, różna kolejność źródeł.
- Konflikty namespace, duplikaty i reprezentacje programów eksportujących.
- Każdy helper: wartość, źródło, brak; exposure równy pojedynczym helperom.
- `{helper}`, `{exif:Tag}`, `{xmp:Tag}`, mieszane szablony, presety po ponownym
  otwarciu, brakujące pola i niezmienione oba helpery Helicon.

Preferować niewielki, zatwierdzony zestaw prawdziwych JPEG/PNG. Nie pobierać
archiwów producentów automatycznie. Repozytorium ExifTool zawiera przykłady
z oryginalnymi segmentami metadanych i zastąpionym obrazem; nadają się do
testów ekstrakcji, ale nie zastępują fotografii do oceny renderowania.
[Opis zbioru ExifTool](https://github.com/exiftool/exiftool/blob/master/html/sample_images.html).

Oracle: po zatwierdzeniu można użyć ExifTool wyłącznie developersko do raportu
z grupami, duplikatami i surowymi wartościami, wraz z wersją narzędzia. Zachować
również nazwy parsera FrameNote. Nie kopiować bez oceny wyliczonego Composite:ISO,
zidentyfikowanego LensID czy przeliczonego APEX jako surowej wartości. Oczekiwane
wyniki mają wynikać z tagów i jawnej polityki, nie z samych opisów innego parsera.

## 7. Najważniejsze ryzyka regresji

Konserwatywne reguły mogą celowo zmienić niektóre dotychczasowe wyniki na brak.
Nie dotyczy to składni szablonów: presety nie wymagają migracji, ale ich podpis
może być bardziej poprawny lub krótszy. W szczególności dotyczy to CreateDate,
niejednoznacznego ISO i przypadkowego XMP Model z obcej przestrzeni nazw.

Inne ryzyka to zmiana formatowania po rezygnacji z description, różnice XML
między Node i przeglądarką, uszkodzenie istniejących kluczy surowych metadanych,
pominięcie limitów PNG oraz niezgodność przezroczystego podglądu z eksportem JPG.
Każde ma test lub decyzję w powyższych etapach. Nie ma uzasadnienia dla zmian
edytora, panelu tagów, formatu presetów czy rendererów tekstu poza koniecznymi
punktami integracji PNG.

## 8. Nierozstrzygnięte decyzje do zatwierdzenia

1. **Polityka konfliktów i ISO:** EXIF przed równoważnym XMP, bezpośrednie
   wartości przed APEX, odrzucanie niespójnych zestawów ISO oraz tolerancja
   niepełnego eksportu wyłącznie przy jednoznacznym SensitivityType.
2. **Capture date:** usunięcie ogólnego CreateDate; proponowana kolejność
   XMP photoshop:DateCreated przed IPTC Date Created i zachowanie lokalnego dnia.
3. **Zakres adaptera:** pozostawienie ExifReader i dodanie wąskiego odczytu
   namespace XMP. Obsługa skompresowanego iTXt jako rozszerzenie odporności,
   nie warunek podstawowego XMP. Ewentualny patch zależności wymaga osobnej
   konkretnej propozycji po testach; nie zatwierdzamy go w ciemno.
4. **PNG z przezroczystością:** jaki kolor tła stosować wspólnie w podglądzie
   i JPG. Rekomendacja: białe tło bez nowej kontrolki; to decyzja potrzebna tylko
   dla pikseli z alfa, niezależna od rozwiązywania metadanych.
5. **Rzeczywiste próbki:** zgoda na konkretny mały zestaw binariów po przedstawieniu
   manifestu źródeł i rozmiarów albo dostarczenie zdjęć użytkownika; osobno zgoda
   na użycie/instalację ExifTool jako narzędzia testowego, jeżeli będzie potrzebna.
6. **Rozpoczęcie pracy:** zatwierdzenie planu i wskazanie pierwszego etapu.
   Rekomendowany początek to etap 1; przejście dalej po jego ocenie.

Nie wymagają ponownego ustalania: lista publicznych helperów, zachowanie Helicon,
brak bazy sprzętu, brak RAW/nowych formatów, brak redesignu panelu oraz zachowanie
składni zapisanych szablonów — te ograniczenia wynikają już ze zlecenia.
