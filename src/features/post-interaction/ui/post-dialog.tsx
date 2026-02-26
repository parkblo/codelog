"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import dynamic from "next/dynamic";

import { zodResolver } from "@hookform/resolvers/zod";
import { Code2, Info, Loader, Plus, Send } from "lucide-react";

import { createPostAction, updatePostAction } from "@/entities/post";
import { useAuth, UserAvatar } from "@/entities/user";
import { handleAction } from "@/shared/lib/handle-action";
import { captureEvent } from "@/shared/lib/posthog";
import { Post } from "@/shared/types/types";
import { Button } from "@/shared/ui/button";
import { Checkbox } from "@/shared/ui/checkbox";
import { Dialog, DialogContent, DialogTitle } from "@/shared/ui/dialog";
import { Skeleton } from "@/shared/ui/skeleton";

const CodeEditor = dynamic(
  () => import("@/shared/ui/code-editor").then((mod) => mod.CodeEditor),
  {
    ssr: false,
    loading: () => <Skeleton className="h-48 w-full rounded-md" />,
  },
);
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { TagList } from "@/shared/ui/tag-list";
import { Textarea } from "@/shared/ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/ui/tooltip";

import { type PostFormData, postSchema } from "../model/post.schema";

interface PostDialogProps {
  isOpen: boolean;
  handleClose: () => void;
  post?: Post;
}

export default function PostDialog({
  isOpen,
  handleClose,
  post,
}: PostDialogProps) {
  const { user } = useAuth();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      content: post?.content || "",
      code: post?.code || null,
      language: post?.language || "text",
      isReviewEnabled: post?.is_review_enabled || false,
    },
  });

  const [snippetMode, setSnippetMode] = useState(!!post?.code);
  const [tags, setTags] = useState<string[]>(post?.tags || []);
  const [tagInput, setTagInput] = useState("");

  const codeValue = useWatch({ control, name: "code" });
  const languageValue = useWatch({ control, name: "language" });
  const isReviewEnabledValue = useWatch({
    control,
    name: "isReviewEnabled",
  });

  const toggleSnippetMode = () => {
    captureEvent("post_snippet_mode_toggled", {
      enabled: !snippetMode,
      mode: post ? "edit" : "create",
    });
    setSnippetMode((prev) => !prev);
  };

  const addTag = (
    e:
      | React.KeyboardEvent<HTMLInputElement>
      | React.MouseEvent<HTMLButtonElement>,
  ) => {
    if ("key" in e) {
      if (e.nativeEvent.isComposing) return;

      if (e.key === "Enter") {
        e.preventDefault();
        addTagLogic();
      }
      return;
    }

    e.preventDefault();
    addTagLogic();
  };

  const addTagLogic = () => {
    if (tags.includes(tagInput.trim()) || !tagInput.trim()) {
      setTagInput("");
      return;
    }

    setTags((prev) => [...prev, tagInput.trim()]);
    setTagInput("");
  };

  const deleteTag = (tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  };

  const onSubmit = async (data: PostFormData) => {
    if (!user) return;

    const commonData = {
      content: data.content,
      code: snippetMode ? data.code : null,
      language: snippetMode ? data.language : null,
      tags,
      is_review_enabled: data.isReviewEnabled,
    };

    const action = post
      ? updatePostAction(post.id, commonData)
      : createPostAction({
          author: user,
          ...commonData,
        });

    captureEvent(post ? "post_update_submitted" : "post_create_submitted", {
      has_code: Boolean(commonData.code),
      tag_count: tags.length,
      review_enabled: commonData.is_review_enabled,
    });

    await handleAction(action, {
      actionName: post ? "update_post" : "create_post",
      onSuccess: () => {
        captureEvent(post ? "post_updated" : "post_created", {
          has_code: Boolean(commonData.code),
          tag_count: tags.length,
        });
        handleClose();
        reset();
        setTags([]);
      },
      successMessage: post
        ? "게시글이 성공적으로 수정되었습니다."
        : "게시글이 성공적으로 작성되었습니다.",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogTitle>{post ? "게시글 수정" : "새 게시글 작성"}</DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex gap-2">
            {user && <UserAvatar user={user} />}
            <div className="flex flex-col gap-2 w-full">
              <Textarea className="resize-none" {...register("content")} />
              {errors.content && (
                <p className="text-sm text-destructive">
                  {errors.content.message}
                </p>
              )}
              <Button
                type="button"
                variant="outline"
                onClick={toggleSnippetMode}
              >
                <Code2 className="w-4 h-4" />{" "}
                {snippetMode ? "코드 스니펫 닫기" : "코드 스니펫 추가하기"}
              </Button>
              {snippetMode && (
                <>
                  <CodeEditor
                    code={codeValue || ""}
                    language={languageValue || "text"}
                    setCode={(code) => setValue("code", code)}
                    setLanguage={(lang) => setValue("language", lang)}
                  />
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="is_review_enabled"
                      checked={isReviewEnabledValue ?? false}
                      onCheckedChange={(checked) =>
                        setValue("isReviewEnabled", checked === true)
                      }
                    />
                    <Label htmlFor="is_review_enabled">코드 리뷰 허용</Label>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-4 h-4" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          허용 시 코드 라인 별로 리뷰 코멘트를 받을 수 있습니다.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </>
              )}

              <div className="mt-2">
                <Label htmlFor="tag" className="mb-2">
                  태그
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="tag"
                    onKeyDown={addTag}
                    value={tagInput}
                    onChange={(e) => {
                      setTagInput(e.target.value);
                    }}
                  />
                  <Button type="button" variant="outline" onClick={addTag}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div>
                <TagList tags={tags} onDelete={deleteTag} />
              </div>
              <div className="flex justify-end">
                <Button
                  className="w-auto"
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <Loader className="w-4 h-4" />
                      게시 중...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Send className="w-4 h-4" />
                      게시
                    </span>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
