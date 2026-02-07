import React, { useState, useEffect, useCallback } from 'react';
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
    onHome?: () => void;
}

export const PublicRoadmapPage: React.FC<PublicRoadmapPageProps> = ({ shareId, onHome }) => {
    const { getRoadmapByShareId } = useData();

    // 1. Initialize aggressively from all known sources to avoid loading state if possible
    const [roadmap, setRoadmap] = useState<Roadmap | undefined>(() => {
        const fromContext = getRoadmapByShareId(shareId);
        if (fromContext) return fromContext;
        return mockRoadmaps.find(r => r.shareId === shareId);
    });

    // If we found it immediately, no loading needed.
    const [loading, setLoading] = useState(!roadmap);
    const [error, setError] = useState<boolean>(false);

    useEffect(() => {
        // If we already have the roadmap, don't fetch.
        if (roadmap) {
            setLoading(false);
            return;
        }

        let isMounted = true;

        const loadRoadmap = async () => {
            setLoading(true);
            setError(false);

            try {
                // Fetch from DB with detailed error logging and Timeout
                const fetchPromise = dbRequest.getPublicRoadmap(shareId);
                const timeoutPromise = new Promise<null>((_, reject) =>
                    setTimeout(() => reject(new Error('Request Timeout')), 10000)
                );

                const result = await Promise.race([fetchPromise, timeoutPromise]);

                if (isMounted) {
                    if (result) {
                        setRoadmap(result);
                    } else {
                        console.warn("Public roadmap returned null (not found or private)");
                        setError(true);
                    }
                }
            } catch (e: any) {
                // Robustly check for AbortError or cancelled requests
                if (e?.name === 'AbortError' || e?.message?.includes('aborted')) {
                    console.log("Fetch aborted");
                    return;
                }

                console.error("Failed to fetch public roadmap:", e);
                if (isMounted) setError(true);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        loadRoadmap();

        return () => {
            isMounted = false;
        };
        // eslint-disable-next-line
    }, [shareId]);

    const handleHomeClick = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        if (onHome) {
            onHome();
        } else {
            // Fallback if no handler provided
            window.location.href = '/';
        }
    }, [onHome]);

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
                    <a href="/" onClick={handleHomeClick} className="text-sm font-medium text-primary hover:underline">
                        Back to Dashboard
                    </a>
                </header>
                <main className="flex-grow flex items-center justify-center p-4">
                    <div className="text-center max-w-md mx-auto">
                        <h2 className="text-2xl font-bold">Roadmap Not Found</h2>
                        <p className="text-muted-foreground mt-2">This roadmap could not be found or is no longer shared publicly.</p>
                        <button onClick={handleHomeClick} className="mt-6 inline-block bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors">
                            Go Home
                        </button>
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
                <a href="/" onClick={handleHomeClick} className="text-sm font-medium text-primary hover:underline">
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
