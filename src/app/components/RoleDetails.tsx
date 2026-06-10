import { useState } from "react";
import { toast } from "sonner";
import {
  ArrowLeft,
  Shield,
  Users,
  Settings,
  Check,
  Pencil,
} from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Checkbox } from "./ui/checkbox";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  type Role,
  type User,
  type PermissionAction,
  PERMISSION_ACTIONS,
  getUsersByRole,
  getUserInitials,
} from "../data/users";

interface RoleDetailsProps {
  role: Role;
  users: User[];
  onBack: () => void;
  onViewUser: (userId: number) => void;
  onRoleChange: (role: Role) => void;
}

export default function RoleDetails({
  role,
  users,
  onBack,
  onViewUser,
  onRoleChange,
}: RoleDetailsProps) {
  const [activeTab, setActiveTab] = useState("permissions");
  const [editName, setEditName] = useState(role.name);
  const [editDescription, setEditDescription] = useState(role.description);

  const roleUsers = getUsersByRole(role.id, users);

  const togglePermission = (moduleIndex: number, action: PermissionAction) => {
    const updated = {
      ...role,
      permissions: role.permissions.map((perm, i) =>
        i === moduleIndex ? { ...perm, [action]: !perm[action] } : perm
      ),
    };
    onRoleChange(updated);
    toast.success("Permission updated");
  };

  const saveSettings = () => {
    onRoleChange({ ...role, name: editName, description: editDescription });
    toast.success("Role settings saved");
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
        <ArrowLeft className="w-4 h-4" />
        Back to Roles
      </Button>

      <Card className="p-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
            <Shield className="w-7 h-7 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{role.name}</h1>
              <Badge variant="outline" className={role.color}>
                {roleUsers.length} users
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">{role.description}</p>
          </div>
        </div>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="permissions" className="gap-1.5">
            <Shield className="w-4 h-4" />
            Permissions
          </TabsTrigger>
          <TabsTrigger value="users" className="gap-1.5">
            <Users className="w-4 h-4" />
            Users with this Role
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-1.5">
            <Settings className="w-4 h-4" />
            Role Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="permissions" className="mt-4">
          <Card className="overflow-hidden">
            <div className="p-4 border-b bg-muted/30">
              <h3 className="font-semibold text-sm">Module Permissions</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Configure what this role can access across T360
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/40 border-b">
                    <th className="text-left p-3 font-semibold min-w-[180px]">Module</th>
                    {PERMISSION_ACTIONS.map((action) => (
                      <th key={action} className="p-3 font-semibold text-center capitalize w-24">
                        {action}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {role.permissions.map((perm, moduleIndex) => (
                    <tr key={perm.module} className="border-b last:border-0 hover:bg-muted/20">
                      <td className="p-3 font-medium">{perm.module}</td>
                      {PERMISSION_ACTIONS.map((action) => (
                        <td key={action} className="p-3 text-center">
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
          </Card>
        </TabsContent>

        <TabsContent value="users" className="mt-4">
          {roleUsers.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground">
              No users assigned to this role
            </Card>
          ) : (
            <div className="space-y-2">
              {roleUsers.map((user) => (
                <Card
                  key={user.id}
                  className="p-4 hover:shadow-sm transition-shadow cursor-pointer"
                  onClick={() => onViewUser(user.id)}
                >
                  <div className="flex items-center gap-4">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback
                        className={`bg-gradient-to-br ${user.avatarColor} text-white text-xs font-semibold`}
                      >
                        {getUserInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        user.status === "active"
                          ? "bg-green-50 text-green-700 border-green-200"
                          : "bg-red-50 text-red-700 border-red-200"
                      }
                    >
                      {user.status}
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="settings" className="mt-4">
          <Card className="p-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="role-name">Role Name</Label>
              <Input
                id="role-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role-desc">Description</Label>
              <Textarea
                id="role-desc"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={3}
              />
            </div>
            <Button onClick={saveSettings} className="gap-2">
              <Check className="w-4 h-4" />
              Save Changes
            </Button>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button variant="outline" className="gap-2" onClick={() => toast.info("Edit mode")}>
          <Pencil className="w-4 h-4" />
          Edit Role
        </Button>
      </div>
    </div>
  );
}
