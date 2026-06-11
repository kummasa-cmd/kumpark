"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">오류가 발생했습니다</h2>
      <p className="text-gray-500 text-sm mb-6">
        {error.message || "페이지를 불러오는 중 문제가 생겼습니다."}
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
