
# 📱 **PROMPT COMPLETO: Sistema de Gerenciamento de Corridas - React Native + SQLite**

## 🎯 **VISÃO GERAL DO SISTEMA**

Crie um aplicativo móvel completo em **React Native** para gerenciamento pessoal de corridas esportivas, utilizando **SQLite** como banco de dados local. O sistema deve replicar todas as funcionalidades da versão web atual, adaptadas para dispositivos móveis.

## 🏗️ **ARQUITETURA E TECNOLOGIAS**

### **Stack Tecnológica:**
- **Frontend:** React Native (Expo ou CLI)
- **Banco de Dados:** SQLite (react-native-sqlite-storage ou expo-sqlite)
- **Navegação:** React Navigation v6
- **Formulários:** React Hook Form + Zod
- **Estado Global:** Context API ou Redux Toolkit
- **UI/Styling:** NativeBase, React Native Elements ou Styled Components
- **Notificações:** React Native Toast ou similar
- **Ícones:** React Native Vector Icons
- **Autenticação:** AsyncStorage para persistência local

### **Estrutura de Pastas:**
```
src/
├── components/          # Componentes reutilizáveis
├── screens/            # Telas da aplicação
├── navigation/         # Configuração de navegação
├── contexts/           # Contextos React
├── services/           # Serviços (SQLite, API)
├── database/           # Configuração e schemas SQLite
├── types/              # Definições TypeScript
├── utils/              # Utilitários
└── constants/          # Constantes da aplicação
```

## 🗄️ **ESQUEMA DO BANCO DE DADOS SQLite**

### **Tabela: users**
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT DEFAULT 'user' CHECK(role IN ('user', 'admin')),
  avatar TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### **Tabela: races**
```sql
CREATE TABLE races (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  date TEXT NOT NULL, -- Format: YYYY-MM-DD
  time TEXT NOT NULL, -- Format: HH:MM
  price REAL NOT NULL DEFAULT 0,
  distancia REAL NOT NULL, -- Distance in kilometers (2 decimal places)
  url_inscricao TEXT,
  status TEXT NOT NULL CHECK(status IN ('inscrito', 'pretendo_ir', 'concluido', 'na_duvida', 'cancelada', 'nao_pude_ir')),
  tempo_conclusao TEXT, -- Format: HH:MM:SS
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);
```

### **Índices para Performance:**
```sql
CREATE INDEX idx_races_user_id ON races(user_id);
CREATE INDEX idx_races_date ON races(date);
CREATE INDEX idx_races_status ON races(status);
CREATE INDEX idx_races_user_date ON races(user_id, date);
```

## 📱 **TELAS E FUNCIONALIDADES**

### **1. 🔐 Tela de Autenticação (Login/Registro)**

**Funcionalidades:**
- Login com email/senha
- Registro de nova conta
- Validação de formulários com Zod
- Persistência de sessão com AsyncStorage
- Feedback visual de loading e erros
- Opção "Lembrar-me"

**Campos de Login:**
- Email (obrigatório, validação de formato)
- Senha (mínimo 6 caracteres)

**Campos de Registro:**
- Nome (2-100 caracteres)
- Email (único, validação de formato)
- Senha (6-100 caracteres)
- Confirmação de senha

### **2. 🏠 Dashboard Principal**

**Componentes e Métricas:**
- **Cards de Estatísticas:**
  - Total de corridas cadastradas
  - Total gasto em inscrições (R$)
  - Distância total percorrida (km)
  - Corridas concluídas vs. total

- **Gráficos e Visualizações:**
  - Gráfico de barras: corridas por status
  - Gráfico de linha: evolução mensal
  - Distribuição de gastos por mês

- **Corridas Próximas (Inscritas):**
  - Lista das próximas 5 corridas
  - Countdown para cada corrida
  - Acesso rápido aos detalhes

- **Corridas Recentes (Concluídas):**
  - Últimas 5 corridas finalizadas
  - Tempo de conclusão
  - Link para certificado/resultado

**Filtros:**
- Seletor de ano
- Atualização automática dos dados

### **3. 🏃‍♂️ Gerenciamento de Corridas**

**Lista de Corridas:**
- **Visualização Responsiva:**
  - Cards em dispositivos móveis
  - Informações condensadas mas completas
  
- **Informações Exibidas:**
  - Nome da corrida
  - Data e horário
  - Distância (km)
  - Preço (R$)
  - Status com cores distintivas
  - Tempo de conclusão (se concluída)
  - Link para inscrição

**Formulário de Corrida:**
- **Campos:**
  - Nome da corrida (obrigatório, máx. 200 chars)
  - Data (seletor de data nativo)
  - Horário (seletor de hora nativo)
  - Preço (input numérico, R$)
  - Distância (numérico, 2 casas decimais, km)
  - URL de inscrição (opcional, validação de URL)
  - Status (seletor com opções)
  - Tempo de conclusão (formato HH:MM:SS, opcional)

**Status Disponíveis:**
- 🔵 Inscrito
- 🟡 Pretendo Ir
- 🟢 Concluído
- 🟠 Na Dúvida
- 🔴 Cancelada
- ⚫ Não Pude Ir

