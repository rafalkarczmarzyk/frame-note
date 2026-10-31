# Nice to have

Pomysły świadomie odłożone przez użytkownika. Ta lista nie jest zatwierdzonym
zakresem ani kolejką do automatycznej realizacji. Wdrożenie wymaga osobnego
polecenia. Nowe decyzje dopisujemy lub aktualizujemy w istniejącym wpisie.

## NTH-002 — Wersjonowane schematy presetów i migracje

- **Status:** podjęte ponownie — wymagane przed pierwszą betą; implementacja nieukończona.
- **Data decyzji:** 2026-10-25.
- **Źródło:** rozmowa o zgodności presetów podczas refaktoru logo i dodawania PNG.
- **Pomysł:** osobne schematy Zod dla kolejnych wersji formatu, jawne migracje
  starszych presetów do aktualnej wersji oraz komunikaty dla nieobsługiwanych
  wersji. Walidacja zawartości SVG i PNG pozostaje dodatkowym krokiem.
- **Historyczna decyzja przy odłożeniu:** projekt jest w developmencie; format presetów można
  zmieniać bez gwarancji zgodności i migracji istniejących zapisów. Użytkownik
  dopuszcza utratę kompatybilności starszych presetów. Nie wdrażać teraz Zod
  ani nie rozbudowywać mechanizmu migracji.
- **Stan kodu przy odłożeniu:** parser ma już pole `version` i ręczną obsługę
  wersji 1/2; nie traktujemy tego jako stabilnego kontraktu formatu. Ta decyzja
  nie wymaga usuwania istniejącego pola ani kasowania zapisanych presetów.
- **Decyzja 2026-10-29:** podczas planowania monorepo, desktopu i dostępu do
  fontów systemowych użytkownik potwierdził, że na tym etapie nie rozbudowujemy
  systemów migracji presetów. Nie są warunkiem przygotowania wersji desktopowej
  ani obsługi dodatkowych fontów.
- **Przy powrocie do tematu:** ustalić pierwszą stabilną wersję formatu i zakres
  wspieranych starszych zapisów; dodać schematy, migracje i testy na zachowanych
  przykładach plików. Importować starsze presety, gdy możliwa jest migracja.
- **Decyzja 2026-10-31:** użytkownik wymaga przed pierwszą betą osobnego parsera
  Zod dla każdej wersji formatu i migracji starszych presetów do nowszych, na ile
  konwersja jest możliwa. Kolejne zmiany wersji formatu wymagają skryptu/modułu
  migracji. Zastępuje to wcześniejsze dopuszczenie braku zgodności. Plan i granice
  migracji: [PRESET_VERSIONING_PLAN.md](PRESET_VERSIONING_PLAN.md).

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
