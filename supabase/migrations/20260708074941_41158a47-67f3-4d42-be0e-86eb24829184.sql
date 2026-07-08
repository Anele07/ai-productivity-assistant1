
-- Roles enum + user_roles + has_role
CREATE TYPE public.app_role AS ENUM ('admin', 'member');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'member',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS(SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- updated_at helper
CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  timezone TEXT NOT NULL DEFAULT 'UTC',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE TRIGGER profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Workspaces
CREATE TABLE public.workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Personal',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.workspaces TO authenticated;
GRANT ALL ON public.workspaces TO service_role;
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner manages workspace" ON public.workspaces FOR ALL TO authenticated
  USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

CREATE TABLE public.workspace_members (
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (workspace_id, user_id)
);
GRANT SELECT, INSERT, DELETE ON public.workspace_members TO authenticated;
GRANT ALL ON public.workspace_members TO service_role;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read own memberships" ON public.workspace_members FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Generations (universal AI output)
CREATE TABLE public.generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tool TEXT NOT NULL CHECK (tool IN ('email','meeting','planner','research','assistant')),
  title TEXT NOT NULL,
  input_json JSONB NOT NULL DEFAULT '{}',
  output_json JSONB,
  output_text TEXT,
  model TEXT,
  parent_id UUID REFERENCES public.generations(id) ON DELETE SET NULL,
  linked_ids UUID[] NOT NULL DEFAULT '{}',
  favorited BOOLEAN NOT NULL DEFAULT false,
  minutes_saved INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.generations TO authenticated;
GRANT ALL ON public.generations TO service_role;
ALTER TABLE public.generations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own generations" ON public.generations FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX generations_user_created ON public.generations(user_id, created_at DESC);
CREATE INDEX generations_tool ON public.generations(user_id, tool, created_at DESC);
CREATE TRIGGER generations_updated BEFORE UPDATE ON public.generations FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Action items
CREATE TABLE public.action_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source_generation_id UUID REFERENCES public.generations(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  owner TEXT,
  due_at TIMESTAMPTZ,
  done BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.action_items TO authenticated;
GRANT ALL ON public.action_items TO service_role;
ALTER TABLE public.action_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own action items" ON public.action_items FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Tasks
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source_generation_id UUID REFERENCES public.generations(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low','medium','high')),
  due_at TIMESTAMPTZ,
  time_block TEXT,
  done BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tasks TO authenticated;
GRANT ALL ON public.tasks TO service_role;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own tasks" ON public.tasks FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Conversations + messages (AI Assistant)
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'New conversation',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.conversations TO authenticated;
GRANT ALL ON public.conversations TO service_role;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own conversations" ON public.conversations FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER conversations_updated BEFORE UPDATE ON public.conversations FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user','assistant','system')),
  parts JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.messages TO authenticated;
GRANT ALL ON public.messages TO service_role;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own messages" ON public.messages FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX messages_conv ON public.messages(conversation_id, created_at);

-- Prompt templates
CREATE TABLE public.prompt_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  tool TEXT NOT NULL CHECK (tool IN ('email','meeting','planner','research','assistant')),
  body TEXT NOT NULL,
  variables JSONB NOT NULL DEFAULT '[]',
  is_system BOOLEAN NOT NULL DEFAULT false,
  favorited BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.prompt_templates TO authenticated;
GRANT ALL ON public.prompt_templates TO service_role;
ALTER TABLE public.prompt_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read own or system templates" ON public.prompt_templates FOR SELECT TO authenticated USING (is_system = true OR auth.uid() = user_id);
CREATE POLICY "insert own templates" ON public.prompt_templates FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND is_system = false);
CREATE POLICY "update own templates" ON public.prompt_templates FOR UPDATE TO authenticated USING (auth.uid() = user_id AND is_system = false);
CREATE POLICY "delete own templates" ON public.prompt_templates FOR DELETE TO authenticated USING (auth.uid() = user_id AND is_system = false);

-- Analytics events
CREATE TABLE public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tool TEXT,
  event TEXT NOT NULL,
  meta JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.analytics_events TO authenticated;
GRANT ALL ON public.analytics_events TO service_role;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own events" ON public.analytics_events FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX events_user_created ON public.analytics_events(user_id, created_at DESC);

-- Signup: create profile + workspace + membership + default role
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  new_workspace_id UUID;
  user_display TEXT;
BEGIN
  user_display := COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1));
  INSERT INTO public.profiles (id, display_name) VALUES (NEW.id, user_display);
  INSERT INTO public.workspaces (owner_id, name) VALUES (NEW.id, 'Personal') RETURNING id INTO new_workspace_id;
  INSERT INTO public.workspace_members (workspace_id, user_id, role) VALUES (new_workspace_id, NEW.id, 'owner');
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'member');
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Seed system prompt templates
INSERT INTO public.prompt_templates (name, category, tool, body, variables, is_system) VALUES
('Professional Client Update', 'Client Communication', 'email',
 'Write a professional email to {{client}} updating them on the progress of {{project}}. Highlight: {{highlights}}. Keep tone {{tone}}.',
 '[{"key":"client","label":"Client name"},{"key":"project","label":"Project"},{"key":"highlights","label":"Key highlights"},{"key":"tone","label":"Tone","default":"warm and confident"}]', true),
