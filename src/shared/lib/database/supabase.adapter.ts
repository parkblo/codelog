import { Provider } from "@supabase/supabase-js";

import { createClient } from "@/shared/lib/supabase/server";

import { DatabaseAdapter } from "./adapter.interface";
import {
  AuthSignUpPayload,
  AuthUser,
  Filter,
  FunctionArgs,
  FunctionName,
  InsertValues,
  MutationResult,
  OAuthProvider,
  OAuthSignInOptions,
  QueryMode,
  QueryOptions,
  QueryResult,
  TableName,
  UpdateValues,
} from "./types";

type QueryResponse = { data: unknown; error: unknown };

interface QueryBuilder extends PromiseLike<QueryResponse> {
  eq: (column: string, value: unknown) => QueryBuilder;
  neq: (column: string, value: unknown) => QueryBuilder;
  gt: (column: string, value: unknown) => QueryBuilder;
  gte: (column: string, value: unknown) => QueryBuilder;
  lt: (column: string, value: unknown) => QueryBuilder;
  lte: (column: string, value: unknown) => QueryBuilder;
  like: (column: string, value: unknown) => QueryBuilder;
  ilike: (column: string, value: unknown) => QueryBuilder;
  in: (column: string, values: unknown[]) => QueryBuilder;
  is: (column: string, value: unknown) => QueryBuilder;
  order: (
    column: string,
    options?: { ascending?: boolean; nullsFirst?: boolean },
  ) => QueryBuilder;
  limit: (count: number) => QueryBuilder;
  range: (from: number, to: number) => QueryBuilder;
  or: (filters: string) => QueryBuilder;
  not: (column: string, operator: string, value: unknown) => QueryBuilder;
  single: () => QueryBuilder;
  maybeSingle: () => QueryBuilder;
  select: (
    columns: string,
    options?: { count?: "exact" | "planned" | "estimated"; head?: boolean },
  ) => QueryBuilder;
}

function toError(error: unknown): Error | null {
  if (!error) {
    return null;
  }

  if (error instanceof Error) {
    return error;
  }

  if (typeof error === "object" && error !== null && "message" in error) {
    return new Error(String(error.message));
  }

  return new Error("알 수 없는 데이터베이스 오류가 발생했습니다.");
}

function applyFilters(query: QueryBuilder, filters: Filter[] = []) {
  return filters.reduce((currentQuery, filter) => {
    const operator = filter.operator ?? "eq";

    switch (operator) {
      case "eq":
        return currentQuery.eq(filter.column, filter.value);
      case "neq":
        return currentQuery.neq(filter.column, filter.value);
      case "gt":
        return currentQuery.gt(filter.column, filter.value);
      case "gte":
        return currentQuery.gte(filter.column, filter.value);
      case "lt":
        return currentQuery.lt(filter.column, filter.value);
      case "lte":
        return currentQuery.lte(filter.column, filter.value);
      case "like":
        return currentQuery.like(filter.column, filter.value);
      case "ilike":
        return currentQuery.ilike(filter.column, filter.value);
      case "in":
        if (!Array.isArray(filter.value)) {
          throw new Error(
            `IN 필터(${filter.column})에는 배열 값이 필요합니다.`,
          );
        }
        return currentQuery.in(filter.column, filter.value);
      case "is":
        return currentQuery.is(filter.column, filter.value);
      default:
        return currentQuery.eq(filter.column, filter.value);
    }
  }, query);
}

class SupabaseAdapter implements DatabaseAdapter {
  async query<T>(
    options: QueryOptions,
    mode: QueryMode = "many",
  ): Promise<QueryResult<T>> {
    try {
      const supabase = await createClient();
      let query = supabase
        .from(options.table)
        .select(options.select, {
          count: options.count,
          head: options.head,
        }) as unknown as QueryBuilder;

      query = applyFilters(query, options.filters);

      if (options.notFilters && options.notFilters.length > 0) {
        query = options.notFilters.reduce(
          (currentQuery, filter) =>
            currentQuery.not(filter.column, filter.operator, filter.value),
          query,
        );
      }

      if (options.or) {
        query = query.or(options.or);
      }

      if (options.orderBy) {
        query = query.order(options.orderBy.column, {
          ascending: options.orderBy.ascending,
          nullsFirst: options.orderBy.nullsFirst,
        });
      }

      if (typeof options.limit === "number") {
        query = query.limit(options.limit);
      }

      if (options.range) {
        query = query.range(options.range.from, options.range.to);
      }

      if (mode === "single") {
        query = query.single();
      } else if (mode === "maybeSingle") {
        query = query.maybeSingle();
      }

      const { data, error, count } = (await query) as QueryResponse & {
        count?: number | null;
      };

      return {
        data: (data ?? null) as T | null,
        count: count ?? null,
        error: toError(error),
      };
    } catch (error) {
      return {
        data: null,
        count: null,
        error: toError(error),
      };
    }
  }

