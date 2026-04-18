import React from "react";
import { useState } from "react";
import { formatSessionDate, formatSessionDuration } from "@/lib/utils";
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
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Circle,
  Loader2,
  ChevronsLeft,
  ChevronsRight,
  ChevronLeft,
  ChevronRight,
  Trash,
  CalendarDays,
  UserRoundPlus,
  Clock,
  CircleCheckBig,
  CircleX,
  Copy,
  Ellipsis,
} from "lucide-react";
import { format, parseISO, isAfter } from "date-fns";
import { AlertDialogTrigger } from "@radix-ui/react-alert-dialog";
import SessionExitForm from "./SessionExitForm";
import RescheduleForm from "./RescheduleDialog";
import CancellationForm from "./CancellationForm";
import { boolean } from "zod";
import { useDashboardContext } from "@/contexts/dashboardContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SessionsTableProps {
  paginatedSessions: Session[];
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
    meetingId: string,
  ) => void;
  handleSessionComplete: (
    session: Session,
    notes: string,
    isQuestionOrConcern: boolean,
    isFirstSession: boolean,
  ) => void;
  handlePageChange: (page: number) => void;
  handleRowsPerPageChange: (value: string) => void;
  handleInputChange: (e: { target: { name: string; value: string } }) => void;
}

