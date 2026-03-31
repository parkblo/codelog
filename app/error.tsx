"use client";

import { useEffect } from "react";

import * as Sentry from "@sentry/nextjs";
import { AlertCircle } from "lucide-react";

import {
  StatusAction,
  StatusScreen,
  StatusScreenFrame,
} from "@/shared/ui/status-screen";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
    console.error(error);
  }, [error]);

  return (
    <StatusScreenFrame>
      <StatusScreen
        icon={<AlertCircle size={24} />}
        eyebrow="Unexpected Error"
        title="문제가 발생했습니다"
        description={
          <>
          죄송합니다. 요청을 처리하는 중에 오류가 발생했습니다.
          </>
        }
        detail="일시적인 문제일 수 있습니다. 다시 시도해도 계속 발생하면 잠시 후 다시 확인해 주세요."
        actions={<StatusAction onClick={() => reset()}>다시 시도</StatusAction>}
      />
    </StatusScreenFrame>
  );
}
