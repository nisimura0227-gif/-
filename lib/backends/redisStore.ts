// 本番（Vercelなどのサーバーレス環境）向けのRedisバックエンド。
// UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN が設定されているときに使われる。
// Upstash Redis（Vercel Marketplaceから無料枠で追加可能）を想定。
//
// 名前・メニュー・注文はJSON配列としてそのままキーに保存し、
// 画像はサイズが小さい（数百KB〜数MB）ことを前提にBase64文字列として
// 同じRedisに保存する（Vercelの関数からファイルシステムへの書き込みが
// 永続化されないため、画像専用の別ストレージを使わずに済む構成にしている）。

import { Redis } from "@upstash/redis";
import { randomUUID } from "crypto";
import type {
  NameItem,
  MenuItem,
  Order,
  ImageInfo,
  UpsertOrderInput,
  StoreBackend,
} from "../storeTypes";
import { IMAGE_MIME, DEFAULT_ADMIN_NAME } from "../storeTypes";

const NAMES_KEY = "bento:names";
const MENU_KEY = "bento:menu";
const ORDERS_KEY = "bento:orders";
const IMAGE_META_KEY = "bento:image:meta";
const IMAGE_DATA_KEY = "bento:image:data";
const ADMIN_NAME_KEY = "bento:adminName";

let client: Redis | null = null;
function redis(): Redis {
  if (!client) {
    // Vercel経由でUpstash連携すると環境変数名が KV_REST_API_* になっている
    // 場合があるため、両方のパターンに対応しておく。
    const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL || "";
    const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN || "";
    client = new Redis({ url, token });
  }
  return client;
}

// Upstash Redis SDKのバージョンによって、保存した値がSDK側で自動的に
// JSONパースされて返る場合と、文字列のまま返る場合があるため、
// どちらのケースでも安全に扱えるようにしている。
async function getJson<T>(key: string, fallback: T): Promise<T> {
  const raw = await redis().get(key);
  if (raw === null || raw === undefined) return fallback;
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  }
  return raw as T;
}

async function setJson<T>(key: string, value: T): Promise<void> {
  await redis().set(key, JSON.stringify(value));
}

async function listNames(): Promise<NameItem[]> {
  return getJson<NameItem[]>(NAMES_KEY, []);
}

async function addName(name: string): Promise<NameItem> {
  const list = await getJson<NameItem[]>(NAMES_KEY, []);
  const trimmed = name.trim();
  const existing = list.find((n) => n.name.toLowerCase() === trimmed.toLowerCase());
  if (existing) return existing;
  const item: NameItem = { id: randomUUID(), name: trimmed, createdAt: new Date().toISOString() };
  list.push(item);
  await setJson(NAMES_KEY, list);
  return item;
}

async function updateNameItem(id: string, name: string): Promise<NameItem | null> {
  const list = await getJson<NameItem[]>(NAMES_KEY, []);
  const idx = list.findIndex((n) => n.id === id);
  if (idx === -1) return null;
  list[idx] = { ...list[idx], name: name.trim() };
  await setJson(NAMES_KEY, list);
  return list[idx];
}

async function deleteNameItem(id: string): Promise<void> {
  const list = await getJson<NameItem[]>(NAMES_KEY, []);
  await setJson(
    NAMES_KEY,
    list.filter((n) => n.id !== id)
  );
}

async function listMenuItems(): Promise<MenuItem[]> {
  const list = await getJson<MenuItem[]>(MENU_KEY, []);
  // price追加前に登録されたメニューにはpriceが無いため、表示時に落ちないよう補正する。
  return list.map((m) => ({ ...m, price: Number.isFinite(m.price) ? m.price : 0 }));
}

async function addMenuItem(name: string, price: number): Promise<MenuItem> {
  const list = await getJson<MenuItem[]>(MENU_KEY, []);
  const item: MenuItem = {
    id: randomUUID(),
    name: name.trim(),
    price: Number.isFinite(price) ? price : 0,
    createdAt: new Date().toISOString(),
  };
  list.push(item);
  await setJson(MENU_KEY, list);
  return item;
}

