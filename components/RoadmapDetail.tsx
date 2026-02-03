
import React, { useState } from 'react';
import type { Milestone as MilestoneType } from '../types';
import { useData } from '../contexts/DataContext';
import { CheckCircleIcon, CircleIcon, LinkIcon, PencilIcon, ShareIcon } from './icons/Icons';
import { MilestoneStatus } from '../types';
import { EditRoadmapModal } from './EditRoadmapModal';
import { ShareRoadmapModal } from './ShareRoadmapModal';

const Milestone: React.FC<{ milestone: MilestoneType, isCompleted: boolean, onToggle: (id: string) => void }> = ({ milestone, isCompleted, onToggle }) => {
    const getStatusColor = () => {
        if (isCompleted) return 'bg-green-500';
        // The milestone.status is from mock data, might not be updated.
        // The isCompleted flag is the source of truth for completion.
        // We can add more logic here later for IN_PROGRESS status.
        return 'bg-border';
    }

    return (
        <div className="relative pl-12 pb-10">
            {/* Timeline Line */}
            <div className="absolute left-[11px] top-5 h-full w-0.5 bg-border"></div>

            {/* Timeline Node */}
            <div className={`absolute left-0 top-0 w-6 h-6 rounded-full flex items-center justify-center transition-colors duration-300 ${getStatusColor()}`}>
                 {isCompleted && <CheckCircleIcon className="w-6 h-6 text-background" strokeWidth={1}/>}
            </div>

            <div className="ml-4">
                <div className="flex items-center gap-4">
                     <h3 className="text-lg font-semibold">{milestone.title}</h3>
                     <button onClick={() => onToggle(milestone.id)} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                        {isCompleted ? <CheckCircleIcon className="text-green-500 w-5 h-5"/> : <CircleIcon className="w-5 h-5"/>}
                        <span>{isCompleted ? 'Completed' : 'Mark as Complete'}</span>
                     </button>
                </div>
                <p className="mt-1 text-muted-foreground text-sm">{milestone.description}</p>
                {milestone.resources.length > 0 && (
                     <div className="mt-4 space-y-2">
                        {milestone.resources.map(resource => (
                            <a key={resource.id} href={resource.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-primary/80 hover:text-primary transition-colors group">
                                <LinkIcon className="w-4 h-4" />
                                <span className="group-hover:underline">{resource.title} ({resource.type})</span>
                            </a>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

interface RoadmapDetailProps {
    roadmapId: string;
    onBack: () => void;
}

export const RoadmapDetail: React.FC<RoadmapDetailProps> = ({ roadmapId, onBack }) => {
  const { getRoadmapById, isMilestoneCompleted, toggleMilestoneCompletion, updateRoadmap } = useData();
  const roadmap = getRoadmapById(roadmapId);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  if (!roadmap) {
    return (
        <div className="text-center">
            <p className="text-muted-foreground">Roadmap not found.</p>
            <button onClick={onBack} className="mt-4 text-primary hover:underline">Go back to Dashboard</button>
        </div>
    );
  }

  return (
    <div>
        <div className="flex justify-between items-center mb-4">
            <button onClick={onBack} className="text-sm text-primary hover:underline">&larr; Back to Dashboard</button>
            {!roadmap.isTemplate && (
              <button 
                onClick={() => setIsShareModalOpen(true)}
                className="flex items-center gap-2 bg-secondary hover:bg-secondary/80 text-foreground font-medium py-2 px-4 rounded-md transition-colors text-sm"
              >
                <ShareIcon className="w-4 h-4" />
                Share
              </button>
            )}
        </div>
      
      <div className="flex items-center gap-4">
        <h2 className="text-3xl font-bold tracking-tight">{roadmap.title}</h2>
        {!roadmap.isTemplate && (
          <button 
            onClick={() => setIsEditModalOpen(true)} 
            className="text-muted-foreground hover:text-primary transition-colors"
            aria-label="Edit roadmap title and description"
          >
            <PencilIcon className="w-5 h-5" />
          </button>
        )}
      </div>
      
      <p className="text-muted-foreground mt-2 max-w-2xl">{roadmap.description}</p>
      
      <div className="mt-12">
        <div className="relative">
            {roadmap.milestones.sort((a,b) => a.order - b.order).map((milestone) => (
                <Milestone 
                    key={milestone.id}
                    milestone={milestone}
                    isCompleted={isMilestoneCompleted(milestone.id)}
                    onToggle={toggleMilestoneCompletion}
                />
            ))}
        </div>
      </div>

      {!roadmap.isTemplate && (
        <>
            <EditRoadmapModal
              isOpen={isEditModalOpen}
              onClose={() => setIsEditModalOpen(false)}
              roadmap={roadmap}
              onSave={(data) => {
                updateRoadmap(roadmap.id, data);
                setIsEditModalOpen(false);
              }}
            />
            <ShareRoadmapModal
                isOpen={isShareModalOpen}
                onClose={() => setIsShareModalOpen(false)}
                roadmap={roadmap}
            />
        </>
      )}
    </div>
  );
};