import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { VideoEmbed } from "@/components/video-embed";
import { LikeButton } from "@/components/like-button";
import { CommentSection } from "@/components/comment-section";
import type { CommentRow, LikeRow, PostRow, UserRow } from "@/lib/database.types";

export type FeedPost = PostRow & {
  users: Pick<UserRow, "id" | "name" | "avatar_url"> | null;
  likes: Pick<LikeRow, "user_id">[];
  comments: (CommentRow & {
    users: Pick<UserRow, "id" | "name" | "avatar_url"> | null;
  })[];
};

export function PostCard({
  post,
  currentUserId,
}: {
  post: FeedPost;
  currentUserId: string | null;
}) {
  const isLiked = currentUserId
    ? post.likes.some((like) => like.user_id === currentUserId)
    : false;
  const sortedComments = [...post.comments].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );

  return (
    <Card>
      <CardHeader className="flex-row items-center gap-3 space-y-0">
        <Link href={`/profile/${post.users?.id ?? ""}`}>
          <Avatar>
            <AvatarImage src={post.users?.avatar_url ?? undefined} />
            <AvatarFallback>
              {(post.users?.name ?? "?").slice(0, 1).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Link>
        <div>
          <Link
            href={`/profile/${post.users?.id ?? ""}`}
            className="font-medium hover:underline"
          >
            {post.users?.name ?? "Unknown"}
          </Link>
          <p className="text-xs text-muted-foreground">
            {new Date(post.created_at).toLocaleString()}
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">{post.title}</h3>
          {post.description && (
            <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">
              {post.description}
            </p>
          )}
        </div>
        {post.code_snippet && (
          <pre className="max-h-80 overflow-auto rounded-lg bg-muted p-3 text-xs">
            <code>{post.code_snippet}</code>
          </pre>
        )}
        {post.video_url && <VideoEmbed url={post.video_url} />}
        <div className="flex items-center gap-1 border-t pt-2">
          <LikeButton postId={post.id} likeCount={post.likes.length} isLiked={isLiked} />
          <span className="flex items-center gap-1.5 px-2 text-sm text-muted-foreground">
            <MessageCircle className="h-4 w-4" />
            {post.comments.length}
          </span>
        </div>
        <CommentSection
          postId={post.id}
          comments={sortedComments}
          canComment={!!currentUserId}
        />
      </CardContent>
    </Card>
  );
}
