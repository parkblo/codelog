import "server-only";

export type { DatabaseAdapter } from "./adapter.interface";
export { getDatabaseAdapter, setDatabaseAdapter } from "./supabase.adapter";
export * from "./types";
