import { DashboardContextProvider } from "@/contexts/dashboardContext";
import { Meeting, Profile, Session } from "@/types";
import { use } from "react";

export default function TutorContextProvider({
  children,
  initialProfile,
  currentSessionsPromise,
  pastSessionsPromise,
  activeSessionsPromise,
  meetingsPromise,
}: {
  children: React.ReactNode;
  initialProfile: Profile;
  currentSessionsPromise: Promise<Session[]>;
  pastSessionsPromise: Promise<Session[]>;
  activeSessionsPromise: Promise<Session[]>;
  meetingsPromise: Promise<Meeting[] | null>;
}) {
  const currentSessions = use(currentSessionsPromise);
  const pastSessions = use(pastSessionsPromise);
  const activeSessions = use(activeSessionsPromise);
  const meetings = use(meetingsPromise) || [];

  return (
    <DashboardContextProvider
      initialProfile={initialProfile}
      initialCurrentSessions={currentSessions}
      initialPastSessions={pastSessions}
      initialActiveSessions={activeSessions}
      initialMeetings={meetings}
    >
      {children}
    </DashboardContextProvider>
  );
}
