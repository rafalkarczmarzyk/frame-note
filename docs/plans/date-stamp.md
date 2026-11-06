# Rozbudowa datownika

Stan: etap 1 wdrożony, do oceny; kontrola wizualna wykazuje różnice wobec wzorców. Data: 2026-11-06.
Autoryzowany zakres: implementacja etapu 1 (zgoda użytkownika 2026-11-06).
Branch docelowy: master, squash zadania z codex/date-stamp. Użytkownik zlecił
commit, push, merge do master i usunięcie ukończonego brancha. Wydanie poza zakresem.

## Zakres i zgodność

Wdrożono: rozszerzyć ustawienia każdego znacznika daty/czasu o miesiąc
liczbowy, skrócony lub pełny, zegar 12/24h i jawny język datownika
(początkowo angielski i polski). Zachować wybór kolejności, separatorów,
krótkiego/pełnego roku i własnych wzorców. Datę i godzinę konfigurujemy osobno: date zawiera wyłącznie datę, time wyłącznie czas.
Nie dodawać presetów godziny ani wyboru zegara do ustawień date.
Zachować odczyt starszych zapisanych wzorców date zawierających godzinę.
W trybie 12h pokazywać AM/PM, aby uniknąć niejednoznaczności.
Przykłady: 06 Jul 2026, 06 July 2026, 06 lip 2026, 06 lipca 2026,
15:05 oraz 3:05 PM. Dokładna interpunkcja skrótów wynika z języka.

Wybrany przez użytkownika font to 7-Segment v3.0 Jana Bobrowskiego, oryginalny
Regular bez sztucznego Bold/Italic. Zastępuje DSEG7 Classic w katalogu i Quartz
Date. Usunięto pliki DSEG oraz tymczasowy font FrameNote Stamp Symbols.
Font ma własny apostrof; nie przesuwamy glifów ani trackingiem, ani pozycjonowaniem.
Stare nazwy DSEG7 Classic są aliasem renderowania do 7-Segment Regular; surowe
wartości nazwy/700/italic pozostają w presecie, ale efektywny wariant to 400/normal.
Nowy wygląd i inne metryki starych presetów są świadomym skutkiem wymiany fontu.
Nie dotyczy to nieznanych nazw innych fontów, które nadal zachowują dotychczasowy fallback.

Użytkownik wybrał myślnik ASCII U+002D. Jako znak przy skróconym roku użytkownik wybrał natywny prawy górny segment
U+F062 (font-specific/private-use).
U+0027, U+0060 i U+2032 mają identyczny glif; U+002D i Unicode U+2010–2015/U+2212
także mają jeden wspólny glif. W 7-Segment apostrof przed dwucyfrowym rokiem
renderuje się jako U+F062, bez zmiany źródłowego szablonu. Literalny U+F062 jest
także poprawnym znakiem wzorca; inne fonty pokazują go jako zwykły apostrof.
Pomiar, podgląd, efekty i eksport dzielą tę samą transformację tekstu.

Najnowsze polecenie: posprzątać Storybook i wdrożyć font, bez innych zmian presetów.
Diff builtin-presets.ts obejmuje dokładnie jedną zmianę fontFamily w Quartz Date;
fontWeight 700, fontStyle italic, format oraz pozostałe ustawienia zachowano.
Efektywny wariant to rzeczywisty Regular; styl zapisany nie jest wariantem renderowanym.
Usunięto tymczasowe porównania znaków i nazw miesięcy. Pozostawiono stałe stories
CaptureDate, MissingDate, LocalizedDateAndTime oraz MissingTime.
Dowody audytu znaków i miesięcy zachowano: /private/tmp/framenote-seven-segment-months.png
oraz README fontu. Wszystkie warianty miesięcy pozostają dostępne dla każdego
fontu bez blokad czy automatycznej zmiany rodziny; to decyzja użytkownika.

