# Nice to have

Pomysły świadomie odłożone przez użytkownika. Ta lista nie jest zatwierdzonym
zakresem ani kolejką do automatycznej realizacji. Wdrożenie wymaga osobnego
polecenia. Nowe decyzje dopisujemy lub aktualizujemy w istniejącym wpisie.

Przegląd i reorganizacja: 2026-11-03, na podstawie kodu i changeloga 0.3.3-beta.

## Jak czytać listę

- **ID** pozostaje stałe przy przenoszeniu i zmianie statusu wpisu. Nie zmieniamy
  numerów ani nie wykorzystujemy ponownie historycznych identyfikatorów.
- **Grupa** określa obszar produktu; jej pozycja nie oznacza priorytetu.
- **Typ** opisuje charakter pomysłu, a **wpływ** wskazuje platformy i części
  aplikacji, które trzeba uwzględnić przy planowaniu. To wstępna ocena zakresu,
  nie wycena trudności ani gotowy plan implementacji.
- **Status** opisuje stan otwartego pomysłu. Wykonane wpisy usuwamy z listy;
  historię realizacji przechowują Git, changelog i dokumentacja funkcji.
- Propozycje agenta pozostają oznaczone osobno od decyzji użytkownika.

## Przegląd

| Grupa                        | ID      | Pomysł                     | Główny wpływ                          | Stan     |
| ---------------------------- | ------- | -------------------------- | ------------------------------------- | -------- |
| Kompozycja i edycja zdjęcia  | NTH-008 | Ramki i polaroidy          | Płótno, presety, eksport              | Odłożone |
| Kompozycja i edycja zdjęcia  | NTH-009 | Niezależny crop            | Kadr zdjęcia, pozycje warstw, eksport | Odłożone |
| Kompozycja i edycja zdjęcia  | NTH-010 | Obszary odniesienia warstw | Pozycjonowanie, marginesy, presety    | Odłożone |
| Ustawienia i wygoda desktopu | NTH-005 | Plik konfiguracji          | Zapis i przenoszenie preferencji      | Odłożone |
| Ustawienia i wygoda desktopu | NTH-006 | Zapamiętywanie okna        | Geometria okna i monitory             | Odłożone |
| Identyfikacja wizualna       | NTH-007 | Nowy logotyp               | Zasoby marki i UI                     | Odłożone |

## Kompozycja i edycja zdjęcia

### NTH-008 — Ramki zdjęć, dolny pas na podpis i układy typu polaroid

- **Typ:** funkcja kompozycji zdjęcia.
- **Wpływ:** web i desktop; UI, geometria płótna, wspólny model, presety oraz eksport JPG i seryjny.
- **Status:** odłożone; analiza przyszłego zakresu.
- **Data decyzji:** 2026-11-03.
- **Źródło:** rozmowa o przyszłych funkcjach i przeglądzie NTH.
- **Pomysł użytkownika:** ramki wokół zdjęć, w tym układ typu polaroid oraz
  wariant z dodatkowym dolnym pasem, na którym można pisać.
- **Granica zakresu:** ramka nie wymusza kadrowania ani konkretnej proporcji
  zdjęcia; crop pozostaje niezależną, opcjonalną operacją (NTH-009).
- **Zależność:** możliwość równoczesnego umieszczania warstw na zdjęciu
  i na ramce wymaga określenia obszaru odniesienia pozycji (NTH-010).
- **Propozycja agenta, nie zatwierdzony zakres:** osobne szerokości czterech
  boków i kolor ramki; polaroid jako preset z szerszym dołem. Ramka powiększa
  płótno wokół zdjęcia. Podpis korzysta z istniejących warstw tekstowych,
  tokenów i grafik, zamiast osobnego edytora podpisów ramki.
- **Przy powrocie:** uzgodnić jednostki ramki, docelowe wymiary eksportu,
  zachowanie zbyt długiego tekstu oraz wyłączenia ramki z przypisanymi warstwami.
  Wspólny zakres dla webu i desktopu; sprawdzić presety i eksport seryjny.

### NTH-009 — Niezależne kadrowanie zdjęcia

- **Typ:** edycja zdjęcia.
- **Wpływ:** web i desktop; UI kadrowania, stan zdjęcia, geometria warstw i eksport; zakres zapisu w presetach do ustalenia.
- **Status:** odłożone; analiza przyszłego zakresu.
- **Data decyzji:** 2026-11-03.
- **Źródło:** rozmowa o proporcjach zdjęć w układach typu polaroid (NTH-008).
- **Pomysł użytkownika:** możliwość cropu do wybranych proporcji, niezależna
  od ramki. Ramka może działać także na zdjęciu bez cropu.
- **Propozycja agenta, nie zatwierdzony zakres:** kadrowanie niedestrukcyjne,
  z zachowaniem oryginału, swobodnym kadrem i blokadą proporcji, np. 1:1.
- **Przy powrocie:** ustalić stan kadru per zdjęcie, stosowanie presetów do
  różnych proporcji i batcha oraz zachowanie istniejących warstw po cropie.
  Oddzielić proporcje zdjęcia od proporcji całego wyniku z ramką.

### NTH-010 — Obszary odniesienia pozycji warstw: zdjęcie i ramka

- **Typ:** rozbudowa pozycjonowania warstw.
- **Wpływ:** web i desktop; wspólny model pozycji, marginesy, przeciąganie, presety oraz zgodność podglądu z eksportem.
- **Status:** odłożone; analiza przyszłego zakresu.
- **Data decyzji:** 2026-11-03.
- **Źródło:** użytkownik wskazał potrzebę rozbudowy anchorów dla podpisów
  na zdjęciu i na krawędziach obrazka (NTH-008).
