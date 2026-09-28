import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
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
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/production-plan" element={<ProductionPlan />} />
          <Route path="/inventory-levels" element={<InventoryLevels />} />
          <Route path="/product-quality" element={<ProductQuality />} />
          <Route path="/equipment" element={<EquipmentHealth />} />
          <Route path="/reports" element={<ReportsAnalytics />} />
          <Route path="/diagnostics" element={<SystemDiagnostics />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
