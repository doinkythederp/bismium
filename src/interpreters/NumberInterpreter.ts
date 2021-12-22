import Interpreter, { BaseInterpreterState } from '../Interpreter';
import { NumberNode, NumberNodeVariant } from '../Node';
import * as Constants from '../util/constants';
import * as Errors from '../util/errors';

export interface NumberInterpreterState extends BaseInterpreterState {
  value: string;
  hasDecimal: boolean;
}

export default class NumberInterpreter extends Interpreter<
  NumberNode,
  NumberInterpreterState
> {
  public constructor(node: NumberNode) {
    super(node);

    this.use((data) => {
      // check if this is a hex-style number
      if (this.state.cursor === 0 && data.startsWith(Constants.HEX_ESCAPE)) {
        this.state.cursor = 2;
        this.node.variant = NumberNodeVariant.HEXADECIMAL;
        return true;
      }

      const char = data[this.state.cursor]!;

      if (
        char === Constants.TAG_END ||
        char === Constants.SEPERATOR ||
        // if we have a period where it shouldn't be, it's probably
        // a property accessor
        (char === Constants.DECIMAL &&
          (this.state.hasDecimal ||
            this.node.variant === NumberNodeVariant.HEXADECIMAL))
      ) {
        this.state.finished = true;
        return true;
      }

      // add character
      if (
        (this.node.variant === NumberNodeVariant.DECIMAL
          ? NumberInterpreter.validNumber
          : NumberInterpreter.validHex
        ).test(char)
      ) {
        this.state.value += char;
        this.state.cursor++;
      } else {
        throw new Errors.SyntaxError(
          `Invalid digit in ${
            this.node.variant === NumberNodeVariant.DECIMAL
              ? 'number. (Only 0-9'
              : 'hexadecimal number. (Only 0-9 and A-F'
          } allowed, got \`${char}\` instead)`,
          {
            at: node.meta.sourceLocation + this.state.cursor,
            length: -this.state.cursor
          }
        );
      }
    }).end(() => {
      this.node.meta.sourceLength = this.state.cursor - 1;
      this.node.value =
        this.node.variant === NumberNodeVariant.DECIMAL
          ? parseFloat(this.state.value)
          : parseInt(this.state.value, 16);
    });
  }

  protected state: NumberInterpreterState = {
    cursor: 0,
    finished: false,
    value: '',
    hasDecimal: false
  };

  public static validNumber = /^[0-9\.]$/;
  public static validHex = /^[0-9A-F]$/i;
}
