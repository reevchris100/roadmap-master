
import React, { useState, useEffect } from 'react';
import type { Roadmap } from '../types';
import { useData } from '../contexts/DataContext';
import { XIcon, ShareIcon, LinkIcon } from './icons/Icons';

interface ShareRoadmapModalProps {
  isOpen: boolean;
  onClose: () => void;
  roadmap: Roadmap;
}

export const ShareRoadmapModal: React.FC<ShareRoadmapModalProps> = ({ isOpen, onClose, roadmap }) => {
  const { updateRoadmap } = useData();
  const [isPublic, setIsPublic] = useState(roadmap.isPublic);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setIsPublic(roadmap.isPublic);
  }, [roadmap.isPublic, isOpen]);

  const handleTogglePublic = () => {
    const newPublicState = !isPublic;
    setIsPublic(newPublicState);
    updateRoadmap(roadmap.id, { isPublic: newPublicState });
  };

  const shareLink = roadmap.shareId 
    ? `${window.location.origin}/share/${roadmap.shareId}`
    : '';

  const handleCopyLink = () => {
    if (shareLink) {
      navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-lg shadow-xl w-full max-w-md relative animate-fade-in-up">
        <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
          <XIcon />
        </button>
        <div className="p-8">
          <div className="flex items-center gap-3">
            <ShareIcon className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-semibold">Share Roadmap</h2>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Anyone with the link can view a public roadmap.
          </p>

          <div className="mt-6 bg-secondary/50 p-4 rounded-md">
            <div className="flex justify-between items-center">
              <p className="text-sm font-medium">Public Access</p>
              <label htmlFor="public-toggle" className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  id="public-toggle" 
                  className="sr-only peer"
                  checked={isPublic}
                  onChange={handleTogglePublic}
                />
                <div className="w-11 h-6 bg-input rounded-full peer peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/50 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>
          
          {isPublic && roadmap.shareId && (
            <div className="mt-4">
              <label className="text-sm font-medium">Shareable Link</label>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="text"
                  readOnly
                  value={shareLink}
                  className="w-full bg-input border border-border rounded-md py-2 px-3 text-sm text-muted-foreground truncate"
                />
                <button
                  onClick={handleCopyLink}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2 px-4 rounded-md transition-colors text-sm"
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          )}

          {!isPublic && (
            <div className="mt-4 text-center text-sm text-muted-foreground bg-secondary/50 p-4 rounded-md">
                Enable public access to generate a shareable link.
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
