import { LRUCache } from './helpers';
import type { GlobalWCache } from './types';

export function init() {
  if (!(globalThis as GlobalWCache)._BUILDER_PREVIEW_LRU_CACHE) {
    (globalThis as GlobalWCache)._BUILDER_PREVIEW_LRU_CACHE = new LRUCache({
      capacity: 500,
    });
  }
}
