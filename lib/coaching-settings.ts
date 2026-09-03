import pool from "./db";

export type BookType = "ebook" | "paper";

export const COACHING_SETTINGS_DEFAULTS: Record<string, string> = {
  coaching_ebook_duration: "6주",
  coaching_ebook_price_regular: "0",
  coaching_ebook_price_event: "0",
  coaching_ebook_event_active: "N",
  coaching_paper_duration: "5개월",
  coaching_paper_price_regular: "0",
  coaching_paper_price_event: "0",
  coaching_paper_event_active: "N",
  coaching_deposit_bank: "기업은행",
  coaching_deposit_account: "137-111779-04-013",
  coaching_deposit_holder: "모즈나인",
};

export async function ensureCoachingSettingsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS site_settings (
      key        VARCHAR(100) PRIMARY KEY,
      value      TEXT         NOT NULL DEFAULT '',
      updated_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
    )
  `);
  await pool.query(`ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY`);

  for (const [key, value] of Object.entries(COACHING_SETTINGS_DEFAULTS)) {
    await pool.query(
      `INSERT INTO site_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO NOTHING`,
      [key, value]
    );
  }
}

export async function getCoachingSettings(): Promise<Record<string, string>> {
  await ensureCoachingSettingsTable();
  const { rows } = await pool.query(
    `SELECT key, value FROM site_settings WHERE key = ANY($1)`,
    [Object.keys(COACHING_SETTINGS_DEFAULTS)]
  );
  const settings: Record<string, string> = {};
  for (const row of rows) settings[row.key] = row.value;
  return { ...COACHING_SETTINGS_DEFAULTS, ...settings };
}

/** 설정값 기준 코칭 유형의 현재 적용 금액(이벤트가 켜져 있으면 이벤트가, 아니면 평상시 가격)을 계산 */
export function getEffectivePrice(bookType: BookType, settings: Record<string, string>): number {
  const eventActive = settings[`coaching_${bookType}_event_active`] === "Y";
  const raw = eventActive
    ? settings[`coaching_${bookType}_price_event`]
    : settings[`coaching_${bookType}_price_regular`];
  return parseInt(raw, 10) || 0;
}

export function getCoachingDuration(bookType: BookType, settings: Record<string, string>): string {
  return settings[`coaching_${bookType}_duration`] || "";
}

export interface DepositAccount {
  bank: string;
  account: string;
  holder: string;
}

export function getDepositAccount(settings: Record<string, string>): DepositAccount {
  return {
    bank: settings.coaching_deposit_bank || "",
    account: settings.coaching_deposit_account || "",
    holder: settings.coaching_deposit_holder || "",
  };
}
