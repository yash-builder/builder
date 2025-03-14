import * as React from 'react';

interface Props extends BuilderNonceProp {
  scriptStr: string;
  id: string;
}

import type { BuilderNonceProp } from '../types/builder-props';

function InlinedScript(props: Props) {
  return (
    <script
      dangerouslySetInnerHTML={{ __html: props.scriptStr }}
      data-id={props.id}
      nonce={props.nonce || ''}
    />
  );
}

export default InlinedScript;
