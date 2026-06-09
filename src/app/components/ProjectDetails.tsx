import { useMemo, useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Separator } from "./ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import {
  ArrowLeft,
  Calendar,
  Users,
  DollarSign,
  GitBranch,
  FileText,
  Settings,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Edit2,
  Trash2,
  MoreHorizontal,
  Workflow,
} from "lucide-react";

type UserRole = "pm" | "dm" | "em" | "developer" | "admin";

interface ProjectDetailsProps {
  onBack: () => void;
  onManageWorkflows: () => void;
  onProjectSettings?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onViewWeekUpdate?: (weekNumber: number) => void;
  userRole?: UserRole;
}

const teamMembers = [
  { name: "Manohar Ali", role: "Project Manager", avatar: "MA", workload: 100 },
  { name: "Ahmed Khan", role: "Senior Developer", avatar: "AK", workload: 95 },
  { name: "Sarah Ali", role: "Full Stack Developer", avatar: "SA", workload: 88 },
  { name: "Hassan Malik", role: "Frontend Developer", avatar: "HM", workload: 100 },
  { name: "Fatima Noor", role: "Backend Developer", avatar: "FN", workload: 92 },
  { name: "Omar Farooq", role: "DevOps Engineer", avatar: "OF", workload: 78 },
  { name: "Aisha Rahman", role: "QA Engineer", avatar: "AR", workload: 85 },
  { name: "Bilal Ahmed", role: "UI/UX Designer", avatar: "BA", workload: 90 },
];

const recentUpdates = [
  {
    week: 23,
    date: "Jun 2-8, 2026",
    status: "green",
    summary:
      "All milestones on track. Completed tenant isolation middleware and merged it to main after review. Provisioning workflow QA starts next week.",
  },
  {
    week: 22,
    date: "May 26-Jun 1, 2026",
    status: "green",
    summary:
      "Database schema implementation completed. Starting the API layer with the first set of tenant-scoped endpoints scheduled for review.",
  },
  {
    week: 21,
    date: "May 19-25, 2026",
    status: "amber",
    summary:
      "Authentication integration faced delays due to a third-party OAuth provider outage. Mitigation in progress; one day behind plan.",
  },
];

const milestones = [
  { name: "Database Schema Design", status: "completed", dueDate: "2026-02-15", progress: 100 },
  { name: "API Layer Development", status: "in-progress", dueDate: "2026-04-30", progress: 75 },
  { name: "Frontend Integration", status: "in-progress", dueDate: "2026-06-15", progress: 45 },
  { name: "Security Audit", status: "pending", dueDate: "2026-07-30", progress: 0 },
  { name: "UAT & Deployment", status: "pending", dueDate: "2026-08-31", progress: 0 },
];

// Project start date used to anchor the weekly timeline (matches the project's start date)
const PROJECT_START = new Date(2026, 0, 15);

// Number of weeks elapsed so far (the current week is the last filled one)
const CURRENT_WEEK = 23;
const TOTAL_WEEKS = 52;

// Fixed 4-week "months" so every column is consistent
const WEEKS_PER_MONTH = 4;
const MONTH_LABELS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

type WeekStatus = 'green' | 'amber' | 'red' | 'grey';

interface WeekData {
  week: number;
  status: WeekStatus;
  start: Date;
  end: Date;
  isCurrent: boolean;
}

// Deterministic pseudo-random so the timeline is stable across renders/reloads
function seededRandom(seed: number) {
  let t = seed + 0x6d2b79f5;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

// Statuses for the most recent weeks, kept consistent with the Recent Updates tab.
// Keys are 1-based week numbers.
const KNOWN_WEEK_STATUS: Record<number, WeekStatus> = {
  21: 'amber',
  22: 'green',
  23: 'green',
};

// Generate the full project timeline anchored to the project start date
function generateWeekData(): WeekData[] {
  return Array.from({ length: TOTAL_WEEKS }, (_, i) => {
    const start = new Date(PROJECT_START);
    start.setDate(start.getDate() + i * 7);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);

    const weekNumber = i + 1;
    let status: WeekStatus = 'grey';
    if (weekNumber <= CURRENT_WEEK) {
      status = KNOWN_WEEK_STATUS[weekNumber] ?? (() => {
        const rand = seededRandom(i);
        if (rand < 0.82) return 'green';
        if (rand < 0.94) return 'amber';
        return 'red';
      })();
    }

    return { week: i, status, start, end, isCurrent: weekNumber === CURRENT_WEEK };
  });
}

