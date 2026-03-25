// @ts-nocheck
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

import { createClient } from "npm:@supabase/supabase-js@2";

import {
  buildLoganPrompt,
  LOGAN_SYSTEM_INSTRUCTION,
  normalizeLoganComment,
} from "./prompt.ts";

const LOGAN_BOT_USER_ID = "00000000-0000-0000-0000-000000000001";
const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash-lite";

type PostWebhookRecord = {
  id: number;
  description: string;
  content: string;
  code: string | null;
  deleted_at: string | null;
};

type PostWebhookPayload = {
  type: "INSERT" | "UPDATE" | "DELETE";
  table: string;
  schema: string;
  record: PostWebhookRecord | null;
  old_record: PostWebhookRecord | null;
};

function getRequiredEnv(name: string) {
  const value = Deno.env.get(name);

  if (!value) {
    throw new Error(`${name} 환경 변수가 필요합니다.`);
  }

  return value;
}

function createAdminClient() {
  return createClient(
    getRequiredEnv("SUPABASE_URL"),
    getRequiredEnv("SUPABASE_SERVICE_ROLE_KEY"),
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}

function isPostInsertPayload(
  payload: PostWebhookPayload,
): payload is PostWebhookPayload & { record: PostWebhookRecord } {
  return (
    payload.type === "INSERT" &&
    payload.schema === "public" &&
    payload.table === "posts" &&
    payload.record !== null &&
    payload.record.deleted_at === null
  );
}

async function hasExistingLoganComment(postId: number) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("comments")
    .select("id")
    .eq("post_id", postId)
    .eq("user_id", LOGAN_BOT_USER_ID)
    .is("deleted_at", null)
    .is("start_line", null)
    .is("end_line", null)
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return Boolean(data);
}

async function insertLoganComment(postId: number, content: string) {
  const supabase = createAdminClient();
  const { error } = await supabase.from("comments").insert({
    content,
    post_id: postId,
    user_id: LOGAN_BOT_USER_ID,
    start_line: null,
    end_line: null,
  });

  if (error) {
    const duplicateErrorCodes = new Set(["23505"]);

    if (duplicateErrorCodes.has(error.code ?? "")) {
      return { inserted: false };
    }

    throw error;
  }

  return { inserted: true };
}

async function generateLoganComment(post: PostWebhookRecord) {
  const apiKey = getRequiredEnv("GEMINI_API_KEY");
  const model = Deno.env.get("GEMINI_MODEL") || DEFAULT_GEMINI_MODEL;
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: buildLoganPrompt({
                  description: post.description,
                  content: post.content,
                  code: post.code,
                }),
              },
            ],
            role: "user",
          },
        ],
        system_instruction: {
          parts: [
            {
              text: LOGAN_SYSTEM_INSTRUCTION,
            },
          ],
        },
      }),
    },
  );

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Gemini API 호출 실패: ${response.status} ${errorBody}`);
  }

  const result = await response.json();
  const rawText = result?.candidates?.[0]?.content?.parts
    ?.map((part: { text?: string }) => part.text ?? "")
    .join("")
    .trim();

  if (!rawText) {
    throw new Error("Gemini 응답에서 댓글 텍스트를 찾지 못했습니다.");
  }

  const comment = normalizeLoganComment(rawText);

  if (!comment) {
    throw new Error("Gemini 응답이 비어 있습니다.");
  }

  return comment;
}

Deno.serve(async (request) => {
  try {
    const payload = (await request.json()) as PostWebhookPayload;

    if (!isPostInsertPayload(payload)) {
      return Response.json(
        {
          message: "지원하지 않는 이벤트입니다.",
        },
        { status: 200 },
      );
    }

    if (await hasExistingLoganComment(payload.record.id)) {
      return Response.json(
        {
          inserted: false,
          message: "이미 Logan 댓글이 존재합니다.",
        },
        { status: 200 },
      );
    }

    const generatedComment = await generateLoganComment(payload.record);
    const result = await insertLoganComment(payload.record.id, generatedComment);

    return Response.json(
      {
        inserted: result.inserted,
        postId: payload.record.id,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("logan-comment failed", error);

    return Response.json(
      {
        error: error instanceof Error ? error.message : "알 수 없는 오류",
      },
      { status: 500 },
    );
  }
});
