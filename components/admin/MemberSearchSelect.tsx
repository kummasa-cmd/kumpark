"use client";

import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";

export type SelectedMember = {
  id: number;
  name: string;
  nickname: string;
  phone: string | null;
};

export default function MemberSearchSelect({
  value,
  onChange,
}: {
  value: SelectedMember | null;
  onChange: (member: SelectedMember | null) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SelectedMember[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/admin/members/search?q=${encodeURIComponent(query)}`);
        const json = await res.json();
        setResults(json);
        setOpen(true);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (value) {
    return (
      <div className="flex items-center justify-between border border-gray-200 rounded-lg px-3 py-2.5 bg-gray-50">
        <div className="text-sm">
          <span className="font-medium text-gray-800">{value.name}</span>
          {value.nickname && <span className="text-gray-500"> ({value.nickname})</span>}
          {value.phone && <span className="text-xs text-gray-400 ml-2">{value.phone}</span>}
        </div>
        <button
          type="button"
          onClick={() => {
            onChange(null);
            setQuery("");
          }}
          className="text-gray-400 hover:text-red-500 transition-colors"
        >
          <X size={16} />
        </button>
      </div>
    );
  }

  return (
    <div ref={boxRef} className="relative">
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.trim() && setOpen(true)}
          placeholder="닉네임, 이름, 전화번호로 검색"
          className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:border-brand-green transition-colors"
        />
      </div>
      {open && query.trim() && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-56 overflow-y-auto">
          {loading ? (
            <p className="px-3 py-3 text-xs text-gray-400 text-center">검색 중...</p>
          ) : results.length === 0 ? (
            <p className="px-3 py-3 text-xs text-gray-400 text-center">검색 결과가 없습니다.</p>
          ) : (
            results.map((m) => (
              <button
                type="button"
                key={m.id}
                onClick={() => {
                  onChange(m);
                  setOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
              >
                <span className="font-medium text-gray-800">{m.name}</span>
                {m.nickname && <span className="text-gray-500"> ({m.nickname})</span>}
                {m.phone && <span className="text-xs text-gray-400 block">{m.phone}</span>}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
