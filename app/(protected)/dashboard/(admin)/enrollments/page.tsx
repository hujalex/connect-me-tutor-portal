import EnrollmentsManager from "@/components/admin/EnrollmentsManagement";
import SkeletonTable, { SkeletonCard } from "@/components/ui/skeleton";
import { getAllEnrollments } from "@/lib/actions/enrollment.server.actions";
import { getMeetings } from "@/lib/actions/meeting.server.actions";
import { getAllProfiles } from "@/lib/actions/profile.server.actions";
import { Suspense } from "react";

async function MyEnrollmentsData() {
  // const [enrollments, meetings, students, tutors] = await Promise.all([
  //   getAllEnrollments(),
  //   getMeetings(),
  //   getAllProfiles("Student").then((s) =>
  //     s ? s.filter((s) => s.status === "Active") : null
  //   ),
  //   getAllProfiles("Tutor").then((s) =>
  //     s ? s.filter((s) => s.status === "Active") : null
  //   ),
  // ]);

  const enrollments = getAllEnrollments();
  const meetings = getMeetings();
  const students = getAllProfiles("Student")
  const tutors = getAllProfiles("Tutor")

  return (
    <EnrollmentsManager
      enrollmentsPromise={enrollments}
      meetingsPromise={meetings}
      studentsPromise={students}
      tutorsPromise={tutors}
      // initialEnrollments={enrollments}
      // initialMeetings={meetings}
      // initialStudents={students}
      // initialTutors={tutors}
    />
  );
}

export default function MyEnrollmentsPage() {
  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-6">All Enrollments</h1>
      <Suspense fallback={<SkeletonTable />}>
        <MyEnrollmentsData />
      </Suspense>
    </main>
  );
}
