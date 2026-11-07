# PoC płynnego przeciągania z pełnym podglądem

Stan: **etap 2 — PoC zaimplementowany, do oceny; cel płynności nieosiągnięty dla ciężkiego Tiled**, 2026-11-07.
Autoryzowany zakres: renderer przy zachowaniu aktualizacji dokumentu i pól na żywo.
Baza PoC: `43e877e`, produkt `0.11.0-beta`. Decyzja: zachować obecny PoC jako
punkt kontrolny na lokalnym master, bez push i zmiany wersji. Nowy renderer jest
domyślny w lokalnym trybie deweloperskim; buildy wydaniowe zachowują dotychczasową
ścieżkę. Poprawka skoków Tiled pozostaje osobnym commitem.

## Cel i zakres

Cel użytkownika: pełny podgląd na żywo podczas przeciągania, bez widocznych
przycięć i bez wyłączania Glass, mieszania, efektów zawartości ani cieni tła.
Docelowo usuwamy uproszczenia dodane w `a270c3a`, gdy pomiary i odbiór
potwierdzą zastępujące je rozwiązanie. Nie wykonujemy ślepego revertu całego
commita: wstrzymanie zbędnej pracy pomocniczej oceniamy osobno.

Obejmujemy zwykłe warstwy tekstu/grafik oraz Grid/Staggered, kolejność warstw,
krycie, zoom/pan, ograniczenie pozycji, historię i końcowy eksport. Oryginał
nie zostaje w starym miejscu, nie używamy ducha ani zamrożonego Glass jako
zaliczonego wyniku. Efekty muszą reagować na aktualną pozycję także wtedy,
gdy przeciągana warstwa znajduje się pod inną warstwą Glass lub mieszaną.

