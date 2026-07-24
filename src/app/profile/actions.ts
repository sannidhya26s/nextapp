"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const MAX_AVATAR_BYTES = 5 * 1024 * 1024;

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
  const avatarFile = formData.get("avatar");

  let avatarUrl: string | undefined;

  if (avatarFile instanceof File && avatarFile.size > 0) {
    if (!avatarFile.type.startsWith("image/")) {
      redirect(
        `/profile/${user.id}?error=` + encodeURIComponent("Avatar must be an image file."),
      );
    }
    if (avatarFile.size > MAX_AVATAR_BYTES) {
      redirect(`/profile/${user.id}?error=` + encodeURIComponent("Avatar must be under 5MB."));
    }

    const extension = avatarFile.name.split(".").pop() || "jpg";
    const path = `${user.id}/avatar.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, avatarFile, { upsert: true, contentType: avatarFile.type });

    if (uploadError) {
      redirect(`/profile/${user.id}?error=` + encodeURIComponent(uploadError.message));
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("avatars").getPublicUrl(path);
    avatarUrl = `${publicUrl}?t=${Date.now()}`;
  }

  const { error } = await supabase
    .from("users")
    .update({ name, bio, ...(avatarUrl ? { avatar_url: avatarUrl } : {}) })
    .eq("id", user.id);

  if (error) {
    redirect(`/profile/${user.id}?error=` + encodeURIComponent(error.message));
  }

  revalidatePath(`/profile/${user.id}`);
  redirect(`/profile/${user.id}`);
}
