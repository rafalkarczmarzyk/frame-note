# Audyt techniczny — wymagania i plan poprawek

Data: 2026-10-25.
Źródło: statyczny audyt techniczny repozytorium opisany w rozmowie z użytkownikiem.
Status: realizacja etapowa; szczegółowy stan i dowody poniżej.

## Jak korzystać z planu

Użytkownik polecił utrwalić ustalenia, aby kolejny agent mógł poprawiać aplikację
etapami. Ten dokument opisuje zakres i kryteria odbioru; samo jego istnienie nie
jest poleceniem rozpoczęcia implementacji ani zgodą na wszystkie kolejne etapy.

1. Przeczytaj AGENTS.md i wskazaną dokumentację projektu.
2. Po poleceniu rozpoczęcia danego etapu sprawdź aktualny kod i potwierdź problem.
   Ścieżki poniżej wskazują miejsca z audytu; numery linii mogłyby się zdezaktualizować.
3. Wdrażaj tylko zlecony etap. Rozwiązanie techniczne można dopasować do kodu,
   zachowując wymagane zachowanie i granice zakresu.
4. Dodaj testy zachowania chroniące przed opisaną regresją. Wykonaj wymagane kontrole.
5. Zaktualizuj ten dokument: zmienione zachowanie, dowody weryfikacji, ograniczenia
   i stan „do oceny użytkownika”. Nie oznaczaj etapu jako zaakceptowanego samodzielnie.
6. Poczekaj na ocenę, ewentualne poprawki i wyraźne polecenie przejścia dalej.
   Commit wymaga osobnego polecenia użytkownika.

Audyt był wyłącznie statyczny: nie wykonywano testów, aplikacji ani buildów.
Wysoka pewność oznacza dowód w przeczytanym kodzie, a nie odtworzenie w przeglądarce.
Przegląd objął szczegółowo główne ścieżki domeny, importu, edytora, presetów,
renderowania i eksportu. Nie był kontrolą każdej linii, wszystkich zależności,
wszystkich stories ani rzeczywistego hostingu. Nie potwierdza zgodności WCAG.

## Kolejność i stan

| Etap | Zakres                                       | Ustalenia    | Priorytet | Nakład | Zależności | Stan          |
| ---- | -------------------------------------------- | ------------ | --------- | ------ | ---------- | ------------- |
| 1    | Integralność i współbieżność presetów        | FN-01, FN-02 | P1        | Medium | brak       | zweryfikowany |
| 2    | Własność i retencja zasobów warstwy          | FN-03        | P2        | Medium | brak       | zweryfikowany |
| 3    | Bezpieczne operacje asynchroniczne i schowek | FN-04, FN-05 | P2        | Medium | etap 2     | zweryfikowany |
| 4    | Stabilność przygotowanego eksportu           | FN-06        | P2        | Small  | brak       | nierozpoczęty |
| 5    | Nawigacja klawiaturą w panelach              | FN-07        | P2        | Medium | brak       | nierozpoczęty |
| 6    | Przewijanie podczas przeciągania warstw      | FN-08        | P3        | Small  | brak       | nierozpoczęty |

Kolejność minimalizuje powtórną pracę. Medium/Small to względny nakład, nie estymacja czasu.
Nie stwierdzono potwierdzonych ustaleń Critical ani prac P0.

## Etap 1 — integralność i współbieżność presetów

### FN-01 — zapis tworzy dane odrzucane przy odczycie całej kolekcji

- Istotność: **High**. Kategoria: integralność danych i persistence. Pewność: **High**.
- Miejsca: `src/features/presets/preset-controls.tsx` — inicjalizacja `presets`,
  `store`, duplikowanie; `src/domain/presets.ts` — `parsePreset`, `createPreset`.
- Dowód: zapis sprawdza rozmiar, ale nie wszystkie ograniczenia parsera. Duplikowanie
  dopisuje ` copy` i zapisuje wynik przed zmianą nazwy. Parser dopuszcza 80 znaków.
  Odczyt całej listy jest w jednym try/catch; jeden błąd zwraca pustą kolekcję.
