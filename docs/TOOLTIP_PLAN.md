# Plan tooltipów interfejsu

Plan treści i miejsc użycia, przygotowany 2026-10-26. Użytkownik zlecił
wdrożenie wszystkich pozostałych części i commit 2026-10-27. Tooltipy kolorów i wspólny komponent już istnieją.
Nie zmieniamy zachowania kontrolek, układu ani zapisanych presetów.

## Wspólne zasady

- Treść interfejsu po angielsku. Krótkie nazwy dla ikon; wyjaśnienie tylko tam,
  gdzie nazwa nie tłumaczy skutku. Bez powtarzania wartości widocznej w polu.
- Hover po 750 ms, fokus klawiatury od razu, Escape zamyka sam tooltip,
  bez aktywowania kontrolki. Kliknięcie zamyka pomoc. Hover nad tooltipem
  utrzymuje go. Położenie dostosowuje się do okna, scrolla i paneli.
- Wspólny materiał liquid glass jak obecne tooltipy kolorów; brak dodatkowego
  natywnego `title` w tym samym miejscu. Dostępna nazwa kontrolki zostaje.
- Tooltip nie jest jedynym miejscem błędu, ostrzeżenia, postępu ani informacji
  koniecznej do ukończenia zadania. Nie zawiera przycisków ani linków.
- Pomoc do pola liczbowego otwiera się na jego obszarze/ikonie i przy fokusie
  samego pola; nie tworzymy osobnego przystanku Tab na dekoracyjnej ikonie.
- Disabled: powód ma zastępować zwykłą treść, ale natywny disabled nie obsługuje
  fokusu. Trzeba osobno uzgodnić obsługę takich triggerów we wspólnym komponencie:
  hover na opakowaniu bez zmiany układu, opis przez aria-describedby oraz jedno
  dostępne miejsce pomocy dla grupy. Nie dokładamy tabIndex do każdej nieaktywnej
  kontrolki. Obecne widoczne komunikaty zostają.
- Wielokropki w menu nie dostają pomocy dla każdej pozycji tekstowej. Tooltip
  opisuje trigger menu i tylko istotne powody niedostępności pozycji.

## Stan realizacji

Wszystkie cztery części wdrożono w uzgodnionym zakresie. Dla brakujących wariantów fontu wykorzystano
`aria-disabled` z blokadą aktywacji: istniejące przyciski nadal pozwalają poznać
powód przez hover i fokus, bez nowej ikony pomocy i bez dodatkowych wrapperów.
Globalna blokada edycji nadal używa natywnego disabled. Nieaktywne operacje
menu mają pomoc po najechaniu i zbiorczy opis dostępności menu. Eksport bez
zdjęcia ma jeden fokusowalny obszar pomocy. Limity stepperów mają pomoc bez
dodatkowych przystanków Tab. Widoczna informacja
M02 pozostaje przy nieaktywnym wyborze jednostki.

## 1. Typography

| ID  | Element            | Dokładna treść                          | Kiedy / uwagi                                              |
| --- | ------------------ | --------------------------------------- | ---------------------------------------------------------- |
| T01 | Wybór fontu        | `Choose a font`                         | Przycisk z aktualnym fontem.                               |
| T02 | Rozmiar fontu      | `Font size`                             | Pole i jego ikona. Jednostka jest już widoczna.            |
| T03 | Interlinia         | `Line spacing · multiple of font size`  | Pole i ikona.                                              |
| T04 | Auto align         | `Auto align · follows the layer anchor` | Pierwszy segment wyrównania.                               |
| T05 | Align left         | `Align left`                            | Segment.                                                   |
| T06 | Align center       | `Align center`                          | Segment.                                                   |
| T07 | Align right        | `Align right`                           | Segment.                                                   |
| T08 | Bold               | `Bold`                                  | Przycisk; bez dopisywania on/off, stan przez aria-pressed. |
| T09 | Bold niedostępny   | `Bold is unavailable for this font`     | Zamiast T08, tylko brak wariantu fontu.                    |
| T10 | Italic             | `Italic`                                | Przycisk.                                                  |
| T11 | Italic niedostępny | `Italic is unavailable for this font`   | Zamiast T10.                                               |

