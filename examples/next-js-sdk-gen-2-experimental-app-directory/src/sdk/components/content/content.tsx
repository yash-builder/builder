import * as React from 'react';
import { getDefaultRegisteredComponents } from '../../constants/builder-registered-components';
import { TARGET } from '../../constants/target';
import ComponentsContext from '../../context/components.context';
import type {
  BuilderContextInterface,
  BuilderRenderState,
  RegisteredComponents,
} from '../../context/types';
import { evaluate } from '../../functions/evaluate/evaluate';
import { serializeIncludingFunctions } from '../../functions/register-component';
import { logger } from '../../helpers/logger';
import type { ComponentInfo } from '../../types/components';
import type { Dictionary } from '../../types/typescript';
import Blocks from '../blocks/blocks';
import { getUpdateVariantVisibilityScript } from '../content-variants/helpers';
import DynamicDiv from '../dynamic-div';
import InlinedScript from '../inlined-script';
import EnableEditor from './components/enable-editor';
import ContentStyles from './components/styles';
import { getContentInitialValue, getRootStateInitialValue } from './content.helpers';
import type { ContentProps } from './content.types';
import { wrapComponentRef } from './wrap-component-ref';

function ContentComponent(props: ContentProps) {
  const scriptStr = getUpdateVariantVisibilityScript({
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-non-null-asserted-optional-chain
    variationId: props.content?.testVariationId!,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-non-null-asserted-optional-chain
    contentId: props.content?.id!,
  });
  const contentSetState = function contentSetState(newRootState: BuilderRenderState) {
    console.log('contentSetState', newRootState);
    builderContextSignal.rootState = newRootState;
  };
  const registeredComponents = [
    ...getDefaultRegisteredComponents(),
    ...(props.customComponents || []),
  ].reduce<RegisteredComponents>(
    (acc, { component, ...info }) => ({
      ...acc,
      [info.name]: {
        component: component,
        ...serializeIncludingFunctions(info),
      },
    }),
    {}
  );
  const builderContextSignal = {
    content: getContentInitialValue({
      content: props.content,
      data: props.data,
    }),
    localState: undefined,
    rootState: getRootStateInitialValue({
      content: props.content,
      data: props.data,
      locale: props.locale,
    }),
    rootSetState: undefined,
    context: props.context || {},
    canTrack: props.canTrack,
    apiKey: props.apiKey,
    apiVersion: props.apiVersion,
    componentInfos: [...getDefaultRegisteredComponents(), ...(props.customComponents || [])].reduce<
      Dictionary<ComponentInfo>
    >(
      (acc, { component: _, ...info }) => ({
        ...acc,
        [info.name]: serializeIncludingFunctions(info),
      }),
      {}
    ),
    inheritedStyles: {},
    BlocksWrapper: props.blocksWrapper || 'div',
    BlocksWrapperProps: props.blocksWrapperProps || {},
    nonce: props.nonce || '',
    model: props.model,
  };

  if (!props.apiKey) {
    logger.error(
      'No API key provided to `Content` component. This can cause issues. Please provide an API key using the `apiKey` prop.'
    );
  }

  // run any dynamic JS code attached to content
  const jsCode = builderContextSignal.content?.data?.jsCode;
  if (jsCode) {
    evaluate({
      code: jsCode,
      context: props.context || {},
      localState: undefined,
      rootState: builderContextSignal.rootState,
      rootSetState: newState => {
        builderContextSignal.rootState = newState;
      },
      isExpression: false,
    });
  }

  return (
    <EnableEditor
      apiHost={props.apiHost}
      nonce={props.nonce}
      content={props.content}
      data={props.data}
      model={props.model}
      context={props.context}
      apiKey={props.apiKey}
      canTrack={props.canTrack}
      locale={props.locale}
      enrich={props.enrich}
      showContent={props.showContent}
      builderContextSignal={builderContextSignal}
      setBuilderContextSignal={contentSetState}
      contentWrapper={props.contentWrapper}
      contentWrapperProps={props.contentWrapperProps}
      trustedHosts={props.trustedHosts}
      isNestedRender={props.isNestedRender}
      {...{}}
    >
      {props.isSsrAbTest ? (
        <InlinedScript
          id="builderio-variant-visibility"
          scriptStr={scriptStr}
          nonce={props.nonce || ''}
        />
      ) : null}
      {TARGET !== 'reactNative' ? (
        <ContentStyles
          nonce={props.nonce || ''}
          isNestedRender={props.isNestedRender}
          contentId={builderContextSignal.content?.id}
          cssCode={builderContextSignal.content?.data?.cssCode}
          customFonts={builderContextSignal.content?.data?.customFonts}
        />
      ) : null}
      <Blocks
        blocks={builderContextSignal.content?.data?.blocks}
        context={builderContextSignal}
        registeredComponents={registeredComponents}
        linkComponent={props.linkComponent}
      />
    </EnableEditor>
  );
}

export default ContentComponent;
