"use client";
import React, { useRef, useState } from "react";
import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { Image as ImageIcon, Loader, Pencil } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/entities/user";
import {
  editUserAction,
  updateAvatarAction,
  uploadAvatar,
} from "@/entities/user";
import { handleAction } from "@/shared/lib/handle-action";
import { UserAuth } from "@/shared/types/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";

import { type ProfileFormData, profileSchema } from "../model/profile.schema";

interface ProfileEditDialogProps {
  user: UserAuth;
}

export default function ProfileEditDialog({
  user: initialUser,
}: ProfileEditDialogProps) {
  const [avatarUrl, setAvatarUrl] = useState(initialUser.avatar || "");
  const [isAvatarHovered, setIsAvatarHovered] = useState(false);
  const [isAvatarUploading, setIsAvatarUploading] = useState(false);
  const { updateUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      nickname: initialUser.nickname,
      bio: initialUser.bio || "",
    },
  });

  const onAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isAvatarUploading) return;
    setIsAvatarUploading(true);

    try {
      const file = e.target.files?.[0];
      if (!file) return;

      const { data: publicUrl, error } = await uploadAvatar(
        initialUser.id,
        file,
      );

      if (error) {
        toast.error(error);
        return;
      }

      if (publicUrl) {
        const avatarWithCache = `${publicUrl}?v=${Date.now()}`;
        setAvatarUrl(avatarWithCache);
        const updatedUser = { ...initialUser, avatar: avatarWithCache };
        updateUser(updatedUser);
        await handleAction(
          updateAvatarAction(
            initialUser.id,
            initialUser.username,
            avatarWithCache,
          ),
          {
            actionName: "update_user_avatar",
          },
        );
      }
    } finally {
      setIsAvatarUploading(false);
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    const updatedUser: UserAuth = {
      ...initialUser,
      nickname: data.nickname,
      bio: data.bio || null,
      avatar: avatarUrl,
    };

    await handleAction(editUserAction(updatedUser), {
      actionName: "edit_user_profile",
      successMessage: "프로필이 수정되었습니다.",
    });

    updateUser(updatedUser);
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
            {initialUser && (
              <>
                <AvatarImage src={avatarUrl} alt={initialUser.nickname} />
                <AvatarFallback>
                  {initialUser.nickname ? initialUser.nickname.charAt(0) : ""}
                </AvatarFallback>
              </>
            )}
            {isAvatarHovered && (
              <div className="absolute w-30 h-30 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/40 rounded-full flex items-center justify-center">
                <ImageIcon className="h-6 w-6 text-white" />
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
                  "JPEG, PNG, WebP 형식의 이미지 파일만 업로드할 수 있습니다.",
                );
                event.target.value = "";
                return;
              }
              onFileChange(event);
            }}
          />

          <form onSubmit={handleSubmit(onSubmit)} className="w-full">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="nickname">닉네임</Label>
                <Input
                  id="nickname"
                  type="text"
                  placeholder="닉네임을 입력해주세요."
                  {...register("nickname")}
                />
                {errors.nickname && (
                  <p className="text-sm text-destructive">
                    {errors.nickname.message}
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="bio">소개글</Label>
                <Input
                  id="bio"
                  type="text"
                  placeholder="나를 소개하는 한 줄을 입력해주세요."
                  {...register("bio")}
                />
                {errors.bio && (
                  <p className="text-sm text-destructive">
                    {errors.bio.message}
                  </p>
                )}
              </div>
              <div className="flex justify-end">
                <Button disabled={isSubmitting || isAvatarUploading}>
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
