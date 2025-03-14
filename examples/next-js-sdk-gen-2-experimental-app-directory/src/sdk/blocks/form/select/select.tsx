'use client';
import * as React from 'react';

/**
 * This import is used by the Svelte SDK. Do not remove.
 */

export interface FormSelectProps {
  options?: {
    name?: string;
    value: string;
  }[];
  attributes?: any;
  name?: string;
  value?: string;
  defaultValue?: string;
  required?: boolean;
}

import { isEditing } from '../../../functions/is-editing';
import { filterAttrs } from '../../helpers';
import { setAttrs } from '../../helpers';

function SelectComponent(props: FormSelectProps) {
  return (
    <select
      {...{}}
      {...props.attributes}
      value={props.value}
      key={isEditing() && props.defaultValue ? props.defaultValue : 'default-key'}
      defaultValue={props.defaultValue}
      name={props.name}
      required={props.required}
    >
      {props.options?.map((option, index) => (
        <option key={`${option.name}-${index}`} value={option.value}>
          {option.name || option.value}
        </option>
      ))}
    </select>
  );
}

export default SelectComponent;
