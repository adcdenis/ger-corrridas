import { Router } from 'express';
import {
  createRace,
  getRaces,
  getRaceById,
  updateRace,
  deleteRace,
  getRaceStats,
  getAdvancedStatistics
} from '../controllers/raceController';
import { validateRaceCreation, validateRaceUpdate } from '../middleware/validation';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Todas as rotas de corridas requerem autenticação
router.use(authenticateToken);

// Rota para obter estatísticas
router.get('/stats', getRaceStats);

// Rota para obter estatísticas avançadas com filtro de período
router.get('/statistics', getAdvancedStatistics);

// Rotas CRUD
router.post('/', validateRaceCreation, createRace);
router.get('/', getRaces);
router.get('/:id', getRaceById);
router.put('/:id', validateRaceUpdate, updateRace);
router.delete('/:id', deleteRace);

export default router;