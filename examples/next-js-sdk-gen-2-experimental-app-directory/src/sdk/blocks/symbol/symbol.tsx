import * as React from 'react';
import ContentVariants from '../../components/content-variants/index';
import type { BuilderContent } from '../../types/builder-content';
import { filterAttrs } from '../helpers';
import DynamicDiv from '../../components/dynamic-div';
import { getClassPropName } from '../../functions/get-class-prop-name';
import type { Nullable } from '../../types/typescript';
import { setAttrs } from '../helpers';
import { fetchSymbolContent } from './symbol.helpers';
import type { SymbolProps } from './symbol.types';

async function Symbol(props: SymbolProps) {
  const blocksWrapper = function blocksWrapper() {
    return 'div';
  };
  const contentWrapper = function contentWrapper() {
    return 'div';
  };
  const className = function className() {
    return [
      ...[props.attributes[getClassPropName()]],
      'builder-symbol',
      props.symbol?.inline ? 'builder-inline-symbol' : undefined,
      props.symbol?.dynamic || props.dynamic ? 'builder-dynamic-symbol' : undefined,
    ]
      .filter(Boolean)
      .join(' ');
  };
  const contentToUse = (props.symbol?.content ||
    (await fetchSymbolContent({
      symbol: props.symbol,
      builderContextValue: props.builderContext,
    }))) as Nullable<BuilderContent>;
  const setContent = null;

  return (
    <div {...{}} {...props.attributes} {...{}} className={className()}>
      <ContentVariants
        nonce={props.builderContext.nonce}
        isNestedRender
        apiVersion={props.builderContext.apiVersion}
        apiKey={props.builderContext.apiKey!}
        context={{
          ...props.builderContext.context,
          symbolId: props.builderBlock?.id,
        }}
        customComponents={Object.values(props.builderComponents)}
        data={{
          ...props.symbol?.data,
          ...props.builderContext.localState,
          ...contentToUse?.data?.state,
        }}
        canTrack={props.builderContext.canTrack}
        model={props.symbol?.model ?? ''}
        content={contentToUse}
        linkComponent={props.builderLinkComponent}
        blocksWrapper={blocksWrapper()}
        contentWrapper={contentWrapper()}
      />
    </div>
  );
}

export default Symbol;
