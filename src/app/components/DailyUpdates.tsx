import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Plus, Save, Calendar, User, CheckCircle2, Clock, Trash2, AlertTriangle } from "lucide-react";

interface DailyUpdate {
  id: number;
  date: string;
  parentTask: string;
  summary: string;
  details: string;
  status: "in-progress" | "completed" | "blocked";
  hoursSpent: number;
}

const parentTasks = [
  { id: 1, name: "Multi-Tenancy - Database Schema", project: "Multi-Tenancy Platform" },
  { id: 2, name: "Multi-Tenancy - API Layer", project: "Multi-Tenancy Platform" },
  { id: 3, name: "Customer Portal - UI Components", project: "Customer Portal Redesign" },
  { id: 4, name: "Mobile App - Authentication Flow", project: "Mobile App Development" },
];

export default function DailyUpdates() {
  const [updates, setUpdates] = useState<DailyUpdate[]>([
    {
      id: 1,
      date: "2026-06-08",
      parentTask: "Multi-Tenancy - Database Schema",
      summary: "Completed tenant_id column implementation",
      details: "Added tenant_id to users table, implemented RLS policies, tested with sample data",
      status: "completed",
      hoursSpent: 6,
    },
    {
      id: 2,
      date: "2026-06-08",
      parentTask: "Multi-Tenancy - API Layer",
      summary: "Working on authentication middleware",
      details: "Implementing JWT token validation and tenant context injection",
      status: "in-progress",
      hoursSpent: 2,
    },
  ]);

  const [newUpdate, setNewUpdate] = useState({
    parentTask: "",
    summary: "",
    details: "",
    status: "in-progress" as const,
    hoursSpent: 0,
  });

  const addUpdate = () => {
    if (!newUpdate.parentTask || !newUpdate.summary) {
      alert("Please fill in Parent Task and Summary");
      return;
    }

    const today = new Date().toISOString().split("T")[0];
    const update: DailyUpdate = {
      id: Date.now(),
      date: today,
      ...newUpdate,
    };

    setUpdates([update, ...updates]);
    setNewUpdate({
      parentTask: "",
      summary: "",
      details: "",
      status: "in-progress",
      hoursSpent: 0,
    });
  };

  const deleteUpdate = (id: number) => {
    if (confirm("Are you sure you want to delete this update?")) {
      setUpdates(updates.filter((u) => u.id !== id));
    }
  };

  const todayUpdates = updates.filter((u) => u.date === new Date().toISOString().split("T")[0]);
  const yesterdayUpdates = updates.filter(
    (u) => u.date === new Date(Date.now() - 86400000).toISOString().split("T")[0]
  );

  const totalHoursToday = todayUpdates.reduce((sum, u) => sum + u.hoursSpent, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl">Daily Updates</h1>
          <p className="text-muted-foreground mt-1">
            Quick entry for daily task progress - linked to parent tasks
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Today's Hours</p>
          <p className="text-2xl font-bold">{totalHoursToday}h / 8h</p>
        </div>
      </div>

      {/* Warning: Same Update Detection */}
      {todayUpdates.length === 0 && (
        <Card className="p-4 bg-amber-50 border-amber-200">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-900">
                No update submitted today
              </p>
              <p className="text-xs text-amber-800 mt-1">
                Please add your daily update. After 3 days without updates, your lead will be notified automatically.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Quick Entry Form */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Plus className="w-5 h-5 text-primary" />
          <h2 className="text-xl">Add Today's Update</h2>
          <Badge variant="secondary">{new Date().toLocaleDateString()}</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Parent Task *</label>
            <Select value={newUpdate.parentTask} onValueChange={(val) => setNewUpdate({ ...newUpdate, parentTask: val })}>
              <SelectTrigger>
                <SelectValue placeholder="Select parent task assigned to you" />
              </SelectTrigger>
              <SelectContent>
                {parentTasks.map((task) => (
                  <SelectItem key={task.id} value={task.name}>
                    <div>
                      <div className="font-medium">{task.name}</div>
                      <div className="text-xs text-muted-foreground">{task.project}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Status</label>
            <Select value={newUpdate.status} onValueChange={(val: any) => setNewUpdate({ ...newUpdate, status: val })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="blocked">Blocked</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mb-4">
          <label className="text-sm font-medium mb-2 block">Summary *</label>
          <Input
            placeholder="e.g., Completed tenant_id column implementation"
            value={newUpdate.summary}
            onChange={(e) => setNewUpdate({ ...newUpdate, summary: e.target.value })}
          />
        </div>

        <div className="mb-4">
          <label className="text-sm font-medium mb-2 block">Details</label>
          <Textarea
            placeholder="What did you do? What tables/files did you work on? Any blockers?"
            rows={3}
            value={newUpdate.details}
            onChange={(e) => setNewUpdate({ ...newUpdate, details: e.target.value })}
          />
        </div>

        <div className="mb-4">
          <label className="text-sm font-medium mb-2 block">Hours Spent</label>
          <Input
            type="number"
            min="0"
            max="8"
            step="0.5"
            placeholder="0"
            value={newUpdate.hoursSpent || ""}
            onChange={(e) => setNewUpdate({ ...newUpdate, hoursSpent: parseFloat(e.target.value) || 0 })}
          />
        </div>

        <Button onClick={addUpdate} className="gap-2">
          <Save className="w-4 h-4" />
          Save Update
        </Button>
      </Card>

      {/* Today's Updates */}
      {todayUpdates.length > 0 && (
        <div>
          <h2 className="text-xl mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Today's Updates ({todayUpdates.length})
          </h2>
          <div className="space-y-3">
            {todayUpdates.map((update) => (
              <Card key={update.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary" className="text-xs">
                        {update.parentTask}
                      </Badge>
                      <Badge
                        variant={
                          update.status === "completed"
                            ? "default"
                            : update.status === "blocked"
                            ? "destructive"
                            : "secondary"
                        }
                        className={
                          update.status === "completed"
                            ? "bg-green-500"
                            : update.status === "blocked"
                            ? ""
                            : "bg-blue-500"
                        }
                      >
                        {update.status === "completed" ? (
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                        ) : update.status === "blocked" ? (
                          "Blocked"
                        ) : (
                          <>
                            <Clock className="w-3 h-3 mr-1" />
                            In Progress
                          </>
                        )}
                      </Badge>
                      <span className="text-sm text-muted-foreground">{update.hoursSpent}h</span>
                    </div>
                    <h3 className="font-medium mb-1">{update.summary}</h3>
                    {update.details && (
                      <p className="text-sm text-muted-foreground">{update.details}</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteUpdate(update.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Yesterday's Updates */}
      {yesterdayUpdates.length > 0 && (
        <div>
          <h2 className="text-xl mb-4 flex items-center gap-2 text-muted-foreground">
            <Calendar className="w-5 h-5" />
            Yesterday's Updates ({yesterdayUpdates.length})
          </h2>
          <div className="space-y-3 opacity-60">
            {yesterdayUpdates.map((update) => (
              <Card key={update.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-xs">
                        {update.parentTask}
                      </Badge>
                      <span className="text-sm text-muted-foreground">{update.hoursSpent}h</span>
                    </div>
                    <h3 className="font-medium mb-1">{update.summary}</h3>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Info Box */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="flex gap-3">
          <div className="text-blue-600 mt-0.5">
            <User className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-blue-900">
              <strong>Quick Entry:</strong> Select your assigned parent task, add a summary of what you
              did, and save. Takes less than 1 minute!
            </p>
            <p className="text-sm text-blue-900 mt-2">
              <strong>AI Analysis:</strong> System will analyze your updates to check relevance, detect if
              you're stuck on same task for 3+ days, and evaluate your performance.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
