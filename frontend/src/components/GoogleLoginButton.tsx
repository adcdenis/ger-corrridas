import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

interface GoogleLoginButtonProps {
  onSuccess?: () => void;
  onError?: () => void;
}

export const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({
  onSuccess,
  onError
}) => {
  const { login } = useAuth();

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      if (!credentialResponse.credential) {
        toast.error('Erro ao obter credenciais do Google');
        onError?.();
        return;
      }

      // Fazer login com o token do Google
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: credentialResponse.credential,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Salvar token e dados do usuário
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        
        toast.success('Login com Google realizado com sucesso!');
        onSuccess?.();
        
        // Recarregar a página para atualizar o contexto de autenticação
        window.location.reload();
      } else {
        toast.error(data.message || 'Erro ao fazer login com Google');
        onError?.();
      }
    } catch (error) {
      console.error('Erro no login com Google:', error);
      toast.error('Erro ao fazer login com Google');
      onError?.();
    }
  };

  const handleGoogleError = () => {
    console.error('Erro no login com Google');
    toast.error('Erro ao fazer login com Google');
    onError?.();
  };

  return (
    <div className="w-full">
      <GoogleLogin
        onSuccess={handleGoogleSuccess}
        onError={handleGoogleError}
        useOneTap={false}
        theme="outline"
        size="large"
        width="100%"
        text="signin_with"
        shape="rectangular"
      />
    </div>
  );
};