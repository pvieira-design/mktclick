"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";
import { Button } from "@/components/base/buttons/button";
import { Input as UntitledInput } from "@/components/base/input/input";
import { TextArea as UntitledTextArea } from "@/components/base/textarea/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, Save01 } from "@untitledui/icons";


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

  const handleNameChange = (newName: string) => {
    setName(newName);
    if (!isSlugManuallyEdited) {
      setSlug(slugify(newName));
    }
  };

  const handleSlugChange = (value: string) => {
    setSlug(value);
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
        <Button 
          href="/admin/content-types" 
          color="tertiary"
          iconLeading={ArrowLeft}
        />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">New Content Type</h1>
          <p className="text-muted-foreground">Create a new content type definition.</p>
        </div>
      </div>

      <Card className="!overflow-visible">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Content Type Details</CardTitle>
            <CardDescription>
              Define the properties for this content type.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 overflow-visible pb-6">
            <UntitledInput 
              label="Name"
              value={name} 
              onChange={handleNameChange} 
              placeholder="e.g. Blog Post" 
              isRequired
            />
            
            <UntitledInput 
              label="Slug"
              value={slug} 
              onChange={handleSlugChange} 
              placeholder="e.g. blog-post" 
              isRequired
              hint="Unique identifier used in URLs and API calls."
            />

            <UntitledTextArea 
              label="Description"
              value={description} 
              onChange={setDescription} 
              placeholder="Describe what this content type is used for..." 
              rows={3}
            />

            <div className="grid grid-cols-2 gap-4">
              <UntitledInput 
                label="Icon Name"
                value={icon} 
                onChange={setIcon} 
                placeholder="e.g. file-text" 
                hint="Lucide icon name (optional)."
              />

              <div className="space-y-1.5">
                <UntitledInput 
                  label="Color"
                  value={color} 
                  onChange={setColor} 
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
            <Button 
              href="/admin/content-types"
              color="tertiary"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              color="primary"
              isDisabled={createMutation.isPending}
              isLoading={createMutation.isPending}
              iconLeading={Save01}
            >
              Create Content Type
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
