'use client';
import * as React from 'react';
import { useState } from 'react';
import Blocks from '../../components/blocks/index';
import { camelToKebabCase } from '../../functions/camel-to-kebab-case';
import type { Dictionary } from '../../types/typescript';
import type { AccordionProps } from './accordion.types';
import { convertOrderNumberToString } from './helpers';

function Accordion(props: AccordionProps) {
  const [open, setOpen] = useState<any[]>(() => []);

  function onlyOneAtATime() {
    return Boolean(props.grid || props.oneAtATime);
  }

  function accordionStyles() {
    const styles = {
      display: 'flex' as 'flex' | 'none',
      alignItems: 'stretch' as 'stretch' | 'flex-start' | 'flex-end' | 'center' | 'baseline',
      flexDirection: 'column' as 'column' | 'row' | 'column-reverse' | 'row-reverse',
      ...(props.grid && {
        flexDirection: 'row' as 'column' | 'row' | 'column-reverse' | 'row-reverse',
        alignItems: 'flex-start' as 'stretch' | 'flex-start' | 'flex-end' | 'center' | 'baseline',
        flexWrap: 'wrap' as 'nowrap' | 'wrap',
      }),
    };
    return styles;
  }

  function accordionTitleStyles() {
    const shared = {
      display: 'flex',
      flexDirection: 'column',
    };
    const styles = {
      ...shared,
      alignItems: 'stretch',
      cursor: 'pointer',
    };
    return Object.fromEntries(
      Object.entries(styles).filter(([_, value]) => value !== undefined)
    ) as Dictionary<string>;
  }

  function getAccordionTitleClassName(index: number) {
    return `builder-accordion-title builder-accordion-title-${
      open.includes(index) ? 'open' : 'closed'
    }`;
  }

  function getAccordionDetailClassName(index: number) {
    return `builder-accordion-detail builder-accordion-detail-${
      open.includes(index) ? 'open' : 'closed'
    }`;
  }

  function openGridItemOrder() {
    let itemOrder: number | null = null;
    const getOpenGridItemPosition = props.grid && open.length;
    if (getOpenGridItemPosition && document) {
      const openItemIndex = open[0];
      const openItem = document.querySelector(
        `.builder-accordion-title[data-index="${openItemIndex}"]`
      );
      let subjectItem = openItem;
      itemOrder = openItemIndex;
      if (subjectItem) {
        let prevItemRect = subjectItem.getBoundingClientRect();
        while ((subjectItem = subjectItem && subjectItem.nextElementSibling)) {
          if (subjectItem) {
            if (subjectItem.classList.contains('builder-accordion-detail')) {
              continue;
            }
            const subjectItemRect = subjectItem.getBoundingClientRect();
            if (subjectItemRect.left > prevItemRect.left) {
              const index = parseInt(subjectItem.getAttribute('data-index') || '', 10);
              if (!isNaN(index)) {
                prevItemRect = subjectItemRect;
                itemOrder = index;
              }
            } else {
              break;
            }
          }
        }
      }
    }
    if (typeof itemOrder === 'number') {
      itemOrder = itemOrder + 1;
    }
    return itemOrder;
  }

  function accordionDetailStyles() {
    const styles = {
      ...{
        order:
          typeof openGridItemOrder() === 'number' ? (openGridItemOrder() as number) : undefined,
      },
      ...(props.grid && {
        width: '100%',
      }),
    };
    return Object.fromEntries(
      Object.entries(styles).filter(([_, value]) => value !== undefined)
    ) as Dictionary<string>;
  }

  function onClick(index: number) {
    if (open.includes(index)) {
      setOpen(onlyOneAtATime() ? [] : open.filter(item => item !== index));
    } else {
      setOpen(onlyOneAtATime() ? [index] : open.concat(index));
    }
  }

  return (
    <div className="builder-accordion" style={accordionStyles()}>
      {props.items?.map((item, index) => (
        <React.Fragment key={index}>
          <div
            className={getAccordionTitleClassName(index)}
            style={{
              ...accordionTitleStyles(),
              ...(props.grid && {
                width: props.gridRowWidth,
                ...({
                  order:
                    openGridItemOrder() !== null
                      ? convertOrderNumberToString(index)
                      : convertOrderNumberToString(index + 1),
                } as any),
              }),
            }}
            data-index={index}
            onClick={event => onClick(index)}
          >
            <Blocks
              blocks={item.title}
              path={`items.${index}.title`}
              parent={props.builderBlock.id}
              context={props.builderContext}
              registeredComponents={props.builderComponents}
              linkComponent={props.builderLinkComponent}
            />
          </div>
          {open.includes(index) ? (
            <div className={getAccordionDetailClassName(index)} style={accordionDetailStyles()}>
              <Blocks
                blocks={item.detail}
                path={`items.${index}.detail`}
                parent={props.builderBlock.id}
                context={props.builderContext}
                registeredComponents={props.builderComponents}
                linkComponent={props.builderLinkComponent}
              />
            </div>
          ) : null}
        </React.Fragment>
      ))}
    </div>
  );
}

export default Accordion;
