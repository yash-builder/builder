'use client';
import * as React from 'react';

/**
 * This import is used by the Svelte SDK. Do not remove.
 */

export interface TextareaProps {
  attributes?: any;
  name?: string;
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  required?: boolean;
}

import { filterAttrs } from '../../helpers';
import { setAttrs } from '../../helpers';

function Textarea(props: TextareaProps) {
  return (
    <textarea
      {...{}}
      {...props.attributes}
      placeholder={props.placeholder}
      name={props.name}
      value={props.value}
      defaultValue={props.defaultValue}
      required={props.required}
    />
  );
}

export default Textarea;
