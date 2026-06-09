import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Users, Calendar, Copy, Save, TrendingUp, AlertCircle } from "lucide-react";

const resources = [
  { id: 1, name: "Ahmed Khan", role: "Senior Developer", team: "Engineering", utilization: 95 },
  { id: 2, name: "Sarah Ali", role: "Full Stack Developer", team: "Engineering", utilization: 88 },
  { id: 3, name: "Hassan Malik", role: "Frontend Developer", team: "Engineering", utilization: 100 },
  { id: 4, name: "Fatima Noor", role: "Backend Developer", team: "Engineering", utilization: 92 },
  { id: 5, name: "Omar Farooq", role: "DevOps Engineer", team: "Engineering", utilization: 78 },
  { id: 6, name: "Aisha Rahman", role: "QA Engineer", team: "Quality", utilization: 85 },
  { id: 7, name: "Bilal Ahmed", role: "UI/UX Designer", team: "Design", utilization: 90 },
  { id: 8, name: "Zainab Hussain", role: "Senior Developer", team: "Engineering", utilization: 105 },
  { id: 9, name: "Usman Tariq", role: "Full Stack Developer", team: "Engineering", utilization: 82 },
  { id: 10, name: "Maryam Saeed", role: "Project Manager", team: "Management", utilization: 75 },
];

const projects = [
  { id: "multi-tenancy", name: "Multi-Tenancy Platform", color: "bg-blue-500" },
  { id: "customer-portal", name: "Customer Portal", color: "bg-green-500" },
  { id: "mobile-app", name: "Mobile App", color: "bg-purple-500" },
  { id: "analytics", name: "Analytics Dashboard", color: "bg-orange-500" },
  { id: "api-suite", name: "API Integration", color: "bg-pink-500" },
  { id: "cloud-migration", name: "Cloud Migration", color: "bg-cyan-500" },
];

const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

interface Allocation {
  project: string;
  hours: number;
}

type WeekAllocation = Record<number, Record<string, Allocation[]>>;

