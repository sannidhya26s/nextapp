"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function createPost(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?error=" + encodeURIComponent("Log in to create a post."));
  }

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const codeSnippet = String(formData.get("code_snippet") ?? "").trim();
  const videoUrl = String(formData.get("video_url") ?? "").trim();

  if (!title) {
    redirect("/posts/new?error=" + encodeURIComponent("Title is required."));
  }

  const { error } = await supabase.from("posts").insert({
    user_id: user.id,
    title,
    description,
    code_snippet: codeSnippet || null,
    video_url: videoUrl || null,
  });

  if (error) {
    redirect("/posts/new?error=" + encodeURIComponent(error.message));
  }

  revalidatePath("/");
  redirect("/");
}

export async function toggleLike(postId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?error=" + encodeURIComponent("Log in to like posts."));
  }

  const { data: existing } = await supabase
    .from("likes")
    .select("id")
    .eq("post_id", postId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    await supabase.from("likes").delete().eq("id", existing.id);
  } else {
    await supabase.from("likes").insert({ post_id: postId, user_id: user.id });
  }

  revalidatePath("/");
  revalidatePath(`/profile/${user.id}`);
}

export async function addComment(postId: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?error=" + encodeURIComponent("Log in to comment."));
  }

  const text = String(formData.get("text") ?? "").trim();
  if (!text) return;

  await supabase.from("comments").insert({
    post_id: postId,
    user_id: user.id,
    text,
  });

  revalidatePath("/");
}