- Scenariusz: zapisać nazwę długości 80 znaków, zduplikować, zamknąć formularz bez
  skrócenia nazwy i odświeżyć. Analogiczna rozbieżność dotyczy ponad 100 warstw,
  które można utworzyć w UI, lecz parser je odrzuca.
- Skutek: cała kolekcja znika z UI. Następny zapis może nadpisać nadal istniejące
  dane w localStorage.
- Wymaganie: dane zatwierdzone przez bieżącą wersję muszą przejść jej odczyt.
  Błąd jednego wpisu nie może bez komunikatu ukrywać poprawnych wpisów ani
  powodować utraty danych podczas kolejnego zapisu.
- Zalecane podejście: współdzielone ograniczenia i walidacja przed zapisem;
  odczyt per wpis oraz zachowanie błędnych danych do odzyskania. Nie kasować
  nieczytelnej kolekcji w ramach obsługi błędu.
- Kompromis: obcinanie nazwy naprawia tylko jeden objaw. Nie potrzeba wdrażania
  pełnego systemu migracji; obowiązuje odłożenie Zod i migracji z NTH-002.

### FN-02 — import nadpisuje nowszy stan kolekcji

- Istotność: **Medium**. Kategoria: współbieżność i integralność danych. Pewność: **High**.
- Miejsce: `src/features/presets/preset-controls.tsx` — asynchroniczny handler importu.
- Dowód: po odczycie pliku i dekodowaniu zasobów wykonywane jest
  `store([...presets, preset])` z kolekcją przechwyconą przed operacją.
- Scenariusz: podczas importu zapisać/usunąć/zmienić nazwę innego presetu albo
  uruchomić drugi import. Zakończenie operacji może przywrócić starszą listę.
- Skutek: utrata zapisu lub cofnięcie zmiany również w localStorage.
- Wymaganie: zakończony import musi uwzględniać aktualny stan; równoległe operacje
  nie mogą gubić udanych zapisów ani przywracać usuniętych wpisów.
- Zalecane podejście: wspólny punkt zatwierdzania aktualizacji kolekcji, z określoną
  kolejnością operacji i obsługą błędu magazynu. Oddzielić tę odpowiedzialność od UI.
- Kompromis: czasowe blokowanie operacji jest prostsze, ale ogranicza interakcje.
  Nie umieszczać niekontrolowanych efektów zapisu wewnątrz updaterów Reacta.

### Kryteria odbioru etapu 1

- [ ] Zapis, duplikowanie i odczyt mają zgodne ograniczenia nazw, liczby warstw,
      treści i zasobów; granice są sprawdzone testami.
- [ ] Duplikat granicznie długiej nazwy przechodzi odczyt po odświeżeniu.
- [ ] Błędny wpis nie ukrywa poprawnych; użytkownik dostaje informację i możliwość
      zachowania/odzyskania błędnych danych, bez cichego nadpisania.
- [ ] Dwa opóźnione importy zachowują oba wyniki.
- [ ] Import równoległy do zapisu, zmiany nazwy i usunięcia nie cofa tych operacji.
- [ ] Błąd localStorage nie powoduje fałszywego komunikatu o udanym zapisie.
- [ ] Import/eksport i ponowne odczytanie poprawnego presetu nadal działają.

## Etap 2 — własność i retencja zasobów warstwy

### FN-03 — puste warstwy dziedziczą zasoby; usunięte obrazy zużywają limit

- Istotność: **Medium**. Kategoria: model i cykl życia zasobów. Pewność: **High**.
- Miejsca: `src/domain/caption-layout.ts` — `addCaption`;
  `src/features/caption/editor/caption-editor.tsx` — `imageAssets`, import i usuwanie.
