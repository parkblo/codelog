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
import { Image, Loader, Pencil } from "lucide-react";
import { Input } from "@/components/ui/input";
import React, { useRef, useState } from "react";
import { handleAction } from "@/utils/handle-action";
import { editUserAction, updateAvatarAction } from "@/actions/user.action";
import { UserServiceBrowser } from "@/services/user/user.service.browser";
import { toast } from "sonner";
import { useAuth } from "@/providers/auth-provider";

interface ProfileEditDialogProps {
  user: UserAuth;
}

export default function ProfileEditDialog({
  user: initialUser,
}: ProfileEditDialogProps) {
  const [user, setUser] = useState<UserAuth>(initialUser);
  const [isAvatarHovered, setIsAvatarHovered] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { updateUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const file = e.target.files?.[0];
      if (!file) return;

      const userService = new UserServiceBrowser();
      const { data: publicUrl, error } = await userService.uploadAvatar(
        user.id,
        file
      );

      if (error) {
        toast.error(error);
        return;
      }

      if (publicUrl) {
        const avatarWithCache = `${publicUrl}?v=${Date.now()}`;
        const updatedUser = { ...user, avatar: avatarWithCache };
        setUser(updatedUser);
        updateUser(updatedUser);
        await handleAction(
          updateAvatarAction(user.id, user.username, avatarWithCache)
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const editUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    await handleAction(editUserAction(user), {
      successMessage: "프로필이 수정되었습니다.",
    });

    updateUser(user);

    setIsSubmitting(false);
  };

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
            onClick={onAvatarClick}
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
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/jpeg,image/png,image/webp"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (!file) {
                return;
              }
              const maxSizeBytes = 5 * 1024 * 1024; // 5MB
              const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
              if (file.size > maxSizeBytes) {
                toast.error("이미지 용량은 최대 5MB까지 업로드할 수 있습니다.");
                event.target.value = "";
                return;
              }
              if (!allowedTypes.includes(file.type)) {
                toast.error(
                  "JPEG, PNG, WebP 형식의 이미지 파일만 업로드할 수 있습니다."
                );
                event.target.value = "";
                return;
              }
              onFileChange(event);
            }}
          />

          <form onSubmit={editUser} className="w-full">
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
                <Button disabled={isSubmitting}>
                  {isSubmitting ? (
                    <Loader className="h-4 w-4 animate-spin" />
                  ) : (
                    <Pencil className="h-4 w-4" />
                  )}{" "}
                  수정
                </Button>
              </div>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
