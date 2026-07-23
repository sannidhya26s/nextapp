import { Heart } from "lucide-react";
import { toggleLike } from "@/app/posts/actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function LikeButton({
  postId,
  likeCount,
  isLiked,
}: {
  postId: string;
  likeCount: number;
  isLiked: boolean;
}) {
  return (
    <form action={toggleLike.bind(null, postId)}>
      <Button
        type="submit"
        variant="ghost"
        size="sm"
        className={cn("gap-1.5", isLiked && "text-red-500 hover:text-red-500")}
      >
        <Heart className={cn("h-4 w-4", isLiked && "fill-current")} />
        {likeCount}
      </Button>
    </form>
  );
}
