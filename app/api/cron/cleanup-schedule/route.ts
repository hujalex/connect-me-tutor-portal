import { NextResponse } from "next/server";
import { cancelUnsubmittedSEFCron } from "@/lib/actions/session.server.actions";
import { deleteInactiveEnrollments } from "@/lib/actions/enrollment.server.actions";

export const dynamic = "force-dynamic";

export async function GET() {
  const results = {
    cancelUnsubmittedSEF: {
      success: false,
      cancelled: 0,
      error: undefined as string | undefined,
    },
    deleteInactiveEnrollments: {
      success: false as boolean,
      deleted: 0,
      error: undefined as string | undefined,
    },
  };

  // Task 1: Cancel unsubmitted SEFs
  const cancelResult = await cancelUnsubmittedSEFCron();
  results.cancelUnsubmittedSEF = cancelResult;

  // Task 2: Delete inactive enrollments
  const deleteResult = await deleteInactiveEnrollments();
  results.deleteInactiveEnrollments = deleteResult;

  const hasErrors =
    !results.cancelUnsubmittedSEF.success ||
    !results.deleteInactiveEnrollments.success;

  return NextResponse.json(
    {
      message: hasErrors
        ? "Cleanup completed with errors"
        : "Cleanup completed successfully",
      results,
    },
    { status: hasErrors ? 207 : 200 },
  );
}
