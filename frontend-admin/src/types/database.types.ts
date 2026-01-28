export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

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
          created_at?: string
          updated_at?: string
          last_login?: string | null
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
          created_at?: string
          updated_at?: string
          last_login?: string | null
        }
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
          id?: number
          numero: string
          nfc_tag_uid?: string | null
          qr_code: string
          stato?: 'libero' | 'occupato' | 'manutenzione' | 'fuori_servizio'
          user_id?: string | null
          timestamp_assegnazione?: string | null
          timestamp_ultimo_accesso?: string | null
          created_at?: string
          posizione?: string | null
          note?: string | null
        }
        Update: {
          id?: number
          numero?: string
          nfc_tag_uid?: string | null
          qr_code?: string
          stato?: 'libero' | 'occupato' | 'manutenzione' | 'fuori_servizio'
          user_id?: string | null
          timestamp_assegnazione?: string | null
          timestamp_ultimo_accesso?: string | null
          created_at?: string
          posizione?: string | null
          note?: string | null
        }
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
      }
    }
    Functions: {
      identify_code: {
        Args: { p_code: string }
        Returns: Json
      }
      checkin_user: {
        Args: { p_user_id: string; p_code: string; p_metodo: string }
        Returns: Json
      }
      unlock_locker: {
        Args: { p_user_id: string; p_code: string; p_metodo: string }
        Returns: Json
      }
      checkout_user: {
        Args: { p_user_id: string; p_code: string; p_metodo: string }
        Returns: Json
      }
    }
  }
}
