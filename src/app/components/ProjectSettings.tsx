import { useState } from "react";
import { format } from "date-fns";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Switch } from "./ui/switch";
import { Separator } from "./ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { toast } from "sonner";
import { DateField } from "./project/DateField";
import {
  ArrowLeft,
  Plus,
  X,
  Info,
  CalendarOff,
  History,
  Flag,
  Workflow,
} from "lucide-react";

interface ProjectSettingsProps {
  onBack: () => void;
  projectName?: string;
  onManageWorkflows?: () => void;
}

interface Holiday {
  id: number;
  date: Date;
  name: string;
  recurring: boolean;
}

interface ExceptionPeriod {
  id: number;
  start: Date;
  end: Date;
  reason: string;
}

let idCounter = 1000;
const nextId = () => ++idCounter;

const INITIAL_HOLIDAYS: Holiday[] = [
  { id: 1, date: new Date(2026, 0, 1), name: "New Year's Day", recurring: true },
  { id: 2, date: new Date(2026, 2, 23), name: "Pakistan Day", recurring: true },
  { id: 3, date: new Date(2026, 2, 21), name: "Eid ul-Fitr", recurring: false },
  { id: 4, date: new Date(2026, 7, 14), name: "Independence Day", recurring: true },
];

const INITIAL_EXCEPTIONS: ExceptionPeriod[] = [
  {
    id: 5,
    start: new Date(2026, 5, 29),
    end: new Date(2026, 6, 3),
    reason: "Company-wide engineering offsite",
  },
];

function holidayOrder(date: Date) {
  return date.getMonth() * 100 + date.getDate();
}

