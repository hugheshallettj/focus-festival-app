"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function removeMember(formData: FormData) {
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
    .rpc('remove_member', { app_id: applicationId });

  if (error || !success) {
    console.error("Failed to remove member", error);
    return { error: "Failed to remove member" };
  }

  revalidatePath("/dashboard");
  revalidatePath("/tents/[id]", "page");
  revalidatePath("/cars/[id]", "page");
}
