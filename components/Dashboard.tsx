
import React, { useState, useMemo } from 'react';
import { RoadmapCard } from './RoadmapCard';
import { useData } from '../contexts/DataContext';
import { AIGenerationModal } from './AIGenerationModal';
import { NewRoadmapModal } from './NewRoadmapModal';
import { PlusIcon, SparklesIcon } from './icons/Icons';
import type { Roadmap } from '../types';
import { EditRoadmapModal } from './EditRoadmapModal';
import { useAuth } from '../contexts/AuthContext';
import { AuthModal } from './AuthModal';


interface DashboardProps {
  onSelectRoadmap: (id: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onSelectRoadmap }) => {
  const { roadmaps, calculateProgress, deleteRoadmap, addRoadmap, updateRoadmap } = useData();
  const { isGuest } = useAuth();
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isNewRoadmapModalOpen, setIsNewRoadmapModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMessage, setAuthModalMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState('');
  const [editingRoadmap, setEditingRoadmap] = useState<Roadmap | null>(null);

  const filteredRoadmaps = useMemo(() => {
    return roadmaps.filter(roadmap =>
      roadmap.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [roadmaps, searchTerm]);

  const userRoadmaps = filteredRoadmaps.filter(r => !r.isTemplate);
  const templateRoadmaps = filteredRoadmaps.filter(r => r.isTemplate);

  const handleAction = (action: () => void, message: string) => {
    if (isGuest) {
      setAuthModalMessage(message);
      setIsAuthModalOpen(true);
    } else {
      action();
    }
  };

  const RoadmapGrid = ({ roadmaps, title, isTemplate = false }) => (
    <div className="mt-12">
      <h3 className="text-xl font-semibold tracking-tight">{title}</h3>
      <hr className="border-border my-4" />
      {roadmaps.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roadmaps.map(roadmap => (
            <RoadmapCard
              key={roadmap.id}
              roadmap={roadmap}
              progress={calculateProgress(roadmap.id)}
              onSelect={() => handleAction(() => onSelectRoadmap(roadmap.id), "Sign in to view roadmap details")}
              onDelete={!isTemplate ? deleteRoadmap : undefined}
              onEdit={!isTemplate ? () => setEditingRoadmap(roadmap) : undefined}
            />
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground text-sm mt-4">No roadmaps found.</p>
      )}
    </div>
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground mt-1">Create, track, and master your goals.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleAction(() => setIsNewRoadmapModalOpen(true), "Sign in to create a new roadmap")}
            className="flex items-center justify-center gap-2 bg-secondary hover:bg-secondary/80 text-foreground font-medium py-2 px-4 rounded-md transition-colors"
          >
            <PlusIcon />
            New Roadmap
          </button>
          <button
            onClick={() => handleAction(() => setIsAiModalOpen(true), "Sign in to use AI generation")}
            className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2 px-4 rounded-md transition-colors"
          >
            <SparklesIcon />
            Generate with AI
          </button>
        </div>
      </div>

      <div>
        <input
          type="text"
          placeholder="Search roadmaps..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-input border border-border rounded-md py-2 px-4 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <RoadmapGrid roadmaps={templateRoadmaps} title="Built-in Templates" isTemplate />
      <RoadmapGrid roadmaps={userRoadmaps} title="Your Roadmaps" />

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
      {editingRoadmap && (
        <EditRoadmapModal
          isOpen={!!editingRoadmap}
          onClose={() => setEditingRoadmap(null)}
          roadmap={editingRoadmap}
          onSave={(data) => {
            updateRoadmap(editingRoadmap.id, data);
            setEditingRoadmap(null);
          }}
        />
      )}

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        message={authModalMessage}
      />
    </div>
  );
};
