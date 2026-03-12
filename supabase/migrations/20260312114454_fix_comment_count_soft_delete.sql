create or replace function public.handle_comment_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $function$
begin
  if TG_OP = 'INSERT' then
    if new.deleted_at is null then
      update public.posts
      set comment_count = comment_count + 1
      where id = new.post_id;
    end if;
  elsif TG_OP = 'UPDATE' then
    if old.deleted_at is null and new.deleted_at is not null then
      update public.posts
      set comment_count = greatest(comment_count - 1, 0)
      where id = old.post_id;
    elsif old.deleted_at is not null and new.deleted_at is null then
      update public.posts
      set comment_count = comment_count + 1
      where id = new.post_id;
    elsif old.post_id is distinct from new.post_id and new.deleted_at is null then
      update public.posts
      set comment_count = greatest(comment_count - 1, 0)
      where id = old.post_id;

      update public.posts
      set comment_count = comment_count + 1
      where id = new.post_id;
    end if;
  elsif TG_OP = 'DELETE' then
    if old.deleted_at is null then
      update public.posts
      set comment_count = greatest(comment_count - 1, 0)
      where id = old.post_id;
    end if;
  end if;

  return null;
end;
$function$;

drop trigger if exists on_comment_change on public.comments;

create trigger on_comment_change
after insert or update of deleted_at, post_id or delete
on public.comments
for each row
execute function public.handle_comment_count();

with active_comment_counts as (
  select
    p.id as post_id,
    coalesce(count(c.id), 0)::bigint as active_comment_count
  from public.posts p
  left join public.comments c
    on c.post_id = p.id
   and c.deleted_at is null
  group by p.id
)
update public.posts p
set comment_count = active_comment_count
from active_comment_counts
where p.id = active_comment_counts.post_id
  and p.comment_count is distinct from active_comment_count;
