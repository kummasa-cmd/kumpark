import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import AdminForm from "@/components/admin/AdminForm";

export const metadata: Metadata = { title: "관리자 추가" };

export default function AdminNewPage() {
  return (
    <div className="space-y-5">
      <div>
        <Link
          href="/admin/site/admins"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-3"
        >
          <ChevronLeft size={15} /> 관리자 목록
        </Link>
        <h1 className="text-xl font-bold text-gray-900">관리자 추가</h1>
        <p className="text-sm text-gray-500 mt-0.5">새 관리자 계정을 등록합니다.</p>
      </div>
      <AdminForm />
    </div>
  );
}
