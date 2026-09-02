import nodemailer from "nodemailer";

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST ?? "smtp.naver.com",
    port: Number(process.env.SMTP_PORT ?? 465),
    secure: Number(process.env.SMTP_PORT ?? 465) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: { rejectUnauthorized: false },
  });
}

export interface ConsultationMailData {
  name: string;
  email: string;
  phone?: string | null;
  subject: string;
  message: string;
  submittedAt: string;
}

export async function sendConsultationAlert(data: ConsultationMailData) {
  const adminEmail = process.env.ADMIN_EMAIL ?? "kummasa@naver.com";
  const from = process.env.SMTP_FROM ?? process.env.SMTP_USER;

  await createTransporter().sendMail({
    from: `"검파크 알림" <${from}>`,
    to: adminEmail,
    subject: `[검파크] 새 상담 문의 — ${data.subject}`,
    html: `
<!DOCTYPE html>
<html lang="ko">
<head><meta charset="UTF-8"></head>
<body style="font-family:'Apple SD Gothic Neo','맑은 고딕',sans-serif;background:#f9fafb;margin:0;padding:24px;">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
    <div style="background:#0B7903;padding:24px 28px;">
      <p style="margin:0;color:#fff;font-size:20px;font-weight:700;">📬 새 상담 문의가 접수됐습니다</p>
      <p style="margin:4px 0 0;color:#bbf7d0;font-size:13px;">${data.submittedAt}</p>
    </div>
    <div style="padding:28px;">
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <tr>
          <td style="padding:8px 0;color:#6b7280;width:90px;vertical-align:top;">이름</td>
          <td style="padding:8px 0;color:#111827;font-weight:600;">${escHtml(data.name)}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:#6b7280;vertical-align:top;">이메일</td>
          <td style="padding:8px 0;color:#111827;">
            <a href="mailto:${escHtml(data.email)}" style="color:#0B7903;">${escHtml(data.email)}</a>
          </td>
        </tr>
        ${data.phone ? `
        <tr>
          <td style="padding:8px 0;color:#6b7280;vertical-align:top;">연락처</td>
          <td style="padding:8px 0;color:#111827;">${escHtml(data.phone)}</td>
        </tr>` : ""}
        <tr>
          <td style="padding:8px 0;color:#6b7280;vertical-align:top;">제목</td>
          <td style="padding:8px 0;color:#111827;font-weight:600;">${escHtml(data.subject)}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:#6b7280;vertical-align:top;">내용</td>
          <td style="padding:8px 0;color:#374151;line-height:1.7;white-space:pre-wrap;">${escHtml(data.message)}</td>
        </tr>
      </table>
    </div>
    <div style="padding:0 28px 28px;">
      <a href="${process.env.NEXT_PUBLIC_SITE_URL ?? "https://kumpark.com"}/admin/consultations"
         style="display:inline-block;background:#0B7903;color:#fff;font-size:13px;font-weight:600;padding:10px 20px;border-radius:8px;text-decoration:none;">
        관리자 페이지에서 확인하기 →
      </a>
    </div>
    <div style="background:#f9fafb;padding:16px 28px;border-top:1px solid #e5e7eb;">
      <p style="margin:0;font-size:11px;color:#9ca3af;">
        이 메일은 kumpark.com 무료상담 폼 제출 시 자동 발송됩니다.
      </p>
    </div>
  </div>
</body>
</html>`,
    text: `새 상담 문의\n\n이름: ${data.name}\n이메일: ${data.email}\n연락처: ${data.phone ?? "-"}\n제목: ${data.subject}\n\n내용:\n${data.message}`,
  });
}

export interface ConsultationReplyData {
  toName: string;
  toEmail: string;
  subject: string;
  reply: string;
}

