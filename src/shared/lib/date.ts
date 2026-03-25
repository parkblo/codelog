import { UserContribution } from "@/shared/types/types";

export interface LocalDayContext {
  dateKey: string;
  dayStartAt: string;
  dayEndAt: string;
  timezoneOffsetMinutes: number;
}

const MAX_LOCAL_DAY_RANGE_MS = 36 * 60 * 60 * 1000;

function padDatePart(value: number) {
  return String(value).padStart(2, "0");
}

export function getLocalDateKey(
  date: Date | string,
  timezoneOffsetMinutes = new Date(date).getTimezoneOffset(),
) {
  const parsedDate = typeof date === "string" ? new Date(date) : date;

  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  const shiftedDate = new Date(
    parsedDate.getTime() - timezoneOffsetMinutes * 60 * 1000,
  );

  return [
    shiftedDate.getUTCFullYear(),
    padDatePart(shiftedDate.getUTCMonth() + 1),
    padDatePart(shiftedDate.getUTCDate()),
  ].join("-");
}

export function getCurrentLocalDayContext(now = new Date()): LocalDayContext {
  const dayStart = new Date(now);
  const dayEnd = new Date(now);

  dayStart.setHours(0, 0, 0, 0);
  dayEnd.setHours(23, 59, 59, 999);

  return {
    dateKey: getLocalDateKey(now, now.getTimezoneOffset()) ?? "",
    dayStartAt: dayStart.toISOString(),
    dayEndAt: dayEnd.toISOString(),
    timezoneOffsetMinutes: now.getTimezoneOffset(),
  };
}

export function isValidLocalDayContext(context: LocalDayContext) {
  const dayStart = new Date(context.dayStartAt);
  const dayEnd = new Date(context.dayEndAt);
  const timezoneOffsetMinutes = context.timezoneOffsetMinutes;

  if (
    Number.isNaN(dayStart.getTime()) ||
    Number.isNaN(dayEnd.getTime()) ||
    !Number.isInteger(timezoneOffsetMinutes)
  ) {
    return false;
  }

  if (timezoneOffsetMinutes < -840 || timezoneOffsetMinutes > 840) {
    return false;
  }

  const rangeMs = dayEnd.getTime() - dayStart.getTime();

  if (rangeMs < 0 || rangeMs > MAX_LOCAL_DAY_RANGE_MS) {
    return false;
  }

  const dateKey = getLocalDateKey(dayStart, timezoneOffsetMinutes);

  return dateKey !== null && dateKey === context.dateKey;
}

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
