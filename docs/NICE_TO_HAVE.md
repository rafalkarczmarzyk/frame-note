# Nice to have

Pomysły świadomie odłożone przez użytkownika. Ta lista nie jest zatwierdzonym
zakresem ani kolejką do automatycznej realizacji. Wdrożenie wymaga osobnego
polecenia. Nowe decyzje dopisujemy lub aktualizujemy w istniejącym wpisie.

## NTH-002 — Wersjonowane schematy presetów i migracje

- **Status:** podjęte — pierwszy oficjalny format v1 wdrażany przed betą.
- **Data decyzji:** 2026-10-31 (zastępuje wcześniejsze odłożenie).
- **Zakres:** parser Zod dla v1; przyszłe wersje wymagają osobnych schematów,
  migracji, skryptu konwersji i testów. Wersja formatu jest niezależna od SemVer.
- **Decyzja użytkownika:** stare JSON-y i dotychczasowe biblioteki nie są
  wspierane ani migrowane. Dotychczasowe techniczne numery nie wyznaczają wersji.
  Pierwszy oficjalny format to v1. Obsługa legacy i propozycja v3 są wycofane.
- **Plan:** [PRESET_VERSIONING_PLAN.md](PRESET_VERSIONING_PLAN.md).

## NTH-004 — Separatory poziome w treści warstwy

- **Status:** odłożone do czasu po obsłudze teł.
- **Data decyzji:** 2026-10-28.
- **Źródło:** rozmowa o tłach; użytkownik zaakceptował wydzielenie separatorów
  poza bieżącą implementację.
- **Pomysł:** linia w osobnym wierszu na pełną szerokość treści warstwy,
  z ustawieniami wyglądu i odstępów; padding tła pozostaje poza szerokością linii.
- **Przy powrocie:** ustalić wymiarowanie warstwy zawierającej sam separator.
  Rozdzielić obrys treści i tła w geometrii. Wpis nie upoważnia do implementacji.

## NTH-005 — Konfiguracja aplikacji w katalogu FrameNote

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
