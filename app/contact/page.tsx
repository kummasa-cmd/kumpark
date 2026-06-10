import type { Metadata } from "next";
import { cookies } from "next/headers";
import pool from "@/lib/db";
import { verifyMemberToken, MEMBER_COOKIE } from "@/lib/member-auth";
import ContactForm from "@/components/contact/ContactForm";

export const metadata: Metadata = {
  title: "무료상담",
  description:
    "코칭 문의, 강의 요청, 협업 제안을 남겨주세요. 평일 1~2 영업일 내에 답변드립니다.",
};

export default async function ContactPage() {
  const token = cookies().get(MEMBER_COOKIE)?.value;
  const me = token ? await verifyMemberToken(token) : null;

  let memberInfo: { name: string; email: string; phone?: string } | undefined;
  if (me) {
    const { rows } = await pool.query(
      "SELECT name, email, phone FROM members WHERE id = $1",
      [me.id]
    );
    if (rows[0]) memberInfo = rows[0];
  }

  return (
    <div className="py-16 sm:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <p className="text-xs font-semibold text-brand-green uppercase tracking-widest mb-3">Contact</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-brand-text mb-4">무료 상담 & 문의</h1>
          <p className="text-brand-muted">
            코칭 문의, 강의 요청, 협업 제안 모두 환영합니다.
            <br />
            평일 기준 1~2 영업일 내에 답변 드립니다.
          </p>
        </div>
        <ContactForm
          memberName={memberInfo?.name}
          memberEmail={memberInfo?.email}
          memberPhone={memberInfo?.phone}
        />
      </div>
    </div>
  );
}