export async function sendConsultationReply(data: ConsultationReplyData) {
  const from = process.env.SMTP_FROM ?? process.env.SMTP_USER;

  await createTransporter().sendMail({
    from: `"검파크 홍성호" <${from}>`,
    to: data.toEmail,
    subject: `Re: [검파크] ${data.subject}`,
    html: `
<!DOCTYPE html>
<html lang="ko">
<head><meta charset="UTF-8"></head>
<body style="font-family:'Apple SD Gothic Neo','맑은 고딕',sans-serif;background:#f9fafb;margin:0;padding:24px;">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
    <div style="background:#0B7903;padding:24px 28px;">
      <p style="margin:0;color:#fff;font-size:18px;font-weight:700;">검파크 상담 답변</p>
      <p style="margin:4px 0 0;color:#bbf7d0;font-size:13px;">문의하신 내용에 대한 답변입니다.</p>
    </div>
    <div style="padding:28px;">
      <p style="margin:0 0 16px;font-size:14px;color:#374151;">
        안녕하세요, <strong>${escHtml(data.toName)}</strong>님.<br>
        검파크 홍성호 코치입니다. 문의해 주셔서 감사합니다.
      </p>
      <div style="background:#f0fdf4;border-left:3px solid #0B7903;padding:16px;border-radius:0 8px 8px 0;margin-bottom:20px;">
        <p style="margin:0 0 6px;font-size:11px;font-weight:600;color:#0B7903;text-transform:uppercase;letter-spacing:.5px;">답변</p>
        <p style="margin:0;font-size:14px;color:#374151;line-height:1.75;white-space:pre-wrap;">${escHtml(data.reply)}</p>
      </div>
      <p style="margin:0;font-size:13px;color:#6b7280;">
        추가 문의 사항이 있으시면 언제든지 연락 주세요.<br>
        <a href="mailto:kummasa@naver.com" style="color:#0B7903;">kummasa@naver.com</a> · 010-6258-6933
      </p>
    </div>
    <div style="background:#f9fafb;padding:16px 28px;border-top:1px solid #e5e7eb;">
      <p style="margin:0;font-size:11px;color:#9ca3af;">
        kumpark | 기록이 모여 브랜드가 되는 공간<br>
        서울시 금천구 범안로 1130. 3층 302호 (가산동, 디지털 엠파이어 빌딩)
      </p>
    </div>
  </div>
</body>
</html>`,
    text: `${data.toName}님, 안녕하세요.\n검파크 홍성호 코치입니다.\n\n[답변]\n${data.reply}\n\n추가 문의: kummasa@naver.com / 010-6258-6933`,
  });
}

export interface CoachingPostMailData {
  memberName: string;
  title: string;
  content: string;
  postId: number;
  submittedAt: string;
}

export async function sendCoachingPostAlert(data: CoachingPostMailData) {
  const adminEmail = process.env.ADMIN_EMAIL ?? "kummasa@naver.com";
  const from = process.env.SMTP_FROM ?? process.env.SMTP_USER;

  await createTransporter().sendMail({
    from: `"검파크 알림" <${from}>`,
    to: adminEmail,
    subject: `[검파크] 코칭 게시판 새 글 — ${data.title}`,
    html: `
<!DOCTYPE html>
<html lang="ko">
<head><meta charset="UTF-8"></head>
<body style="font-family:'Apple SD Gothic Neo','맑은 고딕',sans-serif;background:#f9fafb;margin:0;padding:24px;">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
    <div style="background:#0B7903;padding:24px 28px;">
      <p style="margin:0;color:#fff;font-size:20px;font-weight:700;">📬 코칭 게시판에 새 글이 등록됐습니다</p>
      <p style="margin:4px 0 0;color:#bbf7d0;font-size:13px;">${data.submittedAt}</p>
    </div>
    <div style="padding:28px;">
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <tr>
          <td style="padding:8px 0;color:#6b7280;width:90px;vertical-align:top;">작성자</td>
          <td style="padding:8px 0;color:#111827;font-weight:600;">${escHtml(data.memberName)}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:#6b7280;vertical-align:top;">제목</td>
          <td style="padding:8px 0;color:#111827;font-weight:600;">${escHtml(data.title)}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:#6b7280;vertical-align:top;">내용</td>
          <td style="padding:8px 0;color:#374151;line-height:1.7;">${data.content}</td>
        </tr>
      </table>
    </div>
    <div style="padding:0 28px 28px;">
      <a href="${process.env.NEXT_PUBLIC_SITE_URL ?? "https://kumpark.com"}/admin/coachings/board"
         style="display:inline-block;background:#0B7903;color:#fff;font-size:13px;font-weight:600;padding:10px 20px;border-radius:8px;text-decoration:none;">
        관리자 페이지에서 확인하기 →
      </a>
    </div>
    <div style="background:#f9fafb;padding:16px 28px;border-top:1px solid #e5e7eb;">
      <p style="margin:0;font-size:11px;color:#9ca3af;">
        이 메일은 kumpark.com 코칭 게시판 글 등록 시 자동 발송됩니다.
      </p>
    </div>
  </div>
</body>
</html>`,
    text: `코칭 게시판 새 글\n\n작성자: ${data.memberName}\n제목: ${data.title}\n\n관리자 페이지에서 확인: ${process.env.NEXT_PUBLIC_SITE_URL ?? "https://kumpark.com"}/admin/coachings/board`,
  });
}

