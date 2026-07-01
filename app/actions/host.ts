"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function processApplication(formData: FormData) {
  const applicationId = formData.get("application_id") as string;
  const action = formData.get("action") as string; // 'APPROVE' or 'REJECT'
  const resourceType = formData.get("resource_type") as string;

  if (!applicationId || !action || !resourceType) {
    return { error: "Missing required fields" };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  if (action === 'REJECT') {
    const { error } = await supabase
      .schema('focus_festival')
      .from('applications')
      .update({ status: 'REJECTED' })
      .eq('id', applicationId);
    
    if (error) {
      console.error("Failed to reject application", error);
      return { error: "Failed to reject application" };
    }
  } else if (action === 'APPROVE') {
    // Atomic lock logic is inside the RPC function
    const rpcName = resourceType === 'TENT' ? 'approve_tent_application' : 'approve_car_application';
    
    const { data: success, error } = await supabase
      .schema('focus_festival')
      .rpc(rpcName, { app_id: applicationId });

    if (error || !success) {
      console.error(`Failed to approve ${resourceType} application`, error);
      return { error: "Failed to approve application. It may be full or already processed." };
    }
  }

  revalidatePath("/dashboard");
}
