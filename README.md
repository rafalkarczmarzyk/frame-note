# FrameNote

Lokalny edytor podpisów fotograficznych: React, TypeScript, Vite, Tailwind CSS,
Konva i ExifReader. Zdjęcia są przetwarzane w przeglądarce, bez wysyłania na serwer.

## Status

Pre-MVP ukończone i zaakceptowane; ostatni etap zapisany w commicie `9a627af`.
Cały przepływ działa: import JPG → szablon podpisu → stylowanie i podgląd → eksport.
Po zamknięciu pre-MVP dodano uzgodnione usprawnienia UI, helpery metadanych i nowe
zdjęcia testowe. Nie oznacza to zatwierdzenia całej roadmapy MVP.

Kontekst produktu, założenia pre-MVP i propozycja MVP:
[docs/PRODUCT_PLAN.md](docs/PRODUCT_PLAN.md).

## Uruchomienie

Node.js: wersja z `.nvmrc` lub zgodna z wymaganiami zależności. Używamy pnpm
(wersja przypięta w `packageManager`).

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Aplikacja: http://localhost:3000. Zajęty port powoduje błąd, bez zmiany portu.
Vite i Storybook nasłuchują na `0.0.0.0`: z innego urządzenia w tej samej sieci
użyj `http://<IP-komputera>:3000` lub `http://<IP-komputera>:6006`.
Adresy sieciowe są wyświetlane podczas uruchamiania.

## Kontrole

```sh
pnpm check
pnpm exec playwright install chromium webkit
pnpm test:e2e
pnpm build-storybook
```

- `check`: Prettier, kontrola tokenów kolorów, ESLint, TypeScript, 181 testów jednostkowych i build aplikacji.
- E2E na produkcyjnym buildzie, port 4173: dziewięć scenariuszy w Chromium i WebKit (18 testów).
- Przepływ eksportu sprawdza oba oryginalne JPG, wymiary, jakość, rozmiar w bajtach,
  brak źródłowych metadanych, różnice kolorów sRGB i obrót EXIF 6.
- Regresja wizualna porównuje piksele eksportu w Chromium, bez zależności od UI.
- Drugi scenariusz sprawdza szybką wymianę zdjęć, błędne i puste pliki, powrót do
  pracy po błędzie oraz zwalnianie adresów Blob przy wymianie i nieudanym imporcie.
- Pozostałe scenariusze sprawdzają zachowanie stylu przy zmianie zdjęcia, wybór
  własnego HEX i jego piksele w JPG oraz helpery, namespace i przenośny szablon.
- WebKit to automatyczny test silnika przeglądarki; nie zastępuje ręcznej oceny
  aplikacji Safari ani testów na innych systemach.

Pozostałe polecenia: `format`, `lint:fix`, `test:watch`, `test:e2e:ui`, `preview`.

### Wzorce eksportu

`e2e/photo-flow.spec.ts-snapshots` zawiera zaakceptowane wzorce macOS/Chromium:
miniaturę całego eksportu i fragment podpisu w oryginalnej rozdzielczości dla obu
zdjęć. Porównanie dopuszcza próg koloru 0,1 i maksymalnie 0,1% różniących się
pikseli. Błąd zapisuje actual/expected/diff w `test-results`.

Świadoma aktualizacja: `pnpm test:e2e:update --project=chromium`, następnie obejrzenie
obrazów i diffu. Nie aktualizujemy wzorców eksportu przy samych zmianach UI.
Inne platformy wymagają własnych, przejrzanych wzorców. WebKit wykonuje asercje
funkcjonalne i pomiar kolorów bez porównywania do wzorców Chromium.

## Aktualne możliwości

- Jeden JPG: wybór pliku lub drag & drop. Błąd wymiany pozostawia poprzednie zdjęcie.
- Odczyt metadanych rozpoznawanych przez ExifReader: EXIF, IPTC, XMP i ICC.
  Dostępne pola można przeszukiwać i wstawiać z listy. Nie gwarantujemy obsługi
  każdego niestandardowego pola lub MakerNote.
