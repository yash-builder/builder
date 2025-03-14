import * as React from 'react';

interface Props extends BuilderNonceProp {
  cssCode?: string;
  customFonts?: CustomFont[];
  contentId?: string;
  isNestedRender?: boolean;
}

import type { BuilderNonceProp } from '../../../types/builder-props';
import InlinedStyles from '../../inlined-styles';
import type { CustomFont } from './styles.helpers';
import { getCss, getDefaultStyles, getFontCss } from './styles.helpers';

function ContentStyles(props: Props) {
  const injectedStyles = `
${getCss({
  cssCode: props.cssCode,
  contentId: props.contentId,
})}
${getFontCss({
  customFonts: props.customFonts,
})}
${getDefaultStyles(props.isNestedRender)}
`.trim();

  return <InlinedStyles id="builderio-content" styles={injectedStyles} nonce={props.nonce} />;
}

export default ContentStyles;
