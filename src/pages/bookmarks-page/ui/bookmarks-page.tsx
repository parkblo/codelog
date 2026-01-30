import { redirect } from "next/navigation";

import { Bookmark } from "lucide-react";

import { PostCard } from "@/widgets/post-card";
import { getPostsAction } from "@/entities/post/api/post.action";
import { ServerAuthService } from "@/entities/user/api/server-auth.service";
import { getAuthRedirectUrl } from "@/shared/lib/utils/auth";
import { PageHeader } from "@/shared/ui/page-header";

export async function BookmarksPage() {
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
        data.map((post) => (
          <PostCard key={post.id} post={post} fullPage={false} />
        ))
      )}
    </div>
  );
}