**Ações:**
- ➕ Adicionar nova corrida (FAB - Floating Action Button)
- ✏️ Editar corrida existente
- 🗑️ Excluir corrida (com confirmação)
- 🔗 Abrir link de inscrição (navegador externo)

**Funcionalidades Especiais:**
- Ocultação da lista durante edição/adição
- Botão flutuante (FAB) para nova corrida
- Confirmação antes de excluir
- Validação completa de dados

### **4. 📊 Estatísticas Avançadas**

**Métricas Detalhadas:**
- **Por Status:**
  - Quantidade e percentual de cada status
  - Valor total gasto por status
  - Distância total por status

- **Por Período:**
  - Estatísticas mensais/anuais
  - Comparativo entre anos
  - Tendências e evolução

- **Análises:**
  - Corrida mais cara/barata
  - Maior/menor distância
  - Tempo médio de conclusão
  - Taxa de conclusão (%)

**Visualizações:**
- Gráficos de pizza (distribuição por status)
- Gráficos de barras (comparativos mensais)
- Cards com métricas principais
- Tabelas detalhadas

### **5. 🗺️ Mapa Mental (Timeline)**

**Organização Visual:**
- **Por Ano:** Seletor de ano
- **Por Mês:** Expansão/colapso de meses
- **Linha do Tempo:** Corridas organizadas cronologicamente

**Funcionalidades:**
- Navegação entre anos
- Expansão/colapso de meses
- Visualização hierárquica
- Acesso rápido aos detalhes
- Indicadores visuais de status

### **6. 📈 Relatórios**

**Tipos de Relatórios:**
- **Por Período:** Mensal, trimestral, anual
- **Por Status:** Filtros específicos
- **Personalizado:** Intervalo de datas customizado

**Funcionalidades:**
- Filtros avançados
- Exportação para Excel/CSV
- Compartilhamento de relatórios
- Visualização em tabelas
- Resumos executivos

### **7. 📤📥 Importação/Exportação**

**Exportação:**
- Formato Excel (.xlsx)
- Formato CSV
- Todos os dados ou filtrados
- Compartilhamento via apps nativos

**Importação:**
- Suporte a Excel/CSV
- Mapeamento automático de campos
- Validação de dados
- Preview antes da importação
- Tratamento de erros

**Formatos Suportados:**
```json
{
  "name": "Nome da Corrida",
  "date": "2024-12-31",
  "time": "08:00",
  "price": 150.00,
  "distancia": 21.10,
  "urlInscricao": "https://...",
  "status": "inscrito",
  "tempoConclusao": "01:45:30"
}
```

### **8. 👥 Gerenciamento de Usuários (Admin)**

**Funcionalidades de Admin:**
- Lista de todos os usuários
- Visualização de estatísticas por usuário
- Exclusão de usuários
- Controle de permissões
- Auditoria de ações

**Informações Exibidas:**
- Nome e email
- Data de cadastro
- Número de corridas
- Última atividade
- Role (user/admin)

## 🎨 **DESIGN E UX/UI**