export default function ResourceAllocation() {
  const [selectedWeek, setSelectedWeek] = useState("23");
  const [allocations, setAllocations] = useState<WeekAllocation>({});
  const [expandedResource, setExpandedResource] = useState<number | null>(null);

  const copyFromLastWeek = () => {
    // Simulate copying allocation from previous week
    alert("Allocations copied from Week 22");
  };

  const saveAllocations = () => {
    alert("Allocations saved successfully for Week " + selectedWeek);
  };

  const calculateDailyHours = (resourceId: number, day: string) => {
    const dayAllocations = allocations[resourceId]?.[day] || [];
    return dayAllocations.reduce((sum, alloc) => sum + alloc.hours, 0);
  };

  const calculateWeeklyHours = (resourceId: number) => {
    let total = 0;
    weekDays.forEach((day) => {
      total += calculateDailyHours(resourceId, day);
    });
    return total;
  };

  const getUtilizationColor = (hours: number, target: number = 8) => {
    const percentage = (hours / target) * 100;
    if (percentage >= 90 && percentage <= 110) return "text-green-600";
    if (percentage >= 80 && percentage < 90) return "text-amber-600";
    if (percentage > 110) return "text-red-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl">Resource Allocation</h1>
          <p className="text-muted-foreground mt-1">
            Weekly project allocation for all team members
          </p>
        </div>
      </div>

      {/* Controls */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="flex items-center gap-2 flex-1">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <Select value={selectedWeek} onValueChange={setSelectedWeek}>
              <SelectTrigger className="w-full md:w-64">
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

          <div className="flex gap-2">
            <Button variant="outline" onClick={copyFromLastWeek} className="gap-2">
              <Copy className="w-4 h-4" />
              Copy Last Week
            </Button>
            <Button onClick={saveAllocations} className="gap-2">
              <Save className="w-4 h-4" />
              Save
            </Button>
          </div>
        </div>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Resources</p>
              <p className="text-2xl">{resources.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-3 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg Utilization</p>
              <p className="text-2xl">89%</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="bg-amber-100 p-3 rounded-lg">
              <AlertCircle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Over-allocated</p>
              <p className="text-2xl">2</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 p-3 rounded-lg">
              <Calendar className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Hours</p>
              <p className="text-2xl">1,420</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Project Legend */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-3">
          <span className="text-sm text-muted-foreground mr-2">Projects:</span>
          {projects.map((project) => (
            <div key={project.id} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${project.color}`} />
              <span className="text-sm">{project.name}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Allocation Table */}
      <Card className="p-6 overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left pb-4 pr-4 min-w-[200px]">Resource</th>
              {weekDays.map((day) => (
                <th key={day} className="text-center pb-4 px-2 min-w-[120px]">
                  <div className="text-sm">{day}</div>
                </th>
              ))}
              <th className="text-center pb-4 px-2 min-w-[100px]">
                <div className="text-sm">Weekly Total</div>
              </th>
              <th className="text-center pb-4 px-2 min-w-[100px]">
                <div className="text-sm">Utilization</div>
              </th>
            </tr>
          </thead>
          <tbody>
            {resources.map((resource) => {
              const weeklyHours = calculateWeeklyHours(resource.id);
              const weeklyTarget = 40;

              return (
                <tr
                  key={resource.id}
                  className="border-b hover:bg-accent/50 transition-colors"
                >
                  <td className="py-4 pr-4">
                    <div>
                      <p className="font-medium">{resource.name}</p>
                      <p className="text-sm text-muted-foreground">{resource.role}</p>
                      <Badge variant="secondary" className="mt-1 text-xs">
                        {resource.team}
                      </Badge>
                    </div>
                  </td>

                  {weekDays.map((day) => {
                    const dayHours = calculateDailyHours(resource.id, day);
                    return (
                      <td key={day} className="px-2 py-4">
                        <div className="space-y-2">
                          {/* Project allocation inputs */}
                          <div className="flex flex-col gap-1">
                            <Select defaultValue="">
                              <SelectTrigger className="h-8 text-xs">
                                <SelectValue placeholder="Project" />
                              </SelectTrigger>
                              <SelectContent>
                                {projects.map((project) => (
                                  <SelectItem key={project.id} value={project.id}>
                                    <div className="flex items-center gap-2">
                                      <div className={`w-2 h-2 rounded-full ${project.color}`} />
                                      <span className="text-xs">{project.name}</span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Input
                              type="number"
                              placeholder="Hours"
                              className="h-8 text-xs text-center"
                              min="0"
                              max="8"
                              step="0.5"
                            />
                          </div>

                          {/* Daily total */}
                          <div
                            className={`text-center text-xs font-medium ${getUtilizationColor(dayHours)}`}
                          >
                            {dayHours > 0 && `${dayHours}h`}
                          </div>
                        </div>
                      </td>
                    );
                  })}

                  <td className="px-2 py-4 text-center">
                    <div className={`font-bold ${getUtilizationColor(weeklyHours, weeklyTarget)}`}>
                      {weeklyHours}h / {weeklyTarget}h
                    </div>
                  </td>

                  <td className="px-2 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div
                        className={`text-sm font-medium ${
                          resource.utilization >= 90 && resource.utilization <= 110
                            ? "text-green-600"
                            : resource.utilization > 110
                            ? "text-red-600"
                            : "text-amber-600"
                        }`}
                      >
                        {resource.utilization}%
                      </div>
                      <div
                        className={`w-2 h-2 rounded-full ${
                          resource.utilization >= 90 && resource.utilization <= 110
                            ? "bg-green-500"
                            : resource.utilization > 110
                            ? "bg-red-500"
                            : "bg-amber-500"
                        }`}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>

      {/* Utilization Guide */}
      <Card className="p-4">
        <div className="flex items-center gap-6 text-sm">
          <span className="text-muted-foreground">Utilization Threshold:</span>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full" />
            <span>90-110% (Optimal)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-amber-500 rounded-full" />
            <span>80-89% (Underutilized)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full" />
            <span>&gt;110% or &lt;80% (Action Needed)</span>
          </div>
        </div>
      </Card>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          💡 Target: 160 hours/month per resource (40 hours/week). Allocations automatically calculate
          project-wise and generate reports for capacity planning.
        </p>
      </div>
    </div>
  );
}