const ActiveSessionsTable = ({
  paginatedSessions,
  meetings,
  totalPages,
  setNextClassConfirmed,
  handleStatusChange,
  handleReschedule,
  handleSessionComplete,
  handlePageChange,
  handleRowsPerPageChange,
  handleInputChange,
}: any) => {
  const TC = useDashboardContext();
  return (
    <>
    <div className="hidden md:block">
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
          {paginatedSessions.map((session: Session, index: number) => (
            <TableRow key={index}>
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
                {session?.meeting?.meetingId ? (
                  <span>
                    <button
                      onClick={() =>
                        (window.location.href = `/meeting/${session?.meeting?.id}`)
                      }
                      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                    >
                      View
                    </button>
                  </span>
                ) : (
                  <button className="text-black px-3 py-1 border border-gray-200 rounded">
                    N/A
                  </button>
                )}
              </TableCell>
              <TableCell>
                <SessionExitForm
                  currSession={session}
                  setNextClassConfirmed={setNextClassConfirmed}
                  handleSessionComplete={handleSessionComplete}
                  handleStatusChange={handleStatusChange}
                />
              </TableCell>
              <TableCell className="flex content-center">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Ellipsis />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuGroup>
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem
                        onClick={() => {
                          TC.setSelectedSession(session);
                          TC.setIsDialogOpen(true);
                          TC.setSelectedSessionDate(session.date);
                        }}
                      >
                        <Dialog
                          open={TC.isDialogOpen}
                          onOpenChange={TC.setIsDialogOpen}
                        >
                          <RescheduleForm
                            selectedSession={TC.selectedSession}
                            selectedSessionDate={TC.selectedSessionDate}
                            meetings={meetings}
                            setSelectedSessionDate={TC.setSelectedSessionDate}
                            handleInputChange={handleInputChange}
                            handleReschedule={handleReschedule}
                          />
                        </Dialog>
                        <CalendarDays className="h-4 w-4 mr-2" />
                        Reschedule
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          (window.location.href =
                            "https://forms.gle/AC4an7K6NSNumDwKA")
                        }
                      >
                        <UserRoundPlus className="h-4 w-4 mr-2" />
                        Request Substitute
                      </DropdownMenuItem>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem
                            onSelect={(e) => {
                              e.preventDefault();
                            }}
                          >
                            <Trash className="h-4 w-4 mr-2" />
                            Trash
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Cancel Session?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to cancel this session with{" "}
                              {session.student?.firstName}{" "}
                              {session.student?.lastName} on{" "}
                              {formatSessionDate(session.date)}? This action
                              cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleStatusChange(session)}
                            >
                              Confirm Cancellation
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="mt-4 flex justify-between items-center">
        <span>{TC.filteredSessions.length} row(s) total.</span>
        <div className="flex items-center space-x-2">
          <span>Rows per page</span>
          <Select
            value={TC.rowsPerPage.toString()}
            onValueChange={handleRowsPerPageChange}
          >
            <SelectTrigger className="w-[70px]">
              <SelectValue placeholder={TC.rowsPerPage.toString()} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
            </SelectContent>
          </Select>
          <span>
            Page {TC.currentPage} of {totalPages}
          </span>
          <div className="flex space-x-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handlePageChange(1)}
              disabled={TC.currentPage === 1}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handlePageChange(TC.currentPage - 1)}
              disabled={TC.currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handlePageChange(TC.currentPage + 1)}
              disabled={TC.currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handlePageChange(totalPages)}
              disabled={TC.currentPage === totalPages}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
          </div>
        </div>
      </div>
      {/* ================= MOBILE CARDS ================= */}
<div className="md:hidden space-y-4 mt-6 pb-6">
  {paginatedSessions.map((session: Session, index: number) => (
    <div key={`mobile-${index}`} className="border rounded-xl p-4 space-y-3">

      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <p className="font-semibold">
            Tutoring Session with {session.student?.firstName}{" "}
            {session.student?.lastName}
          </p>
          <p className="text-sm text-gray-500">
            {formatSessionDate(session.date)}
          </p>
        </div>

        {session.status === "Active" ? (
          <span className="px-2 py-1 text-xs rounded-full bg-blue-100 flex items-center gap-1">
            <Clock size={12} />
            Active
          </span>
        ) : session.status === "Complete" ? (
          <span className="px-2 py-1 text-xs rounded-full bg-green-100 flex items-center gap-1">
            <CircleCheckBig size={12} />
            Complete
          </span>
        ) : session.status === "Cancelled" ? (
          <span className="px-2 py-1 text-xs rounded-full bg-red-100 flex items-center gap-1">
            <CircleX size={12} />
            Cancelled
          </span>
        ) : null}
      </div>

      {/* Student */}
      <p className="text-sm">
        <span className="font-medium">Student:</span>{" "}
        {session.student?.firstName} {session.student?.lastName}
      </p>

      {/* Duration */}
      <p className="text-sm text-gray-600">
        <span className="font-medium">Duration:</span>{" "}
        {formatSessionDuration(session.duration)}
      </p>

      {/* Meeting */}
      <div>
        <span className="text-sm font-medium">Meeting: </span>
        {session?.meeting?.meetingId ? (
          <button
            onClick={() =>
              (window.location.href = `/meeting/${session?.meeting?.id}`)
            }
            className="bg-blue-500 text-white px-2 py-1 rounded text-sm ml-2"
          >
            View
          </button>
        ) : (
          <span className="text-sm text-gray-400 ml-2">N/A</span>
        )}
      </div>

      {/* Session Exit Form */}
      <div>
        <SessionExitForm
          currSession={session}
          setNextClassConfirmed={setNextClassConfirmed}
          handleSessionComplete={handleSessionComplete}
          handleStatusChange={handleStatusChange}
        />
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2 pt-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            TC.setSelectedSession(session);
            TC.setIsDialogOpen(true);
            TC.setSelectedSessionDate(session.date);
          }}
        >
          Reschedule
        </Button>

        <Button
          size="sm"
          variant="outline"
          onClick={() =>
            (window.location.href =
              "https://forms.gle/AC4an7K6NSNumDwKA")
          }
        >
          Substitute
        </Button>

        <Button
          size="sm"
          variant="destructive"
          onClick={() => handleStatusChange(session)}
        >
          Cancel
        </Button>
      </div>
    </div>
  ))}

  {/* ================= MOBILE PAGINATION ================= */}
  <div className="flex justify-between items-center pt-4 border-t">
    <span className="text-sm text-gray-500">
      Page {TC.currentPage} of {totalPages}
    </span>

    <div className="flex space-x-1">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => handlePageChange(1)}
        disabled={TC.currentPage === 1}
      >
        <ChevronsLeft className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => handlePageChange(TC.currentPage - 1)}
        disabled={TC.currentPage === 1}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => handlePageChange(TC.currentPage + 1)}
        disabled={TC.currentPage === totalPages}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => handlePageChange(totalPages)}
        disabled={TC.currentPage === totalPages}
      >
        <ChevronsRight className="h-4 w-4" />
      </Button>
    </div>
  </div>
</div>
    </>
  );
};

export default ActiveSessionsTable;