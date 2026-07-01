"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createTent(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const capacity = parseInt(formData.get("capacity") as string);
  const description = formData.get("description") as string || null;
  const same_sex_only = formData.get("same_sex_only") === "on";
  const gender_required = same_sex_only ? (formData.get("gender_required") as string) : null;

  if (!capacity || capacity <= 0) {
    return { error: "Invalid capacity" };
  }

  const { error } = await supabase
    .schema('focus_festival')
    .from('tents')
    .insert({
      host_id: user.id,
      capacity,
      remaining_spaces: capacity,
      description,
      same_sex_only,
      gender_required,
    });

  if (error) {
    console.error("Failed to create tent:", error);
    return { error: "Failed to create tent listing" };
  }

  revalidatePath("/tents");
  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function createCar(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const capacity = parseInt(formData.get("capacity") as string);
  const location = formData.get("location") as string;
  const description = formData.get("description") as string || null;
  const departure_time = formData.get("departure_time") as string;
  const return_time = formData.get("return_time") as string;

  if (!capacity || capacity <= 0 || !location || !departure_time) {
    return { error: "Missing required fields" };
  }

  const { error } = await supabase
    .schema('focus_festival')
    .from('cars')
    .insert({
      driver_id: user.id,
      capacity,
      remaining_spaces: capacity,
      location,
      description,
      departure_time: new Date(departure_time).toISOString(),
      return_time: return_time ? new Date(return_time).toISOString() : null,
    });

  if (error) {
    console.error("Failed to create car:", error);
    return { error: "Failed to create car listing" };
  }

  revalidatePath("/cars");
  revalidatePath("/dashboard");
  redirect("/dashboard");
}
