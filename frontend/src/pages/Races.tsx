import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSearchParams } from 'react-router-dom';
import { apiService } from '../services/api';
import { toast } from 'react-hot-toast';
import { type Race, STATUS_LABELS, STATUS_COLORS } from '../types/index';
import { Pencil, Trash2, Plus, ExternalLink, Trophy } from 'lucide-react';

const raceSchema = z.object({
    name: z.string().min(1, 'Nome é obrigatório'),
    date: z.string().min(1, 'Data é obrigatória'),
    time: z.string().min(1, 'Horário é obrigatório'),
    price: z.number().min(0, 'Preço deve ser maior ou igual a 0'),
    distancia: z.number().min(0.01, 'Distância deve ser maior que 0').refine((val) => {
      return /^\d+(\.\d{1,2})?$/.test(val.toString());
    }, 'Distância deve ter no máximo 2 casas decimais'),
    urlInscricao: z.string().url('URL deve ser válida').optional().or(z.literal('')),
    status: z.enum(['inscrito', 'pretendo_ir', 'concluido', 'na_duvida', 'cancelada', 'nao_pude_ir']),
    tempoConclusao: z.string().optional().refine((val) => {
      if (!val || val.trim() === '') return true;
      return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/.test(val);
    }, 'Formato deve ser HH:MM:SS')
  });

type RaceFormData = z.infer<typeof raceSchema>;

