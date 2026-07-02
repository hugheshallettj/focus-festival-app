"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function editResource(formData: FormData) {
  const resourceId = formData.get("resource_id") as string;
  const resourceType = formData.get("resource_type") as string; // 'TENT' or 'CAR'
  
  const newCapacity = parseInt(formData.get("capacity") as string, 10);
  const newDescription = formData.get("description") as string;
  const returnTime = formData.get("return_time") as string | null;

  if (!resourceId || !resourceType || isNaN(newCapacity)) {
    return { error: "Missing required fields" };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  // Fetch current resource to validate capacity
  const table = resourceType === 'TENT' ? 'tents' : 'cars';
  const ownerField = resourceType === 'TENT' ? 'host_id' : 'driver_id';

  const { data: resource, error: fetchErr } = await supabase
    .schema('focus_festival')
    .from(table)
    .select('*')
    .eq('id', resourceId)
    .eq(ownerField, user.id)
    .single();

  if (fetchErr || !resource) {
    return { error: "Resource not found or unauthorized" };
  }

  const occupiedSpaces = resource.capacity - resource.remaining_spaces;
  if (newCapacity < occupiedSpaces) {
    return { error: `Cannot decrease capacity below currently accepted members (${occupiedSpaces}).` };
  }

  const newRemainingSpaces = newCapacity - occupiedSpaces;

  const updateData: any = {
    capacity: newCapacity,
    remaining_spaces: newRemainingSpaces,
    description: newDescription,
  };

  if (resourceType === 'CAR' && returnTime) {
    updateData.return_time = returnTime;
  }

  const { error: updateErr } = await supabase
    .schema('focus_festival')
    .from(table)
    .update(updateData)
    .eq('id', resourceId);

  if (updateErr) {
    console.error("Failed to update resource", updateErr);
    return { error: "Failed to update listing" };
  }

  revalidatePath("/dashboard");
  revalidatePath("/tents/[id]", "page");
  revalidatePath("/cars/[id]", "page");
}