- **Cel:** jednoczesne pozycjonowanie warstw na zdjęciu i w obszarach ramki.
- **Stan obecny:** anchory i pozycje ręczne odnoszą się do wymiarów zdjęcia;
  jednostka i cztery marginesy są wspólne dla całego układu.
- **Propozycja agenta, nie zatwierdzony zakres:** zachować siatkę 3 × 3,
  dodać wybór obszaru odniesienia, np. zdjęcie, dolny pas lub całe płótno.
  Pozycje ręczne również odnoszą się do wybranego obszaru. Oddzielić padding
  obszaru od szerokości ramki i od paddingu tła istniejącej warstwy.
- **Przy powrocie:** ustalić pozostałe boki, podział narożników, zachowanie
  przy braku obszaru, przełączaniu obszarów, przeciąganiu i cropie. Osobno
  określić bazę procentowych rozmiarów fontów i grafik, by zmiana grubości
  ramki nie zmieniała ich przypadkowo.
- **Zgodność:** rozszerzenie wspólnego modelu i presetów wymaga oceny nowej
  wersji formatu, migracji v1 i zachowania starszych czytników; obowiązujące
  zasady opisuje [dokumentacja presetów](PRESET_VERSIONING_PLAN.md).

### Powiązania i propozycja kolejności dla NTH-008–010

NTH-010 jest fundamentem pozycjonowania dla NTH-008; zachowuje osobne ID,
aby można było śledzić zakres i decyzje. NTH-009 pozostaje niezależnym pomysłem.

Najpierw uzgodnić geometrię zdjęcia, kadru i płótna oraz obszary odniesienia.
Pierwszy użyteczny etap może obejmować dolny pas i podpis na nim, następnie
pełną ramkę i preset typu polaroid. Niezależny crop może powstać później;
nie jest warunkiem dodania ramki. To propozycja do dyskusji, bez zgody na
implementację lub przejście do kolejnych etapów. Obecna wersja produktu to
0.3.3-beta; sam zapis planów nie wymaga podbicia wersji. Przyszłe funkcje
oznaczają MINOR od wersji aktualnej przy realizacji; numer formatu presetów
jest odrębną decyzją.

## Ustawienia i wygoda desktopu

### NTH-005 — Konfiguracja aplikacji w katalogu FrameNote

- **Typ:** przechowywanie ustawień.
- **Wpływ:** desktop; trwały zapis preferencji i ewentualne przenoszenie istniejących ustawień. Bez zmiany formatu presetów i obrazu wynikowego.
- **Status:** odłożone.
- **Data decyzji:** 2026-10-31.
- **Źródło:** rozmowa o plikowym zapisie presetów przed pierwszą betą.
- **Pomysł:** własny katalog FrameNote w katalogu domowym użytkownika może
  w przyszłości przechowywać również konfigurację aplikacji.
- **Decyzja na teraz:** katalog i pliki presetów należą do bieżącego planu;
  plik konfiguracji oraz przenoszenie ustawień pozostają na później.
- **Przy powrocie:** ustalić zakres ustawień, wersjonowanie konfiguracji i sposób
  przeniesienia obecnych preferencji. Układ katalogu opisuje
  [PRESET_VERSIONING_PLAN.md](PRESET_VERSIONING_PLAN.md).

### NTH-006 — Zapamiętywanie rozmiaru i położenia okna desktopowego

- **Typ:** wygoda pracy z oknem.
- **Wpływ:** desktop; uruchamianie okna, zapis jego geometrii i obsługa monitorów. Bez wpływu na zdjęcia, presety i eksport.
- **Status:** odłożone.
- **Data decyzji:** 2026-11-01.
- **Źródło:** plan fontów systemowych i większego okna desktopowego.
- **Pomysł:** przywracanie ostatniego rozmiaru i położenia okna.
- **Decyzja na teraz:** stały rozmiar startowy, ograniczony dostępnym obszarem
  ekranu; bez zapamiętywania geometrii.
- **Przy powrocie:** ustalić przechowywanie i zachowanie po zmianie monitorów.
- **Plan:** [system-fonts-and-preset-files.md](plans/system-fonts-and-preset-files.md).

## Identyfikacja wizualna

### NTH-007 — Zmiana logotypu po rezygnacji z fontu

- **Typ:** identyfikacja wizualna.
- **Wpływ:** zasoby marki i miejsca użycia logotypu w UI. Bez zmiany modelu zdjęcia i presetów; zakres ikon aplikacji i instalatora do uzgodnienia.
- **Status:** odłożone.
- **Data decyzji:** 2026-11-02.
- **Źródło:** plan usunięcia RetiredDisplay ze względów licencyjnych.
- **Decyzja użytkownika:** logotyp zmieni się później; obecnie jest SVG,
  nie dołącza pliku fontu. Na start usuwamy font i dostosowujemy typografię UI.
- **Przy powrocie:** uzgodnić nowy logotyp i zakres wymiany zasobów. Wpis nie
  stanowi oceny prawnej obecnego SVG ani zgody na redesign.
- **Przegląd 2026-11-03:** nadal aktualne; font usunięto z dostarczanej
  biblioteki w 0.3.0-beta, zmiana logotypu pozostaje osobnym pomysłem.
- **Plan:** [Usunięcie fontu i redesign](plans/typography-cleanup.md).
