"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/shared/ui/dialog";
import { Textarea } from "@/shared/ui/textarea";
import { useAuth } from "@/providers/auth-provider";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Button } from "@/shared/ui/button";
import { Code2, Info, Loader, Plus, Send } from "lucide-react";
import { CodeEditor } from "@/shared/ui/code-editor";
import { TagList } from "@/shared/ui/tag-list";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { createPostAction, updatePostAction } from "@/actions/post.action";
import { Post } from "@/shared/types/types";
import { Checkbox } from "@/shared/ui/checkbox";
import { handleAction } from "@/shared/lib/utils/handle-action";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/ui/tooltip";

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
  const { user, loading } = useAuth();
  const [content, setContent] = useState(post?.content || "");
  const [snippetMode, setSnippetMode] = useState(!!post?.code);
  const [tags, setTags] = useState<string[]>(post?.tags || []);
  const [tagInput, setTagInput] = useState("");
  const [codeInput, setCodeInput] = useState(post?.code || "");
  const [languageInput, setLanguageInput] = useState(post?.language || "text");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReviewEnabled, setIsReviewEnabled] = useState(
    post?.is_review_enabled || false
  );

  const toggleSnippetMode = () => {
    setSnippetMode(snippetMode ? false : true);
  };

  const addTag = (
    e:
      | React.KeyboardEvent<HTMLInputElement>
      | React.MouseEvent<HTMLButtonElement>
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

  const handleSubmit = async () => {
    if (!user || isSubmitting) return;

    setIsSubmitting(true);

    const commonData = {
      content,
      code: snippetMode ? codeInput : null,
      language: snippetMode ? languageInput : null,
      tags,
      is_review_enabled: isReviewEnabled,
    };

    const action = post
      ? updatePostAction(post.id, commonData)
      : createPostAction({
          author: user,
          ...commonData,
        });

    await handleAction(action, {
      onSuccess: () => {
        handleClose();
        setContent("");
        setTags([]);
      },
      successMessage: post
        ? "게시글이 성공적으로 수정되었습니다."
        : "게시글이 성공적으로 작성되었습니다.",
    });

    setIsSubmitting(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogTitle>{post ? "게시글 수정" : "새 게시글 작성"}</DialogTitle>
        <div className="flex gap-2">
          {user && (
            <Avatar className="w-10 h-10 border border-border">
              <AvatarImage src={user.avatar || ""} alt={user.nickname} />
              <AvatarFallback>
                {user.nickname ? user.nickname.charAt(0) : ""}
              </AvatarFallback>
            </Avatar>
          )}
          <div className="flex flex-col gap-2 w-full">
            <Textarea
              className="resize-none"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <Button variant="outline" onClick={toggleSnippetMode}>
              <Code2 className="w-4 h-4" />{" "}
              {snippetMode ? "코드 스니펫 닫기" : "코드 스니펫 추가하기"}
            </Button>
            {snippetMode && (
              <>
                <CodeEditor
                  code={codeInput}
                  language={languageInput}
                  setCode={setCodeInput}
                  setLanguage={setLanguageInput}
                />
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="is_review_enabled"
                    checked={isReviewEnabled}
                    onCheckedChange={(checked) =>
                      setIsReviewEnabled(checked === true)
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
                <Button variant="outline" onClick={addTag}>
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
                onClick={handleSubmit}
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
      </DialogContent>
    </Dialog>
  );
}
