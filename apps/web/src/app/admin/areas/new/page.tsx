"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { TextArea } from "@/components/base/textarea/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, Save01 } from "@untitledui/icons";
import Link from "next/link";

export default function NewAreaPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);

  const createMutation = useMutation({
    ...(trpc.area.create.mutationOptions as any)(),
    onSuccess: () => {
      toast.success("Area created successfully");
      router.push("/admin/areas" as any);
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

  const handleNameChange = (value: string) => {
    setName(value);
    if (!isSlugManuallyEdited) {
      setSlug(slugify(value));
    }
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
          href={"/admin/areas" as any}
        >
          <Button color="tertiary" size="sm" iconLeading={ArrowLeft} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">New Area</h1>
          <p className="text-muted-foreground">Create a new work area or team.</p>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Area Details</CardTitle>
            <CardDescription>
              Define the properties for this area.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input 
              label="Name"
              value={name}
              onChange={handleNameChange}
              placeholder="e.g. Design Team"
              isRequired
            />
            
            <Input 
              label="Slug"
              value={slug}
              onChange={(value) => { setSlug(value); setIsSlugManuallyEdited(true); }}
              placeholder="e.g. design-team"
              isRequired
              hint="Unique identifier used in URLs and API calls."
            />

            <TextArea 
              label="Description"
              value={description}
              onChange={(value) => setDescription(value)}
              placeholder="Describe what this area is responsible for..."
              rows={3}
            />
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Link 
              href={"/admin/areas" as any}
            >
              <Button color="secondary">Cancel</Button>
            </Link>
            <Button 
              type="submit" 
              isDisabled={createMutation.isPending} 
              isLoading={createMutation.isPending} 
              iconLeading={Save01}
            >
              Create Area
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
