import React, { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Switch } from "./ui/switch";
import { Plus, Workflow, Mail, MessageSquare, GitBranch, Clock, Zap, Eye } from "lucide-react";

const workflows = [
  {
    id: 1,
    name: "Daily Update Reminder",
    type: "System",
    trigger: "Daily at 6:00 PM",
    status: "Active",
    actions: 2,
    lastRun: "2026-06-08 18:00",
  },
  {
    id: 2,
    name: "Overdue Update Escalation",
    type: "System",
    trigger: "After 3 days no update",
    status: "Active",
    actions: 3,
    lastRun: "2026-06-07 10:30",
  },
  {
    id: 3,
    name: "Weekly Report Generation",
    type: "Custom",
    trigger: "Every Friday 5:00 PM",
    status: "Active",
    actions: 4,
    lastRun: "2026-06-06 17:00",
  },
  {
    id: 4,
    name: "Budget Alert Notification",
    type: "Custom",
    trigger: "Budget exceeds 80%",
    status: "Active",
    actions: 2,
    lastRun: "2026-06-05 14:15",
  },
  {
    id: 5,
    name: "Project Health Check",
    type: "System",
    trigger: "Every Monday 9:00 AM",
    status: "Active",
    actions: 5,
    lastRun: "2026-06-02 09:00",
  },
];

const triggerTypes = [
  { id: "schedule", label: "Time-based Schedule", icon: Clock },
  { id: "event", label: "Event-based Trigger", icon: Zap },
  { id: "condition", label: "Condition-based", icon: GitBranch },
];

const actionTypes = [
  { id: "email", label: "Send Email", icon: Mail, color: "bg-blue-500" },
  { id: "slack", label: "Send Slack Message", icon: MessageSquare, color: "bg-purple-500" },
  { id: "escalate", label: "Escalate to Manager", icon: GitBranch, color: "bg-orange-500" },
  { id: "notify", label: "In-app Notification", icon: Zap, color: "bg-green-500" },
];

