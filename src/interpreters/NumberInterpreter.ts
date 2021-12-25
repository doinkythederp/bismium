import Interpreter, { BaseInterpreterState } from '../Interpreter';
import { Node, NumberNode, NumberNodeVariant } from '../Node';
import * as Constants from '../util/constants';

export interface NumberInterpreterState extends BaseInterpreterState {
  value: string;
  hasDecimal: boolean;
  variant: NumberNodeVariant;
}

export default class NumberInterpreter extends Interpreter<
  NumberNode,
  NumberInterpreterState
> {
  public constructor(sourceLocation = 0, parent: Node | null = null) {
    super(sourceLocation, parent);

    this.use((data) => {
      // check if this is a hex-style number
      if (this.state.cursor === 0 && data.startsWith(Constants.HEX_ESCAPE)) {
        this.state.cursor = 2;
        this.state.variant = NumberNodeVariant.HEXADECIMAL;
        return true;
      }

      const char = data[this.state.cursor]!;

      if (char === Constants.DECIMAL) {
        if (this.state.hasDecimal) {
          this.state.finished = true;
          return true;
        }
        this.state.hasDecimal = true;
      }

      // add character
      if (
        (this.state.variant === NumberNodeVariant.DECIMAL
          ? NumberInterpreter.validNumber
          : NumberInterpreter.validHex
        ).test(char)
      ) {
        this.state.value += char;
        this.state.cursor++;
      } else {
        this.state.finished = true;
      }
    }).end(() => {
      this.node = new NumberNode(
        this.state.variant === NumberNodeVariant.DECIMAL
          ? parseFloat(this.state.value)
          : parseInt(this.state.value, 16),
        this.state.variant,
        {
          sourceLocation,
          sourceLength: this.state.cursor
        },
        parent
      );
    });
  }

  protected state: NumberInterpreterState = {
    cursor: 0,
    finished: false,
    value: '',
    hasDecimal: false,
    variant: NumberNodeVariant.DECIMAL
  };

  public static validNumber = /^[0-9\.]$/;
  public static validHex = /^[0-9A-F]$/i;
}
