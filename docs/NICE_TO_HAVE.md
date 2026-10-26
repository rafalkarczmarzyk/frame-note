# Nice to have

Pomysły świadomie odłożone przez użytkownika. Ta lista nie jest zatwierdzonym
zakresem ani kolejką do automatycznej realizacji. Wdrożenie wymaga osobnego
polecenia. Nowe decyzje dopisujemy lub aktualizujemy w istniejącym wpisie.

## NTH-001 — Wspólny Tooltip i pomoc kontekstowa

- **Status:** zrealizowane w uzgodnionym zakresie — 2026-10-26.
- **Data decyzji:** 2026-10-25.
- **Źródło:** rozmowa o kompaktowaniu sekcji Margins; użytkownik zdecydował,
  żeby tooltipy zostawić na później.
- **Pomysł:** wspólny komponent pływającej pomocy zamiast stale widocznych
  objaśnień, z obsługą hoveru, fokusu klawiaturą, Escape i dopasowania do okna.
- **Możliwe zastosowania:** tryby None / Pairs / All, reset marginesów,
  znaczenie jednostek oraz wspólna powierzchnia etykiet uchwytów. Przy
  przeciąganiu nazwa i wartość pozostają widoczne oraz aktualizowane na żywo.
- **Przy powrocie do tematu:** przygotować izolowane stories dla etykiet,
  dłuższej pomocy, fokusu i położenia przy krawędziach okna.
- **Pierwotna granica zakresu (2026-10-25):** nie implementować wtedy ani nie usuwać istniejących
  etykiet uchwytów. Tooltipy nie blokują osobno planowanego kompaktowania
  Margins; w tym planie użytkownik odrzucił również samą ikonę zdjęcia
  w środku diagramu jako mylącą.

- **Decyzja 2026-10-26:** użytkownik zlecił wspólny tooltip liquid glass,
  przezroczysty jak custom picker, oraz użycie go przy kolorach. Zakres obejmuje
  hover, fokus, Escape, dopasowanie do okna i izolowane stories. Użytkownik 2026-10-27 zlecił także wszystkie pozostałe zastosowania z
  docs/TOOLTIP_PLAN.md: marginesy, pozycję, warstwy, treść, grafiki, header,
  presety i eksport. Wdrożono je w ramach tego planu.

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
- **Przy powrocie do tematu:** ustalić pierwszą stabilną wersję formatu i zakres
  wspieranych starszych zapisów; dodać schematy, migracje i testy na zachowanych
  przykładach plików. Importować starsze presety, gdy możliwa jest migracja.

## NTH-003 — Przyciski zmiany kolejności warstw

- **Status:** zrealizowane — 2026-10-26.
- **Data decyzji:** 2026-10-25.
- **Źródło:** użytkownik wybrał przeciąganie listy od początku, a przyciski na później.
- **Pomysł:** akcje przenieś wyżej, niżej, na sam spód oraz na sam wierzch.
- **Decyzja 2026-10-26:** użytkownik zlecił dodanie czterech akcji do menu
  warstwy podczas redesignu listy: Move up, Move down, Bring to front i Send to back.
  Akcje korzystają z tej samej kolejności co przeciąganie; na krańcach listy
  niedostępne kierunki są wyłączone. Nie dokładamy przycisków do samego wiersza.
