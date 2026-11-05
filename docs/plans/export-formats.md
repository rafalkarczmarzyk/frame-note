# Wybór formatu eksportu

Stan na 2026-11-05: etap 1 zaimplementowany i zweryfikowany, czeka na odbiór użytkownika.
Gałąź: `codex/export-formats`, baza 0.7.2-beta; zmiany bez commita.
Użytkownik zlecił dokończenie obu etapów na osobnej gałęzi i osobny commit
każdego etapu. Zgoda obejmuje kontynuację etapu 2; odbiór działania pozostaje
odrębny od commitów.

Etap 1: dodano wybór JPG/PNG dla pojedynczego zdjęcia, zachowanie jakości JPG,
przezroczystość PNG, unieważnianie starego wyniku oraz ponowną próbę kodowania.
Zapis XMP w PNG ma test niezależnego odczytu ExifReader (model, ISO,
wyłączona lokalizacja). Użytkownik potwierdził zachowanie takie jak JPG: te same
grupy i zapis XMP; natywny blok eXIf nie jest wymagany.
ZIP pozostaje JPG i jest tak oznaczony w menu do realizacji etapu 2.

## Zachowanie

We wspólnym edytorze web i desktop użytkownik wybiera JPG (domyślnie) lub
PNG. Wybór obejmuje pojedyncze zdjęcie oraz całą serię w ZIP. Wybór jest
pamiętany w bieżącej sesji edytora. Preset v1 nadal opisuje kompozycję,
więc dotychczasowe pliki i starsze czytniki nie wymagają migracji. WebP
i trwała preferencja formatu są poza zakresem.

Suwak jakości dotyczy JPG. Przy przełączeniu na PNG edytor ukrywa suwak
i zachowuje jego wartość na wypadek powrotu do JPG. Eksport PNG zachowuje
przezroczystość źródła w obszarach, których nie przykrywają warstwy.

Oba formaty udostępniają te same grupy metadanych. Użytkownik wybiera,
które pola trafią do pliku. Niezależnie od tego wyboru podpis z wartościami
EXIF jest renderowany na obrazie w obu formatach.

### Metadane PNG

Tak jak w JPG, wybrane pola są zapisywane jako XMP. Użytkownik potwierdził
wspólne zachowanie obu formatów; dodatkowy natywny blok eXIf nie jest wymagany.

## Etapy i kryteria odbioru

1. **Eksport jednego zdjęcia.** Rozszerzyć wspólny renderer i przygotowanie
   pliku, następnie podłączyć wybór formatu do istniejących kontrolek.
   - AC-01: otwarcie edytora daje JPG z dotychczasową jakością i obsługą
     metadanych. PNG ukrywa opcje właściwe dla JPG. Powrót do JPG przywraca
     wybraną jakość. W obu formatach dostępne są te same grupy metadanych. Kontrola w webie i desktopie.
   - AC-02: zapisane pliki mają zgodną sygnaturę, rozszerzenie, wymiary
     i układ warstw. Dla PNG sprawdzić kanał alfa oraz niezależnie odczytać metadane
     z pliku wynikowego: obecność wybranych pól i pominięcie wyłączonych grup. Sprawdzić istniejący wzorzec JPG.
   - AC-03: po zmianie formatu w trakcie przygotowania pliku rozmiar
     i pobrana zawartość odpowiadają aktualnemu wyborowi. Błąd kodowania
     umożliwia ponowną próbę. Test przepływu i kontrola ręczna.
2. **Seria i odbiór całości.** Po odbiorze etapu 1 zastosować format
   wybrany przy starcie eksportu do wszystkich zdjęć w ZIP.
   - AC-04: seria z wejściami JPG i PNG daje wyłącznie pliki wybranego
     formatu, z poprawnymi nazwami także przy powtarzających się nazwach
     źródeł. Sprawdzić zawartość ZIP dla obu wyborów.
   - AC-05: istniejący preset v1 daje taki sam układ przy obu eksportach.
     Sprawdzić import i oba sposoby zapisu na webie i desktopie.

Po zmianach UI uruchomić sześć istniejących scen pnpm test:visual, obejrzeć
różnice i wykonać test JPG. Kontrole przeglądarkowe i desktopowe uruchamiać
kolejno, desktop w sesji graficznej macOS. Uzupełnić instrukcję użytkownika
i Unreleased przy implementacji. Każdy etap wymaga oceny użytkownika.
AC-01–03: kontrole automatyczne i przepływy zaliczone; odbiór użytkownika otwarty.
AC-04–05: etap 2, nierozpoczęty.

## Weryfikacja etapu 1

- Vitest: 73 pliki / 506 testów, wynik pozytywny. Nowe przypadki: nazwa PNG,
  odczyt XMP PNG przez ExifReader z modelem/ISO i pominięciem wyłączonych grup.
- Chromium: sześć scen wizualnych bez różnic; istniejący test JPG przeszedł.
  Dodatkowa kontrola przepływu (bez nowego testu w zestawie) potwierdziła
  sygnaturę PNG, nazwę, wymiary 32×24, alfa=0 w przezroczystym pikselu,
  ukrycie jakości i jej powrót po przełączeniu na JPG. Obejrzano panel PNG.
- Lint, typy, kontrola tokenów i zgodność wersji: pozytywnie.
  Build web i desktop: pozytywnie.
- Native smoke macOS: pozytywnie po poprawieniu etykiety menu JPG;
  potwierdza istniejący przepływ JPG/ZIP i konfigurację. Nie zastępuje odbioru PNG.
- AC-01: Chromium potwierdza przełączenie formatu, ukrycie jakości oraz powrót
  wybranej wartości 75%. Natywne okno macOS potwierdziło również zapis PNG
  przez usługę desktopową, sygnaturę PNG, wymiary 5964×3976 oraz powrót jakości 75%.
- AC-02: odczyt metadanych i alfa potwierdzone jak wyżej; odbiór kompozycji
  przez użytkownika pozostaje otwarty.
- AC-03: pozytywnie w Chromium. Opóźniono rzeczywiste kodowanie canvas,
  zmieniono format podczas przygotowania i potwierdzono PNG oraz zgodność
  liczby bajtów pobranego pliku z rozmiarem w UI. Jednorazowy błąd kodera
  zablokował eksport, a Retry ponowiło przygotowanie i przywróciło przycisk.
  Istniejące testy kolejki nadal pokrywają odrzucanie nieaktualnego wyniku.
- Odbiór użytkownika: nieprzeprowadzony. Decyzja: XMP tak jak w JPG.

## Prognoza wersji

Baza 0.7.2-beta. Dla osobnego wydania z tą funkcją prognoza to 0.8.0-beta
(nowa funkcja zgodna z istniejącymi presetami). Przy wspólnym wydaniu wersja
wynika z łącznego zakresu. Docelowy kamień milowy: 1.0.

## Odbiór etapu 1

Build do oceny: 0.7.2-beta, baza `5659802`, lokalne zmiany (`dirty`),
gałąź `codex/export-formats`. Bez commita, zmiany wersji i publikacji.

W webie i desktopie: wybierz PNG w Export settings, zapisz zdjęcie z podpisem,
sprawdź układ i wybrane grupy metadanych; wróć do JPG i sprawdź zachowaną jakość.
Odbiór użytkownika dotyczy AC-01–03. Po nim można zlecić etap 2 (ZIP).