async function updateMenuItem(id: string, name: string, price: number): Promise<MenuItem | null> {
  const list = await getJson<MenuItem[]>(MENU_KEY, []);
  const idx = list.findIndex((m) => m.id === id);
  if (idx === -1) return null;
  list[idx] = { ...list[idx], name: name.trim(), price: Number.isFinite(price) ? price : 0 };
  await setJson(MENU_KEY, list);
  return list[idx];
}

async function deleteMenuItem(id: string): Promise<void> {
  const list = await getJson<MenuItem[]>(MENU_KEY, []);
  await setJson(
    MENU_KEY,
    list.filter((m) => m.id !== id)
  );
}

async function listOrdersByDate(deliveryDate: string): Promise<Order[]> {
  const all = await getJson<Order[]>(ORDERS_KEY, []);
  return all
    .filter((o) => o.deliveryDate === deliveryDate)
    .sort((a, b) => a.orderedAt.localeCompare(b.orderedAt));
}

async function listOrderDates(): Promise<string[]> {
  const all = await getJson<Order[]>(ORDERS_KEY, []);
  const set = new Set(all.map((o) => o.deliveryDate));
  return Array.from(set).sort((a, b) => b.localeCompare(a));
}

async function upsertOrder(input: UpsertOrderInput): Promise<Order> {
  const all = await getJson<Order[]>(ORDERS_KEY, []);
  const now = new Date().toISOString();
  const idx = all.findIndex((o) => o.deliveryDate === input.deliveryDate && o.name === input.name);
  let record: Order;
  if (idx !== -1) {
    record = {
      ...all[idx],
      menuItem: input.menuItem,
      isLarge: input.isLarge,
      paymentMethod: input.paymentMethod,
      orderedVia: input.orderedVia,
      orderedAt: now,
    };
    all[idx] = record;
  } else {
    record = {
      id: randomUUID(),
      deliveryDate: input.deliveryDate,
      orderedVia: input.orderedVia,
      name: input.name,
      menuItem: input.menuItem,
      isLarge: input.isLarge,
      paymentMethod: input.paymentMethod,
      orderedAt: now,
    };
    all.push(record);
  }
  await setJson(ORDERS_KEY, all);
  return record;
}

async function resetOrders(): Promise<void> {
  await setJson(ORDERS_KEY, []);
}

async function getAdminName(): Promise<string> {
  const name = await getJson<string | null>(ADMIN_NAME_KEY, null);
  return name?.trim() || DEFAULT_ADMIN_NAME;
}

async function setAdminName(name: string): Promise<string> {
  const trimmed = name.trim() || DEFAULT_ADMIN_NAME;
  await setJson(ADMIN_NAME_KEY, trimmed);
  return trimmed;
}

async function getImageInfo(): Promise<ImageInfo> {
  return getJson<ImageInfo>(IMAGE_META_KEY, null);
}

async function saveImageFile(buffer: Buffer, ext: string): Promise<ImageInfo> {
  const base64 = buffer.toString("base64");
  await setJson(IMAGE_DATA_KEY, base64);
  const info: ImageInfo = { ext, updatedAt: new Date().toISOString() };
  await setJson(IMAGE_META_KEY, info);
  return info;
}

async function getImageFile(): Promise<{ buffer: Buffer; contentType: string } | null> {
  const info = await getJson<ImageInfo>(IMAGE_META_KEY, null);
  if (!info?.ext) return null;
  const base64 = await getJson<string | null>(IMAGE_DATA_KEY, null);
  if (!base64) return null;
  return { buffer: Buffer.from(base64, "base64"), contentType: IMAGE_MIME[info.ext] ?? "application/octet-stream" };
}

export const redisStore: StoreBackend = {
  listNames,
  addName,
  updateNameItem,
  deleteNameItem,
  listMenuItems,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
  listOrdersByDate,
  listOrderDates,
  upsertOrder,
  resetOrders,
  getAdminName,
  setAdminName,
  getImageInfo,
  saveImageFile,
  getImageFile,
};
