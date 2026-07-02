# Backend API 명세서

본 문서는 NestJS 백엔드 프로젝트(`ai-life-legacy-backend-nestjs`)의 실제 구현 코드(`Controller` 및 `DTO` 등)를 기준으로 작성된 API 명세서입니다.

## 1. API 전체 목록 표

| Method | Endpoint | Controller | 인증 필요 여부 | writerToken 허용 | viewerToken 허용 | Request Body | Response | 설명 |
|---|---|---|---|---|---|---|---|---|
| POST | `/auth/signup` | AuthController | X | X | X | `SignupDTO` | `Success201ResponseDTO<JwtTokenResponseDTO>` | 회원가입 |
| POST | `/auth/login` | AuthController | X | X | X | `LoginDTO` | `SuccessResponseDTO<JwtTokenResponseDTO>` | 로그인 |
| POST | `/auth/refresh-token` | AuthController | X | X | X | `RefreshTokenDto` | `Success201ResponseDTO<JwtTokenResponseDTO>` | 리프레시 토큰 발급 |
| POST | `/auth/viewer-login` | AuthController | X | X | X | `ViewerLoginRequestDTO` | `SuccessResponseDTO<ViewerLoginResponseDTO>` | 관람자(뷰어) 로그인 |
| POST | `/users/me/intro` | UserController | O | O | X | `SaveUserIntroDTO` | `Success201ResponseDTO` | 유저 자기소개 저장 |
| GET | `/users/me/toc` | UserController | O | O | X | 없음 | `SuccessResponseDTO<UserTocResultDTO>` | 맞춤형 목차 및 퍼센테이지 조회 |
| GET | `/users/me/toc-questions` | UserController | O | O | X | 없음 | `SuccessResponseDTO<TocWithQuestionsDTO[]>` | 맞춤형 목차 및 질문 조회 |
| GET | `/users/me/answers` | UserController | O | O | X | Query (`questionId`, `tocId`) | `SuccessResponseDTO<UserAnswerResponseDTO>` | 유저가 작성한 답변 조회 |
| PATCH | `/users/me/answers/:answerId` | UserController | O | O | X | `PatchPostDTO` | `SuccessNoResultResponseDTO` | 유저 작성 자서전 내용 업데이트 |
| DELETE | `/users/me` | UserController | O | O | X | `SaveUserWithdrawalDTO` | `SuccessResponseDTO` | 회원탈퇴 |
| POST | `/users/me/profile-image` | UserController | O | O | X | FormData (`image`) | `SuccessNoResultResponseDTO` | 프로필 이미지 업로드 |
| PATCH | `/users/me/settings/notifications` | UserController | O | O | X | `UpdateNotificationSettingsDTO` | `SuccessNoResultResponseDTO` | 알림 설정 수정 |
| GET | `/life-legacy/toc/:tocId/questions` | LifeLegacyController | O | O | X | 없음 | `SuccessResponseDTO<QuestionResponseDTO[]>` | 목차별 질문 조회 |
| POST | `/life-legacy/toc/:tocId/questions/:questionId/answers`| LifeLegacyController | O | O | X | `SavePostDTO` | `SuccessNoResultResponseDTO` | 목차별 질문 최종 결과물 저장 |
| POST | `/life-legacy/share` | LifeLegacyController | O | O | X | `ShareRequestDTO` | `SuccessResponseDTO<ShareResponseDTO>` | 뷰어 코드(공유용) 발급 |
| GET | `/life-legacy/pdf/:tocId` | LifeLegacyController | O | O | X | 없음 | `SuccessResponseDTO<PdfResponseDTO>` | 작성자용 완성 PDF URL 조회 |
| GET | `/life-legacy/viewer/pdf` | LifeLegacyController | O | X | O | 없음 | `SuccessResponseDTO<PdfResponseDTO>` | 뷰어용 공유 PDF URL 조회 |
| POST | `/api/case` | AiController | O | O | X | `MakeCaseDTO` | `SuccessResponseDTO<CaseResponseDTO>` | 유저 케이스 분류 (AI) |
| POST | `/api/sync` | AiController | O | O | X | `SyncDTO` | `SuccessNoResultResponseDTO` | 기억 동기화 |
| POST | `/api/question` | AiController | O | O | X | `MakeReQuestionDTO` | `SuccessResponseDTO<AIResponseDTO>` | 꼬리 질문 생성 (AI) |
| POST | `/api/autobiography` | AiController | O | O | X | Query (`force`) | `SuccessResponseDTO<AutobiographyResponseDTO>` | 자서전 제작 및 PDF 발행 |
| GET | `/api/autobiography/status` | AiController | O | O | X | 없음 | `SuccessResponseDTO<MyAutobiographyStatusResponseDTO>` | 자서전 최종 생성 상태 조회 |
| GET | `/api/autobiography/status/:tocId` | AiController | O | O | X | 없음 | `SuccessResponseDTO<AutobiographyStatusResponseDTO>` | 자서전 목차별 생성 진행 상태 조회 |
| POST | `/api/chat` | AiController | O | O | O | `ChatDTO` | `SuccessResponseDTO<ChatResponseDTO>` | 아바타 채팅 |
| POST | `/api/search` | AiController | O | O | X | `SearchDTO` | `SuccessResponseDTO<SearchResponseDTO>` | 원문 검색 |
| POST | `/api/combine` | AiController | O | O | X | `CombineDTO` | `SuccessResponseDTO<AIResponseDTO>` | 자서전 답변 병합 (AI) |

