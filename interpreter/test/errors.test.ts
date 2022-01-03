import * as Bismium from '../src';

function checkBismiumError(ErrorType: new () => Bismium.BismuiumError) {
  it("always has its constructor's name", () => {
    expect(new ErrorType().name).toBe(ErrorType.name);
  });
}

describe(Bismium.BismuiumError, () => {
  checkBismiumError(Bismium.BismuiumError);
});

function checkSourceError(ErrorType: typeof Bismium.SourceError) {
  checkBismiumError(ErrorType);

  it('accepts a `meta` argument', () => {
    expect(
      new ErrorType('...', {
        at: 999,
        length: 999
      }).meta
    ).toStrictEqual({
      at: 999,
      length: 999
    });
  });

  it('accepts a missing `meta` argument', () => {
    expect(new ErrorType('...').meta).toBe(null);
  });
}

describe(Bismium.SourceError, () => {
  checkSourceError(Bismium.SourceError);
});

describe(Bismium.SyntaxError, () => {
  checkSourceError(Bismium.SyntaxError);
});
