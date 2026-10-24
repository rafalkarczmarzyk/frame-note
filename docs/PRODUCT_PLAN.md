# FrameNote — kontekst produktu, pre-MVP i MVP

Stan dokumentu: 24 października 2026. Pre-MVP zostało zaakceptowane przez
użytkownika i zapisane w commicie `9a627af` na branchu `master`.

Ten dokument przekazuje kontekst kolejnym agentom. Opisuje wykonane prace,
ustalone założenia i kierunek rozwoju. Propozycje MVP poniżej nie oznaczają
zgody na ich automatyczne wdrożenie.

## 1. Problem i cel

FrameNote służy do tworzenia podpisów na zdjęciach na podstawie ich metadanych.
Użytkownik eksportuje JPG z Lightroom Classic, przeciąga go do aplikacji,
ustawia podpis na podglądzie i pobiera gotowy JPG z tekstem utrwalonym w pikselach.
Nie chodzi wyłącznie o zapis tagów EXIF w pliku.

Punktem wyjścia był plugin LR/Mogrify. Najważniejsze problemy użytkownika:

- Ograniczona lista pól do podpisu, szczególnie brak dostępu do EXIF UserComment.
- Brak podglądu zmian na żywo.
- Ograniczone stylowanie i całkowite wartości procentowe rozmiaru fontu.
- Rozmiar w pikselach daje niespójną wielkość podpisu na zdjęciach po różnym cropie.
- Potrzeba własnych presetów, np. macro, stack macro i wildlife.

Rozwiązanie ma zapewniać szeroki dostęp do metadanych i wygodniejsze stylowanie.
Nie obiecujemy odczytu dosłownie wszystkich możliwych tagów: obsługa zależy od
parsera i tego, jakie metadane Lightroom zachował podczas eksportu.

## 2. Ustalenia wspólne

- Najpierw aplikacja przeglądarkowa. React + Vite + TypeScript + Tailwind CSS.
- Przetwarzanie zdjęć lokalnie w przeglądarce. Backend i konto nie są potrzebne
  do obecnego przepływu.
- Główna platforma użytkownika to macOS. W przyszłości możliwe opakowanie
  desktopowe, z możliwością budowania również na Windows i Linux.
  Nie wybrano obowiązkowo Electron ani Tauri; Rust nie jest obecnie wymagany.
- Interfejs aplikacji po angielsku; rozmowa i dokumentacja mogą być po polsku.
- Rozmiar fontu oraz marginesy są ułamkowymi procentami krótszego boku zdjęcia,
  niezależnymi od rozmiaru okna i skali podglądu.
- Podgląd i eksport mają korzystać z tej samej geometrii i zasad renderowania.
- Preferujemy reużywalne komponenty UI i ich dokumentację w Storybooku.

## 3. Pre-MVP — cel i ukończony zakres

Celem było wykonanie całego przepływu na jednym zdjęciu, z jednym podpisem
edytowanym tekstowo przez tokeny `{group:name}`. Wielu kontenerów świadomie
nie wprowadzono do tego etapu.

### Etapy realizacji

Poniższe nazwy syntetycznie opisują wykonane etapy; szczegóły kodu opisuje README.

| Etap | Zakres                                                              | Status    |
| ---- | ------------------------------------------------------------------- | --------- |
| 1    | Bootstrap, narzędzia jakości i podstawowy interfejs                 | Ukończony |
| 2    | Model zdjęcia, podpisu i metadanych; fixture i utils                | Ukończony |
| 3    | Import JPG, metadane, podgląd zdjęcia                               | Ukończony |
| 4    | Szablon tokenów, renderowanie podpisu i podstawowy eksport          | Ukończony |
| 5    | Stylowanie, pozycjonowanie i wygodne wstawianie tagów               | Ukończony |
| 6    | Jakość JPG, dokładny rozmiar pliku i regresja eksportu              | Ukończony |
| 7    | Stabilizacja, limity importu, dodatkowa przeglądarka i dokumentacja | Ukończony |

W trakcie iteracji dodano także accordiony, pływający panel narzędzi,
wspólne kontrolki i Storybook.

### Dostępny przepływ

1. Wybór lub przeciągnięcie jednego JPG.
2. Odczyt metadanych przez ExifReader i podgląd na canvasie.
3. Wpisanie wieloliniowego podpisu, np. `{exif:Artist}`, i wstawianie tokenów z listy.
4. Ustawienie fontu, grubości, rozmiaru, koloru, opacity, interlinii i wyrównania.
5. Wybór anchora 3 × 3 oraz marginesów.
6. Wybór jakości i sprawdzenie dokładnego rozmiaru przygotowanego wyniku.
7. Pobranie JPG w rozdzielczości zdekodowanego oryginału z utrwalonym podpisem.

