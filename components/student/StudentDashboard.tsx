"use client";
import React, { useState, useEffect, useCallback, use, Suspense } from "react";
// import StudentCalendar from "../StudentCalendar";
import { Input } from "@/components/ui/input";
import ActiveSessionsTable from "./components/ActiveSessionsTable";
import CurrentSessionsTable from "./components/CurrentSessionsTable";
import CompletedSessionsTable from "./components/CompletedSessionsTable";
import {
  createClientComponentClient,
  User,
} from "@supabase/auth-helpers-nextjs";
import { getProfile } from "@/lib/actions/user.actions";
import {
  updateSession,
  getMeetings,
  getAllSessions,
} from "@/lib/actions/admin.actions";
import {
  getTutorSessions,
  rescheduleSession,
  recordSessionExitForm,
} from "@/lib/actions/tutor.actions";
import { Session, Profile, Meeting } from "@/types";
import toast from "react-hot-toast";
import {
  parseISO,
  addHours,
  areIntervalsOverlapping,
  isValid,
  startOfWeek,
  endOfWeek,
  startOfDay,
  endOfDay,
} from "date-fns";
import { SelectSeparator } from "@radix-ui/react-select";
import { Description } from "@radix-ui/react-dialog";
import { getStudentSessions } from "@/lib/actions/student.actions";
import { useProfile } from "@/contexts/profileContext";
import SkeletonTable, { Skeleton } from "../ui/skeleton";

