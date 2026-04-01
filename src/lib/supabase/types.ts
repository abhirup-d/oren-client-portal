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
