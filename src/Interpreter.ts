import { Node } from './Node';

export interface BaseInterpreterState {
  /**
   * The index of the interpreter cursor, passed as the first argument
   * to interpreter loop callbacks
   */
  cursor: number;
  /**
   * If the interpreter has finished.
   *
   * Setting this to `true` automatically cancels the interpreter loop
   * and starts the end callbacks
   */
  finished: boolean;
}

export type InterpreterCursorHandler<thisValue> = (
  this: thisValue,
  cursorData: string
) => boolean | undefined | void | PromiseLike<boolean | undefined | void>;

export type InterpreterFinishHandler<thisValue> = (
  this: thisValue
) => boolean | undefined | void | PromiseLike<boolean | undefined | void>;

/**
 * An interpreter which converts a source code file to a syntax tree node.
 */
export default abstract class Interpreter<
  NodeType extends Node = Node,
  State extends BaseInterpreterState = BaseInterpreterState
> {
  public constructor(public readonly node: NodeType) {}

  protected abstract state: State;

  private readonly handlers: Array<InterpreterCursorHandler<this>> = [];
  private readonly endHandlers: Array<InterpreterFinishHandler<this>> = [];

  /**
   * Adds an interpreter loop callback which is repeatadly run to process the current letter
   * @param handler The handler callback which can return `true` to skip the remaining handlers and continue to the next iteration
   */
  protected use(handler: InterpreterCursorHandler<this>) {
    this.handlers.push(handler);
    return this;
  }

  /**
   * Adds an end handler to the interpreter, which is run when either `Interpreter#state.finished` is `true`, or there are no more letters
   * @param handler The handler callback which can return `true` to skip the remaining handlers
   */
  protected end(handler: InterpreterFinishHandler<this>) {
    this.endHandlers.push(handler);
    return this;
  }

  /**
   * Calls the handlers, then returns the resulting node
   * @param data The data containing the source to interpret
   */
  public async run(data: string): Promise<NodeType> {
    await new Promise<void>((res, rej) => {
      const loop = async () => {
        if (this.state.finished || !(this.state.cursor in Object.keys(data)))
          return res();

        for (const handler of this.handlers) {
          const shouldSkip =
            (await handler.call(this, data[this.state.cursor]!)) ?? false;
          if (shouldSkip) break;
        }

        setImmediate(() => void loop().catch(rej));
      };

      loop().catch(rej);
    });

    for (const handler of this.endHandlers) {
      const shouldSkip = (await handler.call(this)) ?? false;
      if (shouldSkip) break;
    }

    return this.node;
  }
}
