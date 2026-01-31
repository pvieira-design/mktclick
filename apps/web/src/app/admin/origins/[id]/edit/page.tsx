"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { TextArea } from "@/components/base/textarea/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { ArrowLeft, Save01 } from "@untitledui/icons";
import Link from "next/link";

export default function EditOriginPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");

  const { data, isLoading } = useQuery(
    trpc.origin.getById.queryOptions({ id })
  );

  const updateMutation = useMutation({
    ...(trpc.origin.update.mutationOptions as any)(),
    onSuccess: () => {
       toast.success("Origem atualizada com sucesso");
       router.push("/admin/origins" as any);
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    }
  });

  useEffect(() => {
    if (data) {
      setName(data.name);
      setSlug(data.slug);
      setDescription(data.description || "");
    }
  }, [data]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    (updateMutation.mutate as any)({
      id,
      name,
      slug,
      description: description || undefined,
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-[200px]" />
            <Skeleton className="h-4 w-[300px]" />
          </div>
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-[150px]" />
            <Skeleton className="h-4 w-[250px]" />
          </CardHeader>
          <CardContent className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-[80px]" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link 
          href={"/admin/origins" as any}
        >
          <Button color="tertiary" size="sm" iconLeading={ArrowLeft} />
        </Link>
         <div>
           <h1 className="text-2xl font-bold tracking-tight">Editar Origem</h1>
           <p className="text-muted-foreground">Atualize as propriedades da origem.</p>
         </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
           <CardHeader>
             <CardTitle>Detalhes da Origem</CardTitle>
             <CardDescription>
               Modifique as propriedades desta origem.
             </CardDescription>
           </CardHeader>
          <CardContent className="space-y-4">
             <Input 
               label="Nome"
               value={name} 
               onChange={(value) => setName(value)} 
               placeholder="Ex: Equipe Interna" 
               isRequired 
             />
            
             <Input 
               label="Slug"
               value={slug} 
               onChange={(value) => setSlug(value)} 
               placeholder="ex: equipe-interna" 
               isRequired 
               hint="Identificador único usado em URLs e chamadas de API."
             />

             <TextArea 
               label="Descrição"
               value={description} 
               onChange={(value) => setDescription(value)} 
               placeholder="Descreva o que esta origem representa..." 
               rows={3}
             />
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
             <Link 
               href={"/admin/origins" as any}
             >
               <Button color="secondary">
                 Cancelar
               </Button>
             </Link>
             <Button 
               type="submit" 
               isDisabled={updateMutation.isPending}
               isLoading={updateMutation.isPending}
               iconLeading={Save01}
             >
               Salvar Alterações
             </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
