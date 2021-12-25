import Interpreter, { BaseInterpreterState } from '../Interpreter';
import { Node, VariableAccessorNode } from '../Node';

export interface VariableAccessorInterpreterState extends BaseInterpreterState {
  variableName: string;
}

export default class VariableAccessorInterpreter extends Interpreter<
  VariableAccessorNode,
  VariableAccessorInterpreterState
> {
  public constructor(sourceLocation = 0, parent: Node | null = null) {
    super(sourceLocation, parent);

    this.use((data) => {
      const char = data[this.state.cursor]!;

      if (VariableAccessorInterpreter.validKeyword.test(char)) {
        this.state.variableName += char;
        this.state.cursor++;
      } else {
        this.state.finished = true;
      }
    }).end(() => {
      this.node = new VariableAccessorNode(
        this.state.variableName,
        {
          sourceLocation,
          sourceLength: this.state.cursor
        },
        this.parent
      );
    });
  }

  protected state: VariableAccessorInterpreterState = {
    cursor: 0,
    finished: false,
    variableName: ''
  };

  public static validKeyword = /^[A-Za-z\$_]$/;
}
