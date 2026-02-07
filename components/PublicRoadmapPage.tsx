import React, { useState, useEffect } from 'react';
import type { Milestone as MilestoneType, Roadmap } from '../types';
import { useData } from '../contexts/DataContext';
import { LinkIcon, SparklesIcon } from './icons/Icons';
import { dbRequest } from '../services/databaseService';
import { mockRoadmaps } from '../services/mockData';

const PublicMilestone: React.FC<{ milestone: MilestoneType }> = ({ milestone }) => {
    return (
        <div className="relative pl-12 pb-10">
            <div className="absolute left-[11px] top-5 h-full w-0.5 bg-border"></div>
            <div className="absolute left-0 top-0 w-6 h-6 rounded-full flex items-center justify-center bg-primary"></div>
            <div className="ml-4">
                <h3 className="text-lg font-semibold">{milestone.title}</h3>
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

interface PublicRoadmapPageProps {
    shareId: string;
}

export const PublicRoadmapPage: React.FC<PublicRoadmapPageProps> = ({ shareId }) => {
    const { getRoadmapByShareId } = useData();
    // Initialize from context if available, but don't rely on it effectively being there immediately
    const [roadmap, setRoadmap] = useState<Roadmap | undefined>(() => getRoadmapByShareId(shareId));
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<boolean>(false);

    useEffect(() => {
        let isMounted = true;

        const loadRoadmap = async () => {
            setLoading(true);
            setError(false);

            try {
                // 1. Try finding in default context (sync)
                const contextRoadmap = getRoadmapByShareId(shareId);
                if (contextRoadmap) {
                    if (isMounted) {
                        setRoadmap(contextRoadmap);
                        setLoading(false);
                    }
                    return;
                }

                // 2. Try finding in mock templates
                const mockTemplate = mockRoadmaps.find(r => r.shareId === shareId);
                if (mockTemplate) {
                    if (isMounted) {
                        setRoadmap(mockTemplate);
                        setLoading(false);
                    }
                    return;
                }

                // 3. Fetch from DB
                const result = await dbRequest.getPublicRoadmap(shareId);
                if (isMounted) {
                    if (result) {
                        setRoadmap(result);
                    } else {
                        setError(true);
                    }
                }
            } catch (e) {
                console.error("Failed to fetch public roadmap", e);
                if (isMounted) setError(true);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        loadRoadmap();

        return () => {
            isMounted = false;
        };
    }, [shareId, getRoadmapByShareId]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error || !roadmap || !roadmap.isPublic) {
        return (
            <div className="min-h-screen bg-background text-foreground flex flex-col">
                <header className="py-4 px-8 border-b border-border flex justify-between items-center">
                    <h1 className="text-xl font-bold flex items-center gap-2">
                        <SparklesIcon className="w-6 h-6 text-primary" />
                        Roadmap Master
                    </h1>
                    <a href="/" className="text-sm font-medium text-primary hover:underline">
                        Back to Dashboard
                    </a>
                </header>
                <main className="flex-grow flex items-center justify-center p-4">
                    <div className="text-center max-w-md mx-auto">
                        <h2 className="text-2xl font-bold">Roadmap Not Found</h2>
                        <p className="text-muted-foreground mt-2">This roadmap could not be found or is no longer shared publicly.</p>
                        <a href="/" className="mt-6 inline-block bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors">
                            Go Home
                        </a>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            <header className="py-4 px-8 border-b border-border flex justify-between items-center">
                <h1 className="text-xl font-bold flex items-center gap-2">
                    <SparklesIcon className="w-6 h-6 text-primary" />
                    Roadmap Master
                </h1>
                <a href="/" className="text-sm font-medium text-primary hover:underline">
                    Back to Dashboard
                </a>
            </header>

            <main className="flex-grow p-4 sm:p-6 lg:p-8">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-3xl font-bold tracking-tight">{roadmap.title}</h2>
                    <p className="text-muted-foreground mt-2">{roadmap.description}</p>
                    <div className="mt-12">
                        <div className="relative">
                            {roadmap.milestones.sort((a, b) => a.order - b.order).map((milestone) => (
                                <PublicMilestone
                                    key={milestone.id}
                                    milestone={milestone}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </main>
            <footer className="text-center p-4 text-xs text-muted-foreground border-t border-border">
                <p>&copy; {new Date().getFullYear()} Roadmap Master. Create your own roadmap!</p>
            </footer>
        </div>
    );
};
