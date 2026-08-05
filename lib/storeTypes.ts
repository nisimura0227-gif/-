// データストアが扱う型定義。file / redis どちらのバックエンドも
// この形に合わせて実装する。

export type NameItem = { id: string; name: string; createdAt: string };

export type MenuItem = { id: string; name: string; price: number; createdAt: string };

export type Order = {
  id: string;
  deliveryDate: string; // "YYYY-MM-DD" お弁当を食べる日
  orderedVia: "today" | "tomorrow";
  name: string;
  menuItem: string;
  isLarge: boolean; // 大盛り
  /** 注文時点のメニュー単価。後でメニューの金額を変えても過去の注文がずれないよう記録しておく */
  unitPrice: number;
  /** 注文時点の大盛り追加料金。大盛りでなければ 0 */
  largeExtra: number;
  paymentMethod: string;
  /** 管理者が支払いを確認したかどうか */
  isPaid: boolean;
  orderedAt: string; // ISO timestamp
};

export type ImageInfo = { ext: string; updatedAt: string } | null;

export type UpsertOrderInput = {
  deliveryDate: string;
  orderedVia: "today" | "tomorrow";
  name: string;
  menuItem: string;
  isLarge: boolean;
  unitPrice: number;
  largeExtra: number;
  paymentMethod: string;
};

/** 管理画面から変更できる設定。まとめて1つのオブジェクトとして保存する。 */
export type Settings = {
  /** 現在の担当者名。一般ユーザー画面にも表示される */
  adminName: string;
  /** 受付締切（JST） */
  cutoffHour: number;
  cutoffMinute: number;
  /** 大盛りの追加料金（円） */
  largeExtraPrice: number;
  /** お弁当屋の電話番号 */
  shopPhone: string;
};

export const DEFAULT_SETTINGS: Settings = {
  adminName: "管理者",
  cutoffHour: 7,
  cutoffMinute: 55,
  largeExtraPrice: 100,
  shopPhone: "070-6426-7880",
};

/** 保存されている設定に足りない項目があってもアプリが壊れないよう既定値で補う */
export function normalizeSettings(raw: Partial<Settings> | null | undefined): Settings {
  const s = raw ?? {};
  const int = (v: unknown, fallback: number) => {
    const n = Number(v);
    return Number.isFinite(n) ? Math.trunc(n) : fallback;
  };
  const hour = Math.min(23, Math.max(0, int(s.cutoffHour, DEFAULT_SETTINGS.cutoffHour)));
  const minute = Math.min(59, Math.max(0, int(s.cutoffMinute, DEFAULT_SETTINGS.cutoffMinute)));
  return {
    adminName: (typeof s.adminName === "string" && s.adminName.trim()) || DEFAULT_SETTINGS.adminName,
    cutoffHour: hour,
    cutoffMinute: minute,
    largeExtraPrice: Math.max(0, int(s.largeExtraPrice, DEFAULT_SETTINGS.largeExtraPrice)),
    shopPhone: (typeof s.shopPhone === "string" && s.shopPhone.trim()) || DEFAULT_SETTINGS.shopPhone,
  };
}

export const IMAGE_MIME: Record<string, string> = {
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

// 支払い方法の選択肢（今日の注文のみ。現金ケースは色で区別）
export const PAYMENT_OPTIONS = [
  "赤色のケースに現金を入れました",
  "青色のケースに現金を入れました",
  "黄色のケースに現金を入れました",
  "緑色のケースに現金を入れました",
  "手渡し",
];

/** 注文1件の合計金額（単価 + 大盛り追加料金） */
export function orderTotal(order: Pick<Order, "unitPrice" | "largeExtra">): number {
  const unit = Number.isFinite(order.unitPrice) ? order.unitPrice : 0;
  const extra = Number.isFinite(order.largeExtra) ? order.largeExtra : 0;
  return unit + extra;
}

export interface StoreBackend {
  listNames(): Promise<NameItem[]>;
  addName(name: string): Promise<NameItem>;
  updateNameItem(id: string, name: string): Promise<NameItem | null>;
  deleteNameItem(id: string): Promise<void>;

  listMenuItems(): Promise<MenuItem[]>;
  addMenuItem(name: string, price: number): Promise<MenuItem>;
  updateMenuItem(id: string, name: string, price: number): Promise<MenuItem | null>;
  deleteMenuItem(id: string): Promise<void>;

  listOrdersByDate(deliveryDate: string): Promise<Order[]>;
  listOrderDates(): Promise<string[]>;
  findOrder(deliveryDate: string, name: string): Promise<Order | null>;
  upsertOrder(input: UpsertOrderInput): Promise<Order>;
  deleteOrder(id: string): Promise<void>;
  setOrderPaid(id: string, isPaid: boolean): Promise<Order | null>;

  getSettings(): Promise<Settings>;
  saveSettings(patch: Partial<Settings>): Promise<Settings>;

  getImageInfo(): Promise<ImageInfo>;
  saveImageFile(buffer: Buffer, ext: string): Promise<ImageInfo>;
  getImageFile(): Promise<{ buffer: Buffer; contentType: string } | null>;
}
