/**
 * Partial Supabase schema for pairing (extend when running supabase gen types).
 * Regenerate full Database type with: npx supabase gen types typescript --project-id <id>
 */

export type PairingRequestsRow = {
  id: string;
  created_at: string;
  notes: string | null;
  priority: number;
  status: string;
  type: string;
  user_id: string;
  in_queue: boolean;
  exclude_rejected_tutors?: boolean | null;
};

export type PairingMatchesRow = {
  id: string;
  created_at: string;
  student_id: string;
  tutor_id: string;
  tutor_status: string | null;
  similarity: number | null;
  rejected_at: string | null;
};
