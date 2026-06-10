import { Fragment, useState, type ReactNode } from "react";
import { toast } from "sonner";
import {
  ArrowLeft,
  Check,
  ChevronLeft,
  ChevronRight,
  PartyPopper,
  Shield,
} from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Checkbox } from "./ui/checkbox";
import { cn } from "./ui/utils";
import {
  type Role,
  type ModulePermission,
  type PermissionAction,
  PERMISSION_ACTIONS,
  createEmptyPermissions,
} from "../data/users";

const DEFAULT_ROLE_COLOR = "bg-slate-100 text-slate-700 border-slate-200";

interface CreateRoleWizardProps {
  roles: Role[];
  onBack: () => void;
  onRoleCreated: (role: Role) => void;
}

const STEPS = ["Details", "Permissions", "Review", "Done"];

function slugifyRoleId(name: string, existingIds: string[]): string {
  const base =
    name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "role";
  let id = base;
  let counter = 1;
  while (existingIds.includes(id)) {
    id = `${base}-${counter++}`;
  }
  return id;
}

function Stepper({ current }: { current: number }) {
  return (
    <ol className="flex items-center">
      {STEPS.map((label, i) => {
        const stepNum = i + 1;
        const isDone = stepNum < current;
        const isActive = stepNum === current;
        const connectorDone = current > stepNum;
        return (
          <Fragment key={label}>
            <li className="flex shrink-0 items-center gap-1.5">
              <span
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full text-xs transition-colors",
                  isDone && "bg-primary text-primary-foreground",
                  isActive && "bg-primary text-primary-foreground ring-2 ring-primary/20",
                  !isDone && !isActive && "bg-muted text-muted-foreground",
                )}
              >
                {isDone ? <Check className="h-3 w-3" /> : stepNum}
              </span>
              <span
                className={cn(
                  "hidden text-xs sm:inline",
                  isActive || isDone ? "font-medium text-foreground" : "text-muted-foreground",
                )}
              >
                {label}
              </span>
            </li>
            {i < STEPS.length - 1 && (
              <div
                className={cn(
                  "mx-2 h-px w-6 shrink-0 transition-colors sm:mx-1.5 sm:w-auto sm:flex-1",
                  connectorDone ? "bg-primary" : "bg-border",
                )}
              />
            )}
          </Fragment>
        );
      })}
    </ol>
  );
}

function SummaryRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="max-w-[65%] text-right text-sm font-medium">{value}</span>
    </div>
  );
}

