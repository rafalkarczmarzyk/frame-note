# Weryfikacja MVP — 25 października 2026

Etap 7 wdrożony, do oceny użytkownika. Bez commita ani rozpoczęcia prac spoza MVP.

## Zakres

| Obszar           | Sprawdzenie                                                                                                                     |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Import           | Odrzucanie niepoprawnych plików, limity, szybka wymiana zdjęć, zachowanie ustawień i zwalnianie object URL                      |
| Wiele kontenerów | Osobne style, wybór, usuwanie, wspólne jednostki i marginesy, eksport całego układu                                             |
| Custom           | Drag bez skoku, niezależność od marginesów i geometria JPG                                                                      |
| Edytor           | Atomy tagów i SVG, selekcja, schowek z tekstowymi tokenami, brakujące pola                                                      |
| Wiersze          | Puste wiersze zachowują odstęp; wiersze opróżnione przez brakujące wartości są pomijane                                         |
| SVG              | Ikony inline oraz samodzielne logo, kolory oryginalne/jednolite, rozmiar i proporcje                                            |
| Presety          | Zapis lokalny, odtworzenie po odświeżeniu, duplikowanie i zmiana nazwy, usuwanie, import/eksport                                |
| Przenoszenie SVG | Import presetu z własną ikoną i logo; reload; odtworzenie; piksele JPG na zdjęciu poziomym i pionowym                           |
| Błędny import    | Ponowna walidacja SVG, odrzucenie skryptu bez zmiany dokumentu; poprawny import po błędzie                                      |
| Wbudowane        | Default, Default dark, Macro; parser komentarza Helicon i helpery                                                               |
| Kolory/JPG       | HEX, alpha, jakość, wymiary, sRGB i istniejące wzorce pikseli eksportu                                                          |
| Zdjęcia          | Siedem oryginalnych plików z AllPhotos: wildlife poziomy/pionowy, jasne tło, makro, Helicon, nocny portret i XMP bez ekspozycji |

## Poprawki wykonane w tym etapie

- Resolver wcześniej usuwał wszystkie puste wiersze. Teraz odróżnia celową pustą
  linię od linii opróżnionej przez brakujące tagi lub ikony.
- Oryginalne pola metadanych z pustą wartością są raportowane jako brakujące.
- Zapis/import/duplikowanie presetów używają `getRandomValues`, zamiast wymagać
  `randomUUID` dostępnego tylko w bezpiecznym kontekście. Przebieg odtworzenia SVG
  sprawdzany jest również z wyłączonym `randomUUID`.
- Uaktualniono dokumentację stanu MVP i ograniczeń.

## Weryfikacja

- `pnpm check`: zaliczone — format, tokeny kolorów, lint, typy, 195 testów jednostkowych i build aplikacji.
- `pnpm test:e2e`: zaliczone — 12 scenariuszy w Chromium i WebKit, łącznie 24 testy.
- `pnpm build-storybook`: kompilacja Storybooka.
- AllPhotos: podgląd i gotowość eksportu dla siedmiu zdjęć w każdym silniku,
  bez błędów wykonania strony. Obejrzano również zrzuty portretów.
- Istniejące wzorce eksportu pozostają bez zmian; nie regenerowano baseline’ów.

## Granice sprawdzenia

WebKit nie zastępuje ręcznego sprawdzenia Safari. Nie jest to pełny audyt
accessibility ani test wszystkich urządzeń, profili kolorów i konfiguracji pamięci.
HTTP w LAN sprawdzono pod względem dostępności używanych API; nie deklarujemy
przeprowadzenia testu na drugim fizycznym urządzeniu.

Presety są lokalne dla przeglądarki i originu. Bieżąca niezapisana sesja i zdjęcie
nie wracają po odświeżeniu. Wyczyszczenie danych witryny usuwa presety; JSON służy
do przenoszenia i kopii. Eksport JPG nie kopiuje EXIF ani ICC. Długi podpis może
wyjść poza kadr. Batch, zoom/pan, linijki canvasu i aplikacja desktopowa pozostają
poza MVP. Helicon obsługuje udokumentowany format komentarza z metodą A/B/C;
nie rozpoznaje dowolnych komentarzy ani formatów innych programów.
