import mongoose, { Document, Schema } from 'mongoose';

export type RaceStatus = 'inscrito' | 'pretendo_ir' | 'concluido' | 'na_duvida' | 'cancelada' | 'nao_pude_ir';

export interface IRace extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  date: string; // ISO format: "2025-10-15"
  time: string; // Format: "14:30"
  price: number;
  distancia: number; // Distance in kilometers with 2 decimal places
  urlInscricao: string;
  status: RaceStatus;
  tempoConclusao?: string; // Format: "HH:MM:SS" - Completion time
  createdAt: Date;
  updatedAt: Date;
}

const raceSchema = new Schema<IRace>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'ID do usuário é obrigatório']
  },
  name: {
    type: String,
    required: [true, 'Nome da corrida é obrigatório'],
    trim: true,
    maxlength: [200, 'Nome deve ter no máximo 200 caracteres']
  },
  date: {
    type: String,
    required: [true, 'Data é obrigatória'],
    match: [/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD']
  },
  time: {
    type: String,
    required: [true, 'Hora é obrigatória'],
    match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Hora deve estar no formato HH:MM']
  },
  price: {
    type: Number,
    required: [true, 'Preço é obrigatório'],
    min: [0, 'Preço deve ser maior ou igual a 0']
  },
  distancia: {
    type: Number,
    required: [true, 'Distância é obrigatória'],
    min: [0.01, 'Distância deve ser maior que 0'],
    validate: {
      validator: function(v: number) {
        // Verifica se tem no máximo 2 casas decimais
        return Number.isFinite(v) && /^\d+(\.\d{1,2})?$/.test(v.toString());
      },
      message: 'Distância deve ter no máximo 2 casas decimais'
    }
  },
  urlInscricao: {
    type: String,
    required: false,
    trim: true,
    validate: {
      validator: function(v: string) {
        if (!v || v.trim() === '') return true;
        return /^https?:\/\/.+/.test(v);
      },
      message: 'URL deve ser válida (começar com http:// ou https://)'
    }
  },
  status: {
    type: String,
    required: [true, 'Status é obrigatório'],
    enum: {
      values: ['inscrito', 'pretendo_ir', 'concluido', 'na_duvida', 'cancelada', 'nao_pude_ir'],
      message: 'Status deve ser: inscrito, pretendo_ir, concluido, na_duvida, cancelada ou nao_pude_ir'
    }
  },
  tempoConclusao: {
    type: String,
    required: false,
    match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/, 'Tempo de conclusão deve estar no formato HH:MM:SS']
  }
}, {
  timestamps: true
});

// Índices para otimizar consultas
raceSchema.index({ userId: 1, date: -1 });
raceSchema.index({ userId: 1, status: 1 });
raceSchema.index({ userId: 1, name: 'text' });

export const Race = mongoose.model<IRace>('Race', raceSchema);