Opacity ma widoczną etykietę, wartość i jednostkę: bez nowego tooltipa.
Nie dodajemy nieistniejących skrótów klawiszowych do opisów.

## 2. Kolory — istniejące tooltipy i docelowy kontrakt

| ID  | Element               | Dokładna treść         | Kiedy / uwagi                                                                   |
| --- | --------------------- | ---------------------- | ------------------------------------------------------------------------------- |
| C01 | Szybki biały          | `White`                | Istnieje.                                                                       |
| C02 | Szybki kremowy        | `Ivory`                | Istnieje.                                                                       |
| C03 | Szybki ciemnoszary    | `Dark gray`            | Istnieje.                                                                       |
| C04 | Szybkie tło aplikacji | `Blue charcoal`        | Istnieje.                                                                       |
| C05 | Szybki czarny         | `Black`                | Istnieje.                                                                       |
| C06 | Tęczowy custom        | `Custom color · {HEX}` | Propozycja doprecyzowania: zawsze rzeczywisty HEX, także dla koloru tokenowego. |
| C07 | Ikona palety          | `Color palette`        | Istnieje.                                                                       |
| C08 | White w palecie       | `White · {HEX}`        | HEX odczytany z rzeczywistego koloru, znormalizowany do sześciu cyfr.           |
| C09 | Porcelain w palecie   | `Porcelain · {HEX}`    | Jak C08.                                                                        |
| C10 | Ivory w palecie       | `Ivory · {HEX}`        | Jak C08.                                                                        |
| C11 | Silver w palecie      | `Silver · {HEX}`       | Jak C08.                                                                        |
| C12 | Black w palecie       | `Black · {HEX}`        | Jak C08.                                                                        |
| C13 | Charcoal w palecie    | `Charcoal · {HEX}`     | Inny kolor niż Blue charcoal.                                                   |
| C14 | Graphite w palecie    | `Graphite · {HEX}`     | Jak C08.                                                                        |
| C15 | Warm gray w palecie   | `Warm gray · {HEX}`    | Jak C08.                                                                        |
| C16 | Sand w palecie        | `Sand · {HEX}`         | Jak C08.                                                                        |
| C17 | Champagne w palecie   | `Champagne · {HEX}`    | Jak C08.                                                                        |
| C18 | Muted gold w palecie  | `Muted gold · {HEX}`   | Jak C08.                                                                        |
| C19 | Dusty rose w palecie  | `Dusty rose · {HEX}`   | Jak C08.                                                                        |
| C20 | Sage w palecie        | `Sage · {HEX}`         | Jak C08.                                                                        |
| C21 | Mist blue w palecie   | `Mist blue · {HEX}`    | Jak C08.                                                                        |
| C22 | Steel blue w palecie  | `Steel blue · {HEX}`   | Jak C08.                                                                        |
| C23 | Lavender w palecie    | `Lavender · {HEX}`     | Jak C08.                                                                        |
| C24 | X w custom pickerze   | `Close color picker`   | Pomoc na samym przycisku zamknięcia.                                            |

HEX ma widoczną etykietę, instrukcję i walidację: bez tooltipa. Nie dokładamy
jednocześnie dwóch tooltipów do próbki i jej przycisku.

## 3. Sizing & Margins

