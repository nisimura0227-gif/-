"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * サイトのどのページからでも、LIFF経由で開かれた場合の初期化を行う。
 *
 * リッチメニューや通知のボタンは `https://liff.line.me/{LIFFID}/order/today` のように
 * 末尾にパスを付けた「深いリンク」を使っている。LINEアプリはこのリンクを開くと、
 * まずLIFFに登録した「エンドポイントURL」（サイトのトップページ）を開き、
 * 本来のパス（例: /order/today）を `liff.state` というクエリパラメータとして付与する。
 *
 * そのため、着地したページで liff.init() を呼び、`liff.state` があれば
 * 本来のページへ移動させる処理をどこかで必ず行う必要がある。
 * これを行っていないと、ボタンを押しても常にトップページへ戻されてしまう。
 */
export default function LiffInit() {
  const router = useRouter();

  useEffect(() => {
    const liffId = process.env.NEXT_PUBLIC_LIFF_ID;
    if (!liffId) return;

    let cancelled = false;
    (async () => {
      try {
        const liffModule = await import("@line/liff");
        const liff = liffModule.default;
        await liff.init({ liffId });
        if (cancelled) return;

        const params = new URLSearchParams(window.location.search);
        const state = params.get("liff.state");
        if (state) {
          const target = decodeURIComponent(state);
          if (target.startsWith("/") && target !== window.location.pathname) {
            router.replace(target);
          }
        }
      } catch {
        // LIFF未設定・LINEアプリ以外からのアクセスなど。サイト機能には影響させない。
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router]);

  return null;
}
