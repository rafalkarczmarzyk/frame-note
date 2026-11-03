# FrameNote — instrukcja pracy

Przed pracą przeczytaj [README](README.md), [kontekst produktu](docs/PRODUCT.md)
i [odłożone pomysły](docs/NICE_TO_HAVE.md). Przed zmianą UI sprawdź
[design system](docs/DESIGN_SYSTEM.md) i aktualne komponenty/stories.
Komendy i weryfikację opisuje [DEVELOPMENT](docs/DEVELOPMENT.md).

## Zakres i decyzje

Zmiany desktopu, webu i wspólnych modeli prowadź według
[change-workflow](.agents/skills/change-workflow/SKILL.md): implementacja,
ocena użytkownika, poprawki i potwierdzenie następnego etapu.
Nie wykonuj kolejnego etapu ani commita bez polecenia. Akceptacja działania
nie oznacza zgody na commit/push; użytkownik może połączyć zgody.
Nie pytaj ponownie o zgodę już udzieloną.

Dokumentacja, testy, narzędzia i skille wymagają proporcjonalnej weryfikacji,
bez pełnego procesu zmian aplikacji. Wspólne UI rozszerzaj zamiast kopiować
style Tailwind do feature; nowy komponent dokumentuj w Storybooku.

## Git i wydania

Stosuj [maintain-versioning](.agents/skills/maintain-versioning/SKILL.md)
przy commitach, merge'ach, zmianach wersji i changeloga. Małe poprawki mogą
trafiać na master; funkcje, większe UI i refaktory na `codex/`. Preferuj squash
ukończonego zadania, bez stałego develop; PR jest opcjonalny.

Commity/merge'e gromadzą zmiany pod Unreleased, bez podbicia wersji i taga.
Wyraźnie zlecone wydanie prowadź przez
[prepare-release](.agents/skills/prepare-release/SKILL.md).
Wersja produktu jest wspólna dla manifestów; changelog po angielsku.
Zmiany wyłącznie dokumentacji/testów/narzędzi/skilli nie wymagają wydania.
Commit brancha nie oznacza akceptacji ani merge'a. Push, publikacja,
podpisywanie i dystrybucja wymagają właściwego polecenia; lokalny tag nie publikuje.

## Dokumentacja i pomysły

Opisuj aktualny wynik, nie przebieg rozmowy. Zastępuj nieaktualne statusy;
jedna informacja ma jedno główne miejsce. Po zamknięciu zadania przenieś
trwałe ustalenia do właściwej instrukcji, usuń plan; historia pozostaje w Git.
Otwarte kwestie i dowody audytu zachowaj przed usunięciem.

Konkretny pomysł odłożony przez użytkownika zapisz w tej samej turze zgodnie z
[deferred-ideas](.agents/skills/deferred-ideas/SKILL.md), bez duplikatów.
NICE_TO_HAVE jest pamięcią decyzji, nie zgodą na implementację.

## Uruchamianie desktopu w testach

`pnpm test:desktop` wymaga sesji graficznej macOS. W Codex od pierwszej próby
używaj `exec_command` z `sandbox_permissions: "require_escalated"`.
Nie próbuj startu Electrona w ograniczonym środowisku: macOS może przerwać
`_RegisterApplication` i wyświetlić raport awarii. Nie usuwaj znaczników
środowiska, by ominąć kontrolę skryptu. Brak dostępu oznacza niewykonaną
weryfikację. Testy desktopowe i przeglądarkowe uruchamiaj kolejno.

## Kontrola wyglądu

Przed oddaniem zmian wyglądu, kontrolek lub układu uruchom `pnpm test:visual`:
sześć pełnych scen Chromium desktop. [Sceny i raporty](docs/UI_VISUAL_TESTS.md).
Różnice wymagają obejrzenia expected/actual/diff. Aktualizuj wyłącznie świadomie
zaakceptowane sceny, nigdy tylko dla naprawienia testu. Nowy stan włączaj do
istniejącej kompozycji; nowy test lub profil wymaga uzgodnienia rozszerzenia zestawu.
Wzorce zależą od systemu/profilu; brak właściwego środowiska oznacza niewykonaną
kontrolę, nie zgodę na zapis wzorców z innego systemu. UI uzupełnia jeden test JPG.
