import { Router } from 'express';
import { register, login, getProfile } from '../controllers/authController';
import { validateUserRegistration, validateUserLogin } from '../middleware/validation';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Rota de registro
router.post('/register', validateUserRegistration, register);

// Rota de login
router.post('/login', validateUserLogin, login);

// Rota para obter perfil do usuário (protegida)
router.get('/profile', authenticateToken, getProfile);

export default router;