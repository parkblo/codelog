import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserAuth } from "@/types/types";
import ProfileEditDialog from "./ProfileEditDialog";

interface UserProfileCardProps {
  user: UserAuth;
  currentUser?: UserAuth | null;
}

export default function UserProfileCard({
  user,
  currentUser = null,
}: UserProfileCardProps) {
  return (
    <Card>
      <CardContent>
        <div className="relative flex flex-col items-center justify-center gap-4">
          {user && currentUser && currentUser.id === user.id && (
            <div className="absolute top-2 right-2">
              <ProfileEditDialog user={user} />
            </div>
          )}

          <Avatar className="w-30 h-30 border border-border">
            {/* 사용자 프로필 이미지 */}
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
            <p className="font-semibold">{user?.nickname}</p>
            <p className="text-sm text-muted-foreground">@{user?.username}</p>
            <p className="text-sm">{user?.bio}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
