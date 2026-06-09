import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  FileDown,
  FileText,
  Printer,
  Mail,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from "lucide-react";

interface ViewReportsProps {
  onBack: () => void;
}

export default function ViewReports({ onBack }: ViewReportsProps) {
  const [reportType, setReportType] = useState("weekly");
  const [selectedProject, setSelectedProject] = useState("multi-tenancy");
  const [startDate, setStartDate] = useState<Date>(new Date("2026-06-02"));
  const [endDate, setEndDate] = useState<Date>(new Date("2026-06-08"));
  const [showReport, setShowReport] = useState(false);

  const generateReport = () => {
    setShowReport(true);
  };

  const exportReport = (format: string) => {
    alert(`Exporting report as ${format.toUpperCase()}...`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Projects
        </Button>
      </div>

      <div>
        <h1 className="text-3xl">Project Reports</h1>
        <p className="text-muted-foreground mt-1">
          Generate comprehensive reports based on date range and project updates
        </p>
      </div>

      {/* Report Configuration */}
      <Card className="p-6">
        <h2 className="text-xl mb-6">Report Configuration</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <Label>Project</Label>
            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="multi-tenancy">Multi-Tenancy Platform</SelectItem>
                <SelectItem value="customer-portal">Customer Portal Redesign</SelectItem>
                <SelectItem value="mobile-app">Mobile App Development</SelectItem>
                <SelectItem value="analytics">Data Analytics Dashboard</SelectItem>
                <SelectItem value="all">All Projects</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Report Type</Label>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly Update Report</SelectItem>
                <SelectItem value="monthly">Monthly Summary Report</SelectItem>
                <SelectItem value="quarterly">Quarterly Performance Report</SelectItem>
                <SelectItem value="custom">Custom Date Range</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <Label>Start Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? startDate.toLocaleDateString() : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={startDate} onSelect={(date) => date && setStartDate(date)} />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <Label>End Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? endDate.toLocaleDateString() : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={endDate} onSelect={(date) => date && setEndDate(date)} />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div>
          <Label>Include Sections</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
            <div className="flex items-center gap-2">
              <input type="checkbox" id="exec-summary" defaultChecked />
              <Label htmlFor="exec-summary" className="cursor-pointer text-sm">
                Executive Summary
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="metrics" defaultChecked />
              <Label htmlFor="metrics" className="cursor-pointer text-sm">
                Health Metrics
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="team" defaultChecked />
              <Label htmlFor="team" className="cursor-pointer text-sm">
                Team Performance
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="blockers" defaultChecked />
              <Label htmlFor="blockers" className="cursor-pointer text-sm">
                Blockers & Issues
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="github" />
              <Label htmlFor="github" className="cursor-pointer text-sm">
                GitHub Activity
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="budget" />
              <Label htmlFor="budget" className="cursor-pointer text-sm">
                Budget Analysis
              </Label>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <Button onClick={generateReport} className="gap-2">
            <FileText className="w-4 h-4" />
            Generate Report
          </Button>
        </div>
      </Card>

      {/* Report Preview */}
      {showReport && (
        <Card className="p-8">
          {/* Report Header */}
          <div className="flex items-start justify-between mb-8 pb-6 border-b">
            <div>
              <h2 className="text-2xl font-bold mb-2">Weekly Update Report</h2>
              <p className="text-muted-foreground">
                Multi-Tenancy Platform • Week 23 (June 2-8, 2026)
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => exportReport("pdf")} className="gap-2">
                <FileDown className="w-4 h-4" />
                PDF
              </Button>
              <Button variant="outline" size="sm" onClick={() => exportReport("excel")} className="gap-2">
                <FileDown className="w-4 h-4" />
                Excel
              </Button>
              <Button variant="outline" size="sm" onClick={() => alert("Opening print dialog...")} className="gap-2">
                <Printer className="w-4 h-4" />
                Print
              </Button>
              <Button variant="outline" size="sm" onClick={() => alert("Email dialog opened")} className="gap-2">
                <Mail className="w-4 h-4" />
                Email
              </Button>
            </div>
          </div>

          {/* Executive Summary */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4">Executive Summary</h3>
            <div className="bg-muted/30 p-6 rounded-lg">
              <p className="text-muted-foreground leading-relaxed">
                The Multi-Tenancy Platform project completed Week 23 with strong performance across
                all key metrics. The team successfully delivered the tenant isolation middleware and
                integrated the authentication flow with role-based permissions. All 8 team members
                maintained 97% update compliance, demonstrating excellent engagement and
                accountability.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-3">
                <strong>Key Highlights:</strong> Completed database schema implementation,
                successfully deployed tenant isolation middleware, integrated authentication flow with
                RBAC. The project remains 85% complete and on schedule for Q2 delivery.
              </p>
            </div>
          </div>

          {/* Health Metrics */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4">Project Health Metrics</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { label: "Schedule", status: "green", icon: CheckCircle2 },
                { label: "Delivery", status: "green", icon: CheckCircle2 },
                { label: "Quality", status: "amber", icon: AlertTriangle },
                { label: "Financial", status: "green", icon: CheckCircle2 },
                { label: "Budget", status: "green", icon: CheckCircle2 },
              ].map((metric, idx) => (
                <Card key={idx} className="p-4 text-center">
                  <div
                    className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                      metric.status === "green"
                        ? "bg-green-100"
                        : metric.status === "amber"
                        ? "bg-amber-100"
                        : "bg-red-100"
                    }`}
                  >
                    <metric.icon
                      className={`w-6 h-6 ${
                        metric.status === "green"
                          ? "text-green-600"
                          : metric.status === "amber"
                          ? "text-amber-600"
                          : "text-red-600"
                      }`}
                    />
                  </div>
                  <p className="text-sm font-medium">{metric.label}</p>
                  <Badge
                    variant="secondary"
                    className={
                      metric.status === "green"
                        ? "bg-green-100 text-green-700 mt-2"
                        : metric.status === "amber"
                        ? "bg-amber-100 text-amber-700 mt-2"
                        : "bg-red-100 text-red-700 mt-2"
                    }
                  >
                    {metric.status === "green"
                      ? "On Track"
                      : metric.status === "amber"
                      ? "At Risk"
                      : "Delayed"}
                  </Badge>
                </Card>
              ))}
            </div>
          </div>

          {/* Accomplishments */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4">Key Accomplishments</h3>
            <div className="space-y-3">
              {[
                "Completed multi-tenancy database schema implementation with row-level security",
                "Successfully deployed tenant isolation middleware to staging environment",
                "Integrated authentication flow with role-based permissions (RBAC)",
                "Conducted security review with zero critical vulnerabilities found",
                "All team members maintained 97% daily update compliance",
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <p className="text-muted-foreground">{item}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Team Performance */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4">Team Performance</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-4">
                <p className="text-sm text-muted-foreground mb-1">Update Compliance</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-bold">97%</p>
                  <Badge className="bg-green-500">Excellent</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  46 out of 47 daily updates submitted on time
                </p>
              </Card>

              <Card className="p-4">
                <p className="text-sm text-muted-foreground mb-1">Team Utilization</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-bold">92%</p>
                  <Badge variant="secondary">Optimal</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  294 hours logged out of 320 available hours
                </p>
              </Card>
            </div>
          </div>

          {/* Blockers & Risks */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4">Blockers & Risks</h3>
            <div className="space-y-3">
              <Card className="p-4 border-amber-200 bg-amber-50">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-900">Quality Metrics At Risk</p>
                    <p className="text-sm text-amber-700 mt-1">
                      Unit test coverage dropped to 78% due to rapid development pace. Team is
                      allocating 20% of sprint capacity next week to address technical debt.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Next Week Focus */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Next Week Focus</h3>
            <div className="bg-blue-50 p-6 rounded-lg">
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  <span>API endpoint testing and optimization</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  <span>Frontend integration for tenant management dashboard</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  <span>Security audit preparation and documentation</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  <span>Increase unit test coverage to 85%</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t text-center text-sm text-muted-foreground">
            <p>Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}</p>
            <p className="mt-1">Project Management System • Enterprise Edition</p>
          </div>
        </Card>
      )}
    </div>
  );
}
