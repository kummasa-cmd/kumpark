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

    const sql = fs.readFileSync(path.join(__dirname, "enable-rls.sql"), "utf-8");
    await client.query(sql);
    console.log("✅ RLS 활성화 완료");

    const { rows } = await client.query(`
      SELECT relname AS table_name, relrowsecurity AS rls_enabled
      FROM pg_class
      JOIN pg_namespace ON pg_namespace.oid = pg_class.relnamespace
      WHERE pg_namespace.nspname = 'public' AND relkind = 'r'
      ORDER BY relname
    `);
    console.log("\n📋 테이블별 RLS 상태:");
    rows.forEach((r) => console.log(`  - ${r.table_name}: ${r.rls_enabled ? "ON" : "OFF"}`));
  } catch (err) {
    console.error("❌ 실패:", err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
