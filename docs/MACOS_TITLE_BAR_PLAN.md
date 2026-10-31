# Pasek okna macOS

Data: 2026-10-31. Status: zaimplementowane i zweryfikowane; do oceny użytkownika.

## Uzgodniony wygląd

Nad dotychczasowym nagłówkiem z narzędziami pozostaje osobny, bardzo niski pasek
okna. Ma 28 px wysokości, identyczne tło jak nagłówek i nazwę FrameNote na środku.
Po lewej widoczne są natywne przyciski zamykania, minimalizacji i pełnego ekranu.
Nagłówek z narzędziami ma równy padding po 6 px z każdej strony. Wysokość wynika
z kontrolek 36 px, paddingu i dolnej linii 1 px (łącznie 49 px).
Po kolejnej korekcie pomija logo: pierwszą akcją po lewej jest Add photos.
Informacje o aplikacji są dostępne w systemowym menu FrameNote → About FrameNote.
Wersja webowa zachowuje logo i dotychczasowy dostęp do informacji o aplikacji.

Ta decyzja zastępuje wcześniejszy wariant, w którym przyciski okna zajmowały
miejsce logo i narzędzi we wspólnym wierszu. Usunięto dodatkowy lewy inset
oraz kompaktowanie kontrolek wprowadzone dla tego wariantu.

## Implementacja

- Electron na macOS używa `titleBarStyle: 'hidden'`: usuwa systemowe tło paska,
  zachowując natywne kontrolki w ich standardowej pozycji. Nie ma własnych
  odpowiedników kontrolek ani dodatkowych akcji IPC do sterowania oknem.
- Bootstrap desktopu przekazuje `windowChrome="macos-titlebar"` przez
  `mountEditor` do wspólnego `AppHeader`. Wariant `standard` pozostaje webowy.
- Tylko nowy górny pasek jest regionem przesuwania okna. Narzędzia pod nim,
  menu i panele zachowują zwykłą obsługę wskaźnika. Podwójne kliknięcie korzysta
  z zachowania macOS; nie dodano własnego przełączania maksymalizacji.
- Nazwa jest wyśrodkowana względem całego okna. Symetryczny padding zabezpiecza
  miejsce dla natywnych przycisków. Oba paski korzystają z `bg-header-base`,
  bez dodatkowej linii między nimi.
- Storybook zawiera warianty MacOS i MacOSMinimum. Test desktopowy sprawdza
  osobny pasek, kolor tła, środek nazwy, układ narzędzi przy 1440 i 800 px,
  działające kontrolki oraz minimalizację i pełny ekran.

## Odbiór

Drobne korekty wyglądu sprawdzamy zmianą i szybkim podglądem. Pełną regresję
uruchamiamy zbiorczo po zatwierdzeniu UI albo na polecenie użytkownika.
Weryfikacja zbiorcza obejmuje:

- formatowanie, tokeny, lint, typy, build webu i Storybooka;
- `pnpm test:visual` i `pnpm test:visual --all-projects`, bez zmiany wzorców webu;
- test desktopowy nowej paczki: nagłówek oraz dotychczasowy import/eksport;
- rzeczywiste okno macOS: położenie natywnych przycisków, przesuwanie,
  podwójne kliknięcie i pełny ekran;
- aktualne `.app` i DMG do oceny użytkownika.

Screenshot samego renderera nie pokazuje natywnych przycisków — ocena całego
okna jest osobną częścią odbioru. Commit po poleceniu użytkownika z zastosowaniem
maintain-changelog. Bez zmiany wersji i publikacji.

## Wynik weryfikacji

- Formatowanie, tokeny, lint i typy: poprawne. Build webu, desktopu i Storybooka:
  poprawny.
- Testy jednostkowe: 330 poprawnych. Regresja wizualna: 6 oraz 18 poprawnych,
  bez zmiany wzorców.
- Test gotowej aplikacji: osobny pasek 28 px, wyśrodkowana nazwa, wspólny kolor
  tła, brak kolizji narzędzi przy 1440/800 px, menu, minimalizacja i pełny ekran.
  Import offline, zapis JPG, anulowanie, ZIP siedmiu zdjęć i zachowanie ustawień
  po restarcie również poprawne.
- Ręcznie w oknie macOS: podgląd całego okna, przesuwanie i powiększanie oraz
  przywracanie rozmiaru podwójnym kliknięciem. Przyciski systemowe są natywne;
  podczas sesji narzędziowej wskaźnik udostępniania macOS zasłania ich wygląd.
- Przebudowane `.app` i `release/FrameNote-macOS-arm64.dmg`; suma kontrolna DMG
  poprawna. Bez zmiany wersji i publikacji.
- Po usunięciu logo ponownie przeszły kontrole statyczne, build desktopu
  i Storybooka, regresja webu (6 i 18 scen) oraz test układu przy 1440/800 px.
  Test sprawdza brak logo, pozycję Add photos i ekran About otwierany przez menu.
  W przebudowanej paczce ręcznie potwierdzono FrameNote → About FrameNote
  i powrót do edytora; nowy DMG ma poprawną sumę kontrolną.
- Równy padding 6 px: test desktopowy mierzy odstępy nad i pod każdą kontrolką,
  lewą krawędź Add photos i prawą krawędź Export actions przy 1440 oraz 800 px.
  Oba widoki obejrzano; bez kolizji kontrolek. Wysokość nagłówka wynosi 49 px,
  uwzględniając dolną linię. Przebudowano aplikację i Storybook.

## Źródła

- [Electron: Custom Title Bar](https://www.electronjs.org/docs/latest/tutorial/custom-title-bar)
- [Electron: Custom Window Interactions](https://www.electronjs.org/docs/latest/tutorial/custom-window-interactions)
