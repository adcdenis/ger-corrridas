import mongoose from 'mongoose';

export const connectDatabase = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/gerenciador-corridas';
    
    console.log('🔄 Conectando ao MongoDB...');
    
    await mongoose.connect(mongoUri, {
      // Remover opções depreciadas
    });

    console.log('✅ MongoDB conectado com sucesso!');
    console.log(`📍 Database: ${mongoose.connection.name}`);
  } catch (error) {
    console.error('❌ Erro ao conectar ao MongoDB:', error);
    // Em desenvolvimento, continuar sem MongoDB para permitir teste do frontend
    if (process.env.NODE_ENV === 'development') {
      console.log('⚠️  Continuando em modo desenvolvimento sem MongoDB...');
      return;
    }
    throw error;
  }
};