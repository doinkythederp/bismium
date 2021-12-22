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

    this.use((data) => {
      data = data[this.state.cursor]!;

      // check if this character is escaped
      if (this.state.nextCharacterEscaped) {
        this.node.content += data;
        this.state.nextCharacterEscaped = false;
        this.state.cursor++;
        return true;
      }

      // check for special characters
      if (data === stringEnd && this.node.parent) {
        this.state.finished = true;
        this.state.cursor++;
        return true;
      }

      if (data === Constants.ESCAPE) {
        this.state.nextCharacterEscaped = true;
        this.state.cursor++;
        return true;
      }

      // add character
      this.node.content += data;
      this.state.cursor++;
    }).end(() => {
      if (!this.state.finished && this.node.parent)
        throw new Errors.SyntaxError(
          `Unexpected end of string (missing \`${stringEnd}\`)`,
          {
            at: this.state.cursor - 1,
            length: 1
          }
        );
      this.node.meta.sourceLength = this.state.cursor - 1;
    });
  }

  protected state: StringInterpreterState = {
    cursor: 0,
    finished: false,
    nextCharacterEscaped: false
  };
}
