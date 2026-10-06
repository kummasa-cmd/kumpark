"use client";

import { useEffect, useRef, useState } from "react";
import { Search, X, Check } from "lucide-react";
import type { SelectedMember } from "./MemberSearchSelect";

// 회원 여러 명 선택 (검색 후 클릭으로 추가, 칩의 X로 제거)
export default function MemberMultiSelect({
  value,
  onChange,
}: {
  value: SelectedMember[];
  onChange: (members: SelectedMember[]) => void;
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
        setResults(res.ok ? await res.json() : []);
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

  const selectedIds = new Set(value.map((m) => m.id));

  const toggle = (m: SelectedMember) => {
    onChange(selectedIds.has(m.id) ? value.filter((v) => v.id !== m.id) : [...value, m]);
  };

  return (
    <div ref={boxRef} className="space-y-2">
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map((m) => (
            <span
              key={m.id}
              className="inline-flex items-center gap-1 bg-green-50 text-green-800 text-xs pl-2.5 pr-1.5 py-1 rounded-full"
            >
              {m.name}
              {m.nickname && <span className="text-green-600">({m.nickname})</span>}
              <button
                type="button"
                onClick={() => toggle(m)}
                className="text-green-600 hover:text-red-500"
                aria-label={`${m.name} 선택 해제`}
              >
                <X size={12} />
              </button>
            </span>
          ))}
          <button
            type="button"
            onClick={() => onChange([])}
            className="text-xs text-gray-400 hover:text-red-500 px-1"
          >
            모두 해제
          </button>
        </div>
      )}

      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.trim() && setOpen(true)}
          placeholder="닉네임, 이름, 전화번호로 검색해 회원 추가"
          className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:border-brand-green transition-colors"
        />
        {open && query.trim() && (
          <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-56 overflow-y-auto">
            {loading ? (
              <p className="px-3 py-3 text-xs text-gray-400 text-center">검색 중...</p>
            ) : results.length === 0 ? (
              <p className="px-3 py-3 text-xs text-gray-400 text-center">검색 결과가 없습니다.</p>
            ) : (
              results.map((m) => {
                const selected = selectedIds.has(m.id);
                return (
                  <button
                    type="button"
                    key={m.id}
                    onClick={() => toggle(m)}
                    className="w-full flex items-center justify-between text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
                  >
                    <span>
                      <span className="font-medium text-gray-800">{m.name}</span>
                      {m.nickname && <span className="text-gray-500"> ({m.nickname})</span>}
                      {m.phone && <span className="text-xs text-gray-400 block">{m.phone}</span>}
                    </span>
                    {selected && <Check size={14} className="text-brand-green shrink-0" />}
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}
