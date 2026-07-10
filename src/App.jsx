import { useState, useCallback, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import BottomNav from './components/Layout/BottomNav';
import TopBar from './components/Layout/TopBar';
import DashboardPage from './components/Dashboard/DashboardPage';
import PantryPage from './components/Pantry/PantryPage';
import AddItemPage from './components/AddItem/AddItemPage';
import RecipesPage from './components/Recipes/RecipesPage';
import AnalyticsPage from './components/Analytics/AnalyticsPage';
import SettingsPage from './components/Settings/SettingsPage';
import FridgeScannerPage from './components/Scanner/FridgeScannerPage';
import HealthInsightsPage from './components/Health/HealthInsightsPage';
import { ToastContainer, useToast } from './components/Toast';
import { loadInventory } from './services/storage';
import { playPopSound } from './utils/audio';
import Beams from './components/Beams/Beams';

import { Leaf } from 'lucide-react';

function AppShell() {
  const [inventory, setInventory] = useState(() => loadInventory());
  const [showSplash, setShowSplash] = useState(true);
  const { toasts, addToast } = useToast();
  const location = useLocation();

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2200);
    
    // Global click listener for UI micro-interactions (sound effects)
    const handleGlobalClick = (e) => {
      const target = e.target.closest('button, a, .glass-card, .ai-feature-card, .nav-item');
      if (target) {
        playPopSound();
      }
    };
    document.addEventListener('pointerdown', handleGlobalClick);
    
    return () => {
      clearTimeout(timer);
      document.removeEventListener('pointerdown', handleGlobalClick);
    };
  }, []);

  const refresh = useCallback(() => {
    setInventory(loadInventory());
  }, []);

  const urgentCount = inventory.filter(i => !i.isUsed && !i.isWasted && i.status === 'urgent').length;

  if (showSplash) {
    return (
      <div className="splash-screen">
        <div className="splash-logo-container">
          <Leaf size={48} color="var(--green-400)" className="splash-icon" />
          <h1 className="splash-title">Green<span style={{ color: 'var(--green-400)' }}>Bite</span></h1>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell fade-in">
      {/* AI Beams Background */}
      <div className="aurora-bg">
        <div className="aurora-grid" style={{ zIndex: 1 }} />
        <div style={{ position: 'absolute', inset: 0, opacity: 0.8, zIndex: 0 }}>
          <Beams
            beamWidth={3}
            beamHeight={20}
            beamNumber={15}
            lightColor="#10b981"
            speed={1.5}
            noiseIntensity={2.0}
            scale={0.15}
            rotation={15}
          />
        </div>
      </div>

      {/* Top Bar */}
      <TopBar urgentCount={urgentCount} />

      {/* Page Content */}
      <div className="page-wrapper">
        <div className="page-inner">
          <Routes location={location}>
            <Route path="/" element={<DashboardPage inventory={inventory} onRefresh={refresh} addToast={addToast} />} />
            <Route path="/pantry" element={<PantryPage inventory={inventory} onRefresh={refresh} addToast={addToast} />} />
            <Route path="/add" element={<AddItemPage onRefresh={refresh} addToast={addToast} />} />
            <Route path="/scan" element={<FridgeScannerPage onRefresh={refresh} addToast={addToast} />} />
            <Route path="/recipes" element={<RecipesPage inventory={inventory} addToast={addToast} />} />
            <Route path="/analytics" element={<AnalyticsPage inventory={inventory} />} />
            <Route path="/health" element={<HealthInsightsPage inventory={inventory} onRefresh={refresh} />} />
            <Route path="/settings" element={<SettingsPage onRefresh={refresh} addToast={addToast} />} />
          </Routes>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav urgentCount={urgentCount} />

      {/* Toasts */}
      <ToastContainer toasts={toasts} />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}
