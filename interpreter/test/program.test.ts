import { ProgramInterpreter } from '../src';

describe(ProgramInterpreter, () => {
  it('should parse Bismium programs', async () => {
    const program = await new ProgramInterpreter().run(`
      foobar = "abc123";
      foobar.someMethod(externalVariable);
    `);

    expect(program.statements.length).toBe(2);
  });
});