- Dowód: nowa warstwa czyści template i logo, lecz zachowuje sklonowane images.
  Usunięcie tokenu nie usuwa zasobu, a wymiana dopisuje nowy. Limit 100 obejmuje
  całą przechowywaną tablicę.
- Scenariusz: utworzyć pustą warstwę z aktywnej warstwy mającej 100 zasobów;
  dodanie pierwszego nowego obrazu zostaje zablokowane. Limit można też wyczerpać
  serią dodawań/usunięć lub wymian.
- Skutek: niewidoczne zasoby blokują pracę i nadal uczestniczą w ładowaniu podglądu.
- Wymaganie: nowa warstwa ma własną pustą kolekcję zasobów treści; duplikat zachowuje
  potrzebne grafiki. Polityka limitów i retencji musi uwzględniać undo/redo.
- Zalecane podejście: rozróżnić aktualne odwołania i zasoby utrzymywane przez historię.
- Kompromis: bezwarunkowe kasowanie zasobu po usunięciu tokenu może zepsuć undo.
  Przed wdrożeniem ustalić w zakresie etapu, czy limit obejmuje aktywną treść,
  historię czy osobno oba zbiory; opisać decyzję i jej skutki.

### Kryteria odbioru etapu 2

- [ ] Nowa pusta warstwa nie dziedziczy images, duplikat zachowuje potrzebne zasoby.
- [ ] Powtarzane usuwanie i wymiana nie wyczerpują niewidocznie limitu aktywnej treści.
- [ ] Undo/redo odtwarza obrazy i ustawienia ich wystąpień.
- [ ] Usunięcie jednego wystąpienia nie psuje innych korzystających z tego zasobu.
- [ ] Preset zawiera wymagane zasoby bez niepotrzebnych danych historii.
- [ ] Test schowka z `e2e/inline-images.spec.ts` wkleja do niezależnej pustej warstwy
      lub dokumentu, który wcześniej nie miał kopiowanego zasobu. Dziedziczenie
      obrazów nie może maskować błędu transportu przez schowek.

## Etap 3 — bezpieczne operacje asynchroniczne i schowek

### FN-04 — pozycja wstawienia obrazu dezaktualizuje się podczas importu

- Istotność: **Medium**. Kategoria: poprawność edytora i async. Pewność: **High**.
- Miejsce: `src/features/caption/editor/caption-editor.tsx` — handler uploadu.
- Dowód: from/to jest zapamiętane przed `await importImage`, a następnie użyte
  bez mapowania przez transakcje. Edycja pozostaje możliwa. Wymiana ma częściową
  kontrolę poprzedniego tokenu; dodawanie nie ma kontroli zmiany dokumentu.
- Scenariusz: importować PNG z zaznaczonym tekstem i w czasie dekodowania edytować
  wcześniejszy fragment dokumentu.
- Skutek: zastąpienie niewłaściwego tekstu, złe miejsce wstawienia lub błąd zakresu.
- Wymaganie: operacja zachowuje logiczny cel albo bezpiecznie kończy się komunikatem,
  jeśli cel przestał istnieć. Nie może nadpisać innego fragmentu tekstu.
- Zalecane podejście: mapowana zakładka ProseMirror albo kontrola rewizji dokumentu.
- Kompromis: blokowanie edycji jest prostsze, ale ogranicza UI; mapowanie musi
  uwzględnić usunięcie celu, undo oraz zniszczenie instancji edytora.

### FN-05 — PNG ze schowka może zablokować podgląd i eksport

- Istotność: **Medium**. Kategoria: walidacja i izolacja błędów. Pewność: **High**.
- Miejsca: `src/domain/image-validation.ts`,
  `src/features/caption/editor/caption-editor.tsx` — handlePaste,
  `src/features/photo/photo-workspace.tsx` — assets i iconsReady.
- Dowód: walidator PNG sprawdza nagłówek i wymiary, lecz nie dekodowanie. Schowek
  zatwierdza dane od razu. Workspace używa Promise.all dla wszystkich zasobów
  i globalnej gotowości zależnej również od nieużywanych/ukrytych grafik.
