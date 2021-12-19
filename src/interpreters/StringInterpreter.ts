import Interpreter, { BaseInterpreterState } from '../Interpreter';
import { TextNode, TextNodeVariant } from '../Node';
import * as Constants from '../util/constants';
import * as Errors from '../util/errors';

export interface StringInterpreterState extends BaseInterpreterState {
  nextCharacterEscaped: boolean;
}

export default class StringInterpreter extends Interpreter<
  TextNode,
  StringInterpreterState
> {
  public constructor(node: TextNode) {
    super(node);

    const stringEnd =
      this.node.variant === TextNodeVariant.SINGLE_QUOTE
        ? Constants.SINGLE_QUOTE
        : Constants.DOUBLE_QUOTE;

    this.use((char) => {
      // check if this character is escaped
      if (this.state.nextCharacterEscaped) {
        this.node.content += char;
        this.state.nextCharacterEscaped = false;
        this.state.cursor++;
        return true;
      }

      // check for special characters
      if (char === stringEnd && this.node.parent) {
        this.state.finished = true;
        this.state.cursor++;
        return true;
      }

      if (char === Constants.ESCAPE) {
        this.state.nextCharacterEscaped = true;
        this.state.cursor++;
        return true;
      }

      // add character
      this.node.content += char;
      this.state.cursor++;
    }).end(() => {
      if (!this.state.finished)
        throw new Errors.SyntaxError(
          `Unexpected end of string (missing \`${stringEnd}\`)`,
          {
            at: this.state.cursor - 1,
            length: 1
          }
        );
    });
  }

  protected state: StringInterpreterState = {
    cursor: 0,
    finished: false,
    nextCharacterEscaped: false
  };
}
