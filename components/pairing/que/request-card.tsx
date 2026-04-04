"use client";

import type React from "react";
import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Users, Clock, CheckCircle, XCircle, AlertCircle, LogOut } from "lucide-react";
import {
  createPairingRequest,
  getMyPairingRequest,
  removePairingRequest,
  updatePairingRequest,
  type MyPairingRequest,
} from "@/lib/actions/pairing.actions";
import toast from "react-hot-toast";

export type PairingRequest = {
  id: string;
  to: string;
  type: "student" | "tutor";
  userId: string;
  profile: unknown;
  status: "pending" | "accepted" | "rejected";
  priority: number;
  createdAt: Date;
};

interface PairingRequestCardProps {
  userId: string;
  profileId: string;
  role: string;
}

export function PairingRequestCard({
  userId,
  profileId,
  role,
}: PairingRequestCardProps) {
  const [notes, setNotes] = useState("");
  const [excludeRejectedTutors, setExcludeRejectedTutors] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [myRequest, setMyRequest] = useState<MyPairingRequest | null>(null);
  const [isLoadingRequest, setIsLoadingRequest] = useState(true);

  const isStudent = role?.toLowerCase() === "student";

  const refetch = useCallback(async () => {
    const req = await getMyPairingRequest(profileId);
    setMyRequest(req ?? null);
    if (req) {
      setExcludeRejectedTutors(req.excludeRejectedTutors);
    }
  }, [profileId]);

  useEffect(() => {
    refetch().finally(() => setIsLoadingRequest(false));
  }, [refetch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const promise = createPairingRequest(userId, notes, excludeRejectedTutors);
    toast.promise(promise, {
      success: "Successfully added to pairing queue",
      loading: "Creating pairing request",
      error: "Failed to add to pairing queue",
    });
    promise
      .then(() => {
        setNotes("");
        return refetch();
      })
      .finally(() => setIsSubmitting(false));
  };

  const handleLeaveQueue = async () => {
    if (!myRequest) return;
    setIsLeaving(true);
    const promise = removePairingRequest(myRequest.id);
    toast.promise(promise, {
      success: "Removed from active queue (your request is saved)",
      loading: "Leaving queue",
      error: "Failed to leave queue",
    });
    promise
      .then(refetch)
      .finally(() => setIsLeaving(false));
  };

  const handleRejoinQueue = async () => {
    if (!myRequest) return;
    setIsSubmitting(true);
    const promise = createPairingRequest(
      userId,
      myRequest.notes ?? "",
      excludeRejectedTutors,
    );
    toast.promise(promise, {
      success: "You’re back in the pairing queue",
      loading: "Rejoining queue",
      error: (e: Error) => e.message || "Failed to rejoin",
    });
    promise
      .then(refetch)
      .finally(() => setIsSubmitting(false));
  };

  const handleToggleExcludeRejected = async (checked: boolean) => {
    if (!myRequest) return;
    setExcludeRejectedTutors(checked);
    const promise = updatePairingRequest(myRequest.id, {
      exclude_rejected_tutors: checked,
    });
    toast.promise(promise, {
      loading: "Updating preference",
      success: "Preference updated",
      error: "Failed to update preference",
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "accepted":
        return <CheckCircle className="h-4 w-4" />;
      case "rejected":
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "accepted":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  if (isLoadingRequest) {
    return (
      <Card className="w-full mx-auto">
        <CardContent className="p-6">
          <p className="text-muted-foreground text-sm">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  if (myRequest && myRequest.inQueue === false) {
    return (
      <Card className="w-full mx-auto">
        <CardHeader className="space-y-4">
          <div className="flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            <CardTitle className="text-2xl">Pairing queue (archived)</CardTitle>
          </div>
          <CardDescription className="text-base leading-relaxed">
            You left the active queue. Your notes and preferences are saved; you won’t be matched
            until you rejoin.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="capitalize">
              Archived
            </Badge>
            <Badge variant="outline">Priority {myRequest.priority}</Badge>
          </div>
          {myRequest.notes ? (
            <div className="rounded-md border bg-muted/30 p-3 text-sm">
              <span className="font-medium text-muted-foreground">Saved notes</span>
              <p className="mt-1 whitespace-pre-wrap">{myRequest.notes}</p>
            </div>
          ) : null}
          <Button
            className="w-full"
            size="lg"
            onClick={handleRejoinQueue}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Clock className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Users className="mr-2 h-4 w-4" />
            )}
            Rejoin queue
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (myRequest) {
    return (
      <Card className="w-full mx-auto">
        <CardHeader className="space-y-4">
          <div className="flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            <CardTitle className="text-2xl">Pairing Queue</CardTitle>
          </div>
          <CardDescription className="text-base leading-relaxed">
            You are in the pairing queue. You will be matched based on availability and compatibility.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              className={`${getStatusColor(myRequest.status)} flex items-center gap-1 capitalize`}
            >
              {getStatusIcon(myRequest.status)}
              {myRequest.status}
            </Badge>
            <Badge variant="outline">Priority {myRequest.priority}</Badge>
          </div>

          {isStudent && (
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="block-rejected" className="text-base">
                  Block tutors who declined me in the past
                </Label>
                <p className="text-sm text-muted-foreground">
                  When on, you won’t be matched with tutors who previously declined your request.
                </p>
              </div>
              <Switch
                id="block-rejected"
                checked={excludeRejectedTutors}
                onCheckedChange={handleToggleExcludeRejected}
              />
            </div>
          )}

          <Button
            variant="outline"
            className="w-full"
            size="lg"
            onClick={handleLeaveQueue}
            disabled={isLeaving}
          >
            {isLeaving ? (
              <Clock className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <LogOut className="mr-2 h-4 w-4" />
            )}
            Leave queue
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full mx-auto">
      <CardHeader className="space-y-4">
        <div className="flex items-center gap-2">
          <Users className="h-6 w-6 text-primary" />
          <CardTitle className="text-2xl">Submit Pairing Request</CardTitle>
        </div>
        <CardDescription className="text-base leading-relaxed">
          Submit a request to be paired with a tutor or student. Your request
          will be reviewed and matched based on availability, subject expertise,
          and compatibility. The matching process typically takes 24-48 hours.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="bg-muted/50 p-4 rounded-lg space-y-3">
          <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
            How It Works
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <Badge variant="outline" className="mt-0.5 text-xs">1</Badge>
              <span>Submit your pairing request with your preferences and notes</span>
            </div>
            <div className="flex items-start gap-2">
              <Badge variant="outline" className="mt-0.5 text-xs">2</Badge>
              <span>Our system matches you based on availability and compatibility</span>
            </div>
            <div className="flex items-start gap-2">
              <Badge variant="outline" className="mt-0.5 text-xs">3</Badge>
              <span>You’ll receive a notification when a match is found</span>
            </div>
            <div className="flex items-start gap-2">
              <Badge variant="outline" className="mt-0.5 text-xs">4</Badge>
              <span>Connect with your paired partner to begin your learning journey</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="notes" className="text-base font-medium">
              Additional Notes
              <span className="text-sm font-normal text-muted-foreground ml-2">(Optional)</span>
            </Label>
            <Textarea
              id="notes"
              placeholder="Tell us about your learning goals, preferred subjects, availability, or any specific requirements..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[120px] resize-none"
              maxLength={500}
            />
            <div className="text-xs text-muted-foreground text-right">
              {notes.length}/500 characters
            </div>
          </div>

          {isStudent && (
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="block-rejected-form" className="text-base">
                  Block tutors who declined me in the past
                </Label>
                <p className="text-sm text-muted-foreground">
                  When on, you won’t be matched with tutors who previously declined your request.
                </p>
              </div>
              <Switch
                id="block-rejected-form"
                checked={excludeRejectedTutors}
                onCheckedChange={setExcludeRejectedTutors}
              />
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
            size="lg"
          >
            {isSubmitting ? (
              <>
                <Clock className="mr-2 h-4 w-4 animate-spin" />
                Submitting Request...
              </>
            ) : (
              <>
                <Users className="mr-2 h-4 w-4" />
                Submit Pairing Request
              </>
            )}
          </Button>
        </form>

        <div className="pt-4 border-t">
          <h4 className="text-sm font-medium mb-3 text-muted-foreground">
            Request Status Examples
          </h4>
          <div className="flex flex-wrap gap-2">
            <Badge className={`${getStatusColor("pending")} flex items-center gap-1`}>
              {getStatusIcon("pending")}
              Pending Review
            </Badge>
            <Badge className={`${getStatusColor("accepted")} flex items-center gap-1`}>
              {getStatusIcon("accepted")}
              Match Found
            </Badge>
            <Badge className={`${getStatusColor("rejected")} flex items-center gap-1`}>
              {getStatusIcon("rejected")}
              No Match Available
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
