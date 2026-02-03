
import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
import type { Roadmap, Progress, Milestone } from '../types';
import { mockRoadmaps, mockProgress } from '../services/mockData';
import { MilestoneStatus, SubscriptionStatus } from '../types';
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

const useLocalStorage = <T,>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue: React.Dispatch<React.SetStateAction<T>> = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
};


export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [roadmaps, setRoadmaps] = useLocalStorage<Roadmap[]>('roadmaps', mockRoadmaps);
  const [progress, setProgress] = useLocalStorage<Progress[]>('progress', mockProgress);
  const { currentUser } = useAuth();

  // Effect to ensure templates are always up-to-date from mockData
  useEffect(() => {
    setRoadmaps(prevRoadmaps => {
      const userCreatedRoadmaps = prevRoadmaps.filter(r => !r.isTemplate);
      const freshTemplates = mockRoadmaps.filter(r => r.isTemplate);

      // Check if we actually need to update to avoid infinite loops if strict equality fails
      // For simplicity, we just combine them. 
      // In a real app we might check if they differ.

      // We also need to preserve the ID if possible or ensures mockData IDs are stable (they are).
      return [...freshTemplates, ...userCreatedRoadmaps];
    });
  }, []);

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

  const toggleMilestoneCompletion = (milestoneId: string) => {
    setProgress(prev => {
      if (!currentUser) return prev;
      const existing = prev.find(p => p.milestoneId === milestoneId);
      if (existing) {
        return prev.map(p => p.milestoneId === milestoneId ? { ...p, isCompleted: !p.isCompleted } : p);
      }
      return [...prev, { id: `prog_${Date.now()}`, userId: currentUser.id, milestoneId, isCompleted: true }];
    });
  };

  const deleteRoadmap = (roadmapId: string) => {
    setRoadmaps(prev => prev.filter(r => r.id !== roadmapId));
    const roadmapToDelete = getRoadmapById(roadmapId);
    if (roadmapToDelete) {
      const milestoneIds = roadmapToDelete.milestones.map(m => m.id);
      setProgress(prev => prev.filter(p => !milestoneIds.includes(p.milestoneId)));
    }
  };

  const addRoadmap = (newRoadmapData: Partial<Roadmap>) => {
    if (!currentUser) throw new Error("User not authenticated.");

    const userRoadmaps = roadmaps.filter(r => !r.isTemplate && r.userId === currentUser.id);

    if (currentUser.subscriptionStatus === SubscriptionStatus.FREE && userRoadmaps.length >= 1) {
      throw new Error("Free plan is limited to 1 roadmap. Please upgrade to create more.");
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
          }))
        };
      })
    };
    setRoadmaps(prev => [newRoadmap, ...prev]);
  };

  const updateRoadmap = (roadmapId: string, data: Partial<Omit<Roadmap, 'id' | 'userId' | 'createdAt'>>) => {
    setRoadmaps(prev =>
      prev.map(r => {
        if (r.id === roadmapId) {
          const updatedRoadmap = { ...r, ...data };

          // If making public for the first time, generate a shareId
          if (data.isPublic && !r.shareId) {
            updatedRoadmap.shareId = `share_${Date.now()}_${roadmapId.substring(0, 4)}`;
          }

          if (data.milestones) {
            updatedRoadmap.milestones = data.milestones.map((m, index) => ({
              ...m,
              id: m.id || `milestone_${Date.now()}_${index}`,
              roadmapId: roadmapId,
              status: m.status || MilestoneStatus.PLANNED,
              order: index + 1,
              resources: m.resources || [],
            }));
          }
          return updatedRoadmap;
        }
        return r;
      })
    );
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