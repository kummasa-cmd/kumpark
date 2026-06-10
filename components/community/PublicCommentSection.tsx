"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageSquare, Reply, Trash2 } from "lucide-react";
import Link from "next/link";

export type Comment = {
  id: number;
  parent_id: number | null;
  author_name: string;
  author_type: string;   // 'admin' | 'member'
  author_id: number | null;
  content: string;
  created_at: string;
};

interface Props {
  postId: number;
  memberId: number | null;
  initialComments: Comment[];
}

const inputCls =
  "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-green transition-colors resize-none";

/* ─── CommentCard — 외부 선언 (리렌더 시 리마운트 방지) ─── */
interface CardProps {
  comment: Comment;
  depth: number;
  allComments: Comment[];
  memberId: number | null;
  replyTo: number | null;
  replyText: string;
  replySubmitting: boolean;
  onOpenReply: (id: number) => void;
  onCloseReply: () => void;
  onReplyTextChange: (v: string) => void;
  onSubmitReply: (parentId: number) => void;
  onDelete: (id: number) => void;
}

function CommentCard(props: CardProps) {
  const {
    comment, depth, allComments, memberId,
    replyTo, replyText, replySubmitting,
    onOpenReply, onCloseReply, onReplyTextChange, onSubmitReply, onDelete,
  } = props;

  const directReplies = allComments.filter((c) => c.parent_id === comment.id);
  const isReplying = replyTo === comment.id;
  const isMyComment = comment.author_type === "member" && comment.author_id === memberId;
  const isAdmin = comment.author_type === "admin";

  return (
    <div>
      <div className={`rounded-lg border px-4 py-3 ${depth > 0 ? "bg-gray-50 border-gray-100" : "bg-white border-gray-100"}`}>
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {depth > 0 && <Reply size={13} className="text-gray-400 scale-x-[-1]" />}
            <span className="text-xs font-semibold text-gray-800">{comment.author_name}</span>
            {isAdmin && (
              <span className="text-xs px-1.5 py-0.5 rounded bg-brand-green/10 text-brand-green font-medium">
                관리자
              </span>
            )}
            <span className="text-xs text-gray-400">{comment.created_at}</span>
          </div>
          <div className="flex items-center gap-2">
            {memberId && (
              <button
                onClick={() => isReplying ? onCloseReply() : onOpenReply(comment.id)}
                className="text-xs text-gray-400 hover:text-brand-green transition-colors flex items-center gap-1"
              >
                <Reply size={12} /> 답글
              </button>
            )}
            {isMyComment && (
              <button
                onClick={() => onDelete(comment.id)}
                className="text-xs text-red-400 hover:text-red-600 transition-colors"
              >
                <Trash2 size={12} />
              </button>
            )}
          </div>
        </div>

        {/* 내용 */}
        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{comment.content}</p>

        {/* 답글 입력 */}
        {isReplying && (
          <div className="mt-3 border-t border-gray-100 pt-3 space-y-2">
            <textarea
              autoFocus
              value={replyText}
              onChange={(e) => onReplyTextChange(e.target.value)}
              rows={3}
              placeholder="답글을 입력하세요"
              className={inputCls}
            />
            <div className="flex gap-2">
              <button
                onClick={() => onSubmitReply(comment.id)}
                disabled={replySubmitting || !replyText.trim()}
                className="text-xs bg-brand-green text-white px-3 py-1.5 rounded-lg hover:bg-green-800 disabled:opacity-50 transition-colors"
              >
                {replySubmitting ? "등록 중..." : "답글 등록"}
              </button>
              <button
                onClick={onCloseReply}
                className="text-xs text-gray-400 hover:text-gray-600 px-3 py-1.5 rounded-lg border border-gray-200 transition-colors"
              >
                취소
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 하위 답글 */}
      {directReplies.length > 0 && (
        <div className={`space-y-2 mt-2 ${depth === 0 ? "ml-8" : ""}`}>
          {directReplies.map((r) => (
            <CommentCard key={r.id} {...props} comment={r} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── PublicCommentSection ─── */
export default function PublicCommentSection({ postId, memberId, initialComments }: Props) {
  const router = useRouter();
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [newText, setNewText] = useState("");
  const [newSubmitting, setNewSubmitting] = useState(false);

  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replySubmitting, setReplySubmitting] = useState(false);

  const topLevel = comments.filter((c) => c.parent_id === null);

  const submitComment = async (parentId: number | null, text: string) => {
    const res = await fetch("/api/community/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ post_id: postId, parent_id: parentId, content: text }),
    });
    if (!res.ok) {
      const json = await res.json();
      alert(json.error ?? "댓글 등록에 실패했습니다.");
      return false;
    }
    const newComment: Comment = await res.json();
    setComments((prev) => [...prev, newComment]);
    return true;
  };

  const handleNewSubmit = async () => {
    if (!newText.trim()) return;
    setNewSubmitting(true);
    const ok = await submitComment(null, newText);
    if (ok) setNewText("");
    setNewSubmitting(false);
  };

  const handleReplySubmit = async (parentId: number) => {
    if (!replyText.trim()) return;
    setReplySubmitting(true);
    const ok = await submitComment(parentId, replyText);
    if (ok) { setReplyText(""); setReplyTo(null); }
    setReplySubmitting(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("댓글을 삭제하시겠습니까?")) return;
    const res = await fetch(`/api/community/comments/${id}`, { method: "DELETE" });
    if (res.ok) {
      setComments((prev) => prev.filter((c) => c.id !== id));
      router.refresh();
    } else {
      const json = await res.json();
      alert(json.error ?? "삭제에 실패했습니다.");
    }
  };

  const sharedProps = {
    allComments: comments,
    memberId,
    replyTo,
    replyText,
    replySubmitting,
    onOpenReply: (id: number) => { setReplyTo(id); setReplyText(""); },
    onCloseReply: () => { setReplyTo(null); setReplyText(""); },
    onReplyTextChange: setReplyText,
    onSubmitReply: handleReplySubmit,
    onDelete: handleDelete,
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <MessageSquare size={16} className="text-brand-green" />
        <h3 className="font-semibold text-gray-800 text-sm">댓글 {comments.length}개</h3>
      </div>

      {/* 댓글 목록 */}
      {topLevel.length > 0 && (
        <div className="space-y-3">
          {topLevel.map((c) => (
            <CommentCard key={c.id} {...sharedProps} comment={c} depth={0} />
          ))}
        </div>
      )}

      {/* 새 댓글 입력 */}
      {memberId ? (
        <div className="border-t border-gray-100 pt-4 space-y-2">
          <textarea
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            rows={3}
            placeholder="댓글을 입력하세요"
            className={inputCls}
          />
          <button
            onClick={handleNewSubmit}
            disabled={newSubmitting || !newText.trim()}
            className="text-sm bg-brand-green text-white px-4 py-2 rounded-lg hover:bg-green-800 disabled:opacity-50 transition-colors"
          >
            {newSubmitting ? "등록 중..." : "댓글 등록"}
          </button>
        </div>
      ) : (
        <div className="border-t border-gray-100 pt-4 text-center">
          <p className="text-sm text-brand-muted">
            <Link href="/login" className="text-brand-green hover:underline font-medium">
              로그인
            </Link>
            하면 댓글을 작성할 수 있습니다.
          </p>
        </div>
      )}
    </div>
  );
}
