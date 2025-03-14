import * as React from 'react';

type Props = Omit<BlockProps, 'context'> & {
  repeatContext: BuilderContextInterface;
};
import BuilderContext from '../../../context/builder.context';
import type { BuilderContextInterface } from '../../../context/types';
import type { BlockProps } from '../block';
import Block from '../block';

function RepeatedBlock(props: Props) {
  const store = props.repeatContext;

  return (
    <Block
      block={props.block}
      context={store}
      registeredComponents={props.registeredComponents}
      linkComponent={props.linkComponent}
    />
  );
}

export default RepeatedBlock;
