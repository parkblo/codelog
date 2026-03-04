import { describe, expect, it } from "vitest";

import { classifyErrorMessage } from "./monitoring";

describe("classifyErrorMessage", () => {
  it("네트워크 관련 메시지를 network_error로 분류한다", () => {
    expect(classifyErrorMessage("Network timeout")).toBe("network_error");
    expect(classifyErrorMessage("네트워크 연결 오류")).toBe("network_error");
  });

  it("인증 관련 메시지를 auth_error로 분류한다", () => {
    expect(classifyErrorMessage("Unauthorized")).toBe("auth_error");
    expect(classifyErrorMessage("권한이 없습니다")).toBe("auth_error");
  });

  it("검증 실패 메시지를 validation_error로 분류한다", () => {
    expect(classifyErrorMessage("validation failed")).toBe("validation_error");
    expect(classifyErrorMessage("필수 값 누락")).toBe("validation_error");
  });

  it("기타 케이스를 적절히 분류한다", () => {
    expect(classifyErrorMessage("not found post")).toBe("not_found_error");
    expect(classifyErrorMessage("internal server error")).toBe("server_error");
    expect(classifyErrorMessage("")).toBe("unknown_error");
  });
});
