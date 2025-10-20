import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Activity, 
  Users, 
  Trophy, 
  TrendingUp, 
  Clock, 
  MapPin,
  Calendar,
  BarChart3,
  Timer,
  Medal,
  Target,
  ExternalLink,
  X,
  Plus
} from 'lucide-react';
import { apiService } from '../services/api';
import type { Race, RaceStats } from '../types/index';
import { STATUS_LABELS, STATUS_COLORS } from '../types/index';

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, trend, trendUp }) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
    <div className="flex items-center justify-between">
      <div className="min-w-0 flex-1">
        <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">{title}</p>
        <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1 sm:mt-2">{value}</p>
        {trend && (
          <p className={`text-xs sm:text-sm mt-1 sm:mt-2 flex items-center ${
            trendUp ? 'text-green-600' : 'text-red-600'
          }`}>
            <TrendingUp className={`w-3 h-3 sm:w-4 sm:h-4 mr-1 ${!trendUp ? 'rotate-180' : ''}`} />
            {trend}
          </p>
        )}
      </div>
      <div className="p-2 sm:p-3 bg-blue-50 rounded-full flex-shrink-0 ml-3 text-blue-600">
        {icon}
      </div>
    </div>
  </div>
);

interface RecentRacesTableProps {
  races: Race[];
}

