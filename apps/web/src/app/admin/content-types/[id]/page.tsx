import { redirect } from "next/navigation";

export default async function ContentTypePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/admin/content-types/${id}/edit`);
}
