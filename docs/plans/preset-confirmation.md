# Potwierdzenia i formularz presetów

Aktualny stan wzorców: sześć scen UI i JPG zaktualizowano, zweryfikowano
i zaakceptowano 2026-11-06; commit `a3896b0`. Starsze opisy różnic i oczekiwania
na akceptację wzorców poniżej są dowodami historycznymi. Odbiory funkcjonalne
niewykonane ręcznie zachowują osobny status. Bieżący zakres i kontrole:
[plan 1.0](release-1.0.md).

Stan: implementacja. Data: 2026-11-06.
Autoryzowane: potwierdzanie usuwania w Manage presets, wspólny komponent
ConfirmationDialog dla aplikacji i odrzucania zmian; osobna ramka formularza
nazwy przy tworzeniu/zmianie nazwy, input na całą szerokość. Export/Import poza ramką.
Branch: codex/layer-effects; zachowana trwająca praca nad efektami i Quartz Date.

## Zakres i zgodność

Wspólny web/desktop, bez zmian natywnych i zapisanych danych, format v1.
Wersja obecna 0.10.0-beta bez podbicia; sam zakres odpowiada PATCH przyszłego wydania.
Etap implementacji i weryfikacji autoryzowany; potem ocena użytkownika.
Lokalny commit autoryzowany przez użytkownika 2026-11-06; bez zgody na push/wydanie.

## Kryteria i wynik

- AC-01: Delete pyta o konkretny preset; Cancel/Escape zachowują dane.
- AC-02: potwierdzenie usuwa tylko wskazany preset, zachowuje kompozycję zdjęcia;
  podczas zapisu blokuje powtórne potwierdzenie, błąd zapisu pozostaje widoczny.
- AC-03: wspólny dialog obsługuje też odrzucanie zmian, klawiaturę i fokus;
  interaktywne Storybook oraz istniejąca scena prepared photo session.
- AC-04: ramka nazwy obejmuje input pełnej szerokości i Save/Cancel;
  Export/Import pozostają poza nią.

- AC-05: Duplicate tworzy roboczą kopię wskazanego zapisanego presetu; dopiero Save
  dodaje ją do listy. Cancel odrzuca kopię, kompozycja i wybór bez zmian.
  Zmiana autoryzowana przez użytkownika 2026-11-06.

- AC-06: usunięcie aktywnego presetu wybiera pierwszy wbudowany Photo Details,
  bez zmiany bieżącej kompozycji. Autoryzowane przez użytkownika 2026-11-06.

Weryfikacja: 24 testy domeny/presetów PASS, lint, typy, format, tokeny i wersja PASS.
Build web i Storybook PASS. Chromium: robocza kopia/Cancel, Save, Cancel/Escape
usuwania, powrót fokusu PASS przed porównaniem sceny. Osobny przebieg potwierdził
kopię zapisanej kompozycji Digital Date przy aktywnym Photo Details oraz zachowanie
danych i widoczny błąd przy nieudanym usunięciu. Obejrzano ramkę i dialog.
Sześć scen: 6 różnic wzorców; expected/actual/diff obejrzane — wcześniejsze zmiany
presetów i efektów (nazwy, treść, fonty, sekcja Effects i ramka ustawień).
JPG: eksport wygenerowany, porównanie FAIL (39651 pikseli), zmieniony podpis;
expected/actual/diff obejrzane. Wzorców nie aktualizowano.
Natywnego desktopu nie uruchamiano w tej korekcie; wspólny renderer web/desktop.
AC-06 PASS w Chromium: po usunięciu wybranej kopii zaznaczone Photo Details,
treść kompozycji zachowana. Lint, typy i format po korekcie PASS. Odbiór użytkownika otwarty.
Build: 0.10.0-beta, baza 08bb9a7, dirty. Lokalny commit autoryzowany; bez push/wydania.
