import * as React from 'react';

type VariantsProviderProps = ContentVariantsPrps & {
  /**
   * For internal use only. Do not provide this prop.
   */
  isNestedRender?: boolean;
};
import { TARGET } from '../../constants/target';
import { handleABTestingSync } from '../../helpers/ab-tests';
import { getDefaultCanTrack } from '../../helpers/canTrack';
import ContentComponent from '../content/content';
import InlinedScript from '../inlined-script';
import InlinedStyles from '../inlined-styles';
import type { ContentVariantsPrps } from './content-variants.types';
import {
  checkShouldRenderVariants,
  getInitVariantsFnsScriptString,
  getUpdateCookieAndStylesScript,
  getVariants,
} from './helpers';

function ContentVariants(props: VariantsProviderProps) {
  const shouldRenderVariants = checkShouldRenderVariants({
    canTrack: getDefaultCanTrack(props.canTrack),
    content: props.content,
  });
  const updateCookieAndStylesScriptStr = function updateCookieAndStylesScriptStr() {
    return getUpdateCookieAndStylesScript(
      getVariants(props.content).map(value => ({
        id: value.testVariationId!,
        testRatio: value.testRatio,
      })),
      props.content?.id || ''
    );
  };
  const hideVariantsStyleString = function hideVariantsStyleString() {
    return getVariants(props.content)
      .map(value => `.variant-${value.testVariationId} { display: none; } `)
      .join('');
  };
  const defaultContent = function defaultContent() {
    return shouldRenderVariants
      ? {
          ...props.content,
          testVariationId: props.content?.id,
        }
      : handleABTestingSync({
          item: props.content,
          canTrack: getDefaultCanTrack(props.canTrack),
        });
  };

  return (
    <>
      {!props.isNestedRender && TARGET !== 'reactNative' ? (
        <InlinedScript
          id="builderio-init-variants-fns"
          scriptStr={getInitVariantsFnsScriptString()}
          nonce={props.nonce || ''}
        />
      ) : null}
      {shouldRenderVariants ? (
        <>
          <InlinedStyles
            id="builderio-variants"
            styles={hideVariantsStyleString()}
            nonce={props.nonce || ''}
          />
          <InlinedScript
            id="builderio-variants-visibility"
            scriptStr={updateCookieAndStylesScriptStr()}
            nonce={props.nonce || ''}
          />
          {getVariants(props.content)?.map(variant => (
            <ContentComponent
              apiHost={props.apiHost}
              isNestedRender={props.isNestedRender}
              key={variant.testVariationId}
              nonce={props.nonce}
              content={variant}
              showContent={false}
              model={props.model}
              data={props.data}
              context={props.context}
              apiKey={props.apiKey}
              apiVersion={props.apiVersion}
              customComponents={props.customComponents}
              linkComponent={props.linkComponent}
              canTrack={props.canTrack}
              locale={props.locale}
              enrich={props.enrich}
              isSsrAbTest={shouldRenderVariants}
              blocksWrapper={props.blocksWrapper}
              blocksWrapperProps={props.blocksWrapperProps}
              contentWrapper={props.contentWrapper}
              contentWrapperProps={props.contentWrapperProps}
              trustedHosts={props.trustedHosts}
              {...{}}
            />
          ))}
        </>
      ) : null}
      <ContentComponent
        apiHost={props.apiHost}
        nonce={props.nonce}
        isNestedRender={props.isNestedRender}
        {...{}}
        content={defaultContent()}
        showContent
        model={props.model}
        data={props.data}
        context={props.context}
        apiKey={props.apiKey}
        apiVersion={props.apiVersion}
        customComponents={props.customComponents}
        linkComponent={props.linkComponent}
        canTrack={props.canTrack}
        locale={props.locale}
        enrich={props.enrich}
        isSsrAbTest={shouldRenderVariants}
        blocksWrapper={props.blocksWrapper}
        blocksWrapperProps={props.blocksWrapperProps}
        contentWrapper={props.contentWrapper}
        contentWrapperProps={props.contentWrapperProps}
        trustedHosts={props.trustedHosts}
      />
    </>
  );
}

export default ContentVariants;
