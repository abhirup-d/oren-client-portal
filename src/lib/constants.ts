import {
  LayoutDashboard,
  FolderKanban,
  FileText,
  CheckCircle,
  Receipt,
  BarChart3,
  Calendar,
  ExternalLink,
  Settings,
  Users,
  type LucideIcon,
} from "lucide-react";

export const PROJECT_TYPES = {
  dma: { label: "DMA", color: "bg-purple-500" },
  ecovadis: { label: "EcoVadis", color: "bg-emerald-500" },
  brsr: { label: "BRSR", color: "bg-blue-500" },
  sustainability_report: { label: "SR Report", color: "bg-amber-500" },
  custom: { label: "Custom", color: "bg-gray-500" },
} as const;

export const PROJECT_STATUSES = {
  active: { label: "Active", color: "bg-green-500" },
  completed: { label: "Completed", color: "bg-blue-500" },
  on_hold: { label: "On Hold", color: "bg-yellow-500" },
  cancelled: { label: "Cancelled", color: "bg-red-500" },
} as const;

export const DOCUMENT_STATUSES = {
  draft: { label: "Draft", color: "bg-gray-500" },
  review: { label: "In Review", color: "bg-yellow-500" },
  approved: { label: "Approved", color: "bg-green-500" },
  final: { label: "Final", color: "bg-blue-500" },
} as const;

export const DOCUMENT_TYPES = {
  deliverable: { label: "Deliverable" },
  working_doc: { label: "Working Doc" },
} as const;

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: boolean;
};

export const CLIENT_NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Projects", href: "/projects", icon: FolderKanban },
  { label: "Documents", href: "/documents", icon: FileText },
  { label: "Approvals", href: "/approvals", icon: CheckCircle, badge: true },
  { label: "Billing", href: "/billing", icon: Receipt },
  { label: "Reports", href: "/reports", icon: BarChart3 },
  { label: "Schedule", href: "/schedule", icon: Calendar },
  { label: "Apps", href: "/apps", icon: ExternalLink },
  { label: "Settings", href: "/settings", icon: Settings },
];

export const ADMIN_NAV_ITEMS: NavItem[] = [
  { label: "Clients", href: "/admin/clients", icon: Users },
  { label: "Projects", href: "/admin/projects", icon: FolderKanban },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];
