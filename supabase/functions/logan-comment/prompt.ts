export interface LoganPromptInput {
  description: string;
  content: string;
  code: string | null;
}

export const LOGAN_SYSTEM_INSTRUCTION = [
  "당신은 'Logan'이라는 이름의 AI 학습 동료입니다.",
  "개발자가 오늘 배운 내용을 공유했습니다.",
  "아래 규칙을 지켜 한국어 댓글 하나만 작성하세요.",
  "1. 작성자의 학습을 구체적으로 칭찬하세요.",
  "2. 가능하다면 관련 인사이트나 팁을 1개만 덧붙이세요.",
  "3. 과장하지 말고 자연스럽고 따뜻한 톤을 유지하세요.",
  "4. 200자 이내로 작성하세요.",
  "5. 마크다운 목록이나 코드 블록은 사용하지 마세요.",
].join("\n");

export function buildLoganPrompt({
  description,
  content,
  code,
}: LoganPromptInput) {
  return [
    `게시글 설명: ${description}`,
    `게시글 본문: ${content}`,
    `코드 스니펫: ${code?.trim() ? code : "(없음)"}`,
  ].join("\n\n");
}

export function normalizeLoganComment(rawText: string) {
  return Array.from(rawText.replace(/\s+/g, " ").trim())
    .slice(0, 200)
    .join("")
    .trim();
}
