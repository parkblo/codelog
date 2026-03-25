"use client";

import { ArrowUpRight, Github, Mail, Sparkles } from "lucide-react";

import { useAuth } from "@/entities/user";
import { Button } from "@/shared/ui/button";

import { VerticalMarquee } from "./vertical-marquee";

export function Landing() {
  const { openAuthModal } = useAuth();

  return (
    <div className="relative isolate overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(34,197,94,0.18),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.2),_transparent_28%),linear-gradient(135deg,_#020617_0%,_#0f172a_48%,_#111827_100%)]">
      <div className="pointer-events-none absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(148,163,184,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.12)_1px,transparent_1px)] [background-size:40px_40px]" />

      <div className="relative mx-auto grid min-h-screen max-w-7xl grid-cols-1 gap-12 px-6 py-10 lg:grid-cols-2 lg:items-center lg:px-10">
        <section className="flex max-w-xl flex-col justify-center gap-8 py-8">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-300/25 bg-emerald-300/10 px-4 py-2 text-sm text-emerald-100">
            <Sparkles className="h-4 w-4" />
            하루 한 줄, 성장이 쌓이는 곳
          </div>

          <div className="space-y-5">
            <h1 className="text-5xl font-semibold leading-tight tracking-[-0.04em] text-white md:text-6xl">
              오늘 배운 것을
              <br />
              짧고 선명하게 남기는
              <br />
              개발자 기록장
            </h1>
            <p className="max-w-lg text-base leading-7 text-slate-300 md:text-lg">
              긴 글을 쓰기 전에, 오늘 이해한 한 가지를 먼저 남기세요.
              CodeLog는 기록의 부담은 낮추고, 축적과 피드백의 감각은 크게
              유지하는 TIL 중심 마이크로 블로그입니다.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              size="lg"
              className="h-12 rounded-full bg-white px-6 text-slate-950 hover:bg-slate-200"
              onClick={() => openAuthModal("login")}
            >
              <Github className="h-4 w-4" />
              GitHub 계정으로 계속하기
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-12 rounded-full border-white/20 bg-white/5 px-6 text-white hover:bg-white/10"
              onClick={() => openAuthModal("signup")}
            >
              <Mail className="h-4 w-4" />
              이메일 계정으로 계속하기
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[1.5rem] border border-white/10 bg-white/6 p-5 backdrop-blur">
              <p className="text-sm text-slate-400">오늘의 기록</p>
              <p className="mt-2 text-2xl font-semibold text-white">하루 1글</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                매일 한 번의 기록으로 꾸준함을 만들고, 부담보다 반복을
                선택합니다.
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-white/6 p-5 backdrop-blur">
              <p className="text-sm text-slate-400">참여 유도</p>
              <p className="mt-2 text-2xl font-semibold text-white">TODAY</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                오늘 기록을 남긴 사람만 오늘의 피드를 열어볼 수 있게 설계합니다.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-slate-400">
            <ArrowUpRight className="h-4 w-4" />
            로그인 후에는 곧바로 `/home`으로 이동합니다.
          </div>
        </section>

        <section className="hidden lg:block">
          <VerticalMarquee />
        </section>
      </div>
    </div>
  );
}
