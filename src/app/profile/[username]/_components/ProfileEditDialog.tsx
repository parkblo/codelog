"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserAuth } from "@/types/types";
import { Image, Pencil } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface ProfileEditDialogProps {
  user: UserAuth;
}

export default function ProfileEditDialog({
  user: initialUser,
}: ProfileEditDialogProps) {
  const [user, setUser] = useState<UserAuth>(initialUser);
  const [isAvatarHovered, setIsAvatarHovered] = useState(false);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>프로필 수정</DialogTitle>
        </DialogHeader>
        <div className="flex gap-4">
          <Avatar
            className="w-30 h-30 border border-border hover:cursor-pointer relative"
            onMouseOver={() => setIsAvatarHovered(true)}
            onMouseOut={() => setIsAvatarHovered(false)}
          >
            {user && (
              <>
                <AvatarImage src={user.avatar || ""} alt={user.nickname} />
                <AvatarFallback>
                  {user.nickname ? user.nickname.charAt(0) : ""}
                </AvatarFallback>
              </>
            )}
            {isAvatarHovered && (
              <div className="absolute w-30 h-30 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/40 rounded-full flex items-center justify-center">
                <Image className="h-6 w-6 text-white" />
              </div>
            )}
          </Avatar>

          <form className="w-full">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="nickname">닉네임</Label>
                <Input
                  id="nickname"
                  type="text"
                  value={user.nickname}
                  placeholder="닉네임을 입력해주세요."
                  onChange={(e) => {
                    setUser({
                      ...user,
                      nickname: e.target.value,
                    });
                  }}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="bio">소개글</Label>
                <Input
                  id="bio"
                  type="text"
                  value={user.bio || ""}
                  placeholder="나를 소개하는 한 줄을 입력해주세요."
                  onChange={(e) => {
                    setUser({
                      ...user,
                      bio: e.target.value,
                    });
                  }}
                />
              </div>
              <div className="flex justify-end">
                <Button>
                  <Pencil className="h-4 w-4" /> 수정
                </Button>
              </div>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
