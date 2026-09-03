import pool from "./db";

export async function ensureMemberColumns() {
  await pool.query(`ALTER TABLE members ADD COLUMN IF NOT EXISTS nickname VARCHAR(100) NOT NULL DEFAULT ''`);
  await pool.query(`ALTER TABLE members ADD COLUMN IF NOT EXISTS blog_url VARCHAR(500)`);
  await pool.query(`ALTER TABLE members ADD COLUMN IF NOT EXISTS threads_url VARCHAR(500)`);
  await pool.query(`ALTER TABLE members ADD COLUMN IF NOT EXISTS instagram_url VARCHAR(500)`);
  await pool.query(`ALTER TABLE members ADD COLUMN IF NOT EXISTS x_url VARCHAR(500)`);
  await pool.query(`ALTER TABLE members ADD COLUMN IF NOT EXISTS brunch_url VARCHAR(500)`);
  await pool.query(`ALTER TABLE members ADD COLUMN IF NOT EXISTS youtube_url VARCHAR(500)`);
  await pool.query(`ALTER TABLE members ADD COLUMN IF NOT EXISTS homepage_url VARCHAR(500)`);
  await pool.query(`ALTER TABLE members ADD COLUMN IF NOT EXISTS sms_yn CHAR(1) NOT NULL DEFAULT 'Y'`);
  await pool.query(`ALTER TABLE members ADD COLUMN IF NOT EXISTS email_yn CHAR(1) NOT NULL DEFAULT 'Y'`);
  await pool.query(`ALTER TABLE members ADD COLUMN IF NOT EXISTS coaching_yn CHAR(1) NOT NULL DEFAULT 'N'`);
}

export async function ensurePostMemberCol() {
  await pool.query(
    `ALTER TABLE posts ADD COLUMN IF NOT EXISTS member_id INTEGER REFERENCES members(id) ON DELETE SET NULL`
  );
}

export async function ensureMemberTables() {
  // consultations에 member_id 연결
  await pool.query(
    `ALTER TABLE consultations ADD COLUMN IF NOT EXISTS member_id INTEGER REFERENCES members(id) ON DELETE SET NULL`
  );
  await pool.query(`ALTER TABLE consultations ADD COLUMN IF NOT EXISTS reply TEXT`);
  await pool.query(`ALTER TABLE consultations ADD COLUMN IF NOT EXISTS replied_at TIMESTAMPTZ`);
  await pool.query(`ALTER TABLE consultations ADD COLUMN IF NOT EXISTS memo TEXT`);
  // 1대1 문의 전용 테이블
  await pool.query(`
    CREATE TABLE IF NOT EXISTS member_inquiries (
      id         SERIAL PRIMARY KEY,
      member_id  INTEGER NOT NULL REFERENCES members(id) ON DELETE CASCADE,
      subject    VARCHAR(200) NOT NULL,
      message    TEXT NOT NULL,
      status     VARCHAR(20) NOT NULL DEFAULT 'pending',
      reply      TEXT,
      replied_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ
    )
  `);
  await pool.query(`ALTER TABLE member_inquiries ENABLE ROW LEVEL SECURITY`);
}

export async function ensureInquiryCategory() {
  await pool.query(
    `ALTER TABLE member_inquiries ADD COLUMN IF NOT EXISTS category VARCHAR(100)`
  );
}

export async function ensurePostAdminReply() {
  await pool.query(`ALTER TABLE posts ADD COLUMN IF NOT EXISTS admin_reply TEXT`);
  await pool.query(`ALTER TABLE posts ADD COLUMN IF NOT EXISTS admin_replied_at TIMESTAMPTZ`);
}

export async function ensureCoachingTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS coachings (
      id            SERIAL PRIMARY KEY,
      member_id     INTEGER NOT NULL REFERENCES members(id),
      book_type     VARCHAR(10) NOT NULL,
      category      VARCHAR(15) NOT NULL,
      product_name  VARCHAR(200) NOT NULL,
      amount        BIGINT NOT NULL DEFAULT 0,
      start_date    DATE,
      end_date      DATE,
      session_count INTEGER NOT NULL DEFAULT 0,
      status        VARCHAR(20) NOT NULL DEFAULT 'pending',
      created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await pool.query(
    `ALTER TABLE coachings ADD COLUMN IF NOT EXISTS completed_count INTEGER NOT NULL DEFAULT 0`
  );
  // 회원 신청 시 입력하는 정보 (관리자가 수동 등록하는 코칭에는 비어 있을 수 있음)
  await pool.query(`ALTER TABLE coachings ADD COLUMN IF NOT EXISTS desired_start_date DATE`);
  await pool.query(`ALTER TABLE coachings ADD COLUMN IF NOT EXISTS depositor_bank VARCHAR(100)`);
  await pool.query(`ALTER TABLE coachings ADD COLUMN IF NOT EXISTS depositor_account VARCHAR(100)`);
  await pool.query(`ALTER TABLE coachings ADD COLUMN IF NOT EXISTS depositor_name VARCHAR(100)`);
  await pool.query(`ALTER TABLE coachings ADD COLUMN IF NOT EXISTS deposit_due_date DATE`);
  await pool.query(`ALTER TABLE coachings ENABLE ROW LEVEL SECURITY`);
}

