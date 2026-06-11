"use client";

import { useEffect } from "react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[admin error]", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <p className="text-4xl font-bold text-gray-200 mb-4">오류</p>
      <h2 className="text-lg font-bold text-gray-900 mb-2">페이지를 불러올 수 없습니다</h2>
      <p className="text-sm text-gray-500 mb-6">
        {error.message || "일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요."}
      </p>
      <button
        onClick={reset}
        className="bg-brand-green text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-green-800 transition-colors"
      >
        다시 시도
      </button>
    </div>
  );
}
