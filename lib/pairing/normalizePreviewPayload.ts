import type { PairingWorkflowPreviewPayload } from "@/types/pairing";

/** Normalize API `PairingWorkflowResult` or stored JSON into a stable preview payload */
export function normalizePairingWorkflowPreviewPayload(
  data: unknown,
): PairingWorkflowPreviewPayload {
  const raw = data as Partial<PairingWorkflowPreviewPayload> & {
    dryRun?: boolean;
  };
  const logs = raw.logs ?? [];
  const matchesToInsert = raw.matchesToInsert ?? [];
  return {
    logs,
    matchesToInsert,
    matchPreviews: raw.matchPreviews ?? [],
    summary: {
      matchedStudents: raw.summary?.matchedStudents ?? 0,
      matchedTutors: raw.summary?.matchedTutors ?? 0,
      matchesToInsert:
        raw.summary?.matchesToInsert ?? matchesToInsert.length,
      logsToInsert: raw.summary?.logsToInsert ?? logs.length,
    },
  };
}
