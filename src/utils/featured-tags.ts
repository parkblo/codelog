import { TagData } from "@/types/types";

/**
 * 태그를 인기도 순으로 정렬한 후, 10개 단위로 묶어 각 묶음 내에서 셔플합니다.
 * @param arr 태그 데이터 배열
 * @returns 셔플된 태그 데이터 배열
 */
export const shuffleTagsByChunk = (arr: TagData[]): TagData[] => {
  const sorted = [...arr].sort((a, b) => b.post_count - a.post_count);
  const result: TagData[] = [];

  for (let i = 0; i < sorted.length; i += 10) {
    const chunk = sorted.slice(i, i + 10);
    // Fisher-Yates shuffle
    for (let j = chunk.length - 1; j > 0; j--) {
      const k = Math.floor(Math.random() * (j + 1));
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
