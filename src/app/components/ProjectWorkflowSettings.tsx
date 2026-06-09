import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
import { ArrowLeft, Plus, Settings, Workflow as WorkflowIcon } from "lucide-react";
import { DEFAULT_PROJECT_NAME } from "../data/projects";

interface ProjectWorkflowSettingsProps {
  onBack: () => void;
}

const systemWorkflows = [
  {
    id: 1,
    name: "Daily Update Reminder",
    description: "Sends reminder emails at 6:00 PM daily to team members who haven't submitted updates",
    enabled: true,
    trigger: "Daily at 6:00 PM",
    actions: 2,
  },
  {
    id: 2,
    name: "Overdue Update Escalation",
    description: "After 3 days of no update, escalates to project manager and delivery manager",
    enabled: true,
    trigger: "After 3 days no update",
    actions: 3,
  },
  {
    id: 3,
    name: "Project Health Check",
    description: "Weekly automated health check every Monday at 9:00 AM with status summary",
    enabled: true,
    trigger: "Every Monday 9:00 AM",
    actions: 2,
  },
];

const customWorkflows = [
  {
    id: 4,
    name: "Weekly Report Generation",
    description: "Generates and emails weekly summary report every Friday at 5:00 PM to stakeholders",
    enabled: true,
    trigger: "Every Friday 5:00 PM",
    actions: 4,
  },
  {
    id: 5,
    name: "Budget Alert Notification",
    description: "Sends alert when project budget exceeds 80% with breakdown details",
    enabled: false,
    trigger: "Budget exceeds 80%",
    actions: 2,
  },
  {
    id: 6,
    name: "Slack Daily Standup Reminder",
    description: "Posts standup reminder to project Slack channel every weekday at 9:30 AM",
    enabled: true,
    trigger: "Weekdays at 9:30 AM",
    actions: 1,
  },
  {
    id: 7,
    name: "GitHub Commit Summary",
    description: "Daily summary of GitHub commits and pull requests sent to PM at 6:00 PM",
    enabled: false,
    trigger: "Daily at 6:00 PM",
    actions: 2,
  },
  {
    id: 8,
    name: "Milestone Completion Alert",
    description: "Notifies entire team and management when a project milestone is marked complete",
    enabled: false,
    trigger: "Milestone completed",
    actions: 3,
  },
];

export default function ProjectWorkflowSettings({ onBack }: ProjectWorkflowSettingsProps) {
  const toggleWorkflow = (id: number) => {
    alert(`Toggling workflow ${id}`);
  };

  const configureWorkflow = (id: number) => {
    alert(`Configuring workflow ${id}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Project
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl">Workflow Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage workflows for {DEFAULT_PROJECT_NAME}
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Create Custom Workflow
        </Button>
      </div>

      {/* System Workflows */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <WorkflowIcon className="w-5 h-5 text-primary" />
          <h2 className="text-xl">System Workflows</h2>
          <Badge variant="outline">Auto-attached</Badge>
        </div>

        <div className="space-y-3">
          {systemWorkflows.map((workflow) => (
            <Card key={workflow.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg">{workflow.name}</h3>
                    <Badge variant="outline">System</Badge>
                    <Badge
                      variant={workflow.enabled ? "default" : "secondary"}
                      className={workflow.enabled ? "bg-green-500" : ""}
                    >
                      {workflow.enabled ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{workflow.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={workflow.enabled}
                      onChange={() => toggleWorkflow(workflow.id)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => configureWorkflow(workflow.id)}
                  >
                    <Settings className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <Separator className="my-3" />

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Trigger</p>
                  <p className="font-medium">{workflow.trigger}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Actions</p>
                  <p className="font-medium">{workflow.actions} configured</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <Separator className="my-8" />

      {/* Custom Workflows */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <WorkflowIcon className="w-5 h-5 text-purple-600" />
          <h2 className="text-xl">Custom Workflows</h2>
          <Badge className="bg-purple-500">Optional</Badge>
        </div>

        <div className="space-y-3">
          {customWorkflows.map((workflow) => (
            <Card key={workflow.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg">{workflow.name}</h3>
                    <Badge className="bg-purple-500">Custom</Badge>
                    <Badge
                      variant={workflow.enabled ? "default" : "secondary"}
                      className={workflow.enabled ? "bg-green-500" : ""}
                    >
                      {workflow.enabled ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{workflow.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={workflow.enabled}
                      onChange={() => toggleWorkflow(workflow.id)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => configureWorkflow(workflow.id)}
                  >
                    <Settings className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <Separator className="my-3" />

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Trigger</p>
                  <p className="font-medium">{workflow.trigger}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Actions</p>
                  <p className="font-medium">{workflow.actions} configured</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Info Card */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <div className="flex gap-4">
          <WorkflowIcon className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-900 mb-2">About Workflows</h3>
            <ul className="space-y-2 text-sm text-blue-900">
              <li>
                • <strong>System Workflows</strong> are automatically attached to all projects and ensure
                basic compliance and notifications
              </li>
              <li>
                • <strong>Custom Workflows</strong> can be created from the Workflows section and attached
                to specific projects
              </li>
              <li>
                • Toggle workflows on/off anytime without losing their configuration
              </li>
              <li>
                • Click the settings icon to modify trigger conditions and actions
              </li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={onBack}>
          Cancel
        </Button>
        <Button>Save Changes</Button>
      </div>
    </div>
  );
}
