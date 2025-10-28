import { Router } from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { User } from '../models/User';
import { Race } from '../models/Race';

const router = Router();

// GET /api/users - Listar todos os usuários (apenas admin)
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Buscar todos os usuários excluindo a senha
    const users = await User.find({}, '-password').sort({ createdAt: -1 });

    // Para cada usuário, contar quantas corridas ele cadastrou
    const usersWithRaceCount = await Promise.all(
      users.map(async (user) => {
        const raceCount = await Race.countDocuments({ userId: user._id });
        return {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          createdAt: user.createdAt,
          raceCount
        };
      })
    );

    res.json({
      success: true,
      data: usersWithRaceCount,
      total: users.length
    });
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// DELETE /api/users/:id - Excluir usuário (apenas admin)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se o usuário existe
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // Impedir que o admin exclua a si mesmo
    if (user._id.toString() === req.user?.userId) {
      return res.status(400).json({
        success: false,
        message: 'Você não pode excluir sua própria conta'
      });
    }

    // Verificar se o usuário tem corridas cadastradas
    const raceCount = await Race.countDocuments({ userId: id });
    if (raceCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Não é possível excluir o usuário. Ele possui ${raceCount} corrida(s) cadastrada(s). Transfira ou exclua as corridas primeiro.`
      });
    }

    // Excluir o usuário
    await User.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Usuário excluído com sucesso'
    });
  } catch (error) {
    console.error('Erro ao excluir usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

export default router;