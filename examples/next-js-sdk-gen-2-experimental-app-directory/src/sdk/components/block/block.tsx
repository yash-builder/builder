import * as React from 'react';

export type BlockProps = {
  block: BuilderBlock;
  context: BuilderContextInterface;
  registeredComponents: RegisteredComponents;
  linkComponent: any;
};
import { TARGET } from '../../constants/target';
import type { BuilderContextInterface, RegisteredComponents } from '../../context/types';
import { getBlockComponentOptions } from '../../functions/get-block-component-options';
import { getProcessedBlock } from '../../functions/get-processed-block';
import { isPreviewing } from '../../server-index';
import type { BuilderBlock } from '../../types/builder-block';
import DynamicDiv from '../dynamic-div';
import { bindAnimations } from './animator';
import {
  getComponent,
  getInheritedStyles,
  getRepeatItemData,
  provideBuilderBlock,
  provideBuilderContext,
  provideLinkComponent,
  provideRegisteredComponents,
} from './block.helpers';
import BlockStyles from './components/block-styles';
import BlockWrapper from './components/block-wrapper';
import type { ComponentProps } from './components/component-ref/component-ref.helpers';
import ComponentRef from './components/component-ref/component-ref';
import RepeatedBlock from './components/repeated-block';

function Block(props: BlockProps) {
  const repeatItem = function repeatItem() {
    return getRepeatItemData({
      block: props.block,
      context: props.context,
    });
  };
  const _processedBlock = {
    value: null as BuilderBlock | null,
    update: false,
  };
  const processedBlock = function processedBlock() {
    if (_processedBlock.value && !_processedBlock.update && !isPreviewing()) {
      return _processedBlock.value;
    }
    const blockToUse = props.block.repeat?.collection
      ? props.block
      : getProcessedBlock({
          block: props.block,
          localState: props.context.localState,
          rootState: props.context.rootState,
          rootSetState: props.context.rootSetState,
          context: props.context.context,
        });
    _processedBlock.value = blockToUse;
    _processedBlock.update = false;
    return blockToUse;
  };
  const blockComponent = function blockComponent() {
    return getComponent({
      block: processedBlock(),
      registeredComponents: props.registeredComponents,
      model: props.context.model,
    });
  };
  const Tag = function Tag() {
    const shouldUseLink =
      props.block.tagName === 'a' || processedBlock().properties?.href || processedBlock().href;
    if (shouldUseLink) {
      return props.linkComponent || 'a';
    }
    return props.block.tagName || 'div';
  };
  const canShowBlock = function canShowBlock() {
    if (props.block.repeat?.collection) {
      if (repeatItem()?.length) return true;
      return false;
    }
    const shouldHide = 'hide' in processedBlock() ? processedBlock().hide : false;
    const shouldShow = 'show' in processedBlock() ? processedBlock().show : true;
    return shouldShow && !shouldHide;
  };
  const childrenWithoutParentComponent = function childrenWithoutParentComponent() {
    /**
     * When there is no `componentRef`, there might still be children that need to be rendered. In this case,
     * we render them outside of `componentRef`.
     * NOTE: We make sure not to render this if `repeatItemData` is non-null, because that means we are rendering an array of
     * blocks, and the children will be repeated within those blocks.
     */
    const shouldRenderChildrenOutsideRef = !blockComponent()?.component && !repeatItem();
    return shouldRenderChildrenOutsideRef ? processedBlock().children ?? [] : [];
  };
  const componentRefProps = function componentRefProps() {
    return {
      blockChildren: processedBlock().children ?? [],
      componentRef: blockComponent()?.component,
      componentOptions: {
        ...getBlockComponentOptions(processedBlock(), props.context),
        ...provideBuilderBlock(blockComponent(), processedBlock()),
        ...provideBuilderContext(blockComponent(), props.context),
        ...provideLinkComponent(blockComponent(), props.linkComponent),
        ...provideRegisteredComponents(
          blockComponent(),
          props.registeredComponents,
          props.context.model
        ),
      },
      context: props.context,
      linkComponent: props.linkComponent,
      registeredComponents: props.registeredComponents,
      builderBlock: processedBlock(),
      includeBlockProps: blockComponent()?.noWrap === true,
      isInteractive: !(blockComponent()?.isRSC && TARGET === 'rsc'),
    };
  };

  return (
    <>
      {canShowBlock() ? (
        <>
          <BlockStyles block={processedBlock()} context={props.context} />
          {!blockComponent()?.noWrap ? (
            <>
              {!repeatItem() ? (
                <BlockWrapper Wrapper={Tag()} block={processedBlock()} context={props.context}>
                  <ComponentRef
                    componentRef={componentRefProps().componentRef}
                    componentOptions={componentRefProps().componentOptions}
                    blockChildren={componentRefProps().blockChildren}
                    context={componentRefProps().context}
                    registeredComponents={componentRefProps().registeredComponents}
                    linkComponent={componentRefProps().linkComponent}
                    builderBlock={componentRefProps().builderBlock}
                    includeBlockProps={componentRefProps().includeBlockProps}
                    isInteractive={componentRefProps().isInteractive}
                  />
                  {childrenWithoutParentComponent()?.map(child => (
                    <Block
                      key={child.id}
                      block={child}
                      registeredComponents={props.registeredComponents}
                      linkComponent={props.linkComponent}
                      context={props.context}
                    />
                  ))}
                </BlockWrapper>
              ) : (
                <>
                  {repeatItem()?.map((data, index) => (
                    <RepeatedBlock
                      key={index}
                      repeatContext={data.context}
                      block={data.block}
                      registeredComponents={props.registeredComponents}
                      linkComponent={props.linkComponent}
                    />
                  ))}
                </>
              )}
            </>
          ) : !repeatItem() ? (
            <ComponentRef
              componentRef={componentRefProps().componentRef}
              componentOptions={componentRefProps().componentOptions}
              blockChildren={componentRefProps().blockChildren}
              context={componentRefProps().context}
              registeredComponents={componentRefProps().registeredComponents}
              linkComponent={componentRefProps().linkComponent}
              builderBlock={componentRefProps().builderBlock}
              includeBlockProps={componentRefProps().includeBlockProps}
              isInteractive={componentRefProps().isInteractive}
            />
          ) : (
            <>
              {repeatItem()?.map((data, index) => (
                <RepeatedBlock
                  key={index}
                  repeatContext={data.context}
                  block={data.block}
                  registeredComponents={props.registeredComponents}
                  linkComponent={props.linkComponent}
                />
              ))}
            </>
          )}
        </>
      ) : null}
    </>
  );
}

export default Block;
