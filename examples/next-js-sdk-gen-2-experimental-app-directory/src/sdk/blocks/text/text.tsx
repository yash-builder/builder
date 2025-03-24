'use client';
import * as React from 'react';
import type { TextProps } from './text.types';
import { useContext } from 'react';
import { BuilderDataProps } from '@/sdk/types/builder-props';
import { BuilderContext } from '@/sdk/context';
import { BuilderBlock, BuilderContent } from '@/sdk/server-index';

function _Text(props: TextProps) {
  return (
    <div
      className="builder-text"
      dangerouslySetInnerHTML={{ __html: props.text?.toString() || '' }}
      style={{
        outline: 'none',
      }}
    />
  );
}

/**
 * Recursively searches for a block by ID.
 *
 * @param blocks The blocks to search through.
 * @param id The ID of the block to search for.
 * @returns The block if found, otherwise null.
 */
const _findBlockById = (blocks: BuilderBlock[] | undefined, id: string) => {
  if (!blocks) return null;
  for (const block of blocks) {
    if (block.id === id) return block;

    if (block.children) {
      const child = _findBlockById(block.children, id);
      if (child) return child;
    }
  }
  return null;
};

const findBlockById = (content: BuilderContent, id: string) => {
  return _findBlockById(content.data?.blocks, id);
};

function LiveEditing(props: { component: React.ComponentType<any>; id: string }) {
  const context = useContext(BuilderContext);

  const block = findBlockById(context.content!, props.id);
  const options = block?.component?.options;

  return <props.component {...props} {...options} />;
}

function LiveEditingText(props: TextProps & BuilderDataProps) {
  return <LiveEditing component={_Text} id={props.builderBlock.id!} />;
}

export default LiveEditingText;
