import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Search, Plus, Filter, Calendar, FileText, Eye, BarChart3, ArrowLeft } from "lucide-react";

const projects = [
  {
    id: 1,
    name: "Multi-Tenancy Platform",
    pm: "Manohar",
    dm: "Aries",
    resources: 8,
    startDate: "2026-01-15",
    weeks: generateWeekStatuses(23, 0.85),
  },
  {
    id: 2,
    name: "Customer Portal Redesign",
    pm: "Aries",
    dm: "Khalid",
    resources: 6,
    startDate: "2026-02-01",
    weeks: generateWeekStatuses(20, 0.92),
  },
  {
    id: 3,
    name: "Mobile App Development",
    pm: "Uzair",
    dm: "Manohar",
    resources: 10,
    startDate: "2025-12-10",
    weeks: generateWeekStatuses(26, 0.68),
  },
  {
    id: 4,
    name: "Data Analytics Dashboard",
    pm: "Rohan",
    dm: "Aries",
    resources: 5,
    startDate: "2026-03-01",
    weeks: generateWeekStatuses(14, 0.78),
  },
  {
    id: 5,
    name: "API Integration Suite",
    pm: "Mahnoor",
    dm: "Khalid",
    resources: 7,
    startDate: "2026-02-15",
    weeks: generateWeekStatuses(17, 0.55),
  },
  {
    id: 6,
    name: "Cloud Migration",
    pm: "Sheroz",
    dm: "Manohar",
    resources: 12,
    startDate: "2025-11-20",
    weeks: generateWeekStatuses(30, 0.42),
  },
];

function generateWeekStatuses(count: number, successRate: number) {
  const statuses = ['green', 'amber', 'red', 'grey'];
  return Array.from({ length: 52 }, (_, i) => {
    if (i < count) {
      const rand = Math.random();
      if (rand < successRate) return 'green';
      if (rand < successRate + 0.15) return 'amber';
      return 'red';
    }
    return 'grey';
  });
}

function WeekBox({ status, week, onClick }: { status: string; week: number; onClick: () => void }) {
  const colors = {
    green: 'bg-green-500 hover:bg-green-600',
    amber: 'bg-amber-500 hover:bg-amber-600',
    red: 'bg-red-500 hover:bg-red-600',
    grey: 'bg-gray-200 hover:bg-gray-300',
  };

  // Only clickable if not grey (has data)
  const isClickable = status !== 'grey';

  return (
    <div
      className={`w-3 h-8 rounded-sm transition-colors ${
        isClickable ? `${colors[status as keyof typeof colors]} cursor-pointer` : 'bg-gray-200'
      }`}
      title={isClickable ? `Week ${week + 1}: ${status} - Click to view update` : `Week ${week + 1}: No data`}
      onClick={isClickable ? onClick : undefined}
    />
  );
}

interface ProjectsViewProps {
  onNewProject: () => void;
  onViewDetails: (projectId: number) => void;
  onViewReports: (projectId: number) => void;
  onWeekClick: (projectId: number, weekNumber: number) => void;
}

