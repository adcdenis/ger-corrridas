import { VercelRequest, VercelResponse } from '@vercel/node';
import { connectDatabase } from '../../src/utils/database';
import { User } from '../../src/models/User';
import { generateToken } from '../../src/utils/jwt';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Apenas aceitar método POST
  if (req.method !== 'POST') {
    res.status(405).json({
      success: false,
      message: 'Método não permitido'
    });
    return;
  }

  try {
    // Conectar ao banco de dados
    await connectDatabase();

    const { name, email, password } = req.body;

    // Validação básica
    if (!name || !email || !password) {
      res.status(400).json({
        success: false,
        message: 'Nome, email e senha são obrigatórios'
      });
      return;
    }

    // Verificar se o usuário já existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({
        success: false,
        message: 'Usuário já existe com este email'
      });
      return;
    }

    // Criar novo usuário
    const user = new User({
      name,
      email,
      password
    });

    await user.save();

    // Gerar token
    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: 'Usuário criado com sucesso',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt
        },
        token
      }
    });

  } catch (error) {
    console.error('Erro no registro:', error);
    
    if (error instanceof Error && error.name === 'ValidationError') {
      res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: Object.values((error as any).errors).map((err: any) => ({
          field: err.path,
          message: err.message
        }))
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
}