import RootContext from '../../RootContext';
import { BaseValue, Value } from '..';
import * as Errors from '../../util/errors';

export default class BismiumNumber implements BaseValue {
  public constructor(
    public readonly rootContext: RootContext,
    private readonly value: number
  ) {}

  public getProperty(key: string): Value | undefined {
    return this.rootContext.lib.string.get(key);
  }

  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  public setProperty(key: string, value: Value): never {
    throw new Errors.TypeError(
      `Primitives cannot store properties (setting \`${key}\`)`
    );
  }

  public toJS() {
    return this.value;
  }

  public displayName = '<number>';
}
