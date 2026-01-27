"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ArrowLeft, Plus, X } from "lucide-react";
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
        <Link href={"/admin/users" as any} className={buttonVariants({ variant: "ghost", size: "icon" })}>
          <ArrowLeft className="h-4 w-4" />
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
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john@example.com"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Temporary Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  required
                  minLength={8}
                />
                <p className="text-sm text-muted-foreground">
                  User will be required to change this password on first login.
                </p>
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Area Assignments</CardTitle>
              <CardDescription>Assign user to work areas (optional)</CardDescription>
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
                <Button type="button" variant="outline" onClick={handleAddArea} disabled={!selectedAreaId}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {areaAssignments.length > 0 ? (
                <div className="space-y-2">
                  {areaAssignments.map(assignment => (
                    <div key={assignment.areaId} className="flex items-center justify-between p-3 rounded-md border">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{assignment.areaName}</span>
                        <Badge variant="secondary">{assignment.position}</Badge>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveArea(assignment.areaId)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No areas assigned yet.</p>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Link href={"/admin/users" as any} className={buttonVariants({ variant: "outline" })}>
              Cancel
            </Link>
            <Button type="submit" disabled={createUserMutation.isPending}>
              {createUserMutation.isPending ? "Creating..." : "Create User"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
