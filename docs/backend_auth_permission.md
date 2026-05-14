# Backend Authentication & Permission 구조 명세서

본 문서는 NestJS 백엔드의 인증(Authentication) 및 권한(Authorization) 처리 구조를 분석한 문서입니다. 일반 작성자(Writer)와 뷰어(Viewer) 간의 권한 분리에 초점을 맞추어 작성되었습니다.

## 1. 일반 회원 인증 (Writer)

작성자는 이메일과 비밀번호 기반으로 회원가입 및 로그인을 수행하며, JWT(Access/Refresh Token) 기반으로 인증됩니다.

- **`signup` & `login`**
  - 사용자가 가입/로그인 시 고유 `uuid`를 발급/조회합니다.
  - Access Token과 Refresh Token을 생성하여 반환합니다.
- **`accessToken` Payload**
  - 기본 Payload: `{ uuid: string }`
  - 짧은 만료 시간을 가집니다.
- **`refreshToken` 발급 및 검증**
  - 발급 시 `bcrypt`로 해싱되어 DB(`refresh_tokens` 테이블)에 저장됩니다.
  - 토큰 갱신 시 DB에 저장된 해시값과 클라이언트가 보낸 토큰을 `bcrypt.compare`로 대조하여 탈취를 방지합니다.

---

## 2. 관람자 인증 (Viewer)

뷰어는 작성자가 공유 목적으로 발급한 6자리 뷰어 코드를 통해 로그인합니다. 일반 사용자와 별도의 페이로드를 지니게 됩니다.

- **`viewerCode` 발급**
  - 작성자가 특정 자서전에 대해 코드 생성 요청 시 DB(`viewer_codes` 테이블)에 생성되며 만료기한이 지정됩니다.
- **`viewer-login`**
  - 뷰어가 코드를 입력하면 DB에서 상태(`ACTIVE`) 및 만료 여부를 검증합니다.
- **`viewerAccessToken` Payload**
  ```json
  {
    "type": "viewer",
    "viewerCode": "A3F7K2",
    "authorUserId": "작성자_UUID",
    "autobiographyResultId": 1,
    "pdfUrl": "https://..."
  }
  ```
  - 일반 사용자와 달리 `type: 'viewer'` 플래그를 명시하여 구별합니다.

---

## 3. Guard 및 Decorator 구조

들어오는 API 요청은 `JwtStrategy`와 권한별 `Guard`를 통해 접근이 제한됩니다.

### 1) JWT 추출 및 검증 (`JwtStrategy`)
- `Authorization: Bearer <Token>` 헤더에서 토큰을 추출합니다.
- Payload에 `type === 'viewer'`가 있는 경우 DB를 조회하지 않고 메모리에 `{ isViewer: true, authorUserId, ... }` 객체를 생성해 `req.user`에 할당합니다.
- 일반 사용자의 경우 Payload의 `uuid`를 통해 DB에서 `User` 엔티티를 조회하여 `req.user`에 할당합니다.

### 2) Role 판별 구조 (`role.guard.ts`)
- **`WriterOnlyGuard`**: `!req.user.isViewer`일 경우에만 접근 허용. 뷰어 접근 시 `403 Forbidden` (`작성자 전용 API입니다.`) 발생.
- **`ViewerOnlyGuard`**: `req.user.isViewer`가 `true`일 경우에만 접근 허용. 작성자 접근 시 `403 Forbidden` (`뷰어 전용 API입니다.`) 발생.

### 3) 통합 허용 로직 및 `@GetUUID` Decorator
- 일부 API(예: `/api/chat`)는 `WriterOnlyGuard`나 `ViewerOnlyGuard` 대신 기본 `JwtAuthGuard`만 선언되어 있습니다. 이 경우 작성자와 뷰어 모두 접근 가능합니다.
- `@GetUUID` 커스텀 데코레이터 구현:
  ```typescript
  return req.user.uuid || req.user.authorUserId;
  ```
  - 작성자일 경우 본인의 `uuid`를 반환하고, 뷰어일 경우 토큰에 담긴 작성자의 `authorUserId`를 반환합니다. 이를 통해 뷰어도 작성자의 데이터를 기준(Context)으로 AI 기능을 활용할 수 있게 됩니다.

---

## 4. 권한별 접근 가능 API

| 구분 | API 엔드포인트 주요 예시 | writerToken | viewerToken | Public (No Token) | 권한 차단 시 응답 |
|---|---|:---:|:---:|:---:|---|
| **Public** | `POST /auth/signup`<br>`POST /auth/login`<br>`POST /auth/refresh-token`<br>`POST /auth/viewer-login` | O | O | **O** | (제한 없음) |
| **Writer 전용** | `POST /users/me/*`<br>`GET /life-legacy/toc/...`<br>`POST /api/autobiography` | **O** | X | X | `403 Forbidden`<br>("작성자 전용 API입니다.") |
| **Viewer 전용** | `GET /life-legacy/viewer/pdf` | X | **O** | X | `403 Forbidden`<br>("뷰어 전용 API입니다.") |
| **통합 (Both)** | `POST /api/chat` | **O** | **O** | X | `401 Unauthorized`<br>(토큰 부재 및 만료 시) |

---

## 5. 보안상 주의점 및 특이사항

1. **ViewerMode의 접근 차단 원리**
   - 뷰어의 AccessToken은 일반 유저의 `uuid`가 없기 때문에 일반 API를 호출하더라도 `WriterOnlyGuard`에서 원천 차단됩니다. 이를 통해 뷰어가 작성자의 프로필을 수정하거나 자서전을 삭제/재생성하는 등의 악의적 행위를 완벽히 방어합니다.
2. **ViewerToken의 Author Context 사용**
   - 뷰어가 작성자의 아바타와 대화를 나누기 위해서는 작성자 본인의 DB Context(작성했던 답변 등)가 필요합니다.
   - 이를 위해 `@GetUUID` 내부에서 `req.user.authorUserId`를 반환하도록 설계하여, 백엔드의 핵심 쿼리를 수정하지 않고도 권한 있는 데이터 접근이 가능하게 설계되었습니다.
3. **토큰의 명확한 분리**
   - 동일한 `JwtAuthGuard`를 거치지만, 페이로드 내부에 `type: 'viewer'` 여부를 하드코딩하고 이를 바탕으로 `isViewer` 속성을 주입함으로써 런타임에 완벽히 분리 처리됩니다. 뷰어는 DB 상의 실존 User가 아닌 "임시 대리인" 개념으로 안전하게 구동됩니다.
