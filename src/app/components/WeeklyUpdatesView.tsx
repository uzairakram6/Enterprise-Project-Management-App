import React, { useMemo, useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
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
import {
  type WeeklyUpdateMetric,
  type WeeklyUpdateRecord,
  type WeeklyUpdateStatus,
} from "../data/weeklyUpdates";
import { CalendarDays, FileText, Plus, Search } from "lucide-react";

export type { WeeklyUpdateMetric, WeeklyUpdateRecord, WeeklyUpdateStatus };

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

interface WeeklyUpdatesViewProps {
  updates: WeeklyUpdateRecord[];
  onUpdatesChange: React.Dispatch<React.SetStateAction<WeeklyUpdateRecord[]>>;
}

export default function WeeklyUpdatesView({
  updates,
  onUpdatesChange,
}: WeeklyUpdatesViewProps) {
  const [showWizard, setShowWizard] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [projectSearch, setProjectSearch] = useState("");
  const [weekFilter, setWeekFilter] = useState("all");

  const weekOptions = useMemo(() => {
    const seen = new Set<string>();
    const weeks: string[] = [];
    for (const update of updates) {
      if (!seen.has(update.weekDate)) {
        seen.add(update.weekDate);
        weeks.push(update.weekDate);
      }
    }
    return weeks;
  }, [updates]);

  const filteredUpdates = useMemo(() => {
    const query = projectSearch.trim().toLowerCase();
    return updates.filter((update) => {
      const matchesProject =
        query === "" || update.projectName.toLowerCase().includes(query);
      const matchesWeek = weekFilter === "all" || update.weekDate === weekFilter;
      return matchesProject && matchesWeek;
    });
  }, [updates, projectSearch, weekFilter]);

  const hasActiveFilters = projectSearch.trim() !== "" || weekFilter !== "all";

  const selectedReport = updates.find((update) => update.id === selectedReportId);

  const handleSubmit = (submission: WeeklyUpdateSubmission) => {
    const newUpdate: WeeklyUpdateRecord = {
      id: `wu-${Date.now()}`,
      projectName: submission.projectName,
      weekNumber: submission.weekNumber,
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
    };

    onUpdatesChange((current) => [
      newUpdate,
      ...current.filter(
        (update) =>
          !(
            update.projectName === submission.projectName &&
            update.weekNumber === submission.weekNumber
          ),
      ),
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
        <div className="flex flex-col gap-4 border-b bg-muted/30 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-medium">All weekly updates</p>
              <p className="text-xs text-muted-foreground">
                {filteredUpdates.length} report{filteredUpdates.length !== 1 ? "s" : ""}
                {hasActiveFilters ? ` matching filters` : " on record"}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="relative w-full sm:w-56">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search project name..."
                value={projectSearch}
                onChange={(e) => setProjectSearch(e.target.value)}
                className="h-8 pl-8 text-sm"
              />
            </div>
            <Select value={weekFilter} onValueChange={setWeekFilter}>
              <SelectTrigger className="h-8 w-full text-sm sm:w-52">
                <SelectValue placeholder="All weeks" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All weeks</SelectItem>
                {weekOptions.map((weekDate) => (
                  <SelectItem key={weekDate} value={weekDate}>
                    {weekDate}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="bg-muted/20 hover:bg-muted/20">
              <TableHead className="pl-5 font-semibold">Project name</TableHead>
              <TableHead className="font-semibold">Week date</TableHead>
              <TableHead className="min-w-[260px] font-semibold">Summary</TableHead>
              <TableHead className="pr-5 font-semibold">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {updates.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-28 text-center text-muted-foreground">
                  No weekly updates yet. Click &quot;Generate Weekly update&quot; to create one.
                </TableCell>
              </TableRow>
            ) : filteredUpdates.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-28 text-center text-muted-foreground">
                  No weekly updates match your filters. Try a different project name or week.
                </TableCell>
              </TableRow>
            ) : (
              filteredUpdates.map((update) => (
                <TableRow
                  key={update.id}
                  className="cursor-pointer hover:bg-muted/30"
                  onClick={() => setSelectedReportId(update.id)}
                >
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
                  <TableCell className="pr-5">
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
