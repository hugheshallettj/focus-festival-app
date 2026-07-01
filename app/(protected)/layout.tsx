import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/auth/login");
  }

  // Fetch the user's profile from public.users to check for gender
  const { data: profile } = await supabase
    .from("users")
    .select("gender")
    .eq("id", user.id)
    .single();

  if (!profile?.gender) {
    return redirect("/onboarding");
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-5xl mx-auto flex h-16 items-center px-4 md:px-8 justify-between">
          <div className="flex items-center gap-6">
            <a href="/dashboard" className="flex items-center space-x-2">
              <span className="font-bold sm:inline-block">Focus Festival</span>
            </a>
            <nav className="flex items-center space-x-6 text-sm font-medium">
              <a href="/dashboard" className="transition-colors hover:text-foreground/80 text-foreground">Dashboard</a>
              <a href="/tents" className="transition-colors hover:text-foreground/80 text-foreground/60">Tents</a>
              <a href="/cars" className="transition-colors hover:text-foreground/80 text-foreground/60">Cars</a>
            </nav>
          </div>
        </div>
      </header>
      <main className="flex-1 w-full max-w-5xl mx-auto p-4 md:p-8">
        {children}
      </main>
    </div>
  );
}
