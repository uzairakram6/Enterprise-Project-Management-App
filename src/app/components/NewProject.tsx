import { Fragment, useState } from "react";
import { DEFAULT_PROJECT_NAME } from "../data/projects";
import { addWeeks, format } from "date-fns";
import { motion, useReducedMotion } from "motion/react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { toast } from "sonner";
import { cn } from "./ui/utils";
import { DateField } from "./project/DateField";
import {
  ArrowLeft,
  Check,
  ChevronLeft,
  ChevronRight,
  X,
  UserPlus,
  Users,
  CalendarDays,
  Info,
  CheckCircle2,
} from "lucide-react";

interface NewProjectProps {
  onBack: () => void;
  isEditMode?: boolean;
}

interface TeamMember {
  name: string;
  role: string;
}

const MEMBER_POOL = [
  "Manohar Ali",
  "Aries Khan",
  "Uzair Ahmed",
  "Rohan Malik",
  "Khalid Hussain",
  "Sheroz Mubarak",
  "Mahnoor Sheikh",
  "Ahmed Khan",
  "Sarah Ali",
  "Hassan Malik",
  "Fatima Noor",
  "Omar Farooq",
  "Aisha Rahman",
  "Bilal Ahmed",
  "Zainab Hussain",
];

const ROLES = [
  "Project Manager",
  "Delivery Manager",
  "Engineering Manager",
  "Tech Lead",
  "Senior Developer",
  "Developer",
  "QA Engineer",
  "UI/UX Designer",
  "DevOps Engineer",
  "Business Analyst",
];

const DURATION_PRESETS = [4, 8, 12, 26, 52];

const STEPS = ["Basics", "Timeline", "Team", "Review"];

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function Stepper({ current }: { current: number }) {
  return (
    <div>
      {/* Desktop: numbered step rail on a single line */}
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

      {/* Mobile: compact label + progress */}
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
      <span className="text-right text-sm font-medium">{value}</span>
    </div>
  );
}