Decyzja zakresowa z 2026-11-07: pola pozycji i dokument pozostają aktualizowane
na żywo podczas przeciągania. W najbliższym PoC nie zmieniamy częstotliwości
aktualizacji React/dokumentu, nie zamrażamy inputów i nie dodajemy debounce.
Optymalizujemy wyłącznie ścieżkę renderowania obrazu. Ewentualne ograniczenie
częstotliwości aktualizacji dokumentu jest [odłożone](../NICE_TO_HAVE.md#częstotliwość-aktualizacji-pozycji-podczas-przeciągania)
i wymaga oddzielnej decyzji popartej pomiarem; pola mają nadal reagować na ruch.

Web i renderer desktopu współdzielą zmianę. Windows desktop jest obowiązkowym
środowiskiem odbioru wydajności; macOS służy do lokalnego porównania, web do
kontroli wspólnej ścieżki. Linux wymaga kontroli zgodności przy wdrożeniu;
bez właściwego środowiska nie oznaczamy go jako sprawdzonego.
Modele i format presetów v1 bez zmian, bez migracji. Eksport pozostaje
referencją wyglądu; ewentualny nowy renderer podglądu musi wykazać zgodność.

Sam plan/eksperyment bez wdrożenia nie wymaga wydania. Prognoza dla wdrożonej
optymalizacji: PATCH, samodzielnie `0.11.1-beta`; wersję całego wydania ustalamy
z uwzględnieniem pozostałego Unreleased. Teraz nie zmieniamy wersji ani changeloga.

## Rozpoznanie w kodzie i hipotezy

- `photo-workspace.tsx` zapisuje `setLayout` przy każdym `onDragMove`;
  `tiled-preview.tsx` aktualizuje offset dokumentu przy każdym ruchu.
- `use-glass-preview.ts` uruchamia pełną kompozycję, jeśli dowolna warstwa ma
  mieszanie lub efekty. `render.ts` tworzy scenę Konva od nowa dla wywołania.
  Odrzucenie nieaktualnego wyniku nie musi zatrzymać już rozpoczętych obliczeń.
- Obecna ścieżka wstrzymuje ten render podczas przeciągania i zastępuje tła
  uproszczonymi prostokątami. Nie zmierzono jeszcze tej wersji na Windows;
  zgłoszone tam przycięcia dotyczyły wersji sprzed uproszczenia.
- Hipoteza: trwała scena, ponowne użycie rastrów i ograniczenie obszaru
  przerysowania usuną dużą część kosztów przy zachowaniu aktualizacji dokumentu
  oraz pól na żywo. Koszt samych inputów nie został wyizolowany w pomiarze. Nie zakładamy, że wystarczy to do Glass.
  Nie zakładamy też, że Electron automatycznie przyspieszy Canvas 2D.

## Etapy proponowane do oddzielnej akceptacji

### 1. Pomiar i wybór ścieżki

Porównać bieżący tryb uproszczony i pełny render bez uproszczeń w lokalnym
wariancie diagnostycznym. Zapisać sprzęt, system, wersję aplikacji/Chromium,
rozdzielczość okna, DPR, zoom, źródłowe zdjęcie i stan akceleracji sprzętowej.
Nie włączać flag GPU na ślepo. Pomiar na buildzie produkcyjnym, po rozgrzaniu
fontów i grafik; pierwszy start mierzyć oddzielnie.

Sceny ze stałymi danymi i przebiegiem ruchu: pojedyncza warstwa; komplet
Outline/Shadow/Glow/Blur; Glass i mieszanie; przesuwanie pod górną warstwą
Glass; gęsty Tiled z tłem/efektami. Uwzględnić Fit i 100%, środek oraz krawędź
zdjęcia. Wykorzystać istniejące fixtures i kompozycje Storybooka.

Mierzyć odstępy prezentowanych klatek (p50/p95/p99), opóźnienie ruch–podgląd,
długie zadania >50 ms, liczbę aktualizacji dokumentu i React commitów, czas
budowania sceny, rasteryzacji i składania oraz pamięć i rozmiary cache.
Sam FPS lub czas `requestAnimationFrame` nie wystarczą do potwierdzenia
braku opóźnienia obrazu. Wspomóc ocenę śladem wydajności i nagraniem ruchu.
Co najmniej trzy powtórzenia tego samego przebiegu na wariant i scenę.

Wynik etapu: tabela baseline, wskazane dominujące koszty, proponowana ścieżka
PoC i rzeczywisty zakres sprzętu, dla którego oceniamy płynność.

### 2. PoC renderowania przyrostowego z pełnym wyglądem

- Zachować obecną aktualizację pozycji w dokumencie i inputach podczas ruchu,
  bez zamrożenia, debounce ani zapisu wyłącznie po puszczeniu. Trwały renderer
  otrzymuje najnowszy stan dokumentu; łączyć można żądania renderowania obrazu
  do jednej klatki, bez kolejki zaległych kompozycji i bez opóźniania pól.
- Utrzymywać scenę i bufory między klatkami zamiast budować całą scenę od nowa
  po każdej aktualizacji pozycji. Zmiana położenia nie powinna ponownie mierzyć
  niezmienionej treści ani generować niezmienionych efektów.
- Przechowywać gotowe rastry zawartości z Outline/Shadow/Glow/Blur i tła
  niezależne od podłoża. Translacja nie unieważnia takich rastrów. Cache ma
  uwzględniać styl, tekst, grafiki, skalę, zasięg efektów i limit pamięci;
  nie przycinać efektów na granicy zdjęcia przed przesunięciem.
- Utrzymać kolejność kompozycji. Mieszanie stosować do całej złożonej warstwy
  na aktualnym podłożu. Osobny canvas przeciąganej warstwy nad całą sceną nie
  zapewnia sam z siebie poprawnego mieszania ani kolejności.
- Wykrywać zależności: Glass pobiera aktualne niższe warstwy, także gdy sam
  się nie porusza. Przeliczać obszary zmienione przez stare i nowe położenie
  oraz zależne obszary z marginesem blur/cienia; przy kaskadzie zależności
  dopuszczać większe przerysowanie dla poprawności.
- Tiled: cache motywu zamiast rastra całego zdjęcia przesuwanego z pustymi
  brzegami; wyznaczać kopie pokrywające aktualny widok. Zachować wspólne krycie
  i mieszanie wszystkich kopii oraz niezależne próbkowanie ich Glass.
- Najpierw sprawdzić przyrostowe składanie Canvas 2D na trwałych buforach.
  Jeżeli pełny Glass/mieszanie nadal nie mieści się w budżecie, przed kolejną
  implementacją przedstawić wynik i zakres próby kompozytora GPU, np. WebGL.
  Nie obiecywać, że przesuwanie bitmapy rozwiąże koszt zależnych efektów.
- Workers/OffscreenCanvas rozważać wyłącznie dla zmierzonej ciężkiej pracy;
  uwzględnić koszt przekazywania obrazu, dostępność fontów i opóźnienie.
  Responsywny interfejs ze spóźnionym podglądem nie zalicza celu.
- Koniec ruchu: pola, dokument i obraz pozostają zgodne z pozycją końcową,
  bez skoku lub dopiero wtedy nadrabianych wartości. Zachować istniejące
  grupowanie gestu w jeden krok Undo oraz obsługę przerwania gestu; nie
  przebudowywać historii ani dodawać nowej semantyki anulowania w tym PoC.
  Eksport odczytuje aktualną pozycję dokumentu; nie wprowadzamy osobnej,
  niezapisanej do dokumentu pozycji przeciągania.

Wynik etapu: działający PoC z tabelą porównawczą i ograniczeniami. Jeżeli
budżet nie jest osiągnięty, raport wskazuje brak zaliczenia; nie zastępujemy
celu duchem, zamrożeniem efektów lub ukrytym obniżaniem jakości.

### 3. Integracja po odbiorze PoC

Po akceptacji wyników włączyć zwycięską ścieżkę, usunąć uproszczenia podczas
przeciągania i zbędny kod diagnostyczny, uaktualnić USER_GUIDE i Unreleased.
Navigator może korzystać z gotowej aktualnej kompozycji; osobny pomiar ma
rozstrzygnąć koszt jego aktualizacji bez przebudowy całej sceny.
Zachować jawny błąd/fallback w razie problemu renderera; zachowanie przy braku
wymaganego GPU uzgodnić na podstawie wyników PoC, bez obietnicy identycznej
wydajności na każdym sprzęcie. Nie obejmować tego zadania przebudową eksportu,
nowym silnikiem 3D ani natywnym backendem bez oddzielnego uzgodnienia.

## Kryteria i weryfikacja

Poniższe progi wydajności to proponowany cel PoC, jeszcze nie wynik pomiarów.
Referencja: ekran 60 Hz i ustalony sprzęt Windows; wyższe odświeżanie raportować
oddzielnie, bez obietnicy 120/144 FPS. Gęstość Tiled, liczba warstw i parametry
Glass muszą być zapisane, żeby wynik miał określony zakres.

| AC    | Obserwowalne zachowanie                                                                                                                                        | Weryfikacja                                                                                        | Status      |
| ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ----------- |
| AC-01 | Pełny wygląd podczas ruchu, w tym Glass i mieszanie warstw powyżej; brak starej kopii/ducha i wyłączeń efektów                                                 | Kontrola kolejnych pozycji z referencyjnym rendererem, ręczny odbiór nagrania                      | niewykonane |
| AC-02 | Pola pozycji i dokument aktualizują się podczas ruchu; brak zamrożenia i debounce; zachowane grupowanie gestu w jeden krok Undo                                | Obserwacja wartości pól w trakcie gestu, liczniki aktualizacji dokumentu i test Undo/Redo          | niewykonane |
| AC-03 | W uzgodnionych scenach p95 odstępu klatek ≤20 ms, p99 ≤33 ms; brak zadań >50 ms spowodowanych przeciąganiem w stanie ustalonym; p95 ruch–widoczny wynik ≤33 ms | 3 powtórzenia produkcyjnego buildu, ślad i ocena na Windows; oddzielny pomiar rozpoczęcia ruchu    | niewykonane |
| AC-04 | Brak zauważalnego zacięcia przy rozpoczęciu ruchu (cel ≤50 ms do pierwszej zmienionej klatki), skoku przy puszczeniu i narastającej kolejki starych klatek     | Znaczniki czasu, nagranie i test długiego ruchu                                                    | niewykonane |
| AC-05 | Poprawne granice pozycji, skala, kolejność, krycie całego Tiled i nowe kopie przy krawędziach                                                                  | Istniejące testy geometrii + celowane przypadki nowych błędów i ręczny odbiór                      | niewykonane |
| AC-06 | Pozycja końcowa i wygląd eksportu zgodne z podglądem; preset v1 i zapisane ustawienia bez zmian                                                                | Istniejący pojedynczy test JPG, kontrola końcowej pozycji i round-trip presetów w obecnym pokryciu | niewykonane |
| AC-07 | Cache zwalnia zasoby po zmianie zdjęcia/stylu i zamknięciu widoku; nie rośnie bez ograniczeń                                                                   | Profil pamięci przed/po powtarzalnej serii ruchów i zmian zdjęć, zapisany limit cache              | niewykonane |

Po implementacji: odpowiednie unit tests, lint, typecheck, build, sześć scen
`pnpm test:visual` z obejrzeniem expected/actual/diff i jeden istniejący JPG.
Zachowanie ruchu dołączyć do istniejącej kompozycji, bez rozszerzania liczby
scen/profili. Storybook pokazuje produkcyjną ścieżkę i daje możliwość porównania.
Desktop i browser tests kolejno; native smoke macOS wyłącznie w sesji graficznej
z wymaganym uprawnieniem. Testy funkcjonalne z wyłączonym GPU nie są dowodem
wydajności akcelerowanego desktopu.

## Wynik etapu 2

Na polecenie użytkownika lokalne `pnpm desktop` (oraz `pnpm dev`) włącza PoC
domyślnie, bez parametrów adresu i bez zmiennych środowiskowych. Użytkownik
odbiera zmianę w normalnym oknie desktopowym. Wydaniowy build nadal zachowuje
zaakceptowane uproszczenia; prototyp nie został włączony produkcyjnie.
Build diagnostyczny umożliwia też wybór `?dragPreview=poc`.
Pola i dokument aktualizują się z dotychczasową częstotliwością, bez debounce.

Implementacja: trwały kompozytor Canvas 2D, cache zawartości/efektów i powierzchni
warstw, wspólny motyw Tiled, cache cieni Glass, ponowne użycie buforów oraz kolejka
z jednym renderem aktywnym i najwyżej jednym najnowszym oczekującym. Glass jest
unieważniany po zmianie niższych warstw. Treść bez efektów zachowuje natywne
rysowanie; dla tekstu uciętego na brzegu zachowujemy globalny układ rasteryzacji
referencji i dopiero potem wycinamy powierzchnię warstwy. Eksport korzysta
z dotychczasowego renderera. Publiczne modele/presety bez zmian.

Pomiary lokalne: macOS, Apple M1 Pro/Metal, Chromium, 1440×900, DPR 1, ta sama
fotografia 5964×3976. Zakres p95 czasu żądania podglądu między trzema próbami
w ms; obejmuje oczekiwanie, nie jest pomiarem czasu CPU/GPU ani FPS ekranu:

| Scena                                  | Fit: referencja → PoC     | 100%: referencja → PoC    |
| -------------------------------------- | ------------------------- | ------------------------- |
| Cztery efekty                          | 13,2–13,9 → 0,2           | 38,4–40,2 → 0,2           |
| Glass + Screen                         | 4,4–4,7 → 2,8–3,2         | 26,2–26,9 → 17,7–18,0     |
| Ruch pod nieruchomym Glass             | 4,6–5,0 → 2,7–2,9         | 23,7–26,0 → 10,3–10,7     |
| Tiled + Glass + Screen + cztery efekty | 188,3–204,1 → 113,8–128,1 | 580,6–608,5 → 597,1–599,3 |

Referencja i Tiled: `drag-benchmark-results/poc-comparison/results.json` (48 prób).
Finalne pojedyncze warstwy po ograniczeniu odczytu Glass do potrzebnego fragmentu:
`poc-final-singles/results.json` (18 prób). Wariant pierwotny kopiował cały obraz
również dla pojedynczego Glass i powodował regresję; nie jest wariantem finalnym.
Poprawka narożnika dotyczy wyłącznie tekstu przecinającego granicę zdjęcia;
środkowe przypadki wydajności pozostają bez tej ścieżki. Raporty zawierają
metadane, surowe zdarzenia, ślady i nagrania; nowsze raporty także hash źródeł.

W ciężkim Tiled odstępy rAF w Fit spadły z 160–171 do 73–79 ms, ale przy 100%
PoC daje około 600 ms zamiast 510–521 ms referencji. **AC-03 niezaliczone**.
Pełny cel płynności nie został osiągnięty. Renderer nadal przechodzi całą
kompozycję; Tiled i jego Glass obejmują całe zdjęcie również przy 100%, gdy
widoczny jest tylko fragment. Żadnej z tych liczb nie uznajemy za osiągnięte
60 FPS lub potwierdzenie opóźnienia prezentacji. Windows/Electron nie zmierzono.

Weryfikacja wyglądu: 20 porównań referencja/PoC po zmianie pozycji w tym samym
cache, w Fit/100%, w środku i przy narożnikach. Wszystkie finalne porównania
mają maksymalną różnicę 1 poziomu na kanał RGBA. Zestawienie:
`drag-benchmark-results/poc-quality-summary.json`; PNG są w katalogach raportów.
Test narożnika wykrył i potwierdził poprawkę rasteryzacji natywnego tekstu.

Kontrola pól: we wszystkich próbach odczytywano wartości przy trzymanym przycisku
myszy, np. X `58,5 → 51 → 43,5`. Dokument nadal otrzymywał 127 aktualizacji na
przebieg zawierający 126 zdarzeń ruchu i wybór warstwy. Nie ma intencjonalnego
zamrożenia pól do puszczenia; ciężki Tiled nadal blokuje wątek i powoduje przycięcia.

Cache bitmap zawartości i warstw: po 64 MiB, scratch: 64 MiB, cienie Glass:
32 MiB po zakończeniu klatki. Limity nie obejmują chwilowych alokacji, buforów
kompozycji/wyjścia, obrazów źródłowych i zasobów Konva/przeglądarki. Nie jest to
limit pamięci procesu/GPU. Renderery są zwalniane po zmianie zdjęcia/skali/gotowości;
pełny audyt pamięci na desktopie pozostaje niewykonany.

Kontrole finalnego kodu: typecheck, lint, 563 unit tests, wersje, tokeny, format,
build i istniejący JPG: pass. Sześć scen wizualnych: fail z obejrzanymi wcześniejszymi
różnicami nagłówka, fontów, empty i About; wzorców nie zmieniano. Dowód przeglądu:
`drag-benchmark-results/poc-ui-review.jpg`. Native smoke/odbiór Windows niewykonane.

Do decyzji po odbiorze: kolejna iteracja renderowania widocznego fragmentu zdjęcia
z prawidłowym zapasem dla Glass/efektów, szczególnie przy 100%. Dopiero jej pomiar
powinien rozstrzygnąć próbę kompozytora GPU. Obecnego PoC nie rekomendujemy do
integracji jako rozwiązania pełnej płynności. Częstotliwość aktualizacji pól
pozostaje poza tą iteracją; pomysł jej zmiany jest nadal odłożony.

## Lokalne wyniki etapu 1

Build produkcyjny z diagnostyką na `a270c3a` + dirty, macOS Darwin 27.2,
Apple M1 Pro, Chromium 156.0.8078.4, GPU ANGLE Metal, Canvas 2D i kompozycja
GPU włączone. Okno 1440×900, DPR 1, fixture 5964×3976
`tests/fixtures/20260520-IMG_3843.jpg`. Wykonano 60 prób: pięć scen × Fit/100%
× uproszczony/pełny podgląd × trzy powtórzenia.

Poniżej zakres p95 czasu pełnego renderu podglądu między trzema próbami,
w milisekundach. To czas wywołania renderera wraz z oczekiwaniem asynchronicznym,
nie pomiar czasu CPU ani opóźnienia rzeczywiście zaprezentowanej klatki.

| Scena                                  | Fit                                 | 100%                                |
| -------------------------------------- | ----------------------------------- | ----------------------------------- |
| Zwykły tekst                           | brak dodatkowego renderu rastrowego | brak dodatkowego renderu rastrowego |
| Outline + Shadow + Glow + Blur         | 12,6–12,9                           | 37,9–38,3                           |
| Glass + Screen                         | 4,5–4,7                             | 26,1–28,6                           |
| Ruch pod nieruchomym Glass + Screen    | 4,5–4,8                             | 22,9–23,5                           |
| Tiled + Glass + Screen + cztery efekty | 163,7–176,9                         | 564,8–571,5                         |

W pełnym Tiled odstępy wywołań rAF mają p95 144–157 ms w Fit i 515–520 ms
w 100%; każda próba zawiera 120–121 zadań >50 ms podczas gestu. Typowy gest
nadal daje 121 wywołań settera dokumentu (w tym wybór warstwy), 120 żądań
pełnego podglądu i do około 360 commitów komponentu workspace. W pojedynczej
próbie zwykłego tekstu 100% licznik aktualizacji był wyższy; nie uśredniamy
tej obserwacji do założonej liczby. Ograniczenie zachowania surowych danych
opisano poniżej.

Ślad `effects-100-full-0` zawiera także częste zdarzenia MajorGC (220 w całym
zarejestrowanym wycinku, łącznie z domknięciem podglądu/eksportu). Nie sumujemy
czasów z różnych wątków ani zagnieżdżonych zdarzeń jako czasu jednego gestu.
To dowód presji alokacji, nie izolowany pomiar udziału GC w opóźnieniu.

Powyższy agregat zachowano podczas pomiaru. Pierwotne surowe pliki w
`test-results/drag-benchmark-gpu` zostały usunięte przez uruchomienie istniejącego
testu eksportu, który czyści wspólny katalog Playwrighta. Nie ma już pełnych
śladów/nagrań tej macierzy; przy przyszłym porównaniu przed/po trzeba odtworzyć
baseline, a nie traktować tabeli jako zachowanego surowego raportu. Narzędzie
zapisuje teraz do oddzielnego `drag-benchmark-results` i odrzuca ścieżki wewnątrz
`test-results`. Potwierdzenie skoku Tiled odtworzono osobno w trwałym katalogu.
Wyniki software/headless nie są bazą oceny GPU. Odtworzenie głównej macierzy:

```sh
node scripts/measure-layer-drag.mjs --headed --out=drag-benchmark-results/baseline
```

Wariant pełny odblokowuje efekty, Glass i mieszanie podczas ruchu, ale oba
warianty wstrzymują Navigator: porównanie izoluje koszt kompozycji i nie jest
pełnym odtworzeniem zachowania sprzed `a270c3a`. Pacing wejścia celuje w 60 Hz,
ale wywołania sterownika przeglądarki zwalniają pod obciążeniem. Nagrania i ślady
mają narzut. Wyniki nie potwierdzają AC-03/04 ani wydajności Windows/Electrona.
Próby przy krawędziach pozostają niewykonane; odtworzony reset offsetu Tiled
musi zostać uwzględniony przed uznaniem przebiegu ruchu za poprawny.

Rekomendacja etapu 2 po decyzji użytkownika: pozostawić dokument i inputy
aktualizowane na żywo, zachowywać rastry efektów oraz scenę/bufory między
klatkami i ograniczyć obszar przerysowania. Reset Tiled jest już naprawiony
w `43e877e`; tę poprawkę zachowujemy jako bazę PoC. Sprawdzić lokalne granice buforów mieszania zamiast cache całego
zdjęcia dla pojedynczej małej warstwy. Zachować przeliczanie Glass zależnego
od zmienionego podłoża. Dane uzasadniają PoC przyrostowego Canvas 2D; nie
potwierdzają jeszcze, że będzie wystarczający ani że trzeba przejść na GPU.

## Zgłoszony błąd Tiled

Użytkownik potwierdził skoki wzoru zarówno na Windows, jak i w lokalnym oknie
pomiarowym macOS. Analiza obejmuje klatki nagrania, powtarzane współrzędne
kursora oraz wyliczony offset. Inspekcja kodu wskazuje konflikt zerowania grupy
w `onDragMove` z pomijaniem przez Konva ponownego ustawienia identycznej pozycji.
Na kolejnym zdarzeniu offset może zostać wyliczony z zera zamiast przesunięcia.
To osobny problem poprawności, którego nie uznajemy za zwykły niski FPS.
Potwierdzono go w rzeczywistym edytorze kontrolowanym powtórzeniem współrzędnych:
13 resetów offsetu w jednej próbie. Przy kursorze `(613, 447)` kolejne zdarzenia
z czasem 4526,6 i 4554,2 ms wyliczyły odpowiednio offset `(12,75%, 3,15%)`
i `(0%, 0%)`. Lokalna pozycja grupy zmieniła się z `(506,94, 125,244)` na zero,
choć pozycja kursora była identyczna. Zaokrąglenie współrzędnych może uruchomić
ten przypadek, ale duży skok wynika z resetowania pozycji, nie z błędu precyzji.

Dowód: `drag-benchmark-results/tiled-jump/results.json`, nagranie
`video/tiled-fit-simplified.webm` i sąsiednie klatki w `frames/` (wycinek około
4,36–5,00 s). Osobno przejrzano klatki pełnego Tiled Fit w oryginalnym nagraniu,
również po 25 klatek/s wokół pierwszego zawracania kursora. Wideo rejestruje
25 FPS, więc nie pokazuje każdego zdarzenia wejścia; dokładny reset potwierdzają
sparowane współrzędne w danych, nie sam numer klatki.

```sh
node scripts/measure-layer-drag.mjs --headed --scenes=tiled --zooms=fit --modes=simplified --repetitions=1 --repeat-pointer --out=drag-benchmark-results/tiled-jump
```

To diagnostyczne odtworzenie błędu, nie trzy powtórzenia testu wydajności.
Poprawka została wdrożona i, na warunkowe polecenie użytkownika, zapisana
oddzielnie na lokalnym `master` jako `43e877e` przed optymalizacją. Pozycja jest
liczona z kursora w układzie zdjęcia względem początku gestu, niezależnie od
zerowania grupy. Sześć prób po poprawce (Fit/100%, po trzy powtórzenia) dało
po 13 powtórzonych pozycji kursora i zero resetów offsetu. Dowody:
`drag-benchmark-results/tiled-fixed/results.json`, `stability.json`, nagrania.
Test regresji na rzeczywistych transformacjach Konva obejmuje powtórzone
zdarzenia, zawracanie, niezerowy offset, pan i skale 0,167/1/2. Czysta poprawka
na master przeszła typy, lint, 556 unit tests, build i JPG; sześć scen wizualnych
wykazuje obejrzane wcześniejsze różnice, bez zmiany wzorców. Native Windows
pozostaje do ręcznego potwierdzenia. Commit nie zawiera diagnostyki PoC;
bez push i zmiany wersji, z wpisem Unreleased → Fixed.
AC-05 obejmuje teraz jawnie brak resetu przy dwóch zdarzeniach z identyczną
pozycją kursora, przy zawracaniu oraz podczas zatrzymania ruchu.

## Decyzje i przekazanie

Użytkownik zlecił plan PoC i określił cel pełnego podglądu bez uproszczeń.
Autoryzowane są etap 1, wydzielona poprawka Tiled oraz PoC etapu 2 z żywymi
polami. Użytkownik ocenił lokalne działanie jako wstępnie akceptowalne i polecił
commit oraz merge PoC do master. Włączenie do buildów wydaniowych (etap 3),
release i push wymagają osobnego polecenia. Potwierdzenie celu płynności dla
ciężkiego Tiled i odbiór Windows pozostają otwarte.

Do uzgodnienia przed pomiarem Windows: konkretny komputer, docelowy rozmiar
okna/DPR i dostęp do uruchomienia buildu z diagnostyką. Przygotowanie lokalnych
scen i pomiar macOS nie zależą od otrzymania tych danych; Windows pozostaje
osobnym, niewykonanym odbiorem do czasu rzeczywistego pomiaru.

Kryteria docelowej optymalizacji nie są jeszcze zaliczone; lokalne pomiary
i weryfikacja wydzielonej poprawki Tiled są opisane osobno powyżej. Po każdym etapie aktualizujemy dowody i czekamy na odbiór przed
następnym. Po zamknięciu zadania trwałe ustalenia trafiają do dokumentacji,
a ten plan zostaje usunięty.

## Weryfikacja narzędzia i ograniczenia etapu 1

Kontrola typów, lint i 555 testów jednostkowych: pass. Zwykły build produkcyjny
oraz istniejący test eksportu JPG: pass. Kontroler diagnostyki nie występuje
w zwykłym bundle. Sześć scen wizualnych uruchomiono; wszystkie mają różnice
względem wzorców. Obejrzano expected/actual/diff: nagłówek/presety/eksport,
lista fontów, pusty ekran i numer buildu About odpowiadają obszarom różnic
obecnym już przy odbiorze `a270c3a`; wzorców nie zmieniano. Nie oznaczamy
kontroli wizualnej jako zaliczonej. Native smoke macOS i Windows niewykonane;
nie ma jeszcze odbioru wydajności desktopu; wynik implementacji etapu 2 opisano powyżej.

Narzędzia diagnostyczne są częścią punktu kontrolnego PoC. Surowe raporty
pozostają lokalne i ignorowane przez Git; sposób ich odtworzenia opisano w tym
planie i README narzędzia. Plan zachowujemy do rozstrzygnięcia otwartych kwestii
wydajności i odbioru desktopu. Changelog opisuje lokalny tryb testowy bez zmiany
wersji; brak zgody na push lub release.
