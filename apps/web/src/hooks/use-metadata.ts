"use client";

import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";

export function useContentTypes() {
  const { data, isLoading, error } = useQuery(
    trpc.contentType.list.queryOptions()
  );

  return {
    data: data?.items ?? [],
    isLoading,
    error,
  };
}

export function useOrigins() {
  const { data, isLoading, error } = useQuery(
    trpc.origin.list.queryOptions()
  );

  return {
    data: data?.items ?? [],
    isLoading,
    error,
  };
}

export function useAreas() {
  const { data, isLoading, error } = useQuery(
    trpc.area.list.queryOptions()
  );

  return {
    data: data?.items ?? [],
    isLoading,
    error,
  };
}
