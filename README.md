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

## Kontrole

```sh
pnpm check
pnpm exec playwright install chromium webkit
pnpm test:e2e
pnpm build-storybook
```

- `check`: Prettier, kontrola tokenów kolorów, ESLint, TypeScript, 141 testów jednostkowych i build aplikacji.
- E2E na produkcyjnym buildzie, port 4173: pięć scenariuszy w Chromium i WebKit (10 testów).
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
- Jeden wieloliniowy szablon z helperami FrameNote (`{author}`, `{lens}`, `{exposure}`)
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
- Szablon, styl, pozycja i jakość eksportu pozostają przy wymianie zdjęcia,
  ale nie są zapisywane między odświeżeniami aplikacji. Presety użytkownika,
  wiele zdjęć, wiele kontenerów, parser Helicon, zoom/pan i wersja desktopowa
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
