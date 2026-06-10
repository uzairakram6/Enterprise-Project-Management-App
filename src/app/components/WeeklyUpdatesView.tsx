import React, { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import WeeklyUpdateWizard, { type WeeklyUpdateSubmission } from "./WeeklyUpdateWizard";
import WeeklyUpdateReportView from "./WeeklyUpdateReportView";
import { CalendarDays, Eye, FileText, Plus } from "lucide-react";

export type WeeklyUpdateStatus = "draft" | "submitted" | "approved" | "rejected";

export interface WeeklyUpdateMetric {
  status: "green" | "amber" | "red";
  notes?: string;
}

export interface WeeklyUpdateRecord {
  id: string;
  projectName: string;
  weekDate: string;
  summary: string;
  status: WeeklyUpdateStatus;
  submittedBy?: string;
  submittedAt?: string;
  metrics?: Record<string, WeeklyUpdateMetric>;
  additionalNotes?: string;
  attachmentName?: string;
}

const STATUS_LABEL: Record<WeeklyUpdateStatus, string> = {
  draft: "Draft",
  submitted: "Submitted",
  approved: "Approved",
  rejected: "Rejected",
};

const STATUS_CLASS: Record<WeeklyUpdateStatus, string> = {
  draft: "bg-slate-100 text-slate-700 border-slate-200",
  submitted: "bg-blue-50 text-blue-700 border-blue-200",
  approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
};

const INITIAL_UPDATES: WeeklyUpdateRecord[] = [
  {
    id: "wu-1",
    projectName: "Sumhuman",
    weekDate: "Jun 1–Jun 7, 2026",
    summary: `Weekly Update - Week 23 (Jun 1–Jun 7, 2026)

Key Accomplishments:
• Completed multi-tenancy database schema implementation
• Successfully deployed tenant isolation middleware
• Integrated authentication flow with role-based permissions

Progress: 85% complete, on schedule for Q2 delivery

Team Performance: All 8 team members submitted daily updates with 97% compliance

Next Week Focus:
• API endpoint testing and optimization
• Frontend integration for tenant management
• Security audit preparation`,
    status: "approved",
    submittedBy: "Manohar Ali",
    submittedAt: "Jun 7, 2026 at 5:30 PM",
    metrics: {
      schedule: { status: "green", notes: "All milestones completed on time." },
      delivery: { status: "green", notes: "Sprint deliverables completed successfully." },
      quality: { status: "amber", notes: "Unit test coverage at 78%. Targeting 85% next week." },
      financial: { status: "green", notes: "Within budget. No concerns." },
      budget: { status: "green", notes: "72% budget utilized with 85% work completed." },
    },
  },
  {
    id: "wu-2",
    projectName: "GTS — Global Trash System",
    weekDate: "May 26–Jun 1, 2026",
    summary: `Weekly Update - Week 22 (May 26–Jun 1, 2026)

Key Accomplishments:
• Route optimization module deployed to staging
• Map API integration completed for pilot cities

Progress: 92% complete, ahead of schedule

Blockers:
• Two blockers on map API rate limits — mitigation in progress

Next Week Focus:
• Production rollout planning
• Performance testing on route engine`,
    status: "submitted",
    submittedBy: "Aries Khan",
    submittedAt: "May 31, 2026 at 4:45 PM",
    metrics: {
      schedule: { status: "green", notes: "Ahead of planned timeline." },
      delivery: { status: "green", notes: "Staging deployment successful." },
      quality: { status: "green", notes: "QA sign-off received for core flows." },
      financial: { status: "green", notes: "On budget." },
      budget: { status: "amber", notes: "Map API costs slightly above forecast." },
    },
  },
  {
    id: "wu-3",
    projectName: "Bilingual Chatbot",
    weekDate: "May 19–May 25, 2026",
    summary: `Weekly Update - Week 21 (May 19–May 25, 2026)

Key Accomplishments:
• NLP pipeline tuning for Urdu/English code-switching
• Intent classification accuracy improved to 84%

Progress: 68% complete, quality metrics at risk

Next Week Focus:
• Expand test coverage for edge-case intents
• Review model latency under load`,
    status: "draft",
    submittedBy: "Uzair Ahmed",
    submittedAt: "May 25, 2026 at 6:00 PM",
    metrics: {
      schedule: { status: "amber", notes: "Slight delay on evaluation dataset cleanup." },
      delivery: { status: "amber", notes: "Pilot demo moved by one week." },
      quality: { status: "red", notes: "Test coverage below target due to dataset gaps." },
      financial: { status: "green", notes: "Spend within plan." },
      budget: { status: "green", notes: "No variance concerns." },
    },
  },
];

function truncateSummary(text: string, max = 80) {
  const line = text.split("\n").find((part) => part.trim()) ?? text;
  if (line.length <= max) return line;
  return `${line.slice(0, max).trim()}…`;
}

function projectInitials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export default function WeeklyUpdatesView() {
  const [updates, setUpdates] = useState<WeeklyUpdateRecord[]>(INITIAL_UPDATES);
  const [showWizard, setShowWizard] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  const selectedReport = updates.find((update) => update.id === selectedReportId);

  const handleSubmit = (submission: WeeklyUpdateSubmission) => {
    setUpdates((current) => [
      {
        id: `wu-${Date.now()}`,
        projectName: submission.projectName,
        weekDate: submission.weekDate,
        summary: submission.summary,
        status: "submitted",
        submittedBy: "Hamza Khan",
        submittedAt: new Date().toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
        }),
        metrics: submission.metrics,
        additionalNotes: submission.additionalNotes,
        attachmentName: submission.attachmentName ?? undefined,
      },
      ...current,
    ]);
    setShowWizard(false);
  };

  if (showWizard) {
    return (
      <WeeklyUpdateWizard
        onBack={() => setShowWizard(false)}
        onSubmit={handleSubmit}
      />
    );
  }

  if (selectedReport) {
    return (
      <WeeklyUpdateReportView
        update={selectedReport}
        onBack={() => setSelectedReportId(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl">Weekly Updates</h1>
          <p className="mt-1 text-muted-foreground">
            View submitted weekly updates or generate a new one for your project.
          </p>
        </div>
        <Button onClick={() => setShowWizard(true)} className="gap-2 shrink-0">
          <Plus className="h-4 w-4" />
          Generate Weekly update
        </Button>
      </div>

      <Card className="overflow-hidden border shadow-sm">
        <div className="flex items-center justify-between border-b bg-muted/30 px-5 py-4">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-medium">All weekly updates</p>
              <p className="text-xs text-muted-foreground">
                {updates.length} report{updates.length !== 1 ? "s" : ""} on record
              </p>
            </div>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="bg-muted/20 hover:bg-muted/20">
              <TableHead className="pl-5 font-semibold">Project name</TableHead>
              <TableHead className="font-semibold">Week date</TableHead>
              <TableHead className="min-w-[260px] font-semibold">Summary</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="pr-5 text-right font-semibold">Report</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {updates.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-28 text-center text-muted-foreground">
                  No weekly updates yet. Click &quot;Generate Weekly update&quot; to create one.
                </TableCell>
              </TableRow>
            ) : (
              updates.map((update) => (
                <TableRow key={update.id} className="hover:bg-muted/30">
                  <TableCell className="pl-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-semibold text-primary">
                        {projectInitials(update.projectName)}
                      </div>
                      <span className="font-medium">{update.projectName}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <CalendarDays className="h-4 w-4 shrink-0" />
                      <span className="text-sm">{update.weekDate}</span>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs text-sm text-muted-foreground">
                    {truncateSummary(update.summary)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={STATUS_CLASS[update.status]}>
                      {STATUS_LABEL[update.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="pr-5 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => setSelectedReportId(update.id)}
                    >
                      <Eye className="h-4 w-4" />
                      View report
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