- Wiele kontenerów tekstowych z wieloliniowymi szablonami i helperami FrameNote (`{author}`, `{lens}`, `{exposure}`)
  i oryginalnymi tagami `{group:name}`, np. `{exif:Artist}`.
  Wstawianie w pozycji kursora, zastępowanie zaznaczenia, oznaczenie użytych tagów.
  Helpery są na górze w grupie FrameNote, a oryginały w grupach namespace.
  Domyślny podpis: `{author}`, `{lens}`, `{exposure}` w osobnych wierszach.
  Brakujące pola są raportowane; eksport wymaga wtedy potwierdzenia.
- Zmiana zdjęcia zachowuje ustawienia podpisu i jakość eksportu w bieżącej sesji.
- Montserrat i Advercase, Regular/Bold, kolor (lista neutralnych i pastelowych odcieni oraz własny HEX), opacity (slider i pole liczbowe),
  interlinia jako mnożnik fontu oraz wyrównanie tekstu.
- Globalna jednostka wymiarowania: px, % krótszego lub % dłuższego boku zdjęcia.
  Dotyczy rozmiaru fontu i czterech marginesów; zmiana jednostki przelicza wartości
  bez zmiany wyglądu na bieżącym zdjęciu. Domyślnie font 2% krótszego boku,
  marginesy po 3%, interlinia 1,4× i biały podpis (Porcelain).
- Wizualny edytor marginesów z trybami niezależnym, parami i wszystkimi krawędziami i dziewięć anchorów względem
  obszaru wewnątrz marginesów. Limity zostawiają co najmniej 1 px tego obszaru;
  nie zapewniają dopasowania zbyt dużego bloku tekstu.
- Wspólna geometria podglądu i eksportu. Font jest ładowany przed renderowaniem.
- Jakość JPG 1–100%, domyślnie Best 95%; presety Small 60 i Balanced 75.
- Dokładny rozmiar wyniku po kodowaniu w tle, rozmiar wejścia i ostrzeżenie,
  gdy wynik jest większy. Pobierany jest gotowy Blob, bez ponownego kodowania.
- Stały sidebar ze zwijanymi sekcjami i pamięcią otwarcia w localStorage.
  Pływający panel tagów/fontów/kolorów ma osobny scroll i nie zmienia rozmiaru zdjęcia.

## Ograniczenia

- Import: maksymalnie 100 MB, 50 megapikseli i 16 384 px na bok.
  Rozmiar pliku sprawdzamy przed odczytem, wymiary z nagłówka przed dekodowaniem,
  a następnie rzeczywiste wymiary obrazu. Limity ograniczają zużycie zasobów;
  dostępna pamięć nadal zależy od urządzenia i przeglądarki.
- Eksport `*-framenote.jpg` zachowuje wymiary zdekodowanego zdjęcia i utrwala obrót
  w pikselach. Ponownie koduje JPG; nie jest bezstratną kopią.
- Źródłowe EXIF/IPTC/XMP/GPS i profil ICC nie są kopiowane. Canvas używa domyślnego
  sRGB. Testy kolorów obejmują dostarczone zdjęcia sRGB; Adobe RGB, Display P3
  i nietypowe profile wymagają osobnej weryfikacji.
- Bardzo długi podpis może wyjść poza kadr. Brak automatycznego zawijania
  i zmniejszania tekstu.
- Kodowanie jest kolejkowane z opóźnieniem 450 ms i ignorowaniem spóźnionych wyników,
  ale rysowanie dużych obrazów może chwilowo obciążyć główny wątek.
- Wszystkie kontenery, ich style i pozycje oraz jakość eksportu pozostają przy wymianie zdjęcia,
  ale nie są zapisywane między odświeżeniami aplikacji. Presety użytkownika,
  wiele zdjęć, parser Helicon, zoom/pan i wersja desktopowa
  pozostają poza pre-MVP.

