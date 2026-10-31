# FrameNote UI — wdrażanie i rozwijanie

Ten dokument pomaga dodawać funkcje interfejsu bez kopiowania istniejących
kontrolek i wzorców. Kod komponentu jest źródłem bieżącego zachowania; Storybook
pokazuje jak używać komponentów, łączyć je i sprawdzać ich stany.

## Zanim dodasz element UI

1. Znajdź podobne zastosowanie w Storybooku i `packages/editor/src/components/ui` lub
   `packages/editor/src/components/layout`.
2. Sprawdź, czy istniejący komponent można rozszerzyć przez props, wariant lub
   kompozycję. Nie przepisuj jego klas Tailwinda do feature.
3. Kod specyficzny dla funkcji umieść w `packages/editor/src/features/<feature>`; współdzielony
   i niezależny od domeny komponent należy do `packages/editor/src/components/ui` albo
   `packages/editor/src/components/layout`.
4. Gdy dodajesz nowy wspólny komponent, dodaj API z uzasadnionymi wariantami,
   dostępne nazwy i stany oraz stronę Storybooka z użyciem i interakcją.
5. Aktualizuj najbliższy przykład kompozycji. Nie twórz podobnej kontrolki tylko
   po to, by nadać jej inną nazwę.

Nowy komponent jest uzasadniony, gdy powtarza się w kilku miejscach lub ma
zachowanie, które warto utrzymywać i testować w jednym miejscu. Jednorazowy układ
może pozostać w feature, ale powinien składać istniejące prymitywy.

## Wspólne komponenty

Używaj komponentu z kolumny „Wybierz”, a nie buduj równoważnej kontrolki klasami.

| Potrzeba                   | Wybierz                                          | Uwagi                                                                     |
| -------------------------- | ------------------------------------------------ | ------------------------------------------------------------------------- |
| Akcja tekstowa             | `Button`                                         | `primary` tylko dla głównej akcji; inne akcje używają `outline`.          |
| Akcja ikonowa              | `IconButton`                                     | Zawsze podaj zrozumiałą etykietę; tooltip może ją powtórzyć lub objaśnić. |
| Pole tekstowe              | `Field` + `Input` albo `Textarea`                | Label, opis i błąd wiąż przez `Field`; nie składaj ich ręcznie.           |
| Wartość z jednostką        | `NumberField` / `DimensionInput`                 | Używaj jawnej jednostki i istniejących reguł wartości domenowej.          |
| Kontrolki w jednym wierszu | `InlineInputGroup`                               | Dla powiązanych elementów, np. przełącznika/akcji i pola.                 |
| Krótka etykieta stanu      | `Badge`                                          | Semantyczny `tone`; badge nie jest przyciskiem.                           |
| Wybór z listy / zakresu    | `Select`, `SegmentedControl`, `Slider`, `Switch` | Wybierz zgodnie z liczbą opcji i sposobem zmiany wartości.                |
| Menu dodatkowych akcji     | `ActionMenu`                                     | Krótka lista poleceń dla konkretnego obiektu.                             |
| Panel dodatkowych narzędzi | `FloatingPanel`                                  | Większa zawartość, np. picker, wyszukiwanie lub lista.                    |
| Powtarzalna lista wyboru   | `PickerList`                                     | Utrzymuje wspólne zachowanie wyboru, fokusu i wierszy.                    |

Pełna lista komponentów i ich aktualnych propsów jest w Storybooku. Tabela jest
indeksem wyboru, nie drugim API. Jeśli opis różni się od kodu, popraw dokumentację
przy komponencie.

## Tokeny, style i wymiary

Kolory oraz semantyczne role są definiowane w `packages/editor/src/index.css`. W komponencie
używaj nazw ról (`bg-input-base`, `text-content-secondary` itd.), nie surowych
wartości HEX, arbitralnych opacity ani mieszanych lokalnie kolorów. Dodaj nową
rolę do CSS, gdy reprezentuje odrębne zastosowanie, a nie pojedynczy przypadek.
`pnpm check:tokens` kontroluje tę granicę.

Używaj poniższych kontekstów spacingu. Skala odpowiada najczęstszym wartościom
obecnego interfejsu; mniejsze wyjątki są dopuszczalne dla ikon, segmentów i
precyzyjnych diagramów.

| Kontekst                          |                             Odstęp / wymiar bazowy | Przykład                         |
| --------------------------------- | -------------------------------------------------: | -------------------------------- |
| Ikona obok etykiety, gęsty wiersz |                                             4–6 px | ikona w Button, komunikat        |
| Elementy tej samej grupy          |                                               8 px | Buttony, pola w InlineInputGroup |
| Pola i treści wewnątrz sekcji     |                                            8–12 px | stos pól, opis i kontrolka       |
| Między grupami ustawień           |                                           12–16 px | kolejne grupy w inspektorze      |
| Padding kontrolki                 | 8–12 px poziomo; pion wynika z wysokości kontrolki | Input, Button                    |
| Padding wiersza/listy             |                      8 px; 4–8 px między wierszami | PickerList, lista warstw         |
| Padding zawartości panelu         |                       12 px; nagłówek/stopka 16 px | FloatingPanel                    |
| Odstęp między sekcjami sidebara   |                                              12 px | SidebarSection                   |
| Główne odstępy kompozycji         |                                           16–24 px | ekran, obszary stories           |

