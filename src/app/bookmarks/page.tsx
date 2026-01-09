import { getPostsAction } from "@/actions/post.action";
import Post from "@/components/home/Post";
import { ServerAuthService } from "@/services/auth/server-auth.service";
import { PageHeader } from "@/components/common/PageHeader";
import { Bookmark } from "lucide-react";
import { redirect } from "next/navigation";
import { getAuthRedirectUrl } from "@/utils/auth";

export default async function BookmarksPage() {
  const authService = new ServerAuthService();
  const user = await authService.getCurrentUser();

  if (!user) {
    redirect(getAuthRedirectUrl("/bookmarks"));
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
      <PageHeader
        title="저장한 게시글"
        icon={Bookmark}
        description="저장한 게시글 목록은 나에게만 표시됩니다."
      />

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
