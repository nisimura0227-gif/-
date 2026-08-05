"use client";

import { useCountdown } from "./useCountdown";

/**
 * トップページ上部の情報カード。
 * 「受付終了まで」は1分ごとに自動更新され、締切を過ぎると受付終了の表示に切り替わる。
 */
export default function StatusCard({
  dateLabel,
  adminName,
  cutoffLabel,
  cutoffAtMs,
  serverNowMs,
}: {
  dateLabel: string;
  adminName: string;
  cutoffLabel: string;
  cutoffAtMs: number;
  serverNowMs: number;
}) {
  const { closed, hours, minutes } = useCountdown(cutoffAtMs, serverNowMs);

  return (
    <section className="rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
      <dl className="flex flex-col gap-2 text-sm">
        <div className="flex items-center justify-between">
          <dt className="text-gray-500">📅 本日</dt>
          <dd className="font-bold text-gray-800">{dateLabel}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-gray-500">👷 担当者</dt>
          <dd className="font-bold text-gray-800">{adminName}</dd>
        </div>
        <div className="flex items-center justify-between border-t border-gray-100 pt-2">
          <dt className="text-gray-500">⏰ 受付終了まで</dt>
          <dd>
            {closed ? (
              <span className="font-bold text-red-600">受付終了</span>
            ) : (
              <span className="font-bold text-brand-dark">
                あと{hours > 0 ? `${hours}時間` : ""}
                {minutes}分
              </span>
            )}
          </dd>
        </div>
      </dl>

      {closed ? (
        <p className="mt-3 rounded-xl bg-red-50 px-3 py-2.5 text-center text-sm font-bold text-red-600">
          🔴 本日の受付は終了しました
        </p>
      ) : (
        <p className="mt-2 text-right text-xs text-gray-400">受付は {cutoffLabel} まで</p>
      )}
    </section>
  );
}
