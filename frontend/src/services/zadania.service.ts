import api from './api';
import { 
  Zadanie, 
  ProponowaneRozwiazanie, 
  Uwaga, 
  Wykonawca, 
  PaginatedResponse,
  ValidationErrors
} from '../types';

/**
 * Klasa błędu API z obsługą błędów walidacji
 */
export class BladAPI extends Error {
  status: number;
  bledyWalidacji?: ValidationErrors;
  
  constructor(message: string, status: number, bledyWalidacji?: ValidationErrors) {
    super(message);
    this.name = 'BladAPI';
    this.status = status;
    this.bledyWalidacji = bledyWalidacji;
  }
}

/**
 * Funkcja pomocnicza do obsługi błędów API
 * @param err - Błąd z API
 * @param domyslnaWiadomosc - Domyślna wiadomość błędu
 */
const obsluz_blad_api = (err: any, domyslnaWiadomosc: string): never => {
  if (err.response) {
    // Obsługa błędów walidacji
    if (err.response.data.errors) {
      // Sprawdzenie czy errors jest tablicą (format express-validator)
      if (Array.isArray(err.response.data.errors)) {
        const bledyWalidacji: ValidationErrors = {};
        err.response.data.errors.forEach((blad: any) => {
          bledyWalidacji[blad.param] = blad.msg;
        });
        throw new BladAPI(
          err.response.data.message || 'Błędy walidacji formularza',
          err.response.status,
          bledyWalidacji
        );
      } 
      // Sprawdzenie czy errors jest obiektem (format własny)
      else if (typeof err.response.data.errors === 'object') {
        throw new BladAPI(
          err.response.data.message || 'Błędy walidacji formularza',
          err.response.status,
          err.response.data.errors
        );
      }
    }
    
    // Obsługa innych błędów
    throw new BladAPI(
      err.response.data.message || domyslnaWiadomosc,
      err.response.status
    );
  } else if (err.request) {
    // Błąd braku odpowiedzi z serwera
    throw new BladAPI('Brak odpowiedzi z serwera. Sprawdź połączenie internetowe.', 0);
  } else {
    // Inne błędy
    throw new BladAPI(err.message || domyslnaWiadomosc, 500);
  }
};

/**
 * Serwis do obsługi zadań
 * Zawiera metody do komunikacji z API dla operacji na zadaniach
 */
class ZadaniaService {
  /**
   * Pobieranie listy zadań z możliwością filtrowania i paginacji
   * @param params - Parametry filtrowania i sortowania
   * @returns Lista zadań z informacjami o paginacji
   */
  async pobierz_zadania(params: Record<string, any> = {}): Promise<PaginatedResponse<Zadanie>> {
    try {
      const response = await api.get('/tasks', { params });
      return response.data;
    } catch (err: any) {
      return obsluz_blad_api(err, 'Błąd podczas pobierania zadań');
    }
  }

  /**
   * Pobieranie szczegółów pojedynczego zadania
   * @param id - Identyfikator zadania
   * @returns Szczegóły zadania
   */
  async pobierz_zadanie(id: string): Promise<Zadanie> {
    try {
      const response = await api.get(`/tasks/${id}`);
      return response.data;
    } catch (err: any) {
      return obsluz_blad_api(err, `Błąd podczas pobierania zadania o ID ${id}`);
    }
  }

  /**
   * Tworzenie nowego zadania
   * @param zadanie - Dane nowego zadania
   * @returns Utworzone zadanie
   */
  async utworz_zadanie(zadanie: Partial<Zadanie>): Promise<Zadanie> {
    try {
      const response = await api.post('/tasks', zadanie);
      return response.data;
    } catch (err: any) {
      return obsluz_blad_api(err, 'Błąd podczas tworzenia zadania');
    }
  }

  /**
   * Aktualizacja istniejącego zadania
   * @param id - Identyfikator zadania
   * @param zadanie - Dane do aktualizacji
   * @returns Zaktualizowane zadanie
   */
  async aktualizuj_zadanie(id: string, zadanie: Partial<Zadanie>): Promise<Zadanie> {
    try {
      const response = await api.put(`/tasks/${id}`, zadanie);
      return response.data;
    } catch (err: any) {
      return obsluz_blad_api(err, `Błąd podczas aktualizacji zadania o ID ${id}`);
    }
  }

  /**
   * Usuwanie zadania
   * @param id - Identyfikator zadania
   * @returns Komunikat o powodzeniu
   */
  async usun_zadanie(id: string): Promise<{ message: string }> {
    try {
      const response = await api.delete(`/tasks/${id}`);
      return response.data;
    } catch (err: any) {
      return obsluz_blad_api(err, `Błąd podczas usuwania zadania o ID ${id}`);
    }
  }

