import type { Metadata } from "next";
import SiteMainForm from "@/components/admin/SiteMainForm";

export const metadata: Metadata = { title: "메인관리" };

export default function SiteMainPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">메인관리</h1>
        <p className="text-sm text-gray-500 mt-0.5">메인 페이지의 노출 콘텐츠를 관리합니다.</p>
      </div>
      <SiteMainForm />
    </div>
  );
}
