-- ============================================================
-- kumpark DB Schema
-- ============================================================

-- 회원
CREATE TABLE IF NOT EXISTS members (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(100)  NOT NULL,
  email         VARCHAR(255)  NOT NULL UNIQUE,
  phone         VARCHAR(20),
  password_hash VARCHAR(255)  NOT NULL,
  status        VARCHAR(20)   NOT NULL DEFAULT 'active'
                  CHECK (status IN ('active', 'inactive')),
  memo          TEXT,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- 상품
CREATE TABLE IF NOT EXISTS products (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(200)  NOT NULL,
  category      VARCHAR(100)  NOT NULL,
  type          VARCHAR(50)   NOT NULL,
  price_display VARCHAR(100)  NOT NULL,
  price_amount  INTEGER,
  period        VARCHAR(50)   NOT NULL,
  description   TEXT,
  status        VARCHAR(20)   NOT NULL DEFAULT 'active'
                  CHECK (status IN ('active', 'inactive')),
  sort_order    INTEGER       NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- 주문
CREATE TABLE IF NOT EXISTS orders (
  id             SERIAL PRIMARY KEY,
  order_number   VARCHAR(20)   NOT NULL UNIQUE,
  member_id      INTEGER       NOT NULL REFERENCES members(id)  ON DELETE RESTRICT,
  product_id     INTEGER       NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  amount_display VARCHAR(100)  NOT NULL,
  amount         INTEGER,
  status         VARCHAR(30)   NOT NULL DEFAULT 'paid'
                   CHECK (status IN ('paid', 'consulting', 'in_progress', 'completed', 'cancelled')),
  memo           TEXT,
  created_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- 상담 문의
CREATE TABLE IF NOT EXISTS consultations (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100)  NOT NULL,
  email       VARCHAR(255)  NOT NULL,
  phone       VARCHAR(20),
  subject     VARCHAR(300)  NOT NULL,
  message     TEXT          NOT NULL,
  status      VARCHAR(20)   NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending', 'resolved')),
  admin_memo  TEXT,
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- 관리자
CREATE TABLE IF NOT EXISTS admins (
  id             SERIAL PRIMARY KEY,
  name           VARCHAR(100)  NOT NULL,
  email          VARCHAR(255)  NOT NULL UNIQUE,
  password_hash  VARCHAR(255)  NOT NULL,
  role           VARCHAR(20)   NOT NULL DEFAULT 'admin'
                   CHECK (role IN ('super', 'admin')),
  last_login_at  TIMESTAMPTZ,
  status         VARCHAR(20)   NOT NULL DEFAULT 'active'
                   CHECK (status IN ('active', 'inactive')),
  created_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- 게시판
CREATE TABLE IF NOT EXISTS boards (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100)  NOT NULL,
  slug        VARCHAR(100)  NOT NULL UNIQUE,
  sort_order  INTEGER       NOT NULL DEFAULT 0,
  is_visible  BOOLEAN       NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- 게시물
CREATE TABLE IF NOT EXISTS posts (
  id          SERIAL PRIMARY KEY,
  board_id    INTEGER       NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  author_name VARCHAR(100)  NOT NULL,
  title       VARCHAR(500)  NOT NULL,
  content     TEXT          NOT NULL,
  is_notice   BOOLEAN       NOT NULL DEFAULT FALSE,
  view_count  INTEGER       NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 인덱스
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_members_email          ON members(email);
CREATE INDEX IF NOT EXISTS idx_orders_member_id       ON orders(member_id);
CREATE INDEX IF NOT EXISTS idx_orders_product_id      ON orders(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_status          ON orders(status);
CREATE INDEX IF NOT EXISTS idx_consultations_status   ON consultations(status);
CREATE INDEX IF NOT EXISTS idx_consultations_created  ON consultations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_board_id         ON posts(board_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at       ON posts(created_at DESC);

-- ============================================================
-- updated_at 자동 갱신 트리거
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  CREATE TRIGGER members_updated_at
    BEFORE UPDATE ON members FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER products_updated_at
    BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER orders_updated_at
    BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER consultations_updated_at
    BEFORE UPDATE ON consultations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER admins_updated_at
    BEFORE UPDATE ON admins FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER posts_updated_at
    BEFORE UPDATE ON posts FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
