import { createContext } from 'react';
import { BuilderContextInterface } from './types';

export default createContext<BuilderContextInterface>({
  content: null,
  context: {},
  localState: undefined,
  rootSetState() {},
  rootState: {},
  apiKey: null,
  apiVersion: undefined,
  componentInfos: {},
  inheritedStyles: {},
  BlocksWrapper: 'div',
  BlocksWrapperProps: {},
  nonce: '',
  model: '',
});
