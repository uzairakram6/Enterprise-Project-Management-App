import React from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  User,
  Clock,
  FileText,
  Download,
} from "lucide-react";
import type { WeeklyUpdateRecord } from "./WeeklyUpdatesView";

const STATUS_LABEL: Record<WeeklyUpdateRecord["status"], string> = {
  draft: "Draft",
  submitted: "Submitted",
  approved: "Approved",
  rejected: "Rejected",
};

const STATUS_BADGE: Record<WeeklyUpdateRecord["status"], string> = {
  draft: "bg-muted text-muted-foreground",
  submitted: "bg-blue-500 hover:bg-blue-500",
  approved: "bg-green-500 hover:bg-green-500",
  rejected: "bg-red-500 hover:bg-red-500",
};

const METRIC_LABELS: Record<string, string> = {
  schedule: "Schedule",
  delivery: "Delivery",
  quality: "Quality",
  financial: "Financial",
  budget: "Budget",
};

interface WeeklyUpdateReportViewProps {
  update: WeeklyUpdateRecord;
  onBack: () => void;
}

function metricIcon(status: "green" | "amber" | "red") {
  if (status === "green") return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
  if (status === "amber") return <AlertTriangle className="h-5 w-5 text-amber-500" />;
  return <XCircle className="h-5 w-5 text-red-500" />;
}

function metricBadge(status: "green" | "amber" | "red") {
  const map = {
    green: { className: "bg-emerald-500 hover:bg-emerald-500", label: "On Track" },
    amber: { className: "bg-amber-500 hover:bg-amber-500", label: "At Risk" },
    red: { className: "bg-red-500 hover:bg-red-500", label: "Delayed" },
  };
  const item = map[status];
  return <Badge className={item.className}>{item.label}</Badge>;
}

export default function WeeklyUpdateReportView({ update, onBack }: WeeklyUpdateReportViewProps) {
  const metrics = update.metrics ?? {
    schedule: { status: "green" as const, notes: "All milestones completed on time." },
    delivery: { status: "green" as const, notes: "Sprint deliverables completed successfully." },
    quality: { status: "amber" as const, notes: "Test coverage improving; target 85% next week." },
    financial: { status: "green" as const, notes: "Within budget. No concerns." },
    budget: { status: "green" as const, notes: "Spend tracking on plan." },
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to updates
        </Button>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl">Weekly update report</h1>
          <p className="mt-1 text-lg font-medium">{update.projectName}</p>
          <p className="text-muted-foreground">{update.weekDate}</p>
        </div>
        <Button variant="outline" className="gap-2 shrink-0">
          <Download className="h-4 w-4" />
          Download PDF
        </Button>
      </div>

      <Card className="p-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="flex items-center gap-3">
            <User className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Submitted by</p>
              <p className="font-medium">{update.submittedBy ?? "Hamza Khan"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Submitted at</p>
              <p className="font-medium">{update.submittedAt ?? "Jun 7, 2026 at 5:30 PM"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge variant="outline" className={STATUS_BADGE[update.status]}>
                {STATUS_LABEL[update.status]}
              </Badge>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="mb-4 text-xl font-semibold">Executive summary</h2>
        <div className="rounded-lg bg-muted/30 p-4">
          <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
            {update.summary}
          </p>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="mb-6 text-xl font-semibold">Project health metrics</h2>
        <div className="space-y-4">
          {Object.entries(metrics).map(([key, value], index, arr) => (
            <div key={key}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  {metricIcon(value.status)}
                  <h3 className="font-medium">{METRIC_LABELS[key] ?? key}</h3>
                </div>
                {metricBadge(value.status)}
              </div>
              {value.notes && (
                <p className="ml-8 mt-2 text-sm text-muted-foreground">{value.notes}</p>
              )}
              {index < arr.length - 1 && <Separator className="mt-4" />}
            </div>
          ))}
        </div>
      </Card>

      {update.additionalNotes && (
        <Card className="p-6">
          <h2 className="mb-4 text-xl font-semibold">Additional notes</h2>
          <p className="whitespace-pre-line text-sm text-muted-foreground">{update.additionalNotes}</p>
        </Card>
      )}

      {update.attachmentName && (
        <Card className="p-6">
          <h2 className="mb-4 text-xl font-semibold">Attachments</h2>
          <div className="flex items-center gap-3 rounded-lg border p-4">
            <div className="rounded bg-blue-100 p-2">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{update.attachmentName}</p>
              <p className="text-xs text-muted-foreground">Supporting document</p>
            </div>
            <Button variant="ghost" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              Download
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
