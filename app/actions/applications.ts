"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function applyForResource(formData: FormData) {
  const resourceId = formData.get("resource_id") as string;
  const resourceType = formData.get("resource_type") as string;

  if (!resourceId || !resourceType) {
    return { error: "Missing required fields" };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  // Check if they already applied
  const { data: existingApp } = await supabase
    .schema("focus_festival")
    .from("applications")
    .select("id")
    .eq("applicant_id", user.id)
    .eq("resource_id", resourceId)
    .single();

  if (existingApp) {
    // Already applied
    redirect("/dashboard");
  }

  // Insert PENDING application
  const { error } = await supabase
    .schema("focus_festival")
    .from("applications")
    .insert({
      applicant_id: user.id,
      resource_id: resourceId,
      resource_type: resourceType,
      status: 'PENDING'
    });

  if (error) {
    console.error("Failed to apply:", error);
    return { error: "Failed to submit application" };
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}
