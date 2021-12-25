export interface Node {
  /** The node's parent in the syntax tree */
  readonly parent: Node | null;
  /** Metadata about the node used internally */
  meta: NodeMetadata;

  toJSON(): Record<string, unknown>;
}

export interface NodeMetadata {
  /** Where the node is in the source, used in creating errors */
  sourceLocation: number;
  /** The length of the node's source, used in creating errors */
  sourceLength: number;
}

/**
 * A basic node that other types extend
 */
export abstract class BaseNode implements Node {
  public constructor(
    public meta: NodeMetadata,
    public parent: Node | null = null
  ) {}

  public toJSON(): Record<string, unknown> {
    return {
      parent: this.parent?.toJSON() ?? null,
      meta: this.meta
    };
  }

  // TODO: implement
  // public static fromJSON(data: Record<string, unknown>): BaseNode {}
}

export type ValueNodes = NumberNode | TextNode;

/**
 * Represents a basic text node with a content
 */
export interface BaseTextNode extends Node {
  /** The text content of the node */
  content: string;
}

export enum TextNodeVariant {
  SINGLE_QUOTE,
  DOUBLE_QUOTE
}

/**
 * A single or double quoted text node
 */
export class TextNode extends BaseNode implements BaseTextNode {
  public constructor(
    public content: string,
    public variant: TextNodeVariant,
    meta: NodeMetadata,
    parent: Node | null = null
  ) {
    super(meta, parent);
  }
}

export enum NumberNodeVariant {
  DECIMAL,
  HEXADECIMAL
}

/**
 * A decimal or hex number node
 */
export class NumberNode extends BaseNode {
  public constructor(
    public value: number,
    public variant: NumberNodeVariant,
    meta: NodeMetadata,
    parent: Node | null = null
  ) {
    super(meta, parent);
  }
}

/**
 * A variable access/function call node
 */
export class ValueNode extends BaseNode {
  public constructor(
    public target: ValueNodes | VariableAccessorNode,
    public props: Array<PropertyAccessorNode | FunctionCallNode>,
    meta: NodeMetadata,
    parent: Node | null = null
  ) {
    super(meta, parent);
  }
}

/**
 * A node representing a read of a variable
 */
export class VariableAccessorNode extends BaseNode {
  public constructor(
    public name: string,
    meta: NodeMetadata,
    parent: Node | null = null
  ) {
    super(meta, parent);
  }
}

/**
 * A node representing a read of a property
 */
export class PropertyAccessorNode extends BaseNode {
  public constructor(
    public prop: string,
    meta: NodeMetadata,
    parent: Node | null = null
  ) {
    super(meta, parent);
  }
}

export class FunctionCallNode extends BaseNode {
  public constructor(
    public args: ValueNode[],
    meta: NodeMetadata,
    parent: Node | null = null
  ) {
    super(meta, parent);
  }
}
