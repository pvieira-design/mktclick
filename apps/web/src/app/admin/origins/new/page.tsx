"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

export default function NewOriginPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);

  const createMutation = useMutation({
    ...(trpc.origin.create.mutationOptions as any)(),
    onSuccess: () => {
      toast.success("Origin created successfully");
      router.push("/admin/origins" as any);
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    }
  });

  const slugify = (text: string) => {
    return text
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);
    if (!isSlugManuallyEdited) {
      setSlug(slugify(newName));
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlug(e.target.value);
    setIsSlugManuallyEdited(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    (createMutation.mutate as any)({
      name,
      slug,
      description: description || undefined,
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link 
          href={"/admin/origins" as any}
          className={buttonVariants({ variant: "ghost", size: "icon" })}
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">New Origin</h1>
          <p className="text-muted-foreground">Create a new production origin.</p>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Origin Details</CardTitle>
            <CardDescription>
              Define the properties for this origin.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name <span className="text-red-500">*</span></Label>
              <Input 
                id="name" 
                value={name} 
                onChange={handleNameChange} 
                placeholder="e.g. Internal Team" 
                required 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="slug">Slug <span className="text-red-500">*</span></Label>
              <Input 
                id="slug" 
                value={slug} 
                onChange={handleSlugChange} 
                placeholder="e.g. internal-team" 
                required 
              />
              <p className="text-xs text-muted-foreground">
                Unique identifier used in URLs and API calls.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                placeholder="Describe what this origin represents..." 
                rows={3}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Link 
              href={"/admin/origins" as any}
              className={buttonVariants({ variant: "outline" })}
            >
              Cancel
            </Link>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Creating..." : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Create Origin
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
