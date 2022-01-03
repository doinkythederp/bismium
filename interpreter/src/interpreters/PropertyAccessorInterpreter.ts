import Interpreter, { BaseInterpreterState } from '../Interpreter';
import { Node, PropertyAccessorNode } from '../Node';
import VariableAccessorInterpreter from './VariableAccessorInterpreter';

export interface PropertyAccessorInterpreterState extends BaseInterpreterState {
  value: string;
}

export default class PropertyAccessorInterpreter extends Interpreter<
  PropertyAccessorNode,
  PropertyAccessorInterpreterState
> {
  public constructor(sourceLocation = 0, parent: Node | null = null) {
    super(sourceLocation, parent);

    this.use((data) => {
      const char = data[this.state.cursor]!;

      if (VariableAccessorInterpreter.validKeyword.test(char)) {
        this.state.value += char;
        this.state.cursor++;
      } else {
        this.state.finished = true;
      }
    }).end(() => {
      this.node = new PropertyAccessorNode(
        this.state.value,
        {
          sourceLocation,
          sourceLength: this.state.cursor
        },
        this.parent
      );
    });
  }

  protected state: PropertyAccessorInterpreterState = {
    cursor: 0,
    finished: false,
    value: ''
  };

  public static validKeyword = /^[A-Za-z\$_]$/;
}
