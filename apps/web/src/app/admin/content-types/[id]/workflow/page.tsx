"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { TextArea } from "@/components/base/textarea/textarea";
import { Checkbox } from "@/components/base/checkbox/checkbox";
import { Select } from "@/components/base/select/select";
import { Badge } from "@/components/base/badges/badges";

import { SlideoutMenu } from "@/components/application/slideout-menus/slideout-menu";
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icon";
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
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Plus, Edit01, Trash01, ChevronUp, ChevronDown, Flag01 } from "@untitledui/icons";

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
   assignedStep: { id: string; name: string } | null;
 }

interface StepFormData {
   name: string;
   description: string;
   requiredFieldsToEnter: string[];
   requiredFieldsToExit: string[];
   approverAreaId: string;
   approverPositions: string[];
   isFinalStep: boolean;
   assignedFields: string[];
 }

const initialStepForm: StepFormData = {
   name: "",
   description: "",
   requiredFieldsToEnter: [],
   requiredFieldsToExit: [],
   approverAreaId: "",
   approverPositions: [],
   isFinalStep: false,
   assignedFields: [],
 };

export default function ContentTypeWorkflowPage() {
  const params = useParams();
  const contentTypeId = params.id as string;
  const queryClient = useQueryClient();

  const [isStepDialogOpen, setIsStepDialogOpen] = useState(false);
  const [editingStep, setEditingStep] = useState<WorkflowStep | null>(null);
  const [stepToDelete, setStepToDelete] = useState<WorkflowStep | null>(null);
  const [stepForm, setStepForm] = useState<StepFormData>(initialStepForm);

  const { data: stepsData, isLoading: isStepsLoading } = useQuery(
    trpc.workflow.getStepsByContentType.queryOptions({ contentTypeId })
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
      setStepToDelete(null);
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

   const assignFieldsToStepMutation = useMutation({
     ...(trpc.contentTypeField.assignToStep.mutationOptions as any)(),
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: [["contentTypeField", "listByContentType"]] });
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
     const assignedFieldNames = fields
       .filter((f: Field) => f.assignedStep?.id === step.id)
       .map((f: Field) => f.name);
     setStepForm({
       name: step.name,
       description: step.description || "",
       requiredFieldsToEnter: step.requiredFieldsToEnter,
       requiredFieldsToExit: step.requiredFieldsToExit,
       approverAreaId: step.approverAreaId || "",
       approverPositions: step.approverPositions,
       isFinalStep: step.isFinalStep,
       assignedFields: assignedFieldNames,
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

     const handleAssignFields = () => {
       const fieldsToAssign = fields
         .filter((f: Field) => stepForm.assignedFields.includes(f.name))
         .map((f: Field) => f.id);
       const fieldsToUnassign = fields
         .filter((f: Field) => f.assignedStep?.id === editingStep?.id && !stepForm.assignedFields.includes(f.name))
         .map((f: Field) => f.id);

       if (fieldsToAssign.length > 0) {
         (assignFieldsToStepMutation.mutate as any)({
           fieldIds: fieldsToAssign,
           stepId: editingStep?.id || null,
         });
       }
       if (fieldsToUnassign.length > 0) {
         (assignFieldsToStepMutation.mutate as any)({
           fieldIds: fieldsToUnassign,
           stepId: null,
         });
       }
     };

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
       handleAssignFields();
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

  const handleDeleteStep = () => {
    if (stepToDelete) {
      (deleteStepMutation.mutate as any)({ id: stepToDelete.id });
    }
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

   const toggleAssignedField = (fieldName: string) => {
     const current = stepForm.assignedFields;
     if (current.includes(fieldName)) {
       setStepForm({ ...stepForm, assignedFields: current.filter((f: string) => f !== fieldName) });
     } else {
       setStepForm({ ...stepForm, assignedFields: [...current, fieldName] });
     }
   };

  const steps = stepsData || [];
  const areas = areasData?.items || [];
  const fields = fieldsData?.items || [];

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-primary shadow-xs ring-1 ring-border-secondary">
        <div className="flex flex-row items-center justify-between px-6 pt-6">
          <div>
            <h2 className="text-lg font-semibold text-primary">Workflow Steps</h2>
            <p className="text-sm text-tertiary mt-1">
              Define the approval flow for this content type.
            </p>
          </div>
          <Button onClick={openCreateStepDialog} iconLeading={Plus}>
            Add Step
          </Button>
        </div>
        <div className="px-6 pb-6 pt-4">
          {isStepsLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : steps.length > 0 ? (
            <div className="space-y-2">
              {steps.map((step: WorkflowStep, index: number) => (
                <div key={step.id} className="flex items-start gap-4 p-4 rounded-lg ring-1 ring-border-secondary bg-primary">
                  <div className="flex flex-col gap-1">
                    <Button
                      color="tertiary"
                      size="sm"
                      onClick={() => moveStep(index, "up")}
                      isDisabled={index === 0 || reorderStepsMutation.isPending}
                      iconLeading={ChevronUp}
                    />
                    <span className="text-center text-sm font-bold text-tertiary">
                      {index + 1}
                    </span>
                    <Button
                      color="tertiary"
                      size="sm"
                      onClick={() => moveStep(index, "down")}
                      isDisabled={index === steps.length - 1 || reorderStepsMutation.isPending}
                      iconLeading={ChevronDown}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium">{step.name}</span>
                      {step.isFinalStep && (
                        <Badge color="success" size="sm">
                          <Flag01 className="mr-1 h-3 w-3" />
                          Final
                        </Badge>
                      )}
                    </div>
                    {step.description && (
                      <p className="text-sm text-tertiary mt-1">{step.description}</p>
                    )}
                    <div className="flex gap-4 mt-2 text-xs text-tertiary flex-wrap">
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
                    <Button 
                      color="tertiary" 
                      size="sm" 
                      onClick={() => openEditStepDialog(step)}
                      iconLeading={Edit01}
                    />
                    <Button 
                      color="tertiary" 
                      size="sm" 
                      onClick={() => setStepToDelete(step)}
                      iconLeading={Trash01}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-tertiary">
              No workflow steps defined. Add a step to get started.
            </div>
          )}
        </div>
      </div>

      <SlideoutMenu isOpen={isStepDialogOpen} onOpenChange={setIsStepDialogOpen} className="!max-w-[600px]">
        {({ close }) => (
          <>
            <SlideoutMenu.Header onClose={close}>
              <div className="flex items-start gap-4 pr-8">
                <FeaturedIcon
                  icon={editingStep ? Edit01 : Plus}
                  theme="light"
                  color="brand"
                  size="md"
                />
                <div>
                  <h2 className="text-lg font-semibold text-primary">
                    {editingStep ? "Edit Step" : "Add Step"}
                  </h2>
                  <p className="text-sm text-tertiary mt-1">
                    Configure the workflow step properties.
                  </p>
                </div>
              </div>
            </SlideoutMenu.Header>
            <SlideoutMenu.Content>
              <form id="step-form" onSubmit={handleStepSubmit} className="space-y-4">
                <Input
                  label="Step Name"
                  value={stepForm.name}
                  onChange={(value) => setStepForm({ ...stepForm, name: value })}
                  placeholder="e.g. Design Review"
                />

                <TextArea
                  label="Description"
                  value={stepForm.description}
                  onChange={(value) => setStepForm({ ...stepForm, description: value })}
                  placeholder="What happens in this step..."
                  rows={2}
                />

                <Select
                  label="Approver Area"
                  selectedKey={stepForm.approverAreaId}
                  onSelectionChange={(key) => setStepForm({ ...stepForm, approverAreaId: key as string })}
                  placeholder="Select area (optional)"
                >
                  <Select.Item id="" label="No specific area" />
                  {areas.map((area: Area) => (
                    <Select.Item key={area.id} id={area.id} label={area.name} />
                  ))}
                </Select>

                {stepForm.approverAreaId && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none">
                      Approver Positions
                    </label>
                    <div className="flex gap-4">
                      {["HEAD", "COORDINATOR", "STAFF"].map((pos) => (
                        <Checkbox
                          key={pos}
                          label={pos}
                          isSelected={stepForm.approverPositions.includes(pos)}
                          onChange={() => togglePosition(pos)}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-tertiary">
                      Any member with these positions can approve.
                    </p>
                  </div>
                )}

                {fields.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none">
                      Required Fields to Enter Step
                    </label>
                    <div className="rounded-lg ring-1 ring-border-secondary p-3 space-y-2 max-h-32 overflow-y-auto">
                      {fields.map((field: Field) => (
                        <Checkbox
                          key={field.id}
                          label={field.label}
                          isSelected={stepForm.requiredFieldsToEnter.includes(field.name)}
                          onChange={() => toggleFieldInList(field.name, "enter")}
                        />
                      ))}
                    </div>
                  </div>
                )}

                 {fields.length > 0 && (
                   <div className="space-y-2">
                     <label className="text-sm font-medium leading-none">
                       Required Fields to Exit Step
                     </label>
                     <div className="rounded-lg ring-1 ring-border-secondary p-3 space-y-2 max-h-32 overflow-y-auto">
                       {fields.map((field: Field) => (
                         <Checkbox
                           key={field.id}
                           label={field.label}
                           isSelected={stepForm.requiredFieldsToExit.includes(field.name)}
                           onChange={() => toggleFieldInList(field.name, "exit")}
                         />
                       ))}
                     </div>
                   </div>
                 )}

                 {fields.length > 0 && (
                   <div className="space-y-2">
                     <label className="text-sm font-medium leading-none">
                       Campos deste Step
                     </label>
                     <div className="rounded-lg ring-1 ring-border-secondary p-3 space-y-2 max-h-32 overflow-y-auto">
                       {fields.map((field: Field) => (
                         <Checkbox
                           key={field.id}
                           label={field.label}
                           isSelected={stepForm.assignedFields.includes(field.name)}
                           onChange={() => toggleAssignedField(field.name)}
                         />
                       ))}
                     </div>
                     <p className="text-xs text-tertiary">
                       Fields assigned to this step will be grouped together in the workflow.
                     </p>
                   </div>
                 )}

                 <Checkbox
                   label="This is the final step (marks request as complete)"
                   isSelected={stepForm.isFinalStep}
                   onChange={(checked) => 
                     setStepForm({ ...stepForm, isFinalStep: checked === true })
                   }
                 />
              </form>
            </SlideoutMenu.Content>
            <SlideoutMenu.Footer className="flex items-center justify-end gap-3">
              <Button color="secondary" onClick={close}>
                Cancel
              </Button>
              <Button
                type="submit"
                form="step-form"
                isDisabled={createStepMutation.isPending || updateStepMutation.isPending}
              >
                {(createStepMutation.isPending || updateStepMutation.isPending) 
                  ? "Saving..." 
                  : editingStep ? "Save Changes" : "Add Step"}
              </Button>
            </SlideoutMenu.Footer>
          </>
        )}
      </SlideoutMenu>

      <AlertDialog open={!!stepToDelete} onOpenChange={(open) => !open && setStepToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete step?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove "{stepToDelete?.name}" from the workflow.
              If requests are currently on this step, deletion will fail.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteStep}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
