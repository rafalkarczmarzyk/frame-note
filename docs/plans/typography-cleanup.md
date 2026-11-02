# Usunięcie fontu RetiredDisplay i dostosowanie typografii

## Stan i zakres

- Stan: implementacja etapu 1, 2026-11-02. Użytkownik zlecił etap 1 na osobnym
  branchu. Bez zgody na commit, zmianę historii lub zdalne operacje.
- Cel użytkownika: rezygnacja z fontu ze względów licencyjnych we wszystkich
  zastosowaniach. Na start usunięcie fontu i związany z tym redesign.
- Bieżący zakres: pliki WOFF2, CSS, katalog fontów, UI, stories, przykłady,
  testy, skrypt audytu fontów oraz aktualna dokumentacja.
- Web i desktop korzystają ze wspólnej zmiany edytora i katalogu w core.
- Logotyp SVG pozostaje na razie bez zmian zgodnie z decyzją użytkownika;
  jego redesign zapisano osobno w NICE_TO_HAVE. Nie uznajemy tego za ocenę prawną SVG.
- Screenshoty testowe wymagają aktualizacji po ocenie nowego wyglądu.
- Zadanie ma dwa etapy: ocena designu bez fontu, następnie usunięcie plików
  fontu z całej historii bez utraty commitów. Drugi etap wymaga odbioru pierwszego
  i polecenia rozpoczęcia; samo planowanie nie upoważnia do przepisania historii.
- Branch implementacji: `codex/remove-RetiredDisplay`.
- Baza: master, HEAD `23fbbaa`. Istnieje niezależny nieśledzony plan
  `docs/plans/github-desktop-releases.md`; nie zmieniać go przy zapisie tego planu.

## Inwentaryzacja i proponowany wygląd

- Usunąć `public/fonts/RetiredDisplay/RetiredDisplay-Regular.woff2` i `RetiredDisplay-Bold.woff2`,
  oba @font-face, wpisy fontIds/captionFonts i obsługę w verify-fonts.py.
- `--font-display` obecnie steruje m.in. SidebarSection, FloatingPanel,
  AboutSplash, PhotoDropOverlay i stories Foundations.
- Propozycja do oceny: wspólny Montserrat jako font nagłówków, semibold dla
  tytułów paneli i sekcji; mocniejszy nagłówek About/drop overlay. Dopasować
  rozmiar, interlinię i odstępy do nowych metryk, bez przebudowy układu aplikacji.
  Zachować semantyczny token display i wspólne komponenty.
- Domyślny font podpisów pozostaje Montserrat. Katalog obejmuje 25 dotychczasowych
  rodzin Google Fonts; przykłady ozdobnych podpisów mogą użyć istniejącego
  Playfair Display. Testy wariantów dobrać do faktycznie dostępnych odmian.
- Zastąpić wszystkie aktywne przykłady i testy używające usuwanego fontu;
  zachować zakres testów (w tym oczekiwanie na załadowanie fontu przed eksportem).
- Zaktualizować dokumentację bieżącego stanu i angielski Unreleased. Historyczne
  opisy wydań i sam plan mogą zachować nazwę jako zapis decyzji; usunięcie
  wszelkich tekstowych wzmianek z historii wymaga osobnego uzgodnienia.

## Wersja i zgodność

- Obecna wersja: `0.2.2-beta`. Prognoza: `0.3.0-beta`, ponieważ usuwamy dostępną
  rodzinę fontu i zmieniamy wygląd zapisanych podpisów, które z niej korzystały.
  Przeliczyć przy integracji, jeżeli zmieni się baza. Sam plan nie podbija wersji.
- Format presetów pozostaje v1, bez migracji schematu i bez wsparcia pre-v1.
- Proponowane zachowanie: istniejący preset zachowuje nazwę niedostępnej rodziny,
  picker pokazuje Unavailable, podgląd i JPG używają Montserrat. Dopiero jawny
  wybór innej rodziny zmienia zapis. Nie dodawać zależności od dawnego fontu.
- Decyzja użytkownika: usuwamy font tylko z projektu. Katalog fontów systemowych
  pozostaje bez blokowania tej rodziny, jeśli zainstalowano ją niezależnie.

## Kryteria akceptacji

