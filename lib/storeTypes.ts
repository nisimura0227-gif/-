// データストアが扱う型定義。file / redis どちらのバックエンドも
// この形に合わせて実装する。

export type NameItem = { id: string; name: string; createdAt: string };
export type MenuItem = { id: string; name: string; createdAt: string };
export type Order = {
  id: string;
  deliveryDate: string; // "YYYY-MM-DD" お弁当を食べる日
  orderedVia: "today" | "tomorrow";
  name: string;
  menuItem: string;
  paymentMethod: string;
  orderedAt: string; // ISO timestamp
};
export type ImageInfo = { ext: string; updatedAt: string } | null;

export type UpsertOrderInput = {
  deliveryDate: string;
  orderedVia: "today" | "tomorrow";
  name: string;
  menuItem: string;
  paymentMethod: string;
};

export const IMAGE_MIME: Record<string, string> = {
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

export interface StoreBackend {
  listNames(): Promise<NameItem[]>;
  addName(name: string): Promise<NameItem>;
  updateNameItem(id: string, name: string): Promise<NameItem | null>;
  deleteNameItem(id: string): Promise<void>;

  listMenuItems(): Promise<MenuItem[]>;
  addMenuItem(name: string): Promise<MenuItem>;
  updateMenuItem(id: string, name: string): Promise<MenuItem | null>;
  deleteMenuItem(id: string): Promise<void>;

  listOrdersByDate(deliveryDate: string): Promise<Order[]>;
  listOrderDates(): Promise<string[]>;
  upsertOrder(input: UpsertOrderInput): Promise<Order>;

  getImageInfo(): Promise<ImageInfo>;
  saveImageFile(buffer: Buffer, ext: string): Promise<ImageInfo>;
  getImageFile(): Promise<{ buffer: Buffer; contentType: string } | null>;
}