## Podpisy i zdjęcia testowe

[Helpery i składnia podpisów](docs/CAPTION_TAGS.md) opisują dostępne nazwy,
kolejność źródeł, formatowanie i brakujące dane. Oryginalne tagi pozostają dostępne.

Siedem oryginalnych JPG obejmuje jasne i ciemne tła, dwie orientacje, komentarz
Helicon oraz metadane XMP bez parametrów ekspozycji. Lista, wymiary i sumy plików:
[tests/fixtures/README.md](tests/fixtures/README.md). Nie zmieniamy oryginałów
i nie dołączamy ich do produkcyjnego builda aplikacji.

## Design system

```sh
pnpm storybook
pnpm build-storybook
```

Storybook: http://localhost:6006. Podział: Design (tokeny), Components (UI, Layout,
Brand) i Screens. `Screens/EditorWorkspace` pokazuje kompozycję UI ze zdjęciem
poziomym/pionowym; `Screens/TestPhotos` uruchamia rzeczywisty edytor z odczytem
metadanych, podglądem podpisu i eksportem na pięciu dodatkowych zdjęciach.
Aplikacja oraz stories importują te same komponenty i CSS.
Addon dostępności pomaga w przeglądzie; nie stanowi pełnego audytu dostępności.

Dokumentacja komponentów i rozbudowy: [docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md).

### Paleta

HEX-y są zdefiniowane tylko w `@theme` w `src/index.css`.

| Paleta         | HEX     | Główne zastosowanie      |
| -------------- | ------- | ------------------------ |
| charcoal       | #383F51 | tło i ciemny tekst       |
| slate          | #9CAFB7 | tło przeciągania zdjęcia |
| porcelain      | #FDFFFC | tekst                    |
| charcoal-dark  | #292E3B | obszar wokół zdjęcia     |
| charcoal-light | #454E64 | accordiony               |

Kolory akcentów ikon sekcji: turquoise — Photo, rose-brown — Caption, violet — Typography,
yellow — Sizing i Margins, crimson — Position, primary — Export.

| Paleta     | HEX     |
| ---------- | ------- |
| violet     | #731DD8 |
| turquoise  | #00BFB3 |
| yellow     | #FFD400 |
| crimson    | #EF233C |
| rose-brown | #8B635C |

Primary: emerald (`#14CC60`). Tło przeciągania zdjęcia pozostaje slate (`#9CAFB7`).

Komponenty używają tokenów zastosowań, np. `bg-input-base`, `bg-accordion-base`
i `text-content-primary`. `pnpm check:tokens` sprawdza zasady kolorów; jest też
częścią `pnpm check`. Paleta podpisu na zdjęciu pozostaje oddzielona od tokenów UI.
Glass korzysta z przezroczystości i blur. Logo SVG i Lucide dziedziczą `currentColor`;
rozmiar i kolor ustawiamy klasami Tailwind.

### Fonty

Montserrat Variable pochodzi z `@fontsource-variable/montserrat` i jest lokalnie
pakowany. Advercase Regular/Bold z archiwum użytkownika znajduje się w
`public/fonts/advercase`; w dostarczonym archiwum nie było pliku licencji.

## Struktura

- `src/domain`: modele zdjęcia, podpisu i metadanych, bez zależności od UI.
- `src/features/photo`: import, normalizacja metadanych i kompozycja edytora.
- `src/features/caption`: szablon, geometria, renderowanie i eksport.
- `src/components/ui`: współdzielone kontrolki; Radix dla selecta, slidera i grup.
- `src/components/layout`: sidebar, sekcje i pływający panel.
- `src/lib`: kolejka zadań, formatowanie rozmiaru i preferencje sekcji.
- `tests/fixtures`: oryginalne zdjęcia poziome i pionowe; unity sprawdzają ich sumy.
- `e2e`: testy Playwright i wzorce eksportu.

## Próba edytora MVP — etap 1

