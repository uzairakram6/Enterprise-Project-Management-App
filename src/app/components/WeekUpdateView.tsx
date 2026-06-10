import React from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import {
  ArrowLeft,
  Calendar,
  FileText,
  Download,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  User,
  Clock,
} from "lucide-react";

interface WeekUpdateViewProps {
  weekNumber: number;
  projectName: string;
  onBack: () => void;
}

const sampleUpdate = {
  week: 23,
  dateRange: "June 2-8, 2026",
  projectName: "Sumhuman",
  submittedBy: "Manohar Ali",
  submittedAt: "June 8, 2026 at 5:30 PM",
  approvedBy: "Aries Khan",
  approvalStatus: "Approved",
  executiveSummary: `Weekly Update - Week 23 (June 2-8, 2026)

Key Accomplishments:
• Completed multi-tenancy database schema implementation
• Successfully deployed tenant isolation middleware
• Integrated authentication flow with role-based permissions

Progress: 85% complete, on schedule for Q2 delivery

Team Performance: All 8 team members submitted daily updates with 97% compliance

Next Week Focus:
• API endpoint testing and optimization
• Frontend integration for tenant management
• Security audit preparation`,
  metrics: {
    schedule: { status: "green", notes: "All milestones completed on time. No delays." },
    delivery: { status: "green", notes: "Sprint deliverables completed successfully." },
    quality: {
      status: "amber",
      notes: "Unit test coverage at 78%. Team allocating 20% capacity next week to improve coverage to 85%.",
    },
    financial: { status: "green", notes: "Within budget. No concerns." },
    budget: { status: "green", notes: "72% budget utilized with 85% work completed. On track." },
  },
  attachments: [
    { name: "Sprint_23_Retrospective.pdf", size: "2.4 MB", type: "PDF" },
    { name: "Architecture_Diagram_v2.png", size: "856 KB", type: "Image" },
    { name: "Test_Coverage_Report.xlsx", size: "124 KB", type: "Excel" },
  ],
  lineItems: [
    {
      title: "Database Schema Implementation",
      description:
        "Completed row-level security implementation for tenant data isolation. All tables now have tenant_id column with appropriate RLS policies.",
      status: "completed",
      assignee: "Fatima Noor",
    },
    {
      title: "Authentication Middleware",
      description:
        "Integrated JWT-based authentication with role-based access control. Supports admin, manager, and user roles.",
      status: "completed",
      assignee: "Ahmed Khan",
    },
    {
      title: "API Rate Limiting",
      description:
        "Implemented per-tenant rate limiting using Redis. Currently testing with load simulation.",
      status: "in-progress",
      assignee: "Omar Farooq",
    },
  ],
};

export default function WeekUpdateView({
  weekNumber,
  projectName,
  onBack,
}: WeekUpdateViewProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "green":
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case "amber":
        return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case "red":
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      green: "bg-green-500",
      amber: "bg-amber-500",
      red: "bg-red-500",
    };
    const labels = {
      green: "On Track",
      amber: "At Risk",
      red: "Delayed",
    };
    return (
      <Badge className={colors[status as keyof typeof colors]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl mb-2">Week {sampleUpdate.week} Update</h1>
          <p className="text-muted-foreground">{sampleUpdate.dateRange}</p>
          <p className="text-lg mt-2">{sampleUpdate.projectName}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Download PDF
          </Button>
          <Button variant="outline" className="gap-2">
            <FileText className="w-4 h-4" />
            Edit Update
          </Button>
        </div>
      </div>

      {/* Status Card */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Submitted By</p>
              <p className="font-medium">{sampleUpdate.submittedBy}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Submitted At</p>
              <p className="font-medium">{sampleUpdate.submittedAt}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge className="bg-green-500">{sampleUpdate.approvalStatus}</Badge>
              <p className="text-xs text-muted-foreground mt-1">by {sampleUpdate.approvedBy}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Executive Summary */}
      <Card className="p-6">
        <h2 className="text-xl mb-4">Executive Summary</h2>
        <div className="bg-muted/30 p-4 rounded-lg">
          <p className="whitespace-pre-line text-muted-foreground">
            {sampleUpdate.executiveSummary}
          </p>
        </div>
      </Card>

      {/* Health Metrics */}
      <Card className="p-6">
        <h2 className="text-xl mb-6">Project Health Metrics</h2>
        <div className="space-y-4">
          {Object.entries(sampleUpdate.metrics).map(([key, value]) => (
            <div key={key}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  {getStatusIcon(value.status)}
                  <div>
                    <h3 className="font-medium capitalize">{key}</h3>
                  </div>
                </div>
                {getStatusBadge(value.status)}
              </div>
              {value.notes && (
                <p className="text-sm text-muted-foreground ml-8">{value.notes}</p>
              )}
              {key !== "budget" && <Separator className="mt-4" />}
            </div>
          ))}
        </div>
      </Card>

      {/* Line Items / Tasks */}
      <Card className="p-6">
        <h2 className="text-xl mb-6">Line Items & Tasks</h2>
        <div className="space-y-4">
          {sampleUpdate.lineItems.map((item, idx) => (
            <Card key={idx} className="p-4 border">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-medium">{item.title}</h3>
                <Badge
                  variant={item.status === "completed" ? "default" : "secondary"}
                  className={item.status === "completed" ? "bg-green-500" : "bg-blue-500"}
                >
                  {item.status === "completed" ? "Completed" : "In Progress"}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
              <div className="flex items-center gap-2 text-sm">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Assigned to:</span>
                <span>{item.assignee}</span>
              </div>
            </Card>
          ))}
        </div>
      </Card>

      {/* Attachments */}
      <Card className="p-6">
        <h2 className="text-xl mb-6">Attachments</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {sampleUpdate.attachments.map((file, idx) => (
            <Card key={idx} className="p-4 border hover:border-primary transition-colors cursor-pointer">
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 p-2 rounded">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{file.type} • {file.size}</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="w-full mt-3 gap-2">
                <Download className="w-4 h-4" />
                Download
              </Button>
            </Card>
          ))}
        </div>
      </Card>

      {/* Approval History */}
      <Card className="p-6">
        <h2 className="text-xl mb-6">Approval History</h2>
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-medium">Approved by Aries Khan</p>
                <Badge className="bg-green-500">Approved</Badge>
              </div>
              <p className="text-sm text-muted-foreground">June 8, 2026 at 6:15 PM</p>
              <p className="text-sm text-muted-foreground mt-1">
                "Great progress this week. Quality concerns noted and plan looks good for next week."
              </p>
            </div>
          </div>

          <Separator />

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium">Submitted by Manohar Ali</p>
              <p className="text-sm text-muted-foreground">June 8, 2026 at 5:30 PM</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
