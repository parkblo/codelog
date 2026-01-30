"use client";

import { useRouter } from "next/navigation";

import { ArrowLeft } from "lucide-react";

import { Button } from "./button";

export function BackButton() {
  const router = useRouter();

  return (
    <Button
      variant="ghost"
      className="text-muted-foreground flex items-center"
      onClick={() => router.back()}
    >
      <ArrowLeft className="w-4 h-4" />
      <span>뒤로 가기</span>
    </Button>
  );
}
