import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import MemberForm from "@/components/admin/MemberForm";

export const metadata: Metadata = { title: "회원등록" };

export default function MemberNewPage() {
  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <Link
          href="/admin/members"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-3"
        >
          <ChevronLeft size={15} /> 회원목록
        </Link>
        <h1 className="text-xl font-bold text-gray-900">회원등록</h1>
        <p className="text-sm text-gray-500 mt-0.5">새 회원 정보를 입력하세요.</p>
      </div>
      <MemberForm />
    </div>
  );
}