| AC    | Oczekiwany wynik                                                                                                           | Weryfikacja                                                                         | Stan        |
| ----- | -------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | ----------- |
| AC-01 | Repo w aktualnym stanie i nowe buildy nie zawierają plików fontu ani deklaracji ich ładowania                              | Audyt śledzonych plików, CSS, buildów web i desktop; kontrola żądań                 | niewykonane |
| AC-02 | UI, stories i dostarczane przykłady nie używają usuwanego fontu; nagłówki są czytelne i mieszczą się w panelach            | Storybook, desktop/web, szeroki i wąski układ                                       | niewykonane |
| AC-03 | Picker nie oferuje rodziny wbudowanej; presety z niedostępną rodziną zachowują dane i eksportują z Montserrat              | Test parsera, pickera, podglądu i JPG                                               | niewykonane |
| AC-04 | Testy fontów zachowują pokrycie wariantów i opóźnionego ładowania z inną dostępną rodziną                                  | Unit i E2E Chromium/WebKit                                                          | niewykonane |
| AC-05 | Wzorce odzwierciedlają oceniony nowy wygląd i eksport, bez maskowania innych regresji                                      | Obejrzenie expected/actual/diff, aktualizacja wybranych scen i ponowny przebieg     | niewykonane |
| AC-06 | Logotyp SVG jest pozostawiony zgodnie z zakresem; dokumentacja poprawnie opisuje bibliotekę i pozostałą pracę              | Przegląd diffu                                                                      | niewykonane |
| AC-07 | Żaden commit dostępny przez objęte zakresem branche i tagi nie zawiera plików usuwanego fontu, również pod dawnymi nazwami | Audyt drzew i obiektów historii po ścieżkach i zawartości fontów                    | niewykonane |
| AC-08 | Każdy dawny commit ma odpowiednik; zachowane są kolejność, rodzice/merge, autorzy, daty i komunikaty                       | Mapa stary → nowy identyfikator, liczba commitów i porównanie grafu oraz metadanych | niewykonane |

## Etapy i odbiór

### 1. Design bez fontu — próba wykonalności i odbiór

- Aktualizacja decyzji 2026-11-02: użytkownik polecił teraz nie weryfikować
  i nie poprawiać testów. Zatrzymano uruchomiony przebieg wszystkich profili
  wizualnych i wycofano własne zmiany kodu testów. Dalsze testy, dostosowanie
  scenariuszy i screenshotów czekają na osobne polecenie; poniższa lista
  weryfikacji opisuje docelowe domknięcie, nie bieżącą autoryzację.
- Przed tą decyzją przeszły typecheck, lint, check:tokens, format:check,
  415 testów jednostkowych i build Storybooka. Zbudowano też web.
  Test wizualny chromium-desktop zgłosił 7 różnic; obejrzano komplet
  expected/actual/diff sceny photo and editor (zmiany nagłówków).
  Nie zmieniano wzorców. Audyt Python fontów nie wykonał się z powodu
  braku fontTools. Wyniki sprzed wycofania zmian testów nie stanowią
  weryfikacji końcowego stanu.
- Usunąć font z aktualnych zasobów i katalogu, zastąpić jego użycia w UI,
  stories i przykładach; przygotować powiązane zmiany testów i dokumentacji.
- Przedstawić działający web/desktop i Storybook do oceny: hierarchia tekstu,
  czytelność, dopasowanie nagłówków i zgodność podpisów z eksportem (AC-01–06).
- Najpierw ocena wyglądu i ewentualne poprawki. Dopiero po niej aktualizacja
  zaakceptowanych screenshotów UI/JPG i ponowne testy. Jest to domknięcie tego
  samego etapu, nie osobny etap zadania. Do tego momentu oczekiwane różnice
  wizualne raportować jawnie; nie aktualizować wzorców dla samego zaliczenia testu.
- Logotyp SVG pozostaje bez zmian; redesign logotypu jest odłożony osobno.
- Stan: implementacja zlecona przez użytkownika; odbiór oczekuje.

### 2. Przepisanie całej historii bez plików fontu

- Warunek wejścia: użytkownik zaakceptował wykonalność i efekt etapu 1 oraz
  zlecił etap 2. Zmiany robocze muszą być zabezpieczone; commit wymaga polecenia.
- To filtrowanie historii wszystkich objętych zakresem referencji, a nie zwykły
  rebase jednej gałęzi. Nie robić squasha, nie gubić merge'y ani commitów,
  także tych, które po usunięciu fontu staną się puste.
- Zinwentaryzować i uzgodnić pełną listę lokalnych/zdalnych branchy i tagów,
  także milestone tags, oraz wszystkie historyczne ścieżki i kopie plików fontu.
  Audyt lokalnych refs nie zastępuje aktualnej inwentaryzacji zdalnej.
- Przygotować kontrolowaną kopię bezpieczeństwa poza oczyszczanym repo i pracować
  w izolowanej kopii. Backup nadal zawiera font: ustalić jego przechowywanie
  oraz usunięcie po odbiorze, nie przedstawiać go jako oczyszczonej kopii.
- Usunąć binarne pliki fontu ze wszystkich historycznych drzew; zachować każdy
  commit, graf rodziców, komunikaty, autorów i daty. Zachować nazwy branchy/tagów
  i przenieść je na odpowiedniki dawnych commitów. Zapisać mapę stary → nowy SHA.
  Identyfikatory zmienionych commitów i ich potomków oraz obiektów tagów ulegną
  zmianie; dawne podpisy kryptograficzne nie zachowają ważności.
