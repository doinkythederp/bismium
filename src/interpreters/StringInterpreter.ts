import Interpreter, { BaseInterpreterState } from '../Interpreter';
import { Node, TextNode, TextNodeVariant } from '../Node';
import * as Constants from '../util/constants';
import * as Errors from '../util/errors';

export interface StringInterpreterState extends BaseInterpreterState {
  nextCharacterEscaped: boolean;
  content: string;
}

export default class StringInterpreter extends Interpreter<
  TextNode,
  StringInterpreterState
> {
  public constructor(
    variant: TextNodeVariant,
    sourceLocation = 0,
    parent: Node | null = null
  ) {
    super(sourceLocation, parent);

    const stringEnd =
      variant === TextNodeVariant.SINGLE_QUOTE
        ? Constants.SINGLE_QUOTE
        : Constants.DOUBLE_QUOTE;

    this.use((data) => {
      data = data[this.state.cursor]!;
      this.state.cursor++;

      // check if this character is escaped
      if (this.state.nextCharacterEscaped) {
        this.state.content += data;
        this.state.nextCharacterEscaped = false;
        return true;
      }

      // check for special characters
      if (data === stringEnd) {
        this.state.finished = true;
        return true;
      }

      if (data === Constants.ESCAPE) {
        this.state.nextCharacterEscaped = true;
        return true;
      }

      // add character
      this.state.content += data;
    }).end(() => {
      if (!this.state.finished)
        throw new Errors.SyntaxError(
          `Unexpected end of string (missing \`${stringEnd}\`)`,
          {
            at: this.state.cursor,
            length: 1
          }
        );
      this.node = new TextNode(
        this.state.content,
        variant,
        {
          sourceLocation,
          sourceLength: this.state.cursor + 1
        },
        parent
      );
    });
  }

  protected state: StringInterpreterState = {
    cursor: 0,
    finished: false,
    nextCharacterEscaped: false,
    content: ''
  };
}
