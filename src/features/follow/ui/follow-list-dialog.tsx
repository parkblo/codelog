"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { Loader2 } from "lucide-react";

import { getFollowersAction, getFollowingAction } from "@/entities/follow";
import { UserAvatar } from "@/entities/user";
import { handleAction } from "@/shared/lib/utils/handle-action";
import { Author } from "@/shared/types/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";

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
    if (open) {
      const fetchUsers = async () => {
        setLoading(true);
        const action =
          type === "followers" ? getFollowersAction : getFollowingAction;

        await handleAction(action(userId), {
          onSuccess: (data) => {
            setUsers(data);
          },
          onError: () => {
            setUsers([]);
          },
        });

        setLoading(false);
      };

      fetchUsers();
    }
  }, [open, userId, type]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>
            {type === "followers" ? "팔로워" : "팔로잉"}
          </DialogTitle>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto">
          {loading && !users ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : users && users.length > 0 ? (
            <div className="flex flex-col gap-4 py-4">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between gap-3"
                >
                  <Link
                    href={`/profile/${user.username}`}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 overflow-hidden"
                  >
                    <UserAvatar user={user} />
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-medium truncate">
                        {user.nickname}
                      </span>
                      <span className="text-xs text-muted-foreground truncate">
                        @{user.username}
                      </span>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground text-sm">
              {type === "followers" ? "팔로워가" : "팔로잉이"} 없습니다.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
