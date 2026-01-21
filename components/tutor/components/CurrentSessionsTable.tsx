import React from "react";
import { useState } from "react";
import {
  formatSessionDate,
  formatDateAdmin,
  formatSessionDuration,
} from "@/lib/utils";
import { Session, Meeting } from "@/types";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  AlertDialog,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {
  Circle,
  CircleCheckBig,
  CircleX,
  Clock,
  Loader2,
  ChevronsLeft,
  ChevronsRight,
  ChevronLeft,
  ChevronRight,
  Trash,
  CalendarDays,
  UserRoundPlus,
  CircleCheck,
  X,
} from "lucide-react";
import { format, parseISO, isAfter } from "date-fns";
import { AlertDialogTrigger } from "@radix-ui/react-alert-dialog";
import SessionExitForm from "./SessionExitForm";
import RescheduleForm from "./RescheduleDialog";
import CancellationForm from "./CancellationForm";

interface CurrentSessionTableProps {
  currentSessions: Session[];
  filteredSessions: Session[];
  meetings: Meeting[];
  currentPage: number;
  totalPages: number;
  rowsPerPage: string;
  selectedSession: Session | null;
  selectedSessionDate: string | null;
  isDialogOpen: boolean;
  isSessionExitFormOpen: boolean;
  notes: string;
  nextClassConfirmed: boolean;
  setSelectedSession: (session: Session | null) => void;
  setSelectedSessionDate: (date: string | null) => void;
  setIsDialogOpen: (open: boolean) => void;
  setIsSessionExitFormOpen: (open: boolean) => void;
  setNotes: (notes: string) => void;
  setNextClassConfirmed: (confirmed: boolean) => void;
  handleStatusChange: (session: Session) => void;
  handleReschedule: (
    sessionId: string,
    newDate: string,
    meetingId: string
  ) => void;
  handleSessionComplete: (
    session: Session,
    notes: string,
    isQuestionOrConcern: boolean,
    isFirstSession: boolean
  ) => void;
  handlePageChange: (page: number) => void;
  handleRowsPerPageChange: (value: string) => void;
  handleInputChange: (e: { target: { name: string; value: string } }) => void;
  handleUndoCancel?: (sessionId: string) => void;
}

