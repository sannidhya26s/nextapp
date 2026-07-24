import { X } from "lucide-react";
import { addComment, deleteComment } from "@/app/posts/actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { CommentRow, UserRow } from "@/lib/database.types";

type CommentWithUser = CommentRow & {
  users: Pick<UserRow, "id" | "name" | "avatar_url"> | null;
};

export function CommentSection({
  postId,
  comments,
  canComment,
  currentUserId,
}: {
  postId: string;
  comments: CommentWithUser[];
  canComment: boolean;
  currentUserId: string | null;
}) {
  return (
    <div className="space-y-3">
      {comments.length > 0 && (
        <ul className="space-y-2">
          {comments.map((comment) => (
            <li key={comment.id} className="flex items-start gap-2 text-sm">
              <Avatar className="h-6 w-6 shrink-0">
                <AvatarImage src={comment.users?.avatar_url ?? undefined} />
                <AvatarFallback className="text-xs">
                  {(comment.users?.name ?? "?").slice(0, 1).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <p className="flex-1">
                <span className="font-medium">{comment.users?.name ?? "Unknown"}</span>{" "}
                <span className="text-muted-foreground">{comment.text}</span>
              </p>
              {currentUserId && currentUserId === comment.user_id && (
                <form action={deleteComment.bind(null, comment.id)}>
                  <Button
                    type="submit"
                    variant="ghost"
                    size="icon-sm"
                    className="text-muted-foreground hover:text-destructive"
                    aria-label="Delete comment"
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </form>
              )}
            </li>
          ))}
        </ul>
      )}
      {canComment && (
        <form action={addComment.bind(null, postId)} className="flex gap-2">
          <Input name="text" placeholder="Add a comment..." required className="h-8 text-sm" />
          <Button type="submit" size="sm" variant="secondary">
            Post
          </Button>
        </form>
      )}
    </div>
  );
}