  async insert<T, TTable extends TableName>(
    table: TTable,
    values: InsertValues,
    options?: {
      select?: string;
      mode?: Exclude<QueryMode, "many">;
    },
  ): Promise<QueryResult<T>> {
    try {
      const supabase = await createClient();
      let query = supabase.from(table).insert(values as never) as unknown as QueryBuilder;

      if (options?.select) {
        query = query.select(options.select);

        if (options.mode === "single") {
          query = query.single();
        } else if (options.mode === "maybeSingle") {
          query = query.maybeSingle();
        }
      }

      const { data, error } = await query;

      return {
        data: (data ?? null) as T | null,
        count: null,
        error: toError(error),
      };
    } catch (error) {
      return {
        data: null,
        count: null,
        error: toError(error),
      };
    }
  }

  async update<TTable extends TableName>(
    table: TTable,
    values: UpdateValues,
    filters: Filter[] = [],
  ): Promise<MutationResult> {
    try {
      const supabase = await createClient();
      let query = supabase.from(table).update(values as never) as unknown as QueryBuilder;
      query = applyFilters(query, filters);

      const { error } = await query;

      return { error: toError(error) };
    } catch (error) {
      return { error: toError(error) };
    }
  }

  async remove<TTable extends TableName>(
    table: TTable,
    filters: Filter[] = [],
  ): Promise<MutationResult> {
    try {
      const supabase = await createClient();
      let query = supabase.from(table).delete() as unknown as QueryBuilder;
      query = applyFilters(query, filters);

      const { error } = await query;

      return { error: toError(error) };
    } catch (error) {
      return { error: toError(error) };
    }
  }

  async rpc<T, TFunction extends FunctionName = FunctionName>(
    fn: TFunction,
    params?: FunctionArgs<TFunction>,
  ): Promise<QueryResult<T>> {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase.rpc(fn, params);

      return {
        data: (data ?? null) as T | null,
        count: null,
        error: toError(error),
      };
    } catch (error) {
      return {
        data: null,
        count: null,
        error: toError(error),
      };
    }
  }

  async updateCurrentAuthUserMetadata(
    metadata: Record<string, unknown>,
  ): Promise<MutationResult> {
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.updateUser({
        data: metadata,
      });

      return { error: toError(error) };
    } catch (error) {
      return { error: toError(error) };
    }
  }

  async getCurrentAuthUser(): Promise<QueryResult<AuthUser>> {
    try {
      const supabase = await createClient();
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (!user) {
        return {
          data: null,
          count: null,
          error: toError(error),
        };
      }

      return {
        data: { id: user.id },
        count: null,
        error: toError(error),
      };
    } catch (error) {
      return {
        data: null,
        count: null,
        error: toError(error),
      };
    }
  }

  async signInWithPassword(credentials: {
    email: string;
    password: string;
  }): Promise<MutationResult> {
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.signInWithPassword(credentials);

      return { error: toError(error) };
    } catch (error) {
      return { error: toError(error) };
    }
  }

  async signUp(payload: AuthSignUpPayload): Promise<MutationResult> {
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.signUp(payload);

      return { error: toError(error) };
    } catch (error) {
      return { error: toError(error) };
    }
  }

  async signInWithOAuth(
    provider: OAuthProvider,
    options?: OAuthSignInOptions,
  ): Promise<QueryResult<{ url: string | null }>> {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: provider as Provider,
        options,
      });

      return {
        data: {
          url: data.url ?? null,
        },
        count: null,
        error: toError(error),
      };
    } catch (error) {
      return {
        data: null,
        count: null,
        error: toError(error),
      };
    }
  }

  async signOut(): Promise<MutationResult> {
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.signOut();

      return { error: toError(error) };
    } catch (error) {
      return { error: toError(error) };
    }
  }

  async exchangeCodeForSession(code: string): Promise<MutationResult> {
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);

      return { error: toError(error) };
    } catch (error) {
      return { error: toError(error) };
    }
  }
}

let adapterInstance: DatabaseAdapter | null = null;

export function getDatabaseAdapter() {
  if (!adapterInstance) {
    adapterInstance = new SupabaseAdapter();
  }

  return adapterInstance;
}

export function setDatabaseAdapter(adapter: DatabaseAdapter) {
  adapterInstance = adapter;
}
