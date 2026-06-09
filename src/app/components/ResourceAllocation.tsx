import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Users,
  Calendar,
  Copy,
  Save,
  TrendingUp,
  AlertCircle,
  Plus,
  Trash2,
} from "lucide-react";
import { cn } from "./ui/utils";

const STORAGE_KEY = "resource-allocations";

const resources = [
  { id: 1, name: "Ahmed Khan", role: "Senior Developer", team: "Engineering" },
  { id: 2, name: "Sarah Ali", role: "Full Stack Developer", team: "Engineering" },
  { id: 3, name: "Hassan Malik", role: "Frontend Developer", team: "Engineering" },
  { id: 4, name: "Fatima Noor", role: "Backend Developer", team: "Engineering" },
  { id: 5, name: "Omar Farooq", role: "DevOps Engineer", team: "Engineering" },
  { id: 6, name: "Aisha Rahman", role: "QA Engineer", team: "Quality" },
  { id: 7, name: "Bilal Ahmed", role: "UI/UX Designer", team: "Design" },
  { id: 8, name: "Zainab Hussain", role: "Senior Developer", team: "Engineering" },
  { id: 9, name: "Usman Tariq", role: "Full Stack Developer", team: "Engineering" },
  { id: 10, name: "Maryam Saeed", role: "Project Manager", team: "Management" },
];

import { PROJECTS } from "../data/projects";

const projects = PROJECTS.slice(0, 6).map((project, index) => ({
  id: ["sumhuman", "gts", "bilingual", "friday", "cis-ca", "dmg"][index],
  name: project.name,
  color: ["bg-blue-500", "bg-green-500", "bg-purple-500", "bg-amber-500", "bg-red-500", "bg-cyan-500"][index],
}));

const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"] as const;
const WEEKLY_TARGET = 40;

interface Allocation {
  id: string;
  project: string;
  hours: number;
}

type DayAllocations = Record<string, Allocation[]>;
type ResourceAllocations = Record<number, DayAllocations>;
type WeekAllocations = Record<string, ResourceAllocations>;

function createAllocation(project = "", hours = 0): Allocation {
  return { id: crypto.randomUUID(), project, hours };
}

function loadAllocations(): WeekAllocations {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return {};
}

function saveAllocations(data: WeekAllocations) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

function getUtilizationColor(hours: number, target: number) {
  const pct = target > 0 ? (hours / target) * 100 : 0;
  if (pct >= 90 && pct <= 110) return "text-green-600";
  if (pct >= 80 && pct < 90) return "text-amber-600";
  if (pct > 110) return "text-red-600";
  return "text-muted-foreground";
}

function getUtilizationDot(pct: number) {
  if (pct >= 90 && pct <= 110) return "bg-green-500";
  if (pct > 110) return "bg-red-500";
  if (pct >= 80) return "bg-amber-500";
  return "bg-gray-400";
}

