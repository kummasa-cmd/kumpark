import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import CoachingForm from "@/components/admin/CoachingForm";

export const metadata: Metadata = { title: "코칭등록" };

export default function CoachingNewPage() {
  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <Link
          href="/admin/coachings"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-3"
        >
          <ChevronLeft size={15} /> 코칭목록
        </Link>
        <h1 className="text-xl font-bold text-gray-900">코칭등록</h1>
        <p className="text-sm text-gray-500 mt-0.5">회원을 검색하여 코칭 신청 정보를 등록하세요.</p>
      </div>
      <CoachingForm />
    </div>
  );
}