Zatwierdzona lista skrótów Date format: YYYY-MM-DD, DD.MM.YYYY, D MMM YYYY,
'YY MM DD oraz Custom. YYYY/MM/DD, DD MM 'YY i D MMMM YYYY usunięto tylko z listy;
validator i zapis/odczyt ich nie ograniczają. Zapisany format spoza listy otwiera się
jako Custom i zachowuje wynik. Test istniejącej sceny sprawdza dokładną listę
5 opcji oraz zastosowanie pełnej nazwy miesiąca przez Custom.

Usunięto osobny Month style jako duplikację Date format. Miesiące liczbowe,
skrócone i pełne oraz Custom wybiera się tylko przez Date format; język pozostaje
osobny. Rozpoznawanie opcji traktuje literalny U+F062 i zwykły apostrof jako ten sam
czytelny format UI, zachowując surowy zapis do czasu jawnej edycji.

Web i desktop korzystają ze wspólnej implementacji. Język przypisany do
znacznika i zapisany w presecie, niezależny od języka systemu.
Pełne tłumaczenie interfejsu, inne kalendarze i konwersja stref czasowych
pozostają poza zakresem. Nie wymyślać godziny dla zdjęć zawierających samą datę.

Obecna wersja produktu: 0.11.0-beta. Prognoza wydania obejmującego tę funkcję:
co najmniej 0.12.0-beta (nowe możliwości formatowania); ocena łącznego
Unreleased przy wydaniu. Bez zmiany manifestów i taga w tym zadaniu.
Format presetów pozostaje v1 przy rozszerzeniu addytywnym; zachować znaczenie
istniejących tokenów. Stare presety bez języka zachowują wynik tekstowy; wymiana DSEG zmienia wygląd.
Starsze aplikacje mogą nie rozumieć nowych wzorców/tokenów; opisać ograniczenie.

## Kryteria i wynik

| AC    | Zachowanie                                                      | Wynik i pozostały odbiór                                                                                                                       |
| ----- | --------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| AC-01 | Natywne symbole 7-Segment w podglądzie i JPG                    | Obejrzano rzeczywisty eksport Quartz Date 5964×3976. Użytkownik wybrał U+002D oraz U+F062; wdrożono w Quartz i formatach.                      |
| AC-02 | Wyłącznie time ma wybór 12/24h                                  | Testy jednostkowe północy/południa i przepływ UI przechodzą; odbiór użytkownika otwarty.                                                       |
| AC-03 | Miesiące liczbowe, skrócone i pełne                             | Testy jednostkowe i UI przechodzą; odbiór otwarty.                                                                                             |
| AC-04 | Język PL/EN per znacznik, kontekstowe formy miesięcy            | Testy PL/EN, podgląd „20 maja 2026” i eksport JPG sprawdzone; odbiór otwarty.                                                                  |
| AC-05 | Zgodność presetów, zapis/odczyt, historia                       | Round-trip v1 i stare tokeny sprawdzone w Vitest, Undo/Redo w scenie graphic settings. Ręczne Copy/Paste nowych ustawień pozostaje do odbioru. |
| AC-06 | Braki metadanych, bez konwersji strefy i wymyślania czasu       | Testy przechodzą; odbiór otwarty.                                                                                                              |
| AC-07 | Stabilna szerokość i etykieta eksportu, zamiana ikony na loader | Przepływ sceny graphic settings potwierdza stan busy i różnicę szerokości poniżej 0,1 px; JPG i native smoke przechodzą.                       |

## Dodatkowa poprawka zlecona w trakcie implementacji

Użytkownik zlecił stabilizację belki eksportu. Stały napis Export JPG/PNG,
widoczna ikona Download zamieniana w LoaderCircle przy przygotowaniu podglądu,
ładowaniu zdjęć i eksporcie. Identyczne wymiary ikon; komunikat stanu w tooltipie
oraz aria-busy, bez zmiany szerokości przycisku. Weryfikacja w istniejącej scenie
wizualnej, Storybook i rzeczywistym eksporcie JPG. Zgoda obejmuje implementację.

