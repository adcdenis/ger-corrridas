import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiService } from '../services/api';
import { toast } from 'react-hot-toast';
import { type Race, STATUS_LABELS, STATUS_COLORS } from '../types/index';
import { Pencil, Trash2, Plus, ExternalLink } from 'lucide-react';

const raceSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  date: z.string().min(1, 'Data é obrigatória'),
  time: z.string().min(1, 'Horário é obrigatório'),
  price: z.number().min(0, 'Preço deve ser maior ou igual a 0'),
  distancia: z.number()
    .min(0.01, 'Distância deve ser maior que 0')
    .refine((val) => {
      // Verifica se tem no máximo 2 casas decimais
      return /^\d+(\.\d{1,2})?$/.test(val.toString());
    }, 'Distância deve ter no máximo 2 casas decimais'),
  urlInscricao: z.string().url('URL deve ser válida').optional().or(z.literal('')),
  status: z.enum(['inscrito', 'pretendo_ir', 'concluido', 'na_duvida', 'cancelada', 'nao_pude_ir']),
  tempoConlusao: z.string()
    .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/, 'Tempo deve estar no formato HH:MM:SS')
    .optional()
    .or(z.literal(''))
});

type RaceFormData = z.infer<typeof raceSchema>;

export const Races: React.FC = () => {
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
    try {
      setLoading(true);
      const response = await apiService.getRaces();
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
  }, []);

  const onSubmit = async (data: RaceFormData) => {
    try {
      // Converter data de DD/MM/YYYY para YYYY-MM-DD antes de enviar para o backend
      const formattedData = {
        ...data,
        date: data.date.split('/').reverse().join('-')
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
    
    // Converter data para formato DD/MM/YYYY (formato do input personalizado)
    let formattedDate = race.date;
    
    // Se a data está no formato YYYY-MM-DD (ISO), converter para DD/MM/YYYY
    if (race.date.includes('-')) {
      const dateParts = race.date.split('T')[0].split('-'); // Remove time part if exists
      if (dateParts.length === 3) {
        // Assumindo YYYY-MM-DD
        const year = dateParts[0];
        const month = dateParts[1];
        const day = dateParts[2];
        formattedDate = `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
      }
    }
    // Se a data já está no formato DD/MM/YYYY, usar diretamente
    else if (race.date.includes('/')) {
      formattedDate = race.date;
    }
    
    setValue('date', formattedDate);
    setValue('time', race.time);
    setValue('price', race.price);
    setValue('distancia', race.distancia);
    setValue('urlInscricao', race.urlInscricao);
    setValue('status', race.status);
    setValue('tempoConlusao', race.tempoConlusao || '');
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
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Gerenciar Corridas</h1>
        <button
          onClick={handleNewRace}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center gap-2"
        >
          <Plus size={20} />
          Nova Corrida
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            {editingRace ? 'Editar Corrida' : 'Cadastrar Nova Corrida'}
          </h2>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                  Data
                </label>
                <input
                  {...register('date')}
                  type="text"
                  id="date"
                  onChange={(e) => {
                    let value = e.target.value.replace(/[^0-9]/g, '');
                    if (value.length >= 3) {
                      value = value.slice(0, 2) + '/' + value.slice(2);
                    }
                    if (value.length >= 6) {
                      value = value.slice(0, 5) + '/' + value.slice(5, 9);
                    }
                    if (value.length === 10) {
                      const [day, month, year] = value.split('/');
                      const d = parseInt(day);
                      const m = parseInt(month);
                      const y = parseInt(year);
                      if (d >= 1 && d <= 31 && m >= 1 && m <= 12 && y >= 1900 && y <= 2100) {
                        setValue('date', value);
                      }
                    } else if (value.length <= 8) {
                      setValue('date', value);
                    }
                  }}
                  onBlur={(e) => {
                    const value = e.target.value;
                    if (value.length === 10) {
                      const [day, month, year] = value.split('/');
                      const d = parseInt(day);
                      const m = parseInt(month);
                      const y = parseInt(year);
                      if (d >= 1 && d <= 31 && m >= 1 && m <= 12 && y >= 1900 && y <= 2100) {
                        const formattedDate = `${d.toString().padStart(2, '0')}/${m.toString().padStart(2, '0')}/${y}`;
                        setValue('date', formattedDate);
                      }
                    }
                  }}
                  placeholder="DD/MM/YYYY"
                  maxLength={10}
                  pattern="^(0[1-9]|[12][0-9]|3[01])/(0[1-9]|1[0-2])/[0-9]{4}$"
                  title="Formato: DD/MM/YYYY (ex: 31/12/2025)"
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
                  type="text"
                  id="time"
                  onChange={(e) => {
                    let value = e.target.value.replace(/[^0-9]/g, '');
                    if (value.length >= 3) {
                      value = value.slice(0, 2) + ':' + value.slice(2, 4);
                    }
                    if (value.length === 5) {
                      const [hours, minutes] = value.split(':');
                      const h = parseInt(hours);
                      const m = parseInt(minutes);
                      if (h >= 0 && h <= 23 && m >= 0 && m <= 59) {
                        setValue('time', value);
                      }
                    } else if (value.length <= 2) {
                      setValue('time', value);
                    }
                  }}
                  onBlur={(e) => {
                    const value = e.target.value;
                    if (value.length === 5) {
                      const [hours, minutes] = value.split(':');
                      const h = parseInt(hours);
                      const m = parseInt(minutes);
                      if (h >= 0 && h <= 23 && m >= 0 && m <= 59) {
                        const formattedTime = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
                        setValue('time', formattedTime);
                      }
                    }
                  }}
                  placeholder="HH:MM"
                  maxLength={5}
                  pattern="^([01]?[0-9]|2[0-3]):[0-5][0-9]$"
                  title="Formato: HH:MM (24 horas, ex: 14:30)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.time && (
                  <p className="mt-1 text-sm text-red-600">{errors.time.message}</p>
                )}
              </div>
            </div>

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

            <div>
              <label htmlFor="urlInscricao" className="block text-sm font-medium text-gray-700 mb-2">
                URL de Inscrição
              </label>
              <input
                {...register('urlInscricao')}
                type="url"
                id="urlInscricao"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://exemplo.com/inscricao"
              />
              {errors.urlInscricao && (
                <p className="mt-1 text-sm text-red-600">{errors.urlInscricao.message}</p>
              )}
            </div>

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
              <label htmlFor="tempoConlusao" className="block text-sm font-medium text-gray-700 mb-2">
                Tempo de Conclusão
              </label>
              <input
                {...register('tempoConlusao')}
                type="text"
                id="tempoConlusao"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ex: 01:30:45 (HH:MM:SS)"
              />
              {errors.tempoConlusao && (
                <p className="mt-1 text-sm text-red-600">{errors.tempoConlusao.message}</p>
              )}
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Salvando...' : editingRace ? 'Atualizar Corrida' : 'Cadastrar Corrida'}
              </button>
              <button
                type="button"
                onClick={handleCancelForm}
                className="bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
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
          <p className="text-gray-500 mb-4">Comece cadastrando sua primeira corrida.</p>
          <button
            onClick={handleNewRace}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Cadastrar Primeira Corrida
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nome
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
                    Preço
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tempo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Inscrição
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {races.map((race) => (
                   <tr key={race._id} className="hover:bg-gray-50">
                     <td className="px-6 py-4 whitespace-nowrap">
                       <div className="text-sm font-medium text-gray-900">{race.name}</div>
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap">
                       <div className="text-sm text-gray-900">
                         {new Date(race.date).toLocaleDateString('pt-BR')}
                       </div>
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap">
                       <div className="text-sm text-gray-900">{race.time}</div>
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap">
                       <div className="text-sm text-gray-900">{race.distancia} km</div>
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap">
                       <div className="text-sm text-gray-900">
                         R$ {race.price.toFixed(2).replace('.', ',')}
                       </div>
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap">
                       <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${STATUS_COLORS[race.status]}`}>
                         {STATUS_LABELS[race.status]}
                       </span>
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap">
                       <div className="text-sm text-gray-900">
                         {race.tempoConlusao || '-'}
                       </div>
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap">
                       {race.urlInscricao ? (
                         <a
                           href={race.urlInscricao}
                           target="_blank"
                           rel="noopener noreferrer"
                           className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                         >
                           <ExternalLink size={16} />
                           Inscrever-se
                         </a>
                       ) : (
                         <span className="text-gray-400 text-sm">Não informado</span>
                       )}
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                       <div className="flex justify-end gap-2">
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
                     </td>
                   </tr>
                 ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 backdrop-blur-md flex items-center justify-center z-50" style={{backgroundColor: 'rgba(255, 255, 255, 0.1)'}}>
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl border border-gray-200 animate-fade-in">
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