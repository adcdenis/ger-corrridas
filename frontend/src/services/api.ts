import axios from 'axios';
import type { AxiosInstance } from 'axios';
import type { 
  AuthResponse, 
  ApiResponse, 
  RacesResponse, 
  RaceStats,
  Race,
  LoginData, 
  RegisterData, 
  CreateRaceData, 
  UpdateRaceData,
  RaceFilters 
} from '../types/index';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle auth errors
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth methods
  async login(data: LoginData): Promise<AuthResponse> {
    const response = await this.api.post<AuthResponse>('/auth/login', data);
    return response.data;
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await this.api.post<AuthResponse>('/auth/register', data);
    return response.data;
  }

  async getProfile(): Promise<ApiResponse<{ user: any }>> {
    const response = await this.api.get<ApiResponse<{ user: any }>>('/auth/profile');
    return response.data;
  }

  // Race methods
  async getRaces(filters?: RaceFilters): Promise<ApiResponse<RacesResponse>> {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(key, v));
          } else {
            params.append(key, value.toString());
          }
        }
      });
    }

    const response = await this.api.get<ApiResponse<RacesResponse>>(`/races?${params.toString()}`);
    return response.data;
  }

  async getRaceById(id: string): Promise<ApiResponse<{ race: Race }>> {
    const response = await this.api.get<ApiResponse<{ race: Race }>>(`/races/${id}`);
    return response.data;
  }

  async createRace(data: CreateRaceData): Promise<ApiResponse<{ race: Race }>> {
    const response = await this.api.post<ApiResponse<{ race: Race }>>('/races', data);
    return response.data;
  }

  async updateRace(id: string, data: UpdateRaceData): Promise<ApiResponse<{ race: Race }>> {
    const response = await this.api.put<ApiResponse<{ race: Race }>>(`/races/${id}`, data);
    return response.data;
  }

  async deleteRace(id: string): Promise<ApiResponse> {
    const response = await this.api.delete<ApiResponse>(`/races/${id}`);
    return response.data;
  }

  async getRaceStats(year?: string): Promise<ApiResponse<RaceStats>> {
    const params = year ? `?year=${year}` : '';
    const response = await this.api.get<ApiResponse<RaceStats>>(`/races/stats${params}`);
    return response.data;
  }

  async getAdvancedStatistics(startDate: string, endDate: string): Promise<ApiResponse<any>> {
    const response = await this.api.get<ApiResponse<any>>(`/races/statistics?startDate=${startDate}&endDate=${endDate}`);
    return response.data;
  }

  // Health check
  async healthCheck(): Promise<ApiResponse> {
    const response = await this.api.get<ApiResponse>('/health');
    return response.data;
  }
}

export const apiService = new ApiService();
export default apiService;