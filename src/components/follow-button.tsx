import { toggleFollow } from "@/app/follows/actions";
import { Button } from "@/components/ui/button";

export function FollowButton({
  profileId,
  isFollowing,
}: {
  profileId: string;
  isFollowing: boolean;
}) {
  return (
    <form action={toggleFollow.bind(null, profileId)}>
      <Button type="submit" variant={isFollowing ? "outline" : "default"} size="sm">
        {isFollowing ? "Following" : "Follow"}
      </Button>
    </form>
  );
}
