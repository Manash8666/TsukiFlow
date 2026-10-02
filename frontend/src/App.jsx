import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import ProductionPlan from './pages/ProductionPlan';
import InventoryLevels from './pages/InventoryLevels';
import ProcurementWaste from './pages/Procurement';
import EngineeringBilling from './pages/EngineeringBilling';
import ProductQuality from './pages/ProductQuality';
import EquipmentHealth from './pages/EquipmentHealth';
import ReportsAnalytics from './pages/ReportsAnalytics';
import SystemDiagnostics from './pages/SystemDiagnostics';
import WorkerKiosk from './pages/WorkerKiosk';
import Login from './pages/Login';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/*" element={
          <ProtectedRoute>
            <Layout>
              <ErrorBoundary>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
            <Route path="/production-plan" element={<ProductionPlan />} />
            <Route path="/inventory-levels" element={<InventoryLevels />} />
            <Route path="/procurement" element={<ProcurementWaste />} />
            <Route path="/engineering" element={<EngineeringBilling />} />
            <Route path="/product-quality" element={<ProductQuality />} />
            <Route path="/equipment" element={<EquipmentHealth />} />
            <Route path="/reports" element={<ReportsAnalytics />} />
                  <Route path="/diagnostics" element={<SystemDiagnostics />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </ErrorBoundary>
            </Layout>
          </ProtectedRoute>
        } />
        
        {/* Kiosk Mode is accessed on tablets on the factory floor */}
        <Route path="/kiosk" element={<WorkerKiosk />} />
      </Routes>
    </Router>
  );
}

export default App;
