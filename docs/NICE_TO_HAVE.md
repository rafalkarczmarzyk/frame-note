# Nice to have

Pomysły świadomie odłożone przez użytkownika. Ta lista nie jest zatwierdzonym
zakresem ani kolejką do automatycznej realizacji. Wdrożenie wymaga osobnego
polecenia. Nowe decyzje dopisujemy lub aktualizujemy w istniejącym wpisie.

## NTH-002 — Wersjonowane schematy presetów i migracje

- **Status:** odłożone.
- **Data decyzji:** 2026-10-25.
- **Źródło:** rozmowa o zgodności presetów podczas refaktoru logo i dodawania PNG.
- **Pomysł:** osobne schematy Zod dla kolejnych wersji formatu, jawne migracje
  starszych presetów do aktualnej wersji oraz komunikaty dla nieobsługiwanych
  wersji. Walidacja zawartości SVG i PNG pozostaje dodatkowym krokiem.
- **Decyzja na teraz:** projekt jest w developmencie; format presetów można
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

## NTH-004 — Separatory poziome w treści warstwy

- **Status:** odłożone do czasu po obsłudze teł.
- **Data decyzji:** 2026-10-28.
- **Źródło:** rozmowa o tłach; użytkownik zaakceptował wydzielenie separatorów
  poza bieżącą implementację.
- **Pomysł:** linia w osobnym wierszu na pełną szerokość treści warstwy,
  z ustawieniami wyglądu i odstępów; padding tła pozostaje poza szerokością linii.
- **Przy powrocie:** ustalić wymiarowanie warstwy zawierającej sam separator.
  Rozdzielić obrys treści i tła w geometrii. Wpis nie upoważnia do implementacji.
