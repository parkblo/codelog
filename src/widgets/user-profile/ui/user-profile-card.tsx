import { FollowButton } from "@/features/follow";
import { FollowListDialog } from "@/features/follow";
import { ProfileEditDialog } from "@/features/profile";
import { UserAuth } from "@/shared/types/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Card, CardContent } from "@/shared/ui/card";

interface UserProfileCardProps {
  user: UserAuth;
  isEditable?: boolean;
  followerCount: number;
  followingCount: number;
  isFollowing: boolean;
}

export default function UserProfileCard({
  user,
  isEditable = false,
  followerCount = 0,
  followingCount = 0,
  isFollowing = false,
}: UserProfileCardProps) {
  return (
    <Card className="bg-background">
      <CardContent>
        <div className="relative flex flex-col items-center justify-center gap-4">
          <div className="absolute top-2 right-2 flex gap-2">
            {!isEditable && (
              <FollowButton
                followingId={user.id}
                followingUsername={user.username}
                initialIsFollowing={isFollowing}
              />
            )}
            {isEditable && <ProfileEditDialog user={user} />}
          </div>

          <Avatar className="w-24 h-24 border border-border">
            {user && (
              <>
                <AvatarImage src={user.avatar || ""} alt={user.nickname} />
                <AvatarFallback>
                  {user.nickname ? user.nickname.charAt(0) : ""}
                </AvatarFallback>
              </>
            )}
          </Avatar>
          <div className="flex flex-col items-center justify-center gap-1">
            <p className="font-semibold text-xl">{user?.nickname}</p>
            <p className="text-sm text-muted-foreground">@{user?.username}</p>
            {user?.bio && (
              <p className="text-sm mt-2 text-center max-w-md">{user?.bio}</p>
            )}

            <div className="flex gap-4 mt-4">
              <FollowListDialog
                userId={user.id}
                type="followers"
                trigger={
                  <div className="flex flex-col items-center cursor-pointer hover:underline">
                    <span className="font-bold">{followerCount}</span>
                    <span className="text-xs text-muted-foreground">
                      팔로워
                    </span>
                  </div>
                }
              />
              <FollowListDialog
                userId={user.id}
                type="following"
                trigger={
                  <div className="flex flex-col items-center cursor-pointer hover:underline">
                    <span className="font-bold">{followingCount}</span>
                    <span className="text-xs text-muted-foreground">
                      팔로잉
                    </span>
                  </div>
                }
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
