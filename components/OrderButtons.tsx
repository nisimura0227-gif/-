"use client";

import Link from "next/link";
import { useCountdown } from "./useCountdown";

/**
 * トップページの注文ボタン。
 * 締切を過ぎると「今日のお弁当を注文する」を押せなくする。
 * 画面を開いたまま締切を迎えた場合もその場で無効化される。
 */
export default function OrderButtons({
  cutoffAtMs,
  serverNowMs,
}: {
  cutoffAtMs: number;
  serverNowMs: number;
}) {
  const { closed } = useCountdown(cutoffAtMs, serverNowMs);

  return (
    <div className="flex flex-col gap-4">
      {closed ? (
        <div
          aria-disabled="true"
          className="flex min-h-[72px] cursor-not-allowed items-center justify-center rounded-2xl bg-gray-200 px-6 py-5 text-center text-lg font-bold text-gray-500"
        >
          🔴 本日の受付は終了しました
        </div>
      ) : (
        <Link
          href="/order/today"
          className="flex min-h-[72px] items-center justify-center rounded-2xl bg-brand px-6 py-5 text-center text-xl font-bold text-white shadow-sm active:bg-brand-dark"
        >
          🍱 今日のお弁当を注文する
        </Link>
      )}

      <Link
        href="/order/tomorrow"
        className="flex min-h-[72px] items-center justify-center rounded-2xl border-2 border-brand bg-brand-light px-6 py-5 text-center text-xl font-bold text-brand-dark active:bg-brand/20"
      >
        📅 明日のお弁当を注文する
      </Link>
    </div>
  );
}
