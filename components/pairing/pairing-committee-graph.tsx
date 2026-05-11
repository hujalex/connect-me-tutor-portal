"use client";

import { useId, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { PairingMatchPreview, PairingRequest } from "@/types/pairing";
import {
  computeOverlappingAvailabilitySlots,
  intersectSubjects,
} from "@/lib/pairing/overlap";

type GraphNode = {
  id: string;
  label: string;
  role: "student" | "tutor";
  priority?: number;
};

type GraphEdge = {
  from: string;
  to: string;
  strength: number;
  similarity?: number;
};

const NODE_W = 172;
const NODE_H = 40;
const PAD = 28;
const GAP_Y = 10;
const CANVAS_W = 840;

function truncate(s: string, max = 24): string {
  const t = s.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

function buildQueueEdges(requests: PairingRequest[]): GraphEdge[] {
  const students = requests.filter((r) => r.type === "student");
  const tutors = requests.filter((r) => r.type === "tutor");
  const edges: GraphEdge[] = [];
  for (const s of students) {
    for (const t of tutors) {
      const subj = intersectSubjects(
        s.profile.subjects_of_interest,
        t.profile.subjects_of_interest,
      );
      const slots = computeOverlappingAvailabilitySlots(
        s.profile.availability,
        t.profile.availability,
      );
      if (subj.length === 0 && slots.length === 0) continue;
      const strength = Math.min(
        1,
        0.28 + subj.length * 0.1 + slots.length * 0.07,
      );
      edges.push({
        from: s.userId,
        to: t.userId,
        strength,
      });
    }
  }
  return edges;
}

function buildPreviewEdges(previews: PairingMatchPreview[]): GraphEdge[] {
  return previews.map((p) => ({
    from: p.student_id,
    to: p.tutor_id,
    strength: Math.min(1, (Number(p.similarity) || 0) / 100 + 0.35),
    similarity: typeof p.similarity === "number" ? p.similarity : undefined,
  }));
}

function layoutColumns(
  students: GraphNode[],
  tutors: GraphNode[],
): Map<string, { x: number; y: number }> {
  const pos = new Map<string, { x: number; y: number }>();
  const colLeft = PAD + NODE_W / 2;
  const colRight = CANVAS_W - PAD - NODE_W / 2;
  const y0 = PAD + NODE_H / 2;
  students.forEach((n, i) => {
    pos.set(n.id, { x: colLeft, y: y0 + i * (NODE_H + GAP_Y) });
  });
  tutors.forEach((n, i) => {
    pos.set(n.id, { x: colRight, y: y0 + i * (NODE_H + GAP_Y) });
  });
  return pos;
}

function nodesFromQueue(requests: PairingRequest[]): GraphNode[] {
  return requests.map((r) => ({
    id: r.userId,
    label: truncate(`${r.profile.firstName} ${r.profile.lastName}`),
    role: r.type,
    priority: r.priority,
  }));
}

function nodesFromPreview(previews: PairingMatchPreview[]): GraphNode[] {
  const byId = new Map<string, GraphNode>();
  for (const p of previews) {
    if (!byId.has(p.student_id)) {
      byId.set(p.student_id, {
        id: p.student_id,
        label: truncate(p.student_name),
        role: "student",
      });
    }
    if (!byId.has(p.tutor_id)) {
      byId.set(p.tutor_id, {
        id: p.tutor_id,
        label: truncate(p.tutor_name),
        role: "tutor",
      });
    }
  }
  return [...byId.values()];
}

export type PairingCommitteeGraphDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "queue" | "preview";
  requests?: PairingRequest[];
  previews?: PairingMatchPreview[];
  /** Replaces the default "Pairing committee graph" title */
  title?: string;
  /** Replaces the default mode-specific description under the title */
  description?: string;
};

export function PairingCommitteeGraphDialog({
  open,
  onOpenChange,
  mode,
  requests = [],
  previews = [],
  title,
  description,
}: PairingCommitteeGraphDialogProps) {
  const markerId = useId().replace(/:/g, "");

  const graph = useMemo(() => {
    if (mode === "preview") {
      const edges = buildPreviewEdges(previews);
      const nodes = nodesFromPreview(previews);
      const students = nodes.filter((n) => n.role === "student");
      const tutors = nodes.filter((n) => n.role === "tutor");
      students.sort((a, b) => a.label.localeCompare(b.label));
      tutors.sort((a, b) => a.label.localeCompare(b.label));
      const canvasH =
        PAD * 2 + Math.max(students.length, tutors.length, 1) * (NODE_H + GAP_Y);
      return {
        edges,
        nodes,
        students,
        tutors,
        canvasH,
        subtitle:
          "Arrows show proposed pairings for this preview (student → tutor). Use the table to include or exclude matches before applying.",
      };
    }

    const edges = buildQueueEdges(requests);
    const nodes = nodesFromQueue(requests);
    const students = nodes.filter((n) => n.role === "student");
    const tutors = nodes.filter((n) => n.role === "tutor");
    students.sort(
      (a, b) =>
        (a.priority ?? 0) - (b.priority ?? 0) || a.label.localeCompare(b.label),
    );
    tutors.sort(
      (a, b) =>
        (a.priority ?? 0) - (b.priority ?? 0) || a.label.localeCompare(b.label),
    );
    const canvasH =
      PAD * 2 + Math.max(students.length, tutors.length, 1) * (NODE_H + GAP_Y);
    return {
      edges,
      nodes,
      students,
      tutors,
      canvasH,
      subtitle:
        "Students on the left, tutors on the right. Arrows show subject or availability overlap in the current queue (committee planning view).",
    };
  }, [mode, requests, previews]);

  const { edges, nodes, students, tutors, canvasH, subtitle } = graph;
  const dialogTitle = title ?? "Pairing committee graph";
  const dialogDescription = description ?? subtitle;

  const positions = useMemo(
    () => layoutColumns(students, tutors),
    [students, tutors],
  );

  const edgePaths = useMemo(() => {
    return edges
      .map((e, idx) => {
        const a = positions.get(e.from);
        const b = positions.get(e.to);
        if (!a || !b) return null;
        const x1 = a.x + NODE_W / 2;
        const y1 = a.y;
        const x2 = b.x - NODE_W / 2;
        const y2 = b.y;
        const mid = (x1 + x2) / 2;
        const lift = (idx % 7) * 5 - 15;
        const d = `M ${x1} ${y1} Q ${mid} ${y1 + lift} ${x2} ${y2}`;
        return { d, edge: e, key: `${e.from}-${e.to}-${idx}` };
      })
      .filter(Boolean) as { d: string; edge: GraphEdge; key: string }[];
  }, [edges, positions]);

  const empty =
    mode === "queue"
      ? requests.length === 0
      : previews.length === 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[920px] max-h-[92vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>{dialogDescription}</DialogDescription>
        </DialogHeader>
        <div className="flex-1 min-h-0 overflow-auto rounded-md border bg-muted/20 p-2">
          {empty ? (
            <p className="text-sm text-muted-foreground p-4">
              Nothing to graph yet.
            </p>
          ) : (
            <>
              {edges.length === 0 && mode === "queue" && (
                <p className="text-sm text-amber-900 bg-amber-50 border border-amber-200 rounded-md p-2 mb-2">
                  No subject or time overlap between any student and tutor in the
                  queue. People are still shown below; add overlaps in profiles
                  or run a preview to see proposed matches.
                </p>
              )}
              <svg
                width="100%"
                viewBox={`0 0 ${CANVAS_W} ${canvasH}`}
                className="min-w-[640px] h-auto block"
                role="img"
                aria-label="Tutor and student connection graph"
              >
                <defs>
                  <marker
                    id={`pairing-arrow-${markerId}`}
                    markerWidth="9"
                    markerHeight="9"
                    refX="8"
                    refY="4.5"
                    orient="auto"
                  >
                    <path d="M0,0 L9,4.5 L0,9 Z" fill="#64748b" />
                  </marker>
                </defs>

                {edgePaths.map(({ d, edge, key }) => (
                  <path
                    key={key}
                    d={d}
                    fill="none"
                    stroke="#94a3b8"
                    strokeWidth={1 + edge.strength * 1.8}
                    strokeOpacity={0.4 + edge.strength * 0.45}
                    markerEnd={`url(#pairing-arrow-${markerId})`}
                  />
                ))}

                {nodes.map((n) => {
                  const p = positions.get(n.id);
                  if (!p) return null;
                  const isStudent = n.role === "student";
                  const x = p.x - NODE_W / 2;
                  const y = p.y - NODE_H / 2;
                  const fill = isStudent ? "#eff6ff" : "#ecfdf5";
                  const stroke = isStudent ? "#60a5fa" : "#34d399";
                  const sub =
                    n.priority != null
                      ? `${isStudent ? "Student" : "Tutor"} · P${n.priority}`
                      : isStudent
                        ? "Student"
                        : "Tutor";
                  return (
                    <g key={n.id}>
                      <rect
                        x={x}
                        y={y}
                        width={NODE_W}
                        height={NODE_H}
                        rx={6}
                        fill={fill}
                        stroke={stroke}
                        strokeWidth={2}
                      />
                      <text
                        x={p.x}
                        y={y + 17}
                        textAnchor="middle"
                        fill="#0f172a"
                        fontSize={11}
                        fontWeight={600}
                        fontFamily="system-ui, sans-serif"
                      >
                        {n.label}
                      </text>
                      <text
                        x={p.x}
                        y={y + 32}
                        textAnchor="middle"
                        fill="#64748b"
                        fontSize={9}
                        fontFamily="system-ui, sans-serif"
                      >
                        {sub}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
