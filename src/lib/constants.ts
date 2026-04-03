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

export const DOCUMENT_CATEGORIES = {
  engagement: { label: "Engagement Documents" },
  project: { label: "Project Documents" },
} as const;

export const ENGAGEMENT_TYPES = {
  purchase_order: { label: "Purchase Order" },
  scope_of_work: { label: "Scope of Work" },
  nda: { label: "NDA" },
  msa: { label: "Master Service Agreement" },
  proposal: { label: "Proposal" },
  other: { label: "Other" },
} as const;

export const APPROVAL_TYPES = {
  deliverable: { label: "Deliverable", color: "bg-blue-500" },
  scope_change: { label: "Scope Change", color: "bg-orange-500" },
  budget: { label: "Budget", color: "bg-green-500" },
  timeline: { label: "Timeline", color: "bg-purple-500" },
  data_submission: { label: "Data Submission", color: "bg-teal-500" },
} as const;

export const APPROVAL_STATUSES = {
  pending: { label: "Pending", color: "bg-yellow-500" },
  approved: { label: "Approved", color: "bg-green-500" },
  rejected: { label: "Rejected", color: "bg-red-500" },
} as const;

export const INVOICE_STATUSES = {
  pending: { label: "Pending", color: "bg-yellow-500" },
  paid: { label: "Paid", color: "bg-green-500" },
  overdue: { label: "Overdue", color: "bg-red-500" },
  partially_paid: { label: "Partial", color: "bg-orange-500" },
} as const;

export const MEETING_STATUSES = {
  scheduled: { label: "Scheduled", color: "bg-blue-500" },
  completed: { label: "Completed", color: "bg-green-500" },
  cancelled: { label: "Cancelled", color: "bg-red-500" },
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
  { label: "Approvals", href: "/admin/approvals", icon: CheckCircle },
  { label: "Metrics", href: "/admin/metrics", icon: BarChart3 },
  { label: "Apps", href: "/admin/apps", icon: ExternalLink },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];
