"use client";

import { Github, Mail } from "lucide-react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Separator } from "../ui/separator";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { ReactNode, useState } from "react";
import { cn } from "@/lib/utils";

interface AuthDialogProps {
  children: ReactNode;
  signUp: boolean;
}

export default function AuthDialog({
  children,
  signUp = false,
}: AuthDialogProps) {
  const [isSignUp, setSignUp] = useState(signUp);

  /*
    NOTE-
    dialog를 닫아도 상태가 남아있는 문제 해결용.
    바로 상태를 바꾸면 UI 업데이트가 보이게 되므로 지연 추가
  */
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setTimeout(() => setSignUp(signUp), 300);
    }
  };

  return (
    <Dialog onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <div className="w-full">{children}</div>
      </DialogTrigger>
      <DialogContent
        className={cn(
          "w-md transition-colors",
          isSignUp &&
            "bg-linear-to-br from-blue-600/10 via-purple-600/10 to-pink-600/10 border border-blue-400/20"
        )}
      >
        <DialogHeader>
          <DialogTitle>{isSignUp ? "회원가입" : "로그인"}</DialogTitle>
        </DialogHeader>
        <Button>
          <Github /> {isSignUp ? "GitHub로 가입" : "GitHub로 로그인"}
        </Button>
        <div className="relative mt-2 mb-2">
          <div className="absolute inset-0 flex justify-center items-center">
            <Separator />
          </div>
          <div className="absolute inset-0 flex justify-center items-center">
            <span className="text-sm text-muted-foreground">또는</span>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="email">이메일</Label>
          <Input id="email" type="email" placeholder="name@example.com" />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="password">비밀번호</Label>
          <Input id="password" type="password" placeholder="••••••••" />
        </div>
        {isSignUp && (
          <div className="flex flex-col gap-2">
            <Label htmlFor="confirmPassword">비밀번호 확인</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
            />
          </div>
        )}

        <Button variant="outline">
          <Mail /> {isSignUp ? "이메일로 가입" : "이메일로 로그인"}
        </Button>
        <div className="flex justify-center items-center">
          {!isSignUp && (
            <p className="text-sm text-muted-foreground align-middle">
              계정이 없으신가요?{" "}
              <span
                className="underline hover:cursor-pointer"
                onClick={() => setSignUp(true)}
              >
                가입하기
              </span>
            </p>
          )}
          {isSignUp && (
            <p className="text-sm text-muted-foreground align-middle">
              계정이 이미 있으신가요?{" "}
              <span
                className="underline hover:cursor-pointer"
                onClick={() => setSignUp(false)}
              >
                로그인하기
              </span>
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
