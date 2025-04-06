// Typy dla zadań
export interface Zadanie {
  _id: string;
  idZadania: number;
  priorytet: number;
  branze: string[];
  maszyna: string;
  problem: string;
  opis: string;
  proponowaneRozwiazania: ProponowaneRozwiazanie[];
  uwagi: Uwaga[];
  status: StatusZadania;
  dataUtworzenia: string;
  dataAktualizacji: string;
  procesRealizacji: ProcesRealizacji;
  utworzylUzytkownik: string;
}

// Typ dla proponowanych rozwiązań
export interface ProponowaneRozwiazanie {
  _id: string;
  autor: string;
  data: string;
  tresc: string;
  reakcje: Reakcja[];
}

// Typ dla reakcji na rozwiązania
export interface Reakcja {
  rodzaj: string;
  liczba: number;
}

// Typ dla uwag do zadania
export interface Uwaga {
  _id: string;
  autor: string;
  data: string;
  tresc: string;
}

// Typ dla procesu realizacji zadania
export interface ProcesRealizacji {
  wykonawcy: Wykonawca[];
  terminRealizacji: string | null;
  statusRealizacji: StatusRealizacji;
  postepRealizacji: number;
  historiaProcesow: HistoriaProcesu[];
}

// Typ dla wykonawcy zadania
export interface Wykonawca {
  _id: string;
  imieNazwisko: string;
  rola: string;
  dataWpisu: string;
}

// Typ dla historii procesu realizacji
export interface HistoriaProcesu {
  data: string;
  autor: string;
  zmiana: string;
}

// Typy dla użytkownika
export interface Uzytkownik {
  _id: string;
  nazwa: string;
  email: string;
  imie?: string;
  nazwisko?: string;
  rola: RolaUzytkownika;
  preferencje?: PreferencjeUzytkownika;
  dataUtworzenia: string;
  dataAktualizacji: string;
}

// Typ dla preferencji użytkownika
export interface PreferencjeUzytkownika {
  trybCiemny: boolean;
  powiadomienia: boolean;
  jezyk: string;
}

// Typ dla danych logowania
export interface DaneLogowania {
  email: string;
  haslo: string;
}

// Typ dla danych rejestracji
export interface DaneRejestracji {
  nazwa: string;
  email: string;
  haslo: string;
  imie?: string;
  nazwisko?: string;
}

// Typ dla odpowiedzi z API z tokenem
export interface OdpowiedzToken {
  token: string;
  user: Uzytkownik;
}

// Typ dla filtrów zadań
export interface FiltryZadan {
  priorytet?: number;
  branza?: string;
  maszyna?: string;
  status?: StatusZadania;
  statusRealizacji?: StatusRealizacji;
  fraza?: string;
  sortowanie?: string;
  kierunek?: 'asc' | 'desc';
  strona?: number;
  naStronie?: number;
}

// Typ dla paginacji
export interface Paginacja {
  strona: number;
  naStronie: number;
  calkowitaIlosc: number;
  calkowitaIloscStron: number;
}

// Typ dla odpowiedzi z API z paginacją
export interface OdpowiedzPaginacja<T> {
  dane: T[];
  paginacja: Paginacja;
}

// Enumy dla statusów
export enum StatusZadania {
  NOWE = 'nowe',
  W_TRAKCIE = 'w_trakcie',
  ROZWIAZANE = 'rozwiazane',
  ZAMKNIETE = 'zamkniete'
}

export enum StatusRealizacji {
  NIEROZPOCZETE = 'nierozpoczete',
  W_TRAKCIE = 'w_trakcie',
  WSTRZYMANE = 'wstrzymane',
  ZAKONCZONE = 'zakonczone'
}

export enum RolaUzytkownika {
  ADMIN = 'admin',
  UZYTKOWNIK = 'uzytkownik',
  MANAGER = 'manager'
}
