import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
import { ChevronLeft } from "lucide-react";
import pool from "@/lib/db";
import { verifyMemberToken, MEMBER_COOKIE } from "@/lib/member-auth";
import PublicPostForm from "@/components/community/PublicPostForm";

export const metadata: Metadata = { title: "글쓰기" };

export default async function NewPostPage({ params }: { params: { slug: string } }) {
  const token = cookies().get(MEMBER_COOKIE)?.value;
  const member = token ? await verifyMemberToken(token) : null;
  if (!member) redirect(`/login?redirect=/community/${params.slug}/new`);

  const { rows } = await pool.query(
    "SELECT id, name, user_writable FROM boards WHERE slug = $1 AND is_visible = TRUE",
    [params.slug]
  );
  const board = rows[0];
  if (!board || !board.user_writable) notFound();

  return (
    <div className="py-10 sm:py-14">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-6">
        <div>
          <Link
            href={`/community/${params.slug}`}
            className="inline-flex items-center gap-1 text-sm text-brand-muted hover:text-brand-green mb-4 transition-colors"
          >
            <ChevronLeft size={15} /> {board.name}
          </Link>
          <h1 className="text-xl font-bold text-brand-text">글쓰기</h1>
        </div>
        <PublicPostForm slug={params.slug} />
      </div>
    </div>
  );
}
