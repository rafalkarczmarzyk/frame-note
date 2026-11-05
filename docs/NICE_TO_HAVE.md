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

### Mieszanie warstw

Status: **odłożone** (2026-11-05, rozmowa przy wdrożeniu Tiled).
Użytkownik chce na razie omówić opcje mieszania (m.in. Add, Subtract,
Multiply), a najpierw dokończyć powtarzany watermark. Przy powrocie ustalić
zestaw trybów, zakres działania wobec tła Glass i zgodność podglądu/eksportu.
Canvas ma Add (`lighter`) i Multiply, ale nie ma bezpośredniego Subtract.
Wpływ: web/desktop, model warstwy, presety i eksport; brak zgody na implementację.

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
