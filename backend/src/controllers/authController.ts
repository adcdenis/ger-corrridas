import { Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import { User } from '../models/User';
import { generateToken } from '../utils/jwt';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;

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
};

export const googleAuth = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.body;

    if (!token) {
      res.status(400).json({
        success: false,
        message: 'Token do Google é obrigatório'
      });
      return;
    }

    // Verificar o token com o Google
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      res.status(400).json({
        success: false,
        message: 'Token inválido'
      });
      return;
    }

    const { email, name, picture } = payload;

    if (!email || !name) {
      res.status(400).json({
        success: false,
        message: 'Informações do Google incompletas'
      });
      return;
    }

    // Verificar se o usuário já existe
    let user = await User.findOne({ email });

    if (!user) {
      // Criar novo usuário com dados do Google
      user = new User({
        name,
        email,
        password: Math.random().toString(36).slice(-8), // Senha aleatória (não será usada)
        googleId: payload.sub,
        avatar: picture
      });
      await user.save();
    } else {
      // Atualizar informações do Google se necessário
      if (!user.googleId) {
        user.googleId = payload.sub;
        user.avatar = picture;
        await user.save();
      }
    }

    // Gerar token JWT
    const jwtToken = generateToken(user);

    res.json({
      success: true,
      message: 'Login com Google realizado com sucesso',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          createdAt: user.createdAt
        },
        token: jwtToken
      }
    });

  } catch (error) {
    console.error('Erro no login com Google:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

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
};

export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Usuário não autenticado'
      });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
      return;
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      }
    });

  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};