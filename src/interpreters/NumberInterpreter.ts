import Interpreter, { BaseInterpreterState } from '../Interpreter';
import { Node, NumberNode, NumberNodeVariant } from '../Node';
import * as Constants from '../util/constants';

export interface NumberInterpreterState extends BaseInterpreterState {
  value: number;
  charsSinceDecimal: number | null;
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
        if (
          this.state.charsSinceDecimal !== null ||
          this.state.variant === NumberNodeVariant.HEXADECIMAL
        ) {
          this.state.finished = true;
        } else {
          this.state.charsSinceDecimal = 0;
          this.state.cursor++;
        }
        return true;
      }

      // add character
      if (
        (this.state.variant === NumberNodeVariant.DECIMAL
          ? NumberInterpreter.validNumber
          : NumberInterpreter.validHex
        ).test(char)
      ) {
        if (this.state.charsSinceDecimal !== null)
          this.state.charsSinceDecimal++;

        const charCode = char.toLowerCase().charCodeAt(0);
        const digit =
          charCode -
          (charCode >= NumberInterpreter.firstHexCode
            ? NumberInterpreter.firstHexCode - NumberInterpreter.hexOffset
            : NumberInterpreter.firstDecimalCode);

        if (this.state.charsSinceDecimal === null) {
          this.state.value =
            this.state.value *
              (this.state.variant === NumberNodeVariant.DECIMAL ? 10 : 16) +
            digit;
        } else {
          this.state.value += digit / 10 ** this.state.charsSinceDecimal;
        }

        this.state.cursor++;
      } else {
        this.state.finished = true;
      }
    }).end(() => {
      this.node = new NumberNode(
        this.state.value,
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
    value: 0,
    charsSinceDecimal: null,
    variant: NumberNodeVariant.DECIMAL
  };

  public static validNumber = /^[0-9\.]$/;
  public static validHex = /^[0-9A-F]$/i;

  public static readonly firstHexCode = 'a'.charCodeAt(0);
  public static readonly firstDecimalCode = '0'.charCodeAt(0);
  public static readonly hexOffset = 10;
}