export default function NewProject({ onBack, isEditMode = false }: NewProjectProps) {
  const reduceMotion = useReducedMotion();
  const [step, setStep] = useState(1);

  // Step 1 - Basics
  const [name, setName] = useState(isEditMode ? DEFAULT_PROJECT_NAME : "");
  const [description, setDescription] = useState(
    isEditMode
      ? "Tenant isolation, role-based access, and automated provisioning for enterprise customers."
      : "",
  );

  // Step 2 - Timeline
  const [startDate, setStartDate] = useState<Date | undefined>(
    isEditMode ? new Date(2026, 0, 15) : undefined,
  );
  const [durationWeeks, setDurationWeeks] = useState<number>(isEditMode ? 33 : 12);

  // Step 3 - Team
  const [team, setTeam] = useState<TeamMember[]>(
    isEditMode
      ? [
          { name: "Manohar Ali", role: "Project Manager" },
          { name: "Aries Khan", role: "Delivery Manager" },
          { name: "Ahmed Khan", role: "Tech Lead" },
        ]
      : [],
  );
  const [memberDraft, setMemberDraft] = useState("");
  const [roleDraft, setRoleDraft] = useState("");

  const endDate =
    startDate && durationWeeks > 0 ? addWeeks(startDate, durationWeeks) : undefined;
  const availableMembers = MEMBER_POOL.filter(
    (m) => !team.some((t) => t.name === m),
  );

  const addMember = () => {
    if (!memberDraft || !roleDraft) return;
    setTeam([...team, { name: memberDraft, role: roleDraft }]);
    setMemberDraft("");
    setRoleDraft("");
  };

  const removeMember = (memberName: string) => {
    setTeam(team.filter((t) => t.name !== memberName));
  };

  const canProceed = () => {
    if (step === 1) return name.trim().length > 0;
    if (step === 2) return Boolean(startDate) && durationWeeks > 0;
    return true; // Team is optional, can be added later
  };

  const handleSubmit = () => {
    toast.success(
      isEditMode ? "Project updated" : "Project created",
      {
        description: isEditMode
          ? `"${name}" has been updated.`
          : `"${name}" is ready. Add workflows, holidays, and baselines anytime from Project Settings.`,
      },
    );
    onBack();
  };

  const renderStep = () => {
    // Step 1: Basics
    if (step === 1) {
      return (
        <div className="space-y-5">
          <div>
            <h2 className="text-xl">Project basics</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Just the essentials to get started. You can refine everything later.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="project-name">Project name *</Label>
            <Input
              id="project-name"
              placeholder="e.g., Sumhuman"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="project-desc">Short description</Label>
            <Textarea
              id="project-desc"
              placeholder="One or two lines on what this project delivers (optional)."
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>
      );
    }

    // Step 2: Timeline
    if (step === 2) {
      return (
        <div className="space-y-5">
          <div>
            <h2 className="text-xl">Timeline</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Set a start date and how long the project runs.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <DateField
              id="start-date"
              label="Start date *"
              value={startDate}
              onChange={setStartDate}
            />

            <div className="space-y-2">
              <Label htmlFor="duration">Duration (weeks) *</Label>
              <Input
                id="duration"
                type="number"
                min={1}
                max={104}
                value={durationWeeks}
                onChange={(e) => setDurationWeeks(Math.max(0, Number(e.target.value)))}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {DURATION_PRESETS.map((weeks) => (
              <Button
                key={weeks}
                type="button"
                size="sm"
                variant={durationWeeks === weeks ? "default" : "outline"}
                onClick={() => setDurationWeeks(weeks)}
              >
                {weeks} weeks
              </Button>
            ))}
          </div>

          {endDate && (
            <div className="flex items-center gap-2 rounded-lg border bg-muted/40 px-4 py-3 text-sm">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Expected end</span>
              <span className="font-medium">{format(endDate, "MMM d, yyyy")}</span>
            </div>
          )}
        </div>
      );
    }

    // Step 3: Team & roles
    if (step === 3) {
      return (
        <div className="space-y-5">
          <div>
            <h2 className="text-xl">Team and roles</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Add members and pick a role for each. This step is optional, you can add people later.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Select value={memberDraft} onValueChange={setMemberDraft}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select team member" />
              </SelectTrigger>
              <SelectContent>
                {availableMembers.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={roleDraft} onValueChange={setRoleDraft}>
              <SelectTrigger className="sm:w-56">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              type="button"
              onClick={addMember}
              disabled={!memberDraft || !roleDraft}
              className="gap-2"
            >
              <UserPlus className="h-4 w-4" />
              Add
            </Button>
          </div>

          {team.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-10 text-center">
              <Users className="h-8 w-8 text-muted-foreground" />
              <p className="mt-3 text-sm font-medium">No team members yet</p>
              <p className="mt-1 max-w-xs text-sm text-muted-foreground">
                Assign members and roles now, or skip this and build the team after the project exists.
              </p>
            </div>
          ) : (
            <div className="divide-y rounded-lg border">
              {team.map((member) => (
                <div key={member.name} className="flex items-center gap-3 px-4 py-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                    {initials(member.name)}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{member.name}</p>
                  </div>
                  <Badge variant="secondary">{member.role}</Badge>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => removeMember(member.name)}
                    aria-label={`Remove ${member.name}`}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    // Step 4: Review
    return (
      <div className="space-y-5">
        <div>
          <h2 className="text-xl">Review and create</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Quick check before you {isEditMode ? "save" : "create"}. Everything here stays editable.
          </p>
        </div>

        <div className="rounded-lg border">
          <div className="border-b px-4 py-3">
            <h3 className="text-sm font-medium">Basics</h3>
          </div>
          <div className="divide-y px-4">
            <SummaryRow label="Name" value={name || "Untitled project"} />
            <SummaryRow
              label="Description"
              value={description ? description : <span className="text-muted-foreground">None</span>}
            />
          </div>
        </div>

        <div className="rounded-lg border">
          <div className="border-b px-4 py-3">
            <h3 className="text-sm font-medium">Timeline</h3>
          </div>
          <div className="divide-y px-4">
            <SummaryRow
              label="Start date"
              value={startDate ? format(startDate, "MMM d, yyyy") : "Not set"}
            />
            <SummaryRow label="Duration" value={`${durationWeeks} weeks`} />
            <SummaryRow
              label="Expected end"
              value={endDate ? format(endDate, "MMM d, yyyy") : "Not set"}
            />
          </div>
        </div>

        <div className="rounded-lg border">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <h3 className="text-sm font-medium">Team</h3>
            <Badge variant="secondary">
              {team.length} {team.length === 1 ? "member" : "members"}
            </Badge>
          </div>
          <div className="px-4 py-3">
            {team.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No members assigned yet. You can add them after creating the project.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {team.map((member) => (
                  <Badge key={member.name} variant="outline" className="gap-1.5">
                    {member.name}
                    <span className="text-muted-foreground">·</span>
                    {member.role}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
          <p className="text-sm text-blue-900">
            Workflows, holidays, and an ongoing-project baseline are configured later in Project
            Settings. Creation stays focused on the basics so nothing blocks you here.
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
          Back to Projects
        </Button>
      </div>

      <div>
        <h1 className="text-3xl">{isEditMode ? "Edit project" : "Create a project"}</h1>
        <p className="mt-1 text-muted-foreground">
          {isEditMode
            ? "Update the essentials. Advanced configuration lives in Project Settings."
            : "A short, guided setup. Start with the basics and configure the rest later."}
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
            <CheckCircle2 className="h-4 w-4" />
            {isEditMode ? "Save changes" : "Create project"}
          </Button>
        )}
      </div>
    </div>
  );
}