| ID  | Element                      | Dokładna treść                                        | Kiedy / uwagi                                                          |
| --- | ---------------------------- | ----------------------------------------------------- | ---------------------------------------------------------------------- |
| M01 | Sizing unit                  | `Units for font size, margins and fixed image height` | Na całej kontrolce, bez tooltipów na każdej opcji otwartego Select.    |
| M02 | Zmiana jednostki bez zdjęcia | `Open a photo to change document units`               | Istniejący tekst pod polem pozostaje; nie dublować go nowym tooltipem. |
| M03 | Individual                   | `Edit each margin independently`                      | Segment trybu marginesów.                                              |
| M04 | Paired                       | `Link top/bottom and left/right`                      | Segment.                                                               |
| M05 | Linked                       | `Link all four margins`                               | Segment.                                                               |
| M06 | Reset marginesów             | `Reset all margins to 3% of the short edge`           | Przycisk Reset, nie reset całego dokumentu.                            |
| M07 | Górne pole marginesu         | `Top margin`                                          | Pole bez widocznej pełnej etykiety.                                    |
| M08 | Prawe pole marginesu         | `Right margin`                                        | Jak M07.                                                               |
| M09 | Dolne pole marginesu         | `Bottom margin`                                       | Jak M07.                                                               |
| M10 | Lewe pole marginesu          | `Left margin`                                         | Jak M07.                                                               |
| M11 | Górny uchwyt na linijce      | `Top margin · {value} {unit}`                         | Aktualizowany w trakcie przesuwania.                                   |
| M12 | Prawy uchwyt na linijce      | `Right margin · {value} {unit}`                       | Jak M11.                                                               |
| M13 | Dolny uchwyt na linijce      | `Bottom margin · {value} {unit}`                      | Jak M11.                                                               |
| M14 | Lewy uchwyt na linijce       | `Left margin · {value} {unit}`                        | Jak M11.                                                               |

Istniejący MarginTooltip i etykiety uchwytów wymagają wspólnego przeglądu: nie
pokazujemy równocześnie starego i nowego dymka. Nie usuwamy liter T/R/B/L ani
aktualnych wartości podczas przeciągania. Pomoc uchwytów musi pozostać przy
aktywnym uchwycie, bez zasłaniania miejsca przeciągania.

## 4. Position

| ID  | Element                    | Dokładna treść                                                        | Kiedy / uwagi                                   |
| --- | -------------------------- | --------------------------------------------------------------------- | ----------------------------------------------- |
| P01 | Anchor                     | `Position the layer within the photo margins`                         | Segment trybu.                                  |
| P02 | Manual                     | `Position the layer anywhere on the photo; margins do not apply`      | Segment trybu.                                  |
| P03 | Lewy górny anchor          | `Top left`                                                            | Punkt siatki.                                   |
| P04 | Środkowy górny anchor      | `Top center`                                                          | Punkt siatki.                                   |
| P05 | Prawy górny anchor         | `Top right`                                                           | Punkt siatki.                                   |
| P06 | Lewy środkowy anchor       | `Center left`                                                         | Punkt siatki.                                   |
| P07 | Środek                     | `Center`                                                              | Punkt siatki.                                   |
| P08 | Prawy środkowy anchor      | `Center right`                                                        | Punkt siatki.                                   |
| P09 | Lewy dolny anchor          | `Bottom left`                                                         | Punkt siatki.                                   |
| P10 | Środkowy dolny anchor      | `Bottom center`                                                       | Punkt siatki.                                   |
| P11 | Prawy dolny anchor         | `Bottom right`                                                        | Punkt siatki.                                   |
| P12 | X                          | `Horizontal position of the layer reference point · % of photo width` | Pole X w Manual.                                |
| P13 | Y                          | `Vertical position of the layer reference point · % of photo height`  | Pole Y w Manual.                                |
| P14 | Nieaktywne X/Y w Anchor    | `Switch to Manual to edit X and Y`                                    | Jeden opis dla grupy, nie dwa osobne tab-stopy. |
| P15 | Nieaktywna siatka w Manual | `Switch to Anchor to use the position grid`                           | Jeden opis dla grupy.                           |

Nie obiecujemy, że cały tekst mieści się w zdjęciu przy X/Y 0–100%.

## 5. Layers

