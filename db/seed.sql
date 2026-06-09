-- ============================================================
-- 초기 데이터 (중복 실행 안전)
-- ============================================================

-- 상품
INSERT INTO products (name, category, type, price_display, price_amount, period, description, sort_order)
VALUES
  ('전자책 그룹 코칭',  '전자책 코칭', '그룹', '₩150,000',    150000, '6주',  '6주 과정으로 기획부터 출간, 마케팅까지 함께합니다. 같은 목표를 가진 동료들과 함께 성장하세요.', 1),
  ('전자책 개인 코칭',  '전자책 코칭', '1:1',  '상담 후 안내', NULL,   '6주',  '1대1 맞춤 코칭으로 나만의 전자책을 완성합니다. 기획, 초고, 퇴고, 출간, 마케팅을 밀착 지원합니다.', 2),
  ('종이책 1대1 코칭', '종이책 코칭', '1:1',  '상담 후 안내', NULL,   '5개월', '꿈꾸던 종이책 출간을 현실로. 주 1회 코치 + 오프라인 4회로 기획에서 투고까지 5개월 밀착 과정입니다.', 3)
ON CONFLICT DO NOTHING;

-- 게시판
INSERT INTO boards (name, slug, sort_order, is_visible)
VALUES
  ('공지사항',    'notice',    1, TRUE),
  ('코칭 후기',   'review',    2, TRUE),
  ('글귀 나눔',   'quotes',    3, TRUE),
  ('자유 게시판', 'free',      4, TRUE),
  ('챌린지',      'challenge', 5, FALSE)
ON CONFLICT (slug) DO NOTHING;

-- 관리자 (비밀번호: admin1234 — 운영 전 반드시 변경)
-- bcrypt hash of 'admin1234' with salt rounds 10
INSERT INTO admins (name, email, password_hash, role)
VALUES (
  '홍성호',
  'kummasa@naver.com',
  '$2b$10$placeholder_change_before_production_xxxxxxxxxxxxxxxxxx',
  'super'
)
ON CONFLICT (email) DO NOTHING;
