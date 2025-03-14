'use client';
import * as React from 'react';
import { useState, useRef, useEffect } from 'react';

export interface CustomCodeProps {
  code: string;
  replaceNodes?: boolean;
}

import { isEditing } from '../../functions/is-editing';
import { logger } from '../../helpers/logger';

function CustomCode(props: CustomCodeProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const [scriptsInserted, setScriptsInserted] = useState<any[]>(() => []);

  const [scriptsRun, setScriptsRun] = useState<any[]>(() => []);

  function runScripts() {
    if (
      !elementRef.current ||
      !elementRef.current?.getElementsByTagName ||
      typeof window === 'undefined'
    ) {
      return;
    }
    const scripts = elementRef.current.getElementsByTagName('script');
    for (let i = 0; i < scripts.length; i++) {
      const script: any = scripts[i];
      if (script.src) {
        if (scriptsInserted.includes(script.src)) {
          continue;
        }
        scriptsInserted.push(script.src);
        const newScript = document.createElement('script');
        newScript.async = true;
        newScript.src = script.src;
        document.head.appendChild(newScript);
      } else if (
        !script.type ||
        ['text/javascript', 'application/javascript', 'application/ecmascript'].includes(
          script.type
        )
      ) {
        if (scriptsRun.includes(script.innerText)) {
          continue;
        }
        try {
          scriptsRun.push(script.innerText);
          new Function(script.innerText)();
        } catch (error) {
          logger.warn('[BUILDER.IO] `CustomCode`: Error running script:', error);
        }
      }
    }
  }

  useEffect(() => {
    runScripts();
  }, []);

  useEffect(() => {
    if (isEditing()) {
      runScripts();
    }
  }, [props.code]);

  return (
    <div
      ref={elementRef}
      className={'builder-custom-code' + (props.replaceNodes ? ' replace-nodes' : '')}
      dangerouslySetInnerHTML={{ __html: props.code }}
    />
  );
}

export default CustomCode;
