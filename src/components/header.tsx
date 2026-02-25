"use client";

import { MobileSidebar } from "@/components/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Settings, LogOut, ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const pageNames: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/schedule": "Schedule",
  "/clients": "Clients",
  "/appointments": "Appointments",
  "/notes": "SOAP Notes",
  "/forms": "Forms",
  "/campaigns": "Campaigns",
  "/analytics": "Analytics",
  "/settings": "Settings",
};

export function Header() {
  const supabase = createClient();
  const pathname = usePathname();

  const currentPage = Object.entries(pageNames).find(
    ([path]) => pathname === path || (path !== "/dashboard" && pathname.startsWith(path))
  );

  async function handleSignOut() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <header className="flex h-14 items-center gap-4 header-blur border-b border-border/50 sticky top-0 z-10 px-4 lg:px-6">
      <MobileSidebar />
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>Unify</span>
        {currentPage && (
          <>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground font-medium">{currentPage[1]}</span>
          </>
        )}
      </div>
      <div className="flex-1" />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 rounded-full outline-none ring-ring focus-visible:ring-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                TK
              </AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Tomer Kurman</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/settings">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
