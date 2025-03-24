import type { ContentProps } from '../components/content/content.types';
import { isBrowser } from '../functions/is-browser';
import { isFromTrustedHost } from '../functions/is-from-trusted-host';
import { setupBrowserForEditing } from '../scripts/init-editing';
import type { BuilderAnimation } from '../types/builder-block';
import type { BuilderContent } from '../types/builder-content';
import type { Dictionary } from '../types/typescript';
import { logger } from './logger';
type ContentListener = Required<Pick<ContentProps, 'model' | 'trustedHosts'>> & {
  callbacks: {
    contentUpdate: (
      updatedContent: BuilderContent,
      editType: 'client' | 'server' | undefined
    ) => void;
    stateUpdate: (newState: Dictionary<string>) => void;
    animation: (updatedContent: BuilderAnimation) => void;
    configureSdk: (updatedContent: any) => void;
  };
};
export const createEditorListener = ({ model, trustedHosts, callbacks }: ContentListener) => {
  return (event: MessageEvent<any>): void => {
    if (!isFromTrustedHost(trustedHosts, event)) {
      return;
    }
    const { data } = event;
    if (data) {
      switch (data.type) {
        case 'builder.configureSdk': {
          callbacks.configureSdk(data.data);
          break;
        }
        case 'builder.triggerAnimation': {
          callbacks.animation(data.data);
          break;
        }
        case 'builder.resetState': {
          const messageContent = data.data;
          const modelName = messageContent.model;
          const newState = messageContent?.state;
          if (modelName === model && newState) {
            callbacks.stateUpdate(newState);
          }
          break;
        }
        case 'builder.contentUpdate': {
          const messageContent = data.data;
          const key =
            messageContent.key ||
            messageContent.alias ||
            messageContent.entry ||
            messageContent.modelName;
          const contentData = messageContent.data;
          const editType = messageContent.editType;
          if (key === model) {
            callbacks.contentUpdate(contentData, editType);
          }
          break;
        }
      }
    }
  };
};
type SubscribeToEditor = ({
  model,
  apiKey,
  callback,
  trustedHosts,
}: {
  /**
   * The Builder `model` to subscribe to
   */
  model: string;
  /**
   * Builder API Key to use for the editor.
   */
  apiKey: string;
  /**
   * The callback function to call when the content is updated.
   */
  callback: (updatedContent: BuilderContent) => void;
  /**
   * List of hosts to allow editing content from.
   */
  trustedHosts?: string[] | undefined;
}) => () => void;

/**
 * Subscribes to the Builder editor and listens to `content` updates of a certain `model`.
 * Sends the updated `content` to the `callback` function.
 */
export const subscribeToEditor: SubscribeToEditor = ({ model, apiKey, callback, trustedHosts }) => {
  if (!isBrowser) {
    logger.warn(
      '`subscribeToEditor` only works in the browser. It currently seems to be running on the server.'
    );
    return () => {};
  }
  setupBrowserForEditing({
    modelName: model,
    apiKey,
  });
  const listener = createEditorListener({
    callbacks: {
      contentUpdate: callback,
      animation: () => {},
      configureSdk: () => {},
      stateUpdate: () => {},
    },
    model,
    trustedHosts,
  });
  window.addEventListener('message', listener);
  return () => {
    window.removeEventListener('message', listener);
  };
};
