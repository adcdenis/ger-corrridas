import jwt from 'jsonwebtoken';
import { IUser } from '../models/User';
import { Types } from 'mongoose';

export interface JwtPayload {
  userId: string;
  email: string;
}

export const generateToken = (user: IUser): string => {
  const payload: JwtPayload = {
    userId: (user._id as Types.ObjectId).toString(),
    email: user.email
  };

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET não está definido nas variáveis de ambiente');
  }

  return jwt.sign(payload, secret, {
    expiresIn: '7d', // Token expira em 7 dias
    issuer: 'gerenciador-corridas',
    audience: 'gerenciador-corridas-users'
  });
};

export const verifyToken = (token: string): JwtPayload => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET não está definido nas variáveis de ambiente');
  }

  try {
    const decoded = jwt.verify(token, secret, {
      issuer: 'gerenciador-corridas',
      audience: 'gerenciador-corridas-users'
    }) as JwtPayload;
    
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token expirado');
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Token inválido');
    } else {
      throw new Error('Erro ao verificar token');
    }
  }
};