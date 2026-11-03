# FrameNote — kontekst produktu

FrameNote przygotowuje zdjęcia do publikacji: nakłada tekst, oznaczenia autora,
grafiki i parametry fotograficzne, a wynik zapisuje jako JPG. Punktem wyjścia
jest praca na eksportach z Lightroom Classic i potrzeba wygodniejszego podpisywania
niż w LR/Mogrify: podgląd na żywo, metadane i powtarzalne układy.

## Trwałe założenia

- Zdjęcia przetwarzamy lokalnie, bez konta i wysyłania ich na serwer.
  Desktop może sprawdzać dostępność wydań na GitHubie; nie wysyła zdjęć.
- Web i desktop Electron współdzielą modele, edytor i renderowanie.
  macOS jest główną platformą pracy; paczki obejmują też Windows i Linux.
- Interfejs jest po angielsku. Dokumentacja techniczna może być polska lub angielska.
- Podgląd i eksport korzystają ze wspólnej geometrii. Rozmiary można odnosić
  do wymiarów zdjęcia, niezależnie od skali podglądu.
- Każde zdjęcie ma niezależny układ. Presety i Copy/Paste służą ponownemu
  użyciu ustawień; nie synchronizują późniejszych zmian między zdjęciami.
- Oryginały pozostają niezmienione. Metadane podpisu są odwołaniami do zdjęcia,
  a zapis wybranych metadanych do wyniku jest osobną opcją eksportu.

## Granice produktu

Obecny zakres obejmuje JPG/PNG, warstwy tekstu i grafik, presety oraz eksport
JPG i serii do ZIP. Nie obiecujemy pełnej zgodności z LR/Mogrify, wszystkimi
metadanymi aparatów, profilami kolorów ani dowolnym SVG.

Nie ma edycji RAW, integracji uruchamianej z Lightroom, synchronizacji chmurowej,
odtwarzania niezapisanej sesji ani automatycznego zawijania/zmniejszania tekstu.
Styl jest wspólny dla całej warstwy. Zoom/pan i formatowanie fragmentów tekstu
nie należą do obecnych możliwości. Rozmyte tło całego edytora i przezroczystość
całego edytora odrzucono jako rozpraszające; nie przywracać bez nowej decyzji.

## Gdzie szukać szczegółów

- [Obsługa i ograniczenia](USER_GUIDE.md).
- [Uruchamianie, architektura i testy](DEVELOPMENT.md).
- [Wspólne UI](DESIGN_SYSTEM.md).
- [Pomysły odłożone przez użytkownika](NICE_TO_HAVE.md).
- [Historia wydań](../CHANGELOG.md).

Ten dokument opisuje kontekst, nie zatwierdza kolejnych funkcji. Aktywny zakres
ustalamy w rozmowie i krótkim planie zadania zgodnie z AGENTS.md.
