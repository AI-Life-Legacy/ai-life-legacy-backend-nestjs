# Backend ↔ FastAPI AI 서버 연동 명세서

본 문서는 NestJS 백엔드(`ai-life-legacy-backend-nestjs`)가 파이썬 기반의 FastAPI AI 서버와 어떻게 연동하여 프론트엔드의 요청을 처리하는지 분석한 문서입니다.

---

## 1. AI 서버 Base URL 설정

현재 백엔드 코드의 통신 로직(`src/api/ai/ai.service.ts`)을 분석한 결과, AI 서버의 URL은 환경 변수로 분리되지 않고 코드 내부에 **하드코딩**되어 있는 것으로 확인되었습니다.

- **설정 파일 위치**: `src/api/ai/ai.service.ts` 내부의 `fetch` 함수 호출부
- **Base URL 기본값**: `http://localhost:8000`
- **env 변수명**: 없음 (현재 미존재, 향후 `AI_SERVER_URL` 등으로 환경 변수 분리가 필요해보임)
- *참고*: 일부 기능(combine 등)은 AI 서버를 통하지 않고 NestJS 백엔드에서 직접 OpenAI API(`OPENAI_API_KEY`)를 호출하도록 구현되어 있습니다.

---

## 2. AI 서버 호출 API 목록

백엔드의 `AiController`를 통해 들어온 요청이 AI 서버로 릴레이되는 구조입니다.

| 백엔드 API (Client 요청) | AI 서버 엔드포인트 | Request Body (To AI) | AI Response | 프론트 응답 매핑 필드 | Timeout | 에러 처리 |
|---|---|---|---|---|---|---|
| `POST /api/case` | `POST /api/v1/case` | `{ introText }` | `{ case: "case1" }` | `{ case: "case1" }` | 설정 안 됨 | 통신 실패 시 `500 Error` 발생 |
| `POST /api/question` | `POST /api/v1/generation/question` | `{ toc_id, current_answer, chat_history: [...] }` | `{ question: "질문 텍스트" }` | `{ question: "질문 텍스트" }` | 설정 안 됨 | 응답 데이터 누락 시 `500 Error` |
| `POST /api/autobiography` | `POST /api/v1/generation/autobiography` | `{ user_id, userName, chapters: [...], force }` | `{ pdf_url, page_count, mdPath }` | `{ status, cached, pdfUrl, pageCount, markdown, pdfPath }` | **360초** (6분) | `429/403/500` 코드 변환. 재생성 실패 시 복원 후 `500 에러` (기존 PDF URL 동봉) |
| `POST /api/chat` | `POST /api/v1/chat/chat` | `{ user_id, session_id, role_id, message, viewer_id }` | `{ answer, session_id, context_used }` | `{ answer, sessionId, contextUsed }` | **30초** | Timeout 시 `504` 응답, 422 시 `422 Unprocessable Entity` 매핑 |
| `POST /api/sync` | `POST /api/v1/rag/sync` | `{ userId, text, metadata: {} }` | (결과 없음) | 상태코드 200 반환 | 설정 안 됨 | 실패 시 `500 Error` |
| `POST /api/search` | `POST /api/v1/rag/search` | `{ userId, query }` | `{ results: [...] }` | `{ results: [...] }` | 설정 안 됨 | 실패 시 `500 Error` |

---

## 3. 기능별 연동 및 필드 매핑 세부 구조

### 1) 자서전 생성 (`POST /api/autobiography`)
- 백엔드에서 모든 사용자의 챕터와 질문-답변 내역을 DB에서 가져와 `chapters` 배열 형태로 묶어 전송합니다.
- 긴 생성 시간을 대비하여 `AbortController`를 이용해 **6분의 Timeout**이 설정되어 있습니다.
- **필드명 변환 (파이썬 ↔ JS 스타일 변환)**:
  - `pdf_url` (AI 서버 반환) ➔ 백엔드 DB 저장 ➔ 프론트에는 `pdfUrl`과 `pdfPath`로 매핑하여 반환.
  - `page_count` (AI 서버 반환) ➔ 프론트에는 `pageCount`로 매핑 (값이 없을 경우 `42` 기본값 사용).
  - `mdPath` 또는 `markdownPath` ➔ `markdown`으로 매핑.

