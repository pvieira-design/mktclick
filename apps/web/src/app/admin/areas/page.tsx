"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";
import Link from "next/link";
import { Button } from "@/components/base/buttons/button";
import { Badge } from "@/components/base/badges/badges";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Plus, Edit01, Power01, Users01 } from "@untitledui/icons";

interface Area {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  isActive: boolean;
  _count: {
    members: number;
  };
}

export default function AreasListPage() {
  const queryClient = useQueryClient();
  
  const { data, isLoading, isError } = useQuery(
    trpc.area.list.queryOptions()
  );

  const toggleActiveMutation = useMutation({
    ...(trpc.area.toggleActive.mutationOptions as any)(),
    onSuccess: () => {
      toast.success("Area status updated");
      queryClient.invalidateQueries({ queryKey: [["area", "list"]] });
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const handleToggleActive = (id: string) => {
    (toggleActiveMutation.mutate as any)({ id });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Areas</h1>
          <p className="text-muted-foreground">
            Manage work areas and teams in the system.
          </p>
        </div>
        <Link href={"/admin/areas/new" as any}>
          <Button iconLeading={Plus}>New Area</Button>
        </Link>
      </div>

      <div className="rounded-md border">
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b">
              <tr className="border-b transition-colors hover:bg-muted/50">
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Name</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Slug</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Description</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Members</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b transition-colors hover:bg-muted/50">
                    <td className="p-4"><Skeleton className="h-4 w-[150px]" /></td>
                    <td className="p-4"><Skeleton className="h-4 w-[100px]" /></td>
                    <td className="p-4"><Skeleton className="h-4 w-[200px]" /></td>
                    <td className="p-4"><Skeleton className="h-4 w-[40px]" /></td>
                    <td className="p-4"><Skeleton className="h-5 w-[60px]" /></td>
                    <td className="p-4 text-right"><Skeleton className="ml-auto h-8 w-[120px]" /></td>
                  </tr>
                ))
              ) : isError ? (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-red-500">
                    Failed to load areas.
                  </td>
                </tr>
              ) : data?.items && data.items.length > 0 ? (
                data.items.map((area: Area) => (
                  <tr key={area.id} className="border-b transition-colors hover:bg-muted/50">
                    <td className="p-4 font-medium">{area.name}</td>
                    <td className="p-4 text-muted-foreground">{area.slug}</td>
                    <td className="p-4 text-muted-foreground max-w-xs truncate">{area.description || "-"}</td>
                    <td className="p-4">
                      <Badge color="gray" type="pill-color" size="sm">{area._count.members}</Badge>
                    </td>
                    <td className="p-4">
                      <Badge color={area.isActive ? "success" : "gray"} type="pill-color" size="sm">
                        {area.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Link 
                          href={`/admin/areas/${area.id}/members` as any}
                          title="Manage Members"
                        >
                          <Button color="tertiary" size="sm" iconLeading={Users01} />
                        </Link>
                        <Button 
                          color="tertiary" 
                          size="sm"
                          iconLeading={Power01}
                          onClick={() => handleToggleActive(area.id)}
                          isDisabled={toggleActiveMutation.isPending}
                          title={area.isActive ? "Deactivate" : "Activate"}
                          className={area.isActive ? "text-green-600" : "text-muted-foreground"}
                        />
                        <Link 
                          href={`/admin/areas/${area.id}/edit` as any}
                        >
                          <Button color="tertiary" size="sm" iconLeading={Edit01} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-muted-foreground">
                    No areas found. Create one to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
