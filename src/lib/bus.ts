// src/lib/bus.ts
import type { ID, Post } from "../types";
import type { WorldState } from "./world";
import type { ProviderName } from "./imageProviders";

export interface EventMap {
  "avatar-portal:open": void;
  "chat:add": { role: string; text: string };
  "compose": void;
  "feed:hover": { post: Post; rect: DOMRect };
  "feed:select": { post: Post };
  "feed:repost": ID;
  "feed:refresh": void;
  "feed:provider-change": { provider?: ProviderName; query?: string };
  "feed:select-id": { id: ID };
  "orb:portal": { x: number; y: number };
  "post:comment": { id: ID; body: string };
  "post:react": { id: ID; emoji: string };
  "post:focus": { id: ID };
  "post:remix": { id: ID };
  "profile:open": { id: ID };
  "sidebar:toggle": void;
  "sidebar:open": void;
  "sidebar:close": void;
  "world:update": Partial<WorldState>;
}

type Handler<K extends keyof EventMap> = (payload: EventMap[K]) => void;
const listeners = new Map<keyof EventMap, Set<Handler<any>>>();

export function on<K extends keyof EventMap>(event: K, handler: Handler<K>) {
  if (!listeners.has(event)) listeners.set(event, new Set());
  listeners.get(event)!.add(handler as Handler<any>);
  return () => off(event, handler);
}

export function off<K extends keyof EventMap>(event: K, handler: Handler<K>) {
  const handlers = listeners.get(event);
  handlers?.delete(handler as Handler<any>);
  if (handlers && handlers.size === 0) listeners.delete(event);
}

export function emit<K extends keyof EventMap>(
  event: K,
  ...args: EventMap[K] extends undefined
    ? [payload?: EventMap[K], onError?: (err: unknown) => void]
    : [payload: EventMap[K], onError?: (err: unknown) => void]
) {
  const [payload, onError] = args;
  const handlers = listeners.get(event);
  if (!handlers) return;
  for (const fn of handlers) {
    try {
      (fn as Handler<K>)(payload as EventMap[K]);
    } catch (e) {
      if (onError) onError(e);
      else throw e;
    }
  }
}

export default { on, off, emit };
