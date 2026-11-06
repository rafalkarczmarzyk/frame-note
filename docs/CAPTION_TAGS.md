# Tagi podpisu

Helpery FrameNote mają zapis `{author}`, oryginalne pola `{group:name}`, np.
`{exif:Artist}` i `{exif:UserComment}`. Nazwy rozróżniają wielkość liter.
Tokeny nie zmieniają źródłowych metadanych; są rozwiązywane dla bieżącego zdjęcia.
Panel metadanych pokazuje wartość i źródło, wyszukuje również po źródłach,
wstawia przy zapamiętanym kursorze i pozwala użyć helpera bez danych.

## Helpery i źródła

Pierwsze poprawne źródło wygrywa, z osobną walidacją ISO opisaną niżej.
Prefiksy dc/tiff/exif/exifEX/aux/photoshop w tabeli oznaczają standardowe namespace
XMP sprawdzane przez URI; nie zmieniają składni oryginalnych tokenów.

| Helper                | Wynik                                          | Priorytet źródeł                                                                                                   |
| --------------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `{author}`            | Autor                                          | XMP dc:creator → XMP tiff:Artist → EXIF Artist → IPTC By-line/Byline                                               |
| `{camera}`            | Canon EOS R6m2                                 | EXIF Model → XMP tiff:Model                                                                                        |
| `{lens}`              | RF100mm F2.8 L MACRO IS USM                    | EXIF LensModel → XMP exifEX:LensModel → XMP aux:Lens                                                               |
| `{shutter}`           | 1/250 s                                        | EXIF ExposureTime → XMP exif:ExposureTime → EXIF ShutterSpeedValue → XMP exif:ShutterSpeedValue                    |
| `{shutterDuration}`   | 1 h 1 min 1.5 s                                | Te same źródła co shutter; poniżej minuty ten sam format, od minuty godziny/minuty/sekundy bez zerowych składników |
| `{aperture}`          | f/8                                            | EXIF FNumber → XMP exif:FNumber → EXIF ApertureValue → XMP exif:ApertureValue                                      |
| `{iso}`               | ISO 400                                        | Poprawny zestaw EXIF → poprawny zestaw standardowego XMP; reguły poniżej                                           |
| `{focalLength}`       | 100 mm                                         | EXIF FocalLength → XMP exif:FocalLength; nie ekwiwalent 35 mm                                                      |
| `{date}`              | 2026-10-20                                     | EXIF DateTimeOriginal → XMP exif:DateTimeOriginal → IPTC DateCreated → XMP photoshop:DateCreated                   |
| `{time}`              | 23:30                                          | EXIF DateTimeOriginal → XMP exif:DateTimeOriginal; poprawny timestamp, bez konwersji strefy                        |
| `{copyright}`         | Treść praw                                     | XMP dc:rights → EXIF Copyright → IPTC Copyright Notice/CopyrightNotice                                             |
| `{exposure}`          | 1/250 s · f/8 · ISO 400                        | Składa shutter, aperture i iso, pomijając brakujące części i separatory                                            |
| `{heliconStack}`      | Focus stack · 15 images · Method A · R=8 · S=4 | EXIF UserComment → XMP exif:UserComment                                                                            |
| `{heliconStackCount}` | 15                                             | Ten sam pełny parser komentarza co heliconStack                                                                    |

