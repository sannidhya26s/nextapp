"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function toggleFollow(profileId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?error=" + encodeURIComponent("Log in to follow developers."));
  }

  if (user.id === profileId) {
    return;
  }

  const { data: existing } = await supabase
    .from("follows")
    .select("id")
    .eq("follower_id", user.id)
    .eq("following_id", profileId)
    .maybeSingle();

  if (existing) {
    await supabase.from("follows").delete().eq("id", existing.id);
  } else {
    await supabase
      .from("follows")
      .insert({ follower_id: user.id, following_id: profileId });
  }

  revalidatePath(`/profile/${profileId}`);
  revalidatePath(`/profile/${user.id}`);
  revalidatePath("/");
}
