// 미확인 쪽지 알림 중복 방지용 sessionStorage 키 (회원/관리자 구분)
export const MEMBER_ALERT_KEY = "kumpark_member_unread_alerted";
export const ADMIN_ALERT_KEY = "kumpark_admin_unread_alerted";

// 로그인 직후 호출 — 새 로그인마다 미확인 쪽지 알림을 다시 띄우기 위해 기록 초기화
export function resetUnreadAlert(storageKey: string) {
  try {
    sessionStorage.removeItem(storageKey);
  } catch {
    // ignore
  }
}
