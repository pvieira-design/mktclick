"use client";

import { LogOut01, User01 } from "@untitledui/icons";
import { useRouter } from "next/navigation";

import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/base/buttons/button";
import { Avatar } from "@/components/base/avatar/avatar";
import { Skeleton } from "./ui/skeleton";

type Session = typeof authClient.$Infer.Session;

interface ProfileWidgetProps {
  session: Session | null;
}

export function ProfileWidget({ session }: ProfileWidgetProps) {
  const router = useRouter();

  if (!session) {
    return (
      <div className="space-y-2 p-3">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    );
  }

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/login");
          router.refresh();
        },
      },
    });
  };

  return (
    <div className="p-3">
      <div className="flex items-center gap-3">
        <Avatar size="md" placeholderIcon={User01} />
        <div className="flex-1 overflow-hidden">
          <p className="truncate text-sm font-semibold text-primary">{session.user.name}</p>
          <p className="truncate text-xs text-tertiary">
            {session.user.email}
          </p>
        </div>
      </div>
      <Button
        color="tertiary"
        size="sm"
        className="mt-3 w-full justify-start"
        onClick={handleSignOut}
        iconLeading={LogOut01}
      >
        Sair
      </Button>
    </div>
  );
}
