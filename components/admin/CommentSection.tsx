"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageSquare, Reply, Pencil, Trash2 } from "lucide-react";

export type Comment = {
  id: number;
  parent_id: number | null;
  author_name: string;
  author_type: string;
  author_id: number | null;
  content: string;
  created_at: string;
};

const inputClass =
  "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-green transition-colors";

/* ──────────────────────────────────────────────
   CommentCard — CommentSection 외부에 선언
   (내부 선언 시 상태 변화마다 재마운트돼 포커스 소실)
────────────────────────────────────────────── */
interface CardProps {
  comment: Comment;
  depth: number;           // 0 = 최상위, 1+ = 답글
  allComments: Comment[];
  adminId: number;
  adminName: string;
  replyTo: number | null;
  replyAuthor: string;
  replyText: string;
  replySubmitting: boolean;
  onOpenReply: (id: number) => void;
  onCloseReply: () => void;
  onReplyAuthorChange: (v: string) => void;
  onReplyTextChange: (v: string) => void;
  onSubmitReply: (parentId: number) => void;
  editingId: number | null;
  editAuthor: string;
  editText: string;
  editSubmitting: boolean;
  onStartEdit: (c: Comment) => void;
  onEditAuthorChange: (v: string) => void;
  onEditTextChange: (v: string) => void;
  onSubmitEdit: (id: number) => void;
  onCancelEdit: () => void;
  onDelete: (id: number, content: string) => void;
}

