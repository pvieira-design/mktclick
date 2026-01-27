import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@marketingclickcannabis/auth";
import Link from "next/link";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  // Only SUPER_ADMIN can access admin panel
  if (session.user.role !== "SUPER_ADMIN") {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 border-r bg-muted/30 p-4">
        <div className="mb-6">
          <h2 className="text-lg font-semibold">Admin Panel</h2>
          <p className="text-sm text-muted-foreground">Configurações do sistema</p>
        </div>
        <nav className="space-y-1">
          <Link
            href="/admin/content-types"
            className="block rounded-md px-3 py-2 text-sm hover:bg-muted"
          >
            Content Types
          </Link>
          <Link
            href="/admin/origins"
            className="block rounded-md px-3 py-2 text-sm hover:bg-muted"
          >
            Origins
          </Link>
          <Link
            href="/admin/areas"
            className="block rounded-md px-3 py-2 text-sm hover:bg-muted"
          >
            Areas
          </Link>
        </nav>
        <div className="mt-8 pt-4 border-t">
          <Link
            href="/dashboard"
            className="block rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted"
          >
            ← Voltar ao Dashboard
          </Link>
        </div>
      </aside>
      
      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  );
}
