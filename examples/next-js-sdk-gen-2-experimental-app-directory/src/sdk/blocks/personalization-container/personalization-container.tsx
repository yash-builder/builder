'use client';
import * as React from 'react';
import { useState, useRef, useEffect } from 'react';
import Blocks from '../../components/blocks/blocks';
import InlinedScript from '../../components/inlined-script';
import InlinedStyles from '../../components/inlined-styles';
import { isEditing } from '../../functions/is-editing';
import { isPreviewing } from '../../functions/is-previewing';
import { getDefaultCanTrack } from '../../helpers/canTrack';
import { userAttributesService } from '../../helpers/user-attributes';
import {
  checkShouldRenderVariants,
  filterWithCustomTargeting,
  getBlocksToRender,
  getPersonalizationScript,
} from './helpers';
import type { PersonalizationContainerProps } from './personalization-container.types';

function PersonalizationContainer(props: PersonalizationContainerProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [userAttributes, setUserAttributes] = useState(() =>
    userAttributesService.getUserAttributes()
  );

  const [scriptStr, setScriptStr] = useState(() =>
    getPersonalizationScript(
      props.variants,
      props.builderBlock?.id || 'none',
      props.builderContext?.rootState?.locale as string | undefined
    )
  );

  const [unsubscribers, setUnsubscribers] = useState<any[]>(() => []);

  const [shouldRenderVariants, setShouldRenderVariants] = useState(() =>
    checkShouldRenderVariants(props.variants, getDefaultCanTrack(props.builderContext?.canTrack))
  );

  const [isHydrated, setIsHydrated] = useState(() => false);

  function filteredVariants() {
    return (props.variants || []).filter(variant => {
      return filterWithCustomTargeting(
        {
          ...(props.builderContext?.rootState?.locale
            ? {
                locale: props.builderContext?.rootState?.locale,
              }
            : {}),
          ...(userAttributes as any),
        },
        variant.query,
        variant.startDate,
        variant.endDate
      );
    });
  }

  function blocksToRender() {
    return getBlocksToRender({
      variants: props.variants,
      fallbackBlocks: props.builderBlock?.children,
      isHydrated: isHydrated,
      filteredVariants: filteredVariants(),
      previewingIndex: props.previewingIndex,
    });
  }

  function hideVariantsStyleString() {
    return (props.variants || [])
      .map(
        (_, index) => `[data-variant-id="${props.builderBlock?.id}-${index}"] { display: none; } `
      )
      .join('');
  }

  useEffect(() => {
    setIsHydrated(true);
    const unsub = userAttributesService.subscribeOnUserAttributesChange(attrs => {
      setUserAttributes(attrs);
    });
    if (!(isEditing() || isPreviewing())) {
      const variant = filteredVariants()[0];
      if (rootRef.current) {
        rootRef.current.dispatchEvent(
          new CustomEvent('builder.variantLoaded', {
            detail: {
              variant: variant || 'default',
              content: props.builderContext?.content,
            },
            bubbles: true,
          })
        );
        const observer = new IntersectionObserver(entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting && rootRef.current) {
              rootRef.current.dispatchEvent(
                new CustomEvent('builder.variantDisplayed', {
                  detail: {
                    variant: variant || 'default',
                    content: props.builderContext?.content,
                  },
                  bubbles: true,
                })
              );
            }
          });
        });
        observer.observe(rootRef.current);
      }
    }
    unsubscribers.push(unsub);
  }, []);

  useEffect(() => {
    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, []);

  return (
    <div
      ref={rootRef}
      {...props.attributes}
      className={`builder-personalization-container ${props.attributes?.className || ''}`}
    >
      {shouldRenderVariants ? (
        <>
          {props.variants?.map((variant, index) => (
            <template key={index} data-variant-id={`${props.builderBlock?.id}-${index}`}>
              <Blocks
                blocks={variant.blocks}
                parent={props.builderBlock?.id}
                path={`component.options.variants.${index}.blocks`}
              />
            </template>
          ))}
          <InlinedStyles
            nonce={props.builderContext?.nonce || ''}
            styles={hideVariantsStyleString()}
            id={`variants-styles-${props.builderBlock?.id}`}
          />
          <InlinedScript
            nonce={props.builderContext?.nonce || ''}
            scriptStr={scriptStr}
            id={`variants-script-${props.builderBlock?.id}`}
          />
        </>
      ) : null}
      <Blocks
        blocks={blocksToRender().blocks}
        parent={props.builderBlock?.id}
        path={blocksToRender().path}
      />
    </div>
  );
}

export default PersonalizationContainer;
