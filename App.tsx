
import React, { useState, useCallback, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { RoadmapDetail } from './components/RoadmapDetail';
import { PricingPage } from './components/PricingPage';
import { SettingsPage } from './components/SettingsPage';
import { LoginPage } from './components/LoginPage';
import type { Page } from './types';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider, useData } from './contexts/DataContext';
import { PublicRoadmapPage } from './components/PublicRoadmapPage';
import { PlusIcon, SparklesIcon } from './components/icons/Icons';
import { NewRoadmapModal } from './components/NewRoadmapModal';
import { AIGenerationModal } from './components/AIGenerationModal';
import { AuthModal } from './components/AuthModal';
import { RazorpayModal } from './components/RazorpayModal';
import { SubscriptionStatus } from './types';

const AppContent: React.FC = () => {
  const { currentUser, upgradeSubscription } = useAuth();
  const { roadmaps, addRoadmap } = useData();
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [selectedRoadmapId, setSelectedRoadmapId] = useState<string | null>(null);
  const [publicShareId, setPublicShareId] = useState<string | null>(null);

  // States lifted from Dashboard
  const [searchTerm, setSearchTerm] = useState('');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMessage, setAuthModalMessage] = useState("");
  const [isNewRoadmapModalOpen, setIsNewRoadmapModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isRazorpayModalOpen, setIsRazorpayModalOpen] = useState(false);

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

  const checkLimitAndProceed = (action: () => void) => {
    const totalUserRoadmaps = roadmaps.filter(r => !r.isTemplate).length;
    if (currentUser?.subscriptionStatus === 'FREE' && totalUserRoadmaps >= 3) {
      setIsRazorpayModalOpen(true);
      return;
    }
    if (currentUser?.subscriptionStatus === 'PRO' && totalUserRoadmaps >= 5) {
      alert("You have reached the limit for Pro plan (5 roadmaps).");
      return;
    }
    action();
  };

  const requireAuth = useCallback((action: () => void, message: string) => {
    if (!currentUser) {
      setAuthModalMessage(message);
      setIsAuthModalOpen(true);
    } else {
      action();
    }
  }, [currentUser]);

  const handleGoHome = useCallback(() => {
    window.history.pushState({}, '', '/');
    setPublicShareId(null);
  }, []);

  if (publicShareId) {
    return <PublicRoadmapPage shareId={publicShareId} onHome={handleGoHome} />
  }

  const headerControls = (
    <div className="flex flex-col sm:flex-row w-full items-center gap-3">
      <div className="flex-1 w-full min-w-[300px]">
        <input
          type="text"
          placeholder="Search roadmaps..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-secondary text-secondary-foreground border border-border rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary h-9"
        />
      </div>
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <button
          onClick={() => requireAuth(() => checkLimitAndProceed(() => setIsNewRoadmapModalOpen(true)), "Sign in to create a new roadmap")}
          className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-secondary hover:bg-secondary/80 text-foreground font-medium py-2 px-3 text-sm rounded-md transition-colors whitespace-nowrap"
        >
          <PlusIcon className="w-4 h-4" />
          New
        </button>
        <button
          onClick={() => requireAuth(() => checkLimitAndProceed(() => setIsAiModalOpen(true)), "Sign in to use AI generation")}
          className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2 px-3 text-sm rounded-md transition-colors whitespace-nowrap"
        >
          <SparklesIcon className="w-4 h-4" />
          AI Generate
        </button>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onSelectRoadmap={handleSelectRoadmap} searchTerm={searchTerm} requireAuth={requireAuth} />;
      case 'yourRoadmaps':
        return <Dashboard onSelectRoadmap={handleSelectRoadmap} showOnlyUserRoadmaps={true} searchTerm={searchTerm} requireAuth={requireAuth} />;
      case 'roadmapDetail':
        if (selectedRoadmapId) {
          return <RoadmapDetail roadmapId={selectedRoadmapId} onBack={() => navigateTo('dashboard')} />;
        }
        navigateTo('dashboard');
        return <Dashboard onSelectRoadmap={handleSelectRoadmap} searchTerm={searchTerm} requireAuth={requireAuth} />;
      case 'pricing':
        return <PricingPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <Dashboard onSelectRoadmap={handleSelectRoadmap} searchTerm={searchTerm} requireAuth={requireAuth} />;
    }
  };

  return (
    <Layout
      currentPage={currentPage}
      navigateTo={navigateTo}
      headerControls={(currentPage === 'dashboard' || currentPage === 'yourRoadmaps') ? headerControls : undefined}
    >
      {renderContent()}

      <AIGenerationModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        onRoadmapGenerated={addRoadmap}
      />
      <NewRoadmapModal
        isOpen={isNewRoadmapModalOpen}
        onClose={() => setIsNewRoadmapModalOpen(false)}
        onRoadmapCreated={addRoadmap}
      />
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        message={authModalMessage}
      />
      <RazorpayModal
        isOpen={isRazorpayModalOpen}
        onClose={() => setIsRazorpayModalOpen(false)}
        onSuccess={(paymentId) => {
          upgradeSubscription(paymentId);
        }}
      />
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