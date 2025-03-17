'use server';

import type { BuilderContent } from '../../types/builder-content';
import { init } from './init';
import type { GlobalWCache } from './types';
import { revalidatePath } from 'next/cache';

export async function postPreviewContent({
  key,
  value,
  url,
}: {
  key: string;
  value: BuilderContent;
  url: string;
}) {
  init();

  (globalThis as GlobalWCache)._BUILDER_PREVIEW_LRU_CACHE.set(key, value);

  revalidatePath(url);
  return { [key]: value };
}
