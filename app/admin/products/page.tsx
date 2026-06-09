import type { Metadata } from "next";
import Link from "next/link";
import { PlusCircle } from "lucide-react";

export const metadata: Metadata = { title: "상품목록" };

const products = [
  {
    id: 1,
    name: "전자책 그룹 코칭",
    category: "전자책 코칭",
    price: "₩150,000",
    period: "6주",
    type: "그룹",
    status: "판매중",
    orders: 12,
  },
  {
    id: 2,
    name: "전자책 개인 코칭",
    category: "전자책 코칭",
    price: "상담 후 안내",
    period: "6주",
    type: "1:1",
    status: "판매중",
    orders: 4,
  },
  {
    id: 3,
    name: "종이책 1대1 코칭",
    category: "종이책 코칭",
    price: "상담 후 안내",
    period: "5개월",
    type: "1:1",
    status: "판매중",
    orders: 2,
  },
];

export default function ProductsPage() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">상품목록</h1>
          <p className="text-sm text-gray-500 mt-0.5">총 {products.length}개 상품이 등록되어 있습니다.</p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 bg-brand-green text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-green-800 transition-colors"
        >
          <PlusCircle size={15} /> 상품등록
        </Link>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((p) => (
          <div
            key={p.id}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col gap-3"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-brand-green font-medium mb-1">{p.category}</p>
                <h3 className="font-bold text-gray-900">{p.name}</h3>
              </div>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  p.status === "판매중" ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"
                }`}
              >
                {p.status}
              </span>
            </div>

            <div className="space-y-1.5 text-sm text-gray-600">
              <div className="flex justify-between">
                <span className="text-gray-400">가격</span>
                <span className="font-semibold text-brand-green">{p.price}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">기간</span>
                <span>{p.period}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">유형</span>
                <span>{p.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">주문수</span>
                <span className="font-medium">{p.orders}건</span>
              </div>
            </div>

            <div className="flex gap-2 pt-1 border-t border-gray-50">
              <button className="flex-1 text-xs text-gray-500 hover:text-brand-green border border-gray-200 rounded-lg py-1.5 transition-colors">
                수정
              </button>
              <button className="flex-1 text-xs text-gray-500 hover:text-red-500 border border-gray-200 rounded-lg py-1.5 transition-colors">
                삭제
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
