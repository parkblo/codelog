"use client";

import { useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import dynamic from "next/dynamic";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Code2, Loader, Plus, Send } from "lucide-react";

import { createPostAction, updatePostAction } from "@/entities/post";
import { useAuth, UserAvatar } from "@/entities/user";
import { getCurrentLocalDayContext } from "@/shared/lib/date";
import { handleAction } from "@/shared/lib/handle-action";
import {
  captureEvent,
  getTodayExperimentProperties,
} from "@/shared/lib/posthog";
import { POST_LIST_QUERY_KEY } from "@/shared/lib/query/post-list-query";
import { Post } from "@/shared/types/types";
import { Button } from "@/shared/ui/button";
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

import { type PostFormData, postSchema } from "../model";

interface PostDialogProps {
  isOpen: boolean;
  handleClose: () => void;
  post?: Post;
  openedAtMs?: number | null;
  source?: string;
}

function getElapsedTimeMs(startedAt: number | null) {
  if (startedAt === null) {
    return null;
  }

  return Math.round(performance.now() - startedAt);
}

export default function PostDialog({
  isOpen,
  handleClose,
  openedAtMs = null,
  post,
  source = "create_post_widget",
}: PostDialogProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const localDayContext = useMemo(() => getCurrentLocalDayContext(), []);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors },
  } = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      description: post?.description || "",
      content: post?.content || "",
      code: post?.code || null,
      language: post?.language || "text",
    },
  });

  const [snippetMode, setSnippetMode] = useState(Boolean(post?.code));
  const [tags, setTags] = useState<string[]>(post?.tags || []);
  const [tagInput, setTagInput] = useState("");

  const descriptionValue = useWatch({ control, name: "description" });
  const contentValue = useWatch({ control, name: "content" });
  const codeValue = useWatch({ control, name: "code" });
  const languageValue = useWatch({ control, name: "language" });

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

  const savePostMutation = useMutation({
    mutationFn: async (commonData: {
      description: string;
      content: string;
      code: string | null;
      language: string | null;
      tags: string[];
      authoring_mode: Post["authoring_mode"];
    }) => {
      const action = post
        ? updatePostAction(post.id, commonData)
        : createPostAction({
            author: user!,
            ...commonData,
            localDayContext,
          });

      return handleAction(action, {
        actionName: post ? "update_post" : "create_post",
        successMessage: post
          ? "게시글이 성공적으로 수정되었습니다."
          : "게시글이 성공적으로 작성되었습니다.",
      });
    },
    onSuccess: async (result, commonData) => {
      if (result === null) {
        return;
      }

      captureEvent(post ? "post_updated" : "post_created", {
        authoring_mode: commonData.authoring_mode,
        content_length: commonData.content.length,
        description_length: commonData.description.length,
        has_code: Boolean(commonData.code),
        tag_count: commonData.tags.length,
        time_to_submit_ms: getElapsedTimeMs(openedAtMs),
        source,
        ...getTodayExperimentProperties(),
      });

      handleClose();
      reset();
      setTags([]);

      await queryClient.invalidateQueries({ queryKey: POST_LIST_QUERY_KEY });
    },
  });

  const onSubmit = async (data: PostFormData) => {
    if (!user) return;

    setHasSubmitted(true);
    const timeToSubmitMs = getElapsedTimeMs(openedAtMs);

    const commonData = {
      description: data.description,
      content: data.content,
      code: snippetMode ? data.code : null,
      language: snippetMode ? data.language : null,
      authoring_mode: post?.authoring_mode ?? "hand_written",
      tags,
    };

    captureEvent(post ? "post_update_submitted" : "post_create_submitted", {
      authoring_mode: commonData.authoring_mode,
      content_length: commonData.content.length,
      description_length: commonData.description.length,
      has_code: Boolean(commonData.code),
      tag_count: tags.length,
      time_to_submit_ms: timeToSubmitMs,
      source,
      ...getTodayExperimentProperties(),
    });

    await savePostMutation.mutateAsync(commonData);
  };

  const handleDialogChange = (nextOpen: boolean) => {
    if (!nextOpen && !hasSubmitted) {
      captureEvent("post_dialog_closed", {
        had_input: Boolean(
          descriptionValue?.trim() ||
            contentValue?.trim() ||
            codeValue?.trim() ||
            tagInput.trim() ||
            tags.length > 0,
        ),
        source,
        ...getTodayExperimentProperties(),
      });
    }

    if (!nextOpen) {
      handleClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogChange}>
      <DialogContent>
        <DialogTitle>{post ? "게시글 수정" : "새 게시글 작성"}</DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex gap-2">
            {user && <UserAvatar user={user} />}
            <div className="flex flex-col gap-2 w-full">
              <div className="flex flex-col gap-2">
                <Label htmlFor="description">짧은 설명</Label>
                <Textarea
                  id="description"
                  className="resize-none min-h-20"
                  placeholder="피드에서 먼저 보일 한 줄 요약을 적어주세요."
                  {...register("description")}
                />
                {errors.description && (
                  <p className="text-sm text-destructive">
                    {errors.description.message}
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="content">본문</Label>
                <Textarea
                  id="content"
                  className="resize-none"
                  placeholder="오늘 배운 내용이나 맥락을 자세히 남겨보세요."
                  {...register("content")}
                />
              </div>
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
                  <div className="rounded-md border border-dashed px-3 py-2 text-sm text-muted-foreground">
                    코드 스니펫이 있으면 누구나 라인별 인라인 코멘트를 남길 수 있습니다.
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
                  disabled={savePostMutation.isPending}
                >
                  {savePostMutation.isPending ? (
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
