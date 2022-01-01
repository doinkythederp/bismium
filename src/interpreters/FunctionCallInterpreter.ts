import Interpreter, { BaseInterpreterState } from '../Interpreter';
import { FunctionCallNode, Node, ValueNode } from '../Node';
import * as Constants from '../util/constants';
import * as Errors from '../util/errors';
import ValueInterpreter from './ValueInterpreter';

export interface FunctionCallInterpreterState extends BaseInterpreterState {
  args: ValueNode[];
  nextArgReady: boolean;
}

export default class FunctionCallInterpreter extends Interpreter<
  FunctionCallNode,
  FunctionCallInterpreterState
> {
  public constructor(sourceLocation = 0, parent: Node | null = null) {
    super(sourceLocation, parent);

    this.use(async (data) => {
      const char = data[this.state.cursor]!;

      if (char === Constants.FUNCTION_CALL_END) {
        this.state.finished = true;
        return true;
      }

      if (char === Constants.ARGUMENT_SEPERATOR) {
        if (this.state.nextArgReady) {
          throw new Errors.SyntaxError('Unexpected empty argument', {
            at: this.state.cursor,
            length: 1
          });
        } else {
          this.state.nextArgReady = true;
          this.state.cursor++;
          return true;
        }
      }

      if (this.state.nextArgReady) {
        const child = await new ValueInterpreter(this.state.cursor).run(
          data.slice(this.state.cursor)
        );
        this.state.args.push(child);

        this.state.cursor += child.meta.sourceLength;
        this.state.nextArgReady = false;
      } else if (Constants.whitespace.has(char)) {
        this.state.cursor++;
      } else {
        throw new Errors.SyntaxError(`Unexpected token \`${char}\``, {
          at: this.state.cursor + sourceLocation,
          length: 1
        });
      }
    }).end(() => {
      if (!this.state.finished)
        throw new Errors.SyntaxError(
          `Unexpected end of function call (missing \`${Constants.FUNCTION_CALL_END}\`)`,
          {
            at: this.state.cursor,
            length: 1
          }
        );

      this.node = new FunctionCallNode(
        this.state.args,
        {
          sourceLocation,
          sourceLength: this.state.cursor + 1
        },
        parent
      );
    });
  }

  protected state: FunctionCallInterpreterState = {
    cursor: 0,
    finished: false,
    args: [],
    nextArgReady: true
  };
}
