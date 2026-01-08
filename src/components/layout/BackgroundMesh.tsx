"use client";

export default function BackgroundMesh() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none select-none">
      {/* Top Left Blob */}
      <div className="absolute top-[-5%] left-[-5%] md:top-[-10%] md:left-[-10%] w-[60%] md:w-[40%] h-[60%] md:h-[40%] rounded-full bg-blue-500/10 blur-[80px] md:blur-[120px] motion-reduce:blur-none" />

      {/* Top Right Blob */}
      <div className="absolute top-[15%] right-[-5%] md:top-[20%] md:right-[-10%] w-[50%] md:w-[35%] h-[50%] md:h-[35%] rounded-full bg-purple-500/10 blur-[80px] md:blur-[120px] motion-reduce:blur-none" />

      {/* Bottom Left Blob */}
      <div className="absolute bottom-[-5%] left-[10%] md:bottom-[-10%] md:left-[20%] w-[70%] md:w-[45%] h-[70%] md:h-[45%] rounded-full bg-pink-500/10 blur-[80px] md:blur-[120px] motion-reduce:blur-none" />

      {/* Center ambient light */}
      <div className="absolute top-[50%] left-[50%] w-[40%] h-[40%] rounded-full bg-blue-600/5 blur-[80px] md:blur-[100px] motion-reduce:blur-none -translate-x-1/2 -translate-y-1/2" />
    </div>
  );
}
