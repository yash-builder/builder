'use client';
import * as React from 'react';
import { useState, useContext, useRef, useEffect } from 'react';

type BuilderEditorProps = Omit<
  ContentProps,
  | 'customComponents'
  | 'apiVersion'
  | 'isSsrAbTest'
  | 'blocksWrapper'
  | 'blocksWrapperProps'
  | 'linkComponent'
> & {
  builderContextSignal: BuilderContextInterface;
  setBuilderContextSignal?: (signal: any) => any;
  children?: any;
};
import builderContext from '../../../context/builder.context';
import type { BuilderContextInterface } from '../../../context/types';
import { evaluate } from '../../../functions/evaluate/index';
import { fastClone } from '../../../functions/fast-clone';
import { fetchOneEntry } from '../../../functions/get-content/index';
import { isBrowser } from '../../../functions/is-browser';
import { isEditing } from '../../../functions/is-editing';
import { isPreviewing } from '../../../functions/is-previewing';
import { logFetch } from '../../../functions/log-fetch';
import { createRegisterComponentMessage } from '../../../functions/register-component';
import { _track } from '../../../functions/track/index';
import { getInteractionPropertiesForEvent } from '../../../functions/track/interaction';
import { getDefaultCanTrack } from '../../../helpers/canTrack';
import { getCookieSync } from '../../../helpers/cookie';
import { postPreviewContent } from '../../../helpers/preview-lru-cache/set';
import { createEditorListener } from '../../../helpers/subscribe-to-editor';
import { registerInsertMenu, setupBrowserForEditing } from '../../../scripts/init-editing';
import type { BuilderContent } from '../../../types/builder-content';
import type { ComponentInfo } from '../../../types/components';
import type { Dictionary } from '../../../types/typescript';
import { triggerAnimation } from '../../block/animator';
import DynamicDiv from '../../dynamic-div';
import type { BuilderComponentStateChange, ContentProps } from '../content.types';
import { needsElementRefDivForEditing } from './enable-editor.helpers';
import { getWrapperClassName } from './styles.helpers';
import { useRouter } from 'next/navigation';