Lista tagów ma wyszukiwanie, osobny scroll i oznaczenie użytych tokenów.
Wstawianie pamięta kursor/zaznaczenie, także po wyszukiwaniu tagu.
Brakujące pola są raportowane i wymagają potwierdzenia przy eksporcie.

Jakość JPG: Small 60%, Balanced 75%, Best 95% (domyślnie) i suwak 1–100%.
Rozmiar wyniku pochodzi z rzeczywistego kodowania, a pobieranie używa tego samego
Bloba. Wynik większy od wejścia jest oznaczony ostrzeżeniem.

### Znane ograniczenia

- Jeden JPG i jeden blok podpisu. Wymiana zdjęcia resetuje ustawienia podpisu.
- Brak zapisanych presetów użytkownika i importu/eksportu presetów.
- Brak specjalnego parsera Helicon, batcha, swobodnego przesuwania podpisu,
  zoom/pan i aplikacji desktopowej.
- Fonty podpisu: Montserrat i Advercase, Regular/Bold.
- Brak automatycznego zawijania lub zmniejszania zbyt długiego podpisu.
- Maksymalnie 100 MB, 50 MP i 16 384 px na bok. Limity nie gwarantują wystarczającej
  pamięci na każdym urządzeniu.
- JPG jest ponownie kodowany. Źródłowe EXIF/IPTC/XMP/GPS i ICC nie są kopiowane.
  Obrót jest utrwalany w pikselach, Canvas używa domyślnego sRGB.
- Zweryfikowano dostarczone zdjęcia sRGB. Inne profile wymagają osobnych testów.
- Duże zdjęcia mogą chwilowo obciążyć główny wątek; kodowanie nie działa w workerze.

### Weryfikacja przy zamknięciu

- 87 testów jednostkowych: modele, metadane, tokeny, geometria, kolejka,
  format rozmiaru, preferencje i limity.
- Dwa scenariusze E2E w Chromium i WebKit: eksport oraz cykl importu/wymiany/błędów.
- Regresja wizualna pikseli eksportu w macOS/Chromium dla zdjęcia poziomego i pionowego.
- Kontrola wymiarów, rozmiaru w bajtach, jakości, kolorów sRGB i EXIF Orientation 6.
- Build aplikacji i Storybooka; renderowanie 40 stories oraz interakcje Select i Slider.

WebKit nie jest równoznaczny z ręcznym testem aplikacji Safari. Wzorce Chromium
nie stanowią wzorców dla innych silników lub systemów.

## 4. MVP — oczekiwania i proponowany zakres

Użytkownik określił minimalny cel jako odtworzenie potrzebnych możliwości pluginu
LrC, z dostępem do pól metadanych i lepszym stylowaniem. Podstawowy przepływ
został wydzielony i wykonany jako pre-MVP. Szczegółowa lista etapów MVP nie została
jeszcze zatwierdzona; poniżej rozdzielamy potrzeby od propozycji implementacji.

### Potrzeby zgłoszone przez użytkownika

- Własne presety dla różnych zastosowań: macro, stack macro, wildlife itp.
- Dostęp do UserComment, w tym informacji zapisywanych przez Helicon Focus.
- Rozpoznanie formatu komentarza Helicon i propozycja czytelnego formatowania.
  Przykład z rozmowy: `Stacked from 49 images. Method=B (R=8,S=4)`.
  Dokładna składnia, warianty i sposób prezentacji wymagają weryfikacji na plikach.
- Docelowo kontenery z anchorami 3 × 3 lub dowolną pozycją na zdjęciu;
  anchor zmienialny w dowolnym momencie. W kontenerze pola i sterowanie ich
  stylowaniem oraz wyrównaniem w osiach.
- Możliwość dodawania kilku zdjęć w przyszłości.

### Propozycja MVP do zatwierdzenia

Najbliższy użyteczny przyrost to powtarzalna praca na jednym zdjęciu przy użyciu
własnych presetów. Nie trzeba od razu budować edytora wielu kontenerów.

| Proponowana kolejność                | Efekt                                                                     | Decyzje przed implementacją                                |
| ------------------------------------ | ------------------------------------------------------------------------- | ---------------------------------------------------------- |
| 1. Presety użytkownika               | Zapis, nazwa, wybór, aktualizacja i usuwanie szablonu ze stylem i pozycją | Trwałość, format danych, zachowanie przy zmianie zdjęcia   |
| 2. Przenoszenie presetów             | Import/eksport wersjonowanego pliku z walidacją                           | Czy wymagane do pierwszego MVP                             |
| 3. Formatowanie metadanych           | Przydatne formatowanie wartości, w tym rozpoznawanie Helicon              | Składnia tokenów, fallback, zakres obsługiwanych wariantów |
| 4. Weryfikacja codziennego przepływu | Preset działa na różnych cropach i obu orientacjach; stabilny eksport     | Reprezentatywne zdjęcia i kryteria akceptacji              |