export default function ProjectSettings({
  onBack,
  projectName = "Multi-Tenancy Platform",
  onManageWorkflows,
}: ProjectSettingsProps) {
  const [tab, setTab] = useState("general");

  // General
  const [name, setName] = useState(projectName);
  const [code, setCode] = useState("MTP-2026");
  const [description, setDescription] = useState(
    "Tenant isolation, role-based access, and automated provisioning for enterprise customers.",
  );
  const [status, setStatus] = useState("active");
  const [frequency, setFrequency] = useState("weekly");
  const [updateDay, setUpdateDay] = useState("friday");

  // Holidays
  const [skipUpdatesOnHolidays, setSkipUpdatesOnHolidays] = useState(true);
  const [holidays, setHolidays] = useState<Holiday[]>(INITIAL_HOLIDAYS);
  const [holidayDate, setHolidayDate] = useState<Date | undefined>();
  const [holidayName, setHolidayName] = useState("");
  const [holidayRecurring, setHolidayRecurring] = useState(false);

  // Exceptions / baseline
  const [isOngoing, setIsOngoing] = useState(false);
  const [baselineDate, setBaselineDate] = useState<Date | undefined>();
  const [completedPercent, setCompletedPercent] = useState(0);
  const [trackingStart, setTrackingStart] = useState<Date | undefined>(new Date());
  const [exceptions, setExceptions] = useState<ExceptionPeriod[]>(INITIAL_EXCEPTIONS);
  const [exStart, setExStart] = useState<Date | undefined>();
  const [exEnd, setExEnd] = useState<Date | undefined>();
  const [exReason, setExReason] = useState("");

  const sortedHolidays = [...holidays].sort(
    (a, b) => holidayOrder(a.date) - holidayOrder(b.date),
  );

  const addHoliday = () => {
    if (!holidayDate || !holidayName.trim()) return;
    setHolidays([
      ...holidays,
      { id: nextId(), date: holidayDate, name: holidayName.trim(), recurring: holidayRecurring },
    ]);
    setHolidayDate(undefined);
    setHolidayName("");
    setHolidayRecurring(false);
    toast.success("Holiday added");
  };

  const removeHoliday = (id: number) => {
    setHolidays(holidays.filter((h) => h.id !== id));
  };

  const addException = () => {
    if (!exStart || !exEnd || !exReason.trim()) return;
    if (exEnd < exStart) {
      toast.error("End date must be after the start date");
      return;
    }
    setExceptions([
      ...exceptions,
      { id: nextId(), start: exStart, end: exEnd, reason: exReason.trim() },
    ]);
    setExStart(undefined);
    setExEnd(undefined);
    setExReason("");
    toast.success("Exception period added");
  };

  const removeException = (id: number) => {
    setExceptions(exceptions.filter((e) => e.id !== id));
  };

  const handleSave = () => {
    toast.success("Settings saved", {
      description: `Changes to "${name}" have been applied.`,
    });
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Project
        </Button>
      </div>

      <div>
        <h1 className="text-3xl">Project settings</h1>
        <p className="mt-1 text-muted-foreground">
          Configure {name} beyond the basics. Each section is small and optional.
        </p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="holidays">Holidays</TabsTrigger>
          <TabsTrigger value="exceptions">Exceptions</TabsTrigger>
        </TabsList>

        {/* GENERAL */}
        <TabsContent value="general" className="mt-6 space-y-5">
          <Card className="p-6">
            <h2 className="text-lg">Project details</h2>
            <Separator className="my-4" />
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="set-name">Project name</Label>
                  <Input id="set-name" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="set-code">Project code</Label>
                  <Input id="set-code" value={code} onChange={(e) => setCode(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="set-desc">Description</Label>
                <Textarea
                  id="set-desc"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg">Status and update cadence</h2>
            <Separator className="my-4" />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="on-hold">On Hold</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Update frequency</Label>
                <Select value={frequency} onValueChange={setFrequency}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="biweekly">Bi-weekly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Update day</Label>
                <Select value={updateDay} onValueChange={setUpdateDay}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monday">Monday</SelectItem>
                    <SelectItem value="tuesday">Tuesday</SelectItem>
                    <SelectItem value="wednesday">Wednesday</SelectItem>
                    <SelectItem value="thursday">Thursday</SelectItem>
                    <SelectItem value="friday">Friday</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          {onManageWorkflows && (
            <Card className="p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <Workflow className="mt-0.5 h-5 w-5 text-primary" />
                  <div>
                    <h3 className="text-base">Automation workflows</h3>
                    <p className="text-sm text-muted-foreground">
                      Reminders, escalations, and reports are managed separately.
                    </p>
                  </div>
                </div>
                <Button variant="outline" onClick={onManageWorkflows} className="shrink-0">
                  Open Workflow Settings
                </Button>
              </div>
            </Card>
          )}
        </TabsContent>

        {/* HOLIDAYS */}
        <TabsContent value="holidays" className="mt-6 space-y-5">
          <Card className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <CalendarOff className="mt-0.5 h-5 w-5 text-primary" />
                <div>
                  <h2 className="text-lg">Updates optional on holidays</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    When on, holidays below are excluded from update reminders, compliance, and
                    escalations. Nobody is marked late for a day off.
                  </p>
                </div>
              </div>
              <Switch checked={skipUpdatesOnHolidays} onCheckedChange={setSkipUpdatesOnHolidays} />
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg">Add a holiday</h2>
            <Separator className="my-4" />
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
              <DateField
                label="Date"
                value={holidayDate}
                onChange={setHolidayDate}
                className="lg:w-48"
              />
              <div className="flex-1 space-y-2">
                <Label htmlFor="holiday-name">Name</Label>
                <Input
                  id="holiday-name"
                  placeholder="e.g., Eid ul-Adha"
                  value={holidayName}
                  onChange={(e) => setHolidayName(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2 pb-2 lg:pb-2.5">
                <Switch
                  id="holiday-recurring"
                  checked={holidayRecurring}
                  onCheckedChange={setHolidayRecurring}
                />
                <Label htmlFor="holiday-recurring" className="cursor-pointer whitespace-nowrap">
                  Repeats yearly
                </Label>
              </div>
              <Button
                onClick={addHoliday}
                disabled={!holidayDate || !holidayName.trim()}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Add
              </Button>
            </div>
          </Card>

          <Card className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg">Holiday calendar</h2>
              <Badge variant="secondary">{holidays.length} days</Badge>
            </div>

            {sortedHolidays.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-10 text-center">
                <CalendarOff className="h-8 w-8 text-muted-foreground" />
                <p className="mt-3 text-sm font-medium">No holidays added</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Add company or project holidays so updates are not required on those days.
                </p>
              </div>
            ) : (
              <div className="divide-y rounded-lg border">
                {sortedHolidays.map((holiday) => (
                  <div key={holiday.id} className="flex items-center gap-3 px-4 py-3">
                    <div className="flex h-10 w-10 flex-col items-center justify-center rounded-lg bg-muted text-center leading-none">
                      <span className="text-[10px] uppercase text-muted-foreground">
                        {format(holiday.date, "MMM")}
                      </span>
                      <span className="text-sm font-medium">{format(holiday.date, "d")}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{holiday.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(holiday.date, "EEEE, MMM d, yyyy")}
                      </p>
                    </div>
                    {holiday.recurring && <Badge variant="outline">Yearly</Badge>}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => removeHoliday(holiday.id)}
                      aria-label={`Remove ${holiday.name}`}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>

        {/* EXCEPTIONS */}
        <TabsContent value="exceptions" className="mt-6 space-y-5">
          <Card className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <Flag className="mt-0.5 h-5 w-5 text-primary" />
                <div>
                  <h2 className="text-lg">Already in progress</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Turn this on for projects that started before onboarding. Set a baseline so the
                    system does not ask for historical updates or flag the project as behind.
                  </p>
                </div>
              </div>
              <Switch checked={isOngoing} onCheckedChange={setIsOngoing} />
            </div>

            {isOngoing && (
              <>
                <Separator className="my-5" />
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <DateField
                    label="Work completed up to"
                    value={baselineDate}
                    onChange={setBaselineDate}
                  />
                  <div className="space-y-2">
                    <Label htmlFor="completed-pct">Already completed (%)</Label>
                    <Input
                      id="completed-pct"
                      type="number"
                      min={0}
                      max={100}
                      value={completedPercent}
                      onChange={(e) =>
                        setCompletedPercent(
                          Math.min(100, Math.max(0, Number(e.target.value))),
                        )
                      }
                    />
                  </div>
                  <DateField
                    label="Start tracking from"
                    value={trackingStart}
                    onChange={setTrackingStart}
                  />
                </div>

                <div className="mt-4 flex gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4">
                  <Info className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
                  <p className="text-sm text-blue-900">
                    Weeks before the baseline are marked as pre-onboarding and excluded from update
                    requirements and escalations. Tracking starts from{" "}
                    <span className="font-medium">
                      {trackingStart ? format(trackingStart, "MMM d, yyyy") : "today"}
                    </span>
                    , so the project can go live without blocking the system.
                  </p>
                </div>
              </>
            )}
          </Card>

          <Card className="p-6">
            <div className="flex items-start gap-3">
              <History className="mt-0.5 h-5 w-5 text-primary" />
              <div>
                <h2 className="text-lg">Exception periods</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Add date ranges when updates are not required, such as a planned pause or a
                  company shutdown.
                </p>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
              <DateField
                label="From"
                value={exStart}
                onChange={setExStart}
                className="lg:w-44"
              />
              <DateField label="To" value={exEnd} onChange={setExEnd} className="lg:w-44" />
              <div className="flex-1 space-y-2">
                <Label htmlFor="ex-reason">Reason</Label>
                <Input
                  id="ex-reason"
                  placeholder="e.g., Quarter-end deployment freeze"
                  value={exReason}
                  onChange={(e) => setExReason(e.target.value)}
                />
              </div>
              <Button
                onClick={addException}
                disabled={!exStart || !exEnd || !exReason.trim()}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Add
              </Button>
            </div>

            <div className="mt-5">
              {exceptions.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-10 text-center">
                  <History className="h-8 w-8 text-muted-foreground" />
                  <p className="mt-3 text-sm font-medium">No exception periods</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Updates stay required on every working day until you add an exception.
                  </p>
                </div>
              ) : (
                <div className="divide-y rounded-lg border">
                  {exceptions.map((period) => (
                    <div key={period.id} className="flex items-center gap-3 px-4 py-3">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{period.reason}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(period.start, "MMM d, yyyy")} to{" "}
                          {format(period.end, "MMM d, yyyy")}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => removeException(period.id)}
                        aria-label={`Remove ${period.reason}`}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      <Separator />

      <div className="flex items-center justify-end gap-3">
        <Button variant="outline" onClick={onBack}>
          Cancel
        </Button>
        <Button onClick={handleSave}>Save changes</Button>
      </div>
    </div>
  );
}
