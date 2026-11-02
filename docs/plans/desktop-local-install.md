# Budowanie i lokalna instalacja FrameNote na macOS

## Stan i zakres

- Stan: zaimplementowane narzędzia; weryfikacja automatyczna zakończona, instalacja w Applications nie była wykonywana.
- Cel: jedna komenda `pnpm desktop:install` buduje aktualny projekt i instaluje
  `FrameNote.app` w `/Applications`, również jako aktualizację istniejącej kopii.
- Zakres: lokalny skrypt instalacji, współdzielenie istniejącego
  pakowania `.app`, opcja pominięcia DMG oraz instrukcja w `docs/DESKTOP.md`.
- Dotychczasowe `desktop:package` i `desktop:package:signed` nadal tworzą DMG.
- Instalacja lokalna używa obecnego podpisu ad hoc i jego weryfikacji. Nie zmienia
  zabezpieczeń systemu ani ustawień podpisywania.
- Poza zakresem: instalator dystrybucyjny, automatyczne aktualizacje, publikacja,
  notaryzacja i zmiany UI. Zależności projektu muszą być wcześniej zainstalowane.
- Wpływ: narzędzia desktopu macOS Apple Silicon. Web, wspólne modele i dane
  użytkownika pozostają bez zmian.
- Autoryzowany etap: implementacja — polecenie „dodaj ten skrypt”. Mała zmiana
  narzędzi na istniejącym `master`, bez commita.

## Wersja i zgodność

- Aktualna wersja manifestu głównego: `0.2.1-beta` (2026-11-02).
- Jawna decyzja użytkownika z 2026-11-02: ta zmiana nie podbija SemVer.
  Nie zmieniamy wersji w manifestach i nie tworzymy tagu ani sekcji wydania dla tego
  zadania. Wersja podczas implementacji wynika z ówczesnego stanu repozytorium.
- Format presetów v1 pozostaje bez zmian; brak migracji. Instalacja nie modyfikuje
  `~/FrameNote/presets` ani profilu aplikacji.

## Zachowanie

1. Sprawdzić macOS, obsługiwaną architekturę, dostęp do katalogu docelowego i czy
   docelowa aplikacja jest zamknięta. Przy otwartej aplikacji zakończyć pracę
   z prośbą o ręczne zamknięcie; bez wymuszonego zamykania i utraty sesji.
2. Zbudować i spakować aktualne źródła do `.app`, bez tworzenia DMG i sterowania
   Finderem. Współdzielić kod pakowania zamiast tworzyć drugi zestaw ustawień.
3. Zweryfikować podpis i tożsamość aplikacji, skopiować ją do tymczasowej lokalizacji
   w katalogu docelowym i sprawdzić kopię przed zastąpieniem istniejącej instalacji.
4. Ponownie sprawdzić, czy aplikacja nie została uruchomiona. Przy aktualizacji
   zachować poprzednią kopię do zakończenia podmiany; przy błędzie przywrócić ją
   i zgłosić wynik. Nie nadpisywać obcego pakietu ani celu będącego symlinkiem.
5. Wypisać wynik i ścieżkę. Domyślnie nie uruchamiać aplikacji; opcja `--open`
   uruchamia dopiero poprawnie zainstalowaną kopię.

Domyślny cel to `/Applications/FrameNote.app`; opcja `--user` wybiera
`~/Applications/FrameNote.app`. Brak prawa zapisu kończy się czytelnym komunikatem
z alternatywą `--user`; skrypt nie uruchamia automatycznie `sudo` i nie zmienia
po cichu miejsca instalacji.

## Kryteria akceptacji

