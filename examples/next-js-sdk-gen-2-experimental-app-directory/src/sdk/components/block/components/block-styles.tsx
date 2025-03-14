import * as React from 'react';

export type BlockStylesProps = {
  block: BuilderBlock;
  context: BuilderContextInterface;
};
import { getMaxWidthQueryForSize, getSizesForBreakpoints } from '../../../constants/device-sizes';
import { TARGET } from '../../../constants/target';
import type { BuilderContextInterface } from '../../../context/types';
import { camelToKebabCase } from '../../../functions/camel-to-kebab-case';
import { createCssClass } from '../../../helpers/css';
import { checkIsDefined } from '../../../helpers/nullable';
import type { BuilderBlock } from '../../../types/builder-block';
import InlinedStyles from '../../inlined-styles';

function BlockStyles(props: BlockStylesProps) {
  const canShowBlock = function canShowBlock() {
    const processedBlock = props.block;
    // only render styles for blocks that are visible
    if (checkIsDefined(processedBlock.hide)) {
      return !processedBlock.hide;
    }
    if (checkIsDefined(processedBlock.show)) {
      return processedBlock.show;
    }
    return true;
  };
  const css = function css() {
    const processedBlock = props.block;
    const styles = processedBlock.responsiveStyles;
    const content = props.context.content;
    const sizesWithUpdatedBreakpoints = getSizesForBreakpoints(content?.meta?.breakpoints || {});
    const contentHasXSmallBreakpoint = Boolean(content?.meta?.breakpoints?.xsmall);
    const largeStyles = styles?.large;
    const mediumStyles = styles?.medium;
    const smallStyles = styles?.small;
    const xsmallStyles = styles?.xsmall;
    const className = processedBlock.id;
    if (!className) {
      return '';
    }
    const largeStylesClass = largeStyles
      ? createCssClass({
          className,
          styles: largeStyles,
        })
      : '';
    const mediumStylesClass = mediumStyles
      ? createCssClass({
          className,
          styles: mediumStyles,
          mediaQuery: getMaxWidthQueryForSize('medium', sizesWithUpdatedBreakpoints),
        })
      : '';
    const smallStylesClass = smallStyles
      ? createCssClass({
          className,
          styles: smallStyles,
          mediaQuery: getMaxWidthQueryForSize('small', sizesWithUpdatedBreakpoints),
        })
      : '';
    const xsmallStylesClass =
      xsmallStyles && contentHasXSmallBreakpoint
        ? createCssClass({
            className,
            styles: xsmallStyles,
            mediaQuery: getMaxWidthQueryForSize('xsmall', sizesWithUpdatedBreakpoints),
          })
        : '';
    const hoverAnimation =
      processedBlock.animations && processedBlock.animations.find(item => item.trigger === 'hover');
    let hoverStylesClass = '';
    if (hoverAnimation) {
      const hoverStyles = hoverAnimation.steps?.[1]?.styles || {};
      hoverStylesClass =
        createCssClass({
          className: `${className}:hover`,
          styles: {
            ...hoverStyles,
            transition: `all ${hoverAnimation.duration}s ${camelToKebabCase(
              hoverAnimation.easing
            )}`,
            transitionDelay: hoverAnimation.delay ? `${hoverAnimation.delay}s` : '0s',
          },
        }) || '';
    }
    return [
      largeStylesClass,
      mediumStylesClass,
      smallStylesClass,
      xsmallStylesClass,
      hoverStylesClass,
    ].join(' ');
  };

  return (
    <>
      {TARGET !== 'reactNative' && css() && canShowBlock() ? (
        <>
          <InlinedStyles id="builderio-block" styles={css()} nonce={props.context.nonce} />
        </>
      ) : null}
    </>
  );
}

export default BlockStyles;
