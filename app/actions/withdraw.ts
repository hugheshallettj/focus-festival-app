"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function withdrawApplication(formData: FormData) {
  const applicationId = formData.get("application_id") as string;

  if (!applicationId) {
    return { error: "Missing required fields" };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { data: success, error } = await supabase
    .schema('focus_festival')
    .rpc('withdraw_application', { app_id: applicationId });

  if (error || !success) {
    console.error("Failed to withdraw application", error);
    return { error: "Failed to withdraw application" };
  }

  revalidatePath("/dashboard");
}
