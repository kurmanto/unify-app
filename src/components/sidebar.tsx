"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Calendar,
  Users,
  StickyNote,
  FileText,
  Mail,
  BarChart3,
  Settings,
  LogOut,
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

const practiceNav = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Schedule", href: "/schedule", icon: Calendar },
  { title: "Clients", href: "/clients", icon: Users },
  { title: "SOAP Notes", href: "/notes", icon: StickyNote },
  { title: "Forms", href: "/forms", icon: FileText },
];

const marketingNav = [
  { title: "Campaigns", href: "/campaigns", icon: Mail },
];

const insightsNav = [
  { title: "Analytics", href: "/analytics", icon: BarChart3 },
  { title: "Settings", href: "/settings", icon: Settings },
];

function NavContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const supabase = createClient();
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserEmail(data.user?.email ?? null);
    });
  }, [supabase]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  function renderNavItems(items: typeof practiceNav) {
    return items.map((item) => {
      const isActive =
        pathname === item.href ||
        (item.href !== "/dashboard" && pathname.startsWith(item.href));
      return (
        <Link
          key={item.href}
          href={item.href}
          onClick={onNavigate}
          className={cn(
            "flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[13px] font-medium transition-colors",
            isActive
              ? "bg-sidebar-primary text-sidebar-primary-foreground font-semibold"
              : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
          )}
        >
          <item.icon className="h-4 w-4" />
          {item.title}
        </Link>
      );
    });
  }

  const initials = userEmail
    ? userEmail.split("@")[0].slice(0, 2).toUpperCase()
    : "U";
  const displayName = userEmail
    ? userEmail.split("@")[0].replace(/[._]/g, " ")
    : "";

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center px-5">
        <Link href="/dashboard" className="flex items-center gap-2" onClick={onNavigate}>
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
            <span className="text-sm font-bold text-primary-foreground">U</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-sidebar-foreground">Unify</span>
        </Link>
      </div>
      <ScrollArea className="flex-1 px-3 py-2">
        <div className="section-label">Practice</div>
        <nav className="space-y-0.5">
          {renderNavItems(practiceNav)}
        </nav>
        <div className="section-label">Marketing</div>
        <nav className="space-y-0.5">
          {renderNavItems(marketingNav)}
        </nav>
        <div className="section-label">Insights</div>
        <nav className="space-y-0.5">
          {renderNavItems(insightsNav)}
        </nav>
      </ScrollArea>
      <div className="border-t border-sidebar-border p-3">
        {userEmail && (
          <div className="mb-2 flex items-center gap-2.5 px-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-sidebar-accent text-[11px] font-semibold text-sidebar-foreground">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-[13px] font-medium capitalize text-sidebar-foreground">{displayName}</p>
              <p className="truncate text-[11px] text-sidebar-foreground/50">Practitioner</p>
            </div>
          </div>
        )}
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[13px] font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </div>
  );
}

export function Sidebar() {
  return (
    <aside className="hidden w-64 bg-sidebar sidebar-floating lg:block">
      <NavContent />
    </aside>
  );
}

export function MobileSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 bg-sidebar text-sidebar-foreground p-0">
        <NavContent onNavigate={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}
