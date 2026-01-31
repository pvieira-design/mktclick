"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";
import { Button } from "@/components/base/buttons/button";
import { Badge } from "@/components/base/badges/badges";
import { Table, TableCard } from "@/components/application/table/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/base/input/input";
import { Select } from "@/components/base/select/select";
import { NewUserDrawer } from "@/components/user/new-user-drawer";
import { EditUserDrawer } from "@/components/user/edit-user-drawer";
import { Plus, Edit01, SearchMd, FilterLines } from "@untitledui/icons";

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
  USER: "Usuário",
  ADMIN: "Admin",
  SUPER_ADMIN: "Super Admin",
};

export default function UsersListPage() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [isNewDrawerOpen, setIsNewDrawerOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const limit = 20;

  const { data, isLoading } = useQuery(
    trpc.user.list.queryOptions({
      search: search || undefined,
      role: roleFilter !== "all" ? roleFilter as "USER" | "ADMIN" | "SUPER_ADMIN" : undefined,
      page,
      limit,
    })
  );

  const columns = [
    { id: "name", label: "Nome" },
    { id: "email", label: "E-mail" },
    { id: "role", label: "Função" },
    { id: "areas", label: "Áreas" },
    { id: "status", label: "Status" },
    { id: "actions", label: "Ações" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Usuários</h1>
          <p className="text-tertiary">
            Gerencie usuários do sistema e suas permissões.
          </p>
        </div>
        <Button iconLeading={Plus} onClick={() => setIsNewDrawerOpen(true)}>
          Novo Usuário
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="flex-1 max-w-sm">
           <Input
             icon={SearchMd}
             placeholder="Buscar por nome ou e-mail..."
             value={search}
             onChange={(value) => {
               setSearch(value);
               setPage(1);
             }}
           />
        </div>
         <Select 
           aria-label="Filtrar por função"
           selectedKey={roleFilter} 
           onSelectionChange={(key) => {
             if (key) {
               setRoleFilter(key as string);
               setPage(1);
             }
           }}
           placeholder="Filtrar por função"
           placeholderIcon={FilterLines}
           className="w-[180px]"
         >
           <Select.Item id="all" label="Todas as Funções" />
           <Select.Item id="USER" label="Usuário" />
           <Select.Item id="ADMIN" label="Admin" />
           <Select.Item id="SUPER_ADMIN" label="Super Admin" />
         </Select>
      </div>

      <TableCard.Root size="sm">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
         ) : (data?.items ?? []).length === 0 ? (
           <div className="p-8 text-center text-tertiary">
             Nenhum usuário encontrado.
           </div>
        ) : (
           <Table size="sm" aria-label="Usuários">
            <Table.Header columns={columns}>
              {(column) => (
                <Table.Head 
                  key={column.id} 
                  id={column.id} 
                  label={column.label}
                  isRowHeader={column.id === "name"}
                />
              )}
            </Table.Header>
            <Table.Body items={data?.items ?? []}>
              {(user: User) => (
                <Table.Row key={user.id} id={user.id}>
                   <Table.Cell className="font-medium text-primary">
                     {user.name || "Sem nome"}
                   </Table.Cell>
                  <Table.Cell>
                    {user.email}
                  </Table.Cell>
                  <Table.Cell>
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
                  </Table.Cell>
                  <Table.Cell>
                    <Badge color="gray" type="pill-color" size="sm">
                      {user._count.areaMemberships}
                    </Badge>
                  </Table.Cell>
                   <Table.Cell>
                     {user.banned ? (
                       <Badge color="error" size="sm">Banido</Badge>
                     ) : user.mustChangePassword ? (
                       <Badge color="gray" size="sm">Pendente</Badge>
                     ) : (
                       <Badge color="success" size="sm">Ativo</Badge>
                     )}
                   </Table.Cell>
                  <Table.Cell>
                    <Button 
                      color="tertiary"
                      size="sm"
                      iconLeading={Edit01}
                      onClick={() => setEditingUserId(user.id)}
                    />
                  </Table.Cell>
                </Table.Row>
              )}
            </Table.Body>
          </Table>
        )}
      </TableCard.Root>

      {data && data.total > limit && (
        <div className="flex items-center justify-between">
           <p className="text-sm text-tertiary">
             Exibindo {((page - 1) * limit) + 1} a {Math.min(page * limit, data.total)} de {data.total} usuários
           </p>
          <div className="flex gap-2">
             <Button 
               color="secondary" 
               size="sm" 
               onClick={() => setPage(p => p - 1)}
               isDisabled={page === 1}
             >
               Anterior
             </Button>
             <Button 
               color="secondary" 
               size="sm" 
               onClick={() => setPage(p => p + 1)}
               isDisabled={!data.hasMore}
             >
               Próximo
             </Button>
          </div>
        </div>
      )}

      <NewUserDrawer
        open={isNewDrawerOpen}
        onOpenChange={setIsNewDrawerOpen}
      />

      <EditUserDrawer
        open={!!editingUserId}
        onOpenChange={(open) => !open && setEditingUserId(null)}
        userId={editingUserId}
      />
    </div>
  );
}
