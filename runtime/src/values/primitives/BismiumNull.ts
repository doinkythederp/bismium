import Runtime from '../../Runtime';
import { BaseValue, Value } from '..';
import * as Errors from '../../util/errors';

export default class BismiumNull implements BaseValue {
  public constructor(public readonly runtime: Runtime) {}

  public getProperty(key: string): never {
    throw new Errors.TypeError(
      `Cannot read properties of null (accessing \`${key}\`)`
    );
  }

  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  public setProperty(key: string, value: Value): never {
    throw new Errors.TypeError(
      `Cannot read properties of null (setting \`${key}\`)`
    );
  }

  public toJS() {
    return null;
  }

  public displayName = 'null';
}
