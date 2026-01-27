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

export default function NewContentTypePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("");
  const [color, setColor] = useState("#000000");
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);

  const createMutation = useMutation({
    ...(trpc.contentType.create.mutationOptions as any)(),
    onSuccess: () => {
      toast.success("Content Type created successfully");
      router.push("/admin/content-types" as any);
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
      icon: icon || undefined,
      color,
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link 
          href="/admin/content-types" 
          className={buttonVariants({ variant: "ghost", size: "icon" })}
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">New Content Type</h1>
          <p className="text-muted-foreground">Create a new content type definition.</p>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Content Type Details</CardTitle>
            <CardDescription>
              Define the properties for this content type.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name <span className="text-red-500">*</span></Label>
              <Input 
                id="name" 
                value={name} 
                onChange={handleNameChange} 
                placeholder="e.g. Blog Post" 
                required 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="slug">Slug <span className="text-red-500">*</span></Label>
              <Input 
                id="slug" 
                value={slug} 
                onChange={handleSlugChange} 
                placeholder="e.g. blog-post" 
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
                placeholder="Describe what this content type is used for..." 
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="icon">Icon Name</Label>
                <Input 
                  id="icon" 
                  value={icon} 
                  onChange={(e) => setIcon(e.target.value)} 
                  placeholder="e.g. file-text" 
                />
                <p className="text-xs text-muted-foreground">
                  Lucide icon name (optional).
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="color">Color <span className="text-red-500">*</span></Label>
                <div className="flex gap-2">
                  <Input 
                    id="color" 
                    type="color" 
                    value={color} 
                    onChange={(e) => setColor(e.target.value)} 
                    className="w-12 h-10 p-1 cursor-pointer"
                    required
                  />
                  <Input 
                    value={color} 
                    onChange={(e) => setColor(e.target.value)} 
                    placeholder="#000000" 
                    pattern="^#[0-9A-Fa-f]{6}$"
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Link 
              href="/admin/content-types"
              className={buttonVariants({ variant: "outline" })}
            >
              Cancel
            </Link>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Creating..." : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Create Content Type
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