`{heliconStackSummary}` daje skrócone `Stacked 15 frames` z tego samego parsera
co `{heliconStack}`. Starszy `{dateTime}` pozostaje obsługiwany; picker pokazuje
osobne `{date}` i `{time}`. Szczegóły: [Capture time](#capture-time).

Czas, przysłona, ISO i ogniskowa zawierają jednostki — nie dopisuj ich ponownie.
Helicon rozpoznaje pełny komentarz `Stacked from N images. Method=A (R=8,S=4)`,
metody A/B/C, dodatkowe spacje i różną wielkość liter. Nie zgaduje liczby z dowolnego komentarza.

## Reguły i ograniczenia

- APEX jest zastępczym zapisem ekspozycji: czas = `2 ** -ShutterSpeedValue`,
  przysłona = `2 ** (ApertureValue / 2)`. Bezpośrednie parametry mają pierwszeństwo.
- ISO korzysta z PhotographicSensitivity/ISOSpeedRatings (także aliasu EXIF ISO)
  i SensitivityType. Wartość 65535 wymaga pełnego parametru wskazanego przez typ.
  Nie mieszamy typu EXIF z wartością XMP; listy nie są dzielone jak ułamki.
  Samotne Auto ISO/Base ISO nie zastępują czułości zdjęcia.
- Data waliduje dzień kalendarzowy i zachowuje dzień zapisany w źródle, bez
  konwersji strefy. CreateDate nie jest datą wykonania. Lista w tabeli odpowiada
  implementacji; nie obiecuje odczytu dowolnego wariantu IPTC.
- Warianty językowe XMP: x-default → angielski → pierwszy dostępny kandydat.
  Nie sklejamy tłumaczeń. Nazwy sprzętu pozostają nazwami ze źródła; nie ma bazy
  modeli, zgadywania aparatu ani rozwiązywania LensID.
- ExifReader i adapter zachowują pochodzenie standardowych pól XMP. Odczyt
  nie obejmuje wszystkich MakerNotes ani dowolnych tagów producenta.
  Skompresowane XMP iTXt w PNG nie jest wspierane.
- Rzeczywiste fixture obejmują głównie Canon/Lightroom i XMP bez ekspozycji;
  brak próbek Sony, Nikon, Fujifilm, Panasonic i OM System ogranicza weryfikację.

## Brakujące dane

Znany helper bez danych daje pustą wartość; nieznany token jest raportowany.
Wiersz opróżniony przez brakujące tokeny znika, celowo pusty wiersz zostaje.
Własne etykiety i separatory pozostają. Eksport widocznych warstw z brakami
wymaga potwierdzenia; ukryte warstwy nie zgłaszają braków do eksportu.

## Grafiki inline

`{icon:camera}` zachowuje domyślny wygląd. Wersja z ustawieniami:
`{icon:camera:1.5:font:center}` — wysokość, jednostka `font|document`,
wyrównanie `top|center|bottom`.

Obrazy: `{image:id:height:font|document:original|single}` z opcjonalnym
`:top`, `:center` lub `:bottom`. Bez sufiksu są wyśrodkowane. PNG zachowuje
oryginalne kolory; jednolity kolor dotyczy SVG. Ustawienia są per wystąpienie,
wyższa grafika zwiększa wiersz, a zmiana jednostki przelicza wysokości dokumentowe.
Zasoby i ustawienia zapisuje preset; sam token bez zasobu nie przenosi grafiki.

## Kod

- [Helpery i źródła](../packages/core/src/caption-tags.ts).
- [ISO](../packages/core/src/photographic-metadata.ts).
- [Ekstrakcja](../packages/editor/src/features/photo/extract-metadata.ts).
- [Resolver treści](../packages/editor/src/features/caption/template.ts).
- [Fixture zdjęć](../tests/fixtures/README.md).

## Concise stack captions

`{heliconStackSummary}` uses the same validated Helicon comment as `{heliconStack}`,
returning `Stacked 15 frames` or `Stacked 1 frame`. Missing data stays empty.
A line containing only decorative inline icons and empty metadata is omitted;
missing-data warnings remain. Literal labels and intentional empty lines are preserved.
This helper uses preset v1; older applications may report it as an unknown token.

## Date formatting

`{date}` remains YYYY-MM-DD. `{date:DD.MM.YYYY}` formats the same validated capture
date differently. The editor stores custom patterns with URI encoding, e.g.
`{date:'YY%20MM%20DD}`. Use YYYY or YY, MM or M, DD or D exactly once, with spaces,
dots, slashes, hyphens, underscores or apostrophes. Patterns are limited to 64
characters; unsupported fields and malformed encodings are invalid. No locale or
timezone conversion occurs. Missing dates stay missing, never replaced by today.
The format belongs to each token and survives preset v1 export/import. Older readers
cannot resolve parameterized date tokens. Configure patterns by selecting the date
in Content; the preview distinguishes actual values from examples.

### Capture time

`{time}` reads EXIF DateTimeOriginal then standard XMP exif:DateTimeOriginal,
validates the calendar day and time, and returns HH:mm without timezone
conversion. Compose `{date} {time}` for a date and time together. The picker offers
these separate helpers; legacy `{dateTime}` still resolves YYYY-MM-DD HH:mm for
existing presets. Date-only IPTC sources are not used for time. The date format picker
includes YYYY/MM/DD and YYYY/MM/DD HH:mm; custom patterns can include HH and mm
once each, together. A formatted token requesting time resolves only from a valid
capture timestamp; a date alone never implies midnight. Missing capture time keeps
the normal missing-data export warning. `MM` means month; `mm` means minutes.
