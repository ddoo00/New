-- 그래픽팀 온보딩 챗봇 — Supabase 스키마
-- Supabase 대시보드 > SQL Editor 에 이 내용을 그대로 붙여넣고 실행(Run)하세요.

-- 1) 대화 로그 테이블: 팀원이 물어본 질문/답변을 저장한다.
create table if not exists chat_logs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text,
  created_at timestamptz not null default now()
);

-- 2) RLS(Row Level Security) 켜기 — Supabase 테이블은 기본적으로 켜두는 걸 권장.
alter table chat_logs enable row level security;

-- 3) 익명(anon) 키로 기록(insert)과 조회(select)를 허용한다.
--    이 챗봇은 로그인 기능이 없는 사내용 도구라, anon 키에 insert/select를 열어둔다.
--    ⚠️ 참고: chat_logs에는 팀원이 입력한 질문 원문이 그대로 쌓인다.
--    민감한 클라이언트 정보를 질문에 직접 적지 않도록 팀에 안내하는 걸 권장한다.
create policy "anon can insert chat logs"
  on chat_logs for insert
  to anon
  with check (true);

create policy "anon can read chat logs"
  on chat_logs for select
  to anon
  using (true);

-- 4) 지식 관리 테이블: admin.html 에서 코드 수정 없이 추가/수정/삭제하는 지식이 여기 쌓인다.
create table if not exists knowledge_entries (
  id uuid primary key default gen_random_uuid(),
  category text not null default '기타',
  title text not null,
  content text not null,
  status text not null default 'confirmed', -- 'confirmed'(확정) | 'pending'(미확인)
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table knowledge_entries enable row level security;

-- ⚠️ admin.html은 URL을 아는 사람 + 간단한 비밀번호로만 보호돼요(진짜 로그인 인증 아님).
-- anon 키에 CRUD를 다 열어두는 이유도 그래서입니다. 링크를 함부로 퍼뜨리지 마세요.
create policy "anon can read knowledge"
  on knowledge_entries for select
  to anon
  using (true);

create policy "anon can insert knowledge"
  on knowledge_entries for insert
  to anon
  with check (true);

create policy "anon can update knowledge"
  on knowledge_entries for update
  to anon
  using (true)
  with check (true);

create policy "anon can delete knowledge"
  on knowledge_entries for delete
  to anon
  using (true);
