# Zakres do wersji 1.0

Stan: częściowo zrealizowany. Aktualizacja: 2026-11-04.
Cel: domknięcie pracy z edytorem przed wydaniem 1.0.

## Dostarczone

- **Historia edycji — 0.5.0-beta.** Wspólne Undo / Redo dla każdego zdjęcia,
  dostępne w webie i desktopie. Bieżące zachowanie opisuje
  [instrukcja użytkownika](../USER_GUIDE.md#undo-and-redo), a wydanie
  [changelog](../../CHANGELOG.md#050-beta---2026-11-04).
  Dowody weryfikacji i nadal otwarte kontrole ręczne pozostają w
  [planie historii edycji](edit-history.md).

## Pozostały zakres

- Zapisywanie sesji desktopu: otwarte pliki i bieżące ustawienia zdjęć,
  przywracanie sesji oraz pytanie o zapis przy zamykaniu aplikacji.
  Zapis sesji nie obejmuje historii Undo/Redo.
- Plik konfiguracyjny desktop: preferencje, limit kroków historii, geometria
  okna i ustawienie sprawdzania aktualizacji przy starcie.
- Powiększanie i przesuwanie widoku zdjęcia we wspólnym edytorze web/desktop.

Szczegóły i otwarte kwestie pozostałych funkcji pozostają w
[rejestrze pomysłów](../NICE_TO_HAVE.md). Ich implementacja nie została rozpoczęta.
Ramki i polaroidy, niezależny crop oraz powtarzany watermark pozostają
odłożone poza ten zakres.

## Dalsza praca

Przed implementacją pozostałych funkcji ustalić etapy, kolejność, kryteria
akceptacji i weryfikację według change-workflow. Kolejność powyższej listy
nie ustala kolejności prac. Docelowe wydanie: 1.0; plan nie zmienia obecnej
wersji produktu ani formatów danych. Zgodność zapisanych danych i presetów
wymaga oceny przy planowaniu poszczególnych funkcji.

Uzgodnienie pozostałego zakresu nie stanowi polecenia rozpoczęcia jego
implementacji, commita ani przygotowania lub publikacji wydania.
