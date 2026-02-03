
import React from 'react';
import { useAuth } from '../contexts/AuthContext';

export const SettingsPage: React.FC = () => {
  const { currentUser } = useAuth();

  return (
    <div>
      <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
      <p className="text-muted-foreground mt-2">Manage your account and application settings.</p>

      <div className="mt-8 max-w-md space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-foreground">Name</label>
          <input 
            type="text" 
            id="name" 
            defaultValue={currentUser?.name || ''}
            disabled
            className="mt-1 block w-full bg-input border border-border rounded-md shadow-sm py-2 px-3 text-foreground focus:outline-none focus:ring-primary focus:border-primary sm:text-sm disabled:opacity-60" 
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-foreground">Email</label>
          <input 
            type="email" 
            id="email" 
            defaultValue={currentUser?.email || ''}
            disabled
            className="mt-1 block w-full bg-input border border-border rounded-md shadow-sm py-2 px-3 text-foreground focus:outline-none focus:ring-primary focus:border-primary sm:text-sm disabled:opacity-60" 
          />
        </div>
        <div className="pt-4 border-t border-border">
            <button className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-50" disabled>
                Save Changes
            </button>
             <p className="text-xs text-muted-foreground mt-2">Profile editing is not yet available.</p>
        </div>
      </div>
    </div>
  );
};