### 2) 아바타 채팅 (`POST /api/chat`)
- 사용자(또는 뷰어)의 채팅 요청 시 백엔드에서 `authorUserId`를 찾아내고, `role_id` (예: `father`, `mother`, `self` 등)를 파싱하여 전송합니다.
- `viewer_id`는 뷰어 모드일 때만 포함됩니다.
- 스트리밍 응답이 아닌 단일 요청/응답 방식이며, **30초의 Timeout**이 설정되어 있습니다.
- **필드명 변환**:
  - `session_id` ➔ 프론트에는 `sessionId`로 캐멀 케이스로 매핑.
  - `context_used` ➔ `contextUsed`로 매핑.
  - `answer` ➔ 그대로 `answer`로 전달.

### 3) 꼬리 질문 생성 (`POST /api/question`)
- 프론트에서 받은 현재 답변(`current_answer`)과 질문 자체를 `chat_history`의 형태로 조립하여 AI 서버의 `/api/v1/generation/question` 엔드포인트로 전송합니다.
- 반환받은 `question` 필드를 꺼내어 그대로 프론트에 전달합니다.

### 4) Search와 Combine 구현 현황
- **Search (`/api/search`)**: `http://localhost:8000/api/v1/search`로 릴레이하여 결과를 받아 프론트에 매핑합니다. 정상 구현되어 있습니다.
- **Combine (`/api/combine`)**: AI 서버(FastAPI) 엔드포인트를 호출하지 **않습니다**. 백엔드의 `AiService.getChatGPTData` 메서드를 사용하여, `OPENAI_API_KEY`를 바탕으로 백엔드에서 직접 OpenAI를 호출(`gpt-4o-mini`)하여 프롬프트로 병합 작업을 수행합니다.

---

## 4. 비용 절감 및 중복 호출 방지 메커니즘

AI 서버의 불필요한 호출로 인한 비용 낭비와 지연을 막기 위해 백엔드에서 아래와 같은 방어 로직을 수행합니다.

### 1) ContentHash 캐싱 로직
- **개념**: DB에서 가져온 전체 `answerText`들을 문자열(`|||` 기준)로 이어붙인 후 `crypto` 모듈을 통해 `SHA256` 해시값(`contentHash`)을 생성합니다.
- **적용점**: 자서전 생성 요청 시, 이전에 `COMPLETED` 상태로 성공했던 `autobiography_results` 레코드의 `contentHash`와 새롭게 계산된 해시값을 비교합니다.
- **결과**: `force=false`이면서 해시값이 완전히 동일하다면(즉, 답변을 수정한 적이 없다면), **AI 서버를 아예 호출하지 않고** DB에 저장되어 있던 기존 `pdfUrl`을 즉시 리턴하여 응답 속도를 높이고 API 비용을 아낍니다.

### 2) `force=true` (강제 재생성)
- 프론트에서 재생성 버튼 등을 눌러 `force=true` 값을 쿼리로 보낸 경우, 상기 해시 비교(캐싱)를 무시하고 무조건 AI 서버에 재생성을 요청합니다.
- 재생성 실패 시(예: 할당량 부족 등 429 에러 발생 시) 백엔드가 메모리에 임시 보관해두었던 이전 `pdfUrl` 및 데이터로 DB를 롤백(`COMPLETED` 상태 복구)하여 서비스 끊김을 방지합니다.

### 3) 요청 중복 잠금 (Memory Lock)
- `AiService` 클래스 내에 `activeAutobiographyGenerations`라는 `Set<string>` 자료구조를 만들어, 이미 자서전 생성 로직에 진입한 `userId`를 임시로 기억합니다.
- 아직 이전 요청이 6분 내에 처리 중(`PROCESSING`)인데 사용자가 중복으로 연타할 경우, 해당 셋업/상태를 감지하고 곧바로 `PROCESSING` 상태임을 반환하여 **동시에 2개 이상의 AI 자서전 생성 요청이 백엔드 단에서 트리거되는 것을 방어**합니다.
