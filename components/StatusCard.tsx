"use client";

import { useCountdown } from "./useCountdown";
import { Card, CardSection } from "./ui/Card";
import { Badge } from "./ui/Badge";

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
    <Card className="border-2 border-gray-200 p-5">
      <dl className="flex flex-col gap-3 text-base">
        <div className="flex items-center justify-between">
          <dt className="text-gray-500">📅 本日</dt>
          <dd className="font-bold text-gray-800">{dateLabel}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-gray-500">👷 担当者</dt>
          <dd className="font-bold text-gray-800">{adminName}</dd>
        </div>
        <CardSection className="flex items-center justify-between">
          <dt className="text-gray-500">⏰ 受付終了まで</dt>
          <dd>
            {closed ? (
              <Badge variant="danger">受付終了</Badge>
            ) : (
              <span className="text-lg font-bold text-brand-dark">
                あと{hours > 0 ? `${hours}時間` : ""}
                {minutes}分
              </span>
            )}
          </dd>
        </CardSection>
      </dl>

      {closed ? (
        <p className="mt-4 rounded-xl bg-red-50 px-3 py-3 text-center text-sm font-bold text-red-600">
          🔴 本日の受付は終了しました
        </p>
      ) : (
        <p className="mt-2 text-right text-xs text-gray-400">受付は {cutoffLabel} まで</p>
      )}
    </Card>
  );
}
