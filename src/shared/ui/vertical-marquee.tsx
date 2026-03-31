"use client";

import { cn } from "@/shared/lib/cn";

interface VerticalMarqueeProps {
  className?: string;
  cardClassName?: string;
  topFadeClassName?: string;
  bottomFadeClassName?: string;
  trackClassName?: string;
}

interface VerticalMarqueePost {
  id: number;
  author: string;
  handle: string;
  title: string;
  body: string;
  tag: string;
}

const mockPosts: VerticalMarqueePost[] = [
  {
    id: 1,
    author: "민지",
    handle: "@minji.dev",
    title: "오늘 React effect 정리",
    body: "cleanup 함수가 unmount 전용이 아니라 다음 effect 실행 전에도 호출된다는 걸 정확히 이해했다.",
    tag: "react",
  },
  {
    id: 2,
    author: "준호",
    handle: "@junho.log",
    title: "SQL 인덱스 체감",
    body: "복합 인덱스 순서 하나 바꿨는데 조회 시간이 1.4초에서 120ms까지 줄었다.",
    tag: "database",
  },
  {
    id: 3,
    author: "서연",
    handle: "@seoyeon.codes",
    title: "Next.js 캐시 실수",
    body: "route handler 캐시 정책을 명시하지 않아서 예상보다 오래 stale 응답이 남아 있었다.",
    tag: "nextjs",
  },
  {
    id: 4,
    author: "도윤",
    handle: "@doyun",
    title: "테스트가 설계 문서였다",
    body: "복잡한 분기 로직은 구현보다 테스트 이름을 먼저 쓰는 편이 훨씬 빨랐다.",
    tag: "testing",
  },
  {
    id: 5,
    author: "지우",
    handle: "@jiwoo.dev",
    title: "TanStack Query 메모",
    body: "mutation 성공 후 invalidate 범위를 좁히니까 화면 흔들림이 거의 사라졌다.",
    tag: "frontend",
  },
  {
    id: 6,
    author: "현우",
    handle: "@hyunwoo",
    title: "Nest DI 디버깅",
    body: "순환 참조는 모듈 import보다 provider 경계 설계 문제일 때가 많았다.",
    tag: "backend",
  },
  {
    id: 7,
    author: "예린",
    handle: "@yerin.til",
    title: "문서화 습관",
    body: "배운 걸 짧게 남겨두면 일주일 뒤 회고 속도가 확실히 달라진다.",
    tag: "workflow",
  },
  {
    id: 8,
    author: "태현",
    handle: "@taehyun",
    title: "Zod 경계선",
    body: "폼 검증과 서버 입력 검증을 같은 스키마로 쓰되, 에러 메시지 맥락은 분리하는 편이 낫다.",
    tag: "typescript",
  },
  {
    id: 9,
    author: "가은",
    handle: "@gaeun.dev",
    title: "Supabase RLS 복기",
    body: "정책이 맞아도 JWT 클레임 전제가 어긋나면 결국 전체 흐름이 무너진다.",
    tag: "supabase",
  },
  {
    id: 10,
    author: "시우",
    handle: "@siwoo.logs",
    title: "작게 쓰는 기록",
    body: "긴 글보다 오늘 하나만 정확히 남기는 편이 꾸준함에는 더 유리했다.",
    tag: "til",
  },
];

function VerticalMarqueeCard({
  author,
  body,
  handle,
  tag,
  title,
  className,
}: VerticalMarqueePost & { className?: string }) {
  return (
    <article
      className={cn(
        "rounded-[2rem] border border-white/10 bg-white/6 p-5 shadow-[0_20px_80px_rgba(0,0,0,0.28)] backdrop-blur",
        className,
      )}
    >
      <div className="flex items-center justify-between text-xs text-slate-300">
        <div>
          <p className="font-semibold text-slate-100">{author}</p>
          <p>{handle}</p>
        </div>
        <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 uppercase tracking-[0.2em] text-cyan-200">
          {tag}
        </span>
      </div>
      <div className="mt-4 space-y-2">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <p className="text-sm leading-6 text-slate-300">{body}</p>
      </div>
    </article>
  );
}

export function VerticalMarquee({
  className,
  cardClassName,
  topFadeClassName,
  bottomFadeClassName,
  trackClassName,
}: VerticalMarqueeProps = {}) {
  const marqueePosts = [...mockPosts, ...mockPosts];

  return (
    <div
      className={cn(
        "relative h-[40rem] overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/70 px-4 py-5",
        className,
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 z-10 h-20 bg-linear-to-b from-slate-950 via-slate-950/80 to-transparent",
          topFadeClassName,
        )}
      />
      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 bottom-0 z-10 h-20 bg-linear-to-t from-slate-950 via-slate-950/80 to-transparent",
          bottomFadeClassName,
        )}
      />

      <div className={cn("landing-marquee-track flex flex-col gap-4", trackClassName)}>
        {marqueePosts.map((post, index) => (
          <VerticalMarqueeCard
            key={`${post.id}-${index}`}
            {...post}
            className={cardClassName}
          />
        ))}
      </div>

      <style jsx>{`
        .landing-marquee-track {
          animation: landing-marquee 30s linear infinite;
        }

        .landing-marquee-track:hover {
          animation-play-state: paused;
        }

        @keyframes landing-marquee {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(calc(-50% - 0.5rem));
          }
        }
      `}</style>
    </div>
  );
}
