# Regresja wizualna UI — smoke tests

Stan: 5 listopada 2026. Zestaw sprawdza widoki prawdziwej aplikacji w jednym profilu Chromium desktop. Storybook nie jest uruchamiany przez `test:visual`.

## Sceny

### Źródła i sortowanie fontów — kontrola 2026-11-06

Na źródłach 0.10.0-beta (niezacommitowane) sprawdzono w Chromium story
Pickers/FontPicker/Desktop: App/System, wybór Arial, tooltip wyłącznie po
najechaniu na badge oraz brak badge źródła i Selected w webie. Typy, lint
zmienionych komponentów, formatowanie i tokeny — PASS. Natywnego desktopu
nie uruchamiano; odbiór użytkownika pozostaje otwarty.

Sześć scen wizualnych zgłosiło różnice; obejrzano expected/actual/diff.
Po dodaniu sortowania A–Z ponownie uruchomiono sześć scen (6 różnic);
obejrzano expected/actual/diff panelu fontów, potwierdzając kolejność po nazwie.
Oprócz sortowania i usuniętego Selected w panelu fontów widoczne są zmiany istniejącego
presetu Photo Details, DSEG7 i inspektora poza zakresem badge. Eksport JPG
wykonano, lecz porównanie nie przeszło (39651 pikseli różnicy w podpisie).
Raporty: playwright-visual-report i playwright-report. Wzorców nie zmieniano.
Podglądy badge: /tmp/framenote-font-source.png i /tmp/framenote-font-system.png.

Numer kompilacji (`data-build-info`) jest ukrywany wyłącznie na screenshotach
przez `tests/visual/screenshot.css`, aby wzorce nie zależały od commita.
W aplikacji pozostaje widoczny.

Scena About obejmuje prawdziwy dialog aplikacji; osobny widok czytnika licencji
pozostaje poza screenshotami. `FRAMENOTE_VISUAL_PORT` pozwala
uruchomić zestaw na innym porcie, gdy domyślny 4184 jest zajęty.

| Test                   | Co obejmuje                                             |
| ---------------------- | ------------------------------------------------------- |
| Empty editor           | Puste okno, akcje i układ początkowy.                   |
| Prepared photo session | Zdjęcie, Navigator i trzy warstwy.                      |
| Font panel             | Prawdziwy panel fontów i próbki gotowe do renderowania. |
| Metadata panel         | Kategorie i wyszukiwanie metadanych.                    |
| Graphic settings       | Grafika SVG i jej ustawienia.                           |
| About                  | Rzeczywisty dialog About.                               |

Nie mnożymy stron marginesu, ikon, jednostek ani kombinacji wyrównania. Dane i geometria pozostają w Vitest, a wynikowy obraz ma jeden reprezentatywny test eksportu JPG. Każda scena wizualna robi jeden screenshot całego okna 1440 × 900. Wzorce są w `tests/visual/snapshots/{platform}/{projectName}/smoke.spec.ts`.

## Uruchamianie

- `pnpm test:visual` — sześć scen Chromium desktop, porównanie ze wzorcami.
- `pnpm test:visual --all-projects` — alias zgodności, nadal tylko Chromium desktop.
- `pnpm test:visual --grep 'metadata panel'` — jedna scena.
- `pnpm test:visual:report` — raport ostatniego przebiegu z expected/actual/diff.
- `pnpm test:visual:update --project chromium-desktop --grep 'nazwa sceny'` — aktualizacja wybranych wzorców.

Zwykłe uruchomienie nigdy nie tworzy wzorców. Po celowej aktualizacji obejrzyj nowe obrazy i różnice w Git przed commitem. Wzorce są zależne od systemu i profilu przeglądarki; nie kopiuj obrazów między profilami. W razie różnicy obejrzyj expected, actual i diff przed zmianą wzorca.

Wzorce każdej sceny i profilu wymagają obejrzenia przed zaakceptowaniem zmiany. Usunięte scenariusze i ich obrazy pozostają dostępne w historii Git sprzed uproszczenia zestawu.

Brak wzorca powoduje niezaliczoną weryfikację; aktualizuj go wyłącznie jawnie
wybraną sceną i po obejrzeniu pełnego obrazu.

## Layer blending i presety — 0.10.0-beta

Zakres wdrożony: pięć trybów mieszania i krycie całej warstwy, również Color,
Glass i wszystkie kopie Tiled. Trwałe zasady opisują USER_GUIDE, DESIGN_SYSTEM
oraz PRESET_FORMATS. Przyciski trybów zajmują całą szerokość inspektora.

