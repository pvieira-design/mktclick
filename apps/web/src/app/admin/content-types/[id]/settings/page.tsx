"use client";

import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";
import { Checkbox } from "@/components/base/checkbox/checkbox";
import { toast } from "sonner";

interface Area {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
}

export default function ContentTypeSettingsPage() {
  const params = useParams();
  const contentTypeId = params.id as string;
  const queryClient = useQueryClient();

  const { data: areasData } = useQuery(trpc.area.list.queryOptions());

  const { data: permissionsData } = useQuery(
    trpc.workflow.getAreaPermissions.queryOptions({ contentTypeId })
  );

  const setPermissionMutation = useMutation({
    ...(trpc.workflow.setAreaPermission.mutationOptions as any)(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [["workflow", "getAreaPermissions"]] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const areas = areasData?.items || [];
  const permissions = permissionsData || [];

  const getAreaPermission = (areaId: string) => {
    return permissions.find((p: any) => p.areaId === areaId)?.canCreate || false;
  };

  const handlePermissionToggle = (areaId: string, currentValue: boolean) => {
    (setPermissionMutation.mutate as any)({
      contentTypeId,
      areaId,
      canCreate: !currentValue,
    });
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-primary shadow-xs ring-1 ring-border-secondary">
        <div className="px-6 pt-6">
          <h2 className="text-lg font-semibold text-primary">Permissões por Área</h2>
          <p className="text-sm text-tertiary mt-1">
            Selecione quais áreas podem criar solicitações deste tipo.
          </p>
        </div>
        <div className="px-6 pb-6 pt-4">
          <div className="space-y-3">
            {areas.map((area: Area) => (
              <div key={area.id} className="flex items-center justify-between p-3 rounded-lg ring-1 ring-border-secondary">
                <span className="font-medium">{area.name}</span>
                <Checkbox
                  isSelected={getAreaPermission(area.id)}
                  onChange={() => handlePermissionToggle(area.id, getAreaPermission(area.id))}
                  isDisabled={setPermissionMutation.isPending}
                />
              </div>
            ))}
            {areas.length === 0 && (
              <p className="text-sm text-tertiary">Nenhuma área disponível.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
