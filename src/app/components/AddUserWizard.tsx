import { Fragment, useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  ArrowLeft,
  Check,
  ChevronLeft,
  ChevronRight,
  PartyPopper,
} from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Switch } from "./ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { cn } from "./ui/utils";
import {
  type User,
  ROLES,
  DEPARTMENTS,
  LOCATIONS,
  getRoleById,
  getUserInitials,
  PERMISSION_ACTIONS,
} from "../data/users";

interface AddUserWizardProps {
  users: User[];
  onBack: () => void;
  onUserCreated: (user: User) => void;
}

const STEPS = ["Employee", "Role", "Permissions", "Review", "Done"];

const AVATAR_COLORS = [
  "from-blue-500 to-purple-600",
  "from-pink-500 to-rose-500",
  "from-emerald-500 to-teal-500",
  "from-violet-500 to-purple-500",
  "from-orange-500 to-amber-500",
  "from-cyan-500 to-blue-500",
];

interface FormData {
  name: string;
  email: string;
  phone: string;
  department: string;
  employeeId: string;
  location: string;
  roleId: string;
  reportingManager: string;
  isActive: boolean;
}

const EMPTY_FORM: FormData = {
  name: "",
  email: "",
  phone: "",
  department: "",
  employeeId: "",
  location: "",
  roleId: "",
  reportingManager: "",
  isActive: true,
};

