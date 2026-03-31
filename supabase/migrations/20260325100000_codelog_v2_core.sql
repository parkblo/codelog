alter table public.posts
  add column if not exists description text;

alter table public.posts
  add column if not exists authoring_mode text not null default 'hand_written';

update public.posts
set description = left(
  coalesce(
    nullif(btrim(regexp_replace(content, '\s+', ' ', 'g')), ''),
    case
      when code is not null and btrim(code) <> '' then '코드 스니펫을 기록했습니다.'
      else '오늘 배운 내용을 기록했습니다.'
    end
  ),
  200
)
where description is null
   or btrim(description) = '';

alter table public.posts
  alter column description set not null;

alter table public.posts
  alter column description drop default;

alter table public.posts
  drop constraint if exists posts_authoring_mode_check;

alter table public.posts
  add constraint posts_authoring_mode_check
  check (authoring_mode in ('hand_written', 'ai_assisted'));

alter table public.posts
  drop constraint if exists posts_description_length_check;

alter table public.posts
  add constraint posts_description_length_check
  check (char_length(btrim(description)) between 1 and 200);

create or replace function public.upsert_post_tags(p_post_id bigint, p_tags text[])
returns void
language plpgsql
as $$
declare
  raw_tag_name text;
  normalized_tag_name text;
  resolved_tag_id bigint;
begin
  if p_tags is null or array_length(p_tags, 1) is null then
    return;
  end if;

  foreach raw_tag_name in array p_tags loop
    normalized_tag_name := btrim(raw_tag_name);
    resolved_tag_id := null;

    if normalized_tag_name = '' then
      continue;
    end if;

    select id
      into resolved_tag_id
      from public.tags
     where name = normalized_tag_name
     limit 1;

    if resolved_tag_id is null then
      insert into public.tags (name)
      values (normalized_tag_name)
      returning id into resolved_tag_id;
    end if;

    if not exists (
      select 1
        from public.posttags
       where post_id = p_post_id
         and tag_id = resolved_tag_id
    ) then
      insert into public.posttags (post_id, tag_id)
      values (p_post_id, resolved_tag_id);
    end if;
  end loop;
end;
$$;

drop function if exists public.create_post_with_tags(json, text[]);
drop function if exists public.create_post_with_tags(jsonb, text[]);

create function public.create_post_with_tags(post_data json, tags text[])
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  created_post public.posts;
  post_payload jsonb := post_data::jsonb;
begin
  insert into public.posts (
    user_id,
    content,
    description,
    code,
    language,
    authoring_mode
  )
  values (
    (post_payload ->> 'user_id')::uuid,
    post_payload ->> 'content',
    post_payload ->> 'description',
    case
      when post_payload ? 'code' then nullif(post_payload ->> 'code', '')
      else null
    end,
    case
      when post_payload ? 'language' then nullif(post_payload ->> 'language', '')
      else null
    end,
    coalesce(nullif(post_payload ->> 'authoring_mode', ''), 'hand_written')
  )
  returning * into created_post;

  perform public.upsert_post_tags(created_post.id, tags);

  return to_json(created_post);
end;
$$;

drop function if exists public.update_post_with_tags(bigint, json, text[]);
drop function if exists public.update_post_with_tags(bigint, jsonb, text[]);

create function public.update_post_with_tags(
  p_post_id bigint,
  post_data json,
  tags text[]
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_post public.posts;
  post_payload jsonb := post_data::jsonb;
begin
  update public.posts
     set content = coalesce(post_payload ->> 'content', content),
         description = coalesce(post_payload ->> 'description', description),
         code = case
           when post_payload ? 'code' then nullif(post_payload ->> 'code', '')
           else code
         end,
         language = case
           when post_payload ? 'language' then nullif(post_payload ->> 'language', '')
           else language
         end,
         authoring_mode = case
           when post_payload ? 'authoring_mode'
             then coalesce(nullif(post_payload ->> 'authoring_mode', ''), 'hand_written')
           else authoring_mode
         end,
         updated_at = now()
   where id = p_post_id
     and deleted_at is null
  returning * into updated_post;

  if updated_post is null then
    raise exception 'Post % not found or deleted', p_post_id;
  end if;

  delete from public.posttags where post_id = p_post_id;
  perform public.upsert_post_tags(p_post_id, tags);

  return to_json(updated_post);
end;
$$;

alter table public.posts
  drop column if exists is_review_enabled;
