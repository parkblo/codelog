import { toast } from "sonner";

// 힌트: 제네릭 <T>를 사용하여 어떤 데이터가 반환되든 타입을 유지할 수 있도록 하세요.
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
  }
) {
  try {
    const result = await promise;

    // 1. 실패 케이스 우선 처리
    if (result.error) {
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
  } catch (e) {
    toast.error("알 수 없는 에러가 발생했습니다. 관리자에게 문의하세요.");
  }
}