- Scenariusz: wkleić bogate dane FrameNote z nagłówkiem PNG i IHDR o poprawnych
  wymiarach, lecz bez poprawnych danych obrazu. Walidator struktury je przyjmie,
  późniejsze ładowanie odrzuci.
- Skutek: podpisy znikają, eksport jest zablokowany; ukrycie warstwy nie pomaga,
  a usunięcie tokenu pozostawia zasób (FN-03).
- Wymaganie: dekodowalność sprawdzana przed zatwierdzeniem z każdego wejścia.
  Awaria zasobu jest identyfikowalna i nie blokuje niezależnych widocznych warstw.
  Nie wolno po cichu wyeksportować dokumentu bez wymaganej widocznej grafiki.
- Zalecane podejście: wspólna ścieżka przygotowania zasobów; gotowość według użycia;
  walidacja bogatej struktury schowka przed przekazaniem jej do edytora.
- Kompromis: asynchroniczne wklejanie wymaga ochrony celu wstawienia z FN-04.
  Zachować limity bajtów i wymiarów przed kosztownym dekodowaniem.
- Granica twierdzenia: problem odporności na dane wejściowe; audyt nie wykazał XSS
  ani wykonania obcego kodu.

### Kryteria odbioru etapu 3

- [ ] Opóźniony import i równoległa edycja nie usuwają niezamierzonego tekstu.
- [ ] Zmiana warstwy, usunięcie celu i zniszczenie edytora są obsłużone bezpiecznie.
- [ ] Uszkodzony PNG ze schowka nie jest zatwierdzany jako poprawny zasób.
- [ ] Błędne dane schowka mają bezpieczną obsługę, z zachowaniem tekstowego fallbacku.
- [ ] Schowek między niezależnymi dokumentami przenosi zasoby; kolizja ID nie podmienia
      istniejącej grafiki, a ustawienia wystąpień pozostają niezależne.
- [ ] Ukryte i nieużywane zasoby nie blokują gotowości poprawnego eksportu.
- [ ] Błąd widocznej grafiki jest komunikowany i nie powoduje cichego pominięcia w JPG.

## Etap 4 — stabilność przygotowanego eksportu

### FN-06 — wybór warstwy niepotrzebnie koduje JPG ponownie

- Istotność: **Medium**. Kategoria: wydajność i granice stanu. Pewność: **High**.
- Miejsca: `src/features/photo/photo-workspace.tsx` — selectContainer,
  renderedCaptions, exportRequest; `src/features/caption/use-prepared-export.ts`.
- Dowód: zmiana activeId tworzy nowy layout; zależne obiekty eksportu są tworzone
  ponownie. Hook uznaje Blob za aktualny według tożsamości request.
- Scenariusz: po przygotowaniu JPG wybrać inną warstwę bez zmiany kompozycji.
- Skutek: gotowy Blob przestaje być dostępny i po debounce ponownie kodowane jest
  pełne zdjęcie; eksport jest chwilowo wyłączony.
- Wymaganie: wybór, hover i inne zmiany wyłącznie UI nie unieważniają JPG.
  Rzeczywista zmiana pikseli lub jakości zawsze unieważnia poprzedni wynik.
- Zalecane podejście: oddzielić wybór od kompozycji albo stabilizować wejście
  renderera na podstawie danych wpływających na wynik.
- Kompromis: unikać głębokiego porównywania dokumentów i base64 przy każdym renderze.

### Kryteria odbioru etapu 4

- [ ] Zmiana wyboru/hoveru nie zwiększa liczby wywołań kodera ani nie wyłącza eksportu.
- [ ] Treść, styl, geometria, widoczność, kolejność, zdjęcie i jakość nadal odświeżają JPG.
- [ ] Spóźniony wynik nie zastępuje aktualnego; szeregowana kolejka nadal działa.
- [ ] Pobierany jest dokładnie Blob odpowiadający aktualnej kompozycji i jakości.

