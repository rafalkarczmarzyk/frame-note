# Zdjęcia testowe

## 20260520-IMG_3843.jpg

Oryginalny eksport z Lightroom Classic dostarczony przez użytkownika, skopiowany bez zmian. Przeznaczony do przyszłych testów odczytu metadanych, podglądu, podpisów i eksportu. Plik jest poza `public`, więc nie trafia automatycznie do aplikacji ani jej produkcyjnego builda. Testy powinny wskazywać ścieżkę wewnątrz repozytorium, bez odwołań do Pulpitu.

Potwierdzone wartości w oryginalnym pliku:

- Wymiary: 5964 × 3976 px.
- Autor: Rafal Karczmarzyk.
- Aparat: Canon EOS R6m2.
- Obiektyw: RF100-500mm F4.5-7.1 L IS USM + EXTENDER RF1.4x.
- Czas: 1/1600 s.
- Przysłona: f/10.
- ISO: 20000.
- Profil: sRGB IEC61966-2.1.
- UserComment: brak odczytanej wartości — przykład bez informacji o stacku.

SHA-256:

```text
9d34c8751b3dded336bd05da6502a9782c300bea789565e6a55b3a7d6fe3b849
```

Oryginału nie nadpisujemy wynikami testów. Pliki eksportowane i obrazy różnic zapisujemy w ignorowanym katalogu `test-results`.

## 20261021-IMG_0469.jpg

Oryginalny pionowy JPG użytkownika, skopiowany bez zmian. Wymiary 4000 × 6000 px; brak odczytanego tagu EXIF Orientation. Jest to pionowy raster, a nie przypadek obrotu przez tag orientacji. Do sprawdzania dopasowania pionowych zdjęć i skalowania podpisów.

- Autor: Rafal Karczmarzyk.
- Aparat: Canon EOS R6m2.
- Obiektyw: RF200-800mm F6.3-9 IS USM + EXTENDER RF1.4x.
- Ekspozycja: 1/1250 s, f/13, ISO 1000.
- Profil: sRGB IEC61966-2.1.
- SHA-256: `9f652d99e098c448d8568b87e2a1cf1cbea133bb917f70182dc589c1417e36c2`.

## 20260405-K89A0565.jpg

Jasne tło — kontrast białego podpisu. Oryginał użytkownika skopiowany bez zmian, razem z metadanymi.

- Wymiary: 3232 × 2155 px.
- Aparat: Canon EOS R6m2.
- Obiektyw: RF200-800mm F6.3-9 IS USM.
- Ekspozycja: 1/3200 s, f/10.0, ISO 1600.
- SHA-256: `e6919b8d0df4aa8203eed43be9a80555fbf65560c6a4723ce51537aed95b314d`.

## 20261021-IMG_9959.jpg

Makro — ciemne zielone tło. Oryginał użytkownika skopiowany bez zmian, razem z metadanymi.

- Wymiary: 3908 × 2605 px.
- Aparat: Canon EOS R6m2.
- Obiektyw: RF100mm F2.8 L MACRO IS USM.
- Ekspozycja: 1/100 s, f/8.0, ISO 800.
- SHA-256: `171fb830ffe177c611826d380b8c3e54ba060e97df621b51430bc6a06cf3abce`.

## 20261020-2026-10-20 14-06-39 (A,R8,S4).jpg

Stack Helicon — komentarz EXIF. Oryginał użytkownika skopiowany bez zmian, razem z metadanymi.

- Wymiary: 4835 × 3275 px.
- Aparat: Canon EOS R6m2.
- Obiektyw: RF100mm F2.8 L MACRO IS USM.
- Ekspozycja: 1/250 s, f/9.0, ISO 400.
- EXIF UserComment: `Stacked from 15 images. Method=A (R=8,S=4)`.
- SHA-256: `41797a80fa91c69330112c21cd5d6b82ef2cb879d266effa6cb745338270c386`.

## 20210228-IMG_3200.jpg

Pionowe zdjęcie nocne — ciemne tło. Oryginał użytkownika skopiowany bez zmian, razem z metadanymi.

- Wymiary: 3856 × 5784 px.
- Aparat: Canon EOS RP.
- Obiektyw: RF24-105mm F4 L IS USM.
- Ekspozycja: 3.2 s, f/4.0, ISO 2000.
- SHA-256: `f0db5dfce7c2c976a35611605bf17b9672df94c5008ecec04225fa3314221819`.

## Agata-104.jpg

Pionowy oryginał użytkownika (4000 × 6000 px). Przypadek metadanych XMP bez
odczytanych parametrów ekspozycji i modelu aparatu. Autor w `xmp:creator`,
obiektyw w `xmp:LensModel` i `xmp:Lens`. Do sprawdzania helperów `{author}`,
`{lens}`, `{date}` oraz brakujących danych. Plik skopiowany bez zmian.
