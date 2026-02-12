type ErrorCategory =
  | "network_error"
  | "auth_error"
  | "validation_error"
  | "not_found_error"
  | "server_error"
  | "unknown_error";

export function classifyErrorMessage(
  errorMessage?: string | null,
): ErrorCategory {
  const message = (errorMessage || "").toLowerCase();

  if (!message) {
    return "unknown_error";
  }

  if (
    message.includes("network") ||
    message.includes("fetch") ||
    message.includes("timeout") ||
    message.includes("인터넷") ||
    message.includes("네트워크")
  ) {
    return "network_error";
  }

  if (
    message.includes("unauthorized") ||
    message.includes("forbidden") ||
    message.includes("permission") ||
    message.includes("로그인") ||
    message.includes("권한")
  ) {
    return "auth_error";
  }

  if (
    message.includes("invalid") ||
    message.includes("validation") ||
    message.includes("필수") ||
    message.includes("형식")
  ) {
    return "validation_error";
  }

  if (
    message.includes("not found") ||
    message.includes("찾을 수 없") ||
    message.includes("존재하지")
  ) {
    return "not_found_error";
  }

  if (
    message.includes("internal") ||
    message.includes("server") ||
    message.includes("500")
  ) {
    return "server_error";
  }

  return "unknown_error";
}
