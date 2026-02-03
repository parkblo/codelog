import { TagData } from "@/shared/types/types";

/**
 * 랜덤 시드 생성기 (Mulberry32)
 */
const mulberry32 = (a: number) => {
  return () => {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

/**
 * 태그를 인기도 순으로 정렬한 후, 10개 단위로 묶어 각 묶음 내에서 셔플합니다.
 * @param arr 태그 데이터 배열
 * @param seed 랜덤 시드 (선택 사항, 서버/클라이언트 일관성을 위해 권장)
 * @returns 셔플된 태그 데이터 배열
 */
export const shuffleTagsByChunk = (
  arr: TagData[],
  seed?: number
): TagData[] => {
  const sorted = [...arr].sort((a, b) => b.post_count - a.post_count);
  const result: TagData[] = [];
  const random = seed !== undefined ? mulberry32(seed) : Math.random;

  for (let i = 0; i < sorted.length; i += 10) {
    const chunk = sorted.slice(i, i + 10);
    // Fisher-Yates shuffle
    for (let j = chunk.length - 1; j > 0; j--) {
      const k = Math.floor(random() * (j + 1));
      [chunk[j], chunk[k]] = [chunk[k], chunk[j]];
    }
    result.push(...chunk);
  }

  return result;
};

/**
 * 태그의 게시글 수에 따른 폰트 크기를 계산합니다.
 * @param count 현재 태그의 게시글 수
 * @param minCount 전체 태그 중 최소 게시글 수
 * @param maxCount 전체 태그 중 최대 게시글 수
 * @returns 계산된 폰트 크기 (rem 단위)
 */
export const getFontSize = (
  count: number,
  minCount: number,
  maxCount: number
): string => {
  if (maxCount === minCount) return "1rem";
  const minSize = 0.875; // text-sm
  const maxSize = 1.75;
  const size =
    minSize +
    ((count - minCount) / (maxCount - minCount)) * (maxSize - minSize);
  return `${size}rem`;
};
