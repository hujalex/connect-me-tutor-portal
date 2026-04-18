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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  CircleCheckBig,
  CircleX,
  Clock,
  ChevronsLeft,
  ChevronsRight,
  ChevronLeft,
  ChevronRight,
  Trash,
  CalendarDays,
  UserRoundPlus,
  X,
} from "lucide-react";
import SessionExitForm from "./SessionExitForm";
import RescheduleForm from "./RescheduleDialog";
import CancellationForm from "./CancellationForm";
import { useRouter } from "next/navigation";
import { useDashboardContext } from "@/contexts/dashboardContext";

const CurrentSessionsTable = ({
  meetings,
  totalPages,
  handleStatusChange,
  handleReschedule,
  handleSessionComplete,
  handlePageChange,
  handleRowsPerPageChange,
  handleInputChange,
  handleUndoCancel,
}: any) => {
  const router = useRouter();
  const TC = useDashboardContext();

  const handleRescheduleWithRefresh = async (
    sessionId: string,
    newDate: string,
    meetingId: string,
  ) => {
    await handleReschedule(sessionId, newDate, meetingId);
    router.refresh();
  };

  return (
    <>
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Student</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Meeting</TableHead>
              <TableHead>Exit Form</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {TC.currentSessions.map((session, index) => (
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
                  ) : (
                    <span className="px-3 py-1 inline-flex items-center rounded-full bg-red-100 text-red-800 border border-red-200">
                      <CircleX size={14} className="mr-1" />
                      Cancelled
                    </span>
                  )}
                </TableCell>

                <TableCell>{formatSessionDate(session.date)}</TableCell>

                <TableCell className="font-medium">
                  {session.student?.firstName} {session.student?.lastName}
                </TableCell>

                <TableCell>{formatSessionDuration(session.duration)}</TableCell>

                <TableCell>
                  {session?.meeting?.meetingId ? (
                    <Button
                      size="sm"
                      variant="default"
                      className="bg-blue-400 text-white hover:bg-blue-600"
                      onClick={() =>
                        (window.location.href = `/meeting/${session?.meeting?.id}`)
                      }
                    >
                      View
                    </Button>
                  ) : (
                    <span className="text-gray-400">N/A</span>
                  )}
                </TableCell>

                <TableCell>
                  <SessionExitForm
                    currSession={session}
                    handleSessionComplete={handleSessionComplete}
                    handleStatusChange={handleStatusChange}
                  />
                </TableCell>

                <TableCell className="flex gap-2 items-center">
                  <Dialog open={TC.isDialogOpen} onOpenChange={TC.setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          TC.setSelectedSession(session);
                          TC.setSelectedSessionDate(session.date);
                        }}
                      >
                        <CalendarDays className="h-4 w-4 text-blue-500" />
                      </Button>
                    </DialogTrigger>

                    <RescheduleForm
                      selectedSession={TC.selectedSession}
                      selectedSessionDate={TC.selectedSessionDate}
                      meetings={meetings}
                      setSelectedSessionDate={TC.setSelectedSessionDate}
                      handleInputChange={handleInputChange}
                      handleReschedule={handleRescheduleWithRefresh}
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
                  </HoverCard>

                  {session.status === "Cancelled" ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleUndoCancel?.(session.id)}
                    >
                      <X className="h-4 w-4 text-green-500" />
                    </Button>
                  ) : (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Trash className="h-4 w-4 text-red-500" />
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
      </div>

      <div className="md:hidden space-y-4 mt-6 pb-6">
        {TC.currentSessions.map((session, index) => (
          <div key={`mobile-${index}`} className="border rounded-xl p-4 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-semibold">
                  {session.student?.firstName} {session.student?.lastName}
                </div>
                <div className="text-sm text-gray-500">
                  {formatSessionDate(session.date)}
                </div>
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
              ) : (
                <span className="px-2 py-1 text-xs rounded-full bg-red-100 flex items-center gap-1">
                  <CircleX size={12} />
                  Cancelled
                </span>
              )}
            </div>

            <p className="text-sm text-gray-700">
              <b>Duration:</b> {formatSessionDuration(session.duration)}
            </p>

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

            <SessionExitForm
              currSession={session}
              handleSessionComplete={handleSessionComplete}
              handleStatusChange={handleStatusChange}
            />

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

export default CurrentSessionsTable;