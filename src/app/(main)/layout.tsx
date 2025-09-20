"use client";

import { AuthButton } from "@/components/auth-button";
import { Logo } from "@/components/logo";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarSeparator,
  SidebarGroup,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/use-auth";
import { Home, PlusSquare, Tags, Loader2 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { MyContentList } from "@/components/my-content-list";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/topics", label: "Topics", icon: Tags },
  { href: "/upload", label: "Upload", icon: PlusSquare },
];

export default function MainLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { loading, user } = useAuth();

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center justify-between">
            <Logo />
            <SidebarTrigger />
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href}
                  tooltip={item.label}
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
          {user && (
            <>
              <SidebarSeparator />
              <SidebarGroup>
                <SidebarGroupLabel>My Content</SidebarGroupLabel>
                <SidebarGroupContent>
                  <MyContentList />
                </SidebarGroupContent>
              </SidebarGroup>
            </>
          )}
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-16 items-center justify-end border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6 lg:px-8">
          <AuthButton />
        </header>
        <main className="flex-1">
          {loading && (
            <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
          {!loading && children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
