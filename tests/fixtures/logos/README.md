# Testowe logo

`frame-note-logo.svg` pochodzi z geometrii ścieżek komponentu
`src/components/brand/frame-note-logo.tsx`. Zachowuje viewBox 273 × 63,
proporcje, przezroczystość oraz wypełnienie `currentColor`. Domyślny kolor
samodzielnego pliku to biały; służy do testowania logo na ciemnym tle.

Prototyp Screens/InlineLogoPrototype importuje ten plik jako przykładowe SVG.
Zmiany geometrii logotypu należy przenieść również do tej kopii testowej.

`rt.png` to oryginalna grafika rastrowa dostarczona przez użytkownika do testów.
Zachowujemy plik bez przycinania i zmiany rozdzielczości (14524 × 1884 px).
Prototyp używa go jako przykładu PNG; szeroki obszar obrazu jest częścią zasobu.
Ten sam oryginał użytkownik wskazał jako dobry przykład grafiki do podpisu.
Test eksportu `tomato raster preserves its preset size and position` używa go
samodzielnie, mierzy skalę i położenie rysunku pomidora w zapisanym JPG oraz
porównuje całe zdjęcie z wzorcem.
