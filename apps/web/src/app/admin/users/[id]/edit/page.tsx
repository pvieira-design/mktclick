"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { TextArea } from "@/components/base/textarea/textarea";
import { Checkbox } from "@/components/base/checkbox/checkbox";
import { Select } from "@/components/base/select/select";
import { Badge } from "@/components/base/badges/badges";
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
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { ArrowLeft, Plus, Trash01, Key01 } from "@untitledui/icons";
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
        <Link href={"/admin/users" as any}>
          <Button color="tertiary" size="sm" iconLeading={ArrowLeft} />
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
              <Input
                label="Email"
                value={userData.email}
                isDisabled
                hint="Email cannot be changed."
              />
              <Input
                label="Name"
                value={formData.name}
                onChange={(value) => setFormData({ ...formData, name: value })}
                placeholder="John Doe"
                isRequired
              />
              <Select
                label="Role"
                selectedKey={formData.role}
                onSelectionChange={(key) => setFormData({ ...formData, role: key as any })}
              >
                <Select.Item id="USER" label="User" />
                <Select.Item id="ADMIN" label="Admin" />
                <Select.Item id="SUPER_ADMIN" label="Super Admin" />
              </Select>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">Banned</p>
                  <p className="text-sm text-muted-foreground">Prevent user from logging in</p>
                </div>
                <Checkbox
                  isSelected={formData.banned}
                  onChange={(checked) => setFormData({ ...formData, banned: checked })}
                />
              </div>
              
              {formData.banned && (
                <TextArea
                  label="Ban Reason"
                  value={formData.banReason}
                  onChange={(value) => setFormData({ ...formData, banReason: value })}
                  placeholder="Reason for banning..."
                />
              )}
              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  isDisabled={updateUserMutation.isPending}
                  isLoading={updateUserMutation.isPending}
                >
                  Save Changes
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
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(value) => setNewPassword(value)}
                  placeholder="New password (min 8 characters)"
                />
              </div>
              <Button 
                type="button" 
                color="secondary"
                onClick={handleResetPassword}
                isDisabled={resetPasswordMutation.isPending || newPassword.length < 8}
                isLoading={resetPasswordMutation.isPending}
                iconLeading={Key01}
              >
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
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <Select 
                  selectedKey={selectedAreaId} 
                  onSelectionChange={(key) => setSelectedAreaId(key as string)}
                  placeholder="Select an area..."
                >
                  {availableAreas.map(area => (
                    <Select.Item key={area.id} id={area.id} label={area.name} />
                  ))}
                </Select>
              </div>
              <div className="w-[140px]">
                <Select 
                  selectedKey={selectedPosition} 
                  onSelectionChange={(key) => setSelectedPosition(key as any)}
                >
                  <Select.Item id="HEAD" label="Head" />
                  <Select.Item id="COORDINATOR" label="Coordinator" />
                  <Select.Item id="STAFF" label="Staff" />
                </Select>
              </div>
              <Button 
                type="button" 
                color="secondary" 
                onClick={handleAddToArea} 
                isDisabled={!selectedAreaId || addToAreaMutation.isPending}
                isLoading={addToAreaMutation.isPending}
                iconLeading={Plus}
              />
            </div>

            {userData.areaMemberships.length > 0 ? (
              <div className="space-y-2">
                {userData.areaMemberships.map(membership => (
                  <div key={membership.area.id} className="flex items-center justify-between p-3 rounded-md border">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{membership.area.name}</span>
                      <Badge color="gray" size="sm">{membership.position}</Badge>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger>
                        <Button color="tertiary" size="sm" iconLeading={Trash01} />
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
