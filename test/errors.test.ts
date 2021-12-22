import * as Errors from '../src/util/errors';

function checkBismiumError(ErrorType: new () => Errors.BismuiumError) {
  it("always has its constructor's name", () => {
    expect(new ErrorType().name).toBe(ErrorType.name);
  });
}

describe(Errors.BismuiumError, () => {
  checkBismiumError(Errors.BismuiumError);
});

function checkSourceError(ErrorType: typeof Errors.SourceError) {
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

describe(Errors.SourceError, () => {
  checkSourceError(Errors.SourceError);
});

describe(Errors.SyntaxError, () => {
  checkSourceError(Errors.SyntaxError);
});