| ID  | Element                              | Dokładna treść                       | Kiedy / uwagi                                                                                              |
| --- | ------------------------------------ | ------------------------------------ | ---------------------------------------------------------------------------------------------------------- |
| L01 | Otwarte oko                          | `Hide layer`                         | Każdy wiersz; numer warstwy pozostaje w dostępnej nazwie.                                                  |
| L02 | Zamknięte oko                        | `Show layer`                         | Jak L01.                                                                                                   |
| L03 | Ikona anchora                        | `Anchor · {position}`                | Np. `Anchor · Bottom left`. Element opisowy, nie udajemy przycisku.                                        |
| L04 | Ikona pozycji ręcznej                | `Manual position · X {x}%, Y {y}%`   | Rzeczywiste współrzędne.                                                                                   |
| L05 | Wielokropek                          | `Layer actions`                      | Trigger menu.                                                                                              |
| L06 | Ucięty opis warstwy                  | `{full layer summary}`               | Wyłącznie gdy tekst faktycznie ucięty; czytelny opis, bez surowego JSON i długich identyfikatorów obrazów. |
| L07 | Przeciągany wiersz                   | `Drag to reorder layers`             | Tylko w obszarze przeciągania; do rozstrzygnięcia konflikt z L06.                                          |
| L08 | Niedostępne Move up / Bring to front | `This layer is already at the front` | Pozycja na początku listy.                                                                                 |
| L09 | Niedostępne Move down / Send to back | `This layer is already at the back`  | Pozycja na końcu listy.                                                                                    |

Add layer ma tekst, a pozycje menu mają nazwy: bez tooltipów powtarzających te
nazwy. Dla wiersza proponuję L06 przy ucięciu, a L07 w pozostałych przypadkach;
nie dwa dymki na tym samym obszarze. Tooltip nie pojawia się podczas dragowania.

## 6. Content, tagi i grafiki inline

| ID  | Element                      | Dokładna treść                                               | Kiedy / uwagi                                                       |
| --- | ---------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------------- |
| I01 | Tags                         | `Insert photo metadata at the text cursor`                   | Wyjaśnia skutek przycisku.                                          |
| I02 | Icons                        | `Insert a built-in or uploaded SVG icon`                     | Przycisk Icons.                                                     |
| I03 | Image                        | `Insert an SVG or PNG at the text cursor`                    | Przycisk Image.                                                     |
| I04 | Badge metadanych z wartością | `{token} · {resolved value}`                                 | Pomoc istnieje jako title; wymiana na wspólny tooltip.              |
| I05 | Badge z brakującą wartością  | `No value found for {token}`                                 | Widoczny znak/komunikat brakujących danych zostaje.                 |
| I06 | Własna grafika w treści      | `{file name}`                                                | Tooltip na podglądzie obrazu.                                       |
| I07 | Ikona inline                 | `{icon:NAME}`                                                | Nazwa rzeczywistego tokenu.                                         |
| I08 | Brakująca grafika / ikona    | `Missing image · {name or token}` / `Missing icon · {token}` | Dwa warianty zależne od typu; nie przedstawiamy PNG jako ikony SVG. |
| I09 | X na badge'u                 | `Remove {token}`                                             | Usuwa element treści, nie metadane ze zdjęcia.                      |
| I10 | X na grafice                 | `Remove image · {file name}`                                 | Usuwa wystąpienie grafiki w treści.                                 |
| I11 | Relative to font             | `Scale image height with the font size`                      | Tryb rozmiaru zaznaczonego obrazu.                                  |
| I12 | Fixed height                 | `Set image height in document units`                         | Drugi tryb.                                                         |
| I13 | Original colors              | `Keep the SVG’s original colors`                             | Ustawienie SVG.                                                     |
| I14 | Layer color                  | `Use the layer’s text color for this SVG`                    | Ustawienie SVG.                                                     |

Image height, Replace image, pola wyszukiwania i listy wyników mają czytelne
etykiety: bez dodatkowych tooltipów. Ostrzeżenie o powiększonym PNG pozostaje
widoczne. Tagi są elementami edytora, więc trzeba zweryfikować fokus i zaznaczanie
bez dodawania osobnego Tab dla każdego badge'a. To osobna część implementacji,
nie mechaniczne opakowanie wszystkich NodeView w Tooltip.

## 7. Header i presety

