import Link from "next/link";

export default function AdminNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <p className="text-5xl font-bold text-gray-200 mb-4">404</p>
      <h2 className="text-lg font-bold text-gray-900 mb-2">페이지를 찾을 수 없습니다</h2>
      <p className="text-sm text-gray-500 mb-6">요청하신 페이지가 존재하지 않거나 이동되었습니다.</p>
      <Link
        href="/admin"
        className="bg-brand-green text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-green-800 transition-colors"
      >
        대시보드로 돌아가기
      </Link>
    </div>
  );
}
