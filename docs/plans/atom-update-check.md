# Sprawdzanie aktualizacji przez Atom

Stan: przygotowanie wydania 0.6.1-beta; ręczny odbiór niewykonany. Data: 2026-11-04.
Autoryzacja: implementacja, commit na `master`, następnie przygotowanie wydania patch 0.6.1-beta. Użytkownik
nie ma możliwości ręcznej weryfikacji i polecił zapisanie zmian na master.

## Przyczyna

Po wydaniu 0.6.0-beta checker w 0.5.0-beta zwracał ogólny błąd. Odtworzone
zapytanie REST otrzymało HTTP 403 (limit niezalogowanych zapytań dla IP), podczas
gdy Atom zawierał nowe wydanie. Starty aplikacji w testach mogły zużywać limit.
Feed unika limitu REST, ale nadal może być niedostępny lub ograniczany.

## Zakres i zgodność

Zastąpienie REST GitHuba publicznym feedem Atom. Sprawdzanie przy każdym starcie
zgodnie z istniejącą opcją oraz ręcznie. Walidacja XML, wersji i adresów własnego
repozytorium; brak automatycznej instalacji. Błędy pozostają nieblokujące.
Testy natywne, restarty i testy dystrybucji używają lokalnego pustego feedu,
bez zapytań aktualizacyjnych do GitHuba. Web i zapisane dane/presety bez zmian.
Wersja przygotowanego wydania: 0.6.1-beta (poprawa istniejącej funkcji).
Manifesty zsynchronizowane, zmiany w sekcji wydania changeloga.
Test wykrycia kolejnej wersji będzie możliwy po publikacji późniejszego wydania.

## Kryteria i wynik

| AC    | Obserwowalne zachowanie                                                             | Weryfikacja                                         | Wynik / odbiór                          |
| ----- | ----------------------------------------------------------------------------------- | --------------------------------------------------- | --------------------------------------- |
| AC-01 | Najwyższa nowsza wersja z Atom; obsługa beta i stable                               | testy jednostkowe                                   | PASS automatycznie; ręcznie niewykonane |
| AC-02 | Błędny XML/HTTP/sieć daje błąd, pusty feed brak aktualizacji; obce linki ignorowane | testy jednostkowe                                   | PASS automatycznie; ręcznie niewykonane |
| AC-03 | Każde uruchomienie i ręczne sprawdzanie zachowują istniejące działanie i opcję      | transport, smoke desktop, ocena ręczna              | PASS automatycznie; ręcznie niewykonane |
| AC-04 | Testy aktualizacji i wszystkie launchery testowe nie korzystają z prawdziwego feedu | test transportu, przegląd launcherów, smoke desktop | PASS automatycznie; ręcznie niewykonane |

## Przekazanie

Weryfikacja: 69 plików / 472 testy jednostkowe PASS; lint, formatowanie,
check:version, kontrola diff i desktop:compile (w tym TypeScript) PASS.
Natywny test macOS PASS, w tym ręczne sprawdzanie przy wyłączonym starcie.
Pierwszy przebieg wykazał nieaktualny mock JSON w teście konfiguracji;
po zastąpieniu lokalnym Atom i ponowieniu pełny przebieg przeszedł.
Launchery Windows/Linux i test restartów dev sprawdzone w kodzie, bez uruchamiania
ich osobnych zestawów. Brak zmian UI, więc testy wizualne i JPG nie były wymagane.
Implementacja: commit 4e4a9ec na master. Wydanie przygotowane jako 0.6.1-beta.
Kontrole wydania: wersje względem v0.6.0-beta, formatowanie, tokeny, lint,
TypeScript, 472 testy jednostkowe, JPG Chromium, 6 scen wizualnych Chromium,
build web, kompilacja desktop i kontrola 96 plików fontów/licencji PASS.
Obejrzano expected/actual/diff dwóch scen: jedyna różnica to numer wersji
w stopce; zaktualizowano wyłącznie te wzorce macOS. Pełny zestaw wizualny PASS.
Test natywny z poprzedniego etapu dotyczył 0.6.0-beta z tym samym refaktorem;
nie ponawiano go po zmianie numeru wersji. Lockfile nie zawiera wersji produktu
i nie wymaga zmiany. Publikacja i test zainstalowanego wydania pozostają niewykonane.

Odbiór ręczny desktop: sprawdzenie z menu, uruchomienie z włączoną/wyłączoną opcją,
przy błędzie sieci możliwość dalszej edycji. Brak zmian wyglądu.
Ręczna weryfikacja użytkownika niewykonana; polecenie integracji na master
nie jest dowodem ręcznego sprawdzenia. Użytkownik zlecił następnie wydanie patch, aby testować wykrywanie kolejnych aktualizacji.
