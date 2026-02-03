import React from "react";
import Link from "next/link";

/**
 * 텍스트 내의 @username 패턴을 찾아 프로필 링크로 변환합니다.
 * @param content 원본 텍스트
 * @param clickable 클릭 가능 여부 (기본값: true)
 * @returns 텍스트와 링크가 혼합된 리액트 요소 배열
 */
export function renderContent(content: string, clickable: boolean = true) {
  if (!content) return null;

  // @ 기호 뒤에 영문, 숫자, 언더바가 오는 패턴을 찾습니다.
  const parts = content.split(/(@[a-zA-Z0-9_]+)/g);

  return parts.map((part, index) => {
    if (part.startsWith("@") && part.length > 1) {
      const username = part.slice(1);

      if (clickable) {
        return (
          <Link
            key={index}
            href={`/profile/${username}`}
            className="text-blue-500 hover:underline font-medium"
          >
            {part}
          </Link>
        );
      } else {
        return (
          <span key={index} className="text-blue-500 font-medium">
            {part}
          </span>
        );
      }
    }
    return <span key={index}>{part}</span>;
  });
}