export default function ProjectsView({ onNewProject, onViewDetails, onViewReports, onWeekClick }: ProjectsViewProps) {
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedYear, setSelectedYear] = useState("2026");
  const [viewMode, setViewMode] = useState<"grid" | "timeline">("grid");

  const years = ["2024", "2025", "2026", "2027"];

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase());
    // For status filter, check the overall project status based on weeks
    const greenWeeks = project.weeks.filter(w => w === 'green').length;
    const amberWeeks = project.weeks.filter(w => w === 'amber').length;
    const redWeeks = project.weeks.filter(w => w === 'red').length;
    const totalWeeks = greenWeeks + amberWeeks + redWeeks;

    let projectStatus = 'green';
    if (totalWeeks > 0) {
      const greenPercent = (greenWeeks / totalWeeks) * 100;
      if (greenPercent >= 75) projectStatus = 'green';
      else if (greenPercent >= 50) projectStatus = 'amber';
      else projectStatus = 'red';
    }

    const matchesStatus = filterStatus === "all" || projectStatus === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getProjectStatus = (project: typeof projects[0]) => {
    const greenWeeks = project.weeks.filter(w => w === 'green').length;
    const amberWeeks = project.weeks.filter(w => w === 'amber').length;
    const redWeeks = project.weeks.filter(w => w === 'red').length;
    const totalWeeks = greenWeeks + amberWeeks + redWeeks;

    if (totalWeeks === 0) return 'grey';
    const greenPercent = (greenWeeks / totalWeeks) * 100;
    if (greenPercent >= 75) return 'green';
    if (greenPercent >= 50) return 'amber';
    return 'red';
  };

  const getProjectProgress = (project: typeof projects[0]) => {
    const completedWeeks = project.weeks.filter(w => w !== 'grey').length;
    return Math.round((completedWeeks / 52) * 100);
  };

  // If a project is selected, show timeline view
  if (selectedProject !== null) {
    const project = projects.find(p => p.id === selectedProject);
    if (!project) {
      setSelectedProject(null);
      return null;
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => setSelectedProject(null)} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Grid View
          </Button>
        </div>

        <Card className="p-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Project Info */}
            <div className="lg:w-64 flex-shrink-0">
              <h3 className="text-lg mb-2">{project.name}</h3>
              <div className="space-y-1 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span>PM:</span>
                  <span>{project.pm}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>DM:</span>
                  <span>{project.dm}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>Team:</span>
                  <Badge variant="secondary">{project.resources} members</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-3 h-3" />
                  <span>{new Date(project.startDate).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-2">
                <Button size="sm" onClick={() => onViewDetails(project.id)} className="gap-2">
                  <Eye className="w-4 h-4" />
                  View Details
                </Button>
                <Button size="sm" variant="outline" onClick={() => onViewReports(project.id)} className="gap-2">
                  <FileText className="w-4 h-4" />
                  View Reports
                </Button>
              </div>
            </div>

            {/* 52 Weeks Timeline */}
            <div className="flex-1">
              <div className="mb-3 flex items-center justify-between">
                <h4 className="text-sm">52 Week Timeline</h4>
                <div className="flex gap-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span>On Track</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-amber-500 rounded-full" />
                    <span>At Risk</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-red-500 rounded-full" />
                    <span>Delayed</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-gray-200 rounded-full" />
                    <span>Future</span>
                  </div>
                </div>
              </div>

              {/* Week boxes */}
              <div className="flex gap-1 flex-wrap">
                {project.weeks.map((status, idx) => (
                  <WeekBox
                    key={idx}
                    status={status}
                    week={idx}
                    onClick={() => onWeekClick(project.id, idx + 1)}
                  />
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Projects</h1>
          <p className="text-xs text-muted-foreground">Click on project to view 52-week timeline</p>
        </div>
        <Button onClick={onNewProject} className="gap-2 h-9">
          <Plus className="w-4 h-4" />
          New Project
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-3">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-base font-semibold">All Projects</h2>

          <div className="flex gap-2 max-w-xl">
            <div className="w-56 relative">
              <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 h-8 text-sm"
              />
            </div>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-24 h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-36 h-8 text-sm">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                <SelectItem value="green">On Track</SelectItem>
                <SelectItem value="amber">At Risk</SelectItem>
                <SelectItem value="red">Delayed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Projects Grid View */}
      {filteredProjects.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground text-sm">
          <p>No projects found matching your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
          {filteredProjects.map((project) => {
            const status = getProjectStatus(project);
            const progress = getProjectProgress(project);

            return (
              <Card
                key={project.id}
                className="p-2.5 hover:shadow-md transition-all cursor-pointer border-l-4 hover:scale-[1.01]"
                style={{
                  borderLeftColor: status === 'green' ? '#22c55e' :
                                  status === 'amber' ? '#f59e0b' : '#ef4444'
                }}
                onClick={() => setSelectedProject(project.id)}
              >
                <div className="space-y-1.5">
                  <div className="flex items-start justify-between gap-1.5">
                    <h3 className="font-medium text-xs leading-tight truncate flex-1">{project.name}</h3>
                    <Badge variant="outline" className={`text-[9px] px-1 py-0 h-3.5 leading-none flex-shrink-0 ${
                      status === 'green' ? 'border-green-500 text-green-700 bg-green-50' :
                      status === 'amber' ? 'border-amber-500 text-amber-700 bg-amber-50' :
                      'border-red-500 text-red-700 bg-red-50'
                    }`}>
                      {status === 'green' ? 'On Track' :
                       status === 'amber' ? 'At Risk' : 'Delayed'}
                    </Badge>
                  </div>

                  <p className="text-[10px] text-muted-foreground">
                    PM: {project.pm} <span className="mx-1">•</span> DM: {project.dm} <span className="mx-1">•</span> {project.resources} members
                  </p>

                  <div className="space-y-0.5">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{progress}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1">
                      <div
                        className={`h-1 rounded-full transition-all ${
                          status === 'green' ? 'bg-green-500' :
                          status === 'amber' ? 'bg-amber-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
