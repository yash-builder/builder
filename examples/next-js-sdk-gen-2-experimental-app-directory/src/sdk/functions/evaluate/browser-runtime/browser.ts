import type { ExecutorArgs } from '../helpers';
import { flattenState, getFunctionArguments } from '../helpers';
export const runInBrowser = ({
  code,
  builder,
  context,
  event,
  localState,
  rootSetState,
  rootState,
}: ExecutorArgs) => {
  const functionArgs = getFunctionArguments({
    builder,
    context,
    event,
    state: flattenState({
      rootState,
      localState,
      rootSetState,
    }),
  });
  return new Function(...functionArgs.map(([name]) => name), code)(
    ...functionArgs.map(([, value]) => value)
  );
};