## Weryfikacja i przekazanie

Źródła: 0.11.0-beta, baza 74fd97f, zmiany scalane do master.
Bez zmiany wersji; commit, merge, push master i usunięcie brancha zlecone przez użytkownika. Bez wydania. Wybór fontu i znaków
jest zatwierdzony, całościowy odbiór datownika pozostaje otwarty.

- Vitest: 78 plików, 552 testy przechodzą. Obejmują zapis/odczyt v1 z U+F062,
  alias starego fontu, dobór rzeczywistego wariantu i transformację znaku roku.
- Typecheck, lint, format:check, check:tokens, check:version i build-storybook
  przechodzą. Audyt scripts/verify-fonts.py potwierdza metryki i cmap TTF/WOFF2.
- Istniejący test JPG: 1/1 przechodzi, bez aktualizacji wzorca.
  Dodatkowo rzeczywisty eksport Quartz 5964×3976 sprawdzono po zachowaniu starego
  szablonu presetu; zbliżenie: /private/tmp/framenote-final-quartz-crop.png.
- Desktop: końcowa kompilacja wykonana po teście JPG; smoke aktualnych źródeł
  przeszedł przed skróceniem listy (JPG/ZIP, konfiguracja, Settings, odzyskiwanie
  i geometria). Testy natywne i przeglądarkowe uruchamiane kolejno. Nie powtarzano
  testów natywnych dla zmiany samej listy opcji.
- pnpm test:visual: wszystkie sześć scen uruchomione, asercje funkcjonalne
  przechodzą. Screenshoty 0/6 względem starych wzorców: nowa ikona eksportu i
  przesunięcie grup toolbaru, Font panel z nowym fontem; Empty/About mają wcześniejsze
  przeniesienie wersji, Metadata wcześniejsze ikony sekcji. Obejrzano expected/actual/diff.
  Cztery actual są bajtowo identyczne z wcześniej obejrzanym przebiegiem;
  Font panel i Metadata panel expected/actual/diff obejrzano ponownie. Nie zmieniono wzorców.
  Log: /private/tmp/framenote-short-date-formats-visual.log.
- Kontrola aplikacji potwierdza: brak Month style, widoczne Date format i Date
  language, oryginalny szablon Quartz oraz eksport 7-Segment. Indeks Storybooka
  zawiera dokładnie 4 utrzymywane stories daty/czasu, bez porównań prototypowych.
- Diff builtin-presets.ts względem bazy obejmuje tylko jedną zmianę fontFamily
  w Quartz Date. Wszystkie pozostałe właściwości presetów są niezmienione.

Dowody wcześniejszego audytu symboli i miesięcy zachowano w README fontu oraz
/private/tmp/framenote-seven-segment-months.png. Usunięcie porównań ze Storybooka
nie usuwa wyników audytu; aktualne zachowanie opisują FONT_LIBRARY i CAPTION_TAGS.

Do oceny użytkownika: jeden Date format z wariantami miesięcy i Custom, język PL/EN,
osobny time 12/24h, nowy font/znak roku w podglądzie i eksporcie oraz stabilna belka.
Ręczny Copy/Paste nowych ustawień pozostaje do odbioru. Nazwy miesięcy są zawsze
dostępne, bez blokad zależnych od fontu. Wzorce wyglądu czekają na świadomą akceptację.

Po odbiorze domknąć dokumentację i usunąć plan. Nie wykonywać kolejnego etapu ani
operacji Git bez odpowiedniego polecenia.

Końcowa kontrola krótkiej listy: typecheck, lint, format:check, check:version i
552 testy Vitest przechodzą. W istniejącej scenie przeglądarkowej sprawdzono
kolejność dokładnie 4 formatów + Custom oraz pełny polski miesiąc przez Custom.
Menu obejrzano: /private/tmp/framenote-short-formats-menu.png. Wszystkie 6 scen
uruchomiono; różnice wzorców pozostają opisane wyżej, bez ich aktualizacji.
