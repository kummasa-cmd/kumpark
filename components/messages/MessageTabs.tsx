import Link from "next/link";

interface Props {
  basePath: string;
  active: "received" | "sent";
  receivedTotal: number;
  receivedUnread: number;
  sentTotal: number;
}

export default function MessageTabs({ basePath, active, receivedTotal, receivedUnread, sentTotal }: Props) {
  const tabs = [
    { value: "received", label: "받은 쪽지", total: receivedTotal, unread: receivedUnread },
    { value: "sent", label: "보낸 쪽지", total: sentTotal, unread: 0 },
  ] as const;

  return (
    <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
      {tabs.map((t) => (
        <Link
          key={t.value}
          href={`${basePath}?tab=${t.value}`}
          className={`px-4 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
            active === t.value ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          {t.label}
          <span className="text-gray-400">{t.total}</span>
          {t.unread > 0 && (
            <span className="bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded-full">
              {t.unread}
            </span>
          )}
        </Link>
      ))}
    </div>
  );
}