Wartości w tabeli są regułami doboru, nie nakazem zastępowania każdej klasy
mechanicznie. Preferuj wspólne klasy/komponenty i istniejące tokeny. Przy
powtarzających się wartościach bez znaczenia kontekstowego uczyń je wspólną
regułą; nie dodawaj nowego wyjątku bez widocznej potrzeby. Wysokość głównych
kontrolek wynosi 36 px; elementy wewnątrz grup segmentowanych mają 28 px.

Radii: 8 px dla kontrolek, 12 px dla grup i menu, większe promienie dla
powierzchni ekranu lub nakładek. Zachowuj widoczny fokus, disabled i error;
preferuj semantyczne stany komponentu zamiast ręcznego formatowania w call-site.

## Wzorce FrameNote

### Sidebar i dodatkowe opcje

Sidebar grupuje ustawienia według obiektu i zadania. `SidebarSection` zapewnia
zwijane sekcje; nie twórz własnego accordionu. Pomocnicze narzędzia otwierają
się w `FloatingPanel`, gdy zawierają picker, wyszukiwanie lub większą listę.
`ActionMenu` służy do krótkich poleceń dotyczących jednego obiektu. Picker nie
powinien rozpychać sidebara ani zmieniać rozmiaru canvasu. Zamknięcie Escape,
obsługa fokusu i powrót do wyzwalacza są częścią wspólnego wzorca.

### Warstwy i inspektor zaznaczenia

Lista warstw służy do wyboru, zmiany widoczności i akcji warstwy. Zaznaczenie
wiersza oraz inspektor ustawień mają czytelny, wspólny sygnał kolorem powierzchni:
jaśniejsze tło identyfikuje wybraną warstwę, a powiązany panel poniżej pokazuje,
że jego ustawienia dotyczą właśnie jej. Zachowuj różnicę między powierzchnią
zwykłych sekcji dokumentu i powierzchnią ustawień wybranej warstwy. Nie koduj
zaznaczenia samym kolorem tekstu ani nie powielaj osobnej palety w feature.

Przykłady: `packages/editor/src/features/layers/layer-list.tsx`, `packages/editor/src/components/ui/picker-list.tsx`
i kompozycje `Screens/TestPhotos`.

### Film roll i sesja zdjęć

Film roll jest nawigacją po zdjęciach otwartej sesji. Klatka wskazuje aktywne
zdjęcie wyświetlane na canvasie; pasek filmu przewija się pod stałą kasetą.
Zachowaj proporcje zdjęć, widoczne zaznaczenie, przewijanie i obsługę klawiatury.
Podczas importu i eksportu akcje niedostępne są blokowane, a bieżący postęp
pokazuje nakładka w obszarze pracy.

Komponenty: `packages/editor/src/components/ui/film-roll.tsx`, `packages/editor/src/components/brand/film-roll-*`
i `packages/editor/src/features/photo`. Przykłady: Storybook → Photo session.

## Storybook jako dokumentacja i playground

Storybook ma pomagać znaleźć komponent, pojąć jego przeznaczenie i sprawdzić
zachowanie. Grupuj strony płytko według zadań — bez Atomic Design i bez kilku
poziomów folderów. Zalecane sekcje:

- **Actions** — Button, IconButton, SplitButton, ActionMenu.
- **Fields** — Input, Textarea, Select, NumberField, DimensionInput, Field.
- **Field groups** — InlineInputGroup wraz z kompozycjami Input/Button.
- **Selection & feedback** — Badge, Switch, Slider, SegmentedControl, PickerList,
  InlineNotice i stany błędów/wyboru.
- **Sidebar & panels** — SidebarSection, FloatingPanel i dodatkowe pickery.
- **Layers** — lista, zaznaczenie, ustawienia i akcje warstwy.
- **Photo session** — FilmRoll, PhotoActions, import, postęp i sesja.
- **Screens** — pełne kompozycje produkcyjne i zdjęcia testowe.
- **Foundations** — tokeny, typografia i zasady wymiarów.

Każda strona komponentu powinna zawierać krótki opis „kiedy użyć”, ważne propsy
i warianty, stany istotne dla użycia oraz interaktywny playground, jeżeli można
zmieniać propsy. Powiązane zachowania grupuj na jednej stronie, ale nie ukrywaj
ich w rozbudowanym drzewie. Przykład kompozycji umieść obok bazowych elementów,
np. InlineInputGroup razem z Button i Input.

Utrzymuj zwięzłość przez usuwanie duplikatów i łączenie podobnych wariantów,
nie przez pomijanie stanów potrzebnych do prawidłowego użycia. Prototypy i
propozycje oznaczaj jako takie i trzymaj poza katalogiem zatwierdzonych wzorców.
Story nie powinno być wyłącznie obrazkiem: ma uczyć zachowania i dawać możliwość
interakcji.

## Krótka kontrola nowej funkcji UI

- Czy wykorzystuje istniejące komponenty i tokeny?
- Czy nowy wspólny element ma uzasadnienie i nie dubluje API?
- Czy odstępy wynikają z kontekstu tabeli?
- Czy klawiatura, fokus, nazwy dostępności i stany błędów działają?
- Czy Storybook pokazuje zastosowanie, ważne zachowania i kompozycję?
- Czy dokumentacja odsyła do prawdziwego kodu i story?

Przed oddaniem zmian interfejsu uruchom `pnpm test:visual`; przy zmianach
wspólnych komponentów lub styli również `pnpm test:visual --all-projects`.
Zobacz [katalog regresji wizualnej](UI_VISUAL_REGRESSION_PLAN.md).
