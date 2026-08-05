// Netlify Function: /api/chat 로 들어오는 요청을 받아 Google Gemini API(무료 티어)를 호출한다.
// 지식베이스와 답변 규칙은 아래 KNOWLEDGE_BASE 상수에 들어있다.
// 내용을 업데이트하려면 이 파일의 KNOWLEDGE_BASE 텍스트만 고치면 된다.
// 무료 API 키 발급: https://aistudio.google.com/apikey (신용카드 등록 없이 바로 발급 가능)

const KNOWLEDGE_BASE = `
[문서 상태 안내]
아래 지식 중 "작업 요청/컨펌 절차"는 팀에서 상세히 확인받아 정리된 내용이라 신뢰도가 높다. 나머지 영역(파일/에셋 관리, 툴/시스템 사용법, 일정/보고 체계)은 아직 팀에서 문서화하지 않았다.

=== 1. 작업 요청 / 내부 컨펌 절차 (확정된 내용) ===

1단계. 담당자 지정
- 클라이언트 계약이 완료되면 팀장이 담당 디자이너를 지정한다.
- 이후 해당 클라이언트와의 소통은 지정된 디자이너가 직접 담당한다.
- (미확인) 담당자가 부재/휴가일 때 재배정 절차는 문서화되어 있지 않음.

2단계. 요청 접수 및 파악
- 클라이언트 측에서 업무 요청이 오면 기획안을 확인한다.
- 분량과 클라이언트가 원하는 스타일을 파악한 뒤 일정을 조율한다.
- (미확인) 기획안이 없을 때 처리 방법은 문서화되어 있지 않음.

3단계. 일정 등록
- 일정은 간트차트와 내부 스케줄차트 두 곳에 기록한다.
- (미확인) 간트차트/스케줄차트의 실제 위치(툴, 링크)는 문서화되어 있지 않음.

4단계. 노션 업무 카드 생성
- 클라이언트 노션 페이지에 업무 카드를 생성한다.
- 이 카드는 이후 진행 상황 기록과 최종 파일 백업까지 담당하는 기록 단위다.
- (미확인) 카드에 필수로 채워야 하는 항목은 문서화되어 있지 않음.

5단계. 마감일 관리
- 내부 컨펌 과정이 있기 때문에 실제 작업은 마감일 1일 전, 최소 반나절 전까지 끝내야 한다.
- (미확인) 내부 컨펌이 지연될 때 대응 방법은 문서화되어 있지 않음.

6단계. 내부 컨펌 절차
- 작업 결과물을 내부 피그마 페이지에 업로드한다.
- 팀톡에서 팀장을 태그해 확인을 요청한다.
- 팀장이 컨펌할 때까지 피드백을 반영해 수정한다.
- 컨펌이 완료되면 일정에 맞춰 클라이언트에게 결과물을 전달한다.
- (미확인, 중요) 팀장이 부재중일 때 대체 컨펌자가 누구인지 문서화되어 있지 않음.
- (미확인) 몇 회까지 수정해야 컨펌이 나는지 기준이 없음.

7단계. 클라이언트 전달 방식
- 광고 소재처럼 간단한 업무가 아니라면 제안서 형태로 정리해서 송부한다.
- 단순 소재 작업 등 간단한 업무는 파일만 전달해도 된다.
- (미확인) 제안서 템플릿 위치, "간단한 업무"의 구체적 기준은 문서화되어 있지 않음.

8단계. 클라이언트 수정 대응
- 클라이언트와 소통하며 수정하되, 방향성이 크게 바뀌지 않는 간단한 수정이면 팀장 재컨펌 없이 클라이언트에게 바로 전달 가능하다.
- 방향성이 바뀌는 큰 수정이면 다시 6단계(내부 컨펌)를 거쳐야 한다.
- (미확인, 중요) "간단한 수정"과 "방향성이 바뀌는 수정"을 구분하는 구체적 기준이 문서화되어 있지 않음.

9단계. 업무 완료 및 백업
- 업무가 끝나면 해당 클라이언트의 노션 페이지 업무 카드에 최종 파일을 백업한다.

=== 2. 파일 / 에셋 관리 규칙 ===
아직 팀에서 문서화하지 않았다. 파일 네이밍 규칙, 버전관리, 저장 위치, 공유 방식에 대한 정보가 없다.

=== 3. 툴 / 시스템 사용법 ===
아직 팀에서 문서화하지 않았다. 사내에서 쓰는 협업툴(피그마, 노션, 팀톡 등)의 구체적인 사용 규칙, 권한, 채널 구조에 대한 세부 정보가 없다. 다만 위 "작업 요청/컨펌 절차"에 등장하는 툴은 피그마(내부 컨펌용), 노션(클라이언트별 업무 카드), 팀톡(컨펌 요청 태그)이다.

=== 4. 일정 / 보고 체계 ===
간트차트와 내부 스케줄차트에 일정을 기록한다는 것 외에는 아직 문서화되지 않았다. 마감 관리, 진행상황 정기 보고, 휴가/부재 처리 절차에 대한 정보가 없다.

=== 답변 규칙 ===
- 위 지식베이스에 있는 내용만 근거로 답하라. 지식베이스에 없는 내용을 지어내지 마라.
- "(미확인)"으로 표시된 부분에 대한 질문이면, 아직 팀에서 정리되지 않았다고 솔직히 말하고 팀장이나 선임에게 직접 확인하라고 안내하라.
- 지식베이스에 아예 없는 카테고리(파일/에셋 관리, 툴 사용법 세부, 일정/보고 체계) 질문이면, 해당 영역은 아직 문서화되지 않았다고 답하라.
- 답은 친절하고 간결한 한국어 존댓말로 하라. 필요하면 번호나 화살표(→)로 단계를 표현해도 좋다. 3~6문장 내외로 간결하게.
`;

