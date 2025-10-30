import React, { useState } from 'react';
import { Download, Upload, FileText, AlertCircle, ArrowUpDown } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { apiService } from '../services/api';

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

// Definindo CreateRaceData localmente para evitar problemas de importação
interface CreateRaceData {
  name: string;
  date: string;
  time: string;
  price: number;
  distancia: number;
  urlInscricao?: string;
  status: RaceStatus;
  tempoConclusao?: string;
  description?: string;
}

interface ImportExportRacesProps {
  races: Race[];
  onRacesUpdated: () => void;
}

interface ImportedRace {
  name: string;
  description?: string;
  eventDate?: string;
  date?: string;
  time?: string;
  price?: number;
  distancia?: number;
  urlInscricao?: string;
  status?: string;
  tempoConclusao?: string;
}

const ImportExportRaces: React.FC<ImportExportRacesProps> = ({ races, onRacesUpdated }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);

  const handleExport = () => {
    try {
      const exportData = races.map(race => ({
        name: race.name,        
        date: race.date,
        time: race.time,
        price: race.price,
        distancia: race.distancia,
        urlInscricao: race.urlInscricao,
        status: race.status,
        tempoConclusao: race.tempoConclusao || ""
      }));

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `corridas_${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      toast.success(`${races.length} corridas exportadas com sucesso!`);
    } catch (error) {
      toast.error('Erro ao exportar corridas');
      console.error('Erro na exportação:', error);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'application/json') {
        toast.error('Por favor, selecione um arquivo JSON válido');
        return;
      }
      setSelectedFile(file);
    }
  };

  const parseImportedData = (data: any): ImportedRace[] => {
    if (Array.isArray(data)) {
      return data;
    }
    
    if (data && typeof data === 'object') {
      if (Array.isArray(data.items)) {
        return data.items;
      }
      
      if (data.name) {
        return [data];
      }
    }
    
    throw new Error('Formato de dados inválido');
  };

  const validateRaceData = (race: ImportedRace): boolean => {
    if (!race.name || typeof race.name !== 'string' || race.name.trim() === '') {
      return false;
    }
    return true;
  };

  const handleImport = async () => {
    if (!selectedFile) {
      toast.error('Selecione um arquivo para importar');
      return;
    }

    setImporting(true);
    
    try {
      const fileContent = await selectedFile.text();
      const jsonData = JSON.parse(fileContent);
      
      const importedRaces = parseImportedData(jsonData);
      
      if (!Array.isArray(importedRaces) || importedRaces.length === 0) {
        toast.error('Nenhuma corrida válida encontrada no arquivo');
        return;
      }

      let created = 0;
      let updated = 0;
      let errors = 0;

      for (const importedRace of importedRaces) {
        try {
          if (!validateRaceData(importedRace)) {
            console.warn('Corrida inválida ignorada:', importedRace);
            errors++;
            continue;
          }

          const existingRace = races.find(r => r.name.toLowerCase() === importedRace.name.toLowerCase());
          
          // Validar e normalizar o status
          const validStatuses: RaceStatus[] = ['inscrito', 'pretendo_ir', 'concluido', 'na_duvida', 'cancelada', 'nao_pude_ir'];
          const normalizedStatus: RaceStatus = validStatuses.includes(importedRace.status as RaceStatus) 
            ? importedRace.status as RaceStatus 
            : 'pretendo_ir';
          
          const raceData: CreateRaceData = {
            name: importedRace.name.trim(),
            description: importedRace.description || '',
            date: importedRace.date || importedRace.eventDate || new Date().toISOString().split('T')[0],
            time: importedRace.time || '09:00',
            price: importedRace.price || 0,
            distancia: importedRace.distancia || 0,
            urlInscricao: importedRace.urlInscricao || '',
            status: normalizedStatus,
            tempoConclusao: importedRace.tempoConclusao || ''
          };

          if (existingRace) {
            await apiService.updateRace(existingRace._id, raceData);
            updated++;
          } else {
            await apiService.createRace(raceData);
            created++;
          }
        } catch (error) {
          console.error(`Erro ao processar corrida ${importedRace.name}:`, error);
          errors++;
        }
      }

      onRacesUpdated();
      
      let message = '';
      if (created > 0) message += `${created} corridas criadas`;
      if (updated > 0) message += `${message ? ', ' : ''}${updated} corridas atualizadas`;
      if (errors > 0) message += `${message ? ', ' : ''}${errors} erros`;
      
      toast.success(`Importação concluída: ${message}`);
      setSelectedFile(null);
      
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
    } catch (error) {
      toast.error('Erro ao processar arquivo JSON');
      console.error('Erro na importação:', error);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 flex items-center">
          <ArrowUpDown className="w-6 h-6 sm:w-8 sm:h-8 mr-2 sm:mr-3 text-blue-600" />
          Importar/Exportar Corridas
        </h1>
        <p className="text-gray-600">
          Gerencie seus dados de corridas através de importação e exportação
        </p>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-green-50 rounded-lg p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Download size={20} />
              Exportar
            </h2>
            <p className="text-gray-600 mb-4">
              Baixe um arquivo JSON com suas corridas atuais. O arquivo gerado contém um{' '}
              <span className="font-mono bg-white px-1 rounded">array</span> de objetos (sem wrapper).
            </p>
            <button
              onClick={handleExport}
              disabled={races.length === 0}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Download size={16} />
              Exportar JSON
            </button>
          </div>

          <div className="bg-blue-50 rounded-lg p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Upload size={20} />
              Importar
            </h2>
            <p className="text-gray-600 mb-4">
              Selecione um arquivo JSON. Se o nome da corrida já existir, o registro será atualizado; caso contrário, um novo será criado.
            </p>
            
            <div className="space-y-4">
              <div>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileSelect}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {selectedFile ? selectedFile.name : 'Nenhum arquivo escolhido'}
                </p>
              </div>
              
              <button
                onClick={handleImport}
                disabled={!selectedFile || importing}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {importing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Importando...
                  </>
                ) : (
                  <>
                    <Upload size={16} />
                    Importar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 rounded-lg p-4 sm:p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FileText size={20} />
          Formato do JSON (Importação/Exportação)
        </h3>

        <div className="space-y-3 text-sm">
          <div>
            <span className="font-semibold">• Exportação:</span> retorna um{' '}
            <span className="font-mono bg-white px-1 rounded">array</span> de corridas.
          </div>
          <div>
            <span className="font-semibold">• Importação:</span> aceita um{' '}
            <span className="font-mono bg-white px-1 rounded">array</span> de corridas ou um objeto no formato{' '}
            <span className="font-mono bg-white px-1 rounded">{`{"items": [ ... ]}`}</span>.
          </div>
        </div>

        <h4 className="font-semibold text-gray-900 mt-4 mb-2">Campos da corrida</h4>
        <ul className="text-sm space-y-1">
          <li><span className="font-mono bg-white px-1 rounded">name</span> (obrigatório): nome da corrida</li>
          <li><span className="font-mono bg-white px-1 rounded">date</span> (opcional): data no formato YYYY-MM-DD</li>
          <li><span className="font-mono bg-white px-1 rounded">time</span> (opcional): horário no formato HH:MM</li>
          <li><span className="font-mono bg-white px-1 rounded">price</span> (opcional): preço da inscrição</li>
          <li><span className="font-mono bg-white px-1 rounded">distancia</span> (opcional): distância em km</li>
          <li><span className="font-mono bg-white px-1 rounded">urlInscricao</span> (opcional): URL para inscrição</li>
          <li><span className="font-mono bg-white px-1 rounded">status</span> (opcional): status da corrida (padrão: "pretendo_ir")</li>
          <li><span className="font-mono bg-white px-1 rounded">tempoConclusao</span> (opcional): tempo de conclusão no formato HH:MM:SS</li>
        </ul>

        <h4 className="font-semibold text-gray-900 mt-4 mb-2">Exemplo de objeto de corrida</h4>
        <pre className="bg-white p-3 rounded text-xs overflow-x-auto">
{JSON.stringify({
  "name": "Corrida de São Silvestre",
  "date": "2025-12-31",
  "time": "09:00",
  "price": 50.00,
  "distancia": 15.0,
  "urlInscricao": "https://exemplo.com/inscricao",
  "status": "pretendo_ir",
  "tempoConclusao": "01:30:45"
}, null, 2)}
        </pre>

        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded flex items-start gap-2">
          <AlertCircle size={16} className="text-yellow-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-yellow-800">
            Para importar várias corridas, use um array desses objetos ou {`{"items": [ ... ]}`}.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ImportExportRaces;