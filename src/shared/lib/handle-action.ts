import * as Sentry from "@sentry/nextjs";
import { toast } from "sonner";

import { captureEvent } from "./posthog";

interface ActionResponse<T> {
  data?: T | null;
  error?: string | null;
  message?: string;
}

export async function handleAction<T>(
  promise: Promise<ActionResponse<T>>,
  options?: {
    onSuccess?: (data: T | null) => void;
    onError?: (error: string) => void;
    successMessage?: string;
    actionName?: string;
  },
) {
  const actionName = options?.actionName || "unknown_action";

  try {
    const result = await promise;

    // 1. 실패 케이스 우선 처리
    if (result.error) {
      Sentry.captureMessage(result.error, {
        level: "error",
        tags: { action_name: actionName },
      });
      captureEvent("api_action_failed", {
        action_name: actionName,
        error_message: result.error,
      });

      toast.error(result.error);
      options?.onError?.(result.error);
      return null;
    }

    // 2. 성공 케이스 처리
    if (result.message || options?.successMessage) {
      toast.success(result.message || options?.successMessage);
    }

    options?.onSuccess?.(result.data || null);
    return result.data;
  } catch (error) {
    Sentry.captureException(error, {
      tags: { action_name: actionName },
    });
    captureEvent("runtime_exception_captured", {
      action_name: actionName,
      source: "handle_action",
    });

    toast.error("알 수 없는 에러가 발생했습니다. 관리자에게 문의하세요.");
    return null;
  }
}
