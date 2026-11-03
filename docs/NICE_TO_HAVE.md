# Nice to have

Wyłącznie pomysły odłożone przez użytkownika; nie są kolejką do automatycznej
realizacji. ID są stałe i nie używamy ich ponownie. Wykonane wpisy usuwamy;
historia pozostaje w Git i changelogu. Wszystkie poniższe wpisy: **odłożone**.

## Kompozycja zdjęcia

### NTH-008 — Ramki i polaroidy

Decyzja: 2026-11-03, rozmowa o przyszłych funkcjach. Ramki wokół zdjęcia,
w tym szerszy dolny pas na podpis. Crop jest niezależny (NTH-009).
Jednoczesne warstwy na zdjęciu i ramce wymagają obszarów odniesienia (NTH-010).
Przy powrocie ustalić geometrię, jednostki, rozmiar eksportu i zachowanie warstw
po wyłączeniu ramki. Wpływ: web/desktop, presety, podgląd i eksport seryjny.

### NTH-009 — Niezależny crop

Decyzja: 2026-11-03, rozmowa o proporcjach polaroidów. Kadrowanie do wybranych
proporcji ma działać niezależnie od ramek; ramka nie wymusza cropu.
Przy powrocie ustalić zapis kadru per zdjęcie, wpływ na warstwy i presety oraz
zachowanie w serii. Wpływ: web/desktop, geometria zdjęcia i eksport.

### NTH-010 — Obszary odniesienia warstw

Decyzja: 2026-11-03, potrzeba podpisów na zdjęciu i krawędziach ramki.
Obecnie pozycje odnoszą się do zdjęcia, a jednostka i marginesy są wspólne.
Przy powrocie ustalić obszary, anchory, pozycje ręczne, bazę rozmiarów procentowych
oraz zachowanie przy cropie i braku ramki. Wpływ: web/desktop, wspólny model,
presety i eksport. Zgodność oceniać według [formatu presetów](PRESET_FORMATS.md).

## Desktop

### NTH-005 — Plik konfiguracji

Decyzja: 2026-10-31, rozmowa o plikowych presetach. Konfiguracja w katalogu
FrameNote pozostaje na później; obecnie są tam presety. Przy powrocie ustalić
zakres, wersjonowanie i przeniesienie preferencji z profilu aplikacji.
Miejsca danych opisuje [DESKTOP](DESKTOP.md#data-and-presets).

### NTH-006 — Pamiętanie geometrii okna

Decyzja: 2026-11-01, rozmowa o większym oknie. Przywracanie rozmiaru i położenia
pozostaje odłożone. Obecnie stały rozmiar startowy jest ograniczany ekranem.
Przy powrocie ustalić zapis i zachowanie po zmianie monitorów.

## Marka

### NTH-007 — Nowy logotyp

Decyzja: 2026-11-02, rezygnacja z fontu RetiredDisplay. Font usunięto;
logotyp SVG pozostaje do osobnego redesignu. Przy powrocie uzgodnić wygląd
oraz zakres wymiany ikon i materiałów. To nie jest ocena praw do obecnego SVG.
