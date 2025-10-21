import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { apiService } from '../services/api';
import ImportExportRaces from '../components/ImportExportRaces';

// Definindo tipos localmente para evitar problemas de importação
type RaceStatus = 'inscrito' | 'pretendo_ir' | 'concluido' | 'na_duvida' | 'cancelada' | 'nao_pude_ir';

interface Race {
  _id: string;
  userId: string;
  name: string;
  date: string;
  time: string;
  price: number;
  distancia: number;
  urlInscricao: string;
  status: RaceStatus;
  tempoConclusao?: string;
  createdAt: string;
  updatedAt: string;
}

export const ImportExportPage: React.FC = () => {
  const [races, setRaces] = useState<Race[]>([]);
  const [loading, setLoading] = useState(true);

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
  }, []);

  const handleRacesUpdated = () => {
    fetchRaces();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <ImportExportRaces 
      races={races} 
      onRacesUpdated={handleRacesUpdated} 
    />
  );
};

export default ImportExportPage;