| AC    | Obserwowalne zachowanie                                                                                                               | Weryfikacja                                                                                    | Stan        |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ----------- |
| AC-01 | `pnpm desktop:install` buduje aktualne źródła i instaluje poprawną `.app` w `/Applications`, bez DMG.                                 | Lokalna instalacja na macOS, sprawdzenie podpisu i identyfikatora buildu.                      | Niewykonane |
| AC-02 | Ponowna instalacja zastępuje aplikację i zachowuje presety oraz profil.                                                               | Aktualizacja lokalnej kopii i kontrola danych przed/po.                                        | Niewykonane |
| AC-03 | Otwarta aplikacja, błąd budowania, weryfikacji lub kopiowania nie usuwa poprzedniej instalacji; błąd podmiany uruchamia przywracanie. | Kontrolowane scenariusze błędów w katalogu tymczasowym; ręczna kontrola otwartej aplikacji.    | Niewykonane |
| AC-04 | Brak dostępu daje czytelny błąd; `--user` instaluje w katalogu użytkownika. Obcy pakiet i symlink są odrzucane.                       | Kontrole instalacji i błędów na celach tymczasowych oraz instalacja użytkownika.               | Niewykonane |
| AC-05 | Aplikacja nie uruchamia się domyślnie; `--open` otwiera zainstalowaną kopię po sukcesie.                                              | Ręcznie na macOS.                                                                              | Niewykonane |
| AC-06 | Dotychczasowe pakowanie nadal tworzy i weryfikuje `.app` i DMG.                                                                       | `pnpm desktop:package`, kontrola wyników; podpis certyfikatem tylko przy dostępnej tożsamości. | Niewykonane |
| AC-07 | Dokumentacja opisuje wymagania, komendy, aktualizację i ograniczenia; wersja pozostaje bez zmian z tytułu tego zadania.               | Przegląd diffu i formatowania.                                                                 | Niewykonane |

## Etapy i weryfikacja

1. Plan — zapisany na polecenie użytkownika. Zachowanie szczegółowe powyżej jest
   propozycją do implementacji.
2. Implementacja narzędzi i dokumentacji — wykonana na polecenie użytkownika. Weryfikacja
   formatowania, ukierunkowane kontrole obsługi błędów i pakowania. Testy błędów
   wykonujemy na izolowanych kopiach, bez uszkadzania rzeczywistej instalacji.
3. Ocena na Macu — pierwsza instalacja, aktualizacja, odmowa przy otwartej aplikacji,
   zachowanie presetów i opcjonalne uruchomienie. Instalacja rzeczywistej aplikacji
   wymaga autoryzacji wykonania tego kroku; samo planowanie jej nie udziela.

Zmiana dotyczy narzędzi: nie wymaga regresji wizualnej ani pełnego cyklu akceptacji
UI. Kontrole uruchamiające Electron należy wykonywać z dostępem do sesji graficznej
zgodnie z AGENTS.md. Na etapie planowania nie wykonano buildów ani testów aplikacji.

## Commit i wydanie

- Commit autoryzowany poleceniem „commit” z 2026-11-02. Brak zgody na push
  i publikację. Bez zmiany wersji i bez tagu; narzędzia gotowe do użycia.
- Bez podbicia SemVer i bez tagu wersji zgodnie z decyzją użytkownika.
- Zastane zmiany w changelogu, teście panelu i panelu biblioteki treści nie należą
  do tego zadania i mają pozostać nienaruszone.

## Wyniki implementacji (2026-11-02)

- Dodano `desktop:install`, `--user`, `--open` i opcję pakowania `--no-dmg`.
- AC-02/03/04: 7 testów izolowanych przeszło: instalacja i aktualizacja,
  zachowanie sąsiednich danych, błąd weryfikacji kopii, uruchomienie aplikacji
  podczas kopiowania, rollback, błąd rollbacku z zachowaniem kopii oraz odmowa
  zastąpienia symlinka i obcego pakietu. Test danych nie zastępuje ręcznej kontroli
  rzeczywistych presetów po aktualizacji aplikacji.
- ESLint zmienionych skryptów/testu oraz typecheck i build desktopu: PASS.
- Wywołanie z nieznaną opcją: poprawna odmowa, kod wyjścia 1.
- Pierwsze pakowanie: brak dostępu sieciowego do GitHuba; ponowienie z dostępem
  do pobrania Electrona: PASS, `.app` i podpis ad hoc zweryfikowane bez DMG.
- Prawdziwa spakowana aplikacja: instalacja i aktualizacja w katalogu tymczasowym
  PASS, podpis źródła i obu kopii PASS, sąsiedni plik danych bez zmian. Pierwsza
  próba zatrzymana przez brak dostępu do listy procesów; ponowienie z tym dostępem
  zakończone sukcesem. Katalog testowy usunięty.
- Nie wykonywano instalacji w `/Applications` ani `~/Applications`, otwierania
  zainstalowanej aplikacji, pakowania DMG i podpisywania certyfikatem.
- W międzyczasie inna praca zmieniła bazową wersję repozytorium na `0.2.2-beta`.
  To zadanie jej nie zmienia; diff `package.json` dodaje wyłącznie komendę.
- Narzędzie pnpm przy pierwszym wywołaniu próbowało synchronizować zależności
  i odmówiło bez TTY. Kontrole wykonano lokalnymi binariami; build przez pnpm
  z jednorazowym `--config.verify-deps-before-run=false`.
