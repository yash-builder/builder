'use client';
import * as React from 'react';
import { useState, useRef, useEffect } from 'react';

export type BlocksWrapperProps = {
  blocks: BuilderBlock[] | undefined;
  parent: string | undefined;
  path: string | undefined;
  styleProp: Record<string, any> | undefined;
  /**
   * The element that wraps each list of blocks. Defaults to a `div` element ('ScrollView' in React Native).
   */
  BlocksWrapper: any;
  /**
   * Additonal props to pass to `blocksWrapper`. Defaults to `{}`.
   */
  BlocksWrapperProps: any;
  children?: any;
  classNameProp?: string;
};
import { isEditing } from '../../functions/is-editing';
import type { BuilderBlock } from '../../types/builder-block';

function BlocksWrapper(props: BlocksWrapperProps) {
  const blocksWrapperRef = useRef<HTMLDivElement>(null);
  const [shouldUpdate, setShouldUpdate] = useState(() => false);

  function className() {
    return ['builder-blocks', !props.blocks?.length ? 'no-blocks' : '', props.classNameProp]
      .filter(Boolean)
      .join(' ');
  }

  function dataPath() {
    if (!props.path) {
      return undefined;
    }
    const thisPrefix = 'this.';
    const pathPrefix = 'component.options.';
    return props.path.startsWith(thisPrefix)
      ? props.path.replace(thisPrefix, '')
      : props.path.startsWith(pathPrefix)
        ? props.path
        : `${pathPrefix}${props.path || ''}`;
  }

  function onClick() {
    if (isEditing() && !props.blocks?.length) {
      window.parent?.postMessage(
        {
          type: 'builder.clickEmptyBlocks',
          data: {
            parentElementId: props.parent,
            dataPath: dataPath(),
          },
        },
        '*'
      );
    }
  }

  function onMouseEnter() {
    if (isEditing() && !props.blocks?.length) {
      window.parent?.postMessage(
        {
          type: 'builder.hoverEmptyBlocks',
          data: {
            parentElementId: props.parent,
            dataPath: dataPath(),
          },
        },
        '*'
      );
    }
  }

  useEffect(() => {}, []);

  useEffect(() => {}, [props.blocks]);

  return (
    <>
      <props.BlocksWrapper
        ref={blocksWrapperRef}
        className={className() + ' props-blocks-wrapper-2b05e766'}
        builder-path={dataPath()}
        builder-parent-id={props.parent}
        {...{}}
        style={props.styleProp}
        onClick={event => onClick()}
        onMouseEnter={event => onMouseEnter()}
        onKeyPress={event => onClick()}
        {...props.BlocksWrapperProps}
      >
        {props.children}
      </props.BlocksWrapper>

      <style>{`.props-blocks-wrapper-2b05e766 {
  display: flex;
  flex-direction: column;
  align-items: stretch;
}`}</style>
    </>
  );
}

export default BlocksWrapper;