  /**
   * Dodawanie proponowanego rozwiązania do zadania
   * @param id - Identyfikator zadania
   * @param rozwiazanie - Dane rozwiązania
   * @returns Zaktualizowane zadanie
   */
  async dodaj_rozwiazanie(id: string, rozwiazanie: Partial<ProponowaneRozwiazanie>): Promise<Zadanie> {
    try {
      const response = await api.post(`/tasks/${id}/solutions`, rozwiazanie);
      return response.data;
    } catch (err: any) {
      return obsluz_blad_api(err, `Błąd podczas dodawania rozwiązania do zadania o ID ${id}`);
    }
  }

  /**
   * Dodawanie uwagi do zadania
   * @param id - Identyfikator zadania
   * @param uwaga - Dane uwagi
   * @returns Zaktualizowane zadanie
   */
  async dodaj_uwage(id: string, uwaga: Partial<Uwaga>): Promise<Zadanie> {
    try {
      const response = await api.post(`/tasks/${id}/comments`, uwaga);
      return response.data;
    } catch (err: any) {
      return obsluz_blad_api(err, `Błąd podczas dodawania uwagi do zadania o ID ${id}`);
    }
  }

  /**
   * Aktualizacja procesu realizacji zadania
   * @param id - Identyfikator zadania
   * @param status - Nowy status realizacji
   * @param postep - Nowy postęp realizacji (0-100)
   * @returns Zaktualizowane zadanie
   */
  async aktualizuj_status_realizacji(id: string, status: string, postep: number): Promise<Zadanie> {
    try {
      const response = await api.put(`/tasks/${id}/process`, { 
        statusRealizacji: status, 
        postepRealizacji: postep 
      });
      return response.data;
    } catch (err: any) {
      return obsluz_blad_api(err, `Błąd podczas aktualizacji statusu realizacji zadania o ID ${id}`);
    }
  }

  /**
   * Dodawanie wykonawcy do zadania
   * @param id - Identyfikator zadania
   * @param wykonawca - Dane wykonawcy
   * @returns Zaktualizowane zadanie
   */
  async dodaj_wykonawce(id: string, wykonawca: Partial<Wykonawca>): Promise<Zadanie> {
    try {
      const response = await api.post(`/tasks/${id}/assignees`, wykonawca);
      return response.data;
    } catch (err: any) {
      return obsluz_blad_api(err, `Błąd podczas dodawania wykonawcy do zadania o ID ${id}`);
    }
  }

  /**
   * Usuwanie wykonawcy z zadania
   * @param idZadania - Identyfikator zadania
   * @param idWykonawcy - Identyfikator wykonawcy
   * @returns Zaktualizowane zadanie
   */
  async usun_wykonawce(idZadania: string, idWykonawcy: number): Promise<Zadanie> {
    try {
      const response = await api.delete(`/tasks/${idZadania}/assignees/${idWykonawcy}`);
      return response.data;
    } catch (err: any) {
      return obsluz_blad_api(err, `Błąd podczas usuwania wykonawcy z zadania o ID ${idZadania}`);
    }
  }
  
  /**
   * Pobieranie statystyk zadań
   * @returns Statystyki zadań
   */
  async pobierz_statystyki(): Promise<any> {
    try {
      const response = await api.get('/tasks/stats');
      return response.data;
    } catch (err: any) {
      return obsluz_blad_api(err, 'Błąd podczas pobierania statystyk zadań');
    }
  }
  
  /**
   * Dodawanie reakcji do rozwiązania
   * @param idZadania - Identyfikator zadania
   * @param idRozwiazania - Identyfikator rozwiązania
   * @param rodzajReakcji - Rodzaj reakcji (np. "like", "dislike")
   * @returns Zaktualizowane zadanie
   */
  async dodaj_reakcje(idZadania: string, idRozwiazania: number, rodzajReakcji: string): Promise<Zadanie> {
    try {
      const response = await api.post(`/tasks/${idZadania}/solutions/${idRozwiazania}/reactions`, {
        rodzaj: rodzajReakcji
      });
      return response.data;
    } catch (err: any) {
      return obsluz_blad_api(err, `Błąd podczas dodawania reakcji do rozwiązania`);
    }
  }
  
  /**
   * Oznaczanie rozwiązania jako najlepszego
   * @param idZadania - Identyfikator zadania
   * @param idRozwiazania - Identyfikator rozwiązania
   * @returns Zaktualizowane zadanie
   */
  async oznacz_najlepsze_rozwiazanie(idZadania: string, idRozwiazania: number): Promise<Zadanie> {
    try {
      const response = await api.put(`/tasks/${idZadania}/solutions/${idRozwiazania}/best`);
      return response.data;
    } catch (err: any) {
      return obsluz_blad_api(err, `Błąd podczas oznaczania najlepszego rozwiązania`);
    }
  }
}

// Eksport instancji serwisu
export default new ZadaniaService();
