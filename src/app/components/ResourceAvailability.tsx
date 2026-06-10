import React, { useState } from "react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Calendar, User, Search, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { PROJECTS } from "../data/projects";

interface Resource {
  id: number;
  name: string;
  role: string;
  currentProject: string | null;
  availability: "available" | "partial" | "busy";
  freeFrom: string | null;
  utilizationPercent: number;
  upcomingAvailability: {
    date: string;
    hoursAvailable: number;
  }[];
}

const allResources: Resource[] = [
  {
    id: 1,
    name: "Ali Hassan",
    role: "Senior Developer",
    currentProject: PROJECTS[0].name,
    availability: "busy",
    freeFrom: "2026-06-15",
    utilizationPercent: 100,
    upcomingAvailability: [
      { date: "2026-06-10", hoursAvailable: 0 },
      { date: "2026-06-11", hoursAvailable: 0 },
      { date: "2026-06-12", hoursAvailable: 0 },
      { date: "2026-06-15", hoursAvailable: 40 },
    ],
  },
  {
    id: 2,
    name: "Sara Ahmed",
    role: "Full Stack Developer",
    currentProject: PROJECTS[1].name,
    availability: "partial",
    freeFrom: null,
    utilizationPercent: 75,
    upcomingAvailability: [
      { date: "2026-06-10", hoursAvailable: 10 },
      { date: "2026-06-11", hoursAvailable: 10 },
      { date: "2026-06-12", hoursAvailable: 10 },
      { date: "2026-06-13", hoursAvailable: 10 },
    ],
  },
  {
    id: 3,
    name: "Usman Khan",
    role: "Backend Developer",
    currentProject: null,
    availability: "available",
    freeFrom: "2026-06-09",
    utilizationPercent: 0,
    upcomingAvailability: [
      { date: "2026-06-10", hoursAvailable: 40 },
      { date: "2026-06-11", hoursAvailable: 40 },
      { date: "2026-06-12", hoursAvailable: 40 },
      { date: "2026-06-13", hoursAvailable: 40 },
    ],
  },
  {
    id: 4,
    name: "Fatima Malik",
    role: "Frontend Developer",
    currentProject: PROJECTS[2].name,
    availability: "busy",
    freeFrom: "2026-06-20",
    utilizationPercent: 100,
    upcomingAvailability: [
      { date: "2026-06-10", hoursAvailable: 0 },
      { date: "2026-06-11", hoursAvailable: 0 },
      { date: "2026-06-12", hoursAvailable: 0 },
      { date: "2026-06-20", hoursAvailable: 40 },
    ],
  },
  {
    id: 5,
    name: "Ahmed Raza",
    role: "DevOps Engineer",
    currentProject: PROJECTS[5].name,
    availability: "partial",
    freeFrom: null,
    utilizationPercent: 60,
    upcomingAvailability: [
      { date: "2026-06-10", hoursAvailable: 16 },
      { date: "2026-06-11", hoursAvailable: 16 },
      { date: "2026-06-12", hoursAvailable: 16 },
      { date: "2026-06-13", hoursAvailable: 16 },
    ],
  },
  {
    id: 6,
    name: "Zainab Ali",
    role: "UI/UX Designer",
    currentProject: null,
    availability: "available",
    freeFrom: "2026-06-09",
    utilizationPercent: 0,
    upcomingAvailability: [
      { date: "2026-06-10", hoursAvailable: 40 },
      { date: "2026-06-11", hoursAvailable: 40 },
      { date: "2026-06-12", hoursAvailable: 40 },
      { date: "2026-06-13", hoursAvailable: 40 },
    ],
  },
  {
    id: 7,
    name: "Hassan Malik",
    role: "Frontend Developer",
    currentProject: PROJECTS[4].name,
    availability: "busy",
    freeFrom: "2026-06-18",
    utilizationPercent: 95,
    upcomingAvailability: [
      { date: "2026-06-10", hoursAvailable: 2 },
      { date: "2026-06-11", hoursAvailable: 2 },
      { date: "2026-06-12", hoursAvailable: 2 },
      { date: "2026-06-18", hoursAvailable: 40 },
    ],
  },
  {
    id: 8,
    name: "Omar Farooq",
    role: "QA Engineer",
    currentProject: PROJECTS[3].name,
    availability: "partial",
    freeFrom: null,
    utilizationPercent: 50,
    upcomingAvailability: [
      { date: "2026-06-10", hoursAvailable: 20 },
      { date: "2026-06-11", hoursAvailable: 20 },
      { date: "2026-06-12", hoursAvailable: 20 },
      { date: "2026-06-13", hoursAvailable: 20 },
    ],
  },
];

