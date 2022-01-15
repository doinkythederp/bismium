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

  public call(args: Value[]) {
    return Promise.resolve(
      this.callback({
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
  callbackInfo: BismiumCallbackInfo
) => Promise<Value> | Value;

export interface BismiumCallbackInfo {
  runtime: Runtime;
  args: Value[];
}
