import { Router } from 'express';
import { register, login, getProfile, googleAuth } from '../controllers/authController';
import { validateUserRegistration, validateUserLogin } from '../middleware/validation';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Rota de registro
router.post('/register', validateUserRegistration, register);

// Rota de login
router.post('/login', validateUserLogin, login);

// Rota de login com Google
router.post('/google', googleAuth);

// Rota para obter perfil do usuário (protegida)
router.get('/profile', authenticateToken, getProfile);

export default router;