import api from './api';
import { Zadanie, FiltryZadan, OdpowiedzPaginacja, ProponowaneRozwiazanie, Uwaga, Wykonawca } from '../types';

/**
 * Serwis do obsługi zadań
 * Zawiera metody do komunikacji z API dla operacji na zadaniach
 */
class ZadaniaService {
  /**
   * Pobieranie listy zadań z możliwością filtrowania i paginacji
   * @param filtry - Parametry filtrowania i sortowania
   * @returns Lista zadań z informacjami o paginacji
   */
  async pobierz_zadania(filtry: FiltryZadan = {}): Promise<OdpowiedzPaginacja<Zadanie>> {
    const response = await api.get('/tasks', { params: filtry });
    return response.data;
  }

  /**
   * Pobieranie szczegółów pojedynczego zadania
   * @param id - Identyfikator zadania
   * @returns Szczegóły zadania
   */
  async pobierz_zadanie(id: string): Promise<Zadanie> {
    const response = await api.get(`/tasks/${id}`);
    return response.data;
  }

  /**
   * Tworzenie nowego zadania
   * @param zadanie - Dane nowego zadania
   * @returns Utworzone zadanie
   */
  async utworz_zadanie(zadanie: Partial<Zadanie>): Promise<Zadanie> {
    const response = await api.post('/tasks', zadanie);
    return response.data;
  }

  /**
   * Aktualizacja istniejącego zadania
   * @param id - Identyfikator zadania
   * @param zadanie - Dane do aktualizacji
   * @returns Zaktualizowane zadanie
   */
  async aktualizuj_zadanie(id: string, zadanie: Partial<Zadanie>): Promise<Zadanie> {
    const response = await api.put(`/tasks/${id}`, zadanie);
    return response.data;
  }

  /**
   * Usuwanie zadania
   * @param id - Identyfikator zadania
   * @returns Komunikat o powodzeniu
   */
  async usun_zadanie(id: string): Promise<{ message: string }> {
    const response = await api.delete(`/tasks/${id}`);
    return response.data;
  }

  /**
   * Dodawanie proponowanego rozwiązania do zadania
   * @param id - Identyfikator zadania
   * @param rozwiazanie - Dane rozwiązania
   * @returns Zaktualizowane zadanie
   */
  async dodaj_rozwiazanie(id: string, rozwiazanie: Partial<ProponowaneRozwiazanie>): Promise<Zadanie> {
    const response = await api.post(`/tasks/${id}/rozwiazania`, rozwiazanie);
    return response.data;
  }

  /**
   * Dodawanie uwagi do zadania
   * @param id - Identyfikator zadania
   * @param uwaga - Dane uwagi
   * @returns Zaktualizowane zadanie
   */
  async dodaj_uwage(id: string, uwaga: Partial<Uwaga>): Promise<Zadanie> {
    const response = await api.post(`/tasks/${id}/uwagi`, uwaga);
    return response.data;
  }

  /**
   * Aktualizacja procesu realizacji zadania
   * @param id - Identyfikator zadania
   * @param status - Nowy status realizacji
   * @param postep - Nowy postęp realizacji (0-100)
   * @returns Zaktualizowane zadanie
   */
  async aktualizuj_status_realizacji(id: string, status: string, postep: number): Promise<Zadanie> {
    const response = await api.put(`/tasks/${id}/proces-realizacji`, { statusRealizacji: status, postepRealizacji: postep });
    return response.data;
  }

  /**
   * Dodawanie wykonawcy do zadania
   * @param id - Identyfikator zadania
   * @param wykonawca - Dane wykonawcy
   * @returns Zaktualizowane zadanie
   */
  async dodaj_wykonawce(id: string, wykonawca: Partial<Wykonawca>): Promise<Zadanie> {
    const response = await api.post(`/tasks/${id}/wykonawcy`, wykonawca);
    return response.data;
  }

  /**
   * Usuwanie wykonawcy z zadania
   * @param idZadania - Identyfikator zadania
   * @param idWykonawcy - Identyfikator wykonawcy
   * @returns Zaktualizowane zadanie
   */
  async usun_wykonawce(idZadania: string, idWykonawcy: string): Promise<Zadanie> {
    const response = await api.delete(`/tasks/${idZadania}/wykonawcy/${idWykonawcy}`);
    return response.data;
  }

  /**
   * Ustawienie terminu realizacji zadania
   * @param id - Identyfikator zadania
   * @param termin - Data terminu realizacji
   * @returns Zaktualizowane zadanie
   */
  async ustaw_termin_realizacji(id: string, termin: string): Promise<Zadanie> {
    const response = await api.put(`/tasks/${id}/termin-realizacji`, { terminRealizacji: termin });
    return response.data;
  }

  /**
   * Dodawanie reakcji do proponowanego rozwiązania
   * @param idZadania - Identyfikator zadania
   * @param idRozwiazania - Identyfikator rozwiązania
   * @param rodzaj - Rodzaj reakcji
   * @returns Zaktualizowane zadanie
   */
  async dodaj_reakcje(idZadania: string, idRozwiazania: string, rodzaj: string): Promise<Zadanie> {
    const response = await api.post(`/tasks/${idZadania}/rozwiazania/${idRozwiazania}/reakcje`, { rodzaj });
    return response.data;
  }
}

// Eksport instancji serwisu
export default new ZadaniaService();
