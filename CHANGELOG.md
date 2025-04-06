# Changelog

Wszystkie istotne zmiany w projekcie będą dokumentowane w tym pliku.

Format bazuje na [Keep a Changelog](https://keepachangelog.com/pl/1.0.0/),
a projekt stosuje [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Nieopublikowane]

### Dodane
- Podstawowa struktura projektu frontend i backend
- Komponenty React do logowania i rejestracji
- Konfiguracja TypeScript dla frontendu
- Podstawowe API w Node.js z Express
- System autentykacji z JWT
- Podstawowy model danych zadań
- Middleware do autoryzacji (auth.js, admin.js, manager.js)
- Middleware do walidacji danych wejściowych (validator.js)
- Middleware do obsługi błędów (error.js)
- Middleware do logowania aktywności (logger.js)
- Walidatory dla zadań (task.validator.js)
- Walidatory dla użytkowników (user.validator.js)
- Aktualizacja tras API z wykorzystaniem nowych middleware

### Zmienione
- Refaktoryzacja kontrolerów użytkowników i zadań
- Ulepszenie obsługi błędów w API
- Aktualizacja struktury aplikacji dla lepszej organizacji kodu

### Naprawione
- Problem z konfiguracją React JSX w TypeScript
- Brakujące pliki w katalogu public dla aplikacji React
- Poprawione zarządzanie uprawnieniami w API

## [0.1.0] - 2025-04-06

### Dodane
- Inicjalizacja projektu
- Utworzenie repozytorium
- Konfiguracja środowiska deweloperskiego
- Podstawowa struktura projektu
- Dokumentacja projektu w README.md
