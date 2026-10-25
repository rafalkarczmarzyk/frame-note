# Tagi podpisu FrameNote

Stan: 24 października 2026. Helpery działają na metadanych odczytanych z bieżącego
zdjęcia. Nie zapisują niczego w oryginalnym JPG i nie zastępują oryginalnych tagów.

## Szablon

Domyślny podpis w edytorze:

```text
{author}
{lens}
{exposure}
```

Helpery FrameNote nie mają namespace. Oryginalne pola zachowują zapis
`{group:name}`, np. `{exif:Artist}`, `{xmp:creator}`, `{exif:UserComment}`.
Można mieszać oba rodzaje w jednym szablonie; stare szablony nadal działają.
Nazwy są rozróżniane wielkością liter, np. `{focalLength}`.

## Dostępne helpery i źródła

Źródła w tabeli są sprawdzane od lewej do prawej. Pierwsza niepusta wartość,
którą helper potrafi sformatować, wygrywa. W razie konfliktu niczego nie scalamy
ani nie nadpisujemy w źródłach; wybrany tag jest pokazany w panelu.

| Helper          | Wynik / przykład          | Kolejność źródeł                                                                                                                         |
| --------------- | ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `{author}`      | Autor                     | `xmp:creator` → `xmp:tiff:Artist` → `exif:Artist` → `iptc:By-line` → `iptc:Byline`                                                       |
| `{camera}`      | Canon EOS R6m2            | `exif:Model` → `xmp:Model`                                                                                                               |
| `{lens}`        | EF-S24mm f/2.8 STM        | `exif:LensModel` → `xmp:LensModel` → `xmp:Lens`                                                                                          |
| `{shutter}`     | `1/250 s` lub `3.2 s`     | `exif:ExposureTime` → `xmp:ExposureTime`                                                                                                 |
| `{aperture}`    | `f/8`                     | `exif:FNumber` → `xmp:FNumber`                                                                                                           |
| `{iso}`         | `ISO 400`                 | `exif:PhotographicSensitivity` → `exif:ISOSpeedRatings` → `exif:ISO` → `xmp:PhotographicSensitivity` → `xmp:ISOSpeedRatings` → `xmp:ISO` |
| `{focalLength}` | `100 mm`                  | `exif:FocalLength` → `xmp:FocalLength`                                                                                                   |
| `{date}`        | `2026-10-20`              | `exif:DateTimeOriginal` → `xmp:DateTimeOriginal` → `iptc:DateCreated` → `xmp:DateCreated`                                                |
| `{copyright}`   | Treść praw autorskich     | `xmp:rights` → `exif:Copyright` → `iptc:Copyright Notice` → `iptc:CopyrightNotice`                                                       |
| `{exposure}`    | `1/250 s · f/8 · ISO 400` | Składa dostępne `{shutter}`, `{aperture}` i `{iso}`; pokazuje wszystkie użyte źródła                                                     |

Czas, przysłona, ISO i ogniskowa mają już jednostki/oznaczenia. Nie dopisuj ponownie
`s`, `f/`, `ISO` ani `mm`. `{exposure}`
dodaje ten prefiks samodzielnie, pomija brakujące części i nie pozostawia pustych
separatorów. Bez żadnych parametrów ekspozycji jest traktowany jako brak danych.

`{iso}` rozwiązuje EXIF PhotographicSensitivity (dawniej ISOSpeedRatings)
razem z SensitivityType. Tag ten opisuje czułość używaną przy wykonaniu zdjęcia;
typ może wskazywać SOS, REI, ISO Speed albo ich zgodne kombinacje. Dla zgodnego
zestawu helper zachowuje format `ISO N`, również przy SensitivityType=2 (REI).
Przy wartości granicznej 65535 korzysta z pełnego pola wskazanego przez typ.
Samotne Auto ISO, Base ISO, ISOSpeed lub latitude nie zastępują czułości zdjęcia.

Import obsługuje JPG i PNG. Eksport nadal zapisuje JPG; przezroczyste piksele PNG
mają białe tło zarówno w podglądzie, jak i eksporcie.

