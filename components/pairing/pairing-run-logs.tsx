"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type PairingWorkflowPreview = {
  logs: { type: string; message: string; error?: boolean }[];
  matchesToInsert: { student_id: string; tutor_id: string; similarity: number }[];
  summary: {
    matchesToInsert: number;
    logsToInsert: number;
  };
};

type StoredPairingRun = {
  runId: string;
  createdAt: string;
  preview: PairingWorkflowPreview;
  appliedAt?: string;
};

const PREVIEW_RUN_STORAGE_PREFIX = "pairing-preview-run:";

export function PairingRunLogsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const runId = searchParams.get("runId");

  const [run, setRun] = useState<StoredPairingRun | null>(null);
  const [isApplying, setIsApplying] = useState(false);

  useEffect(() => {
    if (!runId || typeof window === "undefined") {
      setRun(null);
      return;
    }

    const raw = window.sessionStorage.getItem(
      `${PREVIEW_RUN_STORAGE_PREFIX}${runId}`,
    );
    if (!raw) {
      setRun(null);
      return;
    }

    try {
      const parsed = JSON.parse(raw) as StoredPairingRun;
      setRun(parsed);
    } catch {
      setRun(null);
    }
  }, [runId]);

  const createdAtText = useMemo(() => {
    if (!run?.createdAt) return "";
    return new Date(run.createdAt).toLocaleString();
  }, [run?.createdAt]);

  const handleApplyRun = async () => {
    if (!run) return;

    setIsApplying(true);
    const promise = axios.post("/api/pairing?debug=1", {
      mode: "apply-preview",
      preview: {
        matchesToInsert: run.preview.matchesToInsert,
        logs: run.preview.logs,
      },
    });

    toast.promise(promise, {
      success: "Applied this run's saved queue changes",
      error: "Failed to apply this run",
      loading: "Applying saved run...",
    });

    try {
      await promise;
      if (typeof window !== "undefined") {
        const nextRun: StoredPairingRun = {
          ...run,
          appliedAt: new Date().toISOString(),
        };
        window.sessionStorage.setItem(
          `${PREVIEW_RUN_STORAGE_PREFIX}${run.runId}`,
          JSON.stringify(nextRun),
        );
        setRun(nextRun);
      }
      router.refresh();
    } finally {
      setIsApplying(false);
    }
  };

  if (!runId || !run) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pairing Run Logs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            No saved preview run found for this page.
          </p>
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard/pairing-que")}
          >
            Back to Pairing Queue
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Pairing Run Logs</CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard/pairing-que/logs")}
            >
              View Global Logs
            </Button>
            <Button
              onClick={handleApplyRun}
              disabled={isApplying || Boolean(run.appliedAt)}
            >
              {run.appliedAt ? "Already Applied" : "Apply This Run"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm text-muted-foreground">
            Run ID: <span className="font-mono">{run.runId}</span>
          </div>
          <div className="text-sm text-muted-foreground">
            Created: {createdAtText}
          </div>
          {run.appliedAt && (
            <div className="text-sm text-green-700">
              Applied at {new Date(run.appliedAt).toLocaleString()}
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">
              Proposed matches: {run.preview.summary.matchesToInsert}
            </Badge>
            <Badge variant="outline">
              Run logs: {run.preview.summary.logsToInsert}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            Logs for this run only ({run.preview.logs.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Step</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Message</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {run.preview.logs.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No logs captured in this run.
                    </TableCell>
                  </TableRow>
                ) : (
                  run.preview.logs.map((log, index) => (
                    <TableRow key={`${log.type}-${index}`}>
                      <TableCell className="font-mono text-xs">
                        {index + 1}
                      </TableCell>
                      <TableCell>{log.type}</TableCell>
                      <TableCell>
                        <Badge variant={log.error ? "destructive" : "outline"}>
                          {log.error ? "error" : "ok"}
                        </Badge>
                      </TableCell>
                      <TableCell>{log.message}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
