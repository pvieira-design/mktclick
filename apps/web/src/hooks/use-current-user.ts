"use client";

import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";

export interface AreaMembership {
  id: string;
  areaId: string;
  position: string;
  area: {
    id: string;
    name: string;
    slug: string;
  };
}

export interface CurrentUser {
  id: string;
  name: string | null;
  email: string;
  role: string;
  areaMemberships: AreaMembership[];
}

export function useCurrentUser() {
  const { data, isLoading, error, refetch } = useQuery(
    trpc.user.me.queryOptions()
  );

  return {
    user: data as CurrentUser | undefined,
    isLoading,
    error,
    refetch,
    areaMemberships: data?.areaMemberships ?? [],
  };
}

export default useCurrentUser;
