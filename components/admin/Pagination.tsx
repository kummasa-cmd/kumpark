import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  basePath: string;
  searchParams?: Record<string, string | undefined>;
}

export default function Pagination({
  currentPage,
  totalPages,
  basePath,
  searchParams = {},
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const buildHref = (page: number) => {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(searchParams)) {
      if (value) params.set(key, value);
    }
    params.set("page", String(page));
    return `${basePath}?${params.toString()}`;
  };

  const windowSize = 5;
  const start = Math.max(1, Math.min(currentPage - 2, totalPages - windowSize + 1));
  const end = Math.min(totalPages, start + windowSize - 1);
  const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i);

  return (
    <nav className="flex items-center justify-center gap-1 pt-2" aria-label="페이지네이션">
      <Link
        href={buildHref(Math.max(1, currentPage - 1))}
        aria-disabled={currentPage === 1}
        className={`p-1.5 rounded-md border border-gray-200 text-gray-500 transition-colors ${
          currentPage === 1
            ? "pointer-events-none opacity-40"
            : "hover:border-brand-green hover:text-brand-green"
        }`}
      >
        <ChevronLeft size={14} />
      </Link>

      {start > 1 && (
        <>
          <Link
            href={buildHref(1)}
            className="px-2.5 py-1 text-xs rounded-md text-gray-500 hover:bg-gray-100"
          >
            1
          </Link>
          {start > 2 && <span className="px-1 text-gray-300 text-xs">…</span>}
        </>
      )}

      {pages.map((p) => (
        <Link
          key={p}
          href={buildHref(p)}
          className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
            p === currentPage
              ? "bg-brand-green text-white font-semibold"
              : "text-gray-500 hover:bg-gray-100"
          }`}
        >
          {p}
        </Link>
      ))}

      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span className="px-1 text-gray-300 text-xs">…</span>}
          <Link
            href={buildHref(totalPages)}
            className="px-2.5 py-1 text-xs rounded-md text-gray-500 hover:bg-gray-100"
          >
            {totalPages}
          </Link>
        </>
      )}

      <Link
        href={buildHref(Math.min(totalPages, currentPage + 1))}
        aria-disabled={currentPage === totalPages}
        className={`p-1.5 rounded-md border border-gray-200 text-gray-500 transition-colors ${
          currentPage === totalPages
            ? "pointer-events-none opacity-40"
            : "hover:border-brand-green hover:text-brand-green"
        }`}
      >
        <ChevronRight size={14} />
      </Link>
    </nav>
  );
}
