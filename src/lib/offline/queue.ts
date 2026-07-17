"use client";

import { openDB, type DBSchema, type IDBPDatabase } from "idb";

interface OfflineDB extends DBSchema {
  queue: {
    key: string;
    value: {
      id: string;
      type: "set" | "water" | "meal";
      payload: Record<string, unknown>;
      createdAt: string;
      synced: boolean;
    };
  };
}

let dbPromise: Promise<IDBPDatabase<OfflineDB>> | null = null;

function getDb() {
  if (typeof window === "undefined") return null;
  if (!dbPromise) {
    dbPromise = openDB<OfflineDB>("esifit-offline", 1, {
      upgrade(db) {
        db.createObjectStore("queue", { keyPath: "id" });
      },
    });
  }
  return dbPromise;
}

export async function enqueueOffline(
  type: "set" | "water" | "meal",
  payload: Record<string, unknown>,
) {
  const db = await getDb();
  if (!db) return null;
  const item = {
    id: `oq_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    type,
    payload,
    createdAt: new Date().toISOString(),
    synced: false,
  };
  await db.put("queue", item);
  return item;
}

export async function listOfflineQueue() {
  const db = await getDb();
  if (!db) return [];
  return db.getAll("queue");
}

export async function markSynced(id: string) {
  const db = await getDb();
  if (!db) return;
  const item = await db.get("queue", id);
  if (!item) return;
  await db.put("queue", { ...item, synced: true });
}

export async function flushOfflineQueue() {
  const db = await getDb();
  if (!db) return 0;
  const all = await db.getAll("queue");
  const pending = all.filter((x) => !x.synced);
  // Mock sync: just mark synced after a short delay
  await new Promise((r) => setTimeout(r, 400));
  for (const item of pending) {
    await db.put("queue", { ...item, synced: true });
  }
  return pending.length;
}

export function isOnline() {
  return typeof navigator === "undefined" ? true : navigator.onLine;
}
