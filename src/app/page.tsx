import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PostCard, type FeedPost } from "@/components/post-card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 10;

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; feed?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { page: pageParam, feed: feedParam } = await searchParams;
  const activeTab = feedParam === "following" ? "following" : "all";
  const page = Math.max(1, Number(pageParam) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let followingIds: string[] = [];
  if (activeTab === "following") {
    const { data: follows } = await supabase
      .from("follows")
      .select("following_id")
      .eq("follower_id", user.id);
    followingIds = (follows ?? []).map((f) => f.following_id);
  }

  const noFollows = activeTab === "following" && followingIds.length === 0;

  let feed: FeedPost[] = [];
  let total = 0;

  if (!noFollows) {
    let query = supabase
      .from("posts")
      .select(
        `id, user_id, title, description, code_snippet, video_url, created_at,
         users ( id, name, avatar_url ),
         likes ( user_id ),
         comments ( id, post_id, user_id, text, created_at, users ( id, name, avatar_url ) )`,
        { count: "exact" },
      )
      .order("created_at", { ascending: false })
      .range(from, to);

    if (activeTab === "following") {
      query = query.in("user_id", followingIds);
    }

    const { data: posts, error, count } = await query;

    if (error) {
      return (
        <p className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
          Couldn&apos;t load the feed: {error.message}
        </p>
      );
    }

    feed = (posts ?? []) as unknown as FeedPost[];
    total = count ?? 0;
  }

  const hasNext = to + 1 < total;
  const hasPrev = page > 1;
  const tabQuery = activeTab === "following" ? "&feed=following" : "";

  const tabs = (
    <div className="flex gap-1">
      <Link
        href="/"
        className={cn(
          buttonVariants({ variant: activeTab === "all" ? "default" : "ghost", size: "sm" }),
        )}
      >
        All
      </Link>
      <Link
        href="/?feed=following"
        className={cn(
          buttonVariants({
            variant: activeTab === "following" ? "default" : "ghost",
            size: "sm",
          }),
        )}
      >
        Following
      </Link>
    </div>
  );

  if (noFollows) {
    return (
      <div className="space-y-6">
        {tabs}
        <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed border-white/10 py-16 text-center">
          <p className="text-muted-foreground">
            You&apos;re not following anyone yet. Follow developers from their profile to see
            their posts here.
          </p>
          <Link href="/" className={buttonVariants()}>
            Discover posts
          </Link>
        </div>
      </div>
    );
  }

  if (feed.length === 0 && page === 1) {
    return (
      <div className="space-y-6">
        {tabs}
        <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed border-white/10 py-16 text-center">
          <p className="text-muted-foreground">
            No posts yet. Be the first to share what you&apos;re building.
          </p>
          <Link href="/posts/new" className={buttonVariants()}>
            Create a post
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {tabs}
      {feed.map((post) => (
        <PostCard key={post.id} post={post} currentUserId={user.id} />
      ))}

      {(hasPrev || hasNext) && (
        <div className="flex items-center justify-between pt-2">
          {hasPrev ? (
            <Link
              href={`/?page=${page - 1}${tabQuery}`}
              className={buttonVariants({ variant: "outline" })}
            >
              Previous
            </Link>
          ) : (
            <span />
          )}
          {hasNext ? (
            <Link
              href={`/?page=${page + 1}${tabQuery}`}
              className={buttonVariants({ variant: "outline" })}
            >
              Next
            </Link>
          ) : (
            <span />
          )}
        </div>
      )}
    </div>
  );
}
