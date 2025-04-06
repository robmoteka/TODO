import api from './api';
import { Uzytkownik, DaneRejestracji, OdpowiedzToken, PreferencjeUzytkownika } from '../types';

/**
 * Serwis do obsługi użytkowników
 * Zawiera metody do komunikacji z API dla operacji na użytkownikach
 */
class UzytkownicyService {
  /**
   * Logowanie użytkownika
   * @param email - Email użytkownika
   * @param haslo - Hasło użytkownika
   * @returns Token JWT i dane użytkownika
   */
  async zaloguj(email: string, haslo: string): Promise<OdpowiedzToken> {
    const response = await api.post('/auth/login', { email, haslo });
    return response.data;
  }

  /**
   * Rejestracja nowego użytkownika
   * @param dane - Dane rejestracji
   * @returns Token JWT i dane użytkownika
   */
  async zarejestruj(dane: DaneRejestracji): Promise<OdpowiedzToken> {
    const response = await api.post('/auth/register', dane);
    return response.data;
  }

  /**
   * Pobieranie danych aktualnie zalogowanego użytkownika
   * @returns Dane użytkownika
   */
  async pobierz_aktualnego_uzytkownika(): Promise<Uzytkownik> {
    const response = await api.get('/auth/user');
    return response.data;
  }

  /**
   * Pobieranie listy wszystkich użytkowników (tylko dla administratorów)
   * @returns Lista użytkowników
   */
  async pobierz_uzytkownikow(): Promise<Uzytkownik[]> {
    const response = await api.get('/users');
    return response.data;
  }

  /**
   * Pobieranie danych użytkownika po ID
   * @param id - Identyfikator użytkownika
   * @returns Dane użytkownika
   */
  async pobierz_uzytkownika(id: string): Promise<Uzytkownik> {
    const response = await api.get(`/users/${id}`);
    return response.data;
  }

  /**
   * Aktualizacja danych użytkownika
   * @param id - Identyfikator użytkownika
   * @param dane - Dane do aktualizacji
   * @returns Zaktualizowane dane użytkownika
   */
  async aktualizuj_uzytkownika(id: string, dane: Partial<Uzytkownik>): Promise<Uzytkownik> {
    const response = await api.put(`/users/${id}`, dane);
    return response.data;
  }

  /**
   * Zmiana hasła użytkownika
   * @param id - Identyfikator użytkownika
   * @param stareHaslo - Aktualne hasło
   * @param noweHaslo - Nowe hasło
   * @returns Komunikat o powodzeniu
   */
  async zmien_haslo(id: string, stareHaslo: string, noweHaslo: string): Promise<{ message: string }> {
    const response = await api.put(`/users/${id}/zmiana-hasla`, { stareHaslo, noweHaslo });
    return response.data;
  }

  /**
   * Aktualizacja preferencji użytkownika
   * @param id - Identyfikator użytkownika
   * @param preferencje - Nowe preferencje
   * @returns Zaktualizowane dane użytkownika
   */
  async aktualizuj_preferencje(id: string, preferencje: PreferencjeUzytkownika): Promise<Uzytkownik> {
    const response = await api.put(`/users/${id}`, { preferencje });
    return response.data;
  }

  /**
   * Usuwanie użytkownika (tylko dla administratorów)
   * @param id - Identyfikator użytkownika
   * @returns Komunikat o powodzeniu
   */
  async usun_uzytkownika(id: string): Promise<{ message: string }> {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  }
}

// Eksport instancji serwisu
export default new UzytkownicyService();
