import { Provider } from "@supabase/supabase-js";

import {
  AuthSignUpPayload,
  AuthUser,
  Filter,
  FunctionArgs,
  FunctionName,
  InsertValues,
  MutationResult,
  OAuthSignInOptions,
  QueryMode,
  QueryOptions,
  QueryResult,
  TableName,
  UpdateValues,
} from "./types";

export interface DatabaseAdapter {
  query<T>(options: QueryOptions, mode?: QueryMode): Promise<QueryResult<T>>;
  insert<T, TTable extends TableName = TableName>(
    table: TTable,
    values: InsertValues,
    options?: {
      select?: string;
      mode?: Exclude<QueryMode, "many">;
    },
  ): Promise<QueryResult<T>>;
  update<TTable extends TableName = TableName>(
    table: TTable,
    values: UpdateValues,
    filters?: Filter[],
  ): Promise<MutationResult>;
  remove<TTable extends TableName>(
    table: TTable,
    filters?: Filter[],
  ): Promise<MutationResult>;
  rpc<T, TFunction extends FunctionName = FunctionName>(
    fn: TFunction,
    params?: FunctionArgs<TFunction>,
  ): Promise<QueryResult<T>>;
  getCurrentAuthUser(): Promise<QueryResult<AuthUser>>;
  signInWithPassword(credentials: {
    email: string;
    password: string;
  }): Promise<MutationResult>;
  signUp(payload: AuthSignUpPayload): Promise<MutationResult>;
  signInWithOAuth(
    provider: Provider,
    options?: OAuthSignInOptions,
  ): Promise<QueryResult<{ url: string | null }>>;
  signOut(): Promise<MutationResult>;
  exchangeCodeForSession(code: string): Promise<MutationResult>;
  updateCurrentAuthUserMetadata(
    metadata: Record<string, unknown>,
  ): Promise<MutationResult>;
}