function CommentCard(props: CardProps) {
  const {
    comment, depth, allComments, adminId,
    replyTo, replyAuthor, replyText, replySubmitting,
    onOpenReply, onCloseReply, onReplyAuthorChange, onReplyTextChange, onSubmitReply,
    editingId, editAuthor, editText, editSubmitting,
    onStartEdit, onEditAuthorChange, onEditTextChange, onSubmitEdit, onCancelEdit,
    onDelete,
  } = props;

  const directReplies = allComments.filter((c) => c.parent_id === comment.id);
  const isEditing = editingId === comment.id;
  const isReplying = replyTo === comment.id;
  const isMyComment = comment.author_type === "admin" && comment.author_id === adminId;

  // 자식 카드에 전달할 props (comment·depth 제외)
  const childProps = { ...props };

  return (
    <div>
      {/* 카드 본문 */}
      <div
        className={`rounded-lg border px-4 py-3 ${
          depth > 0 ? "bg-gray-50 border-gray-100" : "bg-white border-gray-100"
        }`}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {depth > 0 && (
              <Reply size={13} className="text-gray-400 rotate-180 scale-x-[-1]" />
            )}
            <span className="text-xs font-semibold text-gray-800">{comment.author_name}</span>
            <span className="text-xs px-1.5 py-0.5 rounded bg-brand-green/10 text-brand-green font-medium">
              관리자
            </span>
            <span className="text-xs text-gray-400">{comment.created_at}</span>
          </div>
          <div className="flex items-center gap-2">
            {isMyComment && (
              <button
                onClick={() => onStartEdit(comment)}
                className="inline-flex items-center gap-1 text-xs text-blue-500 hover:text-blue-700 transition-colors"
              >
                <Pencil size={11} /> 수정
              </button>
            )}
            <button
              onClick={() => onDelete(comment.id, comment.content)}
              className="inline-flex items-center gap-1 text-xs text-red-400 hover:text-red-600 transition-colors"
            >
              <Trash2 size={11} /> 삭제
            </button>
            {/* 모든 댓글에 답글 버튼 표시 */}
            <button
              onClick={() => (isReplying ? onCloseReply() : onOpenReply(comment.id))}
              className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition-colors"
            >
              <Reply size={11} />
              {isReplying ? "취소" : "답글"}
            </button>
          </div>
        </div>

        {/* 내용 or 수정 폼 */}
        {isEditing ? (
          <div className="space-y-2 mt-1">
            <div>
              <label className="block text-xs text-gray-500 mb-1">작성자</label>
              <input
                type="text"
                value={editAuthor}
                onChange={(e) => onEditAuthorChange(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">내용</label>
              <textarea
                value={editText}
                onChange={(e) => onEditTextChange(e.target.value)}
                rows={3}
                className={`${inputClass} resize-none`}
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onSubmitEdit(comment.id)}
                disabled={editSubmitting}
                className="text-xs bg-brand-green text-white px-3 py-1.5 rounded-lg hover:bg-green-800 disabled:opacity-60 transition-colors"
              >
                {editSubmitting ? "저장 중..." : "저장"}
              </button>
              <button
                onClick={onCancelEdit}
                className="text-xs text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                취소
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
            {comment.content}
          </p>
        )}
      </div>

      {/* 답글 입력 폼 */}
      {isReplying && (
        <div className="ml-8 mt-2 space-y-2">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div>
              <label className="block text-xs text-gray-500 mb-1">작성자</label>
              <input
                type="text"
                value={replyAuthor}
                onChange={(e) => onReplyAuthorChange(e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs text-gray-500 mb-1">
                {comment.author_name}님께 답글
              </label>
              <textarea
                value={replyText}
                onChange={(e) => onReplyTextChange(e.target.value)}
                rows={2}
                placeholder="답글을 입력하세요..."
                className={`${inputClass} resize-none`}
                autoFocus
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onSubmitReply(comment.id)}
              disabled={replySubmitting || !replyText.trim()}
              className="text-xs bg-brand-green text-white px-3 py-1.5 rounded-lg hover:bg-green-800 disabled:opacity-60 transition-colors"
            >
              {replySubmitting ? "등록 중..." : "답글 등록"}
            </button>
            <button
              onClick={onCloseReply}
              className="text-xs text-gray-500 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              취소
            </button>
          </div>
        </div>
      )}

      {/* 하위 답글 — depth 0→1 은 ml-8, 그 이상은 추가 들여쓰기 없음 */}
      {directReplies.length > 0 && (
        <div className={`space-y-2 mt-2 ${depth === 0 ? "ml-8" : ""}`}>
          {directReplies.map((r) => (
            <CommentCard key={r.id} {...childProps} comment={r} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────
   CommentSection
────────────────────────────────────────────── */
interface Props {
  postId: number;
  adminId: number;
  adminName: string;
  initialComments: Comment[];
}

export default function CommentSection({ postId, adminId, adminName, initialComments }: Props) {
  const router = useRouter();

  const [newAuthor, setNewAuthor] = useState(adminName);
  const [newText, setNewText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [replyAuthor, setReplyAuthor] = useState(adminName);
  const [replyText, setReplyText] = useState("");
  const [replySubmitting, setReplySubmitting] = useState(false);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editAuthor, setEditAuthor] = useState("");
  const [editText, setEditText] = useState("");
  const [editSubmitting, setEditSubmitting] = useState(false);

  const topLevel = initialComments.filter((c) => c.parent_id === null);
  const refresh = () => router.refresh();

  const handleAddComment = async () => {
    if (!newText.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ post_id: postId, content: newText, author_name: newAuthor }),
      });
      if (res.ok) {
        setNewText("");
        setNewAuthor(adminName);
        refresh();
      } else {
        alert((await res.json()).error ?? "댓글 등록에 실패했습니다.");
      }
    } catch {
      alert("서버에 연결할 수 없습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddReply = async (parentId: number) => {
    if (!replyText.trim()) return;
    setReplySubmitting(true);
    try {
      const res = await fetch("/api/admin/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          post_id: postId,
          parent_id: parentId,
          content: replyText,
          author_name: replyAuthor,
        }),
      });
      if (res.ok) {
        setReplyTo(null);
        setReplyText("");
        setReplyAuthor(adminName);
        refresh();
      } else {
        alert((await res.json()).error ?? "답글 등록에 실패했습니다.");
      }
    } catch {
      alert("서버에 연결할 수 없습니다.");
    } finally {
      setReplySubmitting(false);
    }
  };

  const handleEdit = async (id: number) => {
    if (!editText.trim()) return;
    setEditSubmitting(true);
    try {
      const res = await fetch(`/api/admin/comments/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editText, author_name: editAuthor }),
      });
      if (res.ok) {
        setEditingId(null);
        setEditText("");
        setEditAuthor("");
        refresh();
      } else {
        alert((await res.json()).error ?? "수정에 실패했습니다.");
      }
    } catch {
      alert("서버에 연결할 수 없습니다.");
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleDelete = async (id: number, content: string) => {
    if (
      !confirm(
        `댓글을 삭제하시겠습니까?\n"${content.slice(0, 40)}${content.length > 40 ? "…" : ""}"\n삭제된 댓글은 복구할 수 없습니다.`
      )
    )
      return;
    try {
      const res = await fetch(`/api/admin/comments/${id}`, { method: "DELETE" });
      if (!res.ok) alert((await res.json()).error ?? "삭제에 실패했습니다.");
      else refresh();
    } catch {
      alert("서버에 연결할 수 없습니다.");
    }
  };

  const sharedCardProps: Omit<CardProps, "comment" | "depth"> = {
    allComments: initialComments,
    adminId,
    adminName,
    replyTo,
    replyAuthor,
    replyText,
    replySubmitting,
    onOpenReply: (id) => {
      setReplyTo(id);
      setReplyText("");
      setReplyAuthor(adminName);
      setEditingId(null);
    },
    onCloseReply: () => setReplyTo(null),
    onReplyAuthorChange: setReplyAuthor,
    onReplyTextChange: setReplyText,
    onSubmitReply: handleAddReply,
    editingId,
    editAuthor,
    editText,
    editSubmitting,
    onStartEdit: (c) => {
      setEditingId(c.id);
      setEditText(c.content);
      setEditAuthor(c.author_name);
      setReplyTo(null);
    },
    onEditAuthorChange: setEditAuthor,
    onEditTextChange: setEditText,
    onSubmitEdit: handleEdit,
    onCancelEdit: () => {
      setEditingId(null);
      setEditText("");
      setEditAuthor("");
    },
    onDelete: handleDelete,
  };

  return (
    <div className="space-y-4">
      {/* 헤더 */}
      <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
        <MessageSquare size={16} className="text-gray-500" />
        <h2 className="text-sm font-semibold text-gray-700">
          댓글 <span className="text-brand-green">{initialComments.length}</span>개
        </h2>
      </div>

      {/* 댓글 목록 */}
      {topLevel.length === 0 ? (
        <p className="text-sm text-gray-400 py-4 text-center">아직 댓글이 없습니다.</p>
      ) : (
        <div className="space-y-3">
          {topLevel.map((c) => (
            <CommentCard key={c.id} comment={c} depth={0} {...sharedCardProps} />
          ))}
        </div>
      )}

      {/* 새 댓글 작성 */}
      <div className="pt-2 border-t border-gray-100 space-y-3">
        <p className="text-xs font-semibold text-gray-600">댓글 작성</p>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">작성자</label>
            <input
              type="text"
              value={newAuthor}
              onChange={(e) => setNewAuthor(e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="sm:col-span-3">
            <label className="block text-xs text-gray-500 mb-1">내용</label>
            <textarea
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              rows={3}
              placeholder="댓글을 입력하세요..."
              className={`${inputClass} resize-none`}
            />
          </div>
        </div>
        <div className="flex justify-end">
          <button
            onClick={handleAddComment}
            disabled={submitting || !newText.trim()}
            className="text-sm bg-brand-green text-white px-5 py-2 rounded-lg hover:bg-green-800 disabled:opacity-60 transition-colors"
          >
            {submitting ? "등록 중..." : "댓글 등록"}
          </button>
        </div>
      </div>
    </div>
  );
}
