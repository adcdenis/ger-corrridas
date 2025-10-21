// Função para obter informações de versão e copyright
export const getAppInfo = () => {
  // Informações obtidas do package.json via Vite
  const appInfo = {
    name: 'Gerenciador de Corridas',
    version: __APP_VERSION__ || '1.0.0', // Fallback para desenvolvimento
    description: 'Sistema de gerenciamento de corridas',
    author: 'Desenvolvido com ❤️',
    year: new Date().getFullYear(),
  };

  return appInfo;
};

// Função para formatar o copyright
export const getCopyright = () => {
  const { year, author } = getAppInfo();
  return `© ${year} ${author}`;
};

// Função para obter versão formatada
export const getVersionInfo = () => {
  const { name, version } = getAppInfo();
  return `${name} v${version}`;
};