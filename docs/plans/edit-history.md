# Historia edycji — wspólne Undo / Redo

Stan: opublikowane `0.5.0-beta` z master, commit `4c71ec6`, tag `v0.5.0-beta`.
Data: 2026-11-04. Użytkownik zlecił scalenie i publikację po akceptacji układu.
[Wydanie](https://github.com/rafalkarczmarzyk/frame-note/releases/tag/v0.5.0-beta) ·
[Kontrole CI](https://github.com/rafalkarczmarzyk/frame-note/actions/runs/41811355029).
Plan pozostaje zapisem dowodów audytu i otwartych kontroli ręcznych.
Lokalne zmiany innych zadań zachowane poza wydaniem.

## Zakres i zgodność

Bieżące zachowanie: [Undo and Redo](../USER_GUIDE.md#undo-and-redo).
Jedna historia całego układu per zdjęcie, zachowywana przy przełączaniu zdjęć,
wyłącznie w bieżącej sesji. Wspólna dla contentu, stylów, warstw, widoczności,
kolejności, pozycji, marginesów, presetów i Paste settings. Grupowanie według
logicznych operacji opisanych w NTH, bez czasowego dzielenia pisania.

Web i desktop otrzymują ten sam mechanizm i przyciski w headerze. Desktop
dodatkowo menu Edit. Wszystkie wejścia korzystają z tej samej historii.
Skróty: Cmd+Z / Cmd+Shift+Z na macOS; Ctrl+Z / Ctrl+Shift+Z oraz Ctrl+Y
na Windows/Linux. Stan dostępności uwzględnia także niezakończoną edycję.

Poza zakresem: zapis sesji, plik konfiguracji desktopu, zoom/pan, panel listy
historii, cofanie importu/zamknięcia zdjęcia, zapisywania/usuwania presetów,
eksportu i preferencji aplikacji. Nie cofamy nawigacji ani samego zaznaczenia.

Wersja opublikowanego wydania we wszystkich pięciu manifestach: `0.5.0-beta`.
Format presetów pozostaje v1,
bez migracji: historia i jej zasoby nie są eksportowane do presetów ani przyszłej
zapisanej sesji. Dotychczasowe presety mają działać bez zmian.

## Punkt wyjścia i projekt techniczny

- `use-photo-session.ts` / `session-state.ts` przechowują dokumenty poszczególnych
  zdjęć; tutaj należy utrzymywać cykl życia historii, również dla Paste settings
  skierowanego do nieaktywnego zdjęcia.
- `SessionDocument` zawiera układ, ikony i identyfikator presetu. Snapshot musi
  odtwarzać spójny dokument, ale przechowywać zasoby grafik przez referencje do
  niezmiennego magazynu, bez powielania ich treści w każdym kroku.
- `CaptionLayout.activeId` wymaga oddzielenia semantyki zaznaczenia od zmian
  dokumentu: sama zmiana aktywnej warstwy nie może tworzyć kroku.
- `caption-editor.tsx` używa obecnie historii Tiptap i `closeHistory`.
  Zastępujemy ją wspólnymi komendami, z jawnymi granicami grup pisania,
  operacji na tagach/grafikach i obsługą kompozycji IME.
- `photo-workspace.tsx` ma wiele wejść zmian. Potrzebny jest wspólny kontrakt
  rozpoczęcia, aktualizacji, zakończenia i anulowania operacji, z podglądem na
  żywo. Nie wystarczy zapisywać snapshotu po każdym `onChange`.
- Przywracanie nie generuje kolejnej edycji. Porównanie pomija stan widoku;
  operacja bez różnicy nie zużywa kroku i nie kasuje Redo.
- Obecny `image-retention.ts` wiąże zasoby Undo z zamontowanym edytorem
  (64 MB / 1000 zasobów). Trzeba przenieść retencję na poziom sesji i usunąć
  zależność zwalniania zasobów od przełączania warstw. Zachować istniejące
  ograniczenia aktywnej zawartości niezależnie od budżetu historii.
- Header wykorzysta `IconButton`, `Tooltip`, ikony Lucide i istniejące stories.
  Menu desktopu wymaga przekazywania komend i stanu dostępności między głównym
  procesem a edytorem, bez równoległego natywnego cofania contentu.

## Założenia robocze implementacji (do oceny przy odbiorze etapu)

1. **Limity:** domyślnie 100 cofnięć per zdjęcie (wspólny limit Undo i Redo)
   i 64 MiB budżetu historii całej sesji. Budżet obejmuje szacowany rozmiar
   snapshotów oraz unikalne zasoby utrzymywane wyłącznie przez historię;
   nie jest gwarancją całkowitego zużycia RAM aplikacji. Po przekroczeniu usuwać
   najstarsze skrajne kroki, zachowując ciągłość pozostałej ścieżki i bieżący
   dokument; sygnalizować skrócenie historii. Bieżąca edycja ma się udać nawet
   wtedy, gdy pojedynczy krok nie mieści się w budżecie. Parametr liczby kroków
   przygotować do późniejszego podłączenia konfiguracji desktopu, bez jej
   implementowania tutaj. Zasoby używane przez inne zdjęcia lub schowek
   ustawień pozostają dostępne po przycięciu historii.
2. **Wartości robocze:** Enter, blur i inna operacja zatwierdzają poprawną
   wartość; niepoprawna wartość wraca do ostatniej poprawnej. Escape anuluje
   roboczą zmianę. Undo najpierw domyka poprawną zmianę i od razu ją cofa;
   niepoprawny draft odrzuca, po czym cofa ostatni istniejący krok. Redo po
   rzeczywistej nowej zmianie nie ma już dalszej ścieżki do odtworzenia.
3. **Kursor i zaznaczenie:** krok przechowuje pomocniczy stan warstwy oraz
   kursora/zaznaczenia przed i po operacji. Cofanie i ponawianie odtwarza go,
   z bezpiecznym dopasowaniem do istniejącego contentu. Fokus pozostaje w
   edytorze, jeśli wywołanie pochodziło z niego; przyciski i menu nie wymuszają
   otwarcia panelu ani przeniesienia fokusu do contentu.
4. **Cykl życia:** układ bez zdjęcia ma własną historię. Import rozpoczyna
   każde nowe zdjęcie z bieżącym układem i pustą historią. Zamknięcie zdjęcia
   usuwa jego historię; zachowany po zamknięciu ostatniego zdjęcia układ zaczyna
   od pustej historii. Przełączenie zdjęcia domyka edycję poprzedniego.
5. **Granice interakcji:** ciągła zmiana koloru jest jednym krokiem jak suwak;
   wybór gotowego koloru osobnym krokiem. Operacje asynchronicznego dodawania
   grafik muszą pozostać przypisane do docelowego zdjęcia/warstwy; błąd lub
   anulowanie nie tworzy kroku. Pola niedotyczące układu, np. wyszukiwanie,
   wymagają jawnego sprawdzenia obsługi fokusu, aby nie uruchamiać dwóch cofnięć.

## Etapy

1. **Mechanizm i zasoby:** model snapshotów, transakcje, Undo/Redo, limity,
   retencja, historia per zdjęcie i testy domenowe. Odbiór kontraktu i wyników
   testów; sam etap nie dostarcza jeszcze kompletnej funkcji w interfejsie.
2. **Wspólny edytor:** wszystkie operacje układu, content bez osobnej historii,
   drafty, gesty, presety/Paste, skróty i header. Odbiór ręczny web/desktop,
   w tym mieszana sekwencja i przełączanie zdjęć.
3. **Integracja natywna i domknięcie:** menu Edit i dostępność, pełna regresja,
   dokumentacja użytkownika, changelog Unreleased oraz końcowy odbiór.

Etapy zależą kolejno od siebie. Każdy kończy się oceną użytkownika;
następny wymaga polecenia. Użytkownik zezwolił na przejście przez wszystkie etapy z commitami pomiędzy nimi. Odbiór ręczny pozostaje osobnym statusem.

## Kryteria i weryfikacja

Kryteria aplikacyjne pozostają bez ręcznego odbioru użytkownika. Szczegóły dowodów i otwartych kontroli znajdują się poniżej.

| AC    | Obserwowalne zachowanie                                                                                                             | Weryfikacja                                                         |
| ----- | ----------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| AC-01 | Mieszana sekwencja tekst → tag → pozycja → kolor → kolejność → usunięcie warstwy cofa się i ponawia w całości, krok po kroku        | Test integracyjny i ręcznie web/desktop                             |
| AC-02 | Historia jest niezależna per zdjęcie, przetrwa przełączanie i obejmuje Paste settings do wskazanego zdjęcia                         | Test stanu sesji i ręcznie                                          |
| AC-03 | Pisanie do granicy operacji, drag, suwak, kolor i wartość pola tworzą pojedyncze kroki; tag/grafika kończy pisanie i ma osobny krok | Test grupowania i ręcznie, także IME, blur, Escape i przerwany gest |
| AC-04 | No-op, zaznaczenie, nawigacja i odtwarzanie nie dodają kroków; nowa edycja po Undo usuwa Redo                                       | Test domenowy                                                       |
| AC-05 | Usunięta warstwa/grafika wraca z kompletną treścią; limity zwalniają tylko niepotrzebne zasoby i nie psują aktualnego dokumentu     | Test retencji, dużego kroku i wielu zdjęć                           |
| AC-06 | Header, skróty i menu sterują identyczną historią; właściwe disabled i tooltipy; jedno wywołanie wykonuje jeden krok                | Test komend/stanu, ręcznie macOS i Windows/Linux                    |
| AC-07 | Undo w trakcie pisania cofa całą grupę; drafty i kursor działają według zaakceptowanych reguł                                       | Test transakcji i ręczna kontrola fokusu                            |
| AC-08 | Preset i Paste settings są atomowe, również dla zasobów; błąd dodawania grafiki nie pozostawia częściowej operacji                  | Test integracyjny, istniejące fixtures v1                           |
| AC-09 | Zamknięcie/import/reset zwalnia właściwą historię; presety i eksport nie zawierają danych historii                                  | Test cyklu życia i serializacji, istniejący test JPG                |
| AC-10 | Header i edytor zachowują poprawny układ, dostępne etykiety i stany                                                                 | Storybook i sześć istniejących scen Chromium desktop                |

W implementacji: odpowiednie testy Vitest, typy, lint, format, tokeny, wersje
i build; końcowo `pnpm check`, `pnpm build-storybook`, `pnpm desktop:compile`
oraz `pnpm test:desktop` z dostępem do sesji graficznej od pierwszej próby.
Testy desktopowe i przeglądarkowe kolejno. `pnpm check` obejmuje sześć scen
wizualnych i jeden JPG; po zmianach UI wcześniejszych etapów `pnpm test:visual`.
Obejrzeć expected/actual/diff, aktualizować tylko świadomie zaakceptowane sceny.
Nie dodawać scen ani profili bez uzgodnienia. Niedostępne platformy oznaczać
jako nieweryfikowane; test macOS nie potwierdza natywnego Windows/Linux.

## Stan implementacji i punkt wznowienia

Etap 1: `a69314c` — silnik `EditHistorySession`, transakcje, osobne historie,
limity kroków i globalny budżet oraz internowanie grafik. Cykl życia `synchronize`
i test importu/zamykania/resetu są podłączone w etapie 2.

Etap 2: historia podłączona do `use-photo-session`, w tym Paste do wskazanego
zdjęcia, pusty workspace i schowek. Content używa wspólnej historii; Tiptap Undo
jest wyłączone w aplikacji. Lokalne zasoby contentu obejmują tylko bieżącą treść,
a historię grafik utrzymuje sesja. Wspólne granice gestów, pól liczbowych i koloru,
Undo/Redo w headerze oraz skróty; przywracanie kursora i zaznaczenia taga.
Presety stosowane jedną operacją. Format presetów bez zmian.

Etap 2 zapisany jako `abd559a`. Etap 3 dodaje menu Edit i walidowany IPC,
nazwy/dostępność Undo/Redo, alternatywny Ctrl+Y na Windows/Linux oraz dokumentację
użytkownika. Późniejsze poprawki etapu 3 zachowują grupowanie podczas zmiany
rozmiaru inline elementów i przy przenoszeniu fokusu z contentu na suwak.

### Wyniki automatyczne

- `pnpm test:unit`: PASS, 66 plików / 436 testów; mieszana sekwencja tekst → tag
  → pozycja → kolor → kolejność → usunięcie i pełne Redo (AC-01/04).
- `pnpm typecheck`, `pnpm lint`, `pnpm check:tokens`, `pnpm check:version`: PASS.
- Format zmienionych plików i `git diff --check`: PASS. Istniejący błąd formatowania
  `.agents/skills/prepare-release/agents/openai.yaml` poprawiono przed wydaniem;
  końcowe `pnpm check` dla wersji 0.5.0-beta: PASS (w tym 6/6 scen i JPG).
- Build web, `pnpm build-storybook`, `pnpm desktop:compile`: PASS.
- `pnpm test:e2e`: PASS, reprezentatywny JPG zgodny z dotychczasowym wzorcem.
- Sześć istniejących scen Chromium uruchomiono bez rozszerzania zestawu.
  Asercje grupowania pisania i pól liczbowych, Undo/Redo presetu, przywrócenia
  usuniętej warstwy z SVG i zaznaczenia taga: PASS (AC-03/05/07/08).
  Po akceptacji układu przez użytkownika zaktualizowano i obejrzano sześć
  wzorców macOS Chromium. Zwykłe `pnpm test:visual`: PASS, 6/6 scen. Zmienny build ID jest ukrywany wyłącznie podczas
  screenshotów przez `tests/visual/screenshot.css`.
- `pnpm test:desktop` na przygotowanej kompilacji 0.5.0-beta: PASS, łącznie z
  fullscreen, czterema zdjęciami, eksportem JPG/ZIP, przełączaniem zdjęć z
  zachowaną historią, menu i jednym krokiem na Cmd+Z/Cmd+Shift+Z (AC-02/06/09).
  Wcześniejszy timeout fullscreen nie wystąpił na kompilacji wydania.
  Testy desktopowe i przeglądarkowe uruchamiano kolejno.

### Publikacja

CI zakończone sukcesem: walidacja taga, budowa i smoke paczek macOS arm64,
Windows x64 (także portable launcher) i Linux x64, archiwum źródeł oraz publikacja.
Potwierdzono publiczne wydanie (nie draft), pięć plików ze zgodnymi sumami SHA256
i tag wskazujący commit wydania. To nie zastępuje ręcznych kontroli poniżej.

### Pozostałe kontrole ręczne

Użytkownik zaakceptował układ Undo/Redo za Add photos, w jednej grupie z odstępem
4 px, i zlecił aktualizację regresji wizualnej. Wzorce sześciu scen zaktualizowane
i obejrzane; wcześniejsza blokada aktualizacji jest rozwiązana przez tę zgodę.
Użytkownik następnie zlecił merge do master i publikację kolejnego wydania.
Kontrole nieautomatyczne wymienione poniżej pozostają jawnie nieweryfikowane.

1. Odbiór ręczny web/macOS: mieszana sekwencja, drag i kolor, IME, Escape i
   niepoprawne drafty, odtwarzanie kursora, przerwany gest (AC-01/03/07/10).
   Natywne Windows/Linux pozostają nieweryfikowane; macOS ich nie zastępuje.

Trwałe zachowanie opisuje USER_GUIDE. Plan pozostaje jako zapis otwartych kwestii
odbioru i dowodów audytu; nie usuwamy go przed ich rozwiązaniem. Zmiany funkcji
opublikowano w `0.5.0-beta` po squash do master i pomyślnych kontrolach CI.