- Zakres tego etapu dotyczy plików fontu. Historyczne wzmianki tekstowe,
  CSS i screenshoty nie są automatycznie usuwane ani przepisywane; nie obiecywać,
  że dawne commity będą się budować po usunięciu wymaganych przez nie zasobów.
- Przed publikacją zweryfikować AC-07/08 oraz końcowy kod i testy etapu 1.
  Przedstawić listę referencji do zastąpienia, mapę commitów i wyniki audytu.
- Zdalne zastąpienie historii wymaga jawnej zgody na wymuszony push dokładnie
  wskazanych branchy i tagów. Następnie sprawdzić świeży klon. Stare klony
  wymagają wymiany lub kontrolowanego przestawienia, aby nie przywrócić fontu.
- Osobno zinwentaryzować stare paczki/artefakty, dodatkowe refs hostingu,
  cache i forki. Brak plików w świeżym klonie nie dowodzi usunięcia wszystkich
  kopii z serwera ani cudzych klonów. Lokalny reflog i nieosiągalne obiekty
  posprzątać dopiero po odbiorze i ustaleniu losu backupu.
- Stan: 2026-11-02 użytkownik zlecił lokalną próbę w izolowanej kopii;
  wykonano ją bez commita, integracji designu, zmiany źródłowego repo lub pushowania.
  Publikacja przepisanej historii nadal oczekuje na osobne polecenie.

### Wynik lokalnej próby historii — 2026-11-02

- 143 → 143 commity, pełna mapa identyfikatorów; wszystkie 143 SHA zmienione.
- Zachowano graf rodziców, autorów/committerów, obie daty ze strefami czasowymi,
  pełne komunikaty i metadane tagów. Zachowano nazwy i odpowiednie cele 57 refs.
- Usunięto dwa binarne pliki WOFF2, także z 39 technicznych referencji drzew
  Codexa, których standardowy przebieg filter-repo nie przepisuje.
- Porównano wszystkie drzewa commitów i bezpośrednie drzewa refs: pozostałe
  wpisy są identyczne. Po GC brak obiektów obu fontów; Git fsck przeszedł.
- Zdalny odczyt potwierdził master i cztery tagi; żadnych zmian zdalnych.
- Niezacommitowany design zabezpieczono w patchu i archiwum plików nieśledzonych;
  nie jest częścią przepisanej historii. Próba nie jest finalną kopią do publikacji.
- Backup historii, oczyszczone repo bare, mapa i raport są poza projektem:
  `/Users/liptun/.codex/visualizations/2026/11/02/01a19cd4-067b-75c0-8c9d-4c6de4d2aca6/history-trial`.
  Backup nadal zawiera font i pozostaje do odbioru. Repo źródłowe zachowano.
- Testów aplikacji nie uruchamiano ani nie zmieniano. To kontrola integralności
  historii zgodnie z autoryzacją lokalnej próby, nie odbiór działania aplikacji.

## Integracja i wydanie

- Po akceptacji i poleceniu commita/merge'a etapu 1: wersja, changelog i lokalny
  tag według maintain-versioning. Domknięcie techniczne jest częścią etapu 1.
- Etap 2 sam w sobie nie wymaga kolejnego podbicia produktu. Jest jawnym,
  uzgadnianym wyjątkiem od zwykłej zasady nieprzepisywania historii i tagów.
- Zgoda na zwykły commit lub push nie jest zgodą na zastąpienie historii zdalnej.

## Weryfikacja i ograniczenia

- Dotychczas wykonano tylko audyt kodu i lokalnych referencji Git: 143 commity
  dostępne przez lokalne refs, master i trzy dodatkowe branche oraz tagi wydań.
  Nie wykonano audytu zdalnych plików, buildów ani testów działania.
- Przy implementacji: format/lint/typecheck, unit, build web i Storybook,
  audyt fontów, odpowiednie E2E eksportu i presetów.
- Obowiązkowo `pnpm test:visual` i `pnpm test:visual --all-projects` dla wspólnej
  typografii; obejrzeć różnice przed zmianą wzorców. Objąć About, drop overlay,
  sidebar, FloatingPanel, picker i przykłady wielu warstw.
- Desktop: `pnpm test:desktop` od pierwszej próby z require_escalated;
  testy desktopowe i przeglądarkowe kolejno. Brak środowiska oznacza niewykonany test.
- Ręczny odbiór: czytelność/hierarchia nagłówków, brak obcięć, picker,
  preset z nieznaną rodziną, zgodność podglądu z eksportem.
- Usunięcie zasobów ze źródeł nie czyści wcześniej zbudowanych paczek,
  cache, instalacji ani historii. Nie deklarować pełnego usunięcia z repo/historii
  przed wykonaniem i zweryfikowaniem odrębnego zakresu.

## Final history operation

On 2026-11-02 the user authorized retaining the redesign, committing/integrating
it and cleaning historical source references and related images before pushing.
Application tests and baseline regeneration remain explicitly deferred.
The version is 0.3.0-beta. The SVG logotype is retained by explicit decision.
The final audit and backups are stored outside the repository.
