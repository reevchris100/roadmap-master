
import React, { useState, useRef, useEffect } from 'react';
import { MenuIcon, UserIcon, CoffeeIcon, LogoutIcon, GoogleIcon } from './icons/Icons';
import { useAuth } from '../contexts/AuthContext';
import type { Page } from '../types';

interface NavbarProps {
  onMenuClick: () => void;
  navigateTo: (page: Page) => void;
  headerControls?: React.ReactNode;
}

export const Navbar: React.FC<NavbarProps> = ({ onMenuClick, navigateTo, headerControls }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { currentUser, logout, loginWithGoogle } = useAuth();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // implementation details...
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleProfileClick = () => {
    navigateTo('settings');
    setIsDropdownOpen(false);
  };

  const displayName = currentUser?.name || '';
  const displayEmail = currentUser?.email || '';

  return (
    <header className="flex-shrink-0 bg-background border-b border-border h-16 flex items-center justify-between px-4 sm:px-6 lg:p-8">
      <div className="flex items-center gap-4 flex-1">
        <button
          onClick={onMenuClick}
          className="lg:hidden text-muted-foreground hover:text-foreground transition-colors"
        >
          <MenuIcon />
        </button>
        {headerControls && (
          <div className="hidden md:flex flex-1 max-w-2xl">
            {headerControls}
          </div>
        )}
      </div>
      <div className="w-full flex items-center justify-end gap-4">
        <a
          href="https://buymeacoffee.com/reevchris"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:flex items-center justify-center gap-2 bg-secondary hover:bg-secondary/80 text-foreground font-medium py-2 px-3 rounded-md transition-colors text-sm"
        >
          <CoffeeIcon className="w-4 h-4" />
          Donate
        </a>

        {!currentUser && (
          <button
            onClick={loginWithGoogle}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium py-2 px-4 rounded-md transition-colors whitespace-nowrap"
          >
            <GoogleIcon className="w-5 h-5" />
            Sign in with Google
          </button>
        )}

        {currentUser && (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center space-x-2"
            >
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-secondary">
                <UserIcon />
              </div>
              <span className="hidden sm:inline text-sm font-medium">{displayName}</span>
              {currentUser?.subscriptionStatus === 'PRO' && (
                <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold shadow-sm">
                  PRO
                </span>
              )}
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-popover border border-border rounded-md shadow-lg py-1 z-50">
                <div className="px-4 py-2 border-b border-border">
                  <p className="text-sm font-semibold">{displayName}</p>
                  <p className="text-xs text-muted-foreground truncate">{displayEmail}</p>
                </div>
                <button
                  onClick={handleProfileClick}
                  className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
                >
                  <UserIcon className="w-4 h-4" />
                  Profile
                </button>
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
        )}
      </div>
    </header>
  );
};
