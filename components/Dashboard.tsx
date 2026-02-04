import React, { useState, useMemo } from 'react';
import { RoadmapCard } from './RoadmapCard';
import { useData } from '../contexts/DataContext';
import type { Roadmap } from '../types';
import { EditRoadmapModal } from './EditRoadmapModal';

interface DashboardProps {
  onSelectRoadmap: (id: string) => void;
  showOnlyUserRoadmaps?: boolean;
  searchTerm?: string;
  requireAuth?: (action: () => void, message: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onSelectRoadmap,
  showOnlyUserRoadmaps = false,
  searchTerm = '',
  requireAuth
}) => {
  const { roadmaps, calculateProgress, deleteRoadmap, updateRoadmap } = useData();
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

  const RoadmapGrid = ({ roadmaps, title, isTemplate = false }: { roadmaps: Roadmap[], title: string, isTemplate?: boolean }) => (
    <div className="mt-8">
      {title && (
        <>
          <h3 className="text-xl font-semibold tracking-tight">{title}</h3>
          <hr className="border-border my-4" />
        </>
      )}
      {roadmaps.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roadmaps.map(roadmap => (
            <RoadmapCard
              key={roadmap.id}
              roadmap={roadmap}
              progress={calculateProgress(roadmap.id)}
              onSelect={() => {
                if (isTemplate && roadmap.shareId) {
                  window.location.href = `/share/${roadmap.shareId}`;
                } else if (isTemplate) {
                  onSelectRoadmap(roadmap.id);
                } else {
                  requireAuth?.(() => onSelectRoadmap(roadmap.id), "Sign in to view roadmap details");
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

      {!showOnlyUserRoadmaps && (
        <div className="mt-1 mb-6">
          <div className="text-center mb-4">
            <h3 className="text-xl font-bold tracking-tight mb-1">Role-based Roadmaps</h3>
            <p className="text-sm text-muted-foreground">Select a category to explore curated learning paths.</p>
          </div>

          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`p-2 rounded-md border text-center transition-all hover:shadow-sm bg-card ${selectedCategory === category
                  ? 'border-primary ring-1 ring-primary'
                  : 'border-border hover:border-primary/50'
                  }`}
              >
                <span className={`text-xs font-medium ${selectedCategory === category ? 'text-primary' : 'text-card-foreground'}`}>
                  {category}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {!showOnlyUserRoadmaps && (
        <RoadmapGrid
          roadmaps={templateRoadmaps}
          title=""
          isTemplate
        />
      )}

      <RoadmapGrid roadmaps={userRoadmaps} title={showOnlyUserRoadmaps ? "" : "Your Roadmaps"} />

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
    </div>
  );
};
