import { UserContribution } from "@/types/types";

export function formatRelativeTime(date: string) {
  const now = new Date();
  const then = new Date(date);
  const diff = now.getTime() - then.getTime();

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (years > 0) {
    return `${years}년 전`;
  } else if (months > 0) {
    return `${months}개월 전`;
  } else if (days > 0) {
    return `${days}일 전`;
  } else if (hours > 0) {
    return `${hours}시간 전`;
  } else if (minutes > 0) {
    return `${minutes}분 전`;
  } else {
    return "방금 전";
  }
}

/**
 * 최근 365일간의 기여도 데이터를 생성합니다.
 * 내부적으로 new Date()를 사용하므로, 서버(UTC)와 클라이언트(KST)의 타임존 차이로 인해
 * 결과물이 달라질 수 있어 Hydration Error를 방지하기 위해 클라이언트 컴포넌트에서만 사용해야 합니다.
 */
export function generateContributionData(contributions: UserContribution[]) {
  const map = new Map<string, number>();
  const result: UserContribution[] = [];

  contributions.forEach((val) => {
    map.set(val.contribution_date, val.post_count);
  });

  const today = new Date();
  const startDate = new Date();
  startDate.setDate(today.getDate() - 364);

  for (let i = 0; i < 365; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);

    const dateStr =
      "" +
      currentDate.getFullYear() +
      "-" +
      (currentDate.getMonth() + 1).toString().padStart(2, "0") +
      "-" +
      currentDate.getDate().toString().padStart(2, "0");

    result.push({
      contribution_date: dateStr,
      post_count: map.get(dateStr) || 0,
    });
  }

  return result;
}
