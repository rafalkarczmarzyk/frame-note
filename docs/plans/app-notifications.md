# Stos powiadomień aplikacji

Stan: wdrożone i zweryfikowane, do odbioru, 2026-11-06. Baza: `a3896b0`, produkt
`0.10.0-beta`. Użytkownik zlecił wykorzystanie formy komunikatu aktualizacji
zamiast osobnego bannera i jednoczesne wyświetlanie komunikatów w stosie.

## Zakres i kryteria

- AC-01: ostrzeżenie konfiguracji nie przesuwa paska tytułu ani nie nachodzi
  na natywne przyciski macOS; krótka treść i Open Settings otwierają pełną
  diagnostykę w istniejącym dialogu.
- AC-02: błędy aplikacji, konfiguracja i aktualizacja współdzielą jeden stos
  pod toolbarem. Jednoczesne komunikaty są jeden pod drugim, z niezależnymi
  akcjami i zamknięciem; wąskie okno zawija treść, długi stos przewija się.
- AC-03: zamknięcie ostrzeżenia nie usuwa diagnostyki w Settings. Udany zapis
  naprawiający konfigurację usuwa ostrzeżenie; informacja o aktualizacji pozostaje.
- AC-04: wspólny komponent ma Storybook (Stacked/Narrow); istniejące sześć
  scen UI i JPG pozostaje bez rozszerzania zestawu i bez zmiany wzorców.

Wspólny UI web/desktop; przyczyna zgłoszona na macOS. Bez zmian formatu
presetów v1, konfiguracji i mechanizmu sprawdzania aktualizacji. Zmiana
odpowiada poprawce PATCH; pozostaje w Unreleased przyszłego 1.0.0.
Lokalny commit autoryzowany. Bez podbijania wersji, taga, push i wydania.
Odbiór działania pozostaje osobnym statusem.

## Weryfikacja

- Typy, lint, tokeny, wersje, format i `git diff --check`: PASS.
- `pnpm test`: PASS — 547 testów (78 plików), JPG 1/1, UI 6/6. Wzorce bez zmian.
- Build web, Storybook i desktop: PASS.
- Natywny smoke macOS: PASS, także na finalnej kompilacji. Istniejący test błędnej/nowszej konfiguracji obejmuje
  jednoczesny update, geometrię 800/1440 px, Open Settings oraz niezależne
  zamykanie. Update pochodzi z lokalnego mocka IPC, bez kontaktu z GitHubem.
- Obejrzano oba natywne zrzuty `framenote-notification-stack-800.png` oraz
  `framenote-notification-stack-1440.png` w katalogu tymczasowym macOS.
  Komunikaty pod toolbarem, bez kolizji, treść zawija się w 800 px.

AC-01–04 wdrożone; kontrole stosu i Settings PASS. Odbiór użytkownika
pozostaje otwarty. Windows/Linux i interaktywna kontrola Storybook Narrow
niewykonane. Testowana baza: `0.10.0-beta · a3896b0 dirty`. Bez wydania.
