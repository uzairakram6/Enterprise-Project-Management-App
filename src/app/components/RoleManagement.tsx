import { useMemo, useState } from "react";
import { Search, Plus, Shield, Users, MoreHorizontal, Eye, Pencil } from "lucide-react";
import { toast } from "sonner";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  type User,
  type Role,
  countUsersPerRole,
} from "../data/users";

interface RoleManagementProps {
  users: User[];
  roles: Role[];
  onViewRole: (roleId: string) => void;
  onCreateRole: () => void;
}

export default function RoleManagement({ users, roles, onViewRole, onCreateRole }: RoleManagementProps) {
  const [search, setSearch] = useState("");

  const filteredRoles = useMemo(() => {
    const term = search.toLowerCase().trim();
    if (!term) return roles;
    return roles.filter(
      (r) =>
        r.name.toLowerCase().includes(term) ||
        r.description.toLowerCase().includes(term)
    );
  }, [roles, search]);

  return (
    <div className="space-y-6 max-w-[1400px]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Role Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Define roles and control access across T360 modules
          </p>
        </div>
        <Button className="gap-2 shrink-0" onClick={onCreateRole}>
          <Plus className="w-4 h-4" />
          Create Role
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{roles.length}</p>
              <p className="text-xs text-muted-foreground">Total Roles</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{users.length}</p>
              <p className="text-xs text-muted-foreground">Users Assigned</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 col-span-2 lg:col-span-1">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{roles.length}</p>
              <p className="text-xs text-muted-foreground">Role Levels</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search roles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </Card>

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="font-semibold">Role Name</TableHead>
              <TableHead className="font-semibold">Users</TableHead>
              <TableHead className="font-semibold">Description</TableHead>
              <TableHead className="font-semibold w-[60px]">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRoles.map((role) => {
              const userCount = countUsersPerRole(role.id, users);
              return (
                <TableRow
                  key={role.id}
                  className="hover:bg-muted/30 cursor-pointer"
                  onClick={() => onViewRole(role.id)}
                >
                  <TableCell>
                    <Badge variant="outline" className={`${role.color} text-sm px-3 py-1`}>
                      {role.name}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-medium">{userCount}</span>
                    <span className="text-xs text-muted-foreground ml-1">
                      user{userCount !== 1 ? "s" : ""}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-md">
                    {role.description}
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onViewRole(role.id)}>
                          <Eye className="w-4 h-4 mr-2" />
                          View Permissions
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toast.info("Edit role coming soon")}>
                          <Pencil className="w-4 h-4 mr-2" />
                          Edit Role
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
