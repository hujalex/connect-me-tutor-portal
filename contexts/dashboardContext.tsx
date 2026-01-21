"use client";

import { Meeting, Profile, Session } from "@/types";
import { createContext, ReactNode, useContext, useState,rect";


export interface DashboardContextValue {
  // --- Data State ---
  currentSessions: Session[];
  pastSessions: Session[];
  sessions: Session[];
  filteredSessions: Session[];
  filteredPastSessions: Session[];
  meetings: Meeting[];
  allSessions: Session[];
  profile: Profile | null;
  loading: boolean;
  error: string | null;

  // --- Pagination & Filters ---
  currentPage: number;
  rowsPerPage: number;
  filterValueActiveSessions: string;
  filterValuePastSessions: string;

  // --- UI/Form State ---
  selectedSession: Session | null;
  selectedSessionDate: string | null;
  isDialogOpen: boolean;
  isSessionExitFormOpen: boolean;
  notes: string;
  nextClassConfirmed: boolean;

  // --- Setters ---
  setCurrentSessions
  setPastSessions
  setSessions
  setFilteredSessions
  setFilteredPastSessions
  setMeetings
  setAllSessions
  setProfile: nl;
  setLoading:;
 setError:nu;
  setCurrentPage:
setRowsPerPage:
setFilterValueActiveSessions:
setFilterValuePastSessions:
setSelectedSession: nl;
  setSelectedSessionDate:nu;
  setIsDialogOpen:;
 setIsSessionExitFormOpen:;
 setNotes:
setNextClassConfirmed:;



const DashboardContext = createContext<DashboardContextValue | null>(null);

export function DashboardContextProvider({
  children,
  initialProfile,
  initialCurrentSessions,
  initialPastSessions,
  initialActiveSessions,
  initialMeetings,
}: {
  children: ReactNode;
  initialProfile: Profile;
  initialCurrentSessions: Session[];
  initialPastSessions: Session[];
  initialActiveSessions: Session[];
  initialMeetings: Meeting[]
}) {

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
  
    // const { profile, setProfile } = useProfile();
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
  
    
  const contextValue: DashboardContextValue = {
    currentSessions,
  pastSessions,
  sessions,
  filteredSessions,
  filteredPastSessions,
  meetings,
  allSessions,
  profile,
  loading,
  error,

  // --- Pagination & Filters ---
  currentPage,
  rowsPerPage,
  filterValueActiveSessions,
  filterValuePastSessions,

  // --- UI/Form State ---
  selectedSession,
  selectedSessionDate,
  isDialogOpen,
  isSessionExitFormOpen,
  notes,
  nextClassConfirmed,

  // --- Setters ---
  setCurrentSessions,
  setPastSessions,
  setSessions,
  setFilteredSessions,
  setFilteredPastSessions
  setMeetings
  setAllSessions
  setProfile: nl;
  setLoading:;
 setError:nu;
  setCurrentPage:
setRowsPerPage:
setFilterValueActiveSessions:
setFilterValuePastSessions:
setSelectedSession: nl;
  setSelectedSessionDate:nu;
  setIsDialogOpen:;
 setIsSessionExitFormOpen:;
 setNotes:
setNextClassConfirmed:;
 };

  return (
    <DashboardContext.Provider value={contextValue}>
      {children}
    </DashboardContext.Provider>
  );
}