function EnableEditor(props: BuilderEditorProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const [hasExecuted, setHasExecuted] = useState<boolean>(() => false);

  function mergeNewRootState(newData: Dictionary<any>) {
    const combinedState = {
      ...props.builderContextSignal.rootState,
      ...newData,
    };
    if (props.builderContextSignal.rootSetState) {
      props.builderContextSignal.rootSetState?.(combinedState);
    } else {
      props.builderContextSignal.rootState = combinedState;
    }
  }

  function mergeNewContent(newContent: BuilderContent) {
    const newContentValue = {
      ...props.builderContextSignal.content,
      ...newContent,
      data: {
        ...props.builderContextSignal.content?.data,
        ...newContent?.data,
      },
      meta: {
        ...props.builderContextSignal.content?.meta,
        ...newContent?.meta,
        breakpoints:
          newContent?.meta?.breakpoints || props.builderContextSignal.content?.meta?.breakpoints,
      },
    };
    // const decideEditType = (content: BuilderContent) => {}
    // const editType = decideEditType(newContentValue);

    postPreviewContent({
      value: newContentValue,
      key: newContentValue.id!,
      url: window.location.pathname,
    });
  }

  function showContentProps() {
    return props.showContent
      ? {}
      : {
          hidden: true,
          'aria-hidden': true,
        };
  }

  const [ContentWrapper, setContentWrapper] = useState(() => props.contentWrapper || 'div');

  function processMessage(event: MessageEvent) {
    return createEditorListener({
      model: props.model,
      trustedHosts: props.trustedHosts,
      callbacks: {
        configureSdk: messageContent => {
          const { breakpoints, contentId } = messageContent;
          if (!contentId || contentId !== props.builderContextSignal.content?.id) {
            return;
          }
          if (breakpoints) {
            mergeNewContent({
              meta: {
                breakpoints,
              },
            });
          }
        },
        animation: animation => {
          triggerAnimation(animation);
        },
        contentUpdate: newContent => {
          mergeNewContent(newContent);
        },
        stateUpdate: newState => {
          mergeNewRootState(newState);
        },
      },
    })(event);
  }

  const [httpReqsData, setHttpReqsData] = useState(() => ({}));

  const [httpReqsPending, setHttpReqsPending] = useState(() => ({}));

  const [clicked, setClicked] = useState(() => false);

  function onClick(event: any) {
    if (props.builderContextSignal.content) {
      const variationId = props.builderContextSignal.content?.testVariationId;
      const contentId = props.builderContextSignal.content?.id;
      _track({
        apiHost: props.apiHost,
        type: 'click',
        canTrack: getDefaultCanTrack(props.canTrack),
        contentId,
        apiKey: props.apiKey,
        variationId: variationId !== contentId ? variationId : undefined,
        ...getInteractionPropertiesForEvent(event),
        unique: !clicked,
      });
    }
    if (!clicked) {
      setClicked(true);
    }
  }

  function runHttpRequests() {
    const requests: {
      [key: string]: string;
    } = props.builderContextSignal.content?.data?.httpRequests ?? {};
    Object.entries(requests).forEach(([key, url]) => {
      if (!url) return;

      // request already in progress
      if (httpReqsPending[key]) return;

      // request already completed, and not in edit mode
      if (httpReqsData[key] && !isEditing()) return;
      httpReqsPending[key] = true;
      const evaluatedUrl = url.replace(/{{([^}]+)}}/g, (_match, group) =>
        String(
          evaluate({
            code: group,
            context: props.context || {},
            localState: undefined,
            rootState: props.builderContextSignal.rootState,
            rootSetState: props.builderContextSignal.rootSetState,
          })
        )
      );
      logFetch(evaluatedUrl);
      fetch(evaluatedUrl)
        .then(response => response.json())
        .then(json => {
          mergeNewRootState({
            [key]: json,
          });
          httpReqsData[key] = true;
        })
        .catch(err => {
          console.error('error fetching dynamic data', url, err);
        })
        .finally(() => {
          httpReqsPending[key] = false;
        });
    });
  }

  function emitStateUpdate() {
    if (isEditing()) {
      window.dispatchEvent(
        new CustomEvent<BuilderComponentStateChange>('builder:component:stateChange', {
          detail: {
            state: fastClone(props.builderContextSignal.rootState),
            ref: {
              name: props.model,
            },
          },
        })
      );
    }
  }

  function elementRef_onIniteditingbldr(event) {
    window.addEventListener('message', processMessage);
    registerInsertMenu();
    setupBrowserForEditing({
      ...(props.locale
        ? {
            locale: props.locale,
          }
        : {}),
      ...(props.enrich
        ? {
            enrich: props.enrich,
          }
        : {}),
      ...(props.trustedHosts
        ? {
            trustedHosts: props.trustedHosts,
          }
        : {}),
      modelName: props.model ?? '',
      apiKey: props.apiKey,
    });
    Object.values<ComponentInfo>(props.builderContextSignal.componentInfos).forEach(
      registeredComponent => {
        if (
          !registeredComponent.models?.length ||
          registeredComponent.models.includes(props.model)
        ) {
          const message = createRegisterComponentMessage(registeredComponent);
          window.parent?.postMessage(message, '*');
        }
      }
    );
    window.addEventListener('builder:component:stateChangeListenerActivated', emitStateUpdate);
  }

  function elementRef_onInitpreviewingbldr(event) {
    const searchParams = new URL(location.href).searchParams;
    const searchParamPreviewModel = searchParams.get('builder.preview');
    const searchParamPreviewId = searchParams.get(`builder.overrides.${searchParamPreviewModel}`);
    const previewApiKey = searchParams.get('apiKey') || searchParams.get('builder.space');

    /**
     * Make sure that:
     * - the preview model name is the same as the one we're rendering, since there can be multiple models rendered *  at the same time, e.g. header/page/footer. * - the API key is the same, since we don't want to preview content from other organizations.
     * - if there is content, that the preview ID is the same as that of the one we receive.
     *
     * TO-DO: should we only update the state when there is a change?
     **/
    if (
      searchParamPreviewModel === 'BUILDER_STUDIO' ||
      (searchParamPreviewModel === props.model &&
        previewApiKey === props.apiKey &&
        (!props.content || searchParamPreviewId === props.content.id))
    ) {
      fetchOneEntry({
        model: props.model,
        apiKey: props.apiKey,
        apiVersion: props.builderContextSignal.apiVersion,
        ...(searchParamPreviewModel === 'BUILDER_STUDIO' && props.context?.symbolId
          ? {
              query: {
                id: props.context.symbolId,
              },
            }
          : {}),
      }).then(content => {
        if (content) {
          mergeNewContent(content);
        }
      });
    }
  }

  const router = useRouter();

  const hasInitialized = useRef(false);
  if (!hasInitialized.current) {
    runHttpRequests();
    emitStateUpdate();
    hasInitialized.current = true;
  }

  useEffect(() => {
    elementRef.current?.addEventListener('initeditingbldr', elementRef_onIniteditingbldr);
    return () =>
      elementRef.current?.removeEventListener('initeditingbldr', elementRef_onIniteditingbldr);
  }, []);

  useEffect(() => {
    elementRef.current?.addEventListener('initpreviewingbldr', elementRef_onInitpreviewingbldr);
    return () =>
      elementRef.current?.removeEventListener(
        'initpreviewingbldr',
        elementRef_onInitpreviewingbldr
      );
  }, []);

  useEffect(() => {
    if (isBrowser()) {
      if (isEditing() && !props.isNestedRender) {
        if (elementRef.current) {
          elementRef.current.dispatchEvent(new CustomEvent('initeditingbldr'));
        }
      }
      const shouldTrackImpression =
        props.builderContextSignal.content && getDefaultCanTrack(props.canTrack);
      const winningVariantId = getCookieSync({
        name: `builder.tests.${props.builderContextSignal.content?.id}`,
        canTrack: true,
      });
      const variationId = props.builderContextSignal.content?.testVariationId;
      if (shouldTrackImpression && variationId === winningVariantId) {
        const contentId = props.builderContextSignal.content?.id;
        const apiKeyProp = props.apiKey;
        _track({
          apiHost: props.apiHost,
          type: 'impression',
          canTrack: true,
          contentId,
          apiKey: apiKeyProp!,
          variationId: winningVariantId !== contentId ? winningVariantId : undefined,
        });
      }

      /**
       * Override normal content in preview mode.
       * We ignore this when editing, since the edited content is already being sent from the editor via post messages.
       */
      if (isPreviewing() && !isEditing()) {
      }
    }
  }, []);

  useEffect(() => {}, [props.content]);
  useEffect(() => {
    emitStateUpdate();
  }, [props.builderContextSignal.rootState]);
  useEffect(() => {
    if (props.data) {
      mergeNewRootState(props.data);
    }
  }, [props.data]);
  useEffect(() => {
    if (props.locale) {
      mergeNewRootState({
        locale: props.locale,
      });
    }
  }, [props.locale]);

  useEffect(() => {
    return () => {
      if (isBrowser()) {
        window.removeEventListener('message', processMessage);
        window.removeEventListener(
          'builder:component:stateChangeListenerActivated',
          emitStateUpdate
        );
      }
    };
  }, []);

  return (
    <builderContext.Provider value={props.builderContextSignal}>
      {props.builderContextSignal.content || needsElementRefDivForEditing() ? (
        <ContentWrapper
          {...{}}
          ref={elementRef}
          onClick={event => onClick(event)}
          builder-content-id={props.builderContextSignal.content?.id}
          builder-model={props.model}
          className={getWrapperClassName(props.content?.testVariationId || props.content?.id)}
          style={{
            display:
              !props.builderContextSignal.content && needsElementRefDivForEditing()
                ? 'none'
                : undefined,
          }}
          {...{}}
          {...showContentProps()}
          {...props.contentWrapperProps}
        >
          {props.children}
        </ContentWrapper>
      ) : null}
    </builderContext.Provider>
  );
}

export default EnableEditor;