export default function WorkflowManagement() {
  const [selectedWorkflow, setSelectedWorkflow] = useState<number | null>(null);
  const [showBuilder, setShowBuilder] = useState(false);

  const WorkflowCard = ({ workflow }: { workflow: typeof workflows[0] }) => (
    <Card
      className="p-6 hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => setSelectedWorkflow(workflow.id)}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg mb-1">{workflow.name}</h3>
          <div className="flex items-center gap-2">
            <Badge variant={workflow.type === "System" ? "default" : "secondary"}>
              {workflow.type}
            </Badge>
            <Badge
              variant="outline"
              className={workflow.status === "Active" ? "border-green-500 text-green-700" : ""}
            >
              {workflow.status}
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            <Eye className="w-4 h-4" />
          </Button>
          <Switch defaultChecked={workflow.status === "Active"} />
        </div>
      </div>

      <Separator className="my-4" />

      <div className="space-y-3 text-sm">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <span className="text-muted-foreground">Trigger:</span>
          <span>{workflow.trigger}</span>
        </div>
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-muted-foreground" />
          <span className="text-muted-foreground">Actions:</span>
          <span>{workflow.actions} configured</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Last run:</span>
          <span>{workflow.lastRun}</span>
        </div>
      </div>
    </Card>
  );

  if (showBuilder) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl">Workflow Builder</h1>
            <p className="text-muted-foreground mt-1">
              Create a new workflow to automate project management tasks
            </p>
          </div>
          <Button variant="outline" onClick={() => setShowBuilder(false)}>
            Cancel
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Configuration */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <h2 className="text-xl mb-4">Workflow Details</h2>
              <div className="space-y-4">
                <div>
                  <Label>Workflow Name</Label>
                  <Input placeholder="E.g., Send reminder for pending updates" />
                </div>
                <div>
                  <Label>Description</Label>
                  <Input placeholder="Brief description of what this workflow does" />
                </div>
                <div>
                  <Label>Workflow Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="system">System Workflow</SelectItem>
                      <SelectItem value="custom">Custom Workflow</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <Switch />
                  <Label>Attach to all projects by default</Label>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl mb-4">Trigger Configuration</h2>
              <div className="grid grid-cols-3 gap-4 mb-6">
                {triggerTypes.map((trigger) => (
                  <button
                    key={trigger.id}
                    className="p-4 border-2 rounded-lg hover:border-primary transition-colors text-center"
                  >
                    <trigger.icon className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm">{trigger.label}</p>
                  </button>
                ))}
              </div>
              <div className="space-y-4">
                <div>
                  <Label>When to trigger</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select trigger condition" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily at specific time</SelectItem>
                      <SelectItem value="weekly">Weekly on specific day</SelectItem>
                      <SelectItem value="no-update">No update received</SelectItem>
                      <SelectItem value="status-change">Project status changes</SelectItem>
                      <SelectItem value="overdue">Task becomes overdue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Time</Label>
                    <Input type="time" defaultValue="18:00" />
                  </div>
                  <div>
                    <Label>Days threshold</Label>
                    <Input type="number" defaultValue="3" placeholder="E.g., 3 days" />
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl">Actions</h2>
                <Button size="sm" variant="outline" className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add Action
                </Button>
              </div>

              <div className="space-y-3">
                {actionTypes.map((action, idx) => (
                  <div key={action.id} className="border rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`${action.color} p-2 rounded`}>
                        <action.icon className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="font-medium">{action.label}</p>
                        <p className="text-xs text-muted-foreground">Action {idx + 1}</p>
                      </div>
                    </div>

                    {action.id === "email" && (
                      <div className="space-y-2">
                        <Input placeholder="To: email@example.com" />
                        <Input placeholder="Subject" />
                      </div>
                    )}

                    {action.id === "escalate" && (
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select role to escalate to" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pm">Project Manager</SelectItem>
                          <SelectItem value="dm">Delivery Manager</SelectItem>
                          <SelectItem value="director">Director</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                ))}
              </div>
            </Card>

            <div className="flex gap-3">
              <Button className="flex-1">Save Workflow</Button>
              <Button variant="outline" onClick={() => setShowBuilder(false)}>
                Cancel
              </Button>
            </div>
          </div>

          {/* Visual Preview */}
          <div>
            <Card className="p-6 sticky top-6">
              <h3 className="text-sm text-muted-foreground mb-4">Workflow Preview</h3>

              <div className="space-y-4">
                <div className="border-2 border-dashed rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-medium">Trigger</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Daily at 6:00 PM if no update for 3 days
                  </p>
                </div>

                <div className="flex justify-center">
                  <div className="w-px h-8 bg-border" />
                </div>

                <div className="border-2 rounded-lg p-4 bg-blue-50">
                  <div className="flex items-center gap-2 mb-2">
                    <Mail className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium">Action 1</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Send email to resource</p>
                </div>

                <div className="flex justify-center">
                  <div className="w-px h-8 bg-border" />
                </div>

                <div className="border-2 rounded-lg p-4 bg-orange-50">
                  <div className="flex items-center gap-2 mb-2">
                    <GitBranch className="w-4 h-4 text-orange-600" />
                    <span className="text-sm font-medium">Action 2</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Escalate to manager</p>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="space-y-2 text-xs text-muted-foreground">
                <p>
                  <strong>Applied to:</strong> All projects
                </p>
                <p>
                  <strong>Status:</strong> Will be active on save
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl">Workflow Management</h1>
          <p className="text-muted-foreground mt-1">
            Automate project management tasks with custom workflows
          </p>
        </div>
        <Button onClick={() => setShowBuilder(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Create Workflow
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-3 rounded-lg">
              <Workflow className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Workflows</p>
              <p className="text-2xl">{workflows.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-3 rounded-lg">
              <Zap className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active</p>
              <p className="text-2xl">{workflows.filter((w) => w.status === "Active").length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">System Workflows</p>
              <p className="text-2xl">{workflows.filter((w) => w.type === "System").length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 p-3 rounded-lg">
              <GitBranch className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Custom Workflows</p>
              <p className="text-2xl">{workflows.filter((w) => w.type === "Custom").length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Workflow List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {workflows.map((workflow) => (
          <WorkflowCard key={workflow.id} workflow={workflow} />
        ))}
      </div>

      {/* Info Banner */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="flex gap-3">
          <Workflow className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <p className="text-sm text-blue-900">
              <strong>Finite Workflows:</strong> Workflows are sequential with parallel actions but no infinite loops.
              You can trigger multiple actions at once, but they cannot lead to nested workflows.
            </p>
            <p className="text-sm text-blue-900 mt-2">
              <strong>Integration:</strong> Workflows support email, Slack, GitHub, and custom API integrations
              via the Hatchet workflow engine.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
