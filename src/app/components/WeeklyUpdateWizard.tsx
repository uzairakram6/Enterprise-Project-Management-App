import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Sparkles,
  Upload,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { PROJECTS } from "../data/projects";

const wizardProjects = PROJECTS.slice(0, 8).map((project) => ({
  id: project.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
  name: project.name,
}));

const allMetrics = [
  { id: "schedule", label: "Schedule", icon: "📅" },
  { id: "delivery", label: "Delivery", icon: "🚀" },
  { id: "quality", label: "Quality", icon: "✨" },
  { id: "financial", label: "Financial", icon: "💰" },
  { id: "budget", label: "Budget", icon: "📊" },
];

type StatusType = "green" | "amber" | "red" | null;
type UserRole = "pm" | "dm" | "em" | "developer" | "admin";

interface WeeklyUpdateWizardProps {
  userRole?: UserRole;
}

export default function WeeklyUpdateWizard({ userRole = "pm" }: WeeklyUpdateWizardProps) {
  const canViewFinancial = userRole !== "developer";
  const metrics = canViewFinancial
    ? allMetrics
    : allMetrics.filter(m => m.id !== "financial" && m.id !== "budget");
  const [step, setStep] = useState(1);
  const [selectedWeek, setSelectedWeek] = useState("23");
  const [selectedProject, setSelectedProject] = useState(wizardProjects[0]?.id ?? "sumhuman");
  const [executiveSummary, setExecutiveSummary] = useState("");
  const [metricStatuses, setMetricStatuses] = useState<Record<string, StatusType>>({});
  const [metricDetails, setMetricDetails] = useState<Record<string, { description: string; attachments: string[] }>>({});

  const totalSteps = 2 + metrics.length; // 1 intro + 1 summary + metrics
  const progressPercent = (step / totalSteps) * 100;

  const StatusButton = ({ status, onClick, selected }: { status: StatusType; onClick: () => void; selected: boolean }) => {
    const styles = {
      green: "bg-green-500 hover:bg-green-600 text-white",
      amber: "bg-amber-500 hover:bg-amber-600 text-white",
      red: "bg-red-500 hover:bg-red-600 text-white",
    };

    const icons = {
      green: <CheckCircle2 className="w-5 h-5" />,
      amber: <AlertTriangle className="w-5 h-5" />,
      red: <XCircle className="w-5 h-5" />,
    };

    const labels = {
      green: "On Track",
      amber: "At Risk",
      red: "Delayed",
    };

    if (!status) return null;

    return (
      <button
        onClick={onClick}
        className={`flex items-center gap-3 p-6 rounded-lg border-2 transition-all ${
          selected
            ? `${styles[status]} border-transparent scale-105`
            : "border-border hover:border-primary/50"
        }`}
      >
        {icons[status]}
        <span className={selected ? "" : "text-foreground"}>{labels[status]}</span>
      </button>
    );
  };

  const generateAISummary = () => {
    setExecutiveSummary(
      `Weekly Update - Week ${selectedWeek} (June 2-8, 2026)\n\nKey Accomplishments:\n• Completed multi-tenancy database schema implementation\n• Successfully deployed tenant isolation middleware\n• Integrated authentication flow with role-based permissions\n\nProgress: 85% complete, on schedule for Q2 delivery\n\nTeam Performance: All 8 team members submitted daily updates with 97% compliance\n\nNext Week Focus:\n• API endpoint testing and optimization\n• Frontend integration for tenant management\n• Security audit preparation`
    );
  };

  const renderStep = () => {
    // Step 1: Project & Week Selection
    if (step === 1) {
      return (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl mb-2">Create Weekly Update</h2>
            <p className="text-muted-foreground">
              Select the project and week for your update
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <Label>Project</Label>
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {wizardProjects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Week</Label>
              <Select value={selectedWeek} onValueChange={setSelectedWeek}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="21">Week 21 (May 19-25, 2026)</SelectItem>
                  <SelectItem value="22">Week 22 (May 26-Jun 1, 2026)</SelectItem>
                  <SelectItem value="23">Week 23 (Jun 2-8, 2026)</SelectItem>
                  <SelectItem value="24">Week 24 (Jun 9-15, 2026)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex gap-3">
              <div className="text-blue-600 mt-0.5">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-blue-900">
                  This wizard will guide you through creating a comprehensive weekly update with AI-powered
                  summaries and structured metrics tracking.
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Step 2: Executive Summary
    if (step === 2) {
      return (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl mb-2">Executive Summary</h2>
            <p className="text-muted-foreground">
              Provide a high-level overview of this week's progress
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Summary</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={generateAISummary}
                  className="gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Generate with AI
                </Button>
              </div>
              <Textarea
                placeholder="Enter executive summary or generate one with AI..."
                value={executiveSummary}
                onChange={(e) => setExecutiveSummary(e.target.value)}
                rows={10}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground mt-2">
                AI will analyze all daily updates, line items, and team activities from this week
              </p>
            </div>

            <div>
              <Label>Attachments (Optional)</Label>
              <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
                <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Screenshots, documents, reports (Max 10MB each)
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Step 3: Metrics Selection
    if (step === 3) {
      return (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl mb-2">Project Health Metrics</h2>
            <p className="text-muted-foreground">
              Select the status for each metric
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {metrics.map((metric) => (
              <Card key={metric.id} className="p-6">
                <div className="text-center mb-4">
                  <div className="text-3xl mb-2">{metric.icon}</div>
                  <h3 className="text-lg">{metric.label}</h3>
                </div>

                <div className="space-y-2">
                  <StatusButton
                    status="green"
                    selected={metricStatuses[metric.id] === "green"}
                    onClick={() => setMetricStatuses({ ...metricStatuses, [metric.id]: "green" })}
                  />
                  <StatusButton
                    status="amber"
                    selected={metricStatuses[metric.id] === "amber"}
                    onClick={() => setMetricStatuses({ ...metricStatuses, [metric.id]: "amber" })}
                  />
                  <StatusButton
                    status="red"
                    selected={metricStatuses[metric.id] === "red"}
                    onClick={() => setMetricStatuses({ ...metricStatuses, [metric.id]: "red" })}
                  />
                </div>
              </Card>
            ))}
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm text-amber-900">
              💡 If any metric is marked as Amber or Red, you'll be asked to provide details in the next steps
            </p>
          </div>
        </div>
      );
    }

    // Steps 4-8: Individual Metric Details (only for non-green statuses)
    const metricStep = step - 3;
    if (metricStep > 0 && metricStep <= metrics.length) {
      const metric = metrics[metricStep - 1];
      const status = metricStatuses[metric.id];

      if (status === "green" || !status) {
        // Skip green metrics
        return null;
      }

      return (
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="text-3xl">{metric.icon}</div>
              <h2 className="text-2xl">{metric.label} Details</h2>
              <Badge variant={status === "amber" ? "default" : "destructive"}>
                {status === "amber" ? "At Risk" : "Delayed"}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              Provide additional context about the {metric.label.toLowerCase()} status
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <Label>Description</Label>
              <Textarea
                placeholder={`Explain why ${metric.label.toLowerCase()} is ${status === "amber" ? "at risk" : "delayed"}. Include blockers, issues, and mitigation plans...`}
                rows={6}
                value={metricDetails[metric.id]?.description || ""}
                onChange={(e) =>
                  setMetricDetails({
                    ...metricDetails,
                    [metric.id]: {
                      ...metricDetails[metric.id],
                      description: e.target.value,
                    },
                  })
                }
              />
            </div>

            <div>
              <Label>Line Items / Blockers</Label>
              <div className="space-y-2">
                <Input placeholder="Add blocker or line item..." />
                <Button variant="outline" size="sm" className="w-full">
                  + Add Line Item
                </Button>
              </div>
            </div>

            <div>
              <Label>Supporting Documents</Label>
              <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
                <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  Upload evidence, screenshots, or reports
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Final Step: Review
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl mb-2">Review & Submit</h2>
          <p className="text-muted-foreground">
            Review your weekly update before submission
          </p>
        </div>

        <Card className="p-6 space-y-4">
          <div>
            <h3 className="text-sm text-muted-foreground mb-1">Project</h3>
            <p>{wizardProjects.find((p) => p.id === selectedProject)?.name ?? PROJECTS[0].name}</p>
          </div>
          <Separator />
          <div>
            <h3 className="text-sm text-muted-foreground mb-1">Week</h3>
            <p>Week {selectedWeek} (June 2-8, 2026)</p>
          </div>
          <Separator />
          <div>
            <h3 className="text-sm text-muted-foreground mb-1">Executive Summary</h3>
            <p className="text-sm whitespace-pre-line">{executiveSummary.substring(0, 200)}...</p>
          </div>
          <Separator />
          <div>
            <h3 className="text-sm text-muted-foreground mb-2">Metrics Status</h3>
            <div className="flex gap-2 flex-wrap">
              {metrics.map((metric) => {
                const status = metricStatuses[metric.id] || "grey";
                const colors = {
                  green: "bg-green-500",
                  amber: "bg-amber-500",
                  red: "bg-red-500",
                  grey: "bg-gray-300",
                };
                return (
                  <Badge key={metric.id} className={colors[status]}>
                    {metric.label}
                  </Badge>
                );
              })}
            </div>
          </div>
        </Card>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900">
            📧 This update will be sent to your project manager and delivery manager for approval.
            You'll receive a notification once it's reviewed.
          </p>
        </div>
      </div>
    );
  };

  const canProceed = () => {
    if (step === 1) return selectedProject && selectedWeek;
    if (step === 2) return executiveSummary.length > 50;
    if (step === 3) return Object.keys(metricStatuses).length === metrics.length;
    return true;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Progress Bar */}
      <Card className="p-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Step {step} of {totalSteps}</span>
            <span className="text-muted-foreground">{Math.round(progressPercent)}% Complete</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>
      </Card>

      {/* Main Content */}
      <Card className="p-8">
        {renderStep()}
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setStep(Math.max(1, step - 1))}
          disabled={step === 1}
          className="gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </Button>

        {step < totalSteps ? (
          <Button
            onClick={() => setStep(step + 1)}
            disabled={!canProceed()}
            className="gap-2"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button className="gap-2 bg-green-600 hover:bg-green-700">
            <CheckCircle2 className="w-4 h-4" />
            Submit Update
          </Button>
        )}
      </div>
    </div>
  );
}