## Etap 5 — nawigacja klawiaturą w panelach

### FN-07 — brak spójnego wejścia i powrotu fokusu

- Istotność: **Medium**. Kategoria: dostępność. Pewność: **High** dla brakującej
  obsługi w kodzie; działanie czytników ekranu wymaga sprawdzenia.
- Miejsca: `src/components/layout/floating-panel.tsx`,
  `src/features/photo/photo-workspace.tsx`, `src/features/caption/color-picker-panel.tsx`.
- Dowód: niemodalny dialog obsługuje Escape, lecz nie cel początkowy i powrót fokusu.
  Panel jest przed sidebarowym przyciskiem otwarcia w DOM. Panel koloru ma własny
  częściowy mechanizm powrotu, niespójny z pozostałymi.
- Scenariusz: otwarcie fontów klawiaturą pozostawia fokus na przycisku, a Tab prowadzi
  dalej po sidebarze. Zamknięcie panelu usuwa aktywny element bez wskazania następnego.
- Skutek: trudne dotarcie do panelu i utrata miejsca w nawigacji.
- Wymaganie: przewidywalny cel początkowy i powrót po zamknięciu; dostęp do edytora
  i pozostałych narzędzi pozostaje możliwy.
- Zalecane podejście: wspólny kontrakt fokusu, z bezpiecznym fallbackiem, gdy przycisk
  otwarcia przestał istnieć. Zweryfikować właściwą semantykę dialogu/regionu.
- Kompromis: nie dodawać automatycznie modalnej pułapki fokusu; uwzględnić Tiptap i Radix.

### Kryteria odbioru etapu 5

- [ ] Tagi, fonty, kolory, ikony i presety mają sprawdzony przepływ klawiatury.
- [ ] Escape i przycisk zamknięcia przywracają fokus do sensownego miejsca.
- [ ] Przełączanie paneli i usunięcie przycisku otwarcia nie gubią fokusu.
- [ ] Wstawianie tagów/ikon zachowuje zapamiętany cel edycji.
- [ ] Reprezentatywne interakcje są udokumentowane w Storybooku i chronione testem.
- [ ] Ręczny test czytnika ekranu jest wykonany albo jawnie wymieniony jako luka.

## Etap 6 — przewijanie podczas przeciągania warstw

### FN-08 — przewijany jest niewłaściwy element

- Istotność: **Low**. Kategoria: interakcje UI. Pewność: **High**.
- Miejsca: `src/components/ui/picker-list.tsx` — onPointerMove;
  `src/features/photo/photo-workspace.tsx` — wewnętrzny scroll host sidebara.
- Dowód: PickerList zmienia scrollTop najbliższego aside, ale overflow-y-auto
  znajduje się na wewnętrznym div.
- Scenariusz: przeciągać warstwę poza widoczny fragment długiej listy.
- Skutek: zamierzone automatyczne przewijanie nie przesuwa właściwej listy.
- Wymaganie: można przeciągnąć warstwę do niewidocznej początkowo pozycji.
- Zalecane podejście: jawny scroll host lub poprawne rozpoznanie przewijalnego przodka.
- Kompromis: dodatkowy parametr komponentu usuwa zależność od konkretnego znacznika
  layoutu. Zweryfikować również nieruchomy wskaźnik przy krawędzi.

### Kryteria odbioru etapu 6

- [ ] Długa lista przewija się podczas przeciągania w obu kierunkach.
- [ ] Upuszczenie ustawia właściwą kolejność i zachowuje wybór oraz geometrię.
- [ ] Escape, pointercancel i utrata pointer capture mają bezpieczny przebieg.
- [ ] Obsługa Arrow Up/Down, Home i End nadal działa.

## Weryfikacja przy implementacji

