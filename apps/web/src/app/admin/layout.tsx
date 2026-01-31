import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@marketingclickcannabis/auth";

import { ProfileWidget } from "@/components/profile-widget";
import { Sidebar } from "@/components/sidebar";

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

  if (!session.user.role || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
    redirect("/dashboard");
  }

  return (
    <div className="flex h-screen">
      <Sidebar userRole={session.user.role}>
        <ProfileWidget session={session} />
      </Sidebar>
      <main className="flex-1 overflow-auto bg-secondary p-8">{children}</main>
    </div>
  );
}
