import { Database } from "@/shared/types/database.types";

export type TableName = keyof Database["public"]["Tables"];
export type FunctionName = keyof Database["public"]["Functions"];

export type FunctionArgs<TFunction extends FunctionName> =
  Database["public"]["Functions"][TFunction]["Args"];

export type FilterOperator =
  | "eq"
  | "neq"
  | "gt"
  | "gte"
  | "lt"
  | "lte"
  | "like"
  | "ilike"
  | "in"
  | "is";

export interface Filter {
  column: string;
  value: unknown;
  operator?: FilterOperator;
}

export interface NotFilter {
  column: string;
  operator: string;
  value: unknown;
}

export interface OrderByOption {
  column: string;
  ascending?: boolean;
  nullsFirst?: boolean;
}

export interface QueryOptions {
  table: TableName;
  select: string;
  filters?: Filter[];
  notFilters?: NotFilter[];
  or?: string;
  limit?: number;
  range?: {
    from: number;
    to: number;
  };
  orderBy?: OrderByOption;
  count?: "exact" | "planned" | "estimated";
  head?: boolean;
}

export type QueryMode = "many" | "single" | "maybeSingle";

export interface QueryResult<T> {
  data: T | null;
  count?: number | null;
  error: Error | null;
}

export interface MutationResult {
  error: Error | null;
}

export interface AuthUser {
  id: string;
}

export interface AuthSignUpPayload {
  email: string;
  password: string;
  options?: {
    data?: Record<string, unknown>;
  };
}

export interface OAuthSignInOptions {
  redirectTo?: string;
}

export type InsertValues = Record<string, unknown> | Record<string, unknown>[];
export type UpdateValues = Record<string, unknown>;