export const Races: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [races, setRaces] = useState<Race[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingRace, setEditingRace] = useState<Race | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue
  } = useForm<RaceFormData>({
    resolver: zodResolver(raceSchema)
  });

  const fetchRaces = async () => {
    setLoading(true);
    try {
      // Buscar todas as corridas sem limitação de paginação
      const response = await apiService.getRaces({
        limit: 1000, // Limite alto para buscar todas as corridas
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

  useEffect(() => {
    fetchRaces();
    
    // Verificar se deve abrir o formulário automaticamente
    const shouldOpenForm = searchParams.get('new') === 'true';
    if (shouldOpenForm) {
      setShowForm(true);
      // Remover o parâmetro da URL após abrir o formulário
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  const onSubmit = async (data: RaceFormData) => {
    try {
      // A data já vem no formato YYYY-MM-DD do input type="date"
      const formattedData = {
        ...data,
        date: data.date // Não precisa mais converter, já está no formato correto
      };
      
      if (editingRace) {
        await apiService.updateRace(editingRace._id, formattedData);
        toast.success('Corrida atualizada com sucesso!');
      } else {
        await apiService.createRace(formattedData);
        toast.success('Corrida cadastrada com sucesso!');
      }
      reset();
      setShowForm(false);
      setEditingRace(null);
      fetchRaces();
    } catch (error) {
      toast.error(editingRace ? 'Erro ao atualizar corrida' : 'Erro ao cadastrar corrida');
      console.error('Erro:', error);
    }
  };

  const handleEdit = (race: Race) => {
    setEditingRace(race);
    setValue('name', race.name);
    
    // O input type="date" espera formato YYYY-MM-DD
    let formattedDate = race.date;
    
    // Se a data está no formato DD/MM/YYYY, converter para YYYY-MM-DD
    if (race.date.includes('/')) {
      const dateParts = race.date.split('/');
      if (dateParts.length === 3) {
        // Assumindo DD/MM/YYYY
        const day = dateParts[0];
        const month = dateParts[1];
        const year = dateParts[2];
        formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
    }
    // Se a data já está no formato YYYY-MM-DD (ISO), usar diretamente
    else if (race.date.includes('-')) {
      formattedDate = race.date.split('T')[0]; // Remove time part if exists
    }
    
    setValue('date', formattedDate);
    setValue('time', race.time);
    setValue('price', race.price);
    setValue('distancia', race.distancia);
    setValue('urlInscricao', race.urlInscricao);
    setValue('status', race.status);
    setValue('tempoConclusao', race.tempoConclusao || '');
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await apiService.deleteRace(id);
      toast.success('Corrida excluída com sucesso!');
      setDeleteConfirm(null);
      fetchRaces();
    } catch (error) {
      toast.error('Erro ao excluir corrida');
      console.error('Erro:', error);
    }
  };

  const handleNewRace = () => {
    setEditingRace(null);
    reset();
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingRace(null);
    reset();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-row justify-between items-center mb-6 sm:mb-8 gap-3 sm:gap-4">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 flex items-center flex-1 min-w-0">
          <Trophy className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 mr-2 sm:mr-3 text-blue-600 flex-shrink-0" />
          <span className="truncate">Gerenciar Corridas</span>
        </h1>
        <button
          onClick={handleNewRace}
          className="bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center gap-1 sm:gap-2 transition-colors flex-shrink-0"
        >
          <Plus size={18} className="sm:hidden" />
          <Plus size={20} className="hidden sm:block" />
          <span className="hidden sm:inline">Nova Corrida</span>
          <span className="sm:hidden text-sm">Nova</span>
        </button>        
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">
            {editingRace ? 'Editar Corrida' : 'Cadastrar Nova Corrida'}
          </h2>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Nome da Corrida
              </label>
              <input
                {...register('name')}
                type="text"
                id="name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ex: Corrida de São Silvestre"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                  Data
                </label>
                <input
                  {...register('date')}
                  type="date"
                  id="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.date && (
                  <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-2">
                  Horário
                </label>
                <input
                  {...register('time')}
                  type="time"
                  id="time"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.time && (
                  <p className="mt-1 text-sm text-red-600">{errors.time.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                  Preço (R$)
                </label>
                <input
                  {...register('price', { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                  min="0"
                  id="price"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                />
                {errors.price && (
                  <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="distancia" className="block text-sm font-medium text-gray-700 mb-2">
                  Distância (km) *
                </label>
                <input
                  {...register('distancia', { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                  min="0.01"
                  id="distancia"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ex: 5.00, 21.10, 10.50"
                />
                {errors.distancia && (
                  <p className="mt-1 text-sm text-red-600">{errors.distancia.message}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="urlInscricao" className="block text-sm font-medium text-gray-700 mb-2">
                URL de Inscrição (opcional)
              </label>
              <input
                {...register('urlInscricao')}
                type="url"
                id="urlInscricao"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://exemplo.com/inscricao (opcional)"
              />
              {errors.urlInscricao && (
                <p className="mt-1 text-sm text-red-600">{errors.urlInscricao.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  {...register('status')}
                  id="status"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="inscrito">Inscrito</option>
                  <option value="pretendo_ir">Pretendo Ir</option>
                  <option value="concluido">Concluído</option>
                  <option value="na_duvida">Na Dúvida</option>
                  <option value="cancelada">Cancelada</option>
                  <option value="nao_pude_ir">Não Pude Ir</option>
                </select>
                {errors.status && (
                  <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="tempoConclusao" className="block text-sm font-medium text-gray-700 mb-2">
                  Tempo de Conclusão (opcional)
                </label>
                <input
                  {...register('tempoConclusao')}
                  type="time"
                  step="1"
                  id="tempoConclusao"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.tempoConclusao && (
                  <p className="mt-1 text-sm text-red-600">{errors.tempoConclusao.message}</p>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
              >
                {isSubmitting ? 'Salvando...' : editingRace ? 'Atualizar Corrida' : 'Cadastrar Corrida'}
              </button>
              <button
                type="button"
                onClick={handleCancelForm}
                className="bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 w-full sm:w-auto"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {races.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma corrida cadastrada</h3>
          <p className="text-gray-500 mb-4 px-4">Comece cadastrando sua primeira corrida.</p>
          <button
            onClick={handleNewRace}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Cadastrar Primeira Corrida
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 table-fixed">
              <thead className="bg-gray-50">
                <tr>
                  <th className="w-1/5 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nome
                  </th>
                  <th className="w-20 px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="w-16 px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Horário
                  </th>
                  <th className="w-16 px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dist.
                  </th>
                  <th className="w-20 px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Preço
                  </th>
                  <th className="w-24 px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="w-20 px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tempo
                  </th>
                  <th className="w-24 px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Inscrição
                  </th>
                  <th className="w-20 px-2 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {races.map((race) => (
                   <tr key={race._id} className="hover:bg-gray-50">
                     <td className="px-3 py-3 truncate">
                       <div className="text-sm font-medium text-gray-900 truncate" title={race.name}>{race.name}</div>
                     </td>
                     <td className="px-2 py-3 whitespace-nowrap">
                       <div className="text-xs text-gray-900">
                         {(() => {
                           // Evitar problemas de fuso horário interpretando a data como local
                           const [year, month, day] = race.date.split('-');
                           const localDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                           return localDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
                         })()}
                       </div>
                     </td>
                     <td className="px-2 py-3 whitespace-nowrap">
                       <div className="text-xs text-gray-900">{race.time}</div>
                     </td>
                     <td className="px-2 py-3 whitespace-nowrap">
                       <div className="text-xs text-gray-900">{race.distancia}km</div>
                     </td>
                     <td className="px-2 py-3 whitespace-nowrap">
                       <div className="text-xs text-gray-900">
                         R$ {race.price.toFixed(0)}
                       </div>
                     </td>
                     <td className="px-2 py-3 whitespace-nowrap">
                       <span className={`inline-flex px-1.5 py-0.5 text-xs font-semibold rounded-full ${STATUS_COLORS[race.status]}`}>
                         {STATUS_LABELS[race.status]}
                       </span>
                     </td>
                     <td className="px-2 py-3 whitespace-nowrap">
                       <div className="text-xs text-gray-900">
                         {race.tempoConclusao || '-'}
                       </div>
                     </td>
                     <td className="px-2 py-3 whitespace-nowrap">
                       {race.urlInscricao ? (
                         <a
                           href={race.urlInscricao}
                           target="_blank"
                           rel="noopener noreferrer"
                           className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                           title="Inscrever-se"
                         >
                           <ExternalLink size={12} />
                           <span className="text-xs">Link</span>
                         </a>
                       ) : (
                         <span className="text-gray-400 text-xs">-</span>
                       )}
                     </td>
                     <td className="px-2 py-3 whitespace-nowrap text-right text-sm font-medium">
                       <div className="flex justify-end gap-1">
                         <button
                           onClick={() => handleEdit(race)}
                           className="text-blue-600 hover:text-blue-800 p-1"
                           title="Editar"
                         >
                           <Pencil size={14} />
                         </button>
                         <button
                           onClick={() => setDeleteConfirm(race._id)}
                           className="text-red-600 hover:text-red-800 p-1"
                           title="Excluir"
                         >
                           <Trash2 size={14} />
                         </button>
                       </div>
                     </td>
                   </tr>
                 ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden">
            {races.map((race) => (
              <div key={race._id} className="border-b border-gray-200 p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-medium text-gray-900 pr-2">{race.name}</h3>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleEdit(race)}
                      className="text-blue-600 hover:text-blue-800 p-1"
                      title="Editar"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(race._id)}
                      className="text-red-600 hover:text-red-800 p-1"
                      title="Excluir"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                  <div>
                    <span className="text-gray-500">Data:</span>
                    <div className="font-medium">
                      {(() => {
                        // Evitar problemas de fuso horário interpretando a data como local
                        const [year, month, day] = race.date.split('-');
                        const localDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                        return localDate.toLocaleDateString('pt-BR');
                      })()}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500">Horário:</span>
                    <div className="font-medium">{race.time}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Distância:</span>
                    <div className="font-medium">{race.distancia} km</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Preço:</span>
                    <div className="font-medium">R$ {race.price.toFixed(2).replace('.', ',')}</div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${STATUS_COLORS[race.status]}`}>
                    {STATUS_LABELS[race.status]}
                  </span>
                  {race.tempoConclusao && (
                    <div className="text-sm text-gray-600">
                      <span className="text-gray-500">Tempo:</span> {race.tempoConclusao}
                    </div>
                  )}
                </div>

                {race.urlInscricao && (
                  <div className="mt-3">
                    <a
                      href={race.urlInscricao}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm"
                    >
                      <ExternalLink size={16} />
                      Inscrever-se
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 backdrop-blur-md flex items-center justify-center z-50" style={{backgroundColor: 'rgba(255, 255, 255, 0.1)'}}>
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-2xl border border-gray-200 animate-fade-in">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Confirmar Exclusão</h3>
            <p className="text-gray-600 mb-6">
              Tem certeza que deseja excluir esta corrida? Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-4 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-200"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};