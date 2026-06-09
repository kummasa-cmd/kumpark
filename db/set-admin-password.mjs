import pg from "pg";
import bcrypt from "bcryptjs";

const { Pool } = pg;

const password = process.argv[2];
const email = process.argv[3] ?? "kummasa@naver.com";

if (!password) {
  console.error("사용법: npm run db:set-password <비밀번호> [이메일]");
  process.exit(1);
}

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL 환경변수가 없습니다.");
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const hash = await bcrypt.hash(password, 10);

const { rowCount } = await pool.query(
  "UPDATE admins SET password_hash = $1 WHERE email = $2",
  [hash, email]
);

if (rowCount === 0) {
  console.error(`❌ 관리자 계정을 찾을 수 없습니다: ${email}`);
} else {
  console.log(`✅ 비밀번호 변경 완료 (${email})`);
}

await pool.end();
