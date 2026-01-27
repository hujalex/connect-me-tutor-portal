import { useState } from "react";

// delete student flow
// pick a student then confirm
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Profile } from "@/types";
import { Combobox } from "@/components/ui/combobox";
import { ScrollArea } from "@/components/ui/scrollarea";

interface DeleteStudentFormProps {
  // list of students for the picker
  students: Profile[];
  // selected student id comes from parent
  selectedStudentId: string | null;
  // update selected student id
  setSelectedStudentId: (value: string) => void;
  // parent does the delete work
  handleDeleteStudent: () => void;
}

const DeleteStudentForm = ({
  students,
  selectedStudentId,
  setSelectedStudentId,
  handleDeleteStudent,
}: DeleteStudentFormProps) => {
  // dialog ui for picking student then confirming delete
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="destructive">Delete Student</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Select a Student to Delete</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Label htmlFor="studentSelect" className="text-right">
            Student
          </Label>
          <div className="relative">
            <Combobox
              list={students
                // could filter to only active if we want later
                .map((student) => ({
                  value: student.id,
                  label: `${student.firstName} ${student.lastName} - ${student.email}`,
                }))}
              category="student"
              onValueChange={setSelectedStudentId}
            />
          </div>
        </div>
        <Button
          onClick={handleDeleteStudent}
          disabled={!selectedStudentId}
          className="w-full"
        >
          Confirm Deletion
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteStudentForm;
