import * as React from 'react';

export type DropzoneProps = BuilderDataProps &
  BuilderComponentsProp & {
    name: string;
    attributes: any;
  };
import Blocks from '../../components/blocks/blocks';
import { deoptSignal } from '../../functions/deopt';
import type { BuilderBlock } from '../../types/builder-block';
import type { BuilderComponentsProp, BuilderDataProps } from '../../types/builder-props';

function Slot(props: DropzoneProps) {
  return (
    <div
      style={{
        pointerEvents: 'auto',
      }}
      {...(!props.builderContext.context?.symbolId && {
        'builder-slot': props.name,
      })}
    >
      <Blocks
        parent={props.builderContext.context?.symbolId as string}
        path={`symbol.data.${props.name}`}
        context={props.builderContext}
        registeredComponents={props.builderComponents}
        blocks={props.builderContext.rootState?.[props.name] as BuilderBlock[]}
      />
    </div>
  );
}

export default Slot;
