import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import ProductionPlan from './pages/ProductionPlan';
import InventoryLevels from './pages/InventoryLevels';
import ProductQuality from './pages/ProductQuality';
import EquipmentHealth from './pages/EquipmentHealth';
import ReportsAnalytics from './pages/ReportsAnalytics';
import SystemDiagnostics from './pages/SystemDiagnostics';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/*" element={
          <ProtectedRoute>
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
          <Route path="/production-plan" element={<ProductionPlan />} />
          <Route path="/inventory-levels" element={<InventoryLevels />} />
          <Route path="/product-quality" element={<ProductQuality />} />
          <Route path="/equipment" element={<EquipmentHealth />} />
          <Route path="/reports" element={<ReportsAnalytics />} />
                <Route path="/diagnostics" element={<SystemDiagnostics />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;