Przy przygotowaniu wydania przeszły `pnpm check` (526 testów Vitest, JPG smoke,
sześć scen Chromium i build web), build Storybooka, build desktopu, kontrola
96 plików fontów/licencji i natywny smoke macOS z JPG/ZIP oraz konfiguracją.
Wszystkie manifesty wskazują 0.10.0-beta; zależności i lockfile nie zmieniły się.

Kontrole funkcjonalne obejmują 15 próbek koloru (pięć trybów × 0/50/100%,
odchylenie maks. 1/255), zgodność podglądu i PNG na małym zdjęciu, SVG/PNG
z Glass/Tiled i częściowo przezroczystym źródłem. Navigator jest identyczny
ze sceną w zgodnej skali 240 × 160; osobne skalowanie pełnego PNG powoduje
różnice interpolacji na drobnych krawędziach. Pierwszy PNG w ZIP był identyczny
bajtowo z pojedynczym eksportem. PNG zachowuje alfa, a JPG otrzymuje biały
podkład po mieszaniu. macOS potwierdził eksport Screen/50% z Glass/Tiled,
klawiaturę i Undo/Redo; Chromium także duplikację i Copy/Paste między zdjęciami.

Preset zapisuje się jako v1 przez jeden schemat. Brak blending daje Normal/100%,
brak Tiled — wyłączony wzór. Etykiety 1/2/3 są odczytywane tym samym walidatorem.
Przeglądarka zachowała dodatkowe pola root, layoutu, warstwy, stylu, blending,
offsetu i grafiki przez import, edycję, zapis, eksport JSON i reload. Natywna
konfiguracja zachowała dodatkowe pola root/window po zapisie i restarcie.

Obejrzano expected/actual/diff i zaktualizowano cztery sceny macOS Chromium:
font panel i metadata panel obejmują nową sekcję Blending; empty editor i About
zmieniają wyłącznie numer produktu na 0.10.0-beta. Zestaw pozostaje sześcioscenowy,
a test historii mieszania jest częścią istniejącej sceny prepared photo session.

Ograniczenia: pełny eksport działa na głównym wątku. Pomiar próbki Glass/Tiled
wynosił 354 ms przy 1200 × 1800 i 2749 ms przy 4000 × 6000, bez kodowania.
Gęsty Glass może powodować przerwę; nie jest to gwarancja płynności. Ręczny
odbiór nowej funkcji na Windows/Linux pozostaje niewykonany.

## Tiled watermark — weryfikacja 0.9.0-beta

Funkcja zaakceptowana 2026-11-05; implementacja: `27ca322`.
Trwałe zachowanie opisują [USER_GUIDE](USER_GUIDE.md),
[DESIGN_SYSTEM](DESIGN_SYSTEM.md) i [PRESET_FORMATS](PRESET_FORMATS.md).

Przy przygotowaniu 0.9.0-beta przeszły `pnpm check`: 521 testów Vitest,
JPG smoke, sześć scen Chromium oraz build web. Zaliczone także buildy
Storybooka i desktopu, kontrola 96 plików fontów/licencji oraz natywny smoke
macOS z JPG/ZIP i konfiguracją. Zależności i lockfile nie zmieniły się.
Cztery wzorce (empty editor, font panel, metadata panel, About) zaktualizowano
po obejrzeniu expected/actual/diff i zgodzie na publikację. Obejmują trzy tryby
Position, prześwitywanie pod stopką i numer wersji 0.9.0-beta.

Kontrole Chromium objęły domyślne Staggered/30°/12%, reset, drag przy 45°,
offset w osiach zdjęcia, wybieranie kopii i przerwy między nimi, błąd limitu
2000 kopii oraz hover canvasu/listy warstw/pól offsetu. Samo zaznaczenie
nie pokazuje zielonej ramki; dekoracje nie trafiają do eksportu ani Navigatora.
Natywny macOS potwierdził drag Tiled i jeden krok Undo/Redo bez zmiany trybu/kąta.

Porównanie podglądu bez dekoracji i PNG dało identyczne piksele; pierwszy PNG
w dwuplikowym ZIP był identyczny z pojedynczym eksportem. Sprawdzono tekst
z SVG i PNG przy ujemnym offsecie, obecność Glass w podglądzie i PNG,
regresję lokalnego pozycjonowania tła, migrację v1 → v2 i kopie oryginałów.
Konwerter zachowuje źródło i odrzuca istniejący plik docelowy.

Nie potwierdzono osobno ręcznego Copy/Paste między różnymi zdjęciami ani
oceny bardzo gęstego Glass na dużych zdjęciach. Akceptacja funkcji nie jest
potwierdzeniem wykonania tych prób. Odbiór na Windows/Linux pozostaje ręczny.

## Navigator — weryfikacja 0.7.0-beta

