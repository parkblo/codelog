import Link from "next/link";

import { TrendingUp, UserPlus } from "lucide-react";

import { FollowButton } from "@/features/follow";
import { SearchInput } from "@/features/search";
import { getTrendingTagsAction } from "@/entities/tag";
import {
  getRandomFeaturedUsersAction,
  ServerAuthService,
} from "@/entities/user";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Card, CardContent } from "@/shared/ui/card";
import { TagList } from "@/shared/ui/tag-list";

export default async function Sidebar() {
  const authService = new ServerAuthService();

  const currentUser = await authService.getCurrentUser();
  const [{ data: featuredUsers }, { data: trendingTags }] = await Promise.all([
    getRandomFeaturedUsersAction(2),
    getTrendingTagsAction(10),
  ]);

  const tags = trendingTags?.map((tag) => tag.name) || [];

  const filteredUsers =
    featuredUsers?.filter((u) => u.id !== currentUser?.id) || [];

  return (
    <div className="flex flex-col gap-4 p-4">
      <SearchInput />

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
