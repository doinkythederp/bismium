export class BismiumObject {
  public constructor(public readonly prototypeObject: BismiumObject | null) {}
  private readonly properties = new Map<string, Value>();

  public getProperty(key: string): Value | undefined {
    if (this.prototypeObject) {
      const val = this.prototypeObject.getProperty(key);
      if (val !== undefined) return val;
    }

    return this.properties.get(key);
  }

  public hasProperty(key: string, checkProto = true) {
    if (this.properties.has(key)) return true;
    if (checkProto && this.prototypeObject?.hasProperty(key)) return true;
    return false;
  }

  public setProperty(key: string, value: Value | null) {
    this.properties.set(key, value);
    return this;
  }

  public toJS(): Record<string, unknown> {
    const obj = Object.create(this.prototypeObject?.toJS() ?? null);
    for (const [key, prop] of this.properties) {
      obj[key] = prop instanceof BismiumObject ? prop.toJS() : prop;
    }

    return obj;
  }
}

export type Value = BismiumObject | Primitive;
export type Primitive = string | number | null;
