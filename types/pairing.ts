import { Profile } from "@/types";

type PairingStatus = "pending" | "accepted" | "rejected";

export type PairingRequest = {
  request_id: string; //uuid;
  type: "student" | "tutor";
  userId: string; //uuid
  status: string;
  priority: number;
  createdAt: Date;
  profile: Profile;
  /** When true (default), students are not matched with tutors who previously rejected them. */
  excludeRejectedTutors?: boolean;
};
export type PairingMatch = {
  id: string; //uuid
  tutor_id: string; //uuid
  student_id: string; //uuid
  tutor_status: PairingStatus;
  similarity: number; //uuid
  createdAt: Date;
};

export type PairingLog = {
  id: string;
  type:
    | "pairing-match"
    | "pairing-match-rejected"
    | "pairing-match-accepted"
    | "pairing-selection-failed";
  profile: {
    firstName: string;
    lastName: string;
    role: "student" | "tutor";
  };
  message: string;
  status: string;
  createdAt: string;
};

// DATABSE TABLE SCHEMA PairingLog = {
//   message: string;
//   type:
//     | "pairing-match"
//     | "pairing-match-rejected"
//     | "pairing-match-accepted"
//     | "pairing-selection-failed";
//   error?: boolean;
//   role?: "student" | "tutor";
//   metadata?: Record<string, any>;
// };

interface Person {
  id: string;
  email: string;
  user_id: string;
  last_name: string;
  first_name: string;
}

export interface SharedPairing {
  id: string;
  created_at: string; // ISO date string
  student_id: string;
  tutor_id: string;
  student: Person;
  tutor: Person;
}
