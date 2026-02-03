
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

  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = [
    'All', 'Tech', 'Finance', 'AI', 'Business', 'Leetcode', 'Interviews', 'System Design'
  ];

  const filteredRoadmaps = useMemo(() => {
    return roadmaps.filter(roadmap =>
      roadmap.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [roadmaps, searchTerm]);

  const userRoadmaps = filteredRoadmaps.filter(r => !r.isTemplate);

  const templateRoadmaps = filteredRoadmaps.filter(r => {
    if (!r.isTemplate) return false;
    if (selectedCategory === 'All') return true;
    return r.category === selectedCategory;
  });

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
              onSelect={() => {
                if (isTemplate) {
                  onSelectRoadmap(roadmap.id);
                } else {
                  handleAction(() => onSelectRoadmap(roadmap.id), "Sign in to view roadmap details");
                }
              }}
              onDelete={!isTemplate ? deleteRoadmap : undefined}
              onEdit={!isTemplate ? () => setEditingRoadmap(roadmap) : undefined}
            />
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground text-sm mt-4">No roadmaps found in this category.</p>
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

      <div className="mt-12 mb-8">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold tracking-tight mb-2">Role-based Roadmaps</h3>
          <p className="text-muted-foreground">Select a category to explore curated learning paths.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`p-4 rounded-lg border text-left transition-all hover:shadow-md flex justify-between items-center group bg-card ${selectedCategory === category
                  ? 'border-primary ring-1 ring-primary'
                  : 'border-border hover:border-primary/50'
                }`}
            >
              <span className={`font-semibold ${selectedCategory === category ? 'text-primary' : 'text-card-foreground'}`}>
                {category}
              </span>
              <span className={`text-muted-foreground group-hover:text-primary transition-colors ${selectedCategory === category ? 'text-primary' : ''}`}>
                &rarr;
              </span>
            </button>
          ))}
        </div>
      </div>

      <RoadmapGrid roadmaps={templateRoadmaps} title={selectedCategory === 'All' ? "Pre defined templates" : `${selectedCategory} Pre defined templates`} isTemplate />
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
