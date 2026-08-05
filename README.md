# 그래픽팀 온보딩 챗봇 — 배포 가이드

이 폴더를 그대로 GitHub + Netlify에 올리면 실제 URL을 가진 웹사이트가 됩니다. 브라우저(정적 페이지)와 Google Gemini AI(무료 티어)가 답하는 서버(Netlify Function)가 분리되어 있어요. 완전히 무료로 운영할 수 있습니다.

**왜 GitHub Pages가 아니라 Netlify인가요?**
GitHub Pages는 정적 파일만 올라가서, AI API 키를 안전하게 숨길 서버가 없어요. Netlify는 무료 티어에서도 "Functions"라는 서버 코드를 실행할 수 있어서, API 키를 안전하게 서버 쪽에만 두고 브라우저에는 노출하지 않을 수 있습니다.

## 폴더 구성

```
onboarding-chatbot-site/
├── index.html                     ← 첫 페이지, 사용법 안내 + 인기 질문
├── chat.html                      ← 실제 챗봇 대화 화면
├── admin.html                     ← 코드 없이 지식을 추가/수정/삭제하는 관리 페이지
├── style.css                      ← 세 페이지가 같이 쓰는 스타일
├── config.js                      ← Supabase 연결 설정 + 헬퍼 함수 + 관리자 비밀번호
├── supabase/schema.sql            ← Supabase에 실행할 테이블 생성 SQL
├── netlify/functions/chat.js      ← Gemini API를 호출하는 서버 코드 + 기본 지식베이스
├── netlify.toml                   ← Netlify 배포 설정
├── package.json
└── README.md
```

사용자는 사이트에 들어오면 먼저 `index.html`(사용법 + 인기 질문)을 보고, "챗봇 바로 쓰기"를 누르면 `chat.html`로 이동합니다. `admin.html`은 팀장님/관리자가 챗봇에게 새로운 지식을 가르치는 페이지예요.

## 1. Gemini API 키 무료로 발급받기