function Stepper({ current }: { current: number }) {
  return (
    <div>
      <ol className="hidden items-center sm:flex">
        {STEPS.map((label, i) => {
          const stepNum = i + 1;
          const isDone = stepNum < current;
          const isActive = stepNum === current;
          const connectorDone = current > stepNum;
          return (
            <Fragment key={label}>
              <li className="flex shrink-0 items-center gap-2.5">
                <span
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full text-sm transition-colors",
                    isDone && "bg-primary text-primary-foreground",
                    isActive && "bg-primary text-primary-foreground ring-4 ring-primary/15",
                    !isDone && !isActive && "bg-muted text-muted-foreground",
                  )}
                >
                  {isDone ? <Check className="h-4 w-4" /> : stepNum}
                </span>
                <span
                  className={cn(
                    "text-sm",
                    isActive || isDone ? "font-medium text-foreground" : "text-muted-foreground",
                  )}
                >
                  {label}
                </span>
              </li>
              {i < STEPS.length - 1 && (
                <div
                  className={cn(
                    "mx-3 h-px flex-1 transition-colors",
                    connectorDone ? "bg-primary" : "bg-border",
                  )}
                />
              )}
            </Fragment>
          );
        })}
      </ol>

      <div className="sm:hidden">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium">{STEPS[current - 1]}</span>
          <span className="text-muted-foreground">
            Step {current} of {STEPS.length}
          </span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-muted">
          <div
            className="h-1.5 rounded-full bg-primary transition-all"
            style={{ width: `${(current / STEPS.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="max-w-[65%] text-right text-sm font-medium">{value}</span>
    </div>
  );
}

export default function AddUserWizard({ users, onBack, onUserCreated }: AddUserWizardProps) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);

  const selectedRole = getRoleById(form.roleId);
  const isAvpRole = form.roleId === "avp";
  const managers = users.filter((u) => u.status === "active");

  const updateForm = (field: keyof FormData, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleRoleChange = (roleId: string) => {
    setForm((prev) => ({
      ...prev,
      roleId,
      reportingManager: roleId === "avp" ? "" : prev.reportingManager,
    }));
  };

  const canProceed = () => {
    if (step === 1) {
      return form.name.trim() && form.email.trim() && form.department && form.employeeId.trim();
    }
    if (step === 2) return !!form.roleId;
    return true;
  };

  const handleNext = () => {
    if (!canProceed()) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (step === 4) {
      const newUser: User = {
        id: Math.max(0, ...users.map((u) => u.id)) + 1,
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || "—",
        roleId: form.roleId,
        department: form.department,
        employeeId: form.employeeId.trim(),
        location: form.location || "Karachi, PK",
        reportingManager: isAvpRole ? "—" : form.reportingManager || "—",
        status: form.isActive ? "active" : "pending",
        lastActive: "Just now",
        joinedDate: format(new Date(), "yyyy-MM-dd"),
        assignedProjects: [],
        avatarColor: AVATAR_COLORS[users.length % AVATAR_COLORS.length],
      };
      onUserCreated(newUser);
      setStep(5);
      toast.success("User created successfully!");
      return;
    }
    setStep((s) => Math.min(s + 1, 5));
  };

  const renderStep = () => {
    if (step === 1) {
      return (
        <div className="space-y-5">
          <div>
            <h2 className="text-xl">Personal information</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Enter the employee&apos;s basic details to add them to T360.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                placeholder="e.g. Muhammad Ali"
                value={form.name}
                onChange={(e) => updateForm("name", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@techverx.com"
                value={form.email}
                onChange={(e) => updateForm("email", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                placeholder="+92 300 1234567"
                value={form.phone}
                onChange={(e) => updateForm("phone", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Department *</Label>
              <Select value={form.department} onValueChange={(v) => updateForm("department", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="empId">Employee ID *</Label>
              <Input
                id="empId"
                placeholder="EMP-000"
                value={form.employeeId}
                onChange={(e) => updateForm("employeeId", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Location</Label>
              <Select value={form.location} onValueChange={(v) => updateForm("location", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  {LOCATIONS.map((l) => (
                    <SelectItem key={l} value={l}>
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      );
    }

    if (step === 2) {
      return (
        <div className="space-y-5">
          <div>
            <h2 className="text-xl">Role & access</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {isAvpRole
                ? "AVP is the top-level role — no reporting manager required."
                : "Assign a system role and reporting manager for this user."}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label>System Role *</Label>
              <Select value={form.roleId} onValueChange={handleRoleChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {!isAvpRole && (
              <div className="space-y-2 md:col-span-2">
                <Label>Reporting Manager</Label>
                <Select
                  value={form.reportingManager}
                  onValueChange={(v) => updateForm("reportingManager", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select manager" />
                  </SelectTrigger>
                  <SelectContent>
                    {managers.map((m) => (
                      <SelectItem key={m.id} value={m.name}>
                        {m.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="text-sm font-medium">Active user</p>
              <p className="text-xs text-muted-foreground">User can log in immediately</p>
            </div>
            <Switch checked={form.isActive} onCheckedChange={(v) => updateForm("isActive", v)} />
          </div>
        </div>
      );
    }

    if (step === 3 && selectedRole) {
      return (
        <div className="space-y-5">
          <div>
            <h2 className="text-xl">Permissions preview</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Auto-assigned based on the{" "}
              <Badge variant="outline" className={selectedRole.color}>
                {selectedRole.name}
              </Badge>{" "}
              role.
            </p>
          </div>

          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="p-3 text-left font-semibold">Module</th>
                  {PERMISSION_ACTIONS.map((a) => (
                    <th key={a} className="w-20 p-3 text-center font-semibold capitalize">
                      {a}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {selectedRole.permissions.map((perm) => (
                  <tr key={perm.module} className="border-b last:border-0">
                    <td className="p-3 font-medium">{perm.module}</td>
                    {PERMISSION_ACTIONS.map((action) => (
                      <td key={action} className="p-3 text-center">
                        {perm[action] ? (
                          <Check className="mx-auto h-4 w-4 text-green-600" />
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    if (step === 4) {
      return (
        <div className="space-y-5">
          <div>
            <h2 className="text-xl">Review & confirm</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Verify all details before creating the user account.
            </p>
          </div>

          <div className="flex items-center gap-4 rounded-lg border p-4">
            <div
              className={`flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br ${AVATAR_COLORS[users.length % AVATAR_COLORS.length]} font-bold text-white`}
            >
              {form.name ? getUserInitials(form.name) : "?"}
            </div>
            <div className="flex-1">
              <p className="text-lg font-semibold">{form.name}</p>
              <p className="text-sm text-muted-foreground">{form.email}</p>
            </div>
            {selectedRole && (
              <Badge variant="outline" className={selectedRole.color}>
                {selectedRole.name}
              </Badge>
            )}
          </div>

          <div className="divide-y rounded-lg border px-4">
            <SummaryRow label="Department" value={form.department} />
            <SummaryRow label="Employee ID" value={form.employeeId} />
            <SummaryRow label="Location" value={form.location || "Karachi, PK"} />
            <SummaryRow label="Phone" value={form.phone || "—"} />
            {!isAvpRole && (
              <SummaryRow label="Reporting Manager" value={form.reportingManager || "—"} />
            )}
            <SummaryRow label="Status" value={form.isActive ? "Active" : "Pending Invite"} />
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-5 py-4 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <PartyPopper className="h-8 w-8 text-green-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold">User created successfully</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Login credentials have been sent to <strong>{form.email}</strong>. The user can now
            access T360 based on their assigned role.
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to users
        </Button>
      </div>

      <div>
        <h1 className="text-3xl">Add new user</h1>
        <p className="mt-1 text-muted-foreground">
          Onboard a team member with role assignment, permissions, and account setup.
        </p>
      </div>

      <Card className="p-5">
        <Stepper current={step} />
      </Card>

      <Card className="p-6 md:p-8">{renderStep()}</Card>

      {step < 5 && (
        <div className="flex items-center justify-between">
          {step === 1 ? (
            <Button variant="outline" onClick={onBack}>
              Cancel
            </Button>
          ) : (
            <Button variant="outline" onClick={() => setStep(step - 1)} className="gap-2">
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>
          )}

          <Button
            onClick={handleNext}
            disabled={!canProceed()}
            className="gap-2"
          >
            {step === 4 ? "Create user" : "Next"}
            {step < 4 && <ChevronRight className="h-4 w-4" />}
          </Button>
        </div>
      )}

      {step === 5 && (
        <div className="flex justify-center">
          <Button onClick={onBack}>Back to user management</Button>
        </div>
      )}
    </div>
  );
}
