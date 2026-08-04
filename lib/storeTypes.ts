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
  paymentMethod: string;
  orderedAt: string; // ISO timestamp
};
export type ImageInfo = { ext: string; updatedAt: string } | null;

export type UpsertOrderInput = {
  deliveryDate: string;
  orderedVia: "today" | "tomorrow";
  name: string;
  menuItem: string;
  isLarge: boolean;
  paymentMethod: string;
};

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

export const DEFAULT_ADMIN_NAME = "管理者";

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
  upsertOrder(input: UpsertOrderInput): Promise<Order>;
  resetOrders(): Promise<void>;

  getAdminName(): Promise<string>;
  setAdminName(name: string): Promise<string>;

  getImageInfo(): Promise<ImageInfo>;
  saveImageFile(buffer: Buffer, ext: string): Promise<ImageInfo>;
  getImageFile(): Promise<{ buffer: Buffer; contentType: string } | null>;
}
