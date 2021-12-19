/** An error created by the Bismium API */
export class BismuiumError extends Error {
  public override name = this.constructor.name;
}

/** An error caused by a problem in a given Bismium source */
export class SourceError extends BismuiumError {
  public constructor(
    message?: string,
    public meta: { at: number; length: number } | null = null
  ) {
    super(message);
  }
}

/** Represents an error in the source's syntax, thrown when parsing. */
export class SyntaxError extends SourceError {}
