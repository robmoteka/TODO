# Specyfikacja Aplikacji do Zarządzania Zadaniami

## Opis ogólny
Aplikacja webowa i mobilna do zarządzania zadaniami, pozwalająca na szczegółowe śledzenie problemów i ich rozwiązań, z możliwością monitorowania procesu realizacji.

## Model danych zadania

Każde zadanie zawiera następujące informacje:
- Nr zadania (identyfikator)
- Priorytet
- Lista branż, których dotyczy
- Maszyna
- Problem (krótki opis)
- Szczegółowy opis
- Proponowane rozwiązania (w formie czatu)
- Uwagi (w formie czatu)
- Proces realizacji:
  - Wykonawcy (dowolne wpisy identyfikujące osoby)
  - Termin realizacji (data z kalendarza)
  - Status realizacji
  - Postęp realizacji

## Struktura danych

```typescript
interface Zadanie {
  idZadania: number;          // Unikalny identyfikator zadania
  priorytet: number;          // Poziom priorytetu (np. 1-5)
  branze: string[];           // Lista branż, których dotyczy zadanie
  maszyna: string;            // Identyfikator maszyny
  problem: string;            // Krótki opis problemu
  opis: string;               // Pełny opis zadania
  proponowaneRozwiazania: {   // Lista proponowanych rozwiązań
    id: number;
    autor: string;
    data: Date;
    tresc: string;
    reakcje: {                // Opcjonalne reakcje na rozwiązanie
      rodzaj: string;
      liczba: number;
    }[];
  }[];
  uwagi: {                    // Uwagi do zadania
    id: number;
    autor: string;
    data: Date;
    tresc: string;
  }[];
  status: 'nowe' | 'w_trakcie' | 'rozwiazane' | 'zamkniete';
  dataUtworzenia: Date;
  dataAktualizacji: Date;
  procesRealizacji: {
    wykonawcy: {
      id: number;
      imieNazwisko: string;  // Dowolny wpis identyfikujący osobę
      rola: string;          // Np. "odpowiedzialny", "wsparcie", "konsultant"
      dataWpisu: Date;
    }[];
    terminRealizacji: Date;  // Data z kalendarza
    statusRealizacji: 'nierozpoczete' | 'w_trakcie' | 'wstrzymane' | 'zakonczone';
    postepRealizacji: number; // Opcjonalnie, procent ukończenia (0-100)
    historiaProcesow: {      // Historia zmian w procesie realizacji
      data: Date;
      autor: string;
      zmiana: string;        // Opis zmiany, np. "Zmiana terminu", "Zmiana wykonawcy"
    }[];
  };
}
```

## Główne funkcjonalności

### Panel zarządzania zadaniami
- Widok listy zadań z możliwością sortowania i filtrowania
- Szczegółowy widok pojedynczego zadania
- Zarządzanie priorytetami zadań

### System komentarzy i rozwiązań
- Dodawanie propozycji rozwiązań w stylu czatu
- Ocenianie propozycji rozwiązań
- Oznaczanie najlepszego rozwiązania

### Powiadomienia
- Powiadomienia o nowych komentarzach/rozwiązaniach
- Alerty o zadaniach o wysokim priorytecie
- Przypomnienia o zadaniach czekających na rozwiązanie

### Raportowanie
- Wykresy i statystyki dotyczące zadań
- Raporty efektywności rozwiązywania problemów
- Eksport danych do PDF/Excel

### Proces realizacji
- Zarządzanie wykonawcami zadania
- Wybór terminu realizacji z interfejsu kalendarza
- Śledzenie statusu realizacji
- Widok kalendarza z zaplanowanymi zadaniami

## Architektura aplikacji

### Frontend
- Aplikacja webowa: React.js z TypeScript
- Aplikacja mobilna: React Native
- Zarządzanie stanem: Redux lub Context API
- Stylizacja: Styled-components lub MUI (Material-UI)

### Backend
- API: Node.js z Express
- Baza danych: MongoDB
- Autoryzacja: JWT (JSON Web Tokens)

### Deployment
- Konteneryzacja za pomocą Docker
- Łatwy deployment na VPS
- CI/CD pipeline dla automatycznych wdrożeń
