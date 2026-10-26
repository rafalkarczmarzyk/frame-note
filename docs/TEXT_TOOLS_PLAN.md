# Propozycja rozszerzenia narzędzi tekstowych

Status: pierwszy zakres B/I oraz układ Typography wdrożone na polecenie użytkownika.
Dalsze rozszerzenia pozostają propozycjami bez zgody na implementację.

## Pierwszy zakres — prawdziwe warianty fontów

- Dodać przycisk Italic obok Bold. Oba działają niezależnie na całej warstwie.
- Obsłużyć Regular, Bold, Italic i Bold Italic zależnie od dostępności w foncie.
- Montserrat: podłączyć istniejący w pakiecie plik `wght-italic.css`.
- Advercase: obecne zasoby obejmują tylko Regular i Bold; Italic ma być wyłączone
  z wyjaśnieniem „Italic unavailable for this font”. Nie symulować pochylenia.
- Przy zmianie fontu na taki bez kursywy wyłączyć kursywę. Powrót do poprzedniego
  fontu nie przywraca jej automatycznie; stan kontrolki odzwierciedla efekt.
- Dodać katalog możliwości fontów, wspólny dla pickera, kontrolek i walidacji.
- Zapisywać styl normal/italic w warstwie i presetach; brak pola oznacza normal.
- Podłączyć wariant do pomiaru tekstu, układu inline, podglądu, ładowania fontów
  i eksportu. Czekać na właściwą odmianę przed pomiarem i eksportem.
- Ikony i obrazy inline zachowują geometrię; pochylenie obejmuje tekst.

## Układ panelu do oceny

Font na pełnej szerokości. Poniżej rozmiar oraz niezależne B i I.
Interlinia w osobnym wierszu, pozostawiając miejsce na ewentualny tracking.
Wyrównanie Auto/lewo/środek/prawo oraz kolor pozostają w kolejnym wierszu.
Opacity pozostaje na dole. Sprawdzić wariant w wąskim sidebarze w Storybooku.

## Możliwe następne rozszerzenia — bez zatwierdzenia

- Tracking, czyli odstęp między literami; wymaga spójnego pomiaru i eksportu,
  zwłaszcza na granicach tekstu oraz ikon i obrazów inline.
- Underline i strikethrough, jeśli pojawi się potrzeba takich podpisów.
- Więcej grubości jako wybór odmiany zamiast samego Bold, gdy katalog fontów
  będzie tego wymagał.

Formatowanie fragmentów treści jest osobnym zakresem: obecny styl obejmuje
całą warstwę, a edytor i presety nie opisują stylów poszczególnych fragmentów.

## Weryfikacja pierwszego zakresu

Testy możliwości fontów, kombinacji B/I i presetów. Storybook: Regular, Bold,
Italic, Bold Italic, brak kursywy i wąski sidebar. Sprawdzić brak skoku przy
załadowaniu odmiany oraz zgodność podglądu i JPG dla tekstu wieloliniowego,
polskich znaków, znaków pochylonych przy krawędziach i treści z ikonami.
