import { useState } from "react";

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
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Profile } from "@/types";
import { Combobox } from "@/components/ui/combobox";
import { X, Plus } from "lucide-react";
import { ScrollArea } from "@/components/ui/scrollarea";
import { Switch } from "@/components/ui/switch";
import TimeZoneSelector from "./components/TimezoneSelector";

interface AddTutorFormProps {
  // draft tutor object lives in parent
  newTutor: Partial<Profile>;
  // used to disable buttons while saving
  addingTutor: boolean;
  // basic inputs write back to parent
  handleInputChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
  // parent submits tutor to backend
  // add to pairing queue is optional
  handleAddTutor: (
    value: Partial<Profile>,
    addToPairingQueue?: boolean
  ) => void;
  // timezone selector uses on value change
  handleTimeZone: (value: string) => void;
  // parent state setter for new tutor
  setNewTutor: React.Dispatch<React.SetStateAction<Partial<Profile>>>; // 👈 add this
}

// list of days for availability dropdown
const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const AddTutorForm = ({
  newTutor,
  setNewTutor,
  addingTutor,
  handleInputChange,
  handleAddTutor,
  handleTimeZone,
}: AddTutorFormProps) => {
  // controls the modal open state
  const [isModalOpen, setIsModalOpen] = useState(false);
  // basic tab is main info extended tab is extra fields
  const [activeTab, setActiveTab] = useState("basic");
  // toggle for adding new tutors to pairing queue
  const [addNewProfilesToQueue, setAddNewProfilesToQueue] =
    useState<boolean>(false);

  // extended profile fields moved from original component state
  // local list of subjects for extended tab
  const [subjectsOfInterest, setSubjectsOfInterest] = useState<string[]>([]);
  // local list of languages for extended tab
  const [languagesSpoken, setLanguagesSpoken] = useState<string[]>([]);
  // local availability slots for extended tab
  const [availability, setAvailability] = useState<
    { day: string; startTime: string; endTime: string }[]
  >([]);

  // input box state for adding one subject
  const [newSubject, setNewSubject] = useState("");
  // input box state for adding one language
  const [newLanguage, setNewLanguage] = useState("");
  // gender select value
  const [newGender, setNewGender] = useState("");

  // adds one default availability row
  const addAvailabilitySlot = () => {
    setAvailability([
      ...availability,
      { day: "Monday", startTime: "09:00", endTime: "17:00" },
    ]);
  };

  // updates one field inside one availability row
  const updateAvailabilitySlot = (
    index: number,
    field: keyof (typeof availability)[0],
    value: string
  ) => {
    const updated = [...availability];
    updated[index] = { ...updated[index], [field]: value };
    setAvailability(updated);
  };

  // removes one availability row
  const removeAvailabilitySlot = (index: number) => {
    setAvailability(availability.filter((_, i) => i !== index));
  };

  // adds one subject into the list
  const addSubject = () => {
    if (newSubject.trim() && !subjectsOfInterest.includes(newSubject.trim())) {
      setSubjectsOfInterest([...subjectsOfInterest, newSubject.trim()]);
      setNewSubject("");
    }
  };

  // removes one subject from the list
  const removeSubject = (subject: string) => {
    setSubjectsOfInterest(subjectsOfInterest.filter((s) => s !== subject));
  };

  // adds one language into the list
  const addLanguage = () => {
    if (newLanguage.trim() && !languagesSpoken.includes(newLanguage.trim())) {
      setLanguagesSpoken([...languagesSpoken, newLanguage.trim()]);
      setNewLanguage("");
    }
  };

  // removes one language from the list
  const removeLanguage = (language: string) => {
    setLanguagesSpoken(languagesSpoken.filter((l) => l !== language));
  };

  // merges extended fields then calls the parent submit handler
  const handleEnhancedAddTutor = (addToPairingQueue?: boolean) => {
    // build one object that matches the profile shape
    const tutorWithExtendedFields = {
      ...newTutor,
      availability,
      subjects_of_interest: subjectsOfInterest,
      languages_spoken: languagesSpoken,
    };

    // call parent handler with merged fields
    handleAddTutor(tutorWithExtendedFields, addToPairingQueue);
  };

  return (
    <>
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogTrigger asChild>
          <Button>Add Tutor</Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Tutor</DialogTitle>
          </DialogHeader>

          {/* Tab Navigation */}
          <div className="flex border-b mb-4">
            <button
              type="button"
              onClick={() => setActiveTab("basic")}
              className={`px-4 py-2 text-sm font-medium border-b-2 ${
                activeTab === "basic"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Basic Info
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("extended")}
              className={`px-4 py-2 text-sm font-medium border-b-2 ${
                activeTab === "extended"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Extended Profile
            </button>
          </div>

          <div className="grid gap-4 py-4">
            {/* Basic Info Tab */}
            {activeTab === "basic" && (
              <ScrollArea className="max-h-[calc(70vh-120px)] pr-4">
                <div className="space-y-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="firstName" className="text-right">
                      First Name
                    </Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={newTutor.firstName}
                      onChange={handleInputChange}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="lastName" className="text-right">
                      Last Name
                    </Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={newTutor.lastName}
                      onChange={handleInputChange}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="email" className="text-right">
                      Email
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={newTutor.email}
                      onChange={handleInputChange}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="phoneNumber" className="text-right">
                      Phone Number
                    </Label>
                    <Input
                      id="phoneNumber"
                      name="phoneNumber"
                      type="phonenumber"
                      value={newTutor.phoneNumber}
                      onChange={handleInputChange}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="startDate" className="text-right">
                      Start Date
                    </Label>
                    <Input
                      id="startDate"
                      name="startDate"
                      type="date"
                      value={newTutor.startDate}
                      onChange={handleInputChange}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="timeZone" className="text-right">
                      Time Zone
                    </Label>
                    <div className="col-span-3">
                      <TimeZoneSelector
                        profile={newTutor}
                        handleTimeZone={handleTimeZone}
                      />
                    </div>
                  </div>
                </div>
              </ScrollArea>
            )}

            {/* Extended Profile Tab */}
            {activeTab === "extended" && (
              <ScrollArea className="max-h-[calc(70vh-120px)] pr-4">
                <div className="space-y-6">
                  {/* Availability Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Availability</h3>
                    {availability.map((slot, index) => (
                      <div
                        key={index}
                        className="flex gap-2 p-3 border rounded-lg bg-gray-50"
                      >
                        <div className="flex-1">
                          <Select
                            value={slot.day}
                            onValueChange={(value) =>
                              updateAvailabilitySlot(index, "day", value)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {DAYS_OF_WEEK.map((day) => (
                                <SelectItem key={day} value={day}>
                                  {day}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex-1">
                          <Input
                            type="time"
                            value={slot.startTime}
                            onChange={(e) =>
                              updateAvailabilitySlot(
                                index,
                                "startTime",
                                e.target.value
                              )
                            }
                          />
                        </div>
                        <div className="flex-1">
                          <Input
                            type="time"
                            value={slot.endTime}
                            onChange={(e) =>
                              updateAvailabilitySlot(
                                index,
                                "endTime",
                                e.target.value
                              )
                            }
                          />
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeAvailabilitySlot(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addAvailabilitySlot}
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Time Slot
                    </Button>
                  </div>

                  {/* Subjects Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">
                      Subjects of Interest
                    </h3>
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        placeholder="e.g., Mathematics, Physics"
                        value={newSubject}
                        onChange={(e) => setNewSubject(e.target.value)}
                        onKeyDown={(e) =>
                          e.key === "Enter" &&
                          (e.preventDefault(), addSubject())
                        }
                      />
                      <Button type="button" onClick={addSubject} size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    {subjectsOfInterest.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {subjectsOfInterest.map((subject) => (
                          <Badge
                            key={subject}
                            variant="secondary"
                            className="flex items-center gap-1"
                          >
                            {subject}
                            <button
                              type="button"
                              onClick={() => removeSubject(subject)}
                              className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Languages Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Languages Spoken</h3>
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        placeholder="e.g., English, Spanish"
                        value={newLanguage}
                        onChange={(e) => setNewLanguage(e.target.value)}
                        onKeyDown={(e) =>
                          e.key === "Enter" &&
                          (e.preventDefault(), addLanguage())
                        }
                      />
                      <Button type="button" onClick={addLanguage} size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    {languagesSpoken.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {languagesSpoken.map((language) => (
                          <Badge
                            key={language}
                            variant="secondary"
                            className="flex items-center gap-1"
                          >
                            {language}
                            <button
                              type="button"
                              onClick={() => removeLanguage(language)}
                              className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Gender</h3>
                    <div className="flex gap-2">
                      <Select
                        name="timeZone"
                        value={newTutor.gender}
                        onValueChange={(value) =>
                          setNewTutor((prev) => ({ ...prev, gender: value }))
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {languagesSpoken.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {languagesSpoken.map((language) => (
                          <Badge
                            key={language}
                            variant="secondary"
                            className="flex items-center gap-1"
                          >
                            {language}
                            <button
                              type="button"
                              onClick={() => removeLanguage(language)}
                              className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </ScrollArea>
            )}
          </div>

          <Button
            onClick={() => handleEnhancedAddTutor(true)}
            disabled={addingTutor}
          >
            {addingTutor ? "Adding Tutor..." : "Add Tutor"}
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AddTutorForm;
