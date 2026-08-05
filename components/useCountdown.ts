"use client";

import { useEffect, useState } from "react";

/**
 * 締切までの残りミリ秒を1分ごとに更新して返す。
 *
 * 端末の時計やタイムゾーンがずれていても正しく動くよう、
 * サーバーが計算した「締切の絶対時刻」と「サーバーの現在時刻」を受け取り、
 * 端末時計とのズレを補正したうえで残り時間を求める。
 */
export function useCountdown(cutoffAtMs: number, serverNowMs: number) {
  const [offsetMs] = useState(() => serverNowMs - Date.now());
  const [remainMs, setRemainMs] = useState(() => cutoffAtMs - serverNowMs);

  useEffect(() => {
    function tick() {
      setRemainMs(cutoffAtMs - (Date.now() + offsetMs));
    }
    tick();
    const timer = setInterval(tick, 60 * 1000);
    return () => clearInterval(timer);
  }, [cutoffAtMs, offsetMs]);

  const totalMinutes = Math.max(0, Math.floor(remainMs / 60000));
  return {
    remainMs,
    closed: remainMs <= 0,
    hours: Math.floor(totalMinutes / 60),
    minutes: totalMinutes % 60,
  };
}
