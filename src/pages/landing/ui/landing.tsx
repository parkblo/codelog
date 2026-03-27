"use client";

import Image from "next/image";

import {
  Flame,
  Github,
  Loader2,
  Mail,
  MessageCircleMore,
  PencilLine,
} from "lucide-react";

import { useGitHubOAuthLogin } from "@/features/auth/lib/use-github-oauth-login";
import { useAuth } from "@/entities/user";
import { captureEvent } from "@/shared/lib/posthog";
import { Button } from "@/shared/ui/button";
import { VerticalMarquee } from "@/shared/ui/vertical-marquee";

export function Landing() {
  const { openAuthModal } = useAuth();
  const { isGitHubLoading, startGitHubOAuthLogin } = useGitHubOAuthLogin();

  return (
    <div className="relative isolate overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(34,197,94,0.18),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.2),_transparent_28%),linear-gradient(135deg,_#020617_0%,_#0f172a_48%,_#111827_100%)]">
      <div className="pointer-events-none absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(148,163,184,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.12)_1px,transparent_1px)] [background-size:40px_40px]" />

      <div className="relative mx-auto grid min-h-screen max-w-7xl grid-cols-1 gap-12 px-6 py-10 lg:grid-cols-2 lg:items-center lg:px-10">
        <section className="flex max-w-xl flex-col justify-center gap-8 py-8">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-3 text-slate-200">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/8 shadow-[0_12px_32px_rgba(15,23,42,0.28)] backdrop-blur">
                <Image
                  src="/icon.svg"
                  alt="CodeLog logo"
                  width={28}
                  height={28}
                  className="h-7 w-7"
                />
              </div>
              <span className="text-lg font-semibold tracking-[-0.03em] text-white">
                CodeLog
              </span>
            </div>

            <h1 className="text-5xl font-semibold leading-tight tracking-[-0.04em] text-white md:text-6xl">
              오늘 배운 것을
              <br />
              짧고 선명하게 남기는
              <br />
              개발자의 다이어리
            </h1>
            <p className="max-w-xl text-base leading-8 text-slate-300 md:text-lg">
              긴 글을 쓰기 전에{" "}
              <PencilLine className="mx-1 inline h-4 w-4 text-emerald-300" />
              <span className="underline decoration-2 decoration-emerald-300/70 underline-offset-4">
                오늘 이해한 한 가지
              </span>
              를 먼저 남기고,{" "}
              <MessageCircleMore className="mx-1 inline h-4 w-4 text-sky-300" />
              <span className="underline decoration-2 decoration-sky-300/70 underline-offset-4">
                담백한 소통
              </span>
              으로 흐름을 이어가며,{" "}
              <Flame className="mx-1 inline h-4 w-4 text-amber-300" />
              <span className="underline decoration-2 decoration-amber-300/70 underline-offset-4">
                성장의 불씨
              </span>
              를 매일 꺼뜨리지 않는 TIL 중심 마이크로 블로그입니다.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              size="lg"
              className="h-12 rounded-full bg-white px-6 text-slate-950 hover:bg-slate-200"
              disabled={isGitHubLoading}
              onClick={() => {
                captureEvent("auth_github_landing_clicked");
                void startGitHubOAuthLogin();
              }}
            >
              {isGitHubLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Github className="h-4 w-4" />
              )}
              {isGitHubLoading
                ? "GitHub로 이동 중..."
                : "GitHub 계정으로 계속하기"}
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-12 rounded-full border-white/20 bg-white/5 px-6 text-white hover:bg-white/10"
              onClick={() => openAuthModal("login")}
            >
              <Mail className="h-4 w-4" />
              이메일 계정으로 계속하기
            </Button>
          </div>
        </section>

        <section className="hidden lg:block">
          <VerticalMarquee />
        </section>
      </div>
    </div>
  );
}
