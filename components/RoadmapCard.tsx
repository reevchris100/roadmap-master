
import React from 'react';
import type { Roadmap } from '../types';
import { Progress } from './ui/progress';
import { TrashIcon, PencilIcon } from './icons/Icons';

interface RoadmapCardProps {
  roadmap: Roadmap;
  progress: number;
  onSelect: () => void;
  onDelete?: (id: string) => void;
  onEdit?: () => void;
}

export const RoadmapCard: React.FC<RoadmapCardProps> = ({ roadmap, progress, onSelect, onDelete, onEdit }) => {
  const getStatus = () => {
    if (progress === 100) return { text: 'Completed', color: 'bg-green-500/20 text-green-400' };
    if (progress > 0) return { text: 'In Progress', color: 'bg-blue-500/20 text-blue-400' };
    return { text: 'Not Started', color: 'bg-gray-500/20 text-gray-400' };
  };

  const status = getStatus();

  const handleDelete = (e: React.MouseEvent) => {
      e.stopPropagation();
      if(onDelete) {
          onDelete(roadmap.id);
      }
  }

  const handleEdit = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (onEdit) {
          onEdit();
      }
  }

  return (
    <div
      onClick={onSelect}
      className="bg-card border border-border rounded-lg p-6 cursor-pointer transition-all duration-300 hover:border-primary/50 hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/10 flex flex-col"
    >
      <div className="flex justify-between items-start">
        <h3 className="text-lg font-semibold text-card-foreground flex-1 pr-2">{roadmap.title}</h3>
        <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full flex-shrink-0 ${status.color}`}>
          {status.text}
        </span>
      </div>
      <p className="mt-2 text-sm text-muted-foreground line-clamp-2 flex-grow">{roadmap.description}</p>
      
      <div className="mt-6">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs font-medium text-muted-foreground">Progress</span>
          <span className="text-xs font-semibold text-foreground">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} />
      </div>

      {!roadmap.isTemplate && (onDelete || onEdit) && (
          <div className="mt-4 pt-4 border-t border-border/50 flex justify-end items-center gap-4">
              {onEdit && (
                 <button onClick={handleEdit} className="text-muted-foreground hover:text-primary transition-colors text-xs flex items-center gap-1">
                    <PencilIcon className="w-4 h-4" />
                    Edit
                 </button>
              )}
              {onDelete && (
                  <button onClick={handleDelete} className="text-muted-foreground hover:text-destructive transition-colors text-xs flex items-center gap-1">
                      <TrashIcon className="w-4 h-4" />
                      Delete
                  </button>
              )}
          </div>
      )}
    </div>
  );
};
