# Nice to have

Pomysły zgłoszone przez użytkownika; nie są kolejką do automatycznej
realizacji. Wpisy identyfikujemy nazwami, bez numeracji. Wykonane wpisy usuwamy;
historia pozostaje w Git i changelogu. Domyślny status: **odłożone**.
Wybrane pozycje należą do [zakresu 1.0](plans/release-1.0.md); plan opisuje
stan realizacji i pozostałą pracę.

## Kompozycja zdjęcia

### Ramki i polaroidy

Decyzja: 2026-11-03, rozmowa o przyszłych funkcjach. Ramki wokół zdjęcia,
w tym szerszy dolny pas na podpis. Crop jest osobnym, niezależnym pomysłem.
Przy powrocie ustalić geometrię, jednostki, rozmiar eksportu i zachowanie warstw
na zdjęciu i ramce oraz po wyłączeniu ramki.
Wpływ: web/desktop, presety, podgląd i eksport seryjny.

### Niezależny crop

Decyzja: 2026-11-03, rozmowa o proporcjach polaroidów. Kadrowanie do wybranych
proporcji ma działać niezależnie od ramek; ramka nie wymusza cropu.
Przy powrocie ustalić zapis kadru per zdjęcie, wpływ na warstwy i presety oraz
zachowanie w serii. Wpływ: web/desktop, geometria zdjęcia i eksport.

### Powtarzany watermark

Decyzja: 2026-11-04, rozmowa o watermarkach pokrywających całe zdjęcie.
Nakładka powtarzana według wzoru na całej powierzchni zdjęcia, jak kafelkowana
tekstura. Edycja jako jedna warstwa, w edytorze tekstowym z możliwością dodania
własnej grafiki; własna grafika jest preferowaną formą watermarku.
Opcje wzoru: kąt (np. 45°), liczba powtórzeń, gęstość/odstępy i krycie.
Przy powrocie ustalić relację liczby powtórzeń do gęstości, skalowanie wzoru
do wymiarów zdjęcia oraz zapis w presetach.
Wpływ: web/desktop, model warstw, podgląd i eksport seryjny.

## Widok edytora

### Powiększanie i przesuwanie widoku

Status: **zakres 1.0** (decyzja 2026-11-04).

Decyzja: 2026-11-04, burza mózgów o ramkach do zdjęć. Osobny pomysł na
powiększanie i przesuwanie widoku zdjęcia, z suwakiem powiększenia podobnym
do Lightroom Classic oraz miniaturą Navigator wskazującą aktualnie oglądany
obszar. Szybkie przełączanie na dopasowanie całego zdjęcia do widoku i zoom 100%.
Funkcja dotyczy widoku edytora, nie zmiany rozmiaru zdjęcia ani eksportu.
Przy powrocie ustalić interakcje przesuwania widoku i warstw, znaczenie 100%
na ekranach HiDPI oraz dopasowanie całej kompozycji po dodaniu ramki.
Wpływ: wspólny edytor web/desktop. Niezależne od pomysłu ramek;
nie ustalono zależności ani kolejności implementacji.

## Desktop

### Zapisywanie sesji

Status: **zakres 1.0** (decyzja 2026-11-04).

Decyzja: 2026-11-04, rozmowa o zapamiętywaniu otwartych plików i ich ustawień.
Możliwość zapisania i przywrócenia sesji obejmującej otwarte pliki oraz ustawienia
każdego zdjęcia. Przy zamykaniu aplikacji pytanie, czy zapisać sesję.
Zapisana sesja zawiera bieżący stan edycji, bez historii cofania/ponawiania.
Obecna historia edycji pozostaje wyłącznie w pamięci bieżącej sesji i nie
będzie częścią zapisanego pliku sesji.
Przy powrocie ustalić sposób przywracania, zakres zapisywanych ustawień oraz
zachowanie, gdy pliki źródłowe zostaną przeniesione lub usunięte.
Wpływ: desktop, zapis stanu edytora i obsługa zamykania aplikacji.

## Proces rozwoju

### Ochrona master i wymagany pipeline PR

Status: **odłożone** (decyzja 2026-11-04).

Kontekst: rozmowa o obowiązkowych PR i gotowości do wydania po merge.
Ochrona `master`, wszystkie zmiany przez PR oraz wymagane testy i budowanie
aplikacji przed merge. Nie rozpoczęto implementacji; do ustalenia pozostaje
podział kontroli między PR i wydanie oraz ewentualne ponowne użycie paczek.
Obecny proces: [GitHub Releases](DEVELOPMENT.md#github-releases).
