import React, { Fragment, useMemo, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
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
import { DateField } from "./project/DateField";
import { PROJECTS } from "../data/projects";
import {
  buildProjectWeekOptionFromDate,
  buildProjectWeekOptions,
  formatProjectWeekRange,
  getCurrentProjectWeek,
} from "../data/projectWeeks";
import { findWeekOption, type WeekOption } from "../data/weeks";
import { toast } from "sonner";
import { cn } from "./ui/utils";
import {
  AlertTriangle,
  ArrowLeft,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Info,
  CircleDollarSign,
  PieChart,
  Rocket,
  Send,
  Sparkles,
  Upload,
  XCircle,
} from "lucide-react";

export interface WeeklyUpdateSubmission {
  projectName: string;
  weekNumber: number;
  weekDate: string;
  summary: string;
  metrics?: Record<string, { status: "green" | "amber" | "red"; notes?: string }>;
  additionalNotes?: string;
  attachmentName?: string | null;
}

interface WeeklyUpdateWizardProps {
  onBack: () => void;
  onSubmit: (submission: WeeklyUpdateSubmission) => void;
}

const STEPS = ["Setup", "Summary", "Metrics", "Details", "Review"];

const CORE_METRICS = [
  { id: "schedule", label: "Schedule", icon: CalendarDays, description: "Timeline and milestone adherence" },
  { id: "delivery", label: "Delivery", icon: Rocket, description: "Release and output commitments" },
  { id: "quality", label: "Quality", icon: Sparkles, description: "Defects, testing, and standards" },
  { id: "financial", label: "Financial", icon: CircleDollarSign, description: "Revenue, costs, and forecasts" },
  { id: "budget", label: "Budget", icon: PieChart, description: "Spend tracking and variance" },
] as const;

type MetricId = (typeof CORE_METRICS)[number]["id"];
type MetricStatus = "green" | "amber" | "red";

const STATUS_OPTIONS: { value: MetricStatus; label: string; icon: typeof CheckCircle2; tone: string }[] = [
  { value: "green", label: "On Track", icon: CheckCircle2, tone: "emerald" },
  { value: "amber", label: "At Risk", icon: AlertTriangle, tone: "amber" },
  { value: "red", label: "Delayed", icon: XCircle, tone: "red" },
];

const DAILY_UPDATES_BY_WEEK: Record<string, { member: string; task: string; subTask: string; hours: number; summary: string }[]> = {
  "2026-PW21": [
    { member: "Manohar Ali", task: "Multi-Tenancy Platform", subTask: "Tenant middleware", hours: 6, summary: "Completed tenant context injection for API routes." },
    { member: "Aries Khan", task: "Multi-Tenancy Platform", subTask: "RLS policies", hours: 5, summary: "Drafted row-level security policies for core tables." },
    { member: "Ahmed Khan", task: "Multi-Tenancy Platform", subTask: "Tenant switcher UI", hours: 7, summary: "Built tenant switcher component with role checks." },
  ],
  "2026-PW22": [
    { member: "Manohar Ali", task: "Multi-Tenancy Platform", subTask: "Migration scripts", hours: 8, summary: "Validated migration scripts on staging data." },
    { member: "Sarah Ali", task: "Multi-Tenancy Platform", subTask: "Admin bypass tests", hours: 6, summary: "Added regression tests for admin bypass flows." },
    { member: "Hassan Malik", task: "Multi-Tenancy Platform", subTask: "OAuth callback handling", hours: 5, summary: "Fixed callback edge cases for multi-tenant login." },
  ],
  "2026-PW23": [
    { member: "Manohar Ali", task: "Multi-Tenancy Platform", subTask: "RLS policies", hours: 7, summary: "Finalized RLS policies and peer review completed." },
    { member: "Aries Khan", task: "Multi-Tenancy Platform", subTask: "Tenant ID columns", hours: 6, summary: "Added tenant ID columns across shared entities." },
    { member: "Ahmed Khan", task: "Multi-Tenancy Platform", subTask: "Tenant middleware", hours: 8, summary: "Deployed tenant middleware to staging." },
    { member: "Sarah Ali", task: "Multi-Tenancy Platform", subTask: "Map API setup", hours: 5, summary: "Integrated map API with tenant-scoped keys." },
  ],
  "2026-PW24": [
    { member: "Manohar Ali", task: "Multi-Tenancy Platform", subTask: "Security audit prep", hours: 6, summary: "Prepared audit checklist and evidence pack." },
    { member: "Hassan Malik", task: "Multi-Tenancy Platform", subTask: "API endpoint testing", hours: 7, summary: "Started endpoint load testing for tenant APIs." },
  ],
};

function Stepper({ current }: { current: number }) {
  return (
    <div>
      <ol className="hidden items-center sm:flex">
        {STEPS.map((label, i) => {
          const stepNum = i + 1;
          const isDone = stepNum < current;
          const isActive = stepNum === current;
          const connectorDone = current > stepNum;
          return (
            <Fragment key={label}>
              <li className="flex shrink-0 items-center gap-2.5">
                <span
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full text-sm transition-colors",
                    isDone && "bg-primary text-primary-foreground",
                    isActive && "bg-primary text-primary-foreground ring-4 ring-primary/15",
                    !isDone && !isActive && "bg-muted text-muted-foreground",
                  )}
                >
                  {isDone ? <Check className="h-4 w-4" /> : stepNum}
                </span>
                <span
                  className={cn(
                    "text-sm",
                    isActive || isDone ? "font-medium text-foreground" : "text-muted-foreground",
                  )}
                >
                  {label}
                </span>
              </li>
              {i < STEPS.length - 1 && (
                <div
                  className={cn(
                    "mx-3 h-px flex-1 transition-colors",
                    connectorDone ? "bg-primary" : "bg-border",
                  )}
                />
              )}
            </Fragment>
          );
        })}
      </ol>

      <div className="sm:hidden">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium">{STEPS[current - 1]}</span>
          <span className="text-muted-foreground">
            Step {current} of {STEPS.length}
          </span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-muted">
          <div
            className="h-1.5 rounded-full bg-primary transition-all"
            style={{ width: `${(current / STEPS.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="max-w-[65%] text-right text-sm font-medium">{value}</span>
    </div>
  );
}

function statusBadgeClass(status: MetricStatus | undefined) {
  if (status === "green") return "bg-emerald-500 hover:bg-emerald-500";
  if (status === "amber") return "bg-amber-500 hover:bg-amber-500";
  if (status === "red") return "bg-red-500 hover:bg-red-500";
  return "bg-muted text-muted-foreground hover:bg-muted";
}

function statusLabel(status: MetricStatus | undefined) {
  if (status === "green") return "On Track";
  if (status === "amber") return "At Risk";
  if (status === "red") return "Delayed";
  return "Not set";
}

export default function WeeklyUpdateWizard({ onBack, onSubmit }: WeeklyUpdateWizardProps) {
  const reduceMotion = useReducedMotion();
  const referenceDate = useMemo(() => new Date(2026, 5, 10), []);
  const weekOptions = useMemo(() => buildProjectWeekOptions(referenceDate), [referenceDate]);
  const defaultWeek =
    weekOptions.find((w) => w.weekNumber === getCurrentProjectWeek(referenceDate)) ??
    weekOptions[weekOptions.length - 1];

  const [step, setStep] = useState(1);
  const [selectedProjectId, setSelectedProjectId] = useState(String(PROJECTS[0]?.id ?? 1));
  const [selectedWeekValue, setSelectedWeekValue] = useState(defaultWeek.value);
  const [weekPickerDate, setWeekPickerDate] = useState<Date | undefined>(defaultWeek.start);
  const [executiveSummary, setExecutiveSummary] = useState("");
  const [metricStatuses, setMetricStatuses] = useState<Partial<Record<MetricId, MetricStatus>>>({});
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [attachmentName, setAttachmentName] = useState<string | null>(null);

  const selectedProject = PROJECTS.find((p) => String(p.id) === selectedProjectId) ?? PROJECTS[0];
  const selectedWeek =
    findWeekOption(selectedWeekValue, weekOptions) ?? defaultWeek;

  const weekDailyUpdates =
    DAILY_UPDATES_BY_WEEK[selectedWeek.value] ??
    DAILY_UPDATES_BY_WEEK["2026-PW21"] ??
    [];

  const flaggedMetrics = CORE_METRICS.filter((metric) => {
    const status = metricStatuses[metric.id];
    return status === "amber" || status === "red";
  });

  const handleWeekSelect = (value: string) => {
    setSelectedWeekValue(value);
    const option = findWeekOption(value, weekOptions);
    if (option) setWeekPickerDate(option.start);
  };

  const handleCalendarWeekPick = (date?: Date) => {
    if (!date) return;
    const option = buildProjectWeekOptionFromDate(date);
    setWeekPickerDate(date);
    const existing = findWeekOption(option.value, weekOptions);
    setSelectedWeekValue(existing?.value ?? option.value);
  };

  const generateAISummary = () => {
    const updateLines = weekDailyUpdates
      .map((entry) => `• ${entry.member}: ${entry.subTask} — ${entry.summary}`)
      .join("\n");

    setExecutiveSummary(
      `Weekly Update - Week ${selectedWeek.weekNumber} (${formatProjectWeekRange(selectedWeek.weekNumber, selectedWeek.year)})\n\nKey Accomplishments:\n• Completed multi-tenancy database schema implementation\n• Successfully deployed tenant isolation middleware\n• Integrated authentication flow with role-based permissions\n\nProgress: 85% complete, on schedule for Q2 delivery\n\nTeam Performance: All ${selectedProject.team} team members submitted daily updates with 97% compliance\n\nDaily update highlights:\n${updateLines || "• No daily updates found for this week."}\n\nNext Week Focus:\n• API endpoint testing and optimization\n• Frontend integration for tenant management\n• Security audit preparation`,
    );
    toast.success("Summary generated from this week's daily updates");
  };

  const handleAttachmentPick = () => {
    setAttachmentName("weekly-evidence-pack.pdf");
    toast.message("Attachment added", { description: "weekly-evidence-pack.pdf" });
  };

  const canProceed = () => {
    if (step === 1) return Boolean(selectedProjectId && selectedWeekValue);
    if (step === 2) return executiveSummary.trim().length > 20;
    if (step === 3) return CORE_METRICS.every((metric) => metricStatuses[metric.id]);
    return true;
  };

  const handleSubmit = () => {
    onSubmit({
      projectName: selectedProject.name,
      weekNumber: selectedWeek.weekNumber,
      weekDate: formatProjectWeekRange(selectedWeek.weekNumber, selectedWeek.year),
      summary: executiveSummary.trim(),
      metrics: Object.fromEntries(
        CORE_METRICS.map((metric) => [
          metric.id,
          { status: metricStatuses[metric.id] ?? "green" },
        ]),
      ),
      additionalNotes: additionalNotes.trim() || undefined,
      attachmentName: attachmentName,
    });
    toast.success("Weekly update submitted for review", {
      description: `${selectedProject.name} · Week ${selectedWeek.weekNumber} sent to your manager for approval.`,
    });
    setStep(1);
    setExecutiveSummary("");
    setMetricStatuses({});
    setAdditionalNotes("");
    setAttachmentName(null);
  };

  const renderStep = () => {
    if (step === 1) {
      return (
        <div className="space-y-5">
          <div>
            <h2 className="text-xl">Project & week</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Choose which project and week this update covers.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Project *</Label>
              <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  {PROJECTS.map((project) => (
                    <SelectItem key={project.id} value={String(project.id)}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Week *</Label>
              <Select value={selectedWeekValue} onValueChange={handleWeekSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Select week" />
                </SelectTrigger>
                <SelectContent>
                  {weekOptions.map((week) => (
                    <SelectItem key={week.value} value={week.value}>
                      {week.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DateField
            id="week-calendar"
            label="Or pick any date to select its week"
            value={weekPickerDate}
            onChange={handleCalendarWeekPick}
            placeholder="Pick a date"
          />
        </div>
      );
    }

    if (step === 2) {
      return (
        <div className="space-y-5">
          <div>
            <h2 className="text-xl">Executive summary</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Write your own summary or generate one from this week&apos;s daily updates.
            </p>
          </div>

          <Card className="overflow-hidden">
            <div className="border-b bg-muted/30 px-4 py-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-medium">Daily updates for {selectedWeek.label}</p>
                  <p className="text-xs text-muted-foreground">{selectedProject.name}</p>
                </div>
                <Badge variant="secondary">{weekDailyUpdates.length} entries</Badge>
              </div>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Task</TableHead>
                  <TableHead>Sub task</TableHead>
                  <TableHead>Hours</TableHead>
                  <TableHead className="min-w-[220px]">Update</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {weekDailyUpdates.map((entry) => (
                  <TableRow key={`${entry.member}-${entry.subTask}`}>
                    <TableCell className="font-medium">{entry.member}</TableCell>
                    <TableCell>{entry.task}</TableCell>
                    <TableCell>{entry.subTask}</TableCell>
                    <TableCell>{entry.hours}h</TableCell>
                    <TableCell className="text-muted-foreground">{entry.summary}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="executive-summary">Summary *</Label>
              <Button type="button" variant="outline" size="sm" onClick={generateAISummary} className="gap-2">
                <Sparkles className="h-4 w-4" />
                Generate with AI
              </Button>
            </div>
            <Textarea
              id="executive-summary"
              placeholder="Enter executive summary or generate one with AI..."
              value={executiveSummary}
              onChange={(e) => setExecutiveSummary(e.target.value)}
              rows={12}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              AI will analyze all daily updates, sub tasks, and team activities from this week.
            </p>
          </div>
        </div>
      );
    }

    if (step === 3) {
      return (
        <div className="space-y-5">
          <div>
            <h2 className="text-xl">Project health metrics</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Select the status for each metric. Green means on track, yellow at risk, red delayed.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {CORE_METRICS.map((metric) => {
              const Icon = metric.icon;
              const selected = metricStatuses[metric.id];
              return (
                <Card key={metric.id} className="flex h-full flex-col overflow-hidden border shadow-sm">
                  <div className="border-b bg-gradient-to-b from-muted/60 to-background px-3 py-3 text-center">
                    <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Icon className="h-4 w-4" />
                    </div>
                    <h3 className="text-sm font-semibold">{metric.label}</h3>
                    <p className="mt-1 min-h-[2.25rem] text-[11px] leading-snug text-muted-foreground">
                      {metric.description}
                    </p>
                  </div>
                  <div className="flex flex-1 flex-col space-y-1.5 p-3">
                    {STATUS_OPTIONS.map((option) => {
                      const OptionIcon = option.icon;
                      const isSelected = selected === option.value;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() =>
                            setMetricStatuses((current) => ({
                              ...current,
                              [metric.id]: option.value,
                            }))
                          }
                          className={cn(
                            "flex w-full items-center gap-2 rounded-lg border px-2.5 py-2 text-left text-sm transition-all",
                            isSelected && option.value === "green" &&
                              "border-emerald-500 bg-emerald-500 text-white shadow-sm shadow-emerald-500/20",
                            isSelected && option.value === "amber" &&
                              "border-amber-500 bg-amber-500 text-white shadow-sm shadow-amber-500/20",
                            isSelected && option.value === "red" &&
                              "border-red-500 bg-red-500 text-white shadow-sm shadow-red-500/20",
                            !isSelected && "hover:border-primary/30 hover:bg-muted/40",
                          )}
                        >
                          <OptionIcon className={cn("h-4 w-4 shrink-0", !isSelected && option.value === "green" && "text-emerald-600", !isSelected && option.value === "amber" && "text-amber-600", !isSelected && option.value === "red" && "text-red-600")} />
                          <span className={cn("font-medium", !isSelected && "text-foreground")}>{option.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </Card>
              );
            })}
          </div>

          {flaggedMetrics.length > 0 && (
            <div className="flex gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
              <p className="text-sm text-amber-900">
                {flaggedMetrics.map((m) => m.label).join(", ")} marked as at risk or delayed. You can add context on the next step.
              </p>
            </div>
          )}
        </div>
      );
    }

    if (step === 4) {
      return (
        <div className="space-y-5">
          <div>
            <h2 className="text-xl">Additional details</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Optional notes and attachments. Skip this step if nothing extra is needed.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="additional-notes">Description</Label>
            <Textarea
              id="additional-notes"
              placeholder={
                flaggedMetrics.length > 0
                  ? "Explain blockers, mitigation plans, or context for at-risk metrics..."
                  : "Add any extra context for reviewers (optional)..."
              }
              rows={6}
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Attachment</Label>
            <button
              type="button"
              onClick={handleAttachmentPick}
              className="w-full rounded-lg border-2 border-dashed p-6 text-center transition-colors hover:border-primary/50 hover:bg-muted/20"
            >
              <Upload className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Click to upload or drag and drop</p>
              <p className="mt-1 text-xs text-muted-foreground">Screenshots, documents, reports (optional)</p>
              {attachmentName && (
                <Badge variant="secondary" className="mt-3">
                  {attachmentName}
                </Badge>
              )}
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-5">
        <div>
          <h2 className="text-xl">Review & submit</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Confirm everything looks right before sending for manager approval.
          </p>
        </div>

        <div className="rounded-lg border">
          <div className="border-b px-4 py-3">
            <h3 className="text-sm font-medium">Weekly update report</h3>
          </div>
          <div className="divide-y px-4">
            <SummaryRow label="Project" value={selectedProject.name} />
            <SummaryRow label="Week" value={selectedWeek.label} />
            <SummaryRow label="Submitted by" value="Hamza Khan (PM)" />
          </div>
        </div>

        <div className="rounded-lg border">
          <div className="border-b px-4 py-3">
            <h3 className="text-sm font-medium">Executive summary</h3>
          </div>
          <div className="px-4 py-4">
            <p className="whitespace-pre-line text-sm leading-relaxed">{executiveSummary}</p>
          </div>
        </div>

        <div className="rounded-lg border">
          <div className="border-b px-4 py-3">
            <h3 className="text-sm font-medium">Health metrics</h3>
          </div>
          <div className="flex flex-wrap gap-2 px-4 py-4">
            {CORE_METRICS.map((metric) => (
              <Badge key={metric.id} className={statusBadgeClass(metricStatuses[metric.id])}>
                {metric.label}: {statusLabel(metricStatuses[metric.id])}
              </Badge>
            ))}
          </div>
        </div>

        {(additionalNotes || attachmentName) && (
          <div className="rounded-lg border">
            <div className="border-b px-4 py-3">
              <h3 className="text-sm font-medium">Additional details</h3>
            </div>
            <div className="space-y-3 px-4 py-4 text-sm">
              {additionalNotes && <p className="whitespace-pre-line text-muted-foreground">{additionalNotes}</p>}
              {attachmentName && (
                <div className="flex items-center gap-2">
                  <Upload className="h-4 w-4 text-muted-foreground" />
                  <span>{attachmentName}</span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
          <p className="text-sm text-blue-900">
            Submitting sends this update into the approval workflow. Your manager reviews it first, then it moves up the chain.
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to updates
        </Button>
      </div>

      <div>
        <h1 className="text-3xl">Generate weekly update</h1>
        <p className="mt-1 text-muted-foreground">
          Create a structured weekly update with summary, health metrics, and review workflow.
        </p>
      </div>

      <Card className="p-5">
        <Stepper current={step} />
      </Card>

      <Card className="p-6 md:p-8">
        <motion.div
          key={step}
          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        >
          {renderStep()}
        </motion.div>
      </Card>

      <div className="flex items-center justify-between">
        {step === 1 ? (
          <Button variant="outline" onClick={onBack}>
            Cancel
          </Button>
        ) : (
          <Button variant="outline" onClick={() => setStep(step - 1)} className="gap-2">
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>
        )}

        {step < STEPS.length ? (
          <Button onClick={() => setStep(step + 1)} disabled={!canProceed()} className="gap-2">
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} className="gap-2 bg-green-600 hover:bg-green-700">
            <Send className="h-4 w-4" />
            Submit for review
          </Button>
        )}
      </div>
    </div>
  );
}

