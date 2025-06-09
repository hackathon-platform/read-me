export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      events: {
        Row: {
          id: string;
          created_at: string;
          title: string;
          description: string;
          organizer_id: string;
          location: string;
          start_date: string;
          end_date: string;
          image_url: string | null;
          category: string;
          max_participants: number | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          title: string;
          description: string;
          organizer_id: string;
          location: string;
          start_date: string;
          end_date: string;
          image_url?: string | null;
          category: string;
          max_participants?: number | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          title?: string;
          description?: string;
          organizer_id?: string;
          location?: string;
          start_date?: string;
          end_date?: string;
          image_url?: string | null;
          category?: string;
          max_participants?: number | null;
        };
      };
      participants: {
        Row: {
          id: string;
          created_at: string;
          event_id: string;
          user_id: string;
          status: "attending" | "interested" | "not_attending";
        };
        Insert: {
          id?: string;
          created_at?: string;
          event_id: string;
          user_id: string;
          status: "attending" | "interested" | "not_attending";
        };
        Update: {
          id?: string;
          created_at?: string;
          event_id?: string;
          user_id?: string;
          status?: "attending" | "interested" | "not_attending";
        };
      };
      profile: {
        Row: {
          id: string;
          updated_at: string;
          full_name: string;
          email: string;
          avatar_url: string | null;
          bio: string | null;
        };
        Insert: {
          id: string;
          updated_at?: string;
          full_name: string;
          email: string;
          avatar_url?: string | null;
          bio?: string | null;
        };
        Update: {
          id?: string;
          updated_at?: string;
          full_name?: string;
          email?: string;
          avatar_url?: string | null;
          bio?: string | null;
        };
      };
    };
  };
}
