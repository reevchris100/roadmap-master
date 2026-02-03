
import React from 'react';
import type { Page } from '../types';
import { HomeIcon, RoadmapsIcon, SettingsIcon, ProPlanIcon, XIcon } from './icons/Icons';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  currentPage: Page;
  navigateTo: (page: Page) => void;
}

const NavItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`flex items-center w-full px-4 py-2.5 text-sm font-medium rounded-md transition-colors duration-200 ${
        isActive
          ? 'bg-primary/10 text-primary'
          : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
      }`}
    >
      {icon}
      <span className="ml-4">{label}</span>
    </button>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen, currentPage, navigateTo }) => {
  const handleNavigation = (page: Page) => {
    navigateTo(page);
    if (window.innerWidth < 1024) {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Overlay for mobile */}
      <div
        className={`fixed inset-0 bg-black/60 z-30 lg:hidden transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsOpen(false)}
      ></div>

      <aside
        className={`fixed lg:relative inset-y-0 left-0 w-64 bg-background border-r border-border z-40 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-border">
          <h1 className="text-xl font-bold">Roadmap Master</h1>
          <button onClick={() => setIsOpen(false)} className="lg:hidden text-muted-foreground">
            <XIcon />
          </button>
        </div>
        <nav className="p-4 space-y-2">
          <NavItem
            icon={<HomeIcon />}
            label="Dashboard"
            isActive={currentPage === 'dashboard'}
            onClick={() => handleNavigation('dashboard')}
          />
          <NavItem
            icon={<RoadmapsIcon />}
            label="Roadmaps"
            isActive={currentPage.startsWith('roadmap')}
            onClick={() => handleNavigation('dashboard')}
          />
          <NavItem
            icon={<ProPlanIcon />}
            label="Pro Plans"
            isActive={currentPage === 'pricing'}
            onClick={() => handleNavigation('pricing')}
          />
          <NavItem
            icon={<SettingsIcon />}
            label="Settings"
            isActive={currentPage === 'settings'}
            onClick={() => handleNavigation('settings')}
          />
        </nav>
      </aside>
    </>
  );
};
