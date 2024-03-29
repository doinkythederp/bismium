import { BaseValue, Value } from '.';
import Runtime from '../Runtime';

export default class BismiumObject implements BaseValue {
  public constructor(public readonly runtime: Runtime) {}

  private readonly properties = new Map<string, Value>();

  public getProperty(key: string): Value | undefined {
    return this.properties.get(key);
  }

  public setProperty(key: string, value: Value) {
    this.properties.set(key, value);
    return this;
  }

  public toJS(): Record<string, unknown> {
    const obj = Object.create(null);
    for (const [key, prop] of this.properties) {
      obj[key] = prop.toJS();
    }

    return obj;
  }

  public displayName = '<object>';
}
