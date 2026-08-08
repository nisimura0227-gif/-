"use client";

import { useEffect, useRef } from "react";

/**
 * LIFF（LINE公式アカウントのアプリ内ブラウザ）で開かれている場合に、
 * LINEユーザーIDとサイト上の「名前」を紐付けてサーバーへ送る。
 *
 * - LIFF未設定（NEXT_PUBLIC_LIFF_ID未設定）や、LINEアプリ以外から開いた場合は
 *   何もせず黙って終了する。注文機能そのものには一切影響しない。
 * - 同じ名前で二重に送信しないよう、直前に送った名前を覚えておく。
 */
export default function LiffLink({ name }: { name: string }) {
  const linkedForRef = useRef<string | null>(null);

  useEffect(() => {
    const liffId = process.env.NEXT_PUBLIC_LIFF_ID;
    const trimmed = name.trim();
    if (!liffId || !trimmed || linkedForRef.current === trimmed) return;

    let cancelled = false;
    (async () => {
      try {
        const liffModule = await import("@line/liff");
        const liff = liffModule.default;
        await liff.init({ liffId });

        if (!liff.isLoggedIn()) {
          // LINEアプリ内であれば自動的にログインし直す（画面遷移は伴わないことが多い）。
          // 戻り先を今のページに明示することで、ログイン後に別のページへ飛ばされるのを防ぐ。
          // LINEアプリ外（PCブラウザ等）ではログイン画面へ飛ばすと注文の妨げになるため何もしない。
          if (liff.isInClient()) liff.login({ redirectUri: window.location.href });
          return;
        }

        const profile = await liff.getProfile();
        if (cancelled) return;
        linkedForRef.current = trimmed;

        await fetch("/api/line/link", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: trimmed,
            lineUserId: profile.userId,
            displayName: profile.displayName,
          }),
        }).catch(() => {});
      } catch {
        // LIFF SDKの読み込み失敗・未設定・LINEアプリ以外からのアクセスなど。
        // サイトの注文機能はLINE連携なしでも成立するため、ここでは何もしない。
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [name]);

  return null;
}