---

## 2. 인증 API (`AuthController`)

인증 과정에서 토큰을 발급받거나 갱신하기 위한 API들입니다. 인증 없이 접근 가능합니다.

- **`POST /auth/signup`**
  - **요청 Body:** `SignupDTO` (`email`, `password`)
  - **응답:** JWT 토큰
  - **설명:** 신규 사용자 회원가입 처리.
- **`POST /auth/login`**
  - **요청 Body:** `LoginDTO` (`email`, `password`)
  - **응답:** JWT 토큰
  - **설명:** 작성자(Writer) 로그인 처리.
- **`POST /auth/refresh-token`**
  - **요청 Body:** `RefreshTokenDto` (`refreshToken`)
  - **응답:** 새로운 JWT 토큰
  - **설명:** 만료된 액세스 토큰을 리프레시 토큰을 이용해 갱신.
- **`POST /auth/viewer-login`**
  - **요청 Body:** `ViewerLoginRequestDTO` (`viewerCode`)
  - **응답:** Viewer 권한을 가진 JWT 토큰 (`ViewerLoginResponseDTO`)
  - **설명:** 전달받은 공유 코드로 뷰어가 로그인할 때 사용. 발급된 토큰의 role은 `viewer`가 됩니다.

---

## 3. 사용자 API (`UserController`)

작성자 본인의 개인 정보, 자서전 작성 상태 등을 관리하는 API입니다. (`WriterOnlyGuard` 적용되어 `writerToken`만 허용)

- **`POST /users/me/intro`**: 자기소개 저장 (`SaveUserIntroDTO`)
- **`GET /users/me/toc`**: 사용자의 맞춤형 목차 및 진행 퍼센테이지(%) 조회
- **`GET /users/me/toc-questions`**: 사용자의 맞춤형 목차와 하위 질문 목록을 함께 조회
- **`GET /users/me/answers`**: 특정 질문 및 목차 ID(`questionId`, `tocId` Query)에 대해 유저가 작성했던 답변을 조회
- **`PATCH /users/me/answers/:answerId`**: 이전에 작성한 자서전의 답변 내용을 업데이트 (`PatchPostDTO`)
- **`DELETE /users/me`**: 회원탈퇴 처리. 소프트 딜리트/하드 딜리트 처리 후 응답. (`SaveUserWithdrawalDTO`)
- **`POST /users/me/profile-image`**: 폼데이터 기반으로 프로필 이미지 업로드
- **`PATCH /users/me/settings/notifications`**: 앱 푸시 등 서비스 알림 설정 수정

---

## 4. 자서전/답변 API (`LifeLegacyController`, `AiController`)

자서전 내용 작성 및 백그라운드 AI 생성 관련 API들입니다.

**LifeLegacy 작성용 API (`LifeLegacyController` - WriterOnly Guard)**
- **`GET /life-legacy/toc/:tocId/questions`**: 특정 목차 내 포함된 질문 목록 조회
- **`POST /life-legacy/toc/:tocId/questions/:questionId/answers`**: 특정 질문에 대한 유저의 최종 결과물(답변) 저장 (`SavePostDTO`)
- **`GET /life-legacy/pdf/:tocId`**: 작성을 마친 자서전의 작성자용 최종 완성 PDF URL 조회

