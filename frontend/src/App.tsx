import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Races } from './pages/Races';
import { Statistics } from './pages/Statistics';
import { MindMap } from './pages/MindMap';
import { ImportExportPage } from './pages/ImportExportPage';
import { Reports } from './pages/Reports';

// Criar cliente do React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="App">
            <Routes>
              {/* Rotas públicas */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Rotas protegidas */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Dashboard />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/races"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Races />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/stats"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Statistics />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/mindmap"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <MindMap />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/import-export"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <ImportExportPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reports"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Reports />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              
              {/* Rota padrão */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              
              {/* Rota 404 */}
              <Route
                path="*"
                element={
                  <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                      <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                      <p className="text-gray-600 mb-4">Página não encontrada</p>
                      <a href="/" className="text-blue-600 hover:text-blue-500">
                        Voltar ao início
                      </a>
                    </div>
                  </div>
                }
              />
            </Routes>
            
            {/* Toast notifications */}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#10b981',
                    secondary: '#fff',
                  },
                },
                error: {
                  duration: 5000,
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
