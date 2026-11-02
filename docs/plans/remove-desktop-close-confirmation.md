# Usunięcie potwierdzenia zamknięcia desktopu

## Stan i zakres

- Stan: zaimplementowane; użytkownik zlecił commit i push z opisanym zastrzeżeniem regresji tooltipa.
- Cel: desktop zamyka okno i kończy aplikację bez pytania o porzucenie sesji,
  również przy otwartych zdjęciach i niezapisanych zmianach układu.
- Zakres: usunięcie natywnego dialogu oraz mechanizmu służącego wyłącznie
  do jego wyzwalania; aktualizacja dokumentacji desktopu.
- Desktop: zmiana zachowania zamykania. Web i wspólne modele: bez zmian.
- Poza zakresem: warunkowe ostrzeganie o niezapisanym układzie, autosave,
  odtwarzanie sesji i zmiany zachowania importu lub eksportu.
- Mała, izolowana poprawka na master. Commit i push autoryzowane 2026-11-02;
  bez zlecenia pakowania ani publikacji aplikacji.

## Wersja i zgodność

- Obecna wersja: `0.2.0-beta`.
- Prognoza: `0.2.1-beta` (PATCH — uproszczenie zamykania desktopu).
  Do ponownego sprawdzenia przy zleconym commicie, jeśli zmieni się baza.
- Sam plan nie podbija wersji ani nie wymaga wpisu w changelogu.
- Format presetów v1 pozostaje bez zmian; brak migracji i wpływu na czytniki.

## Kryteria akceptacji

| AC    | Obserwowalne zachowanie                                                                  | Weryfikacja                                                     | Wynik / akceptacja     |
| ----- | ---------------------------------------------------------------------------------------- | --------------------------------------------------------------- | ---------------------- |
| AC-01 | Zamknięcie pustego okna i okna ze zdjęciami nie pokazuje potwierdzenia.                  | Desktop: ręcznie oraz odpowiedni scenariusz testu desktopowego. | Niewykonane / oczekuje |
| AC-02 | Quit z menu i Cmd+Q kończą aplikację bez pytania, również po zmianie układu bez zapisu.  | Ręcznie na macOS.                                               | Niewykonane / oczekuje |
| AC-03 | Dokumentacja opisuje zamykanie bez potwierdzenia; web zachowuje dotychczasowe działanie. | Przegląd diffu, dokumentacji i kontrole projektu.               | Niewykonane / oczekuje |

## Jeden etap wdrożenia — zaimplementowany

1. Usunąć obsługę potwierdzenia w `apps/desktop/main.cjs`, flagę `hasWork`
   i odbiornik `session-state`. Zachować pozostałe użycia `dialog`.
2. Usunąć `setSessionOpen` z preloadu i deklaracji mostka oraz obserwator DOM
   raportujący obecność canvasu w `apps/desktop/src/main.tsx`.
3. Poprawić `docs/DESKTOP.md` i dodać angielski wpis Removed w Unreleased
   po wdrożeniu zachowania.
4. Zweryfikować zmianę i przekazać użytkownikowi do oceny.

## Weryfikacja i ocena

- Plan kontroli: `pnpm check`, `pnpm test:desktop`, `pnpm test:visual`.
  Bez zmian wspólnych komponentów i styli nie potrzeba `--all-projects`.
- Scenariusz desktopowy powinien sprawdzać zamknięcie z otwartym zdjęciem;
  sprawdzić, czy obecny test nie omija dialogu zamiast weryfikować jego brak.
- Ręczna ocena macOS według AC-01–02; tożsamość testowanego buildu zostanie
  zapisana podczas implementacji. Kontrola desktopowa została wykonana automatycznie; ręczna ocena użytkownika oczekuje.
- Usunięcie natywnego dialogu wymaga kontroli desktopu — webowa regresja
  wizualna sama nie potwierdzi nowego zachowania.

## Decyzje

- 2026-11-02: użytkownik zlecił zaplanowanie usunięcia komunikatu z desktopu.
  Wcześniejsza propozycja asystenta, by ograniczyć dialog do niezapisanych
  zmian, nie należy do tego planu.
- 2026-11-02: na prośbę użytkownika usunięto zbędne AC dotyczące trwałości
  presetów i plików oraz powiązane kontrole. Weryfikacja zachowania obejmuje
  zamykanie okna i aplikacji bez pytania.