Pierwotny zakaz uruchamiania kodu dotyczył audytu. Implementacja zleconego etapu
wymaga kontroli wskazanych w dokumentacji projektu:

- `pnpm check`.
- Odpowiednie E2E Chromium/WebKit dla zmienionego przepływu; szczególnie presety,
  import, schowek i eksport.
- `pnpm build-storybook` i przegląd stories przy zmianach komponentów/interakcji.
- Nie regenerować automatycznie wzorców eksportu w celu zaakceptowania regresji.
- Nie deklarować zaliczenia kontroli, których nie wykonano. Zapisać ograniczenia.

## Granice zakresu i architektura do zachowania

- Zachować wspólną geometrię podglądu/JPG, reguły jednostek i anchorów,
  niezależne ustawienia wystąpień obrazów oraz kolejkę LatestJob.
- Zachować lokalne przetwarzanie zdjęć i kontrolę usuwania metadanych przy eksporcie.
- Poprawa FN-01 nie oznacza zgody na pełne migracje/Zod (NTH-002).
- Nie dodawać wspólnego Tooltip ani przycisków kolejności odłożonych w NTH-001/003.
- Nie rozpoczynać przy okazji batcha, zoom/pan, desktopu ani migracji do monorepo.
- Granice persistence, wyboru plików, dekodowania i zapisu wyniku warto projektować
  jako małe adaptery. Nie tworzyć jednego szerokiego serwisu platformowego.
- Docelowy runtime desktopowy pozostaje niewybrany. Domena i UI mogą być współdzielone;
  uprzywilejowane operacje powinny mieć wąskie, walidowane kontrakty.

## Dalsze rekomendacje — wymagają osobnego zakresu

Poniższe obserwacje nie są dodatkowymi zatwierdzonymi etapami:

- Zamknięcie historycznych ścieżek Caption.logo/LogoControls/renderowania zgodnie
  z osobno prowadzonym `INLINE_LOGO_PLAN.md`, po ocenie równoważności geometrii.
- Ujednolicenie aktualnej dokumentacji i oddzielenie historii. Przykład rozbieżności:
  CAPTION_TAGS.md opisuje iso bez prefiksu, kod i testy zwracają ISO 400.
- Doprecyzowanie typów danych schowka i wyniku migrateLogo; ograniczenie powtórzeń
  serializacji copy/cut tam, gdzie poprawia to spójność.
- Stories błędów, opóźnień, niedostępnego magazynu i długich list. Sam build
  Storybooka ani addon a11y w trybie todo nie dowodzą pełnego wykonania testów.

## Pytania i pomiary, których audyt nie rozstrzyga

| Obszar                       | Potrzebny dowód lub decyzja                                                                                                     |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Pamięć i wydajność           | Profil 24–50 MP, dużych PNG, cache canvasów i seryjnych zmian. Dirty presetów klonuje/serializuje zasoby; koszt wymaga pomiaru. |
| Szybkie importy zdjęć        | Pomiar równoległego dekodowania; odrzucenie wyniku nie anuluje rozpoczętej pracy.                                               |
| Zmiana wymiarów zdjęcia      | Ustalić zachowanie dużych marginesów px po przejściu na mniejsze zdjęcie.                                                       |
| Wąskie ekrany i powiększenie | Test reflow z otwartym panelem, podglądem i sidebarem.                                                                          |
| Dostępność                   | Kontrast, cele dotykowe, nakładanie uchwytów, czytnik ekranu i pełna ścieżka klawiatury.                                        |
| SVG                          | Osobna weryfikacja polityki namespace, stylów, odwołań i złożoności; brak dowodu XSS w audycie.                                 |
| Kolory                       | Pliki Adobe RGB/Display P3 i pomiary w docelowych przeglądarkach.                                                               |
| Schowek systemowy            | Rzeczywiste kopiowanie między kartami/aplikacjami; syntetyczny ClipboardEvent nie wystarcza.                                    |
| Automatyzacja                | Potwierdzenie uruchamiania play stories i kontroli dostępności.                                                                 |
| Zależności                   | Zewnętrzna weryfikacja podatności nie była częścią audytu; nie przypisano niezweryfikowanych CVE.                               |
| Advercase                    | Dokument licencji przed dystrybucją; README wskazuje brak licencji w otrzymanym archiwum.                                       |

