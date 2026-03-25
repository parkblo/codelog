import { type Enums } from "@/shared/types";

export const LOGAN_BOT_USER_ID = "00000000-0000-0000-0000-000000000001";
export const LOGAN_BOT_USERNAME = "logan-bot";

export const AUTHORING_MODE_LABELS: Record<Enums<"authoring_mode">, string> = {
  ai_assisted: "AI Assisted",
  hand_written: "Hand-Written",
};

export function isLoganBotUser(userId?: string | null) {
  return userId === LOGAN_BOT_USER_ID;
}
