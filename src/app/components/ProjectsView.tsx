import React, { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Search, Plus } from "lucide-react";
import { PROJECTS, type Project } from "../data/projects";

type WeekStatus = "green" | "amber" | "red" | "grey";

const TOTAL_WEEKS = 52;

function projectToCard(project: Project, weeks: WeekStatus[]) {
  return {
    id: project.id,
    name: project.name,
    pm: project.pm,
    dm: project.dm,
    resources: project.resources,
    startDate: project.startDate,
    weeks,
  };
}

const projects = PROJECTS.map((project) =>
  projectToCard(project, generateWeekStatuses(project.currentWeek, project.successRate)),
);

function generateWeekStatuses(count: number, successRate: number): WeekStatus[] {
  return Array.from({ length: TOTAL_WEEKS }, (_, i) => {
    if (i < count) {
      const rand = Math.random();
      if (rand < successRate) return "green";
      if (rand < successRate + 0.15) return "amber";
      return "red";
    }
    return "grey";
  });
}

interface ProjectsViewProps {
  onNewProject: () => void;
  onViewDetails: (projectId: number) => void;
}

export default function ProjectsView({ onNewProject, onViewDetails }: ProjectsViewProps) {
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Projects</h1>
          <p className="text-xs text-muted-foreground">Click on project to view details</p>
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
                onClick={() => onViewDetails(project.id)}
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