export default function ResourceAvailability() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAvailability, setFilterAvailability] = useState("all");
  const [filterRole, setFilterRole] = useState("all");

  const filteredResources = allResources.filter((resource) => {
    const matchesSearch = resource.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAvailability = filterAvailability === "all" || resource.availability === filterAvailability;
    const matchesRole = filterRole === "all" || resource.role === filterRole;
    return matchesSearch && matchesAvailability && matchesRole;
  });

  const availableNow = allResources.filter((r) => r.availability === "available").length;
  const partiallyAvailable = allResources.filter((r) => r.availability === "partial").length;
  const fullyBusy = allResources.filter((r) => r.availability === "busy").length;

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case "available":
        return "bg-green-500";
      case "partial":
        return "bg-amber-500";
      case "busy":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getAvailabilityLabel = (availability: string) => {
    switch (availability) {
      case "available":
        return "Available Now";
      case "partial":
        return "Partially Available";
      case "busy":
        return "Fully Booked";
      default:
        return "Unknown";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl">Resource Availability</h1>
          <p className="text-muted-foreground mt-1">
            Find available resources for new projects
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-3 rounded-lg">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Resources</p>
              <p className="text-2xl font-bold">{allResources.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-3 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Available Now</p>
              <p className="text-2xl font-bold text-green-500">{availableNow}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="bg-amber-100 p-3 rounded-lg">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Partial</p>
              <p className="text-2xl font-bold text-amber-500">{partiallyAvailable}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="bg-red-100 p-3 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Fully Busy</p>
              <p className="text-2xl font-bold text-red-500">{fullyBusy}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterAvailability} onValueChange={setFilterAvailability}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Filter by availability" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Availability</SelectItem>
              <SelectItem value="available">Available Now</SelectItem>
              <SelectItem value="partial">Partially Available</SelectItem>
              <SelectItem value="busy">Fully Busy</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterRole} onValueChange={setFilterRole}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="Senior Developer">Senior Developer</SelectItem>
              <SelectItem value="Full Stack Developer">Full Stack Developer</SelectItem>
              <SelectItem value="Backend Developer">Backend Developer</SelectItem>
              <SelectItem value="Frontend Developer">Frontend Developer</SelectItem>
              <SelectItem value="DevOps Engineer">DevOps Engineer</SelectItem>
              <SelectItem value="UI/UX Designer">UI/UX Designer</SelectItem>
              <SelectItem value="QA Engineer">QA Engineer</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Resources List */}
      <div className="space-y-4">
        {filteredResources.map((resource) => (
          <Card key={resource.id} className="p-6">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Resource Info */}
              <div className="lg:w-64 flex-shrink-0">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold">
                      {resource.name.split(" ").map((n) => n[0]).join("")}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-lg">{resource.name}</h3>
                    <p className="text-sm text-muted-foreground">{resource.role}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${getAvailabilityColor(resource.availability)}`} />
                    <span className="text-sm font-medium">{getAvailabilityLabel(resource.availability)}</span>
                  </div>

                  {resource.currentProject && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Current Project:</span>
                      <p className="font-medium">{resource.currentProject}</p>
                    </div>
                  )}

                  {resource.freeFrom && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Free From:</span>
                      <p className="font-medium flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(resource.freeFrom).toLocaleDateString()}
                      </p>
                    </div>
                  )}

                  <div className="text-sm">
                    <span className="text-muted-foreground">Utilization:</span>
                    <p className="font-medium">{resource.utilizationPercent}%</p>
                  </div>
                </div>
              </div>

              {/* Upcoming Availability */}
              <div className="flex-1">
                <h4 className="text-sm font-medium mb-3">Next 7 Days Availability</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {resource.upcomingAvailability.map((day, idx) => (
                    <Card key={idx} className={`p-3 ${day.hoursAvailable === 0 ? 'bg-red-50 border-red-200' : day.hoursAvailable >= 40 ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
                      <p className="text-xs text-muted-foreground mb-1">
                        {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </p>
                      <div className="flex items-center gap-1">
                        <Clock className={`w-4 h-4 ${day.hoursAvailable === 0 ? 'text-red-600' : day.hoursAvailable >= 40 ? 'text-green-600' : 'text-amber-600'}`} />
                        <span className={`font-bold ${day.hoursAvailable === 0 ? 'text-red-600' : day.hoursAvailable >= 40 ? 'text-green-600' : 'text-amber-600'}`}>
                          {day.hoursAvailable}h
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {day.hoursAvailable === 0 ? 'Busy' : day.hoursAvailable >= 40 ? 'Free' : 'Partial'}
                      </p>
                    </Card>
                  ))}
                </div>

                <div className="mt-4 flex gap-2">
                  {resource.availability === "available" && (
                    <Button size="sm">Assign to Project</Button>
                  )}
                  {resource.availability === "partial" && (
                    <Button size="sm" variant="outline">Request Allocation</Button>
                  )}
                  {resource.availability === "busy" && resource.freeFrom && (
                    <Button size="sm" variant="outline">Reserve for {new Date(resource.freeFrom).toLocaleDateString()}</Button>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="flex gap-3">
          <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-blue-900">
              <strong>Planning Tip:</strong> Green indicates full availability (40h/week), Amber shows partial availability,
              and Red means fully booked. Reserve resources in advance for upcoming projects.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
