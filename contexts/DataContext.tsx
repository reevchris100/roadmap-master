
import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
import type { Roadmap, Progress, Milestone, Resource } from '../types';
import { mockRoadmaps, mockProgress } from '../services/mockData';
import { MilestoneStatus, SubscriptionStatus, ResourceType } from '../types';
import { useAuth } from './AuthContext';

interface DataContextType {
  roadmaps: Roadmap[];
  progress: Progress[];
  getRoadmapById: (id: string) => Roadmap | undefined;
  getRoadmapByShareId: (shareId: string) => Roadmap | undefined;
  calculateProgress: (roadmapId: string) => number;
  isMilestoneCompleted: (milestoneId: string) => boolean;
  toggleMilestoneCompletion: (milestoneId: string) => void;
  deleteRoadmap: (roadmapId: string) => void;
  addRoadmap: (newRoadmapData: Partial<Roadmap>) => void;
  updateRoadmap: (roadmapId: string, data: Partial<Omit<Roadmap, 'id' | 'userId' | 'createdAt'>>) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);


import { dbRequest } from '../services/databaseService';

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Use simple state instead of localStorage
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [progress, setProgress] = useState<Progress[]>([]);
  const { currentUser } = useAuth();

  // Load Initial Data
  useEffect(() => {
    const loadData = async () => {
      // Always load templates from mock (or DB if we migrated them)
      const templates = mockRoadmaps.filter(r => r.isTemplate);

      try {
        if (currentUser) {
          // Load user roadmaps from DB
          const userRoadmaps = await dbRequest.getUserRoadmaps(currentUser.id);
          const userProgress = await dbRequest.getUserProgress(currentUser.id);
          setRoadmaps([...templates, ...userRoadmaps]);
          setProgress(userProgress);
        } else {
          // Guest mode: Just use templates + maybe local storage for guest creations?
          // For now, just templates.
          setRoadmaps(templates);
          setProgress([]);
        }
      } catch (err) {
        console.error("Failed to load data", err);
        // Fallback
        setRoadmaps(templates);
      }
    };
    loadData();
  }, [currentUser]);

  const getRoadmapById = useCallback((id: string) => {
    return roadmaps.find(r => r.id === id);
  }, [roadmaps]);

  const getRoadmapByShareId = useCallback((shareId: string) => {
    return roadmaps.find(r => r.shareId === shareId);
  }, [roadmaps]);

  const calculateProgress = useCallback((roadmapId: string) => {
    const roadmap = getRoadmapById(roadmapId);
    if (!roadmap || roadmap.milestones.length === 0) return 0;

    const completedMilestones = roadmap.milestones.filter(m =>
      progress.some(p => p.milestoneId === m.id && p.isCompleted)
    ).length;

    return (completedMilestones / roadmap.milestones.length) * 100;
  }, [progress, getRoadmapById]);

  const isMilestoneCompleted = useCallback((milestoneId: string) => {
    return progress.some(p => p.milestoneId === milestoneId && p.isCompleted);
  }, [progress]);

  const toggleMilestoneCompletion = async (milestoneId: string) => {
    if (!currentUser) return; // Guests don't save progress?

    const existing = progress.find(p => p.milestoneId === milestoneId);

    // Update State Optimistically
    if (existing) {
      setProgress(prev => prev.map(p => p.milestoneId === milestoneId ? { ...p, isCompleted: !p.isCompleted } : p));
      // Sync DB
      const updated = { ...existing, isCompleted: !existing.isCompleted };
      await dbRequest.saveProgress(updated);
    } else {
      const newProgress = { id: `prog_${Date.now()}`, userId: currentUser.id, milestoneId, isCompleted: true };
      setProgress(prev => [...prev, newProgress]);
      // Sync DB
      await dbRequest.saveProgress(newProgress);
    }
  };

  const deleteRoadmap = async (roadmapId: string) => {
    // Optimistic Update
    setRoadmaps(prev => prev.filter(r => r.id !== roadmapId));

    // Sync DB
    if (currentUser) {
      await dbRequest.deleteRoadmap(roadmapId);
    }
  };

  const addRoadmap = async (newRoadmapData: Partial<Roadmap>) => {
    if (!currentUser) throw new Error("User not authenticated.");

    const userRoadmaps = roadmaps.filter(r => !r.isTemplate && r.userId === currentUser.id);

    if (currentUser.subscriptionStatus === SubscriptionStatus.FREE && userRoadmaps.length >= 3) {
      throw new Error("Free plan is limited to 3 roadmaps. Please upgrade to create more.");
    }
    if (currentUser.subscriptionStatus === SubscriptionStatus.PRO && userRoadmaps.length >= 5) {
      throw new Error("Pro plan is limited to 5 roadmaps.");
    }

    const newRoadmapId = `roadmap_${Date.now()}`;
    const newRoadmap: Roadmap = {
      id: newRoadmapId,
      title: newRoadmapData.title || 'Untitled Roadmap',
      description: newRoadmapData.description || '',
      isPublic: false,
      userId: currentUser.id,
      createdAt: new Date(),
      isTemplate: false,
      milestones: (newRoadmapData.milestones || []).map((m, index) => {
        const milestoneId = `milestone_${Date.now()}_${index}`;
        return {
          id: milestoneId,
          roadmapId: newRoadmapId,
          title: m.title || 'Untitled Milestone',
          description: m.description || '',
          status: m.status || MilestoneStatus.PLANNED,
          order: m.order || index + 1,
          resources: (m.resources || []).map((r, rIndex) => ({
            ...r,
            id: r.id || `res_${Date.now()}_${index}_${rIndex}`,
            milestoneId: milestoneId,
            // Correctly fixing type issue
            type: r.type || ResourceType.ARTICLE
          }))
        };
      })
    };

    // Optimistic
    setRoadmaps(prev => [newRoadmap, ...prev]);

    // Sync DB
    try {
      await dbRequest.createRoadmap(newRoadmap);
    } catch (e) {
      console.error("Failed to create roadmap in DB", e);
      // Rollback?
      setRoadmaps(prev => prev.filter(r => r.id !== newRoadmapId));
      throw e;
    }
  };

  const updateRoadmap = async (roadmapId: string, data: Partial<Omit<Roadmap, 'id' | 'userId' | 'createdAt'>>) => {
    // 1. Find the current roadmap to check its current state
    const existingRoadmap = roadmaps.find(r => r.id === roadmapId);
    if (!existingRoadmap) return;

    // 2. Prepare the updates
    const updates = { ...data };

    // 3. Generate shareId if making public and it doesn't exist
    if (updates.isPublic && !existingRoadmap.shareId && !updates.shareId) {
      updates.shareId = `share_${Date.now()}_${roadmapId.substring(0, 4)}`;
    }

    // 4. Update Local State
    setRoadmaps(prev =>
      prev.map(r => {
        if (r.id === roadmapId) {
          const updatedRoadmap = { ...r, ...updates };

          // Handle nested milestones update if present
          if (updates.milestones) {
            updatedRoadmap.milestones = updates.milestones.map((m: any, i) => ({
              ...m,
              id: m.id || `milestone_${Date.now()}_${i}`,
              roadmapId: r.id,
              status: m.status || MilestoneStatus.PLANNED,
              order: i + 1,
              resources: (m.resources || []).map((res: Resource, resIndex: number) => ({
                ...res,
                id: res.id || `res_${Date.now()}_${i}_${resIndex}`,
                milestoneId: m.id || `milestone_${Date.now()}_${i}`,
                type: res.type || ResourceType.ARTICLE
              }))
            }));
          }
          return updatedRoadmap;
        }
        return r;
      })
    );

    // 5. Sync DB for top level fields
    if (currentUser) {
      // We merge existing roadmap with updates to ensure we have all fields (like shareId)
      const roadmapToSave = { ...existingRoadmap, ...updates };
      await dbRequest.updateRoadmap(roadmapToSave as Roadmap);
    }
  };

  return (
    <DataContext.Provider value={{
      roadmaps,
      progress,
      getRoadmapById,
      getRoadmapByShareId,
      calculateProgress,
      isMilestoneCompleted,
      toggleMilestoneCompletion,
      deleteRoadmap,
      addRoadmap,
      updateRoadmap,
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};