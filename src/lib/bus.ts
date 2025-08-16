// src/lib/bus.ts
import type { ID } from "../types";

interface BusEvents {
  "post:vote": { id: ID; optionIndex: number };
  [key: string]: any;
}

type Handler<T = any> = (payload: T) => void;
const listeners = new Map<string, Set<Handler>>();

export function on<E extends keyof BusEvents>(event: E, handler: Handler<BusEvents[E]>) {
  if (!listeners.has(event as string)) listeners.set(event as string, new Set());
  listeners.get(event as string)!.add(handler as Handler);
  return () => off(event, handler);
}
export function off<E extends keyof BusEvents>(event: E, handler: Handler<BusEvents[E]>) {
  const handlers = listeners.get(event as string);
  handlers?.delete(handler);
  if (handlers && handlers.size === 0) listeners.delete(event as string);
}
export function emit<E extends keyof BusEvents>(
  event: E,
  payload?: BusEvents[E],
  onError?: (err: unknown) => void,
) {
  const handlers = listeners.get(event as string);
  if (!handlers) return;
  for (const fn of handlers) {
    try {
      (fn as Handler)(payload);
    } catch (e) {
      if (onError) onError(e);
      else throw e;
    }
  }
}
export default { on, off, emit };
