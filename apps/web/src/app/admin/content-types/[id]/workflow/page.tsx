"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { ArrowLeft, Plus, Edit, Trash2, ChevronUp, ChevronDown, Flag } from "lucide-react";
import Link from "next/link";

interface WorkflowStep {
  id: string;
  name: string;
  description: string | null;
  order: number;
  requiredFieldsToEnter: string[];
  requiredFieldsToExit: string[];
  approverAreaId: string | null;
  approverPositions: string[];
  isFinalStep: boolean;
  isActive: boolean;
  approverArea: { id: string; name: string; slug: string } | null;
}

interface Area {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
}

interface Field {
  id: string;
  name: string;
  label: string;
}

interface StepFormData {
  name: string;
  description: string;
  requiredFieldsToEnter: string[];
  requiredFieldsToExit: string[];
  approverAreaId: string;
  approverPositions: string[];
  isFinalStep: boolean;
}

const initialStepForm: StepFormData = {
  name: "",
  description: "",
  requiredFieldsToEnter: [],
  requiredFieldsToExit: [],
  approverAreaId: "",
  approverPositions: [],
  isFinalStep: false,
};

export default function ContentTypeWorkflowPage() {
  const params = useParams();
  const contentTypeId = params.id as string;
  const queryClient = useQueryClient();

  const [isStepDialogOpen, setIsStepDialogOpen] = useState(false);
  const [editingStep, setEditingStep] = useState<WorkflowStep | null>(null);
  const [stepForm, setStepForm] = useState<StepFormData>(initialStepForm);

  const { data: contentType, isLoading: isContentTypeLoading } = useQuery(
    trpc.contentType.getById.queryOptions({ id: contentTypeId })
  );

  const { data: stepsData, isLoading: isStepsLoading } = useQuery(
    trpc.workflow.getStepsByContentType.queryOptions({ contentTypeId })
  );

  const { data: permissionsData } = useQuery(
    trpc.workflow.getAreaPermissions.queryOptions({ contentTypeId })
  );

  const { data: areasData } = useQuery(trpc.area.list.queryOptions());

  const { data: fieldsData } = useQuery(
    trpc.contentTypeField.listByContentType.queryOptions({ contentTypeId })
  );

  const createStepMutation = useMutation({
    ...(trpc.workflow.createStep.mutationOptions as any)(),
    onSuccess: () => {
      toast.success("Step created");
      queryClient.invalidateQueries({ queryKey: [["workflow", "getStepsByContentType"]] });
      closeStepDialog();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const updateStepMutation = useMutation({
    ...(trpc.workflow.updateStep.mutationOptions as any)(),
    onSuccess: () => {
      toast.success("Step updated");
      queryClient.invalidateQueries({ queryKey: [["workflow", "getStepsByContentType"]] });
      closeStepDialog();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const deleteStepMutation = useMutation({
    ...(trpc.workflow.deleteStep.mutationOptions as any)(),
    onSuccess: () => {
      toast.success("Step deleted");
      queryClient.invalidateQueries({ queryKey: [["workflow", "getStepsByContentType"]] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const reorderStepsMutation = useMutation({
    ...(trpc.workflow.reorderSteps.mutationOptions as any)(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [["workflow", "getStepsByContentType"]] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const setPermissionMutation = useMutation({
    ...(trpc.workflow.setAreaPermission.mutationOptions as any)(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [["workflow", "getAreaPermissions"]] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const openCreateStepDialog = () => {
    setEditingStep(null);
    setStepForm(initialStepForm);
    setIsStepDialogOpen(true);
  };

  const openEditStepDialog = (step: WorkflowStep) => {
    setEditingStep(step);
    setStepForm({
      name: step.name,
      description: step.description || "",
      requiredFieldsToEnter: step.requiredFieldsToEnter,
      requiredFieldsToExit: step.requiredFieldsToExit,
      approverAreaId: step.approverAreaId || "",
      approverPositions: step.approverPositions,
      isFinalStep: step.isFinalStep,
    });
    setIsStepDialogOpen(true);
  };

  const closeStepDialog = () => {
    setIsStepDialogOpen(false);
    setEditingStep(null);
    setStepForm(initialStepForm);
  };

  const handleStepSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingStep) {
      (updateStepMutation.mutate as any)({
        id: editingStep.id,
        name: stepForm.name,
        description: stepForm.description || undefined,
        requiredFieldsToEnter: stepForm.requiredFieldsToEnter,
        requiredFieldsToExit: stepForm.requiredFieldsToExit,
        approverAreaId: stepForm.approverAreaId || null,
        approverPositions: stepForm.approverPositions,
        isFinalStep: stepForm.isFinalStep,
      });
    } else {
      const nextOrder = stepsData?.length || 0;
      (createStepMutation.mutate as any)({
        contentTypeId,
        name: stepForm.name,
        description: stepForm.description || undefined,
        order: nextOrder,
        requiredFieldsToEnter: stepForm.requiredFieldsToEnter,
        requiredFieldsToExit: stepForm.requiredFieldsToExit,
        approverAreaId: stepForm.approverAreaId || undefined,
        approverPositions: stepForm.approverPositions,
        isFinalStep: stepForm.isFinalStep,
      });
    }
  };

  const handleDeleteStep = (stepId: string) => {
    (deleteStepMutation.mutate as any)({ id: stepId });
  };

  const moveStep = (index: number, direction: "up" | "down") => {
    if (!stepsData) return;
    const steps = [...stepsData];
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= steps.length) return;
    [steps[index], steps[newIndex]] = [steps[newIndex], steps[index]];
    (reorderStepsMutation.mutate as any)({
      contentTypeId,
      stepIds: steps.map((s: WorkflowStep) => s.id),
    });
  };

  const handlePermissionToggle = (areaId: string, currentValue: boolean) => {
    (setPermissionMutation.mutate as any)({
      contentTypeId,
      areaId,
      canCreate: !currentValue,
    });
  };

  const toggleFieldInList = (fieldName: string, list: "enter" | "exit") => {
    const key = list === "enter" ? "requiredFieldsToEnter" : "requiredFieldsToExit";
    const current = stepForm[key];
    if (current.includes(fieldName)) {
      setStepForm({ ...stepForm, [key]: current.filter((f: string) => f !== fieldName) });
    } else {
      setStepForm({ ...stepForm, [key]: [...current, fieldName] });
    }
  };

  const togglePosition = (position: string) => {
    const current = stepForm.approverPositions;
    if (current.includes(position)) {
      setStepForm({ ...stepForm, approverPositions: current.filter((p: string) => p !== position) });
    } else {
      setStepForm({ ...stepForm, approverPositions: [...current, position] });
    }
  };

  const steps = stepsData || [];
  const areas = areasData?.items || [];
  const fields = fieldsData?.items || [];
  const permissions = permissionsData || [];

  const getAreaPermission = (areaId: string) => {
    return permissions.find((p: any) => p.areaId === areaId)?.canCreate || false;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/admin/content-types/${contentTypeId}/edit` as any}
          className={buttonVariants({ variant: "ghost", size: "icon" })}
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex-1">
          {isContentTypeLoading ? (
            <Skeleton className="h-8 w-[200px]" />
          ) : (
            <>
              <h1 className="text-2xl font-bold tracking-tight">
                Workflow: {contentType?.name}
              </h1>
              <p className="text-muted-foreground">
                Configure approval workflow and area permissions.
              </p>
            </>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Area Permissions</CardTitle>
          <CardDescription>
            Select which areas can create requests of this type.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {areas.map((area: Area) => (
              <div key={area.id} className="flex items-center justify-between p-3 rounded-md border">
                <span className="font-medium">{area.name}</span>
                <Checkbox
                  checked={getAreaPermission(area.id)}
                  onCheckedChange={() => handlePermissionToggle(area.id, getAreaPermission(area.id))}
                  disabled={setPermissionMutation.isPending}
                />
              </div>
            ))}
            {areas.length === 0 && (
              <p className="text-sm text-muted-foreground">No areas available.</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Workflow Steps</CardTitle>
            <CardDescription>
              Define the approval flow for this content type.
            </CardDescription>
          </div>
          <Button onClick={openCreateStepDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Add Step
          </Button>
        </CardHeader>
        <CardContent>
          {isStepsLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : steps.length > 0 ? (
            <div className="space-y-2">
              {steps.map((step: WorkflowStep, index: number) => (
                <div key={step.id} className="flex items-start gap-4 p-4 rounded-md border bg-card">
                  <div className="flex flex-col">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => moveStep(index, "up")}
                      disabled={index === 0 || reorderStepsMutation.isPending}
                    >
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                    <span className="text-center text-sm font-bold text-muted-foreground">
                      {index + 1}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => moveStep(index, "down")}
                      disabled={index === steps.length - 1 || reorderStepsMutation.isPending}
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium">{step.name}</span>
                      {step.isFinalStep && (
                        <Badge variant="default" className="text-xs">
                          <Flag className="mr-1 h-3 w-3" />
                          Final
                        </Badge>
                      )}
                    </div>
                    {step.description && (
                      <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
                    )}
                    <div className="flex gap-4 mt-2 text-xs text-muted-foreground flex-wrap">
                      {step.approverArea && (
                        <span>
                          Approver: <strong>{step.approverArea.name}</strong>
                          {step.approverPositions.length > 0 && (
                            <> ({step.approverPositions.join(", ")})</>
                          )}
                        </span>
                      )}
                      {step.requiredFieldsToEnter.length > 0 && (
                        <span>Entry fields: {step.requiredFieldsToEnter.length}</span>
                      )}
                      {step.requiredFieldsToExit.length > 0 && (
                        <span>Exit fields: {step.requiredFieldsToExit.length}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEditStepDialog(step)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger className={buttonVariants({ variant: "ghost", size: "icon" })}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete step?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will remove "{step.name}" from the workflow.
                            If requests are currently on this step, deletion will fail.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteStep(step.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No workflow steps defined. Add a step to get started.
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isStepDialogOpen} onOpenChange={setIsStepDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleStepSubmit}>
            <DialogHeader>
              <DialogTitle>{editingStep ? "Edit Step" : "Add Step"}</DialogTitle>
              <DialogDescription>
                Configure the workflow step properties.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="stepName">Step Name</Label>
                <Input
                  id="stepName"
                  value={stepForm.name}
                  onChange={(e) => setStepForm({ ...stepForm, name: e.target.value })}
                  placeholder="e.g. Design Review"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="stepDescription">Description</Label>
                <Textarea
                  id="stepDescription"
                  value={stepForm.description}
                  onChange={(e) => setStepForm({ ...stepForm, description: e.target.value })}
                  placeholder="What happens in this step..."
                  rows={2}
                />
              </div>

              <div className="grid gap-2">
                <Label>Approver Area</Label>
                <Select
                  value={stepForm.approverAreaId}
                  onValueChange={(value) => setStepForm({ ...stepForm, approverAreaId: value || "" })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select area (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No specific area</SelectItem>
                    {areas.map((area: Area) => (
                      <SelectItem key={area.id} value={area.id}>{area.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {stepForm.approverAreaId && (
                <div className="grid gap-2">
                  <Label>Approver Positions</Label>
                  <div className="flex gap-4">
                    {["HEAD", "COORDINATOR", "STAFF"].map((pos) => (
                      <div key={pos} className="flex items-center gap-2">
                        <Checkbox
                          id={`pos-${pos}`}
                          checked={stepForm.approverPositions.includes(pos)}
                          onCheckedChange={() => togglePosition(pos)}
                        />
                        <Label htmlFor={`pos-${pos}`} className="cursor-pointer text-sm">
                          {pos}
                        </Label>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Any member with these positions can approve.
                  </p>
                </div>
              )}

              {fields.length > 0 && (
                <div className="grid gap-2">
                  <Label>Required Fields to Enter Step</Label>
                  <div className="border rounded-md p-3 space-y-2 max-h-32 overflow-y-auto">
                    {fields.map((field: Field) => (
                      <div key={field.id} className="flex items-center gap-2">
                        <Checkbox
                          id={`enter-${field.id}`}
                          checked={stepForm.requiredFieldsToEnter.includes(field.name)}
                          onCheckedChange={() => toggleFieldInList(field.name, "enter")}
                        />
                        <Label htmlFor={`enter-${field.id}`} className="cursor-pointer text-sm">
                          {field.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {fields.length > 0 && (
                <div className="grid gap-2">
                  <Label>Required Fields to Exit Step</Label>
                  <div className="border rounded-md p-3 space-y-2 max-h-32 overflow-y-auto">
                    {fields.map((field: Field) => (
                      <div key={field.id} className="flex items-center gap-2">
                        <Checkbox
                          id={`exit-${field.id}`}
                          checked={stepForm.requiredFieldsToExit.includes(field.name)}
                          onCheckedChange={() => toggleFieldInList(field.name, "exit")}
                        />
                        <Label htmlFor={`exit-${field.id}`} className="cursor-pointer text-sm">
                          {field.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Checkbox
                  id="isFinalStep"
                  checked={stepForm.isFinalStep}
                  onCheckedChange={(checked) => 
                    setStepForm({ ...stepForm, isFinalStep: checked === true })
                  }
                />
                <Label htmlFor="isFinalStep" className="cursor-pointer">
                  This is the final step (marks request as complete)
                </Label>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeStepDialog}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createStepMutation.isPending || updateStepMutation.isPending}
              >
                {(createStepMutation.isPending || updateStepMutation.isPending) 
                  ? "Saving..." 
                  : editingStep ? "Save Changes" : "Add Step"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