export interface ScheduleMailData {
  memberName: string;
  memberEmail: string;
  productName: string;
  sessionDate: string;
  sessionTime: string;
  memo?: string | null;
}

function scheduleMailShell(headerTitle: string, headerSubtitle: string, bodyHtml: string) {
  return `
<!DOCTYPE html>
<html lang="ko">
<head><meta charset="UTF-8"></head>
<body style="font-family:'Apple SD Gothic Neo','맑은 고딕',sans-serif;background:#f9fafb;margin:0;padding:24px;">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
    <div style="background:#0B7903;padding:24px 28px;">
      <p style="margin:0;color:#fff;font-size:18px;font-weight:700;">${headerTitle}</p>
      <p style="margin:4px 0 0;color:#bbf7d0;font-size:13px;">${headerSubtitle}</p>
    </div>
    <div style="padding:28px;">${bodyHtml}</div>
    <div style="background:#f9fafb;padding:16px 28px;border-top:1px solid #e5e7eb;">
      <p style="margin:0;font-size:11px;color:#9ca3af;">
        kumpark | 기록이 모여 브랜드가 되는 공간<br>
        서울시 금천구 범안로 1130. 3층 302호 (가산동, 디지털 엠파이어 빌딩)
      </p>
    </div>
  </div>
</body>
</html>`;
}

function scheduleInfoTable(data: ScheduleMailData, extraRows = "") {
  return `
    <table style="width:100%;border-collapse:collapse;font-size:14px;">
      <tr>
        <td style="padding:8px 0;color:#6b7280;width:90px;vertical-align:top;">회원</td>
        <td style="padding:8px 0;color:#111827;font-weight:600;">${escHtml(data.memberName)}</td>
      </tr>
      <tr>
        <td style="padding:8px 0;color:#6b7280;vertical-align:top;">코칭 상품</td>
        <td style="padding:8px 0;color:#111827;">${escHtml(data.productName)}</td>
      </tr>
      <tr>
        <td style="padding:8px 0;color:#6b7280;vertical-align:top;">신청 일시</td>
        <td style="padding:8px 0;color:#111827;font-weight:600;">${escHtml(data.sessionDate)} ${escHtml(data.sessionTime)}</td>
      </tr>
      ${extraRows}
    </table>`;
}

