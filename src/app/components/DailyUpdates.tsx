import { useMemo, useState } from "react";
import { format, isToday, parseISO, subDays } from "date-fns";
import { toast } from "sonner";
import {
  Plus,
  Trash2,
  CheckCircle2,
  Save,
  Send,
  CalendarDays,
  ClipboardList,
  ChevronLeft,
  ChevronRight,
  Eye,
} from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { cn } from "./ui/utils";
import { PROJECTS } from "../data/projects";

const STORAGE_KEY = "daily-updates-sessions";
const SUBTASKS_STORAGE_KEY = "daily-updates-subtasks";
const CREATE_SUBTASK_VALUE = "__create_subtask__";
const DESC_MAX = 500;

const projectIcons = ["🤖", "♻️", "💬", "📅", "🛡️", "📦"];
const projectBgs = [
  "bg-blue-100 text-blue-600",
  "bg-green-100 text-green-600",
  "bg-purple-100 text-purple-600",
  "bg-amber-100 text-amber-600",
  "bg-red-100 text-red-600",
  "bg-cyan-100 text-cyan-600",
];

const projects = PROJECTS.slice(0, 6).map((project, index) => ({
  id: ["sumhuman", "gts", "bilingual", "friday", "cis-ca", "dmg"][index],
  name: project.name,
  type: index < 2 ? "Internal Project" : "Client Project",
  icon: projectIcons[index],
  iconBg: projectBgs[index],
}));

const tasksByProject: Record<string, string[]> = {
  sumhuman: ["User Onboarding", "API Integration", "Database Schema", "Bug Fixes", "Workflow Setup"],
  gts: ["Route Optimization", "Fleet Tracking", "Dispatch UI", "Sensor Integration", "Reporting"],
  bilingual: ["NLP Pipeline", "Intent Training", "Voice Integration", "Testing", "Deployment"],
  friday: ["Scheduling Engine", "Calendar Sync", "Notifications", "Mobile UI", "Analytics"],
  "cis-ca": ["Compliance Rules", "Audit Logs", "Role Management", "Document Vault", "Reporting"],
  dmg: ["Data Migration", "ETL Pipelines", "Validation Suite", "Rollback Plan", "Monitoring"],
};

const defaultSubtasksByTask: Record<string, string[]> = {
  "sumhuman::User Onboarding": ["Signup flow", "Role assignment", "Welcome emails"],
  "sumhuman::API Integration": ["Auth endpoints", "Error handling", "Rate limiting"],
  "sumhuman::Database Schema": ["Tenant columns", "RLS policies", "Migration scripts"],
  "gts::Route Optimization": ["Map API setup", "Algorithm tuning", "Driver app hooks"],
  "gts::Fleet Tracking": ["GPS ingestion", "Live map UI", "Alert rules"],
  "bilingual::NLP Pipeline": ["Tokenizer setup", "Language detection", "Response templates"],
  "friday::Scheduling Engine": ["Recurrence rules", "Conflict detection", "Timezone handling"],
  "cis-ca::Compliance Rules": ["Policy engine", "Rule editor", "Audit triggers"],
  "dmg::Data Migration": ["Source mapping", "Batch jobs", "Validation checks"],
};

function taskKey(projectId: string, task: string) {
  return `${projectId}::${task}`;
}

