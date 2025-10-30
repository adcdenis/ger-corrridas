import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { 
  Calendar, 
  Clock, 
  Target, 
  Trophy, 
  ExternalLink, 
  FileText, 
  Download,
  Filter,
  RefreshCw
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { apiService } from '../services/api';
import type { Race, RaceStatus } from '../types';

interface ReportsFilters {
  startDate: string;
  endDate: string;
  status: RaceStatus | 'all';
  description: string;
}

export const Reports: React.FC = () => {
  const [races, setRaces] = useState<Race[]>([]);
  const [filteredRaces, setFilteredRaces] = useState<Race[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [filters, setFilters] = useState<ReportsFilters>({
    startDate: `${new Date().getFullYear()}-01-01`,
    endDate: `${new Date().getFullYear()}-12-31`,
    status: 'all',
    description: ''
  });

  const statusOptions = [
    { value: 'all', label: 'Todos' },
    { value: 'inscrito', label: 'Inscrito' },
    { value: 'pretendo_ir', label: 'Pretendo Ir' },
    { value: 'concluido', label: 'Concluído' },
    { value: 'na_duvida', label: 'Na Dúvida' },
    { value: 'cancelada', label: 'Cancelada' },
    { value: 'nao_pude_ir', label: 'Não Pude Ir' }
  ];

  const fetchRaces = async () => {
    setLoading(true);
    try {
      const response = await apiService.getRaces({
        limit: 1000,
        sortBy: 'date',
        sortOrder: 'desc'
      });
      setRaces(response.data?.races || []);
    } catch (error) {
      toast.error('Erro ao carregar corridas');
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = races;

    // Filtro por data
    if (filters.startDate) {
      filtered = filtered.filter(race => race.date >= filters.startDate);
    }
    if (filters.endDate) {
      filtered = filtered.filter(race => race.date <= filters.endDate);
    }

    // Filtro por status
    if (filters.status !== 'all') {
      filtered = filtered.filter(race => race.status === filters.status);
    }

    // Filtro por descrição (nome da corrida)
    if (filters.description.trim()) {
      filtered = filtered.filter(race => 
        race.name.toLowerCase().includes(filters.description.toLowerCase())
      );
    }

    setFilteredRaces(filtered);
  };

  const clearFilters = () => {
    setFilters({
      startDate: `${new Date().getFullYear()}-01-01`,
      endDate: `${new Date().getFullYear()}-12-31`,
      status: 'all',
      description: ''
    });
  };

  const exportToExcel = async () => {
    setExporting(true);
    try {
      const dataToExport = filteredRaces.map(race => ({
        'Nome da Corrida': race.name,
        'Data': formatDate(race.date),
        'Horário': race.time,
        'Distância (km)': race.distancia,
        'Preço (R$)': race.price.toFixed(2),
        'Status': getStatusText(race.status),
        'Tempo de Conclusão': race.tempoConclusao || 'N/A',
        'URL de Inscrição': race.urlInscricao || 'N/A'
      }));

      // Criar workbook e worksheet
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(dataToExport);

      // Adicionar o worksheet ao workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Relatório de Corridas');

      // Gerar arquivo XLSX e fazer download
      const fileName = `relatorio_corridas_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);

      toast.success('Relatório exportado com sucesso!');
    } catch (error) {
      toast.error('Erro ao exportar relatório');
      console.error('Erro:', error);
    } finally {
      setExporting(false);
    }
  };

  const exportToPDF = async () => {
    setExporting(true);
    try {
      // Criar conteúdo HTML para impressão
      const printContent = `
        <html>
          <head>
            <title>Relatório de Corridas</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              h1 { color: #1f2937; text-align: center; margin-bottom: 30px; }
              .filters { background: #f9fafb; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
              .filters h3 { margin-top: 0; color: #374151; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #d1d5db; padding: 8px; text-align: left; font-size: 12px; }
              th { background-color: #f3f4f6; font-weight: bold; }
              tr:nth-child(even) { background-color: #f9fafb; }
              .summary { margin-bottom: 20px; }
              .summary-item { display: inline-block; margin-right: 20px; padding: 10px; background: #eff6ff; border-radius: 6px; }
            </style>
          </head>
          <body>
            <h1>Relatório de Corridas</h1>
            <div class="filters">
              <h3>Filtros Aplicados:</h3>
              <p><strong>Período:</strong> ${formatDate(filters.startDate)} até ${formatDate(filters.endDate)}</p>
              <p><strong>Status:</strong> ${statusOptions.find(s => s.value === filters.status)?.label || 'Todos'}</p>
              ${filters.description ? `<p><strong>Descrição:</strong> ${filters.description}</p>` : ''}
            </div>
            <div class="summary">
              <div class="summary-item">
                <strong>Total de Corridas:</strong> ${filteredRaces.length}
              </div>
              <div class="summary-item">
                <strong>Distância Total:</strong> ${filteredRaces.filter(race => race.status === 'concluido').reduce((sum, race) => sum + race.distancia, 0).toFixed(2)} km
              </div>
              <div class="summary-item">
                <strong>Valor Total:</strong> R$ ${filteredRaces.filter(race => ['inscrito', 'concluido', 'nao_pude_ir'].includes(race.status)).reduce((sum, race) => sum + race.price, 0).toFixed(2)}
              </div>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Nome da Corrida</th>
                  <th>Data</th>
                  <th>Horário</th>
                  <th>Distância</th>
                  <th>Preço</th>
                  <th>Status</th>
                  <th>Tempo</th>
                </tr>
              </thead>
              <tbody>
                ${filteredRaces.map(race => `
                  <tr>
                    <td>${race.name}</td>
                    <td>${formatDate(race.date)}</td>
                    <td>${race.time}</td>
                    <td>${race.distancia} km</td>
                    <td>R$ ${race.price.toFixed(2)}</td>
                    <td>${getStatusText(race.status)}</td>
                    <td>${race.tempoConclusao || 'N/A'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            <div style="margin-top: 30px; text-align: center; color: #6b7280; font-size: 12px;">
              Relatório gerado em ${new Date().toLocaleString('pt-BR')}
            </div>
          </body>
        </html>
      `;

      // Abrir janela de impressão
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 250);
      }

      toast.success('Relatório PDF gerado com sucesso!');
    } catch (error) {
      toast.error('Erro ao gerar PDF');
      console.error('Erro:', error);
    } finally {
      setExporting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('pt-BR');
  };

  const getStatusText = (status: RaceStatus) => {
    const statusMap = {
      inscrito: 'Inscrito',
      pretendo_ir: 'Pretendo Ir',
      concluido: 'Concluído',
      na_duvida: 'Na Dúvida',
      cancelada: 'Cancelada',
      nao_pude_ir: 'Não Pude Ir'
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: RaceStatus) => {
    const colorMap = {
      inscrito: 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800',
      pretendo_ir: 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800',
      concluido: 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800',
      na_duvida: 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800',
      cancelada: 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800',
      nao_pude_ir: 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800'
    };
    return colorMap[status] || 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800';
  };

  useEffect(() => {
    fetchRaces();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [races, filters]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 flex items-center">
          <FileText className="w-6 h-6 sm:w-8 sm:h-8 mr-2 sm:mr-3 text-blue-600" />
          Relatórios
        </h1>
        <p className="text-gray-600">Gere relatórios detalhados dos seus contadores</p>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Filtros</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-4">
          {/* Data Início */}
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
              Data início
            </label>
            <input
              type="date"
              id="startDate"
              value={filters.startDate}
              onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>

          {/* Data Fim */}
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
              Data fim
            </label>
            <input
              type="date"
              id="endDate"
              value={filters.endDate}
              onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>

          {/* Status */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Tipo
            </label>
            <select
              id="status"
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as RaceStatus | 'all' }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Descrição */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Descrição
            </label>
            <input
              type="text"
              id="description"
              value={filters.description}
              onChange={(e) => setFilters(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Filtrar por texto na descrição"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>
        </div>

        {/* Botões de ação */}
        <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
          <button
            onClick={clearFilters}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Filter className="w-4 h-4 mr-2" />
            Limpar filtros
          </button>

          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <button
              onClick={exportToExcel}
              disabled={exporting || filteredRaces.length === 0}
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {exporting ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              Gerar Excel
            </button>

            <button
              onClick={exportToPDF}
              disabled={exporting || filteredRaces.length === 0}
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {exporting ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <FileText className="w-4 h-4 mr-2" />
              )}
              Gerar PDF
            </button>
          </div>
        </div>       
      </div>

      {/* Preview dos Dados */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Preview dos Dados
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {filteredRaces.length} contador(es) encontrado(s)
          </p>
        </div>

        {filteredRaces.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <FileText className="mx-auto h-12 w-12" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum resultado encontrado</h3>
            <p className="text-gray-500">Ajuste os filtros para ver os dados.</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nome do Contador
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data (DD/MM/YYYY)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hora (HH:MM)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Conclusão (HH:MM:SS)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRaces.map((race) => (
                    <tr key={race._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {race.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(race.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {race.time}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                        {race.tempoConclusao || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={getStatusColor(race.status)}>
                          {getStatusText(race.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden space-y-4 p-4">
              {filteredRaces.map((race) => (
                <div key={race._id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="font-medium text-gray-900 text-sm flex-1 pr-2">{race.name}</h4>
                    <span className={getStatusColor(race.status)}>
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
                    <div className="flex items-center col-span-2">
                      <Target className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
                      <span className="truncate text-blue-600">{race.tempoConclusao || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Reports;