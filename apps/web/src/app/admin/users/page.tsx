"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";
import Link from "next/link";
import { Button } from "@/components/base/buttons/button";
import { Badge } from "@/components/base/badges/badges";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/base/input/input";
import { Select } from "@/components/base/select/select";
import { Plus, Edit01, SearchMd } from "@untitledui/icons";

interface User {
  id: string;
  name: string | null;
  email: string;
  role: "USER" | "ADMIN" | "SUPER_ADMIN";
  image: string | null;
  banned: boolean | null;
  mustChangePassword: boolean;
  createdAt: string;
  _count: {
    areaMemberships: number;
  };
}

const roleLabels: Record<string, string> = {
  USER: "User",
  ADMIN: "Admin",
  SUPER_ADMIN: "Super Admin",
};

export default function UsersListPage() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, isLoading, isError } = useQuery(
    trpc.user.list.queryOptions({
      search: search || undefined,
      role: roleFilter !== "all" ? roleFilter as "USER" | "ADMIN" | "SUPER_ADMIN" : undefined,
      page,
      limit,
    })
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground">
            Manage system users and their permissions.
          </p>
        </div>
        <Link href={"/admin/users/new" as any}>
          <Button iconLeading={Plus}>
            New User
          </Button>
        </Link>
      </div>

      <div className="flex gap-4">
        <div className="flex-1 max-w-sm">
          <Input
            icon={SearchMd}
            placeholder="Search by name or email..."
            value={search}
            onChange={(value) => {
              setSearch(value);
              setPage(1);
            }}
          />
        </div>
        <Select 
          selectedKey={roleFilter} 
          onSelectionChange={(key) => {
            if (key) {
              setRoleFilter(key as string);
              setPage(1);
            }
          }}
          placeholder="Filter by role"
          className="w-[180px]"
        >
          <Select.Item id="all" label="All Roles" />
          <Select.Item id="USER" label="User" />
          <Select.Item id="ADMIN" label="Admin" />
          <Select.Item id="SUPER_ADMIN" label="Super Admin" />
        </Select>
      </div>

      <div className="rounded-md border">
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b">
              <tr className="border-b transition-colors hover:bg-muted/50">
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Name</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Email</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Role</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Areas</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b transition-colors hover:bg-muted/50">
                    <td className="p-4"><Skeleton className="h-4 w-[150px]" /></td>
                    <td className="p-4"><Skeleton className="h-4 w-[200px]" /></td>
                    <td className="p-4"><Skeleton className="h-5 w-[80px]" /></td>
                    <td className="p-4"><Skeleton className="h-4 w-[40px]" /></td>
                    <td className="p-4"><Skeleton className="h-5 w-[60px]" /></td>
                    <td className="p-4 text-right"><Skeleton className="ml-auto h-8 w-8" /></td>
                  </tr>
                ))
              ) : isError ? (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-red-500">
                    Failed to load users.
                  </td>
                </tr>
              ) : data?.items && data.items.length > 0 ? (
                data.items.map((user: User) => (
                  <tr key={user.id} className="border-b transition-colors hover:bg-muted/50">
                    <td className="p-4 font-medium">{user.name || "Unnamed"}</td>
                    <td className="p-4 text-muted-foreground">{user.email}</td>
                    <td className="p-4">
                      {user.role === "USER" ? (
                        <Badge color="gray" type="pill-color" size="sm">
                          {roleLabels[user.role]}
                        </Badge>
                      ) : user.role === "ADMIN" ? (
                        <Badge color="gray" size="sm">
                          {roleLabels[user.role]}
                        </Badge>
                      ) : (
                        <Badge color="brand" size="sm">
                          {roleLabels[user.role]}
                        </Badge>
                      )}
                    </td>
                    <td className="p-4">
                      <Badge color="gray" type="pill-color" size="sm">{user._count.areaMemberships}</Badge>
                    </td>
                    <td className="p-4">
                      {user.banned ? (
                        <Badge color="error" size="sm">Banned</Badge>
                      ) : user.mustChangePassword ? (
                        <Badge color="gray" size="sm">Pending</Badge>
                      ) : (
                        <Badge color="success" size="sm">Active</Badge>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <Link 
                        href={`/admin/users/${user.id}/edit` as any}
                      >
                        <Button color="tertiary" size="sm" iconLeading={Edit01} />
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-muted-foreground">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {data && data.total > limit && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, data.total)} of {data.total} users
          </p>
          <div className="flex gap-2">
            <Button 
              color="secondary" 
              size="sm" 
              onClick={() => setPage(p => p - 1)}
              isDisabled={page === 1}
            >
              Previous
            </Button>
            <Button 
              color="secondary" 
              size="sm" 
              onClick={() => setPage(p => p + 1)}
              isDisabled={!data.hasMore}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
