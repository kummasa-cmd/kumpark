"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Plus, Check, X } from "lucide-react";

type Category = { id: number; name: string; sort_order: number };

export default function CategoryManager({
  boardId,
  initialCategories,
}: {
  boardId: number;
  initialCategories: Category[];
}) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editOrder, setEditOrder] = useState(0);
  const [newName, setNewName] = useState("");
  const [newOrder, setNewOrder] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const refresh = async () => {
    const res = await fetch(`/api/admin/boards/${boardId}/categories`);
    const data = await res.json();
    setCategories(data);
    router.refresh();
  };

  const startEdit = (cat: Category) => {
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditOrder(cat.sort_order);
  };

  const cancelEdit = () => setEditingId(null);

  const saveEdit = async (id: number) => {
    if (!editName.trim()) { setError("카테고리명을 입력하세요."); return; }
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/boards/${boardId}/categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName.trim(), sort_order: Number(editOrder) }),
      });
      if (res.ok) { setEditingId(null); await refresh(); }
      else { const j = await res.json(); setError(j.error ?? "수정 실패"); }
    } finally { setSaving(false); }
  };

  const deleteCategory = async (id: number, name: string) => {
    if (!confirm(`'${name}' 카테고리를 삭제하시겠습니까?`)) return;
    setError("");
    const res = await fetch(`/api/admin/boards/${boardId}/categories/${id}`, { method: "DELETE" });
    const j = await res.json();
    if (res.ok) { await refresh(); }
    else { alert(j.error ?? "삭제 실패"); }
  };

  const addCategory = async () => {
    if (!newName.trim()) { setError("카테고리명을 입력하세요."); return; }
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/boards/${boardId}/categories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim(), sort_order: Number(newOrder) }),
      });
      if (res.ok) { setNewName(""); setNewOrder(0); await refresh(); }
      else { const j = await res.json(); setError(j.error ?? "추가 실패"); }
    } finally { setSaving(false); }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden max-w-lg">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 text-xs text-gray-500 border-b border-gray-100">
            <th className="text-left px-4 py-3 font-medium">카테고리명</th>
            <th className="text-left px-4 py-3 font-medium w-20">순서</th>
            <th className="text-left px-4 py-3 font-medium w-24">관리</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {categories.map((cat) =>
            editingId === cat.id ? (
              <tr key={cat.id} className="bg-green-50">
                <td className="px-4 py-2">
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full border border-brand-green rounded-md px-2 py-1.5 text-sm focus:outline-none"
                    autoFocus
                  />
                </td>
                <td className="px-4 py-2">
                  <input
                    type="number"
                    value={editOrder}
                    onChange={(e) => setEditOrder(Number(e.target.value))}
                    className="w-16 border border-brand-green rounded-md px-2 py-1.5 text-sm focus:outline-none"
                  />
                </td>
                <td className="px-4 py-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => saveEdit(cat.id)}
                      disabled={saving}
                      className="text-brand-green hover:text-green-800 disabled:opacity-40"
                      title="저장"
                    >
                      <Check size={15} />
                    </button>
                    <button onClick={cancelEdit} className="text-gray-400 hover:text-gray-600" title="취소">
                      <X size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              <tr key={cat.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-gray-800">{cat.name}</td>
                <td className="px-4 py-3 text-gray-400 text-xs">{cat.sort_order}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => startEdit(cat)}
                      className="text-xs text-brand-green hover:underline inline-flex items-center gap-1"
                    >
                      <Pencil size={11} /> 수정
                    </button>
                    <button
                      onClick={() => deleteCategory(cat.id, cat.name)}
                      className="inline-flex items-center gap-1 text-xs text-red-400 hover:text-red-600"
                    >
                      <Trash2 size={11} /> 삭제
                    </button>
                  </div>
                </td>
              </tr>
            )
          )}

          {/* 추가 행 */}
          <tr className="bg-gray-50">
            <td className="px-4 py-2">
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addCategory()}
                placeholder="새 카테고리명"
                className="w-full border border-gray-200 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:border-brand-green transition-colors"
              />
            </td>
            <td className="px-4 py-2">
              <input
                type="number"
                value={newOrder}
                onChange={(e) => setNewOrder(Number(e.target.value))}
                className="w-16 border border-gray-200 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:border-brand-green transition-colors"
              />
            </td>
            <td className="px-4 py-2">
              <button
                onClick={addCategory}
                disabled={saving}
                className="inline-flex items-center gap-1 text-xs bg-brand-green text-white px-2.5 py-1.5 rounded-md hover:bg-green-800 disabled:opacity-40 transition-colors"
              >
                <Plus size={12} /> 추가
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      {error && (
        <div className="px-4 py-2 text-xs text-red-500 border-t border-gray-100">{error}</div>
      )}

      {categories.length === 0 && !error && (
        <p className="text-xs text-gray-400 px-4 pb-3">
          카테고리가 없습니다. 위 입력란에서 추가하세요.
        </p>
      )}
    </div>
  );
}
