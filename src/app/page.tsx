import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PostCard, type FeedPost } from "@/components/post-card";
import { buttonVariants } from "@/components/ui/button";

const PAGE_SIZE = 10;

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const {
    data: posts,
    error,
    count,
  } = await supabase
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

  if (error) {
    return (
      <p className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
        Couldn&apos;t load the feed: {error.message}
      </p>
    );
  }

  const feed = (posts ?? []) as unknown as FeedPost[];
  const total = count ?? 0;
  const hasNext = to + 1 < total;
  const hasPrev = page > 1;

  if (feed.length === 0 && page === 1) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed py-16 text-center">
        <p className="text-muted-foreground">
          No posts yet. Be the first to share what you&apos;re building.
        </p>
        <Link href="/posts/new" className={buttonVariants()}>
          Create a post
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {feed.map((post) => (
        <PostCard key={post.id} post={post} currentUserId={user.id} />
      ))}

      {(hasPrev || hasNext) && (
        <div className="flex items-center justify-between pt-2">
          {hasPrev ? (
            <Link href={`/?page=${page - 1}`} className={buttonVariants({ variant: "outline" })}>
              Previous
            </Link>
          ) : (
            <span />
          )}
          {hasNext ? (
            <Link href={`/?page=${page + 1}`} className={buttonVariants({ variant: "outline" })}>
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