- 2026-11-02: użytkownik zlecił implementację. Usunięto dialog, flagę, kanał
  raportowania sesji i obserwator DOM; poprawiono dokumentację oraz changelog.
  Ocena użytkownika i wydanie pozostają do wykonania. Brak autoryzacji commita
  i działań zdalnych.

### Wyniki wdrożenia

- Build: `0.2.0-beta`, baza `bc507a1`, lokalne zmiany (dirty), macOS.
- `pnpm desktop:build`: PASS.
- `pnpm test:desktop`: PASS, w tym natywne zamknięcie okna z otwartymi zdjęciami;
  próba pokazania potwierdzenia powoduje teraz błąd testu.
- AC-01: automatycznie potwierdzono zamknięcie okna ze zdjęciami; pozostałe
  warianty do ręcznej oceny. AC-02: do ręcznej oceny Quit i Cmd+Q.
- AC-03: dokumentacja i diff sprawdzone; kod webu bez zmian.
- Kontrole formatowania, wersji, kolorów, lint i typów: PASS.
- 403 testy jednostkowe: PASS.
- Pierwsze `pnpm check` zatrzymane przez brak dostępu do lokalnych serwerów;
  ponowiono z właściwym dostępem.
- Pierwsze `pnpm test:visual`: 5/7 PASS; pusta scena miała błąd zapisu artefaktów
  podczas nakładających się uruchomień, scena hover marginesu różnicę tooltipa.
  Obejrzano expected/actual/diff; wzorców nie zmieniono.
- Końcowe `pnpm check`: FAIL wyłącznie przez scenę `left margin hover`
  w chromium-desktop (4810 pikseli różnicy tła tooltipa). 20/21 scen wizualnych
  PASS, w tym pusta scena po usunięciu konfliktu uruchomień. Różnica dotyczy
  webowego tooltipa; kod webu i wspólnego edytora nie był zmieniany.
- 182 testy E2E Chromium/WebKit: PASS.
- 12 testów szkła Chromium/WebKit i build Storybooka: PASS.
- Osobne `pnpm build`: PASS (w `pnpm check` build jest po testach, więc
  nie zostałby wykonany po niepowodzeniu regresji wizualnej).
- Bez zmian wzorców, wersji, commita i publikacji. Ręczna ocena użytkownika
  pozostaje otwarta, szczególnie puste okno oraz Quit/Cmd+Q.

## Poprawa uruchamiania testów desktopowych — 2026-11-02

- Na polecenie użytkownika dodano kontrolę środowiska przed uruchomieniem
  Electrona: znacznik Codex Seatbelt lub kontenera aplikacji kończy test błędem
  z instrukcją poprawnego uruchomienia, bez startowania procesu GUI.
- AGENTS.md i docs/DESKTOP.md wymagają w Codex odpowiedniego dostępu od
  pierwszej próby; nie wolno omijać kontroli przez usuwanie znaczników.
- Start aplikacji przeniesiono do try/finally; profil i eksporty testowe są
  sprzątane również po błędzie startu lub zamknięcia.
- Weryfikacja: 5 testów kontroli środowiska PASS, lint, typy i formatowanie PASS.
  Rzeczywisty test w ograniczonym środowisku zatrzymany przed startem Electrona.
  Pełne pnpm test:desktop z dostępem do sesji graficznej PASS.
- Zmiana dotyczy testów i procesu, bez podbicia wersji i wpisu wydania.

## Zapisanie i wysłanie zmian — 2026-11-02

- Użytkownik zlecił „commit i push” po przedstawieniu wyników i ograniczeń.
- Wersja docelowa: 0.2.1-beta, PATCH za usunięcie potwierdzenia zamknięcia.
  Zsynchronizowano manifesty workspace i przeniesiono wpis do datowanej sekcji
  changeloga. Poprawa testów nie wymaga osobnego podbicia ani wpisu wydania.
- Znana różnica tooltipa pozostaje; bez aktualizacji wzorców. Nie deklarujemy
  wykonania ręcznej oceny Quit/Cmd+Q przez użytkownika.
- Zlecony zakres Git: commit na master, lokalny tag v0.2.1-beta oraz push master
  i tego tagu do origin. Bez pakowania, podpisywania i publikacji aplikacji.