**Autobiography AI 생성 API (`AiController` - WriterOnly Guard)**
- **`POST /api/autobiography`**: 자서전 생성 및 PDF 발행을 AI 서버에 요청. URL Query로 `?force=true` 전달 시 기존 캐시를 무시하고 강제 재생성.
- **`GET /api/autobiography/status`**: 전체 자서전의 최종 생성 상태와 결과 데이터 조회
- **`GET /api/autobiography/status/:tocId`**: 특정 목차의 자서전 생성 진행 상태 조회

**기타 데이터 가공 API (`AiController` - WriterOnly Guard)**
- **`POST /api/case`**, **`POST /api/sync`**, **`POST /api/question`**, **`POST /api/combine`**: AI 프롬프트를 통해 사용자 특성을 분류하고, 기억을 동기화하며, 꼬리 질문을 생성하거나, 여러 답변을 자연스럽게 병합하는 기능을 수행합니다. (확인 필요: 내부 AI 서버로 Proxy 역할 수행)

---

## 5. 공유/뷰어 API (`LifeLegacyController`)

작성된 자서전을 타인과 공유하고, 뷰어 모드로 진입하기 위한 API입니다.

- **`POST /life-legacy/share` (`WriterOnlyGuard`)**: 
  - 작성자가 본인의 자서전을 공유하기 위해 특정 목차(`tocId`)에 대한 뷰어 코드를 발급받습니다. (`ShareRequestDTO`)
- **`GET /life-legacy/viewer/pdf` (`ViewerOnlyGuard`)**: 
  - 인증된 관람자(뷰어)만 접근 가능합니다. (`viewerToken` 전용)
  - 자신이 발급받은 코드에 연결된 공유용 PDF URL을 조회합니다.

---

## 6. 채팅 API (`AiController`)

아바타와의 텍스트/음성 채팅을 처리하는 핵심 API입니다.

- **`POST /api/chat`**
  - **요청 Body:** `ChatDTO` (채팅 메시지 내용 포함, 구조 상세 확인 필요)
  - **응답:** `ChatResponseDTO` (AI의 답변)
  - **writerToken/viewerToken 처리 차이:**
    - `AiController`의 대부분의 엔드포인트는 `@UseGuards(WriterOnlyGuard)`를 선언하여 `writerToken`만을 허용합니다.
    - 하지만 `chat` 메서드는 클래스 레벨의 `@UseGuards(JwtAuthGuard)`만 적용받고 권한 체크용 가드가 생략되어 있습니다.
    - 즉, **`writerToken`과 `viewerToken` 둘 다 접근이 허용**되며, 메서드 내부에서 `req.user`를 통해 현재 유저가 작성자인지 뷰어인지 판단한 후 그에 맞는 AI 페르소나 및 채팅 컨텍스트를 제공하도록 설계되어 있습니다.

---

## 7. 응답 포맷 (`src/common/response/response.dto.ts` 기준)

모든 API는 `NestJS`의 전역적인 응답 포맷을 따릅니다.

### 1) 성공 응답 구조 (`SuccessResponseDTO`, `Success201ResponseDTO`)
결과 데이터를 반환하는 경우의 표준 구조입니다.
```json
{
  "status": 200, // 또는 201
  "message": "Success",
  "result": {
    // 실제 반환 객체 또는 리스트 (예: JwtTokenResponseDTO, UserTocResultDTO 등)
  }
}
```

### 2) 데이터가 없는 성공 응답 구조 (`SuccessNoResultResponseDTO`)
추가 데이터 없이 수행 완료 여부만 필요한 경우 (수정/삭제 등)의 응답 구조입니다.
```json
{
  "statusCode": 200,
  "message": "Success"
  // result 필드가 제공되지 않습니다.
}
```

### 3) 실패 응답 구조 (`ErrorResponseDTO`)
비즈니스 로직 오류나 인증 실패 시 반환되는 구조입니다.
```json
{
  "status": 400, // 400, 401, 403, 404, 500 등 HTTP 상태 코드
  "message": "Bad Request" // 상세 에러 메시지
}
```
