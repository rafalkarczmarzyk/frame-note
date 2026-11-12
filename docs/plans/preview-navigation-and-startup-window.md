# Nawigacja podglądu i rozmiar startowy okna

Stan: wdrożone, do oceny na urządzeniu, 2026-11-11. Zakres autoryzowany: wszystkie trzy zmiany.

## Zakres i zgodność

- Wspólny edytor: pierwsza próba z czułością zoomu `0.002 → 0.006` i
  mnożnikiem przesuwania `1.0 → 1.2` na obu osiach. Te same zdarzenia
  obsługują również kółko myszy, więc jego czułość podlega próbie.
- Wspólny edytor: kompaktowy suwak zoomu z dekoracyjnymi lupami po obu stronach i edytowalnym polem procentowym obok Undo/Redo. Pole można przeciągać za strzałki. Menu udostępnia Fit i 100%.
  Na ciasnym pasku suwak pozostaje widoczny w drugim rzędzie. Oba suwaki
  korzystają z istniejącej skali logarytmicznej i stanu widoku zdjęcia.
  Pasek jest dostępny przy zwiniętym Navigatorze. Bez gotowego zdjęcia
  suwak jest nieaktywny.
- Desktop macOS, Windows i Linux: limit 85% szerokości i 85% wysokości dostępnego obszaru
  roboczego każdego ekranu. Obejmuje okno domyślne i zapisane, także po
  odłączeniu monitora. Mniejsza zapisana geometria zostaje przywrócona.
  Ponadwymiarowe okno jest zmniejszane i centrowane. Start jest w trybie okna.
- Poprawki wchodzą do przygotowywanego wydania `0.11.2-beta` jako patch.
  Formaty presetów i konfiguracji
  desktopowej pozostają zgodne.

## Kryteria odbioru

| AC    | Obserwowalne zachowanie                                                                                                                                                                   | Weryfikacja                                                                                                                                                          |
| ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AC-01 | Pinch szybciej przybliża detal, a mały ruch pozwala skorygować skalę. Pan jest trochę szybszy na obu osiach.                                                                              | Test obliczeń i próba na fizycznym trackpadzie w desktopie i Chromium. Próba kółka z modyfikatorem.                                                                  |
| AC-02 | Suwak jest widoczny obok Undo/Redo lub w drugim rzędzie. Procent i pozycja obu suwaków aktualizują się po geście, Fit i zmianie zdjęcia. Suwak działa klawiaturą i nie dodaje wpisu Undo. | Próba w szerokim i wąskim oknie, Storybook dla nowej kontrolki, istniejące sceny `pnpm test:visual` i test JPG.                                                      |
| AC-03 | Na MacBooku 14″ widać fragment okna Findera obok FrameNote i da się przeciągnąć plik bez ręcznego zmniejszania okna. Na monitorze 4K obowiązuje ten sam limit.                            | Test geometrii na przykładowych obszarach roboczych. Ręczna próba na ekranie wbudowanym i monitorze 4K, także po jego odłączeniu i z włączonym zapamiętywaniem okna. |

## Wynik i odbiór

- Kompilacja web, desktop i Storybook, TypeScript, ESLint, tokeny, wersje oraz
  575 testów Vitest przeszły. Testy geometrii obejmują mały i duży obszar
  roboczy oraz zapisane okna przed odłączeniem monitora i po nim (AC-03).
- Kontrola wydania 2026-11-12: eksport JPG 1/1 i sześć scen Chromium 6/6
  przeszły. Obejrzano expected/actual/diff i zaktualizowano wzorce paska
  zoomu oraz numeru wersji. Styl screenshotów usuwa identyfikator buildu
  z układu, aby długość hasha i dirty nie przesuwała wersji.
- Natywny smoke macOS przeszedł, w tym konfiguracja, trwałość, odzyskiwanie
  i geometria. Asercja restartu sprawdza start bez maksymalizacji zgodnie
  z aktualnym zachowaniem. Kontrola 100 fontów i plików licencji przeszła.
- Odbiór: uruchomić `pnpm desktop:preview`, sprawdzić przeciągnięcie zdjęcia
  z Findera na ekranie wbudowanym, odruchową czułość trackpada i kółka oraz
  dostępność suwaka przy małej szerokości okna. Porównać start na monitorze 4K.
- Odbiór na Windows i Linux: sprawdzić start przy zapisanym zmaksymalizowanym
  oknie oraz po zmianie monitora.
