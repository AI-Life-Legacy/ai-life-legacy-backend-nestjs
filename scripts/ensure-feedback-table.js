require('dotenv').config();

const mysql = require('mysql2/promise');

function buildSql(userUuidType) {
  return `
CREATE TABLE IF NOT EXISTS autobiography_feedbacks (
  id int NOT NULL AUTO_INCREMENT,
  user_uuid ${userUuidType} NOT NULL,
  autobiography_result_id int NULL,
  rating tinyint NOT NULL,
  feedback_tags text NULL,
  comment text NULL,
  wants_regeneration tinyint(1) NOT NULL DEFAULT 0,
  created_at datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  KEY IDX_autobiography_feedbacks_user_uuid (user_uuid),
  KEY IDX_autobiography_feedbacks_result_id (autobiography_result_id),
  CONSTRAINT FK_autobiography_feedbacks_user FOREIGN KEY (user_uuid) REFERENCES users (uuid) ON DELETE CASCADE,
  CONSTRAINT FK_autobiography_feedbacks_result FOREIGN KEY (autobiography_result_id) REFERENCES autobiography_results (id) ON DELETE SET NULL,
  CONSTRAINT CHK_autobiography_feedbacks_rating CHECK (rating BETWEEN 1 AND 5)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
`;
}

async function main() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
  });

  const [columns] = await connection.query("SHOW COLUMNS FROM users LIKE 'uuid'");
  const userUuidType = columns[0]?.Type || 'varchar(36)';

  await connection.execute(buildSql(userUuidType));
  const [rows] = await connection.query("SHOW TABLES LIKE 'autobiography_feedbacks'");
  await connection.end();

  console.log(JSON.stringify({ created: rows.length > 0, userUuidType }));
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
