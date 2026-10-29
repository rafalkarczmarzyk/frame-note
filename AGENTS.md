# FrameNote — kontekst dla agenta

Przed rozpoczęciem pracy przeczytaj:

- [Kontekst produktu i plan pre-MVP/MVP](docs/PRODUCT_PLAN.md).
- [Uruchomienie i aktualne możliwości](README.md).
- [Design system](docs/DESIGN_SYSTEM.md).
- [Nice to have — pomysły odłożone na później](docs/NICE_TO_HAVE.md).
- [Audyt techniczny — wymagania i plan etapowych poprawek](docs/TECHNICAL_REMEDIATION_PLAN.md).

Pre-MVP jest ukończone i zaakceptowane. Plan MVP zawiera propozycje, które
wymagają uzgodnienia zakresu. Pracujemy etapami: implementacja, ocena użytkownika,
poprawki, a następnie jego potwierdzenie przejścia dalej. Nie realizuj kolejnego
etapu ani nie wykonuj commita bez polecenia użytkownika.

## Prowadzenie changeloga

Przy commicie ukończonego zadania lub rozwiązania dopracowanego w iteracjach
zastosuj projektowy skill
[maintain-changelog](.agents/skills/maintain-changelog/SKILL.md).
Aktualizuj `CHANGELOG.md` bez dodatkowego potwierdzenia, uwzględniając istotne
zmiany i scalając wpisy dotyczące tego samego wyniku. Pomijaj zapisy pośrednie
oraz rutynowe zmiany dokumentacji, konfiguracji i samego skilla. Respektuj
wyraźne polecenie pominięcia aktualizacji. Commit nie oznacza akceptacji etapu
ani wydania; zmiana wersji i publikowanie wymagają osobnego polecenia.

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
