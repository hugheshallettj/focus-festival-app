"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function deleteResource(formData: FormData) {
  const resourceId = formData.get("resource_id") as string;
  const resourceType = formData.get("resource_type") as string; // 'TENT' or 'CAR'

  if (!resourceId || !resourceType) {
    return { error: "Missing required fields" };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { data: success, error } = await supabase
    .schema('focus_festival')
    .rpc('delete_resource', { res_id: resourceId, res_type: resourceType });

  if (error || !success) {
    console.error(`Failed to delete ${resourceType}`, error);
    return { error: "Failed to delete listing" };
  }

  revalidatePath("/dashboard");
  revalidatePath("/tents");
  revalidatePath("/cars");
  
  redirect("/dashboard");
}
