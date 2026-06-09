import pg from "pg";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL 환경변수가 없습니다.");
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function run() {
  const client = await pool.connect();
  try {
    console.log("🔗 DB 연결 성공");

    const schema = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf-8");
    await client.query(schema);
    console.log("✅ 스키마 생성 완료");

    const seed = fs.readFileSync(path.join(__dirname, "seed.sql"), "utf-8");
    await client.query(seed);
    console.log("✅ 시드 데이터 삽입 완료");

    // 생성된 테이블 목록 출력
    const { rows } = await client.query(`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY tablename
    `);
    console.log("\n📋 생성된 테이블:");
    rows.forEach((r) => console.log("  -", r.tablename));
  } catch (err) {
    console.error("❌ 마이그레이션 실패:", err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
