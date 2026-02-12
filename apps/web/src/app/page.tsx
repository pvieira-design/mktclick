import { auth } from "@marketingclickcannabis/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session?.user) {
    if (session.user.role === "CREATOR_ONLY") {
      redirect("/criadores");
    }
    redirect("/dashboard");
  }

  redirect("/login");
}
