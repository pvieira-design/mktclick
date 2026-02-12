import { auth } from "@marketingclickcannabis/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { ProfileWidget } from "@/components/profile-widget";
import { Sidebar } from "@/components/sidebar";

export default async function LibraryLayout({
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

  if (session.user.role === "CREATOR_ONLY") {
    redirect("/criadores");
  }

  return (
    <div className="flex h-screen">
      <Sidebar userRole={session.user.role ?? undefined}>
        <ProfileWidget session={session} />
      </Sidebar>
      <main className="flex-1 overflow-auto p-6">{children}</main>
    </div>
  );
}