const SYSTEM_PROMPT = `당신은 그래픽팀 신규 입사자를 돕는 사내 프로세스 안내 챗봇입니다. 아래 지식베이스와 답변 규칙을 반드시 지켜서 사용자 질문에 답하세요.\n\n${KNOWLEDGE_BASE}`;

// 항상 최신 안정 버전 Flash 모델을 가리키는 별칭. 특정 버전명을 박아두면
// 나중에 그 버전이 지원 종료될 때 다시 에러가 날 수 있어 -latest 별칭을 사용한다.
const GEMINI_MODEL = "gemini-flash-latest";

exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method Not Allowed" }) };
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ error: "서버에 GEMINI_API_KEY 환경변수가 설정되어 있지 않아요. Netlify 사이트 설정 > Environment variables에서 추가해 주세요." })
    };
  }

  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch (e) {
    return { statusCode: 400, body: JSON.stringify({ error: "잘못된 요청 형식이에요." }) };
  }

  const { message, history, extraKnowledge } = payload;
  if (!message || typeof message !== "string") {
    return { statusCode: 400, body: JSON.stringify({ error: "message 값이 없어요." }) };
  }

  // admin.html(Supabase)에서 등록한 지식이 있으면 시스템 프롬프트에 덧붙인다.
  const systemPromptWithExtras =
    SYSTEM_PROMPT + (typeof extraKnowledge === "string" && extraKnowledge.trim() ? extraKnowledge : "");

  // Gemini API는 role을 "user" / "model"로 구분한다.
  const contents = [
    ...(Array.isArray(history) ? history : []).map(m => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: String(m.text || "") }]
    })),
    { role: "user", parts: [{ text: message }] }
  ];

  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPromptWithExtras }] },
          contents,
          generationConfig: { maxOutputTokens: 600 }
        })
      }
    );

    const data = await geminiRes.json();

    if (!geminiRes.ok) {
      return {
        statusCode: geminiRes.status,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ error: (data && data.error && data.error.message) || "Gemini API 호출에 실패했어요." })
      };
    }

    const candidate = data.candidates && data.candidates[0];
    const answer =
      (candidate && candidate.content && candidate.content.parts && candidate.content.parts[0] && candidate.content.parts[0].text) ||
      "답변을 생성하지 못했어요. (안전 필터에 걸렸거나 응답이 비어있을 수 있어요)";

    return {
      statusCode: 200,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ answer })
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ error: "서버 오류가 났어요: " + err.message })
    };
  }
};
