import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PostCard, type FeedPost } from "@/components/post-card";
import { buttonVariants } from "@/components/ui/button";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: posts, error } = await supabase
    .from("posts")
    .select(
      `id, title, description, code_snippet, video_url, created_at,
       users ( id, name, avatar_url ),
       likes ( user_id ),
       comments ( id, post_id, user_id, text, created_at, users ( id, name, avatar_url ) )`,
    )
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <p className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
        Couldn&apos;t load the feed: {error.message}
      </p>
    );
  }

  const feed = (posts ?? []) as unknown as FeedPost[];

  if (feed.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed py-16 text-center">
        <p className="text-muted-foreground">
          No posts yet. Be the first to share what you&apos;re building.
        </p>
        <Link href={user ? "/posts/new" : "/signup"} className={buttonVariants()}>
          {user ? "Create a post" : "Sign up to post"}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {feed.map((post) => (
        <PostCard key={post.id} post={post} currentUserId={user?.id ?? null} />
      ))}
    </div>
  );
}
