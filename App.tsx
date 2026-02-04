
import React, { useState, useCallback, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { RoadmapDetail } from './components/RoadmapDetail';
import { PricingPage } from './components/PricingPage';
import { SettingsPage } from './components/SettingsPage';
import { LoginPage } from './components/LoginPage';
import type { Page } from './types';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import { PublicRoadmapPage } from './components/PublicRoadmapPage';

const AppContent: React.FC = () => {
  const { currentUser, isGuest } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [selectedRoadmapId, setSelectedRoadmapId] = useState<string | null>(null);
  const [publicShareId, setPublicShareId] = useState<string | null>(null);

  useEffect(() => {
    const path = window.location.pathname;
    if (path.startsWith('/share/')) {
      const shareId = path.split('/')[2];
      if (shareId) {
        setPublicShareId(shareId);
      }
    }
  }, []);

  const handleSelectRoadmap = useCallback((id: string) => {
    setSelectedRoadmapId(id);
    setCurrentPage('roadmapDetail');
  }, []);

  const navigateTo = useCallback((page: Page) => {
    setCurrentPage(page);
    if (page !== 'roadmapDetail') {
      setSelectedRoadmapId(null);
    }
  }, []);

  if (publicShareId) {
    return <PublicRoadmapPage shareId={publicShareId} />
  }

  console.log('App Render:', { currentUser, isGuest, currentPage });



  const renderContent = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onSelectRoadmap={handleSelectRoadmap} />;
      case 'yourRoadmaps':
        return <Dashboard onSelectRoadmap={handleSelectRoadmap} showOnlyUserRoadmaps={true} />;
      case 'roadmapDetail':
        if (selectedRoadmapId) {
          return <RoadmapDetail roadmapId={selectedRoadmapId} onBack={() => navigateTo('dashboard')} />;
        }
        // Fallback to dashboard if no roadmap is selected
        navigateTo('dashboard');
        return <Dashboard onSelectRoadmap={handleSelectRoadmap} />;
      case 'pricing':
        return <PricingPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <Dashboard onSelectRoadmap={handleSelectRoadmap} />;
    }
  };

  return (
    <Layout currentPage={currentPage} navigateTo={navigateTo}>
      {renderContent()}
    </Layout>
  );
};


const App: React.FC = () => {
  return (
    <AuthProvider>
      <DataProvider>
        <AppContent />
      </DataProvider>
    </AuthProvider>
  );
}

export default App;