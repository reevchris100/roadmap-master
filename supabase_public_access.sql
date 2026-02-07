-- Allow everyone (including anonymous users) to view public roadmaps
create policy "Everyone can view public roadmaps"
on roadmaps for select
using (is_public = true);

-- Allow viewing milestones of public roadmaps
create policy "View milestones of public roadmaps"
on milestones for select
using (
  exists (select 1 from roadmaps r where r.id = milestones.roadmap_id and r.is_public = true)
);

-- Allow viewing resources of public roadmaps
create policy "View resources of public roadmaps"
on resources for select
using (
  exists (select 1 from milestones m join roadmaps r on m.roadmap_id = r.id where m.id = resources.milestone_id and r.is_public = true)
);
