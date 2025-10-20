// Função para obter informações de versão e copyright
export const getAppInfo = () => {
  // Informações estáticas baseadas no package.json
  const appInfo = {
    name: 'Gerenciador de Corridas',
    version: '1.0.0',
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