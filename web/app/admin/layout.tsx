import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/admin/Sidebar";
import { Topbar } from "@/components/admin/Topbar";
import { SidebarProvider } from "@/contexts/SidebarContext";
import { Toaster } from "sonner";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Defense in depth: middleware already handles this, but layout double-checks.
  if (!user) {
    redirect("/admin/login");
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden bg-navy">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Topbar />
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
      <Toaster position="bottom-right" theme="dark" richColors />
    </SidebarProvider>
  );
}
