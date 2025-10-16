import { Request, Response } from 'express';
import { Race, RaceStatus } from '../models/Race';
import mongoose from 'mongoose';

interface QueryFilters {
  userId: string;
  date?: { $regex: string };
  status?: { $in: RaceStatus[] };
  name?: { $regex: string; $options: string };
}

export const createRace = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Usuário não autenticado'
      });
      return;
    }

    const raceData = {
      ...req.body,
      userId: new mongoose.Types.ObjectId(userId)
    };

    const race = new Race(raceData);
    await race.save();

    res.status(201).json({
      success: true,
      message: 'Corrida criada com sucesso',
      data: { race }
    });

  } catch (error) {
    console.error('Erro ao criar corrida:', error);
    
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

export const getRaces = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Usuário não autenticado'
      });
      return;
    }

    // Parâmetros de consulta
    const {
      year,
      month,
      status,
      search,
      page = '1',
      limit = '10',
      sortBy = 'date',
      sortOrder = 'desc'
    } = req.query;

    // Construir filtros
    const filters: QueryFilters = { userId };

    // Filtro por ano
    if (year) {
      filters.date = { $regex: `^${year}` };
    }

    // Filtro por mês (se ano também estiver presente)
    if (year && month && month !== 'all') {
      const monthPadded = String(month).padStart(2, '0');
      filters.date = { $regex: `^${year}-${monthPadded}` };
    }

    // Filtro por status (pode ser múltiplo)
    if (status) {
      const statusArray = Array.isArray(status) ? status : [status];
      filters.status = { $in: statusArray as RaceStatus[] };
    }

    // Filtro por nome (busca)
    if (search && typeof search === 'string') {
      filters.name = { 
        $regex: search, 
        $options: 'i' // case insensitive
      };
    }

    // Paginação
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    // Ordenação
    const sortOptions: { [key: string]: 1 | -1 } = {};
    sortOptions[sortBy as string] = sortOrder === 'asc' ? 1 : -1;

    // Executar consulta
    const [races, total] = await Promise.all([
      Race.find(filters)
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Race.countDocuments(filters)
    ]);

    // Calcular informações de paginação
    const totalPages = Math.ceil(total / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    res.json({
      success: true,
      data: {
        races,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalItems: total,
          itemsPerPage: limitNum,
          hasNextPage,
          hasPrevPage
        },
        filters: {
          year,
          month,
          status,
          search
        }
      }
    });

  } catch (error) {
    console.error('Erro ao buscar corridas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

export const getRaceById = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Usuário não autenticado'
      });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: 'ID da corrida inválido'
      });
      return;
    }

    const race = await Race.findOne({ 
      _id: id, 
      userId: new mongoose.Types.ObjectId(userId) 
    });

    if (!race) {
      res.status(404).json({
        success: false,
        message: 'Corrida não encontrada'
      });
      return;
    }

    res.json({
      success: true,
      data: { race }
    });

  } catch (error) {
    console.error('Erro ao buscar corrida:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

export const updateRace = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Usuário não autenticado'
      });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: 'ID da corrida inválido'
      });
      return;
    }

    const race = await Race.findOneAndUpdate(
      { 
        _id: id, 
        userId: new mongoose.Types.ObjectId(userId) 
      },
      req.body,
      { 
        new: true, 
        runValidators: true 
      }
    );

    if (!race) {
      res.status(404).json({
        success: false,
        message: 'Corrida não encontrada'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Corrida atualizada com sucesso',
      data: { race }
    });

  } catch (error) {
    console.error('Erro ao atualizar corrida:', error);
    
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

export const deleteRace = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Usuário não autenticado'
      });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: 'ID da corrida inválido'
      });
      return;
    }

    const race = await Race.findOneAndDelete({ 
      _id: id, 
      userId: new mongoose.Types.ObjectId(userId) 
    });

    if (!race) {
      res.status(404).json({
        success: false,
        message: 'Corrida não encontrada'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Corrida excluída com sucesso'
    });

  } catch (error) {
    console.error('Erro ao excluir corrida:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

export const getRaceStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { year } = req.query;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Usuário não autenticado'
      });
      return;
    }

    const matchStage: any = { 
      userId: new mongoose.Types.ObjectId(userId) 
    };

    if (year) {
      matchStage.date = { $regex: `^${year}` };
    }

    const stats = await Race.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalPrice: { $sum: '$price' }
        }
      }
    ]);

    const monthlyStats = await Race.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: { 
            month: { $substr: ['$date', 5, 2] },
            status: '$status'
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.month',
          statuses: {
            $push: {
              status: '$_id.status',
              count: '$count'
            }
          },
          total: { $sum: '$count' }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    res.json({
      success: true,
      data: {
        statusStats: stats,
        monthlyStats
      }
    });

  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

export const getAdvancedStatistics = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Usuário não autenticado'
      });
      return;
    }

    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      res.status(400).json({
        success: false,
        message: 'Data de início e fim são obrigatórias'
      });
      return;
    }

    // Construir filtros de data
    const matchStage: any = {
      userId: new mongoose.Types.ObjectId(userId),
      date: {
        $gte: startDate as string,
        $lte: endDate as string
      }
    };

    // Buscar todas as corridas no período
    const races = await Race.find(matchStage).sort({ date: -1 });

    // Calcular estatísticas agregadas
    const aggregatedStats = await Race.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalRaces: { $sum: 1 },
          totalCost: { 
            $sum: {
              $cond: {
                if: { $in: ['$status', ['concluido', 'inscrito', 'nao_pude_ir']] },
                then: '$price',
                else: 0
              }
            }
          },
          totalDistance: { 
            $sum: {
              $cond: {
                if: { $eq: ['$status', 'concluido'] },
                then: '$distancia',
                else: 0
              }
            }
          },
          statusCounts: {
            $push: '$status'
          }
        }
      }
    ]);

    // Contar por status
    const statusStats = await Race.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Processar contadores por status
    const statusCounts = {
      inscrito: 0,
      concluido: 0,
      pretendo_ir: 0,
      cancelada: 0,
      na_duvida: 0,
      nao_pude_ir: 0
    };

    statusStats.forEach(stat => {
      if (stat._id in statusCounts) {
        statusCounts[stat._id as keyof typeof statusCounts] = stat.count;
      }
    });

    const result = {
      totalRaces: aggregatedStats[0]?.totalRaces || 0,
      totalCost: aggregatedStats[0]?.totalCost || 0,
      totalDistance: aggregatedStats[0]?.totalDistance || 0,
      statusCounts,
      races
    };

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Erro ao buscar estatísticas avançadas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};