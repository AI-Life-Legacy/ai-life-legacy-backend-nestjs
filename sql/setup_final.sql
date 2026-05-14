-- viewer_codes 테이블 생성
CREATE TABLE IF NOT EXISTS `viewer_codes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `viewer_code` varchar(6) NOT NULL,
  `author_user_uuid` char(36) NOT NULL,
  `autobiography_result_id` int NOT NULL,
  `pdf_url` text,
  `status` enum('ACTIVE', 'EXPIRED', 'REVOKED') DEFAULT 'ACTIVE',
  `expires_at` timestamp NOT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `UQ_viewer_code` (`viewer_code`),
  CONSTRAINT `FK_viewer_codes_author` FOREIGN KEY (`author_user_uuid`) REFERENCES `users` (`uuid`) ON DELETE CASCADE,
  CONSTRAINT `FK_viewer_codes_result` FOREIGN KEY (`autobiography_result_id`) REFERENCES `autobiography_results` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- user_withdrawals 테이블 스키마 보정 (user_uuid 컬럼 추가)
-- TypeORM synchronize:false 환경에서 수동 반영용
ALTER TABLE `user_withdrawals` ADD COLUMN IF NOT EXISTS `user_uuid` char(36) NOT NULL AFTER `id`;

-- 기존 외래 키 제약 조건 CASCADE 확인 및 설정 (회원 탈퇴 시 관련 데이터 연쇄 삭제용)
-- 아래 구문들은 이미 제약 조건이 있는 경우 에러가 날 수 있으므로, 
-- 실제 환경에 맞춰 제약 조건 이름을 확인하거나 수동으로 실행 권장

-- auth_identities (user_uuid -> users.uuid)
ALTER TABLE `auth_identities` DROP FOREIGN KEY IF EXISTS `FK_auth_identities_user`;
ALTER TABLE `auth_identities` ADD CONSTRAINT `FK_auth_identities_user` FOREIGN KEY (`user_uuid`) REFERENCES `users` (`uuid`) ON DELETE CASCADE;

-- refresh_tokens (user_uuid -> users.uuid)
ALTER TABLE `refresh_tokens` DROP FOREIGN KEY IF EXISTS `FK_refresh_tokens_user`;
ALTER TABLE `refresh_tokens` ADD CONSTRAINT `FK_refresh_tokens_user` FOREIGN KEY (`user_uuid`) REFERENCES `users` (`uuid`) ON DELETE CASCADE;

-- life_legacy_answers (user_uuid -> users.uuid)
ALTER TABLE `life_legacy_answers` DROP FOREIGN KEY IF EXISTS `FK_life_legacy_answers_user`;
ALTER TABLE `life_legacy_answers` ADD CONSTRAINT `FK_life_legacy_answers_user` FOREIGN KEY (`user_uuid`) REFERENCES `users` (`uuid`) ON DELETE CASCADE;

-- user_intros (user_uuid -> users.uuid)
ALTER TABLE `user_intros` DROP FOREIGN KEY IF EXISTS `FK_user_intros_user`;
ALTER TABLE `user_intros` ADD CONSTRAINT `FK_user_intros_user` FOREIGN KEY (`user_uuid`) REFERENCES `users` (`uuid`) ON DELETE CASCADE;

-- autobiography_results (user_uuid -> users.uuid)
ALTER TABLE `autobiography_results` DROP FOREIGN KEY IF EXISTS `FK_autobiography_results_user`;
ALTER TABLE `autobiography_results` ADD CONSTRAINT `FK_autobiography_results_user` FOREIGN KEY (`user_uuid`) REFERENCES `users` (`uuid`) ON DELETE CASCADE;
