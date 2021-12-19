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

export abstract class BaseNode implements Node {
  public constructor(
    public meta: NodeMetadata,
    public readonly parent: Node | null = null
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

export interface BaseTextNode extends Node {
  /** The text content of the node */
  content: string;
}