Data zachowuje dzień z metadanych; nie przeliczamy jej na strefę czasową urządzenia.
`xmp:CreateDate` jest pomijane, bo może opisywać eksport lub utworzenie po edycji.
Daty są sprawdzane kalendarzowo; `20240229` i `2024-02-29` są poprawne, ale
`2023-02-29` nie daje wartości helpera.
Ogniskowa oznacza wartość zapisaną w FocalLength, nie ekwiwalent 35 mm.
Nie wyliczamy parametrów z alternatywnych wartości APEX ani nie zgadujemy modelu
aparatu na podstawie obiektywu.

## Lista tagów

**Browse available tags** otwiera panel z osobnym przewijaniem:

1. **FrameNote** — helpery, zawsze na górze, z wartością i źródłem.
2. **EXIF**.
3. **XMP**.
4. **IPTC**.
5. Pozostałe odczytane namespace, posortowane alfabetycznie.

Wyszukiwarka sprawdza klucze, wartości, namespace i źródła helperów. Pozostawia
nagłówki tylko dla grup zawierających wyniki. Wiersz oznaczony **Used** jest już
w szablonie. Kliknięcie wstawia token przy zapamiętanym kursorze albo zastępuje
zaznaczenie w textarea.

Oryginalne pola są nadal widoczne i można je wstawiać niezależnie od helperów.
Wartości pokazane przy helperach są podglądem dla aktualnego zdjęcia; zmiana
zdjęcia ponownie je rozwiązuje, zachowując sam szablon.

## Brakujące dane

Helper bez wartości pokazuje **No data in this photo.** Można go wstawić, aby
przygotować szablon używany również z innymi zdjęciami. W podpisie brakujący token
jest pusty; całkowicie puste wiersze są pomijane. Lista brakujących pól jest widoczna
w karcie Caption, a eksport takiego podpisu wymaga potwierdzenia.

Znany helper bez danych nie jest błędem składni. Nieznana nazwa bez namespace,
np. `{Artist}`, jest błędem składni; użyj `{author}` albo `{exif:Artist}`.
Dowolne dosłowne separatory i tekst pozostają — automatyczne usuwanie pustych
separatorów dotyczy tylko gotowego helpera `{exposure}`.

`Agata-104.jpg` jest przypadkiem testowym z autorem i obiektywem w XMP, bez
odczytanego modelu aparatu i parametrów ekspozycji. Brak tych wartości nie oznacza
awarii helperów. Lista wszystkich oryginałów: [zdjęcia testowe](../tests/fixtures/README.md).

## Helicon i dalsza rozbudowa

Komentarz stacku jest dostępny jako `{exif:UserComment}` i formatowany helper
`{heliconStack}` opisany poniżej. Obecny plik testowy zawiera
`Stacked from 15 images. Method=A (R=8,S=4)`.

Logika helperów i grupowania: `src/domain/caption-tags.ts`. Resolver szablonu:
`src/features/caption/template.ts`. UI listy: `src/features/caption/metadata-picker.tsx`.
Nowe aliasy wymagają jawnej kolejności źródeł, formatowania i testów fallbacku.

### Helicon Focus — helper `{heliconStack}`

Helper rozpoznaje pełny komentarz `Stacked from N images. Method=A (R=8,S=4)`
z EXIF UserComment (następnie XMP UserComment). Obsługuje metody A/B/C,
niezależnie od wielkości liter i dodatkowych spacji. Wynik:
`Focus stack · 15 images · Method A · R=8 · S=4`.
Nie zmienia oryginalnego UserComment. Przy braku pełnego rozpoznanego formatu
wartość jest pusta, bez zgadywania liczby zdjęć z innego komentarza.
Wbudowany preset Macro dodaje osobny kontener `{heliconStack}` w prawym dolnym rogu.

Helper `{heliconStackCount}` korzysta z tego samego parsera i źródeł co `{heliconStack}`,
ale zwraca wyłącznie liczbę, np. `15`. Umożliwia własny podpis:
`Stacked {heliconStackCount} images` → `Stacked 15 images`. Bez rozpoznanego komentarza
zachowuje standardowe oznaczenie brakującej wartości.