export async function ensureCoachingScheduleTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS coaching_schedules (
      id                SERIAL PRIMARY KEY,
      coaching_id       INTEGER NOT NULL REFERENCES coachings(id) ON DELETE CASCADE,
      member_id         INTEGER NOT NULL REFERENCES members(id) ON DELETE CASCADE,
      session_date      DATE NOT NULL,
      session_time      VARCHAR(5) NOT NULL,
      member_memo       TEXT,
      admin_memo        TEXT,
      status            VARCHAR(20) NOT NULL DEFAULT 'pending',
      reminder_sent_at  TIMESTAMPTZ,
      decided_at        TIMESTAMPTZ,
      created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await pool.query(
    `CREATE INDEX IF NOT EXISTS idx_coaching_schedules_coaching_id ON coaching_schedules(coaching_id)`
  );
  await pool.query(
    `CREATE INDEX IF NOT EXISTS idx_coaching_schedules_member_id ON coaching_schedules(member_id)`
  );
  await pool.query(
    `CREATE INDEX IF NOT EXISTS idx_coaching_schedules_session_date ON coaching_schedules(session_date)`
  );
  await pool.query(`ALTER TABLE coaching_schedules ENABLE ROW LEVEL SECURITY`);
}

/** 코칭종료일이 지난 코칭중 항목을 코칭종료 상태로 자동 전환 */
export async function autoCompleteCoachings() {
  await pool.query(`
    UPDATE coachings SET status = 'completed', updated_at = NOW()
    WHERE status = 'in_progress' AND end_date IS NOT NULL AND end_date < CURRENT_DATE
  `);
}

export async function ensureCategoryTables() {
  await pool.query(
    `ALTER TABLE boards ADD COLUMN IF NOT EXISTS user_writable BOOLEAN NOT NULL DEFAULT TRUE`
  );
  await pool.query(
    `ALTER TABLE boards ADD COLUMN IF NOT EXISTS use_category BOOLEAN NOT NULL DEFAULT FALSE`
  );
  await pool.query(
    `ALTER TABLE boards ADD COLUMN IF NOT EXISTS use_comment BOOLEAN NOT NULL DEFAULT FALSE`
  );
  await pool.query(
    `ALTER TABLE boards ADD COLUMN IF NOT EXISTS board_type VARCHAR(10) NOT NULL DEFAULT 'general'`
  );
  await pool.query(`
    CREATE TABLE IF NOT EXISTS board_categories (
      id         SERIAL PRIMARY KEY,
      board_id   INTEGER NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
      name       VARCHAR(100) NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await pool.query(`ALTER TABLE board_categories ENABLE ROW LEVEL SECURITY`);
  await pool.query(`
    ALTER TABLE posts
    ADD COLUMN IF NOT EXISTS category_id INTEGER REFERENCES board_categories(id) ON DELETE SET NULL
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS comments (
      id          SERIAL PRIMARY KEY,
      post_id     INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
      parent_id   INTEGER REFERENCES comments(id) ON DELETE CASCADE,
      author_name VARCHAR(100) NOT NULL,
      author_type VARCHAR(10)  NOT NULL DEFAULT 'admin',
      author_id   INTEGER,
      content     TEXT NOT NULL,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at  TIMESTAMPTZ
    )
  `);
  await pool.query(`ALTER TABLE comments ENABLE ROW LEVEL SECURITY`);
}

export async function ensureCoachingBoard() {
  await pool.query(`
    INSERT INTO boards (name, slug, board_type, user_writable, use_comment, use_category, is_visible, sort_order)
    SELECT '코칭 게시판', 'coaching', 'personal', TRUE, TRUE, FALSE, TRUE,
           COALESCE((SELECT MAX(sort_order) FROM boards), 0) + 1
    WHERE NOT EXISTS (SELECT 1 FROM boards WHERE slug = 'coaching')
  `);
}
