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

## Changelog przed commitem

Gdy użytkownik prosi o commit po realizacji zaplanowanego zadania albo po
iterowaniu rozwiązania, zastosuj projektowy skill
[changelog-checkpoint](.agents/skills/changelog-checkpoint/SKILL.md) i zapytaj,
czy zaktualizować `CHANGELOG.md` dla tego wyniku. Nie pytaj przy każdym commicie:
zapisy pośrednie oraz zwykłe samodzielne zmiany dokumentacji lub konfiguracji
nie uruchamiają pytania. Wyraźna decyzja aktualizacji lub pominięcia changeloga
dla danego wyniku jest już odpowiedzią — nie pytaj ponownie. Commit sam w sobie
nie oznacza oddania zadania, akceptacji etapu ani wydania.

## Pomysły na później

Gdy użytkownik odkłada konkretny pomysł („na kiedyś”, „później”, „nie teraz”),
zastosuj projektowy skill
[deferred-ideas](.agents/skills/deferred-ideas/SKILL.md) i zapisz decyzję
w `docs/NICE_TO_HAVE.md` w tej samej turze. Sprawdź istniejące wpisy, żeby nie
tworzyć duplikatów. Lista jest pamięcią decyzji, nie zgodą na implementację.
Nie włączaj odłożonych pomysłów do bieżącego zakresu bez polecenia użytkownika.
