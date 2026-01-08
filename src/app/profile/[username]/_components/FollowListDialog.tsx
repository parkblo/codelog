"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  getFollowersAction,
  getFollowingAction,
} from "@/actions/follow.action";
import { Author } from "@/types/types";
import { Loader2 } from "lucide-react";

interface FollowListDialogProps {
  userId: string;
  type: "followers" | "following";
  trigger: React.ReactNode;
}

export default function FollowListDialog({
  userId,
  type,
  trigger,
}: FollowListDialogProps) {
  const [users, setUsers] = useState<Author[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open && !users) {
      const fetchUsers = async () => {
        setLoading(true);
        const action =
          type === "followers" ? getFollowersAction : getFollowingAction;
        const { data, error } = await action(userId);
        if (!error) {
          setUsers(data);
        }
        setLoading(false);
      };
      fetchUsers();
    }
  }, [open, userId, type, users]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {type === "followers" ? "팔로워" : "팔로잉"}
          </DialogTitle>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto pr-2">
          {loading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : users && users.length > 0 ? (
            <div className="flex flex-col gap-1 py-4">
              {users.map((user) => (
                <Link
                  key={user.id}
                  href={`/profile/${user.username}`}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 p-2 hover:bg-accent rounded-md transition-colors"
                >
                  <Avatar className="w-10 h-10 border border-border">
                    <AvatarImage src={user.avatar || ""} alt={user.nickname} />
                    <AvatarFallback>
                      {user.nickname?.charAt(0) || user.username.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-medium truncate">
                      {user.nickname}
                    </span>
                    <span className="text-xs text-muted-foreground truncate">
                      @{user.username}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center p-12 text-muted-foreground text-sm">
              {type === "followers"
                ? "팔로워가 없습니다."
                : "팔로우 중인 사용자가 없습니다."}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
