
import { supabase } from './supabase';
import type { Roadmap, Milestone, Resource, Progress } from '../types';

// Helper to map DB columns (snake_case) to Types (camelCase) if needed.
// However, Supabase JS client usually returns what's in DB.
// We will need to transform data manually or use 'select(*, milestones(*, resources(*)))'

export const dbRequest = {
    // --- Roadmaps ---

    getUserRoadmaps: async (userId: string): Promise<Roadmap[]> => {
        const { data, error } = await supabase
            .from('roadmaps')
            .select(`
        *,
        milestones (
          *,
          resources (*)
        )
      `)
            .eq('user_id', userId)
            .eq('is_template', false);

        if (error) throw error;
        return mapDbResponseToRoadmaps(data);
    },

    getTemplates: async (): Promise<Roadmap[]> => {
        // This assumes we put templates in DB. If we keep templates in code (as they are now), we might skip this.
        // But user asked for DB integration. Ideally templates should live in DB too if we want dynamic updates.
        // For now, let's assume we mix them.
        const { data, error } = await supabase
            .from('roadmaps')
            .select(`
        *,
        milestones (
          *,
          resources (*)
        )
      `)
            .eq('is_template', true);

        if (error) {
            console.warn("Could not fetch templates from DB", error);
            return [];
        }
        return mapDbResponseToRoadmaps(data);
    },

    getPublicRoadmap: async (shareId: string): Promise<Roadmap | null> => {
        const { data, error } = await supabase
            .from('roadmaps')
            .select(`
                *,
                milestones (
                  *,
                  resources (*)
                )
            `)
            .eq('share_id', shareId)
            // We want to find a roadmap with this share_id AND (is_public OR is_template)
            .or('is_public.eq.true,is_template.eq.true')
            .single();

        if (error) {
            console.error("Error fetching public roadmap:", error);
            return null;
        }

        // Check Expiration
        if (data.public_until && new Date(data.public_until) < new Date()) {
            console.warn("Roadmap link expired");
            return null;
        }

        return mapDbResponseToRoadmaps([data])[0];
    },

    createRoadmap: async (roadmap: Roadmap) => {
        // Insert Roadmap
        const { error: rError } = await supabase
            .from('roadmaps')
            .insert({
                id: roadmap.id,
                title: roadmap.title,
                description: roadmap.description,
                is_public: roadmap.isPublic,
                user_id: roadmap.userId,
                created_at: roadmap.createdAt,
                is_template: roadmap.isTemplate || false,
                share_id: roadmap.shareId,
                category: roadmap.category
            });

        if (rError) throw rError;

        // Insert Milestones
        if (roadmap.milestones.length > 0) {
            const milestoneRows = roadmap.milestones.map(m => ({
                id: m.id,
                roadmap_id: roadmap.id,
                title: m.title,
                description: m.description,
                status: m.status,
                order: m.order
            }));

            const { error: mError } = await supabase.from('milestones').insert(milestoneRows);
            if (mError) throw mError;

            // Insert Resources
            const allResources = roadmap.milestones.flatMap(m => m.resources.map(r => ({
                id: r.id,
                milestone_id: m.id,
                title: r.title,
                url: r.url,
                type: r.type
            })));

            if (allResources.length > 0) {
                const { error: resError } = await supabase.from('resources').insert(allResources);
                if (resError) throw resError;
            }
        }
    },

    deleteRoadmap: async (roadmapId: string) => {
        const { error } = await supabase.from('roadmaps').delete().eq('id', roadmapId);
        if (error) throw error;
    },

    updateRoadmap: async (roadmap: Roadmap) => {
        // ... (existing update logic)

        const updates: any = {
            title: roadmap.title,
            description: roadmap.description,
            is_public: roadmap.isPublic,
            share_id: roadmap.shareId,
            category: roadmap.category
        };

        // Set 1 Hour Expiration for User Roadmaps when made public
        if (roadmap.isPublic && !roadmap.isTemplate) {
            const expiration = new Date();
            expiration.setHours(expiration.getHours() + 1);
            updates.public_until = expiration.toISOString();
        } else if (!roadmap.isPublic) {
            // Clear expiration if made private
            updates.public_until = null;
        }

        const { error } = await supabase.from('roadmaps').update(updates).eq('id', roadmap.id);

        if (error) throw error;
    },

    // --- Progress ---

    getUserProgress: async (userId: string): Promise<Progress[]> => {
        const { data, error } = await supabase
            .from('progress')
            .select('*')
            .eq('user_id', userId);

        if (error) throw error;
        return data.map((p: any) => ({
            id: p.id,
            userId: p.user_id,
            milestoneId: p.milestone_id,
            isCompleted: p.is_completed
        }));
    },

    saveProgress: async (progress: Progress) => {
        // Upsert progress
        const { error } = await supabase.from('progress').upsert({
            id: progress.id,
            user_id: progress.userId,
            milestone_id: progress.milestoneId,
            is_completed: progress.isCompleted
        });
        if (error) throw error;
    },

    deleteProgress: async (milestoneId: string, userId: string) => {
        const { error } = await supabase.from('progress')
            .delete()
            .match({ milestone_id: milestoneId, user_id: userId });
        if (error) throw error;
    }
};

// --- Mappers ---

function mapDbResponseToRoadmaps(rows: any[]): Roadmap[] {
    if (!rows) return [];
    return rows.map(r => ({
        id: r.id,
        title: r.title,
        description: r.description,
        isPublic: r.is_public,
        userId: r.user_id,
        createdAt: new Date(r.created_at),
        isTemplate: r.is_template,
        shareId: r.share_id,
        category: r.category,
        milestones: (r.milestones || []).sort((a: any, b: any) => a.order - b.order).map((m: any) => ({
            id: m.id,
            roadmapId: m.roadmap_id,
            title: m.title,
            description: m.description,
            status: m.status,
            order: m.order,
            resources: (m.resources || []).map((res: any) => ({
                id: res.id,
                milestoneId: res.milestone_id,
                title: res.title,
                url: res.url,
                type: res.type
            }))
        }))
    }));
}
