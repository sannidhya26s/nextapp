"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const name = String(formData.get("name") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim();
  const avatarUrl = String(formData.get("avatar_url") ?? "").trim();

  const { error } = await supabase
    .from("users")
    .update({ name, bio, avatar_url: avatarUrl || null })
    .eq("id", user.id);

  if (error) {
    redirect(`/profile/${user.id}?error=` + encodeURIComponent(error.message));
  }

  revalidatePath(`/profile/${user.id}`);
  redirect(`/profile/${user.id}`);
}
