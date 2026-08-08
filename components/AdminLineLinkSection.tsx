"use client";

import { useEffect, useState } from "react";
import Button from "./ui/Button";
import { Card } from "./ui/Card";
import { HelpText } from "./ui/Field";

type AdminLineUser = { lineUserId: string; displayName: string };

/**
 * 管理画面にログイン済みの人が、自分のLINEアカウントを
 * 「管理者通知の受け取り先」として登録・解除するための画面。
 * 複数人登録できる（担当者が休みのときの保険）。
 */
export default function AdminLineLinkSection({ initialUsers }: { initialUsers: AdminLineUser[] }) {
  const [users, setUsers] = useState<AdminLineUser[]>(initialUsers);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [configured, setConfigured] = useState(true);

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_LIFF_ID) setConfigured(false);
  }, []);

  async function handleLink() {
    const liffId = process.env.NEXT_PUBLIC_LIFF_ID;
    if (!liffId) {
      setError("LIFF（LINEアプリ内ブラウザ連携）が未設定です。設定手順書を確認してください。");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const liffModule = await import("@line/liff");
      const liff = liffModule.default;
      await liff.init({ liffId });
      if (!liff.isLoggedIn()) {
        liff.login({ redirectUri: window.location.href });
        return;
      }
      const profile = await liff.getProfile();
      const res = await fetch("/api/admin/line-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lineUserId: profile.userId, displayName: profile.displayName }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "登録に失敗しました。");
      } else {
        setUsers(data.adminLineUsers ?? []);
      }
    } catch {
      setError("LINEアプリ内で開いていない可能性があります。公式LINEのリッチメニュー・トーク内のリンクから開いてください。");
    } finally {
      setBusy(false);
    }
  }

  async function handleUnlink(lineUserId: string) {
    if (busy) return;
    if (!confirm("この端末を管理者通知の受け取り先から外しますか？")) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/line-link", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lineUserId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "解除に失敗しました。");
      } else {
        setUsers(data.adminLineUsers ?? []);
      }
    } catch {
      setError("通信エラーが発生しました。");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="flex flex-col gap-4">
      <div>
        <p className="text-sm font-bold text-gray-800">LINE通知の受け取り先</p>
        <HelpText>
          登録した端末のLINEに、新規注文・支払い申告などの通知が届きます。複数人登録できます（担当者が休みの日の保険になります）。
        </HelpText>
      </div>

      {users.length === 0 ? (
        <p className="rounded-lg border border-dashed border-gray-300 px-3 py-3 text-center text-sm text-gray-400">
          まだ誰も登録されていません。
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {users.map((u) => (
            <li
              key={u.lineUserId}
              className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2.5 text-sm"
            >
              <span className="font-semibold text-gray-800">{u.displayName || "（表示名なし）"}</span>
              <Button type="button" size="sm" variant="muted" disabled={busy} onClick={() => handleUnlink(u.lineUserId)}>
                解除
              </Button>
            </li>
          ))}
        </ul>
      )}

      <Button type="button" variant="outline" disabled={busy} onClick={handleLink}>
        {busy ? "処理中..." : "＋ このLINEを通知先に追加する"}
      </Button>
      {!configured && (
        <p className="text-xs text-gray-400">
          ※ LIFFが未設定のため利用できません。管理者向け設定手順書を確認してください。
        </p>
      )}
      {error && <p className="rounded-lg bg-red-50 px-3 py-2.5 text-xs font-semibold text-red-600">{error}</p>}
    </Card>
  );
}
