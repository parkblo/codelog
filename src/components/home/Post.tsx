"use client";

import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Card, CardContent, CardFooter } from "../ui/card";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { Button } from "../ui/button";
import { Bookmark, Heart, MessageCircle, Share } from "lucide-react";
import { Separator } from "@radix-ui/react-separator";
import { Badge } from "../ui/badge";
import { TagList } from "../ui/tag-list";

interface Author {
  nickname: string;
  username: string;
  avatar: string;
}

interface PostData {
  id: string;
  author: Author;
  timestamp: string;
  content: string;
  code: string;
  language: string;
  tags: string[];
  like_count: number;
  comment_count: number;
  bookmark_count: number;
}

interface PostProps {
  post: PostData;
}

export default function Post({ post }: PostProps) {
  return (
    <Card>
      <CardContent>
        <div className="flex flex-col gap-2">
          {/* 작성자 정보 영역 */}
          <div className="flex flex-1 min-w-0 gap-2">
            <Avatar className="w-10 h-10 border border-border">
              <AvatarImage
                src={post.author.avatar}
                alt={post.author.nickname}
              />
              <AvatarFallback>{post.author.nickname.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col justify-start">
              <div className="flex gap-1 items-center">
                <span className="font-medium text-foreground">
                  {post.author.nickname}
                </span>
                <span className="text-sm text-muted-foreground">
                  {post.author.username}
                </span>
              </div>
              <span className="text-sm text-muted-foreground">
                {post.timestamp}
              </span>
            </div>
          </div>

          {/* 본문 영역 */}
          {post.content && <p className="text-foreground">{post.content}</p>}

          {/* 코드 영역 */}
          {post.code && (
            <SyntaxHighlighter
              language={post.language}
              style={vscDarkPlus}
              className="rounded-md"
              showLineNumbers={true}
              lineNumberStyle={{ color: "oklch(43.9% 0 0)" }}
              wrapLines={true}
              lineProps={{
                style: {
                  display: "block",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                },
              }}
              customStyle={{
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                overflowX: "auto",
              }}
            >
              {post.code}
            </SyntaxHighlighter>
          )}

          {/* 태그 영역 */}
          {post.tags && <TagList tags={post.tags} className="pb-2" />}

          {/* 소셜 인터랙션 영역*/}
          <div className="flex gap-4 border-t pt-2 justify-between">
            <Button
              variant="ghost"
              className="text-muted-foreground hover:text-foreground flex gap-2 items-center justify-center"
            >
              <Heart className="w-4 h-4" />
              <span>{post.like_count}</span>
            </Button>
            <Button
              variant="ghost"
              className="text-muted-foreground hover:text-foreground flex gap-2 items-center justify-center"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{post.comment_count}</span>
            </Button>
            <Button
              variant="ghost"
              className="text-muted-foreground hover:text-foreground flex gap-2 items-center justify-center"
            >
              <Bookmark className="w-4 h-4" />
              <span>{post.bookmark_count}</span>
            </Button>
            <Button
              variant="ghost"
              className="text-muted-foreground hover:text-foreground flex gap-2 items-center justify-center"
            >
              <Share className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
