
import React, { useState, useRef, useEffect } from 'react';
import { MenuIcon, UserIcon, CoffeeIcon, LogoutIcon } from './icons/Icons';
import { useAuth } from '../contexts/AuthContext';
import type { Page } from '../types';

interface NavbarProps {
  onMenuClick: () => void;
  navigateTo: (page: Page) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onMenuClick, navigateTo }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { currentUser, isGuest, logout } = useAuth();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!currentUser && !isGuest) return null;

  const handleProfileClick = () => {
    if (isGuest) return;
    navigateTo('settings');
    setIsDropdownOpen(false);
  };

  const displayName = currentUser?.name || (isGuest ? 'Guest User' : '');
  const displayEmail = currentUser?.email || (isGuest ? 'guest@roadmap.master' : '');

  return (
    <header className="flex-shrink-0 bg-background border-b border-border h-16 flex items-center justify-between px-4 sm:px-6 lg:p-8">
      <button
        onClick={onMenuClick}
        className="lg:hidden text-muted-foreground hover:text-foreground transition-colors"
      >
        <MenuIcon />
      </button>
      <div className="w-full flex items-center justify-end gap-4">
        <a
          href="https://buymeacoffee.com/reevchris"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:flex items-center justify-center gap-2 bg-secondary hover:bg-secondary/80 text-foreground font-medium py-2 px-3 rounded-md transition-colors text-sm"
        >
          <CoffeeIcon className="w-4 h-4" />
          Buy me a coffee
        </a>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center space-x-2"
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isGuest ? 'bg-orange-100 text-orange-600' : 'bg-secondary'}`}>
              <UserIcon />
            </div>
            <span className="hidden sm:inline text-sm font-medium">{displayName}</span>
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-popover border border-border rounded-md shadow-lg py-1 z-50">
              <div className="px-4 py-2 border-b border-border">
                <p className="text-sm font-semibold">{displayName}</p>
                <p className="text-xs text-muted-foreground truncate">{displayEmail}</p>
              </div>
              {!isGuest && (
                <button
                  onClick={handleProfileClick}
                  className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
                >
                  <UserIcon className="w-4 h-4" />
                  Profile
                </button>
              )}
              <button
                onClick={logout}
                className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <LogoutIcon className="w-4 h-4" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
