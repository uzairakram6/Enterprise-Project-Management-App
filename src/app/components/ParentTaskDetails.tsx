import { useMemo, useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
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
import {
  ArrowLeft,
  Calendar,
  Users,
  ClipboardList,
  CheckCircle2,
  AlertTriangle,
  Plus,
} from "lucide-react";
import type { ParentTask } from "../data/parentTasks";

type LineItemStatus = "Doing" | "Done" | "At Risk" | "Blocked";

interface ParentTaskLineItem {
  lineItem: string;
  owner: string;
  status: LineItemStatus;
  hours: string;
  update: string;
}

interface ParentTaskDetailsProps {
  task: ParentTask;
  onBack: () => void;
}

const INITIAL_LINE_ITEMS_BY_TASK: Record<number, ParentTaskLineItem[]> = {
  1: [
    {
      lineItem: "RLS policy setup",
      owner: "Ali Hassan",
      status: "Done",
      hours: "12h",
      update: "Completed tenant_id policies on all core tables.",
    },
    {
      lineItem: "Migration scripts",
      owner: "Sara Ahmed",
      status: "Doing",
      hours: "8h",
      update: "Writing rollback-safe migrations for staging validation.",
    },
    {
      lineItem: "Admin bypass tests",
      owner: "Sara Ahmed",
      status: "At Risk",
      hours: "4h",
      update: "Test cases drafted; waiting on review from security team.",
    },
  ],
  2: [
    {
      lineItem: "Tenant middleware",
      owner: "Usman Khan",
      status: "Done",
      hours: "10h",
      update: "Middleware merged and deployed to dev environment.",
    },
    {
      lineItem: "Context injection",
      owner: "Usman Khan",
      status: "Doing",
      hours: "6h",
      update: "Injecting tenant context into request pipeline.",
    },
  ],
  3: [
    {
      lineItem: "Button components",
      owner: "Fatima Malik",
      status: "Done",
      hours: "5h",
      update: "Primary, secondary, and ghost variants implemented.",
    },
    {
      lineItem: "Form components",
      owner: "Zainab Ali",
      status: "Doing",
      hours: "7h",
      update: "Building input, select, and validation wrappers.",
    },
  ],
};

const DAILY_UPDATES_BY_TASK: Record<number, { date: string; member: string; hours: number; summary: string }[]> = {
  1: [
    { date: "Jun 8, 2026", member: "Ali Hassan", hours: 6, summary: "Finalized RLS policies for users and projects tables." },
    { date: "Jun 7, 2026", member: "Sara Ahmed", hours: 5, summary: "Drafted migration scripts and ran local validation." },
    { date: "Jun 6, 2026", member: "Ali Hassan", hours: 4, summary: "Reviewed schema changes with backend team." },
  ],
  2: [
    { date: "Jun 8, 2026", member: "Usman Khan", hours: 7, summary: "Completed tenant middleware integration tests." },
    { date: "Jun 7, 2026", member: "Usman Khan", hours: 6, summary: "Implemented context injection for API routes." },
  ],
  3: [
    { date: "Jun 8, 2026", member: "Fatima Malik", hours: 4, summary: "Shipped button component library to Storybook." },
    { date: "Jun 7, 2026", member: "Zainab Ali", hours: 5, summary: "Started form field components with validation states." },
  ],
};

const STATUS_CLASS: Record<LineItemStatus, string> = {
  Done: "bg-green-500",
  Doing: "bg-blue-500",
  "At Risk": "bg-amber-500",
  Blocked: "bg-red-500",
};

const EMPTY_LINE_ITEM: ParentTaskLineItem = {
  lineItem: "",
  owner: "",
  status: "Doing",
  hours: "",
  update: "",
};

export default function ParentTaskDetails({ task, onBack }: ParentTaskDetailsProps) {
  const [lineItems, setLineItems] = useState<ParentTaskLineItem[]>(
    () => INITIAL_LINE_ITEMS_BY_TASK[task.id] ?? [],
  );
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [draft, setDraft] = useState<ParentTaskLineItem>(EMPTY_LINE_ITEM);

  const dailyUpdates = DAILY_UPDATES_BY_TASK[task.id] ?? [];
  const totalHours = lineItems.reduce((sum, item) => sum + Number.parseFloat(item.hours), 0);
  const doneCount = lineItems.filter((item) => item.status === "Done").length;

  const canSaveDraft = useMemo(
    () => Boolean(draft.lineItem.trim() && draft.owner.trim() && draft.update.trim()),
    [draft],
  );

  const handleDraftChange = (field: keyof ParentTaskLineItem, value: string) => {
    setDraft((current) => ({ ...current, [field]: value }));
  };

  const openEditor = () => {
    setDraft({
      ...EMPTY_LINE_ITEM,
      owner: task.assignedTo[0] ?? "",
    });
    setIsEditorOpen(true);
  };

  const cancelEditor = () => {
    setDraft(EMPTY_LINE_ITEM);
    setIsEditorOpen(false);
  };

  const saveLineItem = () => {
    if (!canSaveDraft) return;

    const normalizedHours = draft.hours.trim();
    const newLineItem: ParentTaskLineItem = {
      lineItem: draft.lineItem.trim(),
      owner: draft.owner.trim(),
      status: draft.status,
      hours: normalizedHours
        ? normalizedHours.endsWith("h")
          ? normalizedHours
          : `${normalizedHours}h`
        : "0h",
      update: draft.update.trim(),
    };

    setLineItems((current) => [newLineItem, ...current]);
    cancelEditor();
  };

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
        <ArrowLeft className="w-4 h-4" />
        Back to Parent Tasks
      </Button>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl mb-3">{task.taskName}</h1>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <Badge variant="outline">{task.project}</Badge>
            <Badge
              variant={
                task.priority === "high"
                  ? "destructive"
                  : task.priority === "medium"
                  ? "default"
                  : "secondary"
              }
              className={
                task.priority === "high"
                  ? ""
                  : task.priority === "medium"
                  ? "bg-blue-500"
                  : ""
              }
            >
              {task.priority} priority
            </Badge>
            <Badge className="bg-green-500 capitalize">{task.status}</Badge>
          </div>
          <p className="text-muted-foreground max-w-3xl">{task.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Assigned Members</p>
          <p className="text-2xl font-bold mt-1">{task.assignedTo.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Line Items</p>
          <p className="text-2xl font-bold mt-1">{lineItems.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Logged Hours</p>
          <p className="text-2xl font-bold mt-1">{totalHours}h</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Completed Items</p>
          <p className="text-2xl font-bold mt-1 text-green-600">{doneCount}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6 lg:col-span-1">
          <h2 className="text-lg font-semibold mb-4">Task Details</h2>
          <div className="space-y-4 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Due date:</span>
              <span className="font-medium">{new Date(task.dueDate).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Created by:</span>
              <span className="font-medium">{task.createdBy}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Created on:</span>
              <span className="font-medium">{new Date(task.createdDate).toLocaleDateString()}</span>
            </div>
          </div>

          <Separator className="my-4" />

          <h3 className="text-sm font-medium mb-2">Assigned Team</h3>
          <div className="flex flex-wrap gap-2">
            {task.assignedTo.map((member) => (
              <Badge key={member} variant="secondary">
                {member}
              </Badge>
            ))}
          </div>
        </Card>

        <Card className="p-6 lg:col-span-2">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
              <ClipboardList className="w-5 h-5" />
              <h2 className="text-lg font-semibold">Line Items</h2>
            </div>
            <Button size="sm" onClick={openEditor} className="gap-2">
              <Plus className="h-4 w-4" />
              Add line item
            </Button>
          </div>

          {isEditorOpen && (
            <div className="mb-6 rounded-lg border p-4">
              <div className="mb-4">
                <h3 className="text-base font-medium">Add line item</h3>
                <p className="text-sm text-muted-foreground">
                  Add a task-level row under {task.taskName}.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Line item *</Label>
                  <Input
                    value={draft.lineItem}
                    onChange={(event) => handleDraftChange("lineItem", event.target.value)}
                    placeholder="e.g., RLS policy setup"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Owner *</Label>
                  <Select
                    value={draft.owner}
                    onValueChange={(value) => handleDraftChange("owner", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select owner" />
                    </SelectTrigger>
                    <SelectContent>
                      {task.assignedTo.map((member) => (
                        <SelectItem key={member} value={member}>
                          {member}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={draft.status}
                    onValueChange={(value: LineItemStatus) => handleDraftChange("status", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Doing">Doing</SelectItem>
                      <SelectItem value="Done">Done</SelectItem>
                      <SelectItem value="At Risk">At Risk</SelectItem>
                      <SelectItem value="Blocked">Blocked</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Hours</Label>
                  <Input
                    value={draft.hours}
                    onChange={(event) => handleDraftChange("hours", event.target.value)}
                    placeholder="e.g., 6"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>This week update *</Label>
                  <Textarea
                    value={draft.update}
                    onChange={(event) => handleDraftChange("update", event.target.value)}
                    rows={3}
                    placeholder="What changed this week?"
                  />
                </div>
              </div>

              <div className="mt-4 flex justify-end gap-2">
                <Button variant="outline" onClick={cancelEditor}>
                  Cancel
                </Button>
                <Button onClick={saveLineItem} disabled={!canSaveDraft}>
                  Save line item
                </Button>
              </div>
            </div>
          )}

          {lineItems.length === 0 ? (
            <p className="text-sm text-muted-foreground">No line items recorded for this parent task yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Line item</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Hours</TableHead>
                  <TableHead className="min-w-[240px]">This week update</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lineItems.map((item) => (
                  <TableRow key={item.lineItem}>
                    <TableCell className="font-medium">{item.lineItem}</TableCell>
                    <TableCell>{item.owner}</TableCell>
                    <TableCell>
                      <Badge className={STATUS_CLASS[item.status]}>{item.status}</Badge>
                    </TableCell>
                    <TableCell>{item.hours}</TableCell>
                    <TableCell className="text-muted-foreground whitespace-normal">{item.update}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle2 className="w-5 h-5 text-green-600" />
          <h2 className="text-lg font-semibold">Recent Daily Updates</h2>
        </div>
        {dailyUpdates.length === 0 ? (
          <p className="text-sm text-muted-foreground">No daily updates linked to this parent task yet.</p>
        ) : (
          <div className="space-y-3">
            {dailyUpdates.map((update) => (
              <div key={`${update.date}-${update.member}`} className="rounded-lg border p-4">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{update.member}</Badge>
                    <span className="text-sm text-muted-foreground">{update.date}</span>
                  </div>
                  <Badge variant="secondary">{update.hours}h logged</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{update.summary}</p>
              </div>
            ))}
          </div>
        )}
      </Card>

      {lineItems.some((item) => item.status === "At Risk") && (
        <Card className="p-4 bg-amber-50 border-amber-200">
          <div className="flex gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
            <p className="text-sm text-amber-900">
              One or more line items are at risk. Review blockers and reassign capacity if needed before the due date.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
