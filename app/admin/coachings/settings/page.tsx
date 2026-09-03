import type { Metadata } from "next";
import CoachingSettingsForm from "@/components/admin/CoachingSettingsForm";

export const metadata: Metadata = { title: "코칭설정" };

export default function CoachingSettingsPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">코칭설정</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          전자책/종이책 코칭 상품의 기간과 금액을 관리합니다. 회원이 코칭을 신청하면 여기서 설정한 금액이 자동으로 적용됩니다.
        </p>
      </div>
      <CoachingSettingsForm />
    </div>
  );
}
