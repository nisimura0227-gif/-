"use client";

import Link from "next/link";
import { useCountdown } from "./useCountdown";
import { buttonVariants } from "./ui/Button";

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
    <div className="flex flex-col gap-3">
      {closed ? (
        <div
          aria-disabled="true"
          className="flex min-h-[72px] cursor-not-allowed items-center justify-center rounded-2xl bg-gray-200 px-6 py-5 text-center text-xl font-bold text-gray-500"
        >
          🔴 本日の受付は終了しました
        </div>
      ) : (
        <Link href="/order/today" className={buttonVariants("accent", "lg", "min-h-[72px]")}>
          🍱 今日のお弁当を注文する
        </Link>
      )}

      <Link href="/order/tomorrow" className={buttonVariants("outline", "lg", "min-h-[72px] bg-brand-light")}>
        📅 明日のお弁当を注文する
      </Link>
    </div>
  );
}
