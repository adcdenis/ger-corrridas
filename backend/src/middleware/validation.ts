import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

// Middleware para verificar erros de validação
export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: 'Dados inválidos',
      errors: errors.array().map(error => ({
        field: error.type === 'field' ? error.path : 'unknown',
        message: error.msg
      }))
    });
    return;
  }
  
  next();
};

// Validações para usuário
export const validateUserRegistration = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Nome deve ter entre 2 e 100 caracteres'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email deve ser válido'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Senha deve ter pelo menos 6 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Senha deve conter pelo menos uma letra minúscula, uma maiúscula e um número'),
  
  handleValidationErrors
];

export const validateUserLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email deve ser válido'),
  
  body('password')
    .notEmpty()
    .withMessage('Senha é obrigatória'),
  
  handleValidationErrors
];

// Validações para corrida
export const validateRaceCreation = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Nome da corrida deve ter entre 1 e 200 caracteres'),
  
  body('date')
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage('Data deve estar no formato YYYY-MM-DD')
    .custom((value) => {
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        throw new Error('Data inválida');
      }
      return true;
    }),
  
  body('time')
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Hora deve estar no formato HH:MM'),
  
  body('price')
    .isNumeric()
    .withMessage('Preço deve ser um número')
    .custom((value) => {
      if (parseFloat(value) < 0) {
        throw new Error('Preço deve ser maior ou igual a 0');
      }
      return true;
    }),

  body('distancia')
    .isNumeric()
    .withMessage('Distância deve ser um número')
    .custom((value) => {
      const num = parseFloat(value);
      if (num <= 0) {
        throw new Error('Distância deve ser maior que 0');
      }
      // Verifica se tem no máximo 2 casas decimais
      if (!/^\d+(\.\d{1,2})?$/.test(value.toString())) {
        throw new Error('Distância deve ter no máximo 2 casas decimais');
      }
      return true;
    }),
  
  body('urlInscricao')
    .optional()
    .custom((value) => {
      if (value && value.trim() !== '') {
        const urlRegex = /^https?:\/\/.+/;
        if (!urlRegex.test(value)) {
          throw new Error('URL de inscrição deve ser válida');
        }
      }
      return true;
    }),
  
  body('status')
    .isIn(['inscrito', 'pretendo_ir', 'concluido', 'na_duvida', 'cancelada', 'nao_pude_ir'])
    .withMessage('Status deve ser: inscrito, pretendo_ir, concluido, na_duvida, cancelada ou nao_pude_ir'),
  
  body('tempoConlusao')
    .optional()
    .custom((value) => {
      if (!value || value.trim() === '') return true;
      return /^([01]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/.test(value);
    })
    .withMessage('Tempo de conclusão deve estar no formato HH:MM:SS'),
  
  handleValidationErrors
];

export const validateRaceUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Nome da corrida deve ter entre 1 e 200 caracteres'),
  
  body('date')
    .optional()
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage('Data deve estar no formato YYYY-MM-DD')
    .custom((value) => {
      if (value) {
        const date = new Date(value);
        if (isNaN(date.getTime())) {
          throw new Error('Data inválida');
        }
      }
      return true;
    }),
  
  body('time')
    .optional()
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Hora deve estar no formato HH:MM'),
  
  body('price')
    .optional()
    .isNumeric()
    .withMessage('Preço deve ser um número')
    .custom((value) => {
      if (value !== undefined && parseFloat(value) < 0) {
        throw new Error('Preço deve ser maior ou igual a 0');
      }
      return true;
    }),

  body('distancia')
    .optional()
    .isNumeric()
    .withMessage('Distância deve ser um número')
    .custom((value) => {
      if (value !== undefined && value !== null && value !== '') {
        const num = parseFloat(value);
        if (num <= 0) {
          throw new Error('Distância deve ser maior que 0');
        }
        // Verifica se tem no máximo 2 casas decimais
        if (!/^\d+(\.\d{1,2})?$/.test(value.toString())) {
          throw new Error('Distância deve ter no máximo 2 casas decimais');
        }
      }
      return true;
    }),
  
  body('urlInscricao')
    .optional()
    .custom((value) => {
      if (value && value.trim() !== '') {
        const urlRegex = /^https?:\/\/.+/;
        if (!urlRegex.test(value)) {
          throw new Error('URL de inscrição deve ser válida');
        }
      }
      return true;
    }),
  
  body('status')
    .optional()
    .isIn(['inscrito', 'pretendo_ir', 'concluido', 'na_duvida', 'cancelada', 'nao_pude_ir'])
    .withMessage('Status deve ser: inscrito, pretendo_ir, concluido, na_duvida, cancelada ou nao_pude_ir'),
  
  body('tempoConlusao')
    .optional()
    .custom((value) => {
      if (!value || value.trim() === '') return true;
      return /^([01]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/.test(value);
    })
    .withMessage('Tempo de conclusão deve estar no formato HH:MM:SS'),
  
  handleValidationErrors
];