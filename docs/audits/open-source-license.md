# Audyt przed dodaniem GPL-3.0-or-later

Data: 2026-11-03. Baza: `7062c77feb8fc273944bbf3b0333c48becfbcffc`,
produkt 0.3.3-beta, branch master. Jest to raport rozpoznania etapu 1,
nie deklaracja zgodności wydanych paczek ani nadanie licencji.

## Wynik

Poniższe rozpoznanie opisuje etap 1. Aktualizacja po wdrożeniu etapu 2 znajduje
się na końcu dokumentu; niektóre opisane braki zostały już uzupełnione.

Nie wykryto oczywistego konfliktu w deklaracjach zbadanych zależności z GPLv3.
Nie można jeszcze uznać całej dystrybucji za sprawdzoną: prawa do części
materiałów i zawartość finalnych binariów wymagają domknięcia. Nie dodano LICENSE,
nie zmieniono kodu, wersji, tagów ani opublikowanych wydań.

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

## Zależności i wymagane działania

| Zbiór               | Wynik rozpoznania                                 | Działanie do wdrożenia                                                                                                                 |
| ------------------- | ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| 123 deklaracje MIT  | Brak oczywistego konfliktu                        | Zachować oryginalne copyright i pełne teksty dla dostarczanych składników                                                              |
| 3 Apache-2.0        | class-variance-authority, detect-libc, sumchecker | Zachować licencje i ewentualne upstream NOTICE; odróżnić runtime od narzędzi                                                           |
| 3 ISC               | lucide-react, graceful-fs, semver                 | Zachować notices; Lucide wymaga także zachowania części MIT/Feather                                                                    |
| BSD-3-Clause i 0BSD | source-map-js, tslib                              | Zachować odpowiednie oryginalne warunki                                                                                                |
| MPL-2.0             | exifreader 4.52.0; lightningcss 1.32.0            | ExifReader trafia do aplikacji; zapewnić jego źródła i notices, nie zastępować MPL własną GPL. Lightning CSS jest narzędziem budowania |
| OFL-1.1             | Montserrat i biblioteka fontów                    | Zachować OFL i autorstwo, fonty pozostają na OFL                                                                                       |

