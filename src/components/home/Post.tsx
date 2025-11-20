"use client";

import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Card, CardContent } from "../ui/card";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";

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
  likes: number;
  comments: number;
  bookmarks: number;
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
        </div>
      </CardContent>
    </Card>
  );
}
