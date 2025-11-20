import Post from "@/components/home/Post";

export default function Home() {
  /* NOTE- 실서버 사용 전에 사용될 목데이터 */
  const mockPosts = [
    {
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
      likes: 234,
      comments: 18,
      bookmarks: 67,
    },
    {
      id: "2",
      author: {
        nickname: "이코더",
        username: "@leecoder",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=lee",
      },
      timestamp: "5시간 전",
      content:
        "AI에게 코드 리뷰를 받을 때 사용하는 프롬프트입니다. 구체적인 역할과 포맷을 지정하면 훨씬 유용한 피드백을 받을 수 있어요! 🤖",
      code: `당신은 시니어 소프트웨어 엔지니어입니다.
아래 코드를 리뷰하고 다음 관점에서 피드백을 주세요:

1. 성능 최적화 가능성
2. 보안 취약점
3. 코드 가독성 및 유지보수성
4. 베스트 프랙티스 준수 여부

각 항목에 대해 구체적인 예시와 개선 방안을 제시해주세요.
중요도에 따라 🔴 Critical, 🟡 Warning, 🟢 Suggestion으로 분류해주세요.

[여기에 코드를 붙여넣기]`,
      language: "markdown",
      tags: ["AI", "Prompt", "CodeReview", "ChatGPT"],
      likes: 456,
      comments: 32,
      bookmarks: 123,
    },
    {
      id: "3",
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
      likes: 234,
      comments: 18,
      bookmarks: 67,
    },
    {
      id: "4",
      author: {
        nickname: "이코더",
        username: "@leecoder",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=lee",
      },
      timestamp: "5시간 전",
      content:
        "AI에게 코드 리뷰를 받을 때 사용하는 프롬프트입니다. 구체적인 역할과 포맷을 지정하면 훨씬 유용한 피드백을 받을 수 있어요! 🤖",
      code: `당신은 시니어 소프트웨어 엔지니어입니다.
아래 코드를 리뷰하고 다음 관점에서 피드백을 주세요:

1. 성능 최적화 가능성
2. 보안 취약점
3. 코드 가독성 및 유지보수성
4. 베스트 프랙티스 준수 여부

각 항목에 대해 구체적인 예시와 개선 방안을 제시해주세요.
중요도에 따라 🔴 Critical, 🟡 Warning, 🟢 Suggestion으로 분류해주세요.

[여기에 코드를 붙여넣기]`,
      language: "markdown",
      tags: ["AI", "Prompt", "CodeReview", "ChatGPT"],
      likes: 456,
      comments: 32,
      bookmarks: 123,
    },
  ];

  return (
    <div className="p-4 space-y-4">
      {mockPosts.map((post) => (
        <Post key={post.id} post={post} />
      ))}
    </div>
  );
}
