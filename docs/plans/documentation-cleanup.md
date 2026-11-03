# Porządki dokumentacji

Stan: wykonane, do odbioru, 2026-11-03. Użytkownik zaakceptował zakres audytu i polecił
wykonanie z planem. Wyłącznie dokumentacja i instrukcje agentów; bez zmian
aplikacji, wersji, changeloga wydania, commita i publikacji.

## Zakres i kolejność

1. Zachować aktualne reguły i otwarte kwestie w dokumentach tematycznych.
2. Usunąć 20 wskazanych historycznych planów/raportów; PRODUCT_PLAN zastąpić
   krótkim PRODUCT, instrukcję regresji nazwać UI_VISUAL_TESTS.
3. Skrócić instrukcje, poprawić Quick start, import/Copy/Paste, aktualizacje,
   metadane, presety oraz reguły utrzymywania dokumentacji.
4. Sprawdzić lokalne linki, stare odwołania, formatowanie i zakres diffu.

## Kryteria zakończenia

- Jedno główne miejsce dla każdej instrukcji; brak archiwum starych planów.
- Zachowane licencje, dowody audytu, decyzje odłożone i otwarte odbiory.
- Komendy i opisy funkcji zgodne z kodem 0.4.2-beta po uproszczeniu testów.
- Wszystkie lokalne odnośniki działają; zmiany obejmują wyłącznie dokumentację.

## Wynik

Usunięto 20 historycznych dokumentów, zastąpiono PRODUCT_PLAN krótkim PRODUCT
oraz zmieniono nazwę instrukcji UI. Zaktualizowano instrukcje i skille.
Zachowano pełne licencje i inwentarze audytu oraz otwarte kwestie: odbiór wzorców,
dowody operacji historii, ograniczenia audytu licencji i weryfikacji platform.

Sprawdzono format zmienionych Markdownów, lokalne linki i kotwice, odwołania
do usuniętych dokumentów oraz zakres diffu. Kod aplikacji, manifesty i binaria
bez zmian; w changelogu wyłącznie poprawiono odnośnik do kontekstu produktu.
Testy aplikacji nie są potrzebne do zmian tekstowych i nie były uruchamiane.
Plan pozostaje do odbioru; po zamknięciu jego historia może zostać tylko w Git.
