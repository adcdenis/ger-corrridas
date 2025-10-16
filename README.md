# Gerenciador de Corridas

Sistema completo para gerenciamento de corridas com React + Node.js + MongoDB.

## 🚀 Deploy no Vercel

### Pré-requisitos

1. Conta no [Vercel](https://vercel.com)
2. Conta no [MongoDB Atlas](https://www.mongodb.com/atlas)
3. Repositório no GitHub com o código

### 📋 Passo a Passo para Deploy

#### 1. Deploy do Backend

1. **Acesse o Vercel Dashboard** e clique em "New Project"
2. **Importe seu repositório** do GitHub
3. **Configure o projeto:**
   - **Framework Preset:** Other
   - **Root Directory:** `backend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

4. **Configure as variáveis de ambiente:**
   ```
   NODE_ENV=production
   PORT=5000
   MONGODB_URI=sua_string_de_conexao_mongodb_atlas
   JWT_SECRET=seu_jwt_secret_super_seguro_para_producao
   FRONTEND_URL=https://seu-frontend.vercel.app
   ```

5. **Deploy** - O Vercel irá gerar uma URL como `https://seu-backend.vercel.app`

#### 2. Deploy do Frontend

1. **Crie um novo projeto** no Vercel
2. **Importe o mesmo repositório**
3. **Configure o projeto:**
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

4. **Configure as variáveis de ambiente:**
   ```
   VITE_API_URL=https://seu-backend.vercel.app/api
   ```

5. **Deploy** - O Vercel irá gerar uma URL como `https://seu-frontend.vercel.app`

#### 3. Atualizar Configurações

1. **Atualize o CORS no backend:**
   - Vá para o projeto backend no Vercel
   - Atualize a variável `FRONTEND_URL` com a URL real do frontend
   - Redeploy o backend

2. **Teste a aplicação:**
   - Acesse a URL do frontend
   - Teste login, cadastro e funcionalidades

### 🔧 Configurações Importantes

#### Backend (`backend/vercel.json`)
```json
{
  "version": 2,
  "builds": [
    {
      "src": "src/server.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "src/server.ts"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

#### Frontend (`frontend/vercel.json`)
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### 🔐 Variáveis de Ambiente

#### Backend
- `NODE_ENV`: production
- `PORT`: 5000
- `MONGODB_URI`: String de conexão do MongoDB Atlas
- `JWT_SECRET`: Chave secreta para JWT (use um valor seguro)
- `FRONTEND_URL`: URL do frontend em produção

#### Frontend
- `VITE_API_URL`: URL da API backend em produção

### 📝 Notas Importantes

1. **MongoDB Atlas:** Certifique-se de que o IP do Vercel está liberado (use 0.0.0.0/0 para permitir todos)
2. **CORS:** O backend está configurado para aceitar requisições do frontend automaticamente
3. **HTTPS:** Ambos os deployments usarão HTTPS automaticamente
4. **Domínio Customizado:** Você pode configurar domínios personalizados no Vercel

### 🐛 Troubleshooting

- **Erro de CORS:** Verifique se `FRONTEND_URL` está configurado corretamente no backend
- **Erro de Conexão:** Verifique se `VITE_API_URL` está configurado corretamente no frontend
- **Erro de MongoDB:** Verifique a string de conexão e permissões de IP no Atlas
- **Build Error:** Verifique se todas as dependências estão no `package.json`

### 🔄 Desenvolvimento Local

```bash
# Instalar dependências
npm run install:all

# Executar em desenvolvimento
npm run dev
```

### 📊 Funcionalidades

- ✅ Autenticação de usuários
- ✅ Gerenciamento de corridas
- ✅ Dashboard com estatísticas
- ✅ Filtros e pesquisa
- ✅ Responsivo
- ✅ Deploy automático no Vercel