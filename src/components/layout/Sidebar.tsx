import { Search, TrendingUp, UserPlus } from "lucide-react";
import { Input } from "../ui/input";
import { Card, CardContent } from "../ui/card";
import { TagList } from "../ui/tag-list";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import Link from "next/link";

import { getRandomFeaturedUsersAction } from "@/actions/user.action";
import { getTrendingTagsAction } from "@/actions/tag.action";

export default async function Sidebar() {
  const [{ data: featuredUsers }, { data: trendingTags }] = await Promise.all([
    getRandomFeaturedUsersAction(2),
    getTrendingTagsAction(10),
  ]);

  const tags = trendingTags?.map((tag) => tag.name) || [];

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
          {featuredUsers?.map((user) => (
            <Link
              key={user.username}
              href={`/profile/${user.username}`}
              className="block"
            >
              <div className="flex p-2 hover:bg-accent rounded-md cursor-pointer transition-colors gap-3">
                <Avatar className="w-10 h-10 border border-border">
                  <AvatarImage src={user.avatar || ""} alt={user.nickname} />
                  <AvatarFallback>
                    {user.nickname?.charAt(0) || user.username.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-foreground truncate">
                        {user.nickname}
                      </span>
                      <span className="text-xs text-muted-foreground truncate">
                        @{user.username}
                      </span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs px-2"
                    >
                      팔로우
                    </Button>
                  </div>
                  {user.bio && (
                    <p className="text-xs text-muted-foreground mt-1.5 leading-tight line-clamp-2">
                      {user.bio}
                    </p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
