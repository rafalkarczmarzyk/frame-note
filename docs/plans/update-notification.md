# Powiadomienie o nowej wersji desktopu

## Stan i zakres

- Stan: przygotowane do oceny użytkownika; automatyczna weryfikacja wykonana,
  kontrola wizualna zablokowana przez brak zapisanych wzorców scen.
- Desktop: automatyczne sprawdzanie dostępności wydania przy starcie i trwałe
  powiadomienie w obszarze roboczym, u góry, wyśrodkowane.
- Uzgodniony wygląd: szklana powierzchnia jak istniejące tooltipy, ikona
  aktualizacji, informacja o wersji, przycisk otwierający stronę release na
  GitHubie oraz X. Komunikat nie znika sam.
- Wyłącznie desktop: web nie wykonuje zapytań o wydania i nie pokazuje
  powiadomienia o aktualizacji. Użytkownik wskazał, że web jest dostarczany
  w aktualnej wersji. Wspólny komponent UI może służyć desktopowi.
- Format presetów: bez zmian.
- Poza obecnym uzgodnieniem: instalacja aktualizacji, ręczne sprawdzanie w menu
  i About. Wcześniejsze propozycje agenta nie oznaczają akceptacji tych dodatków.
- Dodatkowa poprawka menu Electron: menu ręcznie zbudowane z potrzebnych poleceń;
  Help usunięte. Check for Updates… znajduje się w menu FrameNote pod About.
  Help i Edit usunięte. Zachowane: About, ukrywanie/kończenie aplikacji,
  otwieranie i eksport zdjęć, Close Window oraz sterowanie oknem.
- Autoryzacja: ustalanie zachowania i wyglądu; brak polecenia commita lub wydania.

## Wersja i zgodność

- Obecna wersja z manifestu: 0.4.0-beta.
- Prognoza: 0.4.1-beta — PATCH zgodnie z jawną decyzją użytkownika dla tego
  zadania, jako wyjątek od domyślnego MINOR dla nowej funkcji. Przeliczyć względem
  aktualnej wersji przy wprowadzaniu ukończonego zadania do master.
- Brak migracji i zmian formatu presetów.

## Kryteria akceptacji

| AC    | Zachowanie                                                                                                                           | Weryfikacja                                     | Stan        |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------- | ----------- |
| AC-01 | Desktop sprawdza wydania przy starcie; odpowiedź jest walidowana minimalnym schematem Zod, wersje przez SemVer z uwzględnieniem bet. | Testy logiki i desktop                          | Niewykonane |
| AC-02 | Nowsze wydanie pokazuje szklany komunikat u góry, na środku obszaru roboczego, z ikoną i numerem wersji.                             | Storybook, regresja wizualna, ocena użytkownika | Niewykonane |
| AC-03 | Komunikat pozostaje do zamknięcia przez X; nie przejmuje fokusu i nie zmienia układu edytora.                                        | Test UI, ocena użytkownika                      | Niewykonane |
| AC-04 | Przycisk otwiera stronę konkretnego wydania na GitHubie w przeglądarce systemowej.                                                   | Walidacja adresu, test desktop                  | Niewykonane |
| AC-05 | Błędy sieci, HTTP, JSON i nieprawidłowe dane nie przerywają pracy i nie pokazują fałszywej aktualizacji.                             | Testy obsługi błędów                            | Niewykonane |
| AC-06 | Web nie sprawdza wydań na GitHubie i nie wyświetla powiadomienia o aktualizacji.                                                     | Kontrola integracji platform i test web         | Niewykonane |

## Etapy i decyzje

1. Uzgodnienie zakresu i wyglądu — zakończone.
2. Implementacja funkcjonalności i walidacja odpowiedzi przez Zod — wykonana.
3. Testy jednostkowe na mockach odpowiedzi API — 5/5 przeszło.
4. Pozostała weryfikacja wizualna — uruchomiona, niezaliczona: brak 9 bazowych
   zrzutów dla Chromium desktop na macOS; wzorce nie były generowane.
5. Ocena użytkownika — oczekuje.

2026-11-03: użytkownik wybrał automatyczne sprawdzanie przy starcie oraz
położenie, materiał, ikonę, link do release i ręczne zamykanie komunikatu.
Propozycja ikony: Lucide `Download`; etykieta przycisku: `View release`.
To szczegóły proponowane przez agenta, nie osobne decyzje użytkownika.

2026-11-03: użytkownik określił zmianę jako PATCH zamiast proponowanego MINOR;
prognozę zmieniono z 0.5.0-beta na 0.4.1-beta. Manifesty pozostają bez zmian
do autoryzowanego wydania.

2026-11-03: użytkownik potwierdził wyłączny zakres desktopowy. Web nie ma
mechanizmu sprawdzania wydań ani komunikatu o nowej wersji.

2026-11-03: użytkownik zdecydował, że menu Help ma zostać całkowicie usunięte.
2026-11-03: użytkownik wskazał Check for Updates… pod About w menu FrameNote;
wdrożono też ręczne menu bez pełnych domyślnych `editMenu` i `windowMenu`.
2026-11-03: użytkownik zdecydował o usunięciu całego menu Edit.

## Weryfikacja i wydanie

Sprawdzany build: 0.4.0-beta, zmiany lokalne bez commita, macOS.

- Testy mocków: 5/5 zaliczone.
- `pnpm test:desktop`: zaliczone.
- `pnpm lint`, `pnpm typecheck`, `pnpm build`: zaliczone.
- Menu Electron: ręczne sprawdzenie pozycji w implementacji; pełna ocena UI menu
  oczekuje na użytkownika.
- `pnpm check`: zatrzymał się na formatowaniu dwóch niepowiązanych plików:
  `docs/EXPORT_VISUAL_TEST_PLAN.md` i `e2e/photo-export-matrix.spec.ts`.
- `pnpm test:visual`: 9/9 scen niedostępnych, bo brak ich oczekiwanych
  snapshotów dla Chromium desktop na macOS. Nie zapisano nowych wzorców.

Do oceny: uruchomić desktop, zasymulować odpowiedź API z nową wersją i sprawdzić
położenie, wygląd, przycisk release oraz zamknięcie X. Publikacja wymaga osobnego
polecenia po akceptacji. Commit, merge, push i pakowanie nieautoryzowane.