## Dziennik realizacji

- 2026-10-25: zapisano wymagania i plan na polecenie użytkownika. Bez implementacji,
  uruchamiania kontroli i commita.

### Etap 1 — wykonanie 2026-10-25

- Wspólny adapter PresetStore zatwierdza zmiany na najnowszej kolekcji; zapis
  przechodzi ten sam parser co odczyt. Nazwa kopii mieści się w 80 znakach.
- Błędne wpisy pozostają w magazynie obok poprawnych; dostępny jest komunikat
  i pobranie oryginalnej kolekcji. Uszkodzona struktura całej kolekcji blokuje zapis.
- Błąd magazynu nie publikuje nowego stanu. Limit pliku liczony jest w bajtach.
- Weryfikacja: pnpm check (214 testów), 8/8 E2E presetów Chromium/WebKit,
  build Storybooka. Nowy E2E potwierdza graniczną nazwę, odświeżenie i retencję
  uszkodzonego wpisu. Ręczny przegląd stories nie był wykonywany.
- Zakres współbieżności: operacje jednej instancji aplikacji; synchronizacja
  niezależnych kart przeglądarki nie została dodana.
- Użytkownik zezwolił na commit i automatyczne przejście po pomyślnej weryfikacji.

### Etap 2 — wykonanie 2026-10-25

- Nowa warstwa otrzymuje pustą kolekcję obrazów, duplikat tylko użyte zasoby.
- Model dokumentu i presety przechowują aktywne zasoby. Zamontowany edytor
  zachowuje osobną kolekcję dla undo/redo, także po usunięciu ostatniego tokenu.
- Polityka: do 100 aktywnych obrazów; cache historii do 1000 zasobów i 64 MB
  zakodowanych źródeł. Przekroczenie daje jawny błąd; zmiana warstwy zwalnia
  historię tej instancji edytora. Limit nie jest pomiarem pamięci zdekodowanych grafik.
- Test schowka zaczyna od rzeczywiście pustej warstwy. Test obejmuje również
  odtworzenie usuniętej grafiki i jej rozmiaru przez undo.
- Weryfikacja: pnpm check (216 testów), 10/10 E2E obrazów i presetów
  Chromium/WebKit, build Storybooka. Ręczny przegląd stories niewykonany.

### Etap 3 — wykonanie 2026-10-25

- Import pliku, schowek i import presetu używają wspólnego przygotowania obrazów:
  walidacja struktury, limitów, dekodowania i rzeczywistych wymiarów PNG.
- Wstawianie chroni rewizja dokumentu; dowolna zmiana treści anuluje operację
  z komunikatem. Zmiana samego zaznaczenia nie przenosi celu wklejania.
- Usunięcie warstwy i zniszczenie edytora odrzucają spóźniony wynik.
- Schowek waliduje węzły, remapuje kolidujące ID i zachowuje tekstowy fallback.
- Workspace ładuje zasoby używane przez widoczne warstwy, zachowuje poprawne
  wyniki niezależnie od błędnych, identyfikuje błąd grafiki i blokuje niepełny JPG.
- Testy schowka używają syntetycznych ClipboardEvent; systemowy schowek między
  aplikacjami pozostaje ograniczeniem weryfikacji.
- Weryfikacja: pnpm check (216 testów), 18 scenariuszy E2E Chromium/WebKit
  zaliczonych (17 w przebiegu głównym, poprawiony scenariusz obrazów ponownie
  2/2). Regresja pikseli JPG bez zmiany wzorców. Build Storybooka zaliczony;
  ręczny przegląd stories niewykonany.