| ID  | Element                                            | Dokładna treść                                 | Kiedy / uwagi                                              |
| --- | -------------------------------------------------- | ---------------------------------------------- | ---------------------------------------------------------- |
| H01 | Logo                                               | `About FrameNote`                              | Przycisk About.                                            |
| H02 | Open photo bez tekstu                              | `Open photo`                                   | Tylko w wariancie ikonowym w wąskim oknie.                 |
| H03 | Open photo bez tekstu, gdy zdjęcie jest otwarte    | `Open another photo · keep the current layout` | Jak H02, po imporcie.                                      |
| H04 | Ucięta nazwa presetu                               | `{full preset name}`                           | Tylko gdy ucięta; nie wyświetlać drugiego opisu na Select. |
| H05 | Modified / kropka                                  | `The current layout has unsaved changes`       | Oba warianty statusu.                                      |
| H06 | Save preset, istniejący własny preset              | `Update the selected preset`                   | Główna część split buttona.                                |
| H07 | Save preset, brak własnego presetu do aktualizacji | `Save the current layout as a new preset`      | Główna część split buttona.                                |
| H08 | Strzałka split buttona                             | `Preset actions`                               | Sam trigger menu.                                          |
| H09 | Ostrzeżenie magazynu presetów                      | `Preset storage warning · open preset manager` | Pełny błąd pozostaje widoczny w menedżerze.                |
| H10 | Ikona duplikowania presetu                         | `Duplicate preset · {name}`                    | W menedżerze.                                              |
| H11 | Ikona zmiany nazwy                                 | `Rename preset · {name}`                       | W menedżerze, tylko własny preset.                         |
| H12 | Ikona usuwania                                     | `Delete preset · {name}`                       | W menedżerze.                                              |
| H13 | Niedostępne Duplicate bez presetu                  | `Select a preset to duplicate it`              | Pozycja menu.                                              |
| H14 | Niedostępne Rename dla built-in                    | `Built-in presets cannot be renamed`           | Pozycja menu.                                              |
| H15 | Niedostępne Rename bez presetu                     | `Select a user preset to rename it`            | Pozycja menu.                                              |

Dodatkowo w aktualnym split buttonie zdjęcia:

| ID  | Element                 | Dokładna treść     | Kiedy / uwagi                        |
| --- | ----------------------- | ------------------ | ------------------------------------ |
| H16 | Strzałka Photo actions  | `Photo actions`    | Trigger menu obok Open photo.        |
| H17 | Niedostępne Close photo | `No photo is open` | Pozycja menu bez wczytanego zdjęcia. |

Import, Export presets, Save as new, Duplicate i Rename w tekstowym menu nie
potrzebują osobnych tooltipów. Nie dodajemy nieistniejącej blokady presetów przed
importem zdjęcia: edycja układu i zapis są już wtedy dostępne.

## 8. Export i Photo

| ID  | Element                     | Dokładna treść                 | Kiedy / uwagi                                            |
| --- | --------------------------- | ------------------------------ | -------------------------------------------------------- |
| E01 | Export JPG bez tekstu       | `Export JPG`                   | Tylko wariant ikonowy, gdy dostępny.                     |
| E02 | Export bez zdjęcia          | `Open a photo to export a JPG` | Powód niedostępności.                                    |
| E03 | Small                       | `JPEG quality · 60%`           | Zastępuje istniejący title 60%.                          |
| E04 | Balanced                    | `JPEG quality · 75%`           | Jak E03.                                                 |
| E05 | Best                        | `JPEG quality · 95%`           | Jak E03.                                                 |
| E06 | Rozmiar zdjęcia wejściowego | `{localized byte count} bytes` | Zastępuje title, dokładny rozmiar pod zwięzłą wartością. |
| E07 | Rozmiar wyniku              | `{localized byte count} bytes` | Tylko gdy istnieje przygotowany plik.                    |

Przygotowanie eksportu i błędy pozostają widoczne: nie dodajemy tooltipa,
który ukrywałby jedyną informację o stanie. Remove all metadata i pięć grup
metadanych mają już opisy. Pozostawiamy je; brak dodatkowych sześciu dymków.
Nie chowamy informacji o lokalnym przetwarzaniu ani ograniczeniach eksportu.

