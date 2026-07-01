"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function setGenderAction(formData: FormData) {
  const gender = formData.get("gender") as string;
  if (!gender) {
    return { error: "Gender is required" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("users")
    .update({ gender })
    .eq("id", user.id);

  if (error) {
    console.error("Failed to update gender:", error);
    return { error: "Failed to update profile" };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}
