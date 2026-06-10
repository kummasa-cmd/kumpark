import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import BoardForm from "@/components/admin/BoardForm";

export const metadata: Metadata = { title: "게시판 추가" };

export default function BoardNewPage() {
  return (
    <div className="space-y-5">
      <div>
        <Link
          href="/admin/site/boards"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-3"
        >
          <ChevronLeft size={15} /> 게시판 목록
        </Link>
        <h1 className="text-xl font-bold text-gray-900">게시판 추가</h1>
        <p className="text-sm text-gray-500 mt-0.5">새 게시판을 등록합니다.</p>
      </div>
      <BoardForm />
    </div>
  );
}
