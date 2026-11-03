# Audyt licencji — wynik i granice

Audyt z 2026-11-03, początkowa baza `7062c77`, produkt 0.3.3-beta.
To datowany zapis dowodów, nie bieżący inwentarz ani certyfikat całej dystrybucji.
Obowiązujące deklaracje: [LICENSING](../../LICENSING.md).
Budowanie źródeł: [SOURCE_DISTRIBUTION](../SOURCE_DISTRIBUTION.md).

## Wynik i otwarte kwestie

GPL-3.0-or-later wdrożono dla własnego kodu; zdjęcia mają osobne warunki.
Notices bibliotek i runtime są dostarczane lokalnie. Nie ukończono pełnego audytu
źródeł wszystkich natywnych składników Electron/Chromium dla wszystkich platform
ani pełnego odtworzenia finalnych instalatorów ze źródeł w tym zadaniu.
Samo dołączenie notices nie zamyka tych kwestii.

Prawa do wyłączonych grafik (m.in. rt.png, ikona, tekstura i własne wektory)
nie zostały potwierdzone tym audytem. Logotyp FrameNote i canon.svg wyłączono
z dalszego sprawdzania na polecenie użytkownika; nie oznacza to nadania im GPL
ani potwierdzenia praw. Nie usuwać tych ograniczeń na podstawie samej akceptacji UI.

## Dowody i metoda

- `git shortlog -sne --all`: jeden zadeklarowany autor, Rafał Karczmarzyk,
  154 commity. Najstarszy dostępny commit ma datę 2026-10-24. Proponowany zapis
  dla własnego kodu: Copyright (c) 2026 Rafał Karczmarzyk. Git nie dowodzi praw
  do zapożyczonego kodu lub materiałów.
- Przejrzano manifesty workspace, konfigurację Vite, obie ścieżki pakowania,
  publikator GitHub Releases, dokumentację fontów, zdjęć i zmian typografii,
  nagłówki licencji ExifReader i Lucide oraz odwołania do zasobów.
- [Inwentarz](open-source-license-inventory.json) zawiera dokładne wersje,
  deklaracje i skróty SHA-256 manifestów oraz plików licencji dla 134 lokalnie
  zainstalowanych pakietów. Zebrano też ścieżki i SHA-256 146 śledzonych zasobów
  rastrowych, SVG, fontów i ikon aplikacji.
- Pakiety zebrano od root dependencies, core/zod i electron, rekurencyjnie po
  obowiązkowych dependencies, rozwiązując rzeczywiste katalogi pnpm. Nie było
  brakujących obowiązkowych zależności w tym przejściu.
- Ten zbiór jest konserwatywnym rozpoznaniem zależności, nie listą elementów
  finalnego bundle: obejmuje narzędzia budowania wpisane do dependencies oraz
  downloader Electrona. Nie obejmuje kompletu opcjonalnych zależności, peerów,
  natywnych składników i wszystkich narzędzi dev. W etapie 2 trzeba ustalić
  rzeczywistą zawartość builda oraz pełnego archiwum źródeł, w tym opcjonalny
  `@xmldom/xmldom` ExifReadera i biblioteki natywne narzędzi.

## Aktualizacja po wdrożeniu — 2026-11-03

- Użytkownik zaakceptował rozdzielenie GPL kodu i osobnych warunków zdjęć
  poleceniem „rob”. Warunki zapisano w licenses/PHOTOGRAPHS.txt i LICENSING.md.
- Zachowano brak deklaracji o prawach do wyłączonych grafik. Nie traktować
  tego zadania jako potwierdzenia zgodności wszystkich materiałów repozytorium.
- Brakujący tekst MIT react-remove-scroll-bar pozyskano z upstream commita
  `7301c160fda44cb8cf2b9fdfde61efad35736196`, gdzie autor dodał LICENSE.
- Vite generuje notices na podstawie faktycznych modułów. Build adaptera dopisuje
  swój graf, w tym opcjonalny @xmldom/xmldom. Desktop: 93 rekordy składników.
- [Sprawdzone źródła bibliotek](open-source-library-sources.json): dokładne wersje,
  przypięte commity/URL-e i SHA-256 pobranych archiwów. Dwa gitHead nieosiągalne
  zastąpiono dostępnymi commitami po zgodnej transpilacji wszystkich ośmiu modułów;
  generator sprawdza to ponownie przy przygotowaniu źródeł.
- Pobrano Electron 45.1.0. SHA-256 LICENSE:
  `5154e165bd6c2cc0cfbcd8916498c7abab0497923bafcd5cb07673fe8480087d`;
  LICENSES.chromium.html:
  `214152f78cc0b611f63ff8faefcc6670c4605ffbff05f092bb671e6df80ce741`.
  Pliki dołączane są bez zmian i dostępne offline w czytniku. Kontrola bajtów
  przeszła dla zasobów rozpakowanych i ASAR; uszkodzony LICENSE został odrzucony.
- Notices native zawierają także LGPL i licencje alternatywne. Nie ukończono
  pełnego audytu źródeł wszystkich natywnych składników Electrona dla wszystkich
  platform. Samo dołączenie notices nie jest stwierdzeniem spełnienia wszystkich
  obowiązków redystrybucji runtime. Szczegóły i ograniczenia w SOURCE_DISTRIBUTION.md.
- Test odczytu GPL, warunków zdjęć i pełnych notices native offline przeszedł
  w macOS. Wyniki pozostałych kontroli zapisano w planie zadania.
