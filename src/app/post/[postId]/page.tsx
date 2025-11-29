import Post from "@/components/home/Post";
import { BackButton } from "@/components/ui/back-button";
import CommentForm from "./_components/CommentForm";
import Comment from "./_components/Comment";

export default function PostPage() {
  const mockPost = {
    id: "1",
    author: {
      nickname: "김개발",
      username: "@kimdev",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=kim",
    },
    timestamp: "2시간 전",
    content:
      "파이썬의 리스트 컴프리헨션을 사용하면 코드를 간결하고 읽기 쉽게 만들 수 있습니다. 특히 필터링과 변환을 동시에 할 때 정말 유용해요! 🐍",
    code: `# 기존 방식
result = []
for i in range(10):
    if i % 2 == 0:
        result.append(i ** 2)

# 리스트 컴프리헨션
result = [i ** 2 for i in range(10) if i % 2 == 0]

# 중첩 리스트 평탄화
matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
flattened = [num for row in matrix for num in row]
# [1, 2, 3, 4, 5, 6, 7, 8, 9]`,
    language: "python",
    tags: ["Python", "ListComprehension", "CleanCode"],
    like_count: 234,
    comment_count: 18,
    bookmark_count: 67,
  };

  const mockComment = {
    author: {
      nickname: "김개발",
      username: "@kimdev",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=kim",
    },
    content:
      "파이썬의 리스트 컴프리헨션을 사용하면 코드를 간결하고 읽기 쉽게 만들 수 있습니다. 특히 필터링과 변환을 동시에 할 때 정말 유용해요! 🐍",
    created_at: "2시간 전",
    updated_at: "2시간 전",
    like_count: 234,
  };

  return (
    <div className="p-4 space-y-4">
      <div className="sticky flex gap-2 items-center w-full bg-background">
        <BackButton />
      </div>
      <Post post={mockPost} />
      <CommentForm />
      <Comment comment={mockComment} />
    </div>
  );
}
