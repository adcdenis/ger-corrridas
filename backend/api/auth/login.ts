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

    const { email, password } = req.body;

    // Validação básica
    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: 'Email e senha são obrigatórios'
      });
      return;
    }

    // Buscar usuário
    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Email ou senha inválidos'
      });
      return;
    }

    // Verificar senha
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: 'Email ou senha inválidos'
      });
      return;
    }

    // Gerar token
    const token = generateToken(user);

    res.json({
      success: true,
      message: 'Login realizado com sucesso',
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
    console.error('Erro no login:', error);
    
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
}