import { logger } from '../../helpers/logger';
import { get } from '../get';
import { chooseBrowserOrServerEval } from './choose-eval';
import type { EvaluatorArgs, ExecutorArgs } from './helpers';
import { getBuilderGlobals, parseCode } from './helpers';
type EvalValue = unknown;

/**
 * handles multi-level gets on state: `state.x.y.z`
 * does not handle bracket notation
 * see https://regexr.com/87a9j
 */
const STATE_GETTER_REGEX = /^(return )?(\s*)?state(?<getPath>(\.\w+)+)(\s*);?$/;

/**
 * Handles multi-level gets on state transpiled by rollup with virtual index.
 * see https://regexr.com/87ai4
 */
const VIRTUAL_INDEX_REGEX =
  /(\s)*var(\s)+_virtual_index(\s)*=(\s)*state(?<getPath>(\.\w+)+)(\s*);?(\s)*return(\s)*_virtual_index(\s)*/;
export const getSimpleExpressionGetPath = (code: string) => {
  return (
    STATE_GETTER_REGEX.exec(code.trim())?.groups?.getPath?.slice(1) ||
    VIRTUAL_INDEX_REGEX.exec(code.trim())?.groups?.getPath?.slice(1)
  );
};
export function evaluate({
  code,
  context,
  localState,
  rootState,
  rootSetState,
  event,
  isExpression = true,
}: EvaluatorArgs): EvalValue {
  if (code.trim() === '') {
    return undefined;
  }

  /**
   * For very simple expressions like "state.foo" we can optimize by skipping
   * the executor altogether.
   * We try not to take many risks with this optimizations, so we only do it for
   * `state.{path}` expressions.
   */
  const getPath = getSimpleExpressionGetPath(code.trim());
  if (getPath) {
    return get(
      {
        ...rootState,
        ...localState,
      },
      getPath
    );
  }
  const args: ExecutorArgs = {
    code: parseCode(code, {
      isExpression,
    }),
    builder: getBuilderGlobals(),
    context,
    event,
    rootSetState,
    rootState,
    localState,
  };
  try {
    const newEval = chooseBrowserOrServerEval(args);
    return newEval;
  } catch (e: any) {
    logger.error('Failed code evaluation: ' + e.message, {
      code,
    });
    return undefined;
  }
}
