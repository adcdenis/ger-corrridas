import React, { useState, useEffect } from 'react';
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
  X
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
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
        {trend && (
          <p className={`text-sm mt-2 flex items-center ${
            trendUp ? 'text-green-600' : 'text-red-600'
          }`}>
            <TrendingUp className={`w-4 h-4 mr-1 ${!trendUp ? 'rotate-180' : ''}`} />
            {trend}
          </p>
        )}
      </div>
      <div className="p-3 bg-blue-50 rounded-full">
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
        <div className="px-6 py-8 text-center">
          <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Nenhuma corrida encontrada</p>
          <p className="text-sm text-gray-400 mt-1">Adicione sua primeira corrida para começar!</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
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
      )}
    </>
  );
};

export const Dashboard: React.FC = () => {
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Visão geral do sistema de corridas</p>
        </div>
        <div className="flex items-center space-x-4">
          {/* Year Filter */}
          <div className="flex items-center space-x-2">
            <label htmlFor="year-select" className="text-sm font-medium text-gray-700">
              Ano:
            </label>
            <select
              id="year-select"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
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
          <div className="flex items-center text-sm text-gray-500">
            <Calendar className="w-4 h-4 mr-1" />
            {new Date().toLocaleDateString('pt-BR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
        <StatCard
          title={`Total de Corridas (${selectedYear})`}
          value={dashboardStats.total.toString()}
          icon={<Activity className="w-6 h-6 text-blue-600" />}
        />
        <StatCard
          title={`Corridas Inscritas (${selectedYear})`}
          value={dashboardStats.inscrito.toString()}
          icon={<Users className="w-6 h-6 text-green-600" />}
        />
        <StatCard
          title={`Corridas Concluídas (${selectedYear})`}
          value={dashboardStats.concluido.toString()}
          icon={<Trophy className="w-6 h-6 text-purple-600" />}
        />
        <StatCard
          title={`Pretendo Participar (${selectedYear})`}
          value={dashboardStats.pretendoIr.toString()}
          icon={<Target className="w-6 h-6 text-yellow-600" />}
        />
        <StatCard
          title={`Corridas Canceladas (${selectedYear})`}
          value={dashboardStats.cancelada.toString()}
          icon={<X className="w-6 h-6 text-red-600" />}
        />
        <StatCard
          title={`Não Pude Ir (${selectedYear})`}
          value={dashboardStats.naoPudeIr.toString()}
          icon={<Clock className="w-6 h-6 text-orange-600" />}
        />
      </div>

      {/* Recent Races Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Corridas Recentes ({selectedYear})</h3>
        </div>
        <RecentRacesTable races={races} />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
            <div className="text-center">
              <Activity className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600">Nova Corrida</p>
            </div>
          </button>
          <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
            <div className="text-center">
              <Users className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600">Gerenciar Participantes</p>
            </div>
          </button>
          <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
            <div className="text-center">
              <BarChart3 className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600">Ver Relatórios</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};