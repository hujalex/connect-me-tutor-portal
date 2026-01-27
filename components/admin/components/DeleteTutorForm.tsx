import { useState } from "react";

// delete tutor flow
// pick a tutor then confirm
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

interface DeleteTutorFormProps {
  // list of tutors for the picker
  tutors: Profile[];
  // selected tutor id lives in parent
  selectedTutorId: string | null;
  // let parent know what tutor got picked
  setSelectedTutorId: (value: string | null) => void;
  // parent does the actual delete
  handleDeleteTutor: () => void;
}

const DeleteTutorForm = ({
  tutors,
  selectedTutorId,
  setSelectedTutorId,
  handleDeleteTutor,
}: DeleteTutorFormProps) => {
  // local modal open state so the dialog can open n close
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);

  // dialog ui for picking tutor then confirming delete
  return (
    <Dialog
      open={isDeactivateModalOpen}
      onOpenChange={setIsDeactivateModalOpen}
    >
      <DialogTrigger asChild>
        <Button variant="destructive">Delete Tutor</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Select a Tutor to Delete</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Label htmlFor="tutorSelect" className="text-right">
            Tutor
          </Label>
          <div className="relative">
            <Combobox
              // only show active tutors so we dont delete inactive ones by accident
              list={tutors
                .filter((tutor) => tutor.status === "Active")
                .map((tutor) => ({
                  value: tutor.id,
                  label: `${tutor.firstName} ${tutor.lastName} - ${tutor.email}`,
                }))}
              category="tutor"
              onValueChange={setSelectedTutorId}
            />
          </div>
        </div>
        <Button onClick={handleDeleteTutor} disabled={!selectedTutorId}>
          Confirm Deletion
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteTutorForm;
