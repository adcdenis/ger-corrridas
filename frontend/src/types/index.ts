// Race status types
export type RaceStatus = 'inscrito' | 'pretendo_ir' | 'concluido' | 'na_duvida' | 'cancelada' | 'nao_pude_ir';

// User interface
export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt?: string;
}

// Race interface
export interface Race {
  _id: string;
  userId: string;
  name: string;
  date: string; // ISO format: "2025-10-15"
  time: string; // Format: "14:30"
  price: number;
  distancia: number; // Distance in kilometers with 2 decimal places
  urlInscricao: string;
  status: RaceStatus;
  tempoConclusao?: string; // Format: "HH:MM:SS" - Completion time
  createdAt: string;
  updatedAt: string;
}

// Auth response interface
export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

// Generic API response interface
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

// Races response interface
export interface RacesResponse {
  races: Race[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  filters: {
    year?: string;
    month?: string;
    status?: string | string[];
    search?: string;
  };
}

// Race statistics interface
export interface RaceStats {
  statusStats: Array<{
    _id: RaceStatus;
    count: number;
    totalPrice: number;
  }>;
  monthlyStats: Array<{
    _id: string; // month
    statuses: Array<{
      status: RaceStatus;
      count: number;
    }>;
    total: number;
  }>;
}

// Create race data interface
export interface CreateRaceData {
  name: string;
  date: string;
  time: string;
  price: number;
  distancia: number;
  urlInscricao?: string;
  status: RaceStatus;
  tempoConlusao?: string; // Format: "HH:MM:SS" - Completion time
}

// Update race data interface
export interface UpdateRaceData extends Partial<CreateRaceData> {}

// Login data interface
export interface LoginData {
  email: string;
  password: string;
}

// Register data interface
export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

// Race filters interface
export interface RaceFilters {
  year?: string;
  month?: string;
  status?: RaceStatus[];
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Status labels in Portuguese
export const STATUS_LABELS: Record<RaceStatus, string> = {
  inscrito: 'Inscrito',
  pretendo_ir: 'Pretendo Ir',
  concluido: 'Concluído',
  na_duvida: 'Na Dúvida',
  cancelada: 'Cancelada',
  nao_pude_ir: 'Não Pude Ir'
};

// Status colors for badges
export const STATUS_COLORS: Record<RaceStatus, string> = {
  inscrito: 'badge-inscrito',
  pretendo_ir: 'badge-pretendo_ir',
  concluido: 'badge-concluido',
  na_duvida: 'badge-na_duvida',
  cancelada: 'badge-cancelada',
  nao_pude_ir: 'badge-nao_pude_ir'
};

// Months in Portuguese
export const MONTHS = [
  { value: '01', label: 'Janeiro' },
  { value: '02', label: 'Fevereiro' },
  { value: '03', label: 'Março' },
  { value: '04', label: 'Abril' },
  { value: '05', label: 'Maio' },
  { value: '06', label: 'Junho' },
  { value: '07', label: 'Julho' },
  { value: '08', label: 'Agosto' },
  { value: '09', label: 'Setembro' },
  { value: '10', label: 'Outubro' },
  { value: '11', label: 'Novembro' },
  { value: '12', label: 'Dezembro' }
];