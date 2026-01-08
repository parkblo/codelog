import { Search, TrendingUp, UserPlus } from "lucide-react";
import { Input } from "../ui/input";
import { Card, CardContent } from "../ui/card";
import { TagList } from "../ui/tag-list";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import Link from "next/link";

import { getRandomFeaturedUsersAction } from "@/actions/user.action";
import { getTrendingTagsAction } from "@/actions/tag.action";
import { ServerAuthService } from "@/services/auth/server-auth.service";
import FollowButton from "../follow/FollowButton";

export default async function Sidebar() {
  const authService = new ServerAuthService();

  const [{ data: featuredUsers }, { data: trendingTags }, currentUser] =
    await Promise.all([
      getRandomFeaturedUsersAction(3), // 본인 제외 로직을 위해 3명 조회
      getTrendingTagsAction(10),
      authService.getCurrentUser(),
    ]);

  const tags = trendingTags?.map((tag) => tag.name) || [];

  // 본인 제외
  const filteredUsers =
    featuredUsers?.filter((u) => u.id !== currentUser?.id).slice(0, 2) || [];

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
        <Input placeholder="검색 ..." className="pl-10" />
      </div>

      <Card>
        <CardContent>
          <div className="flex flex-row items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-red-500" />
            <span className="font-semibold">트렌딩 태그</span>
          </div>
          {tags.length > 0 ? (
            <TagList tags={tags} />
          ) : (
            <p className="text-xs text-muted-foreground text-center py-2">
              태그가 없습니다.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <div className="flex flex-row items-center gap-2 mb-4">
            <UserPlus className="w-4 h-4 text-blue-500" />
            <span className="font-semibold">추천 유저</span>
          </div>
          {filteredUsers.map((user) => (
            <div
              key={user.username}
              className="group flex p-2 hover:bg-accent rounded-md transition-colors gap-3"
            >
              <Link href={`/profile/${user.username}`}>
                <Avatar className="w-10 h-10 border border-border">
                  <AvatarImage src={user.avatar || ""} alt={user.nickname} />
                  <AvatarFallback>
                    {user.nickname?.charAt(0) || user.username.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </Link>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <Link
                    href={`/profile/${user.username}`}
                    className="flex flex-col min-w-0 flex-1"
                  >
                    <span className="text-sm font-medium text-foreground truncate">
                      {user.nickname}
                    </span>
                    <span className="text-xs text-muted-foreground truncate">
                      @{user.username}
                    </span>
                  </Link>
                  <FollowButton
                    followingId={user.id}
                    followingUsername={user.username}
                    initialIsFollowing={user.is_following || false}
                    size="sm"
                    className="h-7 text-xs px-2"
                  />
                </div>
                {user.bio && (
                  <p className="text-xs text-muted-foreground mt-1.5 leading-tight line-clamp-2">
                    {user.bio}
                  </p>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
