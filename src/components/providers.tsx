import { AuthProvider } from "@/lib/auth-provider";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
