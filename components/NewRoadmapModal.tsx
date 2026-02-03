
import React, { useState } from 'react';
import type { Roadmap, Milestone, Resource } from '../types';
import { ResourceType } from '../types';
import { PlusIcon, XIcon, PlusCircleIcon, MinusCircleIcon } from './icons/Icons';

type ResourceInput = Pick<Resource, 'title' | 'url' | 'type'>;
type MilestoneInput = Pick<Milestone, 'title' | 'description'> & { resources: ResourceInput[] };

interface NewRoadmapModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRoadmapCreated: (roadmap: Partial<Roadmap>) => void;
}

export const NewRoadmapModal: React.FC<NewRoadmapModalProps> = ({ isOpen, onClose, onRoadmapCreated }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [milestones, setMilestones] = useState<MilestoneInput[]>([{ title: '', description: '', resources: [] }]);
  const [error, setError] = useState<string | null>(null);

  const handleMilestoneChange = (index: number, field: keyof MilestoneInput, value: string) => {
    const newMilestones = [...milestones];
    (newMilestones[index] as any)[field] = value;
    setMilestones(newMilestones);
  };

  const addMilestone = () => {
    setMilestones([...milestones, { title: '', description: '', resources: [] }]);
  };

  const removeMilestone = (index: number) => {
    if (milestones.length <= 1) return; // Must have at least one milestone
    const newMilestones = milestones.filter((_, i) => i !== index);
    setMilestones(newMilestones);
  };

  const handleResourceChange = (milestoneIndex: number, resourceIndex: number, field: keyof ResourceInput, value: string) => {
    const newMilestones = [...milestones];
    (newMilestones[milestoneIndex].resources[resourceIndex] as any)[field] = value;
    setMilestones(newMilestones);
  };

  const addResource = (milestoneIndex: number) => {
    const newMilestones = [...milestones];
    newMilestones[milestoneIndex].resources.push({ title: '', url: '', type: ResourceType.ARTICLE });
    setMilestones(newMilestones);
  };

  const removeResource = (milestoneIndex: number, resourceIndex: number) => {
    const newMilestones = [...milestones];
    newMilestones[milestoneIndex].resources.splice(resourceIndex, 1);
    setMilestones(newMilestones);
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setMilestones([{ title: '', description: '', resources: [] }]);
    setError(null);
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please enter a roadmap title.');
      return;
    }
    if (milestones.some(m => !m.title.trim())) {
        setError('All milestones must have a title.');
        return;
    }
    setError(null);
    
    try {
      // This call can throw an error if the user hits their plan limit
      onRoadmapCreated({ title, description, milestones: milestones as Milestone[] });
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-lg shadow-xl w-full max-w-2xl relative animate-fade-in-up max-h-[90vh] flex flex-col">
        <button onClick={handleClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
          <XIcon />
        </button>
        <div className="p-8 border-b border-border">
          <div className="flex items-center gap-3">
            <PlusIcon className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-semibold">Create New Roadmap</h2>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">Define your roadmap's details and add its core milestones.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto">
          <div className="p-8 space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-foreground mb-1">Title</label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., 'Mastering Go'"
                  className="w-full bg-input border border-border rounded-md py-2 px-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
               <div>
                <label htmlFor="description" className="block text-sm font-medium text-foreground mb-1">Description</label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="A short summary of what this roadmap is about."
                  rows={2}
                  className="w-full bg-input border border-border rounded-md py-2 px-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            
            <div>
                <h3 className="text-lg font-semibold mb-3">Milestones</h3>
                <div className="space-y-4">
                    {milestones.map((milestone, index) => (
                        <div key={index} className="flex items-start gap-3 p-4 border border-border/80 rounded-md">
                            <span className="text-primary font-bold text-lg mt-1">{index + 1}</span>
                            <div className="flex-grow space-y-2">
                                <input
                                  type="text"
                                  placeholder="Milestone Title"
                                  value={milestone.title}
                                  onChange={(e) => handleMilestoneChange(index, 'title', e.target.value)}
                                  className="w-full bg-input border-border rounded-md py-1.5 px-2 text-sm"
                                />
                                <textarea
                                  placeholder="Milestone Description"
                                  value={milestone.description}
                                  onChange={(e) => handleMilestoneChange(index, 'description', e.target.value)}
                                  rows={2}
                                  className="w-full bg-input border-border rounded-md py-1.5 px-2 text-xs"
                                />
                                {/* Resources Section */}
                                <div className="pt-2">
                                    <h4 className="text-xs font-semibold text-muted-foreground mb-2">Resources</h4>
                                    <div className="space-y-2">
                                        {milestone.resources.map((resource, rIndex) => (
                                            <div key={rIndex} className="flex items-center gap-2">
                                                <div className="grid grid-cols-6 gap-2 flex-grow">
                                                  <input type="text" placeholder="Title" value={resource.title} onChange={e => handleResourceChange(index, rIndex, 'title', e.target.value)} className="col-span-2 w-full bg-input/70 border-border rounded-md py-1 px-2 text-xs" />
                                                  <input type="text" placeholder="URL" value={resource.url} onChange={e => handleResourceChange(index, rIndex, 'url', e.target.value)} className="col-span-3 w-full bg-input/70 border-border rounded-md py-1 px-2 text-xs" />
                                                  <select value={resource.type} onChange={e => handleResourceChange(index, rIndex, 'type', e.target.value as ResourceType)} className="w-full bg-input/70 border-border rounded-md py-1 px-2 text-xs">
                                                      <option value={ResourceType.ARTICLE}>Article</option>
                                                      <option value={ResourceType.VIDEO}>Video</option>
                                                  </select>
                                                </div>
                                                <button type="button" onClick={() => removeResource(index, rIndex)} className="text-muted-foreground hover:text-destructive">
                                                    <MinusCircleIcon className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    <button type="button" onClick={() => addResource(index)} className="mt-2 flex items-center gap-1 text-xs text-primary/80 font-medium">
                                        <PlusCircleIcon className="w-4 h-4"/>
                                        Add Resource
                                    </button>
                                </div>
                            </div>
                            <button type="button" onClick={() => removeMilestone(index)} disabled={milestones.length <= 1} className="text-muted-foreground hover:text-destructive disabled:opacity-50 disabled:cursor-not-allowed">
                                <MinusCircleIcon />
                            </button>
                        </div>
                    ))}
                </div>
                <button type="button" onClick={addMilestone} className="mt-4 flex items-center gap-2 text-sm text-primary font-medium">
                    <PlusCircleIcon/>
                    Add Milestone
                </button>
            </div>
            </div>
            
            <div className="p-8 pt-4 mt-auto border-t border-border sticky bottom-0 bg-card">
                 {error && <p className="mb-4 text-center text-sm text-red-400">{error}</p>}
                 <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2.5 px-4 rounded-md transition-colors"
                  >
                    Create Roadmap
                  </button>
            </div>
          </form>
      </div>
    </div>
  );
};
