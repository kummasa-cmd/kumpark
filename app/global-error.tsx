"use client";

import { useEffect } from "react";

export default function GlobalError({
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
    <html lang="ko">
      <body>
        <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center bg-white">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">오류가 발생했습니다</h2>
          <p className="text-gray-500 text-sm mb-6">
            {error.message || "페이지를 불러오는 중 문제가 생겼습니다."}
          </p>
          <button
            onClick={reset}
            style={{ background: "#0B7903", color: "#fff", padding: "10px 20px", borderRadius: "8px", border: "none", cursor: "pointer", fontSize: "14px" }}
          >
            다시 시도
          </button>
        </div>
      </body>
    </html>
  );
}
