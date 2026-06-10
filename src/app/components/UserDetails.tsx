import { useState } from "react";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Building2,
  Calendar,
  Clock,
  KeyRound,
  FolderKanban,
  Activity,
  Settings,
  Pencil,
  Key,
  UserMinus,
} from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Separator } from "./ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";
import {
  type User,
  getRoleById,
  getUserInitials,
  PERMISSION_ACTIONS,
} from "../data/users";

interface UserDetailsProps {
  user: User;
  onBack: () => void;
  onDeactivate: (userId: number) => void;
}

const ACTIVITY_LOG = [
  { action: "Submitted daily update", project: "T360 View Engine", time: "2 hours ago" },
  { action: "Updated task status", project: "Bilingual Chatbot", time: "5 hours ago" },
  { action: "Logged in", project: "—", time: "1 day ago" },
  { action: "Changed password", project: "—", time: "3 days ago" },
  { action: "Joined project", project: "T360 View Engine", time: "1 week ago" },
];

const STATUS_STYLES = {
  active: "bg-green-100 text-green-700 border-green-200",
  inactive: "bg-red-100 text-red-700 border-red-200",
  pending: "bg-amber-100 text-amber-700 border-amber-200",
};

export default function UserDetails({ user, onBack, onDeactivate }: UserDetailsProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const role = getRoleById(user.roleId);

  const handleDeactivate = () => {
    onDeactivate(user.id);
    toast.success(`${user.name} has been deactivated`);
    onBack();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
        <ArrowLeft className="w-4 h-4" />
        Back to Users
      </Button>

      <Card className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-5">
            <Avatar className="w-16 h-16">
              <AvatarFallback
                className={`bg-gradient-to-br ${user.avatarColor} text-white text-lg font-bold`}
              >
                {getUserInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold">{user.name}</h1>
                <Badge variant="outline" className={STATUS_STYLES[user.status]}>
                  {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                </Badge>
                {role && (
                  <Badge variant="outline" className={role.color}>
                    {role.name}
                  </Badge>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" />
                  {user.email}
                </span>
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5" />
                  {user.phone}
                </span>
                <span className="flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" />
                  {user.employeeId}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview" className="gap-1.5">
            <Building2 className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="permissions" className="gap-1.5">
            <KeyRound className="w-4 h-4" />
            Permissions
          </TabsTrigger>
          <TabsTrigger value="activity" className="gap-1.5">
            <Activity className="w-4 h-4" />
            Activity Log
          </TabsTrigger>
          <TabsTrigger value="projects" className="gap-1.5">
            <FolderKanban className="w-4 h-4" />
            Projects
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-1.5">
            <Settings className="w-4 h-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4 space-y-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: Building2, label: "Reporting Manager", value: user.reportingManager },
              { icon: Calendar, label: "Date Joined", value: format(parseISO(user.joinedDate), "MMM d, yyyy") },
              { icon: Clock, label: "Last Active", value: user.lastActive },
              { icon: MapPin, label: "Location", value: user.location },
              { icon: Building2, label: "Department", value: user.department },
              { icon: Mail, label: "Employee ID", value: user.employeeId },
            ].map(({ icon: Icon, label, value }) => (
              <Card key={label} className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                    <Icon className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="text-sm font-medium">{value}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <Card className="p-5">
            <h3 className="font-semibold mb-3">Assigned Projects</h3>
            {user.assignedProjects.length === 0 ? (
              <p className="text-sm text-muted-foreground">No projects assigned yet</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {user.assignedProjects.map((project) => (
                  <Badge key={project} variant="secondary" className="px-3 py-1">
                    {project}
                  </Badge>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="permissions" className="mt-4">
          {role ? (
            <Card className="overflow-hidden">
              <div className="p-4 border-b bg-muted/30">
                <p className="text-sm">
                  Permissions inherited from <strong>{role.name}</strong> role
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/40 border-b">
                      <th className="text-left p-3 font-semibold">Module</th>
                      {PERMISSION_ACTIONS.map((a) => (
                        <th key={a} className="p-3 font-semibold text-center capitalize w-20">
                          {a}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {role.permissions.map((perm) => (
                      <tr key={perm.module} className="border-b last:border-0">
                        <td className="p-3 font-medium">{perm.module}</td>
                        {PERMISSION_ACTIONS.map((action) => (
                          <td key={action} className="p-3 text-center">
                            {perm[action] ? (
                              <span className="inline-block w-2 h-2 rounded-full bg-green-500" />
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
            </Card>
          ) : (
            <Card className="p-8 text-center text-muted-foreground">No role assigned</Card>
          )}
        </TabsContent>

        <TabsContent value="activity" className="mt-4">
          <Card className="divide-y">
            {ACTIVITY_LOG.map((entry, i) => (
              <div key={i} className="flex items-center justify-between p-4">
                <div>
                  <p className="text-sm font-medium">{entry.action}</p>
                  {entry.project !== "—" && (
                    <p className="text-xs text-muted-foreground">{entry.project}</p>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">{entry.time}</span>
              </div>
            ))}
          </Card>
        </TabsContent>

        <TabsContent value="projects" className="mt-4">
          <Card className="p-5">
            {user.assignedProjects.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                No projects assigned to this user
              </p>
            ) : (
              <div className="grid sm:grid-cols-2 gap-3">
                {user.assignedProjects.map((project) => (
                  <div
                    key={project}
                    className="flex items-center gap-3 p-4 rounded-lg border hover:bg-muted/30 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FolderKanban className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{project}</p>
                      <p className="text-xs text-muted-foreground">Active member</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="mt-4">
          <Card className="p-5 space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg border">
              <div>
                <p className="text-sm font-medium">Two-Factor Authentication</p>
                <p className="text-xs text-muted-foreground">Add an extra layer of security</p>
              </div>
              <Badge variant="outline">Not enabled</Badge>
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg border">
              <div>
                <p className="text-sm font-medium">Email Notifications</p>
                <p className="text-xs text-muted-foreground">Receive project and task updates</p>
              </div>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                Enabled
              </Badge>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      <Separator />

      <div className="flex flex-wrap items-center gap-3">
        <Button variant="outline" className="gap-2" onClick={() => toast.info("Password reset email sent")}>
          <Key className="w-4 h-4" />
          Reset Password
        </Button>
        <Button variant="outline" className="gap-2" onClick={() => toast.info("Edit mode coming soon")}>
          <Pencil className="w-4 h-4" />
          Edit User
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="gap-2 ml-auto">
              <UserMinus className="w-4 h-4" />
              Deactivate User
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Deactivate {user.name}?</AlertDialogTitle>
              <AlertDialogDescription>
                This user will lose access to T360. You can reactivate them later from the user list.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeactivate} className="bg-destructive text-destructive-foreground">
                Deactivate
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
