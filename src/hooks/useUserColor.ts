"use client";

import { useMemo } from "react";

const COLOR_PALETTE = [
  "#7EB8DA",
  "#F2A7C3",
  "#8ECFA0",
  "#B8A9E8",
  "#F5C28D",
  "#7DD4C0",
  "#E8879B",
  "#A3C4F3",
  "#D4A5E5",
  "#9ED8B5"
] as const;

const STORAGE_KEY = "pookie-press-user-id";

function getOrCreateUserId(): string {
  if (typeof window === "undefined") return "server";

  let id = localStorage.getItem(STORAGE_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(STORAGE_KEY, id);
  }
  return id;
}

function hashToIndex(str: string, max: number): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) % max;
}

export function getUserColor(): string {
  const userId = getOrCreateUserId();
  const index = hashToIndex(userId, COLOR_PALETTE.length);
  return COLOR_PALETTE[index];
}

export function useUserColor(): string {
  return useMemo(() => getUserColor(), []);
}
