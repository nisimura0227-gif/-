// ローカル動作確認用のJSONファイルバックエンド。
// UPSTASH_REDIS_REST_URL が設定されていないとき（ローカル開発時など）に使われる。
// 本番でVercel（サーバーレス）にデプロイする場合はファイル書き込みが
// 永続化されないため、redisStore.ts（Upstash Redis）が自動的に使われる。

import fs from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import type {
  NameItem,
  MenuItem,
  Order,
  ImageInfo,
  UpsertOrderInput,
  StoreBackend,
} from "../storeTypes";
import { IMAGE_MIME } from "../storeTypes";

const DB_DIR = process.env.DATA_DIR ? path.join(process.env.DATA_DIR, "db") : path.join(process.cwd(), "data", "db");
const SEED_DIR = path.join(process.cwd(), "data", "seed");

const locks = new Map<string, Promise<unknown>>();

async function withLock<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const prev = locks.get(key) ?? Promise.resolve();
  let release: () => void;
  const next = new Promise<void>((r) => (release = r));
  locks.set(
    key,
    prev.then(() => next)
  );
  await prev;
  try {
    return await fn();
  } finally {
    release!();
  }
}

async function ensureDb(file: string): Promise<void> {
  await fs.mkdir(DB_DIR, { recursive: true });
  const dbPath = path.join(DB_DIR, file);
  try {
    await fs.access(dbPath);
  } catch {
    const seedPath = path.join(SEED_DIR, file);
    try {
      const seedData = await fs.readFile(seedPath, "utf-8");
      await fs.writeFile(dbPath, seedData, "utf-8");
    } catch {
      await fs.writeFile(dbPath, "[]", "utf-8");
    }
  }
}

async function readJson<T>(file: string, fallback: T): Promise<T> {
  await ensureDb(file);
  const dbPath = path.join(DB_DIR, file);
  try {
    const raw = await fs.readFile(dbPath, "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function writeJson<T>(file: string, data: T): Promise<void> {
  await fs.mkdir(DB_DIR, { recursive: true });
  const dbPath = path.join(DB_DIR, file);
  await fs.writeFile(dbPath, JSON.stringify(data, null, 2), "utf-8");
}

async function listNames(): Promise<NameItem[]> {
  return readJson<NameItem[]>("names.json", []);
}

async function addName(name: string): Promise<NameItem> {
  return withLock("names.json", async () => {
    const list = await readJson<NameItem[]>("names.json", []);
    const item: NameItem = { id: randomUUID(), name: name.trim(), createdAt: new Date().toISOString() };
    list.push(item);
    await writeJson("names.json", list);
    return item;
  });
}

async function updateNameItem(id: string, name: string): Promise<NameItem | null> {
  return withLock("names.json", async () => {
    const list = await readJson<NameItem[]>("names.json", []);
    const idx = list.findIndex((n) => n.id === id);
    if (idx === -1) return null;
    list[idx] = { ...list[idx], name: name.trim() };
    await writeJson("names.json", list);
    return list[idx];
  });
}

async function deleteNameItem(id: string): Promise<void> {
  return withLock("names.json", async () => {
    const list = await readJson<NameItem[]>("names.json", []);
    await writeJson(
      "names.json",
      list.filter((n) => n.id !== id)
    );
  });
}

async function listMenuItems(): Promise<MenuItem[]> {
  return readJson<MenuItem[]>("menu.json", []);
}

async function addMenuItem(name: string): Promise<MenuItem> {
  return withLock("menu.json", async () => {
    const list = await readJson<MenuItem[]>("menu.json", []);
    const item: MenuItem = { id: randomUUID(), name: name.trim(), createdAt: new Date().toISOString() };
    list.push(item);
    await writeJson("menu.json", list);
    return item;
  });
}

async function updateMenuItem(id: string, name: string): Promise<MenuItem | null> {
  return withLock("menu.json", async () => {
    const list = await readJson<MenuItem[]>("menu.json", []);
    const idx = list.findIndex((m) => m.id === id);
    if (idx === -1) return null;
    list[idx] = { ...list[idx], name: name.trim() };
    await writeJson("menu.json", list);
    return list[idx];
  });
}

async function deleteMenuItem(id: string): Promise<void> {
  return withLock("menu.json", async () => {
    const list = await readJson<MenuItem[]>("menu.json", []);
    await writeJson(
      "menu.json",
      list.filter((m) => m.id !== id)
    );
  });
}

async function listOrdersByDate(deliveryDate: string): Promise<Order[]> {
  const all = await readJson<Order[]>("orders.json", []);
  return all
    .filter((o) => o.deliveryDate === deliveryDate)
    .sort((a, b) => a.orderedAt.localeCompare(b.orderedAt));
}

async function listOrderDates(): Promise<string[]> {
  const all = await readJson<Order[]>("orders.json", []);
  const set = new Set(all.map((o) => o.deliveryDate));
  return Array.from(set).sort((a, b) => b.localeCompare(a));
}

async function upsertOrder(input: UpsertOrderInput): Promise<Order> {
  return withLock("orders.json", async () => {
    const all = await readJson<Order[]>("orders.json", []);
    const now = new Date().toISOString();
    const idx = all.findIndex((o) => o.deliveryDate === input.deliveryDate && o.name === input.name);
    let record: Order;
    if (idx !== -1) {
      record = {
        ...all[idx],
        menuItem: input.menuItem,
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
        paymentMethod: input.paymentMethod,
        orderedAt: now,
      };
      all.push(record);
    }
    await writeJson("orders.json", all);
    return record;
  });
}

async function getImageInfo(): Promise<ImageInfo> {
  return readJson<ImageInfo>("image.json", null);
}

async function saveImageFile(buffer: Buffer, ext: string): Promise<ImageInfo> {
  return withLock("image.json", async () => {
    await fs.mkdir(DB_DIR, { recursive: true });
    const prev = await readJson<ImageInfo>("image.json", null);
    if (prev?.ext) {
      await fs.unlink(path.join(DB_DIR, `menu-image.${prev.ext}`)).catch(() => {});
    }
    await fs.writeFile(path.join(DB_DIR, `menu-image.${ext}`), buffer);
    const info: ImageInfo = { ext, updatedAt: new Date().toISOString() };
    await writeJson("image.json", info);
    return info;
  });
}

async function getImageFile(): Promise<{ buffer: Buffer; contentType: string } | null> {
  const info = await readJson<ImageInfo>("image.json", null);
  if (!info?.ext) return null;
  try {
    const buffer = await fs.readFile(path.join(DB_DIR, `menu-image.${info.ext}`));
    return { buffer, contentType: IMAGE_MIME[info.ext] ?? "application/octet-stream" };
  } catch {
    return null;
  }
}

export const fileStore: StoreBackend = {
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
  getImageInfo,
  saveImageFile,
  getImageFile,
};
