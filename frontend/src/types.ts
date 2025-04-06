/**
 * Typy i interfejsy dla aplikacji TODO
 */

/**
 * Enum dla statusu zadania
 */
export enum StatusZadania {
  NOWE = 'nowe',
  W_TRAKCIE = 'w_trakcie',
  ROZWIAZANE = 'rozwiazane',
  ZAMKNIETE = 'zamkniete'
}

/**
 * Enum dla statusu realizacji zadania
 */
export enum StatusRealizacji {
  NIEROZPOCZETE = 'nierozpoczete',
  W_TRAKCIE = 'w_trakcie',
  WSTRZYMANE = 'wstrzymane',
  ZAKONCZONE = 'zakonczone'
}

/**
 * Interfejs dla autora (komentarza, rozwiązania)
 */
export interface Autor {
  id: number;
  imieNazwisko: string;
}

/**
 * Interfejs dla wykonawcy zadania
 */
export interface Wykonawca {
  id: number;
  imieNazwisko: string;
  rola: string;
  dataWpisu: Date;
}

/**
 * Interfejs dla reakcji na rozwiązanie
 */
export interface Reakcja {
  rodzaj: string;
  liczba: number;
}

/**
 * Interfejs dla proponowanego rozwiązania
 */
export interface ProponowaneRozwiazanie {
  id: number;
  autor: string;
  data: Date;
  tresc: string;
  reakcje: Reakcja[];
  najlepsze?: boolean;
}

/**
 * Interfejs dla uwagi do zadania
 */
export interface Uwaga {
  id: number;
  autor: string;
  data: Date;
  tresc: string;
}

/**
 * Interfejs dla historii procesu realizacji
 */
export interface HistoriaProcesu {
  data: Date;
  autor: string;
  zmiana: string;
}

/**
 * Interfejs dla procesu realizacji zadania
 */
export interface ProcesRealizacji {
  wykonawcy: Wykonawca[];
  terminRealizacji: Date;
  statusRealizacji: StatusRealizacji;
  postepRealizacji: number; // 0-100
  historiaProcesow: HistoriaProcesu[];
}

/**
 * Główny interfejs zadania
 */
export interface Zadanie {
  idZadania: number;
  priorytet: number; // 1-5
  branze: string[];
  maszyna: string;
  problem: string;
  opis: string;
  proponowaneRozwiazania: ProponowaneRozwiazanie[];
  uwagi: Uwaga[];
  status: StatusZadania;
  dataUtworzenia: Date;
  dataAktualizacji: Date;
  procesRealizacji: ProcesRealizacji;
}

/**
 * Interfejs dla odpowiedzi paginowanej z API
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Interfejs dla błędów walidacji
 */
export interface ValidationErrors {
  [pole: string]: string;
}

/**
 * Interfejs dla filtrów zadań
 */
export interface TaskFilters {
  status?: StatusZadania;
  priorytet?: number;
  branza?: string;
  maszyna?: string;
  statusRealizacji?: StatusRealizacji;
  terminOd?: Date;
  terminDo?: Date;
  szukaj?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

/**
 * Interfejs dla formularza zadania
 */
export interface TaskFormData {
  priorytet: number;
  branze: string[];
  maszyna: string;
  problem: string;
  opis: string;
  terminRealizacji?: Date | null;
}

/**
 * Interfejs dla formularza rozwiązania
 */
export interface SolutionFormData {
  tresc: string;
}

/**
 * Interfejs dla formularza uwagi
 */
export interface CommentFormData {
  tresc: string;
}

/**
 * Interfejs dla formularza wykonawcy
 */
export interface AssigneeFormData {
  imieNazwisko: string;
  rola: string;
}

/**
 * Interfejs dla formularza aktualizacji procesu realizacji
 */
export interface ProcessUpdateFormData {
  statusRealizacji: StatusRealizacji;
  postepRealizacji: number;
}