function loadCustomSubtasks(): Record<string, string[]> {
  try {
    const raw = localStorage.getItem(SUBTASKS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return {};
}

function saveCustomSubtasks(data: Record<string, string[]>) {
  try {
    localStorage.setItem(SUBTASKS_STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

function getSubtasksForTask(
  projectId: string,
  task: string,
  customSubtasks: Record<string, string[]>
): string[] {
  if (!task) return [];
  const key = taskKey(projectId, task);
  const defaults = defaultSubtasksByTask[key] ?? [];
  const custom = customSubtasks[key] ?? [];
  return [...new Set([...defaults, ...custom])];
}

const hourOptions = [1, 2, 3, 4, 5, 6, 7, 8];

interface UpdateEntry {
  id: string;
  projectId: string;
  task: string;
  subtask: string;
  description: string;
  hoursSpent: number;
  status: "draft" | "submitted";
}

interface DailySession {
  date: string;
  entries: UpdateEntry[];
  submittedAt?: string;
}

function getHoursColor(hours: number) {
  if (hours <= 2) return "bg-amber-100 text-amber-700 border-amber-200";
  if (hours <= 4) return "bg-green-100 text-green-700 border-green-200";
  if (hours <= 6) return "bg-blue-100 text-blue-700 border-blue-200";
  return "bg-purple-100 text-purple-700 border-purple-200";
}

function dateKey(date: Date) {
  return format(date, "yyyy-MM-dd");
}

function createEntry(projectId: string, overrides?: Partial<UpdateEntry>): UpdateEntry {
  const tasks = tasksByProject[projectId] ?? [];
  return {
    id: crypto.randomUUID(),
    projectId,
    task: tasks[0] ?? "",
    subtask: "",
    description: "",
    hoursSpent: 2,
    status: "draft",
    ...overrides,
  };
}

function getDefaultSessions(): Record<string, DailySession> {
  const yesterday = dateKey(subDays(new Date(), 1));

  return {
    [yesterday]: {
      date: yesterday,
      submittedAt: `${yesterday}T18:30:00.000Z`,
      entries: [
        createEntry("sumhuman", {
          id: "y1",
          task: "Database Schema",
          subtask: "RLS policies",
          description: "Added tenant_id to users table and implemented row-level security policies.",
          hoursSpent: 5,
          status: "submitted",
        }),
        createEntry("gts", {
          id: "y2",
          task: "Route Optimization",
          subtask: "Map API setup",
          description: "Integrated routing API and validated fleet dispatch paths.",
          hoursSpent: 3,
          status: "submitted",
        }),
      ],
    },
  };
}

function normalizeSession(raw: Partial<DailySession>, date: string): DailySession {
  return {
    date,
    entries: Array.isArray(raw.entries)
      ? raw.entries.map((e) => ({
          ...e,
          subtask: e.subtask ?? "",
        }))
      : [],
    submittedAt: raw.submittedAt,
  };
}

function loadSessions(): Record<string, DailySession> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Record<string, Partial<DailySession>>;
      const normalized: Record<string, DailySession> = {};
      for (const [date, session] of Object.entries(parsed)) {
        normalized[date] = normalizeSession(session, date);
      }
      return normalized;
    }
  } catch {
    // ignore
  }
  return getDefaultSessions();
}

function saveSessions(sessions: Record<string, DailySession>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  } catch {
    // ignore quota errors
  }
}

function getSessionForDate(
  sessions: Record<string, DailySession>,
  date: string
): DailySession {
  return sessions[date] ?? { date, entries: [] };
}

export default function DailyUpdates() {
  const [sessions, setSessions] = useState<Record<string, DailySession>>(() => loadSessions());
  const [customSubtasks, setCustomSubtasks] = useState<Record<string, string[]>>(() => loadCustomSubtasks());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState<"today" | "history">("today");
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [subtaskModal, setSubtaskModal] = useState<{
    open: boolean;
    projectId: string;
    task: string;
    entryId: string;
  } | null>(null);
  const [newSubtaskName, setNewSubtaskName] = useState("");

  const currentKey = dateKey(selectedDate);
  const isViewingToday = isToday(selectedDate);
  const session = getSessionForDate(sessions, currentKey);

  const isReadOnly = !!session.submittedAt;

  const persistSessions = (updater: (prev: Record<string, DailySession>) => Record<string, DailySession>) => {
    setSessions((prev) => {
      const next = updater(prev);
      saveSessions(next);
      return next;
    });
  };

  const updateSession = (updates: Partial<DailySession>) => {
    persistSessions((prev) => ({
      ...prev,
      [currentKey]: { ...getSessionForDate(prev, currentKey), ...updates, date: currentKey },
    }));
  };

  const historyDates = useMemo(
    () =>
      Object.values(sessions)
        .filter((s) => s.submittedAt || s.entries.length > 0)
        .sort((a, b) => b.date.localeCompare(a.date)),
    [sessions]
  );

  const updateEntry = (id: string, updates: Partial<UpdateEntry>) => {
    if (isReadOnly) return;
    persistSessions((prev) => {
      const current = getSessionForDate(prev, currentKey);
      return {
        ...prev,
        [currentKey]: {
          ...current,
          entries: current.entries.map((e) => (e.id === id ? { ...e, ...updates } : e)),
        },
      };
    });
  };

  const addProjectRow = () => {
    const usedProjectIds = session.entries.map((e) => e.projectId);
    const nextProject = projects.find((p) => !usedProjectIds.includes(p.id)) ?? projects[0];
    updateSession({
      entries: [...session.entries, createEntry(nextProject.id)],
    });
    toast.success(`Added ${nextProject.name} row`);
  };

  const deleteEntry = (id: string) => {
    const entry = session.entries.find((e) => e.id === id);
    if (!entry) return;
    if (!confirm("Delete this update row?")) return;
    updateSession({ entries: session.entries.filter((e) => e.id !== id) });
    toast.success("Update row removed");
  };

  const handleSaveDraft = () => {
    updateSession({
      entries: session.entries.map((e) => ({ ...e, status: "draft" as const })),
    });
    toast.success("Draft saved successfully");
  };

  const handleSubmitAll = () => {
    const incomplete = session.entries.filter(
      (e) => !e.task || !e.subtask || !e.description.trim()
    );
    if (incomplete.length > 0) {
      toast.error("Please fill in task, subtask, and description for all rows before submitting");
      return;
    }
    if (session.entries.length === 0) {
      toast.error("Add at least one project update before submitting");
      return;
    }

    persistSessions((prev) => {
      const current = getSessionForDate(prev, currentKey);
      return {
        ...prev,
        [currentKey]: {
          ...current,
          submittedAt: new Date().toISOString(),
          entries: current.entries.map((e) => ({ ...e, status: "submitted" as const })),
        },
      };
    });
    toast.success("All updates submitted successfully!");
  };

  const navigateDate = (direction: -1 | 1) => {
    setSelectedDate((d) => (direction === -1 ? subDays(d, 1) : subDays(d, -1)));
  };

  const openCreateSubtaskModal = (projectId: string, task: string, entryId: string) => {
    if (!task) {
      toast.error("Select a task first before creating a subtask");
      return;
    }
    setNewSubtaskName("");
    setSubtaskModal({ open: true, projectId, task, entryId });
  };

  const handleCreateSubtask = () => {
    if (!subtaskModal) return;
    const name = newSubtaskName.trim();
    if (!name) {
      toast.error("Enter a subtask name");
      return;
    }

    const key = taskKey(subtaskModal.projectId, subtaskModal.task);
    const existing = getSubtasksForTask(subtaskModal.projectId, subtaskModal.task, customSubtasks);
    if (existing.some((s) => s.toLowerCase() === name.toLowerCase())) {
      toast.error("This subtask already exists");
      return;
    }

    const updated = {
      ...customSubtasks,
      [key]: [...(customSubtasks[key] ?? []), name],
    };
    setCustomSubtasks(updated);
    saveCustomSubtasks(updated);
    updateEntry(subtaskModal.entryId, { subtask: name });
    setSubtaskModal(null);
    setNewSubtaskName("");
    toast.success("Subtask created and selected");
  };

  const renderSubtaskCell = (entry: UpdateEntry) => {
    const subtasks = getSubtasksForTask(entry.projectId, entry.task, customSubtasks);

    if (isReadOnly) {
      return <span className="text-sm">{entry.subtask || "—"}</span>;
    }

    if (!entry.task) {
      return <span className="text-xs text-muted-foreground">Select task first</span>;
    }

    return (
      <Select
        key={`${entry.id}-${entry.task}-${subtasks.length}`}
        value={entry.subtask || undefined}
        onValueChange={(val) => {
          if (val === CREATE_SUBTASK_VALUE) {
            openCreateSubtaskModal(entry.projectId, entry.task, entry.id);
            return;
          }
          updateEntry(entry.id, { subtask: val });
        }}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select subtask" />
        </SelectTrigger>
        <SelectContent>
          {subtasks.length === 0 && (
            <SelectItem value="__none__" disabled className="text-muted-foreground">
              No subtasks yet
            </SelectItem>
          )}
          {subtasks.map((subtask) => (
            <SelectItem key={subtask} value={subtask}>
              {subtask}
            </SelectItem>
          ))}
          <SelectItem
            value={CREATE_SUBTASK_VALUE}
            className="text-primary font-medium border-t mt-1 focus:text-primary"
          >
            <span className="flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5" />
              Create subtask
            </span>
          </SelectItem>
        </SelectContent>
      </Select>
    );
  };

  const renderEntryRow = (entry: UpdateEntry) => {
    const project = projects.find((p) => p.id === entry.projectId)!;
    const tasks = tasksByProject[entry.projectId] ?? [];

    return (
      <TableRow key={entry.id} className="hover:bg-muted/30">
        <TableCell className="align-top py-4 min-w-[180px]">
          <div className="flex items-start gap-3">
            <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center text-base shrink-0", project.iconBg)}>
              {project.icon}
            </div>
            <div>
              <p className="font-medium text-sm">{project.name}</p>
              <p className="text-xs text-muted-foreground">{project.type}</p>
            </div>
          </div>
        </TableCell>

        <TableCell className="align-top py-4 min-w-[160px]">
          {isReadOnly ? (
            <span className="text-sm">{entry.task}</span>
          ) : (
            <Select
              value={entry.task}
              onValueChange={(val) => updateEntry(entry.id, { task: val, subtask: "" })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select task" />
              </SelectTrigger>
              <SelectContent>
                {tasks.map((task) => (
                  <SelectItem key={task} value={task}>
                    {task}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </TableCell>

        <TableCell className="align-top py-4 min-w-[160px]">
          {renderSubtaskCell(entry)}
        </TableCell>

        <TableCell className="align-top py-4 min-w-[280px]">
          {isReadOnly ? (
            <p className="text-sm text-muted-foreground whitespace-normal">{entry.description}</p>
          ) : (
            <div className="relative">
              <Textarea
                placeholder="Describe what you worked on..."
                rows={3}
                maxLength={DESC_MAX}
                value={entry.description}
                onChange={(e) => updateEntry(entry.id, { description: e.target.value })}
                className="resize-none pr-16"
              />
              <span className="absolute bottom-2 right-2 text-xs text-muted-foreground">
                {entry.description.length}/{DESC_MAX}
              </span>
            </div>
          )}
        </TableCell>

        <TableCell className="align-top py-4">
          {isReadOnly ? (
            <Badge variant="outline" className={cn("font-medium", getHoursColor(entry.hoursSpent))}>
              {entry.hoursSpent}h
            </Badge>
          ) : (
            <Select
              value={String(entry.hoursSpent)}
              onValueChange={(val) => updateEntry(entry.id, { hoursSpent: Number(val) })}
            >
              <SelectTrigger className={cn("w-[80px] font-medium border", getHoursColor(entry.hoursSpent))}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {hourOptions.map((h) => (
                  <SelectItem key={h} value={String(h)}>
                    {h}h
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </TableCell>

        <TableCell className="align-top py-4">
          <Badge
            variant="outline"
            className={cn(
              "gap-1",
              entry.status === "submitted"
                ? "bg-green-50 text-green-700 border-green-200"
                : "bg-gray-50 text-gray-600 border-gray-200"
            )}
          >
            {entry.status === "submitted" ? (
              <>
                <CheckCircle2 className="w-3 h-3" />
                Submitted
              </>
            ) : (
              "Draft"
            )}
          </Badge>
        </TableCell>

        <TableCell className="align-top py-4">
          {!isReadOnly && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => deleteEntry(entry.id)}
              className="text-red-500 hover:text-red-600 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </TableCell>
      </TableRow>
    );
  };

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Daily Updates – Multiple Projects</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Log your daily work across all assigned projects in one place
          </p>
        </div>
        {!isReadOnly && (
          <Button onClick={addProjectRow} className="gap-2 shrink-0">
            <Plus className="w-4 h-4" />
            Add Project
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "today" | "history")}>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <TabsList>
            <TabsTrigger value="today" className="gap-2">
              <ClipboardList className="w-4 h-4" />
              {isViewingToday ? "Today" : format(selectedDate, "MMM d, yyyy")}
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <CalendarDays className="w-4 h-4" />
              Previous Updates
            </TabsTrigger>
          </TabsList>

          {activeTab === "today" && (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={() => navigateDate(-1)}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="gap-2 min-w-[160px]">
                    <CalendarDays className="w-4 h-4" />
                    {format(selectedDate, "EEE, MMM d, yyyy")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      if (date) {
                        setSelectedDate(date);
                        setCalendarOpen(false);
                      }
                    }}
                    disabled={(date) => date > new Date()}
                  />
                </PopoverContent>
              </Popover>
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigateDate(1)}
                disabled={isToday(selectedDate)}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
              {!isViewingToday && (
                <Button variant="ghost" size="sm" onClick={() => setSelectedDate(new Date())}>
                  Back to Today
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Today / Selected Date Tab */}
        <TabsContent value="today" className="space-y-6 mt-4">
          {session.submittedAt && (
            <Card className="p-4 bg-green-50 border-green-200">
              <div className="flex items-center gap-2 text-green-800">
                <CheckCircle2 className="w-5 h-5" />
                <p className="text-sm font-medium">
                  Updates submitted on {format(parseISO(session.submittedAt), "MMM d, yyyy 'at' h:mm a")}
                </p>
              </div>
            </Card>
          )}

          {!isReadOnly && session.entries.length === 0 && (
            <Card className="p-8 text-center border-dashed">
              <ClipboardList className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
              <p className="font-medium">No updates for today yet</p>
              <p className="text-sm text-muted-foreground mt-1 mb-4">
                Click "Add Project" to log your first task for the day
              </p>
              <Button onClick={addProjectRow} className="gap-2">
                <Plus className="w-4 h-4" />
                Add Project
              </Button>
            </Card>
          )}

          {session.entries.length > 0 && (
            <>
              <Card className="overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40 hover:bg-muted/40">
                      <TableHead className="font-semibold">Project</TableHead>
                      <TableHead className="font-semibold">Task</TableHead>
                      <TableHead className="font-semibold">Subtask</TableHead>
                      <TableHead className="font-semibold">Description of Task</TableHead>
                      <TableHead className="font-semibold">Hours Spent</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="font-semibold w-[60px]">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>{session.entries.map(renderEntryRow)}</TableBody>
                </Table>
              </Card>

              {!isReadOnly && (
                <div className="flex items-center justify-between">
                  <Button variant="outline" onClick={handleSaveDraft} className="gap-2">
                    <Save className="w-4 h-4" />
                    Save Draft
                  </Button>
                  <Button onClick={handleSubmitAll} className="gap-2 px-8">
                    <Send className="w-4 h-4" />
                    Submit All Updates
                  </Button>
                </div>
              )}
            </>
          )}
        </TabsContent>

        {/* Previous Updates Tab */}
        <TabsContent value="history" className="mt-4">
          {historyDates.length === 0 ? (
            <Card className="p-8 text-center">
              <CalendarDays className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
              <p className="font-medium">No previous updates found</p>
              <p className="text-sm text-muted-foreground mt-1">Submitted updates will appear here</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {historyDates.map((histSession) => {
                const histHours = histSession.entries.reduce((s, e) => s + e.hoursSpent, 0);
                const isSubmitted = !!histSession.submittedAt;

                return (
                  <Card key={histSession.date} className="p-4 hover:shadow-sm transition-shadow">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                          <CalendarDays className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">
                              {format(parseISO(histSession.date), "EEEE, MMM d, yyyy")}
                            </p>
                            {isToday(parseISO(histSession.date)) && (
                              <Badge variant="secondary" className="text-xs">Today</Badge>
                            )}
                            {isSubmitted ? (
                              <Badge className="bg-green-100 text-green-700 border-green-200" variant="outline">
                                Submitted
                              </Badge>
                            ) : (
                              <Badge variant="outline">Draft</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-0.5">
                            {histSession.entries.length} project{histSession.entries.length !== 1 ? "s" : ""} · {histHours}h logged
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => {
                          setSelectedDate(parseISO(histSession.date));
                          setActiveTab("today");
                        }}
                      >
                        <Eye className="w-4 h-4" />
                        View Details
                      </Button>
                    </div>

                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog
        open={!!subtaskModal?.open}
        onOpenChange={(open) => {
          if (!open) {
            setSubtaskModal(null);
            setNewSubtaskName("");
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Subtask</DialogTitle>
            <DialogDescription>
              Add a new subtask under{" "}
              <span className="font-medium text-foreground">{subtaskModal?.task}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="subtask-name">Subtask name</Label>
            <Input
              id="subtask-name"
              placeholder="e.g. Implement login validation"
              value={newSubtaskName}
              onChange={(e) => setNewSubtaskName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreateSubtask()}
            />
            {subtaskModal && (
              <p className="text-xs text-muted-foreground">
                Project: {projects.find((p) => p.id === subtaskModal.projectId)?.name}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSubtaskModal(null)}>
              Cancel
            </Button>
            <Button onClick={handleCreateSubtask}>Create Subtask</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