1. https://aistudio.google.com/apikey 접속 후 구글 계정으로 로그인
2. **Create API key** 클릭 → 새 프로젝트 또는 기존 프로젝트 선택
3. 생성된 키를 복사해둡니다.
4. **신용카드 등록 없이 바로 무료로 쓸 수 있어요.** 단, 무료 티어는 분당/일일 요청 수에 제한이 있습니다(모델마다 다르고 수시로 바뀌니, 발급 후 https://aistudio.google.com/rate-limit 에서 본인 계정 기준 현재 한도를 확인하세요). 팀 내부용으로 하루 수십 건 정도 쓰는 규모라면 무료 티어로 충분할 가능성이 높아요.
5. 한도를 넘으면 그 시간 동안만 오류가 나고, 시간이 지나면 다시 정상 작동합니다. 자동으로 돈이 청구되지 않아요(별도로 결제 정보를 등록하지 않는 한).

## 2. GitHub에 코드 올리기

1. https://github.com 에서 새 저장소(Repository) 생성 (예: `graphic-onboarding-chatbot`)
2. 이 `onboarding-chatbot-site` 폴더 안의 파일 전체를 그 저장소에 업로드
   - GitHub 웹사이트에서 "Add file → Upload files"로 드래그앤드롭 해도 되고, git을 쓸 줄 알면 `git push`로 올려도 됩니다.

## 3. Netlify에 배포하기

1. https://netlify.com 가입 (GitHub 계정으로 바로 로그인 가능)
2. **Add new site → Import an existing project** 선택
3. 방금 만든 GitHub 저장소 선택
4. 빌드 설정은 그대로 두면 됩니다 (`netlify.toml`이 이미 설정을 담고 있어요)
5. **Site settings → Environment variables** 로 이동해서 아래처럼 추가:
   - Key: `GEMINI_API_KEY`
   - Value: 1단계에서 복사한 API 키
6. **Deploy site** 클릭 → 몇 분 후 `https://랜덤이름.netlify.app` 같은 주소가 생깁니다.
7. Site settings에서 사이트 이름을 원하는 이름으로 바꿀 수 있어요 (예: `graphic-onboarding.netlify.app`).

배포가 끝나면 그 주소를 팀원들에게 공유하면 바로 챗봇을 쓸 수 있어요. (Supabase를 연결하기 전까지는 대화 로그 저장과 "인기 질문" 기능만 빠진 채로, 챗봇 자체는 정상 작동합니다.)

## 4. Supabase 연결하기 (대화 로그 저장 + 인기 질문)

Supabase는 무료로 쓸 수 있는 데이터베이스예요. 이걸 연결하면 팀원들이 실제로 물어본 질문이 쌓이고, 첫 페이지에 "팀원들이 많이 물어보는 질문"이 자동으로 표시됩니다.

1. https://supabase.com 가입 (GitHub 계정으로 로그인 가능) 후 **New project** 생성
2. 프로젝트가 만들어지면 좌측 메뉴 **SQL Editor** 로 이동
3. 이 저장소의 `supabase/schema.sql` 파일 내용을 그대로 복사해서 붙여넣고 **Run** 클릭 → `chat_logs` 테이블이 생성됩니다
4. 좌측 메뉴 **Project Settings → API** 로 이동해서 아래 두 값을 복사:
   - **Project URL**
   - **anon public** 키 (service_role 키가 아니라 anon 키를 써야 해요)
5. 저장소의 `config.js` 파일을 열어 맨 위 두 줄을 수정:
   ```js
   window.SUPABASE_URL = "복사한 Project URL";
   window.SUPABASE_ANON_KEY = "복사한 anon 키";
   ```
6. GitHub에 다시 올리면 Netlify가 자동 재배포합니다.

**참고**: `chat_logs` 테이블에는 팀원이 입력한 질문이 그대로 저장돼요. 클라이언트명이나 민감한 내용을 직접 입력하지 않도록 팀에 안내하는 걸 권장해요. `config.js`를 수정하지 않고 그대로 두면 이 기능만 비활성화되고 챗봇 자체는 정상 작동해요.

## 5. 챗봇에게 새 지식 가르치기 (코드 없이, `admin.html`)

Supabase까지 연결했다면, 이제부터는 **코드나 GitHub을 전혀 건드리지 않고** `admin.html` 페이지에서 지식을 관리할 수 있어요.

1. 먼저 `config.js`에서 관리자 비밀번호를 원하는 값으로 바꿔주세요:
   ```js
   window.ADMIN_PASSWORD = "원하는비밀번호";
   ```
   ⚠️ 이건 진짜 로그인 인증이 아니라 브라우저에서 문자열만 비교하는 가벼운 잠금이에요. `admin.html` 링크는 팀장님/선임 정도만 알고 있게 해주세요.
2. 배포된 사이트 주소 뒤에 `/admin.html`을 붙여서 접속 (예: `graphic-onboarding.netlify.app/admin.html`)
3. 비밀번호 입력 후 들어가면:
   - **카테고리**를 고르고, **제목**(질문처럼 짧게)과 **내용**(실제 답변 근거가 될 내용)을 적고, **확정/미확인** 상태를 고른 뒤 저장하면 바로 챗봇이 그 내용을 알게 돼요.
   - 목록에서 **수정**/**삭제**도 바로 할 수 있어요.
   - "미확인" 상태로 저장하면, 챗봇이 그 내용을 확답하지 않고 "아직 확인이 필요하다"고 솔직하게 답해요. 나중에 확실해지면 "확정"으로 바꿔주세요.
4. 저장하자마자 반영되고, 재배포도 필요 없어요. (`chat.html`을 새로고침하면 바로 최신 지식으로 답합니다.)

**코드를 직접 고치는 방법(고급)**: `netlify/functions/chat.js` 맨 위 `KNOWLEDGE_BASE`에는 "작업 요청/컨펌 절차"처럼 이미 검증된 핵심 지식이 하드코딩되어 있어요. 이건 실수로 지워지지 않도록 admin.html에서는 손댈 수 없고, 코드를 직접 고쳐야 해요(GitHub에 올리면 Netlify가 자동 재배포). admin.html에서 추가하는 지식은 이 핵심 지식 위에 "추가 지식"으로 덧붙여지는 구조입니다.

## 6. 비용 관련 참고사항

- **Netlify**: 무료 티어로 개인/소규모 팀 트래픽은 충분히 커버됩니다. (Vercel Hobby 무료 티어는 약관상 개인/비상업적 용도로 제한되어 있어 회사 내부 도구로 쓰기엔 Netlify가 더 안전해요.)
- **Gemini API**: 무료 티어를 쓰는 한 비용이 발생하지 않습니다. 결제 정보를 등록하지 않으면 한도를 넘겨도 과금되지 않고, 일시적으로 오류만 발생해요.
- **Supabase**: 무료 티어로 500MB DB, 프로젝트 2개까지 제공돼요. 이 정도 규모의 사내 챗봇 로그로는 충분합니다. 단, 7일간 접속이 없으면 프로젝트가 일시정지될 수 있으니 가끔 접속해주세요.
- 사내용으로만 쓸 거면 URL을 팀원에게만 공유하고, 별도 로그인 기능은 없으니 외부에 URL이 퍼지지 않게 주의하세요. (로그인/비밀번호 보호가 필요하면 알려주시면 추가해드릴게요.)
- 나중에 더 많은 사람이 쓰게 되거나 무료 한도를 자주 넘긴다면, 그때 유료 전환을 고려하면 됩니다.

## 로컬에서 미리 테스트하고 싶다면

Netlify CLI를 설치하면 배포 전에 로컬에서 확인할 수 있어요.

```
npm install -g netlify-cli
cd onboarding-chatbot-site
netlify dev
```

`.env` 파일을 만들어 `GEMINI_API_KEY=발급받은키` 한 줄을 넣어두면 로컬에서도 API 키를 인식합니다. (이 파일은 절대 GitHub에 올리지 마세요 — 이미 `.gitignore`에 추가되어 있습니다)