const CurrentSessionsTable: React.FC<CurrentSessionTableProps> = ({
  currentSessions,
  filteredSessions,
  meetings,
  currentPage,
  totalPages,
  rowsPerPage,
  selectedSession,
  selectedSessionDate,
  isDialogOpen,
  isSessionExitFormOpen,
  notes,
  nextClassConfirmed,
  setSelectedSession,
  setSelectedSessionDate,
  setIsDialogOpen,
  setIsSessionExitFormOpen,
  setNotes,
  setNextClassConfirmed,
  handleStatusChange,
  handleReschedule,
  handleSessionComplete,
  handlePageChange,
  handleRowsPerPageChange,
  handleInputChange,
  handleUndoCancel,
}) => {
  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Mark Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Student</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Meeting</TableHead>
            <TableHead>Session Exit Form</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentSessions.map((session, index) => (
            <TableRow
              key={index}

              // className={
              //     session.status === "Active"
              //     ? "bg-blue-200 opacity-20"
              //     : session.status === "Complete"
              //     ? "bg-green-200 opacity-50"
              //     : session.status === "Cancelled"
              //     ? "bg-red-100 opacity-50 "
              //     : ""
              // }
            >
              <TableCell>
                {session.status === "Active" ? (
                  <span className="px-3 py-1 inline-flex items-center rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                    <Clock size={14} className="mr-1" />
                    Active
                  </span>
                ) : session.status === "Complete" ? (
                  <span className="px-3 py-1 inline-flex items-center rounded-full bg-green-100 text-green-800 border border-green-200">
                    <CircleCheckBig size={14} className="mr-1" />
                    Complete
                  </span>
                ) : session.status === "Cancelled" ? (
                  <span className="px-3 py-1 inline-flex items-center rounded-full bg-red-100 text-red-800 border border-red-200">
                    <CircleX size={14} className="mr-1" />
                    Cancelled
                  </span>
                ) : (
                  ""
                )}
              </TableCell>
              <TableCell>{formatSessionDate(session.date)}</TableCell>
              <TableCell className="font-medium">
                Tutoring Session with {session.student?.firstName}{" "}
                {session.student?.lastName}
              </TableCell>
              <TableCell>
                {session.student?.firstName} {session.student?.lastName}
              </TableCell>
              <TableCell>{formatSessionDuration(session.duration)}</TableCell>
              <TableCell>
                {session.environment !== "In-Person" && (
                  <>
                    {session?.meeting?.meetingId ? (
                      <button
                        onClick={() =>
                          (window.location.href = `/meeting/${session?.meeting?.id}`)
                        }
                        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                      >
                        View
                      </button>
                    ) : (
                      <button className="text-black px-3 py-1 border border-gray-200 rounded">
                        N/A
                      </button>
                    )}
                  </>
                )}
              </TableCell>
              <TableCell>
                <SessionExitForm
                  currSession={session}
                  isSessionExitFormOpen={isSessionExitFormOpen}
                  setIsSessionExitFormOpen={setIsSessionExitFormOpen}
                  selectedSession={selectedSession}
                  setSelectedSession={setSelectedSession}
                  notes={notes}
                  setNotes={setNotes}
                  nextClassConfirmed={nextClassConfirmed}
                  setNextClassConfirmed={setNextClassConfirmed}
                  handleSessionComplete={handleSessionComplete}
                  handleStatusChange={handleStatusChange}
                />
              </TableCell>
              <TableCell className="flex content-center">
                {/* changed to show all icons - X for cancelled sessions, trash for active */}
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <HoverCard>
                      <HoverCardTrigger>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedSession(session);
                            setIsDialogOpen(true);
                            setSelectedSessionDate(session.date);
                          }}
                        >
                          <CalendarDays color="#3b82f6" className="h-4 w-4" />
                        </Button>
                      </HoverCardTrigger>
                      <HoverCardContent>
                        <center>Reschedule Session</center>
                      </HoverCardContent>
                    </HoverCard>
                  </DialogTrigger>
                  <RescheduleForm
                    session={session}
                    isDialogOpen={isDialogOpen}
                    selectedSession={selectedSession}
                    selectedSessionDate={selectedSessionDate}
                    meetings={meetings}
                    setIsDialogOpen={setIsDialogOpen}
                    setSelectedSession={setSelectedSession}
                    setSelectedSessionDate={setSelectedSessionDate}
                    handleInputChange={handleInputChange}
                    handleReschedule={handleReschedule}
                  />
                </Dialog>

                <HoverCard>
                  <HoverCardTrigger>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        (window.location.href =
                          "https://forms.gle/AC4an7K6NSNumDwKA")
                      }
                    >
                      <UserRoundPlus className="h-4 w-4" />
                    </Button>
                  </HoverCardTrigger>
                  <HoverCardContent>
                    <center>Request a Substitute</center>
                  </HoverCardContent>
                </HoverCard>

                {/* changed to show X icon for cancelled sessions, trash for active */}
                {session.status === "Cancelled" ? (
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleUndoCancel?.(session.id)}
                      >
                        <X className="h-4 w-4" color="#10b981" />
                      </Button>
                    </HoverCardTrigger>
                    <HoverCardContent>
                      <center>Undo Cancel</center>
                    </HoverCardContent>
                  </HoverCard>
                ) : (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Trash className="h-4 w-4" color="#ef4444" />
                      </Button>
                    </AlertDialogTrigger>
                    <CancellationForm
                      session={session}
                      handleStatusChange={handleStatusChange}
                      onClose={() => {}}
                    />
                  </AlertDialog>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
};

export default CurrentSessionsTable;
