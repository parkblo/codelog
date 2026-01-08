"use client";

import { Github, Mail } from "lucide-react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { useAuth } from "@/providers/auth-provider";
import { Separator } from "../ui/separator";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { FormEvent, useState } from "react";
import { cn } from "@/lib/utils";
import { handleAction } from "@/utils/handle-action";
import {
  signInWithOAuthAction,
  signInWithPasswordAction,
  signUpAction,
} from "@/actions/auth.action";

export default function AuthDialog() {
  const { isAuthModalOpen, authModalView, openAuthModal, closeAuthModal } =
    useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [nickname, setNickname] = useState("");
  const [loading, setLoading] = useState(false);

  const isSignUp = authModalView === "signup";

  /*
    NOTE-
    dialog를 닫아도 상태가 남아있는 문제 해결용.
  */
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      closeAuthModal();
      setTimeout(() => {
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setNickname("");
        setUsername("");
      }, 300);
    }
  };

  const handleGitHubLogin = async () => {
    await handleAction(
      signInWithOAuthAction("github", {
        redirectTo: `${location.origin}/auth/callback`,
      }),
      {
        onSuccess: (data) => {
          if (data?.url) {
            window.location.href = data.url;
          }
        },
      }
    );
  };

  const handleEmailLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await handleAction(
      signInWithPasswordAction({
        email,
        password,
      }),
      {
        onSuccess: () => {
          window.location.reload();
        },
      }
    );
    setLoading(false);
  };

  const handleEmailSignUp = async (e: FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("비밀번호가 일치하지 않습니다.");
      return;
    }

    setLoading(true);
    await handleAction(
      signUpAction({
        email,
        password,
        data: {
          user_name: username,
          nick_name: nickname,
          avatar_url: "",
        },
      }),
      {
        onSuccess: () => {
          openAuthModal("login");
        },
      }
    );
    setLoading(false);
  };

  return (
    <Dialog open={isAuthModalOpen} onOpenChange={handleOpenChange}>
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

        <form
          onSubmit={isSignUp ? handleEmailSignUp : handleEmailLogin}
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">
              이메일 <span className="text-orange-600">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          {isSignUp ? (
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">
                비밀번호<span className="text-orange-600">*</span>
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">
                비밀번호<span className="text-orange-600">*</span>
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>
          )}

          {isSignUp && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="confirmPassword">
                비밀번호 확인<span className="text-orange-600">*</span>
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
            </div>
          )}

          {isSignUp && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="username">
                사용자 이름<span className="text-orange-600">*</span>
              </Label>
              <Input
                id="username"
                placeholder="사용자 이름"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                required
              />
            </div>
          )}

          {isSignUp && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="nickname">
                닉네임<span className="text-orange-600">*</span>
              </Label>
              <Input
                id="nickname"
                placeholder="닉네임"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                autoComplete="nickname"
                required
              />
            </div>
          )}

          <Button variant="outline" disabled={loading} type="submit">
            <Mail /> {isSignUp ? "이메일로 가입" : "이메일로 로그인"}
          </Button>
        </form>
        <div className="flex justify-center items-center">
          {!isSignUp && (
            <p className="text-sm text-muted-foreground align-middle">
              계정이 없으신가요?{" "}
              <span
                className="underline hover:cursor-pointer"
                onClick={() => openAuthModal("signup")}
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
                onClick={() => openAuthModal("login")}
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
