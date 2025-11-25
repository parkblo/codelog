"use client";

import { createClient } from "@/utils/supabase/client";

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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [loading, setLoading] = useState(false);

  /*
    NOTE-
    dialog를 닫아도 상태가 남아있는 문제 해결용.
    바로 상태를 바꾸면 UI 업데이트가 보이게 되므로 지연 추가
  */
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setTimeout(() => {
        setSignUp(signUp);
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setNickname("");
      }, 300);
    }
  };

  const handleGitHubLogin = async () => {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    });

    if (error) {
      alert(error.message);
    }
  };

  const handleEmailLogin = async () => {
    if (!email || !password) {
      alert("이메일과 비밀번호를 입력해주세요.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);

    if (error) {
      alert(error.message);
    } else {
      // 로그인 성공 시 페이지 리로드 또는 상태 업데이트
      window.location.reload();
    }
  };

  const handleEmailSignUp = async () => {
    if (!email || !password || !confirmPassword || !nickname) {
      alert("모든 필드를 입력해주세요.");
      return;
    }

    if (password !== confirmPassword) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          user_name: email,
          full_name: nickname,
          avatar_url: "",
        },
      },
    });
    setLoading(false);

    if (error) {
      alert(error.message);
    } else {
      alert("이메일에 가입 확인 메시지를 보냈습니다.");
      setSignUp(false);
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
        <Button onClick={handleGitHubLogin} disabled={loading}>
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
          <Input 
            id="email" 
            type="email" 
            placeholder="name@example.com" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="password">비밀번호</Label>
          <Input 
            id="password" 
            type="password" 
            placeholder="••••••••" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {isSignUp && (
          <div className="flex flex-col gap-2">
            <Label htmlFor="confirmPassword">비밀번호 확인</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
        )}

                {isSignUp && (
          <div className="flex flex-col gap-2">
            <Label htmlFor="nickname">닉네임</Label>
            <Input 
              id="nickname" 
              placeholder="홍길동" 
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
            />
          </div>
        )}

        <Button 
          variant="outline" 
          onClick={isSignUp ? handleEmailSignUp : handleEmailLogin}
          disabled={loading}
        >
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
