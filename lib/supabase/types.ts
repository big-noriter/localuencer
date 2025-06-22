export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          username: string
          full_name: string | null
          avatar_url: string | null
          role: "user" | "admin"
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          username: string
          full_name?: string | null
          avatar_url?: string | null
          role?: "user" | "admin"
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          username?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: "user" | "admin"
          created_at?: string
          updated_at?: string
        }
      }
      vlogs: {
        Row: {
          id: string
          title: string
          content: string | null
          summary: string | null
          thumbnail_url: string | null
          video_url: string | null
          type: "video" | "photo" | "text"
          category: string | null
          tags: string[] | null
          view_count: number
          like_count: number
          comment_count: number
          published: boolean
          published_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          content?: string | null
          summary?: string | null
          thumbnail_url?: string | null
          video_url?: string | null
          type?: "video" | "photo" | "text"
          category?: string | null
          tags?: string[] | null
          view_count?: number
          like_count?: number
          comment_count?: number
          published?: boolean
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          content?: string | null
          summary?: string | null
          thumbnail_url?: string | null
          video_url?: string | null
          type?: "video" | "photo" | "text"
          category?: string | null
          tags?: string[] | null
          view_count?: number
          like_count?: number
          comment_count?: number
          published?: boolean
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      qas: {
        Row: {
          id: string
          question: string
          answer: string | null
          asked_by: string | null
          answered_at: string | null
          like_count: number
          comment_count: number
          status: "pending" | "answered" | "archived"
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          question: string
          answer?: string | null
          asked_by?: string | null
          answered_at?: string | null
          like_count?: number
          comment_count?: number
          status?: "pending" | "answered" | "archived"
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          question?: string
          answer?: string | null
          asked_by?: string | null
          answered_at?: string | null
          like_count?: number
          comment_count?: number
          status?: "pending" | "answered" | "archived"
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          name: string
          description: string | null
          price: number
          image_url: string | null
          category: string | null
          stock_quantity: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          price: number
          image_url?: string | null
          category?: string | null
          stock_quantity?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          price?: number
          image_url?: string | null
          category?: string | null
          stock_quantity?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      persona_settings: {
        Row: {
          id: string
          name: string
          personality: string | null
          speech_style: string | null
          interests: string[] | null
          prohibited_words: string[] | null
          sample_sentences: string[] | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          personality?: string | null
          speech_style?: string | null
          interests?: string[] | null
          prohibited_words?: string[] | null
          sample_sentences?: string[] | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          personality?: string | null
          speech_style?: string | null
          interests?: string[] | null
          prohibited_words?: string[] | null
          sample_sentences?: string[] | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
