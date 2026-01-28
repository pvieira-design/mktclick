"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";
import { Button } from "@/components/base/buttons/button";
import { Input as UntitledInput } from "@/components/base/input/input";
import { TextArea } from "@/components/base/textarea/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { ArrowLeft, Save01 } from "@untitledui/icons";
import Link from "next/link";

export default function EditContentTypePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("");
  const [color, setColor] = useState("#000000");

  const { data, isLoading } = useQuery(
    trpc.contentType.getById.queryOptions({ id })
  );

  const updateMutation = useMutation({
    ...(trpc.contentType.update.mutationOptions as any)(),
    onSuccess: () => {
      toast.success("Content Type updated successfully");
      router.push("/admin/content-types" as any);
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
      setIcon(data.icon || "");
      setColor(data.color || "#000000");
    }
  }, [data]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    (updateMutation.mutate as any)({
      id,
      name,
      slug,
      description: description || undefined,
      icon: icon || undefined,
      color,
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
            {Array.from({ length: 4 }).map((_, i) => (
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
          href="/admin/content-types"
        >
          <Button color="tertiary" size="sm" iconLeading={ArrowLeft} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit Content Type</h1>
          <p className="text-muted-foreground">Update content type properties.</p>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Content Type Details</CardTitle>
            <CardDescription>
              Modify the properties for this content type.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <UntitledInput 
              label="Name"
              value={name} 
              onChange={(value) => setName(value)} 
              placeholder="e.g. Blog Post" 
              isRequired 
            />
            
            <UntitledInput 
              label="Slug"
              value={slug} 
              onChange={(value) => setSlug(value)} 
              placeholder="e.g. blog-post" 
              isRequired 
              hint="Unique identifier used in URLs and API calls."
            />

            <TextArea 
              label="Description"
              value={description} 
              onChange={(value) => setDescription(value)} 
              placeholder="Describe what this content type is used for..." 
              rows={3}
            />

            <div className="grid grid-cols-2 gap-4">
              <UntitledInput 
                label="Icon Name"
                value={icon} 
                onChange={(value) => setIcon(value)} 
                placeholder="e.g. file-text" 
                hint="Lucide icon name (optional)."
              />

              <div className="space-y-1.5">
                <UntitledInput 
                  label="Color"
                  value={color} 
                  onChange={(value) => setColor(value)} 
                  placeholder="#000000" 
                  isRequired
                />
                <Input 
                  type="color" 
                  value={color} 
                  onChange={(e) => setColor(e.target.value)} 
                  className="w-full h-10 p-1 cursor-pointer rounded-lg"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Link 
              href="/admin/content-types"
            >
              <Button color="secondary">
                Cancel
              </Button>
            </Link>
            <Button 
              type="submit" 
              isDisabled={updateMutation.isPending}
              isLoading={updateMutation.isPending}
              iconLeading={Save01}
            >
              Save Changes
            </Button>
          </CardFooter>
         </form>
       </Card>

       <Card className="mt-6">
         <CardHeader>
           <CardTitle className="text-lg">Configuration</CardTitle>
           <CardDescription>
             Configure custom fields and workflow for this content type.
           </CardDescription>
         </CardHeader>
         <CardContent className="grid gap-4 sm:grid-cols-2">
           <Link
             href={`/admin/content-types/${id}/fields` as any}
             className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
           >
             <div>
               <p className="font-medium">Custom Fields</p>
               <p className="text-sm text-muted-foreground">
                 Configure form fields for requests of this type
               </p>
             </div>
             <ArrowLeft className="h-4 w-4 rotate-180" />
           </Link>
           <Link
             href={`/admin/content-types/${id}/workflow` as any}
             className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
           >
             <div>
               <p className="font-medium">Workflow Steps</p>
               <p className="text-sm text-muted-foreground">
                 Configure approval workflow for this type
               </p>
             </div>
             <ArrowLeft className="h-4 w-4 rotate-180" />
           </Link>
         </CardContent>
       </Card>
     </div>
   );
}
