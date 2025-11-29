"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/providers/auth-provider";
import { Send } from "lucide-react";
import React, { useState } from "react";

export default function CommentForm() {
  const { user, loading } = useAuth();
  const [comment, setComment] = useState("");

  // NOTE - API 통합 필요
  const createComment = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (comment) {
      setComment("");
    }
  };

  return (
    <Card>
      <CardContent>
        <form onSubmit={createComment}>
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <Avatar className="w-10 h-10 border border-border">
                {user && (
                  <>
                    <AvatarImage src={user.avatar} alt={user.nickname} />
                    <AvatarFallback>
                      {user.nickname ? user.nickname.charAt(0) : ""}
                    </AvatarFallback>
                  </>
                )}
              </Avatar>
              <Textarea
                className="resize-none"
                placeholder="댓글을 입력해주세요."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    e.currentTarget.form?.requestSubmit();
                  }
                }}
              />
            </div>
            <div className="flex justify-end">
              <Button variant="outline" type="submit">
                <Send className="w-4 h-4" />
                댓글 작성
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
