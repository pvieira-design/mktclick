"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Edit, Plus, Power } from "lucide-react";
import { toast } from "sonner";

export default function ContentTypesPage() {
  const queryClient = useQueryClient();
  
  const { data, isLoading } = useQuery(
    trpc.contentType.list.queryOptions()
  );
  
  const toggleActiveMutation = useMutation({
    ...(trpc.contentType.toggleActive.mutationOptions as any)(),
    onSuccess: () => {
      toast.success("Status updated");
      queryClient.invalidateQueries({ queryKey: [["contentType", "list"]] });
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    }
  });

  const handleToggleActive = (id: string) => {
    (toggleActiveMutation.mutate as any)({ id });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Content Types</h1>
          <p className="text-muted-foreground">
            Manage the types of content available in the system.
          </p>
        </div>
        <Link href="/admin/content-types/new" className={buttonVariants()}>
          <Plus className="mr-2 h-4 w-4" />
          New Content Type
        </Link>
      </div>

      <div className="rounded-md border">
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b">
              <tr className="border-b transition-colors hover:bg-muted/50">
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Name</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Slug</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Color</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Icon</th>
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
                    <td className="p-4"><Skeleton className="h-6 w-6 rounded" /></td>
                    <td className="p-4"><Skeleton className="h-4 w-[80px]" /></td>
                    <td className="p-4"><Skeleton className="h-5 w-[60px]" /></td>
                    <td className="p-4 text-right"><Skeleton className="ml-auto h-8 w-[80px]" /></td>
                  </tr>
                ))
              ) : data?.items && data.items.length > 0 ? (
                data.items.map((item) => (
                  <tr key={item.id} className="border-b transition-colors hover:bg-muted/50">
                    <td className="p-4 font-medium">{item.name}</td>
                    <td className="p-4 text-muted-foreground">{item.slug}</td>
                    <td className="p-4">
                      <div 
                        className="h-6 w-6 rounded border shadow-sm" 
                        style={{ backgroundColor: item.color || '#cccccc' }} 
                        title={item.color || 'No color'}
                      />
                    </td>
                    <td className="p-4 text-muted-foreground">{item.icon || '-'}</td>
                    <td className="p-4">
                      <Badge variant={item.isActive ? "default" : "secondary"}>
                        {item.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleToggleActive(item.id)}
                          disabled={toggleActiveMutation.isPending}
                          title={item.isActive ? "Deactivate" : "Activate"}
                        >
                          <Power className={`h-4 w-4 ${item.isActive ? "text-green-600" : "text-muted-foreground"}`} />
                        </Button>
                        <Link 
                          href={`/admin/content-types/${item.id}/edit`}
                          className={buttonVariants({ variant: "ghost", size: "icon" })}
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-muted-foreground">
                    No content types found. Create one to get started.
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
