"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";
import { Textarea } from "../ui/textarea";
import { useAuth } from "@/providers/auth-provider";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Code2, Plus } from "lucide-react";
import { CodeEditor } from "../ui/code-editor";
import { TagList } from "../ui/tag-list";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

interface PostDialogProps {
  isOpen: boolean;
  handleClose: () => void;
}

export default function PostDialog({ isOpen, handleClose }: PostDialogProps) {
  const [content, setContent] = useState("");
  const { user, loading } = useAuth();
  const [snippetMode, setSnippetMode] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

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
    console.log(tag);
    setTags((prev) => prev.filter((t) => t !== tag));
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogTitle>새 게시글 작성</DialogTitle>
        <div className="flex gap-2">
          {user && (
            <Avatar className="w-10 h-10 border border-border">
              <AvatarImage src={user.avatar} alt={user.nickname} />
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
            {snippetMode && <CodeEditor />}

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
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
