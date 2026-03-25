import type { Post } from "@/shared/types";

export const CODELOG_BASE_URL = "https://codelog.vercel.app";
export const CODELOG_DEFAULT_DESCRIPTION =
  "오늘 배운 것을 짧게 기록하고, 다른 개발자의 오늘을 만나는 곳.";

const MAX_POST_DESCRIPTION_LENGTH = 150;

function normalizeText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

export function getAbsoluteUrl(path: string) {
  return new URL(path, CODELOG_BASE_URL).toString();
}

export function getPostPath(postId: number | string) {
  return `/post/${postId}`;
}

type SeoAuthor = Pick<Post["author"], "username" | "nickname">;

export function getPostSeoTitle(post: { author: SeoAuthor }) {
  const displayName = post.author.nickname || post.author.username;

  return `${displayName}의 오늘 기록`;
}

export function getPostSeoDescription(
  post: Pick<Post, "description" | "content">,
) {
  const summary = normalizeText(post.description);

  if (summary) {
    return summary;
  }

  const content = normalizeText(post.content);

  if (content.length <= MAX_POST_DESCRIPTION_LENGTH) {
    return content;
  }

  return `${content.slice(0, MAX_POST_DESCRIPTION_LENGTH).trimEnd()}...`;
}

type StructuredDataPost = Pick<
  Post,
  "id" | "description" | "content" | "created_at" | "updated_at" | "language" | "tags"
> & {
  author: SeoAuthor;
};

export function getPostStructuredData(post: StructuredDataPost) {
  const authorName = post.author.nickname || post.author.username;
  const url = getAbsoluteUrl(getPostPath(post.id));

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: getPostSeoTitle(post),
    description: getPostSeoDescription(post),
    articleBody: post.content,
    datePublished: post.created_at,
    dateModified: post.updated_at || post.created_at,
    inLanguage: "ko-KR",
    mainEntityOfPage: url,
    url,
    author: {
      "@type": "Person",
      name: authorName,
      alternateName: post.author.username,
    },
    publisher: {
      "@type": "Organization",
      name: "CodeLog",
      url: CODELOG_BASE_URL,
    },
    keywords: post.tags.length > 0 ? post.tags.join(", ") : undefined,
    articleSection: post.language || undefined,
  };
}
