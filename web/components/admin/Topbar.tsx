import { createClient } from "@/lib/supabase/server";
import { logoutAction } from "@/lib/actions/auth";
import { HamburgerButton } from "@/components/admin/HamburgerButton";

export async function Topbar() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="h-14 bg-navy-2 border-b border-white/5 flex items-center justify-between px-6">
      <HamburgerButton />
      <div className="flex items-center gap-4">
        <span className="text-brand-gray text-sm">{user?.email}</span>
        <form action={logoutAction}>
          <button
            type="submit"
            className="text-brand-gray hover:text-accent text-sm font-medium transition-colors"
          >
            Salir
          </button>
        </form>
      </div>
    </header>
  );
}
