import { createClient } from "@/shared/lib/utils/supabase/client";

import { IUserServiceBrowser } from "./user.interface";

export class UserServiceBrowser implements IUserServiceBrowser {
  async uploadAvatar(userId: string, file: File) {
    const supabase = createClient();

    const { data: currentUser, error: currentUserError } =
      await supabase.auth.getUser();

    if (currentUserError) {
      return { data: null, error: "로그인이 필요합니다." };
    }

    if (currentUser.user.id !== userId) {
      return { data: null, error: "본인의 정보만 수정할 수 있습니다." };
    }

    const { data, error } = await supabase.storage
      .from("avatars")
      .upload(`${userId}/${userId}`, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (error) {
      return { data: null, error: error.message };
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("avatars").getPublicUrl(data.path);

    return { data: publicUrl, error: null };
  }
}