export default function ResourceAllocation() {
  const [selectedWeek, setSelectedWeek] = useState("23");
  const [allWeeks, setAllWeeks] = useState<WeekAllocations>(loadAllocations);

  const weekData = allWeeks[selectedWeek] ?? {};

  const persistWeek = (resourceData: ResourceAllocations) => {
    setAllWeeks((prev) => {
      const next = { ...prev, [selectedWeek]: resourceData };
      saveAllocations(next);
      return next;
    });
  };

  const getDaySlots = (resourceId: number, day: string): Allocation[] => {
    return weekData[resourceId]?.[day] ?? [];
  };

  const setDaySlots = (resourceId: number, day: string, slots: Allocation[]) => {
    const resourceDays = { ...(weekData[resourceId] ?? {}), [day]: slots };
    persistWeek({ ...weekData, [resourceId]: resourceDays });
  };

  const initDay = (resourceId: number, day: string) => {
    setDaySlots(resourceId, day, [createAllocation()]);
  };

  const updateSlot = (
    resourceId: number,
    day: string,
    slotId: string,
    updates: Partial<Allocation>
  ) => {
    const existing = getDaySlots(resourceId, day);
    const slots =
      existing.length === 0
        ? [{ ...createAllocation(), ...updates }]
        : existing.map((s) => (s.id === slotId ? { ...s, ...updates } : s));
    setDaySlots(resourceId, day, slots);
  };

  const addSlot = (resourceId: number, day: string) => {
    const slots = [...getDaySlots(resourceId, day), createAllocation()];
    setDaySlots(resourceId, day, slots);
  };

  const removeSlot = (resourceId: number, day: string, slotId: string) => {
    const slots = getDaySlots(resourceId, day).filter((s) => s.id !== slotId);
    setDaySlots(resourceId, day, slots);
  };

  const calculateDailyHours = (resourceId: number, day: string) => {
    return getDaySlots(resourceId, day).reduce((sum, a) => sum + (a.hours || 0), 0);
  };

  const calculateWeeklyHours = (resourceId: number) => {
    return weekDays.reduce((sum, day) => sum + calculateDailyHours(resourceId, day), 0);
  };

  const stats = useMemo(() => {
    let totalHours = 0;
    let overAllocated = 0;
    let utilSum = 0;

    resources.forEach((r) => {
      const weekly = calculateWeeklyHours(r.id);
      totalHours += weekly;
      const pct = (weekly / WEEKLY_TARGET) * 100;
      utilSum += pct;
      if (pct > 110) overAllocated++;
    });

    return {
      totalHours,
      overAllocated,
      avgUtilization: Math.round(utilSum / resources.length),
    };
  }, [allWeeks, selectedWeek]);

  const copyFromLastWeek = () => {
    const prevWeek = String(Number(selectedWeek) - 1);
    const prevData = allWeeks[prevWeek];
    if (!prevData) {
      toast.error(`No data found for Week ${prevWeek}`);
      return;
    }
    persistWeek(JSON.parse(JSON.stringify(prevData)));
    toast.success(`Copied allocations from Week ${prevWeek}`);
  };

  const handleSave = () => {
    saveAllocations(allWeeks);
    toast.success(`Allocations saved for Week ${selectedWeek}`);
  };

  const renderDayCell = (resourceId: number, day: string) => {
    const slots = getDaySlots(resourceId, day);

    if (slots.length === 0) {
      return (
        <td key={day} className="px-1 py-2 align-top border-l border-border/40">
          <div className="min-w-[148px] flex flex-col items-center">
            <Button
              variant="outline"
              size="sm"
              className="h-7 w-full text-[10px] gap-1 border-dashed"
              onClick={() => initDay(resourceId, day)}
            >
              <Plus className="w-3 h-3" />
              Assign
            </Button>
          </div>
        </td>
      );
    }

    return (
      <td key={day} className="px-1 py-2 align-top border-l border-border/40">
        <div className="space-y-1 min-w-[148px]">
          {slots.map((slot, idx) => {
            const projectMeta = projects.find((p) => p.id === slot.project);
            return (
              <div
                key={slot.id}
                className="group relative rounded border border-border/60 bg-background p-1"
              >
                <div className="flex items-center gap-1">
                  <Select
                    value={slot.project || undefined}
                    onValueChange={(val) => updateSlot(resourceId, day, slot.id, { project: val })}
                  >
                    <SelectTrigger className="h-6 text-[10px] px-1.5 border-0 shadow-none bg-muted/40 flex-1 min-w-0">
                      <SelectValue placeholder="Project">
                        {projectMeta && (
                          <span className="flex items-center gap-1 truncate">
                            <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", projectMeta.color)} />
                            <span className="truncate">{projectMeta.name}</span>
                          </span>
                        )}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((project) => (
                        <SelectItem key={project.id} value={project.id} className="text-xs">
                          <span className="flex items-center gap-1.5">
                            <span className={cn("w-2 h-2 rounded-full", project.color)} />
                            {project.name}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Input
                    type="number"
                    placeholder="h"
                    className="h-6 w-10 text-[10px] text-center px-0.5 shrink-0"
                    min={0}
                    max={8}
                    step={0.5}
                    value={slot.hours || ""}
                    onChange={(e) =>
                      updateSlot(resourceId, day, slot.id, {
                        hours: parseFloat(e.target.value) || 0,
                      })
                    }
                  />

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 shrink-0 text-red-400 hover:text-red-600 hover:bg-red-50"
                    onClick={() => removeSlot(resourceId, day, slot.id)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>

                {idx === slots.length - 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 w-full text-[10px] text-muted-foreground hover:text-primary gap-0.5 px-1"
                    onClick={() => addSlot(resourceId, day)}
                  >
                    <Plus className="w-2.5 h-2.5" />
                    Add
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </td>
    );
  };

  return (
    <div className="space-y-4 text-xs">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Resource Allocation</h1>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Weekly project allocation — assign multiple projects per day
          </p>
        </div>
      </div>

      {/* Controls */}
      <Card className="p-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="flex items-center gap-2 flex-1">
            <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
            <Select value={selectedWeek} onValueChange={setSelectedWeek}>
              <SelectTrigger className="w-full md:w-56 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="21" className="text-xs">Week 21 (May 19–25, 2026)</SelectItem>
                <SelectItem value="22" className="text-xs">Week 22 (May 26–Jun 1, 2026)</SelectItem>
                <SelectItem value="23" className="text-xs">Week 23 (Jun 2–8, 2026)</SelectItem>
                <SelectItem value="24" className="text-xs">Week 24 (Jun 9–15, 2026)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={copyFromLastWeek} className="gap-1.5 h-8 text-xs">
              <Copy className="w-3 h-3" />
              Copy Last Week
            </Button>
            <Button size="sm" onClick={handleSave} className="gap-1.5 h-8 text-xs">
              <Save className="w-3 h-3" />
              Save
            </Button>
          </div>
        </div>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-md bg-blue-100">
              <Users className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">Total Resources</p>
              <p className="text-base font-semibold leading-tight">{resources.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-md bg-green-100">
              <TrendingUp className="w-3.5 h-3.5 text-green-600" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">Avg Utilization</p>
              <p className="text-base font-semibold leading-tight">{stats.avgUtilization}%</p>
            </div>
          </div>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-md bg-amber-100">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">Over-allocated</p>
              <p className="text-base font-semibold leading-tight">{stats.overAllocated}</p>
            </div>
          </div>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-md bg-purple-100">
              <Calendar className="w-3.5 h-3.5 text-purple-600" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">Total Hours</p>
              <p className="text-base font-semibold leading-tight">{stats.totalHours}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Project Legend */}
      <Card className="p-2.5">
        <div className="flex flex-wrap gap-x-4 gap-y-1 items-center">
          <span className="text-[10px] text-muted-foreground">Projects:</span>
          {projects.map((project) => (
            <div key={project.id} className="flex items-center gap-1.5">
              <div className={cn("w-2 h-2 rounded-full", project.color)} />
              <span className="text-[10px]">{project.name}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Allocation Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="text-left py-2 px-3 font-medium text-[11px] min-w-[140px] sticky left-0 bg-muted/30 z-10">
                  Resource
                </th>
                {weekDays.map((day) => (
                  <th key={day} className="text-center py-2 px-1 font-medium text-[11px] min-w-[148px]">
                    {day.slice(0, 3)}
                  </th>
                ))}
                <th className="text-center py-2 px-2 font-medium text-[11px] min-w-[72px]">Total</th>
                <th className="text-center py-2 px-2 font-medium text-[11px] min-w-[64px]">Util %</th>
              </tr>
            </thead>
            <tbody>
              {resources.map((resource) => {
                const weeklyHours = calculateWeeklyHours(resource.id);
                const utilPct = Math.round((weeklyHours / WEEKLY_TARGET) * 100);

                return (
                  <tr key={resource.id} className="border-b hover:bg-accent/30 transition-colors">
                    <td className="py-2 px-3 sticky left-0 bg-card z-10 border-r border-border/40">
                      <p className="font-medium text-[11px] leading-tight">{resource.name}</p>
                      <p className="text-[10px] text-muted-foreground leading-tight">{resource.role}</p>
                      <Badge variant="secondary" className="mt-0.5 text-[9px] px-1 py-0 h-4">
                        {resource.team}
                      </Badge>
                    </td>

                    {weekDays.map((day) => renderDayCell(resource.id, day))}

                    <td className="px-2 py-2 text-center align-middle">
                      <span
                        className={cn(
                          "text-[11px] font-semibold",
                          getUtilizationColor(weeklyHours, WEEKLY_TARGET)
                        )}
                      >
                        {weeklyHours}h
                      </span>
                      <span className="text-[10px] text-muted-foreground">/{WEEKLY_TARGET}h</span>
                    </td>

                    <td className="px-2 py-2 text-center align-middle">
                      <div className="flex items-center justify-center gap-1">
                        <span
                          className={cn(
                            "text-[11px] font-medium",
                            getUtilizationColor(weeklyHours, WEEKLY_TARGET)
                          )}
                        >
                          {utilPct}%
                        </span>
                        <div className={cn("w-1.5 h-1.5 rounded-full", getUtilizationDot(utilPct))} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Utilization Guide */}
      <Card className="p-2.5">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-[10px]">
          <span className="text-muted-foreground">Threshold:</span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 bg-green-500 rounded-full" /> 90–110% Optimal
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 bg-amber-500 rounded-full" /> 80–89% Under
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 bg-red-500 rounded-full" /> &gt;110% Over
          </span>
        </div>
      </Card>
    </div>
  );
}
