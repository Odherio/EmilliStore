import { AdminConfig } from './pages/admin/Config'
import { AdminFinanceiro } from './pages/admin/Financeiro'
import { AdminDashboard } from './pages/admin/Dashboard'
import { AdminProdutos } from './pages/admin/Produtos'
import { AdminPedidos } from './pages/admin/Pedidos'
import { AdminLayout } from './pages/admin/Layout'
import { AdminLoginPage } from './pages/admin/Login'
import { LojaPage } from './pages/Loja'
import { StoreProvider } from './context/StoreContext'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

export default function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LojaPage />} />
          <Route path="/loja" element={<Navigate to="/" replace />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="produtos" element={<AdminProdutos />} />
            <Route path="pedidos" element={<AdminPedidos />} />
            <Route path="financeiro" element={<AdminFinanceiro />} />
            <Route path="config" element={<AdminConfig />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </StoreProvider>
  )
}
