require('dotenv').config();

const mysql = require('mysql2/promise');

async function main() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
  });

  const [columns] = await connection.query(`
    SELECT TABLE_NAME, COLUMN_NAME, COLUMN_TYPE, DATA_TYPE, CHARACTER_SET_NAME, COLLATION_NAME, IS_NULLABLE
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = ?
      AND ((TABLE_NAME = 'users' AND COLUMN_NAME = 'uuid')
        OR (TABLE_NAME IN ('autobiography_results', 'life_legacy_answers', 'user_intros') AND COLUMN_NAME = 'user_uuid'))
    ORDER BY TABLE_NAME, COLUMN_NAME
  `, [process.env.DB_DATABASE]);

  await connection.end();
  console.log(JSON.stringify(columns, null, 2));
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
