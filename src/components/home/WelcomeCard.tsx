import { Sparkles } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import AuthDialog from "./AuthDialog";

export default function WelcomeCard() {
  return (
    <Card className="bg-linear-to-br from-blue-600/10 via-purple-600/10 to-pink-600/10 border border-blue-400/20">
      <CardContent>
        <div className="flex justify-between">
          <div className="flex flex-col">
            <div className="flex gap-2 mb-6">
              <Sparkles className="text-blue-400" />
              <p className="text-foreground">CodeLog에 오신 것을 환영합니다!</p>
            </div>
            <p className="text-foreground">
              지식을 공유하고, 리뷰를 받고, 함께 성장하세요.
            </p>
            <p className="text-muted-foreground text-sm">
              로그인하고 커뮤니티에 참여해보세요!
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <AuthDialog signUp={true}>
              <Button className="w-full" variant="default">
                회원가입
              </Button>
            </AuthDialog>
            <AuthDialog signUp={false}>
              <Button className="w-full" variant="outline">
                로그인
              </Button>
            </AuthDialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
