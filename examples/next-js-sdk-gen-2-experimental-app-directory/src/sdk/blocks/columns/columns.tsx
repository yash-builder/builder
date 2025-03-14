import * as React from 'react';

type CSSVal = string | number;
import Blocks from '../../components/blocks/blocks';
import DynamicDiv from '../../components/dynamic-div';
import DynamicRenderer from '../../components/dynamic-renderer/dynamic-renderer';
import InlinedStyles from '../../components/inlined-styles';
import type { SizeName } from '../../constants/device-sizes';
import { getSizesForBreakpoints } from '../../constants/device-sizes';
import { TARGET } from '../../constants/target';
import { deoptSignal } from '../../functions/deopt';
import { getClassPropName } from '../../functions/get-class-prop-name';
import { mapStyleObjToStrIfNeeded } from '../../functions/get-style';
import type { Dictionary } from '../../types/typescript';
import type { Column, ColumnProps } from './columns.types';
import { getColumnsClass } from './helpers';

function Columns(props: ColumnProps) {
  const gutterSize = function gutterSize() {
    return typeof props.space === 'number' ? props.space || 0 : 20;
  };
  const cols = function cols() {
    return props.columns || [];
  };
  const stackAt = function stackAt() {
    return props.stackColumnsAt || 'tablet';
  };
  const getTagName = function getTagName(column: Column) {
    return column.link ? props.builderLinkComponent || 'a' : 'div';
  };
  const getWidth = function getWidth(index: number) {
    return cols()[index]?.width || 100 / cols().length;
  };
  const getColumnCssWidth = function getColumnCssWidth(index: number) {
    const width = getWidth(index);
    const subtractWidth = gutterSize() * (cols().length - 1) * (width / 100);
    return `calc(${width}% - ${subtractWidth}px)`;
  };
  const getTabletStyle = function getTabletStyle({
    stackedStyle,
    desktopStyle,
  }: {
    stackedStyle: CSSVal;
    desktopStyle: CSSVal;
  }) {
    return stackAt() === 'tablet' ? stackedStyle : desktopStyle;
  };
  const getMobileStyle = function getMobileStyle({
    stackedStyle,
    desktopStyle,
  }: {
    stackedStyle: CSSVal;
    desktopStyle: CSSVal;
  }) {
    return stackAt() === 'never' ? desktopStyle : stackedStyle;
  };
  const flexDir = function flexDir() {
    return props.stackColumnsAt === 'never'
      ? 'row'
      : props.reverseColumnsWhenStacked
        ? 'column-reverse'
        : 'column';
  };
  const columnsCssVars = function columnsCssVars() {
    return {
      '--flex-dir': flexDir(),
      '--flex-dir-tablet': getTabletStyle({
        stackedStyle: flexDir(),
        desktopStyle: 'row',
      }),
    } as Dictionary<string>;
  };
  const columnCssVars = function columnCssVars(index: number) {
    const gutter = index === 0 ? 0 : gutterSize();
    const width = getColumnCssWidth(index);
    const gutterPixels = `${gutter}px`;
    const mobileWidth = '100%';
    const mobileMarginLeft = 0;
    const marginLeftKey = 'marginLeft';
    const sharedStyles = {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'stretch',
    };
    return {
      ...sharedStyles,
      width,
      [marginLeftKey]: gutterPixels,
      '--column-width-mobile': getMobileStyle({
        stackedStyle: mobileWidth,
        desktopStyle: width,
      }),
      '--column-margin-left-mobile': getMobileStyle({
        stackedStyle: mobileMarginLeft,
        desktopStyle: gutterPixels,
      }),
      '--column-width-tablet': getTabletStyle({
        stackedStyle: mobileWidth,
        desktopStyle: width,
      }),
      '--column-margin-left-tablet': getTabletStyle({
        stackedStyle: mobileMarginLeft,
        desktopStyle: gutterPixels,
      }),
    } as Dictionary<string>;
  };
  const getWidthForBreakpointSize = function getWidthForBreakpointSize(size: SizeName) {
    const breakpointSizes = getSizesForBreakpoints(
      props.builderContext.content?.meta?.breakpoints || {}
    );
    return breakpointSizes[size].max;
  };
  const columnsStyles = function columnsStyles() {
    const childColumnDiv = `.${props.builderBlock.id}-breakpoints > .builder-column`;
    return `
        @media (max-width: ${getWidthForBreakpointSize('medium')}px) {
          .${props.builderBlock.id}-breakpoints {
            flex-direction: var(--flex-dir-tablet);
            align-items: stretch;
          }

          ${childColumnDiv} {
            width: var(--column-width-tablet) !important;
            margin-left: var(--column-margin-left-tablet) !important;
          }
        }

        @media (max-width: ${getWidthForBreakpointSize('small')}px) {
          .${props.builderBlock.id}-breakpoints {
            flex-direction: var(--flex-dir);
            align-items: stretch;
          }

          ${childColumnDiv} {
            width: var(--column-width-mobile) !important;
            margin-left: var(--column-margin-left-mobile) !important;
          }
        },
      `;
  };
  const getAttributes = function getAttributes(column: any, index: number) {
    return {
      ...{},
      ...(column.link
        ? {
            href: column.link,
          }
        : {}),
      [getClassPropName()]: 'builder-column',
      style: mapStyleObjToStrIfNeeded(columnCssVars(index)),
    };
  };

  return (
    <>
      <div
        className={getColumnsClass(props.builderBlock?.id) + ' div-1aff548e'}
        style={columnsCssVars()}
        {...{}}
      >
        {TARGET !== 'reactNative' ? (
          <InlinedStyles
            id="builderio-columns"
            styles={columnsStyles()}
            nonce={props.builderContext.nonce}
          />
        ) : null}
        {props.columns?.map((column, index) => (
          <DynamicRenderer
            key={index}
            TagName={getTagName(column)}
            actionAttributes={{}}
            attributes={getAttributes(column, index)}
          >
            <Blocks
              path={`columns.${index}.blocks`}
              parent={props.builderBlock.id}
              context={props.builderContext}
              registeredComponents={props.builderComponents}
              linkComponent={props.builderLinkComponent}
              blocks={column.blocks}
              styleProp={{
                flexGrow: '1',
              }}
            />
          </DynamicRenderer>
        ))}
      </div>

      <style>{`.div-1aff548e {
  display: flex;
  line-height: normal;
}`}</style>
    </>
  );
}

export default Columns;
