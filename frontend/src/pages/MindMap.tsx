import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Activity,
  Minus,
  Plus
} from 'lucide-react';
import { apiService } from '../services/api';
import type { Race } from '../types/index';
import { STATUS_LABELS, STATUS_COLORS } from '../types/index';

interface MonthData {
  month: number;
  monthName: string;
  races: Race[];
  isExpanded: boolean;
}

export const MindMap: React.FC = () => {
  const [races, setRaces] = useState<Race[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [monthsData, setMonthsData] = useState<MonthData[]>([]);

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  useEffect(() => {
    const fetchRaces = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await apiService.getRaces({ 
          year: selectedYear,
          sortBy: 'date',
          sortOrder: 'asc',
          limit: 1000 // Buscar todas as corridas do ano
        });

        if (response.success && response.data) {
          setRaces(response.data.races);
          organizeRacesByMonth(response.data.races);
        }

      } catch (err) {
        console.error('Erro ao carregar corridas:', err);
        setError('Erro ao carregar corridas');
      } finally {
        setLoading(false);
      }
    };

    fetchRaces();
  }, [selectedYear]);

  const organizeRacesByMonth = (racesList: Race[]) => {
    const monthsMap = new Map<number, Race[]>();
    
    // Inicializar todos os meses
    for (let i = 0; i < 12; i++) {
      monthsMap.set(i, []);
    }

    // Organizar corridas por mês
    racesList.forEach(race => {
      // Evitar problemas de fuso horário interpretando a data como local
      const [year, month, day] = race.date.split('-');
      const localDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      const monthIndex = localDate.getMonth();
      const existingRaces = monthsMap.get(monthIndex) || [];
      monthsMap.set(monthIndex, [...existingRaces, race]);
    });

    // Criar array de dados dos meses
    const monthsArray: MonthData[] = Array.from(monthsMap.entries()).map(([month, monthRaces]) => ({
      month,
      monthName: monthNames[month],
      races: monthRaces,
      isExpanded: monthRaces.length > 0 // Expandir automaticamente meses com corridas
    }));

    setMonthsData(monthsArray);
  };

  const toggleMonth = (monthIndex: number) => {
    setMonthsData(prev => 
      prev.map(month => 
        month.month === monthIndex 
          ? { ...month, isExpanded: !month.isExpanded }
          : month
      )
    );
  };

  const getStatusColor = (status: string) => {
    return STATUS_COLORS[status as keyof typeof STATUS_COLORS] || 'bg-gray-100 text-gray-800';
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
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Mapa Mental das Corridas</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">
            Visualização em árvore organizada por meses do ano {selectedYear}
          </p>
        </div>
        
        {/* Year Filter */}
        <div className="flex items-center space-x-2">
          <label htmlFor="year-select" className="text-sm font-medium text-gray-700 whitespace-nowrap">
            Ano:
          </label>
          <select
            id="year-select"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm min-w-0"
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
      </div>

      {/* Tree Mind Map */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 overflow-x-auto">
        {races.length === 0 ? (
          <div className="text-center py-12">
            <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhuma corrida encontrada
            </h3>
            <p className="text-gray-500">
              Não há corridas cadastradas para o ano de {selectedYear}
            </p>
          </div>
        ) : (
          <div className="min-w-max">
            {/* Root Node - Year */}
            <div className="flex flex-col items-center">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-xl font-bold text-xl shadow-lg border-4 border-blue-200">
                📅 {selectedYear}
              </div>
              
              {/* Main Trunk */}
              <div className="w-1 h-8 bg-gradient-to-b from-blue-600 to-gray-400"></div>
              
              {/* Months Tree */}
              <div className="relative">
                {/* Horizontal line for months */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-full h-1 bg-gray-400"></div>
                
                <div className="flex flex-wrap justify-center gap-4 sm:gap-6 lg:gap-8 pt-4">
                   {monthsData.filter(month => month.races.length > 0).map((monthData, index) => (
                     <div key={monthData.month} className="flex flex-col items-center relative">
                       {/* Vertical connector to main trunk */}
                       <div className="w-1 h-4 bg-gray-400"></div>
                       
                       {/* Month Node */}
                       <div 
                         className={`text-white px-3 sm:px-4 lg:px-6 py-2 sm:py-3 rounded-lg font-semibold shadow-md transition-all duration-200 border-2 flex items-center space-x-1 sm:space-x-2 text-sm sm:text-base ${
                           monthData.races.length > 0 
                             ? 'bg-gradient-to-r from-green-500 to-green-600 border-green-200 cursor-pointer hover:from-green-600 hover:to-green-700' 
                             : 'bg-gradient-to-r from-gray-400 to-gray-500 border-gray-200'
                         }`}
                         onClick={() => monthData.races.length > 0 && toggleMonth(monthData.month)}
                       >
                         <Calendar className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                         <span className="whitespace-nowrap">{monthData.monthName}</span>
                         <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-bold flex-shrink-0 ${
                           monthData.races.length > 0 
                             ? 'bg-white text-green-700' 
                             : 'bg-gray-200 text-gray-600'
                         }`}>
                           {monthData.races.length}
                         </span>
                         {monthData.races.length > 0 && (
                           <div className="text-white flex-shrink-0">
                             {monthData.isExpanded ? (
                               <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
                             ) : (
                               <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                             )}
                           </div>
                         )}
                       </div>

                      {/* Races Branch */}
                      {monthData.isExpanded && monthData.races.length > 0 && (
                        <div className="mt-4 space-y-3">
                          {monthData.races.map((race) => (
                            <div
                              key={race._id}
                              className="bg-gray-50 rounded-lg p-4 border-l-2 border-blue-300 hover:bg-gray-100 transition-colors duration-200"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <h4 className="font-medium text-gray-900 mb-1">
                                    {race.name}
                                  </h4>
                                  <div className="flex items-center gap-4 text-sm text-gray-600">
                                     <span className="flex items-center gap-1">
                                       <Calendar className="w-4 h-4" />
                                       {formatDate(race.date)}
                                     </span>
                                     <span className="flex items-center gap-1">
                                       <Clock className="w-4 h-4" />
                                       {race.distancia}km
                                     </span>                                    
                                     {race.time && (
                                       <span className="text-sm font-medium text-gray-700">
                                         {race.time}
                                       </span>
                                     )}
                                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(race.status)}`}>
                                       {getStatusText(race.status)}
                                     </span>
                                   </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};