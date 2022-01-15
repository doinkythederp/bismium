import {
  FunctionCallNode,
  NumberNode,
  ProgramNode,
  PropertyAccessorNode,
  TextNode,
  ValueNode,
  VariableAccessorNode
} from '@doinkythederp/bismium-interpreter';
import BismiumFunction from './values/BismiumFunction';
import { Value } from './values';
import * as Errors from './util/errors';
import BismiumNumber from './values/primitives/BismiumNumber';
import BismiumString from './values/primitives/BismiumString';
import * as Timers from 'timers/promises';

export default class Runtime {
  public constructor(public lib: RuntimeLibrary) {}

  public async start(program: ProgramNode, ctx = new Map<string, Value>()) {
    let result: Value | null = null;
    for (const node of program.statements) {
      result = await (
        await Timers.setImmediate(this)
      ).handleStatement(ctx, node);
    }
    return result;
  }

  private async handleStatement(
    ctx: Map<string, Value>,
    node: ValueNode
  ): Promise<Value> {
    let target: Value;
    // used for error reporting
    let displayName: string;

    if (node.target instanceof VariableAccessorNode) {
      const lookupResult = ctx.get(node.target.name);
      if (lookupResult === undefined)
        throw new Errors.ReferenceError(
          `The variable \`${node.target.name}\` has not been defined`
        );
      target = lookupResult;
      displayName = node.target.name;
    } else {
      if (node.target instanceof NumberNode) {
        target = new BismiumNumber(this, node.target.value);
      } else if (node.target instanceof TextNode) {
        target = new BismiumString(this, node.target.content);
      } else {
        throw new Error('unreachable code');
      }
      displayName = target.displayName;
    }

    for (const propNode of node.props) {
      if (propNode instanceof PropertyAccessorNode) {
        const lookupResult = target.getProperty(propNode.prop);
        if (lookupResult === undefined)
          throw new Errors.ReferenceError(
            `The property \`${displayName}.${propNode.prop}\` has not been defined`
          );

        target = lookupResult;
        displayName += `.${propNode.prop}`;
      } else if (propNode instanceof FunctionCallNode) {
        if (!(target instanceof BismiumFunction))
          throw new Errors.TypeError(`\`${displayName}\` is not a function`);

        const resolvedArgs: Value[] = [];
        for (const arg of propNode.args) {
          resolvedArgs.push(await this.handleStatement(ctx, arg));
        }

        target = await (await Timers.setImmediate(target)).call(resolvedArgs);
        displayName += `(${resolvedArgs.map(() => '...').join(', ')})`;
      }
    }

    return target;
  }
}

export type RuntimeLibrary = Record<
  'string' | 'number' | 'object',
  Map<string, Value>
>;
