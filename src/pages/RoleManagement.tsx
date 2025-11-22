import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Shield, UserPlus, Trash2, Search, History, Users } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface UserWithRoles {
  id: string;
  email: string;
  created_at: string;
  roles: string[];
}

interface RolePermission {
  role: string;
  permission: string;
  description: string;
}

interface AuditEntry {
  id: string;
  action: string;
  target_role: string;
  performed_by: string;
  created_at: string;
  metadata: any;
}

const RoleManagement = () => {
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [permissions, setPermissions] = useState<RolePermission[]>([]);
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserWithRoles | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [showGrantDialog, setShowGrantDialog] = useState(false);
  const [showRevokeDialog, setShowRevokeDialog] = useState(false);
  const [userToRevoke, setUserToRevoke] = useState<{ user: UserWithRoles; role: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAuditLog, setShowAuditLog] = useState(false);

  const roleColors: Record<string, string> = {
    admin: "bg-red-500",
    support: "bg-blue-500",
    developer: "bg-purple-500",
    marketer: "bg-green-500",
  };

  const availableRoles = ["admin", "developer", "support", "marketer"];

  const roleDescriptions: Record<string, string> = {
    admin: "Full system access, can manage all users and roles",
    developer: "Can manage integrations, technical settings, and development features",
    support: "Can manage content and handle user inquiries",
    marketer: "Can manage campaigns and marketing content",
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchUsers(),
        fetchPermissions(),
        fetchAuditLog(),
      ]);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Not authenticated');

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/manage-user-roles`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ action: 'list_users' }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch users');
    }

    const { users: usersWithRoles } = await response.json();
    
    setUsers(usersWithRoles.map((user: any) => ({
      id: user.id,
      email: user.email || "",
      created_at: user.created_at,
      roles: user.roles || [],
    })));
  };

  const fetchPermissions = async () => {
    const { data, error } = await (supabase as any)
      .from("role_permissions")
      .select("*")
      .order("role", { ascending: true })
      .order("permission", { ascending: true });

    if (error) throw error;
    setPermissions(data || []);
  };

  const fetchAuditLog = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Not authenticated');

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/manage-user-roles`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ action: 'get_audit_log' }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch audit log');
    }

    const { auditLog } = await response.json();
    setAuditLog(auditLog || []);
  };

  const handleGrantRole = async () => {
    if (!selectedUser || !selectedRole) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/manage-user-roles`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            action: 'grant_role',
            userId: selectedUser.id,
            role: selectedRole,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to grant role');
      }

      toast.success(`${selectedRole} role granted to ${selectedUser.email}`);
      setShowGrantDialog(false);
      setSelectedUser(null);
      setSelectedRole("");
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Failed to grant role");
    }
  };

  const handleRevokeRole = async () => {
    if (!userToRevoke) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/manage-user-roles`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            action: 'revoke_role',
            userId: userToRevoke.user.id,
            role: userToRevoke.role,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to revoke role');
      }

      toast.success(`${userToRevoke.role} role revoked from ${userToRevoke.user.email}`);
      setShowRevokeDialog(false);
      setUserToRevoke(null);
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Failed to revoke role");
    }
  };

  const filteredUsers = users.filter((user) =>
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedPermissions = permissions.reduce((acc, perm) => {
    if (!acc[perm.role]) acc[perm.role] = [];
    acc[perm.role].push(perm);
    return acc;
  }, {} as Record<string, RolePermission[]>);

  return (
    <AdminLayout
      title="Role Management"
      description="Manage user roles and permissions across the platform"
    >
      <div className="grid gap-6">
        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
            </CardContent>
          </Card>
          
          {Object.keys(roleColors).map((role) => (
            <Card key={role}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium capitalize">{role}s</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {users.filter((u) => u.roles.includes(role)).length}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* User Management */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>User Roles</CardTitle>
                <CardDescription>Manage user access and permissions</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAuditLog(!showAuditLog)}
                >
                  <History className="h-4 w-4 mr-2" />
                  Audit Log
                </Button>
                <Dialog open={showGrantDialog} onOpenChange={setShowGrantDialog}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Grant Role
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Grant Role</DialogTitle>
                      <DialogDescription>
                        Select a user and role to grant access
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">User</label>
                        <Select
                          value={selectedUser?.id}
                          onValueChange={(id) =>
                            setSelectedUser(users.find((u) => u.id === id) || null)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select user" />
                          </SelectTrigger>
                          <SelectContent>
                            {users.map((user) => (
                              <SelectItem key={user.id} value={user.id}>
                                {user.email}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Role</label>
                        <Select value={selectedRole} onValueChange={setSelectedRole}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.keys(roleColors).map((role) => (
                              <SelectItem key={role} value={role}>
                                <div className="flex items-center gap-2">
                                  <div className={`w-2 h-2 rounded-full ${roleColors[role]}`} />
                                  <span className="capitalize">{role}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {selectedRole && (
                          <p className="text-sm text-muted-foreground">
                            {roleDescriptions[selectedRole]}
                          </p>
                        )}
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setShowGrantDialog(false)}>
                          Cancel
                        </Button>
                        <Button
                          onClick={handleGrantRole}
                          disabled={!selectedUser || !selectedRole}
                        >
                          Grant Role
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Roles</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.email}</TableCell>
                        <TableCell>
                          <div className="flex gap-1 flex-wrap">
                            {user.roles.length === 0 ? (
                              <Badge variant="outline">No roles</Badge>
                            ) : (
                              user.roles.map((role) => (
                                <Badge
                                  key={role}
                                  variant="secondary"
                                  className={roleColors[role]}
                                >
                                  {role}
                                </Badge>
                              ))
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {format(new Date(user.created_at), "MMM dd, yyyy")}
                        </TableCell>
                        <TableCell className="text-right">
                          {user.roles.length > 0 && (
                            <div className="flex justify-end gap-2">
                              {user.roles.map((role) => (
                                <Button
                                  key={role}
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setUserToRevoke({ user, role });
                                    setShowRevokeDialog(true);
                                  }}
                                >
                                  <Trash2 className="h-3 w-3 mr-1" />
                                  Revoke {role}
                                </Button>
                              ))}
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Permissions Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Role Permissions</CardTitle>
            <CardDescription>Overview of permissions for each role</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {Object.entries(groupedPermissions).map(([role, perms]) => (
                <Card key={role}>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${roleColors[role]}`} />
                      <CardTitle className="text-lg capitalize">{role}</CardTitle>
                    </div>
                    <CardDescription>{roleDescriptions[role]}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {perms.map((perm) => (
                        <li key={perm.permission} className="text-sm">
                          <span className="font-medium">{perm.permission.replace(/_/g, " ")}</span>
                          <p className="text-xs text-muted-foreground">{perm.description}</p>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Audit Log */}
        {showAuditLog && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Audit log of role changes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {auditLog.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        Role <span className="capitalize">{entry.target_role}</span>{" "}
                        {entry.action}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(entry.created_at), "MMM dd, yyyy HH:mm")}
                      </p>
                    </div>
                    <Badge variant={entry.action === "granted" ? "default" : "destructive"}>
                      {entry.action}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Revoke Confirmation Dialog */}
      <AlertDialog open={showRevokeDialog} onOpenChange={setShowRevokeDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke Role</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to revoke the <strong>{userToRevoke?.role}</strong> role from{" "}
              <strong>{userToRevoke?.user.email}</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRevokeRole}>
              Revoke Role
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default RoleManagement;
