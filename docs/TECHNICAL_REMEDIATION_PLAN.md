# Audyt techniczny — pozostałe rekomendacje

Weryfikacja: 2026-10-25. Wszystkie poprawki z zatwierdzonych etapów FN-01–FN-08
oraz wykryte podczas końcowej kontroli pominięcie limitu przy wklejaniu tekstowym
zostały wdrożone, zweryfikowane i zapisane w Git. Historia pierwotnego audytu
oraz szczegóły etapów są dostępne w historii repozytorium.

Ostatnia poprawka sprawdza tekstowe wklejanie wspólną kontrolą retencji przed
zatwierdzeniem transakcji. Przekroczenie limitu 100 aktywnych obrazów pokazuje
komunikat i pozostawia dokument bez zmian. Test regresji obejmuje granicę 100/101,
zapis i ponowne użycie presetu oraz przechodzi w Chromium i WebKit.

Weryfikacja ostatniej poprawki: `pnpm check` (218 testów jednostkowych i build),
`pnpm test:e2e e2e/image-paste-limit.spec.ts` (2/2: Chromium, WebKit).
Commit: `745e6d5` (`fix: enforce image limit on plain text paste`).

Poniższe rekomendacje nie były zatwierdzonymi etapami. Nie są potwierdzonymi
błędami i wymagają osobnego uzgodnienia zakresu przed implementacją.

## Otwarte rekomendacje

Poniższe punkty z pierwotnego audytu nie były zatwierdzonymi etapami i nie są
potwierdzonymi dodatkowymi błędami wymagającymi implementacji w tym zadaniu:

- Domknięcie historycznej obsługi Caption.logo według `INLINE_LOGO_PLAN.md`.
- Ujednolicenie dokumentacji: `CAPTION_TAGS.md` nadal opisuje `{iso}` bez prefiksu,
  podczas gdy implementacja i testy zwracają `ISO 400`.
- Doprecyzowanie typów schowka i wyniku migrateLogo oraz ograniczenie powtórzeń
  serializacji copy/cut, jeśli poprawi to spójność.
- Dalsze stories błędów, opóźnień i niedostępnego magazynu oraz potwierdzenie
  automatycznego wykonywania interakcji stories i kontroli dostępności.

Nadal nie rozstrzygnięto pomiarów pamięci dla zdjęć 24–50 MP, równoległego
importowania zdjęć, zachowania dużych marginesów px po zmniejszeniu zdjęcia,
reflow i pełnej dostępności, osobnego przeglądu polityki SVG, zgodności kolorów
Adobe RGB/Display P3, rzeczywistego schowka między aplikacjami, zewnętrznego
audytu zależności ani licencji Advercase przed dystrybucją. Ręczny test czytnika
ekranu pozostaje niewykonany. Te ograniczenia nie są deklaracją wykrytych usterek.
