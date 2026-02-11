"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { Github, Mail } from "lucide-react";

import { useAuth } from "@/entities/user";
import {
  signInWithOAuthAction,
  signInWithPasswordAction,
  signUpAction,
} from "@/entities/user";
import { cn } from "@/shared/lib";
import { handleAction } from "@/shared/lib/handle-action";
import { captureEvent } from "@/shared/lib/posthog";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Separator } from "@/shared/ui/separator";

import {
  type LoginFormData,
  loginSchema,
  type SignUpFormData,
  signUpSchema,
} from "../model/auth.schema";

function LoginForm({
  onGitHubLogin,
  isGitHubLoading,
}: {
  onGitHubLogin: () => void;
  isGitHubLoading: boolean;
}) {
  const { openAuthModal } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: LoginFormData) => {
    captureEvent("auth_email_login_submitted");

    await handleAction(
      signInWithPasswordAction({
        email: data.email,
        password: data.password,
      }),
      {
        actionName: "sign_in_with_password",
        onSuccess: () => {
          captureEvent("auth_email_login_succeeded");
          const next = searchParams?.get("next");
          if (next) {
            router.push(next);
          } else {
            window.location.reload();
          }
        },
      },
    );
  };

  return (
    <>
      <Button
        onClick={() => {
          captureEvent("auth_github_login_clicked");
          onGitHubLogin();
        }}
        disabled={isSubmitting || isGitHubLoading}
      >
        <Github /> GitHub로 로그인
      </Button>
      <div className="relative mt-2 mb-2">
        <div className="absolute inset-0 flex justify-center items-center">
          <Separator />
        </div>
        <div className="absolute inset-0 flex justify-center items-center">
          <span className="text-sm text-muted-foreground">또는</span>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="email">
            이메일 <span className="text-orange-600">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            autoComplete="email"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="password">
            비밀번호<span className="text-orange-600">*</span>
          </Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            {...register("password")}
          />
          {errors.password && (
            <p className="text-sm text-destructive">
              {errors.password.message}
            </p>
          )}
        </div>

        <Button variant="outline" disabled={isSubmitting} type="submit">
          <Mail /> 이메일로 로그인
        </Button>
      </form>
      <div className="flex justify-center items-center">
        <p className="text-sm text-muted-foreground align-middle">
          계정이 없으신가요?{" "}
          <span
            className="underline hover:cursor-pointer"
            onClick={() => {
              captureEvent("auth_view_switched", { next_view: "signup" });
              openAuthModal("signup");
            }}
          >
            가입하기
          </span>
        </p>
      </div>
    </>
  );
}

function SignUpForm({
  onGitHubLogin,
  isGitHubLoading,
}: {
  onGitHubLogin: () => void;
  isGitHubLoading: boolean;
}) {
  const { openAuthModal } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      username: "",
      nickname: "",
    },
  });

  const onSubmit = async (data: SignUpFormData) => {
    captureEvent("auth_email_signup_submitted");

    await handleAction(
      signUpAction({
        email: data.email,
        password: data.password,
        data: {
          user_name: data.username,
          nick_name: data.nickname,
          avatar_url: "",
        },
      }),
      {
        actionName: "sign_up_with_password",
        onSuccess: () => {
          captureEvent("auth_email_signup_succeeded");
          openAuthModal("login");
        },
      },
    );
  };

  return (
    <>
      <Button
        onClick={() => {
          captureEvent("auth_github_signup_clicked");
          onGitHubLogin();
        }}
        disabled={isSubmitting || isGitHubLoading}
      >
        <Github /> GitHub로 가입
      </Button>
      <div className="relative mt-2 mb-2">
        <div className="absolute inset-0 flex justify-center items-center">
          <Separator />
        </div>
        <div className="absolute inset-0 flex justify-center items-center">
          <span className="text-sm text-muted-foreground">또는</span>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="email">
            이메일 <span className="text-orange-600">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            autoComplete="email"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="password">
            비밀번호<span className="text-orange-600">*</span>
          </Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            {...register("password")}
          />
          {errors.password && (
            <p className="text-sm text-destructive">
              {errors.password.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="confirmPassword">
            비밀번호 확인<span className="text-orange-600">*</span>
          </Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            {...register("confirmPassword")}
          />
          {errors.confirmPassword && (
            <p className="text-sm text-destructive">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="username">
            아이디<span className="text-orange-600">*</span>
          </Label>
          <Input
            id="username"
            placeholder="honggildong"
            autoComplete="username"
            {...register("username")}
          />
          {errors.username && (
            <p className="text-sm text-destructive">
              {errors.username.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="nickname">
            닉네임<span className="text-orange-600">*</span>
          </Label>
          <Input
            id="nickname"
            placeholder="gildong_code"
            autoComplete="nickname"
            {...register("nickname")}
          />
          {errors.nickname && (
            <p className="text-sm text-destructive">
              {errors.nickname.message}
            </p>
          )}
        </div>

        <Button variant="outline" disabled={isSubmitting} type="submit">
          <Mail /> 이메일로 가입
        </Button>
      </form>
      <div className="flex justify-center items-center">
        <p className="text-sm text-muted-foreground align-middle">
          계정이 이미 있으신가요?{" "}
          <span
            className="underline hover:cursor-pointer"
            onClick={() => {
              captureEvent("auth_view_switched", { next_view: "login" });
              openAuthModal("login");
            }}
          >
            로그인하기
          </span>
        </p>
      </div>
    </>
  );
}

export default function AuthDialog() {
  const { isAuthModalOpen, authModalView, closeAuthModal } = useAuth();
  const [isGitHubLoading, setIsGitHubLoading] = useState(false);
  const searchParams = useSearchParams();

  const isSignUp = authModalView === "signup";

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      closeAuthModal();
    }
  };

  const handleGitHubLogin = async () => {
    captureEvent("auth_oauth_requested", { provider: "github" });

    const next = searchParams?.get("next");
    const redirectTo = next
      ? `${location.origin}/auth/callback?next=${encodeURIComponent(next)}`
      : `${location.origin}/auth/callback`;

    setIsGitHubLoading(true);

    await handleAction(
      signInWithOAuthAction("github", {
        redirectTo,
      }),
      {
        actionName: "sign_in_with_oauth",
        onSuccess: (data) => {
          if (data?.url) {
            captureEvent("auth_oauth_redirected", { provider: "github" });
            window.location.href = data.url;
          } else {
            setIsGitHubLoading(false);
          }
        },
        onError: () => {
          captureEvent("auth_oauth_failed", { provider: "github" });
          setIsGitHubLoading(false);
        },
      },
    );
  };

  return (
    <Dialog open={isAuthModalOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        className={cn(
          "w-md transition-colors",
          isSignUp &&
            "bg-linear-to-br from-blue-600/10 via-purple-600/10 to-pink-600/10 border border-blue-400/20",
        )}
      >
        <DialogHeader>
          <DialogTitle>{isSignUp ? "회원가입" : "로그인"}</DialogTitle>
          <DialogDescription>
            계정에 로그인하여 CodeLog의 모든 기능을 즐겨보세요.
          </DialogDescription>
        </DialogHeader>
        {isSignUp ? (
          <SignUpForm
            onGitHubLogin={handleGitHubLogin}
            isGitHubLoading={isGitHubLoading}
          />
        ) : (
          <LoginForm
            onGitHubLogin={handleGitHubLogin}
            isGitHubLoading={isGitHubLoading}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
