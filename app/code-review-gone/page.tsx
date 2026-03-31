import type { Metadata } from "next";

import {
  StatusAction,
  StatusScreen,
  StatusScreenFrame,
} from "@/shared/ui/status-screen";

export const metadata: Metadata = {
  title: "code-review 페이지가 제거되었습니다",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function CodeReviewGonePage() {
  return (
    <StatusScreenFrame>
      <StatusScreen
        title="코드 리뷰 전용 목록 페이지가 제거되었습니다."
        description={
          <>
            이 페이지는 더 이상 제공되지 않습니다. 저장해 둔 북마크나 외부
            링크를 통해 들어오셨다면 새 경로로 갱신해 주세요.
          </>
        }
        actions={
          <>
            <StatusAction href="/home" tone="primary">
              홈으로 이동
            </StatusAction>
          </>
        }
      />
    </StatusScreenFrame>
  );
}
