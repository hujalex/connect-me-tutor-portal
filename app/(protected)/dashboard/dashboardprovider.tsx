"use client"; // This needs to be at the top to declare a client component

import React, { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/dashboard/dashboard-layout"; // Assuming Sidebar component is available
import { ProfileContextProvider, useProfile } from "@/contexts/profileContext";
import { useFetchProfile } from "@/hooks/auth";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fetchExternalImage } from "next/dist/server/image-optimizer";
import { Profile } from "@/types";
import ErrorBoundary from "next/dist/client/components/error-boundary";
import GlobalError from "./error";
import { DashboardContextProvider } from "@/contexts/dashboardContext";

export default function DashboardProviders({
  children,
  initialProfile,

}: {
  children: React.ReactNode;
  initialProfile: Profile | null;
}) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={queryClient}>
      <ProfileContextProvider initialProfile={initialProfile}>
       {children}
      </ProfileContextProvider>
    </QueryClientProvider>
  );
}
