import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateProfile } from "@/app/profile/actions";
import { PostCard, type FeedPost } from "@/components/post-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function ProfilePage({
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
    data: { user: currentUser },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("users")
    .select("id, name, bio, avatar_url, created_at")
    .eq("id", id)
    .maybeSingle();

  if (!profile) {
    notFound();
  }

  const { data: posts } = await supabase
    .from("posts")
    .select(
      `id, user_id, title, description, code_snippet, video_url, created_at,
       users ( id, name, avatar_url ),
       likes ( user_id ),
       comments ( id, post_id, user_id, text, created_at, users ( id, name, avatar_url ) )`,
    )
    .eq("user_id", id)
    .order("created_at", { ascending: false });

  const feed = (posts ?? []) as unknown as FeedPost[];
  const isOwnProfile = currentUser?.id === id;

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader className="flex items-center gap-4 space-y-0">
          <Avatar className="h-16 w-16">
            <AvatarImage src={profile.avatar_url ?? undefined} />
            <AvatarFallback className="text-lg">
              {(profile.name || "?").slice(0, 1).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle>{profile.name || "Unnamed developer"}</CardTitle>
            <p className="text-sm text-muted-foreground">
              Joined {new Date(profile.created_at).toLocaleDateString()}
            </p>
          </div>
        </CardHeader>
        <CardContent>
          {profile.bio ? (
            <p className="whitespace-pre-wrap text-sm">{profile.bio}</p>
          ) : (
            <p className="text-sm text-muted-foreground">No bio yet.</p>
          )}
        </CardContent>
      </Card>

      {isOwnProfile && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Edit profile</CardTitle>
          </CardHeader>
          <form action={updateProfile} encType="multipart/form-data">
            <CardContent className="space-y-4">
              {error && (
                <p className="rounded-md bg-destructive/10 p-2 text-sm text-destructive">
                  {error}
                </p>
              )}
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" defaultValue={profile.name} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea id="bio" name="bio" rows={3} defaultValue={profile.bio} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="avatar">Avatar</Label>
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={profile.avatar_url ?? undefined} />
                    <AvatarFallback>
                      {(profile.name || "?").slice(0, 1).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <Input id="avatar" name="avatar" type="file" accept="image/*" />
                </div>
              </div>
              <Button type="submit">Save changes</Button>
            </CardContent>
          </form>
        </Card>
      )}

      <div className="space-y-6">
        <h2 className="text-lg font-semibold">
          {isOwnProfile ? "Your posts" : `Posts by ${profile.name || "this developer"}`}
        </h2>
        {feed.length === 0 ? (
          <p className="text-sm text-muted-foreground">No posts yet.</p>
        ) : (
          feed.map((post) => (
            <PostCard key={post.id} post={post} currentUserId={currentUser?.id ?? null} />
          ))
        )}
      </div>
    </div>
  );
}
