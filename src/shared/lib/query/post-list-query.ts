const POST_LIST_QUERY_ROOT_KEY = "post-list";

export const POST_LIST_QUERY_KEY = [POST_LIST_QUERY_ROOT_KEY] as const;

type PostListFilterOptions = {
  authorId?: string;
  likedByUserId?: string;
  bookmarkedByUserId?: string;
  keyword?: string;
  tag?: string;
};

type PostListInfiniteQueryOptions = {
  filterOptions?: PostListFilterOptions;
  pageSize: number;
};

function normalizePostListFilters(filterOptions: PostListFilterOptions = {}) {
  return {
    authorId: filterOptions.authorId ?? null,
    bookmarkedByUserId: filterOptions.bookmarkedByUserId ?? null,
    keyword: filterOptions.keyword ?? null,
    likedByUserId: filterOptions.likedByUserId ?? null,
    tag: filterOptions.tag ?? null,
  };
}

export function createPostListInfiniteQueryKey({
  filterOptions,
  pageSize,
}: PostListInfiniteQueryOptions) {
  return [
    ...POST_LIST_QUERY_KEY,
    "infinite",
    {
      filters: normalizePostListFilters(filterOptions),
      pageSize,
    },
  ] as const;
}
