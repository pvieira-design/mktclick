"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { Select } from "@/components/base/select/select";
import { Badge } from "@/components/base/badges/badges";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, Plus, X } from "@untitledui/icons";
import Link from "next/link";

interface AreaAssignment {
  areaId: string;
  areaName: string;
  position: "HEAD" | "COORDINATOR" | "STAFF";
}

export default function CreateUserPage() {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    password: "",
    role: "USER" as "USER" | "ADMIN" | "SUPER_ADMIN",
  });
  
  const [areaAssignments, setAreaAssignments] = useState<AreaAssignment[]>([]);
  const [selectedAreaId, setSelectedAreaId] = useState<string>("");
  const [selectedPosition, setSelectedPosition] = useState<"HEAD" | "COORDINATOR" | "STAFF">("STAFF");

  const { data: areasData } = useQuery(trpc.area.list.queryOptions());

  const createUserMutation = useMutation({
    ...(trpc.user.create.mutationOptions as any)(),
    onSuccess: () => {
      toast.success("User created successfully");
      router.push("/admin/users" as any);
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    (createUserMutation.mutate as any)({
      ...formData,
      areaAssignments: areaAssignments.map(a => ({ areaId: a.areaId, position: a.position })),
    });
  };

  const handleAddArea = () => {
    if (!selectedAreaId) return;
    
    const area = areasData?.items.find(a => a.id === selectedAreaId);
    if (!area) return;
    
    if (areaAssignments.some(a => a.areaId === selectedAreaId)) {
      toast.error("User is already assigned to this area");
      return;
    }
    
    setAreaAssignments([...areaAssignments, {
      areaId: selectedAreaId,
      areaName: area.name,
      position: selectedPosition,
    }]);
    setSelectedAreaId("");
    setSelectedPosition("STAFF");
  };

  const handleRemoveArea = (areaId: string) => {
    setAreaAssignments(areaAssignments.filter(a => a.areaId !== areaId));
  };

  const availableAreas = areasData?.items.filter(
    area => !areaAssignments.some(a => a.areaId === area.id)
  ) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={"/admin/users" as any}>
          <Button color="tertiary" size="sm" iconLeading={ArrowLeft} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Create User</h1>
          <p className="text-muted-foreground">Add a new user to the system.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>User account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Name"
                value={formData.name}
                onChange={(value) => setFormData({ ...formData, name: value })}
                placeholder="John Doe"
                isRequired
              />
              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(value) => setFormData({ ...formData, email: value })}
                placeholder="john@example.com"
                isRequired
              />
              <Input
                label="Temporary Password"
                type="password"
                value={formData.password}
                onChange={(value) => setFormData({ ...formData, password: value })}
                placeholder="••••••••"
                isRequired
                hint="User will be required to change this password on first login."
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Area Assignments</CardTitle>
              <CardDescription>Assign user to work areas (optional)</CardDescription>
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
                  size="sm" 
                  iconLeading={Plus} 
                  onClick={handleAddArea} 
                  isDisabled={!selectedAreaId}
                />
              </div>

              {areaAssignments.length > 0 ? (
                <div className="space-y-2">
                  {areaAssignments.map(assignment => (
                    <div key={assignment.areaId} className="flex items-center justify-between p-3 rounded-md border">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{assignment.areaName}</span>
                        <Badge color="gray" type="pill-color" size="sm">{assignment.position}</Badge>
                      </div>
                      <Button
                        type="button"
                        color="tertiary"
                        size="sm"
                        iconLeading={X}
                        onClick={() => handleRemoveArea(assignment.areaId)}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No areas assigned yet.</p>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Link href={"/admin/users" as any}>
              <Button color="secondary">
                Cancel
              </Button>
            </Link>
            <Button 
              type="submit" 
              isDisabled={createUserMutation.isPending}
              isLoading={createUserMutation.isPending}
            >
              Create User
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
