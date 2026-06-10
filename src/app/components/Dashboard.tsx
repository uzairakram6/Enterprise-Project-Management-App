import React, { useState } from "react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Users, FolderKanban, AlertCircle, CheckCircle2, Search } from "lucide-react";
import { PROJECTS } from "../data/projects";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

const stats = [
  { label: "Total Projects", value: String(PROJECTS.length), icon: FolderKanban, trend: "+3 this month", color: "bg-blue-500" },
  { label: "Active Resources", value: "156", icon: Users, trend: "98% utilized", color: "bg-green-500" },
  { label: "On Track", value: String(PROJECTS.filter((p) => p.status === "green").length), icon: CheckCircle2, trend: "75% projects", color: "bg-green-500" },
  { label: "At Risk", value: String(PROJECTS.filter((p) => p.status !== "green").length), icon: AlertCircle, trend: "Need attention", color: "bg-amber-500" },
];

const allProjects = PROJECTS.map(({ name, pm, status, progress, team }) => ({
  name,
  pm,
  status,
  progress,
  team,
}));

interface DashboardProps {
  onViewProject?: (projectId: number) => void;
}

export default function Dashboard({ onViewProject }: DashboardProps = {}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredProjects = allProjects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-xs text-muted-foreground">T360 view of all projects and resources</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((stat, idx) => (
          <Card key={idx} className="p-3">
            <div className="flex items-center gap-3">
              <div className={`${stat.color} p-2 rounded-md flex-shrink-0`}>
                <stat.icon className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] uppercase text-muted-foreground tracking-wide">{stat.label}</p>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <p className="text-xl font-bold leading-none">{stat.value}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{stat.trend}</p>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Active Projects - Compact Grid View */}
      <Card className="p-3">
        <div className="flex items-center justify-between gap-4 mb-2.5">
          <h2 className="text-base font-semibold">Active Projects</h2>

          {/* Filters */}
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
            <Select value={statusFilter} onValueChange={setStatusFilter}>
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

        {filteredProjects.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            <p>No projects found matching your filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
            {filteredProjects.map((project, idx) => (
            <Card
              key={idx}
              className="p-2.5 hover:shadow-md transition-all cursor-pointer border-l-4 hover:scale-[1.01]"
              style={{
                borderLeftColor: project.status === 'green' ? '#22c55e' :
                                project.status === 'amber' ? '#f59e0b' : '#ef4444'
              }}
              onClick={() => onViewProject?.(idx + 1)}
            >
              <div className="space-y-1.5">
                <div className="flex items-start justify-between gap-1.5">
                  <h3 className="font-medium text-xs leading-tight truncate flex-1">{project.name}</h3>
                  <Badge variant="outline" className={`text-[9px] px-1 py-0 h-3.5 leading-none flex-shrink-0 ${
                    project.status === 'green' ? 'border-green-500 text-green-700 bg-green-50' :
                    project.status === 'amber' ? 'border-amber-500 text-amber-700 bg-amber-50' :
                    'border-red-500 text-red-700 bg-red-50'
                  }`}>
                    {project.status === 'green' ? 'On Track' :
                     project.status === 'amber' ? 'At Risk' : 'Delayed'}
                  </Badge>
                </div>

                <p className="text-[10px] text-muted-foreground">
                  PM: {project.pm} <span className="mx-1">•</span> {project.team} members
                </p>

                <div className="space-y-0.5">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{project.progress}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1">
                    <div
                      className={`h-1 rounded-full transition-all ${
                        project.status === 'green' ? 'bg-green-500' :
                        project.status === 'amber' ? 'bg-amber-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            </Card>
          ))}
          </div>
        )}
      </Card>
    </div>
  );
}
