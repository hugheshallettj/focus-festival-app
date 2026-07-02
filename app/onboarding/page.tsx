import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { setGenderAction } from "@/app/actions/user";
import { Button } from "@/components/ui/button";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/auth/login");
  }

  const { data: profile } = await supabase
    .from("users")
    .select("gender")
    .eq("id", user.id)
    .single();

  if (profile?.gender) {
    return redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full p-8 bg-card border rounded-2xl shadow-xl animate-in fade-in zoom-in-95">
        <h1 className="text-3xl font-bold mb-2">Welcome to Focus</h1>
        <p className="text-muted-foreground mb-8">
          To ensure community safety and respect privacy preferences for tent sharing, we need to know your gender. This will only be used for strict gender-matching rules.
        </p>

        <form action={async (formData: FormData) => { "use server"; await setGenderAction(formData); }} className="space-y-6">
          <div className="space-y-4">
            <label className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-accent transition-colors">
              <input
                type="radio"
                name="gender"
                value="MALE"
                className="h-5 w-5 text-primary"
                required
              />
              <span className="font-medium">Male</span>
            </label>
            <label className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-accent transition-colors">
              <input
                type="radio"
                name="gender"
                value="FEMALE"
                className="h-5 w-5 text-primary"
                required
              />
              <span className="font-medium">Female</span>
            </label>
          </div>
          <Button type="submit" className="w-full h-12 text-lg">
            Complete Setup
          </Button>
        </form>
      </div>
    </div>
  );
}
