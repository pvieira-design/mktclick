"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Edit, Search } from "lucide-react";

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

const roleColors: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  USER: "outline",
  ADMIN: "secondary",
  SUPER_ADMIN: "default",
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
        <Link href={"/admin/users/new" as any} className={buttonVariants()}>
          <Plus className="mr-2 h-4 w-4" />
          New User
        </Link>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9"
          />
        </div>
        <Select 
          value={roleFilter} 
          onValueChange={(value) => {
            if (value) {
              setRoleFilter(value);
              setPage(1);
            }
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="USER">User</SelectItem>
            <SelectItem value="ADMIN">Admin</SelectItem>
            <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
          </SelectContent>
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
                      <Badge variant={roleColors[user.role]}>
                        {roleLabels[user.role]}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <Badge variant="outline">{user._count.areaMemberships}</Badge>
                    </td>
                    <td className="p-4">
                      {user.banned ? (
                        <Badge variant="destructive">Banned</Badge>
                      ) : user.mustChangePassword ? (
                        <Badge variant="secondary">Pending</Badge>
                      ) : (
                        <Badge variant="default">Active</Badge>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <Link 
                        href={`/admin/users/${user.id}/edit` as any}
                        className={buttonVariants({ variant: "ghost", size: "icon" })}
                      >
                        <Edit className="h-4 w-4" />
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
              variant="outline" 
              size="sm" 
              onClick={() => setPage(p => p - 1)}
              disabled={page === 1}
            >
              Previous
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setPage(p => p + 1)}
              disabled={!data.hasMore}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
