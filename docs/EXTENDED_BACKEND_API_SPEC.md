# EXTENDED_BACKEND_API_SPEC.md
(AI 자서전 Life Legacy - 백엔드 서버 기능 확장 명세서)

본 문서는 프론트엔드 UI 시나리오 및 기능 고도화에 따라 기존 NestJS/Spring 백엔드 설계에서 추가 또는 수정이 필요한 API 명세입니다.

---

## 1. 자서전 공유 및 뷰어 권한 (Share & Viewer)
사용자가 자서전을 완성한 후 가족/지인에게 공유하고, 코드를 통해 입장하는 로직을 처리합니다.

### 1.1 공유용 뷰어 코드 발급
* **Endpoint**: `POST /life-legacy/share`
* **Description**: 작성자가 자신의 자서전에 대한 외부 접근용 6자리 코드를 생성합니다.
* **Request Body**: `{ "tocId": number }`
* **Response**: `{ "viewerCode": "A3F7K2", "expiresAt": "ISO_DATE" }`

### 1.2 뷰어 코드 검증 및 인증 (관람자 로그인)
* **Endpoint**: `POST /auth/viewer-login`
* **Description**: 관람자가 입력한 코드를 검증하고, 해당 자서전 열람용 임시 JWT를 발급합니다.
* **Request Body**: `{ "viewerCode": "A3F7K2" }`
* **Response**: `{ "accessToken": "JWT_TOKEN", "authorInfo": { "name": "string", "intro": "string" } }`

---

## 2. 자서전 출력 및 상태 관리 (Export & Status)
PDF 생성의 비동기 처리와 결과물 다운로드를 지원합니다.

### 2.1 자서전 생성 진행 상태 조회
* **Endpoint**: `GET /api/autobiography/status/:tocId`
* **Description**: `POST /api/autobiography` 호출 후 실제 PDF 파일이 생성되는 과정을 확인합니다.
* **Response**: `{ "status": "PROCESSING | COMPLETED | FAILED", "progress": number, "message": "string" }`

### 2.2 최종 완성된 PDF URL 조회
* **Endpoint**: `GET /life-legacy/pdf/:tocId`
* **Description**: 생성이 완료된 PDF 파일의 S3 Presigned URL을 반환합니다.
* **Response**: `{ "pdfUrl": "https://s3...", "createdAt": "ISO_DATE" }`

---

## 3. 사용자 설정 및 프로필 (User Settings)
UI의 마이페이지(`S16`) 기능 연동을 위해 필요합니다.

### 3.1 프로필/아바타 이미지 업로드
* **Endpoint**: `POST /users/me/profile-image`
* **Description**: 유저 본인 또는 대표 아바타 이미지를 저장합니다. (Multipart/form-data)

### 3.2 서비스 알림 설정 수정
* **Endpoint**: `PATCH /users/me/settings/notifications`
* **Description**: 푸시 알림 여부 및 시간 설정을 저장합니다.
* **Request Body**: `{ "reminderEnabled": boolean, "reminderTime": "HH:mm" }`

---

## 4. 아바타 채팅 페르소나 전달 (Proxy 확장)
* **Endpoint**: `POST /api/chat` (기존 수정)
* **Request Body 수정**: AI 서버에 `role_id` (father, mother 등)와 `session_id`를 넘겨줄 수 있도록 필드 추가.