export default function CreateRoleWizard({
  roles,
  onBack,
  onRoleCreated,
}: CreateRoleWizardProps) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [permissions, setPermissions] = useState<ModulePermission[]>(createEmptyPermissions);

  const totalPermissionCount = permissions.length * PERMISSION_ACTIONS.length;

  const togglePermission = (moduleIndex: number, action: PermissionAction) => {
    setPermissions((prev) =>
      prev.map((perm, i) =>
        i === moduleIndex ? { ...perm, [action]: !perm[action] } : perm,
      ),
    );
  };

  const setAllPermissions = (enabled: boolean) => {
    setPermissions((prev) =>
      prev.map((perm) =>
        PERMISSION_ACTIONS.reduce(
          (next, action) => ({ ...next, [action]: enabled }),
          { ...perm },
        ),
      ),
    );
  };

  const setColumnPermissions = (action: PermissionAction, enabled: boolean) => {
    setPermissions((prev) =>
      prev.map((perm) => ({ ...perm, [action]: enabled })),
    );
  };

  const setRowPermissions = (moduleIndex: number, enabled: boolean) => {
    setPermissions((prev) =>
      prev.map((perm, i) =>
        i === moduleIndex
          ? PERMISSION_ACTIONS.reduce(
              (next, action) => ({ ...next, [action]: enabled }),
              { ...perm },
            )
          : perm,
      ),
    );
  };

  const applyViewOnlyPreset = () => {
    setPermissions((prev) =>
      prev.map((perm) =>
        PERMISSION_ACTIONS.reduce(
          (next, action) => ({ ...next, [action]: action === "view" }),
          { ...perm },
        ),
      ),
    );
  };

  const isColumnFullySelected = (action: PermissionAction) =>
    permissions.every((perm) => perm[action]);

  const isColumnPartiallySelected = (action: PermissionAction) => {
    const selected = permissions.filter((perm) => perm[action]).length;
    return selected > 0 && selected < permissions.length;
  };

  const isRowFullySelected = (perm: ModulePermission) =>
    PERMISSION_ACTIONS.every((action) => perm[action]);

  const isRowPartiallySelected = (perm: ModulePermission) => {
    const selected = PERMISSION_ACTIONS.filter((action) => perm[action]).length;
    return selected > 0 && selected < PERMISSION_ACTIONS.length;
  };

  const grantedCount = permissions.reduce(
    (total, perm) =>
      total + PERMISSION_ACTIONS.filter((action) => perm[action]).length,
    0,
  );

  const isAllSelected = grantedCount === totalPermissionCount;
  const isPartiallySelected = grantedCount > 0 && grantedCount < totalPermissionCount;

  const canProceed = () => {
    if (step === 1) return name.trim().length >= 2;
    if (step === 2) return grantedCount > 0;
    return true;
  };

  const handleCreate = () => {
    const newRole: Role = {
      id: slugifyRoleId(
        name,
        roles.map((r) => r.id),
      ),
      name: name.trim(),
      description: description.trim() || "—",
      color: DEFAULT_ROLE_COLOR,
      permissions,
    };
    onRoleCreated(newRole);
    setStep(4);
    toast.success("Role created successfully!");
  };

  const renderStep = () => {
    if (step === 1) {
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="role-name">Role Name *</Label>
              <Input
                id="role-name"
                placeholder="e.g. Delivery Lead"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role-desc">Description</Label>
              <Textarea
                id="role-desc"
                placeholder="Optional — describe what this role is responsible for..."
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>
        </div>
      );
    }

    if (step === 2) {
      return (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <Button type="button" variant="outline" size="sm" className="h-7 px-2.5 text-xs" onClick={() => setAllPermissions(true)}>
              Full access
            </Button>
            <Button type="button" variant="outline" size="sm" className="h-7 px-2.5 text-xs" onClick={applyViewOnlyPreset}>
              View only
            </Button>
            <Button type="button" variant="outline" size="sm" className="h-7 px-2.5 text-xs" onClick={() => setAllPermissions(false)}>
              Clear all
            </Button>
            <div className="flex items-center gap-1.5 sm:ml-auto">
              <Checkbox
                id="select-all-permissions"
                checked={isAllSelected ? true : isPartiallySelected ? "indeterminate" : false}
                onCheckedChange={(checked) => setAllPermissions(checked === true)}
              />
              <Label htmlFor="select-all-permissions" className="cursor-pointer text-xs font-medium">
                Select all
              </Label>
            </div>
            <span className="w-full text-xs text-muted-foreground sm:w-auto sm:ml-0">
              {grantedCount}/{totalPermissionCount} selected
            </span>
          </div>

          <div className="overflow-x-auto rounded-md border">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-2.5 py-1.5 text-left font-semibold">Module</th>
                  <th className="w-10 px-1 py-1.5 text-center font-semibold text-muted-foreground">
                    All
                  </th>
                  {PERMISSION_ACTIONS.map((action) => (
                    <th key={action} className="w-14 px-1 py-1.5 text-center">
                      <div className="flex flex-col items-center gap-0.5">
                        <span className="font-semibold capitalize leading-none">{action}</span>
                        <Checkbox
                          checked={
                            isColumnFullySelected(action)
                              ? true
                              : isColumnPartiallySelected(action)
                                ? "indeterminate"
                                : false
                          }
                          onCheckedChange={(checked) =>
                            setColumnPermissions(action, checked === true)
                          }
                          aria-label={`Select all ${action}`}
                        />
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {permissions.map((perm, moduleIndex) => (
                  <tr key={perm.module} className="border-b last:border-0 hover:bg-muted/20">
                    <td className="px-2.5 py-1.5 font-medium whitespace-nowrap">{perm.module}</td>
                    <td className="px-1 py-1.5 text-center">
                      <Checkbox
                        checked={
                          isRowFullySelected(perm)
                            ? true
                            : isRowPartiallySelected(perm)
                              ? "indeterminate"
                              : false
                        }
                        onCheckedChange={(checked) =>
                          setRowPermissions(moduleIndex, checked === true)
                        }
                        aria-label={`Select all permissions for ${perm.module}`}
                        className="mx-auto"
                      />
                    </td>
                    {PERMISSION_ACTIONS.map((action) => (
                      <td key={action} className="px-1 py-1.5 text-center">
                        <Checkbox
                          checked={perm[action]}
                          onCheckedChange={() => togglePermission(moduleIndex, action)}
                          className="mx-auto"
                        />
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

    if (step === 3) {
      return (
        <div className="space-y-5">
          <div>
            <h2 className="text-xl">Review & confirm</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Verify role details and permissions before creating.
            </p>
          </div>

          <div className="flex items-center gap-4 rounded-lg border p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-lg font-semibold">{name.trim()}</p>
              {description.trim() && (
                <p className="mt-1 text-sm text-muted-foreground">{description.trim()}</p>
              )}
            </div>
          </div>

          <div className="divide-y rounded-lg border px-4">
            <SummaryRow label="Permissions granted" value={`${grantedCount} total`} />
            <SummaryRow
              label="Modules with access"
              value={
                permissions.filter((p) => PERMISSION_ACTIONS.some((a) => p[a])).length
              }
            />
          </div>

          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="p-3 text-left font-semibold">Module</th>
                  {PERMISSION_ACTIONS.map((action) => (
                    <th key={action} className="w-20 p-3 text-center font-semibold capitalize">
                      {action}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {permissions.map((perm) => (
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

    return (
      <div className="space-y-5 py-4 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <PartyPopper className="h-8 w-8 text-green-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Role created successfully</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            <strong>{name.trim()}</strong> is now available when assigning roles to users.
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-3 flex items-center justify-between gap-3">
        <Button variant="ghost" size="sm" onClick={onBack} className="h-8 gap-1.5 px-2">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to roles
        </Button>
        <span className="text-xs text-muted-foreground">
          Step {step} of {STEPS.length} · {STEPS[step - 1]}
        </span>
      </div>

      <h1 className="mb-3 text-xl font-bold">Create role</h1>

      <Card className="p-4">
        <Stepper current={step} />

        <div className="mt-3 border-t pt-3">{renderStep()}</div>

        {step < 4 && (
          <div className="mt-3 flex items-center justify-between border-t pt-3">
            {step === 1 ? (
              <Button variant="outline" size="sm" onClick={onBack}>
                Cancel
              </Button>
            ) : (
              <Button variant="outline" size="sm" onClick={() => setStep(step - 1)} className="gap-1.5">
                <ChevronLeft className="h-3.5 w-3.5" />
                Back
              </Button>
            )}

            <Button
              size="sm"
              onClick={() => (step === 3 ? handleCreate() : setStep(step + 1))}
              disabled={!canProceed()}
              className="gap-1.5"
            >
              {step === 3 ? "Create role" : "Next"}
              {step < 3 && <ChevronRight className="h-3.5 w-3.5" />}
            </Button>
          </div>
        )}

        {step === 4 && (
          <div className="mt-3 flex justify-center border-t pt-3">
            <Button size="sm" onClick={onBack}>
              Back to role management
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