// Group weeks into fixed 4-week "month" columns (GitHub-style layout)
function groupWeeksByMonth(weeks: WeekData[]) {
  const columns: { label: string; weeks: WeekData[] }[] = [];
  for (let i = 0; i < weeks.length; i += WEEKS_PER_MONTH) {
    const chunkIndex = i / WEEKS_PER_MONTH;
    columns.push({
      label: MONTH_LABELS[chunkIndex % MONTH_LABELS.length],
      weeks: weeks.slice(i, i + WEEKS_PER_MONTH),
    });
  }
  return columns;
}

function formatRange(w: WeekData) {
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  return `${w.start.toLocaleDateString('en-US', opts)} - ${w.end.toLocaleDateString('en-US', opts)}`;
}

const STATUS_LABEL: Record<WeekStatus, string> = {
  green: 'On Track',
  amber: 'At Risk',
  red: 'Delayed',
  grey: 'Future',
};

function WeekBox({ data, onClick }: { data: WeekData; onClick: () => void }) {
  const colors: Record<WeekStatus, string> = {
    green: 'bg-green-500 hover:ring-green-300',
    amber: 'bg-amber-500 hover:ring-amber-300',
    red: 'bg-red-500 hover:ring-red-300',
    grey: 'bg-gray-200 hover:ring-gray-300',
  };
  const isClickable = data.status !== 'grey';
  const label = `Week ${data.week + 1}, ${formatRange(data)}, ${STATUS_LABEL[data.status]}${
    data.isCurrent ? ' (current week)' : ''
  }`;

  const className = `h-6 w-6 rounded-[4px] transition-all outline-none ${colors[data.status]} ${
    isClickable ? 'cursor-pointer hover:ring-2 focus-visible:ring-2 focus-visible:ring-offset-1' : ''
  } ${data.isCurrent ? 'ring-2 ring-offset-1 ring-foreground' : ''}`;

  if (!isClickable) {
    return <div className={className} title={label} aria-hidden="true" />;
  }

  return (
    <button type="button" className={className} onClick={onClick} title={label} aria-label={label} />
  );
}

