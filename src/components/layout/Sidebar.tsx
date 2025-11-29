import { Search, TrendingUp, UserPlus } from "lucide-react";
import { Input } from "../ui/input";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Badge } from "../ui/badge";
import { TagList } from "../ui/tag-list";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";

export default function Sidebar() {
  /* NOTE- 실서버 사용 전에 사용될 목데이터 */
  const mockTrendingTags = [
    "React",
    "TypeScript",
    "JavaScript",
    "TailwindCSS",
    "NextJS",
    "CSS",
    "NodeJS",
    "Python",
    "Vue",
    "Angular",
    "Docker",
    "GraphQL",
  ];
  const mockFeaturedUsers = [
    {
      username: "kimdev",
      nickname: "김개발",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=kim",
      bio: "React 전문가 | 오픈소스 컨트리뷰터",
    },
    {
      username: "leecoder",
      nickname: "이코더",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=lee",
      bio: "TypeScript 마스터 | 기술 블로거",
    },
  ];

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
        <Input placeholder="검색 ..." className="pl-10" />
      </div>

      <Card>
        <CardHeader className="flex">
          <TrendingUp className="text-xs text-red-400" />
          트렌딩 태그
        </CardHeader>
        <CardContent>
          <TagList tags={mockTrendingTags} />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4">
          {mockFeaturedUsers.map((user) => (
            <div
              key={user.username}
              className="flex p-2 hover:bg-accent rounded-md cursor-pointer transition-colors gap-3"
            >
              <Avatar className="w-10 h-10 border border-border">
                <AvatarImage src={user.avatar} alt={user.nickname} />
                <AvatarFallback>{user.nickname.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-foreground">
                      {user.nickname}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      @{user.username}
                    </span>
                  </div>
                  <Button size="sm" variant="outline" className="h-7 text-xs">
                    <UserPlus className="w-3 h-3" />
                    팔로우
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1.5 leading-tight">
                  {user.bio}
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
