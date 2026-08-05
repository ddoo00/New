// ─────────────────────────────────────────────────────────
// Supabase 연결 정보. Supabase 대시보드 > Project Settings > API 에서
// Project URL, anon public key를 복사해서 아래 두 줄만 바꿔주세요.
// anon key는 "공개되어도 되는 키"입니다(Supabase가 그렇게 설계함).
// 실제 보안은 Supabase의 Row Level Security(RLS) 정책으로 걸려있어요.
// 아직 설정 전이면 그대로 둬도 챗봇은 정상 작동하고,
// 대화 로그 저장 / 인기 질문 기능만 비활성화됩니다.
// ─────────────────────────────────────────────────────────
window.SUPABASE_URL = "https://YOUR-PROJECT.supabase.co";
window.SUPABASE_ANON_KEY = "YOUR-ANON-KEY";

// admin.html(지식 관리 페이지) 접근용 간단한 비밀번호.
// ⚠️ 진짜 로그인 인증이 아니라 브라우저에서 문자열만 비교하는 수준의 가벼운 잠금이에요.
// 실수로 아무나 못 들어오게 막는 용도이니, admin.html 링크는 팀장님/선임 정도만 알고 있게 해주세요.
window.ADMIN_PASSWORD = "changeme";

window.KNOWLEDGE_CATEGORIES = ["작업 요청 · 컨펌", "파일 · 에셋 관리", "툴 사용법", "일정 · 보고", "기타"];

// Supabase가 설정됐는지 확인하는 헬퍼
function isSupabaseConfigured() {
  return (
    window.SUPABASE_URL &&
    window.SUPABASE_ANON_KEY &&
    !window.SUPABASE_URL.includes("YOUR-PROJECT") &&
    !window.SUPABASE_ANON_KEY.includes("YOUR-ANON-KEY")
  );
}

// Supabase 클라이언트 생성 (설정 안 됐으면 null 반환)
function getSupabaseClient() {
  if (!isSupabaseConfigured()) return null;
  if (typeof window.supabase === "undefined") return null;
  if (!window._supabaseClient) {
    window._supabaseClient = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
  }
  return window._supabaseClient;
}

// 이번 대화(질문+답변)를 Supabase에 기록한다. 실패해도 화면에는 영향 없음.
async function logChatToSupabase(question, answer) {
  const client = getSupabaseClient();
  if (!client) return;
  try {
    await client.from("chat_logs").insert({ question, answer });
  } catch (e) {
    console.warn("chat_logs insert 실패:", e);
  }
}

// 최근 대화 로그를 가져와서 브라우저에서 직접 빈도 집계 후 상위 N개 질문을 반환한다.
// Supabase가 설정 안 됐거나 데이터가 없으면 fallbackList를 그대로 반환한다.
async function loadPopularQuestions(fallbackList, limit) {
  limit = limit || 6;
  const client = getSupabaseClient();
  if (!client) return fallbackList;
  try {
    const { data, error } = await client
      .from("chat_logs")
      .select("question")
      .order("created_at", { ascending: false })
      .limit(300);
    if (error || !data || data.length === 0) return fallbackList;

    const counts = {};
    data.forEach(row => {
      const q = (row.question || "").trim();
      if (!q) return;
      counts[q] = (counts[q] || 0) + 1;
    });
    const ranked = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);
    if (ranked.length === 0) return fallbackList;
    return ranked.slice(0, limit);
  } catch (e) {
    console.warn("popular questions 조회 실패:", e);
    return fallbackList;
  }
}

// ── 지식 관리(admin.html) 관련 헬퍼 ──────────────────────────

// 관리자 페이지에서 추가/수정한 지식 항목을 모두 가져온다.
async function fetchKnowledgeEntries() {
  const client = getSupabaseClient();
  if (!client) return [];
  try {
    const { data, error } = await client
      .from("knowledge_entries")
      .select("*")
      .order("category", { ascending: true })
      .order("created_at", { ascending: true });
    if (error || !data) return [];
    return data;
  } catch (e) {
    console.warn("knowledge_entries 조회 실패:", e);
    return [];
  }
}

// 지식 항목 배열을 챗봇 시스템 프롬프트에 붙일 수 있는 텍스트로 변환한다.
function formatKnowledgeForPrompt(entries) {
  if (!entries || entries.length === 0) return "";
  const byCategory = {};
  entries.forEach(e => {
    const cat = e.category || "기타";
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push(e);
  });
  let text = "\n\n=== 관리자 페이지에서 추가로 등록한 지식 ===\n";
  Object.keys(byCategory).forEach(cat => {
    text += `\n[${cat}]\n`;
    byCategory[cat].forEach(e => {
      const tag = e.status === "pending" ? " (미확인 — 확답하지 말고 확인이 필요하다고 안내)" : "";
      text += `- ${e.title}${tag}: ${e.content}\n`;
    });
  });
  return text;
}

async function createKnowledgeEntry(entry) {
  const client = getSupabaseClient();
  if (!client) throw new Error("Supabase가 설정되지 않았어요.");
  const { error } = await client.from("knowledge_entries").insert(entry);
  if (error) throw error;
}

async function updateKnowledgeEntry(id, patch) {
  const client = getSupabaseClient();
  if (!client) throw new Error("Supabase가 설정되지 않았어요.");
  const { error } = await client
    .from("knowledge_entries")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

async function deleteKnowledgeEntry(id) {
  const client = getSupabaseClient();
  if (!client) throw new Error("Supabase가 설정되지 않았어요.");
  const { error } = await client.from("knowledge_entries").delete().eq("id", id);
  if (error) throw error;
}
