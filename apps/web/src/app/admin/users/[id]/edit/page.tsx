"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { ArrowLeft, Plus, Trash2, Key } from "lucide-react";
import Link from "next/link";

export default function EditUserPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const userId = params.id as string;
  
  const [formData, setFormData] = useState({
    name: "",
    role: "USER" as "USER" | "ADMIN" | "SUPER_ADMIN",
    banned: false,
    banReason: "",
  });
  
  const [newPassword, setNewPassword] = useState("");
  const [selectedAreaId, setSelectedAreaId] = useState<string>("");
  const [selectedPosition, setSelectedPosition] = useState<"HEAD" | "COORDINATOR" | "STAFF">("STAFF");

  const { data: userData, isLoading: isUserLoading } = useQuery(
    trpc.user.getById.queryOptions({ id: userId })
  );

  const { data: areasData } = useQuery(trpc.area.list.queryOptions());

  useEffect(() => {
    if (userData) {
      setFormData({
        name: userData.name || "",
        role: userData.role,
        banned: userData.banned || false,
        banReason: userData.banReason || "",
      });
    }
  }, [userData]);

  const updateUserMutation = useMutation({
    ...(trpc.user.update.mutationOptions as any)(),
    onSuccess: () => {
      toast.success("User updated successfully");
      queryClient.invalidateQueries({ queryKey: [["user", "getById"]] });
      queryClient.invalidateQueries({ queryKey: [["user", "list"]] });
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const resetPasswordMutation = useMutation({
    ...(trpc.user.resetPassword.mutationOptions as any)(),
    onSuccess: () => {
      toast.success("Password reset successfully");
      setNewPassword("");
      queryClient.invalidateQueries({ queryKey: [["user", "getById"]] });
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const addToAreaMutation = useMutation({
    ...(trpc.user.addToArea.mutationOptions as any)(),
    onSuccess: () => {
      toast.success("Added to area successfully");
      queryClient.invalidateQueries({ queryKey: [["user", "getById"]] });
      setSelectedAreaId("");
      setSelectedPosition("STAFF");
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const removeFromAreaMutation = useMutation({
    ...(trpc.user.removeFromArea.mutationOptions as any)(),
    onSuccess: () => {
      toast.success("Removed from area");
      queryClient.invalidateQueries({ queryKey: [["user", "getById"]] });
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    (updateUserMutation.mutate as any)({
      id: userId,
      ...formData,
    });
  };

  const handleResetPassword = () => {
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    (resetPasswordMutation.mutate as any)({ id: userId, newPassword });
  };

  const handleAddToArea = () => {
    if (!selectedAreaId) return;
    (addToAreaMutation.mutate as any)({
      userId,
      areaId: selectedAreaId,
      position: selectedPosition,
    });
  };

  const handleRemoveFromArea = (areaId: string) => {
    (removeFromAreaMutation.mutate as any)({ userId, areaId });
  };

  const availableAreas = areasData?.items.filter(
    area => !userData?.areaMemberships.some(m => m.area.id === area.id)
  ) || [];

  if (isUserLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-[200px]" />
            <Skeleton className="h-4 w-[300px]" />
          </div>
        </div>
        <Skeleton className="h-[400px]" />
      </div>
    );
  }

  if (!userData) {
    return <div>User not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={"/admin/users" as any} className={buttonVariants({ variant: "ghost", size: "icon" })}>
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit User</h1>
          <p className="text-muted-foreground">{userData.email}</p>
        </div>
      </div>

      <div className="grid gap-6">
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Update user account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={userData.email} disabled />
                <p className="text-sm text-muted-foreground">Email cannot be changed.</p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="John Doe"
                  required
                  minLength={2}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => setFormData({ ...formData, role: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USER">User</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="banned">Banned</Label>
                  <p className="text-sm text-muted-foreground">Prevent user from logging in</p>
                </div>
                <Checkbox
                  id="banned"
                  checked={formData.banned}
                  onCheckedChange={(checked) => setFormData({ ...formData, banned: checked === true })}
                />
              </div>
              {formData.banned && (
                <div className="grid gap-2">
                  <Label htmlFor="banReason">Ban Reason</Label>
                  <Textarea
                    id="banReason"
                    value={formData.banReason}
                    onChange={(e) => setFormData({ ...formData, banReason: e.target.value })}
                    placeholder="Reason for banning..."
                  />
                </div>
              )}
              <div className="flex justify-end">
                <Button type="submit" disabled={updateUserMutation.isPending}>
                  {updateUserMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>

        <Card>
          <CardHeader>
            <CardTitle>Reset Password</CardTitle>
            <CardDescription>Set a new temporary password for this user</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New password (min 8 characters)"
                minLength={8}
              />
              <Button 
                type="button" 
                variant="outline"
                onClick={handleResetPassword}
                disabled={resetPasswordMutation.isPending || newPassword.length < 8}
              >
                <Key className="mr-2 h-4 w-4" />
                Reset
              </Button>
            </div>
            {userData.mustChangePassword && (
              <p className="text-sm text-amber-600">
                User must change their password on next login.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Area Memberships</CardTitle>
            <CardDescription>Manage user's area assignments</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Select value={selectedAreaId} onValueChange={(val) => setSelectedAreaId(val || "")}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select an area..." />
                </SelectTrigger>
                <SelectContent>
                  {availableAreas.map(area => (
                    <SelectItem key={area.id} value={area.id}>{area.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedPosition} onValueChange={(v) => setSelectedPosition(v as any)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HEAD">Head</SelectItem>
                  <SelectItem value="COORDINATOR">Coordinator</SelectItem>
                  <SelectItem value="STAFF">Staff</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleAddToArea} 
                disabled={!selectedAreaId || addToAreaMutation.isPending}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {userData.areaMemberships.length > 0 ? (
              <div className="space-y-2">
                {userData.areaMemberships.map(membership => (
                  <div key={membership.area.id} className="flex items-center justify-between p-3 rounded-md border">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{membership.area.name}</span>
                      <Badge variant="secondary">{membership.position}</Badge>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger className={buttonVariants({ variant: "ghost", size: "icon" })}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remove from area?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will remove {userData.name || userData.email} from {membership.area.name}.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleRemoveFromArea(membership.area.id)}>
                            Remove
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">User is not assigned to any areas.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
