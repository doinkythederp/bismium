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
    sourceLocation: number,
    public readonly parent: Node | null = null
  ) {
    this.meta = {
      sourceLocation,
      // this will be updated by an interpreter
      sourceLength: 0
    };
  }

  public toJSON(): Record<string, unknown> {
    return {
      parent: this.parent?.toJSON() ?? null,
      meta: this.meta
    };
  }

  public meta: NodeMetadata;

  // TODO: implement
  // public static fromJSON(data: Record<string, unknown>): BaseNode {}
}

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
  public content = '';
  public variant = TextNodeVariant.SINGLE_QUOTE;

  public setContent(content: string) {
    this.content = content;
    return this;
  }

  public setVariant(variant: TextNodeVariant) {
    this.variant = variant;
    return this;
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
  public value = 0;
  public variant = NumberNodeVariant.DECIMAL;

  public setValue(value: number) {
    this.value = value;
    return this;
  }

  public setVariant(variant: NumberNodeVariant) {
    this.variant = variant;
    return this;
  }
}
