import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  TrendingUp, 
  DollarSign, 
  MapPin, 
  Activity,
  Trophy,
  Clock,
  Target,
  X,
  BarChart3,
  Filter
} from 'lucide-react';
import { apiService } from '../services/api';
import type { Race } from '../types/index';
import { STATUS_LABELS } from '../types/index';

interface StatisticsData {
  totalRaces: number;
  totalCost: number;
  totalDistance: number;
  statusCounts: {
    inscrito: number;
    concluido: number;
    pretendo_ir: number;
    cancelada: number;
    na_duvida: number;
    nao_pude_ir: number;
  };
  races: Race[];
}

interface StatCard {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  description?: string;
}

const Statistics: React.FC = () => {
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [statistics, setStatistics] = useState<StatisticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Definir datas padrão (01/01 até 31/12 do ano atual)
  useEffect(() => {
    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1); // 01 de janeiro do ano atual
    const endOfYear = new Date(currentYear, 11, 31); // 31 de dezembro do ano atual
    
    setStartDate(startOfYear.toISOString().split('T')[0]);
    setEndDate(endOfYear.toISOString().split('T')[0]);
  }, []);

  // Buscar estatísticas quando as datas mudarem
  useEffect(() => {
    if (startDate && endDate) {
      fetchStatistics();
    }
  }, [startDate, endDate]);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.getAdvancedStatistics(startDate, endDate);
      
      if (response.success) {
        setStatistics(response.data);
      } else {
        setError(response.message || 'Erro ao buscar estatísticas');
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao buscar estatísticas');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDistance = (value: number): string => {
    return `${value.toFixed(1)} km`;
  };

  const formatDateForDisplay = (dateString: string): string => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  const getStatCards = (): StatCard[] => {
    if (!statistics) return [];

    return [
      {
        title: 'Total de Corridas',
        value: statistics.totalRaces,
        icon: <Trophy className="w-6 h-6" />,
        color: 'text-blue-600',
        description: 'Corridas no período'
      },
      {
        title: 'Valor Total Gasto',
        value: formatCurrency(statistics.totalCost),
        icon: <DollarSign className="w-6 h-6" />,
        color: 'text-green-600',
        description: 'Investimento em corridas'
      },
      {
        title: 'Distância Total',
        value: formatDistance(statistics.totalDistance),
        icon: <MapPin className="w-6 h-6" />,
        color: 'text-purple-600',
        description: 'Quilômetros percorridos'
      },
      {
        title: 'Inscrições',
        value: statistics.statusCounts.inscrito,
        icon: <Target className="w-6 h-6" />,
        color: 'text-blue-500',
        description: STATUS_LABELS.inscrito
      },
      {
        title: 'Concluídas',
        value: statistics.statusCounts.concluido,
        icon: <Trophy className="w-6 h-6" />,
        color: 'text-green-500',
        description: STATUS_LABELS.concluido
      },
      {
        title: 'Pretendo Ir',
        value: statistics.statusCounts.pretendo_ir,
        icon: <Clock className="w-6 h-6" />,
        color: 'text-yellow-500',
        description: STATUS_LABELS.pretendo_ir
      },
      {
        title: 'Canceladas',
        value: statistics.statusCounts.cancelada,
        icon: <X className="w-6 h-6" />,
        color: 'text-red-500',
        description: STATUS_LABELS.cancelada
      },
      {
        title: 'Na Dúvida',
        value: statistics.statusCounts.na_duvida,
        icon: <Activity className="w-6 h-6" />,
        color: 'text-gray-500',
        description: STATUS_LABELS.na_duvida
      },
      {
        title: 'Não Pude Ir',
        value: statistics.statusCounts.nao_pude_ir,
        icon: <Clock className="w-6 h-6" />,
        color: 'text-orange-500',
        description: STATUS_LABELS.nao_pude_ir
      }
    ];
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            <BarChart3 className="inline-block w-8 h-8 mr-3 text-blue-600" />
            Estatísticas de Corridas
          </h1>
          <p className="text-gray-600">
            Análise detalhada do seu desempenho e participação em corridas
            {startDate && endDate && (
              <span className="block mt-1 text-sm">
                Período: {formatDateForDisplay(startDate)} até {formatDateForDisplay(endDate)}
              </span>
            )}
          </p>
        </div>

        {/* Filtros de Data */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Filter className="w-5 h-5 text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-900">Filtrar por Período</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                Data Inicial
              </label>
              <input
                type="date"
                id="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="dd/mm/aaaa"
                lang="pt-BR"
              />
              {startDate && (
                <p className="text-xs text-gray-500 mt-1">
                  Selecionado: {formatDateForDisplay(startDate)}
                </p>
              )}
            </div>
            
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
                Data Final
              </label>
              <input
                type="date"
                id="endDate"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="dd/mm/aaaa"
                lang="pt-BR"
              />
              {endDate && (
                <p className="text-xs text-gray-500 mt-1">
                  Selecionado: {formatDateForDisplay(endDate)}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <div className="flex items-center">
              <X className="w-5 h-5 text-red-500 mr-2" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Carregando estatísticas...</span>
            </div>
          </div>
        )}

        {/* Statistics Cards */}
        {statistics && !loading && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {getStatCards().map((card, index) => (
                <div key={index} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`${card.color}`}>
                      {card.icon}
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                    </div>
                  </div>
                  <h3 className="text-sm font-medium text-gray-700 mb-1">{card.title}</h3>
                  {card.description && (
                    <p className="text-xs text-gray-500">{card.description}</p>
                  )}
                </div>
              ))}
            </div>

            {/* Period Summary */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                <Calendar className="inline-block w-5 h-5 mr-2 text-blue-600" />
                Resumo do Período ({formatDateForDisplay(startDate)} - {formatDateForDisplay(endDate)})
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <TrendingUp className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-blue-900">{statistics.totalRaces}</p>
                  <p className="text-sm text-blue-700">Corridas Registradas</p>
                </div>
                
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-green-900">{formatCurrency(statistics.totalCost)}</p>
                  <p className="text-sm text-green-700">Investimento Total</p>
                </div>
                
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <MapPin className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-purple-900">{formatDistance(statistics.totalDistance)}</p>
                  <p className="text-sm text-purple-700">Distância Total</p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Empty State */}
        {statistics && statistics.totalRaces === 0 && !loading && (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma corrida encontrada</h3>
            <p className="text-gray-600">
              Não há corridas registradas no período selecionado.
              <br />
              Tente ajustar as datas ou adicionar novas corridas.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export { Statistics };
export default Statistics;