Storybook → **Screens/CaptionEditorPrototype → Playground**:
[otwórz próbę](http://localhost:6006/?path=/story/screens-captioneditorprototype--playground).
Tekst, atomowe badge’e tagów i ikon SVG, przeciąganie, undo/redo oraz schowek
z zapisem `{author}` / `{icon:aperture}`. Pole Clipboard playground służy do
sprawdzenia kopiowania i ponownego wklejania. Próba korzysta z przykładowych
wartości i dwóch ikon; nie zmienia obecnego edytora zdjęć ani eksportu.

## Wiele kontenerów — MVP etap 2

Sekcja **Containers** pozwala dodawać, duplikować i usuwać kontenery tekstowe.
Wybór z listy lub kliknięciem podpisu na zdjęciu zmienia aktywny kontener;
sidebar edytuje wyłącznie jego treść, styl i anchor. Jednostka wymiarowania
pozostaje wspólna: zmiana przelicza wszystkie kontenery, zachowując ich wygląd.
Nowy kontener ma pustą treść i zaślepkę tylko w podglądzie i kopiuje ustawienia aktywnego. Można usunąć wszystkie
kontenery i wyeksportować samo zdjęcie. Ramka zaznaczenia nie trafia do JPG.

Przykład: Storybook → **Screens/TestPhotos → MultipleCaptions**.
Przeciąganie i pozycja Custom są dostępne; integracja Tiptap jest dostępna w etapie 4.

Sidebar rozdziela **Selected container** (treść, typografia, pozycja) oraz
**Document** (wspólna jednostka i marginesy, informacje o zdjęciu).
Marginesy są globalne i ustawiają wspólny obszar dla wszystkich anchorów.

## Swobodne pozycjonowanie — MVP etap 3

Przeciągnięcie kontenera na zdjęciu przełącza go do trybu Custom. X/Y wyrażają
procent szerokości/wysokości całego zdjęcia i określają pozycję ostatnio wybranego
anchora wewnątrz bloku. Zachowuje to wybraną krawędź przy zmianie długości tekstu.
Custom pomija globalne marginesy; jednostka dokumentu nadal steruje fontem.
Punkt odniesienia można ustawić w zakresie 0–100%; duży blok może wychodzić poza
zdjęcie. Wybór anchora przywraca pozycjonowanie względem wspólnych marginesów.
Duplikat zachowuje Custom, nowy kontener dostaje wolny anchor.
Storybook: Screens/TestPhotos/CustomPosition.

## Wizualny edytor i SVG inline — MVP etap 4

Caption używa Tiptap: tekst i nowe wiersze, atomowe badge’e metadanych oraz ikony
SVG bez ramki i widocznej nazwy (token w tooltipie). Tagi korzystają z rzeczywistych
metadanych zdjęcia; brakujące elementy są oznaczone, bez usuwania zapisu z szablonu.
Browse available tags wstawia element w miejscu kursora lub zamiast zaznaczenia.
Zaznaczanie, usuwanie, przeciąganie i undo/redo działają wewnątrz edytora.
Kopiowanie/wycinanie daje `{klucz}`, a wklejenie odtwarza elementy wizualne.

Browse icons pozwala nadać nazwę i wgrać SVG (do 256 KB, 2000 elementów). Następnie
wybierz ikonę, aby wstawić `{icon:nazwa}`. SVG musi być samodzielną grafiką wektorową,
bez skryptów, osadzonych obrazów, zewnętrznych zasobów i arkuszy stylów; tekst należy
zamienić na krzywe. Ikony zachowują proporcje i dziedziczą kolor, rozmiar i opacity
kontenera. Podgląd i eksport korzystają z tych samych pomiarów i układu tekstu/SVG.
Wgrane ikony pozostają przy wymianie zdjęcia w sesji; trwały zapis zasobów dojdzie
w etapie presetów. Samodzielny blok logo SVG jest dostępny w etapie 5.

Storybook: **Screens/TestPhotos/InlineIcons** pokazuje edytor i eksport z ikonami
aperture i camera. Test E2E sprawdza upload, odrzucenie skryptu, schowek, brakującą
ikonę i piksel koloru SVG w JPG. Obecny eksport tekstowy zachowuje wcześniejsze wzorce.

Puste kontenery pokazują przyciemnione logo FrameNote i ramkę wyłącznie na canvasie.
Zaślepka nie trafia do schowka ani JPG i znika przy pierwszej treści. W edytorze
widoczna jest podpowiedź. Built-in zawiera też `{icon:framenote-logo}` (pełne logo)
i `{icon:framenote-icon}` (znak marki); ich świadome wstawienie trafia do eksportu.

## Logo SVG — MVP etap 5

**Add logo** dodaje samodzielny blok SVG. Na liście jest miniatura i nazwa pliku;
wybór na liście lub canvasie otwiera kontrolki Logo SVG i Position. Width/Height
zachowują proporcje i używają wspólnej jednostki dokumentu. Original colors zachowuje
kolory SVG; Single color korzysta z tego samego pickera co podpis. Opacity działa
w obu trybach. Anchor i globalne marginesy oraz przeciąganie/Custom działają tak
jak dla tekstu. Replace SVG zachowuje szerokość, styl i pozycję; wysokość wynika
z proporcji nowej grafiki. Nieudany upload pozostawia poprzednie logo.

Logo można duplikować i usuwać w swoim wierszu. Zmiana jednostki zachowuje wygląd,
a wymiana zdjęcia zachowuje cały układ. Zasób SVG jest częścią modelu kontenera;
trwały zapis dojdzie w etapie presetów. Obowiązują te same limity i wymagania SVG
co dla ikon inline. Storybook: **Screens/TestPhotos/StandaloneLogo**.

Ustawienia wybranego kontenera są zgrupowane jako **Content**, **Appearance**
i **Layout**. Wygląd obejmuje rozmiar/font, kolor i opacity, a Layout wyrównanie,
Line spacing i pozycję. Kolor ma szybkie próbki oraz tęczowy picker inline;
More colors otwiera pełną paletę i graficzny picker z HEX w panelu.

## Presety układu — MVP etap 6

Sekcja Presets zapisuje nazwany układ w przeglądarce: wszystkie kontenery,
szablony tagów, style, anchory i pozycje Custom, jednostkę i globalne marginesy.
Użyte ikony oraz logo SVG są dołączane. Zdjęcie, wartości metadanych
i jakość eksportu nie należą do presetu.

Save preset tworzy zapis; Update preset nadpisuje wybrany, Save as new tworzy
kopię. Lista przywraca układ na bieżącym zdjęciu. Zmiany wymagają jawnego zapisu;
usunięcie presetu pozostawia bieżący układ. Export preset zapisuje bieżący układ
w pliku `.framenote.json`, Import preset waliduje go, dodaje jako nowy preset
i stosuje. Import nie nadpisuje istniejących zapisów.

Presety pozostają po odświeżeniu w tej samej przeglądarce i pod tym samym adresem.
Wyczyszczenie danych witryny je usuwa; plik JSON służy do kopii i przenoszenia.
Import: wersja 1, do 5 MB, 100 kontenerów i 100 ikon; SVG przechodzą ponowną
walidację. Storybook z przykładowym układem nie zapisuje presetów w localStorage.

Wbudowane presety: **Default** odtwarza początkowy podpis author/lens/exposure;
**Macro** dodaje w prawym dolnym rogu osobny blok `{heliconStack}` z liczbą zdjęć,
metodą i parametrami z rozpoznanego komentarza Helicon UserComment. Wbudowane
presety są stałe; Save as new zapisuje własną kopię. Bez rozpoznanego komentarza
blok nie jest renderowany i zachowuje standardowe ostrzeżenie brakującego tagu.

**Default dark** zachowuje układ Default i używa ciemnego koloru tekstu Charcoal.