const StudentDashboard = ({
  initialProfile,
  currentSessionsPromise,
  activeSessionsPromise,
  pastSessionsPromise,
  meetingsPromise,
}: {
  initialProfile: Profile;
  currentSessionsPromise: Promise<Session[]>;
  activeSessionsPromise: Promise<Session[]>;
  pastSessionsPromise: Promise<Session[]>;
  meetingsPromise: Promise<Meeting[] | null>;
}) => {
  const initialCurrentSessions = use(currentSessionsPromise);
  const initialActiveSessions = use(activeSessionsPromise);
  const initialPastSessions = use(pastSessionsPromise);
  const initialMeetings = use(meetingsPromise);

  const [currentSessions, setCurrentSessions] = useState<Session[]>(
    initialCurrentSessions
  );
  const [pastSessions, setPastSessions] =
    useState<Session[]>(initialPastSessions);
  const [sessions, setSessions] = useState<Session[]>(initialActiveSessions);
  const [filteredSessions, setFilteredSessions] = useState<Session[]>(
    initialActiveSessions
  );
  const [filteredPastSessions, setFilteredPastSessions] =
    useState<Session[]>(initialPastSessions);
  const [meetings, setMeetings] = useState<Meeting[]>(initialMeetings || []);

  const [allSessions, setAllSessions] = useState<Session[]>([]);

  const [profile, setProfile] = useState<Profile | null>(initialProfile);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [filterValueActiveSessions, setFilterValueActiveSessions] =
    useState("");
  const [filterValuePastSessions, setFilterValuePastSessions] = useState("");
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [selectedSessionDate, setSelectedSessionDate] = useState<string | null>(
    null
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSessionExitFormOpen, setIsSessionExitFormOpen] = useState(false);

  const [notes, setNotes] = useState<string>("");
  const [nextClassConfirmed, setNextClassConfirmed] = useState<boolean>(false);

  const getUserData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      if (!profile) return;
    } catch (error) {
      console.error("Error fetching user data:", error);
      setError(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAllSessionsFromSchedule = async () => {
    try {
      const data = await getAllSessions(undefined, undefined, "date", false);
      if (!data) throw new Error("Unable to retrieve all sessions");
      setAllSessions(data);
    } catch (error) {
      console.error("Failed to fetch all sessions", error);
      throw error;
    }
  };

  const fetchDaySessionsFromSchedule = (session: Session) => {
    if (selectedSessionDate) {
      try {
        const startDateSearch = addHours(
          parseISO(selectedSessionDate),
          -12
        ).toISOString();

        const endDateSearch = addHours(
          parseISO(selectedSessionDate),
          12
        ).toISOString();
        getAllSessions(startDateSearch, endDateSearch)
          .then((data) => {
            setAllSessions(data);
          })
          .catch((error) => {
            console.error("Failed to fetch sessions for day");
          });
      } catch (error) {
        console.error("Failed to fetch sessions for day");
        throw error;
      }
    }
  };

  useEffect(() => {
    const filtered = sessions.filter(
      (session) =>
        session.student?.firstName
          .toLowerCase()
          .includes(filterValueActiveSessions.toLowerCase()) ||
        session.student?.lastName
          .toLowerCase()
          .includes(filterValueActiveSessions.toLowerCase())
    );
    setFilteredSessions(filtered);
    setCurrentPage(1);
  }, [filterValueActiveSessions, sessions]);

  useEffect(() => {
    const filtered = pastSessions.filter(
      (session) =>
        session.student?.firstName
          .toLowerCase()
          .includes(filterValuePastSessions.toLowerCase()) ||
        session.student?.lastName
          .toLowerCase()
          .includes(filterValuePastSessions.toLowerCase())
    );
    setFilteredPastSessions(filtered);
    setCurrentPage(1);
  }, [filterValuePastSessions, sessions]);

  const totalPages = Math.ceil(filteredSessions.length / rowsPerPage);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleRowsPerPageChange = (value: string) => {
    setRowsPerPage(parseInt(value));
    setCurrentPage(1);
  };

  const handleReschedule = async (
    sessionId: string,
    newDate: string,
    meetingId: string
  ) => {
    try {
      if (!profile || !profile.id) {
        console.error("No profile found cannot reschedule");
        return;
      }

      const updatedSession = await rescheduleSession(
        sessionId,
        newDate,
        meetingId
      );

      if (updatedSession) {
        setCurrentSessions(
          currentSessions.map((e: Session) =>
            e.id === updatedSession.id ? updatedSession : e
          )
        );
        setSessions(
          sessions.map((e: Session) =>
            e.id === updatedSession.id ? updatedSession : e
          )
        );
      }
      getUserData();
      setSelectedSession(null);
      setIsDialogOpen(false);
      toast.success("Session updated successfully");
    } catch (error) {
      console.error("Error requesting session reschedule:", error);
      toast.error("Failed to reschedule session");
    }
  };

  const handleStatusChange = async (updatedSession: Session) => {
    try {
      await updateSession(updatedSession);
      setCurrentSessions(
        currentSessions.map((e: Session) =>
          e.id === updatedSession.id ? updatedSession : e
        )
      );
      setSessions(
        sessions.map((e: Session) =>
          e.id === updatedSession.id ? updatedSession : e
        )
      );
      toast.success("Session updated successfully");
    } catch (error) {
      console.error("Failed to update session:", error);
      toast.error("Failed to update session");
    }
  };

  const handleSessionComplete = async (
    updatedSession: Session,
    notes: string,
    isQuestionOrConcern: boolean,
    isFirstSession: boolean
  ) => {
    try {
      await recordSessionExitForm(updatedSession.id, notes);
      updatedSession.status = "Complete";
      updatedSession.isQuestionOrConcern = isQuestionOrConcern;
      updatedSession.isFirstSession = isFirstSession;
      await updateSession(updatedSession);
      setCurrentSessions(
        currentSessions.map((e: Session) =>
          e.id === updatedSession.id ? updatedSession : e
        )
      );
      setSessions(
        sessions.map((e: Session) =>
          e.id === updatedSession.id ? updatedSession : e
        )
      );
      toast.success("Session Marked Complete");
      setIsSessionExitFormOpen(false);
      setNotes("");
      setNextClassConfirmed(false);

      //API Call to update operation logs

      if (isQuestionOrConcern) {
        const response = await fetch(
          "/api/session-exit-form/questions-concerns",
          {
            headers: {
              "Content-Type": "application/json",
            },
            method: "POST",
            body: JSON.stringify({
              tutorFirstName: updatedSession.tutor?.firstName,
              tutorLastName: updatedSession.tutor?.lastName,
              studentFirstName: updatedSession.student?.firstName,
              studentLastName: updatedSession.student?.lastName,
              formContent: notes,
              tutorEmail: updatedSession.tutor?.email,
              studentEmail: updatedSession.student?.email,
            }),
          }
        );
        const data = await response.json();

        if (!data.success) {
          toast.error("Unable to record question or concern");
          throw new Error(data.error);
        }
      }
    } catch (error) {
      console.error("Failed to record Session Exit Form", error);
      toast.error("Failed to record Session Exit Form");
    }
  };

  const paginatedSessions = filteredSessions.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const paginatedPastSessions = filteredPastSessions.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handleInputChange = (e: {
    target: { name: string; value: string };
  }) => {
    const { name, value } = e.target;

    // Helper function to handle nested updates
    const handleNestedChange = (obj: any, key: string, value: any) => {
      const keys = key.split(".");
      let temp = obj;

      keys.forEach((k, index) => {
        if (index === keys.length - 1) {
          temp[k] = value;
        } else {
          temp[k] = temp[k] || {};
          temp = temp[k];
        }
      });

      return { ...obj };
    };

    if (selectedSession) {
      setSelectedSession((prevState) =>
        handleNestedChange({ ...prevState }, name, value)
      );
    }
  };

  return (
    <>
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-6">This Week</h1>
        <div className="flex space-x-6">
          <div className="flex-grow bg-white rounded-lg shadow p-6">
            <Suspense fallback={<SkeletonTable />}>
              <CurrentSessionsTable
                currentSessions={currentSessions}
                filteredSessions={filteredSessions}
                meetings={meetings}
                currentPage={currentPage}
                totalPages={totalPages}
                rowsPerPage={rowsPerPage.toString()}
                selectedSession={selectedSession}
                selectedSessionDate={selectedSessionDate}
                isDialogOpen={isDialogOpen}
                isSessionExitFormOpen={isSessionExitFormOpen}
                notes={notes}
                nextClassConfirmed={nextClassConfirmed}
                setSelectedSession={setSelectedSession}
                setSelectedSessionDate={setSelectedSessionDate}
                setIsDialogOpen={setIsDialogOpen}
                setIsSessionExitFormOpen={setIsSessionExitFormOpen}
                setNotes={setNotes}
                setNextClassConfirmed={setNextClassConfirmed}
                handleStatusChange={handleStatusChange}
                handleReschedule={handleReschedule}
                handleSessionComplete={handleSessionComplete}
                handlePageChange={handlePageChange}
                handleRowsPerPageChange={handleRowsPerPageChange}
                handleInputChange={handleInputChange}
              />
            </Suspense>
          </div>
        </div>
      </div>{" "}
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-6">Active Sessions</h1>

        <div className="flex space-x-6">
          <div className="flex-grow bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <div className="flex space-x-2">
                <Input
                  type="text"
                  placeholder="Filter sessions..."
                  className="w-64"
                  value={filterValueActiveSessions}
                  onChange={(e) => setFilterValueActiveSessions(e.target.value)}
                />
              </div>
            </div>
            <Suspense fallback={<SkeletonTable />}>
              <ActiveSessionsTable
                paginatedSessions={paginatedSessions}
                filteredSessions={filteredSessions}
                meetings={meetings}
                currentPage={currentPage}
                totalPages={totalPages}
                rowsPerPage={rowsPerPage.toString()}
                selectedSession={selectedSession}
                selectedSessionDate={selectedSessionDate}
                isDialogOpen={isDialogOpen}
                isSessionExitFormOpen={isSessionExitFormOpen}
                notes={notes}
                nextClassConfirmed={nextClassConfirmed}
                setSelectedSession={setSelectedSession}
                setSelectedSessionDate={setSelectedSessionDate}
                setIsDialogOpen={setIsDialogOpen}
                setIsSessionExitFormOpen={setIsSessionExitFormOpen}
                setNotes={setNotes}
                setNextClassConfirmed={setNextClassConfirmed}
                handleStatusChange={handleStatusChange}
                handleReschedule={handleReschedule}
                handleSessionComplete={handleSessionComplete}
                handlePageChange={handlePageChange}
                handleRowsPerPageChange={handleRowsPerPageChange}
                handleInputChange={handleInputChange}
              />
            </Suspense>
          </div>

          {/* <div className="w-80">
            <TutorCalendar sessions={sessions} />
          </div> */}
        </div>
      </div>
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-6">Past Sessions</h1>

        <div className="flex space-x-6">
          <div className="flex-grow bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <div className="flex space-x-2">
                <Input
                  type="text"
                  placeholder="Filter sessions..."
                  className="w-64"
                  value={filterValuePastSessions}
                  onChange={(e) => setFilterValuePastSessions(e.target.value)}
                />
              </div>
            </div>

            <Suspense fallback={<SkeletonTable />}>
              {" "}
              <CompletedSessionsTable
                paginatedSessions={paginatedPastSessions}
                filteredSessions={filteredPastSessions}
                currentPage={currentPage}
                totalPages={totalPages}
                rowsPerPage={rowsPerPage.toString()}
                selectedSession={selectedSession}
                setSelectedSession={setSelectedSession}
                handlePageChange={handlePageChange}
                handleRowsPerPageChange={handleRowsPerPageChange}
              />
            </Suspense>
          </div>

          {/* <div className="w-80">
            {/* <TutorCalendar sessions={sessions} /> */}
          {/* </div>  */}
        </div>
      </div>
    </>
  );
};

export default StudentDashboard;
