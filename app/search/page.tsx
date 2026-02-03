import { SearchPage } from "@/pages/search";

interface SearchPageProps {
  searchParams: Promise<{ q?: string; tag?: string }>;
}

export default async function Page({ searchParams }: SearchPageProps) {
  const { q, tag } = await searchParams;
  return <SearchPage q={q} tag={tag} />;
}
