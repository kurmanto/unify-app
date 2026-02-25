import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex h-screen overflow-hidden bg-muted/50 p-3 gap-3">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden rounded-xl bg-background border shadow-sm">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 animate-page-in [scrollbar-gutter:stable]">{children}</main>
      </div>
    </div>
  );
}
