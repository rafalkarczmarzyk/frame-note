# FrameNote — kontekst dla agenta

Przed rozpoczęciem pracy przeczytaj:

- [Kontekst produktu i plan pre-MVP/MVP](docs/PRODUCT_PLAN.md).
- [Uruchomienie i aktualne możliwości](README.md).
- [Design system](docs/DESIGN_SYSTEM.md).
- [Nice to have — pomysły odłożone na później](docs/NICE_TO_HAVE.md).

Pre-MVP jest ukończone i zaakceptowane. Plan MVP zawiera propozycje, które
wymagają uzgodnienia zakresu. Pracujemy etapami: implementacja, ocena użytkownika,
poprawki, a następnie jego potwierdzenie przejścia dalej. Nie realizuj kolejnego
etapu ani nie wykonuj commita bez polecenia użytkownika.

Przed zmianą lub dodaniem UI sprawdź [instrukcję FrameNote UI](docs/DESIGN_SYSTEM.md)
i aktualne komponenty/stories. Rozszerzaj wspólne komponenty zamiast kopiować ich
style Tailwind do feature; nowy wspólny komponent dokumentuj w Storybooku.

## Branche, wersje i changelog

Przy przygotowaniu commita, merge'a oraz zmian wersji lub changeloga zastosuj
projektowy skill
[maintain-versioning](.agents/skills/maintain-versioning/SKILL.md).
Małe poprawki mogą trafiać bezpośrednio do `master`; nowe funkcje, większe zmiany
UI i refaktory prowadź na branchach `codex/`. PR jest opcjonalny, zalecany dla
dużych lub ryzykownych zmian. Preferuj squash merge ukończonego zadania.
Nie wprowadzaj osobnego, stałego brancha `develop`.

Polecenie commita ukończonej zmiany aplikacji na `master` lub merge'a
zaakceptowanego zadania obejmuje podbicie wersji, changelog i lokalny tag bez
dodatkowego potwierdzenia. Commity robocze na branchach nie podbijają wersji.
Beta zaczyna się od `0.1.0-beta`. Poprawki zwiększają PATCH, funkcje i zmiany
niezgodne zwiększają MINOR i zerują PATCH. Nie dodajemy licznika po `-beta`
ani `-alpha`. Jedno ukończone zadanie wprowadzane do `master` oznacza jedno
podbicie wersji bazowej. `1.0.0` oznacza pierwszą ukończoną stabilną wersję.
Pierwsze przejście z alphy do bety, przejście do RC i
stabilnego wydania wymagają wyraźnego polecenia. Zmiany wyłącznie dokumentacji,
testów, narzędzi i skilla nie wymagają podbicia ani wpisu wydania. Konfigurację
oceniaj według wpływu na działanie lub paczkowanie aplikacji.

Zachowuj wspólną wersję produktu we wszystkich manifestach workspace.
Changelog prowadź po angielsku, z datowanymi sekcjami wersji i Unreleased dla
zmian oczekujących. Respektuj jawne wyjątki użytkownika. Commit na branchu nie
oznacza akceptacji ani zgody na merge. Lokalny tag nie oznacza publikacji;
push, publikacja, podpisywanie i dystrybucja wymagają osobnego polecenia.

## Pomysły na później

Gdy użytkownik odkłada konkretny pomysł („na kiedyś”, „później”, „nie teraz”),
zastosuj projektowy skill
[deferred-ideas](.agents/skills/deferred-ideas/SKILL.md) i zapisz decyzję
w `docs/NICE_TO_HAVE.md` w tej samej turze. Sprawdź istniejące wpisy, żeby nie
tworzyć duplikatów. Lista jest pamięcią decyzji, nie zgodą na implementację.
Nie włączaj odłożonych pomysłów do bieżącego zakresu bez polecenia użytkownika.

## Regresja wizualna interfejsu

Przed oddaniem zmian wyglądu, kontrolek lub układu uruchom `pnpm test:visual`.
Przy zmianach wspólnych styli i komponentów sprawdź również
`pnpm test:visual --all-projects`. Katalog scen i sposób przeglądania różnic:
[UI_VISUAL_REGRESSION_PLAN.md](docs/UI_VISUAL_REGRESSION_PLAN.md).

Różnica wizualna wymaga obejrzenia expected/actual/diff. Nie aktualizuj wzorców,
żeby jedynie naprawić test; aktualizuj wyłącznie świadomie zaakceptowane sceny.
Dodając nowy istotny stan interfejsu, dodaj jego scenariusz do zestawu.
Wzorce są zależne od systemu i profilu przeglądarki; brak właściwego środowiska
zgłoś jako niewykonaną weryfikację, zamiast zapisywać wzorce z innego systemu.
Testy UI uzupełniają istniejące testy eksportu JPG.
