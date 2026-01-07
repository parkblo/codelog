import { getPostsAction } from "@/actions/post.action";
import Post from "@/components/home/Post";
import { ServerAuthService } from "@/services/auth/server-auth.service";
import { Bookmark } from "lucide-react";
import { redirect } from "next/navigation";

export default async function BookmarksPage() {
  const authService = new ServerAuthService();
  const user = await authService.getCurrentUser();

  if (!user) {
    redirect("/home");
  }

  const { data, error } = await getPostsAction({ bookmarkedByUserId: user.id });

  if (error) {
    return (
      <div className="p-4">
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-xl font-bold px-2 flex gap-2 items-center">
          <Bookmark /> 저장한 게시글
        </h1>
        <p className="text-sm text-muted-foreground">
          저장한 게시글 목록은 나에게만 표시됩니다.
        </p>
      </div>

      {!data || data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
          <p>저장한 게시글이 없습니다.</p>
        </div>
      ) : (
        data.map((post) => <Post key={post.id} post={post} fullPage={false} />)
      )}
    </div>
  );
}
