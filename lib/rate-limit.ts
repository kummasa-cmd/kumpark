import pool from "./db";

// 인증 관련 요청 시도 기록 (무차별 대입·메일 폭탄 방지)
let tableReady = false;

async function ensureAttemptsTable() {
  if (tableReady) return;
  await pool.query(`
    CREATE TABLE IF NOT EXISTS auth_attempts (
      id         BIGSERIAL PRIMARY KEY,
      scope      VARCHAR(40)  NOT NULL,
      key        VARCHAR(255) NOT NULL,
      created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
    )
  `);
  await pool.query(
    `CREATE INDEX IF NOT EXISTS idx_auth_attempts_lookup ON auth_attempts(scope, key, created_at DESC)`
  );
  await pool.query(`ALTER TABLE auth_attempts ENABLE ROW LEVEL SECURITY`);
  tableReady = true;
}

export function getClientIp(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

export type Limit = { scope: string; key: string; max: number; windowMinutes: number };

// 하나라도 한도를 넘으면 true
export async function isLimited(limits: Limit[]) {
  await ensureAttemptsTable();
  for (const l of limits) {
    const { rows } = await pool.query<{ cnt: number }>(
      `SELECT COUNT(*)::int AS cnt FROM auth_attempts
       WHERE scope = $1 AND key = $2 AND created_at > NOW() - make_interval(mins => $3)`,
      [l.scope, l.key.toLowerCase(), l.windowMinutes]
    );
    if (rows[0].cnt >= l.max) return true;
  }
  return false;
}

export async function recordAttempt(entries: { scope: string; key: string }[]) {
  await ensureAttemptsTable();
  for (const e of entries) {
    await pool.query(`INSERT INTO auth_attempts (scope, key) VALUES ($1, $2)`, [
      e.scope,
      e.key.toLowerCase(),
    ]);
  }
  // 오래된 기록 정리 (약 1% 확률로 실행)
  if (Math.random() < 0.01) {
    await pool.query(`DELETE FROM auth_attempts WHERE created_at < NOW() - INTERVAL '1 day'`);
  }
}

export async function clearAttempts(scope: string, key: string) {
  await ensureAttemptsTable();
  await pool.query(`DELETE FROM auth_attempts WHERE scope = $1 AND key = $2`, [scope, key.toLowerCase()]);
}

export const TOO_MANY = "시도 횟수가 너무 많습니다. 잠시 후 다시 시도해 주세요.";
