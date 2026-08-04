// データストアの入り口。呼び出し側（APIルートや画面）はこのファイルの
// 関数だけを使う。実際の保存先は環境変数によって自動的に切り替わる。
//
// - UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN が設定されている場合
//   → Upstash Redis に保存（Vercelなどサーバーレス環境向け。無料枠あり）
// - 設定されていない場合（ローカル開発時など）
//   → data/db 以下のJSONファイルに保存
//
// バックエンドの実装は lib/backends/fileStore.ts と
// lib/backends/redisStore.ts にある。

import { fileStore } from "./backends/fileStore";
import { redisStore } from "./backends/redisStore";
import type { StoreBackend } from "./storeTypes";

export type { NameItem, MenuItem, Order, ImageInfo, UpsertOrderInput } from "./storeTypes";
export { PAYMENT_OPTIONS, DEFAULT_ADMIN_NAME } from "./storeTypes";

const useRedis = Boolean(
  (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) ||
    (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN)
);
const backend: StoreBackend = useRedis ? redisStore : fileStore;

export const listNames = backend.listNames;
export const addName = backend.addName;
export const updateNameItem = backend.updateNameItem;
export const deleteNameItem = backend.deleteNameItem;

export const listMenuItems = backend.listMenuItems;
export const addMenuItem = backend.addMenuItem;
export const updateMenuItem = backend.updateMenuItem;
export const deleteMenuItem = backend.deleteMenuItem;

export const listOrdersByDate = backend.listOrdersByDate;
export const listOrderDates = backend.listOrderDates;
export const upsertOrder = backend.upsertOrder;
export const resetOrders = backend.resetOrders;

export const getAdminName = backend.getAdminName;
export const setAdminName = backend.setAdminName;

export const getImageInfo = backend.getImageInfo;
export const saveImageFile = backend.saveImageFile;
export const getImageFile = backend.getImageFile;