### **Tema e Cores:**
- **Primária:** Azul (#3B82F6)
- **Secundária:** Verde (#10B981)
- **Sucesso:** Verde (#22C55E)
- **Aviso:** Amarelo (#F59E0B)
- **Erro:** Vermelho (#EF4444)
- **Neutro:** Cinza (#6B7280)

### **Componentes de UI:**
- **Cards:** Elevação sutil, bordas arredondadas
- **Botões:** Primários, secundários, FAB
- **Inputs:** Bordas arredondadas, validação visual
- **Badges:** Status coloridos
- **Modais:** Confirmações e formulários
- **Loading:** Spinners e skeletons
- **Toast:** Notificações não-intrusivas

### **Responsividade:**
- Adaptação para diferentes tamanhos de tela
- Orientação portrait/landscape
- Safe Area para dispositivos com notch
- Densidade de pixels variável

### **Navegação:**
- **Tab Navigation:** Telas principais
- **Stack Navigation:** Fluxos específicos
- **Drawer Navigation:** Menu lateral (opcional)

**Estrutura de Navegação:**
```
TabNavigator:
├── Dashboard
├── Corridas
├── Estatísticas
├── Relatórios
└── Perfil
    ├── Configurações
    ├── Import/Export
    ├── Usuários (Admin)
    └── Logout
```

## ⚙️ **FUNCIONALIDADES TÉCNICAS**

### **Gerenciamento de Estado:**
```typescript
interface AppState {
  auth: {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
  };
  races: {
    list: Race[];
    loading: boolean;
    filters: RaceFilters;
  };
  statistics: {
    data: StatisticsData;
    loading: boolean;
  };
}
```

### **Validações com Zod:**
```typescript
const raceSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(200),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
  price: z.number().min(0),
  distancia: z.number().min(0.01).refine(val => 
    /^\d+(\.\d{1,2})?$/.test(val.toString())
  ),
  urlInscricao: z.string().url().optional().or(z.literal('')),
  status: z.enum(['inscrito', 'pretendo_ir', 'concluido', 'na_duvida', 'cancelada', 'nao_pude_ir']),
  tempoConclusao: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/).optional()
});
```

### **Serviços SQLite:**
```typescript
class DatabaseService {
  async createRace(race: CreateRaceData): Promise<Race>
  async getRaces(filters?: RaceFilters): Promise<Race[]>
  async updateRace(id: number, data: UpdateRaceData): Promise<Race>
  async deleteRace(id: number): Promise<void>
  async getRaceStats(year?: string): Promise<RaceStats>
  async exportRaces(): Promise<Race[]>
  async importRaces(races: ImportRaceData[]): Promise<void>
}
```

### **Persistência de Dados:**
- SQLite para dados principais
- AsyncStorage para configurações e cache
- Backup automático dos dados
- Sincronização offline-first

### **Performance:**
- Lazy loading de telas
- Paginação de listas grandes
- Cache de consultas frequentes
- Otimização de imagens
- Debounce em buscas

## 🔧 **CONFIGURAÇÕES E RECURSOS EXTRAS**

### **Configurações do App:**
- Tema claro/escuro
- Notificações push (lembretes de corridas)
- Backup/restore de dados
- Configurações de privacidade
- Sobre o aplicativo

### **Recursos Nativos:**
- **Câmera:** Foto de perfil
- **Galeria:** Seleção de imagens
- **Calendário:** Integração com eventos
- **Compartilhamento:** Dados e relatórios
- **Deep Links:** Navegação externa
- **Biometria:** Autenticação segura (opcional)

### **Notificações:**
- Lembrete de corridas próximas
- Confirmação de ações importantes
- Feedback de operações
- Alertas de backup

### **Acessibilidade:**
- Screen reader support
- Contraste adequado
- Tamanhos de fonte ajustáveis
- Navegação por teclado
- Descrições de imagens

## 📋 **REQUISITOS DE IMPLEMENTAÇÃO**

### **Obrigatórios:**
1. ✅ Todas as funcionalidades da versão web
2. ✅ Interface nativa e responsiva
3. ✅ Banco SQLite local
4. ✅ Validação completa de dados
5. ✅ Navegação fluida
6. ✅ Feedback visual adequado
7. ✅ Tratamento de erros
8. ✅ Performance otimizada

### **Desejáveis:**
1. 🎯 Animações suaves
2. 🎯 Tema escuro
3. 🎯 Notificações push
4. 🎯 Backup na nuvem
5. 🎯 Widgets nativos
6. 🎯 Integração com calendário
7. 🎯 Compartilhamento social

### **Estrutura de Entrega:**
1. **Setup inicial** com navegação básica
2. **Autenticação** completa
3. **CRUD de corridas** com todas as validações
4. **Dashboard** com estatísticas
5. **Telas complementares** (relatórios, import/export)
6. **Polimento** e otimizações finais

---

**🎯 OBJETIVO FINAL:** Criar um aplicativo móvel completo, intuitivo e performático que permita aos usuários gerenciar suas corridas esportivas de forma eficiente, mantendo todos os dados localmente no dispositivo através do SQLite, com interface nativa e experiência de usuário superior.
        
            
toolName: todo_write
            
status: success
          
Todos updated: 5 items
          
## ✅ **Prompt Completo Criado com Sucesso!**

Criei um prompt extremamente detalhado e abrangente que inclui **todas as características, telas e recursos** do sistema atual, especificamente adaptado para **React Native com SQLite**. 

### 🎯 **O que foi incluído:**

1. **📋 Análise Completa do Sistema Atual:**
   - Todas as 8 telas principais (Login, Dashboard, Corridas, Estatísticas, MindMap, Relatórios, Import/Export, Usuários)
   - Funcionalidades detalhadas de cada componente
   - Estrutura de dados e validações

2. **🗄️ Esquema Completo do SQLite:**
   - Tabelas `users` e `races` com todos os campos
   - Índices para performance
   - Relacionamentos e constraints
   - Migração da estrutura MongoDB para SQLite

3. **📱 Especificações React Native:**
   - Stack tecnológica completa
   - Estrutura de pastas recomendada
   - Navegação com React Navigation
   - Componentes nativos específicos

4. **🎨 Design e UX/UI:**
   - Paleta de cores definida
   - Componentes de interface
   - Responsividade mobile
   - Padrões de navegação

5. **⚙️ Funcionalidades Técnicas:**
   - Gerenciamento de estado
   - Validações com Zod
   - Serviços SQLite
   - Performance e otimizações

6. **🔧 Recursos Nativos:**
   - Integração com câmera/galeria
   - Notificações push
   - Compartilhamento
   - Acessibilidade

### 📋 **Estrutura de Entrega Sugerida:**
O prompt inclui uma sequência lógica de implementação em 6 fases, desde o setup inicial até o polimento final.

Este prompt pode ser usado diretamente com qualquer IA de desenvolvimento para gerar um aplicativo React Native completo que replica **100% das funcionalidades** do sistema web atual, adaptado para dispositivos móveis com banco de dados SQLite local.
        