MPL 2.0 umożliwia zgodność z GPL z zastrzeżeniami dotyczącymi oznaczeń
„Incompatible With Secondary Licenses”. W przeszukanych źródłach ExifReadera
nie znaleziono takiego dodatkowego oznaczenia poza tekstem samej licencji.
W finalnym zestawie zachować oryginalną MPL i dostęp do właściwych źródeł.
[GNU: zgodność MPL](https://www.gnu.org/licenses/license-list.html#MPL-2.0).

`react-remove-scroll-bar@2.3.8` deklaruje MIT, ale nie ma pliku LICENSE/COPYING/
NOTICE/COPYRIGHT w głównym katalogu zainstalowanej paczki. Przed dostarczeniem
notices pozyskać tekst z odpowiadającego wydania upstream wraz z autorstwem.
Próba odczytu surowego LICENSE pod tagiem `v2.3.8` zwróciła 404; nie podstawiać
bez sprawdzenia tekstu z bieżącej gałęzi.

Pełny LICENSE lucide-react zawiera ISC oraz informację o ikonach Feather na MIT.
Samo pole `license: ISC` nie wystarczy do wygenerowania kompletnego zestawu.

Electron npm 45.1.0 deklaruje MIT; potwierdzono też tekst upstream
[Electron v45.1.0 LICENSE](https://github.com/electron/electron/blob/v45.1.0/LICENSE).
Lokalnie brak `node_modules/electron/dist`: nie obejrzano plików prawnych binariów
Electron/Chromium, FFmpeg ani paczek macOS/Windows/Linux. Nie wolno uznać
licencji npm Electrona za licencję wszystkich zawartych w nim składników.

## Materiały własne i cudze

| Ścieżki / grupa                                                | Stan                                                                                            | Wymagana decyzja lub działanie                                                                     |
| -------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Własny kod apps, packages, scripts i konfiguracja              | Jeden autor w historii, brak centralnej licencji                                                | Potwierdzić właściciela praw i oznaczyć własny kod GPL-3.0-or-later; zachować cudze nagłówki       |
| `public/fonts/google/*` i `public/fonts/montserrat`            | 25 śledzonych OFL.txt; dokumentacja opisuje źródła i konwersję                                  | Zachować licencje w webie, paczkach i źródłach                                                     |
| `public/images/start-screen-bird.jpg`, `tests/fixtures/*.jpg`  | Użytkownik potwierdził własność zdjęć, ale nie zgodził się na ich sprzedaż przez innych         | Nie obejmować automatycznie GPL; ustalić osobną licencję lub zastąpienie w wolnej dystrybucji      |
| `tests/fixtures/logos/rt.png`                                  | Według README materiał od użytkownika; odpowiedź o zdjęciach nie rozstrzyga praw do tej grafiki | Potwierdzić autorstwo i warunki redystrybucji osobno                                               |
| `packages/editor/src/assets/canon.svg`                         | Aktywnie używany przez builtin-graphics; brak ustalonej licencji pochodzenia                    | Ustalić źródło/prawa albo uzgodnić usunięcie lub zamianę. Prawa do znaku nie są nadawane przez GPL |
| Logotyp FrameNote w komponencie, docs i fixture                | Dokumentacja wskazuje geometrię z dawnego fontu                                                 | Potrzebne źródło i warunki użycia fontu/logo; obecność ścieżek SVG nie rozstrzyga praw             |
| Ikona aplikacji, favicony, logo.svg Icon Composer              | Materiały marki; brak osobnego opisu pochodzenia                                                | Potwierdzić autorstwo/licencje i ustalić objęcie grafik GPL lub wolną licencją zasobów             |
| `packages/editor/src/assets/film-tabletop.png`                 | Brak znalezionego aktywnego odwołania do pliku; pozostaje w repo                                | Ustalić pochodzenie także dla dystrybucji źródeł; brak użycia nie znosi praw                       |
| Rysunki w components/icons i components/brand, tło instalatora | Kod i geometria obecne; tło ma generator Swift                                                  | Potwierdzić własne autorstwo lub zapisać źródła zapożyczeń; dołączyć edytowalne źródła/generator   |
| Snapshoty testów, docs, opisy i przykłady                      | Mogą zawierać fotografie/logo i cudze elementy                                                  | Licencjonować zgodnie z zawartością, nie zbiorczo samą deklaracją kodu                             |

### Decyzja użytkownika o fotografiach

2026-11-03 użytkownik: „zdjecia sa moje ale nie jestem pewien czy chce by ktos je
sprzedawal czy cos”. Potwierdza autorstwo, nie udziela zgody na wolną licencję
zdjęć. Inne grafiki nie zostały w tej odpowiedzi potwierdzone.

Propozycje do wyboru: zachować osobną licencję zdjęć z ograniczeniami, wyraźnie
oddzielając ją od GPL kodu, albo zastąpić fotografie w publicznych paczkach
i zestawie źródeł/testów materiałami na wolnych licencjach. Druga opcja ułatwia
dystrybucję całości jako wolnego projektu. Nie kopiować istniejących zdjęć
do nowego archiwum z domyślną GPL i nie traktować publikacji na GitHubie jako
zgody na ich sprzedaż.

## Odpowiadające źródła i paczki

W kolejnym etapie przygotować następującą strukturę wydania:

1. Kod własny dokładnie z commita wydania, GPL, copyright i jasna mapa wyjątków.
2. Źródła dostarczanych bibliotek w zakresie Corresponding Source, z licencjami
   i notices; nie polegać wyłącznie na dostępności npm i lockfile.
3. Manifesty, lockfile, wersje narzędzi, konfiguracja i skrypty web/desktop,
   generator grafik oraz instrukcja odtworzenia builda.
4. Fonty z OFL i źródłami pochodzenia; grafiki w edytowalnej formie, jeśli są
   wymaganą postacią źródłową. Zdjęcia z osobno uzgodnionymi prawami.
5. Dla Electron/Chromium ustalić obowiązki według rzeczywistej zawartości
   binariów, zachować ich pliki prawne i zapewnić wymagane źródła składników
   objętych copyleft. Nie zakładać, że cały Electron musi być przelicencjonowany
   na GPL FrameNote lub że wszystko jest biblioteką systemową.
6. Obok binariów archiwum źródeł, SHA256SUMS i jednoznaczny link w release
   notes; About wskazuje konkretny build, z tekstami prawnie dostępnymi offline.

To specyfikacja do zweryfikowania na buildzie, nie gotowy certyfikat kompletności.
[GNU FAQ o źródłach](https://www.gnu.org/licenses/gpl-faq.en.html#DistributeWithSourceOnInternet).

## Odbiór i dalsze kroki

- Wyjątek użytkownika 2026-11-03: w odpowiedzi na pytanie o pochodzenie
  logotypu FrameNote i canon.svg polecił „pominmy to”. Nie prowadzić dalszego
  sprawdzania tych dwóch materiałów w tym zadaniu; pozostawić je bez zmian.
  To pominięcie audytu, nie potwierdzenie praw ani nadanie im GPL.
  Wyłączyć je z deklaracji o zweryfikowanej zgodności i własnym autorstwie.

- AC-01: inwentarz i jawne niewiadome zapisane; potwierdzenie praw do zasobów
  i akceptacja użytkownika oczekują. Pozostałe AC nie zostały wdrożone.
- Pytania do autora: warunki zdjęć; pochodzenie i prawa do grafik rt.png
  oraz ikon/tekstury. Logotyp i canon.svg pominięte na polecenie użytkownika.
  Nie wymagać od użytkownika
  rozwiązywania kwestii technicznych zależności — to praca etapu 2.
- Dla materiałów o nieustalonym pochodzeniu najpierw przedstawić konkretną
  propozycję zastąpienia lub wyłączenia, bez samodzielnego redesignu.
- Nie uruchamiano testów aplikacji ani pakowania: zmiana dotyczy dokumentacji
  audytu. Sprawdzić format i integralność inwentarza. Weryfikacja finalnych
  bundle i paczek jest nadal niewykonana.

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