## 9. Wspólne kontrolki i layout

| ID  | Element                           | Dokładna treść                                           | Kiedy / uwagi                                                                                                          |
| --- | --------------------------------- | -------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| U01 | X dodatkowego panelu              | `Close {panel name}`                                     | Np. `Close color palette`, `Close font picker`, `Close metadata browser`, `Close icon picker`, `Close preset manager`. |
| U02 | X okna About                      | `Close About FrameNote`                                  | Jeśli używa osobnej ikony zamknięcia.                                                                                  |
| U03 | Uchwyt szerokości sidebara        | `Drag to resize · double-click to reset`                 | Mysz.                                                                                                                  |
| U04 | Ten sam uchwyt — fokus klawiatury | `Arrow keys resize · Home/End set limits · Enter resets` | Zamiast U03 przy fokusie z klawiatury.                                                                                 |
| U05 | Strzałka pola liczbowego w górę   | `Increase {field name}`                                  | Nazwa odpowiada polu, np. `Increase font size`.                                                                        |
| U06 | Strzałka pola liczbowego w dół    | `Decrease {field name}`                                  | Jak U05.                                                                                                               |
| U07 | Górny limit pola                  | `Maximum {field name} reached`                           | Opcjonalny powód dla nieaktywnego steppera; nie dodajemy nowych tab-stopów.                                            |
| U08 | Dolny limit pola                  | `Minimum {field name} reached`                           | Jak U07.                                                                                                               |

Nie dodajemy tooltipów do każdego chevrona accordiona, nagłówka sekcji, całego
slajdera, jego dekoracyjnej skali, widocznej etykiety przełącznika ani pustego
canvasu. Dla stepperów proponuję U05/U06, a U07/U08 tylko jeśli po próbie widać
realną potrzebę — limity nie wymagają osobnego tooltipa w pierwszej iteracji.

## Zrealizowana kolejność wdrażania

1. **Typography i marginesy:** T01–T11, M01, M03–M10. Próba w Storybooku,
   kontrola czytelności krótkich i dłuższych opisów oraz zachowania disabled.
2. **Pozycja i layout:** P01–P15, M11–M14, U01–U04. Zgodność z uchwytami,
   przeciąganiem i dotychczasowymi etykietami marginesów.
3. **Warstwy, treść i grafiki:** L01–L09, I01–I14. Szczególnie fokus Tiptap,
   zachowany kursor, drag i brak konfliktu dwóch tooltipów.
4. **Header, presety i eksport:** H01–H17, E01–E07, U05/U06 oraz korekty C06,
   C08–C23 i C24. U07/U08 dopiero po ocenie.

Po części 1 użytkownik zlecił wszystkie pozostałe części bez dalszych pytań
i commit na końcu. Ta zgoda dotyczy niniejszego planu tooltipów.

## Weryfikacja

- Hover i fokus pokazują tę samą właściwą treść; nie ma równoczesnego title.
- Escape najpierw zamyka tooltip, kolejny Escape może zamknąć panel.
- Tooltip nie blokuje click, edycji liczb, wyboru Select, kursora Tiptap ani drag.
- Nie wyskakuje podczas przeciągania, nie zasłania uchwytu; nazwa i wartość
  marginesu nadal są dostępne podczas ruchu.
- Długie nazwy presetów, plików i wartości metadanych zawijają się w granicach
  okna. Bardzo długa treść dostaje rozsądny limit; tooltip nie zastępuje przeglądarki
  metadanych ani pełnego edytora.
- Disabled działa również dla klawiatury i czytnika zgodnie z uzgodnionym wzorcem.
- Wąski sidebar, wąskie okno, krawędzie ekranu, scroll, otwarte menu/pickery,
  reduced transparency i dotyk nie pogarszają podstawowych działań.
- Zachowanie sprawdzone w Chromium i WebKit; stories dla treści dynamicznych,
  disabled, uchwytów i elementów edytora. Mały zestaw testów przepływu zamiast
  osobnego E2E na każdą etykietę.
