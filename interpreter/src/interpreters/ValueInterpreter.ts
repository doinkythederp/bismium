import Interpreter, { BaseInterpreterState } from '../Interpreter';
import {
  FunctionCallNode,
  Node,
  PropertyAccessorNode,
  TextNodeVariant,
  ValueNode,
  ValueNodes,
  VariableAccessorNode
} from '../Node';
import * as Constants from '../util/constants';
import * as Errors from '../util/errors';
import FunctionCallInterpreter from './FunctionCallInterpreter';
import NumberInterpreter from './NumberInterpreter';
import PropertyAccessorInterpreter from './PropertyAccessorInterpreter';
import StringInterpreter from './StringInterpreter';
import VariableAccessorInterpreter from './VariableAccessorInterpreter';

export interface ValueInterpreterState extends BaseInterpreterState {
  targetNode: ValueNodes | VariableAccessorNode | null;
  props: Array<PropertyAccessorNode | FunctionCallNode>;
  setTo: ValueNode | null;
}

export default class ValueInterpreter extends Interpreter<
  ValueNode,
  ValueInterpreterState
> {
  public constructor(sourceLocation = 0, parent: Node | null = null) {
    super(sourceLocation, parent);

    this.use(async (data) => {
      if (this.state.targetNode) return;
      const char = data[this.state.cursor]!;

      if (Constants.whitespace.has(char)) {
        this.state.cursor++;
        return true;
      } else if (NumberInterpreter.validNumber.test(char)) {
        this.state.targetNode = await new NumberInterpreter(
          sourceLocation + this.state.cursor
        ).run(data.slice(this.state.cursor));
      } else if (
        char === Constants.SINGLE_QUOTE ||
        char === Constants.DOUBLE_QUOTE
      ) {
        this.state.targetNode = await new StringInterpreter(
          char === Constants.SINGLE_QUOTE
            ? TextNodeVariant.SINGLE_QUOTE
            : TextNodeVariant.DOUBLE_QUOTE,
          sourceLocation + this.state.cursor
        ).run(data.slice(this.state.cursor + 1));
      } else if (VariableAccessorInterpreter.validKeyword.test(char)) {
        this.state.targetNode = await new VariableAccessorInterpreter(
          sourceLocation + this.state.cursor
        ).run(data.slice(this.state.cursor));
      } else {
        throw new Errors.SyntaxError(
          `expected a value (e.g. string literal or variable), instead got unexpected token \`${char}\``,
          {
            at: this.state.cursor + sourceLocation,
            length: 0
          }
        );
      }

      this.state.cursor += this.state.targetNode.meta.sourceLength;
    })
      .use(async (data) => {
        const char = data[this.state.cursor]!;
        this.state.cursor++;

        if (char === Constants.PROPERTY_ACCESSOR) {
          const result = await new PropertyAccessorInterpreter(
            sourceLocation + this.state.cursor
          ).run(data.slice(this.state.cursor));
          this.state.cursor += result.meta.sourceLength;
          this.state.props.push(result);
        } else if (char === Constants.FUNCTION_CALL_BEGIN) {
          const result = await new FunctionCallInterpreter(
            sourceLocation + this.state.cursor
          ).run(data.slice(this.state.cursor));
          this.state.cursor += result.meta.sourceLength;
          this.state.props.push(result);
        } else if (char === Constants.SETTER) {
          {
            const errorMeta = {
              at: sourceLocation,
              length: 0
            };

            if (!(this.state.targetNode instanceof VariableAccessorNode))
              throw new Errors.SyntaxError(
                'Invalid left hand side in assignment (cannot set to a literal value)',
                errorMeta
              );

            if (
              // prettier-ignore
              this.state.props[this.state.props.length - 1] instanceof FunctionCallNode
            )
              throw new Errors.SyntaxError(
                'Invalid left hand side in assignment (cannot set to the direct output of a function)',
                errorMeta
              );
          }

          const node = new ValueNode(
            this.state.targetNode,
            this.state.props,
            null,
            {
              sourceLocation,
              sourceLength: this.state.cursor
            },
            null
          );

          node.target.parent = node;
          for (const prop of node.props) {
            prop.parent = node;
          }

          this.state.targetNode = null;
          this.state.props = [];

          let nextState: { setTo: ValueNode | null } = this.state;
          while (nextState.setTo) {
            nextState = nextState.setTo;
          }

          nextState.setTo = node;
          if (nextState !== this.state) node.parent = nextState as ValueNode;
        } else if (Constants.whitespace.has(char)) {
          return true;
        } else {
          this.state.cursor--;
          this.state.finished = true;
        }
      })
      .end(() => {
        this.node = new ValueNode(
          this.state.targetNode!,
          this.state.props,
          this.state.setTo,
          {
            sourceLocation,
            sourceLength: this.state.cursor
          },
          parent
        );

        this.node.target.parent = this.node;
        if (this.node.setTo) this.node.setTo.parent = this.node;
        for (const node of this.node.props) {
          node.parent = this.node;
        }
      });
  }

  protected state: ValueInterpreterState = {
    cursor: 0,
    finished: false,
    targetNode: null,
    setTo: null,
    props: []
  };
}
