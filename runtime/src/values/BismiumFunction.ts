import BismiumObject from './BismiumObject';
import { Value } from '.';
import Runtime from '../Runtime';

export default class BismiumFunction extends BismiumObject {
  public constructor(
    runtime: Runtime,
    private readonly callback: BismiumFunctionCallback,
    public readonly name = callback.name
  ) {
    super(runtime);
  }

  public call(args: Value[], thisVal: Value | null) {
    return Promise.resolve(
      this.callback.call(thisVal, {
        runtime: this.runtime,
        args
      })
    );
  }

  public override displayName = this.name
    ? `<function ${this.name}>`
    : '<function>';
}

export type BismiumFunctionCallback = (
  this: Value | null,
  callbackInfo: BismiumCallbackInfo
) => Promise<Value> | Value;

export interface BismiumCallbackInfo {
  runtime: Runtime;
  args: Value[];
}
