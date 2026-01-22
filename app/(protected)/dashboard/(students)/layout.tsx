import { Inter } from "next/font/google";

import { redirect } from "next/navigation";

import { getSessionUserProfile } from "@/lib/actions/user.actions";
import ContextProvider from "./studentContextProvider";
import { cachedGetUser } from "@/lib/actions/user.server.actions";
import { cachedGetProfile } from "@/lib/actions/profile.server.actions";
import { getStudentSessions } from "@/lib/actions/session.server.actions";
import { endOfWeek, startOfWeek } from "date-fns";
import StudentContextProvider from "./studentContextProvider";
import { getMeetings } from "@/lib/actions/meeting.server.actions";
const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Dashboard | ConnectMe",
  description: "Instructors can create courses here",
};

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  
  const user = await cachedGetUser();
  if (!user) redirect("/");
  const profile = await cachedGetProfile(user.id);
  if (!profile) redirect("/");

  const currentStudentSessions = getStudentSessions(profile.id, {
    startDate: startOfWeek(new Date()).toISOString(),
    endDate: endOfWeek(new Date()).toISOString(),
    orderBy: "date",
    ascending: false,
  });

  const activeStudentSessions = getStudentSessions(profile.id, {
    status: "Active",
    orderBy: "date",
    ascending: false,
  });

  const pastStudentSessions = getStudentSessions(profile.id, {
    status: ["Complete", "Cancelled"],
    orderBy: "date",
    ascending: false,
  });

  const meetings = getMeetings()

  return (
    <>
      <StudentContextProvider
        initialProfile={profile}
        currentSessionsPromise={currentStudentSessions}
        activeSessionsPromise={activeStudentSessions}
        pastSessionsPromise={pastStudentSessions}
        meetingsPromise = {meetings}
      >
        {children}
      </StudentContextProvider>
    </>
  );
}