To propozycja kolejności, nie zlecenie realizacji. Wielokontenerowy edytor,
batch i desktop powinny dostać osobne uzgodnienie zakresu.

### Proponowane kryteria ukończenia MVP

- Można stworzyć preset dla konkretnego zastosowania, wrócić do niego po restarcie
  aplikacji i zastosować do kolejnego zdjęcia.
- Podpis zachowuje względny rozmiar i pozycję na zdjęciach po różnych cropach.
- Wybór pola nie jest ograniczony do ręcznie przygotowanej listy popularnych tagów;
  dostępne są pola odczytane z danego pliku.
- Brakujące metadane oraz nierozpoznane komentarze mają przewidywalne zachowanie,
  bez cichej utraty treści.
- Podgląd i eksport pozostają zgodne; regresja eksportu nadal przechodzi.
- Zakres formatowania Helicon i ewentualny import/eksport presetów jest jawnie
  zatwierdzony albo odłożony przed zamknięciem MVP.

## 5. UX i design system — zachować przy rozwoju

- Minimalistyczny ciemny interfejs, bez neonowych przycisków i nadmiaru zaokrągleń.
- Header: logo SVG, akcje; eksport w navbarze.
- Ekran startowy: krótki angielski hero w Advercase, wybór zdjęcia i informacja o DnD.
- Podczas przeciągania pliku: kontrastowy overlay, gruba przerywana zaokrąglona
  ramka odsunięta od krawędzi i komunikat upuszczenia.
- Po imporcie: przestrzeń canvasu pod headerem, główne narzędzia po prawej.
- Sekcje Photo, Caption, Typography, Position, Export zwijane niezależnie.
- Browse available tags należy do Caption.
- Pomocniczy panel tagów/fontów pływa nad canvasem, ma przydymione szkło i osobny
  scroll. Otwarcie panelu nie może zmieniać wymiarów zdjęcia.
- Wspólne prymitywy zamiast osobnych kopii kontrolek. Atomy i kompozycje w Storybooku.
- Montserrat dla interfejsu, Advercase dla ozdobnych nagłówków.
- Paleta: charcoal, slate, porcelain, tropical-mint. HEX tylko w definicjach
  `src/index.css`; komponenty korzystają z tokenów semantycznych.
- Logo i ikony SVG dziedziczą `currentColor`; wymiary i kolor przez Tailwind.
  Ikony: Lucide.

## 6. Zasady pracy dla agenta

1. Przeczytaj ten dokument, README i `docs/DESIGN_SYSTEM.md`. Sprawdź aktualny kod
   oraz status Git; dokument opisuje stan na wskazany dzień i może się zestarzeć.
2. Implementuj uzgodniony etap, przekaż do oceny i iteruj poprawki.
   Użytkownik sam potwierdza przejście do kolejnego etapu.
3. Polecenie wykonania jednego etapu nie upoważnia do realizacji całej roadmapy.
   Commit wykonuj na prośbę użytkownika.
4. Używaj pnpm. Główny branch to `master`. Aplikacja działa na porcie 3000,
   Storybook na 6006, E2E na 4173.
5. Logikę domenową i utils zabezpieczaj testami jednostkowymi od początku.
   Użytkownik nie chce dużej liczby kruchych E2E zależnych od szybko zmieniającego się UI.
   Zachowaj mały zestaw testów przepływu i regresję samego eksportu.
6. Nie regeneruj wzorców eksportu tylko dlatego, że test nie przeszedł.
   Zmianę wyniku trzeba wyjaśnić i obejrzeć.
7. Rozbudowuj istniejący design system i stories wraz z kontrolkami.
8. Nie deklaruj obsługi wszystkich EXIF, pełnej zgodności kolorystycznej lub
   wsparcia każdej przeglądarki bez odpowiednich danych i testów.

## 7. Punkty wejścia w repozytorium

- [README](../README.md): uruchomienie, komendy, bieżące możliwości i ograniczenia.
- [Design system](DESIGN_SYSTEM.md): komponenty, panele i zasady rozbudowy.
- `src/domain`: modele dokumentu i metadanych.
- `src/features/photo`: import, metadane i kompozycja przestrzeni roboczej.
- `src/features/caption`: tokeny, geometria, renderowanie i eksport.
- `src/components/ui`, `src/components/layout`: komponenty współdzielone.
- `tests/fixtures`: oryginalne zdjęcia LrC i ich oczekiwane parametry.
- `e2e`: przepływy Playwright i wzorce eksportu.

Przed oddaniem zmian: `pnpm check`. Dla zmian przepływu/renderowania także
`pnpm test:e2e`; dla design systemu `pnpm build-storybook` i przegląd stories.
