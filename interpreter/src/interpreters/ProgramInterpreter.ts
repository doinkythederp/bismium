import { ValueInterpreter } from '.';
import { ProgramNode } from '..';
import Interpreter, { BaseInterpreterState } from '../Interpreter';
import { Node, ValueNode } from '../Node';
import * as Constants from '../util/constants';
import * as Errors from '../util/errors';

export interface ProgramInterpreterState extends BaseInterpreterState {
  ready: boolean;
  statements: ValueNode[];
}

export default class ProgramInterpreter extends Interpreter<
  ProgramNode,
  ProgramInterpreterState
> {
  public constructor(sourceLocation = 0, parent: Node | null = null) {
    super(sourceLocation, parent);

    this.use(async (data) => {
      const char = data[this.state.cursor]!;

      if (
        char === Constants.STATEMENT_SEPERATOR ||
        Constants.whitespace.has(char)
      ) {
        this.state.ready = true;
        this.state.cursor++;
      }

      if (this.state.ready) {
        const node = await new ValueInterpreter(
          sourceLocation + this.state.cursor
        ).run(data.slice(this.state.cursor));
        this.state.statements.push(node);
        this.state.ready = false;
        this.state.cursor += node.meta.sourceLength;
      } else {
        throw new Errors.SyntaxError(`Unexpected token \`${char}\``, {
          at: this.state.cursor,
          length: 0
        });
      }
    }).end(() => {
      this.node = new ProgramNode(
        this.state.statements,
        {
          sourceLocation,
          sourceLength: this.state.cursor
        },
        null
      );

      for (const statement of this.node.statements) {
        statement.parent = this.node;
      }
    });
  }

  protected state: ProgramInterpreterState = {
    cursor: 0,
    finished: false,
    statements: [],
    ready: true
  };
}
