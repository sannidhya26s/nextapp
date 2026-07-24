import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updatePost } from "@/app/posts/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function EditPostPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?error=" + encodeURIComponent("Log in to edit a post."));
  }

  const { data: post } = await supabase
    .from("posts")
    .select("id, user_id, title, description, code_snippet, video_url")
    .eq("id", id)
    .maybeSingle();

  if (!post) {
    notFound();
  }

  if (post.user_id !== user.id) {
    redirect("/");
  }

  return (
    <Card className="mx-auto max-w-xl">
      <CardHeader>
        <CardTitle>Edit post</CardTitle>
        <CardDescription>Update your project details.</CardDescription>
      </CardHeader>
      <form action={updatePost.bind(null, post.id)}>
        <CardContent className="space-y-4">
          {error && (
            <p className="rounded-md bg-destructive/10 p-2 text-sm text-destructive">
              {error}
            </p>
          )}
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" required defaultValue={post.title} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              rows={4}
              defaultValue={post.description}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="code_snippet">Code snippet</Label>
            <Textarea
              id="code_snippet"
              name="code_snippet"
              rows={8}
              className="font-mono text-sm"
              defaultValue={post.code_snippet ?? ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="video_url">Video URL</Label>
            <Input
              id="video_url"
              name="video_url"
              type="url"
              defaultValue={post.video_url ?? ""}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full">
            Save changes
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
