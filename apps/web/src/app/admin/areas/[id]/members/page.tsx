"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";
import { Button } from "@/components/base/buttons/button";
import { Select } from "@/components/base/select/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, Trash01, UserPlus01 } from "@untitledui/icons";
import Link from "next/link";

interface Member {
  id: string;
  position: "HEAD" | "COORDINATOR" | "STAFF";
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
}

interface User {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
}

export default function AreaMembersPage() {
  const params = useParams();
  const areaId = params.id as string;
  const queryClient = useQueryClient();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedPosition, setSelectedPosition] = useState<string | null>("STAFF");
  const [pendingChange, setPendingChange] = useState<{memberId: string, position: string, memberName: string} | null>(null);

  const { data: areaData, isLoading: isAreaLoading } = useQuery(
    trpc.area.getById.queryOptions({ id: areaId })
  );

  const { data: membersData, isLoading: isMembersLoading } = useQuery(
    trpc.area.getMembers.queryOptions({ areaId })
  );

  const { data: usersData, isLoading: isUsersLoading } = useQuery(
    trpc.area.getAvailableUsers.queryOptions({ areaId })
  );

  const updatePositionMutation = useMutation({
    ...(trpc.area.updateMemberPosition.mutationOptions as any)(),
    onSuccess: () => {
      toast.success("Position updated successfully");
      queryClient.invalidateQueries({ queryKey: [["area", "getMembers"]] });
      setPendingChange(null);
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
      setPendingChange(null);
    },
  });

  const addMemberMutation = useMutation({
    ...(trpc.area.addMember.mutationOptions as any)(),
    onSuccess: () => {
      toast.success("Member added successfully");
      queryClient.invalidateQueries({ queryKey: [["area", "getMembers"]] });
      queryClient.invalidateQueries({ queryKey: [["area", "getAvailableUsers"]] });
      queryClient.invalidateQueries({ queryKey: [["area", "list"]] });
      setIsDialogOpen(false);
      setSelectedUserId(null);
      setSelectedPosition("STAFF");
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const removeMemberMutation = useMutation({
    ...(trpc.area.removeMember.mutationOptions as any)(),
    onSuccess: () => {
      toast.success("Member removed");
      queryClient.invalidateQueries({ queryKey: [["area", "getMembers"]] });
      queryClient.invalidateQueries({ queryKey: [["area", "getAvailableUsers"]] });
      queryClient.invalidateQueries({ queryKey: [["area", "list"]] });
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const handleAddMember = () => {
    if (!selectedUserId) {
      toast.error("Please select a user");
      return;
    }
    (addMemberMutation.mutate as any)({
      areaId,
      userId: selectedUserId,
      position: selectedPosition || "STAFF",
    });
  };

  const handleRemoveMember = (memberId: string) => {
    if (confirm("Are you sure you want to remove this member?")) {
      (removeMemberMutation.mutate as any)({ memberId });
    }
  };

  const handlePositionChange = (member: Member, newPosition: string | null) => {
    if (!newPosition) return;
    if (member.position === newPosition) return;
    
    // Check if there's already someone in this position (for HEAD/COORDINATOR)
    if (newPosition === "HEAD" || newPosition === "COORDINATOR") {
      const existingInPosition = membersData?.members.find(
        (m: Member) => m.position === newPosition && m.id !== member.id
      );
      if (existingInPosition) {
        setPendingChange({ 
          memberId: member.id, 
          position: newPosition,
          memberName: existingInPosition.user.name || existingInPosition.user.email 
        });
        return;
      }
    }
    
    // No confirmation needed, execute directly
    (updatePositionMutation.mutate as any)({ memberId: member.id, position: newPosition });
  };

  const isLoading = isAreaLoading || isMembersLoading;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={"/admin/areas" as any}>
          <Button color="tertiary" size="sm" iconLeading={ArrowLeft} />
        </Link>
        <div className="flex-1">
          {isAreaLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-8 w-[200px]" />
              <Skeleton className="h-4 w-[300px]" />
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold tracking-tight">
                Members: {areaData?.name}
              </h1>
              <p className="text-muted-foreground">
                Manage team members and their positions.
              </p>
            </>
          )}
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger>
            <Button iconLeading={UserPlus01}>
              Add Member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Team Member</DialogTitle>
              <DialogDescription>
                Select a user and assign their position in this area.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <span className="text-sm font-medium">User</span>
                <Select 
                  selectedKey={selectedUserId} 
                  onSelectionChange={(key) => setSelectedUserId(key as string)}
                  placeholder="Select a user..."
                  className="w-full"
                >
                  {isUsersLoading ? (
                    <Select.Item id="loading" label="Loading..." isDisabled />
                  ) : usersData?.users && usersData.users.length > 0 ? (
                    usersData.users.map((user: User) => (
                      <Select.Item key={user.id} id={user.id} label={user.name || user.email || "Unknown"} />
                    ))
                  ) : (
                    <Select.Item id="none" label="No users available" isDisabled />
                  )}
                </Select>
              </div>
              <div className="space-y-2">
                <span className="text-sm font-medium">Position</span>
                <Select 
                  selectedKey={selectedPosition} 
                  onSelectionChange={(key) => setSelectedPosition(key as string)}
                  className="w-full"
                >
                  <Select.Item id="HEAD" label="Head (max 1)" />
                  <Select.Item id="COORDINATOR" label="Coordinator (max 1)" />
                  <Select.Item id="STAFF" label="Staff" />
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button color="secondary" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleAddMember} 
                isDisabled={addMemberMutation.isPending || !selectedUserId}
              >
                {addMemberMutation.isPending ? "Adding..." : "Add Member"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>
            {membersData?.members.length || 0} member(s) in this area
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="w-full text-sm">
              <thead className="[&_tr]:border-b">
                <tr className="border-b bg-muted/50">
                  <th className="h-12 px-4 text-left font-medium text-muted-foreground">User</th>
                  <th className="h-12 px-4 text-left font-medium text-muted-foreground">Email</th>
                  <th className="h-12 px-4 text-left font-medium text-muted-foreground">Position</th>
                  <th className="h-12 px-4 text-right font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i} className="border-b">
                      <td className="p-4"><Skeleton className="h-4 w-[150px]" /></td>
                      <td className="p-4"><Skeleton className="h-4 w-[200px]" /></td>
                      <td className="p-4"><Skeleton className="h-5 w-[80px]" /></td>
                      <td className="p-4 text-right"><Skeleton className="ml-auto h-8 w-8" /></td>
                    </tr>
                  ))
                ) : membersData?.members && membersData.members.length > 0 ? (
                  membersData.members.map((member: Member) => (
                    <tr key={member.id} className="border-b hover:bg-muted/50">
                      <td className="p-4 font-medium">{member.user.name || "Unnamed"}</td>
                      <td className="p-4 text-muted-foreground">{member.user.email}</td>
                      <td className="p-4">
                        <Select
                          selectedKey={member.position}
                          onSelectionChange={(key) => handlePositionChange(member, key as string)}
                          isDisabled={updatePositionMutation.isPending}
                          className="w-[140px]"
                        >
                          <Select.Item id="HEAD" label="Head" />
                          <Select.Item id="COORDINATOR" label="Coordinator" />
                          <Select.Item id="STAFF" label="Staff" />
                        </Select>
                      </td>
                      <td className="p-4 text-right">
                        <Button 
                          color="tertiary" 
                          size="sm"
                          iconLeading={Trash01}
                          onClick={() => handleRemoveMember(member.id)}
                          isDisabled={removeMemberMutation.isPending}
                          title="Remove member"
                        />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-muted-foreground">
                      No members yet. Add someone to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={!!pendingChange} onOpenChange={(open) => !open && setPendingChange(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Change Position</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingChange?.memberName} is currently the {pendingChange?.position}. 
              They will be demoted to Staff. Do you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              if (pendingChange) {
                (updatePositionMutation.mutate as any)({ 
                  memberId: pendingChange.memberId, 
                  position: pendingChange.position 
                });
              }
            }}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
