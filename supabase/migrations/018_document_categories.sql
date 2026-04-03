-- Add document categories: engagement (org-level) vs project (project-level)
-- Make project_id nullable so engagement docs don't need a project

ALTER TABLE public.documents
  ADD COLUMN category text NOT NULL DEFAULT 'project'
    CHECK (category IN ('engagement', 'project'));

ALTER TABLE public.documents
  ADD COLUMN engagement_type text
    CHECK (engagement_type IN ('purchase_order', 'scope_of_work', 'nda', 'msa', 'proposal', 'other'));

ALTER TABLE public.documents
  ADD COLUMN org_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE;

-- Make project_id nullable for engagement documents
ALTER TABLE public.documents
  ALTER COLUMN project_id DROP NOT NULL;

-- Backfill org_id for existing documents from their project
UPDATE public.documents d
  SET org_id = p.org_id
  FROM public.projects p
  WHERE d.project_id = p.id AND d.org_id IS NULL;

-- RLS: clients can insert documents for their own org
CREATE POLICY "clients_insert_own_documents" ON public.documents
  FOR INSERT WITH CHECK (
    org_id = public.get_user_org_id()
    OR project_id IN (SELECT id FROM public.projects WHERE org_id = public.get_user_org_id())
  );

-- RLS: update the select policy to also cover engagement docs by org_id
DROP POLICY IF EXISTS "clients_view_own_documents" ON public.documents;
CREATE POLICY "clients_view_own_documents" ON public.documents
  FOR SELECT USING (
    org_id = public.get_user_org_id()
    OR project_id IN (SELECT id FROM public.projects WHERE org_id = public.get_user_org_id())
  );
