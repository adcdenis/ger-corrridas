import React, { useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, LogIn, Mail, Lock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { GoogleLoginButton } from '../components/GoogleLoginButton';
import type { LoginData } from '@/types';

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email é obrigatório')
    .email('Email inválido'),
  password: z
    .string()
    .min(1, 'Senha é obrigatória')
    .min(6, 'Senha deve ter pelo menos 6 caracteres'),
});

export const Login: React.FC = () => {
  const { login, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
  });

  // Se já autenticado, redirecionar
  if (isAuthenticated) {
    const from = location.state?.from?.pathname || '/dashboard';
    return <Navigate to={from} replace />;
  }

  const onSubmit = async (data: LoginData) => {
    try {
      await login(data);
    } catch (error) {
      // Erro já tratado no contexto
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-6 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Card principal com sombra e bordas arredondadas */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl border border-gray-100 p-6 sm:p-8 space-y-6 sm:space-y-8 animate-fade-in">
          <div className="text-center">
            {/* Logo/Ícone melhorado */}
            <div className="mx-auto h-12 w-12 sm:h-16 sm:w-16 flex items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg">
              <LogIn className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            
            {/* Título principal */}
            <h2 className="mt-4 sm:mt-6 text-center text-2xl sm:text-3xl font-bold text-gray-900">
              Bem-vindo de volta!
            </h2>
            <p className="mt-2 text-center text-sm sm:text-base text-gray-600 px-2">
              Entre na sua conta para gerenciar suas corridas
            </p>
            
            {/* Link para registro */}
            <p className="mt-3 sm:mt-4 text-center text-xs sm:text-sm">
              Não tem uma conta?{' '}
              <Link
                to="/register"
                className="font-semibold text-blue-600 hover:text-blue-500 transition-colors duration-200"
              >
                Cadastre-se aqui
              </Link>
            </p>
          </div>

          <form className="space-y-5 sm:space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4 sm:space-y-5">
              {/* Campo de Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                  </div>
                  <input
                    {...register('email')}
                    type="email"
                    autoComplete="email"
                    className={`w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 border rounded-lg sm:rounded-xl text-sm sm:text-base text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                      errors.email 
                        ? 'border-red-300 bg-red-50 focus:ring-red-500' 
                        : 'border-gray-300 bg-gray-50 hover:bg-white focus:bg-white'
                    }`}
                    placeholder="seu@email.com"
                  />
                </div>
                {errors.email && (
                  <p className="mt-2 text-xs sm:text-sm text-red-600 flex items-center">
                    <span className="inline-block w-1 h-1 bg-red-600 rounded-full mr-2"></span>
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Campo de Senha */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Senha
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                  </div>
                  <input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    className={`w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-2.5 sm:py-3 border rounded-lg sm:rounded-xl text-sm sm:text-base text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                      errors.password 
                        ? 'border-red-300 bg-red-50 focus:ring-red-500' 
                        : 'border-gray-300 bg-gray-50 hover:bg-white focus:bg-white'
                    }`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 sm:pr-4 flex items-center hover:bg-gray-100 rounded-r-lg sm:rounded-r-xl transition-colors duration-200"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-2 text-xs sm:text-sm text-red-600 flex items-center">
                    <span className="inline-block w-1 h-1 bg-red-600 rounded-full mr-2"></span>
                    {errors.password.message}
                  </p>
                )}
              </div>
            </div>

            {/* Botão de Login */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="group relative w-full flex justify-center py-3 sm:py-3.5 px-4 border border-transparent text-sm sm:text-base font-semibold rounded-lg sm:rounded-xl text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white mr-2 sm:mr-3"></div>
                    <span className="text-sm sm:text-base">Entrando...</span>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <LogIn className="h-4 w-4 sm:h-5 sm:w-5 mr-2 group-hover:translate-x-1 transition-transform duration-200" />
                    <span className="text-sm sm:text-base">Entrar</span>
                  </div>
                )}
              </button>
            </div>

            {/* Divisor */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">ou</span>
              </div>
            </div>

            {/* Botão de Login com Google */}
            <div>
              <GoogleLoginButton />
            </div>

            {/* Link para Registro */}
            <div className="text-center pt-3 sm:pt-4">
              <p className="text-xs sm:text-sm text-gray-600">
                Não tem uma conta?{' '}
                <Link 
                  to="/register" 
                  className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200 hover:underline"
                >
                  Crie uma nova conta
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};