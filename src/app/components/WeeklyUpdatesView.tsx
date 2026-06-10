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
import { Plus } from "lucide-react";

export type WeeklyUpdateStatus = "draft" | "submitted" | "approved" | "rejected";

export interface WeeklyUpdateRecord {
  id: string;
  projectName: string;
  weekDate: string;
  summary: string;
  status: WeeklyUpdateStatus;
}

const STATUS_LABEL: Record<WeeklyUpdateStatus, string> = {
  draft: "Draft",
  submitted: "Submitted",
  approved: "Approved",
  rejected: "Rejected",
};

const STATUS_CLASS: Record<WeeklyUpdateStatus, string> = {
  draft: "bg-muted text-muted-foreground",
  submitted: "bg-blue-100 text-blue-800 border-blue-200",
  approved: "bg-green-100 text-green-800 border-green-200",
  rejected: "bg-red-100 text-red-800 border-red-200",
};

const INITIAL_UPDATES: WeeklyUpdateRecord[] = [
  {
    id: "wu-1",
    projectName: "Sumhuman",
    weekDate: "Jun 1–Jun 7, 2026",
    summary: "Multi-tenancy schema completed. Team at 97% daily update compliance.",
    status: "approved",
  },
  {
    id: "wu-2",
    projectName: "GTS — Global Trash System",
    weekDate: "May 26–Jun 1, 2026",
    summary: "Route optimization module deployed to staging. Two blockers on map API.",
    status: "submitted",
  },
  {
    id: "wu-3",
    projectName: "Bilingual Chatbot",
    weekDate: "May 19–May 25, 2026",
    summary: "NLP pipeline tuning in progress. Quality metrics at risk due to test coverage.",
    status: "draft",
  },
];

function truncateSummary(text: string, max = 72) {
  const line = text.split("\n").find((part) => part.trim()) ?? text;
  if (line.length <= max) return line;
  return `${line.slice(0, max).trim()}…`;
}

export default function WeeklyUpdatesView() {
  const [updates, setUpdates] = useState<WeeklyUpdateRecord[]>(INITIAL_UPDATES);
  const [showWizard, setShowWizard] = useState(false);

  const handleSubmit = (submission: WeeklyUpdateSubmission) => {
    setUpdates((current) => [
      {
        id: `wu-${Date.now()}`,
        projectName: submission.projectName,
        weekDate: submission.weekDate,
        summary: submission.summary,
        status: "submitted",
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

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="font-semibold">Project name</TableHead>
              <TableHead className="font-semibold">Week date</TableHead>
              <TableHead className="font-semibold min-w-[280px]">Summary</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {updates.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                  No weekly updates yet. Click &quot;Generate Weekly update&quot; to create one.
                </TableCell>
              </TableRow>
            ) : (
              updates.map((update) => (
                <TableRow key={update.id}>
                  <TableCell className="font-medium">{update.projectName}</TableCell>
                  <TableCell>{update.weekDate}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {truncateSummary(update.summary)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={STATUS_CLASS[update.status]}>
                      {STATUS_LABEL[update.status]}
                    </Badge>
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
