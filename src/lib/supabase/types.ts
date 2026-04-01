export type Database = {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string;
          name: string;
          logo_url: string | null;
          brand_color: string | null;
          onboarding_completed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          logo_url?: string | null;
          brand_color?: string | null;
          onboarding_completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          logo_url?: string | null;
          brand_color?: string | null;
          onboarding_completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      admin_users: {
        Row: {
          id: string;
          email: string;
          name: string;
          role: "admin" | "pm";
          calendar_availability: Record<string, unknown> | null;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name: string;
          role: "admin" | "pm";
          calendar_availability?: Record<string, unknown> | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          role?: "admin" | "pm";
          calendar_availability?: Record<string, unknown> | null;
          created_at?: string;
        };
        Relationships: [];
      };
      users: {
        Row: {
          id: string;
          org_id: string;
          email: string;
          name: string;
          role: "owner" | "member";
          last_login_at: string | null;
          notification_prefs: Record<string, unknown> | null;
          whatsapp_number: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          org_id: string;
          email: string;
          name: string;
          role: "owner" | "member";
          last_login_at?: string | null;
          notification_prefs?: Record<string, unknown> | null;
          whatsapp_number?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          email?: string;
          name?: string;
          role?: "owner" | "member";
          last_login_at?: string | null;
          notification_prefs?: Record<string, unknown> | null;
          whatsapp_number?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      projects: {
        Row: {
          id: string;
          org_id: string;
          title: string;
          type: "dma" | "ecovadis" | "brsr" | "sustainability_report" | "custom";
          status: "active" | "completed" | "on_hold" | "cancelled";
          current_phase: string | null;
          phases: Array<{
            name: string;
            status: string;
            order: number;
            started_at: string | null;
            completed_at: string | null;
          }>;
          start_date: string | null;
          target_end_date: string | null;
          assigned_pm_id: string | null;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          title: string;
          type: "dma" | "ecovadis" | "brsr" | "sustainability_report" | "custom";
          status: "active" | "completed" | "on_hold" | "cancelled";
          current_phase?: string | null;
          phases: Array<{
            name: string;
            status: string;
            order: number;
            started_at: string | null;
            completed_at: string | null;
          }>;
          start_date?: string | null;
          target_end_date?: string | null;
          assigned_pm_id?: string | null;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          title?: string;
          type?: "dma" | "ecovadis" | "brsr" | "sustainability_report" | "custom";
          status?: "active" | "completed" | "on_hold" | "cancelled";
          current_phase?: string | null;
          phases?: Array<{
            name: string;
            status: string;
            order: number;
            started_at: string | null;
            completed_at: string | null;
          }>;
          start_date?: string | null;
          target_end_date?: string | null;
          assigned_pm_id?: string | null;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      documents: {
        Row: {
          id: string;
          project_id: string;
          title: string;
          file_path: string;
          file_size: number;
          mime_type: string;
          type: "deliverable" | "working_doc";
          version: number;
          status: "draft" | "review" | "approved" | "final";
          uploaded_by: string;
          uploaded_by_type: "client" | "admin";
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          title: string;
          file_path: string;
          file_size: number;
          mime_type: string;
          type: "deliverable" | "working_doc";
          version?: number;
          status: "draft" | "review" | "approved" | "final";
          uploaded_by: string;
          uploaded_by_type: "client" | "admin";
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          title?: string;
          file_path?: string;
          file_size?: number;
          mime_type?: string;
          type?: "deliverable" | "working_doc";
          version?: number;
          status?: "draft" | "review" | "approved" | "final";
          uploaded_by?: string;
          uploaded_by_type?: "client" | "admin";
          created_at?: string;
        };
        Relationships: [];
      };
      activity_log: {
        Row: {
          id: string;
          org_id: string;
          project_id: string | null;
          actor_id: string;
          actor_type: "client" | "admin";
          action: string;
          details: Record<string, unknown> | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          project_id?: string | null;
          actor_id: string;
          actor_type: "client" | "admin";
          action: string;
          details?: Record<string, unknown> | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          project_id?: string | null;
          actor_id?: string;
          actor_type?: "client" | "admin";
          action?: string;
          details?: Record<string, unknown> | null;
          created_at?: string;
        };
        Relationships: [];
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          body: string;
          link: string | null;
          read: boolean;
          channels_sent: string[];
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          body: string;
          link?: string | null;
          read?: boolean;
          channels_sent: string[];
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          body?: string;
          link?: string | null;
          read?: boolean;
          channels_sent?: string[];
          created_at?: string;
        };
        Relationships: [];
      };
      approvals: {
        Row: {
          id: string;
          project_id: string;
          title: string;
          description: string | null;
          type: "deliverable" | "scope_change" | "budget" | "timeline" | "data_submission";
          status: "pending" | "approved" | "rejected";
          requested_by: string;
          decided_by: string | null;
          decided_at: string | null;
          linked_document_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          title: string;
          description?: string | null;
          type: "deliverable" | "scope_change" | "budget" | "timeline" | "data_submission";
          status?: "pending" | "approved" | "rejected";
          requested_by: string;
          decided_by?: string | null;
          decided_at?: string | null;
          linked_document_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          title?: string;
          description?: string | null;
          type?: "deliverable" | "scope_change" | "budget" | "timeline" | "data_submission";
          status?: "pending" | "approved" | "rejected";
          requested_by?: string;
          decided_by?: string | null;
          decided_at?: string | null;
          linked_document_id?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      comments: {
        Row: {
          id: string;
          project_id: string;
          user_id: string;
          user_type: "client" | "admin";
          body: string;
          target_type: "document" | "approval" | "milestone";
          target_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          user_id: string;
          user_type: "client" | "admin";
          body: string;
          target_type: "document" | "approval" | "milestone";
          target_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          user_id?: string;
          user_type?: "client" | "admin";
          body?: string;
          target_type?: "document" | "approval" | "milestone";
          target_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      digest_cache: {
        Row: {
          id: string;
          user_id: string;
          period_start: string;
          period_end: string;
          summary: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          period_start: string;
          period_end: string;
          summary: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          period_start?: string;
          period_end?: string;
          summary?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      invoices: {
        Row: {
          id: string;
          org_id: string;
          zoho_invoice_id: string | null;
          invoice_number: string;
          amount: number;
          currency: string;
          status: "pending" | "paid" | "overdue" | "partially_paid";
          due_date: string | null;
          payment_url: string | null;
          synced_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          zoho_invoice_id?: string | null;
          invoice_number: string;
          amount: number;
          currency?: string;
          status?: "pending" | "paid" | "overdue" | "partially_paid";
          due_date?: string | null;
          payment_url?: string | null;
          synced_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          zoho_invoice_id?: string | null;
          invoice_number?: string;
          amount?: number;
          currency?: string;
          status?: "pending" | "paid" | "overdue" | "partially_paid";
          due_date?: string | null;
          payment_url?: string | null;
          synced_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      meetings: {
        Row: {
          id: string;
          org_id: string;
          project_id: string | null;
          title: string;
          scheduled_at: string;
          duration_minutes: number;
          booked_by: string;
          pm_id: string;
          status: "scheduled" | "completed" | "cancelled";
          notes: string | null;
          google_calendar_event_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          project_id?: string | null;
          title: string;
          scheduled_at: string;
          duration_minutes?: number;
          booked_by: string;
          pm_id: string;
          status?: "scheduled" | "completed" | "cancelled";
          notes?: string | null;
          google_calendar_event_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          project_id?: string | null;
          title?: string;
          scheduled_at?: string;
          duration_minutes?: number;
          booked_by?: string;
          pm_id?: string;
          status?: "scheduled" | "completed" | "cancelled";
          notes?: string | null;
          google_calendar_event_id?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      esg_metrics: {
        Row: {
          id: string;
          project_id: string;
          metric_name: string;
          value: number;
          unit: string | null;
          recorded_at: string;
          period: string;
          source: "manual" | "computed";
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          metric_name: string;
          value: number;
          unit?: string | null;
          recorded_at?: string;
          period: string;
          source?: "manual" | "computed";
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          metric_name?: string;
          value?: number;
          unit?: string | null;
          recorded_at?: string;
          period?: string;
          source?: "manual" | "computed";
          created_at?: string;
        };
        Relationships: [];
      };
      app_shortcuts: {
        Row: {
          id: string;
          org_id: string;
          label: string;
          url: string;
          icon: string;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          label: string;
          url: string;
          icon?: string;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          label?: string;
          url?: string;
          icon?: string;
          sort_order?: number;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
};

// Convenience aliases
export type Organization = Database["public"]["Tables"]["organizations"]["Row"];
export type AdminUser = Database["public"]["Tables"]["admin_users"]["Row"];
export type User = Database["public"]["Tables"]["users"]["Row"];
export type Project = Database["public"]["Tables"]["projects"]["Row"];
export type Document = Database["public"]["Tables"]["documents"]["Row"];
export type ActivityLog = Database["public"]["Tables"]["activity_log"]["Row"];
export type Notification = Database["public"]["Tables"]["notifications"]["Row"];
export type Approval = Database["public"]["Tables"]["approvals"]["Row"];
export type Comment = Database["public"]["Tables"]["comments"]["Row"];
export type DigestCache = Database["public"]["Tables"]["digest_cache"]["Row"];
export type Invoice = Database["public"]["Tables"]["invoices"]["Row"];
export type Meeting = Database["public"]["Tables"]["meetings"]["Row"];
export type EsgMetric = Database["public"]["Tables"]["esg_metrics"]["Row"];
export type AppShortcut = Database["public"]["Tables"]["app_shortcuts"]["Row"];
