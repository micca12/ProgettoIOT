export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          nome: string
          cognome: string
          telefono: string | null
          badge_uid: string | null
          tipo: 'studente' | 'admin'
          attivo: boolean
          created_at: string
          updated_at: string
          last_login: string | null
        }
        Insert: {
          id?: string
          email: string
          nome: string
          cognome: string
          telefono?: string | null
          badge_uid?: string | null
          tipo?: 'studente' | 'admin'
          attivo?: boolean
        }
        Update: {
          id?: string
          email?: string
          nome?: string
          cognome?: string
          telefono?: string | null
          badge_uid?: string | null
          tipo?: 'studente' | 'admin'
          attivo?: boolean
        }
        Relationships: []
      }
      lockers: {
        Row: {
          id: number
          numero: string
          nfc_tag_uid: string | null
          qr_code: string
          stato: 'libero' | 'occupato' | 'manutenzione' | 'fuori_servizio'
          user_id: string | null
          timestamp_assegnazione: string | null
          timestamp_ultimo_accesso: string | null
          created_at: string
          posizione: string | null
          note: string | null
        }
        Insert: {
          numero: string
          qr_code: string
          nfc_tag_uid?: string | null
          stato?: 'libero' | 'occupato' | 'manutenzione' | 'fuori_servizio'
          posizione?: string | null
          note?: string | null
        }
        Update: {
          numero?: string
          qr_code?: string
          nfc_tag_uid?: string | null
          stato?: 'libero' | 'occupato' | 'manutenzione' | 'fuori_servizio'
          user_id?: string | null
          posizione?: string | null
          note?: string | null
        }
        Relationships: []
      }
      access_logs: {
        Row: {
          id: number
          user_id: string | null
          locker_numero: string | null
          azione: 'checkin' | 'unlock' | 'checkout'
          metodo: 'badge' | 'nfc' | 'qr'
          code_scanned: string | null
          success: boolean
          error_message: string | null
          ip_address: string | null
          user_agent: string | null
          timestamp: string
          duration_ms: number | null
        }
        Insert: {
          azione: 'checkin' | 'unlock' | 'checkout'
          metodo: 'badge' | 'nfc' | 'qr'
          success?: boolean
        }
        Update: {
          azione?: 'checkin' | 'unlock' | 'checkout'
          metodo?: 'badge' | 'nfc' | 'qr'
        }
        Relationships: []
      }
      special_tags: {
        Row: {
          id: number
          tipo: 'ingresso' | 'uscita'
          badge_uid: string | null
          nfc_uid: string | null
          qr_code: string
          posizione: string
          attivo: boolean
          created_at: string
        }
        Insert: {
          tipo: 'ingresso' | 'uscita'
          qr_code: string
          posizione: string
        }
        Update: {
          tipo?: 'ingresso' | 'uscita'
          attivo?: boolean
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