export default function ProjectDetails({ onBack, onManageWorkflows, onProjectSettings, onEdit, onDelete, onViewWeekUpdate, userRole = "pm" }: ProjectDetailsProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const canViewFinancial = userRole !== "developer";

  const [deleteOpen, setDeleteOpen] = useState(false);

  const weekData = useMemo(() => generateWeekData(), []);
  const monthColumns = useMemo(() => groupWeeksByMonth(weekData), [weekData]);
  const weeksRemaining = TOTAL_WEEKS - CURRENT_WEEK;

  const handleDelete = () => {
    onDelete?.();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Projects
        </Button>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl mb-3">Multi-Tenancy Platform</h1>
          <div className="flex items-center gap-3 mb-3">
            <Badge variant="secondary">MTP-2026</Badge>
            <Badge className="bg-green-500">On Track</Badge>
            <Badge variant="outline">Software Development</Badge>
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="font-medium">PM:</span>
              <span>Manohar Ali</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">DM:</span>
              <span>Aries Khan</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span className="font-medium">Team:</span>
              <span>8 members</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>Jan 15, 2026</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button className="gap-2">
            <FileText className="w-4 h-4" />
            Add Update
          </Button>
          <Button variant="outline" className="gap-2" onClick={onEdit}>
            <Edit2 className="w-4 h-4" />
            Edit Project
          </Button>
          <Button variant="outline" className="gap-2" onClick={onProjectSettings}>
            <Settings className="w-4 h-4" />
            Settings
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" aria-label="More project actions">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onManageWorkflows}>
                <Workflow className="w-4 h-4" />
                Workflow Settings
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 className="w-4 h-4" />
                Delete Project
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this project?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "Multi-Tenancy Platform" and all of its
              updates, milestones, and escalations. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Delete Project
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Stats and Timeline - Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Stats Boxes */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Project Stats</h2>
          <div className={`grid gap-3 ${canViewFinancial ? 'grid-cols-2' : 'grid-cols-2'}`}>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Progress</p>
                  <p className="text-2xl font-bold">85%</p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-3 rounded-lg">
                  <Users className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Team Size</p>
                  <p className="text-2xl font-bold">8</p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <Calendar className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <p className="text-2xl font-bold">23w</p>
                </div>
              </div>
            </Card>

            {canViewFinancial && (
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-orange-100 p-3 rounded-lg">
                    <DollarSign className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Budget Used</p>
                    <p className="text-2xl font-bold">72%</p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* Right: 52 Week Timeline */}
        <div className="space-y-4">
          <div className="flex items-baseline justify-between">
            <h2 className="text-lg font-semibold">52 Week Timeline</h2>
            <p className="text-sm text-muted-foreground">
              Week <span className="font-medium text-foreground">{CURRENT_WEEK}</span> of {TOTAL_WEEKS}
              <span className="mx-1.5">·</span>
              {weeksRemaining} remaining
            </p>
          </div>
          <Card className="p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div className="flex gap-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span>On Track</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-amber-500 rounded-full" />
                  <span>At Risk</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                  <span>Delayed</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-gray-200 rounded-full" />
                  <span>Future</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full ring-2 ring-foreground" />
                  <span>Current</span>
                </div>
              </div>
            </div>

            <div className="flex gap-1.5">
              {monthColumns.map((col, ci) => (
                <div key={ci} className="flex flex-col gap-1.5">
                  <span className="h-4 text-[11px] leading-4 text-muted-foreground text-center">
                    {col.label}
                  </span>
                  {col.weeks.map((w) => (
                    <WeekBox
                      key={w.week}
                      data={w}
                      onClick={() => onViewWeekUpdate?.(w.week + 1)}
                    />
                  ))}
                </div>
              ))}
            </div>

            <p className="mt-3 text-xs text-muted-foreground">
              Select any week to open its status update.
            </p>
          </Card>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="milestones">Milestones</TabsTrigger>
          <TabsTrigger value="updates">Recent Updates</TabsTrigger>
          <TabsTrigger value="escalations">Escalations</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 p-6">
              <h2 className="text-xl mb-4">Project Description</h2>
              <p className="text-muted-foreground mb-4">
                Building a comprehensive multi-tenancy platform that enables enterprise customers to
                manage multiple isolated environments within a single application instance. The
                platform will include tenant isolation at database level, role-based access control,
                and automated provisioning workflows.
              </p>

              <Separator className="my-4" />

              <h3 className="text-lg mb-3">Key Objectives</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                  <span>Implement row-level security for tenant data isolation</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                  <span>Build automated tenant provisioning and onboarding</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500 mt-1 flex-shrink-0" />
                  <span>Develop comprehensive admin dashboard for tenant management</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-4 h-4 border-2 border-gray-300 rounded mt-1 flex-shrink-0" />
                  <span>Implement usage-based billing and metering</span>
                </li>
              </ul>

              <Separator className="my-4" />

              <h3 className="text-lg mb-3">Current Status</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Schedule</p>
                  <Badge className="bg-green-500">On Track</Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Delivery</p>
                  <Badge className="bg-green-500">On Track</Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Quality</p>
                  <Badge className="bg-amber-500">At Risk</Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Budget</p>
                  <Badge className="bg-green-500">On Track</Badge>
                </div>
              </div>
            </Card>

            <div className="space-y-6">
              <Card className="p-6">
                <h3 className="text-lg mb-4">Project Info</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Project Manager</p>
                    <p className="font-medium">Manohar Ali</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Delivery Manager</p>
                    <p className="font-medium">Aries Khan</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Start Date</p>
                    <p className="font-medium">Jan 15, 2026</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Expected End</p>
                    <p className="font-medium">Aug 31, 2026</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Budget</p>
                    <p className="font-medium">$500,000</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg mb-4">Integrations</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <GitBranch className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">github.com/company/multi-tenancy</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 text-muted-foreground">#</div>
                    <span className="text-sm">#project-multi-tenancy</span>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg mb-4">Active Workflows</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span className="text-sm">Daily Update Reminder</span>
                    </div>
                    <Badge variant="outline" className="text-xs">System</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span className="text-sm">Overdue Escalation</span>
                    </div>
                    <Badge variant="outline" className="text-xs">System</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span className="text-sm">Weekly Report</span>
                    </div>
                    <Badge className="bg-purple-500 text-xs">Custom</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span className="text-sm">Slack Standup</span>
                    </div>
                    <Badge className="bg-purple-500 text-xs">Custom</Badge>
                  </div>
                </div>
                <Button
                  variant="link"
                  className="px-0 mt-3 text-xs"
                  onClick={onManageWorkflows}
                >
                  Manage Workflows →
                </Button>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Team Tab */}
        <TabsContent value="team" className="space-y-6 mt-6">
          <Card className="p-6">
            <h2 className="text-xl mb-6">Team Members</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {teamMembers.map((member, idx) => (
                <div key={idx} className="flex items-center gap-4 p-4 border rounded-lg">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">{member.avatar}</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{member.name}</p>
                    <p className="text-sm text-muted-foreground">{member.role}</p>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-sm font-medium ${
                        member.workload >= 95 ? "text-green-600" : "text-amber-600"
                      }`}
                    >
                      {member.workload}%
                    </p>
                    <p className="text-xs text-muted-foreground">Workload</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Milestones Tab */}
        <TabsContent value="milestones" className="space-y-6 mt-6">
          <Card className="p-6">
            <h2 className="text-xl mb-6">Project Milestones</h2>
            <div className="space-y-4">
              {milestones.map((milestone, idx) => (
                <div key={idx} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-medium mb-1">{milestone.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Due: {new Date(milestone.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge
                      variant={
                        milestone.status === "completed"
                          ? "default"
                          : milestone.status === "in-progress"
                          ? "secondary"
                          : "outline"
                      }
                      className={
                        milestone.status === "completed"
                          ? "bg-green-500"
                          : milestone.status === "in-progress"
                          ? "bg-blue-500"
                          : ""
                      }
                    >
                      {milestone.status === "completed"
                        ? "Completed"
                        : milestone.status === "in-progress"
                        ? "In Progress"
                        : "Pending"}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span>{milestone.progress}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          milestone.status === "completed" ? "bg-green-500" : "bg-blue-500"
                        }`}
                        style={{ width: `${milestone.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Updates Tab */}
        <TabsContent value="updates" className="space-y-6 mt-6">
          <Card className="p-6">
            <h2 className="text-xl mb-6">Recent Updates</h2>
            <div className="space-y-4">
              {recentUpdates.map((update, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onViewWeekUpdate?.(update.week)}
                  aria-label={`View full update for week ${update.week}, ${update.date}`}
                  className="w-full text-left border rounded-lg p-4 transition-colors cursor-pointer hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-medium">Week {update.week}</h3>
                      <p className="text-sm text-muted-foreground">{update.date}</p>
                    </div>
                    <div
                      className={`w-3 h-3 rounded-full ${
                        update.status === "green"
                          ? "bg-green-500"
                          : update.status === "amber"
                          ? "bg-amber-500"
                          : "bg-red-500"
                      }`}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{update.summary}</p>
                  <span className="inline-block mt-2 text-sm font-medium text-primary">
                    View full update →
                  </span>
                </button>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Escalations Tab */}
        <TabsContent value="escalations" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="p-4">
              <p className="text-sm text-muted-foreground">Active Escalations</p>
              <p className="text-2xl font-bold mt-1 text-red-500">2</p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-muted-foreground">Resolved This Month</p>
              <p className="text-2xl font-bold mt-1 text-green-500">5</p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-muted-foreground">Avg Resolution Time</p>
              <p className="text-2xl font-bold mt-1">2.3 days</p>
            </Card>
          </div>

          <Card className="p-6">
            <h2 className="text-xl mb-6">Active Escalations</h2>
            <div className="space-y-4">
              <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                      <h3 className="font-medium">Authentication Module Blocking Production</h3>
                      <Badge variant="destructive">Critical</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Third-party OAuth provider integration failing in production environment.
                      Affecting 15% of user login attempts.
                    </p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-muted-foreground">Escalated: 2 days ago</span>
                      <span className="text-muted-foreground">By: Ahmed Khan</span>
                      <span className="text-muted-foreground">To: Senior Tech Lead</span>
                    </div>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-red-200">
                  <p className="text-sm font-medium mb-1">Latest Update (4 hours ago):</p>
                  <p className="text-sm text-muted-foreground">
                    Vendor support has identified the root cause. Waiting for API patch deployment.
                  </p>
                </div>
              </div>

              <div className="border border-amber-200 rounded-lg p-4 bg-amber-50">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertTriangle className="w-5 h-5 text-amber-500" />
                      <h3 className="font-medium">Database Performance Degradation</h3>
                      <Badge className="bg-amber-500">High</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Query response times increased by 40% after latest migration. Need immediate optimization.
                    </p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-muted-foreground">Escalated: 1 day ago</span>
                      <span className="text-muted-foreground">By: Fatima Noor</span>
                      <span className="text-muted-foreground">To: Database Admin</span>
                    </div>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-amber-200">
                  <p className="text-sm font-medium mb-1">Latest Update (1 hour ago):</p>
                  <p className="text-sm text-muted-foreground">
                    Added indexes on tenant_id columns. Monitoring performance metrics.
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl mb-6">Recently Resolved</h2>
            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                      <h3 className="font-medium">API Rate Limiting Issue</h3>
                      <Badge className="bg-green-500">Resolved</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Resolved by implementing token bucket algorithm for rate limiting.
                    </p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-muted-foreground">Resolved: 3 days ago</span>
                      <span className="text-muted-foreground">Resolution time: 1.5 days</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                      <h3 className="font-medium">Memory Leak in Background Jobs</h3>
                      <Badge className="bg-green-500">Resolved</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Fixed by properly disposing database connections in worker processes.
                    </p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-muted-foreground">Resolved: 1 week ago</span>
                      <span className="text-muted-foreground">Resolution time: 3 days</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-blue-50 border-blue-200">
            <div className="flex gap-3">
              <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-blue-900">
                  <strong>Escalation Criteria:</strong> Issues are automatically escalated after 3 days
                  without resolution, or immediately for critical production blockers.
                </p>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
