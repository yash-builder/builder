import * as React from 'react';
import BuilderContext from '../../context/builder.context';
import ComponentsContext from '../../context/components.context';
import Block from '../block/block';
import BlocksWrapper from './blocks-wrapper';
import type { BlocksProps } from './blocks.types';

function Blocks(props: BlocksProps) {
  return (
    <BlocksWrapper
      blocks={props.blocks}
      parent={props.parent}
      path={props.path}
      styleProp={props.styleProp}
      classNameProp={props.className}
      BlocksWrapper={props.context?.BlocksWrapper}
      BlocksWrapperProps={props.context?.BlocksWrapperProps}
    >
      {props.blocks && props.context && props.registeredComponents ? (
        <>
          {props.blocks?.map(block => (
            <Block
              key={block.id}
              block={block}
              linkComponent={props.linkComponent}
              context={props.context!}
              registeredComponents={props.registeredComponents!}
            />
          ))}
        </>
      ) : null}
    </BlocksWrapper>
  );
}

export default Blocks;