Wydany kod: `716f083`, tag `v0.7.0-beta`. [Proces wydania](https://github.com/rafalkarczmarzyk/frame-note/actions/runs/41985599461)
zakończył się sukcesem 2026-11-05: walidacja, źródła, paczki macOS/Windows/Linux,
testy gotowych aplikacji i launchera Windows oraz publikacja.

Przed wydaniem przeszły `pnpm check` (493 testy Vitest, w tym 21 testów
geometrii/stanu zoomu/adaptera OS, istniejący eksport JPG, sześć scen Chromium
i build web), build Storybooka oraz natywny smoke macOS z JPG/ZIP i konfiguracją.
Nie dodano testu ani profilu przeglądarkowego. Zmiany wzorców obejrzano jako
expected/actual/diff; dotyczyły zaakceptowanego Navigatora, scrolla sidebara,
stanu strzałki przy ułamkowym Fit i numeru wersji w stopce empty/About.

Kontrole interaktywne Chromium objęły Fit/100%, całkowite procenty ręcznego
zoomu, Z (także powrót do dokładnego Fit), akumulację małych delt wheel,
Spację/MMB, scroll, Cmd-wheel, Escape podczas pan, pole % i jego strzałki,
niezależne widoki dwóch zdjęć, fokus tekstu, drag marginesu w Fit oraz drag
warstwy i Undo na DPR 2. Zoom/pan nie zmieniały rastra miniatury ani Undo. Małe zdjęcie
w Fit zachowało skalę 100% na DPR 2; przy 800% canvas miał nadal 2112×1704 px
dla viewportu 1056×852 CSS px. Nie ma własnych skrótów +/− do zoomu zdjęcia.

Otwarte kontrole ręczne, nieweryfikowane przez opublikowane paczki CI:

- Fizyczny trackpad/pinch i sterowanie na Windows/Linux; test adaptera OS nie
  potwierdza sposobu dostarczania gestów przez konkretny sprzęt i przeglądarkę.
- Odbiór skali 100% na fizycznej Retinie (definicja pozostaje 1 piksel CSS).
- Pełna macierz jednostek/link modes marginesów przy zoom, uchwyty na brzegach
  oraz pointercancel/blur podczas różnych rodzajów drag.
- Osobna ocena motywów i profili poza obecnym UI i profilem Chromium desktop.

Bieżące zachowanie opisuje [instrukcja użytkownika](USER_GUIDE.md#navigating-the-photo).

## Presets — weryfikacja 0.7.1-beta

Ochrona niezapisanych zmian: 496 testów Vitest, eksport JPG, sześć scen Chromium,
build web/desktop i Storybook oraz natywny smoke macOS przeszły przed wydaniem.
Kontrole interakcji Chromium objęły gwiazdkę, zapis nowego i istniejącego presetu,
reset własnego i wbudowanego presetu, wybór z selecta i panelu oraz zachowanie
zmian po Cancel/Escape. Użytkownik zaakceptował etap i zlecił wydanie.

Wzorzec prepared photo session zmienia tylko pasek presetów: gwiazdka przy nazwie
zastępuje Modified. Expected/actual/diff obejrzano przed aktualizacją.
Przy wydaniu wzorce empty editor i About zaktualizowano po obejrzeniu
expected/actual/diff: zmienił się wyłącznie numer wersji w stopce.
Nie rozszerzono zestawu testów ani profili. Nowy dialog obejrzano w Chromium;
natywny smoke potwierdza ogólne działanie desktopu, bez osobnego sprawdzenia
nowego przepływu w natywnym oknie. Zachowanie opisuje instrukcja użytkownika.

## Preset recovery — weryfikacja 0.7.2-beta

Poprawka zapisu częściowo czytelnej biblioteki i diagnostyka odrzuconych wpisów
zostały zaakceptowane przez użytkownika 2026-11-05. Testy Vitest: 73 pliki,
504 testy; obejmują zachowanie oryginałów, błędy zapisu, kolejkę operacji,
zamrożony oficjalny v1 oraz ochronę plików desktopu.

Kontrola rzeczywistego panelu Chromium potwierdziła import desktopowego
`stack.json` przy nieczytelnym wpisie, zachowanie tego wpisu po zapisie i reload,
pobranie oryginalnej kopii oraz rozwijane szczegóły błędu. Story
`Sidebar & panels/AppHeader/UnreadablePresets` używa izolowanej biblioteki w pamięci.

Przed podniesieniem wersji przeszło sześć scen wizualnych, test JPG i natywny
smoke macOS. Dla numeru 0.7.2-beta obejrzano expected/actual/diff; jedyne różnice
(422 piksele w każdej scenie) dotyczyły numeru wersji w stopce pustego okna i About.
Zaktualizowano wyłącznie te dwa wzorce Darwin/Chromium desktop. Nie rozszerzono
zestawu ani profili przeglądarkowych. Build Storybooka, lint, typy, format,
kontrola tokenów i zgodność manifestów przeszły.

Dla przygotowanego 0.7.2-beta pełne `pnpm check` po aktualizacji wzorców oraz
natywny smoke po ponownej kompilacji desktopu zakończyły się sukcesem.

## Eksport JPG/PNG — weryfikacja 0.8.0-beta

Użytkownik zlecił wydanie obu etapów eksportu 2026-11-05. Implementacja na
`codex/export-formats`: `29d43b3` (pojedyncze zdjęcie) i `4bb7a00` (ZIP).
Metadane PNG działają tak jak JPG: te same grupy i zapis XMP; bez dodatkowego
natywnego eXIf. PNG zachowuje przezroczystość, bez opcji jej usuwania.
Presety v1 pozostają bez migracji. Zachowanie opisuje instrukcja użytkownika.

Przed przygotowaniem numeru wydania przeszło `pnpm check`: 74 pliki / 508 testów
Vitest, dotychczasowy eksport JPG, sześć scen wizualnych bez zmian wzorców,
format, lint, typy, tokeny, manifesty i build web. Build desktop i natywny smoke
macOS również przeszły. Nowe testy obejmują odczyt XMP PNG przez ExifReader
(model/ISO i pomijanie wyłączonych grup), nazwy PNG oraz format ustalony przy
starcie ZIP dla mieszanych wejść i powtarzających się nazw.

Kontrole rzeczywistego edytora w Chromium i macOS potwierdziły import
`tests/fixtures/presets/v1.json`, oba formaty pojedynczo i w ZIP, poprawne
sygnatury, rozszerzenia i nazwy z sufiksem -2. Pierwszy plik ZIP był identyczny
bajtowo z eksportem pojedynczym; średnia różnica kanałów zdekodowanego JPG i PNG
wyniosła 0,008/255 dla kontrolnej kompozycji. Natywny zapis PNG zachował wymiary
5964×3976. Syntetyczne PNG 32×24 zachowało alfa=0 w nieprzykrytym pikselu.

W Chromium opóźniono kodowanie canvas i zmieniono format w trakcie pracy:
pobrano aktualne PNG, a liczba bajtów odpowiadała rozmiarowi w UI. Jednorazowy
błąd kodera zablokował eksport; Retry przywróciło przygotowanie i przycisk.
Przełączanie formatów w webie i desktopie zachowało wybraną jakość JPG 75%.
Nie rozszerzono zestawu testów przeglądarkowych ani profili.

Dla przygotowanego numeru 0.8.0-beta ponownie przeszły pełne `pnpm check`,
build desktop, kontrola 96 zasobów fontów/licencji i natywny smoke macOS.
Obejrzano expected/actual/diff empty editor i About: zmieniał się wyłącznie
numer wersji w stopce. Zaktualizowano tylko te dwa wzorce Darwin/Chromium desktop;
wszystkie sześć scen następnie przeszło. Manifesty i changelog zweryfikowano
względem `v0.7.2-beta`. Publikacja wymaga dalszego kroku wydania.

## Ostrość podglądu efektów — 2026-11-06

Poprawka zaakceptowana przez użytkownika 2026-11-06 na bazie 23f45f5.
Podgląd Add/Glass dobiera rozdzielczość do zoomu i DPR, do rozmiaru oryginału;
100% sprawdzono w Chromium przy DPR 1 i 2, wraz z przesuwaniem do datownika.
Glass przy 100% sprawdzony wizualnie. Istniejąca scena graphic settings sprawdza
bitmapę Add 5964×3976 przy 100% oraz zmniejszenie po powrocie do Fit — PASS.
530 testów jednostkowych, lint, typecheck, formatowanie, kontrola wersji, build web,
kompilacja i test natywnego desktopu macOS — PASS. Windows/Linux nie sprawdzono ręcznie.

Otwarte wzorce po zmianie presetów: sześć scen uruchomione, 1 PASS / 5 różnic;
obejrzano diffy. JPG wygenerowany i odczytany w 5964×3976, różnica 24990 pikseli
wobec starego podpisu — identyczna jak przed naprawą podglądu. Wzorców nie
aktualizowano; ich akceptacja pozostaje osobnym zadaniem presetów. Raporty:
playwright-visual-report i playwright-report. Weryfikacja obrazów ręcznych:
/tmp/framenote-sharp-1.png, /tmp/framenote-sharp-2.png, /tmp/framenote-sharp-glass.png.
