import { Link, useRouterState } from "@tanstack/react-router";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Home,
  Mail,
  Calendar,
  ListChecks,
  Search,
  Sparkles,
  BookOpen,
  History,
  BarChart3,
  Settings,
  Shield,
  LogOut,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "@tanstack/react-router";

const workspace = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
];
const tools = [
  { title: "Smart Email", url: "/tools/email", icon: Mail },
  { title: "Meeting Intelligence", url: "/tools/meeting", icon: Calendar },
  { title: "Task Planner", url: "/tools/planner", icon: ListChecks },
  { title: "Research", url: "/tools/research", icon: Search },
  { title: "Assistant", url: "/tools/assistant", icon: Sparkles },
];
const knowledge = [
  { title: "Prompt Library", url: "/library", icon: BookOpen },
  { title: "History", url: "/history", icon: History },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
];
const account = [
  { title: "Settings", url: "/settings", icon: Settings },
  { title: "Responsible AI", url: "/responsible-ai", icon: Shield },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const navigate = useNavigate();

  const isActive = (url: string) => pathname === url || pathname.startsWith(url + "/");

  async function signOut() {
    navigate({ to: "/" });
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <Link to="/dashboard" className="flex items-center gap-2 px-2 py-1.5">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-foreground text-background">
            <span className="font-display text-base leading-none">T</span>
          </span>
          {!collapsed && <span className="font-semibold tracking-tight">TaskPilot</span>}
        </Link>
      </SidebarHeader>
      <SidebarContent>
        {[
          { label: "Workspace", items: workspace },
          { label: "AI Tools", items: tools },
          { label: "Knowledge", items: knowledge },
          { label: "Account", items: account },
        ].map((group) => (
          <SidebarGroup key={group.label}>
            {!collapsed && <SidebarGroupLabel>{group.label}</SidebarGroupLabel>}
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild isActive={isActive(item.url)}>
                      <Link to={item.url} className="flex items-center gap-2">
                        <item.icon className="h-4 w-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={signOut}>
              <LogOut className="h-4 w-4" />
              {!collapsed && <span>Sign out</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}