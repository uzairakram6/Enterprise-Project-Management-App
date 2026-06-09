import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Plus, Save, Calendar as CalendarIcon, Edit2, Trash2, CheckCircle2, Users } from "lucide-react";

interface ParentTask {
  id: number;
  taskName: string;
  project: string;
  assignedTo: string[];
  dueDate: string;
  priority: "low" | "medium" | "high";
  description: string;
  status: "active" | "completed" | "on-hold";
  createdBy: string;
  createdDate: string;
}

const projects = [
  { id: 1, name: "Multi-Tenancy Platform" },
  { id: 2, name: "Customer Portal Redesign" },
  { id: 3, name: "Mobile App Development" },
  { id: 4, name: "API Gateway Modernization" },
];

const teamMembers = [
  "Ali Hassan",
  "Sara Ahmed",
  "Usman Khan",
  "Fatima Malik",
  "Ahmed Raza",
  "Zainab Ali",
];

export default function ParentTaskManagement() {
  const [tasks, setTasks] = useState<ParentTask[]>([
    {
      id: 1,
      taskName: "Multi-Tenancy - Database Schema",
      project: "Multi-Tenancy Platform",
      assignedTo: ["Ali Hassan", "Sara Ahmed"],
      dueDate: "2026-06-15",
      priority: "high",
      description: "Implement tenant isolation at database level with RLS policies",
      status: "active",
      createdBy: "Hamza Khan (PM)",
      createdDate: "2026-06-01",
    },
    {
      id: 2,
      taskName: "Multi-Tenancy - API Layer",
      project: "Multi-Tenancy Platform",
      assignedTo: ["Usman Khan"],
      dueDate: "2026-06-20",
      priority: "high",
      description: "Build API middleware for tenant context injection",
      status: "active",
      createdBy: "Hamza Khan (PM)",
      createdDate: "2026-06-01",
    },
    {
      id: 3,
      taskName: "Customer Portal - UI Components",
      project: "Customer Portal Redesign",
      assignedTo: ["Fatima Malik", "Zainab Ali"],
      dueDate: "2026-06-18",
      priority: "medium",
      description: "Design and implement reusable React components for customer portal",
      status: "active",
      createdBy: "Hamza Khan (PM)",
      createdDate: "2026-06-03",
    },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<ParentTask | null>(null);
  const [dueDate, setDueDate] = useState<Date>();
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    taskName: "",
    project: "",
    priority: "medium" as const,
    description: "",
  });

  const toggleMember = (member: string) => {
    if (selectedMembers.includes(member)) {
      setSelectedMembers(selectedMembers.filter((m) => m !== member));
    } else {
      setSelectedMembers([...selectedMembers, member]);
    }
  };

  const handleEdit = (task: ParentTask) => {
    setEditingTask(task);
    setFormData({
      taskName: task.taskName,
      project: task.project,
      priority: task.priority,
      description: task.description,
    });
    setSelectedMembers(task.assignedTo);
    setDueDate(new Date(task.dueDate));
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this parent task? All related daily updates will be affected.")) {
      setTasks(tasks.filter((t) => t.id !== id));
    }
  };

  const handleSave = () => {
    if (!formData.taskName || !formData.project || selectedMembers.length === 0 || !dueDate) {
      alert("Please fill in all required fields");
      return;
    }

    const taskData: ParentTask = {
      id: editingTask ? editingTask.id : Date.now(),
      taskName: formData.taskName,
      project: formData.project,
      assignedTo: selectedMembers,
      dueDate: dueDate.toISOString().split("T")[0],
      priority: formData.priority,
      description: formData.description,
      status: editingTask ? editingTask.status : "active",
      createdBy: "Hamza Khan (PM)",
      createdDate: editingTask ? editingTask.createdDate : new Date().toISOString().split("T")[0],
    };

    if (editingTask) {
      setTasks(tasks.map((t) => (t.id === editingTask.id ? taskData : t)));
    } else {
      setTasks([taskData, ...tasks]);
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      taskName: "",
      project: "",
      priority: "medium",
      description: "",
    });
    setSelectedMembers([]);
    setDueDate(undefined);
    setEditingTask(null);
    setShowForm(false);
  };

  const activeTasks = tasks.filter((t) => t.status === "active");
  const completedTasks = tasks.filter((t) => t.status === "completed");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl">Parent Task Management</h1>
          <p className="text-muted-foreground mt-1">
            Define weekly tasks for your team - these will appear in Daily Updates dropdown
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          <Plus className="w-4 h-4" />
          {showForm ? "Cancel" : "Create Parent Task"}
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Active Tasks</p>
          <p className="text-2xl font-bold mt-1">{activeTasks.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Completed This Week</p>
          <p className="text-2xl font-bold mt-1">{completedTasks.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Team Members</p>
          <p className="text-2xl font-bold mt-1">{teamMembers.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Overdue Tasks</p>
          <p className="text-2xl font-bold mt-1 text-red-500">0</p>
        </Card>
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Plus className="w-5 h-5 text-primary" />
            <h2 className="text-xl">{editingTask ? "Edit Parent Task" : "Create New Parent Task"}</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Task Name *</label>
              <Input
                placeholder="e.g., Multi-Tenancy - Database Schema"
                value={formData.taskName}
                onChange={(e) => setFormData({ ...formData, taskName: e.target.value })}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Project *</label>
              <Select value={formData.project} onValueChange={(val) => setFormData({ ...formData, project: val })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.name}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Priority</label>
              <Select value={formData.priority} onValueChange={(val: any) => setFormData({ ...formData, priority: val })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Due Date *</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? dueDate.toLocaleDateString() : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={dueDate} onSelect={setDueDate} />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="mb-4">
            <label className="text-sm font-medium mb-2 block">Description</label>
            <Textarea
              placeholder="Describe the task scope, deliverables, and expectations"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="mb-4">
            <label className="text-sm font-medium mb-2 block">Assign To *</label>
            <div className="flex flex-wrap gap-2">
              {teamMembers.map((member) => (
                <Badge
                  key={member}
                  variant={selectedMembers.includes(member) ? "default" : "outline"}
                  className={`cursor-pointer ${
                    selectedMembers.includes(member) ? "bg-primary" : ""
                  }`}
                  onClick={() => toggleMember(member)}
                >
                  {member}
                  {selectedMembers.includes(member) && <CheckCircle2 className="w-3 h-3 ml-1" />}
                </Badge>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Selected: {selectedMembers.length} member(s)
            </p>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSave} className="gap-2">
              <Save className="w-4 h-4" />
              {editingTask ? "Update Task" : "Create Task"}
            </Button>
            <Button variant="outline" onClick={resetForm}>
              Cancel
            </Button>
          </div>
        </Card>
      )}

      {/* Active Tasks */}
      <div>
        <h2 className="text-xl mb-4 flex items-center gap-2">
          <Users className="w-5 h-5" />
          Active Parent Tasks ({activeTasks.length})
        </h2>
        <div className="space-y-3">
          {activeTasks.map((task) => (
            <Card key={task.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-medium text-lg">{task.taskName}</h3>
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
                      {task.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Badge variant="outline">{task.project}</Badge>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {task.assignedTo.length} member{task.assignedTo.length > 1 ? "s" : ""}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {task.assignedTo.map((member) => (
                      <Badge key={member} variant="secondary" className="text-xs">
                        {member}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(task)}
                    className="text-blue-500 hover:text-blue-600"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(task.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Info Box */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="flex gap-3">
          <div className="text-blue-600 mt-0.5">
            <Users className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-blue-900">
              <strong>Parent Tasks:</strong> These high-level tasks appear in the Daily Updates dropdown.
              Team members add line items and daily progress under these tasks.
            </p>
            <p className="text-sm text-blue-900 mt-2">
              <strong>Best Practice:</strong> Create weekly parent tasks at the start of the week. Assign to
              relevant team members so they can track daily progress.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
