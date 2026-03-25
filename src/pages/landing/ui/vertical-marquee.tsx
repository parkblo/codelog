"use client";

import { mockPosts } from "@/pages/landing/model";

function LandingPostCard({
  author,
  body,
  handle,
  tag,
  title,
}: (typeof mockPosts)[number]) {
  return (
    <article className="rounded-[2rem] border border-white/10 bg-white/6 p-5 shadow-[0_20px_80px_rgba(0,0,0,0.28)] backdrop-blur">
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

export function VerticalMarquee() {
  const marqueePosts = [...mockPosts, ...mockPosts];

  return (
    <div className="relative h-[40rem] overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/70 px-4 py-5">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-20 bg-linear-to-b from-slate-950 via-slate-950/80 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-20 bg-linear-to-t from-slate-950 via-slate-950/80 to-transparent" />

      <div className="landing-marquee-track flex flex-col gap-4">
        {marqueePosts.map((post, index) => (
          <LandingPostCard key={`${post.id}-${index}`} {...post} />
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
