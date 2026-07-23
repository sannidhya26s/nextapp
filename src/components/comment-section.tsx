import { addComment } from "@/app/posts/actions";
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
}: {
  postId: string;
  comments: CommentWithUser[];
  canComment: boolean;
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
              <p>
                <span className="font-medium">{comment.users?.name ?? "Unknown"}</span>{" "}
                <span className="text-muted-foreground">{comment.text}</span>
              </p>
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
