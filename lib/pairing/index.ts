"use server"
import { PairingMatch } from "@/types/pairing";
import { createClient } from "../supabase/server";
import { Person } from "@/types/enrollment";
import { PairingLogSchemaType } from "./types";
import { PairingRequestNotificationEmailProps } from "@/types/email";
import { getProfileWithProfileId } from "../actions/user.actions";
import {
  sendPairingRequestEmail,
} from "../actions/email.server.actions";
import { getRejectedTutorIdsForStudent } from "../actions/pairing.server.actions";
import { Profile } from "@/types";

type QueueItem = {
  pairing_request_id: string;
  profile_id: string;
};


type QueueItemMatch = QueueItem & {
  similarity: number;
  match_profile: Person;
  requestor_profile: Person;
};


const sendPairingRequestNotification = async (
  tutorId: string,
  studentId: string
) => {
  const tutorData: Profile | null = await getProfileWithProfileId(tutorId);

  const studentData: Profile | null = await getProfileWithProfileId(studentId);


  if (tutorData && studentData) {
    const emailData: PairingRequestNotificationEmailProps = {
      tutor: tutorData,
      student: studentData,
    };
    return sendPairingRequestEmail(emailData, tutorData.email);
  }
};


const buildMatches = async (matches: QueueItemMatch[]): Promise<PairingMatch[]> => {
  return matches.map((match) => ({
    student_id: match.requestor_profile.id,
    tutor_id: match.match_profile.id,
    similarity: match.similarity,
  }) as PairingMatch)
}

export const runPairingWorkflow = async () => {
  const logs: PairingLogSchemaType[] = [];

  const supabase = await createClient();

  // Get top pairing requests for tutors & students
  const [tutorQueueResult, studentQueueResult] = await Promise.all([
    supabase.rpc("get_top_pairing_request", { request_type: "tutor" }),
    supabase.rpc("get_top_pairing_request", { request_type: "student" }),
  ]);

  const [tutorQueue, studentQueue] = [
    tutorQueueResult.data ?? [],
    studentQueueResult.data ?? [],
  ] as [QueueItem[], QueueItem[]];

  // Alternate pairing: student, tutor, student, tutor
  const maxLength = Math.max(studentQueue.length, tutorQueue.length);

  const studentMatches: QueueItemMatch[] = [];
  const tutorMatches: QueueItemMatch[] = [];

  for (let i = 0; i < maxLength; i++) {
    // Handle students first (student → tutor)
    if (i < studentQueue.length) {
      const studentReq = studentQueue[i];
      // Fetch request row to check exclude_rejected_tutors preference
      const { data: requestRow } = await supabase
        .from("pairing_requests")
        .select("exclude_rejected_tutors")
        .eq("id", studentReq.pairing_request_id)
        .single();

      const excludeRejected = requestRow?.exclude_rejected_tutors ?? true;
      const excludedTutorIds: string[] =
        excludeRejected ? await getRejectedTutorIdsForStudent(studentReq.profile_id) : [];

      const rpcParams: { request_type: string; request_id: string; p_exclude_tutor_ids?: string[] } = {
        request_type: "student",
        request_id: studentReq.pairing_request_id,
      };
      if (excludedTutorIds.length > 0) {
        rpcParams.p_exclude_tutor_ids = excludedTutorIds;
      }

      const { data, error } = await supabase
        .rpc("get_best_match", rpcParams)
        .single();

      const result = data as QueueItemMatch | null;
      // PGRST116 means no rows found, which is expected when there are no matches
      if (error && error.code !== "PGRST116") {
        console.error("Student best_match error:", error);
      }

      // Fallback: if RPC doesn't support p_exclude_tutor_ids, skip matches with rejected tutors
      const isExcluded =
        result &&
        excludedTutorIds.length > 0 &&
        excludedTutorIds.includes(result.match_profile.id);

      if (result && !isExcluded) {
        const { requestor_profile, match_profile } = result;
        logs.push({
          message: `${requestor_profile.first_name} ${requestor_profile.last_name} matched with ${match_profile?.first_name} ${match_profile?.last_name}`,
          type: "pairing-match",
          error: false,
          metadata: {
            pairing_request_id: studentReq.pairing_request_id,
            match_profile_id: result.match_profile.id,
          },
        });

        studentMatches.push(result);
      } else {
        logs.push({
          message: isExcluded
            ? "Skipped match (tutor previously declined student)"
            : "Failed to find pairing for student",
          type: "pairing-selection-failed",
          error: true,
          metadata: {
            pairing_request_id: studentReq.pairing_request_id,
          },
        });
      }
    }

    // Handle tutors (tutor → student)
    if (i < tutorQueue.length) {
      const tutorReq = tutorQueue[i];
      const { data, error } = await supabase
        .rpc("get_best_match", {
          request_type: "tutor",
          request_id: tutorReq.pairing_request_id,
        })
        .single();

      const result = data as QueueItemMatch;
      // PGRST116 means no rows found, which is expected when there are no matches
      if (error && error.code !== 'PGRST116') {
        console.error("Tutor best_match error:", error);
      }

      if (result as QueueItemMatch) {
        console.log("MATCH", result.requestor_profile.id, result.match_profile.id)
        
        tutorMatches.push(result as QueueItemMatch);
        logs.push({
          message: `Tutor ${result.requestor_profile.first_name} matched with ${result.match_profile.first_name}`,
          type: "pairing-match",
          error: false,
          metadata: {
            pairing_request_id: tutorReq.pairing_request_id,
            match_profile_id: result.match_profile.id,
          },
        });
      } else {
        logs.push({
          message: "Failed to find pairing for tutor",
          type: "pairing-selection-failed",
          error: true,
          metadata: {
            pairing_request_id: tutorReq.pairing_request_id,
          },
        });
      }
    }
  }

  // Build matches for DB insert
  const matchedStudents: PairingMatch[] = await buildMatches(studentMatches)
  const matchedTutors: PairingMatch[] = await buildMatches(tutorMatches)


  // Insert pairing matches to track all suggested matches
  // Handle duplicates gracefully (users stay in queue and may get same matches on subsequent runs)
  const matchesToInsert = [...matchedStudents, ...matchedTutors].filter(
    ({ similarity }) => similarity
  );
  
  if (matchesToInsert.length > 0) {
    const { data: matchesData, error: matchesError } = await supabase
      .from("pairing_matches")
      .insert(matchesToInsert);
    
    // 23505 is duplicate key error - expected when match already exists, so we ignore it
    if (matchesError && matchesError.code !== '23505') {
      console.error("Failed to insert pairing matches:", matchesError);
    }
  }

  // Insert logs for all match attempts (both successful and failed)
  const { error: logError } = await supabase
    .from("pairing_logs")
    .insert(logs);
  
  if (logError) {
    console.error("Failed to insert pairing logs:", logError);
  }
};
