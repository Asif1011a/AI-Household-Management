import { useState, useCallback, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import BottomNav from './components/Layout/BottomNav';
import TopBar from './components/Layout/TopBar';
import Sidebar from './components/Layout/Sidebar';
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
import LoginPage from './components/Auth/LoginPage';
import { getCurrentUser } from './services/storage';

import { Leaf } from 'lucide-react';

function AppShell() {
  const [inventory, setInventory] = useState(() => loadInventory());
  const [showSplash, setShowSplash] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!getCurrentUser());
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

  const handleLogin = useCallback(() => {
    setIsAuthenticated(true);
    setInventory(loadInventory());
  }, []);

  const urgentCount = inventory.filter(i => !i.isUsed && !i.isWasted && i.status === 'urgent').length;

  if (showSplash) {
    return (
      <div className="splash-screen">
        <div className="splash-logo-container">
          <Leaf size={48} color="var(--primary-400)" className="splash-icon" />
          <h1 className="splash-title">Green<span style={{ color: 'var(--primary-400)' }}>Bite</span></h1>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell fade-in">
      <div className="aurora-bg">
        <div className="aurora-grid" style={{ zIndex: 1 }} />
      </div>

      {!isAuthenticated ? (
        <LoginPage onLogin={handleLogin} />
      ) : (
        <>
          {/* Desktop Sidebar (hidden on mobile) */}
          <div className="hide-on-mobile" style={{ height: '100%' }}>
            <Sidebar urgentCount={urgentCount} />
          </div>

          <div className="main-content-column">
            {/* Top Bar (only shows logo on mobile, actions global) */}
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

            {/* Bottom Navigation (hidden on desktop) */}
            <div className="hide-on-desktop">
              <BottomNav urgentCount={urgentCount} />
            </div>
          </div>
        </>
      )}

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
