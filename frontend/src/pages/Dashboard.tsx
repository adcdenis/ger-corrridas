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
  Target,
  ExternalLink,
  X,
  Plus,
  Share2
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
    <div className="flex flex-col h-full">
      {/* Título no topo */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs sm:text-sm font-medium text-gray-600">{title}</p>
        <div className="p-2 sm:p-3 bg-blue-50 rounded-full flex-shrink-0 text-blue-600">
          {icon}
        </div>
      </div>
      
      {/* Valor principal */}
      <div className="flex-1 flex items-center">
        <p className="text-xl sm:text-2xl font-bold text-gray-900">{value}</p>
      </div>
      
      {/* Trend (se existir) */}
      {trend && (
        <div className="mt-2">
          <p className={`text-xs sm:text-sm flex items-center ${
            trendUp ? 'text-green-600' : 'text-red-600'
          }`}>
            <TrendingUp className={`w-3 h-3 sm:w-4 sm:h-4 mr-1 ${!trendUp ? 'rotate-180' : ''}`} />
            {trend}
          </p>
        </div>
      )}
    </div>
  </div>
);

interface RecentRacesTableProps {
  races: Race[];
}

interface EnrolledRacesProps {
  races: Race[];
}

const EnrolledRacesCard: React.FC<EnrolledRacesProps> = ({ races }) => {
  // Garantir que races é sempre um array
  const safeRaces = Array.isArray(races) ? races : [];
  
  // Estado para controlar a atualização da contagem regressiva
  const [currentTime, setCurrentTime] = useState(new Date());

  // Atualizar o tempo a cada segundo
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Função para calcular a contagem regressiva
  const calculateCountdown = (date: string, time: string) => {
    const raceDateTime = new Date(`${date}T${time}`);
    const now = currentTime;
    const difference = raceDateTime.getTime() - now.getTime();

    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    return { days, hours, minutes, seconds, expired: false };
  };

  // Contagem regressiva detalhada (aproximação para meses/anos)
  const calculateDetailedCountdown = (date: string, time: string) => {
    const raceDateTime = new Date(`${date}T${time}`);
    const now = currentTime;
    let diff = raceDateTime.getTime() - now.getTime();

    if (diff <= 0) {
      return {
        years: 0,
        months: 0,
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        expired: true,
      };
    }

    const msInSecond = 1000;
    const msInMinute = msInSecond * 60;
    const msInHour = msInMinute * 60;
    const msInDay = msInHour * 24;
    const msInMonthApprox = msInDay * 30; // aproximação
    const msInYearApprox = msInDay * 365; // aproximação

    const years = Math.floor(diff / msInYearApprox);
    diff = diff % msInYearApprox;

    const months = Math.floor(diff / msInMonthApprox);
    diff = diff % msInMonthApprox;

    const days = Math.floor(diff / msInDay);
    diff = diff % msInDay;

    const hours = Math.floor(diff / msInHour);
    diff = diff % msInHour;

    const minutes = Math.floor(diff / msInMinute);
    diff = diff % msInMinute;

    const seconds = Math.floor(diff / msInSecond);

    return { years, months, days, hours, minutes, seconds, expired: false };
  };

  const pad2 = (n: number) => n.toString().padStart(2, '0');

  const buildShareMessage = (race: Race) => {
    const detailed = calculateDetailedCountdown(race.date, race.time);

    let countdownText: string;
    if (detailed.expired) {
      countdownText = 'A corrida já começou.';
    } else {
      const units = [
        { value: detailed.years, singular: 'ano', plural: 'anos' },
        { value: detailed.months, singular: 'mês', plural: 'meses' },
        { value: detailed.days, singular: 'dia', plural: 'dias' },
        { value: detailed.hours, singular: 'hora', plural: 'horas' },
        { value: detailed.minutes, singular: 'minuto', plural: 'minutos' },
        { value: detailed.seconds, singular: 'segundo', plural: 'segundos' },
      ];

      const parts = units
        .filter(u => u.value > 0)
        .map(u => `${u.value} ${u.value === 1 ? u.singular : u.plural}`);

      let list = parts.join(', ');
      if (parts.length > 1) {
        list = `${parts.slice(0, -1).join(', ')} e ${parts[parts.length - 1]}`;
      }

      countdownText = `Faltam: ${list || 'menos de 1 segundo.'}`;
    }

    const dateText = `${formatDate(race.date)} às ${formatTime(race.time)}`;

    return (
      `Corrida: ${race.name}\n` +
      `Data/Hora: ${dateText}\n` +
      `Distância: ${race.distancia} km\n` +
      `${countdownText}`
    );
  };

  const handleShare = async (race: Race) => {
    const message = buildShareMessage(race);
    const title = `Corrida: ${race.name}`;

    // Web Share API (mobile/modern browsers)
    if (navigator.share) {
      try {
        await navigator.share({ title, text: message });
        return;
      } catch (err) {
        // Fallthrough to WhatsApp
      }
    }

    // Fallback: WhatsApp
    const whatsUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    const newWin = window.open(whatsUrl, '_blank');
    if (!newWin) {
      // Fallback adicional: e-mail
      const mailtoUrl = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(message)}`;
      window.location.href = mailtoUrl;
    }
  };

  // Função para formatar a data
  const formatDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  // Função para formatar a hora
  const formatTime = (timeStr: string) => {
    return timeStr.substring(0, 5); // HH:MM
  };

  // Filtrar e ordenar corridas inscritas
  const enrolledRaces = safeRaces
    .filter(race => race.status === 'inscrito')
    .sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime())
    .slice(0, 5);

  if (enrolledRaces.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
            <Timer className="w-5 h-5 mr-2 text-blue-600" />
            Próximas Corridas Inscritas
          </h3>
        </div>
        <div className="p-6 text-center text-gray-500">
          <Timer className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>Nenhuma corrida inscrita encontrada</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
          <Timer className="w-5 h-5 mr-2 text-blue-600" />
          Próximas Corridas Inscritas
        </h3>
      </div>
      <div className="divide-y divide-gray-200">
        {enrolledRaces.map((race) => {
          const countdown = calculateCountdown(race.date, race.time);
          return (
            <div key={race._id} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                {/* Informações da corrida */}
                <div className="flex-1">
                  <h4 className="text-sm sm:text-base font-semibold text-gray-900 mb-2">
                    {race.name}
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs sm:text-sm text-gray-600">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1 text-blue-500" />
                      {formatDate(race.date)}
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1 text-blue-500" />
                      {formatTime(race.time)}
                    </div>
                    <div className="flex items-center col-span-2 sm:col-span-1">
                      <MapPin className="w-4 h-4 mr-1 text-blue-500" />
                      {race.distancia} km
                    </div>
                  </div>
                </div>

                {/* Contagem regressiva */}
                <div className="flex-shrink-0">
                  {countdown.expired ? (
                    <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
                      <p className="text-sm font-medium text-red-600">Corrida iniciada</p>
                    </div>
                  ) : (
                    <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-xs text-blue-600 font-medium mb-1">Faltam:</p>
                      <div className="grid grid-cols-4 gap-1 text-xs">
                        <div className="text-center">
                          <div className="font-bold text-blue-900">{countdown.days}</div>
                          <div className="text-blue-600">dias</div>
                        </div>
                        <div className="text-center">
                          <div className="font-bold text-blue-900">{countdown.hours.toString().padStart(2, '0')}</div>
                          <div className="text-blue-600">hrs</div>
                        </div>
                        <div className="text-center">
                          <div className="font-bold text-blue-900">{countdown.minutes.toString().padStart(2, '0')}</div>
                          <div className="text-blue-600">min</div>
                        </div>
                        <div className="text-center">
                          <div className="font-bold text-blue-900">{countdown.seconds.toString().padStart(2, '0')}</div>
                          <div className="text-blue-600">seg</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Botão de compartilhar */}
                <div className="flex-shrink-0 mt-2 sm:mt-0 sm:ml-4">
                  <button
                    onClick={() => handleShare(race)}
                    className="inline-flex items-center bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-sm"
                    aria-label="Compartilhar informações da corrida"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const RecentRacesTable: React.FC<RecentRacesTableProps> = ({ races }) => {

  const getStatusColor = (status: string) => {
    return `px-2 py-1 text-xs font-semibold rounded-full ${STATUS_COLORS[status as keyof typeof STATUS_COLORS] || 'bg-gray-100 text-gray-800'}`;
  };

  const getStatusText = (status: string) => {
    return STATUS_LABELS[status as keyof typeof STATUS_LABELS] || status;
  };

  const formatDate = (dateStr: string) => {
    // Evitar problemas de fuso horário interpretando a data como local
    const [year, month, day] = dateStr.split('-');
    const localDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return localDate.toLocaleDateString('pt-BR');
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
                    Tempo de Conclusão
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1 text-gray-400" />
                        {race.tempoConclusao || 'N/A'}
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
                      {race.urlInscricao ? (
                        <a 
                          href={race.urlInscricao} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center text-blue-600 hover:text-blue-800"
                        >
                          <ExternalLink className="w-4 h-4 mr-1" />
                          Inscrição
                        </a>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
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
                    <Clock className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
                    <span className="truncate">{race.tempoConclusao || 'N/A'}</span>
                  </div>
                  <div className="flex items-center">
                    <Trophy className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
                    <span className="truncate">{formatPrice(race.price)}</span>
                  </div>
                </div>
                
                {race.urlInscricao && (
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
                )}
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
  const [enrolledRaces, setEnrolledRaces] = useState<Race[]>([]);
  const [stats, setStats] = useState<RaceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Buscar corridas recentes (últimas 5 concluídas) filtradas por ano
        const racesResponse = await apiService.getRaces({ 
          limit: 5, 
          sortBy: 'date', 
          sortOrder: 'desc',
          year: selectedYear,
          status: ['concluido']
        });

        // Buscar corridas inscritas (próximas 5) ordenadas por data
        const enrolledRacesResponse = await apiService.getRaces({ 
          limit: 5, 
          sortBy: 'date', 
          sortOrder: 'asc',
          status: ['inscrito']
        });

        // Buscar estatísticas filtradas por ano
        const statsResponse = await apiService.getRaceStats(selectedYear);

        if (racesResponse.success && racesResponse.data) {
          setRaces(racesResponse.data.races);
        }

        if (enrolledRacesResponse.success && enrolledRacesResponse.data) {
          setEnrolledRaces(enrolledRacesResponse.data.races);
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
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center">
            <BarChart3 className="w-6 h-6 sm:w-7 sm:h-7 mr-2 sm:mr-3 text-blue-600" />
            Dashboard
          </h1>
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
              {(() => {
                const today = new Date();
                const weekday = today.toLocaleDateString('pt-BR', { weekday: 'long' });
                const day = today.getDate().toString().padStart(2, '0');
                const month = (today.getMonth() + 1).toString().padStart(2, '0');
                const year = today.getFullYear();
                return `${weekday}, ${day}/${month}/${year}`;
              })()}
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
          title="Total"
          value={dashboardStats.total.toString()}
          icon={<Activity className="w-5 h-5 sm:w-6 sm:h-6" />}
        />
        <StatCard
          title="Inscritas"
          value={dashboardStats.inscrito.toString()}
          icon={<Users className="w-5 h-5 sm:w-6 sm:h-6" />}
        />
        <StatCard
          title="Concluídas"
          value={dashboardStats.concluido.toString()}
          icon={<Trophy className="w-5 h-5 sm:w-6 sm:h-6" />}
        />
        <StatCard
          title="Pretendo Ir"
          value={dashboardStats.pretendoIr.toString()}
          icon={<Target className="w-5 h-5 sm:w-6 sm:h-6" />}
        />
        <StatCard
          title="Canceladas"
          value={dashboardStats.cancelada.toString()}
          icon={<X className="w-5 h-5 sm:w-6 sm:h-6" />}
        />
        <StatCard
          title="Não Pude Ir"
          value={dashboardStats.naoPudeIr.toString()}
          icon={<Clock className="w-5 h-5 sm:w-6 sm:h-6" />}
        />
      </div>

      {/* Enrolled Races Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">
            Próximas Corridas Inscritas
          </h3>
        </div>
        <EnrolledRacesCard races={enrolledRaces} />
      </div>

      {/* Recent Races Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">
            Últimas Corridas Concluídas
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
          <button 
            onClick={() => navigate('/reports')}
            className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors sm:col-span-2 lg:col-span-1"
          >
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