const RecentRacesTable: React.FC<RecentRacesTableProps> = ({ races }) => {

  const getStatusColor = (status: string) => {
    return `px-2 py-1 text-xs font-semibold rounded-full ${STATUS_COLORS[status as keyof typeof STATUS_COLORS] || 'bg-gray-100 text-gray-800'}`;
  };

  const getStatusText = (status: string) => {
    return STATUS_LABELS[status as keyof typeof STATUS_LABELS] || status;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR');
  };

  const formatPrice = (price: number) => {
    return price === 0 ? 'Gratuita' : `R$ ${price.toFixed(2)}`;
  };

  return (
    <>
      {races.length === 0 ? (
        <div className="px-4 sm:px-6 py-8 text-center">
          <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Nenhuma corrida encontrada</p>
          <p className="text-sm text-gray-400 mt-1">Adicione sua primeira corrida para começar!</p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nome da Corrida
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Horário
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Distância
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Preço
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {races.map((race) => (
                  <tr key={race._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {race.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                        {formatDate(race.date)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1 text-gray-400" />
                        {race.time}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Target className="w-4 h-4 mr-1 text-gray-400" />
                        {race.distancia} km
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex ${getStatusColor(race.status)}`}>
                        {getStatusText(race.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <Trophy className="w-4 h-4 mr-1 text-gray-400" />
                        {formatPrice(race.price)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <a 
                        href={race.urlInscricao} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center text-blue-600 hover:text-blue-800"
                      >
                        <ExternalLink className="w-4 h-4 mr-1" />
                        Inscrição
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden space-y-4 p-4">
            {races.map((race) => (
              <div key={race._id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-medium text-gray-900 text-sm flex-1 pr-2">{race.name}</h4>
                  <span className={`inline-flex ${getStatusColor(race.status)} flex-shrink-0`}>
                    {getStatusText(race.status)}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
                    <span className="truncate">{formatDate(race.date)}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
                    <span className="truncate">{race.time}</span>
                  </div>
                  <div className="flex items-center">
                    <Target className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
                    <span className="truncate">{race.distancia} km</span>
                  </div>
                  <div className="flex items-center">
                    <Trophy className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
                    <span className="truncate">{formatPrice(race.price)}</span>
                  </div>
                </div>
                
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <a 
                    href={race.urlInscricao} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    <ExternalLink className="w-4 h-4 mr-1" />
                    Ver Inscrição
                  </a>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
};

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [races, setRaces] = useState<Race[]>([]);
  const [stats, setStats] = useState<RaceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Buscar corridas recentes (últimas 5) filtradas por ano
        const racesResponse = await apiService.getRaces({ 
          limit: 5, 
          sortBy: 'createdAt', 
          sortOrder: 'desc',
          year: selectedYear
        });

        // Buscar estatísticas filtradas por ano
        const statsResponse = await apiService.getRaceStats(selectedYear);

        if (racesResponse.success && racesResponse.data) {
          setRaces(racesResponse.data.races);
        }

        if (statsResponse.success && statsResponse.data) {
          setStats(statsResponse.data);
        }

      } catch (err) {
        console.error('Erro ao carregar dados do dashboard:', err);
        setError('Erro ao carregar dados do dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [selectedYear]);

  const getStatsFromData = () => {
    if (!stats) return { total: 0, inscrito: 0, concluido: 0, pretendoIr: 0, cancelada: 0, naoPudeIr: 0 };

    const statusStats = stats.statusStats || [];
    const total = statusStats.reduce((acc, stat) => acc + stat.count, 0);
    const inscrito = statusStats.find(s => s._id === 'inscrito')?.count || 0;
    const concluido = statusStats.find(s => s._id === 'concluido')?.count || 0;
    const pretendoIr = statusStats.find(s => s._id === 'pretendo_ir')?.count || 0;
    const cancelada = statusStats.find(s => s._id === 'cancelada')?.count || 0;
    const naoPudeIr = statusStats.find(s => s._id === 'nao_pude_ir')?.count || 0;

    return { total, inscrito, concluido, pretendoIr, cancelada, naoPudeIr };
  };

  const dashboardStats = getStatsFromData();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
      </div>
    );
  }
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">Visão geral do sistema de corridas</p>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
          {/* Year Filter */}
          <div className="flex items-center space-x-2">
            <label htmlFor="year-select" className="text-sm font-medium text-gray-700 whitespace-nowrap">
              Ano:
            </label>
            <select
              id="year-select"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm min-w-0"
            >
              {Array.from({ length: 10 }, (_, i) => {
                const year = new Date().getFullYear() - i;
                return (
                  <option key={year} value={year.toString()}>
                    {year}
                  </option>
                );
              })}
            </select>
          </div>
          <div className="flex items-center text-xs sm:text-sm text-gray-500">
            <Calendar className="w-4 h-4 mr-1 flex-shrink-0" />
            <span className="hidden sm:inline">
              {new Date().toLocaleDateString('pt-BR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </span>
            <span className="sm:hidden">
              {new Date().toLocaleDateString('pt-BR')}
            </span>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 lg:gap-6">
        <StatCard
          title={`Total (${selectedYear})`}
          value={dashboardStats.total.toString()}
          icon={<Activity className="w-5 h-5 sm:w-6 sm:h-6" />}
        />
        <StatCard
          title={`Inscritas (${selectedYear})`}
          value={dashboardStats.inscrito.toString()}
          icon={<Users className="w-5 h-5 sm:w-6 sm:h-6" />}
        />
        <StatCard
          title={`Concluídas (${selectedYear})`}
          value={dashboardStats.concluido.toString()}
          icon={<Trophy className="w-5 h-5 sm:w-6 sm:h-6" />}
        />
        <StatCard
          title={`Pretendo Ir (${selectedYear})`}
          value={dashboardStats.pretendoIr.toString()}
          icon={<Target className="w-5 h-5 sm:w-6 sm:h-6" />}
        />
        <StatCard
          title={`Canceladas (${selectedYear})`}
          value={dashboardStats.cancelada.toString()}
          icon={<X className="w-5 h-5 sm:w-6 sm:h-6" />}
        />
        <StatCard
          title={`Não Pude Ir (${selectedYear})`}
          value={dashboardStats.naoPudeIr.toString()}
          icon={<Clock className="w-5 h-5 sm:w-6 sm:h-6" />}
        />
      </div>

      {/* Recent Races Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">
            Corridas Recentes ({selectedYear})
          </h3>
        </div>
        <RecentRacesTable races={races} />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <button 
            onClick={() => navigate('/races?new=true')}
            className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
          >
            <div className="text-center">
              <Plus className="w-6 sm:w-8 h-6 sm:h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600">Nova Corrida</p>
            </div>
          </button>
          <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors sm:col-span-2 lg:col-span-1">
            <div className="text-center">
              <BarChart3 className="w-6 sm:w-8 h-6 sm:h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600">Ver Relatórios</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};