('Meeting Follow-up Email', 'Client Communication', 'email',
 'Draft a follow-up email after a meeting with {{attendees}} about {{topic}}. Summarize the key decisions and next steps: {{notes}}.',
 '[{"key":"attendees","label":"Attendees"},{"key":"topic","label":"Meeting topic"},{"key":"notes","label":"Meeting notes"}]', true),
('Project Proposal Outline', 'Client Communication', 'email',
 'Write a project proposal email for {{client}} covering scope: {{scope}}, timeline: {{timeline}}, and pricing approach: {{pricing}}.',
 '[{"key":"client","label":"Client"},{"key":"scope","label":"Scope"},{"key":"timeline","label":"Timeline"},{"key":"pricing","label":"Pricing"}]', true),
('Polite Decline', 'Client Communication', 'email',
 'Write a polite email declining {{request}} from {{recipient}}. Keep the door open for future collaboration. Reason (optional): {{reason}}.',
 '[{"key":"recipient","label":"Recipient"},{"key":"request","label":"Request being declined"},{"key":"reason","label":"Reason (optional)"}]', true),
('Standup Summary', 'Internal Comms', 'meeting',
 'Summarize the following standup notes into: (1) accomplished, (2) blockers, (3) today''s plan. Notes:\n\n{{notes}}',
 '[{"key":"notes","label":"Standup notes"}]', true),
('Meeting Minutes', 'Internal Comms', 'meeting',
 'Turn these raw meeting notes into structured minutes with decisions, action items (with owners), and open questions:\n\n{{notes}}',
 '[{"key":"notes","label":"Raw notes"}]', true),
('Performance Review Draft', 'HR & People', 'email',
 'Draft a performance review for {{employee}} covering strengths: {{strengths}}, areas to grow: {{growth}}, and goals for next quarter: {{goals}}.',
 '[{"key":"employee","label":"Employee"},{"key":"strengths","label":"Strengths"},{"key":"growth","label":"Growth areas"},{"key":"goals","label":"Goals"}]', true),
('Interview Preparation', 'HR & People', 'research',
 'Prepare interview questions for a {{role}} candidate. Include behavioral, technical, and culture-fit questions. Focus areas: {{focus}}.',
 '[{"key":"role","label":"Role"},{"key":"focus","label":"Focus areas"}]', true),
('Daily Plan', 'Planning', 'planner',
 'Create a focused daily work plan. My priorities today: {{priorities}}. Meetings/blocks already scheduled: {{blocks}}. Available hours: {{hours}}.',
 '[{"key":"priorities","label":"Top priorities"},{"key":"blocks","label":"Scheduled blocks"},{"key":"hours","label":"Available hours","default":"8"}]', true),
('Weekly Plan', 'Planning', 'planner',
 'Build a weekly plan for the goals: {{goals}}. Break each into 2-3 tasks with priority and suggested day.',
 '[{"key":"goals","label":"Weekly goals"}]', true),
('Executive Summary', 'Research', 'research',
 'Produce an executive summary on: {{topic}}. Include 3 key insights and 2 recommendations. Audience: {{audience}}.',
 '[{"key":"topic","label":"Topic"},{"key":"audience","label":"Audience","default":"leadership team"}]', true),
('Competitor Snapshot', 'Research', 'research',
 'Give me a concise competitor snapshot on {{competitor}} in the {{market}} market: positioning, strengths, weaknesses, and 3 lessons for us.',
 '[{"key":"competitor","label":"Competitor"},{"key":"market","label":"Market"}]', true);