export async function sendScheduleAppliedMail(data: ScheduleMailData) {
  const adminEmail = process.env.ADMIN_EMAIL ?? "kummasa@naver.com";
  const from = process.env.SMTP_FROM ?? process.env.SMTP_USER;
  const transporter = createTransporter();

  const memoRow = data.memo
    ? `<tr>
         <td style="padding:8px 0;color:#6b7280;vertical-align:top;">요청사항</td>
         <td style="padding:8px 0;color:#374151;line-height:1.7;white-space:pre-wrap;">${escHtml(data.memo)}</td>
       </tr>`
    : "";

  await transporter.sendMail({
    from: `"검파크 알림" <${from}>`,
    to: data.memberEmail,
    subject: `[검파크] 코칭 일정 신청이 접수됐습니다`,
    html: scheduleMailShell(
      "📅 코칭 일정 신청이 접수됐습니다",
      "관리자 확인 후 확정/반려 결과를 다시 안내드립니다.",
      scheduleInfoTable(data, memoRow)
    ),
    text: `코칭 일정 신청이 접수됐습니다.\n\n코칭 상품: ${data.productName}\n신청 일시: ${data.sessionDate} ${data.sessionTime}${data.memo ? `\n요청사항: ${data.memo}` : ""}`,
  });

  await transporter.sendMail({
    from: `"검파크 알림" <${from}>`,
    to: adminEmail,
    subject: `[검파크] 새 코칭 일정 신청 — ${data.memberName}`,
    html: scheduleMailShell(
      "📬 새 코칭 일정 신청이 접수됐습니다",
      "관리페이지 > 코칭관리 > 코칭일정에서 확정/반려 처리해 주세요.",
      scheduleInfoTable(data, memoRow)
    ),
    text: `새 코칭 일정 신청\n\n회원: ${data.memberName}\n코칭 상품: ${data.productName}\n신청 일시: ${data.sessionDate} ${data.sessionTime}${data.memo ? `\n요청사항: ${data.memo}` : ""}`,
  });
}

export async function sendScheduleDecisionMail(
  status: "confirmed" | "rejected",
  data: ScheduleMailData
) {
  const adminEmail = process.env.ADMIN_EMAIL ?? "kummasa@naver.com";
  const from = process.env.SMTP_FROM ?? process.env.SMTP_USER;
  const transporter = createTransporter();

  const isConfirmed = status === "confirmed";
  const label = isConfirmed ? "확정" : "반려";

  const memoRow = data.memo
    ? `<tr>
         <td style="padding:8px 0;color:#6b7280;vertical-align:top;">관리자 메모</td>
         <td style="padding:8px 0;color:#374151;line-height:1.7;white-space:pre-wrap;">${escHtml(data.memo)}</td>
       </tr>`
    : "";

  await transporter.sendMail({
    from: `"검파크 홍성호" <${from}>`,
    to: data.memberEmail,
    subject: `[검파크] 코칭 일정이 ${label}됐습니다`,
    html: scheduleMailShell(
      isConfirmed ? `✅ 코칭 일정이 확정됐습니다` : `코칭 일정이 반려됐습니다`,
      `${escHtml(data.memberName)}님, 신청하신 코칭 일정 처리 결과를 안내드립니다.`,
      scheduleInfoTable(data, memoRow)
    ),
    text: `코칭 일정이 ${label}됐습니다.\n\n코칭 상품: ${data.productName}\n신청 일시: ${data.sessionDate} ${data.sessionTime}${data.memo ? `\n관리자 메모: ${data.memo}` : ""}`,
  });

  await transporter.sendMail({
    from: `"검파크 알림" <${from}>`,
    to: adminEmail,
    subject: `[검파크] 코칭 일정 ${label} 처리 완료 — ${data.memberName}`,
    html: scheduleMailShell(
      `코칭 일정을 ${label} 처리했습니다`,
      `회원에게 처리 결과 메일이 발송됐습니다.`,
      scheduleInfoTable(data, memoRow)
    ),
    text: `코칭 일정 ${label} 처리 완료\n\n회원: ${data.memberName}\n코칭 상품: ${data.productName}\n신청 일시: ${data.sessionDate} ${data.sessionTime}`,
  });
}

export async function sendScheduleReminderMail(data: ScheduleMailData) {
  const from = process.env.SMTP_FROM ?? process.env.SMTP_USER;

  await createTransporter().sendMail({
    from: `"검파크 알림" <${from}>`,
    to: data.memberEmail,
    subject: `[검파크] 내일 코칭 일정이 있습니다`,
    html: scheduleMailShell(
      "⏰ 내일 코칭 일정이 있습니다",
      `${escHtml(data.memberName)}님, 예정된 코칭 일정을 안내드립니다.`,
      scheduleInfoTable(data)
    ),
    text: `내일 코칭 일정이 있습니다.\n\n코칭 상품: ${data.productName}\n일시: ${data.sessionDate} ${data.sessionTime}`,
  });
}

function escHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
