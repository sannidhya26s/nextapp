import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createPost } from "@/app/posts/actions";
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

export default async function NewPostPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?error=" + encodeURIComponent("Log in to create a post."));
  }

  return (
    <Card className="mx-auto max-w-xl">
      <CardHeader>
        <CardTitle>New post</CardTitle>
        <CardDescription>
          Share a project, snippet, or demo with the feed.
        </CardDescription>
      </CardHeader>
      <form action={createPost}>
        <CardContent className="space-y-4">
          {error && (
            <p className="rounded-md bg-destructive/10 p-2 text-sm text-destructive">
              {error}
            </p>
          )}
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" required placeholder="Realtime cursor sync in 40 lines" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              rows={4}
              placeholder="What did you build, and why?"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="code_snippet">Code snippet</Label>
            <Textarea
              id="code_snippet"
              name="code_snippet"
              rows={8}
              className="font-mono text-sm"
              placeholder="Paste a code snippet (optional)"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="video_url">Video URL</Label>
            <Input
              id="video_url"
              name="video_url"
              type="url"
              placeholder="https://youtube.com/watch?v=... (optional)"
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full">
            Publish post
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
