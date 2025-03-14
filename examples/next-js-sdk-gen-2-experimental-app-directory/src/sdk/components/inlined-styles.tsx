import * as React from 'react';

interface Props extends BuilderNonceProp {
  styles: string;
  id: string;
}

import type { BuilderNonceProp } from '../types/builder-props';

function InlinedStyles(props: Props) {
  return (
    <style
      dangerouslySetInnerHTML={{ __html: props.styles }}
      data-id={props.id}
      nonce={props.nonce}
    />
  );
}

export default InlinedStyles;
