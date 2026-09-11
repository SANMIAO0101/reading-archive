-- Run this on an existing v2.x Supabase database before deploying v3.0.
alter table writings add column if not exists ai_analysis jsonb;
alter table document_reports add column if not exists scope_key text not null default '__all__';
alter table invitations drop constraint if exists invitations_status_check;
alter table invitations add constraint invitations_status_check check(status in ('unused','used','revoked','expired','unused_claimed'));
create unique index if not exists document_reports_v3_unique on document_reports(document_id,level,scope_key,version);
create or replace function is_admin(uid uuid) returns boolean language sql security definer set search_path=public stable as $$select exists(select 1 from profiles where id=uid and role='admin')$$;
create or replace function protect_profile_role() returns trigger language plpgsql security definer set search_path=public as $$begin if old.role is distinct from new.role and not is_admin(auth.uid()) then raise exception 'role cannot be changed by member';end if;return new;end$$;
drop trigger if exists trg_profile_role_guard on profiles;create trigger trg_profile_role_guard before update on profiles for each row execute function protect_profile_role();
create or replace function claim_invitation(p_code text,p_email text) returns jsonb language plpgsql security definer set search_path=public as $$declare inv invitations%rowtype;begin select * into inv from invitations where code=upper(trim(p_code)) and status='unused' for update;if not found then return jsonb_build_object('error','邀请码无效、已使用或已撤销');end if;if inv.expires_at is not null and inv.expires_at<now() then update invitations set status='expired' where id=inv.id;return jsonb_build_object('error','邀请码已过期');end if;if inv.invited_email is not null and lower(inv.invited_email)<>lower(trim(p_email)) then return jsonb_build_object('error','该邀请码绑定了其他邮箱');end if;update invitations set status='unused_claimed' where id=inv.id;return jsonb_build_object('id',inv.id);end$$;
-- Rebuild document report policies so chapter/volume rows remain user-scoped.
drop policy if exists document_reports_own on document_reports;create policy document_reports_own on document_reports for all using(auth.uid()=user_id) with check(auth.uid()=user_id);
